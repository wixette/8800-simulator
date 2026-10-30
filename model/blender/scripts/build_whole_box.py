"""The whole box, built from params, with the front panel and the card cage.

Run headless (npm run build:model):
  Blender --background --factory-startup --python build_whole_box.py -- [--out PATH] [--blend PATH]

Builds, in the machine frame (mm), with each unit's way out in its extras (docs/3d-model.md):
  case.bottom          the blue tray, its walls and the bezel                     (static)
  case.top             the grey lid, louvred, with its rear flange                (path)
  panel.dress          the lettered dress panel, with panel.name_plate on it      (path)
  chassis.frame        side members, back panel, cross member                     (path)
    panel.*            the front panel
    chassis.card_rail.*, bus.board.*, slot.*, card.*   the card cage
    psu.t1/t2/t3, psu.board, psu.terminal_block, psu.fan   the power supply      (path)
    harness.panel_bus, harness.panel_data              the wiring                 (static)
    harness.data_plug                                   the data cable's plug      (path)
"""

import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
import build_front_panel  # noqa: E402
import build_card_cage as cage  # noqa: E402
from lib import bl, geom, params  # noqa: E402
from lib.bl import MeshBuilder  # noqa: E402
from lib.layout import Layout  # noqa: E402

DEFAULT_OUT = os.path.join(params.MACHINE_DIR, "altair-8800.glb")
IN = 25.4


class Box:
    """The box's numbers (mm), from params."""

    def __init__(self, p):
        self.p = p
        L = Layout(p)
        self.L = L
        self.W, self.D, self.H = L.W, L.D, L.H
        self.t = p.v("case.sheet")
        self.front, self.back = -self.D / 2, self.D / 2
        self.tray_wall = p.v("case.tray_wall_height")
        self.skirt = p.v("case.lid_skirt_bottom")
        # the lid's skirts are the box's outer faces; the tray's walls stand just inside them
        self.lid_x = self.W / 2
        self.tray_x = self.W / 2 - self.t - 0.3
        self.lid_front = self.front + p.v("bezel.return_depth") + p.v("case.lid_front_gap")
        self.floor = self.t
        self.ch_bottom = self.floor + p.v("case.chassis_lift")
        self.mt = p.v("chassis.metal")
        self.ch_x = p.v("chassis.width") / 2                  # the webs' outer faces
        self.back_out = p.v("chassis.back_panel_y")           # the back panel's outer face
        self.back_in = self.back_out - self.mt
        self.cross_front = p.v("chassis.cross_member")["front_y"]
        self.cross_top = p.v("chassis.cross_member")["top_z"]


def build_case_bottom(p, col, root, b):
    mb = MeshBuilder()
    t = b.t
    # the floor, and the side walls inside the lid's skirts
    mb.prism(geom.rect(-b.W / 2, b.front, b.W / 2, b.back), "XY", 0.0, t, "bezel_blue")
    for sx in (-1, 1):
        x0, x1 = sorted((sx * b.tray_x, sx * (b.tray_x - t)))
        mb.prism(geom.rect(x0, b.front + p.v("bezel.return_depth"), x1, b.back), "XY", t, b.tray_wall, "bezel_blue")
    return mb   # the bezel is added by build_panel, then the node is built


def build_lid(p, col, root, b):
    t = b.t
    lv = p.v("case.louvres")
    mb = MeshBuilder()
    mb.prism(geom.rect(-b.lid_x, b.lid_front, b.lid_x, b.back_out + 0.3 + t), "XY", b.H - t, b.H, "case_grey")
    slots = [geom.rect(lv["first_y"] + k * lv["pitch"], lv["z"][0], lv["first_y"] + k * lv["pitch"] + lv["width"], lv["z"][1]) for k in range(lv["count"])]
    for sx in (-1, 1):
        skirt = MeshBuilder()
        x0, x1 = sorted((sx * b.lid_x, sx * (b.lid_x - t)))
        skirt.prism(geom.rect(b.lid_front, b.skirt, b.back_out + 0.3 + t, b.H - t), "YZ", x0, x1, "case_grey")
        verts, faces = bl.cut_holes(skirt, [], "YZ", x0, x1, col, polys=slots)
        mb.add_mesh_data(verts, faces, bl.Matrix.Identity(4), "case_grey")
    # the rear flange, down behind the back panel, where its two screws go
    y0 = b.back_out + 0.3
    mb.prism(geom.rect(-b.lid_x + t, b.H - p.v("case.lid_flange"), b.lid_x - t, b.H - t), "XZ", y0, y0 + t, "case_grey")
    lid = mb.build("case.top", col)
    bl.set_labels(lid, "Case top (the lid), louvred: comes off backwards, then up")
    finish_unit(p, lid, "case.top")
    bl.parent(lid, root)
    return lid


