"""The Altair 8800's front panel, built from params.

Run headless:
  Blender --background --factory-startup --python build_front_panel.py -- [--out PATH] [--blend PATH]

Builds, in the machine frame (mm; the panel faces -Y):
  case.bottom           the blue bezel: the front frame and a short return     (static)
  panel.dress           the lettered dress panel                               (static)
  panel.name_plate      the brushed name plate                                 (static)
  panel.assembly        sub-panel, switch bodies, bushings and nuts, LED leads,
                        the Display/Control board and its regulator           (static)
  panel.switch.<id>     a switch's bat, 25 of them      (rotate about -X: + is up)
  panel.lamp.<id>       an LED, 36 of them              (lamp: lit by the page)
Ids are the simulator's (js/panel-front.js), with "-" as "_".
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
from lib import bl, geom, params  # noqa: E402
from lib.bl import MeshBuilder  # noqa: E402
from lib.layout import CONTROL_LABELS, LAMP_IDS, MOMENTARY, SWITCH_IDS, Layout, lamp_label, node_id  # noqa: E402

DEFAULT_OUT = os.path.join(params.MACHINE_DIR, "blender", "out", "front-panel.glb")
TITLE_SVG = os.path.join(params.MACHINE_DIR, "blender", "data", "front-panel-title.svg")
IN = 25.4
CAP = 0.72          # cap height as a share of the font size (Blender's default face)


def text(mb, s, x, z, cap_mm, y, mat="ink_white", align="CENTER", bold=0.0):
    """Flat lettering facing the front (-Y), centred (or left-aligned) at (x, z)."""
    verts, faces = bl.glyph_mesh_flat(s, cap_mm / CAP, align, bold)
    mtx = bl.frame_matrix((x, y, z), (1, 0, 0), (0, 0, 1))
    mb.add_mesh_data(verts, faces, mtx, mat)


def strip(mb, x0, x1, z0, z1, y, mat="ink_white"):
    """A thin printed line on the panel face (a flat rectangle facing -Y)."""
    base = len(mb.verts)
    mi = mb._mat(mat)
    for x, z in ((x0, z0), (x1, z0), (x1, z1), (x0, z1)):
        mb.verts.append((x, y, z))
    mb._add([base, base + 1, base + 2, base + 3], mi, False)


def dashed(mb, x, z_top, z_bottom, y, dash=0.08 * IN, gap=0.07 * IN, width=0.45):
    z = z_top
    while z - dash > z_bottom:
        strip(mb, x - width / 2, x + width / 2, z - dash, z, y)
        z -= dash + gap


def build(p):
    bl.reset_scene()
    col = bpy.context.scene.collection
    root = bl.empty("altair_front_panel", col)
    build_panel(p, col, root)
    root["machine"] = "altair-8800"
    root["build"] = "front panel"
    root["params_version"] = p.raw.get("version", "")
    return root


def build_panel(p, col, root, chassis=None, bezel_mb=None):
    """The front panel and the bezel. Shared by every build that includes it.

    The bezel, the dress panel and its name plate go under root; the panel's assembly, bats
    and lamps under chassis (root when None). With bezel_mb, the bezel's geometry is added to
    that MeshBuilder (the whole box builds it into the case bottom) instead of a node of its own;
    the name plate then rides on the dress panel, which comes out of the box with it."""
    L = Layout(p)
    ow, oh, zc = L.ow, L.oh, L.zc
    holder = chassis if chassis is not None else root

    # ------------------------------------------------------------------ bezel (static)
    mb = bezel_mb if bezel_mb is not None else MeshBuilder()
    W, H, lip = L.W, L.H, L.lip
    yf = L.y_front
    # the front face: a narrow frame all round
    f = L.face
    for r in (geom.rect(-W / 2, 0, W / 2, f), geom.rect(-W / 2, H - f, W / 2, H),
              geom.rect(-W / 2, f, -W / 2 + f, H - f), geom.rect(W / 2 - f, f, W / 2, H - f)):
        mb.prism(r, "XZ", yf, yf + lip, "bezel_blue")
    # its inner walls, back to the dress panel, which sits one recess deep with nothing in front of it
    xi, zi0, zi1 = W / 2 - f, f, H - f
    yr = yf + L.recess
    for r in (geom.rect(-xi - lip, zi0 - lip, xi + lip, zi0), geom.rect(-xi - lip, zi1, xi + lip, zi1 + lip),
              geom.rect(-xi - lip, zi0, -xi, zi1), geom.rect(xi, zi0, xi + lip, zi1)):
        mb.prism(r, "XZ", yf + lip, L.y_dress_back + L.gap + lip, "bezel_blue")
    # a flange behind the dress panel's edge, closing the gap between the panel and the walls
    xb, zb0, zb1 = L.dw / 2 - 1.5, zc - L.dh / 2 + 1.5, zc + L.dh / 2 - 1.5
    for r in (geom.rect(-xi, zi0, xi, zb0), geom.rect(-xi, zb1, xi, zi1),
              geom.rect(-xi, zb0, -xb, zb1), geom.rect(xb, zb0, xi, zb1)):
        mb.prism(r, "XZ", L.y_dress_back + L.gap, L.y_dress_back + L.gap + lip, "bezel_blue")
    ret = p.v("bezel.return_depth")
    for r in (geom.rect(-W / 2, 0, W / 2, lip), geom.rect(-W / 2, H - lip, W / 2, H)):
        mb.prism(r, "XZ", yf + lip, yf + ret, "bezel_blue")
    for r in (geom.rect(-W / 2, lip, -W / 2 + lip, H - lip), geom.rect(W / 2 - lip, lip, W / 2, H - lip)):
        mb.prism(r, "XZ", yf + lip, yf + ret, "bezel_blue")
    if bezel_mb is None:
        bezel = mb.build("case.bottom", col)
        bl.set_labels(bezel, "Case bottom and bezel (Optima enclosure)")
        bezel["motion"] = "static"
        bl.parent(bezel, root)

    # ------------------------------------------------------------------ dress panel (static)
    dw, dh = L.dw, L.dh
    nut_r = L.nut_circumradius()
    holes = [(*L.lamp(i), p.v("dress_panel.led_hole_diameter") / 2) for i in LAMP_IDS]
    holes += [(*L.switch(s), nut_r + p.v("dress_panel.switch_hole_clearance")) for s in SWITCH_IDS]
    plate = MeshBuilder()
    plate.prism(geom.rect(-dw / 2, zc - dh / 2, dw / 2, zc + dh / 2), "XZ", L.y_dress_front, L.y_dress_back, "panel_charcoal")
    verts, faces = bl.cut_holes(plate, holes, "XZ", L.y_dress_front, L.y_dress_back, col)
    mb = MeshBuilder()
    mb.add_mesh_data(verts, faces, bl.Matrix.Identity(4), "panel_charcoal")
    ink = L.y_dress_front - 0.03
    cap = p.v("lettering.lamp_label_size")
    above_lamp = p.v("lettering.lamp_label_above")
    for i in LAMP_IDS:
        x, z = L.lamp(i)
        text(mb, lamp_label(i), x, z + above_lamp, cap, ink)
    above_sw = p.v("lettering.switch_label_above")
    for k in range(16):
        x, z = L.switch(f"s{k}")
        text(mb, str(k), x, z + above_sw, cap, ink)
    above_ctl = p.v("lettering.control_label_above")
    below_ctl = p.v("lettering.control_label_below")
    line_gap = cap * 1.55
    for s, (upper, lower) in CONTROL_LABELS.items():
        x, z = L.switch(s)
        if upper:
            for n, line in enumerate(reversed(upper)):       # the line nearest the switch first
                text(mb, line, x, z + above_ctl + n * line_gap, cap, ink)
        if lower:
            for n, line in enumerate(lower):
                text(mb, line, x, z - below_ctl - n * line_gap, cap, ink)
    w = 0.45
    # STATUS: a line under MEMR … INT, the word under its middle
    (x_memr, z1), (x_int, _) = L.lamp("memr"), L.lamp("int")
    zs = z1 - 0.2 * IN
    strip(mb, x_memr - 0.2 * IN, x_int + 0.2 * IN, zs - w / 2, zs + w / 2, ink)
    text(mb, "STATUS", (x_memr + x_int) / 2, zs - 0.12 * IN, cap, ink)   # its caps 1.5 mm under the line
    # dashed lines: data lamps down to the address lamps, address lamps down to their switches
    for k in range(8):
        x, z_d = L.lamp(f"d{k}")
        _, z_a = L.lamp(f"a{k}")
        dashed(mb, x, z_d - 0.2 * IN, z_a + above_lamp + cap, ink)
    for k in range(16):
        x, z_a = L.lamp(f"a{k}")
        _, z_s = L.switch(f"s{k}")
        dashed(mb, x, z_a - 0.2 * IN, z_s + above_sw + cap, ink)
    # SENSE SW.: the words, then a line along the upper eight switches' numbers
    x15, z_s = L.switch("s15")
    z_line = z_s + above_sw
    text(mb, "SENSE SW.", x15 - 1.2 * IN, z_line, cap, ink)
    xs = [x15 - 0.85 * IN] + [L.switch(f"s{k}")[0] for k in range(15, 7, -1)]
    for a, b in zip(xs, xs[1:]):
        strip(mb, a + 0.13 * IN, b - 0.13 * IN, z_line - w / 2, z_line + w / 2, ink)
    # group bars under the switches: 15 | 14-12 | 11-9 | 8-6 | 5-3 | 2-0; the data byte doubled
    z_bar = z_s - p.v("lettering.group_bar_below")
    groups = [[15], [14, 13, 12], [11, 10, 9], [8, 7, 6], [5, 4, 3], [2, 1, 0]]
    for g in groups:
        xa, xb = L.switch(f"s{g[0]}")[0] - 0.22 * IN, L.switch(f"s{g[-1]}")[0] + 0.22 * IN
        strip(mb, xa, xb, z_bar - w / 2, z_bar + w / 2, ink)
        if g[0] <= 7 or g == [8, 7, 6]:
            strip(mb, xa, xb, z_bar - 0.06 * IN - w / 2, z_bar - 0.06 * IN + w / 2, ink)
    x0 = L.switch("s0")[0]
    for dz in (0.0, -0.06 * IN):
        strip(mb, x0 + 0.22 * IN, x0 + 1.25 * IN, z_bar + dz - w / 2, z_bar + dz + w / 2, ink)
    text(mb, "Data", x0 + 0.55 * IN, z_bar + 0.11 * IN, cap, ink)
    text(mb, "Address", x0 + 0.6 * IN, z_bar - 0.17 * IN, cap, ink)
    dress = mb.build("panel.dress", col)
    bl.set_labels(dress, "Dress panel (painted, lettered)")
    dress["motion"] = "static"
    bl.parent(dress, root)
    if bezel_mb is not None:
        dress["label_en"] = "Dress panel (painted, lettered): it falls free once the chassis is out"

    # ------------------------------------------------------------------ name plate (static)
    ph, pt = p.v("name_plate.height"), p.v("name_plate.thickness")
    z0 = zc - L.dh / 2
    mb = MeshBuilder()
    g = L.gap   # the plate runs the dress panel's width along its bottom edge, short of its edges
    mb.prism(geom.rect(-L.dw / 2 + g, z0 + g, L.dw / 2 - g, z0 + ph), "XZ", L.y_dress_front - pt - g, L.y_dress_front - g, "aluminium_brushed")
    yt = L.y_dress_front - pt - g - 0.05   # just in front of the plate's face
    zt = z0 + ph / 2
    # the logo and the title, from the simulator's own SVG (its 2D panel shows the same); the
    # letters' caps (SVG y 4.89-47.79) are plate_text_size high, ALTAIR's left edge where the photo has it
    s = p.v("lettering.plate_text_size") / (47.79 - 4.89)
    for verts, faces, rgb in bl.svg_flat(TITLE_SVG):
        mat = "ink_blue" if rgb[2] > 0.5 else "ink_black"
        pts = [(-ow / 2 + 2.15 * IN + (u - 95.18) * s, yt, zt - (w - 26.34) * s) for u, w in verts]
        mb.add_mesh_data(pts, faces, bl.Matrix.Identity(4), mat)
    name_plate = mb.build("panel.name_plate", col)
    bl.set_labels(name_plate, "Name plate")
    name_plate["motion"] = "static"
    bl.parent(name_plate, dress if bezel_mb is not None else root)

    # ------------------------------------------------------------------ the assembly behind the panel (static)
    mb = MeshBuilder()
    sw, sh = p.v("sub_panel.size")
    sub = MeshBuilder()
    sub.prism(geom.rect(-sw / 2, zc - sh / 2, sw / 2, zc + sh / 2), "XZ", L.y_sub_front, L.y_sub_back, "aluminium_anodised")
    b_r = p.v("switch.bushing_diameter") / 2
    led_r = p.v("led.diameter") / 2
    sub_holes = [(*L.lamp(i), led_r + 0.1) for i in LAMP_IDS] + [(*L.switch(s), b_r + 0.3) for s in SWITCH_IDS]
    verts, faces = bl.cut_holes(sub, sub_holes, "XZ", L.y_sub_front, L.y_sub_back, col)
    mb.add_mesh_data(verts, faces, bl.Matrix.Identity(4), "aluminium_anodised")

    bw, bd, bh = p.v("switch.body")
    bore = p.v("switch.bushing_bore") / 2
    for s in SWITCH_IDS:
        x, z = L.switch(s)
        mb.prism(geom.rect(x - bw / 2, z - bh / 2, x + bw / 2, z + bh / 2), "XZ", L.y_sub_back, L.y_sub_back + bd, "switch_body")
        mb.tube(b_r, bore, 24, "XZ", L.bushing_front, L.y_sub_back, "chrome", offset=(x, 0, z))
        # the hex nut on the bushing, lying in the dress panel's hole (as thick as the panel)
        mb.tube(nut_r, b_r, 6, "XZ", L.y_dress_front, L.y_sub_front, "chrome", offset=(x, 0, z))
        for k in (-1, 0, 1):   # three pins into the board
            px = x + k * 0.1 * IN
            mb.prism(geom.rect(px - 0.4, z - 0.4, px + 0.4, z + 0.4), "XZ", L.y_sub_back + bd, L.y_board_back + 1.0, "tin")
    led_len = p.v("led.body_length")
    y_led_back = L.y_led_front + led_len + 1.0       # behind the LED's flange
    for i in LAMP_IDS:
        x, z = L.lamp(i)
        for k in (-1, 1):      # two leads to the board
            lx = x + k * 1.27
            mb.prism(geom.rect(lx - 0.25, z - 0.25, lx + 0.25, z + 0.25), "XZ", y_led_back, L.y_board_back + 1.0, "tin")
    blen, bhgt = p.v("dc_board.length"), p.v("dc_board.height")
    mb.prism(geom.rect(-blen / 2, zc - bhgt / 2, blen / 2, zc + bhgt / 2), "XZ", L.y_board_front, L.y_board_back, "pcb_green")
    # the board's 7805 regulator on its finned heat sink, at the left end (MITS-ASM-1975)
    rx, rz = -blen / 2 + 22.0, zc + bhgt / 2 - 30.0
    yb = L.y_board_back
    mb.prism(geom.rect(rx - 12.5, rz - 14.0, rx + 12.5, rz + 14.0), "XZ", yb, yb + 3.0, "heat_sink")
    for k in range(6):
        fx = rx - 11.0 + k * 4.4
        mb.prism(geom.rect(fx - 0.8, rz - 14.0, fx + 0.8, rz + 14.0), "XZ", yb + 3.0, yb + 16.0, "heat_sink")
    mb.prism(geom.rect(rx - 5.0, rz - 7.5, rx + 5.0, rz + 7.5), "XZ", yb + 3.0, yb + 7.5, "ic_black")
    assembly = mb.build("panel.assembly", col)
    bl.set_labels(assembly, "Front panel: sub-panel, switches and the Display/Control board")
    assembly["motion"] = "static"
    bl.parent(assembly, holder)

    # ------------------------------------------------------------------ switch bats (rotate)
    blen_bat = p.v("switch.bat_length")
    r0, r1 = p.v("switch.bat_radius")
    throw = p.v("switch.throw")
    profile = []                                         # pivot ball, slender shank, round head; along -Y
    for k in range(7):
        a = math.pi / 2 * (1 - k / 6)                    # 90° .. 0°: the back of the pivot ball
        profile.append((r0 * math.cos(a), r0 * math.sin(a)))
    profile.append((r0, -0.45 * blen_bat))               # the shank stays slender through the bushing,
    profile.append((0.85 * r1, -(blen_bat - 2.2 * r1)))  # then swells into the head
    profile.append((r1, -(blen_bat - r1)))
    for k in range(1, 7):
        a = math.pi / 2 * k / 6                          # 0 .. 90°: the rounded tip
        profile.append((r1 * math.cos(a), -(blen_bat - r1) - r1 * math.sin(a)))
    labels = {"off-on": "Power switch (OFF / ON)", "stop-run": "STOP / RUN", "single": "SINGLE STEP",
              "examine": "EXAMINE / EXAMINE NEXT", "deposit": "DEPOSIT / DEPOSIT NEXT", "reset": "RESET / CLR",
              "protect": "PROTECT / UNPROTECT", "aux1": "AUX (spare)", "aux2": "AUX (spare)"}
    for s in SWITCH_IDS:
        x, z = L.switch(s)
        mb = MeshBuilder()
        mb.lathe(profile, 20, "chrome")
        bat = mb.build(f"panel.switch.{node_id(s)}", col, (x, L.y_pivot, z))
        label = labels.get(s, f"Address / data switch {s[1:]}")
        bl.set_motion(bat, "rotate", (-1, 0, 0), label)
        bat["switch_id"] = s
        bat["kind"] = "momentary" if s in MOMENTARY else "latching"
        bat["throw_deg"] = throw
        bl.set_anchors(bat, "tip", [(0.0, -blen_bat, 0.0)])
        bl.parent(bat, holder)

    # ------------------------------------------------------------------ LEDs (lamps)
    dome = []
    for k in range(7):
        a = math.pi / 2 * k / 6
        dome.append((led_r * math.sin(a), -led_r * math.cos(a)))      # tip (front) to the rim
    lamp_profile = [(0.0, -led_r)] + dome[1:] + [(led_r, led_len - led_r), (led_r + 0.4, led_len - led_r),
                                                 (led_r + 0.4, led_len - led_r + 1.0), (0.0, led_len - led_r + 1.0)]
    for i in LAMP_IDS:
        x, z = L.lamp(i)
        mb = MeshBuilder()
        mb.lathe(list(reversed(lamp_profile)), 24, "led_red")
        lamp = mb.build(f"panel.lamp.{i}", col, (x, L.y_led_front + led_r, z))
        lamp["motion"] = "lamp"
        lamp["lamp_id"] = i
        bl.set_labels(lamp, f"{lamp_label(i)} lamp")
        bl.set_anchors(lamp, "front", [(0.0, -led_r, 0.0)])
        bl.parent(lamp, holder)


def export(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_yup=True,
        export_extras=True,
        export_apply=True,
        export_cameras=False,
        export_lights=False,
        **bl.EXPORT_IMAGES,
    )


def _args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out, blend = DEFAULT_OUT, None
    for i, a in enumerate(argv):
        if a == "--out":
            out = argv[i + 1]
        if a == "--blend":
            blend = argv[i + 1]
    return out, blend


if __name__ == "__main__":
    out, blend = _args()
    build(params.load())
    export(out)
    if blend:
        bpy.ops.wm.save_as_mainfile(filepath=blend)
    tris = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
    print(f"FRONT_PANEL_BUILD_OK out={out} objects={len(bpy.data.objects)} triangles~{tris}")
