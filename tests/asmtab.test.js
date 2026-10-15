/**
 * The Assembler tab's logic (js/asmtab.js) that does not need a page:
 * the highlighting, the listing beside the source, and the errors as
 * sentences. U2 and H2 in docs/assembler.md.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {Asm8080} from '../js/asm8080.js';
import {asmtab} from '../js/asmtab.js';
import {CPU8080} from '../js/8080.js';
import {l10n} from '../js/l10n.js';
import {panel} from '../js/panel.js';
import {stub} from './stub.js';

/** The classes a line's words are coloured with, in order. */
function colours(line, macros = new Set()) {
    const html = asmtab.highlightLine(line, macros);
    return [...html.matchAll(/<span class="([^"]+)">([^<]*)<\/span>/g)]
        .map((m) => m[1].replace('asm-', '') + ':' + m[2]);
}

test('each kind of word has its colour (H2)', () => {
    assert.deepStrictEqual(colours("LOOP: MVI A,'x' ; go"),
                           ['label:LOOP', 'label::', 'mnemonic:MVI',
                            'register:A', "string:'x'", 'comment:; go']);
    assert.deepStrictEqual(colours('PORT EQU 0FFH AND $'),
                           ['label:PORT', 'pseudo:EQU', 'number:0FFH',
                            'operator:AND', 'number:$']);
    // A word in the code field that is not an instruction, nor a
    // pseudo-instruction, nor a macro, is marked.
    assert.deepStrictEqual(colours(' MVX A'), ['bad:MVX', 'register:A']);
    assert.deepStrictEqual(colours(' SHRT', new Set(['SHRT'])), ['macro:SHRT']);
    // An instruction in parentheses.
    assert.deepStrictEqual(colours(' DB (ADD C)'),
                           ['pseudo:DB', 'mnemonic:ADD', 'register:C']);
});

test('the highlighting escapes the source, and keeps every character', () => {
    const line = " DB '<b>&amp;' ; a < b";
    const html = asmtab.highlightLine(line, new Set());
    assert.ok(!html.includes('<b>'), 'markup in the source is not markup');
    const text = html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    assert.strictEqual(text, line);
});

test('the listing has a cell per line: address and bytes, or a value', () => {
    const source = ['; a comment', 'PORT EQU 0FFH', 'LOOP: IN PORT',
                    " DB 'HELLO, WORLD'", 'HERE:', ' JMP LOOP'].join('\n');
    const cells = asmtab.listingCells(Asm8080.assemble(source), 6);
    assert.deepStrictEqual(cells.map((c) => c.text),
                           ['', '= 00FF', '0000  DB FF',
                            '0002  48 45 4C 4C 4F 2C …', '000E',
                            '000E  C3 00 00']);
    // A row too long to hold is whole in its tooltip.
    assert.match(cells[3].title, /48 45 4C 4C 4F 2C 20 57 4F 52 4C 44/);
    assert.strictEqual(cells[2].title, '');
});

test('a macro\'s use lists its expansion, line by line, in its tooltip', () => {
    const source = ['SHRT MACRO', ' RRC', ' ANI 7FH', ' ENDM', ' SHRT'].join('\n');
    const cells = asmtab.listingCells(Asm8080.assemble(source), 5);
    assert.deepStrictEqual(cells.map((c) => c.text),
                           ['', '', '', '', '0000  0F E6 7F']);
    assert.deepStrictEqual(cells[4].title.split('\n').map((l) => l.trim()),
                           ['0000  0F            RRC',
                            '0001  E6 7F         ANI 7FH']);
});

test('an error reads as a sentence, with its line, and its macro\'s', () => {
    const r = Asm8080.assemble('MX MACRO\n MVI A\n ENDM\n MX\n JMP NOWHERE');
    assert.deepStrictEqual(r.errors.map((e) => asmtab.errorText(e)), [
        'Line 4, in MX (line 2): MVI is not written like that. It is ' +
            'written as in MVI A,3FH.',
        'Line 5: NOWHERE is not defined anywhere.']);
    const big = Asm8080.assemble(' ORG 0FFH\n DW 0', {memSize: 256});
    assert.strictEqual(asmtab.errorText(big.errors[0]),
                       'Line 2: This program reaches 0100H, but the machine ' +
                       'has 256 B of memory. Install more in the Memory menu.');
});

