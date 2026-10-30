# Can we build an assemble-able, operable 3D Altair 8800 at board/card level?

**Feasibility report** · research only, no modelling or code · 2026-10-20
Supporting material is in this folder: [sources/](sources/), [data/](data/), and the credits of the reference photos, [photo-credits.md](photo-credits.md).

> Kept as written before the modelling began. Where the modelling settled or changed something, [docs/3d-model.md](../../docs/3d-model.md) says so. The reference photos are not kept in this repository; each can be fetched from the source its credit links to.

---

## 1. Bottom line

**Yes. Go, with conditions.** The main risk in the research task was that no detailed internal drawings or measurements might exist in public. That turned out to be half true:

- **The boards are better documented than expected.** MITS's own 1:1 PCB artwork survives for the CPU, front panel and 1K memory boards. The card outline has a dimensioned MITS drawing and matches the IEEE 696 standard. The expander board's foil drawing in the Assembly Manual is to scale, which gives the slot pitch (0.75 in).
- **The sheet metal is not documented at all.** No drawing or measurement of the case, chassis, back panel or sub-panel exists in public. The case was a stock Optima enclosure, not a MITS design. Museum records give only the overall size.

| Target | What it means | Confidence now | After one measuring session (§6) |
|---|---|---|---|
| **A. Exterior and working panel** | Case and panel at correct proportions; every switch and lamp operable; the inside as labelled blocks | **High (≈ 85 %)**. The box size agrees across six sources. The lamp and switch grid is known to about ±1 mm relative to itself. | Very high |
| **B. Board/card level** (the target) | A, plus every card, board and major module at its real outline, position and mounting; take apart and reassemble | **Medium-high (≈ 70 %)**. Cards, slots and the front panel board are solid. The power supply, transformers, chassis outline, card guides and connector bodies rest on photo estimates (±10–15 %). | High |
| C. Component level | Out of scope | — | — |

**Is it worth building? Yes** (§5). No open 3D model of the Altair at board level exists, and no closed one either. Every 3D Altair found is an exterior shell. The closest is a three.js panel simulator from July 2026 with no interior and no licence.

**My recommendation:** start the modelling plan now.
- **Build first** the parts the sources pin down: the cards, the expander boards and slots, the front panel with its board, and the box at its museum size.
- **Scale the sheet metal and the power supply from photos** for now. That can be done in the modelling stage, from the CC0 top view and Martin Eberhard's photo set of an unmodified 1975 machine.
- **Tag every value** `doc`, `artwork`, `drawing`, `photo` or `est`, so one measuring session can upgrade it as a data change.

### Against the go criteria set for the research

