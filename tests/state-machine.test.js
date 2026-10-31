/**
 * The 3D view's state machine (docs/3d-view.md, V4b), walked whole: from
 * a new page, every event in every state reached, with the real Box, the
 * real StageState and the panel's own power and view logic, until no new
 * state appears. Each state reached is held to the invariants, so a path
 * nobody thought of still has to keep them.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import {Box, MOVE_S, PREREQS} from '../js/box.js';
import {panel} from '../js/app.js';
import {StageState} from '../js/view3d/stage-state.js';
import {stub} from './stub.js';

/** The fields of a Box that make its state. */
const BOX_FIELDS = ['at', 'going', 'slots', 'refits', 'plan', 'moveS', 'planning',
                    'takenApart', 'memSize'];

/** The units a click tries: enough for every kind of rule, not every part. */
const CLICKED = ['case.top', 'harness.data_plug', 'card.cpu', 'card.sio', 'psu.t2', 'psu.t1',
                 'chassis.frame', 'panel.dress'];

const VIEW_IDS = ['front', 'whole', 'above', 'rear', 'apart'];

/**
 * The Shows a reader tries: one for each way Inside treats a Show. The
 * box does not know the Show, so a walk of its own takes these.
 */
const SHOW_IDS = ['all', 'case-faded', 'cpu'];

/**
 * The page, with the real logic and nothing drawn.
 * @param {!Object} t The test context.
 * @return {!Object} What the walk works with.
 */
function makeWorld(t) {
    const said = [];
    const elem = () => ({style: {}, classList: {toggle() {}}, setAttribute() {},
                         addEventListener() {}, focus() {}, querySelector: () => null});
    const elems = {};
    stub(t, global, {
        window: {setTimeout() {}, location: {hash: '', search: ''}},
        document: {getElementById: (id) => elems[id] || (elems[id] = elem())},
        localStorage: {getItem: () => '1', setItem() {}},
    });
    const box = new Box(256);
    const world = {box, said, placed: [], show: 'all'};
    const host = {
        isPoweredOn: () => panel.isPoweredOn,
        say(id) { said.push(id); world.check(id); },
        sayBox(why) { said.push(why.id); },
        place(id) { world.placed.push(id); },
        refit() {},
        refreshBox() {},
        partName: (name) => name,
        shown: () => world.show,
        drawShow(id) { world.show = id; },
    };
    world.state = new StageState(box, host);
    box.onChange = () => world.state.boxChanged();
    // What a status claims has to be true as it is said.
    world.check = (id) => {
        if (id == 'view-apart-done') {
            assert.ok(box.isAllOut(), 'said every part is out, and one is not');
        }
        if (id == 'view-reassembled') {
            assert.ok(box.isWhole(), 'said it is back together, and it is not');
        }
    };
    stub(t, panel, {
        box: box,
        view: '3d',
        isPoweredOn: false,
        has3d: true,
        stage3d: {hide() {}, show() {}, refreshTools() {}},
        applyDock() {},
        open3d() {},
        playToggle() {},
        playBeepbeep() {},
        onPowerOn() { panel.isPoweredOn = true; },
        onPowerOff() { panel.isPoweredOn = false; },
        setStatus(id) { said.push(id); },
        sayBox(why) { said.push(why.id); },
        sayMachineState() { said.push('status-machine'); },
    });
    return world;
}

/** Every event, by name: each is what the page does when it happens. */
function events(world) {
    const {box, state} = world;
    const list = {
        offOn: () => panel.onToggle('off-on'),
        load: () => panel.ensurePoweredOn(),
        to2d: () => panel.setView('2d', true),
        to3d: () => panel.setView('3d', true),
        frame: () => { if (box.isBusy()) box.update(MOVE_S / 2); },
        settle: () => box.snap(),
    };
    for (const size of [256, 4096, 8192]) {
        // As panel.onSetMemSize does: a new memory size means power off.
        list['mem' + size] = () => {
            if (size != box.memSize) {
                panel.onPowerOff();
                box.setMemSize(size);
            }
        };
    }
    if (panel.view == '3d') {
        list.home = () => state.home();
        list.putBack = () => state.putAllBack();
        for (const id of VIEW_IDS) {
            list['view:' + id] = () => state.setView(id);
        }
        for (const id of SHOW_IDS) {
            list['show:' + id] = () => state.chooseShow(id);
        }
        for (const unit of CLICKED) {
            list['click:' + unit] = () => state.click(unit);
        }
    }
    return list;
}

