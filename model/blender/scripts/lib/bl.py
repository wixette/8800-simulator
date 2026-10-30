"""bpy helpers: scene reset, materials, and a mesh builder working in millimetres."""

import math

import bpy
from mathutils import Matrix, Vector

MM = 0.001  # Blender scene is in metres; all helper inputs are in mm.


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 1.0
    sc.unit_settings.length_unit = "MILLIMETERS"
    return sc


# --- materials -------------------------------------------------------------------

MATERIALS = {
    # name: (base colour, linear RGB; metallic; roughness; texture kind or None)
    # Colours read from the reference photos (research/sources/notes-case-and-panel.md §3),
    # a guide only: no paint specification survives.
    "panel_charcoal": ((0.068, 0.068, 0.072), 0.0, 0.55, None),   # dress panel, ~#4C4C4C
    "ink_white": ((0.80, 0.80, 0.78), 0.0, 0.50, None),           # panel lettering
    "ink_black": ((0.012, 0.012, 0.012), 0.0, 0.55, None),        # name plate lettering
    "ink_blue": ((0.033, 0.184, 0.855), 0.0, 0.50, None),         # the name plate's logo, #3377EE as on the simulator's 2D panel
    "bezel_blue": ((0.027, 0.238, 0.578), 0.0, 0.40, None),       # case bottom and bezel, ~#2E86C8
    "case_grey": ((0.376, 0.376, 0.35), 0.0, 0.45, None),         # case top
    "aluminium_brushed": ((0.91, 0.92, 0.92), 1.0, 0.30, "brushed"),  # name plate
    "aluminium_anodised": ((0.72, 0.73, 0.74), 1.0, 0.45, "brushed"),  # sub-panel, chassis
    "chrome": ((0.60, 0.61, 0.63), 1.0, 0.12, None),              # switch bats, bushings, nuts
    "switch_body": ((0.04, 0.04, 0.045), 0.6, 0.45, None),
    "led_red": ((0.11, 0.006, 0.004), 0.0, 0.22, None),           # unlit (dark red); the page lights each lamp
    "pcb_green": ((0.055, 0.16, 0.06), 0.0, 0.45, None),
    "ic_black": ((0.015, 0.015, 0.015), 0.0, 0.60, None),
    "heat_sink": ((0.03, 0.03, 0.035), 1.0, 0.50, None),
    "copper_gold": ((0.90, 0.62, 0.30), 1.0, 0.25, None),
    "tin": ((0.70, 0.71, 0.72), 1.0, 0.35, None),                 # leads, pins, crystal cans
    "connector_green": ((0.03, 0.12, 0.05), 0.0, 0.50, None),     # edge connector bodies (SN 220081K)
    "guide_tan": ((0.42, 0.29, 0.13), 0.0, 0.50, None),           # nylon card guides, brown to earthy yellow (SN 220081K)
    "nylon_white": ((0.75, 0.74, 0.70), 0.0, 0.55, None),         # Molex wafer connectors
    "cap_body": ((0.05, 0.10, 0.30), 0.0, 0.40, None),            # electrolytic capacitors
    "resistor_tan": ((0.50, 0.38, 0.22), 0.0, 0.55, None),        # rows of resistors
    "cap_disc": ((0.55, 0.30, 0.04), 0.0, 0.50, None),            # rows of disc capacitors
    "laminations": ((0.10, 0.10, 0.11), 0.6, 0.45, None),         # transformer cores
    "coil_wrap": ((0.40, 0.22, 0.09), 0.25, 0.50, None),          # transformer coils, bronze-brown wrapped windings
    "screen": ((0.03, 0.03, 0.035), 0.5, 0.55, "net"),            # the back panel's expanded-metal screens
    "cap_black": ((0.015, 0.015, 0.017), 0.0, 0.35, None),        # the PSU's 3300 uF filter capacitors
    "cap_bronze": ((0.55, 0.47, 0.36), 0.7, 0.35, None),          # its 2200 uF capacitor
    "cap_orange": ((0.80, 0.30, 0.03), 0.0, 0.45, None),          # its 500 uF capacitor
    "fan_metal": ((0.05, 0.05, 0.055), 0.7, 0.40, None),          # the fan's cast frame and blades
    "cord_black": ((0.012, 0.012, 0.012), 0.0, 0.50, None),       # the power cord and its grommet
    "wire_white": ((0.70, 0.69, 0.64), 0.0, 0.60, None),          # the laced harness
    "wire_grey": ((0.30, 0.30, 0.32), 0.0, 0.55, None),           # the data cable
}

