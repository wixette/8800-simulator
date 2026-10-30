# Notes: interior layout of the main box

**Area:** where the card rails, expander boards, cards, chassis, cross member, back panel, transformers and power supply board sit inside the original 1975 Altair 8800.
**Date:** 2026-10-21. **Values:** `../data/dims-interior-layout.json` (92 entries, inches, each with its uncertainty).
**Frame:** the model's machine frame. X from the box centre, + to the right seen from the front. Y from the box centre, + toward the back; the box front face is at Y = −8.75 for a 17.5 in box. Z above the box bottom. The D/C board's back face is at Y = −7.88 (`params/machine.json`: −200.25 mm, which is **0.87 in** behind the box front face, not 8.67 in).

## Summary

- **Every main part now has a position to about ±0.15–0.25 in**, from scaled photos of the unmodified SN 220081K (Martin Eberhard's set), checked against two other machines (the CC0 top view and VCCA's overhead view).
- **The card rails are 6.85 in apart**, centred 3.15 in and 10.05 in behind the box front. Their tops are about 0.66 in above the box bottom. They are 1/2 in flat bars, about 1/8 in thick and 16 in long.
- **Board 0's right edge is 1.25 in from the box's right outer face.** The slot-1 (CPU) card is 6.66 in right of centre. Further boards follow every 3.62 in, with a 0.2 in gap between boards.
- **Cards stand 5.5 in above the expander board.** Their tops are 6.25 in above the box bottom, about 0.7 in under the lid.
- **The manual's hole counts check out.** The side member flange has 52 holes at 0.30 in. The cross member is at hole 13 from the rear, the rear rail at hole 21, and the front rail at hole 9 from the front.
- **Weakest values:** the cross member's height (1.1 or 2.0 in; two methods disagree), the card's front gap to the D/C board (0.45–0.93 in), and the rail section's height (inferred from screw lengths).

## 1. Method

**Photos used.**

| Photo | What it shows | How it was used |
|---|---|---|
| SN 220081K #21 (2800 × 2780) | The chassis out of its case, upside down: a bottom view | Main plan view: rails, holes, board, cross member, back panel, D/C stack |
| #07 (2749 × 2807) | Top view in the case | Rails and board in one plane; board pitch from the rail holes; PSU board; transformers |
| #08 (3710 × 1693) | Right side view in the case | Heights: card top, side-member web, transformer tops |
| #03 (3952 × 1754) | Rear view, near-orthographic | Transformer screws, back panel width, fan hole |
| #09, #17, #20, #22, #26 | Oblique close-ups | Sections, how parts attach, cross member lip, harness |
| `Altair_8800_chasis.jpg` (CC0) | Another machine, 3 boards, top view | Board pitch, board gaps, rails |
| VCCA overhead (1920 × 1280) | Another machine, 3 boards, top view | Rails, slot jump, slot-1 position |

**Rulers.** I used these as rulers:
- 0.125 in connector pin pitch, seen on the foil traces in #21 (155 px/in);
- the 11.08 in board and the 10.33 in guide-hole pairs, both scaled from the manual drawing;
- the 0.75 in slot pitch;
- the 7.0 in bezel and the 17.0 in case;
- the 4.0 in fan hole, as a check.

The 1.25 in fuse and the 10.0 in card were used only as checks. Each value is measured against a ruler in the same plane where possible.

**Perspective.**
- The SN 220081K photos are iPhone SE crops. Their EXIF focal length is 3.99 mm; with an assumed 1.22 µm pixel, f is about 3270 px.
- Where two planes had to be compared, I used a pinhole model: scale is proportional to 1 / distance. In #08 I took the principal point from converging edges.
- In #21, the ratio of the flange-plane scale to the board-plane scale (1.027) gave the flange-to-board height. It agrees with the hardware stack.
- #07 is tilted, so its scale changes by about 4 % across the box. I used its scale only locally, at the board.

**Pixel work.** Hole and connector centres came from Fourier pitch fits and colour profiles (numpy), on downloads kept outside the repo.

## 2. Results

