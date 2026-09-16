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

/**
 * The text of every button in one tab of index.html.
 * @param {string} tabId The tab's element id.
 * @return {Array<{id: string, text: string, translated: boolean}>}
 */
function buttonsIn(tabId) {
    const html = sourceOf('index.html');
    const start = html.indexOf('id="' + tabId + '"');
    assert.ok(start > 0, tabId + ' is not in the page');
    // Up to whichever tab is declared next.
    const rest = ['tab-sim', 'tab-tty', 'tab-debug', 'tab-ref']
          .map((id) => html.indexOf('id="' + id + '"'))
          .filter((at) => at > start);
    const end = rest.length ? Math.min(...rest) : html.length;
    const chunk = html.slice(start, end);
    const found = [];
    const button =
          /<div id="([^"]+)" class="([^"]*\bbutton\b[^"]*)"[^>]*>([^<]*)<\/div>/g;
    for (const m of chunk.matchAll(button)) {
        const text = m[3].trim();
        if (!text || text.startsWith('&#')) {
            continue;  // A glyph, with no case to have.
        }
        found.push({id: m[1], text: text,
                    translated: m[2].split(/\s+/).includes('l10n')});
    }
    return found;
}

test('the Simulator tab wears the panel silkscreen: caps, untranslated', () => {
    // These stand for switches that exist on the metal. A photograph of
    // the real panel does not change language, so neither do they.
    const buttons = buttonsIn('tab-sim');
    assert.ok(buttons.length >= 25, 'expected the whole switch board');
    for (const b of buttons) {
        assert.strictEqual(b.text, b.text.toUpperCase(),
                           b.id + ' is a panel legend and must be uppercase');
        assert.strictEqual(b.translated, false,
                           b.id + ' is a panel legend and must not translate');
    }
});

test('the Teletype tab speaks in capitals, because the ASR-33 had no others', () => {
    // 64 characters, capitals only. The paper above these buttons
    // cannot hold a lowercase letter, so neither do they. Unlike the
    // panel legends they are translated: "CLEAR PAPER" tells you what
    // will happen rather than naming a part of the machine.
    const buttons = buttonsIn('tab-tty');
    assert.ok(buttons.length >= 4, 'expected the teletype helper row');
    const all = messages();
    for (const b of buttons) {
        assert.strictEqual(b.text, b.text.toUpperCase(),
                           b.id + ' sits under uppercase paper');
        assert.strictEqual(b.translated, true, b.id + ' should translate');
        assert.strictEqual(all[b.id]['en'], all[b.id]['en'].toUpperCase(),
                           b.id + ': the English message must be uppercase too');
    }
});

test('the Debugger tab reads as software, not as a machine', () => {
    // Tooling the Altair never had, so it follows software convention:
    // Title Case, like the headings it sits under. Shouting here would
    // borrow the machine's voice for something that is not the machine.
    const buttons = buttonsIn('tab-debug');
    assert.ok(buttons.length >= 7, 'expected the loaders and dump controls');
    const all = messages();
    for (const b of buttons) {
        assert.strictEqual(b.translated, true, b.id + ' should translate');
        const english = all[b.id]['en'];
        // "4 KB", "Load 4K BASIC" and "Follow PC" keep their initialisms,
        // so the test is that the label is not uppercase throughout.
        const letters = english.replace(/[^A-Za-z]/g, '');
        assert.notStrictEqual(
            letters, letters.toUpperCase(),
            b.id + ' ("' + english + '") shouts like a panel legend');
    }
});

