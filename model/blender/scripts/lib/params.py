"""Load params/machine.json and give plain access to values (mm / deg)."""

import json
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
MACHINE_DIR = os.path.normpath(os.path.join(_HERE, "..", "..", ".."))
PARAMS_PATH = os.path.join(MACHINE_DIR, "params", "machine.json")


class Params:
    def __init__(self, path=PARAMS_PATH):
        with open(path, encoding="utf-8") as f:
            self.raw = json.load(f)

    def v(self, dotted):
        """Value of an entry such as 'geometry.drum.module' (the 'v' field)."""
        node = self.raw
        for key in dotted.split("."):
            node = node[key]
        if isinstance(node, dict) and "v" in node:
            return node["v"]
        raise KeyError(f"{dotted} is not a value entry")


def load():
    return Params()
