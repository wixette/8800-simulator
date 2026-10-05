/**
 *   Copyright 2020-2026 wixette@gmail.com
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 * @fileoverview Altair 8800 front panel simulator.
 */


/**
 * The simulator.
 */
class Sim8800 {
    /**
     * @param {number} memSize The memory size, in bytes.
     * @param {number} clockRate The clock rate.
     * @param {function(Array<number>)?} setAddressLedsCallback The
     *     callback to set address LEDs.
     * @param {function(Array<number>)?} setDataLedsCallback The
     *     callback to set data LEDs.
     * @param {function(boolean)?} setWaitLedCallback The callback to
     *     set the WAIT LED.
     * @param {function(boolean)?} setStatusLedsCallback The callback to
     *     set the STATUS LEDs.
     * @param {function():number?} getInputAddressCallback The
     *     callback to get the input word from address/data switches.
     * @param {function(string)?} dumpCpuCallback The callback to receive
     *     CPU status dump, in HTML string.
     * @param {function(string, ?Array<Object>, Object=)?} dumpMemCallback
     *     The callback to receive the memory dump as an HTML string,
     *     the memory map as data - see getMemMap() - or null on a
     *     machine small enough not to need a map, and the instruction
     *     at the program counter - see getInstructionAtPc() - which is
     *     left out when the machine is off.
     */
    constructor(memSize, clockRate,
                setAddressLedsCallback, setDataLedsCallback,
                setWaitLedCallback, setStatusLedsCallback,
                getInputAddressCallback,
                dumpCpuCallback, dumpMemCallback) {
        this.clockRate = clockRate;
        this.mem = new Array(memSize);
        this.setAddressLedsCallback = setAddressLedsCallback;
        this.setDataLedsCallback = setDataLedsCallback;
        this.setWaitLedCallback = setWaitLedCallback;
        this.setStatusLedsCallback = setStatusLedsCallback;
        this.getInputAddressCallback = getInputAddressCallback;
        this.dumpCpuCallback = dumpCpuCallback;
        this.dumpMemCallback = dumpMemCallback;
        this.isPoweredOn = false;
        this.isRunning = false;
        /**
         * Whether the CPU has run into a HLT. The 8080 leaves that
         * state only on a reset or an interrupt, so the machine stops
         * where it is and the WAIT lamp comes on (D26).
         * @type {boolean}
         */
        this.halted = false;
        this.lastAddress = 0;
        /**
         * The address on the bus, as the address lamps show it while
         * the machine is stopped: the one examined or deposited, or
         * where the CPU stopped. PROTECT acts on the memory board at
         * this address, and the PROT lamp shows that board's latch.
         * @type {number}
         */
        this.busAddress = 0;
        /**
         * Which memory boards are write protected, by board number. On
         * the real machine each MITS memory board carried its own
         * protect flip-flop, set by PROTECT and cleared by UNPROTECT or
         * by power-on. See protect() and boardOf().
         * @type {Array<boolean>}
         */
        this.protectedBoards = [];
        /**
         * Whether any board is protected, so that the write path - run
         * for every byte the CPU stores - looks no further when none is.
         * @type {boolean}
         */
        this.anyProtected = false;
        /**
         * The writes a protected board has refused since the program
         * last started, and the address of the first. A program can
         * hammer protected memory thousands of times a second; each
         * refusal is only counted, and the page is told once, through
         * onProtectedWrite. See writeByte().
         * @type {number}
         */
        this.blockedWrites = 0;
        /** @type {?number} */
        this.firstBlockedAddress = null;
        /**
         * Called with the address of the first write refused in a run.
         * @type {?function(number)}
         */
        this.onProtectedWrite = null;
        /**
         * Called with what the lamps that report the machine's state
         * should show. See updateLamps().
         * @type {?function(Object<string, boolean>)}
         */
        this.setLampsCallback = null;
        this.lastTickTime = 0;
        /**
         * I/O devices, keyed by port number. Every port the machine
         * answers is a device here, the front panel included. See
         * attachDevice().
         * @type {Object}
         */
        this.devices = {};
        /**
         * Coalesces the debugger dumps. A UI that repaints on its own
         * schedule sets dumpScheduler; without one the dumps happen
         * inline, as they always did. See requestDump().
         * @type {?function(function())}
         */
        this.dumpScheduler = null;
        /**
         * Optional predicate. When it returns false the dumps are not
         * built at all - nobody is looking at them. See flushDump().
         * @type {?function(): boolean}
         */
        this.dumpFilter = null;
        this.dumpPending = false;
        /**
         * First address shown by the memory dump. Only meaningful on a
         * machine with more memory than one window holds; below that
         * the window is the whole machine. See dumpMem().
         * @type {number}
         */
        this.dumpWindow = 0;
        /**
         * Whether the memory dump follows the program counter.
         * @type {boolean}
         */
        this.followPc = false;
        /**
         * Counts the RESET lamp flashes, so that one which has been
         * superseded can tell. See reset() and endResetFlash().
         * @type {number}
         */
        this.resetFlashToken = 0;
        this.resetFlashPending = false;
        this.initMem();
        this.attachDevice(Sim8800.FRONT_PANEL_PORT,
                          this.createFrontPanelDevice());
        CPU8080.init(this.getWriteByteCallback(),
                     this.getReadByteCallback(),
                     null,  /* not used. */
                     this.getWritePortCallback(),
                     this.getReadPortCallback());
    }

