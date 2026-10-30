"""Workbench preview renders of the whole box, closed and taken apart.

  Blender --background --factory-startup --python render_whole_box_previews.py
Writes PNGs to blender/out/previews/ (git-ignored).
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import build_whole_box  # noqa: E402
from lib import params  # noqa: E402
from lib.bl import MM  # noqa: E402
from render_front_panel_previews import OUT, camera, render, setup_render  # noqa: E402


def move(obj, moves, fraction=1.0):
    """Move a unit along its way out (moves in mm), by a fraction of the whole path."""
    total = sum(sum(abs(c) for c in m) for m in moves)
    left = fraction * total
    x = y = z = 0.0
    for dx, dy, dz in moves:
        seg = abs(dx) + abs(dy) + abs(dz)
        f = min(1.0, left / seg) if seg else 0.0
        x, y, z = x + f * dx, y + f * dy, z + f * dz
        left -= f * seg
        if left <= 0:
            break
    obj.location = (obj.location[0] + x * MM, obj.location[1] + y * MM, obj.location[2] + z * MM)


if __name__ == "__main__":
    p = params.load()
    build_whole_box.build(p)
    paths = p.v("paths")
    setup_render((1600, 1000))
    os.makedirs(OUT, exist_ok=True)
    objs = {o.name: o for o in bpy.data.objects}
    for card in ("mem4k_0", "mem4k_1"):
        objs[f"card.{card}"].hide_render = True
    render(camera("m2_closed", (-560, -760, 420), (0, 0, 70), 35), os.path.join(OUT, "21_m2_closed.png"), (1600, 1000))
    render(camera("m2_rear", (520, 820, 380), (0, 0, 80), 35), os.path.join(OUT, "22_m2_rear.png"), (1600, 1000))
    move(objs["case.top"], paths["case.top"])
    render(camera("m2_open", (-480, -620, 640), (0, 0, 60), 35), os.path.join(OUT, "23_m2_lid_off.png"), (1600, 1000))
    top = camera("m2_top", (0, 0, 1400), (0, 1, 0), 30)
    render(top, os.path.join(OUT, "24_m2_top.png"), (1200, 1250))
    move(objs["chassis.frame"], paths["chassis.frame"], 0.5)
    render(camera("m2_half_out", (700, 300, 520), (0, 150, 60), 35), os.path.join(OUT, "25_m2_chassis_half_out.png"), (1600, 1000))
    print("PREVIEWS_OK", OUT)
