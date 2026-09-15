/**
 * The parts of the front panel page (js/panel.js) that are plain logic
 * rather than drawing.
 *
 * panel.js is written for the browser and most of it reaches for the
 * document, so it is loaded here into a sandbox and only the functions
 * that touch nothing else are exercised.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

/**
 * Runs one of the page's scripts here rather than in a context of its
 * own, so the arrays it builds are the same kind of array the
 * assertions below compare against. The scripts declare their
 * namespace as a bare global, which is how the page gets at them too.
 * @param {string} name The file in js/.
 * @return {Object} That file's namespace.
 */
function loadScript(name) {
    const source = fs.readFileSync(
        path.join(__dirname, '..', 'js', name + '.js'), 'utf8');
    vm.runInThisContext(source, {filename: name + '.js'});
    return globalThis[name];
}

const panel = loadScript('panel');

test('a plain list of bytes reads as itself', () => {
    assert.deepStrictEqual(panel.parseBytes('3e 8c d3 ff 76').bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
});

test('one hex digit is a byte, and case does not matter', () => {
    assert.deepStrictEqual(panel.parseBytes('0 F a 3E').bytes,
                           [0x00, 0x0f, 0x0a, 0x3e]);
});

test('commas, tabs and runs of spaces all separate bytes', () => {
    assert.deepStrictEqual(panel.parseBytes('3e,8c,\td3   ff').bytes,
                           [0x3e, 0x8c, 0xd3, 0xff]);
});

test('leading and trailing space is not a byte', () => {
    assert.deepStrictEqual(panel.parseBytes('   76  ').bytes, [0x76]);
});

test('a pasted listing whose newlines the input box dropped still loads', () => {
    // A one line <input> strips newlines out of a paste, so the two
    // bytes either side of a line break arrive stuck together. Reading
    // a run of hex digits as consecutive bytes is what makes copying a
    // program out of the documentation work.
    const pasted = ['3e 8c', 'd3 ff', '76'].join('\n');
    const throughTheBox = pasted.replace(/\n/g, '');
    assert.strictEqual(throughTheBox, '3e 8cd3 ff76');
    assert.deepStrictEqual(panel.parseBytes(throughTheBox).bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
    assert.deepStrictEqual(panel.parseBytes(pasted).bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
});

test('a run of hex digits is read two at a time', () => {
    assert.deepStrictEqual(panel.parseBytes('3e8cd3ff76').bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
});

test('something that is not hex is reported, not silently zeroed', () => {
    const parsed = panel.parseBytes('3e hello d3');
    assert.strictEqual(parsed.error, 'load-data-bad');
    assert.strictEqual(parsed.params.text, 'hello');
    assert.strictEqual(parsed.bytes, undefined);
});

test('the reported token is the one that is wrong', () => {
    assert.strictEqual(panel.parseBytes('3e 8c zz').params.text, 'zz');
    assert.strictEqual(panel.parseBytes('0x3e').params.text, '0x3e');
});

test('a run of hex digits that is not whole bytes is reported', () => {
    const parsed = panel.parseBytes('3e 8cd3f');
    assert.strictEqual(parsed.error, 'load-data-odd');
    assert.strictEqual(parsed.params.text, '8cd3f');
});

test('every message the parser can ask for exists in every locale', () => {
    const messages = loadScript('l10n').MESSAGES;
    const ids = ['load-data-bad', 'load-data-odd', 'load-data-empty',
                 'load-data-off', 'load-data-too-long', 'load-data-loaded'];
    const locales = Object.keys(messages[ids[0]]);
    assert.ok(locales.length >= 9, 'expected every locale');
    for (const id of ids) {
        assert.ok(messages[id], id + ' has no message at all');
        for (const locale of locales) {
            assert.ok(messages[id][locale], id + ' is missing ' + locale);
        }
    }
});