def build_chassis(p, col, root, b):
    mb = MeshBuilder()
    mt, h = b.mt, p.v("chassis.web_height")
    y0, y1 = b.L.y_sub_back + 3.87, b.back_in               # from behind the sub-panel to the back panel
    holes = p.v("chassis.holes")
    flange = p.v("chassis.flange")
    for sx in (-1, 1):
        x0, x1 = sorted((sx * b.ch_x, sx * (b.ch_x - mt)))
        mb.prism(geom.rect(y0, b.ch_bottom, y1, b.ch_bottom + h), "YZ", x0, x1, "aluminium_anodised")
        f = MeshBuilder()
        fx0, fx1 = sorted((sx * (b.ch_x - mt), sx * (b.ch_x - flange)))
        f.prism(geom.rect(fx0, y0, fx1, y1), "XY", b.ch_bottom, b.ch_bottom + mt, "aluminium_anodised")
        hx = sx * (b.ch_x - holes["inset"])
        hs = [(hx, b.back_in - holes["first_from_back"] - k * holes["pitch"], holes["diameter"] / 2) for k in range(holes["count"])]
        verts, faces = bl.cut_holes(f, hs, "XY", b.ch_bottom, b.ch_bottom + mt, col, segments=12)
        mb.add_mesh_data(verts, faces, bl.Matrix.Identity(4), "aluminium_anodised")
    # the back panel: the fan opening, eight DB-25 openings, the cord's hole
    bw, bh = p.v("chassis.back_panel")
    fan = p.v("chassis.fan_hole")
    cord = p.v("chassis.cord_hole")
    back = MeshBuilder()
    back.prism(geom.rect(-bw / 2, b.ch_bottom, bw / 2, b.ch_bottom + bh), "XZ", b.back_in, b.back_out, "aluminium_anodised")
    cw, chh = p.v("chassis.io_cutout_size")
    cutouts = [geom.rect(c["x"] - cw / 2, c["z"] - chh / 2, c["x"] + cw / 2, c["z"] + chh / 2) for c in p.v("chassis.io_cutouts")]
    holes = [(fan["x"], fan["z"], fan["diameter"] / 2), (cord["x"], cord["z"], cord["diameter"] / 2)]
    verts, faces = bl.cut_holes(back, holes, "XZ", b.back_in, b.back_out, col, polys=cutouts)
    mb.add_mesh_data(verts, faces, bl.Matrix.Identity(4), "aluminium_anodised")
    # the mesh screens on the panel's inside: a square one over the fan opening, one behind the DB-25s
    s = p.v("chassis.fan_screen") / 2
    mb.prism(geom.rect(fan["x"] - s, fan["z"] - s, fan["x"] + s, fan["z"] + s), "XZ", b.back_in - 0.6, b.back_in - 0.1, "screen")
    io = p.v("chassis.io_screen")
    mb.prism(geom.rect(io["x"][0], io["z"][0], io["x"][1], io["z"][1]), "XZ", b.back_in - 0.6, b.back_in - 0.1, "screen")
    # the power cord in its grommet, and a short piece of it outside, down to the table
    r_cord = p.v("harness.power_cord_diameter") / 2
    r_hole = cord["diameter"] / 2
    mb.tube(r_hole, r_cord + 0.1, 16, "XZ", b.back_in - 1.0, b.back_out + 1.0, "cord_black", offset=(cord["x"], 0, cord["z"]))
    for y0g, y1g in ((b.back_in - 1.0, b.back_in), (b.back_out, b.back_out + 1.0)):
        mb.tube(r_hole + 1.5, r_hole, 16, "XZ", y0g, y1g, "cord_black", offset=(cord["x"], 0, cord["z"]))
    cx_, cz_ = cord["x"], cord["z"]
    bl.tube_path(mb, [(cx_, b.back_in - 12.0, cz_), (cx_, b.back_out + 40.0, cz_), (cx_, b.back_out + 70.0, r_cord + 2.0),
                      (cx_, b.back_out + 160.0, r_cord + 0.5)], r_cord, "cord_black", bend=30.0)
    # the cross member: a shelf from its front lip back to the back panel
    cx = b.ch_x - mt - 0.1
    mb.prism(geom.rect(-cx, b.cross_front, cx, b.back_in - 0.1), "XY", b.cross_top - mt, b.cross_top, "aluminium_anodised")
    mb.prism(geom.rect(-cx, b.ch_bottom + mt + 0.1, cx, b.cross_top - mt), "XZ", b.cross_front, b.cross_front + mt, "aluminium_anodised")
    ch = mb.build("chassis.frame", col)
    bl.set_labels(ch, "Chassis: side members, back panel and cross member; slides out to the rear with everything on it")
    finish_unit(p, ch, "chassis.frame")
    bl.parent(ch, root)
    return ch


