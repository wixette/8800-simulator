# The 3D model

The 3D view ([3d-view.md](3d-view.md)) shows a model of the original
1975 Altair 8800's main box at **board/card level**: the case, the
chassis, the power supply, the bus, each card in its slot, and a front
panel that works. This document says how the model is made, what the
page may rely on in it, and where its numbers come from. It is the
model's design record: a change to the model that changes a rule here
changes this document first.

**Files** (all under [`model/`](../model/)):

| Path | What |
|---|---|
| `params/machine.json` | Every dimension and angle, in mm and degrees, each with its source (`src`) and confidence |
| `params/cards.json` | The parts on each card |
| `blender/scripts/` | The headless build: `build_whole_box.py` (which builds the front panel and the card cage through `build_front_panel.py` and `build_card_cage.py`), preview renders, and `lib/` |
| `blender/data/front-panel-title.svg` | The name plate's title, the drawing the 2D panel uses |
| `altair-8800.glb` | The built model, served to the page; always rebuildable |
| `research/` | The research: the report, the source notes, the measured data, the bibliography and the photo credits |
| `LICENSE` | CC BY-SA 4.0, for the model and its data and notes |

## Part 1 — Building it

```
npm run build:model     # Blender, headless; set $BLENDER if it is not in /Applications
```

It writes `model/altair-8800.glb`, and the rebuilt file is committed
with the change that made it. The build needs no network and nothing
outside `model/`. The preview renders (`render_*_previews.py`) write
PNGs to `model/blender/out/`, which git ignores; so does a standalone
build of the front panel or the card cage.