    /**
     * Formats a number to fixed length hex string.
     * @param {number} n The number to be formatted.
     * @param {number} len The output length, with leading zeros.
     */
    static toHex(n, len) {
        return n.toString(16).toUpperCase().padStart(len, '0').slice(-len);
    }

    /**
     * Decodes one instruction, for the pane under the memory dump.
     *
     * The operand is named the way instruction tables name it - a16 for
     * an address, d16 and d8 for data - so that LHLD at 2A reads as
     * "LHLD a16", with the value it takes this time given separately.
     *
     * The 8080 has twelve opcodes Intel never documented. The CPU core
     * runs each as the documented instruction it duplicates, so that is
     * what they decode as, marked undocumented. The disassembler's own
     * table names two of them after the 8085's RIM and SIM, which this
     * CPU does not have.
     *
     * @param {number} opcode The byte at the program counter.
     * @param {number} lo The byte after it.
     * @param {number} hi The byte after that.
     * @return {{mnemonic: string, operand: ?string, operandName: ?string,
     *     length: number, undocumented: boolean}} The operand is the
     *     value in hex and operandName its placeholder in the mnemonic
     *     (a16, d16 or d8), both null when the instruction has none.
     */
    static decodeInstruction(opcode, lo, hi) {
        var undocumented = Sim8800.UNDOCUMENTED_OPCODES[opcode];
        var real = undocumented !== undefined ? undocumented : opcode;
        // The same file defines both under one name in Node.js, and
        // under two in the browser.
        var cpud = typeof CPUD8080 !== 'undefined' ? CPUD8080 : CPU8080;
        var decoded = cpud.disasm(real, lo, hi);
        var length = decoded[1];
        // "MVI B, $8C" and "MVI C,$8C" are both in the table.
        var text = decoded[0].replace(/,\s*/, ',');
        var operand = null;
        var operandName = null;
        var mnemonic = text;
        if (length == 3) {
            operand = Sim8800.toHex((hi << 8) | lo, 4) + 'H';
            // LXI loads a register pair; everything else that takes two
            // bytes takes an address.
            operandName = text.startsWith('LXI') ? 'd16' : 'a16';
            mnemonic = text.replace(/\$[0-9A-F]{4}/, operandName);
        } else if (length == 2) {
            operand = Sim8800.toHex(lo, 2) + 'H';
            operandName = 'd8';
            mnemonic = text.replace(/\$[0-9A-F]{2}/, operandName);
        }
        return {
            mnemonic: mnemonic,
            operand: operand,
            operandName: operandName,
            length: length,
            undocumented: undocumented !== undefined,
        };
    }

    /**
     * Parses a number into an array of binary bits.
     * @param {number} data The data to be parsed.
     * @param {number} numBits Number of bits to be parsed.
     * @return {Array<number>} Sequence of 0 or 1, from the lowest bit to
     *     the highest bit.
     */
    static parseBits(data, numBits) {
        var bits = [];
        for (let i = 0; i < numBits; i++) {
            bits.push(data & 1);
            data >>>= 1;
        }
        return bits;
    }

    /**
     * Fills the memory with random bytes, as a real machine powers up,
     * or with zeros.
     * @param {boolean=} random False to zero the memory instead.
     */
    initMem(random = true) {
        if (random) {
            for (let i = 0; i < this.mem.length; i++) {
                this.mem[i] = Math.floor(Math.random() * 256);
            }
        } else {
            this.mem.fill(0);
        }
    }

    /**
     * Loads data into memory.
     * @param {number} address The start address to load the data/program.
     * @param {Array<number>} data The array of data.
     */
    loadData(address, data) {
        if (!this.isPoweredOn)
            return;
        for (let i = 0; i < data.length && address < this.mem.length; i++) {
            this.mem[address++] = data[i];
        }
        this.requestDump();
    }

    /**
     * Loads data into memory from a hex string. The page parses its own
     * input (see panel.parseBytes); this is a shorthand for tests.
     * @param {number} address The start address to load the data/program.
     * @param {string} hexString Data encoded in hex string, like 'c3 00 00'.
     */
    loadDataAsHexString(address, hexString) {
        if (!hexString)
            return;
        var bytes = hexString.trim().split(/\s+/)
            .map(function(token) { return parseInt(token, 16); })
            .filter(function(byte) { return !isNaN(byte); });
        this.loadData(address, bytes);
    }