def build_psu(p, col, chassis, b):
    gap = 0.1
    bi = b.back_in - gap
    ct = b.cross_top + gap

    def rounded(u0, w0, u1, w1, r, n=6):
        """A rectangle with rounded corners, counter-clockwise."""
        pts = []
        for cu, cw, a0 in ((u1 - r, w0 + r, -90), (u1 - r, w1 - r, 0), (u0 + r, w1 - r, 90), (u0 + r, w0 + r, 180)):
            for k in range(n + 1):
                a = math.radians(a0 + 90 * k / n)
                pts.append((cu + r * math.cos(a), cw + r * math.sin(a)))
        return pts

    def transformer(name, label, x, z0, size, axis):
        """A black lamination stack with its bronze coil running through it and bulging out of
        both sides, up and down (axis "z": T1, T2) or left and right ("x": T3), as in SN #09."""
        w, d, h = size
        mb = MeshBuilder()
        yc, half_y = bi - d / 2, 0.31 * d                 # the coil keeps clear of the back panel
        if axis == "z":
            mb.prism(geom.rect(x - w / 2, bi - d, x + w / 2, bi), "XY", z0 + 0.225 * h, z0 + 0.775 * h, "laminations")
            r = min(0.2 * h, 0.9 * half_y)
            mb.prism(rounded(yc - half_y, z0, yc + half_y, z0 + h, r), "YZ", x - 0.4 * w, x + 0.4 * w, "coil_wrap", smooth=True)
        else:
            mb.prism(geom.rect(x - 0.275 * w, bi - d, x + 0.275 * w, bi), "XY", z0, z0 + h, "laminations")
            r = min(0.2 * w, 0.9 * half_y)
            mb.prism(rounded(x - w / 2, yc - half_y, x + w / 2, yc + half_y, r), "XY", z0 + 0.1 * h, z0 + 0.9 * h, "coil_wrap", smooth=True)
        o = mb.build(name, col)
        bl.set_labels(o, label)
        finish_unit(p, o, name)
        bl.parent(o, chassis)

    t1, t2, t3 = p.v("psu.t1"), p.v("psu.t2"), p.v("psu.t3")
    transformer("psu.t1", "Transformer T1: 7.5 V at 8 A, for the bus's +8 V", t1["x"], ct, t1["size"], "z")
    transformer("psu.t2", "Transformer T2: +8 V for the front panel, and +16 V", t2["x"], t2["top_z"] - t2["size"][2], t2["size"], "z")
    transformer("psu.t3", "Transformer T3: 11 V, for -16 V", t3["x"], t3["z"] - t3["size"][2] / 2, t3["size"], "x")

    pb = p.v("psu.board")
    (x0, x1), (y0, y1) = pb["x"], pb["y"]
    z0 = b.cross_top + pb["spacer"]
    mb = MeshBuilder()
    mb.prism(geom.rect(x0, y0, x1, y1), "XY", z0, z0 + 1.6, "pcb_green")
    for sx, sy in ((x0 + 6, y0 + 6), (x1 - 6, y0 + 6), (x0 + 6, y1 - 6), (x1 - 6, y1 - 6)):
        mb.prism([(sx + u, sy + w) for u, w in geom.circle(3.0, 12)], "XY", ct, z0, "tin", smooth=True)
    top = z0 + 1.6
    yc = y1 - 42.0                                       # the capacitors lie front to back, ahead of the back panel (SN #10)
    # from the fuse's end: six black 3300 uF, the bronze 2200 uF, the thin orange 500 uF; all axial,
    # all as long, side by side with no gap between them (0.2 mm in the model)
    r_cap, pitch = 12.9, 26.0
    caps = [(x0 + 33 + k * pitch, r_cap, 20.0, "cap_black") for k in range(7)]
    caps[-1] = (caps[-1][0], r_cap, 20.0, "cap_bronze")
    caps.append((caps[-1][0] + r_cap + 0.2 + 4.5, 4.5, 20.0, "cap_orange"))
    for cx, r, half, mat in caps:
        mb.prism([(cx + u, top + 0.5 + r + w) for u, w in geom.circle(r, 20)], "XZ", yc - half, yc + half, mat, smooth=True)
    mb.prism(geom.rect(x0 + 6, yc - 16, x0 + 16, yc + 16), "XY", top, top + 7.0, "tin")   # the fuse in its clips
    mb.prism(geom.rect(-12.5, (y0 + y1) / 2 - 12.5, 12.5, (y0 + y1) / 2 + 12.5), "XY", ct + 1.0, z0 - 1.0, "ic_black")  # bridge, under
    o = mb.build("psu.board", col)
    bl.set_labels(o, "Power supply board: rectifiers and filter capacitors (unregulated +8 V, +16 V, -16 V)")
    finish_unit(p, o, "psu.board")
    bl.parent(o, chassis)

    tb = p.v("psu.terminal_block")
    mb = MeshBuilder()
    (tx0, tx1), (tz0, tz1) = tb["x"], tb["z"]
    mb.prism(geom.rect(tx0, tz0, tx1, tz1), "XZ", bi - tb["depth"], bi, "ic_black")
    for row in (0, 1):
        for k in range(10):
            sx = tx0 + 10 + row * 20
            sz = tz0 + 5 + k * (tz1 - tz0 - 10) / 9
            mb.prism([(sx + u, sz + w) for u, w in geom.circle(2.6, 10)], "XZ", bi - tb["depth"] - 2.0, bi - tb["depth"], "tin", smooth=True)
    o = mb.build("psu.terminal_block", col)
    bl.set_labels(o, "Terminal block: every supply and bus power wire meets here")
    finish_unit(p, o, "psu.terminal_block")
    bl.parent(o, chassis)

    # the fan (the 88-FAN option): on the back panel's inside, over its screen, above the capacitors
    fan, hole = p.v("psu.fan"), p.v("chassis.fan_hole")
    s, dd = fan["size"], fan["depth"]
    fx, fz = hole["x"], hole["z"]
    yb, yf = b.back_in - 0.7, b.back_in - 0.7 - dd
    frame = MeshBuilder()
    frame.prism(geom.rect(fx - s / 2, fz - s / 2, fx + s / 2, fz + s / 2), "XZ", yf, yb, "fan_metal")
    bore = 0.47 * s
    verts, faces = bl.cut_holes(frame, [(fx, fz, bore)], "XZ", yf, yb, col, segments=40)
    mb = MeshBuilder()
    mb.add_mesh_data(verts, faces, bl.Matrix.Identity(4), "fan_metal")
    hub = 0.17 * s
    ym = (yf + yb) / 2
    mb.prism([(fx + u, fz + w) for u, w in geom.circle(hub, 24)], "XZ", ym - 12.0, ym + 12.0, "fan_metal", smooth=True)
    for k in range(5):                                   # five blades, from the hub nearly to the bore
        a = 2 * math.pi * k / 5
        blade = []
        for rr, da in ((hub - 1.0, -0.22), (bore - 2.0, -0.38), (bore - 2.0, 0.30), (hub - 1.0, 0.22)):
            blade.append((fx + rr * math.cos(a + da), fz + rr * math.sin(a + da)))
        mb.prism(blade, "XZ", ym - 2.0, ym + 2.0, "fan_metal")
    o = mb.build("psu.fan", col)
    bl.set_labels(o, "Fan (the 88-FAN option): draws air out through the back panel's screen")
    finish_unit(p, o, "psu.fan")
    bl.parent(o, chassis)


