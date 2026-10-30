"""The card cage, with the front panel, built from params.

Run headless:
  Blender --background --factory-startup --python build_card_cage.py -- [--out PATH] [--blend PATH]

Builds, besides the front panel (build_front_panel.build_panel), in the machine frame (mm):
  chassis.card_rail.0/1   the front and rear card rails                                (static)
  bus.board.0/1           88-EC expander boards with 4 connectors and 8 guides each    (static)
  slot.<card>             a carrier at the card's rest slot        (translate along +X: to another slot)
    card.<card>           the card, seated                         (translate along +Z: lifted out)
Cards: cpu, mem1k, mem4k_0, mem4k_1, sio, sio2 (docs/3d-model.md). Their parts come from
params/cards.json (measured on MITS's 1:1 artwork, or from photos); a card it does not
describe gets its outline, fingers and regulator only.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
import build_front_panel  # noqa: E402
from lib import bl, geom, params  # noqa: E402
from lib.bl import MeshBuilder  # noqa: E402

DEFAULT_OUT = os.path.join(params.MACHINE_DIR, "blender", "out", "card-cage.glb")
CARDS_PATH = os.path.join(params.MACHINE_DIR, "params", "cards.json")
IN = 25.4

CARDS = ["cpu", "mem1k", "mem4k_0", "mem4k_1", "sio", "sio2"]
# Where each card sits in the rest pose (js/sim/layout.js REST_SLOT): [board, slot].
REST_SLOT = {"cpu": (0, 0), "mem1k": (0, 1), "sio": (0, 2), "sio2": (0, 3), "mem4k_0": (1, 0), "mem4k_1": (1, 1)}
# Which layout in cards.json describes each card.
LAYOUT = {"cpu": "cpu", "mem1k": "mem1k", "mem4k_0": "mem4k", "mem4k_1": "mem4k", "sio": "sio", "sio2": "sio2"}
LABELS = {
    "cpu": "CPU card (8080)",
    "mem1k": "1K static memory card (256 bytes fitted)",
    "mem4k_0": "88-4MCS 4K static memory card",
    "mem4k_1": "88-4MCS 4K static memory card (second)",
    "sio": "88-SIO serial card",
    "sio2": "88-2SIO serial card",
}
ROLES = {"cpu": "cpu", "mem1k": "memory", "mem4k_0": "memory", "mem4k_1": "memory", "sio": "serial", "sio2": "serial"}
MATERIAL = {
    "dip": "ic_black", "socket": "ic_black", "regulator": "ic_black", "heat_sink": "heat_sink",
    "crystal": "tin", "connector": "nylon_white", "capacitor": "cap_body", "resistor": "resistor_tan",
    "transistor": "ic_black", "switch": "switch_body",
    "resistor_group": "resistor_tan", "capacitor_group": "cap_disc",
}
GROUP_HEIGHT = 0.1   # in: a row of small parts is shown as a low strip, not a block
SKIP = ("hole", "pad", "copper")   # holes and copper features: no body to show


class Cage:
    """The cage's numbers (mm), from params; the twin of js/sim/layout.js's cage part."""

    def __init__(self, p):
        self.p = p
        self.board_len, self.board_w = p.v("bus.board")
        self.board_t = p.v("bus.board_thickness")
        self.pitch = p.v("bus.slot_pitch")
        self.first = p.v("bus.first_slot_from_edge")
        self.gap = p.v("cage.board_gap")
        self.x_right = p.v("cage.board0_right_edge_x")
        self.yc = p.v("cage.board_centre_y")
        self.rail_top = p.v("cage.rail_top_z")
        self.board_bottom = self.rail_top + p.v("cage.tape")      # on tape, so no land touches a rail
        self.board_top = self.board_bottom + self.board_t
        self.body_len, self.body_h = p.v("card.body")
        self.tab_len, self.tab_d = p.v("card.tab")
        self.tab_from_front = p.v("card.tab_from_front")
        self.card_t = p.v("card.thickness")
        self.conn_len, self.conn_w, self.conn_h = p.v("bus.connector_body")
        self.slot_w, self.slot_d = p.v("bus.connector_slot")
        self.seat = p.v("cage.seat_depth")
        # the card, seated: its tab bottom is seat_depth into the slot
        self.tab_bottom = self.board_top + self.conn_h - self.seat
        self.body_bottom = self.tab_bottom + self.tab_d
        # the tab's centre along y; the connector sits under it
        self.card_front = self.yc - self.body_len / 2
        self.tab_yc = self.card_front + self.tab_from_front + self.tab_len / 2

    def board_right(self, b):
        return self.x_right - b * (self.board_w + self.gap)

    def slot_x(self, b, s):
        return self.board_right(b) - self.first - s * self.pitch


def build_rails(p, col, root, c):
    x0, x1 = p.v("cage.rail_span")
    rw, rh = p.v("cage.rail_section")
    half = p.v("cage.rail_spacing") / 2
    for i, y in enumerate((c.tab_yc - half, c.tab_yc + half)):   # under the connectors' mounting ears
        mb = MeshBuilder()
        mb.prism(geom.rect(x0, c.rail_top - rh, x1, c.rail_top), "XZ", y - rw / 2, y + rw / 2, "aluminium_anodised")
        rail = mb.build(f"chassis.card_rail.{i}", col)
        bl.set_labels(rail, f"Card rail ({'front' if i == 0 else 'rear'})")
        rail["motion"] = "static"
        bl.parent(rail, root)


def add_guide(mb, c, x, sign):
    """A card guide at slot x, the front one (sign -1) or the rear (+1): a post with a channel
    for the card's edge, tapering toward the top (VCCA-GUIDE: 16.75 mm deep at the base,
    7.5 mm at the top). The channel's floor stays put; the cheeks either side of it reach
    less far along the card as they rise, which is what leaves room for the regulators'
    heat sinks at the cards' top corners."""
    gw, gd, gh = c.p.v("bus.guide")
    ch = c.p.v("bus.guide_slot")
    floor = c.yc + sign * (10.035 * IN / 2)        # IEEE 696: guide slot bottoms 10.025-10.045 in apart
    gd_top = c.p.v("bus.guide_top_depth")
    cheek0 = c.p.v("bus.guide_cheek")              # how far the cheeks reach past the floor, at the base
    cheek1 = cheek0 * gd_top / gd                  # ... and at the top
    z0, z1 = c.board_top, c.board_top + gh

    def y(at_floor_offset):
        return floor + sign * at_floor_offset

    def post(xa, xb, d0_bottom, d1_bottom, d0_top, d1_top):
        """A tapered block from xa to xb, spanning depth offsets (toward the outside +) d0..d1."""
        ys_b = sorted((y(d0_bottom), y(d1_bottom)))
        ys_t = sorted((y(d0_top), y(d1_top)))
        bottom = [(x + xa, ys_b[0], z0), (x + xb, ys_b[0], z0), (x + xb, ys_b[1], z0), (x + xa, ys_b[1], z0)]
        top = [(x + xa, ys_t[0], z1), (x + xb, ys_t[0], z1), (x + xb, ys_t[1], z1), (x + xa, ys_t[1], z1)]
        mb.hexa(bottom, top, "guide_tan")

    back0, back1 = gd - cheek0, gd_top - cheek1    # the back's depth behind the floor
    post(-gw / 2, -ch / 2, -cheek0, 0.0, -cheek1, 0.0)    # cheek, left
    post(ch / 2, gw / 2, -cheek0, 0.0, -cheek1, 0.0)      # cheek, right
    post(-gw / 2, gw / 2, 0.0, back0, 0.0, back1)         # back
    return floor