    /**
     * Installs a different amount of memory.
     *
     * A memory board is not something you add to a running machine, so
     * this powers the simulator off. The caller turns it back on, the
     * same way you would have after opening the case.
     * @param {number} memSize The new memory size, in bytes.
     */
    setMemSize(memSize) {
        if (memSize == this.mem.length)
            return;
        this.powerOff();
        this.mem = new Array(memSize);
        this.initMem();
        this.dumpWindow = 0;
        this.lastAddress = 0;
        this.busAddress = 0;
        // Different boards, so none of the old latches carry over.
        this.protectedBoards = [];
        this.anyProtected = false;
    }

    /**
     * The memory board an address falls on. The base machine's memory
     * is one board, however little of it is fitted; above that each
     * 88-4MCS board holds 4 KB.
     * @param {number} address The address.
     * @return {number} The board's number, or -1 where no memory
     *     answers.
     */
    boardOf(address) {
        address &= 0xffff;
        if (address >= this.mem.length)
            return -1;
        return Math.floor(
            address / Math.min(this.mem.length, Sim8800.BOARD_SIZE));
    }

    /**
     * Whether the board an address falls on is protected.
     * @param {number} address The address.
     * @return {boolean}
     */
    isProtected(address) {
        var board = this.boardOf(address);
        return board >= 0 && !!this.protectedBoards[board];
    }

    /**
     * PROTECT or UNPROTECT. Latches the memory board at the address on
     * the bus, as the switch did on the real machine: "examine any
     * address on the board, and push the PROTECT switch" (the 88-4MCS
     * manual). A protected board ignores every write, the program's
     * own included, until UNPROTECT or the next power-on.
     * @param {boolean} on True to protect, false to unprotect.
     * @return {?{start: number, end: number}} The addresses the board
     *     covers, first and last, or null if the machine is off or no
     *     memory answers at the address on the bus.
     */
    protect(on) {
        if (!this.isPoweredOn)
            return null;
        var board = this.boardOf(this.busAddress);
        if (board < 0)
            return null;
        this.protectedBoards[board] = on;
        this.anyProtected = this.protectedBoards.some(Boolean);
        this.updateLamps();
        var size = Math.min(this.mem.length, Sim8800.BOARD_SIZE);
        return {start: board * size, end: board * size + size - 1};
    }

    /**
     * Unprotects every board. The real machine's POWER ON CLEAR did
     * this; the page also does it before putting a program in.
     * @return {boolean} Whether any board had been protected.
     */
    unprotectAll() {
        var was = this.anyProtected;
        this.protectedBoards = [];
        this.anyProtected = false;
        this.updateLamps();
        return was;
    }

    /**
     * Tells the page what the lamps that report the machine's state
     * should show:
     * - PROT, the latch of the memory board at the address on the bus;
     * - HLTA, "a HALT instruction has been executed and acknowledged";
     * - M1, the first cycle of an instruction;
     * - INTE, the CPU's interrupt enable, which EI sets and DI clears.
     *
     * The machine only ever stops between instructions - SINGLE STEP
     * runs a whole one - so the status lamps show one of two status
     * words: an instruction fetch (MEMR, M1, WO), or after a HLT the
     * halt acknowledge (MEMR, HLTA, WO), which has no M1. MEMR and WO
     * are lit in both, and follow the power (setStatusLedsCallback).
     *
     * Called after every batch of cycles a running program steps
     * through, so the page should only redraw what changed.
     */
    updateLamps() {
        if (!this.setLampsCallback)
            return;
        var on = this.isPoweredOn;
        this.setLampsCallback({
            prot: on && this.isProtected(this.busAddress),
            hlta: on && this.halted,
            mi: on && !this.halted,
            inte: on && !!CPU8080.status().inte,
        });
    }

    /**
     * Moves the memory dump's window.
     * @param {number} address Any address inside the wanted window; the
     *     window is aligned down to a multiple of its size.
     */
    setDumpWindow(address) {
        var size = Sim8800.DUMP_WINDOW_SIZE;
        var top = Math.max(this.mem.length - size, 0);
        address = Math.min(Math.max(address, 0), top);
        this.dumpWindow = address - (address % size);
        this.requestDump();
    }

    /**
     * Turns "follow the program counter" on or off for the memory dump.
     * @param {boolean} followPc Whether to follow.
     */
    setFollowPc(followPc) {
        this.followPc = followPc;
        this.requestDump();
    }

