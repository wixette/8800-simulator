# Notes: value check (existing 3D Altairs) and photo catalogue

**Research questions:** §3 Q7 (value check) and Q6 (photos) of the research task.
**Searched:** 2026-10-20. Sketchfab (public API), Printables (GraphQL API), Thingiverse, GrabCAD, TurboSquid and Free3D (in a browser), Cults3D and CGTrader (not reachable, see below), GitHub (API), YouTube and the web (search engine), Wikimedia Commons (API), Flickr (CC-filtered search pages), Smithsonian collections (Collections Search Center and object pages).

---

## Part 1: Value check. Does an equivalent already exist?

### Verdict

**No.** No 3D model of the Altair 8800 at board/card level (target B) exists anywhere we could find, open or closed. Every 3D model found is an **exterior shell**: a box, a front panel and sometimes vents. None models the chassis, backplane, power supply or cards. Only **one** has an open licence (Sketchfab, silverthegamer, CC BY 4.0), and its author says the back is not modelled and it is "not perfectly faithful".

The **closest to what this project wants** is a three.js web simulator published in July 2026 by Oliver0804 (GitHub). It has a 3D front panel with operable switches and lamps driven by an 8080 emulator. It reaches roughly **target A without the "inside as labelled blocks"**: the case is one box primitive and there is no interior at all. It has **no licence file**, so it is all-rights-reserved by default and cannot be reused. It is worth knowing about as prior art for the panel interaction, not as a source.

So building target B is new work and would not duplicate anything. There is no one with an existing board-level model to partner with. The 3D-printable case models (Printables and Thingiverse) are all small enclosures for Arduino or Raspberry Pi replicas, not measured reproductions.

### Table

