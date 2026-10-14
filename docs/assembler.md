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

**Status.** Built for v1.6.0 (#12), reviewed in class by @cj0ne5 and
then for the release: the language (Parts 2 and 3) in `js/asm8080.js`,
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
  digits, `@` or `?`. We also allow `_` anywhere, which the manual does
  not mention and modern programs expect.
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
- **`END exp`**, as in the manual, names where the program starts:
  Assemble sets the PC there. Without it, the program starts at its
  first byte.

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
or inside a macro by the end of that macro, is an error. A label on an
`IF` or `ENDIF` line names the address there, as on any other line.

### L12 — Beyond the manual: a few compatibility allowances

So that programs written for other 8080 assemblers - pyGHCassembler,
AS, CP/M's ASM - paste in without edits:

- `TITLE`, `PAGE` and `NEWPAGE` are accepted and ignored, whatever
  text follows them (`TITLE Bob's monitor v1.0`). They only ever shaped
  the printed listing.
- Strings may be in double quotes as well as single.
- A colon after an `EQU` or `SET` name is accepted (L1).
- **`INCLUDE`**, whatever follows it, is the one we deliberately
  refuse, with this error:
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
*The address of what follows depends on DONE, which is defined further
down. Define it above this line.*

What counts as defined later goes through names: an `EQU` whose value
comes from a label further down is itself not known early, and nor is
a macro's argument that is. So `X EQU Y+1` followed by `ORG X`, with
`Y` below, is the same error as `ORG Y+1`. Elsewhere such values are
fine, through a chain of `EQU`s too: each link may take another pass,
and the assembler makes as many as the program needs, up to 32.

### L14 — Errors

- **Every error is reported, not just the first**, each with its line
  number, so that one Assemble shows everything to fix. A line with an
  error assembles to nothing, and the assembly goes on; after 100
  errors it stops listing more.
- **The words are plain**, and say what to do where they can:
  *MVI is not written like that. It is written as in MVI A,3FH.* An
  error inside a
  macro's expansion names both lines: the macro's and the one that
  used it (L22).
- **Nothing is loaded if there is any error.** A half-assembled program
  in memory would only mislead.
- The messages are part of the interface, so they are translated into
  all ten languages, as every other message is.

### L15 — Fitting the machine

The program must fit the memory installed. If it does not, the error
says how much it needs: *This program reaches 1234H, but the machine
has 256 B of memory. Install more in the Memory menu.* Two parts of a
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
  error, said once. The depth alone does not bound the work - a macro
  that uses itself three times makes 3^16 expansions before any of
  them is that deep - so macros may also make at most 100,000 lines in
  all, more than any program that fits in 64 KB needs.

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

The listing shows a macro's use on its own row, with the address and
the bytes its expansion made; the expansion, line by line with each
one's address and bytes, is that row's tooltip (U2). An error inside
an expansion is reported on the line that used the macro, naming the
macro's line too: *Line 40, in SBMAC (line 12): …* So is a clash or a
program too big for the machine that an expansion's bytes cause.

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
│ [Examples ▾]  [Assemble]                                                    │
├──────────────────────────────────────────────┬──────────────────────────────┤
│  1        ORG  0         ; start [Clear][Copy]│ 0000                         │
│  2 LOOP:  IN   0FFH             ; switches    │ 0000  DB FF                  │
│  3        OUT  0FFH             ; to the lamps│ 0002  D3 FF                  │
│  4        JMP  LOOP                           │ 0004  C3 00 00               │
│  5        END                                 │                              │
└──────────────────────────────────────────────┴──────────────────────────────┘
   the source, highlighted; Clear and Copy         the listing, line for line
   in its corner
 Line 3: …                                         the errors, when there are any
```

On a phone the toolbar gains **[Listing]** at its right, and the source
and the listing take turns in the one pane.

- **A toolbar** across the top. **Examples** opens a menu of example
  sources (T3); **Assemble**, beside it in the order they are used, is
  the primary button, also pressed with Ctrl+Enter (⌘+Enter on a Mac).
  There was a summary beside them too, the size and range or how many
  errors, kept up to date as you typed; it repeated the listing and
  the error list, and the status line says the same once you
  assemble, so it went.
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

- **Tab** inserts spaces up to the next stop, every eight columns, as
  editors do, since assembly is written in columns; there is no option
  for a tab character. A tab already in pasted text shows at the same
  stops. With lines selected, Tab indents each of them one stop and
  keeps them selected. Either way it is typed as text, so Undo takes
  it back. **Esc, then Tab** moves the focus on, so the keyboard is
  never trapped.
- **The type** is the Teletype paper's, 16 px on 26 px lines, for the
  source, its line numbers and the listing alike.
- **The caret is a block**, as the Teletype's carriage is: dark, the
  character under it light, blinking at the carriage's rate, and still
  while it moves or for readers who ask for less motion. A text area
  cannot draw one, so it is drawn in the highlighting's layer, sized
  to a character's box measured in the editor's own type - a wide one,
  Chinese or an emoji, measured as it stands - and the text area's
  caret is hidden. It hides while text is selected.
- **Copy**, an icon in the editor's corner as on code boxes across the
  web, puts the whole source on the clipboard, and shows a tick; where
  the browser will not allow it, the source is selected to copy by
  hand.
- **Clear**, a little apart beside it, empties the editor as selecting
  everything and deleting it would, through the browser's own delete,
  so Undo (⌘Z or Ctrl+Z, which the status line names) brings the source
  back; no dialog asks first. Only the editor: memory and what was
  loaded stay as they are. It is greyed out while the editor is empty.
- **The source is remembered** in this browser, as you type, and comes
  back with the page. It is never sent anywhere.
- **Assembling does not change the source**: the listing is beside
  it, not merged into it.

### U4 — Assembling

The source is assembled again whenever typing pauses, for the listing,
and the error marks; that touches nothing in the machine.
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

**Examples ▾** lists the simulator's example programs (T3), the same
set and in the same order as the Load menu: the front panel's, then
the Teletype's. There is one set, as source in `examples/`, as @cj0ne5
asked. He would have had the examples in this tab alone, with *Load*
keeping only hex and binary files; we kept them in both, as two ways
in: *Load* assembles an example out of sight and loads its bytes,
leaving the editor alone, and says where its source is; **Examples ▾**
puts the source in the editor. 4K BASIC, which is a binary, is only
in *Load*.

Both menus read the files once, when either first needs them, so like
the rest of the page's files they need it served, not opened from the
disk. Choosing one here replaces the editor's text. If the editor holds
anything that is not an unchanged example, a dialog asks first, since
that text is otherwise lost. Any example counts, not only the one last
chosen, so an example the page brought back after a reload is replaced
without a question too.

### U6 — Words

The tab is a tool, so it reads as software (P5): Title Case labels,
translated into all ten languages. The source is the programmer's own
and is never translated; nor are mnemonics, which are the language.

### U7 — The program counter, followed in the source

Suggested by @cj0ne5's class, stepping through programs: the line the
PC is on is marked in the source, its line number and its listing row,
in the green the Debugger's dump marks the PC with. A macro's
expansion marks the line that used it; a halted machine, its HLT.

Two rules keep it simple:

- **What is marked is worked out afresh every time**, never kept: a
  line only while the source and memory are in sync (below), the
  machine is on and stopped, and the bytes at the PC are still that
  line's. Edit the source, load something else, DEPOSIT over the code,
  run - and nothing is marked, with nothing to undo. Assembling again
  brings it back.
- **The editor scrolls to it only after something the reader did** -
  Assemble, SINGLE STEP, STOP, RESET, opening the tab - and only if the
  line is out of sight. A program that halts by itself is marked but
  never scrolled to, since the reader may be typing; typing,
  selecting and scrolling by hand never move it either.

**In sync** means the source in the editor and the bytes in memory are
still one program. Assemble records the text it loaded and, from the
simulator, its count of whole loads (`Sim8800.memLoads`). Every way
memory changes goes through the simulator, which is where this is
guarded:

| What changes memory | In sync after it? |
| --- | --- |
| Editing the source, Clear, another example | No, until the text is exactly the assembled text again (Undo) |
| Any other load: *Load*'s examples, Hex Bytes, a binary file, 4K BASIC, a link | No, even with the very same bytes |
| Zero All Memory, a power cycle, a change of memory size | No |
| DEPOSIT, DEPOSIT NEXT or a Debugger edit that changes a byte the source made | No |
| The same by hand, anywhere else (the adder's numbers at 0080H) | Yes |
| The program's own stores | Yes: a program may keep its variables among its bytes. Code it rewrites is caught by the bytes at the PC no longer being that line's |

A load, or a byte by hand that changes the program, forgets the record
for good: only Assemble makes a new one. An edit does not, since memory
has not changed: undone back to the exact text, the mark returns.

---

## Part 5 — Highlighting

### H1 — The technique

A `<pre>` of coloured spans sits exactly behind a `<textarea>` whose
text and caret are transparent; the block caret is drawn over both
(U3). The text area does the
editing (selection, undo, the soft keyboard); the `<pre>` shows the
colours. This is the usual way to highlight a text area without a
library, and it is small.

What makes it work, and what the tests check:

- **The same box:** the same font, size, line height, padding, tab
  width and border on both, and no wrapping on either; long lines
  scroll sideways.
- **The same scroll:** the `<pre>` follows the text area's scroll, on
  every scroll event - and can always scroll as far. The text area's
  scrollbars take room from its view, so it scrolls further than a
  `<pre>` without them, by a scrollbar's width; in that last stretch
  the text seen and the text clicked on would part, by over half a
  line. So the `<pre>`, the line numbers and the listing get that room
  at their ends, measured from the text area (it depends on the system,
  and the horizontal bar comes and goes with the longest line), and
  each coloured line is as wide as its text, so the room counts at the
  end of a long one too. `npm run test:browser -- caret` checks it.
- **The same text:** the `<pre>` is redrawn from the text area's value
  on every change, with a trailing newline so that its last line is
  not shorter.

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
| Operator word | `MOD`, `AND` | purple |
| Unknown word | `MVX` | red, wavy underline |

On the light background the dump and the paper already use, each
colour meets 4.5:1 contrast, on the tinted rows of the PC's line and
an error's too. Colour is never the only sign: errors are also marked
in the gutter and listed.

### H3 — Cost

The whole source is tokenized and redrawn on each change, and
assembled again once typing pauses. The examples, under a hundred
lines, take about a millisecond; 600 lines about 14 ms; a source of
thousands of lines, which nobody types by hand, is slower to type in,
some 60 ms a key at 3,000. While the tab is hidden only the PC's mark
is kept up, which is cheap.

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
  examples. It loads the machine through the simulator, as every
  loader does, with `Sim8800.loadMap` for an assembly's scattered
  bytes, and sets the PC for `END exp`; it follows the PC through the
  simulator's count of loads and its reports of bytes put in by hand
  (U7). Its logic that needs no page - the
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
- **The simulator's own examples:** each program in `examples/`
  assembles without an error. The ten that were listings before were
  turned into labelled source that assembles to exactly the bytes they
  listed, which `tests/examples.test.js` already proved run; it runs
  them still, now from the source. (`tty-hello` alone changed: it
  counts its message's length from `$` instead of ending at a zero.)
- **Errors:** each error is produced by a test, and every one has its
  message in all ten languages.
- **The tab:** the overlay stays aligned (H1), and Assemble loads the
  way the other loaders do.
- **In the browser** (`npm run test:browser`, by hand, not in CI): both
  example menus (`examples`), following the PC (`pc`), every row of
  U7's table of what ends the sync (`sync`), Clear (`clear`), the
  caret and the layers to the end of a scroll (`caret`), the editor's
  keys, menu and phone view (`editor`), the Debugger's dump and the
  switches while a program runs (`debugger`), the dock and dialogs at
  every width (`layout`), and the page's font (`fonts`).

### T3 — Example sources

Examples written as source with labels, comments and the features
each one shows. They are both menus (U5) and part of the golden set
the tests run. The first set, written new:

| Example | Shows |
| --- | --- |
| I/O echo | The smallest program: `IN`, `OUT`, a label, `JMP` |
| Add two numbers | Chapter 1's program, with names for its addresses (`EQU`) |
| Teletype hello | A string with `DB`, a loop, `$` for its length, the 88-SIO |
| Echo, with subroutines | Reading the serial board, a subroutine with `CALL`/`RET` |
| Multiply | Shift-and-add, from Chapter 4's techniques |
| Print a number | Decimal output: division by repeated subtraction, the stack |
| Macros | SHRT, a register as an argument, local labels in each use |

They began in `examples/source/`, beside the listings of the Load
menu's ten. Two sets that differed were one too many (@cj0ne5), so all
of them are now source in `examples/`, fourteen programs, with one
README. The new hello took the place of the old `tty-hello`'s listing,
keeping its file and its name, and the new switches program the old
`io-echo`'s, making the same bytes. They are ours, under the
repository's licence, and the old `js/listing.js`, which read the
listings, is gone.

---

## Part 7 — Plan

Built on branch `assembler`, and merged into `v1.6.0`:

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
7. ✅ **@cj0ne5's review:** the PC followed in the source (U7), and one
   set of examples behind both menus (U5, T3).
8. ✅ **The release review:** ten reviewers' reading of all of v1.6.0,
   and what they found fixed, among it macro scoping (L19, L20), a
   macro that uses itself (L16), values known early through names
   (L13), `END exp` (L8), Tab over a selection (U3), the phone's
   listing, and contrast (H2).

Each step is a commit or a few, tested before the next.

---

## Part 8 — Open questions

- ~~**Octal in the listing.**~~ Settled: @cj0ne5's class is happy
  with hex, so there is no octal toggle. The listing is built so that
  one could still be added.
- ~~**The tab's place.**~~ Settled: between Teletype and Debugger
  (U1), in the order you work.
- **`MVI A,-1`.** Kept as the manual has it, for now: L5 rejects it,
  and the error says how to write it (`0FFH`, or `-1 AND 0FFH`). If
  classes find that more confusing than instructive, the alternative
  is to accept 8-bit operands from -128 to 255, as pyGHCassembler
  does.
