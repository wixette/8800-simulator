/**
 * The machine's box (js/box.js): taking it apart and putting it back
 * in an order the real machine allows, the cards the memory size fits,
 * and how the box and the power meet, in every way the page switches
 * the machine on or off (docs/3d-view.md, V4).
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {Box, CARD_IDS, MOVE_S, NEEDS_IN, PARTS, PREREQS, QUICK_MOVE_S, WAITS, fittedFor} from '../js/box.js';
import {l10n} from '../js/l10n.js';
import {panel} from '../js/app.js';
import {stub} from './stub.js';

const ROOT = path.join(import.meta.dirname, '..');
const PARAMS = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'model', 'params', 'machine.json'), 'utf8'));

/** Runs a box's moves to their end, checking each one as it starts. */
function runChecked(box) {
    const started = [];
    let before = new Set();
    for (let i = 0; box.isBusy() && i < 10000; i++) {
        const moving = new Set([...box.going.keys()]);
        for (const unit of moving) {
            if (!before.has(unit)) {
                started.push([unit, box.going.get(unit)]);
                // When a unit starts out, what it needs out is out;
                // when it starts back, what depends on it is in.
                if (box.going.get(unit) == 1) {
                    for (const other of PREREQS[unit]) {
                        assert.ok(box.isOut(other), unit + ' started out before ' + other);
                    }
                } else {
                    for (const other of box.units()) {
                        if (PREREQS[other].includes(unit)) {
                            assert.ok(box.isIn(other), unit + ' went back before ' + other);
                        }
                    }
                    for (const other of NEEDS_IN[unit] || []) {
                        assert.ok(box.isIn(other), unit + ' went back before ' + other);
                    }
                }
            }
        }
        before = moving;
        box.update(MOVE_S / 4);
    }
    assert.ok(!box.isBusy());
    return started;
}

test('the box takes its rules for the parts from the model\'s params', () => {
    assert.deepStrictEqual(Object.keys(PARAMS.prereqs.v).sort(), PARTS.slice().sort());
    for (const unit of PARTS) {
        assert.deepStrictEqual(PREREQS[unit], PARAMS.prereqs.v[unit], unit);
    }
    for (const card of CARD_IDS) {
        assert.ok(PREREQS['card.' + card].includes('case.top'), card + ' needs the lid off');
    }
    assert.ok(PREREQS['card.cpu'].includes('harness.data_plug'), 'the CPU card needs its plug out');
});

test('the cards follow the Memory menu, as docs/3d-model.md tabulates', () => {
    assert.deepStrictEqual(fittedFor(256),
                           {cpu: [0, 0], mem1k: [0, 1], sio: [0, 2], sio2: [0, 3]});
    assert.deepStrictEqual(fittedFor(4096),
                           {cpu: [0, 0], mem4k_0: [0, 1], sio: [0, 2], sio2: [0, 3]});
    assert.deepStrictEqual(fittedFor(8192),
                           {cpu: [0, 0], mem4k_0: [0, 1], mem4k_1: [0, 2], sio: [0, 3],
                            sio2: [1, 0]});
    for (const size of panel.MEM_SIZES) {
        assert.ok(Object.keys(fittedFor(size)).length >= 4, size + ' is a size the box knows');
    }
});

test('a new box is whole, and the machine may go on', () => {
    const box = new Box();
    assert.ok(box.isWhole());
    assert.strictEqual(box.interlock(), null);
    assert.deepStrictEqual(box.cards(), ['cpu', 'mem1k', 'sio', 'sio2']);
});

test('nothing comes out while the machine is on', () => {
    const box = new Box();
    assert.deepStrictEqual(box.takeOut('case.top', true), {id: 'box-switch-off', params: {}});
    assert.deepStrictEqual(box.takeAllApart(true), {id: 'box-switch-off', params: {}});
    assert.ok(box.isWhole(), 'and nothing moved');
});

