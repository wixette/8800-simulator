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
 * @fileoverview The front panel: its switches and what they do, its
 * lamps, the big switches under it, and the sounds they make. Part of
 * the panel namespace, which js/panel.js declares (see there).
 */

import {asmtab} from './asmtab.js';
import {l10n} from './l10n.js';
import {panel} from './panel.js';
import {Sim8800} from './sim8800.js';

/**
 * When STOP switch is pressed.
 */
panel.onStop = function() {
    if (panel.reportIfOff()) {
        return;
    }
    panel.sim.stop();
    panel.followPc(true);
    if (panel.sim.blockedWrites) {
        panel.setStatus('status-stopped-blocked', panel.blockedParams(),
                        'warn');
        return;
    }
    panel.setStatus('status-stopped');
};

/**
 * When RUN switch is pressed.
 */
panel.onRun = function() {
    if (panel.reportIfOff()) {
        return;
    }
    // A running machine is not edited.
    panel.clearMemSelection();
    panel.sim.start();
    panel.setStatus('status-running');
};

/**
 * When SINGLE STEP switch is pressed.
 */
panel.onSingle = function() {
    if (panel.reportIfOff() || panel.reportIfRunning('SINGLE STEP')) {
        return;
    }
    panel.sim.singleStep();
    panel.followPc(true);
};

/**
 * Asks the Assembler to mark the line the program counter is on, and,
 * after something the reader did, to bring it into view. See
 * asmtab.requestPc().
 * @param {boolean} scroll Whether the reader caused this.
 */
panel.followPc = function(scroll) {
    asmtab.requestPc(scroll);
};

/**
 * When EXAMINE switch is pressed.
 */
panel.onExamine = function() {
    if (panel.reportIfOff() || panel.reportIfRunning('EXAMINE')) {
        return;
    }
    panel.sim.examine();
};

/**
 * When EXAMINE NEXT switch is pressed.
 */
panel.onExamineNext = function() {
    if (panel.reportIfOff() || panel.reportIfRunning('EXAMINE NEXT')) {
        return;
    }
    panel.sim.examineNext();
};

/**
 * When DEPOSIT switch is pressed.
 */
panel.onDeposit = function() {
    if (panel.reportIfOff() || panel.reportIfRunning('DEPOSIT')) {
        return;
    }
    if (panel.sim.deposit() === false) {
        panel.reportProtectedDeposit();
    }
};

/**
 * When DEPOSIT NEXT switch is pressed.
 */
panel.onDepositNext = function() {
    if (panel.reportIfOff() || panel.reportIfRunning('DEPOSIT NEXT')) {
        return;
    }
    if (panel.sim.depositNext() === false) {
        panel.reportProtectedDeposit();
    }
};

/**
 * On the real panel, EXAMINE, DEPOSIT and SINGLE STEP do nothing while
 * the machine runs; only STOP and RESET act. Here the status line says
 * so, rather than leave the switch looking broken.
 * @param {string} name The switch, as printed on the panel.
 * @return {boolean} Whether the machine is running.
 */
panel.reportIfRunning = function(name) {
    if (!panel.sim.isRunning) {
        return false;
    }
    panel.setStatus('switch-running', {name: name}, 'warn');
    return true;
};

/**
 * A DEPOSIT into a protected board changes nothing, and the real panel
 * left you to notice the data lamps had not moved. The status line
 * says why.
 */
panel.reportProtectedDeposit = function() {
    panel.setStatus('deposit-protected',
                    {address: Sim8800.toHex(panel.sim.lastAddress, 4)}, 'warn');
};

/**
 * When RESET switch is pressed.
 */
panel.onReset = function() {
    if (panel.reportIfOff()) {
        return;
    }
    panel.sim.reset();
    panel.followPc(true);
    panel.setStatus('status-reset');
};

/**
 * When CLR is pressed: RESET's lower position, "a CLEAR command for
 * external input/output equipment". Here that is the serial boards,
 * which drop whatever was typed and not yet read.
 */
panel.onClr = function() {
    if (panel.reportIfOff()) {
        return;
    }
    if (panel.sio) {
        // The two boards share one key queue, so this clears both.
        panel.sio.reset();
    }
    panel.setStatus('status-clr');
};

/**
 * When PROTECT is pressed.
 */
panel.onProtect = function() {
    panel.setProtection(true);
};

/**
 * When UNPROTECT is pressed.
 */
panel.onUnprotect = function() {
    panel.setProtection(false);
};

