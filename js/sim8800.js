/**
 *   Copyright 2020 wixette@gmail.com
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
     * @param {Element?} dumpCpuElem The DOM element used to render
     *     dumped CPU status. null to disable the feature.
     * @param {Element?} dumpMemElem The DOM element used to render
     *     dumped memory contents. null to disable the feature.
     */
    constructor(memSize, clockRate,
                setAddressLedsCallback, setDataLedsCallback,
                dumpCpuElem, dumpMemElem) {
        this.clockRate = clockRate;
        this.mem = new Array(memSize);
        this.setAddressLedsCallback = setAddressLedsCallback;
        this.setDataLedsCallback = setDataLedsCallback;
        this.dumpCpuElem = dumpCpuElem;
        this.dumpMemElem = dumpMemElem;
        this.running = false;
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
        for (let i = 0; i < this.mem.length; i++) {
            if (random) {
                this.mem[i] = Math.floor(Math.random() * 256);
            } else {
                this.mem[i] = 0;
            }
        }
    }

    /**
     * Loads data into memory.
     * @param {number} address The start address to load the data/program.
     * @param {Array<number>} data The array of data.
     */
    loadData(address, data) {
        for (let i = 0; i < data.length && address < this.mem.length; i++) {
            this.mem[address++] = data[i];
        }
    }

    /**
     * Loads data into memory.
     * @param {number} address The start address to load the data/program.
     * @param {string} hexString Data encoded in hex string, like 'c3 00 00'.
     */
    loadDataAsHexString(address, hexString) {
        var data = hexString.split(' ');
        for (let i = 0; i < data.length && address < this.mem.length; i++) {
	    var byte = parseInt('0x' + data[i]);
            this.mem[address++] = byte;
        }
    }

    /**
     * Dumps the memory to HTML, for debugging or monitoring.
     */
    dumpMem() {
        if (this.dumpMemElem) {
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
            this.dumpMemElem.innerHTML = sb.join('');
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
        if (this.dumpCpuElem) {
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
            this.dumpCpuElem.innerHTML = sb.join('');
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
            if (address == 0xff) {
                // We only care about port 0xff.
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
            if (self.running) {
                var cycles = self.clockRate / 1000;
                self.step(cycles);
                window.setTimeout(self.getClockTickerCallback(), 1);
            }
        };
    }

    /**
     * Runs a given number of CPU cycles.
     * @param {number} cycles The number of CPU cycles to step on.
     */
    step(cycles) {
        CPU8080.steps(cycles);
        this.dumpCpu();
        this.dumpMem();
        if (this.setAddressLedsCallback) {
            var cpu = CPU8080.status();
            var pcBits = Sim8800.parseBits(cpu.pc, 16);
            this.setAddressLedsCallback(pcBits);
        }
    }

    /**
     * Powers on the machine.
     */
    powerOn() {
        this.stop();
        reset();
        this.initMem();
    }

    /**
     * Powers off the machine.
     */
    powerOff() {
        this.stop();
        reset();
        this.initMem();
    }

    /**
     * Resets the machine.
     */
    reset() {
        CPU8080.reset();
    }

    /**
     * Stops the CPU.
     */
    stop() {
        this.running = false;
    }

    /**
     * Starts the CPU.
     */
    start() {
        this.running = true;
        window.setTimeout(this.getClockTickerCallback(), 1);
    }
};
