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
     */
    constructor(memSize, clockRate) {
        /** @type {number} */
        this.clockRate = clockRate;
        /** @type {Array<number>} */
        this.mem = new Array(memSize);
        this.initMem();
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
            window.console.log('writing byte @' + Sim8800.toHex(address, 8)
                               + ' : ' + Sim8800.toHex(value, 2));
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
            window.console.log('reading byte @' + Sim8800.toHex(address, 8)
                               + ' : ' + Sim8800.toHex(value, 2));
            return value;
        };
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
     * Fills the memory with random numbers.
     */
    initMem() {
        for (let i = 0; i < this.mem.length; i++) {
            this.mem[i] = Math.floor(Math.random() * 256);
        }
    }

    /**
     * Dumps the memory to HTML, for debugging or monitoring.
     * @param {Element} containerElem The DOM element to hold the generated HTML.
     */
    dumpMem(containerElem) {
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
        containerElem.innerHTML = sb.join('');
    }
};
