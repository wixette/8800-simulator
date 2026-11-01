"""No two parts of the box meet: at rest, on any unit's way out, and taken all apart.

Run headless (npm run test:model), after a rebuild:
  Blender --background --factory-startup --python-exit-code 1 --python check_clearance.py -- [--plant]

It builds the model from params, and for each memory size the Memory menu offers checks:
  rest       every pair of parts, every unit in
  alone      each unit along its way out in 2 mm steps, what it needs out first parked, the rest in
  in order   the same, as Taken apart does it: each unit with all the units before it parked
  apart      everything out

Each part's vertices are taken in the world once, with its matrices up to date, and only ever
offset from there, so a part cannot be tested at a stale pose. Triangles are tested, so a part
wholly inside another would pass at rest; it is caught on the way there.

--plant moves T3 into T1 first: the check must then fail, which is how we know it can.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils.bvhtree import BVHTree  # noqa: E402

import build_card_cage as cage  # noqa: E402
import build_whole_box  # noqa: E402
from lib import params  # noqa: E402
from lib.bl import MM  # noqa: E402

STEP = 2.0            # mm along a way out
CPU_NEEDS = ["case.top", "harness.data_plug"]
# Taken apart's order, as PARTS in js/box.js, the cards after the data plug.
ORDER = ["case.top", "harness.data_plug", "CARDS", "psu.t2", "psu.t1", "psu.t3", "psu.fan", "psu.board",
         "psu.terminal_block", "chassis.frame", "panel.dress"]
# The cards each memory size fits, as fittedFor() in js/box.js.
FITTED = {"256 B": ["cpu", "mem1k", "sio", "sio2"], "4 KB": ["cpu", "mem4k_0", "sio", "sio2"],
          "8 KB": ["cpu", "mem4k_0", "mem4k_1", "sio", "sio2"]}
# Parts built to meet, with why. Everything else must clear.
MEET = {
    ("panel.assembly", "panel.switch.*"): "each bat's pivot ball sits in its switch, as in the real part",
    ("panel.assembly", "panel.lamp.*"): "each LED's flange sits on the sub-panel, its leads in the board",
    ("panel.dress", "panel.name_plate"): "the plate is stuck to the panel",
    ("bus.board.0", "card.*"): "a seated card's tab is in its connector",
    ("bus.board.1", "card.*"): "a seated card's tab is in its connector",
    ("chassis.frame", "chassis.card_rail.*"): "the rails are bolted to the side members",
    ("bus.board.0", "chassis.card_rail.*"): "the board lies on the rails",
    ("bus.board.1", "chassis.card_rail.*"): "the board lies on the rails",
    ("chassis.frame", "harness.panel_bus"): "the harness runs along the chassis",
    ("harness.data_plug", "harness.panel_data"): "the cable goes into its plug",
    ("card.cpu", "harness.data_plug"): "the plug is on the CPU card's wafer",
}


def meets(a, b):
    for (x, y) in ((a, b), (b, a)):
        for (p, q) in MEET:
            if (x == p or (p.endswith("*") and x.startswith(p[:-1]))) and (y == q or (q.endswith("*") and y.startswith(q[:-1]))):
                return True
    return False


class Part:
    def __init__(self, obj):
        self.name = obj.name
        m = np.array(obj.matrix_world)
        me = obj.data
        co = np.empty(len(me.vertices) * 3, np.float64)
        me.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        self.verts = (co @ m[:3, :3].T + m[:3, 3]) / MM
        me.calc_loop_triangles()
        self.tris = [tuple(t.vertices) for t in me.loop_triangles]
        self.lo, self.hi = self.verts.min(0), self.verts.max(0)
        self._bvh = None

    def bvh(self, off):
        if off is None:
            if self._bvh is None:
                self._bvh = BVHTree.FromPolygons(self.verts.tolist(), self.tris, all_triangles=True)
            return self._bvh
        return BVHTree.FromPolygons((self.verts + off).tolist(), self.tris, all_triangles=True)


def clash(a, off_a, b, off_b):
    """Whether two parts meet, each at its offset (mm from where it was built)."""
    d = off_a - off_b
    if np.any(a.lo + d > b.hi) or np.any(a.hi + d < b.lo):
        return False
    # the smaller mesh is the one rebuilt, against the other's kept tree
    if len(a.tris) <= len(b.tris):
        return bool(a.bvh(d).overlap(b.bvh(None)))
    return bool(a.bvh(None).overlap(b.bvh(-d)))


def units_of(p):
    """Each unit: its moves (mm, machine frame) and what must be out first."""
    paths, prereqs = p.v("paths"), p.v("prereqs")
    lift = [[0.0, 0.0, p.v("cage.lift_out")]]
    units = {u: (paths[u], prereqs[u]) for u in paths}
    for c in cage.CARDS:
        units[f"card.{c}"] = (lift, CPU_NEEDS if c == "cpu" else ["case.top"])
    return units


def walk(moves):
    """The offsets along a way out, 2 mm apart, ending at its end."""
    at, out = np.zeros(3), []
    for m in moves:
        m = np.array(m, np.float64)
        n = max(1, int(np.ceil(np.abs(m).max() / STEP)))
        out += [at + m * k / n for k in range(1, n + 1)]
        at = at + m
    return out


class Scene:
    def __init__(self, p, objs, fitted):
        self.units = {u: v for u, v in units_of(p).items() if not u.startswith("card.") or u[5:] in fitted}
        self.group = {u: self._meshes(objs[u]) for u in self.units}
        c = cage.Cage(p)
        unfitted = {f"card.{k}" for k in cage.CARDS} - {f"card.{k}" for k in fitted}
        self.parts = {n: Part(o) for n, o in objs.items() if o.type == "MESH" and n not in unfitted}
        self.offsets = {n: np.zeros(3) for n in self.parts}
        self.base = {n: np.zeros(3) for n in self.parts}
        for i, k in enumerate(fitted):                 # each card to the slot this memory size gives it
            b, s = cage.REST_SLOT[k]
            self.base[f"card.{k}"][0] = c.slot_x(i // 4, i % 4) - c.slot_x(b, s)

    @staticmethod
    def _meshes(obj):
        out = [obj.name] if obj.type == "MESH" else []
        for child in obj.children:
            out += Scene._meshes(child)
        return out

    def members(self, unit):
        return [n for n in self.group[unit] if n in self.parts]

    def at(self, name):
        return self.base[name] + self.offsets[name]

    def park(self, unit):
        for n in self.members(unit):
            self.offsets[n] = self.offsets[n] + np.sum(self.units[unit][0], axis=0)

    def needs(self, unit, seen=None):
        """What must be out before a unit, first things first."""
        seen = [] if seen is None else seen
        for u in self.units[unit][1]:
            if u not in seen:
                self.needs(u, seen)
                seen.append(u)
        return seen

    def reset(self):
        for n in self.offsets:
            self.offsets[n] = np.zeros(3)

    def rest(self):
        names = sorted(self.parts)
        found = []
        for i, a in enumerate(names):
            for b in names[i + 1:]:
                if not meets(a, b) and clash(self.parts[a], self.at(a), self.parts[b], self.at(b)):
                    found.append((a, b, 0.0))
        return found

    def along(self, unit):
        """Where a unit's way out meets anything that does not move with it."""
        mine = set(self.members(unit))
        others = [n for n in self.parts if n not in mine]
        hit = {}
        for off in walk(self.units[unit][0]):
            for a in mine:
                pa = self.parts[a]
                at = self.at(a) + off
                for b in others:
                    if (a, b) not in hit and not meets(a, b) and clash(pa, at, self.parts[b], self.at(b)):
                        hit[(a, b)] = float(np.abs(off).sum())
        return [(a, b, d) for (a, b), d in hit.items()]


