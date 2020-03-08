/**
 *   Copyright 2020 wixette@gmail.com
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
 * @fileoverview The main logic to control the front panel UI.
 */

/**
 * Simple namespace.
 * @type {Object}
 */
panel = {};

/**
 * When STOP switch is pressed.
 */
panel.onStop = function() {
    panel.sim.stop();
};

/**
 * When RUN switch is pressed.
 */
panel.onRun = function() {
    panel.sim.start();
};

/**
 * When SINGLE STEP switch is pressed.
 */
panel.onSingle = function() {
    panel.sim.step(1);
};

/**
 * When EXAMINE switch is pressed.
 */
panel.onExamine = function() {
    panel.sim.examine();
};

/**
 * When EXAMINE NEXT switch is pressed.
 */
panel.onExamineNext = function() {
    panel.sim.examineNext();
};

/**
 * When DEPOSIT switch is pressed.
 */
panel.onDeposit = function() {
    panel.sim.deposit();
};

/**
 * When DEPOSIT NEXT switch is pressed.
 */
panel.onDepositNext = function() {
    panel.sim.depositNext();
};

/**
 * When RESET switch is pressed.
 */
panel.onReset = function() {
    panel.sim.reset();
};

/**
 * When power is turned on.
 */
panel.onPowerOn = function() {
    panel.sim.powerOn();
    window.setTimeout(function() {
        panel.playBeepbeep();
    }, 500);
};

/**
 * When power is turned off.
 */
panel.onPowerOff = function() {
    panel.sim.powerOff();
};

/**
 * When CPU sets the address LEDs.
 */
panel.setAddressLedsCallback = function(bits) {
    for (let i = 0; i < bits.length; i++) {
        var ledId = 'A' + i;
        if (bits[i]) {
            panel.ledOn(ledId);
        } else {
            panel.ledOff(ledId);
        }
    }
};

/**
 * When CPU sets the data LEDs.
 */
panel.setDataLedsCallback = function(bits) {
    for (let i = 0; i < bits.length; i++) {
        var ledId = 'D' + i;
        if (bits[i]) {
            panel.ledOn(ledId);
        } else {
            panel.ledOff(ledId);
        }
    }
};

/**
 * When CPU sets the WAIT LED.
 */
panel.setWaitLedCallback = function(isRunning) {
    var ledId = 'WAIT';
    if (!isRunning) {
        panel.ledOn(ledId);
    } else {
        panel.ledOff(ledId);
    }
};

/**
 * When CPU sets the status LEDs.
 */