/**
 * PROTECT or UNPROTECT the memory board at the address on the bus. Like
 * every switch but RESET on the real machine, it works only while the
 * machine is stopped.
 * @param {boolean} on True to protect, false to unprotect.
 */
panel.setProtection = function(on) {
    if (panel.reportIfOff()) {
        return;
    }
    if (panel.sim.isRunning) {
        panel.setStatus('protect-running', {}, 'warn');
        return;
    }
    var range = panel.sim.protect(on);
    if (!range) {
        panel.setStatus('protect-no-memory',
                        {address: Sim8800.toHex(panel.sim.busAddress, 4)},
                        'warn');
        return;
    }
    panel.setStatus(on ? 'status-protected' : 'status-unprotected',
                    {start: Sim8800.toHex(range.start, 4),
                     end: Sim8800.toHex(range.end, 4)});
};

/**
 * When either AUX switch is pressed. Connected to nothing, on a new
 * Altair as here, which is worth saying whether the machine is on or
 * not.
 */
panel.onAux = function() {
    panel.setStatus('status-aux');
};

/**
 * When a running program first writes to protected memory. Called once
 * a run however often it tries; the rest are counted, for the message
 * when the machine stops.
 * @param {number} address Where it tried.
 */
panel.onProtectedWrite = function(address) {
    panel.setStatus('write-protected', {address: Sim8800.toHex(address, 4)},
                    'warn');
};

/**
 * The count of refused writes, and the first address, for a message.
 * @return {{count: number, address: string}}
 */
panel.blockedParams = function() {
    return {count: panel.sim.blockedWrites,
            address: Sim8800.toHex(panel.sim.firstBlockedAddress, 4)};
};

/**
 * When power is turned on. Silent: the beep belongs to the OFF/ON
 * switch, not to every way the machine can come up (D23 in
 * docs/ms-basic-4k.md).
 */
panel.onPowerOn = function() {
    panel.sim.powerOn();
    panel.isPoweredOn = true;
    panel.switchDown('off-on');
    panel.updateHelperSwitches();
    // Only a live machine has a blinking carriage.
    document.body.classList.add('powered-on');
    panel.updateMemoryControls();
    panel.setStatus('status-on');
};

/**
 * When power is turned off.
 */
panel.onPowerOff = function() {
    panel.sim.powerOff();
    panel.isPoweredOn = false;
    panel.switchUp('off-on');
    panel.updateHelperSwitches();
    document.body.classList.remove('powered-on');
    if (panel.sio) {
        // Keys typed but never read do not survive the power going off.
        panel.sio.reset();
    }
    panel.renderTeletype();
    panel.updateMemoryControls();
    panel.setStatus('status-off');
};

/**
 * When CPU sets the address LEDs.
 */
panel.setAddressLedsCallback = function(bits) {
    for (let i = 0; i < bits.length; i++) {
        panel.setLed('a' + i, bits[i]);
    }
    panel.followPc(false);
};

/**
 * When CPU sets the data LEDs.
 */
panel.setDataLedsCallback = function(bits) {
    for (let i = 0; i < bits.length; i++) {
        panel.setLed('d' + i, bits[i]);
    }
};

/**
 * When CPU sets the WAIT LED.
 */
panel.setWaitLedCallback = function(isRunning) {
    panel.setLed('wait', !isRunning);
    // A machine that stopped by itself ran into a HLT. The lamp says
    // so to anyone who knows the panel; the status line says it to
    // everyone else (D26). A stop asked for from the panel writes its
    // own message afterwards.
    if (!isRunning && panel.sim && panel.sim.halted) {
        if (panel.sim.blockedWrites) {
            panel.setStatus('status-halted-blocked', panel.blockedParams(),
                            'warn');
            return;
        }
        panel.setStatus('status-halted');
    }
};

/**
 * What each lamp the simulator reports through updateLamps() last
 * showed, so that a running program, which reports them after every
 * batch of cycles, only touches the page when one changes.
 * @type {Object<string, boolean>}
 */
panel.lampStates = {};

/**
 * When the simulator reports the lamps that show the machine's state:
 * PROT, HLTA, M1 and INTE.
 * @param {Object<string, boolean>} lamps Each lamp's id, and whether it
 *     is lit.
 */
panel.setLampsCallback = function(lamps) {
    for (let id in lamps) {
        if (panel.lampStates[id] !== lamps[id]) {
            panel.lampStates[id] = lamps[id];
            panel.setLed(id, lamps[id]);
        }
    }
};

