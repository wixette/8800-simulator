// @ts-check
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
 * @fileoverview Where the camera goes to show a view (docs/3d-view.md,
 * V2): the subject fills a share (90 %) of whichever side of the stage
 * runs out first, centred, seen from the view's direction. Only the
 * camera's distance and its sideways place change; its direction is the
 * view's. Measured on the corners of each part's own box as the camera
 * sees them, not on a bounding sphere, which would leave the machine
 * small. Plain numbers, no three.js, so the tests run it in Node.
 */

/** A point or a direction: [x, y, z]. */
/** @typedef {!Array<number>} Vec */

/**
 * The parts of the canvas the subject keeps clear of, in CSS pixels from
 * each edge.
 * @typedef {{top: number, right: number, bottom: number, left: number}} Insets
 */

/** @type {function(!Vec, !Vec): !Vec} */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** @type {function(!Vec, !Vec): number} */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** @type {function(!Vec, !Vec): !Vec} */
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2],
                         a[0] * b[1] - a[1] * b[0]];
/** @type {function(!Vec, number): !Vec} */
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
/** @type {function(!Vec, !Vec): !Vec} */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** @param {!Vec} a @return {!Vec} */
function unit(a) {
    const length = Math.hypot(a[0], a[1], a[2]);
    return length ? scale(a, 1 / length) : a;
}

/**
 * The corners of each of some boxes.
 * @param {!Array<{min: !Vec, max: !Vec}>} boxes The boxes.
 * @return {!Array<!Vec>} Their 8 corners each.
 */
export function corners(boxes) {
    const out = [];
    for (const {min, max} of boxes) {
        for (const x of [min[0], max[0]]) {
            for (const y of [min[1], max[1]]) {
                for (const z of [min[2], max[2]]) {
                    out.push([x, y, z]);
                }
            }
        }
    }
    return out;
}

/**
 * The camera axes for a direction, as three.js's lookAt() makes them
 * with the world's up: z back towards the camera.
 * @param {!Vec} dir From the subject towards the camera.
 * @return {{x: !Vec, y: !Vec, z: !Vec}}
 */
export function axes(dir) {
    const z = unit(dir);
    let x = cross([0, 1, 0], z);
    if (dot(x, x) < 1e-12) {
        // Straight down: keep the world's x.
        x = [1, 0, 0];
    }
    x = unit(x);
    return {x: x, y: cross(z, x), z: z};
}

/**
 * Where to put the camera so that the points, seen from a direction,
 * fill a share of the free area's limiting side, centred in it.
 * @param {!Array<!Vec>} points The subject: its parts' corners.
 * @param {!Vec} dir From the subject towards the camera.
 * @param {number} fov The camera's vertical field of view, in degrees.
 * @param {number} width The canvas's width, in CSS pixels.
 * @param {number} height Its height.
 * @param {!Insets} insets What the subject keeps clear of.
 * @param {number=} fill The share of the limiting side it fills.
 * @return {{position: !Vec, target: !Vec}} Where the camera goes, and
 *     what it looks at (and orbits round).
 */
export function frame(points, dir, fov, width, height, insets, fill = 0.9) {
    const {x, y, z} = axes(dir);
    const tanV = Math.tan(fov * Math.PI / 360);
    const tanH = tanV * width / Math.max(1, height);
    // The free area's half-size, as a share of the canvas's.
    const halfX = fill * Math.max(1, width - insets.left - insets.right) / width;
    const halfY = fill * Math.max(1, height - insets.top - insets.bottom) / height;
    // Its centre, in the same terms: a free area off-centre moves the
    // subject towards it.
    const centreX = (insets.left - insets.right) / width;
    const centreY = (insets.bottom - insets.top) / height;
    const lo = points.reduce((m, p) => [Math.min(m[0], p[0]), Math.min(m[1], p[1]),
                                        Math.min(m[2], p[2])], [Infinity, Infinity, Infinity]);
    const hi = points.reduce((m, p) => [Math.max(m[0], p[0]), Math.max(m[1], p[1]),
                                        Math.max(m[2], p[2])], [-Infinity, -Infinity, -Infinity]);
    let target = scale(add(lo, hi), 0.5);
    const radius = Math.max(1e-6, ...points.map((p) => Math.hypot(...sub(p, target))));
    let distance = radius / Math.min(tanV * halfY, tanH * halfX);
    for (let i = 0; i < 60; i++) {
        const camera = add(target, scale(z, distance));
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const p of points) {
            const v = sub(p, camera);
            const depth = Math.max(1e-6, -dot(v, z));
            const u = dot(v, x) / (depth * tanH);
            const w = dot(v, y) / (depth * tanV);
            minX = Math.min(minX, u);
            maxX = Math.max(maxX, u);
            minY = Math.min(minY, w);
            maxY = Math.max(maxY, w);
        }
        // Centre the silhouette on the free area, moving the camera and
        // its target sideways together...
        const offX = (minX + maxX) / 2 - centreX;
        const offY = (minY + maxY) / 2 - centreY;
        target = add(target, add(scale(x, offX * distance * tanH),
                                 scale(y, offY * distance * tanV)));
        // ...and size it to the limiting side: it goes as 1 / distance.
        const s = Math.max((maxX - minX) / (2 * halfX), (maxY - minY) / (2 * halfY));
        if (Math.abs(s - 1) < 1e-5 && Math.abs(offX) < 1e-5 && Math.abs(offY) < 1e-5) {
            break;
        }
        distance *= s;
    }
    return {position: add(target, scale(z, distance)), target: target};
}

/**
 * Where points land on the canvas, seen from a camera: for the tests,
 * and the browser checks, to measure a framing.
 * @param {!Array<!Vec>} points The points.
 * @param {{position: !Vec, target: !Vec}} camera Where it is.
 * @param {number} fov Its vertical field of view, in degrees.
 * @param {number} width The canvas, in CSS pixels.
 * @param {number} height
 * @return {{left: number, right: number, top: number, bottom: number}}
 */
export function silhouette(points, camera, fov, width, height) {
    const {x, y, z} = axes(sub(camera.position, camera.target));
    const tanV = Math.tan(fov * Math.PI / 360);
    const tanH = tanV * width / Math.max(1, height);
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const p of points) {
        const v = sub(p, camera.position);
        const depth = -dot(v, z);
        const px = (dot(v, x) / (depth * tanH) + 1) / 2 * width;
        const py = (1 - dot(v, y) / (depth * tanV)) / 2 * height;
        left = Math.min(left, px);
        right = Math.max(right, px);
        top = Math.min(top, py);
        bottom = Math.max(bottom, py);
    }
    return {left: left, right: right, top: top, bottom: bottom};
}
