/**
 * The assembler (js/asm8080.js), against Intel's own manual: every
 * instruction, the manual's examples from Chapters 2 to 4 with the
 * bytes the manual gives, the simulator's example listings, and every
 * error. The decisions it checks are L1 to L22 in docs/assembler.md.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Asm8080 = require('../js/asm8080.js');
global.CPU8080 = require('../js/8080.js');
const Sim8800 = require('../js/sim8800.js');
const {loadExamples} = require('./examples.js');

/** Assembles, and gives the bytes from the lowest address, in hex. */
function hexOf(source, options) {
    const r = Asm8080.assemble(source, options);
    assert.deepStrictEqual(r.errors, [], 'errors in:\n' + source);
    const bytes = [];
    for (let a = r.start; a <= r.end; a++) {
        bytes.push(r.memory.has(a) ? r.memory.get(a) : 0);
    }
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
}

/** Assembles a program that must fail, and gives its error ids. */
function errorsOf(source, options) {
    const r = Asm8080.assemble(source, options);
    assert.strictEqual(r.ok, false, 'no error in:\n' + source);
    for (const e of r.errors) {
        assert.ok(Asm8080.ERRORS.includes(e.id), e.id + ' is not in ERRORS');
    }
    return r.errors.map((e) => e.id);
}

/** Lines of a program, indented as code. */
function program(...lines) {
    return lines.join('\n');
}

test('every documented opcode assembles back to itself', () => {
    // The disassembler writes $1234 where the manual writes 1234H.
    let checked = 0;
    for (let op = 0; op < 256; op++) {
        if (Sim8800.UNDOCUMENTED_OPCODES[op] !== undefined) {
            continue;
        }
        const [text, length] = CPU8080.disasm(op, 0x34, 0x12);
        const source = ' ' + text.replace(/,\s*/, ',')
              .replace(/\$([0-9A-F]+)/, (_, h) => '0' + h + 'H');
        const expected = [op, 0x34, 0x12].slice(0, length)
              .map((b) => b.toString(16).padStart(2, '0')).join(' ');
        assert.strictEqual(hexOf(source), expected, source);
        checked++;
    }
    assert.strictEqual(checked, 244, 'the 8080 documents 244 opcodes');
});

test('statements: labels, names, comments and case (L1, L2)', () => {
    assert.strictEqual(hexOf(program(
        'HERE:  MVI C,0      ; Load the C register with 0',
        'THERE: DB 3AH       ; Create a one-byte data constant',
        'LOOP1:',
        'LOOP2: MOV C,D',
        '       JMP LOOP1',
        '       JMP LOOP2')),
    '0e 00 3a 4a c3 03 00 c3 03 00');
    // Case does not matter, but inside quotes it does.
    assert.strictEqual(hexOf("loop: mvi a,'x'\n jmp LOOP"), '3e 78 c3 00 00');
    // Names longer than five characters are whole names.
    assert.strictEqual(hexOf('INSTRUCTION: NOP\nINSTRUMENT: JMP INSTRUCTION'),
                       '00 c3 00 00');
    // A colon after an EQU name is accepted.
    assert.strictEqual(hexOf('AFTER: EQU 5\n MVI A,AFTER'), '3e 05');
});

test('numbers, characters and $ (L3)', () => {
    assert.strictEqual(hexOf(' MVI C,0BAH\n MVI E,105\n MVI A,72Q\n' +
                             ' MVI B,72O\n MVI D,11110110B\n MVI L,105D'),
                       '0e ba 1e 69 3e 3a 06 3a 16 f6 2e 69');
    assert.strictEqual(hexOf(" MVI E,'*'\n DB ''''\n LXI H,'AB'"),
                       '1e 2a 27 21 42 41');
    assert.strictEqual(hexOf(' JMP 0010111011111010B'), 'c3 fa 2e');
    // GO: JMP $+6 jumps six bytes past itself.
    assert.strictEqual(hexOf(' NOP\nGO: JMP $+6'), '00 c3 07 00');
    // Double quotes, for other assemblers' programs (L12).
    assert.strictEqual(hexOf(' DB "Hi"'), '48 69');
    assert.deepStrictEqual(errorsOf(' MVI A,FFH'), ['undefined']);
    assert.deepStrictEqual(errorsOf(' MVI A,12B'), ['bad-number']);
    assert.deepStrictEqual(errorsOf(" DB 'unclosed"), ['unterminated-string']);
});

