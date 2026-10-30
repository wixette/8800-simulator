/**
 * The one way in to the front panel (docs/3d-view.md, M4): every
 * control that throws a switch - the 2D panel, its labels, the Switch
 * Board Helper and the 3D view - calls panel.operate(), and whoever
 * draws the panel hears of every lamp and lever that changes through
 * panel.onPanelChange(). The 3D view relies on both, so both are held
 * here to what they promise.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import {Box} from '../js/box.js';
import {panel} from '../js/app.js';
import {stub} from './stub.js';

/**
 * A document whose every element takes a style and nothing else, so
 * that the panel's drawing runs; and the page around the switches.
 * @param {!Object} t The test context.
 * @return {{calls: !Array<string>, events: !Array, timers: !Array}}
 */
function stubPanel(t) {
    const calls = [];
    const events = [];
    const timers = [];
    stub(t, global, {
        document: {getElementById: () => ({style: {}, classList: {toggle() {}}})},
        window: {setTimeout: (f) => timers.push(f)},
    });
    stub(t, panel, {
        box: new Box(256),
        isPoweredOn: false,
        lamps: {},
        panelListeners: [],
        addressSwitchStates: new Array(16).fill(0),
        playToggle() { calls.push('toggle sound'); },
        playSwitch() { calls.push('switch sound'); },
        playBeepbeep() {},
        onPowerOn() { calls.push('on'); panel.isPoweredOn = true; panel.switchDown('off-on'); },
        onPowerOff() { calls.push('off'); panel.isPoweredOn = false; panel.switchUp('off-on'); },
        setStatus(id) { calls.push('status ' + id); },
    });
    for (const info of panel.STATELESS_SWITCH_INFO) {
        for (const cmd of [info.upperCmd, info.lowerCmd].filter(Boolean)) {
            stub(t, cmd, {callback: () => calls.push(cmd.id)});
        }
    }
    panel.onPanelChange((kind, id, value) => events.push([kind, id, value]));
    return {calls: calls, events: events, timers: timers};
}

test('a command switch thrown either way gives its command, with its sound', (t) => {
    const {calls, events} = stubPanel(t);
    assert.strictEqual(panel.operate('examine', 'up'), 'done');
    assert.strictEqual(panel.operate('examine', 'down'), 'done');
    assert.strictEqual(panel.operate('reset', 'down'), 'done');
    assert.deepStrictEqual(calls, ['switch sound', 'sw-examine', 'switch sound',
                                   'sw-examine-next', 'switch sound', 'sw-clr']);
    assert.deepStrictEqual(events, [['throw', 'examine', 'up'], ['throw', 'examine', 'down'],
                                    ['throw', 'reset', 'down']]);
});

test('a switch with nothing lettered one way does not go that way', (t) => {
    const {calls, events} = stubPanel(t);
    for (const id of ['single', 'aux1', 'aux2']) {
        assert.strictEqual(panel.operate(id, 'down'), 'none', id);
    }
    assert.deepStrictEqual(calls, []);
    assert.deepStrictEqual(events, []);
    assert.strictEqual(panel.operate('single', 'up'), 'done');
});

test('a latching switch moves only to where it is not, and says where it is', (t) => {
    const {calls, events} = stubPanel(t);
    assert.strictEqual(panel.switchPosition('s7'), -1);
    assert.strictEqual(panel.operate('s7', 'down'), 'same');
    assert.strictEqual(panel.operate('s7', 'up'), 'done');
    assert.strictEqual(panel.switchPosition('s7'), 1);
    assert.strictEqual(panel.addressSwitchStates[7], 1);
    assert.deepStrictEqual(events, [['switch', 's7', 1]]);
    assert.deepStrictEqual(calls, ['toggle sound']);
    assert.strictEqual(panel.switchPosition('examine'), 0, 'a command switch rests at the centre');
});

test('OFF/ON is up for OFF and down for ON, and refuses while the box is apart', (t) => {
    const {calls, events} = stubPanel(t);
    assert.strictEqual(panel.switchPosition('off-on'), 1);
    assert.strictEqual(panel.operate('off-on', 'up'), 'same');
    panel.box.takeOut('case.top', false);
    panel.box.snap();
    assert.strictEqual(panel.operate('off-on', 'down'), 'refused');
    assert.ok(!panel.isPoweredOn);
    assert.ok(calls.includes('status box-power-apart'));
    panel.box.snapTogether();
    assert.strictEqual(panel.operate('off-on', 'down'), 'done');
    assert.ok(panel.isPoweredOn);
    assert.deepStrictEqual(events.at(-1), ['switch', 'off-on', -1]);
    assert.strictEqual(panel.operate('off-on', 'up'), 'done');
    assert.ok(!panel.isPoweredOn);
});

test('a lamp tells its listeners when it changes, and only then', (t) => {
    const {events} = stubPanel(t);
    panel.setLed('a0', 1);
    panel.setLed('a0', true);
    panel.setLed('a0', 0);
    panel.setLed('wait', true);
    assert.deepStrictEqual(events, [['lamp', 'a0', true], ['lamp', 'a0', false],
                                    ['lamp', 'wait', true]]);
    assert.strictEqual(panel.lamps.a0, false);
    assert.strictEqual(panel.lamps.wait, true);
});

test('the address switches set from a link are heard too', (t) => {
    const {events} = stubPanel(t);
    panel.setAddressSwitches(0x8001);
    const raised = events.filter(([kind, , value]) => kind == 'switch' && value == 1)
          .map(([, id]) => id);
    assert.deepStrictEqual(raised, ['s0', 's15']);
});

test('every control on the 2D panel and the helper throws its switch through operate()', () => {
    // The closures the 2D panel builds for its levers, labels and the
    // helper's buttons: none of them gives a command by itself.
    const source = panel.createSwitch.toString();
    assert.match(source, /panel\.operate\(id, panel\.switchPosition\(id\) > 0 \? 'down' : 'up'\)/);
    assert.match(source, /panel\.operate\(id, 'up'\)/);
    assert.match(source, /panel\.operate\(id, 'down'\)/);
    assert.doesNotMatch(source, /\.callback\(\)/);
    assert.doesNotMatch(source, /panel\.onToggle\(/);
});
