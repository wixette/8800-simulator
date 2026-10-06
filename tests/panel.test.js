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
    assert.ok(expected.length >= 10, 'expected ten locales');
    for (const id of Object.keys(all)) {
        const got = Object.keys(all[id]);
        assert.deepStrictEqual([...got].sort(), [...expected].sort(),
                               id + ' is not translated everywhere');
    }
});

test('every translation keeps the placeholders of the English', () => {
    // {name}, {bytes} and the rest are filled in by panel.setStatus. A
    // translation that drops or misspells one shows the reader a raw
    // brace, or leaves out the very number the message is about.
    const all = messages();
    const holes = (text) => (text.match(/\{[a-z]+\}/g) || []).sort();
    let checked = 0;
    for (const id of Object.keys(all)) {
        const english = holes(all[id]['en']);
        for (const locale of locales()) {
            assert.deepStrictEqual(holes(all[id][locale]), english,
                                   id + ' in ' + locale + ' has other placeholders');
            checked += english.length;
        }
    }
    assert.ok(checked > 100, 'expected plenty of placeholders: ' + checked);
});

test('every locale names itself in the menu and on the button', () => {
    const l10n = loadScript('l10n');
    for (const locale of locales()) {
        assert.ok(l10n.LOCALE_NAMES[locale], locale + ' has no name in the menu');
        assert.ok(l10n.LOCALE_SHORT[locale], locale + ' has no short label');
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
    // What goes wrong with a link or with typed hex comes back from
    // js/link.js as an id, for the panel to put on the status line.
    for (const m of sourceOf('js/link.js').matchAll(/error:\s*'([^']+)'/g)) {
        asked.add(m[1]);
    }
    for (const m of panelSource.matchAll(/setStatus\(\s*'([^']+)'/g)) {
        asked.add(m[1]);
    }
    // A whole id, not the front of one being built with +.
    for (const m of panelSource.matchAll(/(?:getMessage|msg)\(\s*'([^']+)'\s*\)/g)) {
        asked.add(m[1]);
    }
    // Ids kept in tables rather than written at a call.
    Object.values(panel.SHORT_REASONS).forEach((id) => asked.add(id));
    Object.values(panel.TOOLTIPS).forEach((id) => asked.add(id));
    Object.values(panel.LIST_LABELS).forEach((id) => asked.add(id));
    for (const size of panel.MEM_SIZES) {
        asked.add('mem-size-' + size);
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
        // An item of the Load menu is built as the menu opens.
        assert.ok(html.includes('id="' + id + '"') ||
                  panel.MENU_CONTROLS.includes(id),
                  id + ' is given a reason but is not on the page');
    }
    const all = messages();
    for (const m of body.matchAll(/\{id:\s*'([^']+)'/g)) {
        assert.ok(all[m[1]], m[1] + ' is a reason with no message');
    }
});

/**
 * The regions of index.html, in the order the page declares them: the
 * toolbar and its menus, the stage with the front panel, the dock, its
 * three tools, and the status line.
 * @type {Array<string>}
 */
const REGIONS = ['toolbar', 'stage', 'dock', 'tab-tty', 'tab-asm',
                 'tab-debug', 'tab-ref', 'tab-links', 'status-bar',
                 'hex-dialog', 'asm-replace-dialog', 'share-dialog',
                 'about-dialog'];

/**
 * The part of index.html one region takes up.
 * @param {string} regionId One of REGIONS.
 * @return {string} Its markup.
 */
function regionOf(regionId) {
    const html = sourceOf('index.html');
    const start = html.indexOf('id="' + regionId + '"');
    assert.ok(start > 0, regionId + ' is not in the page');
    const rest = REGIONS
          .map((id) => html.indexOf('id="' + id + '"'))
          .filter((at) => at > start);
    return html.slice(start, rest.length ? Math.min(...rest) : html.length);
}

/**
 * The translated labels in one region: the ids of its elements marked
 * l10n.
 * @param {string} regionId One of REGIONS.
 * @return {Array<string>}
 */