/**
 * When CPU sets the status LEDs.
 */
panel.setStatusLedsCallback = function(isPoweredOn) {
    // M1 is not among them: it goes out in a halt, so the simulator
    // reports it with HLTA, through setLampsCallback.
    ['memr', 'wo'].forEach(function(id) {
        panel.setLed(id, isPoweredOn);
    });
};

/**
 * Repaints the helper buttons that stand for a switch, so that the
 * board below the panel reads the same way the panel does: a raised
 * address switch is orange, and the power button lights while on.
 */
panel.updateHelperSwitches = function() {
    for (let i = 0; i < 16; i++) {
        let elem = document.getElementById('s-s' + i);
        if (elem) {
            elem.classList.toggle('switch-on', !!panel.addressSwitchStates[i]);
        }
    }
    var power = document.getElementById('s-off-on');
    if (power) {
        power.classList.toggle('on', !!panel.isPoweredOn);
    }
};

/**
 * When CPU reads the number input by the address/data switches.
 */
panel.getInputAddressCallback = function() {
    var word = 0;
    for (let i = 0; i < 16; i++) {
        if (panel.addressSwitchStates[i]) {
            word |= 1 << i;
        }
    }
    return word;
};

/**
 * Puts the address switches in the given positions, as if each had been
 * flipped by hand but without the sound.
 * @param {number} word Bit i up raises switch A<i>.
 */
panel.setAddressSwitches = function(word) {
    for (let i = 0; i < 16; i++) {
        let up = (word >> i) & 1;
        panel.addressSwitchStates[i] = up;
        if (up) {
            panel.switchUp('s' + i);
        } else {
            panel.switchDown('s' + i);
        }
    }
    panel.updateHelperSwitches();
};

/**
 * The position of every LED on the panel artwork.
 */
panel.LED_INFO = [
    {id: 'inte', x: 194, y: 120},
    {id: 'prot', x: 245, y: 120},
    {id: 'memr', x: 296, y: 120},
    {id: 'inp', x: 347, y: 120},
    {id: 'm1', x: 398, y: 120},
    {id: 'out', x: 449, y: 120},
    {id: 'hlta', x: 500, y: 120},
    {id: 'stack', x: 551, y: 120},
    {id: 'wo', x: 602, y: 120},
    {id: 'int', x: 653, y: 120},
    {id: 'd7', x: 830, y: 120},
    {id: 'd6', x: 880, y: 120},
    {id: 'd5', x: 959, y: 120},
    {id: 'd4', x: 1009, y: 120},
    {id: 'd3', x: 1059, y: 120},
    {id: 'd2', x: 1138, y: 120},
    {id: 'd1', x: 1188, y: 120},
    {id: 'd0', x: 1238, y: 120},
    {id: 'wait', x: 194, y: 230},
    {id: 'hlda', x: 245, y: 230},
    {id: 'a15', x: 346, y: 230},
    {id: 'a14', x: 423, y: 230},
    {id: 'a13', x: 473, y: 230},
    {id: 'a12', x: 523, y: 230},
    {id: 'a11', x: 602, y: 230},
    {id: 'a10', x: 652, y: 230},
    {id: 'a9', x: 702, y: 230},
    {id: 'a8', x: 780, y: 230},
    {id: 'a7', x: 830, y: 230},
    {id: 'a6', x: 880, y: 230},
    {id: 'a5', x: 959, y: 230},
    {id: 'a4', x: 1009, y: 230},
    {id: 'a3', x: 1059, y: 230},
    {id: 'a2', x: 1138, y: 230},
    {id: 'a1', x: 1188, y: 230},
    {id: 'a0', x: 1238, y: 230},
];

/**
 * The position of every toggle switch on the panel artwork.
 *
 * A toggle switch has an upper state (which means 1 for address
 * switches) and a lower state (which means 0 for address switches).
 */
panel.TOGGLE_SWITCH_INFO = [
    {id: 'off-on', x: 105, y: 439},
    {id: 's15', x: 346, y: 334},
    {id: 's14', x: 423, y: 334},
    {id: 's13', x: 473, y: 334},
    {id: 's12', x: 523, y: 334},
    {id: 's11', x: 602, y: 334},
    {id: 's10', x: 652, y: 334},
    {id: 's9', x: 702, y: 334},
    {id: 's8', x: 780, y: 334},
    {id: 's7', x: 830, y: 334},
    {id: 's6', x: 880, y: 334},
    {id: 's5', x: 959, y: 334},
    {id: 's4', x: 1009, y: 334},
    {id: 's3', x: 1059, y: 334},
    {id: 's2', x: 1138, y: 334},
    {id: 's1', x: 1188, y: 334},
    {id: 's0', x: 1238, y: 334},
];