test('Tab inserts spaces to the next eight-column stop', () => {
    assert.strictEqual(asmtab.spacesToStop('', 0), '        ');
    assert.strictEqual(asmtab.spacesToStop('LOOP:', 5), '   ');
    assert.strictEqual(asmtab.spacesToStop('START:  MVI', 11), '     ');
    assert.strictEqual(asmtab.spacesToStop('ABCDEFGH', 8), '        ');
    // On a later line, and after a tab already in the text.
    assert.strictEqual(asmtab.spacesToStop('NOP\nX:', 6), '      ');
    assert.strictEqual(asmtab.spacesToStop('\tMVI', 4), '     ');
    assert.strictEqual(asmtab.columnOf('\tA\tB'), 17);
});

test('the Tutorial\'s program assembles to what the Tutorial says', () => {
    // "IN 0FFH is DB FF, at 0000H" - and the rest of it runs.
    const html = fs.readFileSync(path.join(import.meta.dirname, '..', 'index.html'), 'utf8');
    const step = html.slice(html.indexOf('id="asm-tutorial-1"'));
    const code = step.match(/<pre class="tutorial-code">([\s\S]*?)<\/pre>/)[1];
    const r = Asm8080.assemble(code);
    assert.deepStrictEqual(r.errors, []);
    const bytes = [];
    for (let a = r.start; a <= r.end; a++) bytes.push(r.memory.get(a));
    assert.deepStrictEqual(bytes, [0xdb, 0xff, 0xd3, 0xff, 0xc3, 0x00, 0x00]);
    assert.strictEqual(r.start, 0);
    assert.match(l10n.MESSAGES['asm-tutorial-2'].en, /IN 0FFH is DB FF, at 0000H/);
});

test('the PC is marked on its line only while it is true (U7)', () => {
    const text = ['SHRT MACRO', ' RRC', ' ANI 7FH', ' ENDM',
                  'START: MVI A,80H', ' SHRT', ' JMP START', 'DATA: DB 1'].join('\n');
    const result = Asm8080.assemble(text);
    const loaded = {text: text, rows: asmtab.pcRows(result), memLoads: 7};
    const mem = new Array(256).fill(0);
    for (const [a, b] of result.memory) mem[a] = b;
    const at = (pc, extra = {}) => asmtab.pcLineOf(loaded, extra.text || text,
        Object.assign({on: true, running: false, pc: pc, memLoads: 7,
                       read: (a) => mem[a]}, extra));
    assert.strictEqual(at(0), 5, 'MVI A,80H');
    assert.strictEqual(at(1), 5, 'inside an instruction is still its line');
    assert.strictEqual(at(2), 6, 'a macro\'s expansion is the line that used it');
    assert.strictEqual(at(3), 6);
    assert.strictEqual(at(5), 7, 'JMP START');
    assert.strictEqual(at(8), 8, 'the bytes of a DB, if it runs into them');
    assert.strictEqual(at(9), 0, 'past the program');
    assert.strictEqual(at(0, {running: true}), 0, 'nothing while it runs');
    assert.strictEqual(at(0, {on: false}), 0, 'nor while it is off');
    assert.strictEqual(at(0, {text: text + ' '}), 0, 'nor once the source changed');
    assert.strictEqual(at(0, {memLoads: 8}), 0,
                       'nor once anything was loaded over it, even the same bytes');
    mem[5] = 0x00;
    assert.strictEqual(at(5), 0, 'nor once the bytes under the PC changed');
    assert.strictEqual(asmtab.pcLineOf(null, text, {on: true, pc: 0,
                                                    read: () => 0}), 0);
});