function labelsIn(regionId) {
    const tags = regionOf(regionId).match(
        /<[^>]*\bclass="[^"]*\bl10n\b[^"]*"[^>]*>/g) || [];
    return tags.map((tag) => tag.match(/\bid="([^"]+)"/)[1]);
}

/**
 * The text of every button in one region of index.html.
 * @param {string} regionId The region's element id, one of REGIONS.
 * @return {Array<{id: string, text: string, translated: boolean}>}
 */
function buttonsIn(regionId) {
    const html = sourceOf('index.html');
    const start = html.indexOf('id="' + regionId + '"');
    assert.ok(start > 0, regionId + ' is not in the page');
    // Up to whichever region is declared next.
    const rest = REGIONS
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

test('the stage wears the panel silkscreen: caps, untranslated', () => {
    // These stand for switches that exist on the metal. A photograph of
    // the real panel does not change language, so neither do they.
    const buttons = buttonsIn('stage');
    assert.ok(buttons.length >= 25, 'expected the whole switch board');
    for (const b of buttons) {
        assert.strictEqual(b.text, b.text.toUpperCase(),
                           b.id + ' is a panel legend and must be uppercase');
        assert.strictEqual(b.translated, false,
                           b.id + ' is a panel legend and must not translate');
    }
});

test('the Teletype speaks in capitals, because the ASR-33 had no others', () => {
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

test('the toolbar, the Debugger and the dialogs read as software', () => {
    // Tooling the Altair never had, so it follows software convention:
    // Title Case, like the headings it sits under. Shouting here would
    // borrow the machine's voice for something that is not the machine
    // (P5 in docs/ui-design.md).
    const labels = ['toolbar', 'tab-asm', 'tab-debug', 'hex-dialog',
                    'asm-replace-dialog', 'share-dialog', 'about-dialog']
          .flatMap(labelsIn);
    assert.ok(labels.length >= 20, 'expected the menus, dialogs and dump');
    const all = messages();
    const debugButtons = buttonsIn('tab-debug');
    assert.ok(debugButtons.length >= 2, 'expected Follow PC and Zero All Memory');
    for (const b of debugButtons) {
        assert.strictEqual(b.translated, true, b.id + ' should translate');
    }
    for (const id of labels) {
        const b = {id: id};
        const english = all[b.id]['en'];
        // "4 KB", "Load 4K BASIC" and "Follow PC" keep their initialisms,
        // so the test is that the label is not uppercase throughout.
        const letters = english.replace(/[^A-Za-z]/g, '');
        assert.notStrictEqual(
            letters, letters.toUpperCase(),
            b.id + ' ("' + english + '") shouts like a panel legend');
    }
});

test('a switch on the panel has one home', () => {
    // P2: the front panel is always in view, so nothing outside it may
    // offer its switches again. The helper under the panel is the one
    // exception, being another way to reach them rather than a copy.
    const switches = ['OFF/ON', 'STOP', 'RUN', 'SINGLE STEP', 'EXAMINE',
                      'EXAMINE NEXT', 'DEPOSIT', 'DEPOSIT NEXT', 'RESET',
                      'POWER'];
    const normal = (text) => text.toUpperCase().replace(/-/g, ' ').trim();
    const all = messages();
    let checked = 0;
    for (const region of REGIONS.filter((id) => id != 'stage')) {
        // Buttons by their text, and every translated label by its
        // English, so that a <button> or a tab counts as much as a div.
        const texts = buttonsIn(region).map((b) => [b.id, b.text])
              .concat(labelsIn(region).map((id) => [id, all[id]['en']]));
        for (const [id, text] of texts) {
            checked++;
            assert.ok(!switches.includes(normal(text)),
                      id + ' in ' + region + ' repeats a panel switch');
        }
    }
    assert.ok(checked > 60, 'expected every region to be read: ' + checked);
});

test('Share and the next instruction are where U2 put them', () => {
    // Copying a link is done once in a while, so it is reached from the
    // toolbar (P4); the instruction at PC says where the CPU is, so it sits
    // with the registers rather than under the memory dump.
    const html = sourceOf('index.html');
    const at = (id) => html.indexOf('id="' + id + '"');
    assert.ok(at('copy-link') > at('share-dialog') &&
              at('copy-link') < at('about-dialog'),
              'Copy Link is in the Share dialog');
    assert.ok(at('instr-pane') > at('cpu-dump') &&
              at('instr-pane') < at('mem-dump'),
              'the next instruction is beside the registers');
});

test('the references have a tab of their own, which About opens', () => {
    // The Tutorial is a lesson; the source and further reading are
    // looked up, so they get the dock's last tab rather than its foot.
    assert.deepStrictEqual(panel.TABS, ['tty', 'asm', 'debug', 'ref', 'links']);
    assert.ok(!regionOf('tab-ref').includes('<a '),
              'the Tutorial keeps no links');
    const links = regionOf('tab-links');
    assert.ok(links.includes('id="reference-title"') &&
              links.includes('github.com/wixette/8800-simulator'),
              'the References tab has the source and the reading');
    const handler = sourceOf('js/panel.js').match(
        /panel\.onAboutReferences = function\(\) \{[\s\S]*?\n\};/)[0];
    assert.ok(handler.includes("panel.showTab('links')"),
              "About's References button opens the References tab");
});

test('a first visit opens the dock on the Tutorial', () => {
    // No storage at all - as in a private window, or here in Node -
    // is a first visit.
    assert.strictEqual(panel.readSavedTab(), 'ref');
    assert.deepStrictEqual(panel.readSavedDock(), {open: true, height: null});
});

test('the dock comes back as it was left, and forgets old tabs', (t) => {
    const stored = {};
    const savedStorage = global.localStorage;
    global.localStorage = {
        getItem: (key) => (key in stored ? stored[key] : null),
        setItem: (key, value) => { stored[key] = String(value); },
    };
    t.after(() => { global.localStorage = savedStorage; });
    stored[panel.tabStorageKey] = 'tty';
    stored[panel.dockStorageKey] = JSON.stringify({open: false, height: 250});
    assert.strictEqual(panel.readSavedTab(), 'tty');
    assert.deepStrictEqual(panel.readSavedDock(), {open: false, height: 250});
    // The front panel was a tab once. It is always on screen now.
    stored[panel.tabStorageKey] = 'sim';
    assert.strictEqual(panel.readSavedTab(), 'ref');
    stored[panel.dockStorageKey] = 'not json';
    assert.deepStrictEqual(panel.readSavedDock(), {open: true, height: null});
});

test('every shape of control the page can grey out is actually styled', () => {
    // The controls are .button divs, items in a menu, and buttons in a
    // dialog. The example menu's own button once carried the disabled
    // class and looked completely available, because the rule named
    // only .button. Nothing else in the suite can see a computed style,
    // so this checks the selectors themselves.
    const css = sourceOf('css/style.css');
    const rules = css.match(/([^}]*)\{[^}]*\}/g)
          .filter((block) => /\.disabled[^{]*\{/.test(block));
    assert.ok(rules.length, 'style.css should have a rule for .disabled');
    const selectors = rules.map((rule) => rule.split('{')[0]).join(',');
    assert.match(selectors, /\.button\.disabled/,
                 'the .button controls must grey out');
    assert.match(selectors, /\.dropdown li\.disabled/,
                 'and so must an item inside a menu');
    assert.match(selectors, /\.dialog-button\.disabled/,
                 'and a button in a dialog');
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
    const ways = ['loadExample', 'onLoadBasic', 'onBinaryFileChosen',
                  'debugLoadData'];
    for (const name of ways) {
        assert.match(panel[name].toString(), /poweredOn/,
                     name + ' loads without saying if it switched the '
                     + 'machine on');
    }
});

test('a switch thrown on a dead machine does nothing, and says the machine is off', (t) => {
    // RUN on a machine that was off said "Running." while nothing ran.
    const said = [];
    const done = [];
    const savedSim = panel.sim;
    const savedOn = panel.isPoweredOn;
    panel.sim = new Proxy({}, {get: (target, name) => () => done.push(name)});
    t.after(() => { panel.sim = savedSim; panel.isPoweredOn = savedOn; });
    t.mock.method(panel, 'setStatus', (id) => said.push(id));
    const switches = ['onRun', 'onStop', 'onSingle', 'onExamine',
                      'onExamineNext', 'onDeposit', 'onDepositNext', 'onReset'];
    panel.isPoweredOn = false;
    switches.forEach((name) => panel[name]());
    assert.deepStrictEqual(done, [], 'nothing reached the machine');
    assert.deepStrictEqual(said, switches.map(() => 'status-off'));
    // Switched on, each goes through.
    said.length = 0;
    panel.isPoweredOn = true;
    switches.forEach((name) => panel[name]());
    assert.strictEqual(done.length, switches.length);
    assert.ok(!said.includes('status-off'));
});

test('PROTECT works only on a stopped machine, and names the range it covers', (t) => {
    // Like every switch but RESET on the real machine (the Theory of
    // Operation), and the line says which board it latched.
    const said = [];
    const protects = [];
    const savedSim = panel.sim;
    const savedOn = panel.isPoweredOn;
    t.after(() => { panel.sim = savedSim; panel.isPoweredOn = savedOn; });
    t.mock.method(panel, 'setStatus', (...args) => said.push(args));
    let range = {start: 0x1000, end: 0x1fff};
    panel.sim = {isRunning: false, busAddress: 0x1234,
                 protect: (on) => { protects.push(on); return range; }};
    panel.isPoweredOn = false;
    panel.onProtect();
    assert.deepStrictEqual(said.pop(), ['status-off']);
    panel.isPoweredOn = true;
    panel.sim.isRunning = true;
    panel.onProtect();
    assert.strictEqual(said.pop()[0], 'protect-running');
    assert.deepStrictEqual(protects, [], 'a running machine is not touched');
    panel.sim.isRunning = false;
    panel.onProtect();
    assert.deepStrictEqual(said.pop(), ['status-protected',
                                        {start: '1000', end: '1FFF'}]);
    panel.onUnprotect();
    assert.strictEqual(said.pop()[0], 'status-unprotected');
    assert.deepStrictEqual(protects, [true, false]);
    range = null;
    panel.onProtect();
    assert.deepStrictEqual(said.pop(), ['protect-no-memory',
                                        {address: '1234'}, 'warn']);
});

test('DEPOSIT into a protected board says why nothing changed', (t) => {
    const said = [];
    const savedSim = panel.sim;
    const savedOn = panel.isPoweredOn;
    t.after(() => { panel.sim = savedSim; panel.isPoweredOn = savedOn; });
    t.mock.method(panel, 'setStatus', (...args) => said.push(args));
    let accepted = false;
    panel.sim = {lastAddress: 0x0042, deposit: () => accepted,
                 depositNext: () => accepted};
    panel.isPoweredOn = true;
    panel.onDeposit();
    panel.onDepositNext();
    assert.deepStrictEqual(said, [
        ['deposit-protected', {address: '0042'}, 'warn'],
        ['deposit-protected', {address: '0042'}, 'warn']]);
    said.length = 0;
    accepted = true;
    panel.onDeposit();
    assert.deepStrictEqual(said, [], 'an ordinary DEPOSIT says nothing');
});

test('stopping after writes to protected memory says how many were refused', (t) => {
    const said = [];
    const savedSim = panel.sim;
    const savedOn = panel.isPoweredOn;
    t.after(() => { panel.sim = savedSim; panel.isPoweredOn = savedOn; });
    t.mock.method(panel, 'setStatus', (...args) => said.push(args));
    t.mock.method(panel, 'setLed', () => {});
    panel.sim = {blockedWrites: 3412, firstBlockedAddress: 0x0123,
                 halted: false, stop() {}};
    panel.isPoweredOn = true;
    panel.onProtectedWrite(0x0123);
    assert.deepStrictEqual(said.pop(), ['write-protected', {address: '0123'},
                                        'warn']);
    panel.onStop();
    assert.deepStrictEqual(said.pop(), ['status-stopped-blocked',
                                        {count: 3412, address: '0123'},
                                        'warn']);
    panel.sim.halted = true;
    panel.setWaitLedCallback(false);
    assert.strictEqual(said.pop()[0], 'status-halted-blocked');
    panel.sim.blockedWrites = 0;
    panel.setWaitLedCallback(false);
    assert.deepStrictEqual(said.pop(), ['status-halted']);
    panel.onStop();
    assert.deepStrictEqual(said.pop(), ['status-stopped']);
});

test('CLR clears the serial boards, and AUX always says it is spare', (t) => {
    const said = [];
    let clears = 0;
    const savedSio = panel.sio;
    const savedOn = panel.isPoweredOn;
    t.after(() => { panel.sio = savedSio; panel.isPoweredOn = savedOn; });
    t.mock.method(panel, 'setStatus', (id) => said.push(id));
    panel.sio = {reset: () => clears++};
    panel.isPoweredOn = false;
    panel.onClr();
    panel.onAux();
    assert.deepStrictEqual(said, ['status-off', 'status-aux'],
                           'AUX is spare whether the machine is on or not');
    assert.strictEqual(clears, 0);
    panel.isPoweredOn = true;
    panel.onClr();
    assert.strictEqual(clears, 1);
    assert.strictEqual(said.pop(), 'status-clr');
});

test('every way of putting a program in owns up to unprotecting memory', () => {
    // A load is a fresh start, so it lifts protection, and when there
    // was any the status line says so first, as it does for a power-up.
    const ways = ['loadExample', 'onLoadBasic', 'onBinaryFileChosen',
                  'debugLoadData', 'applyLinkState', 'onFillZero'];
    for (const name of ways) {
        assert.match(panel[name].toString(), /unprotect/i,
                     name + ' does not say whether it unprotected memory');
    }
});

test('every lamp the simulator reports is drawn on the panel', () => {
    const drawn = panel.LED_INFO.map((info) => info.id);
    for (const id of ['prot', 'hlta', 'm1', 'inte']) {
        assert.ok(drawn.includes(id), id + ' has no lamp on the panel');
    }
});

test('the lamps the simulator reports touch the page only when they change', (t) => {
    // A running program reports them after every batch of cycles.
    const lit = [];
    t.mock.method(panel, 'setLed', (id, on) => lit.push([id, on]));
    panel.lampStates = {};
    panel.setLampsCallback({prot: false});
    panel.setLampsCallback({prot: false});
    panel.setLampsCallback({prot: true});
    panel.setLampsCallback({prot: true});
    assert.deepStrictEqual(lit, [['prot', false], ['prot', true]]);
    panel.lampStates = {};
});

test('every switch on the panel does something, with its label to click', () => {
    // PROTECT, CLR and both AUX switches were drawn but did nothing.
    for (const info of panel.STATELESS_SWITCH_INFO) {
        assert.ok(info.upperCmd || info.lowerCmd, info.id + ' does nothing');
        for (const cmd of [info.upperCmd, info.lowerCmd].filter(Boolean)) {
            assert.strictEqual(typeof cmd.callback, 'function',
                               cmd.id + ' has no handler');
        }
    }
    const html = sourceOf('index.html');
    for (const id of ['sw-clr', 'sw-protect', 'sw-unprotect']) {
        assert.ok(html.includes('id="s-' + id + '"'),
                  id + ' has no button on the strip');
    }
    assert.ok(!html.includes('id="s-sw-aux'), 'AUX does nothing worth a button');
});

/**
 * Stands in for the simulator and the dump while the byte editor is
 * exercised: memory, the window shown, and what was written.
 * @param {!Object} t The test context.
 * @return {!Object} The fake simulator; its edits are in .edits.
 */
function stubMemEditor(t) {
    const saved = {sim: panel.sim, render: panel.renderMemSelection,
                   doc: global.document};
    const sim = {
        mem: new Array(512).fill(0), isRunning: false, isPoweredOn: true,
        protectedAt: -1, window: {start: 0, end: 256}, edits: [],
        followPc: true,
        editByte(address, value) {
            if (this.isRunning) return 'running';
            if (address == this.protectedAt) return 'protected';
            this.mem[address] = value;
            this.edits.push([address, value]);
            return 'ok';
        },
        getDumpWindow() { return this.window; },
        setDumpWindow(address) {
            this.window = {start: address - address % 256,
                           end: address - address % 256 + 256};
        },
        setFollowPc(on) { this.followPc = on; },
        readByte(address) { return this.mem[address]; },
    };
    panel.sim = sim;
    panel.renderMemSelection = () => {};
    global.document = {getElementById: () => ({focus() {}, blur() {}})};
    t.mock.method(panel, 'updateMemoryControls', () => {});
    t.after(() => {
        panel.sim = saved.sim;
        panel.renderMemSelection = saved.render;
        global.document = saved.doc;
        panel.memSelection = null;
        panel.memPending = null;
    });
    return sim;
}

/** A keydown event as the dump's input receives it. */
function memKey(key) {
    return {key: key, defaultPrevented: false, target: {blur() {}},
            preventDefault() { this.defaultPrevented = true; }};
}

test('two hex digits write one byte, and the next byte is picked', (t) => {
    const sim = stubMemEditor(t);
    const said = [];
    t.mock.method(panel, 'setStatus', (...args) => said.push(args));
    panel.selectMemByte(0x10);
    assert.deepStrictEqual(said.pop(), ['mem-edit-hint']);
    for (const key of '3e8C') {
        assert.ok(panel.onMemKey(memKey(key)) === undefined);
    }
    assert.deepStrictEqual(sim.edits, [[0x10, 0x3e], [0x11, 0x8c]]);
    assert.strictEqual(panel.memSelection, 0x12);
    // One digit is held, not written; Backspace and Escape drop it.
    panel.onMemKey(memKey('5'));
    assert.strictEqual(panel.memPending, 5);
    assert.strictEqual(sim.edits.length, 2, 'nothing written yet');
    panel.onMemKey(memKey('Backspace'));
    assert.strictEqual(panel.memPending, null);
    panel.onMemKey(memKey('7'));
    panel.onMemKey(memKey('Escape'));
    assert.strictEqual(panel.memPending, null);
    assert.strictEqual(panel.memSelection, 0x12, 'the first Escape keeps the byte');
    panel.onMemKey(memKey('Escape'));
    assert.strictEqual(panel.memSelection, null, 'the second lets it go');
    assert.strictEqual(sim.edits.length, 2);
});

test('the arrows move the pick, turning the page at its edges', (t) => {
    const sim = stubMemEditor(t);
    t.mock.method(panel, 'setStatus', () => {});
    panel.selectMemByte(0x00ff);
    const right = memKey('ArrowRight');
    panel.onMemKey(right);
    assert.strictEqual(right.defaultPrevented, true, 'the page does not scroll');
    assert.strictEqual(panel.memSelection, 0x0100);
    assert.deepStrictEqual(sim.window, {start: 0x100, end: 0x200});
    assert.strictEqual(sim.followPc, false, 'following the PC would turn it back');
    panel.onMemKey(memKey('ArrowUp'));
    assert.strictEqual(panel.memSelection, 0x00f0);
    panel.onMemKey(memKey('ArrowDown'));
    panel.onMemKey(memKey('ArrowDown'));
    assert.strictEqual(panel.memSelection, 0x0110);
    // Held at the ends of memory.
    panel.memSelection = 0x01ff;
    panel.onMemKey(memKey('ArrowRight'));
    assert.strictEqual(panel.memSelection, 0x01ff);
    panel.memSelection = 0;
    panel.onMemKey(memKey('ArrowLeft'));
    assert.strictEqual(panel.memSelection, 0);
    // Other typing is swallowed; Tab passes, to move the focus on.
    const letter = memKey('x');
    panel.onMemKey(letter);
    assert.strictEqual(letter.defaultPrevented, true);
    const tab = memKey('Tab');
    panel.onMemKey(tab);
    assert.strictEqual(tab.defaultPrevented, false);
});

test('a byte is edited only on a stopped machine, and not on a protected board', (t) => {
    const sim = stubMemEditor(t);
    const said = [];
    t.mock.method(panel, 'setStatus', (...args) => said.push(args));
    sim.isRunning = true;
    panel.selectMemByte(0x20);
    assert.deepStrictEqual(said.pop(), ['mem-edit-running', {}, 'warn']);
    assert.strictEqual(panel.memSelection, null);
    sim.isRunning = false;
    sim.protectedAt = 0x20;
    panel.selectMemByte(0x20);
    panel.typeMemDigit(0xa);
    panel.typeMemDigit(0xb);
    assert.deepStrictEqual(said.pop(), ['mem-edit-protected',
                                        {address: '0020'}, 'warn']);
    assert.strictEqual(panel.memSelection, 0x20, 'the pick stays put');
    assert.deepStrictEqual(sim.edits, []);
    // RUN lets go of the byte.
    panel.clearMemSelection();
    panel.selectMemByte(0x21);
    t.mock.method(panel, 'reportIfOff', () => false);
    sim.start = () => {};
    panel.onRun();
    assert.strictEqual(panel.memSelection, null);
});

test('a soft keyboard\'s text is typed in as hex digits', (t) => {
    const sim = stubMemEditor(t);
    t.mock.method(panel, 'setStatus', () => {});
    panel.selectMemByte(0x30);
    const input = {value: 'c3 0g0'};
    panel.onMemInput({target: input});
    assert.strictEqual(input.value, '', 'nothing collects in the input');
    assert.deepStrictEqual(sim.edits, [[0x30, 0xc3], [0x31, 0x00]]);
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

test('the teletype has the keyboard while nothing else needs it', (t) => {
    // A focused control keeps the keys it acts on: Space on the switch
    // strip's tab once folded the strip and typed a space at the machine
    // too, and Tab out of the language menu sent a TAB. But a button left
    // focused after a menu or a dialog must not swallow the reader's
    // typing either.
    const body = {};
    const saved = {document: global.document, Dialog: global.Dialog,
                   Teletype: global.Teletype, send: panel.ttySend,
                   visible: panel.isTtyTabVisible};
    global.document = {body: body, querySelector: () => null};
    global.Dialog = {anyOpen: () => false};
    global.Teletype = require('../js/teletype.js');
    const sent = [];
    panel.ttySend = (byte) => sent.push(byte);
    panel.isTtyTabVisible = true;
    t.after(() => {
        global.document = saved.document;
        global.Dialog = saved.Dialog;
        global.Teletype = saved.Teletype;
        panel.ttySend = saved.send;
        panel.isTtyTabVisible = saved.visible;
    });
    const control = (id, tagName, role) =>
        ({id: id, tagName: tagName, getAttribute: () => role || null});
    const press = (key, target) => panel.onTtyKeyDown(
        {key: key, target: target, preventDefault: () => {}});
    press('A', body);
    press('B', {id: 'tty-input'});
    assert.deepStrictEqual(sent, [0x41, 0x42], 'the page, or the paper\'s box');
    const stripTab = control('strip-tab', 'DIV', 'button');
    const language = control('switch-locale', 'BUTTON');
    press(' ', stripTab);
    press('Enter', stripTab);
    press('Tab', language);
    assert.deepStrictEqual(sent, [0x41, 0x42], 'not the keys a control acts on');
    press('C', language);
    press('D', control('nav-tty', 'DIV', 'tab'));
    assert.deepStrictEqual(sent, [0x41, 0x42, 0x43, 0x44],
                           'but typing past a focused button or tab');
    press('E', control('debug-data-input', 'TEXTAREA'));
    press('F', control('', 'LI', 'option'));
    assert.strictEqual(sent.length, 4, 'not a text box\'s, nor a menu item\'s');
    global.Dialog = {anyOpen: () => true};
    press('G', body);
    assert.strictEqual(sent.length, 4, 'nor while a dialog is open');
});

test('the greyed Loading item answers, as every greyed item does', (t) => {
    const said = [];
    t.mock.method(panel, 'setStatus', (id) => said.push(id));
    panel.onLoadMenu('examples-loading');
    assert.deepStrictEqual(said, ['examples-still-loading']);
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

// The page has these as globals; its link handling reaches for both.
global.Link = require('../js/link.js');
global.Sim8800 = require('../js/sim8800.js');

/**
 * Stands in for the parts of the page that applyLinkState() drives, and
 * records what it asks of them, in order. Everything is put back when
 * the test ends.
 * @param {!Object} t The test context.
 * @return {!Array<!Array>} The calls: ['mem', size], ['load', length]
 *     and ['status', ...the arguments to setStatus].
 */
function stubLinkLoader(t) {
    const calls = [];
    const regs = {pc: 0};
    const saved = {cpu: global.CPU8080, panelSim: panel.sim};
    global.CPU8080 = {
        set: (name, value) => { regs[name.toLowerCase()] = value; },
        status: () => ({...regs}),
    };
    panel.sim = {flushDump() {}};
    t.after(() => {
        global.CPU8080 = saved.cpu;
        panel.sim = saved.panelSim;
    });
    t.mock.method(panel, 'onSetMemSize', (size) => calls.push(['mem', size]));
    t.mock.method(panel, 'loadImage', (bytes) => {
        calls.push(['load', bytes.length]);
        return {bytes: bytes.length, poweredOn: true};
    });
    t.mock.method(panel, 'setAddressSwitches', () => {});
    t.mock.method(panel, 'setStatus', (...args) => calls.push(['status', ...args]));
    return calls;
}

test('a link with registers but no PC still says where it stopped', (t) => {
    // Copy Link leaves out a PC of 0000H, so a link taken at RESET with
    // a value in A, or with switches raised, has no pc= at all.
    const calls = stubLinkLoader(t);
    panel.applyLinkState({memSize: 256, bytes: [0x76], cpu: {a: 0x41},
                          switches: 0});
    panel.applyLinkState({memSize: 256, bytes: [0x76], cpu: {},
                          switches: 0x8001});
    const said = calls.filter((c) => c[0] == 'status');
    assert.strictEqual(said.length, 2);
    for (const status of said) {
        assert.strictEqual(status[1], 'link-state-loaded');
        assert.deepStrictEqual(status[2], {size: '256 B', pc: '0000'});
    }
});

test('a link says so when it had to switch the machine on', (t) => {
    const calls = stubLinkLoader(t);
    panel.applyLinkState({memSize: 256, bytes: [0x76], cpu: {}, switches: 0});
    const status = calls.find((c) => c[0] == 'status');
    assert.strictEqual(status[1], 'link-loaded');
    assert.strictEqual(status[4], true, 'the note D23 puts first');
});

test('a link installs its memory the way the memory buttons do', (t) => {
    // The panel has to hear that installing memory switched the machine
    // off, or the load that follows goes into a machine it thinks is on.
    const calls = stubLinkLoader(t);
    panel.applyLinkState({memSize: 4096, bytes: [0x76], cpu: {}, switches: 0});
    assert.deepStrictEqual(calls.slice(0, 2), [['mem', 4096], ['load', 1]]);
});

test('a link pasted into an open page reads only the fragment', async (t) => {
    const savedWindow = global.window;
    global.window = {location: {hash: '', search: '?hex=76'}};
    t.after(() => { global.window = savedWindow; });
    const seen = [];
    t.mock.method(panel, 'applyLinkState', (state) => seen.push(state));
    // The fragment emptied: the query string the page was opened with
    // is not loaded again over the machine as it stands.
    await panel.onHashChange();
    assert.deepStrictEqual(seen, [null]);
    window.location.hash = '#hex=3E';
    await panel.onHashChange();
    assert.deepStrictEqual(seen[1].bytes, [0x3e]);
});
