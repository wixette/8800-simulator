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
 * @fileoverview The 3D box, posed as the page's box has it
 * (js/box.js): each unit along its way out, each card in its slot and
 * lifted out of it, the cards a memory size does not fit hidden; and
 * the Show presets, fading or hiding parts (docs/3d-view.md, V3, V4).
 * The model's parts are its nodes with a label, each with geometry of
 * its own and the parts fixed to it as its children.
 */

import * as THREE from 'three';
import {CARD_IDS} from '../box.js';
import {CARD_LIFT, REST_SLOT, SHOWS, UNFRAMED_MATERIALS, lookOf} from './views.js';

/**
 * A Show preset's faded part is outlined: pale over the pale parts
 * inside it, the fade alone could pass for the part being gone.
 */
const OUTLINE = new THREE.LineBasicMaterial({color: 0xcfd6dc, transparent: true, opacity: 0.55,
                                             depthWrite: false});
/** Edges sharper than this, in degrees, are outlined. */
const OUTLINE_ANGLE = 30;

/** The glow on a part a Tutorial step points at: the page's orange. */
const HIGHLIGHT = new THREE.Color(0xff9900);
const HIGHLIGHT_INTENSITY = 0.35;

export class BoxBinding {
    /**
     * @param {!THREE.Object3D} root The model.
     * @param {!Object} box The page's box (js/box.js).
     */
    constructor(root, box) {
        this.root = root;
        this.box = box;
        /** @type {!Map<string, !THREE.Object3D>} Every labelled part, by node name. */
        this.parts = new Map();
        /** @type {!Map<string, !THREE.Object3D>} Every node, by its name in the model. */
        this.nodes = new Map();
        root.traverse((o) => {
            if (o.userData.modelName) {
                this.nodes.set(o.userData.modelName, o);
            }
            if (o.userData.label_en) {
                this.parts.set(o.userData.modelName, o);
            }
        });
        /** @type {!Map<string, {node: !THREE.Object3D, rest: !THREE.Vector3, points: !Array<!THREE.Vector3>, length: number}>} */
        this.paths = new Map();
        for (const node of this.parts.values()) {
            const flat = node.userData.path;
            if (node.userData.motion != 'path' || !Array.isArray(flat)) {
                continue;
            }
            const points = [];
            for (let i = 0; i < flat.length; i += 3) {
                points.push(new THREE.Vector3(flat[i], flat[i + 1], flat[i + 2]).multiplyScalar(0.001));
            }
            let length = 0;
            for (let i = 1; i < points.length; i++) {
                length += points[i].distanceTo(points[i - 1]);
            }
            this.paths.set(this.modelName(node), {node: node, rest: node.position.clone(),
                                                  points: points, length: length});
        }
        /** Each card's slot carrier and card, with their rest places. */
        this.cards = {};
        this.slotX = {};
        for (const card of CARD_IDS) {
            const slot = this.find('slot.' + card);
            const node = this.find('card.' + card);
            this.cards[card] = {slot: slot, node: node, slotRest: slot.position.clone(),
                                cardRest: node.position.clone()};
            this.slotX[REST_SLOT[card].join(',')] = slot.position.x;
        }
        /** @type {!Map<!THREE.Material, !Object>} Each material as the model had it. */
        this.looks = new Map();
        // Every part gets materials of its own, so that one can fade alone.
        for (const node of this.parts.values()) {
            for (const mesh of this.ownMeshes(node)) {
                mesh.material = [].concat(mesh.material).map((m) => {
                    const own = m.clone();
                    this.looks.set(own, {transparent: m.transparent, opacity: m.opacity,
                                         depthWrite: m.depthWrite,
                                         emissive: m.emissive ? m.emissive.clone() : null,
                                         emissiveIntensity: m.emissiveIntensity});
                    return own;
                });
                if (mesh.material.length == 1) {
                    mesh.material = mesh.material[0];
                }
            }
        }
        this.show = 'all';
        this.pose();
    }

    /**
     * @param {!THREE.Object3D} node A part.
     * @return {string} Its name in the model, such as 'case.top' (the
     *     viewer keeps it as it loads, since three.js drops the dots).
     */
    modelName(node) {
        return node.userData.modelName || node.name;
    }

    /**
     * A node by its name in the model.
     * @param {string} name Such as 'card.cpu'.
     * @return {!THREE.Object3D} The node.
     */
    find(name) {
        const node = this.nodes.get(name);
        if (!node) {
            throw new Error('The model has no ' + name);
        }
        return node;
    }

    /**
     * A part's own meshes: those not inside another labelled part.
     * @param {!THREE.Object3D} node The part.
     * @return {!Array<!THREE.Mesh>} Its meshes.
     */
    ownMeshes(node) {
        const out = [];
        const walk = (o) => {
            if (o.isMesh) {
                out.push(o);
            }
            for (const child of o.children) {
                if (!child.userData.label_en) {
                    walk(child);
                }
            }
        };
        walk(node);
        return out;
    }

