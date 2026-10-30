# Notes: the original MITS documents (1975–1976)

**Area:** the MITS manuals, parts lists, schematics and board artwork for the original Altair 8800, read for what they give a board/card-level 3D model.
**Read:** 2026-10-20. Copies were downloaded to a scratch folder for reading only; nothing from them is kept in this repository.

**Page numbers.** For the Assembly Manual, "p.N" is the page of the PDF at deramp.com (102 pages). The manual's own printed page number is given as "printed p.M" where it helps. For the other PDFs, "p.N" is the PDF page.

---

## 1. Summary

- The **Assembly Manual (1975)** is online and complete enough to rebuild the kit step by step. It names every mechanical part and fastener, with sizes in inches. Its drawings are exploded isometric views. **None of them carries a dimension**, so they show what mounts to what, but not where or how big.
- The **Theory of Operation (1975)** has one **dimensioned drawing**: the plug-in card outline (drawing 880-110). It gives the card as 10.0 × 5.0 in, with a 6.375 in edge tab 0.3 in deep.
- **bitsavers.org has the original PCB artwork** ("X1" films: copper, silkscreen and drilling guide) for the **CPU board, the Display/Control (front panel) board and the 1K static memory board**. They were scanned at 300 ppi at **1:1 scale**. I checked the scale on the edge fingers (0.1250 in pitch, as it should be) and on IC pads (0.100 in). So board outlines, tab position, hole positions and the switch and lamp spacing can be measured from them.
- **No document gives the size of the case, the chassis, the sub-panel or the dress panel.** No document gives the position of the card cage in the box, or the slot pitch of the expander board. The case was a **stock "Optima" enclosure** (MITS part 100505). This suggests an Optima catalogue could give its size (a lead for the case area, not checked here).
- **Copyright:** every manual carries "© MITS, Inc., 1975" (1976 for the 4K board). Under US law these are most likely still in copyright until the end of 2070 or 2071. The owner after MITS → Pertec → Triumph-Adler is unclear, and nobody is known to enforce it. Facts and dimensions may be used with a citation; the drawings and artwork may not be copied or traced.

## 2. Which documents exist, and where

| Document | Date | Where (reachable 2026-10-20) | Pages | What it gives a 3D model |
|---|---|---|---|---|
| Altair 8800 Assembly Manual (with errata, parts lists, address chart, checkout) | 1975 | deramp.com (scan, 102 pp) and archive.org (cleaner 600 dpi scan, 99 pp, no address chart or checkout) | 102 | Assembly order, every fastener, parts lists, exploded drawings (no dimensions) |
| Theory of Operation Manual & Schematics | 1975 | deramp.com (26 pp), archive.org (two scans) | 26 | Card outline drawing with dimensions (p.26); bus pin list; power supply ratings (p.9) |
| Altair Schematics (set) | 1975 | deramp.com | 10 | Circuit only (880-101 to 880-110); no mechanical data |
| CPU Board X1 artwork | 1975 | bitsavers.org/pdf/mits/8800 | 5 | 1:1 copper (both sides), silkscreen, drill guide → exact outline and part positions |
| Display/Control Board X1 artwork | 1975 | bitsavers.org/pdf/mits/8800 | 8 | 1:1 copper and silkscreen, but each side is split over two pages |
| 1K Static Memory Board X1 artwork | 1975 | bitsavers.org/pdf/mits/8800 | 5 | 1:1 copper, silkscreen, drill guide (this is the 88-MCS / 88-1MCS board) |
| Altair 8800 Bus Definition | 1975 | bitsavers.org | 1 | Pin list only |
| Operator's Manual | 1975 | in the simulator's `docs/`; also deramp, altairclone, archive.org | 98 | Panel functions; no dimensions |
| 88-4MCS 4K Static RAM manual, Rev 0 | 1976 | deramp.com; archive.org | 45 | Parts list (heat sink, 2 card guides, 1 connector); tab length "slightly less than 6 3/8 in" (p.24); card orientation |
| 88-SIO serial board manual (Rev 0 & 1) | 1975 | deramp.com | 58 | Parts list; card orientation; back-panel openings (p.51) |
| 88-2SIO user's manual | c.1976–77 | deramp.com; bitsavers (197703 edition) | 47 | Parts list; card orientation; 25-pin connectors on the back panel (p.47) |
| Price list, 1 April 1975 | 1975 | bitsavers.org | 2 | Basic unit has 4 slots; 88-EC adds 4; 88-FAN was an extra-cost option |
| "Age of Altair" catalogue | 1975 | bitsavers.org | 24 | No 8800 dimensions (the only size given is for the line printer) |
| Altair 8800b Documentation | 1977 | bitsavers.org | 195 | **Out of scope** (8800b has a different chassis and an 18-slot motherboard) |

