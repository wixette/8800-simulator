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
 * @fileoverview The Views menu as data (docs/3d-view.md, V3): where
 * each view looks from and at what, and what each Show preset fades or
 * hides. No three.js, so the tests hold the menu to the model.
 *
 * Directions are in the model's glTF frame, from the subject towards
 * the camera: +x to the operator's right, +y up, +z towards the
 * operator, who faces the front panel.
 */

/**
 * The views, in the menu's order. Each frames its subject: 'panel' (the
 * dress panel and the switches standing out of it) or 'box' (every
 * part, where it is going to be). Taken apart is the one view that
 * moves parts (V4).
 * @type {!Array<{id: string, dir: !Array<number>, subject: string}>}
 */
export const VIEWS = [
    {id: 'front', dir: [0, 0.08, 1], subject: 'panel'},
    {id: 'whole', dir: [0.75, 0.62, 1], subject: 'box'},
    {id: 'above', dir: [0, 1, 0.42], subject: 'box'},
    {id: 'rear', dir: [-0.55, 0.42, -1], subject: 'box'},
    {id: 'apart', dir: [-0.9, 0.8, 1], subject: 'box'},
];

/** The view the 3D view opens on, and Reset view goes back to. */
export const HOME_VIEW = 'front';

/** What the 'panel' subject is: the parts the front panel view frames. */
export const PANEL_SUBJECT = ['panel.dress', 'panel.name_plate'];

/** The case: what Case faded and Case hidden act on. */
const CASE = ['case.top', 'case.bottom'];

/**
 * The Show menu's icons, as the inside of a 24 x 24 <svg>: the machine
 * seen from the front, then less and less of it (docs/ui-design.md, U8).
 * The button shows the one chosen, so the bar says why the case looks
 * as it does.
 */
const ICONS = {
    // The whole case, its lamps and switches.
    all: '<path fill-rule="evenodd" d="M2 5h20v14H2zM5 8h2.5v2.5H5zm4.5 0H12v2.5H9.5zM14 8h2.5v2.5H14zM5 14h14v2H5z"/>',
    // The case faint, the cards in it.
    caseFaded: '<path fill-rule="evenodd" opacity=".45" d="M2 5h20v14H2zm1.5 1.5v11h17v-11z"/>' +
        '<path d="M6 8h2v8H6zm5 0h2v8h-2zm5 0h2v8h-2z"/>',
    // No case: the cards standing on the chassis.
    caseHidden: '<path d="M6 4h2.5v11H6zm4.75 0h2.5v11h-2.5zm4.75 0H18v11h-2.5zM2 16h20v3.5H2z"/>',
    // One card, its chip and its edge fingers.
    electronics: '<path fill-rule="evenodd" d="M3 3h18v14H3zm4.5 3.5v7h9v-7z"/>' +
        '<path d="M5 17h2v3.5H5zm4 0h2v3.5H9zm4 0h2v3.5h-2zm4 0h2v3.5h-2z"/>',
};

/**
 * The icons of the Shows that pick out a key part: a map of the machine
 * from above, the front panel at the bottom, the power supply at the
 * back, the cards in their cage - all faint but the part itself, so
 * each says where its part is, and they sit quieter in the menu than
 * the four ways of drawing the machine. The cards stand as they do
 * from above, the CPU card at the right (js/box.js, fittedFor); the
 * Memory menu can move the serial cards along a slot.
 * @param {string} solid Which of the map's pieces is drawn solid.
 * @return {string} The icon.
 */
function partMap(solid) {
    const pieces = {
        psu: 'M4.5 4.5h15V8h-15z',
        cpu: 'M17.5 9.5h2.5v8h-2.5z',
        memory: 'M14.5 9.5H17v8h-2.5z',
        serial: 'M8.5 9.5H11v8H8.5zm3 0H14v8h-2.5z',
        bus: 'M8.5 18H20v1.5H8.5z',
    };
    let faint = 'M2 2h20v20H2zm1 1v18h18V3z';
    for (const [piece, d] of Object.entries(pieces)) {
        if (piece != solid) {
            faint += d;
        }
    }
    return '<path fill-rule="evenodd" opacity=".3" d="' + faint + '"/><path d="' + pieces[solid] + '"/>';
}

/**
 * The Show presets, in the menu's order: which parts each fades, which
 * it hides, and which it picks out. A part named here is that node's
 * own geometry, not the parts fixed to it: hiding the chassis leaves
 * the cards on it. Electronics only keeps the front panel, the bus, the
 * cards and the wiring.
 *
 * After those, a Show for each of the machine's key parts, which the
 * Tutorial's Meet the Machine points at (V7): they glow, shown even
 * where they would be hidden, and every other part fades round them.
 * The memory cards are every one the Memory menu can fit; those not
 * fitted are not drawn at all.
 * @type {!Array<{id: string, faded: !Array<string>, hidden: !Array<string>,
 *                 parts: !Array<string>, icon: string}>}
 */
