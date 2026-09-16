# Running MITS 4K BASIC — investigation and design

This records the investigation behind extending the simulator beyond
its 256-byte memory so that it can run Microsoft's *Altair BASIC 3.2
(4K Edition)*, and every design decision taken along the way.

**All four phases are implemented**
([Part 6](#part-6--implementation-plan)). 4K BASIC boots, takes a
program and runs it, in the browser and in the test suite. The document exists so that the implementation does
not have to rediscover any of it, and so that the reasoning stays
visible if we later change our minds.

Everything in [Part 1](#part-1--what-was-verified) was verified by
running the real ROM against this repository's own CPU core, not read
off a web page. The commands are reproducible; the numbers are from
this machine.

---

## Contents

- [Part 1 — What was verified](#part-1--what-was-verified)
- [Part 2 — Decisions](#part-2--decisions)
- [Part 3 — The Teletype tab](#part-3--the-teletype-tab)
- [Part 4 — The debugger beyond 256 bytes](#part-4--the-debugger-beyond-256-bytes)
- [Part 5 — Example programs](#part-5--example-programs)
- [Part 6 — Implementation plan](#part-6--implementation-plan)
- [Part 7 — Open questions](#part-7--open-questions)
- [Appendix — reproducing this](#appendix--reproducing-this)
- [Part 8 — References](#part-8--references)

---

## Part 1 — What was verified

### 1.1 The CPU core is not a risk

`js/8080.js` is Martin Maly's [8080js](https://github.com/maly/8080js),
which passes the 8080 exerciser. It is also — verified by diff — **the
same file that <https://s2js.com/altair/> uses to run this exact ROM**.
Byte-identical after stripping our file-overview header and one extra
`inte` field that s2js added to `status()`.

- All 256 opcodes have `case` labels; the `default:` branch is a NOP,
  so an undefined opcode cannot crash the machine.
- BASIC begins with `DI` (`F3` at `0000h`) and never enables
  interrupts. No interrupt support is required.
- Throughput measured in Node: ~500 million simulated cycles per
  second. Boot-to-`OK` costs about 0.46 s of *simulated* time at
  2 MHz. The CPU has roughly 250× the headroom it needs.

**The CPU was never the problem. The memory model, the I/O and the
debugger's rendering cost are.**

### 1.2 The ROM

| | |
| --- | --- |
| File | `4kbas32.bin` |
| Size | 4096 bytes |
| MD5 | `8e6f8daa63a8b8b64b26fe36a33bfb95` |
| Real content | `0000h`–`0EFAh` (3835 bytes); `0EFBh`–`0FFFh` is zero padding |
| Load address | `0000h`, absolute |
| Boot loader | **Not needed** — RESET then RUN |
| Identifies as | `BASIC VERSION 3.2` / `[4K VERSION]` |

Downloaded independently from <https://s2js.com/altair/4kbas32.bin>
and from `companje/Altair8800` (`data/4kbas32.bin`); the two files are
byte-identical. This is the right file.

The 28-byte paper-tape boot loader that a 1975 owner toggled in by
hand is only needed to *read the tape*. We load the image directly, so
it is decoration — but a good story to tell in the UI (see
[D12](#d12--tell-the-paper-tape-story)).

### 1.3 How BASIC talks to the machine

Disassembled from the ROM, then confirmed by running it.

**Terminal I/O is the MITS 88-SIO board on ports `00h`/`01h`, with
active-low status.**

```
0377  db 00      IN 00h        ; SIO status
0379  e6 80      ANI 80h       ; bit 7 = 0  ->  transmitter ready
037B  c2 77 03   JNZ 0377h     ; busy, poll again
037E  f1         POP PSW
037F  d3 01      OUT 01h       ; send the character
0381  c9         RET

0382  db 00      IN 00h        ; SIO status
0384  e6 01      ANI 01h       ; bit 0 = 0  ->  a character is waiting
0386  c2 82 03   JNZ 0382h     ; nothing there, poll again
0389  db 01      IN 01h        ; read it
038B  e6 7f      ANI 7Fh       ; strip the 8th bit
038D  c9         RET
```

A third copy of the status poll at `0473h` is the Ctrl-C break check,
which is why BASIC can be interrupted mid-`RUN`.

Note the **inverted logic**: a `0` bit means *ready*. Getting this
backwards makes BASIC hang silently with no output at all.

**The board is chosen at startup from the sense switches.** BASIC does
`IN FFh` at `0D34h` and again at `0D45h`. Our port `FFh` already
returns the upper eight address switches (A15–A8), so this works
today, but the value matters. Swept empirically:

| `IN FFh` returns | Effect |
| --- | --- |
| `00h` (all switches down) | 88-SIO at `00h`/`01h`, active-low — **what we want** |
| `08h` (switch A11 up) | 88-2SIO at `10h`/`11h`, active-high status |
| `10h` (switch A12 up) | A four-port board at `10h`–`13h` |
| `FFh` (all switches up) | Hangs |

So the sense switches must be **down** when BASIC starts. That is a
genuine piece of 1975 operating procedure and worth teaching, not
hiding.

**Terminal conventions**, all verified against the ROM's output:

- **Output must be masked with `7Fh`.** MS BASIC sets bit 7 on the
  last character of every message. The raw byte stream literally reads
  `MEMORY SIZ<C5>? `. Miss this and every prompt ends in garbage.
- **CR and LF must be modelled separately** — CR returns the carriage
  to column 0, LF advances a line. BASIC emits `CR CR LF` sequences;
  treating CR as "newline" double-spaces the whole session.
- **Input must be upper-cased.** `print "hi"` gives `?SN ERROR`.
- `_` (`5Fh`) is rubout, `@` (`40h`) kills the line, Ctrl-C (`03h`)
  breaks. All three confirmed working.
- The ASR-33 is 72 columns; the terminal must wrap there.

### 1.4 The startup dialogue

What a student will actually see, captured from the running ROM:

```
MEMORY SIZE?        <- blank = use everything the probe found
TERMINAL WIDTH?     <- blank = 72
WANT SIN? Y         <- Y keeps SIN, RND and SQR

 4823 BYTES FREE

BASIC VERSION 3.2
[4K VERSION]

OK
```

Answering `N` to `WANT SIN?` chains to `WANT RND?` and then
`WANT SQR?`. Dropping all three frees a flat **246 bytes** at every
machine size (measured: 727 → 973, 4823 → 5069, 13015 → 13261). On an
8 KB machine that is noise. **On a 4 KB machine it is a third more
memory**, which makes the first question of the session a real
engineering trade: trigonometry, or a third again as much program.

### 1.5 The memory model has to change

`Sim8800.getReadByteCallback` / `getWriteByteCallback` currently wrap:
`address = address % self.mem.length`.

BASIC sizes memory by walking upward from `0EFDh`, writing `37h`,
reading it back, writing `36h`, reading it back — the loop at
`0DCDh`–`0DDBh`:

```
0DCA  21 fc 0e   LXI H,0EFCh
0DCD  23         INX H
0DCE  3e 37      MVI A,37h
0DD0  77         MOV M,A
0DD1  be         CMP M
0DD2  c2 ea 0d   JNZ 0DEAh      ; read-back failed -> top of memory
0DD5  3d         DCR A
0DD6  77         MOV M,A
0DD7  be         CMP M
0DD8  ca cd 0d   JZ 0DCDh       ; still RAM -> keep walking
```

With modulo wrapping the probe never finds a top: it wraps to address
`0000h`, overwrites BASIC, and spins forever. Reproduced — **it hangs
at PC = `0DD2h`**.

The fix is the behaviour of a real unpopulated bus: **reads above the
top of memory return `FFh`, writes above the top are dropped.**

Two consequences:

- Applied to `js/sim8800.js` as a probe, **all 50 existing tests still
  pass.** (Kill the Bit's `LDAX D` at `8000h` now reads `FFh` instead
  of `mem[0]`; the value is discarded, so nothing cares.) The probe was
  reverted — the change is not in the tree.
- A **fully populated 64 KB breaks the probe for the same reason** (it
  wraps at `FFFFh`). Either leave the top page unpopulated, or have the
  user answer `MEMORY SIZE?` with a number. This is why 64 KB is not on
  the menu in [D3](#d3--ram-size-is-an-explicit-visible-act).

Free RAM reported by BASIC, by machine size:

| RAM | `BYTES FREE` |
| --- | --- |
| 4 KB | 727 |
| 5 KB | 1751 |
| 6 KB | 2775 |
| 8 KB | 4823 |
| 16 KB | 13015 |

4 KB works and is historically authentic — 727 bytes is genuinely what
people had — but it is cramped. What that actually costs a lesson is
measured in [1.6](#16-what-fits-at-each-size).

### 1.6 What fits at each size

Free RAM is only half the question; what a lesson actually needs is
code *and* data at the same time. Measured by entering program lines
until `?OM ERROR`, and by binary-searching the largest array that will
allocate:

| RAM | `BYTES FREE` | program lines¹ | largest array | **`DIM A(100)` + N lines** |
| --- | --- | --- | --- | --- |
| 4 KB | 727 | 44 | `A(155)` | **15 lines** |
| 8 KB | 4823 | 300 | `A(1178)` | 60+ |
| 16 KB | 13015 | 812 | `A(3226)` | 60+ |

¹ a repeated `NN PRINT X,Y:Z=Z+1` — 18 characters, a realistic teaching
line.

The last column is the one that decides
[D3](#d3--ram-size-is-an-explicit-visible-act). At 4 KB a 100-element
array leaves room for only fifteen lines of code. At 8 KB the
constraint stops existing: 300 lines and an array of 1178 elements
already exceed anything a lesson does. 16 KB triples numbers that were
past the ceiling of use at 8 KB.

**A limit that matters more than memory: 4K BASIC has no string
variables.** `A$="HELLO"` gives `?SN ERROR IN 10`, and `INPUT N$` will
not take text either. No amount of RAM changes this — it is the
interpreter, not the machine. **Any lesson involving names, words or
text is impossible in 4K BASIC**, which should shape lesson design far
more than the choice between 4 KB and 8 KB. The cure is 8K BASIC,
which does have strings, and which is the real reason one might
someday want a 16 KB rung
([D3](#d3--ram-size-is-an-explicit-visible-act),
[Part 7](#part-7--open-questions)).

### 1.7 The real bottleneck is the debugger, not the CPU

`Sim8800.step()` calls `dumpCpu()` and `dumpMem()` on **every tick**,
and `panel.dumpMemCallback` assigns the result straight to
`innerHTML`. Cost of building the string alone:

| RAM | per `dumpMem()` | HTML per call | at ~250 ticks/s |
| --- | --- | --- | --- |
| 256 B | 0.03 ms | 1 KB | 8 ms/s |
| 4 KB | 0.34 ms | 14 KB | 85 ms/s |
| 16 KB | 1.50 ms | 57 KB | 376 ms/s |
| 64 KB | 6.16 ms | 228 KB | 1540 ms/s |

A two-second BASIC session driven through the real `Sim8800` produced
**493 dumps totalling 27.4 MB of HTML**. And that is only string
building — the browser then has to parse and re-lay-out 57 KB, 250
times a second.

### 1.8 Layout arithmetic

Computed from `css/style.css` and `index.html` (no browser was
available to measure; the numbers are deterministic):

```
content width (main 1200px - 20px padding)      1180 px
panel svg (keeps its 1440x644 aspect ratio)      528 px
chrome above it (header-bar, nav, margins)       159 px
switchboard helper (subheader + 2 button rows)   168 px
                                                --------
Sim tab as it stands today                       875 px
24-line teletype block                          +734 px
                                                --------
a merged Panel+Teletype tab                     1609 px
```

These numbers decide [D8](#d8--the-teletype-is-its-own-tab).

---

### 1.9 Restarting BASIC: the warm start

Press RESET then RUN on a machine where BASIC is already up, and it
comes back to `OK` with your program intact rather than asking
`MEMORY SIZE?` again. That is correct, and it is BASIC's doing, not
the simulator's.

The ROM begins:

```
0000  f3         DI
0001  c3 21 0d   JMP 0D21h      ; cold start: the questions
```

Once initialisation has finished, BASIC **overwrites the two bytes of
its own jump target** so that address `0000h` points at `01F9h`
instead:

```
01F9  21 8d 01   LXI H,018Dh    ; -> "\rOK\r"
01FC  cd ..      CALL ...       ; print it, then the command loop
```

So `0000h` is a cold start exactly once. Afterwards it is the warm
start. Verified by diffing the running machine against the ROM file:
66 bytes below `0EFBh` differ after a boot, and two of them are the
jump target at `0002h`-`0003h`.

**This exposed a real bug in the simulator.** A real 8080's RESET line
clears the program counter and the interrupt enable and *leaves every
register alone*, stack pointer included. `js/8080.js`'s `reset()`
clears everything, which is a power-on reset. The warm start does not
set up a stack — it assumes the one BASIC was already using — so with
SP zeroed the first `PUSH` wrapped to `FFFEh`, which is unpopulated on
a 4 KB machine: writes vanished, `RET` popped `FFFFh`, and BASIC never
reached its prompt. It printed nothing at all.

`Sim8800.reset()` now restores the registers after calling the core's
`reset()`, and `powerOn()` does the full clear instead. Covered by
tests at both levels: that RESET keeps A, B and SP while zeroing PC,
and that RESET plus RUN warm starts BASIC with the program still
listable.

---

## Part 2 — Decisions

### D1 — Ship the ROM in `roms/`, with a NOTICE

`roms/4kbas32.bin`, alongside `roms/NOTICE` stating its provenance
(the two byte-identical sources, the MD5) and stating plainly that it
is **Microsoft-copyrighted and not covered by this repository's
Apache-2.0 licence**.

Also offer a file picker so anyone can supply their own image — that
covers 8K BASIC and anything else, and it gives a clean answer to
anyone uncomfortable with the ROM being in the tree.

*Why:* the image is mirrored everywhere and nobody has ever been
troubled over it, but this is an educational repository under a
permissive licence and the distinction should be explicit rather than
quietly assumed.

### D2 — Bounded memory, no wrapping

Reads above the top of memory return `FFh`; writes above the top are
dropped. See [1.5](#15-the-memory-model-has-to-change).

*Why:* without it BASIC cannot boot at all. It is also simply more
accurate — a real Altair with 4 KB installed does not mirror that RAM
across the whole 64 KB address space.

### D3 — RAM size is an explicit, visible act

A RAM selector offering **256 B / 4 KB / 8 KB**. Changing it forces a
cold boot, exactly as adding a memory board to a real machine did.
Present it as what it physically was: *you just installed an 88-4MCS
4 KB static memory board*. Every rung is one real MITS board — the
base machine's 256 bytes, one **88-4MCS**, then two of them — so the
selector can name actual hardware rather than a number.

**256 B stays the default.** The existing tutorial, the examples and
the tests are untouched, and a 256-byte Altair is historically correct
— that is what the base machine shipped with.

*Why:* this is not a workaround for a UI problem. "Memory is a
physical thing you install, and installing it changes what the machine
can do" is a lesson the simulator cannot teach today.

**Each rung has to teach something different**, which is what settles
the sizes:

| Rung | What it is for |
| --- | --- |
| 256 B | The whole machine on one screen. Front panel, octal, `tty-leds` |
| 4 KB | BASIC *just barely* fits. 727 bytes, fifteen lines beside an array, `?OM ERROR` a live risk. The authentic 1975 machine |
| 8 KB | "I added a second board and now I can actually work." The contrast is the lesson |

The 4 KB rung is the one that earns its place, because of the memory
map strip in [D4](#d4--the-memory-dump-is-windowed-never-grown): at
4 KB the strip is sixteen cells and BASIC fills fifteen of them. The
student *sees* why it is called 4K BASIC and where the 727 bytes went.

*Rejected: 16 KB.* It buys nothing observable over 8 KB — 300 lines
and a 1178-element array are already past what any lesson needs
([1.6](#16-what-fits-at-each-size)) — and over-provisioning has a real
cost here: if the top rung is so large that scarcity never bites, the
lesson this decision exists for quietly evaporates. Keeping the top at
8 KB also holds the address space to `0000h`–`1FFFh`, small enough for
a student to hold in their head, and the map strip to 32 cells rather
than 64.

*Not rejected forever.* 16 KB is not wrong, it is premature: its
justification is **8K BASIC**, which has the string variables 4K BASIC
lacks ([1.6](#16-what-fits-at-each-size)), not 4K BASIC. The ROM file
picker in [D1](#d1--ship-the-rom-in-roms-with-a-notice) already allows
the image and the size is a constructor argument, so adding a 16 KB
rung is a one-line change on the day strings are wanted.

*Also rejected:* a 64 KB option, because it breaks BASIC's memory probe
(see [1.5](#15-the-memory-model-has-to-change)).

### D4 — The memory dump is windowed, never grown

When RAM exceeds 256 B the debugger keeps showing **exactly 256 bytes
in 16 lines** — the same visual object the student already knows —
plus:

- a **memory map strip** above it: one cell per 256-byte page, shaded
  by how much of the page is non-zero, outlined on the page being
  shown, and marked where PC and SP are. Click a cell to move the
  window.

  The shading has **five steps**, by the share of that page's bytes
  that are not zero — `level = used == 0 ? 0 : ceil(used / 256 × 4)`:

  | Step | Non-zero bytes | Meaning |
  | --- | --- | --- |
  | 0 | 0 | untouched |
  | 1 | 1–64 | up to a quarter in use |
  | 2 | 65–128 | up to a half |
  | 3 | 129–192 | up to three quarters |
  | 4 | 193–256 | nearly or completely full |

  Each cell's tooltip gives its address range and that percentage, so
  the scale does not have to be learnt: `0000-00FF  98%`.
- a **follow-PC toggle**.
- highlighting of the bytes at PC and SP inside the window. Applied at
  every size, including 256 B, where watching PC walk through the
  dump is worth having on its own. **Green** for PC and blue for SP:
  red was tried first and reads as an error, which a program counter
  is not.
- the window defaults to the first 256 bytes.

*As built,* the shading tells the intended story only on a machine
that was zeroed first, so `panel.loadImage` zeroes memory before it
loads: load BASIC on a 4 KB machine and the strip reads
`█▓█████████████ ` — fifteen of sixteen pages full, one left over.
That is D3's lesson in one line of pixels. A machine straight from
power-on is full of random bytes and reads as solid, and after BASIC
has run its memory probe every page has been written, so it reads
solid again. Both are truthful; neither is the picture worth teaching
from.

*Why:* it preserves the "one screen shows the whole machine" property
that is the best thing about the current debugger, and it adds the
concept of *address space versus window* — which is exactly the idea
that becomes real the moment memory stops fitting on a screen. It also
solves [1.7](#17-the-real-bottleneck-is-the-debugger-not-the-cpu) as
a side effect: 16 lines render regardless of how much RAM exists.

### D5 — Dumps are coalesced and skipped when hidden

`dumpCpu()` / `dumpMem()` stop firing from inside `step()`. They
coalesce on `requestAnimationFrame`, and do nothing at all while the
Debug tab is hidden.

*Why:* [1.7](#17-the-real-bottleneck-is-the-debugger-not-the-cpu).
Worth doing even at 256 B, and mandatory above it.

### D6 — Ports become a device table

Replace the `if (address == 0xff)` chain in
`getReadPortCallback`/`getWritePortCallback` with a small device table
— `sim.attachDevice(port, device)` — and register the front panel as
the device on port `FFh` like any other.

*Why:* it is the change that makes everything else small. It also
makes devices unit-testable in Node with no DOM, which is how the
existing `tests/fixture.js` already works.

### D7 — An 88-SIO device on ports `00h`/`01h`

`js/sio.js`: an rx queue, a tx callback, `readStatus()`, `readData()`,
`writeData()`. Active-low status per
[1.3](#13-how-basic-talks-to-the-machine). No DOM.

**Both boards are fitted.** The same class serves the 88-2SIO at
`10h`/`11h`, whose 6850 reports the opposite way up — a *set* bit means
ready — selected by `attachTo(sim, Sio.TWO_SIO_BASE_PORT, false)`. The
teletype is wired to both slots and the two boards share one key queue,
since there is one keyboard, so whichever board software picks it
answers.

That is a deliberate departure from the hardware: a real Altair had one
of the two boards fitted, and choosing the other in the sense switches
left the machine silent. Here, raising switch A11 moves BASIC from
`00h`/`01h` to `10h`/`11h` and it keeps working — which turns a
mysterious dead machine into something a student can watch happen. The
tutorial says as much rather than pretending otherwise.

### D8 — The Teletype is its own tab

Tab order: **Simulator | Teletype | Debugger | Tutorial.**

*Why second, not last:*

1. The panel and the teletype are the two surfaces a 1975 owner
   physically touched. The Debugger is the one tab that is not part of
   the machine at all — it is an X-ray. The strip then reads as a
   gradient: *machine → terminal → lift the lid → docs*.
2. Once BASIC exists, the headline experience is Panel → Teletype.
   Third place behind a tab labelled "Debug" makes it look like a
   developer tool.
3. On a phone the first two tabs are what a casual visitor wants.

*The cost, stated honestly:* Debug moves from second to third, so this
is not a pure append and existing users lose a little muscle memory.
There is also a workflow argument for keeping Debug second (it is
where you load a program before running it) — but the workflow already
starts at Panel for power-on, so it is not a clean sequence either way.

*Why not merge the Panel and the Teletype into one tab*, as they sat
on one desk — from [1.8](#18-layout-arithmetic):

| | Design | Both visible? | Verdict |
| --- | --- | --- | --- |
| A | Separate tabs | No | Baseline |
| B | Merged, stacked | **No** — 1609 px tall, ~900 px apart | Pays the cost, does not buy the benefit |
| C | Merged, side-by-side | Only above ~1400 px, and switch sprites render 8 px wide | Two layouts to maintain for a minority of screens |
| D | Floating draggable overlay (what s2js does) | Yes, by covering the panel | Breaks the tab metaphor; focus and z-order work; overlay ≈ fullscreen at 390 px |
| E | Collapsible drawer on the Panel tab | **Yes, partially** | Strongest runner-up — see below |
| F | Separate tab **+ LED repeater strip** | Yes, the part that matters | **Chosen** |
| G | Pop-out browser window | Yes | Popup blockers, state sync, no mobile |

The Sim tab is *already* 875 px, which overflows a 1366×768 laptop —
you scroll today just to reach the helper buttons. So merging does not
add a teletype to a screen with room; it adds 734 px to a screen
already over budget, and the two devices end up ~900 px apart. That is
arithmetic, not taste.

**E deserved more credit than it first got.** On the real Altair the
LEDs are the top row and the switches the bottom row, so a drawer
sliding up from the bottom covers the switches and leaves the LEDs
visible — and while typing BASIC you do not need switches. What costs
it the decision: fixed/sticky positioning in a page that currently
does no layout tricks at all, a collapsed/expanded state to explain
and localise, and mobile. Keep it on the table.

**Fidelity actually favours separate tabs.** On a real desk you do not
look at both at once. Toggling in a boot loader, your eyes are on the
panel; typing BASIC, they are on the paper, and the panel LEDs are
meaningless flicker through ROM. The tab switch *is* the head-turn.

### D9 — An LED repeater strip on the Teletype tab

A compact row on the Teletype tab: the 16 address LEDs, the 8 data
LEDs, and WAIT/HLT, reusing the existing LED sprites at small size.
About **40 px**.

*Why:* there are exactly two moments where you genuinely need the
panel and the paper at once — the `tty-leds` demo (type a key, watch
its ASCII code light up) and "is it actually running?" while BASIC
boots. Both need eight lamps, not a 528 px panel. This delivers the
whole real benefit of merging for about 3% of its vertical cost, and
it makes `tty-leds` self-contained on one screen — *better* than a
merged tab, where the LEDs would sit 900 px above the paper.

### D10 — An activity indicator on the Teletype nav item

When the SIO emits output while another tab is showing, mark the
Teletype nav item (a dot, or a brief pulse).

*Why:* it recovers the one remaining argument for merging — awareness.
Nobody should miss that BASIC is sitting there asking `MEMORY SIZE?`.

### D11 — The SIO is a device, not a view

**Invariant.** The teletype keeps running while its tab is hidden: the
rx queue buffers, the paper accumulates, `OUT 01h` never blocks on the
DOM, and nothing in `js/sio.js` touches `document`.

*Why:* besides being correct, it makes [D8](#d8--the-teletype-is-its-own-tab)
purely presentational. Moving later from design F to design E becomes a
markup-and-CSS change with no core impact.

### D14 — Loading stops short of running

`panel.loadImage` powers the machine up if needed, zeroes memory, puts
the image at `0000H` and presses RESET — and stops there. It does not
RUN.

*Why:* loading and starting were two separate acts on the real
machine, and keeping them separate leaves the front panel with
something to do. It also preserves the lesson in
[D3](#d3--ram-size-is-an-explicit-visible-act): the loader sits in the
Debug tab, so the moment BASIC is loaded the memory map above shows it
filling fifteen of the sixteen pages, *before* BASIC's own memory probe
runs and writes over every page. Auto-running would hide exactly the
picture worth seeing.

### D15 — One status line, at the foot of the machine

Everything the simulator wants to say — the power went off, a board
was installed, a tape was loaded, something will not work — says it in
a single bar under the tabs, with a warning and an error colour.

*Why:* much of what this machine does is only unsurprising if you
already know how these machines worked. Installing memory switches the
power off, so the memory dump goes blank; a tape is loaded but not
started; RESET moves the program counter but nothing visibly happens.
To a newcomer each of those reads as the app breaking. A traditional
status line is the cheapest way to turn every one of them into a
sentence, and it gives warnings and errors somewhere to go that is not
an alert box.

*Replaced:* the ad-hoc `rom-status` line under the loading buttons.
One place to look beats several.

### D16 — The paper is never cleared automatically

Power off, power on, RESET, installing memory and loading a tape all
leave the paper exactly as it was. Only CLEAR PAPER tears it off.

*Why:* it is paper. Switching a teletype off does not erase what it
has already printed, and the roll surviving a power cycle is how you
compared this run with the last one. [D15](#d15--one-status-line-at-the-foot-of-the-machine)
covers the confusion this might otherwise cause, by saying what just
happened rather than wiping the evidence of it.

*The one gap, known and accepted for now:* reloading the page does
clear the paper, because nothing outside the tab holds it. So the rule
a user actually experiences is "the paper survives everything except a
reload", which is a slightly odd rule to have to learn. Reviewed and
kept as it is; the fix, if it ever matters, is to keep the roll in
`localStorage` so that the model has no exception in it.

*If this is ever reversed* — power off tearing the paper off — the
place to do it is `panel.onPowerOff`, and it is one line.

### D12 — Tell the paper-tape story

No boot loader is technically needed ([1.2](#12-the-rom)). Say so,
and say what it replaced: on a real machine you toggled in 28 bytes by
hand and then listened to the tape read for seven minutes. s2js shows
this as a splash before loading; it is a good moment and worth
keeping.

### D13 — Nine locales, as usual

The Teletype tab needs roughly eight new keys in `js/l10n.js` —
`nav-tty`, `tty-title`, `tty-helper-title`, `tty-break`, `tty-rubout`,
`tty-kill`, `tty-clear`, `tty-hint` — plus whatever the RAM selector
and the memory-window controls need, across all nine locales.

### D17 — Three surfaces, three voices

The app has controls of three different kinds, and they should not try
to look alike. The unit is the **surface**, not the individual control:
a tab speaks in one voice throughout, so a control that is not strictly
part of that machine still takes the voice of the tab it sits on.

**The machine.** Everything on the Simulator tab stands for a switch
that exists on a real Altair 8800. `OFF/ON`, `STOP`, `RUN`,
`SINGLE STEP`, `EXAMINE`, `DEPOSIT`, `RESET`, `A15`–`A00`. These keep
the silkscreen's **UPPERCASE**, and they are **not translated**: they
are the legend printed on the metal, and a photograph of the real
panel does not change language. They are never hidden and never
disabled, because a physical switch is always there to be thrown —
throwing one on a dead machine simply does nothing, which is also true
here.

**The teletype.** The Teletype tab is uppercase too, but for a
different reason, and this one matters: the ASR-33 had **no
lowercase**. Sixty-four characters, capitals only. The paper is
uppercase because the machine could not print anything else, the input
box force-uppercases what is typed into it, and the tab exists partly
to show that. So `CTRL-C (BREAK)`, `RUBOUT (_)`, `KILL LINE (@)` and
`CLEAR PAPER` are uppercase, and lowercase buttons sitting under an
uppercase paper roll would quietly contradict the lesson.

These *are* translated, unlike the panel legends, and the difference is
real rather than an oversight: `RESET` is an object being
photographed, while `CLEAR PAPER` is an instruction about what will
happen when you press it. Instructions translate. They stay uppercase
because that is the device's case, not because they are legends.

Two of the four are not strictly teletype controls at all — an ASR-33
has no CLEAR PAPER button, you tear the paper off, and `KILL LINE`
describes what `@` does rather than naming a keycap. They keep the
uppercase anyway, by the surface rule above. `Clear Paper` standing in
a row with `RUBOUT (_)` would be a worse inconsistency than the one it
fixed.

**The instrument.** The Debugger tab is the simulator's own tooling.
None of it existed in 1975: there was no "load a file", no example
menu, no memory dump you could page through. So it follows ordinary
software convention instead — **Title Case**, matching the section
headings already there (*Load a Program*, *Installed Memory*,
*Memory Dump*), and **translated into all nine locales**.

*Why the split at all:* the sets answer different questions. A panel
legend answers "what is this switch called on the machine"; an
instrument label answers "what will this do for me". Making the last
set shout in uppercase, as `LOAD 4K BASIC`, `FOLLOW PC` and
`ZERO ALL MEMORY` used to, borrowed the machine's voice for something
the machine never had, and left the tab reading in three different
cases at once next to `Load Data` and `Example programs...`.

*As it stands, audited:*

| Tab | Case | Translated | Why |
| --- | --- | --- | --- |
| Simulator | UPPERCASE | no (25 of 25) | silkscreen on the panel |
| Teletype | UPPERCASE | yes (4 of 4) | the ASR-33 had no lowercase |
| Debugger | Title Case | yes | software the machine never had |

### D21 — The map strip is edited, not rebuilt

The memory dump is written into the page with `innerHTML` on every
repaint, sixty times a second while a program runs. That is fine for
the hex, which is text and nothing else. It was not fine for the map
strip, which was built into the same string: every cell was destroyed
and recreated on every frame.

A browser hangs a good deal off an element that only lives as long as
the element does. All of it broke, and each break was found separately
before the cause was:

- a click needed its press and its release on the same cell, so the
  map appeared dead whenever anything was running — worked around at
  the time by reading `pointerdown` instead;
- a `:hover` outline never appeared while a program ran, and was
  removed rather than fixed;
- the tooltip naming each page's address range and how full it is
  needs about a second of stillness, and never had a hundredth of one.

So `Sim8800.getMemMap()` now returns the strip as **data** — one entry
per page, with its range, fill level, and whether the window, PC or SP
is in it — and `panel.renderMemMap()` keeps the cells and edits them.
Only what changed is written, each assignment guarded by a comparison,
because writing the same title again is itself enough to dismiss a
tooltip that is already up. Measured in the browser: **zero** DOM
mutations across thirty repaints of an idle machine, and three when
the program counter crosses into another page.

*Why it was worth doing rather than living with:* three separate
symptoms, one cause. Two had already been papered over in ways that
cost something — a `pointerdown` where a click belonged, and a
navigational affordance deleted outright.

*The one case that remains:* a page whose fill percentage is actually
changing rewrites its own label, which will dismiss a tooltip held
over that cell. Left alone deliberately — the alternative is showing a
number that is no longer true.

### D22 — Two files are why the app now wants a web server

Everything the simulator needs to be a simulator is in the page. Two
things are not, and both arrived with this work: the example listings
in `examples/`, and the BASIC tape in `roms/`. The page reads them at
the moment they are asked for.

A browser treats a `file://` page as a different site from the files
sitting beside it, so it refuses both. The README's old promise —
*simply open index.html in browser* — became half true the day the
first `fetch` was added, and said nothing about the half that was not.

*Rejected: inlining them.* The listings could be pasted into the page
as data, and the 4 KB tape base64'd into a string. Both would undo
something deliberate. The listings are the only copy of those programs
anywhere — [Part 5](#part-5--example-programs) — and a second copy in
the page is a second copy to drift. The tape is shipped in its own
commit with its own NOTICE, because it is Microsoft's and not under
this repository's licence; dissolving it into a JavaScript string
takes that separation apart.

*Rejected: a build step.* It would generate exactly those copies, and
this project has no build, no dependencies and nothing to install.
That is worth more than saving a reader one command.

*Done instead:* the README leads with serving the directory and says
plainly what does and does not work without it, and the app detects
the case itself. `panel.needsServer()` tests the protocol rather than
waiting for a fetch to fail, so the two controls are grey before they
are pressed and the reason given is the true one rather than "could
not be read". Pressing either says what to run.

This is [D19](#d19--a-greyed-control-still-answers) doing the work it
was built for: the reader is not left guessing, and the fix is in the
message.

*Also covered:* a menu with nothing in it now declines to open.
Previously it opened as a box of nothing, which told the reader less
than not opening would have.

### D18 — Nothing in the Debugger is hidden; it greys out instead

The memory paging controls used to disappear entirely on the 256 byte
machine, on the grounds that a single page cannot be paged. Now they
stay and grey out.

*Why:* a control that vanishes takes its own explanation with it. The
reader never learns that the debugger can page through memory, or that
installing a board is what unlocks it — the feature is simply absent,
and the row beside it jumps whenever the memory size changes. A greyed
control stays in place, keeps the layout still, and can be asked why.

### D19 — A greyed control still answers

This is the deliberate departure from industry convention, and the
reason for it is that this is a teaching app.

Everywhere else, a disabled button ignores the press. Here it takes it
and replies in the status bar ([D15](#d15--one-status-line-at-the-foot-of-the-machine))
with the reason it is grey:

| Control | Grey when | Says |
| --- | --- | --- |
| Load 4K BASIC | less than 4 KB installed | *4K BASIC needs at least 4 KB installed. Choose 4 KB or 8 KB under Installed Memory.* |
| ◀ ▶ Follow PC | machine off | *The machine is off, so there is no memory dump to move around in.* |
| ◀ ▶ Follow PC | all memory fits one page | *All 256 B is on screen at once. Install 4 KB or 8 KB and the dump gets a window to move.* |
| Zero All Memory | machine off | *The machine is off, so there is no memory to zero.* |

*Why:* a dead end with no explanation teaches nothing. Every one of
these reasons is a fact about the machine worth knowing — how much
memory BASIC needs, that memory is volatile, that the dump window only
exists once there is more memory than fits on screen.

*How it is kept honest:* `panel.debugControlReasons()` is the only
place that decides, and both the greying (`panel.updateDebugControls`)
and the message (`panel.reportIfUnavailable`) read from it. They
cannot disagree. They did once: `ZERO ALL MEMORY` explained itself
while `FOLLOW PC` went silent, and the window label counted up pages
the dump was not showing. `tests/panel.test.js` checks that every
control named there is on the page and that every reason has a
message in every locale.

### D20 — Anything that loads a program switches the machine on

All four ways in — Load 4K BASIC, the example menu, Load Binary File,
Load Data — power the machine up first if it is off. Three of them
already did; Load Data used to refuse with *the machine is off, so the
bytes would go nowhere*.

*Why:* pressing the thing that loads should load. A refusal here is a
dead end that costs a trip to the other tab and teaches only that the
button was in the wrong mood. The machine coming up is not hidden —
the OFF/ON button turns green and memory fills with the random bytes a
real one powers up with, which is worth seeing. It is on the other
tab, though, which is what [D23](#d23--the-beep-belongs-to-the-switch)
is for.

*The one distinction kept:* the three that load an *image* clear
memory first and press RESET, because a tape is a fresh start.
Load Data is a **deposit** — the DEPOSIT switch's equivalent — so it
leaves the rest of memory alone and puts its bytes in as they are.

### D23 — The beep belongs to the switch

The beep was the sound of `panel.onPowerOn()`, so it played whether
the machine was switched on by hand or woken up by a load ([D20](#d20--anything-that-loads-a-program-switches-the-machine-on)).
From the Debugger tab, where all four loaders live, that meant a
student loading two programs in a row heard the machine chirp at the
first one and say nothing at the second, with the OFF/ON button that
explains why sitting on a tab they were not looking at. Worse, the
beep is half a second late, so it does not even arrive attached to the
click that caused it. *Loading program A beeps, loading program B does
not* is a rule about the machine that no one can learn, because it is
not one.

Two changes, and the confusion is a fact worth knowing instead:

- **The sound follows the switch.** `panel.onPowerOn()` is silent;
  `panel.onToggle()` schedules the beep when the OFF/ON switch is what
  turned the machine on. The rule a student can now state is the same
  one the toggle and switch clicks already follow: *the panel makes a
  noise when I touch the panel.*
- **The status line says when a load switched the machine on.**
  `panel.ensurePoweredOn()` returns whether it had to do anything,
  `panel.loadImage()` passes that back with the byte count, and
  `panel.setStatus()` puts *The machine was off, so it was switched on
  first* in front of the load's own message — before it, not after, so
  the line still ends with what to do next
  ([D15](#d15--one-status-line-at-the-foot-of-the-machine)). It is
  held as a message id like everything else on that line, so it
  survives a change of language.

*Why not the other way round* — a sound on every load: the beep is the
machine coming up, and a machine that is already on has not come up.
Making it uniform would mean a device announcing something that did
not happen, which is the kind of small lie this simulator is otherwise
careful not to tell. The real Altair had no power-on beep at all, so
there is no authenticity to trade off here — only whether the sound
means one thing or nothing in particular.

### D24 — A dead board hears nothing

Characters typed at the teletype go into the 88-SIO's receive queue,
where they wait for the program to read them. That is right while the
machine is *stopped*: the board receives on its own, the CPU reads when
it gets round to it, and a character typed during a STOP is genuinely
still there when the program runs on. It was also happening with the
machine switched **off**, and nothing cleared the queue on the way back
up — only on the way down. So keys typed at a dead machine were
delivered to whatever ran next, minutes later.

`panel.ttySend()` now refuses while the machine is off, and says so in
the status line the way every other unavailable control does
([D19](#d19--a-greyed-control-still-answers)): *the machine is off, so
keys typed here go nowhere.* CLEAR PAPER still works, because tearing
off the paper is something you do to the terminal, not to the machine.

*What is still not the hardware:* `Sio.rx` is an unbounded queue, where
a real board holds exactly one character and drops the rest with an
overrun bit set. Type four keys during a STOP and all four come back;
a real Altair would have kept the last. The simplification is
deliberate — losing a student's keystrokes teaches nothing about
overrun — but it is a simplification, not the machine.

### D26 — A HLT stops the machine, and the panel says so

`tty-hello` and `tty-ascii` are documented as halting once they have
printed, and the 8080 did halt: PC froze one past the `HLT`. The panel
did not notice. `isRunning` stayed true, the status line went on saying
*Running.*, the WAIT lamp stayed dark, and the clock ticker kept handing
the halted CPU batches of cycles to burn. A student who ran either
program had no way to tell that it had finished rather than gone quiet,
and had to press STOP on a machine that had already stopped.

`Sim8800.step()` now watches for it. No 8080 instruction is over in one
cycle, so a step that consumes exactly one is a halted CPU marking time
— the same signal the LDAX check already relied on. The machine calls
`halt()`, which stops the run and lights WAIT, exactly as the real one
did; `panel.setWaitLedCallback()` sees the machine stop with `halted`
set and puts the reason on the status line, so the fact is available to
somebody who does not yet know what the WAIT lamp means
([D15](#d15--one-status-line-at-the-foot-of-the-machine)).

RESET clears it, as on the hardware: the 8080 leaves a halt only on an
interrupt or a reset, and `reset()` already calls the core's `reset()`.
Pressing RUN on a machine that is still halted halts it again
immediately, which is also what the real one did.

### D25 — LINE FEED is a key the host keyboard does not have

RETURN sends `0Dh` and only that, so in `tty-echo` the carriage slams
back to column 1 and the paper does not move; type on and you overprint
the line, exactly as the ASR-33 did. That is the mechanism worth
seeing, and half of it was unreachable: a PC keyboard has no LINE FEED
key, and Ctrl+J belongs to the browser.

So the helper row gets one, next to the other keys it exists to supply.
It goes through `panel.ttySend()` like any other key, which means the
paper moves only if a program echoes it — the terminal is not wired to
its own printer. Press RETURN then LINE FEED under `tty-echo` and the
two halves of a newline come apart in front of you, which is why MITS
BASIC sends CR CR LF.

---

## Part 3 — The Teletype tab

Minimalist, and consistent with the visual language already in
`css/style.css`: `#ccc` rounded panels with `#222` monospace text,
`#666` subheader bars, `#eee` buttons, `#f90` for the selected nav.

```
 ┌────────────────────────────────────────────────┐
 │  Teletype (ASR-33)            .subheader-bar   │
 ├────────────────────────────────────────────────┤
 │ MEMORY SIZE?                                   │
 │ TERMINAL WIDTH?                                │
 │ WANT SIN? Y                                    │   72 cols
 │                                                │   x 24 lines
 │  4823 BYTES FREE                               │
 │ OK                                             │
 │ ▌                                              │
 ├────────────────────────────────────────────────┤
 │ [A15..A00 address]  [D7..D0 data]  [WAIT]      │   D9, ~40px
 ├────────────────────────────────────────────────┤
 │  Teletype Helper              .subheader-bar   │
 │ [CTRL-C] [RUBOUT (_)] [KILL (@)] [LINE FEED] [CLR] │
 │ Type here. The machine must be running a       │   .comments
 │ program that reads the SIO — try tty-echo.     │
 └────────────────────────────────────────────────┘
```

- **The paper** follows `#mem-dump`'s treatment — `border-radius: 10px`,
  `padding: 5px 10px`, `overflow-x: auto` — at 16 px on 26 px lines,
  23 lines tall with `overflow-y: auto`, auto-scrolled to the bottom.
  72 columns wide, so on a phone it scrolls sideways, exactly as the
  memory dump does.
- **The paper is tinted** (`#e8e2d0`) rather than `#ccc`. One hex value,
  and it reads instantly as *a physical device rather than a screen* —
  consistent with the app's stance, given the Simulator tab is already
  photoreal SVG artwork. See [Part 7](#part-7--open-questions).
- **Cursor:** an inverse block over the character at the carriage,
  blinking via CSS `@keyframes` only while powered on.
- **Teletype Helper row** mirrors the existing *Switch Board Helper*
  pattern exactly, because it solves the same problem: keys that are
  awkward or impossible on a phone.
- **Mobile:** a visually hidden `<input>` takes focus when the paper is
  tapped, to summon the soft keyboard.
- No hood, no fake platen, no borders.

**Key mapping**, from [1.3](#13-how-basic-talks-to-the-machine):

| Key | Sent | Note |
| --- | --- | --- |
| letters | upper-cased ASCII | lowercase gives `?SN ERROR` |
| Enter | `0Dh` | |
| Backspace | `5Fh` (`_`) | BASIC's rubout |
| Ctrl+C | `03h` | break |
| Esc / Ctrl+U | `40h` (`@`) | kill line |
| LINE FEED (helper row only) | `0Ah` | advances the paper ([D25](#d25--line-feed-is-a-key-the-host-keyboard-does-not-have)) |

**Output handling:** mask with `7Fh`; CR sets column 0, LF advances a
line; wrap at column 72.

The keyboard only reaches the machine while it is on
([D24](#d24--a-dead-board-hears-nothing)).

---

## Part 4 — The debugger beyond 256 bytes

Per [D4](#d4--the-memory-dump-is-windowed-never-grown). At 256 B
nothing changes at all — the window is the whole machine, which is the
point.

```
 ┌────────────────────────────────────────────────┐
 │  Installed Memory                              │
 │ [256 B · as it shipped] [4 KB · one 88-4MCS] … │
 ├────────────────────────────────────────────────┤
 │  Memory Dump                                   │
 │ 0F00-0FFF [◀][▶] [Follow PC] [Zero All Memory] │
 │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░░░░░░░░░░  ← map strip  │
 │ ↑BASIC                    ↑PC  ↑SP             │
 ├────────────────────────────────────────────────┤
 │ 0F00  00 11 22 ...                             │
 │ ...   16 lines, 256 bytes, always              │
 └────────────────────────────────────────────────┘
```

---

## Part 5 — Example programs

The full set of ten, with their bytes, is in
[../examples/README.md](../examples/README.md). This part covers the
four teletype programs written for this work, verified against this
repository's CPU core on a 256-byte machine with an 88-SIO stub, and
the order all ten are offered in. **The teletype is useful at the
default RAM size** — it does not depend on the memory work at all.

| Program | Size | What it does |
| --- | --- | --- |
| `tty-echo` | 16 B | Type a character, it appears. The whole SIO on one screen |
| `tty-leds` | 18 B | Echo, *and* mirror the ASCII code onto the data LEDs |
| `tty-hello` | 39 B | Prints `HELLO, WORLD!` and halts, with a proper Tx-ready wait |
| `tty-ascii` | 20 B | Prints `20h`–`7Eh`, then halts |

```
tty-echo    db 00 e6 01 c2 00 00 db 01 e6 7f d3 01 c3 00 00
tty-leds    db 00 e6 01 c2 00 00 db 01 e6 7f d3 ff d3 01 c3 00 00
tty-ascii   0e 20 db 00 e6 80 c2 02 00 79 d3 01 0c 79 fe 7f c2 02 00 76
tty-hello   21 17 00 7e b7 ca 16 00 db 00 e6 80 c2 08 00 7e d3 01 23
            c3 03 00 76 48 45 4c 4c 4f 2c 20 57 4f 52 4c 44 21 0d 0a 00
```

`tty-echo`, in the listing style of [../examples](../examples):

```
0000  db 00      IN 00H           ; SIO status
0002  e6 01      ANI 01H          ; bit 0 = 0 -> a character is waiting
0004  c2 00 00   JNZ 0000H        ; nothing yet, poll again
0007  db 01      IN 01H           ; read it
0009  e6 7f      ANI 7FH          ; strip the 8th bit
000B  d3 01      OUT 01H          ; echo it back
000D  c3 00 00   JMP 0000H        ; forever
```

**`tty-leds` is the one to build the tutorial around.** Eighteen bytes,
toggled in from the front panel in a couple of minutes, and when the
student presses `A` they watch `01000001` light up on real lamps. That
is ASCII made visible, it has nothing to do with BASIC, and with
[D9](#d9--an-led-repeater-strip-on-the-teletype-tab) it happens on one
screen. It is also the natural sibling of the existing
[io-echo.asm](../examples/io-echo.asm) — same shape, different device.

`tty-ascii` prints 95 characters, which is wider than the ASR-33's 72
columns, so it exercises the terminal's line wrap. Useful from day one.

### The order they are offered in

The menu was, for a while, in the order the programs happened to be
written: the four teletype demonstrations, the game, then the older
panel ones in no order at all. That is not an order, and a reader
cannot tell it is not.

The rule is now two deep, and `panel.EXAMPLES` is its only statement.

**First, by which face of the machine the program speaks through** —
front panel, then teletype. This is the part that matters before
anything else, because a teletype program watched on the front panel
looks like a machine that has died: you press RUN and nothing at all
happens on the lamps. Each listing declares its own face in a
`;;; device:` header, so the page reads it from the same file it reads
the bytes from, and a test refuses a listing that does not say.

The menu draws a rule at the seam. A rule and not a heading: a heading
is one more thing the arrow keys have to step over, and ten entries
need a seam rather than titles.

**Then, within each group, by how much you have to know.**

| | Front panel | Teletype |
| --- | --- | --- |
| 1 | `pattern-shift` — runs by itself, moves the lights | `tty-hello` — prints one message, halts |
| 2 | `io-echo` — the same, with your hand on the switches | `tty-ascii` — prints many, in a loop |
| 3 | `adder` — arithmetic, read back out of memory | `tty-echo` — reads one key back |
| 4 | `bouncing-light` — a loop with a direction to remember | `tty-leds` — reads a key and takes it apart |
| 5 | `kill-the-bit` — a game from 1975 | `guess-letter` — a game to play |

`pattern-shift` leads rather than the shorter `io-echo` deliberately:
it needs nothing of the reader but RUN, where `io-echo` does nothing
visible until you know the sense switches exist.

Size is not the rule, though it nearly agrees with it. `kill-the-bit`
is 24 bytes and the hardest thing here to follow; `guess-letter` is
218 and the easiest to enjoy.

*What the reader is told after loading:* the status line names the tab
to watch, which differs by device — the panel ones end at "click RUN",
the teletype ones go on to "then watch the Teletype tab". Without
that, the grouping would only exist in the menu and the first run of
`tty-hello` would look like a failure.

---

## Part 6 — Implementation plan

| Phase | Work | Notes |
| --- | --- | --- |
| 1 ✅ | Port device table ([D6](#d6--ports-become-a-device-table)); bounded memory ([D2](#d2--bounded-memory-no-wrapping)); coalesced dumps ([D5](#d5--dumps-are-coalesced-and-skipped-when-hidden)) | **Done.** 8 new tests, 58 passing. BASIC now boots through an unmodified `Sim8800` given only two `attachDevice()` calls |
| 2 ✅ | RAM selector ([D3](#d3--ram-size-is-an-explicit-visible-act)); windowed dump and map strip ([D4](#d4--the-memory-dump-is-windowed-never-grown)) | **Done.** 8 more tests, 67 passing. Both live in the Debug tab; three new l10n keys across nine locales |
| 3 ✅ | `js/sio.js` ([D7](#d7--an-88-sio-device-on-ports-00h01h)); Teletype tab ([Part 3](#part-3--the-teletype-tab)); LED repeater ([D9](#d9--an-led-repeater-strip-on-the-teletype-tab)); l10n ([D13](#d13--nine-locales-as-usual)); the four example programs | **Done.** 16 more tests, 97 passing. Also `js/teletype.js` for the paper, and a `DB` directive in the listing format so an example can carry data |
| 4 ✅ | ROM loader and `roms/` ([D1](#d1--ship-the-rom-in-roms-with-a-notice)); BASIC tutorial section; the paper-tape story ([D12](#d12--tell-the-paper-tape-story)) | **Done.** 6 more tests, 103 passing, including booting the real ROM end to end. 19 more l10n keys |

**Phase 3 can move ahead of Phase 2.** The teletype earns its place at
256 B on its own ([Part 5](#part-5--example-programs)); only Phase 1 is
a true prerequisite.

Phase 1 is worth doing whatever we decide about BASIC.

### Notes for whoever implements this

- ✅ *Done in Phase 4.* `loadDataAsHexString` cannot load the ROM — a
  4 KB image is a ~12 KB hex string — so `panel.onLoadBasic` fetches it
  and `panel.loadImage` puts it in memory. A file picker beside it does
  the same for an image of your own.
- **Order matters when loading the ROM.** `loadData()` returns early
  unless `isPoweredOn`, and `powerOn()` calls `initMem()`, which fills
  memory with random bytes. So the sequence is power on → load →
  RESET → RUN. (Random contents do not disturb BASIC's probe, which
  writes before it reads.)
- ✅ *Fixed in Phase 1.* EXAMINE and DEPOSIT used to disagree about
  out-of-range addresses: on a 256-byte machine with the switches at
  `0140h`, `examine()` reached `this.mem[320]` directly and got
  `undefined` (data LEDs `00`), while `deposit()` went through the
  modulo and wrote to `mem[64]`. Both now go through `readByte()` /
  `writeByte()`, so EXAMINE above the top shows `FFh`, like the bus.
- ✅ *Fixed in Phase 1.* `examineNext()` did not wrap at 16 bits — from
  `FFFFh` it stepped to `10000h`.
- ✅ *Fixed later.* The map strip used to be rebuilt wholesale with the
  dump on every repaint, which broke its clicks, tooltips and hover.
  It is now data from `getMemMap()`, edited in place — see
  [D21](#d21--the-map-strip-is-edited-not-rebuilt).
- `Sim8800.step()` calls `CPU8080.status()` and `CPU8080.T()` once per
  instruction to watch for `LDAX`. That looks expensive but was
  measured at ~540 million cycles/second, indistinguishable from the
  raw core. **Leave it alone** — the rendering is the cost, not this.
- `tests/fixture.js` already takes `memSize` as a parameter, so the
  memory work is straightforward to test.
- `js/sio.js` must have no DOM dependency
  ([D11](#d11--the-sio-is-a-device-not-a-view)), so it can be tested
  the same way.
- ✅ *Done in Phase 4.* `tests/basic.test.js` drives the real ROM
  through `Sim8800` with a scripted rx queue: it boots at 4 KB and
  8 KB, runs a `FOR` loop, checks the maths functions, breaks out with
  Control-C, and checks that sense switches in the wrong position send
  BASIC to a board that is not there. It skips itself if `roms/` is
  absent.
- ✅ *Done.* Phase 3 changed the tab strip, so `README.md` and the
  images under `screenshots/` were updated: one screenshot per machine
  tab, with the Teletype one showing 4K BASIC running. The phone
  screenshot was dropped; the layout is responsive and it showed
  nothing the others do not.
- ✅ *Fixed later.* `reset()` lights every LED and clears them 400 ms
  later; a program that wrote the data LEDs inside that window used to
  have them wiped. Now `start()` and `step()` end the flash first
  (`endResetFlash()`), and a superseded flash leaves the lamps alone.

---

## Part 7 — Open questions

*None.*

### Closed

- **Which RAM sizes to offer.** Settled at **256 B / 4 KB / 8 KB**; the
  16 KB rung was dropped. Measurements and reasoning in
  [1.6](#16-what-fits-at-each-size) and
  [D3](#d3--ram-size-is-an-explicit-visible-act).
- **Where the RAM selector lives.** The Debug tab, above the memory
  dump, under an *Installed Memory* heading. That is the tab memory is
  already discussed on, and where the effect of the choice — the dump
  and the map strip — is visible. The Sim tab stays the machine.
- **Where the ROM loader lives.** The Debugger tab, which has two
  loading sections: *Load a Program* (Load 4K BASIC and the Example
  Programs menu — what ships with the simulator) and *Load Your Own*
  (a hex string with Load Data, or Load Binary File). Landing there
  has a second benefit: the memory map is a few lines below, so
  clicking Load 4K BASIC shows you BASIC filling fifteen of the sixteen
  pages of a 4 KB machine before anything has run.
- **The clock rate.** Now **2 MHz**, which is what the Altair's 8080
  was clocked at; it had been 1 MHz, so everything ran at half speed.
  Measured consequences: BASIC reaches `OK` in 0.46 s rather than
  0.93 s, and Kill the Bit advances its bit every 0.115 s rather than
  0.231 s. The documentation that called 0.23 s "authentic" was simply
  wrong and has been corrected — `docs/kill-the-bit.md`,
  `examples/kill-the-bit.md` and the header of
  `examples/pattern-shift.asm`. No test depended on absolute timing,
  and the examples that describe their speed do so relatively.
- **Whether to build the 88-2SIO.** Built. Both boards are fitted and
  share one teletype, so either sense-switch setting works instead of
  one of them leaving the machine silent. See
  [D7](#d7--an-88-sio-device-on-ports-00h01h).
- **Paper tint.** Tinted, `#e8e2d0`. Next to the app's other panels it
  reads immediately as a physical device rather than a screen, which is
  the point of the tab, and it costs one hex value.

---

## Appendix — reproducing this

Every claim in [Part 1](#part-1--what-was-verified) came from running
the ROM. So can you. Put `4kbas32.bin` at `roms/4kbas32.bin`, save the
following as `basic-smoke.js` in the repository root, and run
`node basic-smoke.js` — no dependencies, same Node the test suite uses.

```js
// Boots 4K BASIC on this repo's CPU core.
// Run from the repository root:  node basic-smoke.js [ramBytes]
const fs = require('fs');
const CPU8080 = require('./js/8080.js');

const RAM = parseInt(process.argv[2] || '8192', 10);
const mem = new Array(RAM).fill(0);
fs.readFileSync('roms/4kbas32.bin').forEach((b, i) => { mem[i] = b; });

const rx = [];                       // characters typed at the teletype
let tx = '';                         // characters printed on the paper

CPU8080.init(
    (a, v) => { if (a < RAM) mem[a] = v; },          // D2: bounded, no wrap
    (a) => (a < RAM ? mem[a] : 0xff),                // unpopulated bus reads FFh
    null,
    (p, v) => { if (p === 0x01) tx += String.fromCharCode(v & 0x7f); },
    (p) => {
        if (p === 0xff) return 0;                    // sense switches: all down
        if (p === 0x00) return rx.length ? 0x00 : 0x01;   // active-low status
        if (p === 0x01) return rx.length ? rx.shift() : 0;
        return 0;
    });
CPU8080.reset();

// Answer each prompt once BASIC has gone quiet waiting for input.
const script = ['', '', 'Y', '10 FOR I=1 TO 5', '20 PRINT I,I*I', '30 NEXT I',
                'RUN', 'PRINT "IT WORKS"'];
let next = 0, idle = 0, seen = -1;
while (next <= script.length) {
    CPU8080.steps(2000);
    if (tx.length !== seen) { seen = tx.length; idle = 0; continue; }
    if (++idle < 25 || rx.length) continue;
    if (next === script.length) break;
    for (const c of script[next++].toUpperCase() + '\r') rx.push(c.charCodeAt(0));
    idle = 0;
}
console.log(tx.replace(/\r\n?/g, '\n'));
```

```
$ node basic-smoke.js 8192       ->  4823 BYTES FREE ... OK ... 1 1 / 2 4 / 3 9 ...
$ node basic-smoke.js 4096       ->  727 BYTES FREE
```

Things worth trying with it:

- Change the memory callbacks back to `a % RAM` and watch it hang at
  PC = `0DD2h` ([1.5](#15-the-memory-model-has-to-change)).
- Return `0x08` instead of `0` for port `FFh` and watch BASIC move to
  the 2SIO at `10h`/`11h` — the status polarity inverts, so it will
  hang until you invert the stub too
  ([1.3](#13-how-basic-talks-to-the-machine)).
- Drop the `& 0x7f` on output and watch every prompt end in garbage.
- Feed lowercase and collect `?SN ERROR`.

---

## Part 8 — References

### The software we are running

- **[Altair BASIC 3.2 (4K) — annotated disassembly](http://altairbasic.org)**
  — a near-complete, section-by-section annotated disassembly of
  *exactly* the ROM in this design. Start with its "Interpreter
  (Explanation)" page before reading any of the code. The single most
  useful link here. (Use `http://`; the site's TLS certificate does not
  match its hostname.)
- [Altair BASIC (Wikipedia)](https://en.wikipedia.org/wiki/Altair_BASIC)
  — the history: Gates, Allen, the Harvard PDP-10, the paper tape.
- [MITS BASIC reference manual, 1975](https://altairclone.com/downloads/manuals/BASIC%20Manual%2075.pdf)
  and [1977](https://altairclone.com/downloads/manuals/BASIC%20Manual%2077.pdf)
  — the original manuals, scanned.

### The hardware we are simulating

- [Altair 8800 Operator's Manual](https://altairclone.com/downloads/manuals/Altair%208800%20Operator's%20Manual.pdf)
  — also in this repo at
  [altair-8800-operator-manual.pdf](altair-8800-operator-manual.pdf).
- [All the original Altair manuals](https://altairclone.com/altair_manuals.html)
  — scanned PDFs at altairclone.com.
- [88-2SIO serial interface manual](https://altairclone.com/downloads/manuals/Altair%202SIO%20Serial%20I-O.pdf)
  — the 2SIO board (~20 MB). The 88-SIO board that 4K BASIC uses by
  default is not on that page; its behaviour is documented in
  [1.3](#13-how-basic-talks-to-the-machine) above, read straight out
  of the ROM.
- [MITS 88-4MCS 4K static RAM board manual](https://deramp.com/downloads/altair/hardware/MITS%2088-4MCS%204K%20Static%20RAM.pdf)
  — the board the RAM selector is named after
  ([D3](#d3--ram-size-is-an-explicit-visible-act)). The 8 KB rung is
  two of them; the 16 KB board, should it ever be wanted, is the
  88-16MCS.
- [Intel 8080 instruction set](8080-instructions.txt) — opcode
  reference, in this repo.

### Other simulators worth reading

- **[s2js.com/altair](https://s2js.com/altair/)** — Ian Davies' JS
  simulator. Runs this same ROM, on this same CPU core, with a
  simulated ASR-33. The whole implementation is in the page source of
  `sim.html`; its `PortRead`/`PortWrite` functions are the clearest
  short example of SIO and 2SIO handling anywhere.
- [companje/Altair8800](https://github.com/companje/Altair8800) — an
  ESP32/Arduino Altair with a real front panel. Second source for the
  ROM.
- [emuStudio Altair 8800 software guide](https://www.emustudio.net/documentation/user/altair8800/software)
  — confirms the 88-SIO convention: "CPU port 0 for status channel and
  CPU port 1 for data channel". Also covers CP/M and MITS BASIC 4.1.
- [maly/8080js](https://github.com/maly/8080js) — the CPU core in
  [../js/8080.js](../js/8080.js).
- [AltairZ80 / simh](https://schorn.ch/altair.html) — Peter Schorn's
  simulator, the most complete Altair emulation there is.
