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
 * @fileoverview MITS 88-SIO and 88-2SIO serial interface boards.
 */


/**
 * A MITS serial interface board, the thing a terminal plugged into.
 *
 * It answers two ports: a status port, and a data port one above it.
 * The same class covers both boards the Altair's software expects,
 * because they differ only in where they sit and which way up they
 * report: the 88-SIO at 00h/01h is active low - a zero means ready -
 * and the 88-2SIO at 10h/11h is the usual way round. MITS 4K BASIC
 * drives the 88-SIO like this:
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
     * @param {Array<number>=} rx An input queue to share with another
     *     board, so that one terminal can be wired to two slots at
     *     once. Without it the board gets a queue of its own.
     */
    constructor(onTx, rx) {
        /**
         * Characters typed but not yet read by the CPU.
         * @type {Array<number>}
         */
        this.rx = rx || [];
        this.onTx = onTx || null;
        this.basePort = Sio.BASE_PORT;
        /**
         * Whether a clear status bit means ready. True for the 88-SIO,
         * false for the 88-2SIO, whose 6850 reports the other way up.
         * @type {boolean}
         */
        this.activeLow = true;
    }

    /**
     * Plugs the board into a simulator, on both of its ports.
     * @param {Sim8800} sim The simulator.
     * @param {number=} basePort The status port; the data port is the
     *     next one up. The 88-SIO sits at 00h, the 88-2SIO at 10h.
     * @param {boolean=} activeLow Whether a clear status bit means
     *     ready. The 88-SIO says yes, the 88-2SIO says no.
     * @return {Sio} This board, for chaining.
     */
    attachTo(sim, basePort = Sio.BASE_PORT, activeLow = true) {
        this.basePort = basePort;
        this.activeLow = activeLow;
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
     * Reads the status port.
     *
     * The two boards report the opposite way up. On the 88-SIO a clear
     * bit means ready, so "no input" is set when nothing is waiting
     * and the transmit-busy bit stays clear because nothing here is
     * ever slower than the CPU. On the 88-2SIO, whose 6850 ACIA is the
     * usual way round, a set bit means ready. Only the bits software
     * actually tests are modelled.
     * @return {number} The status byte.
     */
    readStatus() {
        if (this.activeLow) {
            // Nothing here is ever slower than the CPU, so
            // STATUS_OUTPUT_BUSY stays clear.
            return this.rx.length ? 0 : Sio.STATUS_NO_INPUT;
        }
        return (this.rx.length ? Sio.STATUS_2SIO_INPUT_READY : 0) |
            Sio.STATUS_2SIO_OUTPUT_READY;
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

/**
 * The 88-2SIO's status port. Selected by raising sense switch A11,
 * which MITS BASIC reads at startup. See docs/ms-basic-4k.md.
 * @type {number}
 */
Sio.TWO_SIO_BASE_PORT = 0x10;

/**
 * 88-2SIO status bit that is SET when a character is waiting.
 * @type {number}
 */
Sio.STATUS_2SIO_INPUT_READY = 0x01;

/**
 * 88-2SIO status bit that is SET when the transmitter is ready.
 * @type {number}
 */
Sio.STATUS_2SIO_OUTPUT_READY = 0x02;

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sio;
}