def check(p, objs, memory, fitted):
    s = Scene(p, objs, fitted)
    problems = [("rest", *f) for f in s.rest()]
    for unit in s.units:
        s.reset()
        for u in s.needs(unit):
            s.park(u)
        problems += [(f"alone: {unit}", *f) for f in s.along(unit)]
    s.reset()
    cards = [f"card.{k}" for k in fitted]
    for unit in [u for o in ORDER for u in (cards if o == "CARDS" else [o])]:
        problems += [(f"in order: {unit}", *f) for f in s.along(unit)]
        s.park(unit)
    problems += [("apart", *f) for f in s.rest()]
    print(f"CLEARANCE {memory}: {len(s.parts)} parts, {len(problems)} meetings")
    return problems


if __name__ == "__main__":
    p = params.load()
    build_whole_box.build(p)
    objs = {o.name: o for o in bpy.data.objects}
    if "--plant" in sys.argv:
        objs["psu.t3"].location.x += 63.0 * MM
    bpy.context.view_layer.update()
    problems = []
    for memory, fitted in FITTED.items():
        problems += [(memory, *q) for q in check(p, objs, memory, fitted)]
    for memory, state, a, b, d in problems:
        print(f"  {memory} | {state} | {a} meets {b}" + (f", {d:.0f} mm along" if d else ""))
    if problems:
        print(f"CLEARANCE_FAILED {len(problems)}")
        sys.exit(1)
    print("CLEARANCE_OK")