panel.setStatusLedsCallback = function(isPoweredOn) {
    var ledIds = ['MEMR', 'MI', 'WO'];
    for (let i = 0; i < ledIds.length; i++) {
        if (isPoweredOn) {
            panel.ledOn(ledIds[i]);
        } else {
            panel.ledOff(ledIds[i]);
        }
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
 * When CPU dumps the CPU status for debug.
 */
panel.dumpCpuCallback = function(dumpHtml) {
    var dumpCpuElem = document.getElementById('cpu-dump');
    dumpCpuElem.innerHTML = dumpHtml;
};

/**
 * When CPU dumps the MEM contents for debug.
 */
panel.dumpMemCallback = function(dumpHtml) {
    var dumpMemElem = document.getElementById('mem-dump');
    dumpMemElem.innerHTML = dumpHtml;
};

/**
 * Deposites data into MEM directly in debug panel.
 */
panel.debugLoadData = function() {
    var data = document.getElementById("debug-data-input").value;
    panel.sim.loadDataAsHexString(0, data);
};

/**
 * The info of all LEDs.
 */
panel.LED_INFO = [
    {
        id: 'INTE',
        x: 194,
        y: 120
    },
    {
        id: 'PROT',
        x: 245,
        y: 120
    },
    {
        id: 'MEMR',
        x: 296,
        y: 120
    },
    {
        id: 'INP',
        x: 347,
        y: 120
    },
    {
        id: 'MI',
        x: 398,
        y: 120
    },
    {
        id: 'OUT',
        x: 449,
        y: 120
    },
    {
        id: 'HLTA',
        x: 500,
        y: 120
    },
    {
        id: 'STACK',
        x: 551,
        y: 120
    },
    {
        id: 'WO',
        x: 602,
        y: 120
    },
    {
        id: 'INT',
        x: 653,
        y: 120
    },
    {
        id: 'D7',
        x: 830,
        y: 120
    },
    {
        id: 'D6',
        x: 880,
        y: 120
    },
    {
        id: 'D5',
        x: 959,
        y: 120
    },
    {
        id: 'D4',
        x: 1009,
        y: 120
    },
    {
        id: 'D3',
        x: 1059,
        y: 120
    },
    {
        id: 'D2',
        x: 1138,
        y: 120
    },
    {
        id: 'D1',
        x: 1188,
        y: 120
    },
    {
        id: 'D0',
        x: 1238,
        y: 120
    },
    {
        id: 'WAIT',
        x: 194,
        y: 230
    },
    {
        id: 'HLDA',
        x: 245,
        y: 230
    },
    {
        id: 'A15',
        x: 346,
        y: 230
    },
    {
        id: 'A14',
        x: 423,
        y: 230
    },
    {
        id: 'A13',
        x: 473,
        y: 230
    },
    {
        id: 'A12',
        x: 523,
        y: 230
    },
    {
        id: 'A11',
        x: 602,
        y: 230
    },
    {
        id: 'A10',
        x: 652,
        y: 230
    },
    {
        id: 'A9',
        x: 702,
        y: 230
    },
    {
        id: 'A8',
        x: 780,
        y: 230
    },
    {
        id: 'A7',
        x: 830,
        y: 230
    },
    {
        id: 'A6',
        x: 880,
        y: 230
    },
    {
        id: 'A5',
        x: 959,
        y: 230
    },
    {
        id: 'A4',
        x: 1009,
        y: 230
    },
    {
        id: 'A3',
        x: 1059,
        y: 230
    },
    {
        id: 'A2',
        x: 1138,
        y: 230
    },
    {
        id: 'A1',
        x: 1188,
        y: 230
    },
    {
        id: 'A0',
        x: 1238,
        y: 230
    },
];

/**
 * The info of all toggle switches.
 *
 * A toggle switch has an upper state (which means 1 for address
 * switches) and a lower state (which means 0 for address switches).
 */
panel.TOGGLE_SWITCH_INFO = [
    {
        id: 'OFF-ON',
        x: 105,
        y: 439
    },
    {
        id: 'S15',
        x: 346,
        y: 334
    },
    {
        id: 'S14',
        x: 423,
        y: 334
    },
    {
        id: 'S13',
        x: 473,
        y: 334
    },
    {
        id: 'S12',
        x: 523,
        y: 334
    },
    {
        id: 'S11',
        x: 602,
        y: 334
    },
    {
        id: 'S10',
        x: 652,
        y: 334
    },
    {
        id: 'S9',
        x: 702,
        y: 334
    },
    {
        id: 'S8',
        x: 780,
        y: 334
    },
    {
        id: 'S7',
        x: 830,
        y: 334
    },
    {
        id: 'S6',
        x: 880,
        y: 334
    },
    {
        id: 'S5',
        x: 959,
        y: 334
    },
    {
        id: 'S4',
        x: 1009,
        y: 334
    },
    {
        id: 'S3',
        x: 1059,
        y: 334
    },
    {
        id: 'S2',
        x: 1138,
        y: 334
    },
    {
        id: 'S1',
        x: 1188,
        y: 334
    },
    {
        id: 'S0',
        x: 1238,
        y: 334
    },
];

/**
 * The info of all stateless switches.
 *
 * A stateless switch may has a upper command and a lower
 * command. When a command is clicked, the switch moves up or down
 * then back to its middle position, without keeping upper or lower
 * state.
 */
panel.STATELESS_SWITCH_INFO = [
    {
        id: 'STOP-RUN',
        x: 348,
        y: 439,
        upperCmd: { textId: 'SW-STOP', callback: panel.onStop },
        lowerCmd: { textId: 'SW-RUN', callback: panel.onRun },
    },
    {
        id: 'SINGLE',
        x: 446,
        y: 439,
        upperCmd: { textId: 'SW-SINGLE', callback: panel.onSingle },
        lowerCmd: null,
    },
    {
        id: 'EXAMINE',
        x: 550,
        y: 439,
        upperCmd: { textId: 'SW-EXAMINE', callback: panel.onExamine },
        lowerCmd: { textId: 'SW-EXAMINE-NEXT', callback: panel.onExamineNext },
    },
    {
        id: 'DEPOSIT',
        x: 650,
        y: 439,
        upperCmd: { textId: 'SW-DEPOSIT', callback: panel.onDeposit },
        lowerCmd: { textId: 'SW-DEPOSIT-NEXT', callback: panel.onDepositNext },
    },
    {
        id: 'RESET',
        x: 753,
        y: 439,
        upperCmd: { textId: 'SW-RESET', callback: panel.onReset },
        lowerCmd: null,
    },
    {
        id: 'PROTECT',
        x: 853,
        y: 439,
        upperCmd: null,
        lowerCmd: null,
    },
    {
        id: 'AUX1',
        x: 957,
        y: 439,
        upperCmd: null,
        lowerCmd: null,
    },
    {
        id: 'AUX2',
        x: 1060,
        y: 439,
        upperCmd: null,
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

/** If the power is turned on. */
panel.isPoweredOn = false;

/** The simulator object. */
panel.sim = null;

/**
 * Initializes thie UI.
 */
panel.init = function() {
    // Restores the last locale if it exists.
    l10n.restoreLocale();

    // Initializes event listener for nav buttons.
    var button = document.getElementById('nav-locale');
    button.addEventListener('click', l10n.nextLocale, false);
    button = document.getElementById('nav-sim');
    button.addEventListener('click', panel.showTabSim, false);
    button = document.getElementById('nav-debug');
    button.addEventListener('click', panel.showTabDebug, false);
    button = document.getElementById('nav-ref');
    button.addEventListener('click', panel.showTabRes, false);
    panel.showTabSim();

    // Initializes event listener for debug controls.
    button = document.getElementById('debug-load-data');
    button.addEventListener('click', panel.debugLoadData, false);

    // Initializes svg components for all LEDs.
    for (let i = 0; i < panel.LED_INFO.length; i++) {
        let info = panel.LED_INFO[i];
        let led = panel.createLed(info.id, info.x, info.y);
    }

    // Initializes svg components for all switches.
    for (let i = 0; i < panel.TOGGLE_SWITCH_INFO.length; i++) {
        let info = panel.TOGGLE_SWITCH_INFO[i];
        let sw = panel.createSwitch(info.id, panel.TOGGLE_SWITCH,
                                    info.x, info.y,
                                    null, null);
    }
    for (let i = 0; i < panel.STATELESS_SWITCH_INFO.length; i++) {
        let info = panel.STATELESS_SWITCH_INFO[i];
        let sw = panel.createSwitch(info.id, panel.STATELESS_SWITCH,
                                    info.x, info.y,
                                    info.upperCmd, info.lowerCmd);
    }

    // Initializes internal states.
    panel.isPoweredOn = false;
    panel.addressSwitchStates.fill(0);
    panel.switchUp('OFF-ON');

    // Initializes the simulator.
    panel.sim = new Sim8800(
        256, /* 256B MEM */
        1000000, /* 1MHz */
        panel.setAddressLedsCallback, panel.setDataLedsCallback,
        panel.setWaitLedCallback, panel.setStatusLedsCallback,
        panel.getInputAddressCallback,
        panel.dumpCpuCallback, panel.dumpMemCallback);
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
 * Turns on the specified LED.
 * @param {string} id The LED ID.
 */
panel.ledOn = function(id) {
    document.getElementById(id + '-on').style.display = 'inline';
    document.getElementById(id + '-off').style.display = 'none';
};

/**
 * Turns off the specified LED.
 * @param {string} id The LED ID.
 */
panel.ledOff = function(id) {
    document.getElementById(id + '-on').style.display = 'none';
    document.getElementById(id + '-off').style.display = 'inline';
};

/**
 * Creates a new toggle switch inside the panel svg.
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

    if (type == panel.TOGGLE_SWITCH) {
        var sourceId = id;
        upElem.addEventListener('click',
                                function() {
                                    panel.onToggle(sourceId);
                                },
                                false);
        downElem.addEventListener('click',
                                  function() {
                                      panel.onToggle(sourceId);
                                  },
                                  false);
        // Also installs helper switch handlers.
        let softSwitchId = 'S-' + id;
        let elem = document.getElementById(softSwitchId);
        elem.addEventListener(
            'click',
            function() {
                panel.onToggle(sourceId);
            },
            false
        );
    } else {
        if (upperCmd) {
            let cmdElem = document.getElementById(upperCmd.textId);
            cmdElem.style.cursor = 'pointer';
            cmdElem.addEventListener(
                'click',
                function() {
                    panel.switchUpThenBack(id);
                    panel.playSwitch();
                    upperCmd.callback();
                },
                false);
            // Also installs helper switch handlers.
            cmdElem = document.getElementById('S' + upperCmd.textId);
            cmdElem.addEventListener(
                'click',
                function() {
                    panel.switchUpThenBack(id);
                    panel.playSwitch();
                    upperCmd.callback();
                },
                false);
        }
        if (lowerCmd) {
            let cmdElem = document.getElementById(lowerCmd.textId);
            cmdElem.style.cursor = 'pointer';
            cmdElem.addEventListener(
                'click',
                function() {
                    panel.switchDownThenBack(id);
                    panel.playSwitch();
                    lowerCmd.callback();
                },
                false);
            // Also installs helper switch handlers.
            cmdElem = document.getElementById('S' + lowerCmd.textId);
            cmdElem.addEventListener(
                'click',
                function() {
                    panel.switchDownThenBack(id);
                    panel.playSwitch();
                    lowerCmd.callback();
                },
                false);
        }
    }

    panelElem.appendChild(midElem);
    panelElem.appendChild(upElem);
    panelElem.appendChild(downElem);
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
};

/**
 * Moves the switch handle up, then back to the middle position - for
 * STATELESS_SWITCH only.
 * @param {string} id The switch ID.
 */
panel.switchUpThenBack = function(id) {
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
    if (id[0] == 'S') {
        var bitIndex = parseInt(id.substr(1));
        var state = panel.addressSwitchStates[bitIndex];
        if (state == 0) {
            panel.switchUp(id);
        } else {
            panel.switchDown(id);
        }
        panel.addressSwitchStates[bitIndex] = state ? 0 : 1;
    } else if (id == 'OFF-ON') {
        console.log(panel.isPoweredOn);
        if (panel.isPoweredOn) {
            panel.onPowerOff();
            panel.switchUp(id);
            panel.isPoweredOn = false;
        } else {
            panel.onPowerOn();
            panel.switchDown(id);
            panel.isPoweredOn = true;
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
 * Highlights a nav tab or removes the effect.
 * @param {Element} elem The DOM element of the nav tab.
 * @param {boolean} highlight Whether highlight the tab.
 */
panel.highlightNavTab = function(elem, highlight) {
    if (highlight) {
        elem.classList.add('selected');
    } else {
        elem.classList.remove('selected');
    }
};

/**
 * Shows the simulator tab, and hides the other two.
 */
panel.showTabSim = function() {
    document.getElementById('tab-sim').style.display = 'block';
    document.getElementById('tab-debug').style.display = 'none';
    document.getElementById('tab-ref').style.display = 'none';
    panel.highlightNavTab(document.getElementById('nav-sim'), true);
    panel.highlightNavTab(document.getElementById('nav-debug'), false);
    panel.highlightNavTab(document.getElementById('nav-ref'), false);
};

/**
 * Shows the debug tab, and hides the other two.
 */
panel.showTabDebug = function() {
    document.getElementById('tab-sim').style.display = 'none';
    document.getElementById('tab-debug').style.display = 'block';
    document.getElementById('tab-ref').style.display = 'none';
    panel.highlightNavTab(document.getElementById('nav-sim'), false);
    panel.highlightNavTab(document.getElementById('nav-debug'), true);
    panel.highlightNavTab(document.getElementById('nav-ref'), false);
};

/**
 * Shows the resource tab, and hides the other two.
 */
panel.showTabRes = function() {
    document.getElementById('tab-sim').style.display = 'none';
    document.getElementById('tab-debug').style.display = 'none';
    document.getElementById('tab-ref').style.display = 'block';
    panel.highlightNavTab(document.getElementById('nav-sim'), false);
    panel.highlightNavTab(document.getElementById('nav-debug'), false);
    panel.highlightNavTab(document.getElementById('nav-ref'), true);
};