def build_harness(p, col, chassis, b, c):
    L = b.L
    y_dc = L.y_board_back + 7.0
    bundle = p.v("harness.bundle_diameter") / 2
    mb = MeshBuilder()
    xr = c.board_right(0) + bundle + 1.0
    bl.tube_path(mb, [(195.0, y_dc, 120.0), (195.0, y_dc, 25.0), (xr, y_dc + 7.0, 25.0)], bundle, "wire_white")
    o = mb.build("harness.panel_bus", col)
    bl.set_labels(o, "Front panel harness: 62 wires from the panel's board to the bus, laced")
    o["motion"] = "static"
    bl.parent(o, chassis)

    # the CPU's Molex wafer, from cards.json; the plug sits on it, the cable comes down onto the plug
    with open(cage.CARDS_PATH, encoding="utf-8") as f:
        cpu = json.load(f)["cards"]["cpu"]["parts"]
    wafer = next(q for q in cpu if q["kind"] == "connector")
    x_slot = c.slot_x(0, 0)
    wl, ww = wafer.get("len", 1.0) * IN, wafer.get("wid", 0.3) * IN
    if wafer.get("rot", 0) in (90, 270):
        wl, ww = ww, wl
    wy = c.yc - c.body_len / 2 + wafer["u"] * IN
    wz = c.body_bottom + wafer["v"] * IN
    face = x_slot + c.card_t / 2 + wafer.get("height", 0.5) * IN + 0.2
    plug_len = 9.0
    cable = p.v("harness.cable_diameter") / 2
    top_z = wz + ww / 2 + 4.0
    mb = MeshBuilder()
    px = face + plug_len / 2
    bl.tube_path(mb, [(198.0, y_dc, 140.0), (198.0, y_dc, 168.0), (px, -150.0, 168.0), (px, wy, 168.0), (px, wy, top_z + 3.0)], cable, "wire_grey", bend=12.0)
    o = mb.build("harness.panel_data", col)
    bl.set_labels(o, "Data cable: D0-D7 from the front panel's board to the CPU card")
    o["motion"] = "static"
    bl.parent(o, chassis)

    mb = MeshBuilder()
    mb.prism(geom.rect(face, wy - wl / 2, face + plug_len, wy + wl / 2), "XY", wz - ww / 2, wz + ww / 2, "nylon_white")
    mb.prism([(px + u, wy + w) for u, w in geom.circle(cable, 10)], "XY", wz + ww / 2, top_z + 6.0, "wire_grey", smooth=True)
    o = mb.build("harness.data_plug", col)
    bl.set_labels(o, "The data cable's plug, on the CPU card's wafer: unplug it before pulling the CPU card")
    finish_unit(p, o, "harness.data_plug")
    bl.parent(o, chassis)