Not found: a separate 88-EC (expander) manual. The 88-EC parts list says "Manual (3 pages)", but its content is the "Expander Board" pages of the Assembly Manual. No separate power supply manual exists; the power supply is in the Assembly Manual and the Theory manual. No 88-4MCS or SIO/2SIO artwork is on bitsavers.

## 3. What each document gives (with pages)

### Assembly Manual (MITS-ASM-1975)

| PDF page (printed) | Content | Use for the model |
|---|---|---|
| p.2 | Power supply and case parts lists | Part names, counts, MITS part numbers; "Optima case" |
| p.3 | 88-EC "Mother Board" parts list | Fasteners for the expander board |
| p.4–5 | D/C and CPU board parts lists | Switch and LED part numbers; spacers; regulator heat sinks |
| p.8–9 | Errata | PS board screws changed to 3/4 in; one screen only; fan slots in back panel; 6 cable clamps; D/C board held by the switch nuts only |
| p.10–11 | Grounding modification | Braid straps (1/8 in and 1/4 in) between boards and chassis |
| p.15 | Table of contents; © MITS 1975 | Section list |
| p.31–32 (16–17) | Chassis and sub-panel removal | Exploded view of case bottom, dress panel, sub-panel, chassis, back panel |
| p.33–34 (18–19) | Switch installation | Exploded view: sub-panel, D/C board, spacers, switches |
| p.36–37 (21–22) | LED installation | Two rows of 18 LEDs; dress panel over sub-panel |
| p.39 (24) | 10-pin plug | Cable from D/C board to CPU board |
| p.66–67 (50–51) | Bridge rectifier | Mounted on the foil side of the PS board |
| p.70 (54) | Transformer mounting | Exploded view of the back panel: 3 transformers, fan opening, 8 D-connector cut-outs |
| p.71 (55) | Terminal block | On the back panel, with the AC cord strain relief |
| p.72–73 (56–57) | Chassis assembly | Cross member and two card rails; hole counts on the side rails (13, 21, 9 holes) |
| p.77 (60) | PS board mounting | PS board on 4 metal spacers on the cross member; screen inside back panel |
| p.79 (62) | Power supply wiring diagram | Terminal block layout |
| p.81 (64) | Expander board assembly | Up to 4 edge connectors, 100 pins each |
| p.83 (68) | Board installation | Expander board on the card rails; card guide drawing |
| p.84–85 (66–67) | Expander board wiring | Plan view of D/C board and expander board (not to scale) |
| p.87 (69) | Board installation | Exploded view: expander board on rails, sub-panel with D/C board onto chassis |
| p.88–89 (70–71) | Bus power connections | Wires from expander board and D/C board to the terminal block |
| p.90 (72) | Bus structure | Pin list |
| p.92–93 (74–75) | Interconnections | CPU in first connector; memory in second; 10-pin plug onto CPU wafer connector |
| p.94 (76) | Case top installation | Exploded view: case top, case bottom, back panel |
| p.95 (77) | Name plate | On the dress panel, at the very bottom, under the switches |

### Theory of Operation (MITS-THEORY-1975)

- p.9: power supply. T1 gives +8 V at 8 A to the bus; T2 gives +8 V at 1 A (D/C board) and +16 V at 0.8 A; T3 gives −16 V at 0.3 A. All voltages go to a terminal block. Each card regulates its own +5 V.
- p.10–16: the 100-line bus, 50 lines on each side of a card.
- **p.26 (drawing 880-110, "System Bus Structure"): the only dimensioned mechanical drawing in the MITS set.** It shows the card outline: 10.0 in along the edge connector, 5.0 in high, tab 0.3 in deep and 6.375 in long, with 1.5 in from one end of the card to the tab and 2.125 in from the other end.

### Board artwork (MITS-ART-CPU, MITS-ART-DC, MITS-ART-1K)

These are the original "X1" artwork films (front copper, back copper, silkscreen, drilling guide, component legend). The scans are 1-bit, 300 ppi. I measured them with pixel profiles:

