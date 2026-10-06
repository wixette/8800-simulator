/**
 *   Copyright 2020-2026 wixette@gmail.com
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 * @fileoverview An assembler for Intel's 8080 assembly language.
 */


/**
 * Assembles 8080 source into bytes, as Intel's 1975 *8080 Assembly
 * Language Programming Manual* defines the language: its Chapter 2,
 * the instructions, operands, expressions and pseudo-instructions, and
 * its Chapter 3, macros. The decisions behind it are L1 to L22 in
 * docs/assembler.md, which the comments below cite.
 *
 * No page here and no machine: source text in, and out come the bytes
 * by address, a listing row per line, the symbols and the errors. The
 * Assembler tab (js/asmtab.js) puts the bytes into the simulator, and
 * the tests run it in Node.
 *
 * Errors are ids with parameters, not text, so that the page can say
 * them in the reader's language; the ids are the l10n message ids,
 * each prefixed 'asm-'.
 */
class Asm8080 {
    /**
     * Assembles a program.
     * @param {string} source The program.
     * @param {{memSize: (number|undefined)}=} options The memory the
     *     program must fit in, if any (L15).
     * @return {!Object} {ok, memory: Map<address, byte>, start, end,
     *     entry, size, rows, errors, symbols}: whether it assembled
     *     without error; the bytes; the lowest and highest address
     *     written, the address of the first byte, and how many bytes;
     *     the listing; the errors; and the global symbols.
     */
    static assemble(source, options = {}) {
        var lines = String(source).split(/\r\n|\r|\n/);
        var previous = null;
        var state = null;
        // Layout passes until every symbol settles, then one that
        // emits. Forward references resolve from the pass before (L13);
        // a program whose layout itself depended on one would not
        // settle, and is caught by the rules on ORG, DS and IF.
        for (let pass = 0; pass < Asm8080.MAX_PASSES; pass++) {
            state = new Asm8080.Pass(lines, previous, false);
            state.run();
            if (previous && state.sameLayout(previous)) {
                break;
            }
            previous = state;
        }
        var final = new Asm8080.Pass(lines, state, true);
        final.run();
        final.finish(options);
        return final.result();
    }

    /**
     * Splits one line into tokens, for the assembler and for the
     * Assembler tab's highlighting, which colours exactly what the
     * assembler reads.
     * @param {string} line One line of source.
     * @return {!Array<{type: string, text: string, start: number}>}
     *     The tokens, blanks included, so that their texts joined give
     *     the line back. Types: 'space', 'comment', 'string', 'number',
     *     'name', 'dollar', 'colon' (':' or '::'), 'comma', 'paren',
     *     'op' (+ - * /), 'bad' (an unterminated string, or a character
     *     the language has no use for).
     */
    static tokenize(line) {
        var tokens = [];
        var i = 0;
        var n = line.length;
        var push = function(type, end) {
            tokens.push({type: type, text: line.slice(i, end), start: i});
            i = end;
        };
        while (i < n) {
            var c = line[i];
            var j = i + 1;
            if (c == ' ' || c == '\t') {
                while (j < n && (line[j] == ' ' || line[j] == '\t')) j++;
                push('space', j);
            } else if (c == ';') {
                push('comment', n);
            } else if (c == "'" || c == '"') {
                // A quote inside is written twice (L3).
                var closed = false;
                while (j < n) {
                    if (line[j] == c) {
                        if (line[j + 1] == c) {
                            j += 2;
                            continue;
                        }
                        closed = true;
                        j++;
                        break;
                    }
                    j++;
                }
                push(closed ? 'string' : 'bad', j);
            } else if (/[0-9]/.test(c)) {
                while (j < n && /[0-9A-Za-z]/.test(line[j])) j++;
                push('number', j);
            } else if (/[A-Za-z@?_]/.test(c)) {
                while (j < n && /[0-9A-Za-z@?_]/.test(line[j])) j++;
                push('name', j);
            } else if (c == '$') {
                push('dollar', j);
            } else if (c == ':') {
                push('colon', line[j] == ':' ? j + 1 : j);
            } else if (c == ',') {
                push('comma', j);
            } else if (c == '(' || c == ')') {
                push('paren', j);
            } else if ('+-*/'.indexOf(c) >= 0) {
                push('op', j);
            } else {
                push('bad', j);
            }
        }
        return tokens;
    }

    /**
     * What a word is, for the highlighting.
     * @param {string} word A name token's text.
     * @return {?string} 'mnemonic', 'pseudo', 'register', 'operator',
     *     or null for anything else.
     */
    static classify(word) {
        var upper = word.toUpperCase();
        if (Asm8080.INSTRUCTIONS[upper]) return 'mnemonic';
        if (Asm8080.PSEUDO.indexOf(upper) >= 0) return 'pseudo';
        if (Asm8080.REGISTERS.hasOwnProperty(upper)) return 'register';
        if (Asm8080.WORD_OPERATORS.hasOwnProperty(upper)) return 'operator';
        return null;
    }

    /**
     * Whether a word is the language's own, and so cannot name anything
     * (L2): a mnemonic, one of Intel's pseudo-instructions, a register
     * or an operator. The directives kept for other assemblers' programs
     * (L12) are not Intel's, and remain free as names.
     * @param {string} word A name.
     * @return {boolean}
     */
    static isReserved(word) {
        var upper = word.toUpperCase();
        return !!Asm8080.INSTRUCTIONS[upper] ||
            Asm8080.INTEL_PSEUDO.indexOf(upper) >= 0 ||
            Asm8080.REGISTERS.hasOwnProperty(upper) ||
            Asm8080.WORD_OPERATORS.hasOwnProperty(upper);
    }