test('a unit comes out after what it needs out, in order', () => {
    const box = new Box();
    assert.deepStrictEqual(box.routeOut('card.mem1k'), ['case.top', 'card.mem1k']);
    assert.deepStrictEqual(box.routeOut('card.cpu'), ['case.top', 'harness.data_plug', 'card.cpu']);
    assert.deepStrictEqual(box.routeOut('psu.board'), ['case.top', 'psu.t3', 'psu.fan', 'psu.board']);
    assert.strictEqual(box.takeOut('card.cpu', false), null);
    assert.deepStrictEqual(box.takeOut('psu.t2', false), {id: 'box-busy', params: {}},
                           'one move at a time');
    assert.deepStrictEqual(runChecked(box).map(([unit]) => unit),
                           ['case.top', 'harness.data_plug', 'card.cpu']);
    assert.deepStrictEqual(box.routeOut('card.mem1k'), ['card.mem1k'], 'what is out needs no second go');
});

test('the dress panel waits for the chassis, and nothing else waits', () => {
    const box = new Box();
    assert.deepStrictEqual(box.takeOut('panel.dress', false),
                           {id: 'box-out-first', params: {part: 'chassis.frame'}});
    assert.ok(box.isWhole(), 'and a slip among the switches moves nothing');
    for (const unit of box.units().filter((unit) => !WAITS.includes(unit))) {
        assert.strictEqual(box.whyNotOut(unit, false), null, unit);
    }
    assert.strictEqual(box.takeOut('chassis.frame', false), null);
    box.snap();
    assert.strictEqual(box.takeOut('panel.dress', false), null);
});

test('a unit goes back after what depends on it, and the plug after its card', () => {
    const box = new Box();
    box.takeOut('card.cpu', false);
    box.snap();
    assert.deepStrictEqual(box.routeIn('harness.data_plug'), ['card.cpu', 'harness.data_plug'],
                           'the plug goes onto the CPU card\'s wafer');
    assert.deepStrictEqual(box.routeIn('case.top'), ['card.cpu', 'harness.data_plug', 'case.top']);
    assert.strictEqual(box.putBack('case.top'), null);
    assert.deepStrictEqual(runChecked(box).map(([unit]) => unit),
                           ['card.cpu', 'harness.data_plug', 'case.top']);
    assert.ok(box.isWhole());
});

test('a unit goes back by itself at MOVE_S, several quickly', () => {
    const box = new Box();
    box.takeOut('card.cpu', false);
    box.snap();
    const whole = box.position('card.cpu');
    assert.strictEqual(whole, 1);
    box.putBack('card.cpu');
    box.update(QUICK_MOVE_S);
    assert.ok(box.position('card.cpu') > 0.5, 'by itself it is watched');
    box.snap();
    box.takeOut('card.cpu', false);
    box.snap();
    box.putBack('case.top');
    box.update(QUICK_MOVE_S);
    assert.strictEqual(box.position('card.cpu'), 0, 'with others it is quick');
});

test('taken all apart and put all back, every move is one the rules allow', () => {
    for (const size of [256, 4096, 8192]) {
        const box = new Box(size);
        assert.strictEqual(box.takeAllApart(false), null);
        const out = runChecked(box);
        assert.deepStrictEqual(out.map(([unit]) => unit), box.units(), size + ': in order');
        assert.ok(box.units().every((unit) => box.isOut(unit)), 'everything is out');
        assert.strictEqual(box.putAllBack(), null);
        const back = runChecked(box);
        assert.deepStrictEqual(back.map(([unit]) => unit), box.units().reverse());
        assert.ok(box.isWhole(), size + ': whole again');
    }
});

