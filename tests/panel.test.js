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

/** Every message id, with the locales it is translated into. */
function messages() {
    return loadScript('l10n').MESSAGES;
}

/** The locales the app claims to support. */
function locales() {
    return Object.values(loadScript('l10n').LOCALES);
}

/** The source of one of the page's scripts, or of index.html. */
function sourceOf(file) {
    return fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
}

test('every message is translated into every locale', () => {
    const all = messages();
    const expected = locales();
    assert.ok(expected.length >= 9, 'expected nine locales');
    for (const id of Object.keys(all)) {
        const got = Object.keys(all[id]);
        assert.deepStrictEqual([...got].sort(), [...expected].sort(),
                               id + ' is not translated everywhere');
    }
});

test('every label the page marks for translation has a message', () => {
    const html = sourceOf('index.html');
    // <div id="x" class="... l10n ...">, in either attribute order.
    const tags = html.match(/<[^>]*\bclass="[^"]*\bl10n\b[^"]*"[^>]*>/g) || [];
    assert.ok(tags.length > 20, 'expected the page to be full of these');
    const all = messages();
    for (const tag of tags) {
        const id = tag.match(/\bid="([^"]+)"/);
        assert.ok(id, 'an l10n element with no id: ' + tag);
        assert.ok(all[id[1]], id[1] + ' is marked l10n but has no message');
    }
});

test('every message the panel asks for by name exists', () => {
    // Catches a message renamed or retired out from under its caller,
    // which shows up in the app as a control that says nothing at all.
    const panelSource = sourceOf('js/panel.js');
    const asked = new Set();
    for (const m of panelSource.matchAll(/setStatus\(\s*'([^']+)'/g)) {
        asked.add(m[1]);
    }
    for (const m of panelSource.matchAll(/getMessage\(\s*'([^']+)'/g)) {
        asked.add(m[1]);
    }
    // The reasons a control gives for being unavailable.
    for (const m of panelSource.matchAll(/\{id:\s*'([^']+)',\s*params:/g)) {
        asked.add(m[1]);
    }
    assert.ok(asked.size > 15, 'expected to find plenty of these');
    const all = messages();
    for (const id of asked) {
        assert.ok(all[id], 'panel.js asks for "' + id + '", which does not exist');
    }
});

test('every Debugger control that can be unavailable can say why', () => {
    // The greying out and the explanation come from one function, so
    // a control cannot be greyed with nothing to say for itself.
    const source = sourceOf('js/panel.js');
    const body = source.slice(
        source.indexOf('panel.debugControlReasons = function'),
        source.indexOf('panel.reportIfUnavailable = function'));
    const controls = [...body.matchAll(/reasons\['([^']+)'\]/g)].map((m) => m[1]);
    assert.ok(controls.length >= 7, 'expected every control listed');
    const html = sourceOf('index.html');
    for (const id of new Set(controls)) {
        assert.ok(html.includes('id="' + id + '"'),
                  id + ' is given a reason but is not on the page');
    }
    const all = messages();
    for (const m of body.matchAll(/\{id:\s*'([^']+)'/g)) {
        assert.ok(all[m[1]], m[1] + ' is a reason with no message');
    }
});
