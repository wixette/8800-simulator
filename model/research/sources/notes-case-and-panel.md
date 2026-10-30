# Notes: the case and the front panel

**Area:** the outside of the original Altair 8800 (1975): overall size, case parts and how they fasten, the front panel layout, the switch and lamp parts, the differences between the 8800, 8800a, 8800b and 8800bt, and a check of the simulator's `panel.svg`.
**Read:** 2026-10-20. Downloads went to a scratch folder only. Nothing copyrighted is kept in this repository.
**Numbers:** every value here is also in `../data/dims-case-and-panel.json`, with its source and confidence.

## 1. Summary

- **Overall size: 7 × 17 × 17.5–18.5 in (H × W × D).** Five museum records and one reproduction agree on 7 in high and 16.75–17 in wide. Depth varies from 17.5 to 18.5 in, probably because of rear parts. Weight: 31 lb (CHM) and 11 kg (HNF).
- **The front panel is on a 0.1 in grid.** Lamps and switches are 0.60 in apart inside an octal group, 0.90 in across a group boundary, and the four rows are 1.20 in apart. The control switches are 1.20 in apart. The 1:1 MITS board artwork shows this. A laser-cut hobby panel and a scaled photo agree with it to within 0.05 in (about 1 mm).
- **The dress panel is 16 15/32 × 6 17/32 × 3/32 in** (418 × 166 × 2 mm). This is the Smithsonian's loose original panel.
- **No open drawing of the original case or panel was found.** The best open file is a GPL-3.0 hobby panel (DFF180-PANEL). Its hole layout matches the grid, but it was traced from a scan and laser-cut at 94 % scale.
- **The simulator's `panel.svg` shows the original 8800 panel.** Its horizontal layout is within about 1 % of the real one. Vertically it is about 9 % too tall: its rows are 1.25–1.31 in apart where the real ones are 1.20 in.
- **Model the original 8800 (1975).** The 8800a looks almost the same from the front, but its switch handles and inside differ. The 8800b has a different panel and inside.

## 2. Overall dimensions

All values in inches unless the source gave metric. H × W × D order is assumed where the source gave none.

| Source | Machine | H | W | D | Weight | Note |
|---|---|---|---|---|---|---|
| NMAH-334396 | 8800, 1987.0066.01 | 7 | 17 | 18 | – | Record metadata is CC0 |
| NMAH-1325625 | 8800 (1975), 2007.0032.01 | 7 | 17 | 18.5 | – | Expanded machine with 17 cards |
| CHM-102621982 | 8800 (1975) | 7 | 17 | 17.5 | – | CHM "Revolution" page |
| CHM-102626725 | 8800, s/n 222471K | 7 | 16.75 | 17.75 | 31 lb | Size only in a search snippet; the live page shows just the weight |
| HNF-E-1996-1420 | 8800 (1975) | 18 cm | 43 cm | 45 cm | 11 kg | Record CC BY-NC-SA |
| MV-404316 | 8800 | 180 mm | 440 mm | 480 mm | 75 kg | Search snippet only (page blocked); the weight is surely an error |
| POWERHOUSE-99-48-1 | 8800 (1975) | 177 mm | 457 mm (?) | – | – | "Width 457" is 18 in, so it is probably the depth |
| ADWATER-PRO | Reproduction case | 7 | 17 | 18 | – | Vendor says "same dimensions as the original" |
| ADUINO-GROUP-PANEL | 8800, owner's measurement | ~7 | ~16.75 | – | – | Front including the case lip |
| NMAH-8800A | 8800a | 7 | 16.75 | 17.5 | – | For comparison |
| NMAH-8800B | 8800b | 7 3/32 | 16 15/16 | 18.5 | – | For comparison |

**Best values for the model:** H 7.0 in, W 17.0 in, D about 17.5 in for the box. Allow up to 18.5 in with the rear parts. The depth needs one real measurement (§9).

## 3. Case construction

The case is a stock **Optima** enclosure (MITS part 100505, $130 in the March 1975 list), not a MITS design (MITS-ASM-1975). Optima no longer makes it; later reproductions came from Optima once (Grant Stockly, about 2010) and from new tooling since (CCTECH-2020-REPRO, DERAMP-8800C).

