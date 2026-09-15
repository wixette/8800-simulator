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
 * @fileoverview Reads the example program listings in examples/.
 */


/**
 * Pulls a program out of one of the listings in examples/.
 *
 * The listings are the only copy of these programs - there is no
 * assembled binary beside them to drift out of step - so the page
 * reads the same file the documentation shows and the tests check.
 * A line of a listing is an address, the bytes at it, an optional
 * label, and the source; anything else is a comment.
 */
class Listing {
    /**
     * @param {string} text The contents of a .asm listing.
     * @return {{name: string, bytes: Array<number>}} Its title, and the
     *     program itself.
     */
    static parse(text) {
        var name = '';
        var bytes = [];
        var lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let raw = lines[i];
            let header = raw.match(/^;;;\s*name:\s*(.*)$/);
            if (header) {
                name = header[1].trim();
                continue;
            }
            let line = raw.replace(/^\s+/, '');
            if (!line || line.charAt(0) == ';') {
                continue;
            }
            let m = line.match(
                /^[0-9a-f]{4}\s+((?:[0-9a-f]{2}\s+)*[0-9a-f]{2})\s+\S/);
            if (!m) {
                continue;
            }
            let parts = m[1].trim().split(/\s+/);
            for (let j = 0; j < parts.length; j++) {
                bytes.push(parseInt(parts[j], 16));
            }
        }
        return {name: name, bytes: bytes};
    }
};

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Listing;
}