The model is in plain git, not LFS ([3d-view.md, M1](3d-view.md#m1--no-git-lfs-the-model-goes-in-plain-git)).
Budgets: under 300 k triangles and 15 MB, and under 5 MB to stay in
plain git. Today: 83,655 triangles, 3.0 MB.

Checks, in `npm test`: the node contract (Part 2), the budgets, and
that the model's places, ways out and take-apart order agree with
`params/machine.json`.

## Part 2 — What the page relies on

### Conventions

- **Units:** params in millimetres and degrees (the sources' inches
  are kept in each entry's note). Blender in metres with the display
  in mm; glTF and three.js in metres.
- **Machine frame (Blender, Z up):** origin at the centre of the base
  footprint, on its bottom face; **+X runs left to right as the
  operator sees the panel**, +Y away from the operator, +Z up. The
  glTF exporter converts to Y up.
- **Every moving part is its own node**, with its origin on its
  rotation axis or translation path, and its motion in glTF extras.
  The `.glb` holds the rest pose and no animation: the page poses
  every part.
- **Node names** are `<assembly>.<part>[.<index>]`, lower-case ASCII.
  three.js strips the dots on load, so the page looks nodes up by the
  sanitised name, and no two names may collide once the dots are gone.
  **Panel ids are the simulator's own** (`a0`…`a15`, `d0`…`d7`,
  `inte`, `wait`, `s0`…`s15`; `off-on` is `off_on`, `stop-run` is
  `stop_run`), so the 3D and 2D panels name everything alike.
- **Every value carries a source and a confidence:** `doc`,
  `artwork`, `photo`, `est` or `design`. Facts and dimensions from the
  MITS documents are used with a citation; their drawings and board
  artwork are never traced, copied or used as a texture.

### The nodes

The hierarchy follows physical attachment, so a unit that comes out
carries what is fixed to it.

| Node | Parent | Motion |
|---|---|---|
| `case.bottom` (the blue tray and bezel) | root | static |
| `case.top` (the grey lid, louvred) | root | way out |
| `panel.dress` (the lettered dress panel), with `panel.name_plate` on it | root | way out |
| `chassis.frame` (side members, back panel, cross member) | root | way out |
| `panel.assembly` (sub-panel, switch bodies, nuts, LEDs, the display/control board) | `chassis.frame` | static: the harness ties it to the bus |
| `panel.switch.<id>` (a bat), 25 | `panel.assembly` | rotates about X: up, centre, down |
| `panel.lamp.<id>` (an LED dome), 36 | `panel.assembly` | lit or not |
| `chassis.card_rail.0`, `.1`; `bus.board.0`, `.1` (88-EC) | `chassis.frame` | static: wired to the panel and each other |
| `slot.<card>` → `card.<card>`: `cpu`, `mem1k`, `mem4k_0`, `mem4k_1`, `sio`, `sio2` | `bus.board.*` | the slot moves along X, the card lifts out |
| `psu.t1`, `psu.t2`, `psu.t3`, `psu.board`, `psu.terminal_block`, `psu.fan` | `chassis.frame` | way out |
| `harness.panel_bus`, `harness.panel_data` | `chassis.frame` | static |
| `harness.data_plug` (the data cable's plug on the CPU card) | `chassis.frame` | way out (unplugged) |

Every part's extras carry `label_en`, its English name. The page's
names are translated in `js/l10n.js`, keyed by node.

### Taking it apart

Every unit has a **way out**: a few straight moves, in mm, in its
parent's frame (params `paths`), and the units that must be out before
it moves (params `prereqs`). The order is the Assembly Manual's,
reversed. Putting a unit back needs every unit that depends on it back
first, so the lid goes on last.

| Unit | Needs out first |
|---|---|
| `case.top` | — |
| `harness.data_plug` | the lid |
| a card | the lid; the CPU card also the data plug |
| `psu.t2`, `psu.t3`, `psu.terminal_block`, `psu.fan` | the lid |
| `psu.t1` | the lid, T2 (it sits above T1) |
| `psu.board` | the lid, T3 and the fan (both sit above the board) |
| `chassis.frame` | the lid |
| `panel.dress` | the chassis |

**Power:** nothing comes out while the machine is on, and it will not
switch on while anything is out. On the real machine the lid could
come off a running box; the rule keeps the lesson safe, and is named
as a simplification. How this meets the simulator's own ways of
switching the machine on and off is in [3d-view.md, V4](3d-view.md#v4--taking-it-apart).

### The cards follow the Memory menu

The box shows the machine that is running, in the order CPU, memory,
memory, SIO, 2SIO. Slot 0 is the outermost, nearest the right-hand
wall.

| Memory | Board 0, slots 0–3 | Board 1, slot 0 |
|---|---|---|
| 256 B | CPU, 1K memory (88-MCS, 256 bytes fitted), SIO, 2SIO | — |
| 4 KB | CPU, 88-4MCS, SIO, 2SIO | — |
| 8 KB | CPU, 88-4MCS, 88-4MCS, SIO | 2SIO |

The simulator always has an 88-SIO (ports 00H, 01H) and an 88-2SIO
(10H, 11H), so both serial cards are always fitted. Every slot has its
connector and guides, as MITS's expander board came (a named
simplification: owners fitted connectors as they bought cards).

### Operating the panel

- **A0–A15 and OFF/ON latch:** a click flips them. OFF/ON is up for
  OFF and down for ON, as lettered.
- **The eight control switches are momentary, centre-off:** a click on
  the bat's upper half (or the upper label) throws it up, the lower
  half down. The bat swings to its stop in 40 ms and springs back
  after 0.15 s. A switch with nothing lettered below it (SINGLE STEP,
  AUX) moves only up.
- **The bats rest:** latching ones down, OFF/ON up, momentary ones at
  centre. The throw is ±16°.
- **Lamps are lit or dark,** never in between. The real LEDs glowed in
  proportion to how often the line was active (a named simplification).

## Part 3 — How it was made

### The research

- **Documents:** MITS's 1975–76 manuals (the Assembly Manual, the
  Theory of Operation, the schematics) and its 1:1 board artwork, as
  archived by bitsavers.org and deramp.com; the IEEE 696 standard;
  museum catalogue records (Smithsonian, Computer History Museum). The
  MITS documents are most likely still in copyright, so only facts and
  dimensions were taken from them, with citations. Nothing from them
  is in this repository.
- **What they settle:** the box's size (six museum records agree), the
  dress panel's size (a loose original at the Smithsonian), the
  switch and lamp grid (the 1:1 artwork and two independent checks
  agree within about 1 mm), the card outline (MITS drawing 880-110,
  IEEE 696), the slot pitch (0.75 in), the part positions on the CPU
  and 1K memory cards, and the order the box goes together in.
- **What they don't:** no drawing or measurement of the case, chassis,
  back panel or sub-panel exists in public; the case was a stock
  enclosure, not a MITS design. Those, the power supply and the
  transformers were **scaled from photos**, using the 10 in cards and
  the 0.75 in slot pitch as rulers, and are marked `photo` (about
  ±0.15–0.25 in).
- **The photos** are 29 freely licensed reference images (CC0, public
  domain, CC BY, CC BY-SA; nothing NC or ND), and a photo set of an
  unmodified early machine (SN 220081K) used as reference only. The
  photos are not in this repository; each is credited, with its
  licence and source, in [model/research/photo-credits.md](../model/research/photo-credits.md).
  No photo is used as a texture.
- **Which machine:** the original 1975 8800 (charcoal dress panel,
  short round switch bats, 4-slot expander boards, the hand-wired
  harness, three transformers on the back panel). Museum machines are
  often upgraded, so every photo was checked against the version
  notes before it was used. The fan (88-FAN) was an option; the model
  has it.

Start with [model/research/REPORT.md](../model/research/REPORT.md),
then the notes in `model/research/sources/`; every source is in
[bibliography.md](../model/research/sources/bibliography.md), by the
key the params cite.

### Decisions in the model

1. **The dress panel lies on the sub-panel**, and the switch nuts sit
   in its holes, flush with its face. No fastener holds it: the
   Assembly Manual says it falls free once the chassis is out.
2. **The display/control board is held by the switches**, 0.6 in
   behind the sub-panel (the errata: "held by the switch nuts only").
3. **The bat's pivot is 1.8 mm inside the bushing, the throw ±16°**
   (`design`), so a bat clears its own bushing.
4. **The CPU and 1K cards are the revision MITS's 1:1 artwork shows.**
   The Rev 0 boards in the photos carry a few extra parts; they stay in
   `research/data/card_layouts.json`, so a Rev 0 card is a data change.
5. **The card guides taper** (16.75 mm deep at the base, 7.5 mm at the
   top, from an owner's measurements of an original). Straight posts
   cut into the CPU's heat sink.
6. **Parts never touch:** 0.1 mm gaps where the real ones bear on each
   other (the dress panel behind the bezel, the expander boards on the
   tape the manual puts under them).
7. **The case's outline is the case:** 17.0 × 17.5 × 7.0 in. The
   switch bats stand 3 mm proud of the bezel.
8. **The back panel is 16.7 in wide**, not the photo's 16.85 ± 0.2,
   to clear the tray's walls as the chassis slides out.
9. **The expander boards and the front panel don't come off the
   chassis:** they are wired to each other and to the bus.
10. **The lettering's face is not the original:** Blender's sans
    stands in for MITS's condensed face. The sizes and places are
    measured from the photos.
11. **Every material is single-sided:** every part is closed or faces
    the viewer.

### Fidelity checks

- **Photo overlay, front:** an orthographic render of the front panel,
  blended over the two straight-on panel photos and scaled by the
  bezel's width. Lamps, switches, the bezel and the name plate fall
  on the photos within about 1 mm. The lettering was re-measured from
  them.
- **Places inside:** the transformers, the power board, the terminal
  block, the back panel and the fan opening sit at the places the
  photo scaling gives.
- **Clearance:** at rest, along every unit's way out (in 2 mm steps,
  with everything else in), and taken all apart, no two parts meet.
- **Readouts:** from the front, the closed box shows the bezel and the
  panel and nothing of the inside; every LED and bat is first in line
  from the front.

### The fidelity review (2026-10-30)

The eleven weakest dimensions were checked against the reference photos (MFE-SN220081K-PHOTOS #01, #03, #07–#10, #21, #22, #26, #29; the CHM and Smithsonian Commons photos) beside renders of the model in the same views. Five were good enough to release as they were: the cross member's height, the card rails, the box depth, the chassis and back-panel widths, and the card front gap's size. The rest changed (params 0.1.0 → 0.2.0):

| What | Was | Now | Why |
|---|---|---|---|
| Tray walls, lid skirts | 3.1 / 3.0 in | 2.55 / 2.45 in | On the side, the grey lid shows about 1.86 times the blue below it; the rear photo (#03) agrees |
| Bezel | a flat 1.2 mm frame, 0.32 in wide, the panel just behind it | a 0.19 in front face and walls 10 mm deep, straight back to the dress panel; nothing in front of the panel. The doc-sized panel is 1–2 mm smaller than the walls' opening, so a blue flange behind its edge closes the gap, and the panel now comes out forward. The name plate runs the panel's full width | The real frame stands about 1 cm proud of the panel and looks half as wide. A first try kept a retaining lip in front of the panel, which read as a ring that the real machine does not have. The panel, the switches and the D/C board move 8.8 mm back, so the card front gap is now 0.69 in (side view #08: 0.45–0.7) |
| Switch bats | 13 mm, nearly cylindrical (r 1.6 → 1.4 mm) | 11.5 mm, slender at the bushing (r 1.0 mm), swelling into a round head (r 1.75 mm) | Photos; their tips stand 13 mm in front of the dress panel and 3 mm in front of the bezel |
| DB-25 cut-outs | 2, far from the fan opening | 8, 4 rows × 2, beside the fan opening, with a mesh screen behind them | #03, #09 |
| Cords | the data cable, the power cord and the panel harness as straight cylinders butted at each corner | one tube swept along each path, every corner a quadratic Bézier bend (the data cable 12 mm, the power cord 30 mm, the harness 18 mm), the 12-sided ring carried along without twist; about 770 more triangles for the three | The review: the joints looked hard and ugly |
| Name plate | "ALTAIR 8800  COMPUTER" in a substitute font and a lettered "mits" with a slash, all sunk 0.07 mm inside the plate, so none of it showed | the simulator's own drawing of the logo slash (blue) and the title, the same as the simulator's 2D panel (`blender/data/front-panel-title.svg`; no MITS lettering), imported as filled shapes and laid on the plate's face: caps 11 mm high, ALTAIR 2.15 in from the visible panel's left edge | The owner's review |
| Screens | flat black covers | black expanded-metal nets: diamond holes about 6.9 × 3.5 mm, cut by an alpha-masked texture (glTF alphaMode MASK), so the fan's blades and the inside show through. The textures are now PNG in the .glb (the exporter's AUTO); the whole box is 2.96 MB | #09; the review |
| Fan | the opening's round screen only | a square screen and the 88-FAN fan over it, hanging over the filter capacitors; the terminal block moves 8 mm right to clear it | #09; the fan must come out before the power board |
| Power cord | a hole at the corner | its hole 3.8 in right of centre (from the front) and 1.5 in up, a grommet, and a short piece of cord down to the table | #03 |
| Louvres | 40 slits, 4.0–6.4 in up, from 4.4 in behind the front | 50 slits, 4.7–6.6 in up, from 1 in behind the lid's front edge | Museum photos, #01 |
| Card guides | blue | tan, between brown and earthy yellow | #07, #09 (SN 220081K's early guides) |
| Power board | six blue capacitors, two upright ones | six black 3300 µF, the bronze 2200 µF the same size, and the thin orange 500 µF just as long, all lying front to back, side by side with no gap (1.02 in across, 1.02 in apart) | #07, #10; the review |
| Panel lettering | switch numbers 5.3 mm, control words 6.4 / 5.1 mm, group bars 5.6 mm from the pivots; STATUS 1.8 mm under its line | 7.2, 7.4 / 7.4 and 6.4 mm; STATUS 3.0 mm under | The photo's spacings put the words under the switch nuts (hole r 5.0 mm) and STATUS against its line; now they read clear (params `design`) |
| Transformers | grey blocks, the coil hidden; T1 1.1 mm under T2, T3 4 mm from both; taken apart, T1 ended inside T2 | a black lamination stack with the bronze coil running through it and bulging out of both sides: up and down on T1 and T2, left and right on T3; T1 3.0 in tall (was 3.3), clearing T2 by 9 mm; T3 3.6 mm further left, 8 mm clear of both; the terminal block 2 mm narrower; T2's way out now goes up 220 mm and then 120 mm forward, so it parks clear of T1's way up and above the lifted cards | Reference photos (a 1970s transformer; #09). The photo scaling had T1's top (4.4 in) above T2's bottom (4.3 in) |

**A check that missed a collision.** The review found T1 inside T2 in the taken-apart view, though the way-out clearance check passed. Two causes: that check never looked at the taken-apart state as a whole, and its box pre-test read each part's world matrix before it was brought up to date, so a part could be tested at its previous pose. The check now updates each part's matrices first, and adds the taken-apart state. With the fix, it also caught T1 meeting the parked T2 on its way up.

### Data still wanted

The weakest values are the cross member's height (T1 and the power
board sit on it), the card rails' section, the box's depth (17.5 or
18.5 in), the dress panel's grid position (±2.5 mm), and the display/
control board's length. About fifteen measurements of a real 1975
machine would turn every `photo` and `est` value into a measured one;
`model/research/REPORT.md` §6 lists them. Each is one params entry and
a rebuild.

Not modelled: the red power wiring, the grounding braids, the AC cord
inside the box.

## Licences

The model (`model/altair-8800.glb`), its params, the research notes and
data, and this document are **CC BY-SA 4.0**
([model/LICENSE](../model/LICENSE)). The build scripts are Apache-2.0,
like the rest of the simulator's code. The reference photos keep their
own licences and are not in this repository.