/**
 * The info of all stateless switches.
 *
 * A stateless switch may have an upper command and a lower command.
 * When a command is clicked, the switch moves up or down then back to
 * its middle position, without keeping upper or lower state. Each
 * command's box is the bounding box of its label in the artwork.
 */
panel.STATELESS_SWITCH_INFO = [
    {
        id: 'stop-run',
        x: 348,
        y: 439,
        upperCmd: {
            id: 'sw-stop',
            x: 341.22,
            y: 427.03,
            width: 33.82,
            height: 13.87,
            callback: panel.onStop,
        },
        lowerCmd: {
            id: 'sw-run',
            x: 344.63,
            y: 467.68,
            width: 27.08,
            height: 13.87,
            callback: panel.onRun,
        },
    },
    {
        id: 'single',
        x: 446,
        y: 439,
        upperCmd: {
            id: 'sw-single',
            x: 434.31,
            y: 416.02,
            width: 46.54,
            height: 26.38,
            callback: panel.onSingle,
        },
        lowerCmd: null,
    },
    {
        id: 'examine',
        x: 550,
        y: 439,
        upperCmd: {
            id: 'sw-examine',
            x: 530.88,
            y: 426.76,
            width: 56.96,
            height: 13.87,
            callback: panel.onExamine,
        },
        lowerCmd: {
            id: 'sw-examine-next',
            x: 531.44,
            y: 469.77,
            width: 56.96,
            height: 26.38,
            callback: panel.onExamineNext,
        },
    },
    {
        id: 'deposit',
        x: 650,
        y: 439,
        upperCmd: {
            id: 'sw-deposit',
            x: 633,
            y: 426.76,
            width: 54.87,
            height: 13.87,
            callback: panel.onDeposit,
        },
        lowerCmd: {
            id: 'sw-deposit-next',
            x: 633,
            y: 469.77,
            width: 54.87,
            height: 26.38,
            callback: panel.onDepositNext,
        },
    },
    {
        id: 'reset',
        x: 753,
        y: 439,
        upperCmd: {
            id: 'sw-reset',
            x: 741.71,
            y: 426.76,
            width: 41.68,
            height: 13.87,
            callback: panel.onReset,
        },
        lowerCmd: {
            id: 'sw-clr',
            x: 749.28,
            y: 469.85,
            width: 25.75,
            height: 13.87,
            callback: panel.onClr,
        },
    },
    {
        id: 'protect',
        x: 853,
        y: 439,
        upperCmd: {
            id: 'sw-protect',
            x: 833.76,
            y: 426.75,
            width: 59.75,
            height: 13.87,
            callback: panel.onProtect,
        },
        lowerCmd: {
            id: 'sw-unprotect',
            x: 824.69,
            y: 469.85,
            width: 77.87,
            height: 13.87,
            callback: panel.onUnprotect,
        },
    },
    // The AUX switches are labelled above only, so, like SINGLE STEP,
    // they throw only up: the panel's printing is the rule for which
    // way a switch goes. Neither has a button on the strip, since
    // neither does anything.
    {
        id: 'aux1',
        x: 957,
        y: 439,
        upperCmd: {
            id: 'sw-aux1',
            x: 952.91,
            y: 427.03,
            width: 27.07,
            height: 13.87,
            callback: panel.onAux,
        },
        lowerCmd: null,
    },
    {
        id: 'aux2',
        x: 1060,
        y: 439,
        upperCmd: {
            id: 'sw-aux2',
            x: 1055.02,
            y: 427.03,
            width: 27.07,
            height: 13.87,
            callback: panel.onAux,
        },
        lowerCmd: null,
    },
];

/**
 * The type ID of toggle switch.
 */
panel.TOGGLE_SWITCH = 0;

/**
 * The type ID of stateless switch.
 */
panel.STATELESS_SWITCH = 1;

/** The current state of all the address switches. */
panel.addressSwitchStates = new Array(16);

