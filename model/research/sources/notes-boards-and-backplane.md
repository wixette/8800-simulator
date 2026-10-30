# Notes: boards, backplane, card cage and power supply

**Area:** the inside of the original Altair 8800 (1975): card outline and edge connector, the 88-EC expander board and card guides, each card in scope, the power supply, and where everything sits in the chassis.
**Date:** 2026-10-20. **Sources:** see "Bibliography entries" at the end. Values are in `data/dims-boards-and-backplane.json`.

## Summary

- **The card outline is well known.** IEEE 696 gives it with tolerances. The MITS cards match it in length, tab length and tab position. The MITS documents give 10.0 × 5.0 in plus a 0.3 in tab (see `notes-documents.md`, drawing 880-110 and the 1:1 X1 artwork).
- **The 88-EC expander board can be measured from the Assembly Manual.** Its foil drawing (p.65) is drawn to scale. Scaled by the 0.125 in pad pitch, it gives a board about 11.1 × 3.4 in with 4 slots at 0.75 in. This is a new value: no document states the slot pitch in words.
- **A full photo set of an unmodified 1975 Altair exists** (Martin Eberhard, SN 220081K, on deramp.com). It shows the interior from the top, bottom, side and rear. It settles the interior layout.
- **No modern layout file (KiCad, Gerber) of an original-8800 board is published.** Reproductions of the CPU, the 4-slot backplane, the whole kit and the 2SIO exist, but their files are private. Open KiCad files exist only for **8800b** boards (CERN-OHL-S-2.0), which are out of scope but share the card outline.
- **The original 8800 had no fan.** The fan was the extra-cost 88-FAN option. Early back panels have a round hole with a screen.
- **Gaps:** the power supply board outline, the transformer sizes, the edge connector and card-guide body sizes, the Display/Control board's long side, and the card-cage height. All can be closed by photo scaling or by measuring one real machine.

## 1. Card geometry

### IEEE 696 (1983), Fig. 16

| Item | Value (in) |
|---|---|
| Board length (along the connector) | 9.980–10.020 |
| Board height, single height | 5.125 max (10.125 max for double height) |
| Tab depth below the body | 0.300–0.325 |
| Tab length | 6.350–6.360 |
| Board end to tab, on the pin-50 end | 2.120–2.130 |
| Contacts | 50 per side, 0.125 pitch; pin 100 opposite pin 50 |
| Board thickness | 0.062 nominal |
| Finger chamfer | 0.015 × 45° |
| Extractor holes in the top corners | 0.100–0.110 dia, 0.245–0.255 from the edges |
| Component height, component side | 0.500 max |
| Total board depth | 0.65 max |
| Connector spacing on the backplane | 0.75 ± 0.01 (0.740 min) |
| Card-guide slot width | 0.071–0.080 |
| Guide misalignment to connector centre line | 0.005 max |
| Guide to guide (slot bottoms) | 10.025–10.045 |

### MITS cards

- The MITS drawing 880-110 gives 10.0 in × 5.0 in body, a 6.375 in tab 0.3 in deep, 1.5 in from one end and 2.125 in from the other. The 1:1 X1 artwork confirms it (CPU: 5.40 in to the finger tips; 1K: 5.32 in). This is recorded in `notes-documents.md`; it is not repeated in my JSON.
- So the MITS card is the IEEE card. The tab length and tab position match IEEE 696 to within 0.02 in. The body (5.0 in) is inside the IEEE 5.125 in maximum.
- **The tab sits off-centre, toward the front of the box.** The short side (1.5 in) is the front end, where the 7805 sits. The long side (2.125 in) is the rear end, with the CPU's Molex connector.
- **Photo cross-check (weak).** I scaled two flat scans by their finger pitch (0.125 in). Lengths and tab positions agree with the drawing: CPU 10.01 in long, tab 6.36 in, offsets 1.51 and 2.14 in; 88-SIOA tab 6.38 in, offsets 1.50 and 2.11 in. **Heights do not agree**: 4.98 and 5.09 in to the finger tips, against 5.3–5.4 in. The images were probably resized unevenly. Use the artwork for heights. These photo values are in the JSON only so the disagreement is on record.
- Each card's 7805 heat sink rises **about 0.2–0.25 in above the top edge** of the card (CPU and SIOA scans).
- **Differences from IEEE 696 that matter for a model:** none in the outline. The bus differs electrically (pin 20 is UNPROTECT on the 8800, ground in IEEE 696). The early Altair backplane connectors have their two pin rows about 0.14–0.15 in apart; later S-100 backplanes used 0.25 in (HJ-S100BUS).
- 8800b cards (out of scope) have the same outline. The open KiCad file of the 8800b CPU card gives 254.22 × 134.62 mm (10.009 × 5.300 in), body 127.0 mm, tab 7.62 mm deep and 161.8 mm long, 38.25 mm and 54.17 mm from the ends, finger pitch 3.18 mm, board 1.6 mm. Good as a ready-made outline to check against.