test('expressions, with the manual\'s values and its order (L4)', () => {
    // The manual's own: HERE SHR 8 at 2E1AH is 2EH; 34+40H/2 is 66;
    // (34+40H)/2 is 49; NOT 0 AND 0FFH fits in a byte.
    assert.strictEqual(hexOf(' ORG 2E1AH\nHERE: MVI C,HERE SHR 8'), '0e 2e');
    assert.strictEqual(hexOf(' MVI D,34+40H/2\n MVI D,(34+40H)/2'),
                       '16 42 16 31');
    assert.strictEqual(hexOf(' MVI H,NOT 0 AND 0FFH'), '26 ff');
    // Every operator.
    assert.strictEqual(hexOf(program(
        ' DW 7 MOD 3, 1 SHL 4, 80H SHR 3, 0F0H AND 3CH',
        ' DW 0F0H OR 0FH, 0FFH XOR 0FH, 3*4, 10-12, -1, 7/2')),
    '01 00 10 00 10 00 30 00 ff 00 f0 00 0c 00 fe ff ff ff 03 00');
    // NOT binds below + and -: NOT 1+1 is NOT 2.
    assert.strictEqual(hexOf(' DW NOT 1+1'), 'fd ff');
    assert.deepStrictEqual(errorsOf(' DB 1/0'), ['divide-by-zero']);
    // The word operators must be set off by blanks.
    assert.deepStrictEqual(errorsOf('VALUE EQU 5\n MVI C,VALUE AND0FH'),
                           ['bad-expression']);
});

test('an 8-bit operand must fit in a byte, as the manual says (L5)', () => {
    // "MVI H,NOT 0 is invalid, since NOT 0 produces ... FFFF."
    assert.deepStrictEqual(errorsOf(' MVI H,NOT 0'), ['byte-range']);
    assert.deepStrictEqual(errorsOf(' MVI A,-1'), ['byte-range']);
    assert.deepStrictEqual(errorsOf(' DB 100H'), ['byte-range']);
    assert.deepStrictEqual(errorsOf(' RST 8'), ['rst-range']);
    assert.strictEqual(hexOf(' MVI A,0FFH\n MVI A,-1 AND 0FFH\n RST 7'),
                       '3e ff 3e ff ff');
});

test('registers are numbers, and pairs are checked (L6)', () => {
    // MVI 10B,... loads register two, the D register.
    assert.strictEqual(hexOf(' MVI 10B,11110110B'), '16 f6');
    assert.strictEqual(hexOf('VALUE EQU 9FH\nA1: MVI D,VALUE\nA2: MVI 2,9FH\n' +
                             'A3: MVI 2,VALUE'), '16 9f 16 9f 16 9f');
    assert.strictEqual(hexOf('REG4 EQU 4\n MVI REG4,2EH\n MVI 4H,2EH\n' +
                             ' MVI 8/2,2EH'), '26 2e 26 2e 26 2e');
    assert.strictEqual(hexOf(' LXI SP,0\n PUSH PSW\n POP 6\n LDAX D\n DAD 4'),
                       '31 00 00 f5 f1 1a 29');
    assert.deepStrictEqual(errorsOf(' PUSH SP'), ['not-pair-psw']);
    assert.deepStrictEqual(errorsOf(' LXI PSW,0'), ['not-pair']);
    assert.deepStrictEqual(errorsOf(' LDAX H'), ['not-bd']);
    assert.deepStrictEqual(errorsOf(' MOV A,8'), ['not-register']);
    assert.deepStrictEqual(errorsOf(' MOV M,M'), ['mov-m-m']);
});

test('an instruction in parentheses is its encoding (L7)', () => {
    // "INS: DB (ADD C)" defines a byte of 81H.
    assert.strictEqual(hexOf('INS: DB (ADD C)'), '81');
    assert.strictEqual(hexOf(' DW (MVI A,5)'), '05 3e');
});