| Part | What it is | How it fastens | Source |
|---|---|---|---|
| Case top | C-shaped lid: the top and both sides. Louvres on the upper sides. Grey on museum machines. | Slides on from the rear. Two #6-32 screws at the rear, into the back panel. | MITS-ASM-1975 printed p.76; COMMONS-SI-UTHMAN; WIKIPEDIA-ALTAIR |
| Case bottom | Base tray with the lower sides and the front frame (bezel). Blue. | The chassis screws to it (below). | MITS-ASM-1975 p.16–17; photos |
| Front bezel | The blue frame around the panel, part of the case bottom. Its lip holds the dress panel in place. | Part of the case bottom. | MITS-ASM-1975 p.16 ("the Dress-Panel should fall free when the chassis is removed") |
| Chassis | Inner aluminium sub-chassis (anodised) with the back panel, side rails, two card rails and a cross member under the transformers. | Slides in from the rear. Four #6-32 screws, two each side, through the case bottom. | MITS-ASM-1975 p.16–17, p.56; grounding note ("remove the anodizing") |
| Sub-panel | Metal plate behind the dress panel. The 25 switches mount through it with their nuts. | Four screws to the front of the chassis. | MITS-ASM-1975 p.16–19 |
| Display/Control board | The front panel PCB, behind the sub-panel. | #6-32 × 1 in screws and four 0.6 in spacers to the sub-panel. The switches are also soldered to it. | MITS-ASM-1975 p.18–19 |
| Dress panel | Painted metal plate with the lettering, 3/32 in thick. It has holes for 25 switch bushings and 36 LEDs. | No fasteners. It slips over the switch bushings and is held between the sub-panel and the bezel lip. | NMAH-FRONTPANEL; MITS-ASM-1975 p.16, p.22 |
| Name plate | "8800 name plate" (part 101759). On museum machines it is a brushed-aluminium strip across the bottom of the panel, with black "ALTAIR 8800 COMPUTER" and the MITS logo. Some machines have none. | Self-adhesive on the Clone; on the original, probably the same (not stated). | MITS-ASM-1975; COMMONS-SI-UTHMAN; CLONE-ASSEMBLY |
| Back panel | Part of the chassis. It carries the three transformers, a 10-terminal block (four #6-32 × 5/8 screws), the power cord with a strain relief, a fan opening and I/O connector openings with a small screen. | Part of the chassis. | MITS-ASM-1975 p.54–55, errata p.ii |
| Feet | Two small rubber feet are in the parts list. One very early machine has feet screwed into PEM nuts in the case bottom. | Screws or adhesive. | MITS-ASM-1975; DERAMP-EARLY |

**Rear panel details.**
- **Power cord:** 3-wire, 6 ft, through a strain relief (MITS-ASM-1975).
- **Fuse:** a 3AG 1 A fuse in clips on the power supply board, not in a rear holder (MITS-ASM-1975).
- **Power switch:** one of the front-panel toggles. It switches 120 V AC directly (RETROTECH-ALLISON).
- **Fan:** the 8800 had no standard fan; the 88-FAN was an option. The errata say later back panels have slots for the fan opening. The early unit at DERAMP-EARLY has an open fan grille. The fan became standard on the 8800a (BYTE-1976-10).
- **I/O openings:** the back-panel drawing seems to show four connector cut-outs in a column (my count on a small sketch; check it on a photo). Very early units have sharp-cornered cut-outs (DERAMP-EARLY). The Clone has eight DB-25 cut-outs; that is not the original.

**Colours and finish.** No paint specification was found. On museum and owner photos, the case top is light-to-mid grey and the case bottom and bezel are mid blue. The dress panel is a dark charcoal grey; a pixel sample on the NMAH photo is about #4C4C4C, but that depends on the lighting. The lettering is white. The name plate is brushed aluminium. Colours from photos are only a guide.

**The Altair Clone cabinet differs** (CLONE-ASSEMBLY, DERAMP-8800C, CCTECH-2020-REPRO). It has no Optima sub-chassis or rails. The cover's lip slides into the bezel and is held by two rear screws. An unpainted front-panel support bracket is held by four screws through the case bottom. The dress panel has six studs and 0.150 in spacers. An original front panel board does not fit the Clone bracket. Use the Clone only as a guide to how parts go together, not for sizes.

## 4. Front panel layout

### 4.1 The grid

The lamps and switches stand on a 0.1 in grid. Three independent sources agree:

| Spacing | MITS board artwork (1:1) | Hobby laser-cut panel | Scaled photo | Clone, owner's measurement |
|---|---|---|---|---|
| Inside an octal group | 0.60 | 0.60 | 0.599 | 5/8 |
| Across a group boundary | 0.90 | 0.90 | 0.92 | 15/16 |
| Row to row | 1.19–1.21 | 1.20 | 1.15–1.21 | 1 1/4 |
| Control switch to control switch | 1.19 | 1.20 | 1.19 | 1 1/4 |
| Power switch to STOP/RUN | – | 2.89 | 2.88 | 3 |

- **MITS-ART-DC:** I measured the row spacing on page 1 of the 1:1 artwork (300 ppi, scale checked in the documents notes). LED pad column to LED pad column is 1.208 in. LED to address-switch pads is 1.193 in. Address switches to control switches is 1.190 in. Each switch has three pads in a line across the board; the centre pad is the switch centre.
- **Scaled photo:** COMMONS-FP-CROMEMCO is a near-frontal 5130 × 2177 px photo. I found the LED centres by colour and the switches by hand. I set the scale from the bezel's outer width (2526 px at half size) = 17.0 in (NMAH), which gives 149 px per inch. It has no ruler, so ±2 %.
- **The Clone figures** are larger by about 4 %. They look like the true grid rounded to sixteenths. Tom Lake (same thread) says the Clone is about 0.25 in narrower than a real Altair, so the Clone is not an exact copy either way.

### 4.2 Positions

The table gives centres in inches, relative to the **A0 lamp**, with x to the right and y up. These are the hobby panel's values rounded to 0.1 in. The photo agrees with every one to within 0.05 in. The JSON file has the unrounded values from both sources.

| Row (y) | Item: x |
|---|---|
| Lamp row 1 (y = +1.2) | INTE −12.3, PROT −11.7, MEMR −11.1, INP −10.5, M1 −9.9, OUT −9.3, HLTA −8.7, STACK −8.1, WO −7.5, INT −6.9; D7 −4.8, D6 −4.2, D5 −3.3, D4 −2.7, D3 −2.1, D2 −1.2, D1 −0.6, D0 0 |
| Lamp row 2 (y = 0) | WAIT −12.3, HLDA −11.7; A15 −10.5, A14 −9.6, A13 −9.0, A12 −8.4, A11 −7.5, A10 −6.9, A9 −6.3, A8 −5.4, A7 −4.8, A6 −4.2, A5 −3.3, A4 −2.7, A3 −2.1, A2 −1.2, A1 −0.6, A0 0 |
| Address switches (y = −1.2) | One under each A lamp, same x (A15 −10.5 … A0 0) |
| Control switches (y = −2.4) | OFF/ON −13.4; STOP/RUN −10.5; SINGLE STEP −9.3; EXAMINE −8.1; DEPOSIT −6.9; RESET/CLR −5.7; PROTECT −4.5; AUX −3.3; AUX −2.1 |

**Where the grid sits on the panel** (photo only, ±0.1 in). The visible panel inside the bezel is about 16.35 × 6.36 in. The A0 lamp is 6.17 in right of and 0.93 in above its centre. Margins from the visible edges: 1.04 in above lamp row 1; 1.74 in below the control row (on a machine with no name plate); 0.98 in left of the power switch; 1.98 in right of D0. The dress panel itself (16.47 × 6.53 in) is a little larger than the visible area. If the lip overlaps evenly, it hides about 0.06–0.09 in on each side.

**Is ±1 mm reachable?** For positions relative to each other, yes: the 1:1 artwork gives them to about ±0.5 mm (see the documents notes on stitching its two halves). For the grid's place on the dress panel, no: only the photo gives it, at about ±2.5 mm. One measurement on a real panel would close that (§9).

### 4.3 Lettering and marks on the dress panel

These come from photos (COMMONS-FP-CROMEMCO, COMMONS-SI-UTHMAN). Each lamp has its name above it. A line runs under the STATUS lamps (MEMR to INT, not INTE or PROT), with "STATUS" below it. Dashed lines run down from the D lamps to the A lamps, and from the A lamps to their switches. Each switch has its number above it. "SENSE SW." and a line run along the upper eight switches. Bars group the switches in octal threes. "Data" and "Address" sit at the right end of the switch row. The control switches carry their names: the upper function above, the lower one below. Very early units have a straight Sense Switch line (DERAMP-EARLY). I have not measured the font or the size of the letters.

## 5. Parts on the panel

| Part | Original (MITS-ASM-1975) | Notes |
|---|---|---|
| Latching toggle, SPDT, ×17 | "Switch ST-1-1-C", part 102366 | 16 address/data switches and the power switch. The power switch has silver contacts on the modern equivalent (FP8800C-MANUAL). |
| Momentary toggle, SPDT, (on)-off-(on), ×8 | "Switch ST-1-3-C", part 102367 | STOP/RUN, SINGLE STEP, EXAMINE, DEPOSIT, RESET/CLR, PROTECT, AUX, AUX. SINGLE STEP and the AUX switches have no label below them. |
| Switch brand | American Switch (FP8800C-MANUAL). APEM later bought American Switch. | Modern equivalents: APEM 5236AB (power), 5236CDB (latching), 5237CDB (momentary). |
| Switch bushing | 1/4-40 thread, 6.35 mm, keyway slot (APEM-5236); panel hole about 6.5 mm | The original's own size is not documented. |
| Switch handle | Short round bat. Chrome on the NMAH machine; coloured tips on the Cromemco machine (possibly later caps). | About 10 mm long (estimate). The 8800a has flat handles 50 % longer (BYTE-1976-10); the 8800b's flat paddles are about 15 mm (CCTECH-2015-SWITCHES). APEM 5236 lever: 10.5 mm. |
| LED, ×36 | "RL-21 LED", part 100702 (Litronix) | Red, diffused. No RL-21 datasheet found. The hobby panel's holes (5.3 mm) and the Altair32 replica suggest a 5 mm (T-1 3/4) body. |
| Spacers | 0.6 in, ×4, D/C board to sub-panel | The LEDs are soldered with the dress panel on, so they sit flush or just through the holes. |
| Panel thickness | Dress panel 3/32 in (NMAH-FRONTPANEL) | The sub-panel thickness is unknown. |

## 6. Versions: what matters for the model

| | 8800 (1975) | 8800a (1976) | 8800b (mid-1976) | 8800bt |
|---|---|---|---|---|
| Dress panel | Charcoal grey, white letters, name plate | Same layout | New multi-colour panel under a mylar sheet; five new switch functions (SLOW, DISPLAY/LOAD/INPUT/OUTPUT ACCUMULATOR) | Turnkey: no address/data switches (two front-panel switches, SMG-8800BT) |
| Switch handles | Short, round | Flat, 50 % longer | Flat paddles, about 15 mm | – |
| Backplane | 4-slot expander boards (88-EC), chained | One 18-slot motherboard | 18-slot motherboard | 18-slot |
| Power supply | +8 V and ±16–18 V, unregulated; weak (see the power notes) | +8 V 8 A, ±15 V 0.5 A | 8 V 18 A, ±18 V 2 A, multi-tap transformer | as 8800b |
| Fan | Optional (88-FAN) | Standard, on the back panel | Standard | Standard |
| Front panel wiring | Hand-wired harness to the bus | Same | Ribbon cables and an interface board | – |
| Case size | 7 × 17 × 17.5–18.5 in | 7 × 16.75 × 17.5 in | 7 3/32 × 16 15/16 × 18.5 in | – |

Sources: BYTE-1976-10 (MITS's own technical pages for the 8800a and 8800b), NMAH-8800A, NMAH-8800B, CCTECH-2015-SWITCHES, SMG-8800BT. **For a 1975 model, use:** short round switch handles, the 4-slot expander boards, no fan (or the optional fan), and the hand-wired harness.

## 7. The simulator's `panel.svg`

`images/panel.svg` (1440 × 644 viewBox, Apache-2.0) **shows the original 8800 panel.** The labels, the two AUX switches, PROTECT/UNPROTECT, "SENSE SW.", "Data/Address" and the name plate all match the 8800 (and the 8800a, which shares the panel). It is not the 8800b panel.

Below, SVG units are converted to inches by taking the SVG's lamp pitch (50.5 units) as 0.60 in. Centres are lamp `x + 10, y + 10` and switch `x + 11, y + 15`, from the 20 × 20 lamp and 20 × 30 switch images.

| Measure | Real | `panel.svg` | Difference |
|---|---|---|---|
| INTE lamp to A0 lamp, x | 12.29 in | 12.40 in | +1 % |
| Power switch to A0 lamp, x | 13.40 in | 13.45 in | 0 % |
| Control switch pitch | 1.20 in | 1.20 in | 0 % |
| Lamp row 1 to lamp row 2 | 1.20 in | 1.31 in | +9 % |
| Lamp row 2 to switch row | 1.20 in | 1.30 in | +8 % |
| Switch row to control row | 1.20 in | 1.25 in | +4 % |
| Visible panel, W × H | 16.35 × 6.36 in | 16.44 × 6.99 in | 0 %, +10 % |
| Whole front with bezel, W × H | 17.0 × 7.0 in | 17.1 × 7.65 in | +1 %, +9 % |
| Aspect ratio of the whole front | 2.41–2.43 | 2.24 | – |

**Other differences.**
- The name plate strip in the SVG is 0.74 in high, close to the photo estimate (0.71 in). The SVG has a 0.32 in grey band below it; on the NMAH machine the plate runs straight into the bezel.
- The SVG leaves out the STATUS bar, the dashed lines, the SENSE SW. line and the octal group bars.
- The SVG's MITS logo is a blue slash. The real logo is black "mits" with a slash.
- The lettering is a plain bold sans-serif, not the original face.
- Its colours (bezel #69A8D8 with an inner #3778AA ring, panel #565656, plate #EAEAEA) are reasonable for an original.

**What follows for 3D.** A 3D panel can keep the SVG's horizontal positions but should use the 1.2 in row grid. Its hit boxes would then differ from the 2D panel's in y. That is fine if the 3D view replaces the 2D one (README §6).

## 8. Design files found, and their licences

| File | What | Scale and source | Licence | Use |
|---|---|---|---|---|
| DFF180-PANEL (`case/inkscape/p3_inkscape-altair.svg`, `case/openscad/altair-case.scad`) | Laser-cut acrylic box with a front panel: 36 LED holes, 25 switch holes | 0.94 scale to fit a sheet; layout traced from Erik Klein's front panel scan | GPL-3.0 (repo); the OpenSCAD box maker is BSD | **The only open panel drawing found.** Its hole grid matches the MITS artwork. Its outline is a box-maker panel, not the dress panel. GPL-3.0 does not fit the simulator's Apache-2.0, so use its numbers as facts, not the file. |
| MITS-ART-DC | 1:1 PCB artwork of the D/C board | 300 ppi scan | © MITS 1975, no licence | Measure only; do not trace (see the documents notes). |
| CLONE cabinet | Mike Douglas design, now made by Chris Davis | Close to the original but not exact | Commercial, no files published | Ask for drawings (§9). |
| Altair-Duino Pro and Experimenter panels | Screen-printed, laser-cut acrylic | About 90 % scale | Commercial, no files published | Not usable. |
| THINGIVERSE-229879 | Small printable Altair model (faceplate about 144 mm wide) | About 1:3, look-alike | Not checked (snippet only) | For the value check, not for sizes. |
| Altair32 replica panel | 2 mm grey aluminium dress panel and carrier panel | Replica panel 19 in long, 6.25 in high | No files | Not usable. |

**No CC-licensed or public-domain drawing of the original panel or case was found.** Searches covered GitHub, Printables/Thingiverse (via search), Front Panel Express and the replica makers' sites.

## 9. Still unknown, and how to close it

| Gap | Why it matters | How to close it |
|---|---|---|
| The grid's position on the dress panel (±0.1 in now) | Panel hole pattern to ±1 mm | Measure one real dress panel. NMAH owns a loose one (1987.0691.18); ask for two edge-to-hole measurements or a square-on photo with a scale. Or ask an owner. |
| Hole sizes in the original dress panel and sub-panel | Fit of the switch bushings and LEDs | Same measurement. |
| Case parts: sheet thickness, bezel lip depth and radius, louvre pattern, top-cover overlap | Exterior at target A | Measure a real case. Or ask Chris Davis / Mike Douglas for Clone cabinet drawings, which are close. Or find a 1970s Optima catalogue page for the stock enclosure. |
| Chassis and back panel: outline, cut-out positions, fan opening | Interior and rear view | Measure a real machine; photos of the rear with a scale. |
| Exact depth of the box (17.5 vs 18 vs 18.5 in) | Overall size | One tape measurement without rear parts. |
| Name plate size and logo | Front detail | Photo with a scale, or a measurement. |
| Switch and LED bodies (ST-1-1-C, ST-1-3-C, RL-21) | Part shapes behind the panel | Find the 1970s American Switch and Litronix catalogue pages; or use the APEM 5236 drawing as a stand-in. |
| Paint colours | Look | A colour reading on a well-kept machine. |
| Gap between the dress panel and the sub-panel | Stack depth | Measure; the manual only shows the two panels together. |

## Sources

Every source cited here, by its key, is in [bibliography.md](bibliography.md).