test('a shortcut is named with the key this keyboard holds for it', (t) => {
    // Ctrl+Enter assembles, and so does ⌘+Enter; a Mac is told the
    // one its keyboard has, as the Assemble button's tooltip and the
    // Tutorial say it.
    assert.strictEqual(asmtab.ctrlKey('MacIntel'), '⌘');
    assert.strictEqual(asmtab.ctrlKey('iPad'), '⌘');
    assert.strictEqual(asmtab.ctrlKey('Win32'), 'Ctrl');
    assert.strictEqual(asmtab.ctrlKey(''), 'Ctrl');
    const saved = l10n.current;
    t.after(() => { l10n.current = saved; });
    l10n.current = l10n.LOCALES.indexOf('de');
    assert.strictEqual(asmtab.ctrlKey('Win32'), 'Strg');
    assert.strictEqual(asmtab.undoKey('Win32'), 'Strg+Z');
    assert.strictEqual(asmtab.ctrlKey('MacIntel'), '⌘');
    for (const id of ['asm-assemble-title', 'asm-tutorial-3']) {
        for (const [locale, text] of Object.entries(l10n.MESSAGES[id])) {
            assert.match(text, /\{ctrl\}\+/, id + ' in ' + locale);
            assert.doesNotMatch(text, /Ctrl|Strg/, id + ' in ' + locale);
        }
    }
});

test('Clear names the undo keys the machine has', () => {
    assert.strictEqual(asmtab.undoKey('MacIntel'), '⌘Z');
    assert.strictEqual(asmtab.undoKey('iPhone'), '⌘Z');
    assert.strictEqual(asmtab.undoKey('Win32'), 'Ctrl+Z');
    assert.strictEqual(asmtab.undoKey('Linux x86_64'), 'Ctrl+Z');
    assert.strictEqual(asmtab.undoKey(''), 'Ctrl+Z');
    for (const locale of Object.keys(l10n.MESSAGES['asm-cleared'])) {
        assert.match(l10n.MESSAGES['asm-cleared'][locale], /\{undo\}/,
                     locale + ' should name the undo keys');
    }
});

test('a byte put in by hand breaks the sync only if it changes the program (U7)', () => {
    // The adder's numbers go in at 0080H and 0081H by hand: those are
    // not the program's bytes, so the source still says what is there.
    const text = ['X EQU 80H', 'START: LDA X', ' HLT', 'COUNT: DB 5'].join('\n');
    const result = Asm8080.assemble(text);
    const fresh = () => ({text: text, rows: asmtab.pcRows(result), memLoads: 1});
    assert.strictEqual(asmtab.loadedByteAt(fresh(), 0), 0x3a);
    assert.strictEqual(asmtab.loadedByteAt(fresh(), 2), 0x00);
    assert.strictEqual(asmtab.loadedByteAt(fresh(), 4), 5, 'a DB is the program\'s too');
    assert.strictEqual(asmtab.loadedByteAt(fresh(), 0x80), null);
    const requestPc = asmtab.requestPc;
    asmtab.requestPc = () => {};
    try {
        asmtab.loaded = fresh();
        asmtab.onHandWrite(0x80, 1);
        asmtab.onHandWrite(0x81, 2);
        assert.ok(asmtab.loaded, 'data outside the program keeps it');
        asmtab.onHandWrite(1, 0x80);
        assert.ok(asmtab.loaded, 'the same byte again keeps it');
        asmtab.onHandWrite(3, 0x00);
        assert.strictEqual(asmtab.loaded, null, 'a changed instruction ends it');
        asmtab.loaded = fresh();
        asmtab.onHandWrite(4, 6);
        assert.strictEqual(asmtab.loaded, null, 'so does a changed DB');
    } finally {
        asmtab.requestPc = requestPc;
        asmtab.loaded = null;
    }
    assert.ok(asmtab.inSync(fresh(), text, 1));
    assert.ok(!asmtab.inSync(fresh(), text + ' ', 1), 'an edit');
    assert.ok(!asmtab.inSync(fresh(), text, 2), 'a load since');
    assert.ok(!asmtab.inSync(null, text, 1));
});