    /**
     * The names a source defines as macros, for the highlighting.
     * @param {string} source The program.
     * @return {!Set<string>} The macro names, in upper case.
     */
    static macroNames(source) {
        var names = new Set();
        var re = /^\s*([A-Za-z@?_][0-9A-Za-z@?_]*):?\s+MACRO\b/gim;
        var m;
        while ((m = re.exec(source))) {
            names.add(m[1].toUpperCase());
        }
        return names;
    }

    /**
     * A number written as the manual writes them (L3): hexadecimal
     * ending in H, octal in O or Q, binary in B, decimal in D or with
     * nothing.
     * @param {string} text The number token.
     * @return {?number} Its value, or null if it is not a number.
     */
    static parseNumber(text) {
        var t = text.toUpperCase();
        var radix = {H: 16, O: 8, Q: 8, B: 2, D: 10}[t[t.length - 1]];
        var digits = radix ? t.slice(0, -1) : t;
        radix = radix || 10;
        var valid = {16: /^[0-9A-F]+$/, 10: /^[0-9]+$/, 8: /^[0-7]+$/,
                     2: /^[01]+$/}[radix];
        if (!digits || !valid.test(digits)) {
            return null;
        }
        return parseInt(digits, radix);
    }

    /**
     * Writes a number the way the listing and the messages do.
     * @param {number} n The number.
     * @param {number} digits How many hex digits.
     * @return {string}
     */
    static hex(n, digits) {
        return n.toString(16).toUpperCase().padStart(digits, '0');
    }
}

/** How many layout passes to try before giving up on a layout. */
Asm8080.MAX_PASSES = 6;

/** How deep macro expansions may nest (L16). */
Asm8080.MAX_DEPTH = 16;

/** After this many errors, no more are listed (L14). */
Asm8080.MAX_ERRORS = 100;

/**
 * The registers as the manual defines them, set before every assembly
 * (L6). SP and PSW stand for register pair 6.
 * @type {Object<string, number>}
 */
Asm8080.REGISTERS = {B: 0, C: 1, D: 2, E: 3, H: 4, L: 5, M: 6, A: 7,
                     SP: 6, PSW: 6};

/**
 * The word operators, and how tightly each binds (L4). Higher binds
 * tighter; + and - are 4, and NOT, a prefix, is 3.
 * @type {Object<string, number>}
 */
Asm8080.WORD_OPERATORS = {OR: 1, XOR: 1, AND: 2, NOT: 3,
                          MOD: 5, SHL: 5, SHR: 5};

/**
 * The pseudo-instructions, the three listing directives kept for other
 * assemblers' programs (L12), and INCLUDE, which is refused.
 * @type {Array<string>}
 */
Asm8080.INTEL_PSEUDO = ['ORG', 'EQU', 'SET', 'END', 'IF', 'ENDIF', 'MACRO',
                        'ENDM', 'DB', 'DW', 'DS'];
Asm8080.PSEUDO = Asm8080.INTEL_PSEUDO.concat(['TITLE', 'PAGE', 'NEWPAGE',
                                              'INCLUDE']);

/**
 * Every instruction, by mnemonic: its operands and how it encodes,
 * from the manual's Appendix A. A test checks every one against the
 * CPU core's disassembler.
 *
 * Operand kinds: r, a register 0-7; rp, a pair (0, 2, 4 or SP);
 * rpsw, a pair for PUSH and POP (0, 2, 4 or PSW); bd, the pair B or D
 * only; d8, a byte; d16, a word; a16, an address; n, 0-7 for RST.
 * The opcode is the base plus each operand's field, shifted as given.
 * @type {Object<string, {base: number, ops: Array<string>}>}
 */
Asm8080.INSTRUCTIONS = (function() {
    var table = {};
    var add = function(name, base, ops) {
        table[name] = {base: base, ops: ops || []};
    };
    // No operand.
    [['NOP', 0x00], ['HLT', 0x76], ['RLC', 0x07], ['RRC', 0x0f],
     ['RAL', 0x17], ['RAR', 0x1f], ['DAA', 0x27], ['CMA', 0x2f],
     ['STC', 0x37], ['CMC', 0x3f], ['XCHG', 0xeb], ['XTHL', 0xe3],
     ['SPHL', 0xf9], ['PCHL', 0xe9], ['EI', 0xfb], ['DI', 0xf3],
     ['RET', 0xc9], ['RNZ', 0xc0], ['RZ', 0xc8], ['RNC', 0xd0],
     ['RC', 0xd8], ['RPO', 0xe0], ['RPE', 0xe8], ['RP', 0xf0],
     ['RM', 0xf8]].forEach(function(e) { add(e[0], e[1]); });
    add('MOV', 0x40, ['r3', 'r']);
    add('MVI', 0x06, ['r3', 'd8']);
    add('INR', 0x04, ['r3']);
    add('DCR', 0x05, ['r3']);
    [['ADD', 0x80], ['ADC', 0x88], ['SUB', 0x90], ['SBB', 0x98],
     ['ANA', 0xa0], ['XRA', 0xa8], ['ORA', 0xb0], ['CMP', 0xb8]]
        .forEach(function(e) { add(e[0], e[1], ['r']); });
    [['ADI', 0xc6], ['ACI', 0xce], ['SUI', 0xd6], ['SBI', 0xde],
     ['ANI', 0xe6], ['XRI', 0xee], ['ORI', 0xf6], ['CPI', 0xfe],
     ['IN', 0xdb], ['OUT', 0xd3]]
        .forEach(function(e) { add(e[0], e[1], ['d8']); });
    add('LXI', 0x01, ['rp', 'd16']);
    add('DAD', 0x09, ['rp']);
    add('INX', 0x03, ['rp']);
    add('DCX', 0x0b, ['rp']);
    add('PUSH', 0xc5, ['rpsw']);
    add('POP', 0xc1, ['rpsw']);
    add('LDAX', 0x0a, ['bd']);
    add('STAX', 0x02, ['bd']);
    [['LDA', 0x3a], ['STA', 0x32], ['LHLD', 0x2a], ['SHLD', 0x22],
     ['JMP', 0xc3], ['CALL', 0xcd],
     ['JNZ', 0xc2], ['JZ', 0xca], ['JNC', 0xd2], ['JC', 0xda],
     ['JPO', 0xe2], ['JPE', 0xea], ['JP', 0xf2], ['JM', 0xfa],
     ['CNZ', 0xc4], ['CZ', 0xcc], ['CNC', 0xd4], ['CC', 0xdc],
     ['CPO', 0xe4], ['CPE', 0xec], ['CP', 0xf4], ['CM', 0xfc]]
        .forEach(function(e) { add(e[0], e[1], ['a16']); });
    add('RST', 0xc7, ['n']);
    return table;
})();