/**
 * Throws a switch on the front panel. This is the one way in for every
 * control that throws one: a click on the 2D panel or on a command's
 * label, a button of the Switch Board Helper, and a pick in the 3D
 * view, so that all of them do the same thing, with the same sounds
 * and the same refusals (docs/3d-view.md, M4).
 * @param {string} id The switch: 's0' to 's15', 'off-on', or a command
 *     switch such as 'examine'.
 * @param {string} dir 'up' or 'down'.
 * @return {string} 'done' if it was thrown; 'same' if a latching switch
 *     stands that way already; 'none' if nothing is lettered that way,
 *     so the switch does not go; 'refused' if it would not move (OFF/ON
 *     with the box taken apart).
 */
panel.operate = function(id, dir) {
    var info = panel.STATELESS_SWITCH_INFO.find((s) => s.id == id);
    if (info) {
        var cmd = dir == 'up' ? info.upperCmd : info.lowerCmd;
        if (!cmd) {
            return 'none';
        }
        if (dir == 'up') {
            panel.switchUpThenBack(id);
        } else {
            panel.switchDownThenBack(id);
        }
        panel.playSwitch();
        cmd.callback();
        return 'done';
    }
    var before = panel.switchPosition(id);
    if ((before > 0) == (dir == 'up')) {
        return 'same';
    }
    panel.onToggle(id);
    return panel.switchPosition(id) == before ? 'refused' : 'done';
};

/**
 * Where a switch's lever stands.
 * @param {string} id The switch, as for panel.operate().
 * @return {number} 1 up, -1 down, 0 at the centre (a command switch at
 *     rest). OFF/ON is up for OFF and down for ON, as lettered.
 */
panel.switchPosition = function(id) {
    if (id[0] == 's' && /^s\d+$/.test(id)) {
        return panel.addressSwitchStates[parseInt(id.substr(1))] ? 1 : -1;
    }
    if (id == 'off-on') {
        return panel.isPoweredOn ? -1 : 1;
    }
    return 0;
};

/**
 * Whether each lamp is lit, as the panel last drew it.
 * @type {!Object<string, boolean>}
 */
panel.lamps = {};

/**
 * Who is told when a lamp or a switch on the panel changes: the 3D
 * view, which draws the same panel (docs/3d-view.md, M4).
 * @type {!Array<function(string, string, *)>}
 */
panel.panelListeners = [];

/**
 * Asks to be told of every change on the front panel.
 * @param {function(string, string, *)} listener Called with what
 *     changed - 'lamp' (lit: a boolean), 'switch' (a latching switch's
 *     new position: 1 or -1) or 'throw' (a command switch thrown: 'up'
 *     or 'down', and back) - its id, and that value.
 */
panel.onPanelChange = function(listener) {
    panel.panelListeners.push(listener);
};

/**
 * Tells the listeners of a change.
 * @param {string} kind 'lamp', 'switch' or 'throw'.
 * @param {string} id The lamp or switch.
 * @param {*} value What it is now.
 */
panel.panelChanged = function(kind, id, value) {
    for (let i = 0; i < panel.panelListeners.length; i++) {
        panel.panelListeners[i](kind, id, value);
    }
};

/**
 * Creates a new LED inside the panel svg.
 * @param {string} id The LED ID. This ID will be used as the prefix
 *     of DOM element's ID.
 * @param {number} x The x position.
 * @param {number} y The y position.
 */
panel.createLed = function(id, x, y) {
    var panelElem = document.getElementById('panel');
    var ledOnElem = document.getElementById('led-on');
    var ledOffElem = document.getElementById('led-off');

    ledOnElem.style.display = 'none';
    ledOffElem.style.display = 'none';

    var onElem = ledOnElem.cloneNode(true);
    onElem.id = id + '-on';
    onElem.x.baseVal.value = '' + x;
    onElem.y.baseVal.value = '' + y;
    onElem.style.display = 'none';

    var offElem = ledOffElem.cloneNode(true);
    offElem.id = id + '-off';
    offElem.x.baseVal.value = '' + x;
    offElem.y.baseVal.value = '' + y;
    offElem.style.display = 'inline';

    panelElem.appendChild(onElem);
    panelElem.appendChild(offElem);
};

/**
 * Turns the specified LED on or off.
 * @param {string} id The LED ID.
 * @param {*} on Whether it is lit.
 */
panel.setLed = function(id, on) {
    document.getElementById(id + '-on').style.display = on ? 'inline' : 'none';
    document.getElementById(id + '-off').style.display = on ? 'none' : 'inline';
    if (panel.lamps[id] !== !!on) {
        panel.lamps[id] = !!on;
        panel.panelChanged('lamp', id, !!on);
    }
};

