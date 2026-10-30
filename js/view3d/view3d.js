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
 * @fileoverview The 3D view (docs/3d-view.md): the whole machine, its
 * front panel working as the 2D one does, fading and hiding parts, and
 * taking it apart. js/panel-view.js loads this the first time the
 * reader chooses 3D, so a page that never shows it never fetches
 * three.js or the model (M5).
 *
 * It draws the page's own machine and box. Every switch it throws goes
 * through panel.operate(), every part it moves through panel.box, so
 * what it allows and refuses is what the rest of the page allows and
 * refuses (M4).
 */

import * as THREE from 'three';
import {Dropdown} from '../dropdown.js';
import {l10n} from '../l10n.js';
import {BoxBinding} from './boxBind.js';
import {corners, frame} from './framing.js';
import {PanelBinding} from './panelBind.js';
import {Viewer} from './viewer.js';
import {HOME_VIEW, PANEL_SUBJECT, SHOWS, VIEWS, WIRED, partKey, switchName} from './views.js';

/** A press and release this close together, in px and ms, is a click. */
const CLICK_PX = 5;
const CLICK_MS = 500;

/** The camera's field of view, in degrees. */
const FOV = 35;

/** What each view keeps clear of the canvas's edges, in CSS pixels. */
const GAP = 8;

/** How far one press of an arrow key turns the view. */
const TURN = 8 * Math.PI / 180;

/** And Shift with an arrow moves it, as a share of the distance. */
const PAN_STEP = 0.06;

/** And + or − zooms it, as a factor of the distance. */
const ZOOM_STEP = 1.25;

/**
 * The 3D view, once loaded.
 */
export class Stage {
    /**
     * @param {!Object} panel The page's panel.
     * @param {!HTMLElement} host Where the canvas goes.
     */
    constructor(panel, host) {
        this.panel = panel;
        this.host = host;
        this.viewer = new Viewer(host);
        this.canvas = this.viewer.canvas;
        this.canvas.id = 'stage3d-canvas';
        this.canvas.tabIndex = 0;
        /** The view on show, and whether the camera is still where it put it. */
        this.view = HOME_VIEW;
        this.fitted = HOME_VIEW;
        /** Whether Taken apart moved the parts out (V4). */
        this.apart = false;
        this.root = null;
        this.panelBind = null;
        this.boxBind = null;
        this.label = document.getElementById('part-label');
        this.labelTimer = 0;
    }

    /**
     * Loads the model and binds it to the page's machine.
     * @param {string} url The .glb.
     * @param {function(number)} onProgress The share of it loaded.
     * @return {!Promise}
     */
    async load(url, onProgress) {
        this.root = await this.viewer.load(url, onProgress);
        const invalidate = () => this.viewer.invalidate();
        // The box first: it gives every part materials of its own, which
        // the panel's lamps then light.
        this.boxBind = new BoxBinding(this.root, this.panel.box);
        this.panelBind = new PanelBinding(this.root, this.panel, invalidate);
        this.panel.box.onChange = () => {
            this.boxBind.pose();
            invalidate();
        };
        this.viewer.fitShadow(new THREE.Box3().setFromObject(this.root));
        this.viewer.onFrame.push((dt) => this.frame(dt));
        this.viewer.onResize.push(() => this.refit());
        this.viewer.controls.addEventListener('start', () => {
            // The reader took the camera; it stays where they put it.
            this.fitted = null;
            this.hideLabel();
        });
        this.viewer.controls.addEventListener('change', () => this.refreshZoom());
        this.initPointer();
        this.initKeys();
        this.initTools();
        this.place(HOME_VIEW, false);
    }

    /** Shows the view: starts drawing, and catches up with the box. */
    show() {
        this.boxBind.pose();
        this.viewer.start();
        this.refit();
    }

    /** Hides the view: stops drawing. */
    hide() {
        this.unpoint();
        this.hideLabel();
        this.viewer.stop();
    }

    // ---- each frame ----