def build_board(p, col, root, c, b):
    mb = MeshBuilder()
    xr = c.board_right(b)
    y0, y1 = c.yc - c.board_len / 2, c.yc + c.board_len / 2
    mb.prism(geom.rect(xr - c.board_w, y0, xr, y1), "XY", c.board_bottom, c.board_top, "pcb_green")
    gh = p.v("bus.guide")[2]
    slot_boxes = []
    channels = []
    for s in range(4):
        x = c.slot_x(b, s)
        # the edge connector: a base, and two cheeks either side of the slot
        cy0, cy1 = c.tab_yc - c.conn_len / 2, c.tab_yc + c.conn_len / 2
        top = c.board_top + c.conn_h
        mb.prism(geom.rect(x - c.conn_w / 2, cy0, x + c.conn_w / 2, cy1), "XY", c.board_top, top - c.slot_d, "connector_green")
        mb.prism(geom.rect(x - c.conn_w / 2, cy0, x - c.slot_w / 2, cy1), "XY", top - c.slot_d, top, "connector_green")
        mb.prism(geom.rect(x + c.slot_w / 2, cy0, x + c.conn_w / 2, cy1), "XY", top - c.slot_d, top, "connector_green")
        # the slot's box: where a seated tab must be (x0, y0, z0, x1, y1, z1)
        slot_boxes += [(x - c.slot_w / 2, cy0, top - c.slot_d), (x + c.slot_w / 2, cy1, top)]
        # the card guides, front and rear, each a channel opening toward the card
        for sign in (-1, 1):
            floor = add_guide(mb, c, x, sign)
            channels += [(x, floor, c.board_top + gh)]
    board = mb.build(f"bus.board.{b}", col)
    bl.set_labels(board, f"Expander board {b} (88-EC): four 100-pin slots of the bus")
    board["motion"] = "static"
    bl.set_anchors(board, "slot_boxes", slot_boxes)
    bl.set_anchors(board, "guide_channels", channels)
    bl.parent(board, root)
    return board


def card_outline(c):
    """The card's outline in its plane (u = y from the card's centre, w = z from the body's bottom)."""
    L, H = c.body_len, c.body_h
    t0 = -L / 2 + c.tab_from_front
    t1 = t0 + c.tab_len
    return [(-L / 2, 0.0), (t0, 0.0), (t0, -c.tab_d), (t1, -c.tab_d), (t1, 0.0), (L / 2, 0.0), (L / 2, H), (-L / 2, H)]