# Textures repeat every UV_MM millimetres (box-projected UVs, see MeshBuilder.build).
UV_MM = 250.0
TEX_SIZE = {"brushed": 512, "net": 1024}


def _periodic_noise(rng, n, stretch_u, scale, beta=1.0):
    """Seamless (periodic) noise, n x n, rows = v and columns = u, normalised to 0..1.

    White noise filtered in Fourier space with a 1/f^beta falloff above 1/scale cycles
    per tile; stretch_u > 1 makes features long along u (grain, brushing)."""
    import numpy as np

    fv = np.fft.fftfreq(n)[:, None] * n
    fu = np.fft.fftfreq(n)[None, :] * n
    f = np.sqrt((fu * stretch_u) ** 2 + fv ** 2)
    amp = 1.0 / np.maximum(f, 1.0) ** beta * np.exp(-((f / scale) ** 2))
    amp[0, 0] = 0.0
    w = np.fft.ifft2(np.fft.fft2(rng.standard_normal((n, n))) * amp).real
    w -= w.min()
    return w / max(w.max(), 1e-9)


def _image(name, rgb, non_color, alpha=None):
    """Blender image from an (n, n, 3) array of linear values (rows = v, bottom row first),
    with an (n, n) alpha array if given (then kept as PNG in the .glb, not JPEG)."""
    import numpy as np

    n = rgb.shape[0]
    img = bpy.data.images.new(name, n, n, alpha=alpha is not None, float_buffer=False)
    img.file_format = "PNG" if alpha is not None else "JPEG"
    # set the colour space first: changing it regenerates (blanks) a generated image
    img.colorspace_settings.name = "Non-Color" if non_color else "sRGB"
    c = np.clip(rgb, 0.0, 1.0)
    if not non_color:  # pixels of an sRGB byte image are sRGB-encoded
        c = np.where(c <= 0.0031308, 12.92 * c, 1.055 * c ** (1 / 2.4) - 0.055)
    px = np.ones((n, n, 4), np.float32)
    px[..., :3] = c
    if alpha is not None:
        px[..., 3] = alpha
    img.pixels.foreach_set(px.ravel())
    return img


def _texture_images(name, kind, rgb, metallic, rough):
    """(base colour image or None, ORM image: G = roughness, B = metallic) for a material.

    Generated with a fixed seed, so rebuilds give the same .glb."""
    import numpy as np

    rng = np.random.default_rng(sum(map(ord, name)))
    n = TEX_SIZE[kind]
    if kind == "brushed":
        streak = _periodic_noise(rng, n, 40.0, n / 3)        # fine brushing along u
        patch = _periodic_noise(rng, n, 2.0, 12.0)           # soft wear patches
        r = rough * (0.82 + 0.28 * streak + 0.18 * (patch - 0.5))
        color = alpha = None
    elif kind == "net":
        # expanded metal: diamond holes in staggered rows, long across (u), as on SN #09;
        # 36 x 72 diamonds a tile, so the holes are about 6.9 x 3.5 mm and the tile repeats
        v, u = (np.mgrid[0:n, 0:n] + 0.5) / n
        du = (u * 36) % 1.0 - 0.5
        dv = (v * 72) % 1.0 - 0.5
        hole = np.minimum(np.abs(du) + np.abs(dv), np.abs(np.abs(du) - 0.5) + np.abs(np.abs(dv) - 0.5)) < 0.40
        alpha = np.where(hole, 0.0, 1.0)
        color = np.broadcast_to(np.asarray(rgb, np.float32), (n, n, 3)).copy()
        r = np.full((n, n), rough)
    else:
        raise ValueError(kind)
    orm = np.stack([np.ones_like(r), r, np.full_like(r, metallic)], -1)
    img_c = _image(f"{name}_color", color, False, alpha) if color is not None else None
    return img_c, _image(f"{name}_orm", orm, True)


