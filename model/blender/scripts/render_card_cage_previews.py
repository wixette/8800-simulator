"""Workbench preview renders of the card cage (with the front panel).

  Blender --background --factory-startup --python render_card_cage_previews.py
Writes PNGs to blender/out/previews/ (git-ignored). Shows the 256-byte fit (the rest pose
has the two 88-4MCS cards on board 1, so they are hidden here) and a card lifted out.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import build_card_cage  # noqa: E402
from lib import params  # noqa: E402
from lib.bl import MM  # noqa: E402
from render_front_panel_previews import OUT, camera, render, setup_render  # noqa: E402

if __name__ == "__main__":
    p = params.load()
    build_card_cage.build(p)
    setup_render((1600, 1000))
    os.makedirs(OUT, exist_ok=True)
    objs = {o.name: o for o in bpy.data.objects}
    for card in ("mem4k_0", "mem4k_1"):
        objs[f"card.{card}"].hide_render = True
    over = camera("m1_over", (520, 420, 520), (60, -40, 60), 32)
    render(over, os.path.join(OUT, "11_m1_overview.png"), (1600, 1000))
    top = camera("m1_top", (60, -40, 900), (60, -39, 0), 35)
    render(top, os.path.join(OUT, "12_m1_top.png"), (1600, 1000))
    objs["card.mem1k"].location.z += 100 * MM
    side = camera("m1_side", (520, -60, 200), (120, -40, 90), 35)
    render(side, os.path.join(OUT, "13_m1_card_lifted.png"), (1600, 1000))
    # each card on its own, component side square-on, lifted clear of the cage
    objs["card.mem1k"].location.z -= 100 * MM
    for card in ("cpu", "mem1k", "mem4k_0", "sio", "sio2"):
        for o in bpy.data.objects:
            if o.type == "MESH":
                o.hide_render = not o.name.startswith(f"card.{card}")
        c = objs[f"card.{card}"]
        loc = c.matrix_world.translation / MM
        cam = camera(f"card_{card}", (loc.x + 420, loc.y, loc.z + 64), (loc.x, loc.y, loc.z + 64), 50)
        render(cam, os.path.join(OUT, f"14_card_{card}.png"), (1400, 800))
    print("PREVIEWS_OK", OUT)