- **Scale check.** On the CPU card, 50 edge fingers span 1838 px for 49 gaps: 37.51 px per finger = 0.1250 in. On the 1K card: 0.1254 in. On the D/C board, IC pads are 29.8 px apart = 0.099 in. So the scans are 1:1 to within about 1%.
- **CPU card:** copper frame 10.03 in long, body about 5.0 in, 5.40 in to the finger tips. The tab starts 2.11 in from one end and ends 1.43 in from the other (the 880-110 drawing says 2.125 and 1.5).
- **1K memory card:** 10.04 in × 4.98 in body, 5.32 in to the finger tips. Tab 6.49 in long including the plating bar, 1.46 in from one end and 2.09 in from the other.
- **Display/Control board:** short side 6.46 in (both halves agree). Each side of the board is split over two pages. I found no overlap between the two halves, so I could not measure the long side. If the halves simply abut, it is about 15.9 in, but that is an estimate.
- **Front-panel spacing on the D/C board.** The switch pads (three pads each) and the LED pads (two pads each) are on the same centres along the board: **0.60 in apart inside an octal group of three, and 0.90 in between groups**. Measured centres were 178–184 px and 268–271 px apart. The switches and LEDs pass through the sub-panel and dress panel, so this is also the front-panel pitch. Stitching the two halves would give every switch and lamp position at about ±0.5 mm. That is the best route to the brief's ±1 mm panel target.
- The drilling guide gives hole sizes: 1/32 in (IC pins, plated-through holes), #57 = 0.043 in (½ W resistors, capacitors, crystal), 1/16 in (2 W resistors, regulator pins, **toggle switch pins**), 5/32 in (regulator screw). The guide is the last page of each X1 PDF.

### Per-board manuals (MITS-4MCS-1976, MITS-SIO-1975, MITS-2SIO-1976)

- Each card kit came with its own **100-pin edge connector and 2 card guides**, plus a 7805 regulator with a heat sink on a #6-32 screw (4MCS p.3; 2SIO p.11; SIO p.3).
- **Card orientation:** "the silk-screened side faces the right side of the unit viewed from the front panel" (4MCS p.24; SIO p.54; 2SIO p.47). So **the cards stand on edge, front to back, parallel to the side walls**. The Assembly Manual agrees: the CPU's wafer connector ends up "towards the back of the unit" (p.92).
- 4MCS p.24: the tab ("stab") must be "slightly less than 6 3/8 in" long.
- SIO p.51: the back panel has **two 1/4 in holes near the bottom**, on the side opposite the transformers, for cables. **Spaces above them take 25-pin connectors.** 2SIO p.47: mount the 25-pin connectors in the spaces on the back panel.

### Price list (MITS-PRICE-1975)

- The basic 8800 has **4 slots**, one taken by the CPU. 88-EC adds 4 slots. 88-EBC is a separate expander cabinet for 16 more slots.
- **88-FAN cooling fan is a separate option** (Apr 1975), so an early box may have no fan. The errata (p.9) says later back panels have slots for the fan opening.
- 88-MCS is "256 words memory", expandable to 1K with 88-MM. This is the 1K static memory board partly filled. The simulator's 256-byte memory is this board.

## 4. Assembly order, as a kit builder did it

This is condensed from MITS-ASM-1975. Board-level soldering (ICs, resistors and so on) is left out.