test('ORG and END (L8)', () => {
    // The manual's ORG example: HERE names 1006H, where the jump ends.
    const r = Asm8080.assemble(program(
        ' ORG 1000H',
        ' MOV A,C',
        ' ADI 2',
        ' JMP NEXT',
        'HERE: ORG 1050H',
        'NEXT: XRA A'));
    assert.deepStrictEqual(r.errors, []);
    assert.strictEqual(r.symbols.HERE, 0x1006);
    assert.strictEqual(r.symbols.NEXT, 0x1050);
    assert.deepStrictEqual([0x1000, 0x1001, 0x1002, 0x1003, 0x1004, 0x1005,
                            0x1050].map((a) => r.memory.get(a)),
                           [0x79, 0xc6, 0x02, 0xc3, 0x50, 0x10, 0xaf]);
    assert.strictEqual(r.entry, 0x1000, 'the program starts where it starts');
    // Anything after END is not read; END itself is optional.
    assert.strictEqual(hexOf(' NOP\n END\n this is not code'), '00');
    assert.strictEqual(hexOf(' NOP'), '00');
});

test('EQU and SET (L9)', () => {
    assert.strictEqual(hexOf('PTO EQU 8\n OUT PTO'), 'd3 08');
    assert.strictEqual(hexOf('IMMED SET 5\n ADI IMMED\nIMMED SET 10H-6\n' +
                             ' ADI IMMED'), 'c6 05 c6 0a');
    // An EQU may use a label defined further down.
    assert.strictEqual(hexOf('LEN EQU FIN-START\nSTART: DB 1,2,3\nFIN: DB LEN'),
                       '01 02 03 03');
    assert.deepStrictEqual(errorsOf('X EQU 1\nX EQU 2'), ['duplicate']);
    assert.deepStrictEqual(errorsOf('X EQU 1\nX SET 2'), ['set-of-equ']);
    assert.deepStrictEqual(errorsOf('X SET 1\nX EQU 2'), ['equ-of-set']);
    assert.deepStrictEqual(errorsOf(' EQU 5'), ['needs-name']);
    assert.deepStrictEqual(errorsOf('MOV EQU 5'), ['reserved']);
});

test('DB, DW and DS (L10)', () => {
    // The manual's STR: the string, then the bytes.
    assert.strictEqual(hexOf("STR: DB 'STRING 1'"),
                       '53 54 52 49 4e 47 20 31');
    assert.strictEqual(hexOf(" DB 'HELLO',0DH,0AH,0\n DW 1234H,5"),
                       '48 45 4c 4c 4f 0d 0a 00 34 12 05 00');
    // DS reserves, and ORG $+12 does the same.
    const a = Asm8080.assemble(' MOV A,C\n JMP NEXT\n DS 12\nNEXT: XRA A');
    const b = Asm8080.assemble(' MOV A,C\n JMP NEXT\n ORG $+12\nNEXT: XRA A');
    assert.strictEqual(a.symbols.NEXT, 16);
    assert.strictEqual(b.symbols.NEXT, 16);
    assert.strictEqual(a.size, 5, 'reserved bytes are not data');
});

test('IF and ENDIF (L11)', () => {
    assert.strictEqual(hexOf(program(
        'COND SET 0FFH',
        ' IF COND',
        ' MOV A,C',
        ' ENDIF',
        'COND SET 0',
        ' IF COND',
        ' MOV A,C',
        ' ENDIF',
        ' XRA C')), '79 a9');
    assert.strictEqual(hexOf(' IF 1\n IF 0\n NOP\n ENDIF\n HLT\n ENDIF'), '76');
    assert.deepStrictEqual(errorsOf(' ENDIF'), ['endif-without-if']);
    assert.deepStrictEqual(errorsOf(' IF 1\n NOP'), ['if-without-endif']);
});

test('other assemblers\' directives, and INCLUDE refused (L12)', () => {
    assert.strictEqual(hexOf(' TITLE "Hello"\n PAGE 40\n NEWPAGE 0\n NOP'),
                       '00');
    // Not Intel's, so free as names: a label may be called TITLE.
    assert.strictEqual(hexOf('TITLE: DB 1\n LXI H,TITLE'), '01 21 00 00');
    assert.deepStrictEqual(errorsOf(' INCLUDE stdlib'), ['include']);
    assert.deepStrictEqual(errorsOf(' ELSE'), ['unknown-code']);
});