| Item | Value (in) | ± | Basis |
|---|---|---|---|
| Front rail centre, Y | −5.6 (3.15 behind box front; 13.7 from back panel inside) | 0.2 | #21, #07 |
| Rear rail centre, Y | +1.3 (10.05 behind box front; 6.8 from back panel inside) | 0.2 | #21, #07 |
| Rail spacing, centre to centre | 6.85 | 0.12 | #07 6.75, #21 6.79–6.94, manual 6.80, 23 × 0.30 = 6.90 |
| Rail top above box bottom | 0.66 | 0.15 | hardware stack; #21 perspective |
| Rail section (W × H) | 0.49 × 0.125 flat bar | 0.03 / 0.05 | #07, VCCA; H from screw length |
| Rail length (side to side) | 16.0 (end screws 15.65 apart) | 0.25 | #21 |
| Board front edge to front rail | 1.86 | 0.08 | #07, #21, VCCA |
| Board rear edge to rear rail | 2.4 | 0.12 | #07, #21 |
| Board 0 right edge, X | +7.25 (1.25 from box right face; 0.85 from side-member web) | 0.15 | #21, #07 |
| Slot 1 (CPU) centre, X | +6.66 | 0.15 | #21, #07, VCCA |
| Board pitch (edge to edge + gap) | 3.62; gap 0.21 | 0.05 | #07 rail holes; CC0; VCCA |
| Slot jump across a board joint | 1.37 | 0.04 | #07, VCCA |
| Board k right edge, X | 7.25 − 3.62 k (board 3 left edge −7.02) | 0.25 | #07 |
| Expander board top above box bottom | 0.72 | 0.15 | stack; #08 chain |
| Card body bottom above board (seat) | 0.5 | 0.15 | #08 chain |
| Card top above board | 5.5 | 0.2 | #08; guide STL 5.50 |
| Card top above box bottom | 6.25 | 0.15 | #08 |
| Card top to lid underside | 0.7 (heat sinks ~0.45) | 0.2 | #08 |
| Board front edge to D/C back face | 0.38 | 0.2 | #21, #07, #26, CC0 |
| Card front end to D/C back face | 0.9 | 0.3 | board chain; #08 says 0.45–0.7 |
| Card rear end to cross member | 0.85 | 0.3 | #07, #21 |
| Side member web height | 2.7 | 0.15 | #08 |
| Side member flange width | 0.62 | 0.05 | #21 |
| Side member length | 16.0 | 0.25 | #21 |
| Flange holes | 52 at 0.30 pitch, Ø 0.16, row 0.37 from web outer face, hole 1 0.63 from back panel | 0.007 (pitch) | #21, #08, #07 |
| Chassis width (web outer to outer) | 16.2 | 0.25 | #21; back panel corner screws ±8.07 |
| Cross member front face, Y | +3.9 (4.2 from back panel outer face) | 0.2 | #21, #07, hole 13 |
| Cross member top, Z | 1.1 (or 2.0, see §4) | 0.4 | #03, #09 / #21 |
| Back panel outer face, Y | +8.15 (16.9 behind box front) | 0.15 | #21, #08 |
| Back panel width | 16.85 | 0.2 | #03 |
| T1 centre (X, Z) | 6.35, 2.45; screws X 5.06/7.64, Z 1.24/3.67; top Z 4.4 | 0.15 | #03, #07, #08 |
| T2 centre (X), screws Z | 6.3, 5.15; screws X 4.85/7.74; top Z 6.6 | 0.15 | #03, #08 |
| T3 centre (X, Z) | 4.0, 4.9; screws Z 3.67/6.12 | 0.2 | #03 |
| PSU board | 8.35 × 3.0; X −3.65 to +4.7; Y +4.2 to +7.25 | 0.3 | #07, #21 |
| Fan hole | centre X −0.81, Z 4.22; Ø 4.0 | 0.15 | #03 |

## 3. The layout in words

