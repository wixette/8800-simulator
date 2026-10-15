/**
 * Reads the example programs in examples/ so that tests run the same
 * bytes the page does.
 *
 * An example is 8080 source: a header of ';;;' lines carrying its name,
 * its description and the device it speaks through, then the program.
 * The page's two ways in - the Load menu, which assembles it out of
 * sight, and the Assembler's Examples menu, which shows its source -
 * read these same files, so the tests assemble them the same way.
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import {Asm8080} from '../js/asm8080.js';

const EXAMPLES_DIR = path.join(import.meta.dirname, '..', 'examples');

/**
 * Reads one example.
 * @param {string} text The file contents.
 * @param {string} id The example's file name without its extension.
 * @return {Object} {id, name, desc, device, org, bytes, hex, text}.
 */
function parseExample(text, id) {
    const meta = {};
    for (const m of text.matchAll(/^;;;\s*(name|desc|device):\s*(.*)$/gm)) {
        meta[m[1]] = m[2].trim();
    }
    if (!meta.name) {
        throw new Error(id + ': the source has no ";;; name:" header');
    }
    const result = Asm8080.assemble(text, {memSize: 256});
    if (!result.ok) {
        throw new Error(id + ': does not assemble: ' +
                        JSON.stringify(result.errors));
    }
    const bytes = [];
    for (let a = result.start; a <= result.end; a++) {
        bytes.push(result.memory.has(a) ? result.memory.get(a) : 0);
    }
    return {
        id: id,
        name: meta.name,
        desc: meta.desc || '',
        device: meta.device || '',
        org: result.start,
        bytes: bytes,
        hex: bytes.map((b) => b.toString(16).padStart(2, '0')).join(' '),
        text: text,
    };
}

/** Reads every example, sorted by file name. */
function loadExamples() {
    return fs.readdirSync(EXAMPLES_DIR)
        .filter((f) => f.endsWith('.asm'))
        .sort()
        .map((f) => parseExample(
            fs.readFileSync(path.join(EXAMPLES_DIR, f), 'utf8'),
            path.basename(f, '.asm')));
}

/** Reads one example by its file name without the extension. */
function loadExample(id) {
    const example = loadExamples().find((e) => e.id === id);
    if (!example) {
        throw new Error('no example named ' + id);
    }
    return example;
}

export {
    EXAMPLES_DIR,
    loadExamples,
    loadExample,
};