test('what decides the layout must be known when it is reached (L13)', () => {
    assert.deepStrictEqual(errorsOf(' ORG START\nSTART: NOP'), ['later']);
    assert.deepStrictEqual(errorsOf(' DS SIZE\nSIZE EQU 4'), ['later']);
    assert.deepStrictEqual(errorsOf(' IF FLAG\n NOP\n ENDIF\nFLAG EQU 1'),
                           ['later']);
    // A jump forward is not layout.
    assert.strictEqual(hexOf(' JMP DONE\nDONE: HLT'), 'c3 03 00 76');
});

test('every error is reported, with its line, and nothing loads (L14)', () => {
    const r = Asm8080.assemble(program(
        ' NOP',
        ' MVX A',
        ' MVI A',
        ' NOP',
        ' JMP NOWHERE'));
    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(r.errors.map((e) => [e.line, e.id]),
                           [[2, 'unknown-code'], [3, 'operands'],
                            [5, 'undefined']]);
    assert.strictEqual(r.errors[1].params.example, 'MVI A,3FH',
                       'the message shows how it is written');
    // A label written without its colon reads as an unknown code.
    assert.deepStrictEqual(errorsOf('LOOP MOV A,B'), ['unknown-code']);
    assert.deepStrictEqual(errorsOf('X: NOP\nX: NOP'), ['duplicate']);
    assert.deepStrictEqual(errorsOf(' MVI A,#1'), ['bad-character']);
});

test('a program must fit the machine (L15)', () => {
    assert.deepStrictEqual(errorsOf(' ORG 0FFH\n LXI H,0', {memSize: 256}),
                           ['too-big']);
    assert.strictEqual(hexOf(' ORG 0FFH\n NOP', {memSize: 256}), '00');
    const r = Asm8080.assemble(' ORG 0\n DB 1\n ORG 0\n DB 2');
    assert.deepStrictEqual(r.errors.map((e) => [e.line, e.id, e.params.other]),
                           [[4, 'overlap', 2]]);
});

test('a macro is defined, then used, and its body expanded (L16, L18)', () => {
    // SHRT: the manual's first macro.
    assert.strictEqual(hexOf(program(
        'SHRT MACRO',
        ' RRC',
        ' ANI 7FH',
        ' ENDM',
        ' LDA TEMP',
        ' SHRT',
        ' STA TEMP',
        'TEMP: DB 0')), '3a 09 00 0f e6 7f 32 09 00 00');
    assert.deepStrictEqual(errorsOf(' FOO\nFOO MACRO\n NOP\n ENDM'),
                           ['macro-before-definition']);
    assert.deepStrictEqual(errorsOf('X MACRO\n NOP\n ENDM\nX MACRO\n NOP\n ENDM'),
                           ['macro-twice']);
    assert.deepStrictEqual(errorsOf('X MACRO\nY MACRO\n ENDM\n ENDM'),
                           ['macro-in-macro', 'endm-without-macro']);
    assert.deepStrictEqual(errorsOf('X MACRO\n NOP'), ['macro-without-endm']);
    assert.deepStrictEqual(errorsOf('R MACRO\n R\n ENDM\n R'), ['macro-depth']);
    // MAC C expands to PUSH C, an illegal statement (the manual's MAC).
    const r = Asm8080.assemble('MAC MACRO P1\n PUSH P1\n ENDM\n MAC B\n MAC C');
    assert.deepStrictEqual(r.errors.map((e) => [e.line, e.id, e.macro,
                                               e.macroLine]),
                           [[5, 'not-pair-psw', 'MAC', 2]]);
});