/**
 * The SVG namespace, for creating SVG elements.
 * @type {string}
 */
panel.SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates the click target of a command label inside the panel svg.
 *
 * The labels themselves (STOP, RUN, EXAMINE, ...) are part of the panel
 * artwork in images/panel.svg, where they are drawn as outlined paths
 * and cannot be clicked. This covers a label with an invisible rect so
 * that clicking it operates the switch, the way it does on the real
 * machine. The rect's position and size are the label's bounding box in
 * the panel's coordinate system. The matching helper button below the
 * panel gets the same callback.
 * @param {Object} cmd The command info, holding the label's ID and
 *     bounding box.
 * @param {function()} callback Called when the label is clicked.
 */
panel.createCmdLabel = function(cmd, callback) {
    var panelElem = document.getElementById('panel');

    var elem = document.createElementNS(panel.SVG_NS, 'rect');
    elem.id = cmd.id;
    elem.setAttribute('x', cmd.x);
    elem.setAttribute('y', cmd.y);
    elem.setAttribute('width', cmd.width);
    elem.setAttribute('height', cmd.height);
    elem.setAttribute('fill', 'transparent');
    elem.setAttribute('pointer-events', 'all');
    elem.style.cursor = 'pointer';
    elem.addEventListener('click', callback, false);
    panelElem.appendChild(elem);

    // Its button on the strip under the panel, if it has one.
    var helper = document.getElementById('s-' + cmd.id);
    if (helper) {
        helper.addEventListener('click', callback, false);
    }
};

/**
 * Creates a new switch inside the panel svg.
 * @param {string} id The switch ID. This ID will be used as the
 *     prefix of DOM element's ID.
 * @param {number} type The type of the switch.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {Object} upperCmd The upperCmd info, for STATELESS_SWITCH
 *     only.
 * @param {Object} lowerCmd The lowerCmd info, for STATELESS_SWITCH
 *     only.
 */
panel.createSwitch = function(id, type, x, y, upperCmd, lowerCmd) {
    var panelElem = document.getElementById('panel');
    var switchMidElem = document.getElementById('switch-mid');
    var switchUpElem = document.getElementById('switch-up');
    var switchDownElem = document.getElementById('switch-down');

    switchMidElem.style.display = 'none';
    switchUpElem.style.display = 'none';
    switchDownElem.style.display = 'none';

    var midElem = switchMidElem.cloneNode(true);
    midElem.id = id + '-mid';
    midElem.x.baseVal.value = '' + x;
    midElem.y.baseVal.value = '' + y;
    midElem.style.display = (type == panel.STATELESS_SWITCH) ? 'inline' : 'none';

    var upElem = switchUpElem.cloneNode(true);
    upElem.id = id + '-up';
    upElem.x.baseVal.value = '' + x;
    upElem.y.baseVal.value = '' + y;
    if (type == panel.TOGGLE_SWITCH) {
        upElem.style.cursor = 'pointer';
    }
    upElem.style.display = 'none';

    var downElem = switchDownElem.cloneNode(true);
    downElem.id = id + '-down';
    downElem.x.baseVal.value = '' + x;
    downElem.y.baseVal.value = '' + y;
    if (type == panel.TOGGLE_SWITCH) {
        downElem.style.cursor = 'pointer';
    }
    downElem.style.display = (type == panel.TOGGLE_SWITCH) ? 'inline' : 'none';

    panelElem.appendChild(midElem);
    panelElem.appendChild(upElem);
    panelElem.appendChild(downElem);

    // Each switch also takes a press anywhere near its lever, not only
    // on the 20 by 30 sprite: a scaled-down panel leaves that very
    // small. The address switches stand 50 apart, so a target 40 wide
    // still leaves a gap between neighbours.
    if (type == panel.TOGGLE_SWITCH) {
        let toggle = function() {
            panel.operate(id, panel.switchPosition(id) > 0 ? 'down' : 'up');
        };
        upElem.addEventListener('click', toggle, false);
        downElem.addEventListener('click', toggle, false);
        panel.createHitArea(x - 10, y - 8, 40, 46, toggle);
        // The helper button below the panel.
        document.getElementById('s-' + id).addEventListener(
            'click', toggle, false);
    } else {
        let upper = upperCmd && function() {
            panel.operate(id, 'up');
        };
        let lower = lowerCmd && function() {
            panel.operate(id, 'down');
        };
        // A position with no label in the artwork has no box to click.
        if (upper && upperCmd.width) {
            panel.createCmdLabel(upperCmd, upper);
        }
        if (lower && lowerCmd.width) {
            panel.createCmdLabel(lowerCmd, lower);
        }
        // The lever's top half throws it up and its bottom half down,
        // as on the metal. SINGLE STEP and the AUX switches only go one
        // way, so all of the lever is that way.
        if (upper) {
            panel.createHitArea(x - 15, y - 8, 50, lower ? 23 : 46, upper);
        }
        if (lower) {
            panel.createHitArea(x - 15, y + 15, 50, 23, lower);
        }
    }
};