test('every shape of control the page can grey out is actually styled', () => {
    // The controls are mostly .button divs, but the example menu is a
    // real <button> inside a .dropdown. It carried the disabled class
    // and looked completely available, because the rule named only
    // .button. Nothing else in the suite can see a computed style, so
    // this checks the selectors themselves.
    const css = sourceOf('css/style.css');
    const rule = css.match(/([^}]*)\{[^}]*\}/g)
          .find((block) => /\.disabled[^{]*\{/.test(block));
    assert.ok(rule, 'style.css should have a rule for .disabled');
    const selectors = rule.split('{')[0];
    assert.match(selectors, /\.button\.disabled/,
                 'the .button controls must grey out');
    assert.match(selectors, /\.dropdown\s*>?\s*button\.disabled/,
                 'the example menu button must grey out too');
});

test('the beep belongs to the OFF/ON switch, not to every power-up', () => {
    // D23: a load that finds the machine off switches it on, and used
    // to beep for it, so loading two programs in a row chirped once
    // and stayed silent once for reasons invisible from the Debugger
    // tab. The sound now answers the switch and nothing else.
    assert.doesNotMatch(panel.onPowerOn.toString(), /playBeepbeep/,
                        'powering up is silent by itself');
    assert.match(panel.onToggle.toString(), /playBeepbeep/,
                 'the OFF/ON switch is what beeps');
});

test('switching the machine on for a load is reported, doing nothing is not', () => {
    const realPowerOn = panel.onPowerOn;
    let powerUps = 0;
    panel.onPowerOn = function() {
        powerUps++;
        panel.isPoweredOn = true;
    };
    try {
        panel.isPoweredOn = false;
        assert.strictEqual(panel.ensurePoweredOn(), true,
                           'it had to switch the machine on');
        assert.strictEqual(panel.ensurePoweredOn(), false,
                           'the second load found it on already');
        assert.strictEqual(powerUps, 1);
    } finally {
        panel.onPowerOn = realPowerOn;
        panel.isPoweredOn = false;
    }
});

test('every way of loading tells the status line whether it did that', () => {
    // All four ways in power the machine up (D20) and all four have to
    // own up to it (D23), or the note is back to appearing for reasons
    // the student cannot see. These functions want a document, so this
    // reads them rather than running them.
    const ways = ['buildExampleMenu', 'onLoadBasic', 'onBinaryFileChosen',
                  'debugLoadData'];
    for (const name of ways) {
        assert.match(panel[name].toString(), /poweredOn/,
                     name + ' loads without saying if it switched the '
                     + 'machine on');
    }
});

test('a machine that is off receives nothing from the teletype keyboard', () => {
    // D24: the board that holds a character for the CPU to read is
    // unpowered, so keys typed at a dead machine are gone, not saved
    // up to arrive at whatever runs next.
    const realSio = panel.sio;
    const realStatus = panel.setStatus;
    const received = [];
    let said = null;
    panel.sio = {receive: (byte) => received.push(byte)};
    panel.setStatus = (id) => { said = id; };
    try {
        panel.isPoweredOn = false;
        panel.ttySend(0x44);
        assert.deepStrictEqual(received, [], 'nothing reached the board');
        assert.strictEqual(said, 'tty-off', 'and the line says why');
        panel.isPoweredOn = true;
        panel.ttySend(0x44);
        assert.deepStrictEqual(received, [0x44], 'a live board takes it');
    } finally {
        panel.sio = realSio;
        panel.setStatus = realStatus;
        panel.isPoweredOn = false;
    }
});

test('both of the paper mechanisms can be driven by hand', () => {
    // An ASR-33 returns the carriage and advances the paper with two
    // separate keys (D25). RETURN is on every keyboard; LINE FEED is
    // not, which is what the helper row is for.
    const Teletype = require('../js/teletype.js');
    assert.strictEqual(Teletype.keyToByte('Enter'), Teletype.CR,
                       'RETURN sends CR and nothing else');
    assert.match(sourceOf('index.html'), /id="tty-linefeed"/,
                 'the helper row needs a LINE FEED key');
    assert.match(panel.initTeletypeUi.toString(), /ttySend\(Teletype\.LF\)/,
                 'which sends LF to the machine, like any other key');
});
