"""The panel's printed lines, from a copy of the 2D panel's strokes, placed on the model's grid. No bpy.

The two panels share a drawing, not a scale: the 2D panel's columns and rows are not spaced as the
model's are. So a point is placed piecewise, between the columns and the rows either side of it,
and a line always lands on the lamps and switches it belongs to.
"""

import re

# The 2D panel's centres, as panel.LED_INFO and panel.TOGGLE_SWITCH_INFO place them: switch 15 to 0
# from left to right, and the rows of the status lamps, the address lamps and the switches.
SVG_COLUMNS = [357, 431, 483, 534, 610, 660, 711, 789, 840, 891, 970, 1019, 1068, 1147, 1198, 1248]
SVG_ROWS = [(130, "lamps_upper"), (240, "lamps_lower"), (349, "switches")]

# Where the 2D panel puts the words that go with the lines (the middle of each word), and a point
# on the line over STATUS, in the middle of the word.
WORDS = {"SENSE SW.": (259.8, 325.9), "Data": (1290.6, 352.8), "Address": (1299.8, 376.1)}
STATUS_LINE = (479.3, 144.43)


def _interpolate(pairs, v):
    """Piecewise linear through (from, to) pairs, in order of from, running on past both ends."""
    k = 0
    while k < len(pairs) - 2 and v > pairs[k + 1][0]:
        k += 1
    (a0, b0), (a1, b1) = pairs[k], pairs[k + 1]
    return b0 + (v - a0) * (b1 - b0) / (a1 - a0)


class Placer:
    """Maps the 2D panel's (x, y) to the model's (x, z) on the dress panel's face."""

    def __init__(self, layout):
        self.xs = [(u, layout.switch(f"s{15 - k}")[0]) for k, u in enumerate(SVG_COLUMNS)]
        self.zs = [(v, layout.a0[1] + layout.rows[row]) for v, row in SVG_ROWS]

    def __call__(self, x, y):
        return _interpolate(self.xs, x), _interpolate(self.zs, y)


def strokes(path):
    """Every stroke in an SVG of M, H, V and L paths, as a list of (x, y) points."""
    with open(path, encoding="utf-8") as f:
        source = f.read()
    out = []
    for d in re.findall(r'<path d="([^"]+)"', source):
        points = []
        for cmd, args in re.findall(r"([MLHV])([^MLHV]+)", d):
            v = [float(a) for a in args.split()]
            if cmd == "H":
                points.append((v[0], points[-1][1]))
            elif cmd == "V":
                points.append((points[-1][0], v[0]))
            else:
                points.append((v[0], v[1]))
        out.append(points)
    return out