/** A state, as a value to put back, and as a key to know it by. */
function snapshot(world) {
    const box = {};
    for (const field of BOX_FIELDS) {
        box[field] = structuredClone(world.box[field]);
    }
    return {box, on: panel.isPoweredOn, page: panel.view, view: world.state.view,
            saying: world.state.saying, lastSaid: world.said.at(-1),
            show: world.show, viewShow: world.state.viewShow};
}

function restore(world, s) {
    for (const field of BOX_FIELDS) {
        world.box[field] = structuredClone(s.box[field]);
    }
    panel.isPoweredOn = s.on;
    panel.view = s.page;
    world.state.view = s.view;
    world.state.saying = s.saying;
    world.show = s.show;
    world.state.viewShow = s.viewShow;
    world.said.length = 0;
    if (s.lastSaid) {
        world.said.push(s.lastSaid);
    }
}

function keyOf(s) {
    return JSON.stringify([s.box.at, [...s.box.going], s.box.slots, [...s.box.refits], s.box.plan,
                           s.box.moveS, s.box.planning, s.box.takenApart, s.box.memSize,
                           s.on, s.page, s.view, s.saying, s.lastSaid == 'view-reassembling',
                           s.show, s.viewShow]);
}

/** The name of the box's state, in V4b's words. */
function boxState(box) {
    if (box.isWhole()) return 'whole';
    if (!box.isBusy()) return box.isTakenApart() ? 'apart' : 'by-hand';
    if (box.endsWhole()) return 'going-back';
    return box.isTakenApart() ? 'coming-apart' : 'moving';
}

/** The invariants of V4b, in any state at all. */
function checkInvariants(world, trail) {
    const {box, state} = world;
    const at = (claim) => claim + ' after ' + trail.join(' > ');
    if (!box.refits.size) {
        for (const unit of box.units()) {
            for (const needed of PREREQS[unit]) {
                assert.ok(box.position(unit) == 0 || box.position(needed) == 1,
                          at('I10: ' + unit + ' moved with ' + needed + ' at ' + box.position(needed)));
            }
        }
    }
    assert.ok(state.viewShow === null || (state.view == 'above' && world.show == state.viewShow),
              at('I12: Inside\'s Show, off Inside, or no longer on view'));
    assert.ok(!panel.isPoweredOn || box.isWhole(), at('I1: on, and not whole'));
    assert.ok(panel.view == '3d' || box.isWhole(), at('I2: in 2D, and not whole'));
    assert.strictEqual(state.canPutBack(), !box.endsWhole(), at('I3: the way back'));
    if (!box.isBusy()) {
        for (const unit of box.units()) {
            const place = box.position(unit);
            assert.ok(place == 0 || place == 1, at('I4: ' + unit + ' left at ' + place));
        }
        assert.strictEqual(state.view == 'apart', box.isTakenApart(),
                           at('I5: the Views menu and the box disagree'));
        assert.strictEqual(state.saying, null, at('I6: something left to say'));
        assert.notStrictEqual(world.said.at(-1), 'view-reassembling', at('I7: a stale status'));
        assert.strictEqual(box.interlock() === null, box.isWhole(), at('I8: the interlock'));
        if (!panel.isPoweredOn) {
            for (const unit of box.units()) {
                const out = box.position(unit) > 0;
                const why = out ? box.whyNotIn(unit) : box.whyNotOut(unit, false);
                assert.ok(!why || (unit == 'panel.dress' && !box.isOut('chassis.frame')),
                          at('I11: a click on ' + unit + ' refused, ' + (why && why.id)));
            }
        }
    }
}

/**
 * Walks every state a new page can reach by the events named.
 * @param {!Object} world What makeWorld made.
 * @param {function(string): boolean} wanted Whether to fire an event.
 * @return {{seen: !Map, kinds: !Set<string>, fired: !Set<string>,
 *           transitions: number}}
 */
