"""Workbench preview renders of the front panel, and an orthographic front view for
a photo overlay (docs/3d-model.md, fidelity checks).

  Blender --background --factory-startup --python render_front_panel_previews.py
Writes PNGs to blender/out/previews/ (git-ignored).
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import build_front_panel  # noqa: E402
from lib import params  # noqa: E402
from lib.bl import MM  # noqa: E402
from lib.layout import Layout  # noqa: E402

OUT = os.path.join(params.MACHINE_DIR, "blender", "out", "previews")


def camera(name, loc_mm, target_mm, lens=50, ortho_mm=None):
    cam_data = bpy.data.cameras.new(name)
    cam_data.lens = lens
    cam_data.clip_start = 0.002
    if ortho_mm:
        cam_data.type = "ORTHO"
        cam_data.ortho_scale = ortho_mm * MM
    cam = bpy.data.objects.new(name, cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = Vector(loc_mm) * MM
    d = Vector(target_mm) - Vector(loc_mm)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return cam


def setup_render(res):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_WORKBENCH"
    sc.display.shading.light = "STUDIO"
    sc.display.shading.color_type = "MATERIAL"
    sc.display.shading.show_shadows = True
    sc.display.shading.show_cavity = True
    sc.render.resolution_x, sc.render.resolution_y = res
    world = bpy.data.worlds.new("w")
    world.color = (0.93, 0.93, 0.95)
    sc.world = world


def render(cam, path, res):
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.camera = cam
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def throw(sw, deg):
    sw.rotation_mode = "XYZ"
    sw.rotation_euler = (math.radians(-deg), 0.0, 0.0)  # + is up (the bat turns about -X)


if __name__ == "__main__":
    p = params.load()
    build_front_panel.build(p)
    L = Layout(p)
    setup_render((1600, 680))
    os.makedirs(OUT, exist_ok=True)
    # Front, orthographic: the frame is the box front (17.0 x 7.0 in), 1600 px wide.
    front = camera("front", (0, -1500, L.zc), (0, 0, L.zc), ortho_mm=L.W)
    render(front, os.path.join(OUT, "01_front_ortho.png"), (1600, round(1600 * L.H / L.W)))
    # Some switches thrown: A15, A7, A0 up; STOP up; RUN-side down on DEPOSIT.
    objs = {o.name: o for o in bpy.data.objects}
    for name in ("panel.switch.s15", "panel.switch.s7", "panel.switch.s0", "panel.switch.stop_run"):
        throw(objs[name], 16)
    for name in ("panel.switch.s14", "panel.switch.deposit", "panel.switch.off_on"):
        throw(objs[name], -16)
    three_q = camera("three_q", (330, -620, 330), (0, -200, 85), 40)
    render(three_q, os.path.join(OUT, "02_three_quarter.png"), (1600, 1000))
    close = camera("close", (90, -330, 120), (110, -222, 85), 60)
    render(close, os.path.join(OUT, "03_close_switches.png"), (1600, 1000))
    behind = camera("behind", (-260, 40, 260), (-60, -210, 90), 35)
    render(behind, os.path.join(OUT, "04_behind.png"), (1600, 1000))
    print("PREVIEWS_OK", OUT)
