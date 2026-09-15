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
     * @param {function(string)?} dumpMemCallback The callback to receive
     *     memory contents dump, in HTML string.
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
        this.lastAddress = 0;
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
        var leadingZeros = (new Array(len)).fill('0').join('');
        return (leadingZeros + n.toString(16)).toUpperCase().substr(-len);
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
            bits.push(data & 1 != 0 ? 1 : 0);
            data >>>= 1;
        }
        return bits;
    }

    /**
     * Fills the memory with dummy bytes.
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
     * Loads data into memory.
     * @param {number} address The start address to load the data/program.
     * @param {string} hexString Data encoded in hex string, like 'c3 00 00'.
     */
    loadDataAsHexString(address, hexString) {
        if (!this.isPoweredOn || !hexString)
            return;
        var data = hexString.split(' ');
        for (let i = 0; i < data.length && address < this.mem.length; i++) {
	    var byte = parseInt('0x' + data[i]);
            if (!isNaN(byte)) {
                this.mem[address++] = byte;
            }
        }
        this.requestDump();
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
     * Builds the memory map strip: one cell per window-sized page of
     * memory, shaded by how much of the page is not zero, marked where
     * the program counter and the stack pointer are, and outlined on
     * the page the dump is showing. It is how a machine too big to
     * print on one screen still fits on one screen.
     *
     * The shading has five steps, by the share of the page's bytes
     * that are not zero: empty, then up to a quarter, a half, three
     * quarters, and the rest. Each cell's tooltip gives its address
     * and that percentage, so the scale does not have to be learnt.
     * @param {{start: number, end: number}} window The shown window.
     * @param {Object} cpu The CPU status.
     * @return {string} The HTML.
     */
    buildMemMap(window, cpu) {
        var size = Sim8800.DUMP_WINDOW_SIZE;
        var sb = ['<div class="mem-map">'];
        for (let page = 0; page * size < this.mem.length; page++) {
            let base = page * size;
            let used = 0;
            for (let i = base; i < Math.min(this.mem.length, base + size); i++) {
                if (this.mem[i]) used++;
            }
            let level = used == 0 ? 0 : Math.min(4, Math.ceil(used / size * 4));
            let classes = ['mem-page', 'mem-page-' + level];
            if (base == window.start) classes.push('mem-page-shown');
            if (cpu.pc >= base && cpu.pc < base + size) classes.push('mem-page-pc');
            if (cpu.sp >= base && cpu.sp < base + size) classes.push('mem-page-sp');
            let pageSize = Math.min(this.mem.length - base, size);
            let title = Sim8800.toHex(base, 4) + '-' +
                Sim8800.toHex(base + pageSize - 1, 4) + '  ' +
                Math.round(used / pageSize * 100) + '%';
            sb.push('<span class="' + classes.join(' ') +
                    '" data-address="' + base + '" title="' + title +
                    '"></span>');
        }
        sb.push('</div>\n');
        return sb.join('');
    }

    /**
     * Dumps the memory to HTML, for debugging or monitoring.
     *
     * Only one window of memory is printed, never the whole machine.
     * On the 256 byte machine the window is the whole machine, so this
     * prints exactly what it always did; above that the window moves,
     * and the map strip above it shows where in the address space you
     * are looking. Printing all of a large memory on every repaint is
     * what made the debugger unusable past a few hundred bytes.
     */
    dumpMem() {
        if (!this.dumpMemCallback)
            return;
        // A machine that is off has no memory to print. The guard is
        // here and not only in flushDump() because anything that calls
        // this directly bypasses flushDump entirely - ZERO ALL MEMORY
        // did, and painted a dump of zeros over the blank a powered
        // down machine is supposed to show. Worse, everything that
        // moved the window afterwards went through flushDump and was
        // refused, so the map strip sat there taking clicks and never
        // moving its cursor.
        if (!this.isPoweredOn)
            return;
        var cpu = CPU8080.status();
        var window = this.getDumpWindow();
        var sb = [];
        if (this.mem.length > Sim8800.DUMP_WINDOW_SIZE) {
            sb.push(this.buildMemMap(window, cpu));
        }
        sb.push('<pre>\n');
        for (let i = window.start; i < window.end; i += 16) {
            sb.push(Sim8800.toHex(i, 4));
            sb.push('  ');
            for (let j = i; j < Math.min(window.end, i + 16); j++) {
                let byte = Sim8800.toHex(this.mem[j], 2);
                if (j == cpu.pc) {
                    byte = '<span class="at-pc">' + byte + '</span>';
                } else if (j == cpu.sp) {
                    byte = '<span class="at-sp">' + byte + '</span>';
                }
                sb.push(byte);
                sb.push((j + 1) % 8 == 0 ? '  ' : ' ');
            }
            sb.push('\n');
        }
        sb.push('</pre>\n');
        this.dumpMemCallback(sb.join(''));
    }

    /**
     * Decodes the FLAGs register.
     * @param {number} flags The value of the FLAGs register.
     * @return {Object} The decoded flags.
     */
    decodeFlags(flags) {
        var ret = {};
        ret.sign = flags & 0x80 != 0;
        ret.zero = flags & 0x40 != 0;
        ret.auxiliaryCarry = flags & 0x10 != 0;
        ret.parity = flags & 0x04 != 0;
        ret.carry = flags & 0x01 != 0;
        return ret;
    }

    /**
     * Dumps the internal CPU status to HTML, for debugging or mornitoring.
     */
    dumpCpu() {
        if (!this.isPoweredOn)
            return;
        if (this.dumpCpuCallback) {
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
            var flags = this.decodeFlags(cpu.f);
            sb.push('FLAGS: ');
            if (flags.sign) sb.push('SIGN ');
            if (flags.zero) sb.push('ZERO ');
            if (flags.auxiliaryCarry) sb.push('AC ');
            if (flags.parity) sb.push('PARITY ');
            if (flags.carry) sb.push('CARRY ');
            sb.push('</pre>\n');
            this.dumpCpuCallback(sb.join(''));
        }
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
     * @param {number} address The address to write.
     * @param {number} value The byte to write.
     */
    writeByte(address, value) {
        address &= 0xffff;
        if (address < this.mem.length) {
            this.mem[address] = value;
        }
    }

    /**
     * Returns the byteTo (write memory) callback.
     * @return {function(number, number)}
     */
    getWriteByteCallback() {
        var self = this;
        return function(address, value) {
            self.writeByte(address, value);
        };
    }

    /**
     * Returns the byteAt (read memory) callback.
     * @return {function(number): number}
     */
    getReadByteCallback() {
        var self = this;
        return function(address) {
            return self.readByte(address);
        };
    }

    /**
     * Attaches an I/O device to a port.
     *
     * On the real machine a port number is answered by whichever board
     * decodes it, so this is the same shape: a device is any object
     * with a readPort and/or a writePort method, and the simulator
     * does not care what is behind them. The front panel is attached
     * this way like anything else; a serial board would be too.
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
     * The dumps are the most expensive thing the simulator does - the
     * memory dump alone rebuilds the whole of memory as HTML - and a
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
        // A machine that is off shows nothing. powerOff() blanks the
        // dumps deliberately, and a scheduled flush arriving after it
        // - or the debugger tab being opened later - must not put the
        // old contents back. dumpCpu() and dumpMem() refuse as well;
        // stopping here just saves asking them.
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
            this.dumpMemCallback('');
        }
        this.isPoweredOn = false;
    }

    /**
     * Resets the machine.
     */
    reset() {
        if (!this.isPoweredOn)
            return;
        // The 8080's RESET line clears the program counter and the
        // interrupt enable. It does NOT clear the registers, and that
        // is not a detail: MITS BASIC patches the jump at 0000H to
        // point at its warm start once it has finished initialising,
        // so RESET and RUN brings back OK with your program intact
        // rather than asking MEMORY SIZE? again - and that warm start
        // assumes the stack pointer is still where it left it. Clear
        // SP here and the first PUSH lands in unpopulated memory and
        // BASIC never reaches its prompt.
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
        this.stop();
        this.lastAddress = 0;
        if (this.setAddressLedsCallback) {
            this.setAddressLedsCallback(new Array(16).fill(1));
        }
        if (this.setDataLedsCallback) {
            this.setDataLedsCallback(new Array(8).fill(1));
        }
        this.requestDump();
        // The flash is only allowed to put the lamps out if nothing
        // has taken them over in the meantime. A program that starts
        // inside this window owns the data LEDs, and used to have
        // whatever it wrote wiped 400 ms later.
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
     * Starts the CPU.
     */
    start() {
        if (!this.isPoweredOn)
            return;
        this.endResetFlash();
        this.isRunning = true;
        if (this.setWaitLedCallback) {
            this.setWaitLedCallback(this.isRunning);
        }
        this.lastTickTime = Date.now();
        window.setTimeout(this.getClockTickerCallback(), 1);
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
            let opcode = this.mem[cpu.pc % this.mem.length];
            let before = CPU8080.T();
            CPU8080.steps(1);
            let consumed = CPU8080.T() - before;
            executed += consumed;
            // A halted CPU consumes 1 cycle per step without
            // executing the opcode at PC.
            if (consumed > 1) {
                if (opcode == 0x0a) {
                    /* LDAX B */
                    ldaxAddress = (cpu.b << 8) | cpu.c;
                } else if (opcode == 0x1a) {
                    /* LDAX D */
                    ldaxAddress = (cpu.d << 8) | cpu.e;
                }
            }
        }
        this.requestDump();
        var address = ldaxAddress != null ? ldaxAddress : CPU8080.status().pc;
        if (this.setAddressLedsCallback) {
            let bits = Sim8800.parseBits(address, 16);
            this.setAddressLedsCallback(bits);
        }
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
        var address = this.step(1);
        if (this.setDataLedsCallback) {
            let bits = Sim8800.parseBits(this.mem[address % this.mem.length],
                                         8);
            this.setDataLedsCallback(bits);
        }
    }

    /**
     * Shows the address and the byte at the address via LEDs. The byte
     * is read the same way the CPU reads it, so an address with no
     * memory behind it shows FFh rather than a stray value.
     */
    showAddressAndData() {
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
     */
    deposit() {
        if (!this.isPoweredOn)
            return;
        if (this.getInputAddressCallback) {
            // Only 8 bits of input is considered.
            var value = this.getInputAddressCallback() & 0xff;
            this.writeByte(this.lastAddress, value);
            this.showAddressAndData();
            this.requestDump();
        }
    }

    /**
     * Writes a byte to the next address.
     */
    depositNext() {
        if (!this.isPoweredOn)
            return;
        this.lastAddress = (this.lastAddress + 1) & 0xffff;
        this.deposit();
    }
};

/**
 * The port the front panel answers: reading it gives the upper eight
 * address switches, writing it drives the data LEDs.
 * @type {number}
 */
Sim8800.FRONT_PANEL_PORT = 0xff;

/**
 * How much memory the debugger's memory dump shows at once, and the
 * size of one cell of the memory map. Sixteen lines of sixteen bytes:
 * the whole of the 256 byte machine, and one page of anything larger.
 * @type {number}
 */
Sim8800.DUMP_WINDOW_SIZE = 256;

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sim8800;
}
