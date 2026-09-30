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
 * @fileoverview Writes a machine as a link, and reads it back.
 */


/**
 * The format of a program link, and nothing else: no page, no machine.
 *
 * A link is a public contract (P8 in docs/ui-design.md). Once one has
 * been copied it lives in textbooks and worksheets nobody will edit
 * again, so a field may be added here but never renamed, dropped or
 * read differently. That is why the whole format is in one file,
 * including the hex that the page's Load Data box reads the same way.
 *
 * A machine, here, is {memSize, bytes, cpu, switches}: the installed
 * memory, its contents from 0000H, the registers by the names in
 * REGS16 and REGS8 (or null to leave them out), and the address
 * switches as a word. Functions that need to know which memory sizes
 * the machine offers take them as memSizes, smallest first.
 */
class Link {
    /**
     * Turns hex text into bytes. This is both the hex= field of a link
     * and the page's Load Data box.
     * @param {string} text What the reader typed or pasted.
     * @return {{bytes: (Array<number>|undefined), error: (string|undefined),
     *     params: (Object|undefined)}} The bytes, or the l10n id of what
     *     is wrong with the text and the values that message needs.
     */
    static parseBytes(text) {
        // Splits on any run of whitespace or commas, so a block pasted
        // out of the documentation arrives intact whatever it is
        // separated by.
        var tokens = text.trim().split(/[\s,]+/);
        var bytes = [];
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (!/^[0-9a-fA-F]+$/.test(token)) {
                return {error: 'load-data-bad', params: {text: token}};
            }
            if (token.length > 2 && token.length % 2) {
                return {error: 'load-data-odd', params: {text: token}};
            }
            // A longer run of hex digits is several bytes running
            // together. A one line input box drops the newlines out of
            // a paste, so "3e 8c\nd3 ff" arrives as "3e 8cd3 ff".
            for (let j = 0; j < token.length; j += 2) {
                bytes.push(parseInt(token.substr(j, 2), 16));
            }
        }
        return {bytes: bytes};
    }

    /**
     * What each register holds after power-on, which a link leaves out.
     * The 8080 always reads bit 1 of the flags as set, hence F's 02H.
     * @param {string} name A register in REGS8 or REGS16.
     * @return {number} Its value on a machine just switched on.
     */
    static regDefault(name) {
        return name == 'f' ? 0x02 : 0;
    }

    /**
     * The memory a link installs when it does not say: the least that
     * holds what is in use.
     * @param {number} used Bytes in use, as usedLength() counts them.
     * @param {Array<number>} memSizes The sizes on offer, smallest first.
     * @return {number|undefined} One of memSizes, or nothing if none is
     *     big enough.
     */
    static fittingMemSize(used, memSizes) {
        return memSizes.find(function(size) {
            return size >= used;
        });
    }

    /**
     * How much of a memory image is not the zeros at its top. Loading
     * zeroes memory first, so those say nothing.
     * @param {Array<number>} bytes The image.
     * @return {number} The length without them.
     */
    static usedLength(bytes) {
        var end = bytes.length;
        while (end > 0 && !bytes[end - 1]) {
            end--;
        }
        return end;
    }

    /**
     * Writes a machine as the query string of a link.
     *
     * Every field is plain hex under its own name, so a link can be
     * written by hand as well as copied: ?hex=3E8CD3FF76 is a whole
     * program. The memory is written without the zeros at its top,
     * which on most programs is most of it, and so is anything else a
     * machine just switched on would have anyway: the memory size the
     * program needs no more than, and registers at their power-on
     * values.
     * @param {{memSize: number, bytes: Array<number>, cpu: ?Object<string,
     *     number>, switches: number}} state The machine. Without cpu,
     *     only the memory is written, and the switches are left out with
     *     the registers.
     * @param {Array<number>} memSizes The sizes on offer, smallest first.
     * @param {string=} zip The memory already compressed, to write in
     *     place of the hex.
     * @return {string} The query string, without its '?'.
     */
    static stateToQuery(state, memSizes, zip) {
        var fields = [];
        var used = Link.usedLength(state.bytes);
        if (state.memSize != Link.fittingMemSize(used, memSizes)) {
            fields.push('mem=' + state.memSize);
        }
        if (zip !== undefined) {
            fields.push('zip=' + zip);
        } else {
            let hex = '';
            for (let i = 0; i < used; i++) {
                hex += Link.toHex(state.bytes[i], 2);
            }
            fields.push('hex=' + hex);
        }
        if (!state.cpu) {
            return fields.join('&');
        }
        Link.REGS16.concat(Link.REGS8).forEach(function(name) {
            let value = state.cpu[name];
            if (value != Link.regDefault(name)) {
                let digits = Link.REGS16.indexOf(name) >= 0 ? 4 : 2;
                fields.push(name + '=' + Link.toHex(value, digits));
            }
        });
        if (state.switches) {
            fields.push('sw=' + Link.toHex(state.switches, 4));
        }
        return fields.join('&');
    }

    /**
     * Reads a machine out of a link's query string - the reverse of
     * stateToQuery(), but forgiving of a link written by hand. Only hex
     * is needed; the bytes may be separated by spaces or commas, and
     * without mem= the smallest memory the program fits in is installed.
     * @param {string} query The query string, with or without its '?'.
     * @param {Array<number>} memSizes The sizes on offer, smallest first.
     * @param {Array<number>=} unzipped The memory from the link's zip=
     *     field, already decompressed, to take in place of hex=.
     * @return {?{memSize: number, bytes: Array<number>, cpu: Object<string,
     *     number>, switches: number, error: (string|undefined),
     *     params: (Object|undefined)}} The machine, or the l10n id of
     *     what is wrong with the link, or null if the link carries no
     *     machine. Sizes in an error's params are in bytes.
     */
    static queryToState(query, memSizes, unzipped) {
        var params = new URLSearchParams(query);
        var cpu = {};
        var regs = Link.REGS16.concat(Link.REGS8);
        for (let i = 0; i < regs.length; i++) {
            let name = regs[i];
            let text = params.get(name);
            if (text === null) {
                continue;
            }
            let max = Link.REGS16.indexOf(name) >= 0 ? 0xffff : 0xff;
            let value = parseInt(text, 16);
            if (!/^[0-9a-fA-F]+$/.test(text.trim()) || value > max) {
                return {error: 'link-bad-reg',
                        params: {name: name.toUpperCase(), text: text}};
            }
            cpu[name] = value;
        }
        var hex = params.get('hex');
        if (hex === null && !unzipped && !Object.keys(cpu).length) {
            return null;
        }
        var bytes = [];
        if (unzipped) {
            bytes = unzipped;
        } else if (hex && hex.trim()) {
            let parsed = Link.parseBytes(hex);
            if (parsed.error) {
                return parsed;
            }
            bytes = parsed.bytes;
        }
        // A hand-written table padded one byte past 256 still fits in 256.
        var used = Link.usedLength(bytes);
        var memSize = null;
        var memText = params.get('mem');
        if (memText !== null) {
            memSize = parseInt(memText, 10);
            if (memSizes.indexOf(memSize) < 0) {
                return {error: 'link-bad-mem', params: {text: memText}};
            }
        } else {
            memSize = Link.fittingMemSize(used, memSizes);
        }
        if (!memSize || used > memSize) {
            return {error: 'load-data-too-long',
                    params: {bytes: used,
                             size: memSize || memSizes[memSizes.length - 1]}};
        }
        bytes = bytes.slice(0, memSize);
        var switches = 0;
        var swText = params.get('sw');
        if (swText !== null) {
            switches = parseInt(swText, 16);
            if (!/^[0-9a-fA-F]+$/.test(swText.trim()) || switches > 0xffff) {
                return {error: 'link-bad-reg',
                        params: {name: 'SW', text: swText}};
            }
        }
        return {memSize: memSize, bytes: bytes, cpu: cpu, switches: switches};
    }

    /**
     * Compresses or decompresses bytes with the browser's own deflate.
     * Output past Link.MAX_BYTES is refused rather than collected, so a
     * link cannot make the page inflate something enormous.
     * @param {Array<number>|Uint8Array} bytes The input.
     * @param {boolean} inflate True to decompress.
     * @return {!Promise<!Uint8Array>} The output.
     */
    static deflate(bytes, inflate) {
        var stream = new Blob([Uint8Array.from(bytes)]).stream().pipeThrough(
            inflate ? new DecompressionStream('deflate') :
                new CompressionStream('deflate'));
        var reader = stream.getReader();
        var chunks = [];
        var total = 0;
        var pump = function() {
            return reader.read().then(function(result) {
                if (result.done) {
                    let out = new Uint8Array(total);
                    let at = 0;
                    chunks.forEach(function(chunk) {
                        out.set(chunk, at);
                        at += chunk.length;
                    });
                    return out;
                }
                total += result.value.length;
                if (total > Link.MAX_BYTES) {
                    reader.cancel();
                    throw new Error('too large');
                }
                chunks.push(result.value);
                return pump();
            });
        };
        return pump();
    }

    /**
     * Base64 in the form that goes into a URL as it is: - and _ for +
     * and /, and no = padding.
     * @param {Uint8Array} bytes The bytes.
     * @return {string} The text.
     */
    static toBase64Url(bytes) {
        var text = '';
        for (let i = 0; i < bytes.length; i++) {
            text += String.fromCharCode(bytes[i]);
        }
        return btoa(text).replace(/\+/g, '-').replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    /**
     * The reverse of toBase64Url(). Plain base64 is read too.
     * @param {string} text The text.
     * @return {Uint8Array} The bytes. Throws if the text is not base64.
     */
    static fromBase64Url(text) {
        var binary = atob(text.trim().replace(/-/g, '+').replace(/_/g, '/'));
        var bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Writes a machine as the query string of a link, the way Copy Link
     * does: as hex when the memory in use fits in Link.HEX_LIMIT, and
     * otherwise deflated and in base64, under zip= instead of hex=.
     * 4K BASIC is some 8,000 hex digits, and a link much past that is
     * refused by some servers and cut short by some of the places links
     * get pasted.
     * @param {Object} state The machine, as stateToQuery() takes it.
     * @param {Array<number>} memSizes The sizes on offer, smallest first.
     * @return {!Promise<string>} The query string, without its '?'.
     */
    static stateToLink(state, memSizes) {
        var used = Link.usedLength(state.bytes);
        if (used <= Link.HEX_LIMIT) {
            return Promise.resolve(Link.stateToQuery(state, memSizes));
        }
        return Link.deflate(state.bytes.slice(0, used), false).then(
            function(zipped) {
                return Link.stateToQuery(state, memSizes,
                                         Link.toBase64Url(zipped));
            });
    }

    /**
     * Reads a machine out of a link, compressed or not. See
     * queryToState() for what it returns.
     * @param {string} query The query string or fragment, with or
     *     without its '?' or '#'.
     * @param {Array<number>} memSizes The sizes on offer, smallest first.
     * @return {!Promise<?Object>} The machine, an error, or null.
     */
    static linkToState(query, memSizes) {
        query = query.replace(/^#/, '');
        var zip = new URLSearchParams(query).get('zip');
        if (zip === null) {
            return Promise.resolve(Link.queryToState(query, memSizes));
        }
        var zipped;
        try {
            zipped = Link.fromBase64Url(zip);
        } catch (e) {
            return Promise.resolve({error: 'link-bad-zip', params: {}});
        }
        return Link.deflate(zipped, true).then(function(bytes) {
            return Link.queryToState(query, memSizes, Array.from(bytes));
        }, function() {
            return {error: 'link-bad-zip', params: {}};
        });
    }

    /**
     * Formats a number as fixed length, upper case hex. The same as
     * Sim8800.toHex(), kept here so that the format depends on nothing
     * outside this file.
     * @param {number} n The number.
     * @param {number} len The number of digits, with leading zeros.
     * @return {string} The hex.
     */
    static toHex(n, len) {
        return n.toString(16).toUpperCase().padStart(len, '0').slice(-len);
    }
}

/**
 * The 8-bit registers a link can carry, by the names CPU8080.set()
 * knows them by. PC and SP are the two 16-bit ones.
 * @type {Array<string>}
 */
Link.REGS8 = ['a', 'b', 'c', 'd', 'e', 'f', 'h', 'l'];

/**
 * The 16-bit registers a link can carry. See REGS8.
 * @type {Array<string>}
 */
Link.REGS16 = ['pc', 'sp'];

/**
 * The most memory a copied link writes out as hex. A program this size
 * is one a class writes by hand, and its bytes should be there to read
 * in the link. Past it, the memory is compressed (see stateToLink).
 * @type {number}
 */
Link.HEX_LIMIT = 256;

/**
 * The most a compressed link may inflate to: the 8080's whole address
 * space.
 * @type {number}
 */
Link.MAX_BYTES = 65536;

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Link;
}