    /**
     * Poses every unit and card as the box has them now.
     * @param {function(string): number=} at Where each unit is, 0 in to
     *     1 out, if not where the box has it: a view frames the parts
     *     where they are going to be.
     */
    pose(at = (unit) => this.box.position(unit)) {
        const box = this.box;
        for (const [unit, path] of this.paths) {
            path.node.position.copy(path.rest).add(this.along(path, at(unit)));
        }
        for (const card of CARD_IDS) {
            const {slot, node, slotRest, cardRest} = this.cards[card];
            const where = box.slotOf(card);
            slot.visible = !!where;
            if (where) {
                slot.position.copy(slotRest);
                slot.position.x = this.slotX[where.join(',')];
            }
            node.position.copy(cardRest);
            node.position.y += CARD_LIFT * at('card.' + card);
        }
    }

    /** @private */
    along(path, share) {
        let left = share * path.length;
        const p = new THREE.Vector3();
        for (let i = 1; i < path.points.length; i++) {
            const seg = path.points[i].distanceTo(path.points[i - 1]);
            const f = seg == 0 ? 0 : Math.max(0, Math.min(1, left / seg));
            p.lerpVectors(path.points[i - 1], path.points[i], f);
            left -= seg;
            if (left <= 0) {
                break;
            }
        }
        return p;
    }

    /**
     * Fades or hides parts as a Show preset says, and shows the rest as
     * the model has them.
     * @param {string} id The preset.
     */
    setShow(id) {
        this.show = SHOWS.find((s) => s.id == id).id;
        this.applyLooks();
    }

    /** @private Draws every part as the Show preset says. */
    applyLooks() {
        const preset = SHOWS.find((s) => s.id == this.show);
        for (const node of this.parts.values()) {
            const name = this.modelName(node);
            const {glows, kept, faded, hidden, opacity: fade, outlined} = lookOf(name, preset);
            node.userData.seeThrough = faded || hidden;
            for (const mesh of this.ownMeshes(node)) {
                for (const m of [].concat(mesh.material)) {
                    const look = this.looks.get(m);
                    m.visible = !hidden;
                    m.transparent = faded || look.transparent;
                    m.opacity = faded ? fade * look.opacity : look.opacity;
                    m.depthWrite = faded ? false : look.depthWrite;
                    if (look.emissive && !kept) {
                        m.emissive.copy(glows ? HIGHLIGHT : look.emissive);
                        m.emissiveIntensity = glows ? HIGHLIGHT_INTENSITY : look.emissiveIntensity;
                    }
                    m.needsUpdate = true;
                }
                this.outline(mesh, outlined);
                if (mesh.userData.castsShadow === undefined) {
                    mesh.userData.castsShadow = mesh.castShadow;
                }
                mesh.castShadow = !faded && !hidden && mesh.userData.castsShadow;
            }
        }
    }

    /**
     * @private Shows or hides a mesh's outline, made the first time it
     * is wanted. It is no part of what a click can hit.
     * @param {!THREE.Mesh} mesh The mesh.
     * @param {boolean} shown Whether it is outlined.
     */
    outline(mesh, shown) {
        let lines = mesh.userData.outline;
        if (!lines && shown) {
            lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, OUTLINE_ANGLE),
                                           OUTLINE);
            lines.raycast = () => {};
            mesh.add(lines);
            mesh.userData.outline = lines;
        }
        if (lines) {
            lines.visible = shown;
        }
    }

    /**
     * The labelled part a ray hit, and the unit of the box it belongs
     * to, if any: a click on a card's chip is a click on the card.
     * @param {!THREE.Object3D} object What the ray hit.
     * @return {?{part: string, unit: ?string}} Names in the model.
     */
    partAt(object) {
        let part = null;
        for (let n = object; n; n = n.parent) {
            if (n.userData.label_en && !/^slot\./.test(this.modelName(n))) {
                const name = this.modelName(n);
                if (!part) {
                    part = name;
                }
                if (this.paths.has(name) || /^card\./.test(name)) {
                    return {part: part, unit: name};
                }
            }
        }
        return part ? {part: part, unit: null} : null;
    }

    /**
     * Each part's box in the world, as the box will be once it stops
     * moving: what a view frames.
     * @param {function(!THREE.Object3D): boolean=} which The parts.
     * @return {!Array<{min: !Array<number>, max: !Array<number>}>}
     */
    boxes(which = () => true) {
        this.root.updateMatrixWorld(true);
        const out = [];
        for (const node of this.parts.values()) {
            if (!which(node) || !this.isDrawn(node)) {
                continue;
            }
            const b = new THREE.Box3();
            for (const mesh of this.ownMeshes(node)) {
                if (![].concat(mesh.material).every((m) => UNFRAMED_MATERIALS.includes(m.name))) {
                    b.expandByObject(mesh, true);
                }
            }
            if (!b.isEmpty()) {
                out.push({min: b.min.toArray(), max: b.max.toArray()});
            }
        }
        return out;
    }

    /** @private */
    isDrawn(node) {
        for (let n = node; n; n = n.parent) {
            if (!n.visible) {
                return false;
            }
        }
        return true;
    }
}
