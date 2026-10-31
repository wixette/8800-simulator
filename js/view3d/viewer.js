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
 * @fileoverview The 3D view's renderer, camera and lights
 * (docs/3d-view.md, V2): orbit, pan and zoom, damped and limited so the
 * machine cannot be lost; camera flights between views; a frame drawn
 * only when something changed, so an idle page costs nothing; and a
 * lighter quality where frames run slow.
 */

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

/**
 * A studio for the metals to reflect: a grey dome, lighter above, with
 * softboxes above left, to the right, in front and below the front (so
 * the chrome bats and the nuts catch a highlight), and a strip behind
 * for the edges. Chrome and aluminium take their look almost entirely
 * from what they reflect.
 * @return {!THREE.Scene}
 */
function studio() {
    const env = new THREE.Scene();
    const dome = new THREE.SphereGeometry(10, 32, 16);
    const pos = dome.getAttribute('position');
    const colours = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
        const h = pos.getY(i) / 10;
        const v = h >= 0 ? 0.38 + 0.32 * h : 0.38 - 0.16 * h * h;
        c.setRGB(v * 1.02, v, v * 0.96);
        colours.push(c.r, c.g, c.b);
    }
    dome.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
    env.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial(
        {side: THREE.BackSide, vertexColors: true})));
    const box = (w, h, intensity, p) => {
        const m = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
        m.color.setScalar(intensity);
        const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
        b.position.set(p[0], p[1], p[2]);
        b.lookAt(0, 0, 0);
        env.add(b);
    };
    box(5, 3, 9, [-3, 6, 3]);
    box(1.2, 5, 6, [6, 2.5, 1]);
    box(8, 2.5, 4, [0, 1.5, 7]);
    box(6, 2, 2.2, [1, -2.5, 6]);
    box(8, 1, 3, [0, 3, -6]);
    return env;
}

/** Parts smaller than this (bounding-sphere radius, m) cast no shadow. */
const SHADOW_MIN_RADIUS = 0.004;

/** Below this rate while anything moves, quality drops to lite, once. */
const LITE_BELOW_FPS = 25;

/**
 * How near the camera comes to what it looks at, in metres: the machine's
 * middle, a little over 0.2 m behind its front panel, so a part still
 * has enough round it to tell what it is.
 */
const MIN_DISTANCE = 0.35;

/** How far it goes: the machine small, but not lost. */
const MAX_DISTANCE = 2;