def finish_unit(p, obj, name):
    """A removable unit's extras: its path out and what must be out first."""
    bl.set_path(obj, p.v("paths")[name])
    obj["prereqs"] = ",".join(p.v("prereqs")[name])


def build(p):
    bl.reset_scene()
    col = bpy.context.scene.collection
    root = bl.empty("altair_8800", col)
    b = Box(p)
    bottom = build_case_bottom(p, col, root, b)
    chassis = build_chassis(p, col, root, b)
    build_front_panel.build_panel(p, col, root, chassis=chassis, bezel_mb=bottom)
    tray = bottom.build("case.bottom", col)
    bl.set_labels(tray, "Case bottom: the blue tray and its bezel (an Optima enclosure)")
    tray["motion"] = "static"
    bl.parent(tray, root)
    dress = bpy.data.objects["panel.dress"]
    finish_unit(p, dress, "panel.dress")
    build_lid(p, col, root, b)
    c = cage.Cage(p)
    layouts = {}
    if os.path.exists(cage.CARDS_PATH):
        with open(cage.CARDS_PATH, encoding="utf-8") as f:
            layouts = json.load(f).get("cards", {})
    cage.build_rails(p, col, chassis, c)
    for k in range(2):
        cage.build_board(p, col, chassis, c, k)
    for card in cage.CARDS:
        cage.build_card(p, col, chassis, c, card, layouts)
    build_psu(p, col, chassis, b)
    build_harness(p, col, chassis, b, c)
    root["machine"] = "altair-8800"
    root["build"] = "whole box"
    root["params_version"] = p.raw.get("version", "")
    return root


if __name__ == "__main__":
    out, blend = build_front_panel._args()
    if out == build_front_panel.DEFAULT_OUT:
        out = DEFAULT_OUT
    build(params.load())
    build_front_panel.export(out)
    if blend:
        bpy.ops.wm.save_as_mainfile(filepath=blend)
    tris = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in bpy.data.objects if o.type == "MESH")
    print(f"WHOLE_BOX_BUILD_OK out={out} objects={len(bpy.data.objects)} triangles~{tris}")