function walk(world, wanted) {
    const start = snapshot(world);
    const seen = new Map([[keyOf(start), []]]);
    const queue = [start];
    const kinds = new Set();
    const fired = new Set();
    let transitions = 0;
    while (queue.length) {
        const s = queue.shift();
        const trail = seen.get(keyOf(s));
        restore(world, s);
        kinds.add(boxState(world.box) + (s.on ? ' on' : ' off') + ' ' + s.page);
        // I9: from here, Put it all back and a wait make a machine that
        // switches on, in one press, whatever happened.
        if (s.page == '3d') {
            world.state.putAllBack();
            world.box.snap();
            assert.ok(world.box.isWhole(), 'I9: no way back from ' + trail.join(' > '));
            assert.notStrictEqual(world.state.view, 'apart', 'I9: ' + trail.join(' > '));
            if (!s.on) {
                panel.onToggle('off-on');
                assert.ok(panel.isPoweredOn, 'I9: would not switch on after ' + trail.join(' > '));
            }
            restore(world, s);
        }
        for (const [name, fire] of Object.entries(events(world))) {
            if (!wanted(name)) {
                continue;
            }
            restore(world, s);
            fire();
            transitions++;
            fired.add(name.split(':')[0]);
            const path = trail.length < 30 ? trail.concat(name) : trail;
            checkInvariants(world, path);
            if (name == 'offOn' && world.said.at(-1) == 'box-power-apart') {
                assert.ok(world.state.canPutBack(), 'told to press what is not there: ' + path.join(' > '));
            }
            const next = snapshot(world);
            const key = keyOf(next);
            if (!seen.has(key)) {
                seen.set(key, path);
                queue.push(next);
            }
        }
    }
    return {seen, kinds, fired, transitions};
}

test('every state keeps the invariants, and every one has the way back', (t) => {
    const {seen, kinds, fired, transitions} = walk(makeWorld(t), (name) => !name.startsWith('show:'));
    // The walk really went everywhere the design says there is.
    for (const kind of ['whole off 2d', 'whole on 2d', 'whole off 3d', 'whole on 3d', 'by-hand off 3d',
                        'moving off 3d', 'coming-apart off 3d', 'apart off 3d', 'going-back off 3d']) {
        assert.ok(kinds.has(kind), kind + ' was not reached: ' + [...kinds].join(', '));
    }
    assert.deepStrictEqual([...kinds].filter((k) => / on /.test(k) && !k.startsWith('whole')), [],
                           'on, and anything but whole');
    assert.deepStrictEqual([...fired].sort(), ['click', 'frame', 'home', 'load', 'mem256', 'mem4096',
                                               'mem8192', 'offOn', 'putBack', 'settle', 'to2d', 'to3d',
                                               'view']);
    assert.ok(seen.size > 1000, seen.size + ' states');
    t.diagnostic(seen.size + ' states, ' + transitions + ' transitions');
});

test('every view with every Show keeps the invariants', (t) => {
    const {seen, fired} = walk(makeWorld(t), (name) => /^(view|show|home|settle|putBack)/.test(name));
    assert.deepStrictEqual([...fired].sort(), ['home', 'putBack', 'settle', 'show', 'view']);
    assert.ok(seen.size > 30, seen.size + ' states');
    t.diagnostic(seen.size + ' states');
});

test('Reset view is the whole way home, from anything', (t) => {
    const world = makeWorld(t);
    const {box, state} = world;
    box.takeOut('case.top', false);
    box.snap();
    state.home();
    box.snap();
    assert.ok(box.isWhole());
    assert.strictEqual(state.view, 'front');
    assert.strictEqual(world.show, 'all', 'and the whole machine shown');
    assert.strictEqual(world.placed.at(-1), 'front');
});

test('other views leave parts taken out by hand where they are', (t) => {
    const {box, state} = makeWorld(t);
    box.takeOut('case.top', false);
    box.snap();
    state.setView('above');
    box.snap();
    assert.ok(box.isOut('case.top'), 'the lid stays off to look inside');
    assert.ok(state.canPutBack(), 'and the way back stays on the stage');
});

test('going back partway through taking it apart turns round where it is', (t) => {
    const {box, state} = makeWorld(t);
    state.setView('apart');
    box.update(MOVE_S / 2);
    box.update(MOVE_S / 2);
    box.update(MOVE_S / 2);
    state.putAllBack();
    assert.ok(box.position('card.sio2') == 0, 'what had not left never left');
    box.snap();
    assert.ok(box.isWhole());
    assert.strictEqual(state.view, 'front');
});

test('a load while Taken apart leaves no Taken apart behind', (t) => {
    const world = makeWorld(t);
    const {box, state} = world;
    state.setView('apart');
    box.snap();
    assert.strictEqual(world.said.at(-1), 'view-apart-done');
    panel.ensurePoweredOn();
    assert.ok(box.isWhole());
    assert.strictEqual(state.view, 'front', 'the Views menu follows');
    assert.strictEqual(world.placed.at(-1), 'front', 'and so does the camera');
});

