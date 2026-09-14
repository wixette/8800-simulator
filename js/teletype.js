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
 * @fileoverview The paper of a Teletype ASR-33.
 */


/**
 * Models the paper in an ASR-33: bytes go in, printed lines come out.
 *
 * It is a printer, not a screen, and the difference shows. Carriage
 * return moves the carriage back to the left margin without advancing
 * the paper, and line feed advances the paper without moving the
 * carriage; they are two separate mechanisms and software drives them
 * separately. MITS BASIC emits CR CR LF between lines, so treating CR
 * as "new line" double spaces the whole session. Printing after a CR
 * without a LF overprints what is already there, which is how the
 * machine struck out a deleted character.
 *
 * No DOM here: this turns bytes into text, and the page displays it.
 */
class Teletype {
    /**
     * @param {number=} columns The carriage width. An ASR-33 is 72.
     * @param {number=} maxLines How much paper to keep before the top
     *     of the roll is dropped.
     */
    constructor(columns = Teletype.COLUMNS, maxLines = Teletype.MAX_LINES) {
        this.columns = columns;
        this.maxLines = maxLines;
        this.clear();
    }

    /**
     * Tears off the paper and starts a fresh sheet.
     */
    clear() {
        /**
         * The printed lines, oldest first.
         * @type {Array<string>}
         */
        this.lines = [''];
        /**
         * Where the carriage is on the current line.
         * @type {number}
         */
        this.column = 0;
    }

    /**
     * Advances the paper by one line. The carriage does not move: on a
     * real machine line feed and carriage return are separate.
     */
    lineFeed() {
        this.lines.push('');
        if (this.lines.length > this.maxLines) {
            this.lines.shift();
        }
    }

    /**
     * Prints one byte.
     * @param {number} byte The byte the CPU sent.
     */
    write(byte) {
        // The ASR-33 is a seven bit machine. MITS BASIC sets the eighth
        // bit on the last character of every message it prints - the
        // stream really does read "MEMORY SIZ\xC5? " - and on the real
        // hardware that bit never reached the printer.
        var c = byte & 0x7f;
        if (c == Teletype.CR) {
            this.column = 0;
            return;
        }
        if (c == Teletype.LF) {
            this.lineFeed();
            return;
        }
        if (c < 0x20 || c == 0x7f) {
            // Bell, rubout and the other controls print nothing.
            return;
        }
        var index = this.lines.length - 1;
        var line = this.lines[index];
        if (line.length < this.column) {
            line += ' '.repeat(this.column - line.length);
        }
        this.lines[index] = line.substring(0, this.column) +
            String.fromCharCode(c) + line.substring(this.column + 1);
        this.column++;
        if (this.column >= this.columns) {
            // The carriage has run out of paper width.
            this.column = 0;
            this.lineFeed();
        }
    }

    /**
     * Prints a string, for tests and for canned messages.
     * @param {string} text The text.
     */
    writeText(text) {
        for (let i = 0; i < text.length; i++) {
            this.write(text.charCodeAt(i));
        }
    }

    /**
     * @return {string} Everything printed so far.
     */
    getText() {
        return this.lines.join('\n');
    }

    /**
     * Translates a key press into the byte the ASR-33 would have sent.
     *
     * The keyboard was upper case only, and MITS BASIC means it: type
     * `print "hi"` and it answers `?SN ERROR`. The editing keys are
     * BASIC's own - underscore rubs out the last character and at-sign
     * kills the line - mapped here from the keys a modern keyboard
     * actually has.
     * @param {string} key The KeyboardEvent key value.
     * @param {boolean=} ctrlKey Whether control was held.
     * @return {?number} The byte to send, or null to ignore the key.
     */
    static keyToByte(key, ctrlKey = false) {
        if (ctrlKey) {
            if (key == 'c' || key == 'C') return Teletype.BREAK;
            if (key == 'u' || key == 'U') return Teletype.KILL_LINE;
            return null;
        }
        if (key == 'Enter') return Teletype.CR;
        if (key == 'Backspace' || key == 'Delete') return Teletype.RUBOUT;
        if (key == 'Escape') return Teletype.KILL_LINE;
        if (key == 'Tab') return 0x09;
        if (key.length != 1) return null;
        var c = key.toUpperCase().charCodeAt(0);
        return c < 0x80 ? c : null;
    }
};

/** The carriage width of an ASR-33. @type {number} */
Teletype.COLUMNS = 72;

/** How many printed lines to keep. @type {number} */
Teletype.MAX_LINES = 500;

/** Carriage return. @type {number} */
Teletype.CR = 0x0d;

/** Line feed. @type {number} */
Teletype.LF = 0x0a;

/** Control-C, which interrupts a running BASIC program. @type {number} */
Teletype.BREAK = 0x03;

/** Underscore, which BASIC treats as rub out the last character. */
Teletype.RUBOUT = 0x5f;

/** At sign, which BASIC treats as throw away the line. @type {number} */
Teletype.KILL_LINE = 0x40;

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Teletype;
}