/**
 * An example of each instruction's operands, for the error that says
 * what an instruction needs (L14).
 * @type {Object<string, string>}
 */
Asm8080.OPERAND_EXAMPLES = {
    r3r: 'MOV A,B', r3d8: 'MVI A,3FH', r3: 'INR A', r: 'ADD B',
    d8: 'ADI 1', rpd16: 'LXI H,1234H', rp: 'INX H', rpsw: 'PUSH B',
    bd: 'LDAX B', a16: 'JMP 0000H', n: 'RST 7', '': 'NOP',
};

/**
 * One pass over the program. The assembler makes several, each from
 * the top with fresh state; all but the last only lay the program out,
 * and the last also emits its bytes and keeps its errors.
 */
Asm8080.Pass = class {
    /**
     * @param {!Array<string>} lines The program's lines.
     * @param {?Asm8080.Pass} previous The pass before, whose symbols
     *     resolve forward references.
     * @param {boolean} emit Whether this is the pass that counts.
     */
    constructor(lines, previous, emit) {
        this.lines = lines;
        this.previous = previous;
        this.emit = emit;
        this.address = 0;
        // Global symbols: name -> {value, kind: 'label'|'equ'|'set',
        // known, line}. Local ones live on the expansion's scope.
        this.symbols = new Map();
        this.macros = new Map();
        // Every macro expansion, in order, gets a number; its local
        // symbols are found again by that number in the next pass.
        this.expansions = 0;
        this.locals = new Map();
        this.memory = new Map();
        this.owner = new Map();
        this.rows = [];
        this.errors = [];
        this.first = null;
        this.ended = false;
    }

    /** Runs the pass over the whole program. */
    run() {
        var source = this.lines.map(function(text, i) {
            return {text: text, line: i + 1};
        });
        this.block(source, null);
    }

    /**
     * Whether this pass laid the program out as another did: every
     * global label at the same address, and every local one.
     * @param {!Asm8080.Pass} other
     * @return {boolean}
     */
    sameLayout(other) {
        if (this.symbols.size != other.symbols.size ||
            this.expansions != other.expansions) {
            return false;
        }
        for (const [name, sym] of this.symbols) {
            let o = other.symbols.get(name);
            if (!o || o.value !== sym.value || o.known !== sym.known) {
                return false;
            }
        }
        for (const [id, scope] of this.locals) {
            let o = other.locals.get(id);
            if (!o) return false;
            for (const [name, sym] of scope) {
                let s = o.get(name);
                if (!s || s.value !== sym.value) return false;
            }
        }
        return true;
    }

    /**
     * Processes a run of lines: the program, or one macro expansion.
     * @param {!Array<{text: string, line: number}>} source The lines.
     *     Inside an expansion, line is the body's line in the source.
     * @param {?Object} scope The expansion, or null for the program:
     *     {id, depth, symbols, macro, at}.
     */
    block(source, scope) {
        var conditions = [];
        for (let i = 0; i < source.length && !this.ended; i++) {
            let entry = source[i];
            let skipping = conditions.some(function(on) { return !on; });
            let stmt = this.parse(entry, scope);
            let code = stmt.code;
            if (code == 'MACRO') {
                // The definition runs to its ENDM, skipped or not, so
                // that an IF inside it is not counted here.
                let end = this.findEndm(source, i, scope);
                if (!skipping) {
                    this.defineMacro(stmt, source.slice(i + 1, end), scope,
                                     entry);
                }
                this.row(entry, scope, null, [], skipping);
                for (let k = i + 1; k < end && k < source.length; k++) {
                    this.row(source[k], scope, null, [], true, 'body');
                }
                if (end < source.length) {
                    this.row(source[end], scope, null, [], skipping);
                }
                i = end;
                continue;
            }
            if (code == 'IF') {
                let on = false;
                if (!skipping) {
                    let v = this.evaluateEarly(stmt, stmt.operands[0], scope,
                                               entry);
                    on = v !== null && v != 0;
                }
                conditions.push(on);
                this.row(entry, scope, null, [], skipping);
                continue;
            }
            if (code == 'ENDIF') {
                if (!conditions.length) {
                    this.error(entry, scope, 'endif-without-if');
                } else {
                    conditions.pop();
                }
                this.row(entry, scope, null, [], skipping);
                continue;
            }
            if (skipping) {
                this.row(entry, scope, null, [], true);
                continue;
            }
            this.statement(stmt, entry, scope);
        }
        if (conditions.length && !this.ended) {
            this.error(source[source.length - 1] || {line: 0}, scope,
                       'if-without-endif');
        }
    }

    /**
     * Finds the ENDM that closes a MACRO.
     * @return {number} Its index, or the length of source if none.
     */
    findEndm(source, start, scope) {
        for (let k = start + 1; k < source.length; k++) {
            let code = this.parse(source[k], scope).code;
            if (code == 'ENDM') {
                return k;
            }
            if (code == 'MACRO') {
                this.error(source[k], scope, 'macro-in-macro');
            }
        }
        this.error(source[start], scope, 'macro-without-endm');
        return source.length;
    }

    /**
     * Reads a line's fields (L1).
     * @return {!Object} {label, global, name, code, operands, tokens,
     *     bad}: the label and whether it had two colons, the name on an
     *     EQU, SET or MACRO, the code in upper case, the operands as
     *     token lists, and the first bad token, if any.
     */
    parse(entry, scope) {
        var all = Asm8080.tokenize(entry.text);
        var tokens = all.filter(function(t) {
            return t.type != 'space' && t.type != 'comment';
        });
        var stmt = {label: null, global: false, name: null, code: null,
                    operands: [], tokens: tokens, bad: null};
        var k = 0;
        var bad = tokens.find(function(t) { return t.type == 'bad'; });
        if (bad) {
            stmt.bad = bad;
        }
        // LABEL: or LABEL::
        if (tokens[0] && tokens[0].type == 'name' && tokens[1] &&
            tokens[1].type == 'colon') {
            stmt.label = tokens[0].text;
            stmt.global = tokens[1].text == '::';
            k = 2;
        }
        // NAME EQU, NAME SET, NAME MACRO - with or without a colon.
        var namedCode = function(t) {
            return t && t.type == 'name' &&
                ['EQU', 'SET', 'MACRO'].indexOf(t.text.toUpperCase()) >= 0;
        };
        if (stmt.label && namedCode(tokens[k])) {
            stmt.name = stmt.label;
            stmt.label = null;
        } else if (!stmt.label && tokens[k] && tokens[k].type == 'name' &&
                   namedCode(tokens[k + 1])) {
            stmt.name = tokens[k].text;
            k++;
        }
        if (tokens[k]) {
            if (tokens[k].type == 'name') {
                stmt.code = tokens[k].text.toUpperCase();
                stmt.codeToken = tokens[k];
                k++;
            } else {
                stmt.code = '';
                stmt.codeToken = tokens[k];
            }
        }
        // The operands, split at the commas outside parentheses.
        var current = [];
        var depth = 0;
        for (; k < tokens.length; k++) {
            let t = tokens[k];
            if (t.type == 'paren') {
                depth += t.text == '(' ? 1 : -1;
            }
            if (t.type == 'comma' && depth == 0) {
                stmt.operands.push(current);
                current = [];
                continue;
            }
            current.push(t);
        }
        if (current.length || stmt.operands.length) {
            stmt.operands.push(current);
        }
        stmt.text = entry.text;
        return stmt;
    }

    /**
     * An operand as it was written, for a message.
     * @param {!Object} stmt The statement.
     * @param {!Array<Object>} tokens The operand's tokens.
     * @return {string}
     */
    textOf(stmt, tokens) {
        if (!tokens.length) return '';
        var last = tokens[tokens.length - 1];
        return stmt.text.slice(tokens[0].start, last.start + last.text.length);
    }

    /**
     * Assembles one statement that is not a definition or a condition.
     */
    statement(stmt, entry, scope) {
        var at = this.address;
        if (stmt.bad) {
            this.error(entry, scope, stmt.bad.text[0] == "'" ||
                       stmt.bad.text[0] == '"' ? 'unterminated-string' :
                       'bad-character', {text: stmt.bad.text});
            this.row(entry, scope, null, []);
            return;
        }
        if (stmt.label) {
            this.defineLabel(stmt, entry, scope);
        }
        var code = stmt.code;
        if (code === null) {
            this.row(entry, scope, stmt.label ? at : null, []);
            return;
        }
        if (code == '') {
            this.error(entry, scope, 'unknown-code', {word: stmt.codeToken.text});
            this.row(entry, scope, null, []);
            return;
        }
        var bytes = null;
        switch (code) {
        case 'EQU':
        case 'SET':
            this.defineValue(stmt, entry, scope);
            this.row(entry, scope, null, [], false, null,
                     this.lookupValue(stmt.name, scope));
            return;
        case 'ORG': {
            // A label on an ORG names the address before it (L8).
            let v = this.evaluateEarly(stmt, stmt.operands[0], scope, entry);
            if (v !== null) {
                this.address = v;
            }
            this.row(entry, scope, v, []);
            return;
        }
        case 'END':
            this.ended = true;
            this.row(entry, scope, null, []);
            return;
        case 'ENDM':
            this.error(entry, scope, 'endm-without-macro');
            this.row(entry, scope, null, []);
            return;
        case 'TITLE':
        case 'PAGE':
        case 'NEWPAGE':
            // They only ever shaped the printed listing (L12).
            this.row(entry, scope, null, []);
            return;
        case 'INCLUDE':
            this.error(entry, scope, 'include');
            this.row(entry, scope, null, []);
            return;
        case 'DS': {
            let v = this.evaluateEarly(stmt, stmt.operands[0], scope, entry);
            this.row(entry, scope, at, [], false, null, null, v);
            if (v !== null) {
                this.address = (this.address + v) & 0xffff;
            }
            return;
        }
        case 'DB':
            bytes = this.dataBytes(stmt, entry, scope);
            break;
        case 'DW':
            bytes = this.dataWords(stmt, entry, scope);
            break;
        default:
            if (Asm8080.INSTRUCTIONS[code]) {
                bytes = this.instruction(stmt, entry, scope);
            } else if (this.macros.has(code)) {
                this.row(entry, scope, null, []);
                this.expand(stmt, entry, scope);
                return;
            } else {
                let later = this.previous && this.previous.macros.has(code);
                this.error(entry, scope, later ? 'macro-before-definition' :
                           'unknown-code', {word: stmt.codeToken.text});
                this.row(entry, scope, null, []);
                return;
            }
        }
        this.put(entry, scope, at, bytes || []);
    }

    /**
     * Puts bytes at the current address, and moves it on.
     */
    put(entry, scope, at, bytes) {
        if (this.emit) {
            for (let i = 0; i < bytes.length; i++) {
                let address = (at + i) & 0xffff;
                if (this.owner.has(address)) {
                    this.error(entry, scope, 'overlap',
                               {address: Asm8080.hex(address, 4),
                                other: this.owner.get(address)});
                    break;
                }
                this.owner.set(address, entry.line);
                this.memory.set(address, bytes[i] & 0xff);
            }
        }
        if (bytes.length && this.first === null) {
            this.first = at;
        }
        this.row(entry, scope, at, bytes);
        this.address = (at + bytes.length) & 0xffff;
    }

    /**
     * Encodes an instruction.
     * @return {?Array<number>} Its bytes, or null after an error.
     */
    instruction(stmt, entry, scope, quiet) {
        var info = Asm8080.INSTRUCTIONS[stmt.code];
        var ops = stmt.operands;
        var self = this;
        var fail = function(id, params) {
            if (!quiet) self.error(entry, scope, id, params);
            return null;
        };
        if (ops.length != info.ops.length ||
            ops.some(function(o) { return !o.length; })) {
            return fail('operands', {code: stmt.code,
                                     example: Asm8080.OPERAND_EXAMPLES[
                                         info.ops.join('')]});
        }
        var opcode = info.base;
        var tail = [];
        for (let k = 0; k < info.ops.length; k++) {
            let kind = info.ops[k];
            let tokens = ops[k];
            let text = this.textOf(stmt, tokens);
            if (kind == 'r' || kind == 'r3') {
                let v = this.evaluate(stmt, tokens, scope, entry, quiet);
                if (v === null) return null;
                if (v.value > 7 || v.pair) {
                    return fail('not-register', {text: text});
                }
                opcode += v.value << (kind == 'r3' ? 3 : 0);
            } else if (kind == 'rp' || kind == 'rpsw' || kind == 'bd') {
                let v = this.evaluate(stmt, tokens, scope, entry, quiet);
                if (v === null) return null;
                let ok = kind == 'bd' ? (v.value === 0 || v.value === 2) :
                    [0, 2, 4, 6].indexOf(v.value) >= 0;
                if (ok && v.value == 6) {
                    ok = kind == 'rp' ? v.pair != 'PSW' : v.pair != 'SP';
                }
                if (!ok || (v.pair && kind == 'bd')) {
                    return fail(kind == 'rp' ? 'not-pair' :
                                kind == 'rpsw' ? 'not-pair-psw' : 'not-bd',
                                {text: text});
                }
                opcode += v.value << 3;
            } else if (kind == 'n') {
                let v = this.evaluate(stmt, tokens, scope, entry, quiet);
                if (v === null) return null;
                if (v.value > 7) {
                    return fail('rst-range', {text: text});
                }
                opcode += v.value << 3;
            } else if (kind == 'd8') {
                let v = this.byteOf(stmt, tokens, scope, entry, quiet);
                if (v === null) return null;
                tail.push(v);
            } else {
                let v = this.evaluate(stmt, tokens, scope, entry, quiet);
                if (v === null) return null;
                tail.push(v.value & 0xff, v.value >> 8);
            }
        }
        if (stmt.code == 'MOV' && opcode == 0x76) {
            // MOV M,M would be HLT's opcode.
            return fail('mov-m-m');
        }
        return [opcode].concat(tail);
    }

    /**
     * Evaluates an operand that must fit in a byte (L5).
     * @return {?number}
     */
    byteOf(stmt, tokens, scope, entry, quiet) {
        var v = this.evaluate(stmt, tokens, scope, entry, quiet);
        if (v === null) return null;
        if (v.value > 0xff) {
            if (!quiet) {
                this.error(entry, scope, 'byte-range',
                           {text: this.textOf(stmt, tokens),
                            value: Asm8080.hex(v.value, 4)});
            }
            return null;
        }
        return v.value;
    }

    /** DB: bytes and strings (L10). */
    dataBytes(stmt, entry, scope) {
        if (!stmt.operands.length) {
            this.error(entry, scope, 'operands', {code: 'DB',
                                                  example: "DB 'HI',0"});
            return null;
        }
        var bytes = [];
        for (const tokens of stmt.operands) {
            if (tokens.length == 1 && tokens[0].type == 'string') {
                let chars = Asm8080.unquote(tokens[0].text);
                for (let i = 0; i < chars.length; i++) {
                    bytes.push(chars.charCodeAt(i) & 0xff);
                }
                continue;
            }
            let v = this.byteOf(stmt, tokens, scope, entry);
            if (v === null) return null;
            bytes.push(v);
        }
        return bytes;
    }

    /** DW: words, low byte first (L10). */
    dataWords(stmt, entry, scope) {
        if (!stmt.operands.length) {
            this.error(entry, scope, 'operands', {code: 'DW',
                                                  example: 'DW 1234H'});
            return null;
        }
        var bytes = [];
        for (const tokens of stmt.operands) {
            let v = this.evaluate(stmt, tokens, scope, entry);
            if (v === null) return null;
            bytes.push(v.value & 0xff, v.value >> 8);
        }
        return bytes;
    }

    /** A label on a statement (L1, L19). */
    defineLabel(stmt, entry, scope) {
        var name = stmt.label.toUpperCase();
        if (this.reserved(name, entry, scope)) return;
        // Two colons make a label in a macro global; outside one they
        // are just a label.
        var table = scope && !stmt.global ? scope.symbols : this.symbols;
        var existing = table.get(name);
        if (existing) {
            this.error(entry, scope, 'duplicate', {name: stmt.label,
                                                   other: existing.line});
            return;
        }
        table.set(name, {value: this.address, kind: 'label', known: true,
                         line: entry.line});
    }

    /** EQU and SET (L9, L20). */
    defineValue(stmt, entry, scope) {
        if (!stmt.name) {
            this.error(entry, scope, 'needs-name', {code: stmt.code});
            return;
        }
        var name = stmt.name.toUpperCase();
        if (this.reserved(name, entry, scope)) return;
        var v = this.evaluate(stmt, stmt.operands[0] || [], scope, entry);
        var value = v ? v.value : 0;
        var known = !!(v && v.known);
        var global = this.symbols.get(name);
        if (stmt.code == 'EQU') {
            // An EQU in a macro is always local to its expansion.
            let table = scope ? scope.symbols : this.symbols;
            let existing = table.get(name);
            if (existing) {
                this.error(entry, scope, existing.kind == 'set' ?
                           'equ-of-set' : 'duplicate',
                           {name: stmt.name, other: existing.line});
                return;
            }
            table.set(name, {value: value, kind: 'equ', known: known,
                             line: entry.line, pair: v && v.pair});
            return;
        }
        // SET changes a global SET name; inside a macro, a name not
        // already set globally is local to the expansion.
        var table = this.symbols;
        if (scope && !(global && global.kind == 'set')) {
            table = this.innerSet(name, scope) || scope.symbols;
        }
        var existing = table.get(name);
        if (existing && existing.kind != 'set') {
            this.error(entry, scope, 'set-of-equ', {name: stmt.name,
                                                    other: existing.line});
            return;
        }
        table.set(name, {value: value, kind: 'set', known: known,
                         line: entry.line, pair: v && v.pair});
    }

    /** The innermost enclosing expansion that already SET a name. */
    innerSet(name, scope) {
        for (let s = scope; s; s = s.parent) {
            let sym = s.symbols.get(name);
            if (sym && sym.kind == 'set') return s.symbols;
        }
        return null;
    }

    /** Refuses names the language keeps for itself (L2). */
    reserved(name, entry, scope) {
        if (Asm8080.isReserved(name)) {
            this.error(entry, scope, 'reserved', {name: name});
            return true;
        }
        return false;
    }

    /** A macro's definition (L16). */
    defineMacro(stmt, body, scope, entry) {
        if (scope) {
            this.error(entry, scope, 'macro-in-macro');
            return;
        }
        if (!stmt.name) {
            this.error(entry, scope, 'needs-name', {code: 'MACRO'});
            return;
        }
        var name = stmt.name.toUpperCase();
        if (this.reserved(name, entry, scope)) {
            return;
        }
        if (this.macros.has(name)) {
            this.error(entry, scope, 'macro-twice', {name: stmt.name});
            return;
        }
        var params = stmt.operands.map(function(tokens) {
            return tokens.map(function(t) { return t.text; }).join('')
                .toUpperCase();
        });
        this.macros.set(name, {name: stmt.name, params: params, body: body});
    }

    /** A macro's use (L17 to L19). */
    expand(stmt, entry, scope) {
        var macro = this.macros.get(stmt.code);
        var depth = scope ? scope.depth + 1 : 1;
        if (depth > Asm8080.MAX_DEPTH) {
            this.error(entry, scope, 'macro-depth', {name: macro.name,
                                                     depth: Asm8080.MAX_DEPTH});
            return;
        }
        var self = this;
        // The arguments: an unquoted one is evaluated here, and its
        // value substituted; a quoted one is passed as its text.
        var args = [];
        for (let k = 0; k < macro.params.length; k++) {
            let tokens = stmt.operands[k] || [];
            if (!tokens.length) {
                args.push('');
            } else if (tokens.length == 1 && tokens[0].type == 'string') {
                args.push(Asm8080.unquote(tokens[0].text));
            } else {
                let v = this.evaluate(stmt, tokens, scope, entry, true, true);
                if (v === null) {
                    // Text that is not an expression is passed quoted.
                    this.error(entry, scope, 'macro-arg',
                               {text: this.textOf(stmt, tokens)});
                    return;
                }
                if (v.known) {
                    // A register by its name, anything else in hex, so
                    // that the listing reads as it was written.
                    args.push(v.pair || Asm8080.literal(v.value));
                } else {
                    // Not known yet in this pass: the text stands in,
                    // which a later pass replaces with its value.
                    args.push('(' + this.textOf(stmt, tokens) + ')');
                }
            }
        }
        var id = this.expansions++;
        var inner = {id: id, depth: depth, parent: scope, macro: macro,
                     symbols: new Map(), at: scope ? scope.at : entry};
        this.locals.set(id, inner.symbols);
        var lines = macro.body.map(function(b) {
            return {text: self.substitute(b.text, macro.params, args),
                    line: b.line};
        });
        this.block(lines, inner);
    }

    /** Puts arguments in place of a body's dummy parameters (L17). */
    substitute(text, params, args) {
        if (!params.length) return text;
        var out = '';
        for (const t of Asm8080.tokenize(text)) {
            let k = t.type == 'name' ? params.indexOf(t.text.toUpperCase()) : -1;
            out += k >= 0 ? args[k] : t.text;
        }
        return out;
    }

    /**
     * Evaluates an expression whose value decides the layout: an ORG,
     * a DS or an IF. It may use only what is defined above it (L13).
     * @return {?number}
     */
    evaluateEarly(stmt, tokens, scope, entry) {
        var v = this.evaluate(stmt, tokens || [], scope, entry, false, false,
                              true);
        return v ? v.value : null;
    }

    /**
     * Evaluates an operand.
     * @param {boolean=} quiet Report nothing.
     * @param {boolean=} macroArg For a macro's argument: a register
     *     name keeps its name.
     * @param {boolean=} early Only what is defined above (L13).
     * @return {?{value: number, known: boolean, pair: ?string}} Null
     *     after an error.
     */
    evaluate(stmt, tokens, scope, entry, quiet, macroArg, early) {
        var self = this;
        var e = new Asm8080.Expression(tokens, function(name) {
            return self.lookup(name, scope, early);
        }, function(inner) {
            // An instruction in parentheses (L7).
            var parsed = self.parse({text: inner, line: entry.line}, scope);
            if (!parsed.code || !Asm8080.INSTRUCTIONS[parsed.code]) {
                return null;
            }
            return self.instruction(parsed, entry, scope, true);
        }, this.address);
        var v = e.evaluate();
        if (v.error) {
            if (!quiet) {
                this.error(entry, scope, v.error, v.params);
            }
            return null;
        }
        if (!v.known && this.emit && !quiet) {
            this.error(entry, scope, 'undefined', {name: v.missing});
            return null;
        }
        if (macroArg && v.register) {
            v.pair = v.register;
        }
        return v;
    }

    /**
     * Looks a name up: in the expansions, innermost first, then among
     * the globals; failing that, in the pass before, as a forward
     * reference.
     * @return {?{value: number, known: boolean, pair: ?string,
     *     forward: boolean}}
     */
    lookup(name, scope, early) {
        var upper = name.toUpperCase();
        for (let s = scope; s; s = s.parent) {
            let sym = s.symbols.get(upper);
            if (sym) return sym;
        }
        var sym = this.symbols.get(upper);
        if (sym) return sym;
        if (!this.previous) return null;
        for (let s = scope; s; s = s.parent) {
            let old = this.previous.locals.get(s.id);
            let p = old && old.get(upper);
            if (p && p.kind != 'set') {
                return early ? {forward: true} : p;
            }
        }
        var p = this.previous.symbols.get(upper);
        if (p && p.kind != 'set') {
            return early ? {forward: true} : p;
        }
        return null;
    }

    /** A symbol's value, for the listing of an EQU or SET. */
    lookupValue(name, scope) {
        if (!name) return null;
        var sym = this.lookup(name, scope);
        return sym && sym.known ? sym.value : null;
    }

    /**
     * Notes an error. Only the last pass keeps them, except those the
     * layout itself raises.
     */
    error(entry, scope, id, params) {
        if (!this.emit) return;
        if (this.errors.length >= Asm8080.MAX_ERRORS) return;
        var where = {line: scope ? scope.at.line : entry.line, id: id,
                     params: params || {}};
        if (scope) {
            where.macro = scope.macro.name;
            where.macroLine = entry.line;
        }
        this.errors.push(where);
    }

    /**
     * Adds a row to the listing.
     * @param {?number} address The address the line is at, if any.
     * @param {!Array<number>} bytes What it made.
     * @param {boolean=} skipped Not assembled: under a false IF, or
     *     inside a macro's definition.
     * @param {?string=} kind 'body' for a definition's line.
     * @param {?number=} value An EQU's or SET's value.
     * @param {?number=} reserved How many bytes a DS reserved.
     */
    row(entry, scope, address, bytes, skipped, kind, value, reserved) {
        if (!this.emit) return;
        this.rows.push({
            line: scope ? scope.at.line : entry.line,
            text: entry.text,
            depth: scope ? scope.depth : 0,
            macro: scope ? scope.macro.name : null,
            address: address === undefined ? null : address,
            bytes: bytes,
            skipped: !!skipped,
            body: kind == 'body',
            value: value === undefined ? null : value,
            reserved: reserved === undefined ? null : reserved,
        });
    }

    /** Checks what only the whole program can tell (L15). */
    finish(options) {
        if (!this.memory.size) return;
        var top = Math.max.apply(null, Array.from(this.memory.keys()));
        if (options.memSize && top >= options.memSize) {
            this.errors.push({line: this.owner.get(top), id: 'too-big',
                              params: {end: Asm8080.hex(top, 4),
                                       size: options.memSize}});
        }
    }

    /** What assemble() returns. */
    result() {
        var keys = Array.from(this.memory.keys());
        var symbols = {};
        for (const [name, sym] of this.symbols) {
            symbols[name] = sym.value;
        }
        this.errors.sort(function(a, b) { return a.line - b.line; });
        return {
            ok: this.errors.length == 0,
            memory: this.memory,
            start: keys.length ? Math.min.apply(null, keys) : null,
            end: keys.length ? Math.max.apply(null, keys) : null,
            entry: this.first,
            size: keys.length,
            rows: this.rows,
            errors: this.errors,
            symbols: symbols,
        };
    }
};

