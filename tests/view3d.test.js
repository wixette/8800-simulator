/**
 * The 3D view's logic that runs without a browser (docs/3d-view.md):
 * how a view frames its parts, the Views menu against the model, the
 * names and roles every part shows, and the [2D | 3D] toggle - which
 * view a page opens on, what leaving the 3D view does to the box, and
 * what a link carries. Drawing is checked in tests/browser/view3d.mjs.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {Box, CARD_IDS} from '../js/box.js';
import {l10n} from '../js/l10n.js';
import {panel} from '../js/app.js';
import {axes, corners, frame, frameShowingTop, silhouette, topShare} from '../js/view3d/framing.js';
import {AROUND_PARTS_OPACITY, CARD_LIFT, FADED_OPACITY, HOME_VIEW,
        REST_SLOT, SHOWS, UNFRAMED_MATERIALS, VIEWS, WIRED, lookOf, partKey, showButton,
        switchName} from '../js/view3d/views.js';
import {readGlb} from './glb.js';
import {stub} from './stub.js';

const ROOT = path.join(import.meta.dirname, '..');
const GLTF = readGlb(path.join(ROOT, 'model', 'altair-8800.glb'));
const NODES = new Map(GLTF.nodes.map((node) => [node.name, node]));
const PARAMS = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'model', 'params', 'machine.json'), 'utf8'));
const INSETS = {top: 8, right: 8, bottom: 8, left: 8};

/** Two boxes the shape of the machine, side by side, in metres. */
const MACHINE = [{min: [-0.22, 0, -0.22], max: [0.22, 0.18, 0.22]},
                 {min: [0.3, 0, -0.1], max: [0.5, 0.05, 0.1]}];

// ---- framing ----

test('a view fills 90 % of the side that runs out first, centred', () => {
    const points = corners(MACHINE);
    for (const [width, height] of [[1200, 300], [400, 700], [800, 800], [375, 300]]) {
        for (const view of VIEWS) {
            const f = frame(points, view.dir, 35, width, height, INSETS);
            const s = silhouette(points, f, 35, width, height);
            const freeW = width - 16;
            const freeH = height - 16;
            const fillW = (s.right - s.left) / freeW;
            const fillH = (s.bottom - s.top) / freeH;
            const label = view.id + ' at ' + width + 'x' + height;
            assert.ok(Math.abs(Math.max(fillW, fillH) - 0.9) < 0.002,
                      label + ': fills ' + fillW.toFixed(3) + ' x ' + fillH.toFixed(3));
            assert.ok(fillW <= 0.902 && fillH <= 0.902, label + ': nothing runs off');
            assert.ok(Math.abs((s.left + s.right) / 2 - width / 2) < 1, label + ': centred across');
            assert.ok(Math.abs((s.top + s.bottom) / 2 - height / 2) < 1, label + ': and down');
        }
    }
});

test('a view keeps its direction: the camera only comes nearer or moves aside', () => {
    const points = corners(MACHINE);
    for (const view of VIEWS) {
        const f = frame(points, view.dir, 35, 900, 500, INSETS);
        const d = f.position.map((v, i) => v - f.target[i]);
        const z = axes(view.dir).z;
        const length = Math.hypot(...d);
        for (let i = 0; i < 3; i++) {
            assert.ok(Math.abs(d[i] / length - z[i]) < 1e-9, view.id);
        }
    }
});