    /**
     * The window of memory the dump is currently showing.
     * @return {{start: number, end: number}} Half open byte range.
     */
    getDumpWindow() {
        var size = Sim8800.DUMP_WINDOW_SIZE;
        if (this.mem.length <= size)
            return {start: 0, end: this.mem.length};
        var start = this.dumpWindow;
        if (this.followPc) {
            let pc = CPU8080.status().pc;
            if (pc < this.mem.length) {
                start = pc - (pc % size);
            }
        }
        start = Math.min(start, this.mem.length - size);
        return {start: start, end: start + size};
    }

    /**
     * Describes the memory map strip: one entry per page of memory.
     *
     * Returned as data rather than HTML so that the page can keep the
     * cells and edit them in place (see panel.renderMemMap, and D21 in
     * docs/ms-basic-4k.md).
     *
     * Each page carries how full it is, on a scale of 0 to 4, so that
     * the shape of what is loaded is visible at a glance, and a label
     * naming the range and that fullness as a percentage.
     *
     * @param {{start: number, end: number}} window The shown window.
     * @param {Object} cpu The CPU status.
     * @return {Array<{start: number, end: number, level: number,
     *     shown: boolean, pc: boolean, sp: boolean, label: string}>}
     */
    getMemMap(window, cpu) {
        var size = Sim8800.DUMP_WINDOW_SIZE;
        var pages = [];
        for (let base = 0; base < this.mem.length; base += size) {
            let end = Math.min(this.mem.length, base + size);
            let pageSize = end - base;
            let used = 0;
            for (let i = base; i < end; i++) {
                if (this.mem[i]) used++;
            }
            pages.push({
                start: base,
                end: end,
                level: used == 0 ? 0 : Math.min(4, Math.ceil(used / size * 4)),
                shown: base == window.start,
                pc: cpu.pc >= base && cpu.pc < end,
                sp: cpu.sp >= base && cpu.sp < end,
                label: Sim8800.toHex(base, 4) + '-' +
                    Sim8800.toHex(base + pageSize - 1, 4) + '  ' +
                    Math.round(used / pageSize * 100) + '%',
            });
        }
        return pages;
    }

    /**
     * Dumps the memory to HTML, for debugging or monitoring.
     *
     * Only one window of memory is printed, never the whole machine. On
     * the 256 byte machine the window is the whole machine; above that
     * the window moves, and the map strip shows where in the address
     * space you are looking.
     */
    dumpMem() {
        // A machine that is off has no memory to print. Checked here as
        // well as in flushDump() so that no caller can go around it.
        if (!this.dumpMemCallback || !this.isPoweredOn)
            return;
        var cpu = CPU8080.status();
        var window = this.getDumpWindow();
        // No strip on a machine whose memory is all on screen already.
        var map = this.mem.length > Sim8800.DUMP_WINDOW_SIZE ?
            this.getMemMap(window, cpu) : null;
        var instr = this.getInstructionAtPc(cpu.pc);
        var sb = [];
        sb.push('<pre>\n');
        for (let i = window.start; i < window.end; i += 16) {
            sb.push(Sim8800.toHex(i, 4));
            sb.push('  ');
            for (let j = i; j < Math.min(window.end, i + 16); j++) {
                let byte = Sim8800.toHex(this.mem[j], 2);
                // How far past the opcode this byte is, wrapping at the
                // top of the address space as the CPU does.
                let offset = (j - cpu.pc) & 0xffff;
                if (offset == 0) {
                    byte = '<span class="at-pc">' + byte + '</span>';
                } else if (offset < instr.length) {
                    byte = '<span class="at-operand">' + byte + '</span>';
                } else if (j == cpu.sp) {
                    byte = '<span class="at-sp">' + byte + '</span>';
                }
                sb.push(byte);
                sb.push((j + 1) % 8 == 0 ? '  ' : ' ');
            }
            sb.push('\n');
        }
        sb.push('</pre>\n');
        this.dumpMemCallback(sb.join(''), map, instr);
    }

    /**
     * The instruction the CPU will run next, decoded.
     * @param {number} pc The program counter.
     * @return {Object} What decodeInstruction() gives, plus the address
     *     and the bytes the instruction takes up.
     */
    getInstructionAtPc(pc) {
        var bytes = [0, 1, 2].map((i) => this.readByte((pc + i) & 0xffff));
        var instr = Sim8800.decodeInstruction(bytes[0], bytes[1], bytes[2]);
        instr.address = pc;
        instr.bytes = bytes.slice(0, instr.length);
        return instr;
    }

    /**
     * Decodes the FLAGs register.
     * @param {number} flags The value of the FLAGs register.
     * @return {Object} The decoded flags.
     */
    decodeFlags(flags) {
        return {
            sign: (flags & 0x80) != 0,
            zero: (flags & 0x40) != 0,
            auxiliaryCarry: (flags & 0x10) != 0,
            parity: (flags & 0x04) != 0,
            carry: (flags & 0x01) != 0,
        };
    }