export const SHOWS = [
    {id: 'all', faded: [], hidden: [], parts: [], icon: ICONS.all},
    {id: 'case-faded', faded: CASE, hidden: [], parts: [], icon: ICONS.caseFaded},
    {id: 'case-hidden', faded: [], hidden: CASE, parts: [], icon: ICONS.caseHidden},
    {id: 'electronics', faded: [],
     hidden: CASE.concat(['chassis.frame', 'chassis.card_rail.0', 'chassis.card_rail.1',
                          'psu.t1', 'psu.t2', 'psu.t3', 'psu.board',
                          'psu.terminal_block', 'psu.fan']),
     parts: [], icon: ICONS.electronics},
    {id: 'cpu', faded: [], hidden: [], parts: ['card.cpu'], icon: partMap('cpu')},
    {id: 'memory', faded: [], hidden: [], parts: ['card.mem1k', 'card.mem4k_0', 'card.mem4k_1'],
     icon: partMap('memory')},
    {id: 'serial', faded: [], hidden: [], parts: ['card.sio', 'card.sio2'], icon: partMap('serial')},
    {id: 'bus', faded: [], hidden: [], parts: ['bus.board.0', 'bus.board.1'], icon: partMap('bus')},
    {id: 'psu', faded: [], hidden: [], parts: ['psu.t1', 'psu.t2', 'psu.t3', 'psu.board'],
     icon: partMap('psu')},
];

/**
 * A faded part's opacity: a Show preset's faded case is still plainly
 * there, glass rather than gone, and outlined; the parts round those a
 * Show picks out fade further, out of their way.
 */
export const FADED_OPACITY = 0.4;
export const AROUND_PARTS_OPACITY = 0.16;

/**
 * How one part is drawn in a Show preset (V3).
 * @param {string} name The part, by its name in the model.
 * @param {{faded: !Array<string>, hidden: !Array<string>, parts: !Array<string>}} preset
 *     The Show preset.
 * @return {{glows: boolean, kept: boolean, faded: boolean, hidden: boolean,
 *           opacity: number, outlined: boolean}} Whether it glows (picked
 *     out), is kept as it is (the panel's lamps and switches, which the
 *     panel draws), faded, hidden or outlined, and the opacity it fades to.
 */
export function lookOf(name, preset) {
    const picking = preset.parts.length > 0;
    const glows = preset.parts.includes(name);
    const kept = /^panel\.(lamp|switch)\./.test(name);
    const faded = !glows && !kept && (preset.faded.includes(name) || picking);
    const hidden = !glows && preset.hidden.includes(name);
    return {glows, kept, faded, hidden,
            opacity: picking ? AROUND_PARTS_OPACITY : FADED_OPACITY,
            outlined: faded && !picking};
}

/**
 * What the Show button shows: the preset's icon, and changed - the
 * orange of a setting changed - unless the whole machine is on show.
 * @param {string} show The Show preset.
 * @return {{icon: string, changed: boolean}}
 */
export function showButton(show) {
    const preset = SHOWS.find((s) => s.id == show) || SHOWS[0];
    return {icon: preset.icon, changed: preset !== SHOWS[0]};
}

/**
 * The parts wired in place: a click on one says it does not come out.
 * The case bottom, the name plate and the card rails just stay; the
 * units that do come out are js/box.js's.
 * @type {!Array<string>}
 */
export const WIRED = ['panel.assembly', 'bus.board.0', 'bus.board.1', 'harness.panel_bus',
                      'harness.panel_data'];

/**
 * The message key that names a part: part-<node>, the two expander
 * boards and the two card rails sharing one.
 * @param {string} node The part's node in the model.
 * @return {string} Its key, without 'part-' or 'role-'.
 */
export function partKey(node) {
    return node.replace(/^(bus\.board|chassis\.card_rail)\.\d$/, '$1');
}

/**
 * What the panel's own lettering calls each command switch, for its
 * label (P5: the lettering is never translated).
 * @type {!Object<string, string>}
 */
const SWITCH_NAMES = {
    'off-on': 'OFF / ON', 'stop-run': 'STOP / RUN', 'single': 'SINGLE STEP',
    'examine': 'EXAMINE / EXAMINE NEXT', 'deposit': 'DEPOSIT / DEPOSIT NEXT',
    'reset': 'RESET / CLR', 'protect': 'PROTECT / UNPROTECT', 'aux1': 'AUX',
    'aux2': 'AUX',
};

/**
 * @param {string} id A switch.
 * @return {string} Its name as the panel and the Switch Board Helper
 *     letter it: A00-A15, or the commands it gives.
 */
export function switchName(id) {
    return /^s\d+$/.test(id) ? 'A' + id.slice(1).padStart(2, '0') : SWITCH_NAMES[id];
}

/** How far a card rises to be out of its slot, in metres (params cage.lift_out). */
export const CARD_LIFT = 0.16;

/**
 * The slot each card sits in in the model's rest pose, where none
 * overlaps another: these give the slots' places along the bus.
 * @type {!Object<string, !Array<number>>}
 */
export const REST_SLOT = {cpu: [0, 0], mem1k: [0, 1], sio: [0, 2], sio2: [0, 3],
                          mem4k_0: [1, 0], mem4k_1: [1, 1]};