def build_card(p, col, root, c, card, layouts):
    b, s = REST_SLOT[card]
    x = c.slot_x(b, s)
    origin = (x, c.yc, c.body_bottom)
    carrier = bl.empty(f"slot.{card}", col, origin)
    bl.set_motion(carrier, "translate", (1, 0, 0), f"{LABELS[card]}: its slot", unit="mm")
    bl.parent(carrier, root)

    mb = MeshBuilder()
    t = c.card_t
    mb.prism(card_outline(c), "YZ", -t / 2, t / 2, "pcb_green")
    # gold fingers on both faces of the tab: 50 a side at 0.125 in
    fp = p.v("card.finger_pitch")
    t0 = -c.body_len / 2 + c.tab_from_front
    first = t0 + (c.tab_len - 49 * fp) / 2
    for k in range(50):
        u = first + k * fp
        for side in (-1, 1):
            x0 = side * t / 2
            mb.prism(geom.rect(u - 0.8, -c.tab_d + 0.4, u + 0.8, -0.8), "YZ", min(x0, x0 + side * 0.05), max(x0, x0 + side * 0.05), "copper_gold")
    layout = layouts.get(LAYOUT[card])
    parts = layout["parts"] if layout else []
    if not parts:   # the regulator every card has, at the front-top corner, until measured
        parts = [{"kind": "heat_sink", "u": 0.75, "v": 4.6, "len": 1.0, "wid": 0.7, "height": 0.5},
                 {"kind": "regulator", "u": 0.75, "v": 4.45, "len": 0.4, "wid": 0.6, "height": 0.18}]
    for part in parts:
        add_part(mb, c, part)
    cardobj = mb.build(f"card.{card}", col, origin)
    bl.set_motion(cardobj, "translate", (0, 0, 1), LABELS[card], unit="mm")
    cardobj["role"] = ROLES[card]
    cardobj["parts_source"] = (layout or {}).get("source", "outline only")
    # anchors: the tab's bottom corners, and the card's two end edges at mid-height
    bl.set_anchors(cardobj, "tab_bottom", [(0.0, t0, -c.tab_d), (0.0, t0 + c.tab_len, -c.tab_d)])
    bl.set_anchors(cardobj, "ends", [(0.0, -c.body_len / 2, c.body_h / 2), (0.0, c.body_len / 2, c.body_h / 2)])
    bl.parent(cardobj, carrier)


def add_part(mb, c, part):
    """A part on the component side (+X), from the card frame: u from the card's front end,
    v up from the body's bottom edge (inches), len along u, wid along v (rot 90 swaps them)."""
    kind = part.get("kind", "dip")
    if kind in SKIP:
        return
    mat = MATERIAL.get(kind, "ic_black")
    u = part["u"] * IN - c.body_len / 2
    v = part["v"] * IN
    length = part.get("len", 0.4) * IN
    width = part.get("wid", 0.3) * IN
    if part.get("rot", 0) in (90, 270):
        length, width = width, length
    h = part.get("height", 0.2) * IN
    if kind.endswith("_group"):
        h = min(h, GROUP_HEIGHT * IN)
    x0 = c.card_t / 2
    if kind in ("crystal", "capacitor") and abs(length - width) < 0.15 * IN:
        mb.prism([(u + du, v + dv) for du, dv in geom.circle(length / 2, 20)], "YZ", x0, x0 + h, mat, smooth=True)
        return
    if kind != "heat_sink":
        mb.prism(geom.rect(u - length / 2, v - width / 2, u + length / 2, v + width / 2), "YZ", x0, x0 + h, mat)
        return
    # a finned heat sink: a base plate and fins across it, all within its height
    base = 0.3 * h
    mb.prism(geom.rect(u - length / 2, v - width / 2, u + length / 2, v + width / 2), "YZ", x0, x0 + base, mat)
    n = max(3, int(length / 3.0))
    for k in range(n):
        fu = u - length / 2 + (k + 0.5) * length / n
        mb.prism(geom.rect(fu - 0.5, v - width / 2, fu + 0.5, v + width / 2), "YZ", x0 + base, x0 + h, mat)


def build(p):
    bl.reset_scene()
    col = bpy.context.scene.collection
    root = bl.empty("altair_card_cage", col)
    build_front_panel.build_panel(p, col, root)
    c = Cage(p)
    layouts = {}
    if os.path.exists(CARDS_PATH):
        with open(CARDS_PATH, encoding="utf-8") as f:
            layouts = json.load(f).get("cards", {})
    build_rails(p, col, root, c)
    for b in range(2):
        build_board(p, col, root, c, b)
    for card in CARDS:
        build_card(p, col, root, c, card, layouts)
    root["machine"] = "altair-8800"
    root["build"] = "card cage"
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
    print(f"CARD_CAGE_BUILD_OK out={out} objects={len(bpy.data.objects)} triangles~{tris}")