1. **Build the D/C (front panel) board**: ICs, resistors, capacitors, and the 7805 with its heat sink on a #6-32 nut. Solder 63 three-foot wires: 37 along the top edge, 24 along the right edge, and 2 "AC SW" wires on the left edge (p.20–30).
2. **Take the case apart**: remove 4 #6-32 screws (2 per side) holding the chassis to the case bottom. Slide the chassis back and lift it out; the dress panel falls free. Remove 4 #6-32 screws holding the sub-panel to the chassis (p.31–32).
3. **Mount the switches on the sub-panel first**: 17 latching (SA0–SA15 and S8, which is the power switch) and 8 momentary (S0–S7), with nuts on the front. Then fit the D/C board behind them, so the switch pins pass through it by about 1/8 in, and solder. The first drawing used #6-32 × 1 in screws and 0.6 in spacers; the errata drops these because the switch nuts hold the board (p.33–35, p.9).
4. **Fit the LEDs**: 36 RL-21 LEDs in two rows of 18, through the sub-panel into the board. Hold the dress panel over the sub-panel with rubber bands, align each LED with its dress-panel hole, then solder (p.36–38).
5. **Fit the 10-pin plug** on 8 wires (D0–D7) cut to about 16 in (p.39).
6. **Build the CPU board** (8080 in a 40-pin socket; 7805 and heat sink; 8-pin wafer connector) and the **1K memory board** (p.41–62).
7. **Build the power supply board**: 10 diodes, the bridge rectifier on the foil side on a temporary spacer, 8 electrolytic capacitors, a fuse in clips held by #4-40 screws (p.63–69).
8. **Mount the transformers on the back panel**: T1 with 4 #8-32 × 3/8 in screws (slotted holes; rest it on the cross member to set its height); T2 and T3 with 2 #6-32 × 3/8 in screws each (p.70).
9. **Mount the terminal block** (two rows of 10) on the back panel with 4 #6-32 × 5/8 in screws. Fit the AC cord through its strain relief (p.71).
10. **Chassis**: fit the **cross member** under the transformers (4 #6-32 screws). Fit the **two card rails** across the chassis on 1/4 in spacers, with 4 #6-32 × 3/4 in screws, nuts, lock and flat washers. They go in hole positions counted on the side rails (13, 21 and 9 holes in the drawing) (p.72–73).
11. **Wires with lugs**: transformer primaries, AC cord, D/C power wires, five 8 in, two 12 in and four 24 in wires (p.74).
12. **Wire the PS board**: transformer secondaries, and the leads to the terminal block. Add a 14 in chassis ground (p.75–76).
13. **Mount the PS board on the cross member**, on 4 × 0.375 in metal spacers, with #6-32 screws (3/4 in per the errata). Put two stacked rubber feet under its centre. Screw the bridge rectifier to the cross member with a #6-32 × 1/2 in screw. Fit the screen inside the back panel (#4-40 screws) (p.77, p.8–9).
14. **Terminal block connections**: the AC cord's green ground goes to the chassis side, about the 14th hole from the back, top row (p.78–79).
15. **Expander board**: solder up to 4 edge connectors (100 pins each) on the blank side (p.81).
16. **Wire the D/C board to the expander board** by bus pin number (p.84–85). On the bench, the expander board sits about 4 in behind the D/C board.
17. **Fit the expander board and the D/C/sub-panel assembly to the chassis.** The expander board sits on the two card rails, with tape under it so no land touches a rail. It is held by 2 #4-40 × 5/8 in screws (through the connector ends) and 2 #4-40 × 5/16 in screws, with 4-40 nuts and lock washers. The sub-panel goes back on with its 4 #6-32 screws. Then fit a **card guide at each end of each connector**, in pairs of holes at the board's outside edges, with #6-32 × 3/8 in screws from below (p.83, p.86–87).
18. **Bus power**: four 24 in wires from expander holes 1, 2, 50 and 52 (+8 V, +16 V, GND, −16 V) go to the terminal block, routed round the right side. The D/C wires go round the left side, through cable clamps on the card-rail screws (p.88–89, p.9).
19. **Plug in the cards**: the 8080 goes into its socket. The CPU board goes into the first connector, and the 10-pin plug onto its wafer connector. The memory board goes into the second connector (p.92–93).
20. **Close the case**: chassis into the case bottom (4 screws); case top on (the drawing shows 2 #6-32 screws through the back panel into the case top's rear flange). Stick the name plate on the bottom of the dress panel (p.94–95).
21. **Grounding modification** (errata, p.10–11): braid straps from the D/C board's 7805 screw to the chassis; from the rear card rail to the chassis; along the PS board; from the PS board to the cross member; from the cross member to the chassis; one 3 in strap from each expander board to a card rail.

## 5. Parts that matter for the 3D model

| Part | What the documents say | Source |
|---|---|---|
| Case | "Optima case", MITS P/N 100505. A case bottom with a front lip, a U-shaped case top with louvres on both sides, and a back panel. | ASM p.2, p.31–32, p.94 |
| Dress panel | Front decorative panel; LEDs show through it; name plate at the bottom. Loose; held by the case. | ASM p.31, p.36, p.95 |
| Sub-panel | Metal panel holding the 25 switches; 4 #6-32 screws to the chassis. | ASM p.31–34 |
| Chassis | Two side members, with a row of holes along the top and an angled front edge, joined by the back panel. Anodised. | ASM p.32, p.73, p.78 |
| Back panel | 3 transformers, terminal block, AC cord strain relief, fan opening (slots), 8 D-connector cut-outs (2 × 4, by the drawing), two 1/4 in cable holes, one screen. | ASM p.70–71, p.77, p.9; SIO p.51 |
| Cross member | Under T1; carries the PS board and the bridge rectifier. | ASM p.70, p.73, p.77 |
| Card rails (2) | Run across the chassis from side to side, on 1/4 in spacers; carry the expander boards. | ASM p.73, p.87 |
| Expander board (88-EC, "8800 M/BD") | Up to 4 × 100-pin edge connectors; foil on one side only; card-guide holes at both outside edges. | ASM p.3, p.81–87 |
| Card guides | 2 per card (one at each end of the connector); #6-32 × 3/8 in screws. Tall slotted guide (drawing only). | ASM p.2, p.83; 4MCS p.3 |
| D/C board | 25 toggle switches, 36 LEDs, 7805 with heat sink, wire rows on two edges, cable clamps. | ASM p.4, p.20–40 |
| Toggle switches | 17 × ST-1-1-C (latching SPDT), 8 × ST-1-3-C (momentary, centre-off). Panel-nut mounting. | ASM p.4, p.33 |
| LEDs | 36 × RL-21 | ASM p.4, p.36 |
| CPU, 1K memory, 4MCS, SIO, 2SIO cards | 10 × 5 in card body, 0.3 in tab; each with a 7805 and heat sink; CPU has an 8-pin wafer connector; SIO a 10-pin wafer; 2SIO up to two. | THEORY p.26; board manuals |
| PS board | On 4 × 0.375 in spacers above the cross member; 6 × 3300 µF and other electrolytics, bridge rectifier VJ048 (10 A), fuse 3AG 1 A. | ASM p.2, p.63–69, p.77 |
| Transformers | T1 = P-6138 (8 A), T2 = 110 V type, T3 = 133-P-5 (part names from the list; the pairing of names to T1–T3 is inferred from the prices). | ASM p.2; THEORY p.9 |
| Terminal block | "10-141", two rows of 10 terminals. | ASM p.2, p.71 |
| Fan | Optional 88-FAN; behind the fan opening in the back panel. | PRICE; ASM p.9, p.70 |
| Front-panel wiring | 63 wires, 3 ft each before cutting, from the D/C board to the expander board; an 8-wire cable to the CPU. Model as bundles. | ASM p.28, p.39, p.84 |

## 6. What is NOT in the documents

- **No overall dimensions or weight** of the 8800 in any MITS document I read (manuals, price list, catalogue).
- **No dimensioned drawing** of the case, chassis, back panel, sub-panel, dress panel, cross member, card rails or card guides. All Assembly Manual drawings are isometric sketches without dimensions, and not to a known scale.
- **No slot pitch** for the expander board. The plan view on p.85 is not to scale (its 4 in arrow is shorter than the board).
- **No position of the card cage** in the box beyond hole counts (13, 21, 9) along the side rails. The hole pitch is not given.
- **No panel thickness**, no LED or switch height above the panel, no switch body size (only part numbers).
- **No 88-EC, 88-4MCS, 88-SIO or 88-2SIO artwork** online. Only the CPU, D/C and 1K boards have X1 artwork.
- **No length of the D/C board**: the artwork is split over two pages with no overlap found.
- **No power supply board artwork or outline.**
- The 1975 **fan** fitting (size, model) is not described.

## 7. Copyright status

- **Notices.** The Assembly Manual (p.15), Theory of Operation (p.1) and SIO manual (p.1) say "© MITS, Inc., 1975". The 88-4MCS manual says "© MITS 1976". The 2SIO manual quotes third-party material "Copyright 1975/1976" (Motorola, National). The X1 artwork pages carry no notice.
- **Term.** These works were published in the US in 1975–76 with a notice. Under US law, works published 1964–1977 had their renewal made automatic (Copyright Renewal Act of 1992), so they are most likely protected for 95 years: to the end of 2070 (1975 works) or 2071 (1976 works). This is my reading, not legal advice.
- **Owner.** MITS signed a letter of intent with Pertec on 3 December 1976; the deal closed in May 1977, and the MITS brand was dropped. Pertec Computer Corporation was later bought by Triumph-Adler, and PCC by Scan-Optics in 1987; PCC is listed as defunct in 1987. I found no statement of who holds the MITS copyrights now, and no sign that anyone enforces them. They behave as orphan works.
- **How archives label them.** bitsavers.org, deramp.com (Mike Douglas) and altairclone.com host them **with no licence or copyright statement**. Bitsavers says only that its documents come from its owner's collection or are loaned for scanning. The archive.org scans by Retro Tech Restoration carry **no licence**. A DigiBarn copy of the Theory manual on archive.org is labelled **CC BY-NC-SA 4.0**. That is the uploader's label, not a grant from the rights holder, so it should not be relied on.
- **What this means here.** Facts and dimensions (10.0 × 5.0 in card, 6.375 in tab, 0.60 / 0.90 in switch pitch, fastener sizes, assembly order) are not protected, and may be used with a citation. The drawings, the PCB artwork and the manual text must not be copied, traced or vectorised into the model or the repository without permission. A **model built from measured values** (for example, switch centres measured on the artwork and re-entered as numbers) is the safe path. Tracing the copper or silkscreen as a texture is not.

## Sources

Every source cited here, by its key, is in [bibliography.md](bibliography.md).