test('arguments: by value, or quoted by text (L17)', () => {
    // MAC1: missing arguments are empty, and text is passed quoted.
    assert.strictEqual(hexOf(program(
        'MAC1 MACRO P1,P2,COMMENT',
        ' XRA P2',
        ' DCR P1 COMMENT',
        ' ENDM',
        " MAC1 C,D,'; DECREMENT REG C'",
        ' MAC1 E,B')), 'aa 0d a8 1d');
    // MAC4: unquoted is the value at the reference, quoted the text.
    const mac4 = 'ABC SET 3\nMAC4 MACRO P1\nABC SET 14\n DB P1\n ENDM\n';
    assert.strictEqual(hexOf(mac4 + ' MAC4 ABC'), '03');
    assert.strictEqual(hexOf(mac4 + " MAC4 'ABC'"), '0e');
    // LIND and IXAD, the manual's useful macros.
    assert.strictEqual(hexOf(program(
        'LIND MACRO RI,INADD',
        ' LHLD INADD',
        ' MOV RI,M',
        ' ENDM',
        ' LIND C,LABEL',
        'LABEL: DW 1350H')), '2a 04 00 4e 50 13');
    assert.strictEqual(hexOf(program(
        'IXAD MACRO RP,BSADD',
        ' LXI H,BSADD',
        ' DAD RP',
        ' ENDM',
        ' MVI D,1',
        ' MVI E,2EH',
        ' IXAD D,LABEL',
        'LABEL: NOP')), '16 01 1e 2e 21 08 00 19 00');
    // Macros using macros.
    assert.strictEqual(hexOf(program(
        'INNER MACRO X',
        ' MVI A,X',
        ' ENDM',
        'OUTER MACRO Y',
        ' INNER Y+1',
        ' INNER Y+2',
        ' ENDM',
        ' OUTER 10')), '3e 0b 3e 0c');
    assert.deepStrictEqual(errorsOf('M1 MACRO X\n DB X\n ENDM\n M1 MOV'),
                           ['macro-arg']);
});

test('labels in a macro are local, and :: makes one global (L19)', () => {
    // TMAC: each expansion jumps to its own LOOP.
    assert.strictEqual(hexOf(program(
        'TMAC MACRO',
        'LOOP: DCR B',
        ' JNZ LOOP',
        ' ENDM',
        ' TMAC',
        ' TMAC')), '05 c2 00 00 05 c2 04 00');
    assert.deepStrictEqual(errorsOf(program(
        'TMAC MACRO',
        'LOOP:: DCR B',
        ' JNZ LOOP',
        ' ENDM',
        ' TMAC',
        ' TMAC')), ['duplicate']);
});

test('EQU names in a macro are local; SET names follow the manual (L20)', () => {
    // EQMAC: VAL is 8 inside, and stays 6 outside.
    assert.strictEqual(hexOf(program(
        'VAL EQU 6',
        'DB1: DB VAL',
        'EQMAC MACRO',
        'VAL EQU 8',
        ' DB VAL',
        ' ENDM',
        ' EQMAC',
        'DB2: DB VAL')), '06 08 06');
    // STMAC: a global SYM is changed for everything after.
    const stmac = 'STMAC MACRO\nSYM SET 5\n DB SYM\n ENDM\n';
    assert.strictEqual(hexOf('SYM SET 0\nDB1: DB SYM\n' + stmac +
                             ' STMAC\nDB2: DB SYM'), '00 05 05');
    // With no global SYM, the macro's is local, and unknown after it.
    const r = Asm8080.assemble(stmac + ' STMAC\nDB3: DB SYM');
    assert.deepStrictEqual(r.errors.map((e) => [e.line, e.id]),
                           [[6, 'undefined']]);
});

test('IF and SET alter a macro\'s later expansions (L21)', () => {
    // SBMAC, from Chapter 4: the subroutine is generated the first time
    // only. (The manual names a label OUT, which is a mnemonic and so
    // cannot be a label; it is SKIP here.)
    const r = Asm8080.assemble(program(
        'FIRST SET 0FFH',
        'SBMAC MACRO',
        ' CALL SUBR',
        ' IF FIRST',
        'FIRST SET 0',
        ' JMP SKIP',
        'SUBR:: NOP',
        ' RET',
        'SKIP: NOP',
        ' ENDIF',
        ' ENDM',
        ' SBMAC',
        ' SBMAC',
        ' HLT'));
    assert.deepStrictEqual(r.errors, []);
    const bytes = [];
    for (let a = r.start; a <= r.end; a++) bytes.push(r.memory.get(a));
    // CALL 0006 / JMP 0008 / NOP / RET / NOP / CALL 0006 / HLT
    assert.deepStrictEqual(bytes, [0xcd, 0x06, 0x00, 0xc3, 0x08, 0x00, 0x00,
                                   0xc9, 0x00, 0xcd, 0x06, 0x00, 0x76]);
});

test('an error in an expansion names both lines (L22)', () => {
    const r = Asm8080.assemble(program(
        'MX MACRO',
        ' NOP',
        ' MVI A',
        ' ENDM',
        ' MX'));
    assert.deepStrictEqual(r.errors.map((e) => [e.line, e.id, e.macroLine]),
                           [[5, 'operands', 3]]);
    // The listing shows the use, then its expansion.
    const rows = r.rows.filter((row) => row.line == 5);
    assert.deepStrictEqual(rows.map((row) => [row.depth, row.text.trim()]),
                           [[0, 'MX'], [1, 'NOP'], [1, 'MVI A']]);
});

