/**
 * The listing reader the page uses to offer the example programs
 * (js/listing.js), and the list of examples the page offers.
 *
 * The page reads the same .asm files the documentation shows, so there
 * is no assembled copy of a program anywhere to drift out of step.
 * These tests hold that together: the page's reader must agree with
 * the one the rest of the suite uses, and the list of programs it
 * offers must match what is actually in examples/.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const Listing = require('../js/listing.js');
const {EXAMPLES_DIR, loadExamples} = require('./examples.js');

/** The example ids js/panel.js offers, read out of the source. */
function offeredExamples() {
    const panel = fs.readFileSync(
        path.join(__dirname, '..', 'js', 'panel.js'), 'utf8');
    const block = panel.match(/panel\.EXAMPLES = \[([^\]]*)\]/);
    assert.ok(block, 'panel.js should declare panel.EXAMPLES');
    return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

test('the page reader agrees with the test reader on every example', () => {
    for (const example of loadExamples()) {
        const text = fs.readFileSync(
            path.join(EXAMPLES_DIR, example.id + '.asm'), 'utf8');
        const parsed = Listing.parse(text);
        assert.deepStrictEqual(parsed.bytes, example.bytes,
                               example.id + ': bytes differ');
        assert.strictEqual(parsed.name, example.name,
                           example.id + ': name differs');
    }
});

test('the page offers every example, and only real ones', () => {
    const offered = offeredExamples();
    const onDisk = loadExamples().map((e) => e.id);
    assert.deepStrictEqual([...offered].sort(), [...onDisk].sort(),
                           'panel.EXAMPLES and examples/*.asm must match');
});

test('every offered example has a name and fits the smallest machine', () => {
    for (const example of loadExamples()) {
        assert.ok(example.name.length > 0,
                  example.id + ' needs a ";;; name:" header for its button');
        // The buttons load straight onto whatever is installed, and the
        // machine starts with 256 bytes.
        assert.ok(example.bytes.length <= 256,
                  example.id + ' is ' + example.bytes.length +
                      ' bytes, too big for the default machine');
    }
});

test('the reader ignores comments and takes only listing lines', () => {
    const parsed = Listing.parse([
        ';;; name: Something',
        ';;; desc: ignored',
        '',
        '0000  3e 01      MVI A,001H       ; a trailing comment',
        '        ; a comment lined up with the source column',
        '0002  d3 ff      OUT 0FFH',
        '0004  76         HLT',
    ].join('\n'));
    assert.strictEqual(parsed.name, 'Something');
    assert.deepStrictEqual(parsed.bytes, [0x3e, 0x01, 0xd3, 0xff, 0x76]);
});

test('the reader returns nothing useful for a file that is not a listing', () => {
    const parsed = Listing.parse('<!doctype html>\n<p>not a program</p>\n');
    assert.strictEqual(parsed.bytes.length, 0);
});
