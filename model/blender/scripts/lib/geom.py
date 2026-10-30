"""Pure 2D profile maths (no bpy). Angles in degrees, lengths in mm.

Profiles are lists of (u, w) points describing a closed polygon, counter-clockwise.
The caller decides which world plane (u, w) maps to.
"""

import math

PRESSURE_ANGLE = 20.0


def _inv(a):
    return math.tan(a) - a


def _polar(r, deg):
    a = math.radians(deg)
    return (r * math.cos(a), r * math.sin(a))


class GearSpec:
    """Standard involute spur gear (or a virtual one, e.g. the stepped drum)."""

    def __init__(self, teeth, module, thickness_factor=1.0, addendum=1.0, dedendum=1.25):
        self.z = teeth
        self.m = module
        self.rp = module * teeth / 2.0
        self.rb = self.rp * math.cos(math.radians(PRESSURE_ANGLE))
        self.ra = self.rp + addendum * module
        self.rf = self.rp - dedendum * module
        # Half tooth thickness at the pitch circle, as an angle (rad).
        self.half_pitch_angle = (math.pi * module / 2.0 * thickness_factor) / (2.0 * self.rp)

    def flank_half_angle(self, r):
        """Half-angle (deg) of the tooth at radius r (radial below the base circle)."""
        r_eff = max(r, self.rb)
        alpha_r = math.acos(min(1.0, self.rb / r_eff))
        alpha_p = math.radians(PRESSURE_ANGLE)
        return math.degrees(self.half_pitch_angle + _inv(alpha_p) - _inv(alpha_r))

    def tooth_radii(self, samples=7):
        r0 = max(self.rf, self.rb)
        return [r0 + (self.ra - r0) * i / (samples - 1) for i in range(samples)]


def tooth_polygon(g, centre_deg, root_r=None, samples=7, tip_samples=3):
    """Closed polygon of a single tooth from root_r (default rf) to the tip."""
    root_r = g.rf if root_r is None else root_r
    radii = g.tooth_radii(samples)
    right = [(root_r, -g.flank_half_angle(radii[0]))] + [(r, -g.flank_half_angle(r)) for r in radii]
    tip_half = max(0.05, g.flank_half_angle(g.ra))
    tip = [(g.ra, -tip_half + 2 * tip_half * (i + 1) / (tip_samples + 1)) for i in range(tip_samples)]
    left = [(r, g.flank_half_angle(r)) for r in reversed(radii)] + [(root_r, g.flank_half_angle(radii[0]))]
    pts = right + tip + left
    return [_polar(r, centre_deg + a) for r, a in pts]


def gear_outline(g, first_tooth_deg=0.0, samples=7, root_samples=4):
    """Full closed outline of a spur gear; tooth j centred at first_tooth_deg + j*360/z."""
    pitch = 360.0 / g.z
    out = []
    for j in range(g.z):
        c = first_tooth_deg + j * pitch
        radii = g.tooth_radii(samples)
        half0 = g.flank_half_angle(radii[0])
        right = [(g.rf, c - half0)] + [(r, c - g.flank_half_angle(r)) for r in radii]
        tip_half = max(0.05, g.flank_half_angle(g.ra))
        tip = [(g.ra, c - tip_half * 0.5), (g.ra, c + tip_half * 0.5)]
        left = [(r, c + g.flank_half_angle(r)) for r in reversed(radii)] + [(g.rf, c + half0)]
        # root arc to the next tooth
        a0, a1 = c + half0, c + pitch - half0
        root = [(g.rf, a0 + (a1 - a0) * (i + 1) / (root_samples + 1)) for i in range(root_samples)]
        out += right + tip + left + root
    return [_polar(r, a) for r, a in out]


def circle(r, n=48, start_deg=0.0):
    return [_polar(r, start_deg + 360.0 * i / n) for i in range(n)]


def regular_polygon(circumradius, n, first_vertex_deg):
    return [_polar(circumradius, first_vertex_deg + 360.0 * i / n) for i in range(n)]


def rect(u0, w0, u1, w1):
    return [(u0, w0), (u1, w0), (u1, w1), (u0, w1)]


def radial_bar(r0, r1, width, angle_deg):
    """Rectangle from radius r0 to r1 along angle_deg, of the given width."""
    a = math.radians(angle_deg)
    ux, uw = math.cos(a), math.sin(a)
    nx, nw = -uw, ux
    h = width / 2.0
    return [
        (ux * r0 - nx * h, uw * r0 - nw * h),
        (ux * r1 - nx * h, uw * r1 - nw * h),
        (ux * r1 + nx * h, uw * r1 + nw * h),
        (ux * r0 + nx * h, uw * r0 + nw * h),
    ]


def capsule(length, radius, angle_deg, cap_samples=10):
    """Stadium shape: segment from the origin to `length` along angle_deg, radius `radius`."""
    pts = []
    for i in range(cap_samples + 1):  # far cap
        a = angle_deg - 90.0 + 180.0 * i / cap_samples
        cx, cw = _polar(length, angle_deg)
        dx, dw = _polar(radius, a)
        pts.append((cx + dx, cw + dw))
    for i in range(cap_samples + 1):  # near cap (around the origin)
        a = angle_deg + 90.0 + 180.0 * i / cap_samples
        pts.append(_polar(radius, a))
    return pts


def scalloped_wheel(r_outer, n, trough_r, trough_depth, first_trough_deg, samples=96):
    """'Muldenrad'-like wheel: circle with n concave troughs."""
    pts = []
    for i in range(samples):
        a = first_trough_deg + 360.0 * i / samples
        # angular distance to nearest trough centre
        d = ((a - first_trough_deg) % (360.0 / n))
        d = min(d, 360.0 / n - d)
        arc = math.radians(d) * r_outer
        r = r_outer
        if arc < trough_r:
            r = r_outer - trough_depth * math.sqrt(max(0.0, 1 - (arc / trough_r) ** 2))
        pts.append(_polar(r, a))
    return pts


def rack_teeth(pitch_line_u, module, w_centres, thickness_factor=0.9, back_u=None):
    """Rack teeth protruding toward +u from the pitch line; teeth centred at given w.

    Returns a list of polygons (one body + one per tooth) in (u, w)."""
    add, ded = module, 1.25 * module
    p = math.pi * module
    half_t = p / 4.0 * thickness_factor
    tan_a = math.tan(math.radians(PRESSURE_ANGLE))
    polys = []
    root_u, tip_u = pitch_line_u - ded, pitch_line_u + add
    for wc in w_centres:
        polys.append([
            (root_u - 0.2, wc - half_t - ded * tan_a),
            (tip_u, wc - half_t + add * tan_a),
            (tip_u, wc + half_t - add * tan_a),
            (root_u - 0.2, wc + half_t + ded * tan_a),
        ])
    back_u = root_u - 3.0 if back_u is None else back_u
    w0, w1 = min(w_centres) - p / 2.0, max(w_centres) + p / 2.0
    polys.append(rect(back_u, w0, root_u, w1))
    return polys