test('while anything is out or moving, the machine will not go on, and says what', () => {
    const box = new Box();
    box.takeOut('case.top', false);
    assert.deepStrictEqual(box.interlock(), {id: 'box-power-apart', params: {part: 'case.top'}},
                           'not while it moves');
    box.snap();
    assert.deepStrictEqual(box.interlock(), {id: 'box-power-apart', params: {part: 'case.top'}});
    box.putBack('case.top');
    assert.ok(box.interlock(), 'nor while it goes back');
    box.snap();
    assert.strictEqual(box.interlock(), null);
});

test('leaving Taken apart puts it all back quickly, in the same order, then at the usual pace again', () => {
    /** How long, in seconds of updates, until the box stops moving. */
    const timeToStop = (box) => {
        let t = 0;
        for (; box.isBusy() && t < 60; t += 0.01) {
            box.update(0.01);
        }
        return t;
    };
    const apart = () => {
        const box = new Box(8192);
        box.takeAllApart(false);
        box.snap();
        return box;
    };
    const units = apart().units().length;
    const slow = apart();
    slow.putAllBack();
    const slowS = timeToStop(slow);
    assert.ok(Math.abs(slowS - units * MOVE_S) < units * 0.02, slowS);
    const quick = apart();
    const order = [];
    quick.onChange = () => {
        for (const unit of quick.units()) {
            if (quick.isIn(unit) && !order.includes(unit)) {
                order.push(unit);
            }
        }
    };
    quick.putAllBack(true);
    const quickS = timeToStop(quick);
    assert.ok(quick.isWhole());
    assert.ok(Math.abs(quickS - units * QUICK_MOVE_S) < units * 0.02, quickS);
    assert.ok(quickS <= 2.5, 'a couple of seconds, not ' + quickS);
    assert.deepStrictEqual(order, quick.units().reverse(), 'one after another, as the rules allow');
    // A unit taken out afterwards moves at the usual pace.
    quick.takeOut('case.top', false);
    quick.update(QUICK_MOVE_S * 2);
    assert.ok(quick.isBusy() && quick.position('case.top') < 0.5);
    // And Take it all apart is never hurried.
    const again = new Box(8192);
    again.putAllBack(true);
    again.takeAllApart(false);
    assert.ok(Math.abs(timeToStop(again) - units * MOVE_S) < units * 0.02);
});

test('snapping together puts every unit in at once, and says if anything was out', () => {
    const box = new Box(8192);
    assert.strictEqual(box.snapTogether(), false, 'nothing was out');
    box.takeAllApart(false);
    box.update(MOVE_S * 3.5);
    assert.ok(box.isBusy());
    let changes = 0;
    box.onChange = () => changes++;
    assert.strictEqual(box.snapTogether(), true);
    assert.ok(box.isWhole());
    assert.ok(changes > 0, 'whoever draws the box is told');
    assert.ok(box.units().every((unit) => box.position(unit) == 0));
    assert.deepStrictEqual(box.slotOf('sio2'), [1, 0]);
});

test('with the lid on, new memory changes the cards at once, out of sight', () => {
    const box = new Box(256);
    box.setMemSize(8192);
    assert.ok(box.isWhole());
    assert.deepStrictEqual(box.cards(), ['cpu', 'mem4k_0', 'mem4k_1', 'sio', 'sio2']);
    assert.deepStrictEqual(box.slotOf('sio2'), [1, 0]);
    assert.strictEqual(box.slotOf('mem1k'), null);
});