test('Tab replaces only what typing would, and indents lines it spans (U3)', () => {
    const text = 'L: MVI A,1\n OUT 0FFH\n JMP L';
    // Nothing selected: spaces to the next stop.
    assert.deepStrictEqual(asmtab.tabEdit(text, 2, 2),
                           {from: 2, to: 2, text: '      ', selectStart: 8, selectEnd: 8});
    // A selection in one line: the spaces take its place, as typing would.
    assert.deepStrictEqual(asmtab.tabEdit(text, 3, 6),
                           {from: 3, to: 6, text: '     ', selectStart: 8, selectEnd: 8});
    // Across lines: every line it touches is indented, none is lost.
    const across = asmtab.tabEdit(text, 0, 21);
    assert.strictEqual(across.from, 0);
    assert.strictEqual(across.to, 20, 'up to the end of the second line, not the third');
    assert.strictEqual(across.text, '        L: MVI A,1\n         OUT 0FFH');
    const after = text.slice(0, across.from) + across.text + text.slice(across.to);
    assert.strictEqual(after, '        L: MVI A,1\n         OUT 0FFH\n JMP L');
    assert.deepStrictEqual([across.selectStart, across.selectEnd], [0, across.text.length]);
    // Part way into the first and last lines takes them whole.
    const partial = asmtab.tabEdit(text, 5, 25);
    assert.strictEqual(text.slice(0, partial.from) + partial.text + text.slice(partial.to),
                       '        L: MVI A,1\n         OUT 0FFH\n         JMP L');
});

test('Assemble lifts protection, loads, and is in sync with its own load (U4, U7)', (t) => {
    // Run with a stand-in machine: its loads are counted as the real
    // one's are, and the record must hold the count after Assemble's.
    const sim = {
        mem: new Array(256).fill(0), memLoads: 0, lifted: 0, pc: null,
        unprotectAll() { this.lifted++; return false; },
        initMem() { this.memLoads++; this.mem.fill(0); },
        loadMap(pairs) {
            this.memLoads++;
            for (const [a, b] of pairs) this.mem[a] = b;
        },
        reset() {}, flushDump() {}, endResetFlash() {}, showAddressAndData() {},
        lastAddress: 0,
    };
    const source = 'MSG: DB 1\nSTART: MVI A,1\n HLT\n END START';
    stub(t, global, {window: {clearTimeout() {}}});
    const said = [];
    stub(t, panel, {
        sim: sim,
        ensurePoweredOn: () => false,
        updateMemoryControls: () => {},
        setStatus: (...args) => said.push(args),
    });
    stub(t, CPU8080, {set: (reg, value) => { if (reg == 'PC') sim.pc = value; }});
    t.mock.method(asmtab, 'source', () => ({value: source}));
    t.mock.method(asmtab, 'refresh', () => { asmtab.result = Asm8080.assemble(source); });
    t.mock.method(asmtab, 'requestPc', () => {});
    asmtab.onAssemble();
    assert.strictEqual(sim.lifted, 1, 'protection lifted first');
    assert.deepStrictEqual(sim.mem.slice(0, 4), [1, 0x3e, 1, 0x76]);
    assert.strictEqual(sim.pc, 1, 'the PC set where END START says');
    assert.ok(asmtab.loaded, 'the record made');
    assert.strictEqual(asmtab.loaded.memLoads, sim.memLoads,
                       'with the count after its own load, so in sync with it');
    assert.strictEqual(asmtab.loaded.text, source);
    asmtab.loaded = null;
});

