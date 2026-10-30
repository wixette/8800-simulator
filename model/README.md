# The Altair 8800 3D model

The original 1975 Altair 8800's main box at board/card level, as the
simulator's 3D view shows it. **The design record is
[docs/3d-model.md](../docs/3d-model.md)**: how the model is made, the
node names and extras the page relies on, the take-apart rules, and
where every number comes from.

```
params/            machine.json (every dimension, with its source) and cards.json
blender/scripts/   the build: build_whole_box.py, with build_front_panel.py and
                   build_card_cage.py; preview renders; lib/
blender/data/      the name plate's title drawing
research/          the research: REPORT.md first, then sources/ and data/
altair-8800.glb    the built model, served to the page
```

## Building

```
npm run build:model
```

Blender (last built with 5.2), headless; it is looked for in
`/Applications/Blender.app`, or set `$BLENDER` to its executable. The
build needs nothing outside this folder and no network. Commit the
rebuilt `altair-8800.glb` with the change that made it: `npm test`
checks it against `params/machine.json`.

Preview renders, for looking at a change without the page:

```
"$BLENDER" --background --factory-startup --python model/blender/scripts/render_whole_box_previews.py
```

They go to `model/blender/out/`, which git ignores.

## Licence

The model, its params, its research and its title drawing are
**CC BY-SA 4.0**; the build scripts are Apache-2.0. See
[LICENSE](LICENSE).
