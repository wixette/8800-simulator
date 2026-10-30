/**
 *   Copyright 2020-2026 wixette@gmail.com
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 * @fileoverview The 3D front panel (docs/3d-view.md, V5): its 25 bats
 * stand as the 2D panel's levers do and its 36 lamps light as the 2D
 * panel's do, both told by panel.onPanelChange(), and a click on it
 * throws a switch through panel.operate(), the same call as a click on
 * the 2D panel. Nothing here knows what a switch does.
 */

import * as THREE from 'three';

/** A lit LED's glow, and how strongly, under the neutral tone mapping. */
const LIT = new THREE.Color(0xff1606);
const LIT_INTENSITY = 2.5;
const DARK = new THREE.Color(0x000000);

/** How long a bat takes to swing to its stop, in seconds. */
const SWING_S = 0.04;

/** How long a command switch is held at its stop before it springs back. */
const HOLD_S = 0.15;

/**
 * How far round a switch's pivot a click counts for it, in metres: a
 * little under half the panel's grid either way, so a control switch's
 * lettering above and below is part of it, as on the 2D panel.
 */
const ZONE = {
    address: {x: 0.45 * 0.01524, y: 0.35 * 0.03048},
    control: {x: 0.5 * 0.03048, y: 0.5 * 0.03048},
};

/** How far in front of the panel a click may land and still count. */
const ZONE_DEPTH = 0.03;

/**
 * @param {!THREE.Object3D} object A part of the model.
 * @return {boolean} Whether it latches (A0-A15, OFF/ON) rather than
 *     springing back to its centre.
 */
function latches(object) {
    return object.userData.kind == 'latching';
}

export class PanelBinding {
    /**
     * @param {!THREE.Object3D} root The model.
     * @param {!Object} panel The page's panel.
     * @param {function()} invalidate Asks for a frame.
     */
    constructor(root, panel, invalidate) {
        this.panel = panel;
        this.invalidate = invalidate;
        /** @type {!Map<string, !Object>} Each switch's bat and its motion. */
        this.bats = new Map();
        /** @type {!Map<string, !Array<!THREE.Mesh>>} Each lamp's meshes. */
        this.lamps = new Map();
        /** @type {!Map<string, boolean>} Lamps to draw at the next frame. */
        this.pendingLamps = new Map();
        root.traverse((o) => {
            const id = o.userData.switch_id;
            if (id) {
                this.bats.set(id, {
                    node: o,
                    rest: o.quaternion.clone(),
                    axis: new THREE.Vector3().fromArray(o.userData.axis).normalize(),
                    throwDeg: o.userData.throw_deg,
                    angle: 0,
                    target: 0,
                    hold: 0,
                });
            }
            const lamp = o.userData.lamp_id;
            if (lamp) {
                // Lit through the materials the meshes draw with, which
                // are each part's own (boxBind.js), so a lamp lights alone.
                const meshes = [];
                o.traverse((m) => {
                    if (m.isMesh) {
                        meshes.push(m);
                    }
                });
                this.lamps.set(lamp, meshes);
            }
        });
        // The panel as it stands now, then as it changes.
        for (const [id, bat] of this.bats) {
            bat.target = bat.angle = this.restAngle(id, bat);
            this.pose(bat);
        }
        for (const id of this.lamps.keys()) {
            this.pendingLamps.set(id, !!panel.lamps[id]);
        }
        panel.onPanelChange((kind, id, value) => this.onChange(kind, id, value));
    }

    /**
     * Where a bat rests, as the 2D panel's lever stands.
     * @private
     */
    restAngle(id, bat) {
        return this.panel.switchPosition(id) * bat.throwDeg;
    }

    /** @private */
    onChange(kind, id, value) {
        if (kind == 'lamp') {
            if (this.lamps.has(id)) {
                // Drawn at the next frame, however often it changes before.
                this.pendingLamps.set(id, value);
                this.invalidate();
            }
            return;
        }
        const bat = this.bats.get(id);
        if (!bat) {
            return;
        }
        if (kind == 'switch') {
            bat.target = value * bat.throwDeg;
        } else if (kind == 'throw') {
            bat.target = (value == 'up' ? 1 : -1) * bat.throwDeg;
            bat.hold = HOLD_S;
        }
        this.invalidate();
    }

    /**
     * Moves the bats and lights the lamps.
     * @param {number} dt Seconds since the last frame.
     * @return {boolean} Whether anything changed.
     */
    update(dt) {
        let moved = false;
        for (const [id, on] of this.pendingLamps) {
            for (const mesh of this.lamps.get(id)) {
                for (const m of [].concat(mesh.material)) {
                    m.emissive.copy(on ? LIT : DARK);
                    m.emissiveIntensity = on ? LIT_INTENSITY : 0;
                }
            }
            moved = true;
        }
        this.pendingLamps.clear();
        for (const bat of this.bats.values()) {
            if (bat.angle == bat.target) {
                if (bat.hold > 0) {
                    bat.hold -= dt;
                    if (bat.hold <= 0) {
                        bat.hold = 0;
                        bat.target = 0;
                    }
                    moved = true;
                }
                continue;
            }
            const step = bat.throwDeg / SWING_S * dt;
            const d = bat.target - bat.angle;
            bat.angle = Math.abs(d) <= step ? bat.target : bat.angle + Math.sign(d) * step;
            this.pose(bat);
            moved = true;
        }
        return moved;
    }

    /** @private */
    pose(bat) {
        const q = new THREE.Quaternion().setFromAxisAngle(
            bat.axis, THREE.MathUtils.degToRad(bat.angle));
        bat.node.quaternion.copy(bat.rest).multiply(q);
    }

    /**
     * @param {string} id A lamp.
     * @return {boolean} Whether it is drawn lit.
     */
    isLit(id) {
        const m = [].concat(this.lamps.get(id)[0].material)[0];
        return m.emissiveIntensity > 0 && m.emissive.getHex() != 0;
    }

    /**
     * @param {string} id A switch.
     * @return {number} Its bat's angle now, in degrees, + up.
     */
    angleOf(id) {
        return this.bats.get(id).angle;
    }

    /**
     * The switch, and the way, a click on the model means: on a bat, the
     * half of it clicked (a latching switch flips); on the panel near a
     * switch, above or below its pivot.
     * @param {!THREE.Object3D} object What the pointer's ray hit.
     * @param {!THREE.Vector3} point Where, in the world.
     * @return {?{id: string, dir: string}} The throw, or null if the
     *     click is on no switch.
     */
    pick(object, point) {
        for (let n = object; n; n = n.parent) {
            const id = n.userData.switch_id;
            if (id) {
                return this.throwFor(id, n, point);
            }
        }
        for (const [id, bat] of this.bats) {
            const pivot = bat.node.getWorldPosition(new THREE.Vector3());
            const zone = /^s\d+$/.test(id) ? ZONE.address : ZONE.control;
            if (Math.abs(point.x - pivot.x) <= zone.x &&
                Math.abs(point.y - pivot.y) <= zone.y &&
                Math.abs(point.z - pivot.z) <= ZONE_DEPTH) {
                return this.throwFor(id, bat.node, point);
            }
        }
        return null;
    }

    /** @private */
    throwFor(id, node, point) {
        if (latches(node)) {
            return {id: id, dir: this.panel.switchPosition(id) > 0 ? 'down' : 'up'};
        }
        const pivot = node.getWorldPosition(new THREE.Vector3());
        return {id: id, dir: point.y >= pivot.y ? 'up' : 'down'};
    }
}