| Criterion | Met? |
|---|---|
| Every inventory part has a size from a document, a layout file or a scaled photo | **Mostly.** 25 of 39 inventory rows have a documented, artwork, drawing or photo size. The other 14 are estimates:<br>• standard parts whose sizes any datasheet gives: 7805, capacitors, bridge rectifier, DB-25, fan;<br>• hidden or minor parts: sub-panel, cross member, terminal block, feet, cord, wiring;<br>• two in the card cage: the edge connector bodies, and the card guides (a reproduction STL). Their sizes are not documented, but the slot pitch, card outline and guide hole spacing that place them are. |
| No part in the front panel or card cage rests on a guess | **No, two exceptions:** the card-guide and connector bodies (above), and the length of the front panel board (≈ 15.9 in; the artwork's two halves still need stitching, which I can do). |
| Panel switch and lamp positions to about ±1 mm | **Relative to each other, yes:** the 1:1 artwork, a laser-cut panel and a scaled photo agree within ≈ 1 mm. **On the dress panel, no:** the grid's place is known only to about ±2.5 mm, from one photo. |
| Nothing in the licences blocks a publishable model | **Yes**, if the model is built from measured values and not traced from MITS artwork (§4). |

So target A meets the criteria today. Target B meets them once the photo scaling in §6 is done, and fully after one measuring session.

## 2. What is known, subsystem by subsystem

| Subsystem | What we have | Basis | Confidence | Main gap |
|---|---|---|---|---|
| **Box** | 7 × 17 × 17.5–18.5 in (H × W × D); 31 lb. Optima case: grey C-shaped top on 2 rear screws, blue bottom with bezel; chassis slides in from the rear on 4 screws | 6 museum records; Assembly Manual | High (H, W); medium (D) | Exact depth; sheet thickness, louvres, bezel lip |
| **Dress panel** | 16 15/32 × 6 17/32 × 3/32 in, a loose original at the Smithsonian (CC0 record) | Museum measurement | High | Where the hole grid sits on it (±2.5 mm) |
| **Switches and lamps** | 0.1 in grid: 0.60 in inside an octal group, 0.90 in across groups, 1.20 in between rows; every centre tabulated. 17 latching ST-1-1-C, 8 momentary ST-1-3-C, 36 RL-21 LEDs | 1:1 artwork + 2 independent checks | High | Switch bat and LED body sizes (modern equivalents fit) |
| **Front panel board** | One Display/Control board, 6.46 in high, behind the sub-panel; 62 wires to the bus and a data cable to the CPU | 1:1 artwork; manual | High (height); low (length ≈ 15.9 in) | Stitch the artwork halves |
| **Cards** | 10.0 × 5.0 in plus a 6.375 × 0.3 in tab, 1.5 in from the front end; stand front to back, components facing right; 7805 heat sink on each | MITS drawing 880-110, IEEE 696, artwork | High | Part positions on the 4MCS, SIO, 2SIO (photos only) |
| **Backplane** | 88-EC: 11.08 × 3.41 in, 4 slots at 0.75 in; up to 4 boards (16 slots) on two card rails about 6.8 in apart; 2 guides per slot | Assembly Manual drawing to scale, IEEE 696, BYTE ad | Medium-high | Connector body, guide size, card-cage height |
| **Power supply** | 3 transformers on the back panel (ratings known); PSU board on the cross member on 0.375 in spacers; six 3300 µF capacitors; terminal block; fan optional | Manual, schematics | High (what and where); low (sizes) | PSU board outline; transformer sizes (photo estimates ±10–15 %) |
| **Chassis** | Anodised aluminium side members, back panel, cross member, two card rails; assembly order and every fastener | Assembly Manual | High (what and how); low (size) | Outline, back-panel cut-outs, rail positions |
| **Assembly order** | 21 steps from bare case to closed box, with every screw size | Assembly Manual | High | — |

The best value for each dimension is in [data/machine_spec.json](data/machine_spec.json) (inches and millimetres, with source, basis and confidence). Every raw value, including every disagreement, is in the three `data/dims-*.json` files. The parts are in [data/component_inventory.csv](data/component_inventory.csv): 39 part types, with node names, what each mounts on, how it fastens, how it comes out, and how it moves.

## 3. Findings that change the task

- **The fan was not standard.** In 1975 it was the extra-cost 88-FAN; early back panels have a screened round hole. The model should make it optional.
- **The front panel is wired by hand.** The original has no ribbon cable: 62 loose wires run from the panel board to the first expander board, and an 8-wire cable plugs onto the CPU. When the sub-panel is unscrewed, it stays tethered to the bus. The take-apart sequence has to show that.
- **The backplane is several small boards.** The original has up to four 4-slot expander boards wired together, not one motherboard. The 18-slot motherboard and the fan came with the 8800a, so the version matters.
- **The simulator's `panel.svg` is the original 8800 panel,** but it is about 9 % too tall: its rows are 1.25–1.31 in apart, against 1.20 in. A 3D panel should use the real grid. Its click targets will then differ from the 2D panel's in height, which is fine if the 3D view replaces the 2D one while shown.
- **The interior layout is settled** by the CC0 top view (`Altair_8800_chasis.jpg`, see [photo-credits.md](photo-credits.md)) and Eberhard's photos:
  - the panel board across the front;
  - the card cage at the right, CPU in the outermost slot;
  - the transformers at the right rear on the back panel;
  - the PSU board flat on the cross member along the rear;
  - the terminal block left of the transformers.

## 4. Licences

- **MITS documents** carry "© MITS, Inc. 1975" (1976 for the 4MCS) and are most likely in copyright until 2070–71. MITS passed to Pertec and on to defunct owners, and nobody is known to enforce the copyright. Archives host the documents with no licence. **Dimensions and facts may be used with a citation. The drawings and the PCB artwork must not be copied, traced or vectorised**, not even as a texture. The model must be built from measured numbers re-entered by hand. The research did this throughout, and nothing from MITS is in this folder.
- **Photos:** the 29 reference images are CC0, public domain, CC BY or CC BY-SA, with nothing NC or ND. Each is catalogued in [data/photo_catalog.json](data/photo_catalog.json) and credited in [photo-credits.md](photo-credits.md). As modelling references they create no obligation. As textures, prefer the CC0, public domain and CC BY files, since CC BY-SA would carry share-alike into the texture.
- **Panel lettering:** the simplest clean source is the simulator's own `panel.svg` (Apache-2.0). Its text and logo are already redrawn. It would need re-gridding to the 1.2 in rows and the STATUS bar, dashed lines and group bars added.
- **Open design files** are scarce. The only open panel drawing (GitHub dff180/altair8800) is GPL-3.0, so use its numbers, not the file. The only open KiCad boards are for the 8800b (CERN-OHL-S-2.0); they are out of scope but confirm the card outline. The reproduction boards by Kaufman, Stockly and Deltec are not published.

## 5. Value check: does an equivalent exist? (2026-10-20)

**No.** Sixteen sources were checked: Sketchfab, TurboSquid, Free3D, Printables, Thingiverse, GrabCAD, GitHub, YouTube and museum sites. Every 3D Altair found is an exterior shell. The full table is in [sources/notes-value-check-and-photos.md](sources/notes-value-check-and-photos.md).

| Item | What it is | Verdict |
|---|---|---|
| **Oliver0804/altair-8800-sim** (GitHub, July 2026) | three.js web simulator with a 3D panel: 25 operable switches and 36 lamps, driven by an 8080 emulator. The case is one box with no interior. | **Closest prior art**, at target A without the inside. **No licence**, so not reusable. Its panel layout in inches can be cross-checked as facts. |
| Sketchfab, silverthegamer (2021) | Exterior with a disk drive, back not modelled, "not perfectly faithful" | The only openly licensed 3D Altair (CC BY 4.0). Comparison only. |
| Other Sketchfab, TurboSquid and Free3D models | Exterior shells | Editorial-only, paid or unlicensed |
| Printables and Thingiverse | Small cases for Arduino or Raspberry Pi replicas | Not to scale, no interior |

A board-level model that can be taken apart would be new. That is what the 2D simulator cannot show: that the computer is a bus with cards on it.

## 6. Next steps

### What the modelling stage can do without help

1. **Stitch the two halves of the front panel board artwork** and measure its long side and every switch and LED centre on it. This gives positions to about ±0.5 mm, as facts and not a tracing.
2. **Scale the chassis, back panel, PSU board and transformers** from the CC0 top view and from Martin Eberhard's photo set (on deramp.com, as reference only), using the 10 in cards and the 0.75 in slot pitch as rulers. Record each value as `photo`.
3. **Follow up the 8800c (Altair Clone) case STEP model** on the altairclone.com forum. It is close to the original, not exact; use it as a cross-check only.
4. **Write the modelling plan**, with the node contract from the inventory, the take-apart order from the Assembly Manual, and acceptance checks.

### Data still wanted (measurements no public source gives)

1. **One measuring session on a real 1975 Altair 8800.** This is the highest-value step. A collector, a museum, Mike Douglas (deramp.com, owner of early unit SN 220081K) or a local vintage computer group could help. About 15 measurements close every `est` value:
   - the box depth without rear parts;
   - the A0 lamp from two dress-panel edges;
   - the sub-panel outline and thickness;
   - the card-rail positions;
   - the edge connector and card-guide bodies;
   - the card-cage height;
   - the PSU board and the three transformers;
   - the chassis outline and the back-panel cut-outs.
2. **Ask the Smithsonian (NMAH)** for two edge-to-hole measurements on their loose dress panel (1987.0691.18), or a square-on photo with a scale. That alone fixes the panel grid to ±1 mm.
3. **Optionally, ask Chris Davis or Mike Douglas for the Clone cabinet drawings.** They are close to the original, not exact.
4. **The model's licence.** Since decided: the model is CC BY-SA 4.0 inside the Apache-2.0 simulator ([model/LICENSE](../LICENSE)).

## 7. Risks and caveats

- **Which machine?** Model the 1975 8800. Museum machines are often upgraded: 8800a parts, third-party cards, later fans. Check every reference photo against the version notes ([sources/notes-case-and-panel.md](sources/notes-case-and-panel.md) §6).
- **The CC0 top view is a new upload** (2026-10-07), from a 2002 camera, apparently by Paul Terrell. Its provenance is plausible but recent. Recheck it before using it as anything more than a reference.
- **Scaled values carry scaling errors.** The expander board was scaled from a manual drawing. Its checks agree (slot pitch 0.748 in, the connector offset matches the card's tab), but it is not a measurement. Photo scaling of cards gave heights 5–8 % short, probably from uneven resizing. Use the artwork for card heights.
- **Limits of this research.**
  - Some museum pages could be read only as search snippets (CHM 16.75 × 17.75 in; Museums Victoria). They are recorded as such.
  - Cults3D and CGTrader could not be searched.
  - No Optima catalogue for the case was found.
  - The Assembly Manual is cited by PDF page in one notes file and by printed page in the others (see the note at the top of [sources/bibliography.md](sources/bibliography.md)).