    /**
     * Dumps the internal CPU status to HTML, for debugging or monitoring.
     */
    dumpCpu() {
        if (!this.dumpCpuCallback || !this.isPoweredOn)
            return;
        var cpu = CPU8080.status();
        var sb = ['<pre>\n'];
        sb.push('PC = ' + Sim8800.toHex(cpu.pc, 4) + '  ');
        sb.push('SP = ' + Sim8800.toHex(cpu.sp, 4) + '\n');
        sb.push('A = ' + Sim8800.toHex(cpu.a, 2) + '  ');
        sb.push('B = ' + Sim8800.toHex(cpu.b, 2) + '  ');
        sb.push('C = ' + Sim8800.toHex(cpu.c, 2) + '  ');
        sb.push('D = ' + Sim8800.toHex(cpu.d, 2) + '\n');
        sb.push('E = ' + Sim8800.toHex(cpu.e, 2) + '  ');
        sb.push('F = ' + Sim8800.toHex(cpu.f, 2) + '  ');
        sb.push('H = ' + Sim8800.toHex(cpu.h, 2) + '  ');
        sb.push('L = ' + Sim8800.toHex(cpu.l, 2) + '\n');
        // Every flag, by the letter 8080 references give it, lit when
        // set: a flag that is clear is as much a fact as one that is set.
        var flags = this.decodeFlags(cpu.f);
        sb.push('FLAGS');
        [['S', flags.sign], ['Z', flags.zero], ['AC', flags.auxiliaryCarry],
         ['P', flags.parity], ['CY', flags.carry]].forEach(function(flag) {
            sb.push(' <span class="flag' + (flag[1] ? ' flag-set' : '') +
                    '">' + flag[0] + '</span>');
        });
        sb.push('\n</pre>\n');
        this.dumpCpuCallback(sb.join(''));
    }

    /**
     * Reads a byte of memory.
     *
     * Addresses above the installed memory are not mirrored back into
     * it. A real Altair only answers at the addresses its memory
     * boards decode; reading anywhere else picks up an undriven bus,
     * which reads as FFh. Programs that size memory by writing a byte
     * and reading it back - MITS BASIC among them - depend on that:
     * with the address wrapped around instead, the probe writes over
     * the program that started it and never finds the top.
     * @param {number} address The address to read.
     * @return {number} The byte at that address, or FFh if there is no
     *     memory there.
     */
    readByte(address) {
        address &= 0xffff;
        return address < this.mem.length ? this.mem[address] : 0xff;
    }

    /**
     * Writes a byte of memory. Writes above the installed memory go
     * nowhere, as they would on the real machine. See readByte().
     *
     * Nor do writes to a protected board: its latch keeps the write
     * pulse from reaching the memory chips. Each one is counted, and
     * the first in a run is reported, once. This runs for every byte
     * the CPU stores, so with no board protected it costs one test.
     * @param {number} address The address to write.
     * @param {number} value The byte to write.
     */
    writeByte(address, value) {
        address &= 0xffff;
        if (address < this.mem.length) {
            if (this.anyProtected && this.isProtected(address)) {
                this.blockedWrites++;
                if (this.blockedWrites == 1) {
                    this.firstBlockedAddress = address;
                    if (this.onProtectedWrite) {
                        this.onProtectedWrite(address);
                    }
                }
                return;
            }
            this.mem[address] = value;
        }
    }

    /**
     * Returns the byteTo (write memory) callback.
     * @return {function(number, number)}
     */
    getWriteByteCallback() {
        return this.writeByte.bind(this);
    }

    /**
     * Returns the byteAt (read memory) callback.
     * @return {function(number): number}
     */
    getReadByteCallback() {
        return this.readByte.bind(this);
    }

    /**
     * Attaches an I/O device to a port.
     *
     * On the real machine a port number is answered by whichever board
     * decodes it, so this is the same shape: a device is any object
     * with a readPort and/or a writePort method, and the simulator
     * does not care what is behind them. The front panel and the serial
     * boards (js/sio.js) are all attached this way.
     * @param {number} port The port number, 00h-FFh.
     * @param {Object} device The device. Its optional readPort(port)
     *     returns the byte the CPU reads, and its optional
     *     writePort(port, value) receives the byte the CPU writes.
     */
    attachDevice(port, device) {
        this.devices[port & 0xff] = device;
    }