test('with the lid off, the cards are seen to change, and a card that was out stays out', () => {
    const box = new Box(256);
    box.takeOut('case.top', false);
    box.snap();
    box.takeOut('card.sio2', false);
    box.snap();
    box.setMemSize(8192);
    assert.ok(box.isBusy(), 'the cards move');
    assert.ok(box.interlock(), 'and the machine will not go on meanwhile');
    box.snap();
    assert.deepStrictEqual(box.cards(), ['cpu', 'mem4k_0', 'mem4k_1', 'sio', 'sio2']);
    assert.ok(box.isIn('card.mem4k_0') && box.isIn('card.mem4k_1'), 'the new cards are seated');
    assert.strictEqual(box.slotOf('mem1k'), null, 'the 1K card has left the box');
    assert.ok(box.isOut('card.sio2'), 'the pulled 2SIO is still out');
    assert.deepStrictEqual(box.slotOf('sio2'), [1, 0], 'over its new slot');
    // Back to 256 bytes: the 1K card comes back in, seated.
    box.setMemSize(256);
    box.snap();
    assert.deepStrictEqual(box.cards(), ['cpu', 'mem1k', 'sio', 'sio2']);
    assert.ok(box.isIn('card.mem1k'));
    assert.strictEqual(box.position('card.mem4k_0'), 0, 'a card that left is ready for next time');
});

// ---- The box and the page's power ----

/**
 * Stands in for the page around the panel's power: the simulator, the
 * switches' drawing and sounds, and the status line.
 * @param {!Object} t The test context.
 * @return {{said: !Array, powerOns: !Array}} What was said, and each
 *     power-up.
 */
function stubPower(t) {
    const said = [];
    const powerOns = [];
    stub(t, panel, {
        box: new Box(256),
        isPoweredOn: false,
        reassembledForPowerOn: false,
        sim: {mem: new Array(256), setMemSize() {}, powerOff() {}},
        onPowerOn() { powerOns.push(true); panel.isPoweredOn = true; },
        onPowerOff() { panel.isPoweredOn = false; },
        playToggle() {},
        playBeepbeep() {},
        refreshStatus() {},
    });
    // The beep, half a second after the switch.
    stub(t, global, {window: {setTimeout() {}}});
    t.mock.method(panel, 'setStatus', (id, params, severity, afterPowerOn) => {
        said.push({id: id, params: params || {}, afterPowerOn: !!afterPowerOn,
                   reassembled: !!(afterPowerOn && panel.reassembledForPowerOn)});
        if (afterPowerOn) {
            panel.reassembledForPowerOn = false;
        }
    });
    return {said: said, powerOns: powerOns};
}

test('the OFF/ON switch will not switch a machine on that is taken apart', (t) => {
    const {said, powerOns} = stubPower(t);
    panel.box.takeOut('case.top', false);
    panel.box.snap();
    panel.onToggle('off-on');
    assert.deepStrictEqual(powerOns, [], 'it stayed off');
    assert.strictEqual(said.at(-1).id, 'box-power-apart');
    assert.strictEqual(said.at(-1).params.part, l10n.getMessage('part-case.top'),
                       'naming what is out, in the reader\'s language');
    // Put back, it goes on.
    panel.box.putBack('case.top');
    panel.box.snap();
    panel.onToggle('off-on');
    assert.deepStrictEqual(powerOns, [true]);
});

test('every way of loading a program puts the box back together, and says so', (t) => {
    const {said, powerOns} = stubPower(t);
    panel.box.takeAllApart(false);
    panel.box.snap();
    assert.strictEqual(panel.ensurePoweredOn(), true);
    assert.ok(panel.box.isWhole(), 'whole again');
    assert.deepStrictEqual(powerOns, [true]);
    assert.strictEqual(panel.reassembledForPowerOn, true);
    // The loader's own message reports the power-up; the note goes with it.
    panel.setStatus('link-loaded', {bytes: 3}, '', true);
    assert.strictEqual(said.at(-1).reassembled, true);
    assert.strictEqual(panel.reassembledForPowerOn, false, 'said once');
    // A machine that was whole and off is only switched on.
    panel.isPoweredOn = false;
    assert.strictEqual(panel.ensurePoweredOn(), true);
    assert.strictEqual(panel.reassembledForPowerOn, false);
});