test('Assemble puts the PC where the program starts, and says so (U4, L8, #20)', (t) => {
    // The program from #20, with its code moved and an END added, as
    // the cases were tried by hand. RESET puts the PC at 0000H; only a
    // program that starts elsewhere is examined there, lamps and all.
    const data = ['ORG 0030H', 'db "t"', 'db "a"', 'db "C"'];
    const code = ['\tLXI\tSP, 0040H', '\tLXI\tH, 0030H', 'loopo:', '\tPUSH\tH',
                  '\tMOV A,M', '\tINX\tH', 'ORA A', 'JNZ\tloopo', 'HLT'];
    t.after(() => { asmtab.loaded = null; });
    stub(t, global, {window: {clearTimeout() {}}});
    // A machine and a status line of its own for each case, below.
    let sim = null;
    let said = [];
    stub(t, panel, {
        sim: null,
        ensurePoweredOn: () => false,
        updateMemoryControls: () => {},
        setStatus: (...args) => said.push(args),
    });
    stub(t, CPU8080, {set: (reg, value) => { if (reg == 'PC') sim.pc = value; }});
    let source = '';
    t.mock.method(asmtab, 'source', () => ({value: source}));
    t.mock.method(asmtab, 'refresh', () => { asmtab.result = Asm8080.assemble(source); });
    t.mock.method(asmtab, 'requestPc', () => {});
    for (const [org, end, pc] of [['0000H', null, 0x0000], ['0003H', null, 0x0003],
                                  ['0000H', 'END 0000H', 0x0000],
                                  ['0000H', 'END 0003H', 0x0003],
                                  ['0000H', 'END 0006H', 0x0006],
                                  ['0000H', 'END loopo', 0x0006],
                                  ['0003H', 'END 0000H', 0x0000],
                                  ['0003H', 'END loopo', 0x0009]]) {
        sim = {
            mem: new Array(256).fill(0), memLoads: 0, pc: 0x1234, lamps: 0,
            unprotectAll() { return false; },
            initMem() { this.memLoads++; this.mem.fill(0); },
            loadMap(pairs) {
                this.memLoads++;
                for (const [a, b] of pairs) this.mem[a] = b;
            },
            reset() { this.pc = 0; },
            flushDump() {}, endResetFlash() {},
            showAddressAndData() { this.lamps = this.pc; },
            lastAddress: 0,
        };
        said = [];
        panel.sim = sim;
        source = data.concat(['ORG ' + org], code, end ? [end] : []).join('\n');
        const what = 'code at ' + org + (end ? ', ' + end : '');
        asmtab.onAssemble();
        assert.strictEqual(sim.pc, pc, what + ': the PC');
        assert.strictEqual(sim.lastAddress, pc, what + ': where EXAMINE NEXT goes on');
        const [id, params] = said[said.length - 1];
        if (pc) {
            assert.strictEqual(sim.lamps, pc, what + ': the lamps show it');
            assert.strictEqual(id, 'asm-loaded-at', what);
            assert.strictEqual(params.entry, Asm8080.hex(pc, 4), what);
        } else {
            assert.strictEqual(id, 'asm-loaded', what + ': RESET is the start, so no EXAMINE');
        }
        assert.strictEqual(sim.mem[0x30], 0x74, what + ': the data at 0030H');
        assert.strictEqual(sim.mem[org == '0000H' ? 0 : 3], 0x31, what + ': LXI SP');
    }
});

test('choosing an example asks first only if text would be lost (U5)', (t) => {
    // An unchanged example is not lost, whichever example it is and
    // however it came back - after a reload too, when nothing in the
    // page remembers having put it there.
    stub(t, panel, {
        examplePrograms: {
            a: {name: 'A', text: ' MVI A,1\n HLT\n'},
            b: {name: 'B', text: ' NOP\n'},
        },
    });
    let editor = '';
    const asked = [];
    const used = [];
    t.mock.method(asmtab, 'source', () => ({value: editor}));
    t.mock.method(asmtab, 'useExample', (id) => used.push(id));
    asmtab.replaceDialog = {open: () => asked.push(asmtab.pendingExample)};
    for (const [text, expectAsk] of [['', false], ['  \n', false],
                                     [' MVI A,1\n HLT\n', false],
                                     [' NOP\n', false],
                                     [' MVI A,2\n HLT\n', true],
                                     [' NOP', true]]) {
        editor = text;
        asked.length = 0;
        used.length = 0;
        asmtab.onExampleChosen('b');
        assert.deepStrictEqual([asked.length > 0, used.length > 0],
                               [expectAsk, !expectAsk], JSON.stringify(text));
    }
    asmtab.replaceDialog = null;
});
