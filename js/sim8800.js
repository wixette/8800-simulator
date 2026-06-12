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
        this.initMem();
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
        return (leadingZeros + n.toString(16)).substr(-len);
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
    initMem(random = false) {
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
        this.dumpMem();
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
        this.dumpMem();
    }

    /**
     * Dumps the memory to HTML, for debugging or monitoring.
     */
    dumpMem() {
        if (this.dumpMemCallback) {
            var sb = ['<pre>\n'];
            for (let i = 0; i < this.mem.length; i += 16) {
                sb.push(Sim8800.toHex(i, 4));
                sb.push('  ');
                for (let j = i;
                     j < Math.min(this.mem.length, i + 16);
                     j++) {
                    sb.push(Sim8800.toHex(this.mem[j], 2));
                    sb.push((j + 1) % 8 == 0 ? '  ' : ' ');
                }
                sb.push('\n');
            }
            sb.push('</pre>\n');
            this.dumpMemCallback(sb.join(''));
        }
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
     * Returns the byteTo (write memory) callback.
     * @return {function(number, number)}
     */
    getWriteByteCallback() {
        var self = this;
        return function(address, value) {
            address = address % self.mem.length;
            self.mem[address] = value;
        };
    }

    /**
     * Returns the byteAt (read memory) callback.
     * @return {function(number): number}
     */
    getReadByteCallback() {
        var self = this;
        return function(address) {
            address = address % self.mem.length;
            var value = self.mem[address];
            return value;
        };
    }

    /**
     * Returns the porto (write port) callback.
     * @return {function(number, number)}
     */
    getWritePortCallback() {
        var self = this;
        return function(address, value) {
            if (address == 0xff && self.setDataLedsCallback) {
                var bits = Sim8800.parseBits(value, 8);
                self.setDataLedsCallback(bits);
            }
        };
    }

    /**
     * Returns the byteAt (read memory) callback.
     * @return {function(number): number}
     */
    getReadPortCallback() {
        var self = this;
        return function(address) {
            var value = 0;
            // We only care about the port 0xff.
            if (address == 0xff && self.getInputAddressCallback) {
                var word = self.getInputAddressCallback();
                return word >> 8;
            }
            return value;
        };
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
        CPU8080.reset();
        this.stop();
        this.lastAddress = 0;
        if (this.setAddressLedsCallback) {
            this.setAddressLedsCallback(new Array(16).fill(1));
        }
        if (this.setDataLedsCallback) {
            this.setDataLedsCallback(new Array(8).fill(1));
        }
        this.dumpCpu();
        this.dumpMem();
        var self = this;
        window.setTimeout(function() {
            if (self.setAddressLedsCallback) {
                self.setAddressLedsCallback(new Array(16).fill(0));
            }
            if (self.setDataLedsCallback) {
                self.setDataLedsCallback(new Array(8).fill(0));
            }
        }, 400);
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
        this.dumpCpu();
        this.dumpMem();
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
     * Shows the address and the byte at the address via LEDs.
     */
    showAddressAndData() {
        if (this.setAddressLedsCallback) {
            let bits = Sim8800.parseBits(this.lastAddress, 16);
            this.setAddressLedsCallback(bits);
        }
        if (this.setDataLedsCallback) {
            let bits = Sim8800.parseBits(this.mem[this.lastAddress], 8);
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
            this.lastAddress = address;
            this.showAddressAndData();
        }
    }

    /**
     * Reads a byte from the next address.
     */
    examineNext() {
        if (!this.isPoweredOn)
            return;
        this.lastAddress++;
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
            this.getWriteByteCallback()(this.lastAddress, value);
            this.showAddressAndData();
            this.dumpMem();
        }
    }

    /**
     * Writes a byte to the next address.
     */
    depositNext() {
        if (!this.isPoweredOn)
            return;
        this.lastAddress++;
        this.deposit();
    }
};

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sim8800;
}