/**
 * Lays an invisible target over part of the panel artwork.
 * @param {number} x The left edge, in the artwork's coordinates.
 * @param {number} y The top edge.
 * @param {number} width The width.
 * @param {number} height The height.
 * @param {function()} callback What a press does.
 */
panel.createHitArea = function(x, y, width, height, callback) {
    var elem = document.createElementNS(panel.SVG_NS, 'rect');
    elem.setAttribute('x', x);
    elem.setAttribute('y', y);
    elem.setAttribute('width', width);
    elem.setAttribute('height', height);
    elem.setAttribute('fill', 'transparent');
    elem.setAttribute('pointer-events', 'all');
    elem.style.cursor = 'pointer';
    elem.addEventListener('click', callback, false);
    document.getElementById('panel').appendChild(elem);
};

/**
 * Moves the switch handle up - for TOGGLE_SWITCH only.
 * @param {string} id The switch ID.
 */
panel.switchUp = function(id) {
    var midElem = document.getElementById(id + '-mid');
    var upElem = document.getElementById(id + '-up');
    var downElem = document.getElementById(id + '-down');

    upElem.style.display = 'inline';
    midElem.style.display = 'none';
    downElem.style.display = 'none';
    panel.panelChanged('switch', id, 1);
};

/**
 * Moves the switch handle down - for TOGGLE_SWITCH only.
 * @param {string} id The switch ID.
 */
panel.switchDown = function(id) {
    var midElem = document.getElementById(id + '-mid');
    var upElem = document.getElementById(id + '-up');
    var downElem = document.getElementById(id + '-down');

    upElem.style.display = 'none';
    midElem.style.display = 'none';
    downElem.style.display = 'inline';
    panel.panelChanged('switch', id, -1);
};

/**
 * Moves the switch handle up, then back to the middle position - for
 * STATELESS_SWITCH only.
 * @param {string} id The switch ID.
 */
panel.switchUpThenBack = function(id) {
    panel.panelChanged('throw', id, 'up');
    var midElem = document.getElementById(id + '-mid');
    var upElem = document.getElementById(id + '-up');
    var downElem = document.getElementById(id + '-down');

    upElem.style.display = 'none';
    midElem.style.display = 'inline';
    downElem.style.display = 'none';

    window.setTimeout(function() {
        upElem.style.display = 'inline';
        midElem.style.display = 'none';
        downElem.style.display = 'none';

        window.setTimeout(function() {
            upElem.style.display = 'none';
            midElem.style.display = 'inline';
            downElem.style.display = 'none';
        }, 300);
    }, 300);
};

/**
 * Moves the switch handle down, then back to the middle position -
 * for STATELESS_SWITCH only.
 * @param {string} id The switch ID.
 */
panel.switchDownThenBack = function(id) {
    panel.panelChanged('throw', id, 'down');
    var midElem = document.getElementById(id + '-mid');
    var upElem = document.getElementById(id + '-up');
    var downElem = document.getElementById(id + '-down');

    upElem.style.display = 'none';
    midElem.style.display = 'inline';
    downElem.style.display = 'none';

    window.setTimeout(function() {
        upElem.style.display = 'none';
        midElem.style.display = 'none';
        downElem.style.display = 'inline';

        window.setTimeout(function() {
            upElem.style.display = 'none';
            midElem.style.display = 'inline';
            downElem.style.display = 'none';
        }, 400);
    }, 100);
};

/**
 * Handles the click event for all TOGGLE_SWITCH controls.
 * @param {string} id The switch ID which has been clicked.
 */