| # | Item (author, date) | What it is | Level of detail | Interactive? | Format | Licence | Available? | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | **[Altair 8800 web simulator](https://github.com/Oliver0804/altair-8800-sim)** (Oliver0804, GitHub, created 2026-07-27; [live demo](https://oliver0804.github.io/altair-8800-sim/)) | 3D web emulator: Next.js + react-three-fiber + three.js 0.185. Full 8080, assembler, 88-SIO/2SIO, terminal | Case is a single box (17.75 × 7.35 × 18 in) plus a frame box, painted vent slots and feet. Panel art drawn to a canvas texture from a `layout.ts` in inches, said to be matched against a photo of the Smithsonian machine. 36 LED meshes and 25 switch meshes. **No interior** | **Yes**: switches toggle with the mouse, lamps lit by the emulator | TSX source, procedural geometry (no model file) | **None stated** (no LICENSE file): all rights reserved | Yes | Closest prior art for target A. Not board level. Not reusable. Its panel layout in inches could be cross-checked against ours, citing it as a source of facts |
| 2 | [Sketchfab: "Altair 8800"](https://sketchfab.com/3d-models/altair-8800-879b402246584ea19d5915f17e37dac5) (Unconid, 2020-11-30) | Exterior model made in Blender and Substance Painter | 14,195 faces, 2k textures. The Blender file has bones and controls for the switches (per its description) | Viewer only (orbit) | Sold as .blend .c4d .fbx .obj | Sketchfab "Editorial", not downloadable there | Yes (view) | Exterior only, paid/editorial. Not usable |
| 3 | [Sketchfab: "Altair 8800"](https://sketchfab.com/3d-models/altair-8800-a62370dfe8d043ea8123b44d3b13d451) (COSEDIMARCO, 2025-02-16) | Hard-surface exterior model in Rhino 8 | 3.03 M faces, UV-mapped | Viewer only | Sold on TurboSquid (row 6) | No licence on Sketchfab; not downloadable | Yes (view) | Exterior only, commercial |
| 4 | [Sketchfab: "Altair 8800 and Disk Drive"](https://sketchfab.com/3d-models/altair-8800-and-disk-drive-d936f3d8def246178892d7b4dc2f89b7) (silverthegamer, 2021-01-28) | Exterior model of the 8800 plus an Altair disk drive, for renders | 186,242 faces. Author: "Back is not modelled, and not perfectly faithful" | Viewer only | Sketchfab download (glTF/other) | **CC BY 4.0**, downloadable | Yes | The only openly licensed 3D Altair. Exterior only, no rear, not to measure. At most a visual comparison |
| 5 | [Sketchfab: "Altair 8800"](https://sketchfab.com/3d-models/altair-8800-482c500fb62948ccb2c0d982fee241f0) (kelvin.wender.00, 2025-09-20) | Exterior model (no description) | 10,847 faces | Viewer only | Not downloadable | None stated | Yes (view) | Exterior only |
| 6 | [TurboSquid search "altair 8800"](https://www.turbosquid.com/Search/3D-Models/altair-8800): "MITS Altair 8800" ($80, Maya) and "Altair 8800" ($25, Rhino; the COSEDIMARCO model) | Commercial exterior models | Renders show the case, panel and side vents | No | .ma/.obj etc. | TurboSquid royalty-free licence; the $80 model is "Editorial only" on Free3D | Yes (paid) | Exterior only, commercial |
| 7 | [Free3D: "MITS Altair 8800"](https://free3d.com/3d-model/mits-altair-8800-1791.html) (bLAZER76) | Same commercial model as the $80 TurboSquid listing | Exterior | No | .ma .obj | Royalty-free, **editorial only**, $80 | Yes (paid) | Exterior only |
| 8 | [Printables 430930: "Altair 8800 Replica box"](https://www.printables.com/model/430930) (Sergio Morales, 2023-03-23) | Printable enclosure for an Arduino Altair replica ([GitHub Menyiques/Altair8800](https://github.com/Menyiques/Altair8800)) | enclosure, two-colour front, switch guide | No (physical replica) | STL | CC BY (Printables "Attribution") | Yes | Miniature enclosure, not to scale. Not relevant |
| 9 | [Printables 590353: "Altair 8800 Simulator Case"](https://www.printables.com/model/590353) (SirDucksalot, 2023-09-24; also on Thingiverse) | Printable case for an AltairDuino | Case halves, bevel, top cover, front panel; Fusion 360 sources | No | STL + .f3d | CC BY-NC-SA (NC: excluded) | Yes | Enclosure only, NC |
| 10 | [Printables 1807749: "Altair 8800 mini"](https://www.printables.com/model/1807749) (briefer, 2026-08-13) | Decorative miniature front panel with Arduino-driven LEDs | Front only | No | 3MF | CC BY (Printables "Attribution") | Yes | Decorative miniature |
| 11 | [Thingiverse search "altair 8800"](https://www.thingiverse.com/search?q=altair+8800&type=things): 10 results, including "Mini Altair 8800 / 8800b" and "Altair 8800 Raspberry Pi 3 case" (RabbitEngineering), "MITS Altair 8800" (MintyFries; mirrored on [Cults3D 229879](https://cults3d.com/:229879), about 156 × 130 × 69 mm, faceplate/body/backplate STLs), "1802 Membership Card Altair 8800 Case" (3DSage), "Altair 8800 Simulator Case" (SirDucksalot), "Altair 8800" (Pisgeom), "No-Raspberry-Pi Altair 8800" (Pyrofer), "BlinkinLights Panel Parts" | Printable miniatures and enclosures | Shells only | No | STL | Per thing, not checked one by one | Yes | All shells or enclosures at reduced scale. None has an interior |
| 12 | [GrabCAD library "altair 8800"](https://grabcad.com/library?query=altair%208800) | One unrelated hit: an "S-100 Dummy Edge Connector" STL | A connector | No | STL | GrabCAD terms | Yes | No Altair model on GrabCAD |
| 13 | [altairclone.com forum, "Available Case Options"](https://altairclone.com/forum/viewtopic.php?p=2713) | A forum member shared a STEP model of the **8800c** case (Mike Douglas's Altair Clone case, a close look-alike of the original), 2024 | CAD of the replica case | No | STEP (zip) | Not stated | Not verified | Not the original, but the Clone case was made to match the original. Lead for the case/panel notes, not a 3D model of the board level |
| 14 | CGTrader, Cults3D | CGTrader search URLs returned "not found" in the browser and nothing in web search. Cults3D shows a bot check, which was not bypassed | none | — | — | — | — | No evidence of other models |
| 15 | YouTube | No 3D model, turntable or exploded-view video of an Altair found. One documentary ("I Bought the Cheapest Altair 8800 Computer on Ebay") has a 2D animated segment | — | — | — | — | — | Nothing relevant |
| 16 | Virtual museums and other WebGL | No 3D or VR Altair in the online collections of CHM, NMAH or Living Computers | — | — | — | — | — | Nothing relevant |

**2D/web simulators (context only, not competitors):** this [8800-simulator](https://github.com/wixette/8800-simulator) (2D SVG panel, used in classes); [s2js.com/altair](https://s2js.com/altair/) (JavaScript front panel); CEF32 Altair emulator; z80pack's graphical front panel (desktop); SIMH AltairZ80; David Hansel's [Arduino Altair 8800 simulator](https://github.com/dhansel/Altair8800) and the Altair-Duino kits (physical panel); Mike Douglas's Altair 8800 Clone (physical, discontinued). All are 2D or physical; none shows the inside.

---

## Part 2: Photo catalogue

**29 images downloaded** for the research: 24 from Wikimedia Commons and 5 from Flickr. They are not kept in this repository; each has an entry, with its source, in `data/photo_catalog.json` and [photo-credits.md](../photo-credits.md). All are CC0, public domain, CC BY or CC BY-SA. No NC or ND files were downloaded. Commons images wider than 1600 px were fetched as 1920 px thumbnails and scaled to 1600 px wide. All files are under 1 MB (largest 0.9 MB); total about 11 MB.

**How we checked:** we viewed every image. The model is judged from the panel. The original 8800 has a dark grey panel with a blue frame, lamps in two rows and the brushed nameplate. The 8800b has a black panel with coloured legend bands and an "altair 8800b" logo. An original 8800 cannot be told from an 8800a from the outside, so "8800 (original)" means "original-style 8800, 8800a not ruled out" unless the source dates it to 1975.

**Licences in the set:** CC0-1.0 (2), public domain (PD-self ×4, PD-US-no-notice ads ×4), CC-BY-2.0 (7), CC-BY-3.0 (1), CC-BY-SA-2.0 (3), CC-BY-SA-3.0 (2, plus 1 dual GFDL/CC-BY-SA-3.0), CC-BY-SA-4.0 (5).

### Interior (cover off), original 8800

| File | Shows | Model | Usefulness for modelling |
|---|---|---|---|
| `commons/Altair_8800_chasis.jpg` (CC0, Paul Terrell, 2002) | **Top-down plan view, no cards**: three 4-slot expander boards (12 edge connectors) with hand-wired bus jumpers, the front-panel boards standing vertically on one side, the power supply (transformers, filter capacitors, fan) on the other, card guides, wiring | 8800 | **High.** The only free plan view of the slot layout and the power-supply footprint. Low resolution (758 × 600) and oblique flash. Provenance: uploaded 2026-10-07 as own work, camera EXIF of 2002 is consistent; check again before use as a texture |
| `commons/Altairinside.JPG` (PD, Joho345, 2008, Heinz Nixdorf MuseumsForum) | Chassis **standing on end**, cover off, cards out: the stacked expander boards with blue card guides and connectors, the back of the front-panel boards with harness and ribbon cables, PSU filter capacitors (3300 µF 16 V), a hand-wired perfboard card | 8800 | **High** for the backplane stack, card guides, panel boards and cable routing. Perspective is steep |
| `other/Flickr_mwichary_2297954314_Altair_8800_HNF_display.jpg` (CC BY 2.0, Marcin Wichary, 2006) | Wider view of the same HNF display: chassis on end, panel folded out, backplane, ribbon cables, transformer | 8800 | Medium: context for `Altairinside.JPG` |
| `other/Flickr_believekevin_5369047617_DSC09835.jpg` (CC BY 2.0, "kevin", 2011) | Cover off, front-left ¾, lamps lit: **six or more cards in their slots**, front-panel boards and wiring, transformer and rear area | 8800 | **High**: the best free view of cards in place. Only 800 px. The Flickr description links a DigiBarn TV episode on Erik Klein, so this is probably his machine |
| `other/Flickr_believekevin_5370736820_DSC09844.jpg` (CC BY 2.0, "kevin", 2011) | Same machine, lower angle | 8800 | Medium–high (800 px) |
| `commons/Altair_8800_Computer.jpg` (PD, Michael Holley, 2004) | Front-left ¾ of an Altair with a **clear Plexiglas top cover** on an 88-DCDD drive: 8 cards in slots (per its description, left to right: Seals 8K SRAM, MITS FDC ×2, MITS 16K DRAM ×2, **88-2SIO**, SSM PROM, **MITS 8080 CPU**), fan and power supply at the rear | 8800 | **High** for card order, card height relative to the case, and where the fan sits. Cards are third-party plus MITS |

### Interior and boards, other models (8800b): use only for card outline and general construction

| File | Shows | Model | Usefulness |
|---|---|---|---|
| `commons/Altair_8800b_Computer.jpg` (PD, Michael Holley, 2007) | 8800b cover off: 18-slot motherboard, card guides, two cards, transformer, ribbon cables to the panel | 8800b | Low–medium. Different chassis, backplane and PSU |
| `commons/Altair_8800b_Computer_Front.jpg` (PD, Michael Holley, 2007) | Same machine from the front-left | 8800b | Low–medium |
| `other/Flickr_brouhaha_49762967763_Altair_8800b_CPU_board_front.jpg` (CC BY-SA 2.0, Flickr user _brouhaha_, 2020) | 8800b CPU card, component side, almost orthographic: S-100 outline, edge connector, two regulator heat sinks, 8080, crystal | 8800b CPU | **Medium**: a good scaled reference for the S-100 card outline, connector fingers and heat-sink blocks. Not the original 88-CPU layout |
| `other/Flickr_brouhaha_49763496611_Altair_8800b_CPU_board_rear.jpg` (CC BY-SA 2.0) | The same card, solder side | 8800b CPU | Medium for outline and hole positions |

### Front panel, straight on

| File | Shows | Model | Usefulness |
|---|---|---|---|
| `commons/Living_Computers_-_Altair_8800_(39802981903).jpg` (CC BY 2.0, Michael Dunn, 2018) | Panel almost orthographic, lamps lit, brushed nameplate with MITS logo | 8800 | **High**: best for panel art and switch/lamp positions (scale from the known panel width) |
| `commons/MITS_Altair_8800_Front_Panel.jpg` (CC BY-SA 4.0, Cromemco, 2016) | Panel straight on, even light on white, 1600 px | 8800 | **High** for legends and spacing. **No lower nameplate strip** on this unit, and the switch bats have coloured tips, unlike most survivors. Note these differences before using it as art |
| `commons/CPU_Altair_8800.jpg` (CC BY-SA 3.0/GFDL, Stahlkocher) | Panel straight on, 1120 px | 8800 | Medium (a cross-check) |
| `commons/Altair_8800_at_the_Intel_Museum_20131230.jpg` (CC BY 2.0, Don DeBold) | Panel nearly straight on, raking light from above | 8800 | Medium: the shadows show bat length and lamp projection |

### Exterior, ¾ and side views

| File | Shows | Model | Usefulness |
|---|---|---|---|
| `commons/MITS_Altair_8800_Computer_(1975).jpg` (CC BY-SA 4.0, Cromemco) | Front ¾ from above, plain background: cover, frame depth | 8800 | High for proportions |
| `commons/Altair_8800,_Smithsonian_Museum.jpg` (CC BY-SA 2.0, Ed Uthman, 2003) | Front-left ¾: **left side vents**, cover/base split | 8800 | High for the left side |
| `commons/MIC_Torino-altair8800.png` (CC BY 3.0, MIC Torino) | Front-left ¾ on white: left side louvres and screws | 8800 | Medium (640 px) |
| `commons/MITS_Altair_8800_microcomputer_-_Computer_History_Museum.jpg` (CC BY 2.0, Michael Hicks, 2013) | Front-right ¾: **right side vents** | 8800 | High for the right side |
| `commons/Computer_Museum_of_America_(71).jpg` (CC BY-SA 3.0, Bubba73, 2019) | Front-right ¾, sharp | 8800 | High |
| `commons/Altair_PC_(3803232519).jpg` (CC BY 2.0, Tomislav Medak, 2009) | Front-left ¾ with an Altair disk drive on top: left side louvres | 8800 | Medium |
| `commons/Altair_8800_-_MfK_Bern.jpg` (CC BY-SA 3.0, Sandstein, 2011) | Front-left ¾ from above, with a disk drive on top | 8800 | Medium |
| `commons/Altair_8800_computer_at_CHM.jpg` (CC0, Tomwsulcer, 2015) | Front from slightly above | 8800 | Medium |
| `commons/Computer_History_Museum_–_Altair_8800.jpg` (CC BY-SA 4.0, Punteador, 2014) | Front from well above: cover extent, case depth | 8800 | Medium for depth/width ratio |
| `commons/Altair_8800_and_Model_33_ASR_Teletype.jpg` (CC BY-SA 4.0, Tim Colegrove, 2020) | An original kit-built 1975 Altair from above-left, beside a Model 33 ASR | 8800 (1975) | Medium: context and a scale cue from the Teletype |
| `commons/Altair_8800-Computer.jpg` (CC BY-SA 4.0, Bernd Gross, 2016) | 8800 with **rack-mount ears** above two drives (TMW Vienna) | 8800 (rack option) | Low: optional rack hardware, not the desktop case |

### Period advertisements (public domain, US publications without notice)

| File | Shows | Usefulness |
|---|---|---|
| `commons/Altair_Computer_Ad_May_1975.jpg` | Kit parts spread out: case, panel, boards | Medium: what was in the 1975 kit; halftone |
| `commons/Altair_Computer_Ad_August_1975.jpg` | 8800 box, two 4K memory boards, interface boards | Medium |
| `commons/Altair_4K_memory_boards_&_Altair_IO_Cards_-_Jan_1976_Byte_advert.jpg` | 88-2SIO/88-PIO I/O cards with cables | Low–medium |
| `commons/Altair_4K_Static_-_Apr_1976_Byte_advert.jpg` | **Top view of the 4K static memory board (88-4MCS)**, filling the page width | **Medium–high**: the only free top view of an in-scope MITS card. Halftone, slight perspective |

### Useful photo pages that are not free (links only; nothing copied)

| Source | What it has | Rights |
|---|---|---|
| Computer History Museum, Louis Wheeler gift X2958.2005, catalogue nos. **102652189–102652214** ([interior 102652203](https://www.computerhistory.org/collections/catalog/102652203), [interior 102652209](https://www.computerhistory.org/collections/catalog/102652209), [fan 102652210](https://www.computerhistory.org/collections/catalog/102652210), [interior 102652211](https://www.computerhistory.org/collections/catalog/102652211), [interior side 102652212](https://www.computerhistory.org/collections/catalog/102652212), [front 102652204](https://www.computerhistory.org/collections/catalog/102652204)–[102652206](https://www.computerhistory.org/collections/catalog/102652206), [panel close-ups 102652207](https://www.computerhistory.org/collections/catalog/102652207)/[102652208](https://www.computerhistory.org/collections/catalog/102652208), circuit boards front and rear 102652189–102652196, MITS board 102652201/102652202) | The most systematic set of cover-off, interior side, fan/PSU and per-board photos found, on a white background | No licence statement; treat as © CHM. Ask CHM for permission or higher-resolution files (owner action) |
| Smithsonian NMAH: [Altair 8800 (Forrest Mims, 1987.0066.01)](https://www.si.edu/object/nmah_334396); Mark Sienkiewicz Altair 2007.0032 with **17 plug-in cards each photographed** (2007.0032.05.01–.17, e.g. [nmah_1759579](https://www.si.edu/object/nmah_1759579)) | Exterior photos; per-card photos. The card record gives "overall: 3/4 in x 10 in x 5 1/4 in" | Metadata CC0 but images marked **"Usage Conditions Apply"**, not CC0 Open Access. Link only. The card dimensions are facts and may be cited |
| [deramp.com, "Very Early Altair 8800"](https://deramp.com/early_altair.html) (Mike Douglas) | Serial #220081K: front, **rear**, inside front, inside rear, underside of the top cover, CPU and RAM views; notes early features (off-white card guides, open fan grille, PEM-nut feet, grooved cover) | No notice on the page; assume copyright Mike Douglas |
| [vintagecomputer.ca, "MITS Altair 8800 lost and found"](https://vintagecomputer.ca/mits-altair-8800-lost-and-found/) (2017) | Front, overhead and rear with the cover removed; outer case and faceplate removed; front panel PCB markings; Rev 0 and Rev 1 motherboards; **rear interfaces; rear profile** | © VintageComputer.ca, all rights reserved |
| [vintagecomputer.ca, "Altair Card Guide dimensions"](https://vintagecomputer.ca/?p=1642) | Card guide dimensions (not opened) | All rights reserved; facts citable |
| [TechRepublic, "Inside the Altair 8800 vintage computer"](https://www.techrepublic.com/pictures/inside-the-altair-8800-vintage-computer/) (Erik Klein's photos) | Interior, power supply, four-slot motherboards chained together, CPU and 2SIO boards | Copyright; page blocked automated fetch |
| Dave Dunfield, "Daves Old Computers: ALTAIR 8800 Main Unit" ([mirror](https://archive.retro.co.za/mirrors/ccc/www.classiccmp.org/dunfield/altair/altair2.htm)) | Cover off, cards removed, card slots, front panel wiring, transformers and power supply (per search snippet; page was not reachable, HTTP 402) | Copyright |
| [VCFed forum, "Altair 8800 restoration"](https://www.vcfed.org/forum/forum/genres/s-100/66494-altair-8800-restoration?p=806121); nerp.net/~legendre/altair/ (rebuild documents, not opened) | Restoration photos and notes on the power supply | Copyright |

### Views still missing (no free photo found)

1. **Rear panel** of the original 8800: no free photo at all. The deramp.com and vintagecomputer.ca pages have one (non-free).
2. **True orthographic side and top elevations** of the closed case. The ¾ views give the louvres but not their exact size.
3. **Underside** (feet, base screws).
4. **Close-ups of the in-scope MITS cards:** the original **88-CPU**, **88-SIO**, **88-2SIO** (only a halftone ad), the 1K memory card as shipped with 256 bytes, the 88-4MCS (only a halftone ad).
5. **Front-panel boards** on their own (both sides), and how they mount to the sub-panel.
6. **Expander board (88-EC) close-up**, card guides on their own, the slot pitch with a ruler in view.
7. **Power supply** close-up: transformer, rectifiers, capacitor bracket, the fan and its grille, from above with scale.
8. **Empty chassis with the front panel removed**. `Altair_8800_chasis.jpg` is the nearest (no cards, but low resolution).

Points 4–7 are covered by the non-free CHM Wheeler series and the vintagecomputer.ca and deramp.com pages. Asking CHM or Mike Douglas for permission, or photographing a real machine or Clone, would close them (owner action).

**A filename trap:** Commons has both `Altair 8800 Computer.jpg` (Holley, Plexiglas top, downloaded) and `Altair 8800 computer.jpg` (Kozlenko 2015, panel with a yellow overlay, not downloaded). These names collide on case-insensitive file systems such as macOS. Only the first is in the repo. The two `2019-08-04 Altair 8800 Computer/computer.jpg` files are duplicates of each other.

**Not downloaded, but free and available if needed:** the RetroMadrid 2018 photos (PD, but an AltairDuino replica), the Museum Enter photos (CC BY-SA 3.0, panel modified with push-buttons), `Altair 8800, Melbourne Museum.jpg` (BSD), `HomeComputerMuseum - MITS Altair 8800.jpg` (CC BY 4.0, 640 px), the Maker Faire and CHM shelf photos, Flickr board photos of the MITS floppy controller and 8800b Turnkey module by _brouhaha_ (CC BY-SA 2.0; out of scope).

---

## Sources

Every source cited here, by its key, is in [bibliography.md](bibliography.md).