test('the listing has a row per line, with its address and bytes', () => {
    const r = Asm8080.assemble(program(
        '; a comment',
        'PORT EQU 0FFH',
        'LOOP: IN PORT',
        ' OUT PORT',
        ' JMP LOOP'));
    assert.deepStrictEqual(
        r.rows.map((row) => [row.line, row.address, row.bytes, row.value]),
        [[1, null, [], null], [2, null, [], 0xff], [3, 0, [0xdb, 0xff], null],
         [4, 2, [0xd3, 0xff], null], [5, 4, [0xc3, 0x00, 0x00], null]]);
});

test('the simulator\'s example listings reassemble to their bytes', () => {
    // Each listing is source beside its bytes. Its source column,
    // assembled, must give exactly the bytes listed - which the other
    // tests prove run.
    for (const example of loadExamples()) {
        const labelOf = {};
        for (const [name, address] of Object.entries(example.labels)) {
            labelOf[address] = name;
        }
        const source = example.lines.map((line) =>
            ' ORG ' + line.address + '\n' +
            (labelOf[line.address] ? labelOf[line.address] + ': ' : ' ') +
            line.source).join('\n');
        const r = Asm8080.assemble(source);
        assert.deepStrictEqual(r.errors, [], example.id);
        const bytes = [];
        for (const line of example.lines) {
            for (let i = 0; i < line.bytes.length; i++) {
                bytes.push(r.memory.get(line.address + i));
            }
        }
        assert.deepStrictEqual(bytes, example.bytes, example.id);
    }
});

test('the tokens give the line back, and say what each piece is', () => {
    const line = "LOOP: MVI A,'x' ; go  ";
    const tokens = Asm8080.tokenize(line);
    assert.strictEqual(tokens.map((t) => t.text).join(''), line);
    assert.deepStrictEqual(tokens.filter((t) => t.type != 'space')
                           .map((t) => t.type),
                           ['name', 'colon', 'name', 'name', 'comma',
                            'string', 'comment']);
    assert.strictEqual(Asm8080.classify('mvi'), 'mnemonic');
    assert.strictEqual(Asm8080.classify('DB'), 'pseudo');
    assert.strictEqual(Asm8080.classify('psw'), 'register');
    assert.strictEqual(Asm8080.classify('SHR'), 'operator');
    assert.strictEqual(Asm8080.classify('LOOP'), null);
    assert.deepStrictEqual([...Asm8080.macroNames('SHRT MACRO\n RRC\n ENDM\n' +
                                                  'x: macro p\n endm')],
                           ['SHRT', 'X']);
});

test('every error the assembler can report has its message', () => {
    // The page says each error as the message 'asm-' + its id (L14).
    const fs = require('node:fs');
    const vm = require('node:vm');
    vm.runInThisContext(fs.readFileSync(
        require.resolve('../js/l10n.js'), 'utf8'), {filename: 'l10n.js'});
    const l10n = globalThis.l10n;
    for (const id of Asm8080.ERRORS) {
        assert.ok(l10n.MESSAGES['asm-' + id], 'no message for ' + id);
    }
    // And every id the code can raise is in the list: the first id
    // after error: or id:, and in an error() or fail() call each quoted
    // word that is not the far side of a comparison.
    const code = fs.readFileSync(require.resolve('../js/asm8080.js'), 'utf8');
    const raised = new Set();
    for (const m of code.matchAll(/(?:error|id): '([a-z][a-z0-9-]+)'/g)) {
        raised.add(m[1]);
    }
    for (const m of code.matchAll(/(?:this\.error|fail)\(([^{;]*)/g)) {
        for (const q of m[1].matchAll(/(==\s*)?'([a-z][a-z0-9-]+)'/g)) {
            if (!q[1]) raised.add(q[2]);
        }
    }
    for (const id of raised) {
        assert.ok(Asm8080.ERRORS.includes(id), id + ' is raised but not listed');
    }
    assert.ok(raised.size >= 30, 'expected to find the raises: ' + raised.size);
});