/**
 * Writes a value as the language writes a hexadecimal number: 0FFH,
 * 3000H, 05H.
 * @param {number} value 0 to FFFFH.
 * @return {string}
 */
Asm8080.literal = function(value) {
    var digits = Asm8080.hex(value, value > 0xff ? 4 : 2);
    return (/^[A-F]/.test(digits) ? '0' : '') + digits + 'H';
};

/**
 * Takes the quotes off a string token, and the doubling off a quote
 * written inside it.
 * @param {string} text The token.
 * @return {string}
 */
Asm8080.unquote = function(text) {
    var q = text[0];
    return text.slice(1, -1).split(q + q).join(q);
};

/**
 * One expression, evaluated by precedence climbing (L4).
 */
Asm8080.Expression = class {
    /**
     * @param {!Array<Object>} tokens The operand's tokens.
     * @param {function(string): ?Object} lookup Finds a name's symbol.
     * @param {function(string): ?Array<number>} encode Assembles an
     *     instruction written in parentheses (L7).
     * @param {number} here The value of $.
     */
    constructor(tokens, lookup, encode, here) {
        this.tokens = tokens;
        this.lookup = lookup;
        this.encode = encode;
        this.here = here;
        this.k = 0;
        this.known = true;
        this.missing = null;
        this.registerName = null;
    }

    /**
     * @return {!Object} {value, known, register, missing} or
     *     {error, params}.
     */
    evaluate() {
        try {
            if (!this.tokens.length) {
                throw {error: 'empty-operand'};
            }
            var value = this.level(1);
            if (this.k < this.tokens.length) {
                throw {error: 'bad-expression',
                       params: {text: this.text()}};
            }
            // A lone register name keeps its name, for pairs (L6).
            var lone = this.tokens.length == 1 && this.registerName;
            return {value: value & 0xffff, known: this.known,
                    register: lone ? this.registerName : null,
                    pair: lone && (this.registerName == 'SP' ||
                                   this.registerName == 'PSW') ?
                        this.registerName : null,
                    missing: this.missing};
        } catch (e) {
            if (e.error) return e;
            throw e;
        }
    }

    text() {
        return this.tokens.map(function(t) { return t.text; }).join(' ');
    }

    peek() {
        return this.tokens[this.k];
    }

    /** The binary operator the next token is, with its strength. */
    binary() {
        var t = this.peek();
        if (!t) return null;
        if (t.type == 'op') {
            return {op: t.text, prec: t.text == '+' || t.text == '-' ? 4 : 5};
        }
        if (t.type == 'name') {
            let w = t.text.toUpperCase();
            let p = Asm8080.WORD_OPERATORS[w];
            if (p && w != 'NOT') return {op: w, prec: p};
        }
        return null;
    }

    level(min) {
        var left = this.unary();
        for (;;) {
            var b = this.binary();
            if (!b || b.prec < min) return left;
            this.k++;
            var right = this.level(b.prec + 1);
            left = this.apply(b.op, left, right);
        }
    }

    unary() {
        var t = this.peek();
        if (!t) {
            throw {error: 'bad-expression', params: {text: this.text()}};
        }
        if (t.type == 'name' && t.text.toUpperCase() == 'NOT') {
            this.k++;
            // NOT binds below + and - (L4).
            return ~this.level(4) & 0xffff;
        }
        if (t.type == 'op' && (t.text == '-' || t.text == '+')) {
            this.k++;
            var v = this.level(5);
            return t.text == '-' ? (-v) & 0xffff : v;
        }
        return this.primary();
    }

    primary() {
        var t = this.tokens[this.k++];
        switch (t.type) {
        case 'number': {
            let v = Asm8080.parseNumber(t.text);
            if (v === null) {
                throw {error: 'bad-number', params: {text: t.text}};
            }
            if (v > 0xffff) {
                throw {error: 'word-range', params: {text: t.text}};
            }
            return v;
        }
        case 'dollar':
            return this.here;
        case 'string': {
            let chars = Asm8080.unquote(t.text);
            if (chars.length == 0 || chars.length > 2) {
                throw {error: 'string-value', params: {text: t.text}};
            }
            return chars.length == 1 ? chars.charCodeAt(0) & 0xff :
                ((chars.charCodeAt(0) & 0xff) << 8) |
                (chars.charCodeAt(1) & 0xff);
        }
        case 'name': {
            let upper = t.text.toUpperCase();
            if (Asm8080.REGISTERS.hasOwnProperty(upper)) {
                this.registerName = upper;
                return Asm8080.REGISTERS[upper];
            }
            if (Asm8080.isReserved(upper)) {
                throw {error: 'bad-expression', params: {text: this.text()}};
            }
            let sym = this.lookup(t.text);
            if (sym && sym.forward) {
                throw {error: 'later', params: {name: t.text}};
            }
            if (!sym || !sym.known) {
                this.known = false;
                this.missing = this.missing || t.text;
                return 0;
            }
            if (sym.pair) this.registerName = sym.pair;
            return sym.value;
        }
        case 'paren': {
            if (t.text != '(') break;
            // An instruction in parentheses has its encoding as value.
            let next = this.peek();
            if (next && next.type == 'name' &&
                Asm8080.INSTRUCTIONS[next.text.toUpperCase()]) {
                let depth = 1;
                let start = this.k;
                while (this.k < this.tokens.length) {
                    let p = this.tokens[this.k];
                    if (p.type == 'paren') depth += p.text == '(' ? 1 : -1;
                    if (depth == 0) break;
                    this.k++;
                }
                let inner = this.tokens.slice(start, this.k)
                    .map(function(x) { return x.text; }).join(' ')
                    .replace(/ , /g, ',');
                this.k++;
                let bytes = this.encode(inner);
                if (!bytes) {
                    throw {error: 'bad-expression',
                           params: {text: this.text()}};
                }
                return bytes.length == 1 ? bytes[0] :
                    ((bytes[0] << 8) | bytes[1]) & 0xffff;
            }
            let v = this.level(1);
            let close = this.tokens[this.k++];
            if (!close || close.text != ')') {
                throw {error: 'bad-expression', params: {text: this.text()}};
            }
            return v;
        }
        }
        throw {error: 'bad-expression', params: {text: this.text()}};
    }

    apply(op, a, b) {
        switch (op) {
        case '+': return (a + b) & 0xffff;
        case '-': return (a - b) & 0xffff;
        case '*': return (a * b) & 0xffff;
        case '/':
        case 'MOD':
            if (b == 0) throw {error: 'divide-by-zero'};
            return op == '/' ? Math.floor(a / b) : a % b;
        case 'SHL': return b > 15 ? 0 : (a << b) & 0xffff;
        case 'SHR': return b > 15 ? 0 : a >>> b;
        case 'AND': return a & b;
        case 'OR': return a | b;
        case 'XOR': return a ^ b;
        }
        return 0;
    }
};

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Asm8080;
}