test('the front shows the same band of the top on every screen, however near the camera comes', () => {
    // The case's size, near enough: 43 cm wide, 18 cm tall, 44 cm deep.
    const box = {min: [-0.216, 0, -0.222], max: [0.216, 0.178, 0.222]};
    const points = corners([box]);
    const front = VIEWS.find((v) => v.id == 'front');
    assert.strictEqual(front.topShare, 0.15);
    // Along one direction, a narrow canvas puts the camera far back and
    // a wide one close in, and the top shows four times as deep on the
    // first: what topShare is there to stop.
    const along = [[378, 302], [1896, 355]].map(([w, h]) => topShare(box, frame(points, front.dir, 35, w, h, INSETS), 35));
    assert.ok(along[0] > 3 * along[1], along.join(' '));
    for (const [w, h] of [[378, 302], [776, 239], [1256, 271], [1896, 355], [600, 900]]) {
        const camera = frameShowingTop(points, box, front.topShare, front.dir, 35, w, h, INSETS);
        assert.ok(Math.abs(topShare(box, camera, 35) - 0.15) < 0.002, w + 'x' + h);
        // Still framed: the box fills its limiting side, centred.
        const sil = silhouette(points, camera, 35, w, h);
        assert.ok(Math.abs((sil.left + sil.right) / 2 - w / 2) < 1 && Math.abs((sil.top + sil.bottom) / 2 - h / 2) < 1,
                  w + 'x' + h + ' ' + JSON.stringify(sil));
        assert.ok(camera.position[1] > box.max[1], 'from above the top');
    }
    // The higher the camera, the more of the top: what the search rests on.
    let last = -Infinity;
    for (const rise of [0.1, 0.2, 0.3, 0.5, 0.8]) {
        const share = topShare(box, frame(points, [0, rise, 1], 35, 1256, 271, INSETS), 35);
        assert.ok(share > last, rise);
        last = share;
    }
});

test('the views are the menu\'s, each looking at something from somewhere', () => {
    assert.deepStrictEqual(VIEWS.map((v) => v.id), ['front', 'whole', 'above', 'rear', 'apart']);
    assert.strictEqual(HOME_VIEW, 'front');
    for (const view of VIEWS) {
        assert.ok(view.dir[1] >= 0, view.id + ': never from underneath');
        assert.ok(l10n.MESSAGES['view-' + view.id], view.id + ' has a name');
    }
    assert.ok(VIEWS.find((v) => v.id == 'front').dir[2] > 0, 'the front faces the operator');
    assert.ok(VIEWS.find((v) => v.id == 'rear').dir[2] < 0, 'the rear the other way');
});

test('framing leaves out the power cord, which trails outside the case', () => {
    // Framed with the box, the cord trailing out of the back pushed the
    // box off centre in every view but the front.
    const materials = GLTF.materials.map((m) => m.name);
    for (const name of UNFRAMED_MATERIALS) {
        assert.ok(materials.includes(name), name + ' is a material of the model');
    }
    // The cord is a primitive of the chassis frame, which three.js loads
    // as a mesh of its own, so boxes() can skip it alone.
    const frame = GLTF.meshes[GLTF.nodes.find((n) => n.name == 'chassis.frame').mesh];
    assert.ok(frame.primitives.some((p) => UNFRAMED_MATERIALS.includes(GLTF.materials[p.material].name)));
    assert.ok(frame.primitives.some((p) => !UNFRAMED_MATERIALS.includes(GLTF.materials[p.material].name)));
});

// ---- the menu and the model ----

test('every part a Show preset or the page names is in the model', () => {
    const named = WIRED.slice();
    for (const show of SHOWS) {
        named.push(...show.faded, ...show.hidden);
        assert.ok(l10n.MESSAGES['show-' + show.id], show.id + ' has a name');
    }
    for (const name of named) {
        assert.ok(NODES.has(name), name);
    }
    const electronics = SHOWS.find((s) => s.id == 'electronics');
    for (const kept of ['panel.assembly', 'panel.dress', 'bus.board.0', 'card.cpu',
                        'harness.panel_bus']) {
        assert.ok(!electronics.hidden.includes(kept), 'Electronics only keeps ' + kept);
    }
    const all = SHOWS.find((s) => s.id == 'all');
    assert.deepStrictEqual([all.faded, all.hidden], [[], []]);
    assert.strictEqual(SHOWS[0], all, 'the whole machine is first, the one not marked changed');
});

