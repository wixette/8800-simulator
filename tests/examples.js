/**
 * Reads the example programs in examples/ so that tests run the same
 * bytes the documentation shows.
 *
 * An example is a listing: a header of ';;;' comment lines carrying its
 * name and description, then one line per instruction holding the
 * address, the bytes, an optional label and the source. The bytes in
 * that listing are the program; nothing else stores a copy of them.
 *
 * A line whose source is a DB directive is data rather than code, and
 * is not checked against the disassembler.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

/** addr, bytes, optional 'LABEL:', then the source and any comment. */
const LISTING_LINE =
      /^([0-9a-f]{4})\s+((?:[0-9a-f]{2}\s+)*[0-9a-f]{2})\s+(?:([A-Za-z_][\w]*):\s*)?(\S.*?)\s*$/;

/**
 * Parses one listing.
 * @param {string} text The file contents.
 * @param {string} id The example's file name without its extension.
 * @return {Object} The parsed example.
 */
function parseListing(text, id) {
    const meta = {};
    const lines = [];
    const labels = {};
    for (const raw of text.split('\n')) {
        const header = raw.match(/^;;;\s*(name|desc):\s*(.*)$/);
        if (header) {
            meta[header[1]] = header[2].trim();
            continue;
        }
        if (raw.startsWith(';;;') || !raw.trim()) {
            continue;
        }
        const line = raw.replace(/^\s+/, '');
        if (line.startsWith(';')) {
            continue;  // A comment lined up with the source column.
        }
        const m = line.match(LISTING_LINE);
        if (!m) {
            throw new Error(id + ': cannot parse listing line: ' + raw);
        }
        const [, addr, bytes, label, source] = m;
        if (label) {
            labels[label.toUpperCase()] = parseInt(addr, 16);
        }
        const code = source.replace(/\s*;.*$/, '').trim();
        lines.push({
            address: parseInt(addr, 16),
            bytes: bytes.trim().split(/\s+/).map((b) => parseInt(b, 16)),
            source: code,
            // A DB line is data - a message, a table - so there is
            // nothing for the disassembler to check it against.
            isData: /^DB\b/i.test(code),
        });
    }
    if (!meta.name) {
        throw new Error(id + ': the listing has no ";;; name:" header');
    }
    const bytes = [];
    for (const line of lines) {
        bytes.push(...line.bytes);
    }
    return {
        id: id,
        name: meta.name,
        desc: meta.desc || '',
        org: lines.length ? lines[0].address : 0,
        lines: lines,
        labels: labels,
        bytes: bytes,
        hex: bytes.map((b) => b.toString(16).padStart(2, '0')).join(' '),
    };
}

/** Reads every example, sorted by file name. */
function loadExamples() {
    return fs.readdirSync(EXAMPLES_DIR)
        .filter((f) => f.endsWith('.asm'))
        .sort()
        .map((f) => parseListing(
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

/**
 * Reduces a line of 8080 source to a form that can be compared against
 * the disassembler's, which writes its own dialect: '$80' where the
 * listing writes '080H', four hex digits where the listing writes a
 * label, and a stray space after some commas.
 * @param {string} source The source text.
 * @param {Object} labels Label name to address, for jump targets.
 * @return {string} The normalized text.
 */
function normalizeSource(source, labels = {}) {
    return source
        .toUpperCase()
        .replace(/\b([A-Z_][\w]*)\b/g, (word) =>
            Object.prototype.hasOwnProperty.call(labels, word) ?
                String(labels[word]) : word)
        .replace(/\$([0-9A-F]+)/g, (_, h) => String(parseInt(h, 16)))
        .replace(/\b0*([0-9A-F]+)H\b/g, (_, h) => String(parseInt(h, 16)))
        .replace(/\b(\d+)\b/g, (_, d) => String(parseInt(d, 10)))
        .replace(/\s+/g, '');
}

module.exports = {
    EXAMPLES_DIR: EXAMPLES_DIR,
    loadExamples: loadExamples,
    loadExample: loadExample,
    normalizeSource: normalizeSource,
};
