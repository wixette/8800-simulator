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
 * @fileoverview MITS 88-SIO serial interface board.
 */


/**
 * The 88-SIO board, the thing a terminal plugged into.
 *
 * It answers two ports: a status port, and a data port one above it.
 * The status bits are active low - a zero means ready - which is the
 * detail that catches everyone out. MITS 4K BASIC drives it like this:
 *
 *     IN 00H / ANI 01H / JNZ back    ; wait for a character to arrive
 *     IN 01H                         ; read it
 *
 *     IN 00H / ANI 80H / JNZ back    ; wait for the transmitter
 *     OUT 01H                        ; send a character
 *
 * This is a device, not a view: nothing here touches the DOM, and it
 * keeps working whether or not a terminal is on screen. See
 * docs/ms-basic-4k.md.
 */
class Sio {
    /**
     * @param {function(number)?} onTx Called with each byte the CPU
     *     sends, as the CPU wrote it. The eighth bit is left alone;
     *     masking it off is the printer's business, not the board's.
     */
    constructor(onTx) {
        /**
         * Characters typed but not yet read by the CPU.
         * @type {Array<number>}
         */
        this.rx = [];
        this.onTx = onTx || null;
        this.basePort = Sio.BASE_PORT;
    }

    /**
     * Plugs the board into a simulator, on both of its ports.
     * @param {Sim8800} sim The simulator.
     * @param {number=} basePort The status port; the data port is the
     *     next one up. The 88-SIO sits at 00h, the 88-2SIO at 10h.
     * @return {Sio} This board, for chaining.
     */
    attachTo(sim, basePort = Sio.BASE_PORT) {
        this.basePort = basePort;
        sim.attachDevice(basePort, this);
        sim.attachDevice(basePort + 1, this);
        return this;
    }

    /**
     * Queues a character as if it had been typed at the terminal.
     * @param {number} byte The character.
     */
    receive(byte) {
        this.rx.push(byte & 0xff);
    }

    /**
     * Queues a whole string, for tests and for pasting.
     * @param {string} text The text.
     */
    receiveText(text) {
        for (let i = 0; i < text.length; i++) {
            this.receive(text.charCodeAt(i));
        }
    }

    /**
     * Throws away anything typed and not yet read.
     */
    reset() {
        this.rx.length = 0;
    }

    /**
     * Reads the status port. Active low: a clear bit means ready.
     * Only the two bits software actually tests are modelled.
     * @return {number} The status byte.
     */
    readStatus() {
        var status = 0;
        if (this.rx.length == 0) {
            status |= Sio.STATUS_NO_INPUT;
        }
        // Nothing here is ever slower than the CPU, so the transmitter
        // is always ready and STATUS_OUTPUT_BUSY stays clear.
        return status;
    }

    /**
     * Reads the data port, taking the oldest character typed.
     * @return {number} The character, or 0 if nothing is waiting.
     */
    readData() {
        return this.rx.length ? this.rx.shift() : 0;
    }

    /**
     * Writes the data port, sending a character to the terminal.
     * @param {number} value The character.
     */
    writeData(value) {
        if (this.onTx) {
            this.onTx(value & 0xff);
        }
    }

    /**
     * Device interface: the CPU reads one of our two ports.
     * @param {number} port The port number.
     * @return {number} The byte.
     */
    readPort(port) {
        return port == this.basePort ? this.readStatus() : this.readData();
    }

    /**
     * Device interface: the CPU writes one of our two ports. Writes to
     * the status port are the board's control register, which nothing
     * we care about depends on, so they are accepted and dropped.
     * @param {number} port The port number.
     * @param {number} value The byte.
     */
    writePort(port, value) {
        if (port != this.basePort) {
            this.writeData(value);
        }
    }
};

/**
 * The 88-SIO's status port. The data port is the next one up.
 * @type {number}
 */
Sio.BASE_PORT = 0x00;

/**
 * Status bit that is SET when no character is waiting to be read.
 * @type {number}
 */
Sio.STATUS_NO_INPUT = 0x01;

/**
 * Status bit that is SET while the transmitter is still busy.
 * @type {number}
 */
Sio.STATUS_OUTPUT_BUSY = 0x80;

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sio;
}