/** @return {boolean} Whether the reader asked for less motion. */
export function reducedMotion() {
    return !!(window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

export class Viewer {
    /**
     * @param {!HTMLElement} host Where the canvas goes; it fills it.
     */
    constructor(host) {
        this.host = host;
        /** Frames drawn, for the checks. */
        this.frames = 0;
        /** 'high', or 'lite' (no shadows, one pixel per pixel). */
        this.quality = 'high';
        /** Whether quality follows the frame rate. */
        this.autoQuality = true;
        /** @private */
        this.dirty = true;
        /** @private */
        this.slowFrames = [];
        /**
         * Called each frame with the seconds since the last; each returns
         * whether it moved anything, which is when slow frames count.
         * @type {!Array<function(number): boolean>}
         */
        this.onFrame = [];
        /** Called after the canvas changes size. */
        this.onResize = [];
        /** @private The camera flight under way, if any. */
        this.flight = null;
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        // Neutral keeps the hues of the case's blue and the cards' green.
        this.renderer.toneMapping = THREE.NeutralToneMapping;
        this.renderer.shadowMap.enabled = true;
        this.canvas = this.renderer.domElement;
        host.appendChild(this.canvas);
        this.scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        const env = studio();
        this.scene.environment = pmrem.fromScene(env, 0.02).texture;
        pmrem.dispose();
        env.traverse((o) => {
            if (o.isMesh) {
                o.geometry.dispose();
                o.material.dispose();
            }
        });
        const key = new THREE.DirectionalLight(0xfff6ea, 1.2);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.bias = -0.0005;
        this.scene.add(key);
        this.scene.add(key.target);
        this.key = key;
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.01, 20);
        this.camera.position.set(0, 0.3, 1.2);
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = MIN_DISTANCE;
        this.controls.maxDistance = MAX_DISTANCE;
        // A little below the table, never from underneath.
        this.controls.maxPolarAngle = Math.PI * 0.62;
        this.controls.addEventListener('change', () => this.invalidate());
        this.timer = new THREE.Timer();
        this.timer.connect(document);
        new ResizeObserver(() => this.resize()).observe(host);
        this.resize();
        this.running = false;
    }

    /** Starts drawing, as the view is shown. */
    start() {
        if (this.running) {
            return;
        }
        this.running = true;
        this.timer.reset();
        this.invalidate();
        this.renderer.setAnimationLoop((time) => this.tick(time));
    }

    /** Stops drawing, as the view is hidden: it then costs nothing. */
    stop() {
        this.running = false;
        this.renderer.setAnimationLoop(null);
    }

    /**
     * Fits the key light's shadow round the model.
     * @param {!THREE.Box3} box The model's bounds.
     */
    fitShadow(box) {
        const centre = box.getCenter(new THREE.Vector3());
        const half = box.getSize(new THREE.Vector3()).length() * 0.75;
        Object.assign(this.key.shadow.camera, {left: -half, right: half, top: half,
                                               bottom: -half, near: 0.05, far: 6 * half});
        this.key.position.set(centre.x + half * 0.6, centre.y + half * 1.4,
                              centre.z + half * 0.9);
        this.key.target.position.copy(centre);
        this.key.shadow.camera.updateProjectionMatrix();
    }

    /**
     * Loads the model.
     * @param {string} url The .glb.
     * @param {function(number)=} onProgress The share of it loaded so far.
     * @return {!Promise<!THREE.Group>} Its scene, added to this one.
     */
    async load(url, onProgress) {
        const gltf = await new GLTFLoader().loadAsync(url, (e) => {
            if (onProgress && e.total) {
                onProgress(e.loaded / e.total);
            }
        });
        gltf.scene.traverse((o) => {
            // The model's own name, dots and all: three.js loads it
            // without them (docs/3d-model.md, Part 2).
            const a = gltf.parser.associations.get(o);
            if (a && a.nodes !== undefined) {
                o.userData.modelName = gltf.parser.json.nodes[a.nodes].name;
            }
            if (!o.isMesh) {
                return;
            }
            o.geometry.computeBoundingSphere();
            o.castShadow = o.geometry.boundingSphere.radius >= SHADOW_MIN_RADIUS;
            o.receiveShadow = true;
        });
        this.scene.add(gltf.scene);
        this.invalidate();
        return gltf.scene;
    }

    /** Asks for a frame to be drawn. */
    invalidate() {
        this.dirty = true;
    }

    /**
     * Shadows on or off, and the pixel ratio.
     * @param {string} quality 'high' or 'lite'.
     */
    setQuality(quality) {
        if (quality == this.quality) {
            return;
        }
        this.quality = quality;
        this.renderer.shadowMap.enabled = quality == 'high';
        this.key.castShadow = quality == 'high';
        this.renderer.setPixelRatio(quality == 'high' ?
                                    Math.min(window.devicePixelRatio || 1, 2) : 1);
        this.scene.traverse((o) => {
            if (o.isMesh) {
                for (const m of [].concat(o.material)) {
                    m.needsUpdate = true;
                }
            }
        });
        this.resize();
    }

    /**
     * Flies the camera to look at a target from a position.
     * @param {!Array<number>} position Where the camera goes.
     * @param {!Array<number>} target What it looks at.
     * @param {number=} seconds How long the flight takes.
     */
    flyTo(position, target, seconds = 0.8) {
        this.endFlight();
        if (reducedMotion()) {
            seconds = 0.001;
        }
        const p0 = this.camera.position.clone();
        const t0 = this.controls.target.clone();
        const p1 = new THREE.Vector3().fromArray(position);
        const t1 = new THREE.Vector3().fromArray(target);
        let t = 0;
        const step = (dt) => {
            t = Math.min(1, t + dt / seconds);
            const e = t * t * (3 - 2 * t);
            this.camera.position.lerpVectors(p0, p1, e);
            this.controls.target.lerpVectors(t0, t1, e);
            this.invalidate();
            if (t >= 1) {
                this.endFlight();
            }
            return true;
        };
        this.flight = step;
        this.onFrame.push(step);
    }

    /** Puts the camera where a flight would end, at once. */
    jumpTo(position, target) {
        this.endFlight();
        this.camera.position.fromArray(position);
        this.controls.target.fromArray(target);
        this.camera.lookAt(this.controls.target);
        this.invalidate();
    }

    /** @return {boolean} Whether the camera is flying to a view. */
    isFlying() {
        return this.flight !== null;
    }

    /** @private */
    endFlight() {
        if (!this.flight) {
            return;
        }
        const i = this.onFrame.indexOf(this.flight);
        if (i >= 0) {
            this.onFrame.splice(i, 1);
        }
        this.flight = null;
    }

    /** @return {{width: number, height: number}} The canvas, in CSS pixels. */
    size() {
        return {width: this.host.clientWidth, height: this.host.clientHeight};
    }

    /** @private */
    resize() {
        const {width, height} = this.size();
        if (!width || !height) {
            return;
        }
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        for (const callback of this.onResize) {
            callback(width, height);
        }
        this.invalidate();
    }

    /** @private */
    tick(time) {
        this.timer.update(time);
        // After the tab was hidden the timer can jump, or go backwards.
        const dt = Math.min(0.1, Math.max(0, this.timer.getDelta()));
        let busy = false;
        for (const callback of this.onFrame.slice()) {
            if (callback(dt)) {
                busy = true;
            }
        }
        // Damping keeps the camera moving a little after a drag ends.
        if (this.controls.update()) {
            this.dirty = true;
        }
        if (!this.dirty) {
            return;
        }
        this.dirty = false;
        this.renderer.render(this.scene, this.camera);
        this.frames++;
        if (busy && this.autoQuality && this.quality == 'high' && dt > 0) {
            this.slowFrames.push(dt);
            if (this.slowFrames.length > 30) {
                this.slowFrames.shift();
                const mean = this.slowFrames.reduce((a, b) => a + b, 0) / 30;
                if (1 / mean < LITE_BELOW_FPS) {
                    this.setQuality('lite');
                }
            }
        }
    }
}
