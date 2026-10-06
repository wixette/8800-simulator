# The 8080 assembler

This is the design of the assembler that issue #12 asks for: a new
**Assembler** tab in the dock, where you write a program in 8080
assembly language and put it straight into the simulator's memory.

The language is Intel's own, as defined by the *Intel 8080 Assembly
Language Programming Manual*, Rev. B, 1975. The References tab links
to a scan of it, and to the HTML transcription made by the Grace
Hopper Center, which is the text this document cites. Chapters 2 and 3
are the specification: everything they describe is in scope, macros
included.

**Status.** Built, on branch `assembler`, for review before it is
merged into `v1.6.0`: the language (Parts 2 and 3) in `js/asm8080.js`,
the tab (Parts 4 and 5) in `js/asmtab.js`, and the examples and tests
of Part 6. Where building changed a decision, the decision says so.
Decisions are numbered so that the code can cite them: **L** for the
language, **U** for the tab, **H** for highlighting and **T** for tests
and examples.

---

## Contents

- [Part 1 — Scope](#part-1--scope)
- [Part 2 — The language](#part-2--the-language)
- [Part 3 — Macros](#part-3--macros)
- [Part 4 — The Assembler tab](#part-4--the-assembler-tab)
- [Part 5 — Highlighting](#part-5--highlighting)
- [Part 6 — Code, tests and examples](#part-6--code-tests-and-examples)
- [Part 7 — Plan](#part-7--plan)
- [Part 8 — Open questions](#part-8--open-questions)

---

## Part 1 — Scope

**In:** the whole language of the manual's Chapter 2 (the instruction
set, the statement syntax, operands and expressions, and the
pseudo-instructions) and Chapter 3 (macros), as used in Chapter 4's
programming techniques. A tab to write, assemble and load programs,
with a listing beside the source, errors marked on their lines, and
syntax highlighting.

**Out, on purpose:**

- **`INCLUDE`.** It is not in Intel's language; it came with later
  assemblers. Supporting it would mean managing files in the browser.
  A program that uses a library pastes the library's text in. An
  `INCLUDE` line gets an error that says exactly that (L12).
- **Links carrying source.** Share links carry the machine - the
  assembled bytes - and nothing else (P8 in [ui-design.md](ui-design.md)).
- **An output file.** The manual's assembler punched an object tape;
  this one loads memory directly. The bytes can still be shared as a
  link, or copied from the listing.

**Who it is for.** Anyone writing 8080 code for the Altair, and in
particular a class reading the Intel manual, as @cj0ne5's is. Where a
student meets something the manual describes, it works as the manual
says.

---

## Part 2 — The language

Each decision says what the manual specifies and, where it is silent,
what we chose.

### L1 — Statements

A statement has up to four fields, separated by any number of blanks:
**label**, **code**, **operand**, **comment** (Chapter 2, *Statement
Syntax*).

- **A label** names the address of the statement and ends with a
  colon: `LOOP: DCR B`. Several labels may stand on one address, each
  on its own line or before the statement. Inside a macro, two colons
  (`LOOP::`) make a label global (L19).
- **A name** - on `EQU`, `SET` and `MACRO` - has no colon:
  `PORT EQU 0FFH`. We also accept a colon there (`AFTER: EQU $`),
  since many programs write it so and it is never ambiguous.
- **The code** is an instruction mnemonic, a pseudo-instruction or a
  macro name, followed by at least one blank if an operand follows.
- **A comment** starts at `;` and runs to the end of the line. A `;`
  inside quotes is part of the string.

### L2 — Names

- The first character is a letter, `@` or `?`; the rest are letters,
  digits, `@` or `?`. We also allow `_` anywhere after the first
  character, which the manual does not mention and modern programs
  expect.
- **Names are not limited to five characters.** The manual recognises
  only the first five (`INSTRUCTION:` reads as `INSTR:`); copying that
  would surprise everyone, and no modern assembler does it.
- **Case does not matter**, except inside quotes: `mvi a,'x'` is
  `MVI A,'x'`.
- **Reserved:** the mnemonics, the pseudo-instructions, the register
  names (`A B C D E H L M SP PSW`) and the operator words (`MOD NOT
  AND OR XOR SHL SHR`) cannot be used as names.
- A label or `EQU` name may be defined once; a `SET` name any number
  of times (L9).

### L3 — Numbers and characters

As the manual lists them:

| Form | Meaning |
| --- | --- |
| `0BAH`, `3AH` | Hexadecimal: ends in `H`, starts with a digit |
| `105`, `105D` | Decimal, the default |
| `72Q`, `72O` | Octal |
| `11110110B` | Binary |
| `'*'` | ASCII. A quote inside is written twice: `''''` |
| `$` | The address of the current statement |

A character constant of two characters (`'AB'`) is a 16-bit value, the
first character in the high byte. In `DB`, a string of any length is
one byte per character (L10). Double quotes (`"Hi"`) are accepted as
well as single (L12).

### L4 — Expressions

Operands may be expressions of numbers, characters, `$` and names,
with these operators, from the manual (Chapter 2, *Operand Field*):

| Binds | Operators |
| --- | --- |
| tightest | `( )` |
| | `*` `/` `MOD` `SHL` `SHR` |
| | `+` `-` (unary and binary) |
| | `NOT` |
| | `AND` |
| loosest | `OR` `XOR` |

Note the manual's unusual order: `NOT` binds below `+` and `-`, so
`NOT 0 AND 0FFH` is `(NOT 0) AND 0FFH`. The word operators must be set
off by blanks: `VALUE AND0FH` is an error.

**Arithmetic** is 16-bit. The manual says operators "treat their
arguments as 15-bit quantities, and generate 16-bit quantities"; we
read that as plain 16-bit two's complement, the only reading that
gives the manual's own examples their stated values. Unary minus is
two's complement (`-1` is `0FFFFH`). `/` and `MOD` are unsigned, and
division by zero is an error. `SHL` and `SHR` shift in zeros.

### L5 — What an operand must fit

The manual: "the second operand of an MVI instruction must be an 8-bit
value. Therefore `MVI H,NOT 0` is invalid, since NOT 0 produces the
16-bit hexadecimal number FFFF."

So an **8-bit operand** (`MVI`, `ADI` and the other immediates, `IN`,
`OUT`, `DB`) must be `00H` to `0FFH`. That makes `MVI A,-1` an error
too, since `-1` is `0FFFFH`. The message says how to write it
(`0FFH`, or `-1 AND 0FFH`). This follows the manual, and it is the kind
of thing the manual is teaching. A **16-bit operand** (`LXI`, `JMP`,
`DW` and so on) takes any 16-bit value. **`RST`** takes 0 to 7.

### L6 — Registers are numbers

The manual defines the registers as values, set before every assembly:
`B` 0, `C` 1, `D` 2, `E` 3, `H` 4, `L` 5, `M` 6, `A` 7. So
`MVI 2,9FH` loads D, and a register can be named by `EQU` or computed
(`MVI 8/2,2EH` loads H).

A **register pair** operand must be 0 (`B`, meaning BC), 2 (`D`), 4
(`H`) or 6. The meaning of 6 depends on the instruction: `SP` for
`LXI`, `DAD`, `INX` and `DCX`, `PSW` for `PUSH` and `POP`. Naming the
wrong one (`PUSH SP`, `LXI PSW,0`) is an error. `LDAX` and `STAX`
take only `B` or `D`.

### L7 — An instruction as a value

"An instruction in parentheses is a legal expression of an optional
field. Its value is the encoding of the instruction": `DB (ADD C)` is
`81H`. The bracketed text is assembled where it stands; its value is
its first byte, or its first two (first byte high) when used as a
16-bit operand. It is rare, so it is supported but not advertised.

### L8 — `ORG`, `END`

- **`ORG exp`** sets the address of the next statement. Without one, a
  program starts at 0000H. The expression must be known when it is
  reached (L13).
- **`END`** ends the program; anything after it is ignored. The manual
  says it must be there. We do not require it, since its absence
  changes nothing, but a program that has one still works as written.

### L9 — `EQU`, `SET`

- **`name EQU exp`** gives a name a value, once. It may use names
  defined later in the program, as long as nothing needs its value
  before they are known (L13).
- **`name SET exp`** is the same, but the name may be set again and
  again; each use sees the latest value above it. A name defined by
  `EQU` cannot be `SET`, nor the other way round.

### L10 — `DB`, `DW`, `DS`

- **`DB`** takes a list of 8-bit expressions and strings: `DB 'HELLO',
  0DH, 0AH, 0`.
- **`DW`** takes a list of 16-bit expressions, each stored low byte
  first.
- **`DS exp`** reserves that many bytes. The manual: "the programmer
  should not assume that these locations will contain zero". Since
  Assemble clears memory first (U5), reserved bytes do read 00 here;
  the listing shows them as reserved, not as data.

### L11 — `IF`, `ENDIF`

`IF exp` assembles the statements up to the matching `ENDIF` only if
the expression is not zero. The manual has no `ELSE`, and neither do
we. `IF`s may be nested. The expression must be known when it is
reached (L13). An `IF` without its `ENDIF` by the end of the program,
or inside a macro by the end of that macro, is an error.

### L12 — Beyond the manual: a few compatibility allowances

So that programs written for other 8080 assemblers - pyGHCassembler,
AS, CP/M's ASM - paste in without edits:

- `TITLE`, `PAGE` and `NEWPAGE` are accepted and ignored. They only
  ever shaped the printed listing.
- Strings may be in double quotes as well as single.
- A colon after an `EQU` or `SET` name is accepted (L1).
- **`INCLUDE`** is the one we deliberately refuse, with this error:
  *INCLUDE is not part of Intel's 8080 language. Paste the file's text
  here in its place.*

Nothing else is added. A program that uses features of other
assemblers (`ELSE`, `HIGH`, `LOW`, `LOCAL`, `REPT`) gets an ordinary
"unknown" error naming the word.

### L13 — Two passes, and what must be known early

The assembler reads the program twice. The first pass finds every
label's address; the second produces the bytes. So an instruction may
refer to a label further down (`JMP DONE`).

But some things decide the addresses themselves, and must be known by
the time the first pass reaches them: the operand of `ORG` and `DS`,
the condition of `IF`, and any expression a macro's expansion depends
on for its size. A name used there before it is defined is an error:
*The address of what follows depends on DONE, which is defined later.
Move its definition up.*

### L14 — Errors

- **Every error is reported, not just the first**, each with its line
  number, so that one Assemble shows everything to fix. A line with an
  error assembles to nothing, and the assembly goes on; after 100
  errors it stops listing more.
- **The words are plain**, and say what to do where they can:
  *MVI needs a register and a byte, as in MVI A,3FH.* An error inside a
  macro's expansion names both lines: the macro's and the one that
  used it (L22).
- **Nothing is loaded if there is any error.** A half-assembled program
  in memory would only mislead.
- The messages are part of the interface, so they are translated into
  all ten languages, as every other message is.

### L15 — Fitting the machine

The program must fit the memory installed. If it does not, the error
says how much it needs: *This program reaches 1234H, but the machine
has 256 bytes. Install 8 KB in the Memory menu.* Two parts of a
program assembled to the same address (by `ORG`) are an error too,
naming both lines.

---

## Part 3 — Macros

Chapter 3, as the manual specifies it. This is the hardest part of the
assembler, because the manual's rules are about scope, not only about
text.

### L16 — Definition

```
name  MACRO  P1,P2,...
      ...the body...
      ENDM
```

- The body is stored, not assembled, until the macro is used.
- A macro is defined once. It must be defined before its first use: a
  macro used above its definition is an error. The manual's examples
  always define first, and this keeps the first pass simple.
- A body may use other macros, but may not define one (the manual:
  "macros may not define other macros").
- A macro may not use itself, directly or through others. Since
  `IF` and `SET` could stop a recursion, this is the one limit we set
  beyond the manual: expansions nest at most 16 deep, and deeper is an
  error.

### L17 — Reference and substitution

```
      name  arg1,arg2,...
```

- **Arguments replace the dummy parameters** left to right, wherever a
  parameter appears in the body as a whole name. Not inside other
  names, nor inside quoted strings.
- **Missing arguments are empty**; extra ones are ignored.
- **An unquoted argument is evaluated where the macro is used**, and
  its value is substituted. The manual's MAC4: with `ABC SET 3`,
  `MAC4 ABC` substitutes `3`, even though the body sets ABC to 14
  first. Registers are values (L6), so `LIND C,LABEL` gives
  `MOV 1,M`, which is `MOV C,M`.
- **A quoted argument is passed as text**, and evaluated inside the
  expansion: `MAC4 'ABC'` gives `DB ABC`, which is 14. Quoting is also
  how text that is not an expression is passed, such as a comment
  (`MAC1 C,D,'; DECREMENT REG C'`).
- An unquoted argument that is not an expression is an error that says
  to quote it.

### L18 — Expansion

The expansion is assembled exactly as if it had been written in place.
Every statement it produces must be legal: `MAC C`, expanding to
`PUSH 1`, is an error, as the manual shows.

### L19 — Scope of labels

- **A label in a macro body is local to each expansion.** Two uses of
  a macro with `LOOP:` in it each get their own LOOP, and each `JMP
  LOOP` goes to its own.
- **A label with two colons (`SUBR::`) is global.** It can be used
  outside the macro, and so can be generated only once: a second
  expansion that generates it again is an error. Chapter 4's SBMAC
  uses `IF` and `SET` to generate it only the first time.

### L20 — Scope of `EQU` and `SET` names

- **An `EQU` name in a macro is always local** to the expansion. The
  manual's EQMAC: inside it `VAL` is 8, outside it stays 6.
- **A `SET` name in a macro changes the global value if the name was
  already set globally**; otherwise it is local to the expansion. The
  manual's STMAC: after `SYM SET 0` outside, the macro's `SYM SET 5`
  changes it for everything after. With no global `SYM`, the macro's
  is local, and `SYM` is unknown after it.
- Names are looked up from the innermost expansion outwards, then
  globally.

### L21 — `IF` in macros

`IF` and `ENDIF` work inside a body, and must pair up inside it. With
`SET`, this is how one macro produces different expansions (Chapter 4,
*Altering Macro Expansions*).

### L22 — Where things are reported

The listing shows each macro use followed by its expansion, the
expanded lines marked, with their addresses and bytes. An error inside
an expansion is reported on the line that used the macro, naming the
macro's line too: *Line 40, in SBMAC (line 12): …*

---

## Part 4 — The Assembler tab

### U1 — A fifth dock tab, and icons for all five

The dock gains **Assembler**, between Teletype and Debugger, in the
order you work: write it, then watch it run. Five tabs no longer fit a
phone's width, so, as agreed in #12:

- Every tab gets an icon, from the Material icons the toolbar uses:
  Teletype `keyboard`, Assembler `code`, Debugger `bug_report`,
  Tutorial `school`, References `menu_book`.
- **At 701 px and wider:** the icon and the name.
- **On a phone:** the icon only, with the name as its tooltip and its
  accessible name. The selected tab is still marked, as now.

### U2 — The layout

```
┌ Assembler ──────────────────────────────────────────────────────────────────┐
│ [Assemble ⌘↵]  [Examples ▾]   12 bytes, 0000H-000BH                         │
├──────────────────────────────────────────────┬──────────────────────────────┤
│  1        ORG  0                ; start here  │ 0000                         │
│  2 LOOP:  IN   0FFH             ; switches    │ 0000  DB FF                  │
│  3        OUT  0FFH             ; to the lamps│ 0002  D3 FF                  │
│  4        JMP  LOOP                           │ 0004  C3 00 00               │
│  5        END                                 │                              │
│                                               │                              │
└──────────────────────────────────────────────┴──────────────────────────────┘
   the source, highlighted                         the listing, line for line
```

- **A toolbar** across the top. **Assemble** is the primary button,
  also pressed with Ctrl+Enter (⌘+Enter on a Mac). **Examples** opens
  a menu of example sources (T3). Beside them, a summary of the last
  assembly: its size and range, or how many errors.
- **The source** on the left, in the editor: line numbers in a gutter,
  highlighting (Part 5), lines with errors marked in the gutter and
  tinted.
- **The listing** on the right: for each source line, on the same row,
  its address and the bytes it made, in hex; for an `EQU` or `SET`,
  its value. The two scroll together, so a line's bytes are always
  beside it. A row shows up to six bytes, then `…`.
- **A macro's expansion** is listed on the row of the line that used
  it: the address and the bytes it made. Its tooltip gives the whole
  expansion, a line each with its address and bytes (L22). *As built:*
  the design first had the expansion's lines below the use, with the
  source pushed down to match, as the manual's printed listings have
  it; a text area cannot push its own lines apart, so the tooltip
  carries them instead, and a long `DB` the same way.
- **Errors** below the editor, as a list: line number and message.
  Clicking one puts the cursor on its line.
- **On a phone** the listing is hidden, and the source takes the
  width; a toggle shows the listing instead.

### U3 — Editing

The editor is a plain text area, with highlighting drawn behind it
(Part 5), not a code-editor library: the page has no build step and no
dependencies, and keeps it that way.

- **Tab** inserts a tab, as code editors do, since assembly is written
  in columns. **Esc, then Tab** moves the focus on, so the keyboard is
  never trapped.
- **The source is remembered** in this browser, as you type, and comes
  back with the page. It is never sent anywhere.
- **Assembling does not change the source**: the listing is beside
  it, not merged into it.

### U4 — Assembling

The source is assembled again whenever typing pauses, for the listing,
the error marks and the summary; that touches nothing in the machine.
**Assemble** reads the whole source and, if there is no error:

1. Switches the machine on, if it was off, and says so.
2. Unprotects memory, if anything was protected, and says so (#16).
3. Clears memory, writes the program's bytes, and presses RESET, the
   same as every other way of loading a program (D14 in
   [ms-basic-4k.md](ms-basic-4k.md)).
4. If the program does not start at 0000H, examines its start, so that
   PC is there, as an Altair owner would have with EXAMINE.
5. Says so on the status line: *Assembled 12 bytes at 0000H-000BH and
   pressed RESET. Click RUN on the front panel.*

The tab stays open: you are still writing. A running machine is
stopped by the load, as by any load. With errors, nothing is loaded,
the machine is untouched, and the status line says how many there are.

### U5 — Examples in the tab

**Examples ▾** lists the assembler's example sources (T3), grouped as
the Load menu groups its examples: the front panel's, then the
Teletype's. They are read from `examples/source/` when the menu first
opens, so like the Load menu's they need the page served, not opened
from the disk. Choosing one replaces the editor's text. If the editor
holds anything that is not an unchanged example, a dialog asks first,
since that text is otherwise lost.

### U6 — Words

The tab is a tool, so it reads as software (P5): Title Case labels,
translated into all ten languages. The source is the programmer's own
and is never translated; nor are mnemonics, which are the language.

---

## Part 5 — Highlighting

### H1 — The technique

A `<pre>` of coloured spans sits exactly behind a `<textarea>` whose
text is transparent but whose caret is not. The text area does the
editing (selection, undo, the soft keyboard); the `<pre>` shows the
colours. This is the usual way to highlight a text area without a
library, and it is small.

What makes it work, and what the tests check:

- **The same box:** the same font, size, line height, padding, tab
  width and border on both, and no wrapping on either; long lines
  scroll sideways.
- **The same scroll:** the `<pre>` follows the text area's scroll, on
  every scroll event.
- **The same text:** the `<pre>` is redrawn from the text area's value
  on every change, at most once a frame, with a trailing newline so
  that its last line is not shorter.

### H2 — What is coloured

The assembler's own tokenizer colours the source, so the colours
always agree with what the assembler accepts:

| Token | Example | Look |
| --- | --- | --- |
| Comment | `; rotate` | grey, italic |
| Label, name | `LOOP:`, `PORT` | dark blue |
| Mnemonic | `MVI`, `JMP` | crimson, bold |
| Pseudo-instruction | `ORG`, `DB`, `MACRO` | purple |
| Register | `A`, `M`, `SP` | dark teal |
| Number, `$` | `0FFH`, `$` | dark olive |
| String | `'HELLO'` | green |
| Macro name, where used | `SHRT` | purple, italic |
| Unknown word | `MVX` | red, wavy underline |

On the light background the dump and the paper already use, each
colour meets 4.5:1 contrast. Colour is never the only sign: errors
are also marked in the gutter and listed.

### H3 — Cost

The whole source is tokenized again on each change, once a frame.
Kevin Cole's library and a program with it, about 600 lines, is well
under a millisecond. Nothing is done while the tab is hidden.

---

## Part 6 — Code, tests and examples

### T1 — Where the code goes

- **`js/asm8080.js`**: the assembler, with no page in it. It takes
  source text and gives back the bytes (by address), the listing rows,
  the symbols and the errors. Loaded by the page as a plain script, and
  by the tests in Node, like `js/link.js`. The instruction encodings
  are its own table, written from the manual's Appendix A, and checked
  by a test against the CPU core's disassembler (T2).
- **`js/asmtab.js`**: the tab: editor, highlighting, listing, errors,
  examples. It talks to the machine only through what `js/panel.js`
  already uses to load a program. Its logic that needs no page - the
  highlighting, the listing's cells, the errors as sentences - is
  tested in `tests/asmtab.test.js`.
- **`js/l10n.js`**: the tab's words and the error messages.

### T2 — Tests

`tests/asm8080.test.js`, with expected bytes for each:

- **Every opcode:** each of the 244 documented opcodes, written as the
  disassembler writes it, assembles back to itself.
- **The manual's examples**, from Chapters 2 to 4: operand forms,
  expressions and their stated values, the pseudo-instructions, and
  each of the macro examples (MAC1, MAC4, EQMAC, STMAC, TMAC, SBMAC,
  LIND, IXAD), with the misprints in the review notes corrected.
- **The simulator's own examples:** each listing in `examples/` is
  already source beside its bytes. The source column, assembled, must
  give exactly the bytes listed, which the existing tests already prove
  run.
- **Errors:** each error message is produced by a test, and says the
  line it should.
- **The tab:** the overlay stays aligned (H1), and Assemble loads the
  way the other loaders do.

### T3 — Example sources

New examples, written as source with labels, comments and the features
each one shows. They are both the menu in the tab (U5) and part of the
golden set the tests run. A first set:

| Example | Shows |
| --- | --- |
| Switches to lamps | The smallest program: `IN`, `OUT`, a label, `JMP` |
| Add two numbers | Chapter 1's program, with names for its addresses (`EQU`) |
| Hello, world | A string with `DB`, a loop, `$` for its length, the 88-SIO |
| Echo | Reading the serial board, a subroutine with `CALL`/`RET` |
| Multiply | Shift-and-add, from Chapter 4's techniques |
| Print a number | Decimal output: division by repeated subtraction, the stack |
| Macros | SHRT and an indirect-load macro, local labels, `::` |

They live in `examples/source/`, with their own README, and are ours,
under the repository's licence.

---

## Part 7 — Plan

On branch `assembler`, merged into `v1.6.0` when done:

1. ✅ **The language core:** tokenizer, expressions, every instruction,
   the pseudo-instructions, two passes, errors (L1 to L15), with the
   opcode, manual and examples tests (T2).
2. ✅ **Macros:** L16 to L22, with the manual's macro examples.
3. ✅ **The tab:** dock icons (U1), the editor and listing (U2 to U4),
   errors, persistence.
4. ✅ **Highlighting:** H1 to H3.
5. ✅ **Examples and translations:** T3, and every message in ten
   languages.
6. ✅ **Docs:** the README; a summary on #12 once reviewed.

Each step is a commit or a few, tested before the next.

---

## Part 8 — Open questions

- **Octal in the listing.** @cj0ne5 is asking his students what they
  would like. The listing is built so that octal can be added as a
  toggle: for toggling bytes in by hand, the panel's switches are
  grouped in octal.
- **The tab's place.** Between Teletype and Debugger (U1), or after
  them?
- **`MVI A,-1`.** L5 follows the manual and rejects it. If that proves
  more confusing than instructive, the alternative is to accept 8-bit
  operands from -128 to 255, as pyGHCassembler does.
