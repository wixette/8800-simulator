# The 3D view

This is the design of the v1.8.0 release's main feature: a **3D view**
of the Altair 8800's main box, shown instead of the 2D front panel
when the reader chooses it. In the 3D view you can look at the whole
machine, fade or hide parts of it to see inside, take it apart, and
run it from its own front panel.

The 3D model already exists. It is built by Blender scripts from a
table of dimensions, each with its source. This document covers how
the model comes into this repository, how the view is built around the
simulator's existing machine, and where it sits in the page.

**Status.** Built on branch `v1.8.0`: W1 to W10 are done, and W11,
the release review, is next (Part 6). Where building changed a
decision, the decision says so. Decisions are numbered so that the
code can cite them: **M** for the model and its sources, **V** for the
view, **W** for the work plan. The questions the first draft left open
are settled in [Part 5](#part-5--settled-questions).

---

## Contents

- [Part 1 — What exists](#part-1--what-exists)
- [Part 2 — The model in this repository](#part-2--the-model-in-this-repository)
- [Part 3 — One machine, two views](#part-3--one-machine-two-views)
- [Part 4 — The 3D view's UI](#part-4--the-3d-views-ui)
- [Part 5 — Settled questions](#part-5--settled-questions)
- [Part 6 — Work plan](#part-6--work-plan)

---

## Part 1 — What exists

- **The model:** the original 1975 main box at board/card level. The
  case (blue tray and bezel, grey lid with louvres), the dress panel
  and name plate, the sub-panel with 25 switches and 36 LEDs, the
  display/control board, the chassis and back panel, two 88-EC
  expander boards, up to six cards (CPU, 1K memory, two 88-4MCS, SIO,
  2SIO), three transformers, the power supply board, the fan, the
  terminal block and the wiring harness. About 84 parts, 83,655
  triangles, **3.0 MB** of `.glb`. There are no `.blend` files: the
  scripts build everything from `params/machine.json` and
  `params/cards.json`, and the `.glb` is their output.
- **The node contract:** node names such as `panel.switch.s15`,
  `panel.lamp.a0` and `card.cpu`, using the simulator's own panel ids.
  Every moving part has its motion in glTF extras, and every removable
  unit has its removal path and the units that must be out first.
- **The take-apart rules:** 10 removable units, in the order the
  Assembly Manual allows. Nothing comes out while the machine is on,
  and it won't switch on while anything is out.
- **Prototype code:** three.js, plain JavaScript with JSDoc, no build:
  the same stack as this repository. Its tests check that the model
  matches its dimensions, that no two parts touch at rest or along a
  removal path, and that the model stays within its budgets.

The prototype pages are not carried over (see Part 3). Their logic and
tests are where the production modules start from.

---

## Part 2 — The model in this repository

### M1 — No Git LFS: the model goes in plain git

- **GitHub Pages serves this site straight from `master`** (legacy
  branch deploy). Pages does not resolve LFS objects in that mode: it
  would serve the 130-byte pointer file in place of the `.glb`. LFS
  would mean moving to an Actions deploy (checkout with `lfs: true`,
  upload-pages-artifact), and every clone and fork would then need LFS
  set up as well.
- **There are no Blender files to store.** The sources are text
  (Python scripts, JSON params, one SVG). Only the generated `.glb`
  is binary.
- **It is small:** 3.0 MB, below the 5 MB the model was designed to
  stay under for plain git. Each rebuild that gets committed adds
  about 3 MB to `.git` (16 MB today), so a dozen revisions double it.
  That is acceptable for a model that changes a few times a year.
- `.gitattributes` marks `*.glb binary`.
- *Revisit* if the model passes about 10 MB, gains photo textures, or
  starts being rebuilt every week. Then the answer is Actions-deployed
  Pages with LFS.

### M2 — What is copied, and where it goes

```
model/
  README.md            how to build it (Blender, headless), the node contract, budgets
  params/machine.json  every dimension and angle, with source and confidence
  params/cards.json    the parts on each card
  blender/scripts/     build_front_panel.py, build_card_cage.py, build_whole_box.py,
                       render_previews.py, lib/ (bl, geom, layout, params)
  blender/data/front-panel-title.svg   the name plate's title (also on the 2D panel)
  altair-8800.glb      the built whole box, served to the page
vendor/three/          three.js core, OrbitControls, GLTFLoader (MIT), pinned, as the
                       page loads them
js/view3d/             the 3D view (Part 3)
docs/3d-view.md        this document
docs/3d-model.md       how the model was researched, its sources and the photo credits (M3)
```

- **One model, not three.** The page needs only the whole box. The
  front panel and card cage builders stay as modules that the
  whole-box script imports, but are no longer exported on their own.
  Files lose their milestone numbers (`m2-whole-box.glb` becomes
  `altair-8800.glb`).
- `npm run build:model` runs Blender headless (path from `$BLENDER`).
  It runs by hand, not in CI. The rebuilt `.glb` is committed, and
  `npm test`'s model check (W1) fails if it no longer matches its
  params.
- **Left behind:** the photo-overlay script (it needs the photos, M3),
  the prototype pages, their acceptance harness UI, and the pnpm
  workspace. three-mesh-bvh is left too, unless picking turns out to
  need it.
- **Wording:** anything that only makes sense in the place the model
  came from gets reworded: milestone names, "graduated", owner to-dos.
  A new test fails if the repository contains an absolute local path
  or a relative link that leads outside it.

### M3 — The research: credits and sources kept, photos not

The reference photos (about 11 MB, under mixed licences) stay out. What
comes in:

- **`docs/3d-model.md`**, a short page:
  - how the model was made: dimensions from MITS's 1975–76 manuals
    and board artwork (facts only, never traced or used as a
    texture), photo scaling where no document gives a size, a
    confidence level on every value (`doc`, `artwork`, `photo`,
    `est`, `design`), and a fidelity review of the weakest
    dimensions against the photos;
  - the bibliography, as links;
  - the photo credits table: author, licence and source link for each
    photo the dimensions were scaled from, so that anyone can fetch
    them and check the work.
- **Licences:** the model, its params and the docs about it are
  **CC BY-SA 4.0**. Their scripts are Apache-2.0, as all the code is.
  `model/LICENSE` holds the CC BY-SA 4.0 text plus a note on which
  paths it covers. The README's licence section and About's licence
  table each gain a line for the 3D model (CC BY-SA 4.0) and one for
  three.js (MIT).
- **The research notes come in as text** (Q1): `model/research/`
  holds the source notes, the measured data, the bibliography and the
  photo-credits table, but not the photos. 59 of the params' `src`
  notes cite these notes by file and section, so the citations keep
  leading somewhere.

---

## Part 3 — One machine, two views

### M4 — The 3D panel works the 2D panel's machine, through one seam

The page has one `Sim8800` (`panel.sim`), and `js/panel-front.js`
holds the front panel's rules: which command each switch gives, what
is refused while running or off, the RESET flash, the sounds and the
status line. The prototype had to rebuild that table, because it had
no 2D panel to call. Here, the 3D panel must not duplicate it (P2).

- **A seam in `panel-front.js`**, with no change in behaviour:
  - `panel.operate(id, dir)`: throw switch `id` up or down. This is
    what a click on the 2D panel, a Switch Board Helper button and a
    pick in 3D all call. It returns what came of it (done, refused
    and why, set), and the status line says so as it does now.
  - `panel.onPanelChange(listener)`: tells subscribers when a lamp or
    a switch position changes. The 2D panel's `setLed` and switch
    sprites become one subscriber, and the 3D view another.
- **The 3D view never touches `Sim8800`.** It reads lamps and switch
  positions from the seam and sends throws to it. Its mechanical state
  (which units are out, and how far) is its own module, `js/view3d/
  box.js`, with no three.js in it, tested in Node like the rest.
- **Lamps are drawn once a frame:** while the machine runs, lamp
  changes are collected and applied on the next animation frame, so
  the 3D view never renders faster than the screen.

### M5 — Loaded only when first opened

three.js (about 2.1 MB) and the model (3.0 MB) load the first time the
reader opens the 3D view, through a dynamic `import()`. The 2D page's
first load is unchanged. While they load, the stage shows a progress
bar, and the 3D-only controls are greyed with the reason (P6). The
import map gets `three` and `three/addons/` entries, with `?v=` like
every other module, and `npm run stamp` and its test cover them. The
`.glb` is fetched with `?v=` as well.

Without WebGL, the 3D choice stays in place, greyed, and says why.

### M6 — Code layout

```
js/view3d/
  view3d.js       entry: builds the stage, owns the viewer, wires the seam (lazy-loaded)
  viewer.js       renderer, camera, controls, lighting, render on demand, quality
  framing.js      fit each view into the stage's free area (as the Leibniz simulator's U10)
  panelBind.js    switch bats and lamps <-> panel.operate / onPanelChange; picking
  box.js          removable units, paths, prerequisites, the interlock (no three.js)
  boxBind.js      units' poses from box.js; fade and hide
  parts.js        part names and roles for labels (keys into l10n)
```

Separate modules, as `panel-*.js` are, written in the repository's
own style (JSDoc, `// @ts-check` where the type check covers them).

---

## Part 4 — The 3D view's UI

The Leibniz stepped reckoner simulator is the reference for the 3D
stage's behaviour: its camera, its view menu and its labels. This
page keeps its own look (P10: our dark, period style and our
components), and Leibniz's layout and behaviour are borrowed where a 3D
view needs something this page lacks. New decisions go into
`ui-design.md` as U7 onwards once agreed. They are drafted here as V.

### V1 — Switching views: a "2D | 3D" toggle at the stage's top right

Neither plan as proposed:

- **Plan A (shrink the panel to 85 %)** spends 15 % of the panel's
  size on every screen to make room for one small control. The panel
  is the primary surface (P1), and on a phone its switches are already
  about 13 px apart.
- **Plan B (top bar)** puts a frequent, view-level choice among the
  once-a-session things (P4), on the bar that is already full on
  phones. The 3D view's own camera controls (V3) can't go there
  either: they belong to the stage.

**Proposed: a segmented toggle `[2D | 3D]` in the stage's top-right
corner**, the first item of the stage's view controls. In 3D it is
joined by ⌂ (reset view), zoom − / +, and the Views and Show menus (V3). This is
where the Leibniz simulator keeps its view controls, and where Blender
and other 3D tools keep theirs.

- **In 2D the panel gives up only a band at the top**, as tall as the
  toggle (about 32 px), not a margin all round. On a wide screen,
  where the panel's height is what limits it, that is about 5 % of its
  size. In a portrait window or on a phone, where the panel is limited
  by its width and has spare height, it costs nothing. The panel stays
  centred in what is left.
- It is a two-tab tablist (arrow keys, like the dock's tabs), with
  icons and the words "2D" and "3D", the same in every language. Its
  tooltip says what it does.
- **The choice is remembered** in the browser, and a link can carry
  it as `view=3d` (Q4). A link's view wins over the remembered one.
- **Everything outside the stage stays:** the toolbar, the dock, the
  status line. The Switch Board Helper stays under the stage in both
  views (V5).

### V2 — The camera: as the Leibniz simulator's

- Drag to orbit, right-drag or two fingers to pan, wheel or pinch to
  zoom. Movement is damped and limited (never from underneath, never
  too near or too far), so the machine can't be lost.
- ⌂ Reset view, and a joined zoom − / + pair.
- **Keyboard:** the 3D view takes the focus with Tab. While it has
  it, the arrow keys orbit, Shift with the arrows pans, + and − zoom,
  and Home resets. Only then, so the Teletype keeps its keys
  otherwise (U3's keyboard rule).
- **Framing:** each view fits its parts into the stage's free area
  below the view controls, at 90 % of the side that runs out first.
  It refits when the stage is resized, until the reader moves the
  camera themselves.
- Render on demand. Quality drops to a lighter mode when frames run
  slow (a school Chromebook), and the motion honours
  `prefers-reduced-motion`.

### V3 — The Views and Show menus: where to look from, and what to show

Two menus (P10: items only), side by side. The Views button names the
view on show. The Show button is the chosen preset's icon, orange when
it is anything but Everything, so the bar itself says why the case
looks faint or is gone:

```
[⌂] [−|+] [Front panel ▾] [▣ ▾] [2D|3D]
           Front panel          the default: the panel square on, from just above its top edge
           Whole machine        three-quarter view
           Inside               from above
           Rear
           Taken apart          (V4)
                                 ▣ Everything
                                 ◫ Case faded
                                 ⫼ Case hidden
                                 ▤ Electronics only   case, chassis and power supply hidden:
                                                      the panel, the bus boards, the cards, the harness
                                 ── PARTS ──
                                 ▥ CPU card           one key part glowing, the rest faded round it:
                                 ▥ Memory cards       the parts Meet the Machine (V7) is about
                                 ▥ Serial cards
                                 ▥ The bus
                                 ▥ Power supply
```

*Changed while building:* the first build had one Views menu with
Show as a group under the views. The button named only the view, so a
faded or hidden case had nothing on the bar to explain it, and changing
it took a trip through the views. The views' names are short, and the
Views button keeps the width of the longest one in the reader's
language, so that choosing a view never moves the tools beside it.

- **Fade or hide, in presets.** The view decides where you look from,
  and Show decides what is drawn. They combine: Inside
  with Case faded, or Front panel with Electronics only. Faded parts
  let clicks and hover pass through, so a card can be pointed at
  through a faded lid. A faded case is drawn as outlined glass, at 40 %:
  the pale lid faded over the pale chassis, with no outline, read as no
  lid at all.
- **The key parts are Shows too.** Each makes its parts glow, shown
  even where they would be hidden, and fades every other part further,
  to 16 %, out of their way. Like any Show it stays as the view
  changes. Each one's icon is a small map of the machine from above,
  faint but for its part, so the five sit quieter in the menu than the
  four above them and each shows where its part is. The memory cards are every card the Memory menu can fit;
  those not fitted are not drawn. *Changed while building:* these began
  as a highlight only a Tutorial chip could make, which neither menu
  could show, so the bar said "Front panel" and "Everything" over a
  machine faded round its CPU card; as Shows they are on the menu, and
  the button says which.
- **The machine keeps running** in every view and every Show preset:
  they change only how it is drawn. Watching the lamps through a
  faded case is the point.
- **Per-part control is not in v1.8.0.** The model has about 84 parts,
  and a checklist of them would be a second app in a menu. Two cheaper
  ways cover most of the need: the presets, and taking a unit out
  (V4), which moves it out of the way for good. A later release could
  add "Show only this" on a part's label, if people ask for it. See
  Q3.

### V4 — Taking it apart

- **One unit at a time:** with the machine off, click a unit (the lid,
  a card, a transformer…) to take it out along its path, and click it
  again to put it back. A unit that is blocked doesn't move, and the
  status line says what blocks it ("Take the lid off first"). Putting
  a unit back that others depend on says which must go back first.
- **Taken apart** in the Views menu takes every unit out, in order,
  and flies the camera to fit the parts out on the table, seen from
  the right and behind, where the cards show their chips. It is the
  one view that moves parts: leaving it for another view puts them all
  back, in reverse, quickly (0.12 s a unit, about two seconds in all,
  where taking it apart goes at 0.8 s a unit to be watched). The other views never move a part, so a lid taken
  off by hand stays off while the reader looks from above.
- **Labels:** hovering (or tapping, on a phone) a part shows its name
  and one line on what it does, translated (P5: the panel's own
  lettering stays as it is). Clicking an operable part does it. The
  cursor and the label say what a click will do, or why it will not
  yet ("Take this out first: Chassis"); the hand shows only where a
  click acts. The label is a caption in the stage's bottom-left corner
  (on a phone, the top, over the case top), never beside the pointer.
  *Changed while building:* it followed the pointer, and over the
  front panel it covered the very switches being worked.
- **Every view centres the box itself.** Framing leaves out the power
  cord, which trails out of the back to the table and had pushed the
  box off centre in every view but the front.
- **A bat's halves are as drawn.** A click on the upper half of a
  momentary bat, as it shows on the screen, throws it up, the lower
  half down. From above, all that shows of a bat sticking straight out
  is its top, so the world's up and down could not tell the halves
  apart, and EXAMINE NEXT could not be reached.
- **The Memory menu shows in the cage.** The fitted cards follow the
  memory size (with the CPU, SIO and 2SIO always in: the 1K board for
  256 B, one 88-4MCS in its place for 4 KB, two for 8 KB). Changing
  the size already powers the machine off, and it works at any time:
  with the lid on the cards change out of sight; with it off they are
  seen to (V4a).

**Should the machine run while taken apart? No**, as in the Leibniz
simulator and the model's own rule:

- While it is on, nothing comes out. Clicking a unit says "Switch the
  machine OFF first", and Taken apart in the menu is greyed with the
  same reason (P6).
- While anything is out, OFF/ON refuses ON and says why. The
  switches that need power refuse as they do on a dead machine today.
- What it costs is small: switching off keeps memory (the simulator's
  OFF keeps it, as it does now), so a program survives being taken
  apart. Only its run stops.
- Why it is right here: a card out of its slot, or a chassis out of
  the case, is not a machine that can run. Pretending otherwise would
  teach that the parts don't matter. The reader who wants to *watch*
  it run inside has the Show presets (V3), which leave it running.
- The one licence taken, which the docs name: on the real machine the
  lid could come off a running box. Here it can't, but Case hidden
  shows the same thing.

### V4a — The box and the power, in every way the page switches the machine

The simulator switches the machine on and off in many ways besides
the OFF/ON switch, and the 2D view shows no box at all. The box's
state lives in the page, not in the 3D view (`js/box.js`, one
`panel.box`, loaded with the page), so every one of those ways can
ask it, and it obeys one rule: **the 2D view always shows a whole
machine, and nothing switches on a machine that is taken apart.**

| What happens | With the box taken apart (anything out, or moving) |
|---|---|
| The OFF/ON switch thrown to ON, on the 2D panel, the Switch Board Helper or the 3D panel | **Refused**: the lever stays at OFF, and the status line names a part that is out. This can only happen in the 3D view, where the parts are in sight. |
| A load that switches the machine on: Load menu (hex bytes, a binary file, 4K BASIC, the examples), Assemble, a program link | The box is **put back together at once**, then the machine goes on, and the status line says so ("…was put back together and switched on first", in place of "…was switched on first"). The reader asked for a program; refusing it over a view they may not be looking at would be wrong. |
| Switching to the 2D view | The box is **put back together at once** (it is off, so nothing else changes). The 2D panel never stands for a machine with its cards out. |
| A link with `view=3d`, or a reload | The box starts whole, as the machine starts afresh. |
| The Memory menu (switches the machine off) | Allowed. The cards follow the new size; the rest of the box stays as it is. |
| OFF, by the switch or by the Memory menu | Nothing changes in the box. |
| Any other switch on a machine that is off | As today: it does nothing, and says the machine is off. Address switches still latch. |

Taking anything out needs the machine off (V4); the status line says
"Switch the machine OFF before taking it apart". All of this is in
`tests/box.test.js` and `tests/seam.test.js`, which also hold every
caller of `panel.onPowerOn()` to the two that ask the box.

### V5 — The 3D front panel works as the 2D one

- **The 25 switches can be clicked or tapped.** A latching switch
  flips. A momentary switch goes up for a click on its upper half and
  down for its lower half, then springs back. A direction with nothing
  lettered (SINGLE STEP down, AUX) doesn't move. Same sounds, same
  status messages, same refusals as 2D, because it is the same call
  (M4).
- **The 36 lamps follow the machine,** as the 2D lamps do. INP, OUT,
  STACK, INT and HLDA stay dark, as in 2D.
- **The Switch Board Helper stays under the stage in 3D.** On a phone
  it is the practical way to throw switches whose bats are a few
  pixels apart, in 3D even more than in 2D. P2's exception for it
  holds.
- Picking takes a generous area round each bat, as the 2D panel's hit
  areas do. The Front panel view frames the panel large enough to
  play Kill the Bit on a laptop.

### V6 — Look and words

- **Dark stage**, close to the page's chrome, with studio lighting for
  the metals. The prototype's light grey background goes.
- **New strings in all ten languages:** the toggle, the Views and Show menus,
  Show presets, refusals, the loading and no-WebGL messages, and about
  35 part names with one-line roles. English is the reference, and
  `tests/` checks that every locale has every key.
- The 3D controls follow P10 with this page's existing components:
  `dropdown.js` for the Views and Show menus, the dock tabs' style for the
  toggle, `.icon-button` for ⌂ and zoom.

---

### V7 — The Tutorial: chapters of doc-like steps, and a step can show

Today the Tutorial tab is one page of three hand-written sections
(the first program 1 + 2, Writing in Assembly, Running Microsoft
BASIC). Each is a lead, numbered steps and a note, written into
`index.html`. A part tour needs one thing those sections can't do:
*point at* the part it is talking about. The Leibniz simulator does
that with a step player and a course mode (one step at a time,
controls locked, Next and Back, a mode chip in the top bar). That is
far more machinery than this page has ever had, and it would make the
new chapter look like a different app from the three beside it.

**Proposed: keep the doc, give it chapters, and let a step carry a
Show action.**

- **The tab becomes a short list of chapters**, each in the current
  look (lead, numbered steps, note):
  1. **Meet the machine** (new): what you see, then what's inside.
  2. **Your first program: 1 + 2** (today's Quick Tutorial).
  3. **Writing in Assembly** (as now).
  4. **Running Microsoft BASIC** (as now).

  A contents row at the top of the tab jumps to each chapter, and the
  last one read is remembered, like the dock's tab.
- **A step can end with a Show chip**, such as `[◎ Show]`, which acts
  on the view and never on the machine: switch to 3D, then make the
  same two choices as the Views and Show menus, a view and a Show (the
  step's part, V3), so the menus' buttons say what it did. It doesn't move the machine,
  throw a switch or take anything apart. The reader still does those,
  as every step asks today. So a chip is a way to *look*, like the
  Views menu (P2: two ways to one view operation, not a copy of a
  control), and nothing locks and no mode is entered.
- **A part stays picked out** until the reader chooses another Show,
  or a chip does. The status line names what is shown ("Showing: CPU
  card.").
- **Meet the machine, about ten steps:**
  - The front panel (works in 2D or 3D): the address and data lamps,
    the status lamps, the address/data switches, the control
    switches. In 2D, Show outlines the group on the panel, which is a
    cheap SVG overlay.
  - Then `[Show]` opens the 3D view: the case, the CPU card, the
    memory card, the serial cards, the bus (the expander boards), the
    power supply, the back panel.
  - A last step says how to look around (drag, wheel, keys) and how
    to take it apart (switch OFF, click the lid), and the reader does
    it.

  The parts' names and one-line roles are the same strings as the
  hover labels (V4), so the tour and the labels can never disagree.
- **The chapters stay markup in `index.html`**, each a
  `<section class="tutorial-chapter">`, with the keys they had. A Show
  is a `<button class="show-chip">` whose data says what it shows
  (`data-view="2d" data-outline="status"`, or `data-view="3d"
  data-camera="whole" data-show="cpu"`). `js/panel-tutorial.js` builds the contents
  row and runs the chips. *Changed while building:* the first draft
  rendered the chapters from data in `js/tutorial.js`; keeping them as
  markup changed no words or keys in the three chapters that were
  already there, and the layout checks stayed as they were.
  `tests/tutorial.test.js` checks that every chip names a region, or a
  view and a Show, that exist, that Meet the Machine picks out every
  part Show, and that a Show never works the machine.
- *Rejected:* the Leibniz step player and course mode (heavy for four
  short chapters, and it would make the three existing chapters work
  differently from the new one); a separate 3D tab in the dock (two
  tutorials).

### V8 — The first visit: no guided tour; the Tutorial is the tour

- **No overlay tour or coach marks.** They cover the panel (P1), most
  people skip them, they need their own way out, and they'd be the
  page's first modal UI.
- **The first visit already opens the dock on the Tutorial** (settled
  with U1). Its first chapter is now Meet the machine, so the first
  thing a newcomer reads is a short tour of both views. It goes at
  their own pace, can be left at any step, and the machine stays
  usable throughout.
- **A dot on the toggle's "3D"** until the 3D view is first opened,
  like the Teletype tab's activity dot (D10). It says "there is more
  here" without asking for anything, and once seen it is gone for
  good.

---

## Part 5 — Settled questions

- **Q1 — The research notes: copied.** The text notes and data (about
  400 KB, CC BY-SA 4.0, no photos) go into `model/research/`, reworded
  where they speak of where they came from, so that every params
  citation still leads somewhere. The photo-credits table stays,
  without the photos. `docs/3d-model.md` is the short summary in
  front of them.
- **Q2 — The toggle (V1): build it, then judge it.** Built in W4 as
  designed, and revised after you've tried it.
- **Q3 — The four Show presets are enough** for v1.8.0.
- **Q4 — `view=3d` is a link field.** Optional: absent means 2D. It is
  added to `js/link.js` with its test, and Share's dialog keeps it
  when the link is made from the 3D view. From its release it is kept
  for good (P8).
- **Q5 — The 3D tutorial is in v1.8.0:** a part tour, as the first
  chapter of a restructured Tutorial (V7).
- **Q6 — No guided tour** (V8).

---

## Part 6 — Work plan

All on branch `v1.8.0`, in this order. Each step ends with `npm test`,
`npm run typecheck` and `npm run test:browser` passing, and a commit.

| # | Step | Done when |
|---|---|---|
| W0 | Agree this design; move the agreed V decisions into `ui-design.md` as U7 onwards. Open a v1.8.0 issue for the 3D view, if you want one | You've signed it off |
| W1 | **Import the model (M1–M3).** `model/` (params, scripts, title SVG, the `.glb`), `.gitattributes`, `model/LICENSE`, `docs/3d-model.md`, `npm run build:model`. Tests: the node contract (every panel id, every unit, its path and prerequisites), the budgets, and the reference check (no local paths, no links outside the repository) | Blender rebuilds a `.glb` identical in contract and dimensions; tests pass |
| W2 | **Vendor three.js**, pinned, with a test that the vendored files are the version named | Loads in the browser and in Node |
| W3 | **The seam (M4)** in `panel-front.js`: `operate`, `onPanelChange`; 2D panel and strip moved onto it | No behaviour change: every existing test passes untouched |
| W4 | **The toggle and the empty 3D stage (V1, M5):** lazy load, progress, no-WebGL fallback, remembered choice, `view=3d` in `link.js`, the top band in 2D, the first-visit dot (V8) | Layout checks in all ten languages at 320, 375, 700 and 1366 px; the link test pins `view=3d`. **You try the toggle here, and V1 is revised if needed** |
| W5 | **Viewer and camera (V2):** controls, keyboard, zoom buttons, framing, render on demand, quality | Browser check: each view fits at 90 %, keyboard moves it |
| W6 | **The panel in 3D (V5)** via the seam | Browser check: Kill the Bit played by clicking 3D switches; lamps match 2D after every step |
| W7 | **Views and Show presets (V3)** | Faded parts pass clicks; machine keeps running |
| W8 | **Taking it apart (V4):** `box.js` ported with its tests, picking units, Taken apart, the interlock, labels, the Memory menu in the cage | The take-apart order and the interlock pass in Node; the browser takes it apart and puts it back |
| W9 | **The Tutorial (V7):** `js/tutorial.js`, the three sections moved over with their keys unchanged, the contents row, Show chips, the Meet the machine chapter, the 2D group outline | Same words in all ten languages; every Show resolves; a browser check runs each chip |
| W10 | **Words and docs (V6):** all new strings in ten languages; README section and screenshot, About's licence lines, References (the model's sources) | The l10n key test passes; your read-through |
| W11 | **Release review:** a Chromebook-class performance check, a full manual pass, `npm version 1.8.0`, PR to `master` | Your manual check and OK |

The model's heavy geometry checks (clearance along every removal path,
about 25 s) run as `npm run test:model` after a rebuild, not in every
`npm test`. The fast contract and budget checks are in `npm test`.