panel.onToggle = function(id) {
    panel.playToggle();
    if (id[0] == 's') {
        var bitIndex = parseInt(id.substr(1));
        var state = panel.addressSwitchStates[bitIndex];
        if (state == 0) {
            panel.switchUp(id);
        } else {
            panel.switchDown(id);
        }
        panel.addressSwitchStates[bitIndex] = state ? 0 : 1;
        panel.updateHelperSwitches();
    } else if (id == 'off-on') {
        if (panel.isPoweredOn) {
            panel.onPowerOff();
        } else {
            // It will not go on while the box is taken apart in the 3D
            // view, and says what is out (docs/3d-view.md, V4).
            var why = panel.box.interlock();
            if (why) {
                panel.sayBox(why);
                return;
            }
            panel.onPowerOn();
            // The machine finding its voice, half a second after the
            // switch that asked for it (D23).
            window.setTimeout(function() {
                panel.playBeepbeep();
            }, 500);
        }
    }
};

/**
 * Plays a sound audio.
 */
panel.playSound = function(id) {
    var sound = document.getElementById(id);
    sound.currentTime = 0;
    sound.play();
};

/**
 * Plays beep beep.
 */
panel.playBeepbeep = function() {
    panel.playSound('sound-beepbeep');
};

/**
 * Plays the sound of toggle click.
 */
panel.playToggle = function() {
    panel.playSound('sound-toggle');
};

/**
 * Plays the sound of stateless switch click.
 */
panel.playSwitch = function() {
    panel.playSound('sound-switch');
};

/**
 * Names the strip's tab for what pressing it will do, in the current
 * language.
 */
panel.refreshStripTab = function() {
    var tab = document.getElementById('strip-tab');
    if (tab) {
        // An arrow and nothing else, so its words are its tooltip and
        // its name for a screen reader.
        var text = l10n.getMessage(panel.isHelperShown ?
                                   'strip-hide' : 'strip-show');
        tab.title = text;
        tab.setAttribute('aria-label', text);
    }
};

/**
 * Lets the strip's tab fold the strip away and bring it back, by mouse
 * or by keyboard.
 */
panel.initSwitchStrip = function() {
    panel.makePressable(document.getElementById('strip-tab'), function() {
        panel.setHelperShown(!panel.isHelperShown, true);
    });
};

/**
 * Widens the strip to the panel's artwork, so that it reads as part of
 * the machine rather than as a row of the page. The artwork keeps its
 * shape inside the space it is given, so it is often narrower than that
 * space. The strip is never narrower than its own two rows, so its
 * height - and so the panel's - does not depend on this.
 */
panel.fitSwitchStrip = function() {
    var svg = document.getElementById('panel');
    var strip = document.getElementById('switch-strip');
    if (!svg || !strip) {
        return;
    }
    var box = svg.getBoundingClientRect();
    var artwork = Math.min(box.width, box.height * 1440 / 644);
    strip.style.minWidth = Math.round(artwork) + 'px';
};

/**
 * Where showing the Switch Board Helper is remembered.
 * @type {string}
 */
panel.helperStorageKey = 'sim8800helper';

/**
 * Whether the Switch Board Helper's large buttons are under the panel.
 * @type {boolean}
 */
panel.isHelperShown = false;

/**
 * @return {boolean} Whether to show the Switch Board Helper: as it was
 *     left, and on a first visit, yes. On a phone the panel's own
 *     switches are too small and too close to hit, and in a classroom
 *     they are the easier way in everywhere.
 */
panel.readHelperShown = function() {
    var saved = null;
    try {
        saved = localStorage.getItem(panel.helperStorageKey);
    } catch (e) {
        saved = null;
    }
    return saved != 'off';
};

/**
 * Shows the Switch Board Helper, or folds it away to the tab on its top
 * edge.
 * @param {boolean} shown Whether to show it.
 * @param {boolean} save Whether this is the reader's choice, to be
 *     remembered, rather than how a first visit finds it.
 */
panel.setHelperShown = function(shown, save) {
    panel.isHelperShown = shown;
    document.getElementById('switch-strip').classList.toggle('folded', !shown);
    var tab = document.getElementById('strip-tab');
    tab.setAttribute('aria-expanded', shown ? 'true' : 'false');
    panel.refreshStripTab();
    if (save) {
        try {
            localStorage.setItem(panel.helperStorageKey, shown ? 'on' : 'off');
        } catch (e) {
            // Not remembered; it still applies to this visit.
        }
    }
    // The panel gives up or takes back the room the helper uses.
    panel.applyDock();
};