    /** @private */
    frame(dt) {
        let moved = this.panelBind.update(dt);
        const box = this.panel.box;
        if (box.isBusy()) {
            box.update(dt);
            this.boxBind.pose();
            moved = true;
            // Taken apart says how to put it back once the last part is out.
            if (!box.isBusy() && this.apart) {
                this.panel.setStatus('view-apart-done');
            }
        }
        if (moved) {
            this.viewer.invalidate();
        }
        return moved;
    }

    // ---- the views ----

    /**
     * Shows a view from the Views menu, or Reset view.
     * @param {string} id The view.
     */
    setView(id) {
        this.unpoint();
        if (id == 'apart') {
            if (this.panel.isPoweredOn) {
                this.panel.setStatus('box-switch-off', {}, 'warn');
                return;
            }
            const why = this.panel.box.takeAllApart(false);
            if (why) {
                this.panel.sayBox(why);
                return;
            }
            this.apart = true;
        } else if (this.apart) {
            // Leaving Taken apart puts back what it took out (V4).
            this.apart = false;
            this.panel.box.snap();
            this.panel.box.putAllBack();
            this.panel.setStatus('view-reassembling');
        }
        this.place(id, true);
        this.refreshTools();
    }

    /**
     * Puts the camera on a view.
     * @private
     * @param {string} id The view.
     * @param {boolean} fly Whether to fly there, or jump.
     */
    place(id, fly) {
        this.view = id;
        this.fitted = id;
        const f = this.framing(id);
        if (fly) {
            this.viewer.flyTo(f.position, f.target);
        } else {
            this.viewer.jumpTo(f.position, f.target);
        }
        this.refreshTools();
    }

    /**
     * Where the camera goes for a view, framing its parts where they are
     * going to be: taken apart, all out; otherwise, all in place.
     * @param {string} id The view.
     * @return {{position: !Array<number>, target: !Array<number>}}
     */
    framing(id) {
        const view = VIEWS.find((v) => v.id == id);
        const out = id == 'apart';
        this.boxBind.pose(() => out ? 1 : 0);
        const which = view.subject == 'panel' ?
              (node) => {
                  const name = this.boxBind.modelName(node);
                  return PANEL_SUBJECT.includes(name) || /^panel\.switch\./.test(name);
              } :
              () => true;
        const points = corners(this.boxBind.boxes(which));
        this.boxBind.pose();
        const {width, height} = this.viewer.size();
        return frame(points, view.dir, FOV, width, height,
                     {top: GAP, right: GAP, bottom: GAP, left: GAP});
    }

    /** The canvas changed size: a view the page chose fits it again. */
    refit() {
        if (this.fitted && !this.viewer.isFlying() && this.root) {
            const f = this.framing(this.fitted);
            this.viewer.jumpTo(f.position, f.target);
        }
    }

    /**
     * Fades or hides parts (V3).
     * @param {string} id The Show preset.
     */
    setShow(id) {
        this.unpoint();
        this.boxBind.setShow(id);
        this.hideLabel();
        this.viewer.invalidate();
        this.refreshTools();
    }

    // ---- pointing at parts, for the Tutorial (V7) ----

    /**
     * Points at some parts: they glow, the rest fade, and the camera
     * flies to frame them from a view's direction. What a Tutorial
     * step's Show does; the next choice of view or Show ends it.
     * @param {!Array<string>} names The parts, by their names in the
     *     model; 'memory' is the memory cards the box holds now.
     * @param {string} from The view whose direction to look from.
     * @return {!Array<string>} The parts pointed at.
     */
    point(names, from) {
        const parts = [];
        for (const name of names) {
            if (name == 'memory') {
                parts.push(...this.panel.box.cards().filter((c) => /^mem/.test(c))
                           .map((c) => 'card.' + c));
            } else {
                parts.push(name);
            }
        }
        this.boxBind.setHighlight(parts);
        const view = VIEWS.find((v) => v.id == from);
        const points = corners(this.boxBind.boxes(
            (node) => parts.includes(this.boxBind.modelName(node))));
        const {width, height} = this.viewer.size();
        const f = frame(points, view.dir, FOV, width, height,
                        {top: GAP, right: GAP, bottom: GAP, left: GAP}, 0.5);
        this.fitted = null;
        this.viewer.flyTo(f.position, f.target);
        this.viewer.invalidate();
        return parts;
    }

