"""Where the front panel's parts are, in the machine frame (mm), from params. No bpy.

Frame: origin at the centre of the base footprint on its bottom face; +X left to right
seen from the front, +Y toward the back, +Z up. The panel faces -Y.
"""

import math

# The simulator's ids, in the order its panel lists them.
LAMP_IDS = ["inte", "prot", "memr", "inp", "m1", "out", "hlta", "stack", "wo", "int",
            "d7", "d6", "d5", "d4", "d3", "d2", "d1", "d0",
            "wait", "hlda"] + [f"a{i}" for i in range(15, -1, -1)]
SWITCH_IDS = ["off-on"] + [f"s{i}" for i in range(15, -1, -1)] + [
    "stop-run", "single", "examine", "deposit", "reset", "protect", "aux1", "aux2"]
MOMENTARY = {"stop-run", "single", "examine", "deposit", "reset", "protect", "aux1", "aux2"}

# What is lettered above and below each control switch (None: nothing; that way it does not go).
CONTROL_LABELS = {
    "off-on": (["OFF"], ["ON"]),
    "stop-run": (["STOP"], ["RUN"]),
    "single": (["SINGLE", "STEP"], None),
    "examine": (["EXAMINE"], ["EXAMINE", "NEXT"]),
    "deposit": (["DEPOSIT"], ["DEPOSIT", "NEXT"]),
    "reset": (["RESET"], ["CLR"]),
    "protect": (["PROTECT"], ["UNPROTECT"]),
    "aux1": (["AUX"], None),
    "aux2": (["AUX"], None),
}


def node_id(sim_id):
    """Simulator id -> the node name's last part ('off-on' -> 'off_on')."""
    return sim_id.replace("-", "_")


def lamp_label(lamp_id):
    return lamp_id.upper()


class Layout:
    def __init__(self, p):
        self.p = p
        self.W, self.H, self.D = p.v("box.width"), p.v("box.height"), p.v("box.depth")
        self.ow, self.oh = p.v("bezel.opening")
        self.lip = p.v("bezel.lip_thickness")
        self.face = p.v("bezel.face_width")
        self.recess = p.v("bezel.recess_depth")
        self.zc = self.H / 2.0                       # the panel is centred in the box front
        self.y_front = -self.D / 2.0                 # bezel front face
        self.dw, self.dh = p.v("dress_panel.size")
        self.dt = p.v("dress_panel.thickness")
        self.gap = p.v("dress_panel.gap")
        self.y_dress_front = self.y_front + self.recess + self.gap   # behind the retaining lip
        self.y_dress_back = self.y_dress_front + self.dt
        self.st = p.v("sub_panel.thickness")
        self.y_sub_front = self.y_dress_back + self.gap   # the dress panel lies against the sub-panel
        self.y_sub_back = self.y_sub_front + self.st
        self.y_board_front = self.y_sub_back + p.v("dc_board.spacer")
        self.y_board_back = self.y_board_front + p.v("dc_board.thickness")
        gx, gz = p.v("dress_panel.grid_origin")
        self.a0 = (gx, self.zc + gz)                  # the A0 lamp (x, z)
        self.rows = p.v("grid.row_z")
        # switch parts along Y
        self.bushing_front = self.y_sub_back - p.v("switch.bushing_length")
        self.y_pivot = self.bushing_front + p.v("switch.pivot_behind_bushing_front")
        self.y_led_front = self.y_dress_front - p.v("led.proud")

    def lamp(self, lamp_id):
        """(x, z) of a lamp's centre."""
        dx = self.p.v("grid.lamp_x")[lamp_id]
        row = self.p.v("grid.lamp_row")[lamp_id]
        return (self.a0[0] + dx, self.a0[1] + self.rows[row])

    def switch(self, sw_id):
        """(x, z) of a switch's pivot."""
        dx = self.p.v("grid.switch_x")[sw_id]
        row = "switches" if sw_id.startswith("s") and sw_id[1:].isdigit() else "controls"
        return (self.a0[0] + dx, self.a0[1] + self.rows[row])

    def nut_circumradius(self):
        return self.p.v("switch.nut_across_flats") / math.sqrt(3.0)