    /**
     * Builds the device that is the front panel itself: reading port
     * FFh returns the upper eight address switches, writing it lights
     * the data LEDs.
     * @return {Object} The device.
     */
    createFrontPanelDevice() {
        var self = this;
        return {
            readPort: function() {
                if (!self.getInputAddressCallback)
                    return 0;
                return (self.getInputAddressCallback() >> 8) & 0xff;
            },
            writePort: function(port, value) {
                if (self.setDataLedsCallback) {
                    self.setDataLedsCallback(Sim8800.parseBits(value, 8));
                }
            },
        };
    }

    /**
     * Returns the porto (write port) callback.
     * @return {function(number, number)}
     */
    getWritePortCallback() {
        var self = this;
        return function(address, value) {
            var device = self.devices[address & 0xff];
            if (device && device.writePort) {
                device.writePort(address & 0xff, value & 0xff);
            }
        };
    }

    /**
     * Returns the porti (read port) callback. A port with nothing
     * attached reads 0.
     * @return {function(number): number}
     */
    getReadPortCallback() {
        var self = this;
        return function(address) {
            var device = self.devices[address & 0xff];
            if (device && device.readPort) {
                return device.readPort(address & 0xff) & 0xff;
            }
            return 0;
        };
    }

    /**
     * Asks for the debugger dumps to be refreshed.
     *
     * The dumps are the most expensive thing the simulator does, and a
     * running CPU would otherwise ask for them hundreds of times a
     * second. So a UI can set dumpScheduler to coalesce the requests
     * onto its own repaint, and dumpFilter to skip them entirely while
     * nothing is on screen. With neither set, the dumps happen inline.
     */
    requestDump() {
        if (!this.dumpScheduler) {
            this.flushDump();
            return;
        }
        if (this.dumpPending)
            return;
        this.dumpPending = true;
        var self = this;
        this.dumpScheduler(function() {
            self.flushDump();
        });
    }

    /**
     * Refreshes the debugger dumps now.
     * @param {boolean=} force Dumps even if dumpFilter says nobody is
     *     looking. Used when the debugger becomes visible again.
     */
    flushDump(force = false) {
        this.dumpPending = false;
        // powerOff() blanks the dumps, and a flush arriving after it
        // must not put the old contents back.
        if (!this.isPoweredOn)
            return;
        if (!force && this.dumpFilter && !this.dumpFilter())
            return;
        this.dumpCpu();
        this.dumpMem();
    }

    /**
     * Gets the clock ticker callback.
     * @return {function()}
     */
    getClockTickerCallback() {
        var self = this;
        return function(timestamp) {
            if (self.isRunning) {
                // Computes the number of cycles based on the wall time
                // elapsed since the last tick, so that the simulated CPU
                // runs at clockRate even when the browser clamps timers
                // to a coarse resolution. The batch is capped in case
                // the timer was suspended for a long time.
                var now = Date.now();
                var elapsed = Math.min(Math.max(now - self.lastTickTime, 1),
                                       100);
                self.lastTickTime = now;
                var cycles = self.clockRate * elapsed / 1000;
                self.step(cycles);
                window.setTimeout(self.getClockTickerCallback(), 1);
            }
        };
    }

    /**
     * Powers on the machine.
     */
    powerOn() {
        this.isPoweredOn = true;
        this.initMem();
        // POWER ON CLEAR: every memory board comes up unprotected.
        this.protectedBoards = [];
        this.anyProtected = false;
        // A cold machine: clear the whole CPU, which reset() below
        // deliberately does not do.
        CPU8080.reset();
        this.reset();
        if (this.setStatusLedsCallback) {
            this.setStatusLedsCallback(true);
        }
        if (this.setWaitLedCallback) {
            this.setWaitLedCallback(false);
        }
    }

    /**
     * Powers off the machine.
     */
    powerOff() {
        if (this.setStatusLedsCallback) {
            this.setStatusLedsCallback(false);
        }
        if (this.setWaitLedCallback) {
            this.setWaitLedCallback(true);
        }
        if (this.setAddressLedsCallback) {
            this.setAddressLedsCallback(new Array(16).fill(0));
        }
        if (this.setDataLedsCallback) {
            this.setDataLedsCallback(new Array(8).fill(0));
        }
        if (this.dumpCpuCallback) {
            this.dumpCpuCallback('');
        }
        if (this.dumpMemCallback) {
            this.dumpMemCallback('', null);
        }
        this.isPoweredOn = false;
        // A machine switched off mid-run is not running any more. Left
        // set, the clock goes on ticking every millisecond, stepping a
        // CPU that has no power, until the next power-on clears it.
        this.isRunning = false;
        this.halted = false;
        this.updateLamps();
    }

