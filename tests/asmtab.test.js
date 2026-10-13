/**
 * The Assembler tab's logic (js/asmtab.js) that does not need a page:
 * the highlighting, the listing beside the source, and the errors as
 * sentences. U2 and H2 in docs/assembler.md.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

global.Asm8080 = require('../js/asm8080.js');
vm.runInThisContext(fs.readFileSync(
    path.join(__dirname, '..', 'js', 'l10n.js'), 'utf8'), {filename: 'l10n.js'});
global.panel = {formatMemSize: (bytes) => (bytes < 1024 ? bytes + ' B' :
                                           bytes / 1024 + ' KB')};
const asmtab = require('../js/asmtab.js');

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
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
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
    const loaded = {text: text, rows: asmtab.pcRows(result)};
    const mem = new Array(256).fill(0);
    for (const [a, b] of result.memory) mem[a] = b;
    const at = (pc, extra = {}) => asmtab.pcLineOf(loaded, extra.text || text,
        Object.assign({on: true, running: false, pc: pc,
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
    mem[5] = 0x00;
    assert.strictEqual(at(5), 0, 'nor once the bytes under the PC changed');
    assert.strictEqual(asmtab.pcLineOf(null, text, {on: true, pc: 0,
                                                    read: () => 0}), 0);
});