test('the status line says the box was put back, in place of "switched on"', (t) => {
    stub(t, panel, {reassembledForPowerOn: true});
    const bar = {classList: {toggle() {}}};
    const text = {textContent: ''};
    stub(t, global, {document: {getElementById: (id) => id == 'status-bar' ? bar : text}});
    panel.setStatus('link-loaded', {bytes: 3}, '', true);
    assert.ok(text.textContent.startsWith(l10n.getMessage('reassembled-first')),
              text.textContent);
    assert.ok(!text.textContent.includes(l10n.getMessage('powered-on-first')));
    panel.setStatus('link-loaded', {bytes: 3}, '', true);
    assert.ok(text.textContent.startsWith(l10n.getMessage('powered-on-first')),
              'the next load only switched it on');
    panel.setStatus(null);
});

test('every way the page switches the machine on goes through the box', () => {
    // The OFF/ON switch asks the box; everything else - the loaders, the
    // Assembler, a link - comes through ensurePoweredOn(), which puts it
    // together. Nothing else may call onPowerOn().
    const js = path.join(ROOT, 'js');
    const callers = [];
    for (const file of fs.readdirSync(js, {recursive: true}).filter((f) => f.endsWith('.js'))) {
        const source = fs.readFileSync(path.join(js, file), 'utf8');
        for (const m of source.matchAll(/^(panel\.\w+|asmtab\.\w+) = function[\s\S]*?^\};/gm)) {
            if (/panel\.onPowerOn\(\)/.test(m[0])) {
                callers.push(m[1]);
            }
        }
    }
    assert.deepStrictEqual(callers.sort(), ['panel.ensurePoweredOn', 'panel.onToggle']);
    assert.match(panel.onToggle.toString(), /panel\.box\.interlock\(\)[\s\S]*panel\.onPowerOn\(\)/);
    assert.match(panel.ensurePoweredOn.toString(),
                 /panel\.box\.snapTogether\(\)[\s\S]*panel\.onPowerOn\(\)/);
});

test('switching off, by the switch or by new memory, leaves the box as it is', (t) => {
    stubPower(t);
    panel.isPoweredOn = true;
    panel.onToggle('off-on');
    assert.ok(!panel.isPoweredOn);
    panel.box.takeOut('case.top', false);
    panel.box.snap();
    panel.onSetMemSize(4096);
    panel.box.snap();
    assert.ok(panel.box.isOut('case.top'), 'the lid is still off');
    assert.deepStrictEqual(panel.box.cards(), ['cpu', 'mem4k_0', 'sio', 'sio2'],
                           'and the cards are the new memory\'s');
});

test('a box refusal names its part in the reader\'s language', (t) => {
    const said = [];
    t.mock.method(panel, 'setStatus', (id, params, severity) => said.push([id, params, severity]));
    panel.sayBox({id: 'box-out-first', params: {part: 'psu.t2'}});
    assert.deepStrictEqual(said, [['box-out-first', {part: l10n.getMessage('part-psu.t2')}, 'warn']]);
    for (const unit of new Box(8192).units().concat(['card.mem1k'])) {
        assert.ok(l10n.MESSAGES['part-' + unit], unit + ' has a name');
    }
});

test('a box says where each unit will be once it stops: what a view frames', () => {
    const box = new Box();
    box.takeOut('case.top', false);
    assert.strictEqual(box.destination('case.top'), 1, 'on its way out');
    box.update(MOVE_S / 2);
    assert.strictEqual(box.destination('case.top'), 1);
    box.snap();
    box.takeAllApart(false);
    assert.ok(box.units().every((unit) => box.destination(unit) == 1), 'all, once the plan is done');
    box.snap();
    box.putAllBack();
    assert.ok(box.units().every((unit) => box.destination(unit) == 0));
    box.snap();
    box.takeOut('case.top', false);
    box.snap();
    box.setMemSize(4096);
    assert.strictEqual(box.destination('card.mem4k_0'), 0, 'a new card comes down into its slot');
    assert.strictEqual(box.destination('card.mem1k'), 1, 'the one that leaves goes up');
});
