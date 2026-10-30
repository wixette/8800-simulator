# Altair 8800 in 3D: research pack

Reference material for building a board/card-level 3D model (three.js) of the original MITS Altair 8800 (1975) main box, one that can be taken apart and whose front panel works.

**Start with [REPORT.md](REPORT.md)**, the feasibility report.

```
REPORT.md                          feasibility report: go / no-go, confidence, gaps, value check, next steps
sources/
  notes-documents.md               the MITS manuals and board artwork; assembly order; copyright
  notes-case-and-panel.md          box size, case construction, front panel grid, versions, panel.svg check
  notes-boards-and-backplane.md    cards, expander boards and slots, power supply, interior layout, layout files
  notes-value-check-and-photos.md  existing 3D Altairs; the photo catalogue and missing views
  bibliography.md                  every source, by key, with access and licence
data/
  machine_spec.json                best value per dimension, in inches and mm, with source and confidence
  component_inventory.csv          39 part types: node name, mounting, fastening, how each comes out
  dims-documents.json              raw values from the MITS documents
  dims-case-and-panel.json         raw values for the case and panel, every disagreement kept
  dims-boards-and-backplane.json   raw values for the boards, backplane and power supply
  photo_catalog.json               licence, author and source of every image
photo-credits.md                   the 29 freely licensed reference photos: author, licence, source
```

Nothing from the MITS documents (© MITS 1975–76) is kept here: only facts and dimensions taken from them, with citations.