def material(name):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    rgb, metallic, rough, kind = MATERIALS[name]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    mat.diffuse_color = (*rgb, 1.0)
    mat.use_backface_culling = True   # exported single-sided: every part is closed or faces the viewer
    if kind:
        img_c, img_orm = _texture_images(name, kind, rgb, metallic, rough)
        orm = nodes.new("ShaderNodeTexImage")
        orm.image = img_orm
        sep = nodes.new("ShaderNodeSeparateColor")
        links.new(orm.outputs["Color"], sep.inputs["Color"])
        links.new(sep.outputs["Green"], bsdf.inputs["Roughness"])
        links.new(sep.outputs["Blue"], bsdf.inputs["Metallic"])
        if img_c:
            col = nodes.new("ShaderNodeTexImage")
            col.image = img_c
            links.new(col.outputs["Color"], bsdf.inputs["Base Color"])
            if kind == "net":
                # alpha clip, as the glTF exporter reads it (alphaMode MASK): 1 - (alpha < 0.5)
                lt = nodes.new("ShaderNodeMath")
                lt.operation = "LESS_THAN"
                lt.inputs[1].default_value = 0.5
                inv = nodes.new("ShaderNodeMath")
                inv.operation = "SUBTRACT"
                inv.inputs[0].default_value = 1.0
                links.new(col.outputs["Alpha"], lt.inputs[0])
                links.new(lt.outputs["Value"], inv.inputs[1])
                links.new(inv.outputs["Value"], bsdf.inputs["Alpha"])
                mat.use_backface_culling = False
    return mat


def is_textured(name):
    return MATERIALS[name][3] is not None


# glTF export settings shared by the build scripts: textures as JPEG, the net as PNG (it has alpha).
EXPORT_IMAGES = dict(export_image_format="AUTO", export_image_quality=88)   # each image in its own format (above)


# --- mesh building -------------------------------------------------------------------

# Plane mappings for 2D profiles (u, w) and the extrusion axis.
# "XZ": profile in the X-Z plane, extruded along +Y (shafts running front to back).
# "XY": profile in the X-Y plane, extruded along +Z (vertical shafts).
def _map(plane, u, w, t):
    if plane == "XZ":
        return (u, t, w)
    if plane == "XY":
        return (u, w, t)
    if plane == "YZ":
        return (t, u, w)
    raise ValueError(plane)


def _signed_area(poly):
    a = 0.0
    for i in range(len(poly)):
        x0, y0 = poly[i]
        x1, y1 = poly[(i + 1) % len(poly)]
        a += x0 * y1 - x1 * y0
    return a / 2.0