test('the Show menu is icons, each its own: four ways to draw the machine, then a map for each part', () => {
    assert.strictEqual(new Set(SHOWS.map((s) => s.icon)).size, SHOWS.length);
    const drawn = SHOWS.filter((s) => !s.parts.length);
    assert.deepStrictEqual(drawn.map((s) => s.id), ['all', 'case-faded', 'case-hidden', 'electronics']);
    const parts = SHOWS.filter((s) => s.parts.length);
    assert.deepStrictEqual(parts.map((s) => s.id), ['cpu', 'memory', 'serial', 'bus', 'psu']);
    assert.ok(parts.every((s) => !s.faded.length && !s.hidden.length));
    assert.strictEqual(SHOWS.indexOf(parts[0]), drawn.length, 'the parts come after the four');
    // A part's map is faint but for one solid piece, its part: quieter
    // in the menu than the four, which are solid.
    for (const show of parts) {
        const paths = show.icon.match(/<path[^>]*>/g);
        assert.strictEqual(paths.length, 2, show.id);
        assert.match(paths[0], /opacity="\.3"/, show.id);
        assert.doesNotMatch(paths[1], /opacity/, show.id);
    }
    // The map stands as the machine does from above: the CPU card the
    // rightmost card, the serial cards left of the memory card.
    const left = (id) => +SHOWS.find((s) => s.id == id).icon.match(/<path d="M([\d.]+)/)[1];
    assert.ok(left('cpu') > left('memory') && left('memory') > left('serial'));
    for (const show of SHOWS) {
        // Only paths, drawn in the icon's own colour: nothing that runs,
        // and nothing that would not follow the button's colour.
        assert.match(show.icon, /^(<path( fill-rule="evenodd"| opacity="[.\d]+")* d="[MmHhVvZzAa\d. -]+"\/>)+$/,
                     show.id);
    }
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.ok(html.includes('<svg id="show-current" class="icon" viewBox="0 0 24 24" aria-hidden="true">' +
                            SHOWS[0].icon + '</svg>'),
              'before the 3D view loads, the button already shows the whole machine');
});

test('a Show preset fades the case to glass, outlined; hides; never touches the panel\'s lamps', () => {
    const preset = (id) => SHOWS.find((s) => s.id == id);
    const faded = lookOf('case.top', preset('case-faded'));
    assert.deepStrictEqual([faded.faded, faded.hidden, faded.outlined], [true, false, true]);
    assert.ok(faded.opacity >= 0.35, 'a faded case is still plainly there, not gone');
    assert.deepStrictEqual(lookOf('card.cpu', preset('case-faded')),
                           {glows: false, kept: false, faded: false, hidden: false,
                            opacity: FADED_OPACITY, outlined: false});
    const hidden = lookOf('case.top', preset('case-hidden'));
    assert.deepStrictEqual([hidden.faded, hidden.hidden, hidden.outlined], [false, true, false]);
    for (const show of SHOWS) {
        const lamp = lookOf('panel.lamp.d0', show);
        assert.ok(lamp.kept && !lamp.faded && !lamp.hidden, show.id);
    }
});

test('a part\'s Show makes it glow and fades everything round it, further than a preset', () => {
    const psu = SHOWS.find((s) => s.id == 'psu');
    const it = lookOf('psu.t1', psu);
    assert.deepStrictEqual([it.glows, it.faded, it.hidden], [true, false, false]);
    for (const other of ['card.cpu', 'case.top', 'chassis.frame']) {
        const look = lookOf(other, psu);
        assert.deepStrictEqual([look.glows, look.faded, look.outlined, look.opacity],
                               [false, true, false, AROUND_PARTS_OPACITY], other);
    }
    assert.ok(AROUND_PARTS_OPACITY < FADED_OPACITY);
    for (const show of SHOWS.filter((s) => !s.parts.length)) {
        assert.ok(!lookOf('card.cpu', show).glows, show.id + ' picks nothing out');
    }
});

test('the Show button shows the Show: its icon, orange unless the whole machine', () => {
    for (const show of SHOWS) {
        assert.deepStrictEqual(showButton(show.id), {icon: show.icon, changed: show.id != 'all'});
    }
    assert.deepStrictEqual(showButton('nonesuch'), showButton('all'));
});

test('the menus\' words: every view and Show named, the button saying which, in every language', () => {
    for (const locale of l10n.LOCALES) {
        for (const id of VIEWS.map((v) => 'view-' + v.id).concat(SHOWS.map((s) => 'show-' + s.id))) {
            assert.ok(l10n.MESSAGES[id][locale], id + ' in ' + locale);
        }
        assert.ok(l10n.MESSAGES['show-menu-current'][locale].includes('{show}'), locale);
        assert.ok(l10n.MESSAGES['show-heading-parts'][locale], locale);
    }
    // Short enough that the Views button, as wide as its longest name,
    // still leaves the stage's top edge room on a phone (U8).
    for (const locale of l10n.LOCALES) {
        for (const view of VIEWS) {
            const name = l10n.MESSAGES['view-' + view.id][locale];
            assert.ok(name.length <= 17, locale + ': ' + name);
        }
    }
});

test('every part of the model has a name and a role, in every language', () => {
    for (const node of GLTF.nodes) {
        const name = node.name;
        if (!node.extras || !node.extras.label_en || /^(slot|panel\.switch|panel\.lamp)\./.test(name)) {
            continue;
        }
        for (const kind of ['part-', 'role-']) {
            const entry = l10n.MESSAGES[kind + partKey(name)];
            assert.ok(entry, kind + partKey(name));
            for (const locale of l10n.LOCALES) {
                assert.ok(entry[locale], kind + partKey(name) + ' in ' + locale);
            }
        }
    }
    assert.strictEqual(partKey('bus.board.1'), 'bus.board');
    assert.strictEqual(partKey('chassis.card_rail.0'), 'chassis.card_rail');
    assert.strictEqual(partKey('card.cpu'), 'card.cpu');
});

test('every switch is named as the panel letters it, untranslated', () => {
    const ids = panel.TOGGLE_SWITCH_INFO.concat(panel.STATELESS_SWITCH_INFO).map((s) => s.id);
    for (const id of ids) {
        assert.ok(switchName(id), id);
    }
    assert.strictEqual(switchName('s0'), 'A00');
    assert.strictEqual(switchName('s15'), 'A15');
    assert.strictEqual(switchName('examine'), 'EXAMINE / EXAMINE NEXT');
});

test('a card rises out of its slot as far as the params say', () => {
    assert.strictEqual(CARD_LIFT * 1000, PARAMS.cage.lift_out.v);
    // The rest pose puts every card in a slot of its own, and every slot
    // a memory size uses is one of them.
    const rest = Object.values(REST_SLOT).map((s) => s.join(','));
    assert.strictEqual(new Set(rest).size, CARD_IDS.length);
    for (const size of panel.MEM_SIZES) {
        for (const card of new Box(size).cards()) {
            assert.ok(rest.includes(new Box(size).slotOf(card).join(',')), size + ': ' + card);
        }
    }
    // Along the bus, the rest slots fall in order: board 0 from the right,
    // slot 0 outermost, then board 1.
    const x = (card) => NODES.get('slot.' + card).translation[0];
    assert.ok(x('cpu') > x('mem1k') && x('mem1k') > x('sio') && x('sio') > x('sio2') &&
              x('sio2') > x('mem4k_0') && x('mem4k_0') > x('mem4k_1'));
});

// ---- the toggle ----

/**
 * Stands in for the page around the toggle.
 * @param {!Object} t The test context.
 * @param {{hash: string, search: string, saved: ?Object}=} where What
 *     the page was opened with, and what the browser remembers.
 * @return {{said: !Array, stored: !Object, opened: !Array}}
 */
function stubToggle(t, where = {}) {
    const said = [];
    const stored = Object.assign({}, where.saved || {});
    const opened = [];
    const elems = {};
    const elem = (id) => elems[id] || (elems[id] = {
        id: id, hidden: false, style: {}, dataset: {src: 'model/altair-8800.glb'},
        classList: {set: new Set(), toggle(c, on) { on ? this.set.add(c) : this.set.delete(c); },
                    add(c) { this.set.add(c); }, remove(c) { this.set.delete(c); }},
        setAttribute(k, v) { this[k] = v; }, addEventListener() {}, focus() {},
        querySelector: () => null,
    });
    stub(t, global, {
        window: {location: {hash: where.hash || '', search: where.search || ''}},
        document: {getElementById: elem},
        localStorage: {getItem: (k) => k in stored ? stored[k] : null,
                       setItem: (k, v) => { stored[k] = v; }},
    });
    stub(t, panel, {
        box: new Box(256),
        has3d: true,
        view: '2d',
        stage3d: null,
        stage3dLoading: null,
        applyDock() {},
        open3d() { opened.push(true); },
        setStatus(id) { said.push(id); },
        makePressable() {},
    });
    return {said: said, stored: stored, opened: opened, elems: elems};
}

test('a page opens on a link\'s view, else the reader\'s last, else 2D', (t) => {
    stubToggle(t);
    assert.strictEqual(panel.initialView(), '2d');
    stubToggle(t, {saved: {sim8800view: '3d'}});
    assert.strictEqual(panel.initialView(), '3d');
    stubToggle(t, {saved: {sim8800view: 'nonsense'}});
    assert.strictEqual(panel.initialView(), '2d');
    stubToggle(t, {saved: {sim8800view: '3d'}, hash: '#hex=00&view=2d'});
    assert.strictEqual(panel.initialView(), '2d', 'a link wins over what was remembered');
    stubToggle(t, {search: '?view=3d'});
    assert.strictEqual(panel.initialView(), '3d');
});

test('choosing 3D shows it and remembers it; the dot goes once it is seen', (t) => {
    const {stored, opened, elems} = stubToggle(t);
    panel.refreshViewSwitch();
    assert.ok(elems['view-3d'].classList.set.has('has-news'), 'a first visit sees the dot');
    panel.chooseView('3d');
    assert.strictEqual(panel.view, '3d');
    assert.strictEqual(stored.sim8800view, '3d');
    assert.strictEqual(stored.sim8800seen3d, '1');
    assert.deepStrictEqual(opened, [true], 'the 3D view is loaded, or shown');
    assert.ok(!elems['view-3d'].classList.set.has('has-news'));
    assert.strictEqual(elems['stage3d'].hidden, false);
    assert.strictEqual(elems['panel'].style.display, 'none');
    assert.strictEqual(elems['view-3d']['aria-selected'], 'true');
    panel.chooseView('2d');
    assert.strictEqual(stored.sim8800view, '2d');
    assert.strictEqual(elems['stage3d'].hidden, true);
});

test('without WebGL 2, 3D stays in place, greyed, and says why', (t) => {
    const {said, opened, elems} = stubToggle(t);
    panel.has3d = false;
    panel.chooseView('3d');
    assert.strictEqual(panel.view, '2d');
    assert.deepStrictEqual(said, ['view3d-no-webgl']);
    assert.deepStrictEqual(opened, []);
    panel.refreshViewSwitch();
    assert.ok(elems['view-3d'].classList.set.has('disabled'));
    assert.strictEqual(elems['view-3d']['aria-disabled'], 'true');
});

test('leaving the 3D view puts the box back together, and says so', (t) => {
    const {said} = stubToggle(t);
    panel.chooseView('3d');
    panel.box.takeOut('case.top', false);
    panel.box.snap();
    panel.chooseView('2d');
    assert.ok(panel.box.isWhole(), 'the 2D panel stands for a whole machine');
    assert.strictEqual(said.at(-1), 'view2d-reassembled');
    said.length = 0;
    panel.chooseView('3d');
    panel.chooseView('2d');
    assert.deepStrictEqual(said, [], 'nothing to say when nothing was out');
});

test('going back to 2D, what the 3D view said gives way to how the machine is', (t) => {
    const {said} = stubToggle(t);
    const machine = {isRunning: false, halted: false};
    stub(t, panel, {isPoweredOn: false, sim: machine, statusId: null});
    const leave = (lastSaid, state) => {
        panel.chooseView('3d');
        panel.statusId = lastSaid;
        Object.assign(panel, {isPoweredOn: state != 'off'});
        Object.assign(machine, {isRunning: state == 'running', halted: state == 'halted'});
        said.length = 0;
        panel.chooseView('2d');
        return said.slice();
    };
    for (const id of ['view3d-ready', 'view-apart-done', 'view-reassembling', 'box-taken-out',
                      'box-out-first', 'tutorial-showing']) {
        assert.deepStrictEqual(leave(id, 'off'), ['status-off'], id);
    }
    assert.deepStrictEqual(leave('view3d-ready', 'running'), ['status-running']);
    assert.deepStrictEqual(leave('view3d-ready', 'halted'), ['status-halted']);
    assert.deepStrictEqual(leave('view3d-ready', 'stopped'), ['status-stopped']);
    // What is not about the 3D view stays: it is as true on the panel.
    for (const id of ['status-running', 'rom-loaded', 'status-mem-installed', 'asm-has-errors']) {
        assert.deepStrictEqual(leave(id, 'running'), [], id);
    }
    // Every message the 3D view and the box say is one it replaces.
    const source = ['js/panel-view.js', 'js/view3d/view3d.js', 'js/panel.js']
          .map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
    const own = [...source.matchAll(/setStatus\('((?:view3d|view|box)-[\w-]+)'/g)].map((m) => m[1])
          .filter((id) => id != 'view2d-reassembled');
    assert.ok(own.length >= 5, own.join());
    for (const id of own.concat(Object.keys(l10n.MESSAGES).filter((k) => /^box-/.test(k)))) {
        assert.ok(panel.SAID_IN_3D.test(id), id);
    }
});

test('the status line keeps one line\'s height, a longer message rising over the dock', () => {
    // So that a two-line message giving way to a one-line one does not
    // resize the stage, and the 3D view with it.
    const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
    const bar = css.match(/\n#status-bar \{([^}]*)\}/)[1];
    const text = css.match(/\n#status-text \{([^}]*)\}/)[1];
    assert.match(bar, /\n    height: 33px;/);
    assert.match(bar, /position: relative;/);
    assert.match(text, /position: absolute;/);
    assert.match(text, /bottom: 0;/);
    assert.doesNotMatch(text, /\n    (max-)?height:/);
});

test('a link copied from the 3D view opens there', async (t) => {
    stubToggle(t);
    stub(t, global.window.location, {href: 'https://example.com/sim/'});
    stub(t, global, {document: {getElementById: (id) => id == 'copy-link-state' ?
        {checked: false} : null}});
    stub(t, panel, {sim: {mem: [0x3e, 0x8c].concat(new Array(254).fill(0))},
                    getInputAddressCallback: () => 0});
    panel.view = '3d';
    assert.strictEqual(await panel.currentLink(), 'https://example.com/sim/#hex=3E8C&view=3d');
    panel.view = '2d';
    assert.strictEqual(await panel.currentLink(), 'https://example.com/sim/#hex=3E8C');
});

test('the stage has its toggle and the 3D view\'s tools, each with a name', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    for (const id of ['view-tools', 'view-switch', 'view-2d', 'view-3d', 'view3d-tools',
                      'view-reset', 'view-zoom-in', 'view-zoom-out', 'views-dropdown',
                      'views-button', 'views-list', 'show-dropdown', 'show-button',
                      'show-current', 'show-list', 'stage3d', 'stage3d-progress',
                      'stage3d-message', 'part-label']) {
        assert.ok(html.includes('id="' + id + '"'), id);
    }
    assert.match(html, /<div id="stage3d" data-src="model\/altair-8800\.glb\?v=/,
                 'the model is fetched by a versioned name, like every file the page names');
    for (const id of ['view-switch-label', 'view-2d-title', 'view-3d-title', 'view-3d-new',
                      'view-reset', 'view-zoom-in', 'view-zoom-out', 'views-menu', 'show-menu-current',
                      'view3d-loading', 'view3d-ready', 'view3d-failed', 'view3d-no-webgl',
                      'view3d-wait', 'view2d-reassembled', 'view3d-canvas-label']) {
        assert.ok(l10n.MESSAGES[id], id);
    }
});

test('the 3D view and three.js are loaded only when the view is first chosen', () => {
    // Nothing the page loads at once imports them: only panel-view.js's
    // dynamic import() does (docs/3d-view.md, M5).
    const js = path.join(ROOT, 'js');
    for (const file of fs.readdirSync(js).filter((f) => f.endsWith('.js'))) {
        const source = fs.readFileSync(path.join(js, file), 'utf8');
        assert.doesNotMatch(source, /^import[^;]*from\s+'(three|\.\/view3d\/)/m, file);
    }
    const view = fs.readFileSync(path.join(js, 'panel-view.js'), 'utf8');
    assert.match(view, /import\('\.\/view3d\/view3d\.js'\)/);
});