    /** Stops pointing at parts. */
    unpoint() {
        if (this.boxBind.highlight) {
            this.boxBind.setHighlight(null);
            this.viewer.invalidate();
        }
    }

    // ---- the camera, by keys and buttons (V2) ----

    /** Zooms by a factor of the distance to what the camera looks at. */
    zoom(factor) {
        const {camera, controls} = this.viewer;
        const off = camera.position.clone().sub(controls.target);
        const d = THREE.MathUtils.clamp(off.length() * factor, controls.minDistance,
                                        controls.maxDistance);
        this.step(controls.target.clone().addScaledVector(off.normalize(), d),
                  controls.target.clone());
    }

    /** Turns the camera round what it looks at, across and up, within its limits. */
    orbit(dTheta, dPhi) {
        const {camera, controls} = this.viewer;
        const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
        s.theta += dTheta;
        s.phi = THREE.MathUtils.clamp(s.phi + dPhi, 0.05, Math.min(Math.PI - 0.05,
                                                                   controls.maxPolarAngle));
        this.step(controls.target.clone().add(new THREE.Vector3().setFromSpherical(s)),
                  controls.target.clone());
    }

    /** Moves the camera and what it looks at together, across and up the screen. */
    pan(dx, dy) {
        const {camera, controls} = this.viewer;
        const d = camera.position.distanceTo(controls.target);
        camera.updateMatrixWorld();
        const move = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
              .multiplyScalar(dx * d);
        move.addScaledVector(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1), dy * d);
        this.step(camera.position.clone().add(move), controls.target.clone().add(move));
    }

    /** @private A small move the reader asked for: the camera is theirs now. */
    step(position, target) {
        this.fitted = null;
        this.viewer.flyTo(position.toArray(), target.toArray(), 0.18);
    }

    /** @return {{nearer: boolean, farther: boolean}} Room to zoom each way. */
    zoomRoom() {
        const {camera, controls} = this.viewer;
        const d = camera.position.distanceTo(controls.target);
        return {nearer: d > controls.minDistance * 1.01, farther: d < controls.maxDistance * 0.99};
    }

    // ---- the pointer: throwing switches, taking parts out, labels ----

    /** @private */
    initPointer() {
        const raycaster = new THREE.Raycaster();
        const ndc = new THREE.Vector2();
        const hitAt = (e) => {
            const r = this.canvas.getBoundingClientRect();
            ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
            raycaster.setFromCamera(ndc, this.viewer.camera);
            // Faded and hidden parts are context, not obstacles: a click
            // goes through them (V3).
            return raycaster.intersectObject(this.root, true).find((h) => this.isSolid(h.object)) || null;
        };
        let down = null;
        // A click does not take the keyboard from the Teletype: the view
        // takes the focus by Tab, as the dock's tabs do (U3).
        this.canvas.addEventListener('mousedown', (e) => e.preventDefault());
        this.canvas.addEventListener('pointerdown', (e) => {
            down = {x: e.clientX, y: e.clientY, t: performance.now()};
        });
        this.canvas.addEventListener('pointerup', (e) => {
            const d = down;
            down = null;
            if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > CLICK_PX ||
                performance.now() - d.t > CLICK_MS) {
                return;
            }
            const hit = hitAt(e);
            if (hit) {
                this.onClick(hit);
                if (e.pointerType != 'mouse') {
                    // No hover on a touch screen: the tap shows the label.
                    this.showLabel(hit, e, 2500);
                }
            }
        });
        this.canvas.addEventListener('pointermove', (e) => {
            if (e.pointerType == 'mouse' && !e.buttons) {
                this.showLabel(hitAt(e), e, 0);
            }
        });
        this.canvas.addEventListener('pointerleave', () => this.hideLabel());
    }

    /** @private */
    isSolid(object) {
        for (let n = object; n; n = n.parent) {
            if (!n.visible) {
                return false;
            }
            if (n.userData.label_en) {
                return !n.userData.seeThrough;
            }
        }
        return true;
    }

    /**
     * What a click on the model does: throws the switch it is on, or
     * takes out or puts back the part it is on.
     * @param {!THREE.Intersection} hit Where it landed.
     */
    onClick(hit) {
        const thrown = this.panelBind.pick(hit.object, hit.point);
        if (thrown) {
            this.panel.operate(thrown.id, thrown.dir);
            return;
        }
        const at = this.boxBind.partAt(hit.object);
        if (!at) {
            return;
        }
        if (at.unit) {
            this.toggleUnit(at.unit);
        } else if (WIRED.includes(at.part)) {
            this.panel.setStatus('box-fixed', {part: this.partName(at.part)});
        }
    }

    /**
     * Takes a unit out, or puts it back.
     * @param {string} unit The unit.
     */
    toggleUnit(unit) {
        const box = this.panel.box;
        const out = box.position(unit) > 0;
        const why = out ? box.putBack(unit) : box.takeOut(unit, this.panel.isPoweredOn);
        if (why) {
            this.panel.sayBox(why);
            return;
        }
        this.panel.setStatus(out ? 'box-put-back' : 'box-taken-out',
                             {part: this.partName(unit)});
    }

    /** @return {string} A part's name, in the reader's language. */
    partName(node) {
        return l10n.getMessage('part-' + partKey(node));
    }

    /**
     * The label for what the pointer is over: its name, what it does,
     * and what a click will do.
     * @param {?THREE.Intersection} hit What it is over.
     * @return {?{name: string, role: string, hint: string}}
     */
    describe(hit) {
        if (!hit) {
            return null;
        }
        const thrown = this.panelBind.pick(hit.object, hit.point);
        if (thrown) {
            return {name: l10n.getMessage('label-switch').replace('{name}', switchName(thrown.id)),
                    role: '', hint: l10n.getMessage('hint-throw')};
        }
        for (let n = hit.object; n; n = n.parent) {
            if (n.userData.lamp_id) {
                return {name: l10n.getMessage('label-lamp').replace(
                    '{name}', n.userData.lamp_id.toUpperCase()), role: '', hint: ''};
            }
        }
        const at = this.boxBind.partAt(hit.object);
        if (!at) {
            return null;
        }
        const node = at.unit || at.part;
        let hint = '';
        if (at.unit) {
            const box = this.panel.box;
            hint = box.position(at.unit) > 0 ? 'hint-put-back' :
                this.panel.isPoweredOn ? 'hint-off-first' : 'hint-take-out';
        }
        return {name: this.partName(node), role: l10n.getMessage('role-' + partKey(node)),
                hint: hint ? l10n.getMessage(hint) : ''};
    }

    /** @private */
    showLabel(hit, e, ms) {
        const text = this.describe(hit);
        this.canvas.style.cursor = text && text.hint ? 'pointer' : '';
        window.clearTimeout(this.labelTimer);
        if (!text) {
            this.hideLabel();
            return;
        }
        const label = this.label;
        label.textContent = '';
        for (const [cls, line] of [['part-name', text.name], ['part-role', text.role],
                                   ['part-hint', text.hint]]) {
            if (line) {
                const div = document.createElement('div');
                div.className = cls;
                div.textContent = line;
                label.appendChild(div);
            }
        }
        label.hidden = false;
        const host = this.host.getBoundingClientRect();
        const x = e.clientX - host.left;
        const y = e.clientY - host.top;
        // Beside the pointer, kept inside the stage.
        const w = label.offsetWidth;
        const h = label.offsetHeight;
        label.style.left = Math.max(4, Math.min(x + 14, host.width - w - 4)) + 'px';
        label.style.top = Math.max(4, Math.min(y + 14, host.height - h - 4)) + 'px';
        if (ms) {
            this.labelTimer = window.setTimeout(() => this.hideLabel(), ms);
        }
    }

    /** @private */
    hideLabel() {
        if (this.label) {
            this.label.hidden = true;
        }
        if (this.canvas) {
            this.canvas.style.cursor = '';
        }
    }

    /**
     * Where a part of the model is on the screen: for the browser
     * checks, which click the 3D panel as a reader would.
     * @param {string} name A node in the model, such as 'panel.switch.s0'.
     * @param {!Array<number>|string=} where A point in the node's own
     *     frame, in metres; or 'top', the middle of the top of its own
     *     geometry, as it is now.
     * @return {{x: number, y: number}} In client pixels.
     */
    screenPoint(name, where = [0, 0, 0]) {
        const node = this.boxBind.find(name);
        this.root.updateMatrixWorld(true);
        this.viewer.camera.updateMatrixWorld();
        let world;
        if (where == 'top') {
            const b = new THREE.Box3();
            for (const mesh of this.boxBind.ownMeshes(node)) {
                b.expandByObject(mesh, true);
            }
            world = new THREE.Vector3((b.min.x + b.max.x) / 2, b.max.y - 0.0005,
                                      (b.min.z + b.max.z) / 2);
        } else {
            world = new THREE.Vector3().fromArray(where).applyMatrix4(node.matrixWorld);
        }
        const p = world.project(this.viewer.camera);
        const r = this.canvas.getBoundingClientRect();
        return {x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height};
    }

    // ---- the keyboard (V2) ----

    /** @private */
    initKeys() {
        this.canvas.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }
            const act = {
                ArrowLeft: () => e.shiftKey ? this.pan(PAN_STEP, 0) : this.orbit(-TURN, 0),
                ArrowRight: () => e.shiftKey ? this.pan(-PAN_STEP, 0) : this.orbit(TURN, 0),
                ArrowUp: () => e.shiftKey ? this.pan(0, -PAN_STEP) : this.orbit(0, -TURN),
                ArrowDown: () => e.shiftKey ? this.pan(0, PAN_STEP) : this.orbit(0, TURN),
                '+': () => this.zoom(1 / ZOOM_STEP),
                '=': () => this.zoom(1 / ZOOM_STEP),
                '-': () => this.zoom(ZOOM_STEP),
                '_': () => this.zoom(ZOOM_STEP),
                Home: () => this.setView(HOME_VIEW),
            }[e.key];
            if (act) {
                e.preventDefault();
                act();
            }
        });
    }

    // ---- the tools on the stage's top edge ----

    /** @private */
    initTools() {
        this.menu = new Dropdown('views-dropdown', (value) => {
            const [kind, id] = value.split(':');
            if (kind == 'view') {
                this.setView(id);
            } else {
                this.setShow(id);
            }
        }, () => this.refreshMenu());
        const press = (id, fn) => this.panel.makePressable(document.getElementById(id), fn);
        press('view-reset', () => this.setView(HOME_VIEW));
        press('view-zoom-in', () => this.zoom(1 / ZOOM_STEP));
        press('view-zoom-out', () => this.zoom(ZOOM_STEP));
        this.refreshTools();
    }

    /** @private Fills the Views menu as things stand. */
    refreshMenu() {
        const items = VIEWS.map((v) => ({
            value: 'view:' + v.id,
            label: l10n.getMessage('view-' + v.id),
            disabled: v.id == 'apart' && this.panel.isPoweredOn && !this.apart,
            detail: v.id == 'apart' && this.panel.isPoweredOn && !this.apart ?
                l10n.getMessage('view-apart-detail') : undefined,
        }));
        items.push({heading: true, label: l10n.getMessage('views-heading-show')});
        for (const s of SHOWS) {
            items.push({value: 'show:' + s.id, label: l10n.getMessage('show-' + s.id)});
        }
        this.menu.setItems(items);
        this.menu.setSelected(['view:' + this.view, 'show:' + this.boxBind.show]);
    }

    /** Redraws the tools in the reader's language, as things stand. */
    refreshTools() {
        if (!this.menu) {
            return;
        }
        this.menu.setLabel(l10n.getMessage('view-' + this.view));
        if (this.menu.isOpen()) {
            this.refreshMenu();
        }
        this.refreshZoom();
        this.canvas.setAttribute('aria-label', l10n.getMessage('view3d-canvas-label'));
    }

    /** @private */
    refreshZoom() {
        const room = this.zoomRoom();
        document.getElementById('view-zoom-in').classList.toggle('disabled', !room.nearer);
        document.getElementById('view-zoom-out').classList.toggle('disabled', !room.farther);
    }
}