class MeshBuilder:
    """Accumulates polygons (mm, in the node's local frame) with material slots."""

    def __init__(self):
        self.verts = []
        self.faces = []
        self.mat_idx = []
        self.smooth = []
        self.mats = []

    def _mat(self, name):
        if name not in self.mats:
            self.mats.append(name)
        return self.mats.index(name)

    def prism(self, poly, plane, t0, t1, mat, smooth=False, offset=(0.0, 0.0, 0.0)):
        """Extrude a closed 2D polygon from t0 to t1 along the plane's normal axis."""
        if _signed_area(poly) < 0:
            poly = list(reversed(poly))
        mi = self._mat(mat)
        n = len(poly)
        base = len(self.verts)
        ox, oy, oz = offset
        for t in (t0, t1):
            for u, w in poly:
                x, y, z = _map(plane, u, w, t)
                self.verts.append((x + ox, y + oy, z + oz))
        # Orientation: for XZ the extrusion axis +Y gives a left-handed (u,w,t) frame.
        flip = plane == "XZ"
        cap0 = list(range(base, base + n))
        cap1 = list(range(base + n, base + 2 * n))
        if flip:
            self._add(cap0, mi, False)
            self._add(list(reversed(cap1)), mi, False)
        else:
            self._add(list(reversed(cap0)), mi, False)
            self._add(cap1, mi, False)
        for i in range(n):
            a, b = base + i, base + (i + 1) % n
            c, d = b + n, a + n
            self._add([a, d, c, b] if flip else [a, b, c, d], mi, smooth)

    def lathe(self, profile, n, mat, axis="Y", offset=(0.0, 0.0, 0.0)):
        """Surface of revolution: profile is a list of (radius, t) from one end to the other,
        turned about the local axis ("Y" or "Z"); a radius of 0 closes that end."""
        mi = self._mat(mat)
        ox, oy, oz = offset
        rings = []
        for r, t in profile:
            ring = []
            for i in range(n if r > 1e-9 else 1):
                a = 2.0 * math.pi * i / n
                u, w = r * math.cos(a), r * math.sin(a)
                x, y, z = (u, t, w) if axis == "Y" else (u, w, t)
                ring.append(len(self.verts))
                self.verts.append((x + ox, y + oy, z + oz))
            rings.append(ring)
        # Unflipped faces point outward when t decreases along the profile for axis Y
        # ((u, t, w) is a left-handed frame) and when it increases for axis Z.
        rising = profile[-1][1] > profile[0][1]
        flip = rising if axis == "Y" else not rising
        for k in range(len(rings) - 1):
            r0, r1 = rings[k], rings[k + 1]
            for i in range(n):
                j = (i + 1) % n
                if len(r0) == 1 and len(r1) == 1:
                    continue
                if len(r0) == 1:
                    f = [r0[0], r1[j], r1[i]]
                elif len(r1) == 1:
                    f = [r0[i], r0[j], r1[0]]
                else:
                    f = [r0[i], r0[j], r1[j], r1[i]]
                self._add(list(reversed(f)) if flip else f, mi, True)

    def tube(self, r_out, r_in, n, plane, t0, t1, mat, offset=(0.0, 0.0, 0.0)):
        """Hollow cylinder (a bushing) from t0 to t1 along the plane's normal axis."""
        mi = self._mat(mat)
        ox, oy, oz = offset
        base = len(self.verts)
        for t in (t0, t1):
            for r in (r_out, r_in):
                for i in range(n):
                    a = 2.0 * math.pi * i / n
                    x, y, z = _map(plane, r * math.cos(a), r * math.sin(a), t)
                    self.verts.append((x + ox, y + oy, z + oz))
        o0, i0, o1, i1 = base, base + n, base + 2 * n, base + 3 * n
        flip = plane == "XZ"
        for i in range(n):
            j = (i + 1) % n
            quads = [
                [o0 + i, o0 + j, o1 + j, o1 + i],      # outer wall
                [i0 + j, i0 + i, i1 + i, i1 + j],      # inner wall
                [o0 + j, o0 + i, i0 + i, i0 + j],      # cap at t0
                [o1 + i, o1 + j, i1 + j, i1 + i],      # cap at t1
            ]
            for k, q in enumerate(quads):
                self._add(list(reversed(q)) if flip else q, mi, k < 2)

    def hexa(self, bottom, top, mat):
        """A solid with a quadrilateral bottom and top (each 4 (x, y, z) points, counter-clockwise
        seen from above, top[i] over bottom[i]): a tapered post."""
        mi = self._mat(mat)
        base = len(self.verts)
        self.verts += [tuple(v) for v in bottom] + [tuple(v) for v in top]
        b = [base + i for i in range(4)]
        t = [base + 4 + i for i in range(4)]
        self._add(list(reversed(b)), mi, False)
        self._add(t, mi, False)
        for i in range(4):
            j = (i + 1) % 4
            self._add([b[i], b[j], t[j], t[i]], mi, False)

    def _add(self, face, mi, smooth):
        self.faces.append(face)
        self.mat_idx.append(mi)
        self.smooth.append(smooth)

    def add_mesh_data(self, verts, faces, matrix, mat):
        """Append raw mesh data (e.g. a converted text glyph) transformed by matrix (mm)."""
        mi = self._mat(mat)
        base = len(self.verts)
        for v in verts:
            p = matrix @ Vector(v)
            self.verts.append((p.x, p.y, p.z))
        for f in faces:
            self._add([base + i for i in f], mi, False)

    def build(self, name, collection, location_mm=(0, 0, 0)):
        me = bpy.data.meshes.new(name)
        me.from_pydata([(x * MM, y * MM, z * MM) for x, y, z in self.verts], [], self.faces)
        me.update()
        for m in self.mats:
            me.materials.append(material(m))
        me.polygons.foreach_set("material_index", self.mat_idx)
        me.polygons.foreach_set("use_smooth", self.smooth)
        me.validate()
        if any(is_textured(m) for m in self.mats):
            _box_uvs(me)
        if hasattr(me, "set_sharp_from_angle"):
            me.set_sharp_from_angle(angle=math.radians(40))
        obj = bpy.data.objects.new(name, me)
        obj.location = tuple(c * MM for c in location_mm)
        collection.objects.link(obj)
        return obj