## 2. Backplane: the 88-EC expander board ("8800 M/BD")

**What it is.** A single-sided board, foil on the bottom. Up to four 100-pin edge connectors are soldered on the blank (top) side (MITS-ASM-1975 p.64). 88-EC is the bare board; 88-MB is the board with connectors and card guides (MITS-OPER-1975 price list). Each card kit also brought its own connector and two card guides (`notes-documents.md`).

**How many.** The basic 8800 came with one expander board "capable of holding four vertical boards". Three more fit inside the main case: **4 boards, 16 slots** (BYTE-1975-09, MITS advert). The case kit supplied 4 card guides (2 slots' worth) and the unmodified SN 220081K has only 2 connectors fitted (CPU and memory).

**Measured from the Assembly Manual foil drawing (p.65).** The drawing has corner marks at the board edges. I scaled it by the pad pitch of the connector rows (20.05 px = 0.125 in, so 160.4 px/in). Checks: the slot pitch comes out at 0.748 in, the card-guide hole pairs sit 10.33 in apart (a 10 in card plus engagement), and the connector is 0.30 in off the board centre, which matches the card's off-centre tab (0.31 in). So the scale is consistent.

| Item | Value | How |
|---|---|---|
| Board length, along the connectors (front to back in the box) | 11.08 in | drawing p.65 |
| Board width, across the slots | 3.41 in | drawing p.65 |
| Slots | 4 | doc |
| Slot pitch | 0.748 in (0.75 nominal) | drawing p.65 |
| First and last slot to board edge | 0.59 and 0.58 in | drawing p.65 |
| Connector pin rows apart | 0.15 in | drawing p.65 (Herb Johnson: 0.140 in) |
| Connector mounting-hole spacing | 6.80 in | drawing p.65 |
| Card-guide holes: 2 per guide, apart | 0.31 in | drawing p.65 |
| Card-guide hole pairs, centre to centre | 10.33 in | drawing p.65 |
| Board thickness, early | 0.062 in | MFE-SN220081K-DOC (later boards thicker, value unknown) |
| Wiring holes | 2 staggered rows along the front edge: pins 1–50 and 52–99 | doc p.66 |

**Edge connectors.** 100 pins in two rows; one side numbered 1–50, the other lettered. Green bodies in SN 220081K. Body length and height are not given anywhere. The Kaufman reproduction backplane uses Sullins EBA50DRTH ("narrow footprint") and 3.2 mm board.

**Mounting.** The board sits flat on the **two card rails**, foil side down, with tape over any lands that touch the rails. It is held by 2 × 4-40 × 5/8 in screws (through the connector ears) and 2 × 4-40 × 5/16 in screws, with lock washers and nuts (p.69). The rails therefore run under the two ends of the connectors, about 6.8 in apart (inferred from the screw positions; photo SN 220081K #21 agrees roughly).

**Card rails.** Two aluminium rails run side to side across the chassis. Each end is fixed with a 6-32 × 3/4 in screw through a 1/4 in spacer (p.57). Their positions are set by counting holes in the perforated side members (13, 21 and 9 holes in the drawing). A 1/8 in braid grounds each expander board to a rail (grounding errata).

**Joining boards.** Only the first board is wired to the front panel in the Assembly Manual. Further boards were joined **wire by wire** through the staggered holes (CCTALK-GUZIS-2005). No 88-EC manual with this step was found. Processor Technology's MB-1 (1975) was a one-piece, 1/8 in thick motherboard that replaced three or four 88-ECs (BYTE-1975-09).

**Card guides.** Plastic U-channel posts, one at each end of a slot, screwed into the hole pairs on the expander board (#6-32 × 3/8 in screws, p.68). Normally blue; very early ones natural nylon (MFE-SN220081K-DOC). The top has a notch; the bottom is stepped (photo #18). A reproduction model (PLANET-KAUFMAN, `Altair_card_rail.stl`) measures **139.8 × 12.8 × 16.5** (units not stated; mm gives 5.50 × 0.50 × 0.65 in, which fits the photos).

**Card-cage height.** Not given. Card top above the expander board = connector seat height + 5.3 in card. The guide model suggests a cage about 5.5 in tall above the board.

## 3. The cards in scope

All cards are the MITS outline above. Each has its own 7805 regulator on a finned heat sink (#6-32 screw), fed from unregulated +8 V. Cards stand on edge, front to back, **silk-screen (component) side facing the right-hand side of the box viewed from the front** (`notes-documents.md`; photo SN 220081K #08 shows the CPU's component side from the right).

| Card | Large parts and features | Where in the box | Layout source |
|---|---|---|---|
| **88-CPU (8800 CPU board)**, Rev 0/1 | 7805 + heat sink at the front-top corner (0.25–1.26 in from the front end); 8080 in a 40-pin socket (4.29–6.32 in from the front end); 8212 near the rear (8.31–9.59 in); 8-pin Molex wafer at the rear-top corner (8.43–9.67 in); 2 MHz crystal in a cardboard cover; 18 ICs | First edge connector, the outermost slot at the right; Molex towards the back (p.92) | X1 artwork (1:1); flat scans front, back and X-ray |
| **Display/Control board** (front panel) | One board in the 8800 (schematics 880-105 display and 880-106 control are two sheets of one board). 36 LEDs, 25 toggle switches, one 7805, 25 ICs | Vertical behind the sub-panel, full width. 4 × #6-32 × 1 in screws with 0.6 in spacers; later errata hold it by the switch nuts only | X1 artwork (split pages): short side 6.46 in, long side about 15.9 in (est.), see `notes-documents.md` |
| **88-1MCS / 88-MCS (1K static RAM)** | 8 × 8101 sockets (MA1–MD2), 7805 + heat sink at the rear-top corner; as shipped with 256 bytes (SN 220081K), i.e. 2 of the 8 chips | Second connector, silk-screen side towards the CPU | X1 artwork (1:1); flat scans front and back |
| **88-4MCS (4K static RAM)** | 32 × 2102 RAMs in 8 rows at the front half; large finned 7805 heat sink at the rear-top corner; 4-position address DIP switch (Rev 2) | Any slot; "Altair slots: one" | Photo only (Rev 2, 1976) |
| **88-SIO (A: RS-232, B: TTL, C: TTY loop)** | COM2502 UART (40-pin), 7805 + heat sink at the front-top corner, 10-pin Molex at the rear-top corner; variants differ in interface parts only | Any slot; cable to a 25-pin connector on the back panel | Photos only (SIOA, SIOB, SIOC) |
| **88-2SIO** | Two 6850 ACIA sockets, crystal can, 7805 + heat sink at the front-top corner, two 10-pin Molex headers along the rear-top edge | Any slot; cables to 25-pin connectors on the back panel | Photos only |

**Front panel to bus (the harness).** The original has no ribbon cable. The D/C board has 62 loose wires plus 2 jumpers (p.13). Eight data wires (D0–D7) leave its short edge, are cut to about 16 in and end in a 10-pin female plug on the CPU's 8-pin wafer. The other numbered wires (cut from 3 ft lengths) are soldered into the expander board's staggered holes by bus pin number. Four 24 in wires run from expander holes 1, 2, 50 and 52 to the terminal block. Cable clamps hold the bundle at one corner of the D/C board and on the card-rail screws. The 8800c reproduction replaces this harness with a 50-pin ribbon and a bus interface card.

## 4. Power supply

**Ratings (MITS-SCHEM-1975, 880-109).** T1: 7.5 VAC at 8 A → +8 V (A) to the bus. T2: 8 VAC at 1.2 A → +8 V (B) to the D/C board, and 24 VAC CT at 400 mA → +16 V. T3: 11 VAC at 300 mA → −16 V. All unregulated; each card regulates its own +5 V.

**Parts (MITS-ASM-1975 p.2, p.50–55).**
- Three transformers on the **back panel**: T1 with 4 × #8-32 × 3/8 in screws in slotted holes, its weight resting on the cross member; T2 and T3 with 2 × #6-32 × 3/8 in screws each. The parts list names P-6138 ($18.15), "110V" ($9.95) and 133-P-5 ($3.70); by price these are probably T1, T2 and T3. The small transformer in photo #09 carries a 133-P-5-like label.
- **Power supply board** on top of the **cross member**, on 4 × 0.375 in metal spacers with 6-32 screws (lengthened to 3/4 in by the errata); two stacked rubber feet under its centre.
- On the board: **six 3300 µF 16 V axial electrolytics lying in a row** (C1–C4, C9, C10), one 1000–2200 µF (C12; 2200 µF 25 V in SN 220081K) and one 500 µF 25 V (C14); 10 × 1N4004; 7 disc capacitors; 4 resistors; a 3AG 1 A fuse in clips at one end.
- The **VJ048 10 A bridge rectifier** is soldered to the foil side and bolted through to the cross member, which acts as its heat sink (6-32 × 1/2 in screw).
- A **terminal block** (double row of ten) on the back panel, left of the transformers. All supply and bus power wires meet here.
- Grounding errata: 1/4 in braid along the PSU board's ground land; 1/8 in braids from the cross member, rail and expander boards to the chassis.

**Sizes.** No document gives the PSU board outline or the transformer sizes, and no artwork of the PSU board was found. Rough estimates from the top-view photo (#07, scaled by the expander board and checked against the 1.25 in fuse): **PSU board about 8.5 × 3.3 in**; T1 footprint about 3.75 × 3.0 in, T2 about 3.0 × 2.3 in, T3 about 1.3 × 2.3 in. These are ±10–15 % and marked `est`.

**Fan.** Not standard. The 88-FAN cooling fan was an option ($16 kit). The MITS advert says "provisions for the addition of a cooling fan". SN 220081K has a round fan hole covered by a screwed-on screen, and no fan; later back panels have slots instead.

## 5. Interior layout

From the Assembly Manual and the SN 220081K photos (#07 top, #08 right side, #09 rear inside, #17 backplane, #21 bottom). "Left" and "right" are as seen from the front.

- **Front:** the sub-panel with the D/C board behind it, across the full width. Its 7805 is at the left end; the AC switch wires run down the left.
- **Card cage:** the expander board lies flat on the two card rails, at the **right-hand end** of the rails. Slots run front to back; the first slot (CPU) is the outermost, nearest the right wall. More expander boards go to the left along the same rails. The cards fill most of the depth between the D/C board and the cross member.
- **Rear:** the **cross member** runs side to side under the transformers. The **PSU board** lies flat on it, along the rear, left of the transformers. **T1–T3** hang on the back panel at the **right rear**, behind the card cage. The **terminal block** is on the back panel left of the transformers. The **fan opening** (with screen) is left of centre; the I/O connector openings are on the side away from the transformers.
- **Wiring:** the D/C board's bus wires run as a laced bundle down the right side to the expander board. The four bus-power wires go round the right side to the terminal block; the D/C board's power wires go round the left (p.70).
- **Typical slot order:** slot 1 CPU, slot 2 memory (as shipped). Further memory and I/O cards go in any slot; the bus is the same at every connector.

## 6. Layout files and artwork found

| Board | Format | URL | Licence | What it gives |
|---|---|---|---|---|
| 8800 CPU, D/C, 1K RAM | Original X1 artwork films, 1:1 scans (PDF) | bitsavers.org/pdf/mits/8800/ (see `notes-documents.md`) | © MITS 1975; no licence | Exact outlines, holes, part positions. **The best source.** |
| 88-EC expander | Foil drawing in the Assembly Manual p.65 (to scale, not 1:1) | MITS-ASM-1975 | © MITS 1975 | Board size, slot pitch, guide and connector holes (section 2) |
| 8800 CPU Rev 0 | Flat scans, front, back, X-ray composite (JPG, ~3000 px) | MFE-CPU-SCAN | none stated | Part positions; heights unreliable |
| 1K RAM Rev 0 | Flat scans front and back (JPG) | MFE-1MCS-SCAN | none stated | Part positions |
| 88-SIOA/B/C, 88-2SIO, 88-4MCS | Photos (JPG) | MFE-SIO-PHOTOS, MFE-2SIO-PHOTOS, MFE-4MCS-PHOTOS | none stated | Part layout; SIOA is a flat scan |
| 8800 CPU Rev 1 reproduction (Kaufman) | Gerber from a professional scan | PLANET-KAUFMAN | **not published** (boards sold) | — |
| 4-slot backplane reproduction (Kaufman) | Gerber | PLANET-KAUFMAN | **not published** | — |
| Card guide reproduction (Kaufman) | STL | http://www.the-planet.org/Retro/Altair_card_rail.stl | none stated | Guide body 139.8 × 12.8 × 16.5 (mm?) |
| Whole kit: CPU, D/C, 1K, others (Stockly AltairKit, 2006–07) | Gerber from scans | ALTAIRKIT-STOCKLY | **not published** | — |
| 88-2SIO reproduction (Deltec / Patrick Linstruth) | KiCad 7 ("not an exact replica") | GH-DELTECENT-88-2SIOR1, TINDIE-DELTEC-2SIO | files **not published**; repo has a README only, no licence | — |
| SIOA Rev 2 (Deltec) | modern redesign | GH-DELTECENT-88-SIOR2 | docs only, no licence | Not the original layout |
| 8800c front panel set (Mike Douglas) | PCB | DERAMP-8800C | **not published** | Replaces the D/C board and harness |
| 8800b CPU, D/C, interface cards (warmech) | KiCad + Gerber | GH-WARMECH-8800B-CPU / -DC / -IF | **CERN-OHL-S-2.0** | **Out of scope** (8800b); the CPU and interface cards give a MITS card outline in a layout file |
| Generic 9-slot S-100 motherboard | KiCad + Gerber | GH-S100MBV5 | MIT | Not MITS; modern connector footprint only |
| 88-EC, PSU board, 4MCS, SIO, 2SIO | — | — | — | **No artwork or layout file found** |

## 7. Still unknown

1. **PSU board outline and part positions.** No artwork; only the assembly drawing and photos. Needs a measured photo or a measurement.
2. **Transformer sizes** (T1, T2, T3) and their exact positions on the back panel. The part numbers (P-6138, 133-P-5) did not lead to a datasheet.
3. **Edge connector body** (length, width, height above the board) and **card-guide** height and section on an original. The reproduction STL is the only number.
4. **Card-cage height**: card top above the expander board and above the chassis floor.
5. **D/C board long side**: needs the two halves of the X1 artwork stitched (front-panel area).
6. **Card-rail positions** front to back, and the pitch of the perforations in the chassis side members (the 13 / 21 / 9 hole counts need it).
7. **How additional expander boards were wired together**, and how far apart they sit on the rails (presumably edge to edge, 3.41 in).
8. 88-4MCS, 88-SIO and 88-2SIO part positions to better than the photos give.

One owner measurement session on a real 8800 or a Kaufman backplane would close items 1–4 and 6.

## Card layouts (the card cage)

**Date:** 2026-10-21. **Values:** `data/card_layouts.json`. **Sources:** MITS-ART-CPU, MITS-ART-1K, MFE-CPU-SCAN, MFE-1MCS-SCAN, MFE-4MCS-PHOTOS, MFE-SIO-PHOTOS, MFE-2SIO-PHOTOS, MITS-ADS-1975-76, SULLINS-CAT-2013, VCCA-GUIDE, PLANET-KAUFMAN. The PDFs and photos were read in a scratch folder only. Nothing derived from them (no image, trace or vector) is in the repository, only numbers.

**Frame.** All positions are in inches, in a card frame. The origin is the front-bottom corner of the card body; the front end is the one 1.5 in from the tab. u runs along the card toward the rear (0–10). v runs up from the body's bottom edge (0–5), and the tab hangs below v = 0. Positions are seen on the component (silkscreen) side, which faces the right-hand side of the box. Seen from that side with the fingers down, the front end is on the left. `rot` 0 means the part's long axis runs along u; 90 means along v.

### How the two artwork cards were measured (CPU, 1K)

1. **Frame.** I took the frame from the front copper page of each X1 PDF (1-bit, 300 ppi):
   - The ends and the top edge are the outer edge of the copper ground frame. It meets the corner brackets on the artwork.
   - v = 0 is the frame edge along the fingers.
   - CPU: 10.03 × 5.02 in. Tab u 1.43–7.92.
   - 1K: 10.04 × 4.97 in. Tab u 1.46–7.96.
   - On both cards the finger copper reaches 0.34–0.36 in below the body edge. Drawing 880-110 gives a 0.3 in tab.
   - The silkscreen brackets match the copper frame to within 2 px (0.01 in) after a pure shift. That is how the silkscreen was registered to the copper.
2. **Pads.** I found the pads automatically with numpy:
   - Filled the drill holes, eroded with an 11–15 px square to drop the traces, and labelled the connected components.
   - Grouped the pads into rows at 30 px (0.100 in) pitch. The rows show each DIP's position and orientation.
3. **Fit.** For every IC I fitted the full pin grid to the copper by grid search and took the centre of the best-scoring plateau.
   - The grid is N pins at 0.1 in, with rows 0.3 in apart (0.4 in for the 8101, 0.6 in for the 8080 and 8212).
   - The pin count from the legend is confirmed: the score falls from 1.0 to 0.3–0.4 for N ± 2.
   - The ICs are named from the silkscreen letters and the component legend (p.4). Pin 1 is taken from the silkscreen tick.
4. **Regulator.** Its lead holes were found as isolated pads in the heat-sink copper. On the CPU they are on the back copper, registered to the front by 351 shared pads (residual 3 px).
5. **Checks by eye.** I checked the fitted centres by eye:
   - CPU: on the Rev 0 scan, for the 8080, the 8212, the finger-side IC row and the Molex. They agree within 0.05 in.
   - 1K: on the Rev 0 photo, for H/J, the RAM grid and the regulator screw. They agree within 0.05 in.

The uncertainty is about ±0.02 in: the scale is good to about 0.3 % (finger pitch 0.1250 in), the frame edge to ±0.01 in, and the grid fit to ±0.01 in.

### What each card shows

- **CPU card (33 parts).**
  - **From the artwork:** 15 TTL DIPs and the 8212, with pin counts verified on the copper.
    - The finger-side row has 12 ICs lying across the card at v ≈ 1.52 (1.48–1.59), from N at u 1.03 to M at u 9.09.
    - H, T and S sit at v ≈ 3.45, u 2.34–3.49.
  - **8080 in its 40-pin socket:** u 5.29, v 3.69, along u. **8212:** u 8.97, v 3.69.
  - **8-pin Molex wafer:** pins in one row at v 4.75, u 8.55–9.60. Its pitch measures **0.150 in**, not the Molex 0.156 in.
  - **7805 lead holes:** u 0.60 and 0.82, v 3.60.
  - **Heat-sink copper:** u 0–1.50, v 3.79–4.97.
  - **Small parts:** a bank of 16 resistors (u 6.85–8.03, v 2.91–4.11) and the column of disc capacitors (v 2.15–2.73).
  - **From the Rev 0 scan:** the regulator body, its screw (u 0.66, v 4.37) and the heat sink (u 0.13–1.16, v 3.87–5.20, so it overhangs the top edge by about 0.2 in).
  - **New:** the heat sink starts about 0.1 in nearer the front than the "0.25–1.26 in" in section 3. That earlier figure came from the uncalibrated scan.
- **1K card (28 parts).**
  - **8101 positions:** 8 of them, 22-pin with rows 0.4 in apart, lying along u. They form a grid at u 1.06 / 2.43 / 3.78 / 5.14 and v 2.11 (MA1–MD1) / 3.76 (MA2–MD2).
  - **ICs:** K, N and L lie along u at v 0.61, u 1.59 / 2.44 / 3.31. H and J (8T97) are at u 6.78. A–F are in the rear-bottom area.
  - **Regulator:** 7805 leads at u 8.69, v 4.43 / 4.63. The middle lead is bent forward to u 8.54. The screw is at u 9.43, v 4.53. The heat-sink copper spans u 7.91–9.99, v 3.80–4.97.
  - **Unexplained holes:** three empty plated holes at u 9.93.
  - **From the photo:** the heat sink (u 8.95–9.66, v 4.07–5.13) and two axial electrolytics.
- **4MCS (49 parts, photo, ±0.1 in).**
  - Rev 2 board (1976). It has 32 positions for 2102 RAMs (16-pin, along u) in 8 rows × 4 columns: rows at v 0.45–4.55, pitch 0.585 in; columns at u 0.84 / 1.90 / 2.93 / 3.96.
  - 10 logic DIPs and a 4-way DIP switch in the rear half. A large finned 7805 heat sink sits at the rear-top corner (u 8.31–9.60). There is a power resistor and 3 axial electrolytics.
  - The April 1976 BYTE advert (public domain) shows an earlier board. It has the same RAM array and heat-sink corner, but a different logic area with no DIP switch. So the logic-area positions are Rev 2 only.
- **88-SIO (23 parts, photo, ±0.1 in).**
  - From the SIOA flat scan: the COM2502 UART (40-pin, along v) at u 5.93, v 3.60; 17 logic DIPs; the 7805 and heat sink at the front-top corner (u 0.18–1.20); a right-angle 10-pin Molex at the rear top (housing u 8.04–9.60, pins toward the top edge); 2 tubular capacitors.
  - SIOB and SIOC use the same PCB. Only the interface parts in the rear-bottom area differ.
- **88-2SIO (29 parts, photo, ±0.12 in).**
  - Rev 0 photo: two 6850 ACIAs (24-pin, along v) at u 4.43, v 4.26 / 2.96; a crystal can at u 1.30, v 3.46; 19 logic DIPs; the 7805 and heat sink at the front-top corner; two right-angle 10-pin Molex wafers at u 7.38 and 9.00, v 4.74; 3 axial electrolytics.
  - The rear third is the interface area, full of small parts that are not listed.

**Heights** are all estimates: about 0.20 in for a plastic DIP, about 0.30 in for the socketed 8080, 0.4–0.6 in for the heat sinks, and 0.5 in for the Molex wafers. No document gives them.

### The X1 artwork is not the Rev 0 board

The photographed **Rev 0** boards (silkscreen "REV 0") match the X1 artwork wherever both have a part: ICs, the 8080, the 8212, the RAM grid, the regulator, the Molex. But each carries **one extra 14-pin IC that has no footprint on X1**:

- CPU: a 7400 at the front end of the finger-side row, u ≈ 0.40.
- 1K: "G" at u ≈ 9.34, v 0.76.

The Rev 0 CPU also has parts that are not on the X1 silkscreen or legend:

- a paper-wrapped part at u 0.96–1.94, v 3.11–3.95 (the "crystal" of section 3);
- two axial electrolytics at the front end;
- two large resistors at the front-bottom corner;
- two electrolytics near the top at u 6.4 and 7.6.

The X1 copper has unlabelled pads in some of these places, so the X1 silkscreen may just be incomplete. These parts are in the JSON as `Rev0-*` with conf `photo`. The modeller can choose which board to build. X1 alone is the documented one; Rev 0 is what shipped in 1975 machines like SN 220081K (not checked part by part).

### Edge connector and card guide

- **Connector.** The Sullins 2013 catalogue, p.62–63, covers the 0.125 in pitch, 0.431 in insulator-height, 50/100-position dual-readout part (EB*50D**H family; modern equivalent of the MITS green connector, whose maker is unknown). It gives:
  - body 6.535 in long, 0.370 in wide, 7.075 in over the ears, with ear holes 6.795 in apart (Ø 0.125);
  - insulator 0.431 in high on 0.025 in standoffs;
  - card insertion depth 0.265 in; slot length 6.375 in;
  - contact span 6.125 in; narrow tail rows 0.140 in apart.

  This **matches the MITS expander drawing independently**: ear holes 6.80 in, rows 0.14–0.15 in. From these numbers the card body's bottom edge sits about **0.49 in above the backplane** (est.). The catalogue does not give the slot width (IEEE 696: 0.071–0.080 in).
- **Card guide.** VintageComputer.ca measured an original blue guide (in mm, "may not be 100 % accurate"):
  - 139.5 mm (5.49 in) tall;
  - base 16.75 × 13 mm (0.66 × 0.51 in) with 2 screw holes;
  - 12.9 mm wide over the lower 66.5 mm, then stepped asymmetrically to 9.5 mm;
  - tapering in depth from 16.75 mm at the base to 7.5 mm at the top;
  - card slot 2.0 mm (0.079 in), against a card of about 1.75 mm;
  - a 16 mm stepped base block and a notch at the top.

  The Kaufman STL (139.8 × 12.8 × 16.5) agrees to 0.3 mm, so its units are mm.

### Still estimated or unknown

- All heights.
- 4MCS, SIO and 2SIO positions: photo only. Perspective and uneven scan scaling limit them to ±0.1 in. Small passives are not listed.
- The regulator screw hole on the CPU card: from the photo.
- The CPU "crystal": what the wrapped part is.
- Which X1/Rev 0 variant was in a given machine.
- The edge connector's real 1975 maker and its card-slot width.
- The 1K card's rear holes: their purpose.

## Sources

Every source cited here, by its key, is in [bibliography.md](bibliography.md).