**Plan view, from above, front at the bottom of the page.**
- The D/C board stands across the front, 0.87 in behind the box face.
- Just behind it, about 0.4 in back, is board 0's front edge. Board 0 is 3.41 in wide; its right edge is 1.25 in from the box's right face.
- Two flat rails cross under the board from side to side, 3.15 in and 10.05 in behind the box front. Their ends sit on spacers on the bottom flanges of the two perforated side members.
- More boards would sit to the left every 3.62 in. The rails carry pre-drilled holes for three more boards.
- Behind the board, about 0.3 in, the cross member runs side to side from 4.2 in in front of the back panel back to the panel. The PSU board lies on it, from X −3.65 to +4.7.
- T1 sits at the right rear on the cross member, 3.1 in wide. T2 is above it against the back panel, and T3 (on a U bracket) is just left of them.
- The back panel is 16.9 in behind the box front. The case bottom runs at least another 0.5 in back.
- The harness drops from the D/C board's right end and runs back in the 0.8 in channel between the right side-member web and board 0's right edge. The 8-wire data cable crosses over board 0 to the CPU's rear-top Molex. The red power wires run back along the left side member to the PSU and terminal block.

**Side view, from the right, front at the left.**
- Box bottom at 0. The case floor is about 0.05 in thick, then the side-member flange.
- The rail ends sit on a nut, washer and 1/4 in spacer, so the rail top is at 0.66. The board top is at 0.72.
- The connector holds the card body about 0.5 in up. The card top is at 6.25, the guide tops at 6.4, and the heat-sink tops at about 6.5.
- The lid's underside is at about 6.95.
- The side-member web rises to 2.75, and the case bottom's side wall to about 2.5.
- At the rear, T1 runs from about Z 1.1 to 4.4 and T2 from about 4.3 to 6.6.

## 4. Disagreements

- **Rail spacing.**
  - SN 220081K: 6.75–6.97 (value 6.85).
  - VCCA: 7.1 ± 0.25. CC0: 7.25 ± 0.3.
  - Both of those are later, modified 3-board machines; their builders may have used other holes (24 pitches would give 7.2).
- **Cross member height.**
  - About 1.1 in: T1 rests on it, and T1's lowest screws are at Z 1.24 (#03); its front lip looks about 0.9 in tall (#09).
  - About 2.0 in: the perspective of its lips in #21, and the PSU screw spacing in #21 against #07.
  - The PSU board's Z follows whichever is right.
- **Card front gap.**
  - Chain through the board (board gap 0.38 + 0.55): 0.93 in.
  - Side view #08: 0.45–0.7 in. This depends on where the D/C board's right end is.
- **Slot-1 X.**
  - Plan views: 6.53–6.77.
  - Side view #08: 6.9–7.4, which rests on the assumed focal length.
- **Hole pitch.** 0.295 (from the rails) to 0.304 (from the #21 scale). 5/16 in is ruled out by the rail spacing. 7.5 mm (0.295) is possible.
- **Chassis width.** 16.2 in, about 0.35 in narrower than the case's inside on each side. This rests on the #21 scale; the case-to-chassis screws in #08 would then need spacers.

## 5. Still unknown, and the one measurement that settles each

| Unknown | One measurement |
|---|---|
| Cross member height and section | Ruler from the case floor to the cross member's top, plus its depth |
| Rail section and exact spacing | Calipers on one rail end, and a tape between the two rail centres |
| Card front gap and board front gap | Feeler or ruler from the CPU card's front end to the D/C board |
| Connector seat height | Calipers from the board top to the connector top |
| Side member hole pitch | Tape over 10 holes |
| Chassis width; gap to the case wall | Tape across the side-member webs |
| Back panel recess and the box depth | Tape from the bezel front to the back panel and to the case's rear lip |
| Transformer bodies | Calipers on T1, T2, T3 |
| PSU board outline | Ruler on the board |
| Side-member web hole pattern; lid and floor sheet thickness | One close photo with a ruler; calipers |

## Sources

Every source cited here, by its key, is in [bibliography.md](bibliography.md): MFE-SN220081K-PHOTOS (photos #03, #07, #08, #09, #17, #20, #21, #22, #26), COMMONS-CHASIS, VCCA-LOSTFOUND, MITS-ASM-1975, MITS-THEORY-1975, PLANET-KAUFMAN, MFE-CPU-SCAN. Downloads were kept in a scratch folder outside the repo, for measurement only. TECHREPUBLIC-KLEIN and DUNFIELD-ALTAIR were not used: earlier research recorded that both block automated fetches. No new sources were needed.