def _box_uvs(me):
    """Box-projected UVs (1 unit = UV_MM): each face uses the plane across its normal's
    largest axis, with u along X where it can (grain and brushing run along the machine)."""
    import numpy as np

    n = len(me.polygons)
    nrm = np.empty(n * 3, np.float32)
    me.polygons.foreach_get("normal", nrm)
    axis = np.abs(nrm.reshape(n, 3)).argmax(1)
    loop_start = np.empty(n, np.int64)
    loop_total = np.empty(n, np.int64)
    me.polygons.foreach_get("loop_start", loop_start)
    me.polygons.foreach_get("loop_total", loop_total)
    lv = np.empty(len(me.loops), np.int64)
    me.loops.foreach_get("vertex_index", lv)
    co = np.empty(len(me.vertices) * 3, np.float32)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3) / (UV_MM * MM)
    loop_axis = np.repeat(axis, loop_total)
    p = co[lv]
    u = np.where(loop_axis == 0, p[:, 1], p[:, 0])
    v = np.where(loop_axis == 2, p[:, 1], p[:, 2])
    uv = me.uv_layers.new(name="UVMap")
    uv.data.foreach_set("uv", np.stack([u, v], 1).ravel().astype(np.float32))


def empty(name, collection, location_mm=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    obj.location = tuple(c * MM for c in location_mm)
    collection.objects.link(obj)
    return obj


def parent(child, par):
    """Parent keeping the child's world position (build-time objects are unrotated).

    The child's location becomes relative to the parent and no parent-inverse matrix
    is used, so the glTF local transforms stay clean and easy to animate."""
    child.parent = par
    child.matrix_parent_inverse.identity()
    child.location = child.location - par.location


def glyph_mesh(text, size_mm, depth_mm):
    """Mesh data (verts in mm, faces) of a centred, extruded text string, facing +Z."""
    curve = bpy.data.curves.new("glyph_tmp", "FONT")
    curve.body = text
    curve.size = size_mm
    curve.extrude = depth_mm / 2.0
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.resolution_u = 3
    obj = bpy.data.objects.new("glyph_tmp", curve)
    bpy.context.scene.collection.objects.link(obj)
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    verts = [tuple(v.co) for v in me.vertices]
    faces = [tuple(p.vertices) for p in me.polygons]
    bpy.data.objects.remove(obj)
    bpy.data.curves.remove(curve)
    bpy.data.meshes.remove(me)
    return verts, faces


def glyph_mesh_flat(text, size_mm, align="CENTER", bold_mm=0.0):
    """Mesh data (verts in mm, faces) of flat lettering facing +Z: printed ink, no depth.

    align is "CENTER" or "LEFT" (the text starts at x = 0); bold_mm thickens the strokes."""
    curve = bpy.data.curves.new("glyph_tmp", "FONT")
    curve.body = text
    curve.size = size_mm
    curve.extrude = 0.0
    curve.offset = bold_mm
    curve.align_x = align
    curve.align_y = "CENTER"
    curve.resolution_u = 3
    curve.fill_mode = "FRONT"
    obj = bpy.data.objects.new("glyph_tmp", curve)
    bpy.context.scene.collection.objects.link(obj)
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    verts = [tuple(v.co) for v in me.vertices]
    faces = [tuple(p.vertices) for p in me.polygons]
    bpy.data.objects.remove(obj)
    bpy.data.curves.remove(curve)
    bpy.data.meshes.remove(me)
    return verts, faces


def frame_matrix(origin, x_axis, y_axis):
    """4x4 matrix mapping local X/Y/Z (Z = X x Y) to the given axes at origin (mm)."""
    x = Vector(x_axis).normalized()
    y = Vector(y_axis).normalized()
    z = x.cross(y)
    m = Matrix.Identity(4)
    for i in range(3):
        m[i][0], m[i][1], m[i][2], m[i][3] = x[i], y[i], z[i], origin[i]
    return m


def gltf_point(p_mm):
    """Blender-local point (mm) -> glTF-local point (m, Y-up)."""
    x, y, z = p_mm
    return [x * MM, z * MM, -y * MM]


def set_anchors(obj, key, points_mm):
    """Store points (node-local, Blender mm) as a flat glTF-local list in extras[key].

    Acceptance tests use anchors to identify features (which glyph is which digit,
    where the gear plane is) without re-deriving the build geometry."""
    flat = []
    for p in points_mm:
        flat += gltf_point(p)
    obj[key] = flat


def set_labels(obj, label_en):
    """Hover/callout name (glTF extras), for parts without motion too. More languages later."""
    obj["label_en"] = label_en


def set_explode(obj, offset_mm):
    """Exploded-view offset (Blender mm, in the parent's frame) as glTF-frame mm in extras."""
    x, y, z = offset_mm
    obj["explode"] = [x, z, -y]


def set_motion(obj, motion, axis_blender, label_en, unit="deg"):
    """Record how the web code animates this node (glTF extras, axis in glTF Y-up)."""
    bx, by, bz = axis_blender
    obj["motion"] = motion
    obj["axis"] = [bx, bz, -by]  # Blender (x, y, z) -> glTF (x, z, -y)
    obj["unit"] = unit
    obj["label_en"] = label_en


def mesh_data(obj):
    """(verts in mm, faces) of an object's evaluated mesh, in its local frame."""
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    verts = [tuple(c / MM for c in v.co) for v in me.vertices]
    faces = [tuple(p.vertices) for p in me.polygons]
    bpy.data.meshes.remove(me)
    return verts, faces


def cut_holes(mb, holes, plane, t0, t1, collection, segments=32, polys=()):
    """Mesh data of MeshBuilder mb's single prism with holes cut through it.

    holes: (u, w, radius) round holes; polys: polygons [(u, w), ...] (slots, cut-outs); both in
    the plane's coordinates, cut from t0 - 1 to t1 + 1 mm.
    Returns (verts, faces) in mm, ready for MeshBuilder.add_mesh_data."""
    plate = mb.build("__plate", collection)
    cut = MeshBuilder()
    for u, w, r in holes:
        cut.prism([(u + du, w + dw) for du, dw in _circle(r, segments)], plane, t0 - 1.0, t1 + 1.0, mb.mats[0])
    for poly in polys:
        cut.prism(poly, plane, t0 - 1.0, t1 + 1.0, mb.mats[0])
    cutter = cut.build("__cutter", collection)
    mod = plate.modifiers.new("holes", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.solver = "EXACT"
    mod.object = cutter
    data = mesh_data(plate)
    for o in (plate, cutter):
        me = o.data
        bpy.data.objects.remove(o)
        bpy.data.meshes.remove(me)
    return data


def _circle(r, n):
    return [(r * math.cos(2 * math.pi * i / n), r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def set_path(obj, moves_mm):
    """A unit's way out (glTF extras "path"): cumulative waypoints from its seated place, in
    glTF-frame mm, flattened; moves are Blender-frame (x, y, z) steps."""
    pts = [0.0, 0.0, 0.0]
    x = y = z = 0.0
    for dx, dy, dz in moves_mm:
        x, y, z = x + dx, y + dy, z + dz
        pts += [x, z, -y]
    obj["motion"] = "path"
    obj["path"] = pts


def tube_path(mb, points, radius, mat, n=12, bend=None, steps=8):
    """A cord: one round tube swept along a polyline of (x, y, z) mm points, each corner
    rounded into a quadratic Bezier bend (radius bend, 3 x the tube's by default, less where
    the segments are short), the ring carried along without twist; capped at both ends."""
    from mathutils import Vector

    pts = [Vector(p) for p in points]
    bend = 3.0 * radius if bend is None else bend
    # the centre line: straight runs, and a Bezier through each corner
    line = [pts[0]]
    for k in range(1, len(pts) - 1):
        a, c, b = pts[k - 1], pts[k], pts[k + 1]
        d0, d1 = (c - a), (b - c)
        if d0.length < 1e-6 or d1.length < 1e-6:
            continue
        ang = d0.angle(d1)
        if ang < 1e-3:
            continue
        t = min(bend * math.tan(ang / 2), 0.45 * d0.length, 0.45 * d1.length)
        p0, p2 = c - d0.normalized() * t, c + d1.normalized() * t
        m = max(2, round(steps * ang / (math.pi / 2)))
        for i in range(m + 1):
            u = i / m
            line.append((1 - u) ** 2 * p0 + 2 * (1 - u) * u * c + u ** 2 * p2)
    line.append(pts[-1])
    # tangents, and a ring frame transported along them (rotation-minimising)
    tans = []
    for k in range(len(line)):
        d = line[min(k + 1, len(line) - 1)] - line[max(k - 1, 0)]
        tans.append(d.normalized())
    nrm = tans[0].orthogonal().normalized()
    mi = mb._mat(mat)
    base = len(mb.verts)
    for k, (c, t) in enumerate(zip(line, tans)):
        if k:
            nrm = tans[k - 1].rotation_difference(t) @ nrm
            nrm = (nrm - t * nrm.dot(t)).normalized()
        bin_ = t.cross(nrm)
        for i in range(n):
            a = 2 * math.pi * i / n
            p = c + (nrm * math.cos(a) + bin_ * math.sin(a)) * radius
            mb.verts.append((p.x, p.y, p.z))
    rings = len(line)
    for k in range(rings - 1):
        r0, r1 = base + k * n, base + (k + 1) * n
        for i in range(n):
            j = (i + 1) % n
            mb._add([r0 + i, r0 + j, r1 + j, r1 + i], mi, True)
    mb._add(list(reversed(range(base, base + n))), mi, False)
    last = base + (rings - 1) * n
    mb._add(list(range(last, last + n)), mi, False)


def svg_flat(path):
    """The filled shapes of an SVG file as flat meshes: [(verts, faces, rgb)], verts as (u, w) in
    the SVG's own units and frame (x right, y down), one entry per path, holes kept (even-odd)."""
    import addon_utils

    addon_utils.enable("io_curve_svg", default_set=False)
    before_objs, before_cols = set(bpy.data.objects), set(bpy.data.collections)
    before_mats = set(bpy.data.materials)
    bpy.ops.import_curve.svg(filepath=path)
    new = [o for o in bpy.data.objects if o not in before_objs and o.type == "CURVE"]
    # the importer scales by its own DPI: recover SVG units from the drawing's width
    xs = [(o.matrix_world @ Vector(pt.co[:3])).x for o in new for sp in o.data.splines for pt in sp.bezier_points]
    ys = [(o.matrix_world @ Vector(pt.co[:3])).y for o in new for sp in o.data.splines for pt in sp.bezier_points]
    x0, y_top = min(xs), max(ys)
    k = (max(xs) - x0) / SVG_TITLE_WIDTH
    out = []
    for o in new:
        o.data.resolution_u = 4                          # 4 steps a Bezier segment: smooth at plate size
    dg = bpy.context.evaluated_depsgraph_get()
    for o in new:
        rgb = tuple(o.active_material.diffuse_color[:3]) if o.active_material else (0.0, 0.0, 0.0)
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        verts = [((v.x - x0) / k, (y_top - v.y) / k) for v in (o.matrix_world @ vv.co for vv in me.vertices)]
        faces = [list(reversed(pl.vertices)) if pl.normal.z < 0 else list(pl.vertices) for pl in me.polygons]
        out.append((verts, faces, rgb))
        bpy.data.meshes.remove(me)
    for o in [o for o in bpy.data.objects if o not in before_objs]:
        data = o.data
        bpy.data.objects.remove(o)
        if data is not None and data.users == 0:
            bpy.data.curves.remove(data)
    for c in [c for c in bpy.data.collections if c not in before_cols]:
        bpy.data.collections.remove(c)
    for m in [m for m in bpy.data.materials if m not in before_mats]:
        bpy.data.materials.remove(m)
    return out


# The title SVG's drawing runs from x = 0 to this (its paths' extent, not the viewBox's 682).
SVG_TITLE_WIDTH = 681.19