    /**
     * Resets the machine.
     */
    reset() {
        if (!this.isPoweredOn)
            return;
        // The 8080's RESET line clears the program counter and the
        // interrupt enable, but NOT the registers. MITS BASIC depends on
        // that: once initialised it patches 0000H to jump to its warm
        // start, which assumes SP is still where it left it, so RESET
        // and RUN brings back OK with the program intact.
        //
        // The CPU core's reset() clears everything, so put the
        // registers back afterwards. powerOn() does the full clear.
        var cpu = CPU8080.status();
        CPU8080.reset();
        CPU8080.set('A', cpu.a);
        CPU8080.set('B', cpu.b);
        CPU8080.set('C', cpu.c);
        CPU8080.set('D', cpu.d);
        CPU8080.set('E', cpu.e);
        CPU8080.set('F', cpu.f);
        CPU8080.set('H', cpu.h);
        CPU8080.set('L', cpu.l);
        CPU8080.set('SP', cpu.sp);
        this.halted = false;
        this.stop();
        this.lastAddress = 0;
        this.busAddress = 0;
        this.updateLamps();
        if (this.setAddressLedsCallback) {
            this.setAddressLedsCallback(new Array(16).fill(1));
        }
        if (this.setDataLedsCallback) {
            this.setDataLedsCallback(new Array(8).fill(1));
        }
        this.requestDump();
        // The flash only puts the lamps out if nothing has taken them
        // over in the meantime: a program started inside this window
        // owns the LEDs. See endResetFlash().
        this.resetFlashPending = true;
        var token = ++this.resetFlashToken;
        var self = this;
        window.setTimeout(function() {
            if (self.resetFlashToken != token || !self.resetFlashPending)
                return;
            self.endResetFlash();
        }, 400);
    }

    /**
     * Ends the RESET lamp flash and hands the LEDs back. Called by the
     * flash's own timeout, and by anything that starts the CPU, so
     * that a running program's display is never overwritten.
     */
    endResetFlash() {
        if (!this.resetFlashPending)
            return;
        this.resetFlashPending = false;
        this.resetFlashToken++;
        if (this.setAddressLedsCallback) {
            this.setAddressLedsCallback(new Array(16).fill(0));
        }
        if (this.setDataLedsCallback) {
            this.setDataLedsCallback(new Array(8).fill(0));
        }
    }

    /**
     * Stops the CPU.
     */
    stop() {
        if (!this.isPoweredOn)
            return;
        this.isRunning = false;
        if (this.setWaitLedCallback) {
            this.setWaitLedCallback(this.isRunning);
        }
    }

    /**
     * The CPU has run into a HLT. It stops where it is, as the real
     * machine did, with the WAIT lamp on - the panel's only way of
     * saying that a program has finished rather than gone quiet
     * (D26). RESET is what starts it again.
     */
    halt() {
        this.halted = true;
        this.stop();
        this.updateLamps();
    }

    /**
     * Starts the CPU.
     */
    start() {
        if (!this.isPoweredOn)
            return;
        this.endResetFlash();
        this.clearBlockedWrites();
        this.isRunning = true;
        if (this.setWaitLedCallback) {
            this.setWaitLedCallback(this.isRunning);
        }
        this.lastTickTime = Date.now();
        window.setTimeout(this.getClockTickerCallback(), 1);
    }

    /**
     * Forgets the writes refused so far: a new run is counted afresh,
     * and reported afresh if it writes to protected memory too.
     */
    clearBlockedWrites() {
        this.blockedWrites = 0;
        this.firstBlockedAddress = null;
    }

    /**
     * Runs a given number of CPU cycles.
     * @param {number} cycles The number of CPU cycles to step on.
     * @return {number|undefined} The address shown on the address LEDs.
     */
    step(cycles) {
        if (!this.isPoweredOn)
            return;
        // Single stepping counts as taking the lamps over too.
        this.endResetFlash();
        // Runs instruction by instruction, watching for LDAX. On a
        // real Altair 8800, the memory read cycle of LDAX B/D puts
        // the BC/DE register pair on the address bus, hence on the
        // address LEDs. Classic programs like Kill the Bit rely on
        // this side effect to animate the high address LEDs. See
        // https://github.com/wixette/8800-simulator/issues/1
        var ldaxAddress = null;
        var executed = 0;
        while (executed < cycles) {
            let cpu = CPU8080.status();
            let opcode = this.readByte(cpu.pc);
            let before = CPU8080.T();
            CPU8080.steps(1);
            let consumed = CPU8080.T() - before;
            executed += consumed;
            // A halted CPU consumes 1 cycle per step without
            // executing the opcode at PC.
            if (consumed <= 1) {
                // No 8080 instruction is over in one cycle: this is a
                // CPU that was already halted, marking time. It is how
                // a halted machine stops again when RUN is pressed.
                this.halt();
                break;
            }
            if (opcode == 0x0a) {
                /* LDAX B */
                ldaxAddress = (cpu.b << 8) | cpu.c;
            } else if (opcode == 0x1a) {
                /* LDAX D */
                ldaxAddress = (cpu.d << 8) | cpu.e;
            } else if (opcode == 0x76) {
                /* HLT. Caught here, on the instruction itself, rather
                   than left to the cycle count above, so that SINGLE
                   STEP onto a HLT stops on it instead of one press
                   later. */
                this.halt();
                break;
            }
        }
        this.requestDump();
        var address = ldaxAddress != null ? ldaxAddress : CPU8080.status().pc;
        this.busAddress = address;
        if (this.setAddressLedsCallback) {
            let bits = Sim8800.parseBits(address, 16);
            this.setAddressLedsCallback(bits);
        }
        this.updateLamps();
        return address;
    }