test('putting one part back in Taken apart says so, not that everything is out', (t) => {
    const world = makeWorld(t);
    const {box, state} = world;
    state.setView('apart');
    box.snap();
    state.click('card.sio2');
    box.snap();
    assert.strictEqual(world.said.at(-1), 'box-put-back');
    assert.strictEqual(state.view, 'apart', 'still Taken apart');
});

test('putting the last part back by hand ends Taken apart', (t) => {
    const {box, state} = makeWorld(t);
    state.setView('apart');
    box.snap();
    for (const unit of box.units().reverse()) {
        state.click(unit);
        box.snap();
    }
    assert.ok(box.isWhole());
    assert.strictEqual(state.view, 'front');
});

test('a click clears the way, and says only what was clicked', (t) => {
    const world = makeWorld(t);
    const {box, state} = world;
    state.click('card.cpu');
    assert.strictEqual(world.said.at(-1), 'box-taken-out');
    assert.ok(box.isBusy());
    box.snap();
    for (const unit of ['case.top', 'harness.data_plug', 'card.cpu']) {
        assert.ok(box.isOut(unit), unit);
    }
    assert.strictEqual(state.view, 'front', 'and it is no Taken apart');
    assert.ok(!box.isTakenApart());
});

test('the dress panel waits for the chassis, so a slip among the switches moves nothing', (t) => {
    const world = makeWorld(t);
    const {box, state} = world;
    state.click('panel.dress');
    assert.strictEqual(world.said.at(-1), 'box-out-first');
    assert.ok(box.isWhole());
    state.click('chassis.frame');
    box.snap();
    state.click('panel.dress');
    box.snap();
    assert.ok(box.isOut('panel.dress'));
});

test('a click that puts the last part back ends Taken apart for good', (t) => {
    const {box, state} = makeWorld(t);
    state.setView('apart');
    box.snap();
    state.click('case.top');
    box.snap();
    assert.ok(box.isWhole());
    assert.strictEqual(state.view, 'front');
    state.click('case.top');
    box.snap();
    assert.ok(!box.isTakenApart(), 'the lid off by hand is not Taken apart');
    state.setView('rear');
    box.snap();
    assert.ok(box.isOut('case.top'), 'so another view leaves it off');
});

test('Inside brings Case faded, and takes it away again', (t) => {
    const world = makeWorld(t);
    const {state} = world;
    state.setView('above');
    assert.strictEqual(world.show, 'case-faded');
    state.setView('rear');
    assert.strictEqual(world.show, 'all');
});

test('a Show the reader chose is theirs, on Inside or leaving it', (t) => {
    const world = makeWorld(t);
    const {state} = world;
    state.chooseShow('cpu');
    state.setView('above');
    assert.strictEqual(world.show, 'cpu', 'Inside leaves it');
    state.setView('front');
    assert.strictEqual(world.show, 'cpu', 'and so does leaving');
    state.chooseShow('all');
    state.setView('above');
    state.chooseShow('all');
    state.setView('above');
    assert.strictEqual(world.show, 'all', 'Everything chosen on Inside stays, for the lid from above');
    state.chooseShow('case-faded');
    state.setView('front');
    assert.strictEqual(world.show, 'case-faded', 'even the Show Inside would have chosen');
});

test('Reset view from Inside shows everything', (t) => {
    const world = makeWorld(t);
    world.state.setView('above');
    world.state.home();
    assert.strictEqual(world.show, 'all');
    assert.strictEqual(world.state.view, 'front');
});

test('OFF/ON during the way back says to wait, not to press what has gone', (t) => {
    const {box, state} = makeWorld(t);
    state.setView('apart');
    box.snap();
    state.putAllBack();
    assert.ok(box.isBusy());
    assert.strictEqual(box.interlock().id, 'box-busy');
});

test('new memory mid-move leaves no part stranded, and no plan half done', (t) => {
    const box = new Box(256);
    box.takeOut('case.top', false);
    box.snap();
    box.takeOut('card.sio', false);
    box.update(MOVE_S / 2);
    box.setMemSize(4096);
    box.snap();
    assert.strictEqual(box.position('card.sio'), 1, 'not left half way');
    box.putAllBack(true);
    box.update(MOVE_S / 2);
    box.setMemSize(8192);
    box.snap();
    assert.ok(box.isWhole(), 'the way back went on');
});
