# UI design

This records the principles the simulator's page is laid out by, and
why. It is short on purpose. Where a control ends up, and what it looks
like, is the code's business. This document is about the rules that
decide those things, so that the next change can follow them, or argue
with them in the open.

UI decisions up to D28 are in [ms-basic-4k.md](ms-basic-4k.md#part-2--decisions),
where the code already cites them by number, and they stay there. New UI
decisions are recorded here, in [Part 3](#part-3--decisions), as U1,
U2 and so on. **If a change needs to break a principle, change the
principle here first, with its reason.**

**Status.** The principles hold, and the layout in
[Part 2](#part-2--the-layout) is built:
[U1](#u1--the-front-panel-and-a-dock-replace-the-four-tabs) replaced
the four tabs, [U2](#u2--where-10s-features-go) put #10's features
in their places, and U3 to U5 came of the first review of both, which
also gave P10. U6 came of @cj0ne5's review of #11. The questions U1 left open were settled as listed in
[Part 4](#part-4--open-questions), and remain open to revision once the
layout has been used for a while.

---

## Contents

- [Part 1 — Principles](#part-1--principles)
- [Part 2 — The layout](#part-2--the-layout)
- [Part 3 — Decisions](#part-3--decisions)
- [Part 4 — Open questions](#part-4--open-questions)

---

## Part 1 — Principles

### P1 — The front panel is the one primary surface

It is always on screen. Nothing covers it, and nothing pushes it out of
view: it scales to whatever room the other things leave.

*Why:* on an Altair the front panel *is* the machine's state. Its lamps
are the address bus, the data bus and the status lines, and every
other view here is read against them. The debugger is an X-ray of what
the lamps show; the teletype is what the program on the panel is doing.
A layout that makes you choose between the panel and anything else
turns every question about the program into a trip between tabs. The
page has already paid for that three times with workarounds: the LED
repeater on the Teletype tab ([D9](ms-basic-4k.md#d9--an-led-repeater-strip-on-the-teletype-tab)),
the activity dot on its tab ([D10](ms-basic-4k.md#d10--an-activity-indicator-on-the-teletype-nav-item)),
and the run switches repeated in the Debugger ([D27](ms-basic-4k.md#d27--the-run-switches-repeated-beside-the-memory-dump)).

### P2 — A control has one home

If a control is wanted somewhere else, the layout is wrong: move the
thing, or make both places visible at once. Don't make a second copy.

*Why:* a copy has to restate every rule the original follows, and then
keep agreeing with it. D27 is the example. Its five buttons needed their
own rulings on case and translation ([D17](ms-basic-4k.md#d17--three-surfaces-three-voices)),
on greying out ([D19](ms-basic-4k.md#d19--a-greyed-control-still-answers))
and on sound ([D23](ms-basic-4k.md#d23--the-beep-belongs-to-the-switch)),
each different from the switch it copies. Copies also crowd, and they
teach two ways of doing one thing.

*Not copies:* keyboard shortcuts, which take no room on screen, and the
Switch Board Helper's large buttons. The helper is another way to reach
the same switches - the only practical one on a phone, and the easier
one in a classroom - so it is shown by default, laid out as the panel
lays the switches out, and folds away for whoever does not want it
([U4](#u4--the-switch-strip-is-shown-and-folds-itself)).

### P3 — Tools live in one dock, one at a time

The teletype, the debugger and the tutorial share a single dock under the
panel. You choose which one it shows, how big it is, and whether it is
open at all.

*Why:* this is how tools sit next to a primary surface almost
everywhere they have to: browser developer tools beside the page, an
IDE's terminal and debug console under the editor, Xcode's debug area
opening when the program runs. The dock lets the reader decide how much
room goes to the instrument and how much to the machine, and with the
dock collapsed the page is just the Altair.

### P4 — Occasional actions go in menus and dialogs

Screen space that is always there is for things that change while you
watch: the lamps, the paper, the registers, the dump. Things you do once
a session go in the toolbar: loading a program, installing memory,
sharing a link, choosing a language - as a menu when it is a choice,
and as a dialog when it needs more (P10).

*Why:* this is what went wrong when the panel and the tabs were tried
side by side. The Debugger tab gave *Load a Program*, *Load Your Own*
and *Installed Memory* a heading bar and a row of buttons each, all the
time. Put that beside the panel and the page was crowded before it
showed anything that moves.

### P5 — Each surface keeps its voice

[D17](ms-basic-4k.md#d17--three-surfaces-three-voices) still decides
case and translation, and the unit is still the surface:

| Surface | Case | Translated |
| --- | --- | --- |
| The front panel, and the Switch Board Helper | UPPERCASE | no: silkscreen |
| The teletype | UPPERCASE | yes: the ASR-33 had no lowercase |
| The instrument: toolbar, dock tabs, debugger, tutorial | Title Case | yes |

Density follows the surface too. The panel is a photograph. The dock is
a tool, and reads like one: compact, with no page-style heading bar
over every part of it.

### P6 — Unavailable is greyed and explained, never hidden

[D18](ms-basic-4k.md#d18--nothing-in-the-debugger-is-hidden-it-greys-out-instead)
and [D19](ms-basic-4k.md#d19--a-greyed-control-still-answers) apply
everywhere, including inside menus: an item that cannot be used right
now stays in its menu, greyed, and answers in the status line with the
reason.

This is not a rule against folding things away. A menu that is closed,
or a dock the reader has collapsed, hides nothing in D18's sense: the
reader chose it, and the way back is in plain sight.

### P7 — One status line, always visible

[D15](ms-basic-4k.md#d15--one-status-line-at-the-foot-of-the-machine)'s
single status line stays at the foot of the page. It belongs to the
machine, so like the panel it is never hidden. It used to hide on the
Tutorial tab, because that tab did not show the machine; since U1
nothing hides the machine, so nothing hides the line.

### P8 — A link is a public contract

A program link (`?hex=`, `#hex=`, `zip=` and the fields beside them,
from [#10](https://github.com/wixette/8800-simulator/pull/10)) leaves the
page the moment it is copied. People put links in textbooks and
worksheets that nobody will edit again. Once the format has been
released, fields may be added, but an existing field is never renamed,
dropped or read differently. The whole format is in `js/link.js`, with
nothing of the page in it, and `tests/link.test.js` pins it down.

### P9 — A phone gets the same app, not a different one

Same regions, same order: the panel across the width, the dock below,
the toolbar packed down. Nothing may depend on hover, and nothing needs
a precise drag to reach: the dock's tabs open it, as the drag handle
does.

### P10 — One component for each kind of thing

Each kind of control is one component, used the same way everywhere:

| Component | For | Rule |
| --- | --- | --- |
| Menu | choosing one thing: Load, Memory, the language | items only - no text boxes, no buttons, no menu over a menu; one open at a time; a group heading is a ruled band, not another item; an item that cannot be used is greyed, with why at its right |
| Dialog | anything that needs input or explaining: hex bytes, Share, About | a title in a lighter band across the top, what it is for, the controls, and the actions at the bottom right; Escape or a click outside closes it |
| Icon button | familiar app-level actions: Share, the language, About; folding the switch strip | always with a tooltip and a screen-reader name, both translated |
| Empty state | guidance that matters only until something happens: the teletype's hint | shown inside the empty area, and gone once there is content |

These are Material Design's patterns, not its look: the simulator keeps
its own dark, period style. Every flat control on that dark chrome -
toolbar buttons, dock tabs, the strip's tab - answers the pointer with
the same highlight.

*Why:* the first toolbar put the old Debugger sections into it as they
were - a menu opening over another menu, a text box beside buttons in
a popup. Each piece worked; together they looked like a different app
in each place. A reader who has used one menu, or one dialog, then
knows how all of them behave.

---

## Part 2 — The layout

```
┌ Altair 8800 Simulator  [📄] Load ▾  [▦] Memory: 256 B ▾           [share] [文A] EN ▾ [ⓘ] ┐
│                                                                                       │
│                         FRONT PANEL (the SVG artwork)                                 │
│                                    [˅]                                                │
│         [OFF/ON] [STOP|RUN] [SINGLE STEP] [EXAMINE|NEXT] [DEPOSIT|NEXT] [RESET]        │
│       [A15] [A14 A13 A12] [A11 A10 A09] [A08] │ [A07 A06] [A05 A04 A03] [A02 A01 A00]  │
├─────────────────────────────────── ═══ drag ═══ ──────────────────────────────────────┤
│ Teletype •   Debugger   Tutorial   References                                     ▾   │
│ ┌ 8080 CPU Status Dump ─────────────┐  ┌ Next Instruction ────────────────────────┐   │
│ │ PC = 0004  SP = 0000 … FLAGS S Z… │  │ 0004  3A 81 00  LDA a16                   │   │
│ └───────────────────────────────────┘  └───────────────────────────────────────────┘   │
│ Memory Dump 0000 - 00FF  ◀ ▶ Follow PC                               Zero All Memory  │
│ 0000  3A 80 00 47 3A 81 00 80  32 82 00 C3 00 00 00 00 …                              │
├───────────────────────────────────────────────────────────────────────────────────────┤
│ Stepped one instruction.                                                              │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

Where the pieces of the four tabs went. Share and the instruction
pane's place are U2's; the menus, dialogs and icons U3's; the switch
strip U4's; the tools' layouts U5's; the References tab U6's.

| Before | Now | By |
| --- | --- | --- |
| Simulator tab: the panel | The stage, always shown | P1 |
| Simulator tab: Switch Board Helper | The switch strip under the panel, shown, folding from its own tab (U4) | P2 |
| Teletype tab: paper and helper row | Dock: Teletype | P3 |
| Teletype tab: LED repeater (D9) | Removed: the panel is in view | P2 |
| Teletype nav dot (D10) | The same dot, on the dock's tab | P3 |
| Debugger: *Load a Program*, *Load Your Own* | Toolbar: Load menu, and its Hex Bytes dialog (U3) | P4 |
| Debugger: *Installed Memory* | Toolbar: Memory menu | P4 |
| Debugger: CPU dump, memory dump, map strip | Dock: Debugger | P3 |
| Debugger: instruction pane (D28) | Dock: Debugger, beside the registers (U2) | P3 |
| Debugger: run buttons (D27) | Removed: the panel is in view | P2 |
| Debugger: Copy Link | Toolbar: Share, a dialog (U2, U3) | P4 |
| Tutorial tab | Dock: Tutorial | P3 |
| Tutorial tab: source code and references | Dock: References, opened by About's References button (U6) | P3 |
| Status line (D15) | Foot of the page, never hidden; the credit line moved to About (U3) | P7 |

*Why the dock sits below the panel:* the panel is wide and short
(1440 × 644, 2.24 : 1), so on a landscape screen the room it leaves is
underneath it. Below it, the dock also has the full width, which gives
the teletype its 72 columns at full size. A dock on the right is worth
offering as an option for tall or very wide screens, but not as the
default.

*Why the panel scales to the height left:* the page stops scrolling and
becomes a fixed frame (toolbar, stage, dock, status line). Growing the
dock shrinks the panel, keeping its shape, rather than pushing it off
the top of the screen. The dock is kept to what leaves the panel at
least 160 px, on top of the Switch Board Helper when that is showing.
On a phone the panel takes the height its width gives it and the dock
the rest, with no handle to drag (P9).

---

## Part 3 — Decisions

### U1 — The front panel and a dock replace the four tabs

The layout in [Part 2](#part-2--the-layout). It **supersedes
[D8](ms-basic-4k.md#d8--the-teletype-is-its-own-tab)**, withdraws
[D9](ms-basic-4k.md#d9--an-led-repeater-strip-on-the-teletype-tab) and
[D27](ms-basic-4k.md#d27--the-run-switches-repeated-beside-the-memory-dump),
and carries [D10](ms-basic-4k.md#d10--an-activity-indicator-on-the-teletype-nav-item)
over to the dock.

*Why D8 is being reversed:* D8 compared seven layouts and chose separate
tabs plus the LED repeater. It named a collapsible drawer on the Panel
tab (its option E) the strongest runner-up and kept it "on the table".
The dock is option E, applied to every tool rather than to the teletype
alone. D8's case against E, answered point by point:

- *Fixed or sticky positioning, in a page that does no layout tricks.*
  The frame in Part 2 is one flex column the height of the window: no
  overlays, no z-order, nothing sticky.
- *A collapsed/expanded state to explain and translate.* The state is
  shown by the dock itself (open, or folded to its tabs), and remembered
  per browser like the chosen tab is today. It adds a handful of Title
  Case labels (P5).
- *Mobile.* P9: the dock goes below the panel, as the tab content does
  today.
- *Fidelity: on a real desk you don't look at both at once.* That is
  true while typing BASIC, and the reader can still collapse the dock
  and turn their head. It is not true while debugging, where the lamps
  and the dump are read together every step. That is the case D27 was
  written for.

What D8 got right still stands: the panel and the teletype are the two
surfaces a 1975 owner touched, and the dock lists Teletype first.
[D11](ms-basic-4k.md#d11--the-sio-is-a-device-not-a-view) is why this
is cheap: the SIO never depended on its view, so moving the view
touches no device.

*Rejected on the way here:*

- **The panel and the tabs side by side, on wide screens.** Prototyped,
  and far too crowded. Every Debugger section kept its full-size heading
  bar and buttons (P4), the Switch Board Helper took a third of the
  panel's column (P2), and the teletype needed 11–13 px type to keep
  72 columns in the half-width pane.
- **Repeating controls in the tab that lacks them** (D9, D27). P2.
- D8's floating overlay, pop-out window and stacked single page, for
  the reasons D8 gives.

### U2 — Where #10's features go

[#10](https://github.com/wixette/8800-simulator/pull/10) added three
things to the Debugger. Two of them moved; one went.

- **Copy Link became Share**, in the toolbar. It was a popup at first;
  [U3](#u3--the-top-bar-is-menus-dialogs-and-icons) made it a dialog. Its link format is a public contract from
  the day it is released (P8).
- **The instruction pane**
  ([D28](ms-basic-4k.md#d28--the-instruction-at-pc-decoded-under-the-dump))
  moved beside the registers in the dock's Debugger, headed *Next
  Instruction* (U5 put the two side by side). It says where the CPU is,
  so it belongs with the CPU state rather than under the dump. It is set out a line each - the
  instruction, the operand's value, the undocumented note - to fit
  that column. The operand highlighting in the dump stayed as it was.
- **The repeated run switches** (D27) were taken out, because the panel
  they repeat is in view (P2). They came out on the same branch that
  brought in U1, so they never shipped and nobody lost them.

### U3 — The top bar is menus, dialogs and icons

The first toolbar (U1) carried the old Debugger sections over as
popups. The second follows P10:

- **Left, what you do to the machine; right, what you do with the app.**
  Load (a file being opened) and Memory, each an icon with its name
  (`Memory: 256 B`), on the
  left; Share, the language and About, as icons, on the right, where
  Share sits in most editors. The title before them is the name drawn
  in the lettering of the panel's nameplate
  (`images/8800-simulator-logo-white.svg`), with the translated title
  as its alt text; just above phone width it is drawn smaller. On a
  phone the names go, the size stays, and the title goes too - the
  artwork says ALTAIR 8800 - so it fits one row.
- **Load is a menu.** The ways in that never change come first - *Hex
  Bytes…*, *Binary File…*, *Microsoft 4K BASIC* - so that they keep
  their place as the examples grow; then *Front Panel Examples* and
  *Teletype Examples*, named for where each group's output appears.
  4K BASIC on too small a machine is greyed with *needs 4 KB* beside
  it, and still answers (D19).
- **Hex Bytes is a dialog**, with a box that keeps the line breaks of a
  pasted listing, and says what is wrong inside itself.
- **Share is a dialog**: two choices with a line each - the program at
  RESET, or the machine as it is now, naming its PC - and the link in a
  field, which a blocked clipboard leaves selected rather than the
  address bar being rewritten.
- **About is a dialog**, with the version - read from package.json
  as it opens, the one place the version is kept, since the page has
  no build step to copy it anywhere; a page opened off the disk shows
  none rather than a wrong one - the source code, problems and
  contributors,
  and the licences: Apache 2.0 for the simulator, Microsoft's for the
  4K BASIC tape (roms/NOTICE), BSD for the 8080 core (8080js by Martin
  Maly), Apache 2.0 for the icons. The credit line left the status line
  for it.
- **The icons are Material Icons, inline SVG**, not Google's icon font:
  the font would make the page need the network, fail offline and from
  `file://`, and show the word "share" until it loads.

*The keyboard.* The teletype has it while nothing else needs it. Not
while a menu or a dialog is open - so that Escape there is not KILL
LINE - nor while a text box or a menu item has the focus. A focused
button or tab keeps only the keys it acts on, Enter, Space and Tab, so
that it never acts and types at once; anything else typed still goes
to the machine. And the focus is not left where it would get in the
way: a menu chosen from with the mouse, or a dialog closed with it,
lets go of it; a dialog closed while the Teletype shows hands the
keyboard back to it; opening the Teletype from the keyboard puts the
focus on the paper. The dock's tabs, its fold button and the strip's
tab are reached with Tab, but take no focus from a click.

### U4 — The switch strip is shown, and folds itself

The Switch Board Helper is shown by default on every screen, as it was
before U1 (P2). A small tab on its own top edge folds it away and
brings it back - next to what it controls, rather than a toggle in the
toolbar - and the choice is remembered. The tab is an arrow alone, the
size of the dock's handle, its words in a tooltip: a chevron on an edge
is the familiar sign for folding.

It is laid out as the panel lays the switches out, so that it reads as
part of the machine: the command switches by lever in panel order, a
two-way lever (STOP and RUN, EXAMINE and EXAMINE NEXT) drawn as one
control with two halves; the address switches in the octal groups of
the silkscreen, parted - as the panel parts them, with A8 alone and a
line before A7 - between the high byte and the low, which programs so
often use apart: the sense switches above, a byte to deposit below. Its
rows stay on one line where the window has room,
so it is always two rows high, and it widens to the panel's artwork;
on a phone the address switches go eight to a row. It keeps the panel's
voice (P5).

Since #16 every lever on the panel does something, and the strip has
RESET and CLR as one lever's two halves, and PROTECT and UNPROTECT last
in the row. A label never breaks inside its button; just below 1100 px
the levers close up to stay on one line, and below 940 px they wrap
between levers. On a phone PROTECT stays off the strip: it is for now
and then, the dock needs the height, and the panel's own lever stands
apart enough to tap. The AUX switches, connected to nothing, have no
button at all; the panel's levers answer that on the status line.

### U5 — Each tool laid out as a tool

- **Teletype:** the keys a PC keyboard lacks are the paper's toolbar,
  above it as a console's is, with CLEAR PAPER apart at the right. The
  hint is an empty state (P10): centred in the paper until anything
  prints, back after CLEAR PAPER. Nothing but the status line sits at
  the dock's foot.
- **Debugger:** the CPU across the top - the registers and the next
  instruction, side by side and the same height, stacked in a narrow
  dock - and memory under them, the whole width, with its toolbar on
  one line and Zero All Memory kept apart at the far right. The flags
  are shown by letter, S Z AC P CY, each lit when set.
- **Editing a byte (#14):** typed over in place, as in a hex editor,
  rather than in an edit box: click a byte, and two hex digits write
  it whole and pick the next, the rhythm of DEPOSIT NEXT. The first
  digit is held, shown as `5_`, until the second arrives; the arrows
  move the pick, turning the page at its edges; Backspace drops a held
  digit and Esc the pick. Only a stopped machine is edited, a
  protected board refuses, and the data lamps follow an edit of the
  byte they show. The keys go to a hidden input beside the dump, which
  also raises a phone's keyboard, as the Teletype's does.

### U6 — The references are a tab of their own

Suggested by @cj0ne5 in their review of #11. The source code and the
reading list had sat at the foot of the Tutorial since before U1, so
About's *Further Reading* could only open the Tutorial and scroll to
its bottom.

- **A fourth tab, References**, after the Tutorial: the Tutorial is a
  lesson, read in order; the references are looked up. The tab holds
  *Source Code* and *Further Reading*, the list as it was.
- **About's button is named for where it goes**, *References*, and
  opens the tab at its top. The tabs share one scrolling body, so the
  scroll is reset rather than left where the last tab was read to.
- **On a phone** four tabs and the fold button are a squeeze. The tabs
  close up, and in the languages whose names are longer still the row
  scrolls under the fold button, which stays pinned at the right; the
  chosen tab is scrolled into view.

---

## Part 4 — Open questions

### Settled with U1

- **Which tool does a load open?** The Debugger, for every load,
  whichever of the ways in: the four loaders and a program link.
  [D14](ms-basic-4k.md#d14--loading-stops-short-of-running) wants the
  memory map in view as a program arrives, before anything has run over
  it. What a program prints afterwards never switches the dock by
  itself; the Teletype tab's dot (D10) and the status line say so. A
  view that changes on its own while you are reading it is worse than
  one that asks to be looked at.
- **Keyboard shortcuts.** None, for now. The panel is always in view,
  so a switch is one click away. F5 is the browser's reload, a Mac
  needs Fn for the function keys, letters belong to the teletype, and
  so does Escape, which is KILL LINE there.
- **Big switches or bigger hit areas.** Both, because hit areas alone
  cannot be enough on a phone: at 390 px wide the address switches end
  up about 13 px apart, well under a thumb. Each switch on the panel
  takes a press anywhere near its lever, as far as its neighbours
  allow; and the Switch Board Helper is under the panel. U1 showed it
  only on touch screens, from a toolbar toggle; [U4](#u4--the-switch-strip-is-shown-and-folds-itself) shows it
  everywhere and folds it from its own tab.
- **The Tutorial in a short dock.** No special case. The dock can be
  resized and remembers its size, and about eight steps fit at the
  default height: enough to follow one at a time.
- **Its name.** Tutorial, as before, not the mockup's Guide: it keeps
  its translations in nine locales and the name the README uses.
- **The first visit.** The dock opens on the Tutorial, which says what
  to do with the machine above it. After that the page remembers the
  reader's choice. A saved tab from before U1 that no longer exists
  (the front panel's) opens the Tutorial too.
- **Text that names tabs.** Reworded, in all nine locales: messages now
  name the front panel, the Load and Memory menus and the Teletype
  rather than tabs to go to. So were `README.md`, `examples/README.md`
  and `examples/kill-the-bit.md`.

### Still open

- **A dock on the right**, for tall or very wide screens. Left out of
  U1 as one more layout to test for a minority of screens.
- **Keyboard shortcuts**, if people ask for them, avoiding F5, letters
  and Escape.
- **Marking the Tutorial step you are on**, so that coming back to it
  after toggling switches finds your place.