    /**
     * Runs a single instruction, for the SINGLE STEP switch on the
     * front panel. Besides the address LEDs, the data LEDs are
     * updated with the memory byte at the displayed address - the
     * next opcode to be fetched, or the byte just read by LDAX -
     * similar to how a real Altair 8800 shows the data bus contents
     * while stepping. The data LEDs are not touched when the CPU is
     * free-running, so that OUT FFh keeps full control of them.
     */
    singleStep() {
        if (!this.isPoweredOn)
            return;
        // Each step is a run of its own, so a write it makes to
        // protected memory is reported every time.
        this.clearBlockedWrites();
        var address = this.step(1);
        if (this.setDataLedsCallback) {
            this.setDataLedsCallback(
                Sim8800.parseBits(this.readByte(address), 8));
        }
    }

    /**
     * Shows the address and the byte at the address via LEDs. The byte
     * is read the same way the CPU reads it, so an address with no
     * memory behind it shows FFh rather than a stray value.
     */
    showAddressAndData() {
        this.busAddress = this.lastAddress;
        this.updateLamps();
        if (this.setAddressLedsCallback) {
            let bits = Sim8800.parseBits(this.lastAddress, 16);
            this.setAddressLedsCallback(bits);
        }
        if (this.setDataLedsCallback) {
            let bits = Sim8800.parseBits(this.readByte(this.lastAddress), 8);
            this.setDataLedsCallback(bits);
        }
    }

    /**
     * Reads a byte from the given address.
     */
    examine() {
        if (!this.isPoweredOn)
            return;
        if (this.getInputAddressCallback) {
            var address = this.getInputAddressCallback();
            this.lastAddress = address & 0xffff;
            this.showAddressAndData();
        }
    }

    /**
     * Reads a byte from the next address.
     */
    examineNext() {
        if (!this.isPoweredOn)
            return;
        this.lastAddress = (this.lastAddress + 1) & 0xffff;
        this.showAddressAndData();
    }

    /**
     * Writes a byte to the given address.
     * @return {boolean} False if the board there is protected, so the
     *     byte did not go in.
     */
    deposit() {
        if (!this.isPoweredOn)
            return true;
        if (!this.getInputAddressCallback)
            return true;
        var refused = this.isProtected(this.lastAddress);
        if (!refused) {
            // Only 8 bits of input is considered.
            var value = this.getInputAddressCallback() & 0xff;
            this.writeByte(this.lastAddress, value);
        }
        this.showAddressAndData();
        this.requestDump();
        return !refused;
    }

    /**
     * Writes a byte to the next address.
     * @return {boolean} False if the board there is protected.
     */
    depositNext() {
        if (!this.isPoweredOn)
            return true;
        this.lastAddress = (this.lastAddress + 1) & 0xffff;
        return this.deposit();
    }
};

/**
 * The port the front panel answers: reading it gives the upper eight
 * address switches, writing it drives the data LEDs.
 * @type {number}
 */
Sim8800.FRONT_PANEL_PORT = 0xff;

/**
 * How much memory one 88-4MCS board holds, and so how much one PROTECT
 * covers. The base machine's single board is smaller: see boardOf().
 * @type {number}
 */
Sim8800.BOARD_SIZE = 4096;

/**
 * How much memory the debugger's memory dump shows at once, and the
 * size of one cell of the memory map. Sixteen lines of sixteen bytes:
 * the whole of the 256 byte machine, and one page of anything larger.
 * @type {number}
 */
Sim8800.DUMP_WINDOW_SIZE = 256;

/**
 * The undocumented opcodes, and the documented instruction the CPU core
 * runs each one as. See decodeInstruction().
 * @type {Object<number, number>}
 */
Sim8800.UNDOCUMENTED_OPCODES = {
    0x08: 0x00, 0x10: 0x00, 0x18: 0x00, 0x20: 0x00,  // NOP
    0x28: 0x00, 0x30: 0x00, 0x38: 0x00,
    0xcb: 0xc3,  // JMP
    0xd9: 0xc9,  // RET
    0xdd: 0xcd, 0xed: 0xcd, 0xfd: 0xcd,  // CALL
};

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sim8800;
}
