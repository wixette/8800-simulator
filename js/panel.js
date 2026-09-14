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
 * @fileoverview The main logic to control the front panel UI.
 */

/**
 * Simple namespace.
 * @type {Object}
 */
panel = {};

/**
 * Whether the debugger is the tab currently on screen. The dumps are
 * expensive, so they are not built while it is not.
 * @type {boolean}
 */
panel.isDebugTabVisible = false;

/**
 * Whether the teletype is the tab currently on screen.
 * @type {boolean}
 */
panel.isTtyTabVisible = false;

/**
 * The name of the tab on screen: 'sim', 'tty', 'debug' or 'ref'.
 * @type {string}
 */
panel.currentTab = 'sim';

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
    panel.sim.singleStep();
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
    // Only a live machine has a blinking carriage.
    document.body.classList.add('powered-on');
    window.setTimeout(function() {
        panel.playBeepbeep();
    }, 500);
};

/**
 * When power is turned off.
 */
panel.onPowerOff = function() {
    panel.sim.powerOff();
    document.body.classList.remove('powered-on');
    if (panel.sio) {
        // Keys typed but never read do not survive the power going off.
        panel.sio.reset();
    }
    panel.renderTeletype();
};

/**
 * When ZERO ALL MEMORY button is pressed.
 */
panel.onFillZero = function() {
    panel.sim.initMem(false);
    panel.sim.dumpMem();
};

/**
 * The memory sizes the machine can be built with. 256 bytes is the
 * Altair as it shipped; the larger two are one and two 88-4MCS static
 * memory boards. See docs/ms-basic-4k.md.
 * @type {Array<number>}
 */
panel.MEM_SIZES = [256, 4096, 8192];

/**
 * When one of the installed-memory buttons is pressed. Installing
 * memory switches the machine off, the way opening the case would.
 * @param {number} memSize The new memory size, in bytes.
 */
panel.onSetMemSize = function(memSize) {
    if (memSize == panel.sim.mem.length)
        return;
    panel.sim.setMemSize(memSize);
    // setMemSize powered the machine down; show that on the panel.
    panel.isPoweredOn = false;
    panel.switchUp('off-on');
    document.body.classList.remove('powered-on');
    if (panel.sio) {
        panel.sio.reset();
    }
    panel.renderTeletype();
    panel.updateMemoryControls();
};

/**
 * Keeps the memory controls in step with the machine: which size is
 * installed, and whether there is more memory than one window shows.
 */
panel.updateMemoryControls = function() {
    var memSize = panel.sim.mem.length;
    for (let i = 0; i < panel.MEM_SIZES.length; i++) {
        let elem = document.getElementById('mem-size-' + panel.MEM_SIZES[i]);
        if (elem) {
            elem.classList.toggle('selected', panel.MEM_SIZES[i] == memSize);
        }
    }
    var controls = document.getElementById('mem-window-controls');
    if (controls) {
        // On the 256 byte machine the window is the whole machine, so
        // there is nothing to navigate.
        controls.style.display =
            memSize > Sim8800.DUMP_WINDOW_SIZE ? 'flex' : 'none';
    }
    var follow = document.getElementById('mem-follow-pc');
    if (follow) {
        follow.classList.toggle('selected', panel.sim.followPc);
    }
    panel.updateMemWindowLabel();
};

/**
 * Shows which window of memory the dump is printing.
 */
panel.updateMemWindowLabel = function() {
    var label = document.getElementById('mem-window-label');
    if (!label)
        return;
    var window = panel.sim.getDumpWindow();
    label.textContent = Sim8800.toHex(window.start, 4) + ' - ' +
        Sim8800.toHex(window.end - 1, 4);
};

/**
 * Steps the memory dump's window one page back or forward.
 * @param {number} direction -1 for back, 1 for forward.
 */
panel.onMemPage = function(direction) {
    var window = panel.sim.getDumpWindow();
    panel.sim.setFollowPc(false);
    panel.sim.setDumpWindow(
        window.start + direction * Sim8800.DUMP_WINDOW_SIZE);
    panel.updateMemoryControls();
};

/**
 * When FOLLOW PC is pressed.
 */
panel.onToggleFollowPc = function() {
    panel.sim.setFollowPc(!panel.sim.followPc);
    panel.updateMemoryControls();
};

/**
 * When a cell of the memory map is clicked, moves the window there.
 * @param {Event} event The click event.
 */
panel.onMemMapClick = function(event) {
    var cell = event.target;
    if (!cell || !cell.classList || !cell.classList.contains('mem-page'))
        return;
    panel.sim.setFollowPc(false);
    panel.sim.setDumpWindow(parseInt(cell.dataset.address, 10));
    panel.updateMemoryControls();
};

/**
 * When CPU sets the address LEDs.
 */
panel.setAddressLedsCallback = function(bits) {
    for (let i = 0; i < bits.length; i++) {
        var ledId = 'a' + i;
        if (bits[i]) {
            panel.ledOn(ledId);
        } else {
            panel.ledOff(ledId);
        }
    }
    panel.setRepeaterLeds('tty-a', bits);
};

/**
 * When CPU sets the data LEDs.
 */
panel.setDataLedsCallback = function(bits) {
    for (let i = 0; i < bits.length; i++) {
        var ledId = 'd' + i;
        if (bits[i]) {
            panel.ledOn(ledId);
        } else {
            panel.ledOff(ledId);
        }
    }
    panel.setRepeaterLeds('tty-d', bits);
};

/**
 * When CPU sets the WAIT LED.
 */
panel.setWaitLedCallback = function(isRunning) {
    var ledId = 'wait';
    if (!isRunning) {
        panel.ledOn(ledId);
    } else {
        panel.ledOff(ledId);
    }
    var repeater = document.getElementById('tty-wait-led');
    if (repeater) {
        repeater.classList.toggle('on', !isRunning);
    }
};

/**
 * When CPU sets the status LEDs.
 */
panel.setStatusLedsCallback = function(isPoweredOn) {
    var ledIds = ['memr', 'mi', 'wo'];
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
    // FOLLOW PC moves the window on its own, so the label has to be
    // refreshed with the dump rather than only when a button is hit.
    panel.updateMemWindowLabel();
};

/**
 * Deposites data into MEM directly in debug panel.
 */
panel.debugLoadData = function() {
    var data = document.getElementById("debug-data-input").value;
    panel.sim.loadDataAsHexString(0, data);
};

/**
 * Sends one byte to the machine, as if it had been typed at the
 * teletype keyboard.
 * @param {number} byte The byte.
 */
panel.ttySend = function(byte) {
    if (byte === null || !panel.sio)
        return;
    panel.sio.receive(byte);
};

/**
 * When the teletype prints a character. The paper is a model, not the
 * DOM, so this is cheap enough to do on every character; drawing it is
 * coalesced onto the browser's repaint the way the dumps are.
 * @param {number} byte The byte the CPU sent.
 */
panel.onTtyPrint = function(byte) {
    panel.tty.write(byte);
    if (!panel.isTtyTabVisible) {
        // Something is being printed on a tab nobody is looking at.
        panel.setNavActivity(true);
    }
    panel.requestTtyRender();
};

/**
 * Marks, or unmarks, the teletype nav tab as having something new.
 * @param {boolean} active Whether to mark it.
 */
panel.setNavActivity = function(active) {
    var elem = document.getElementById('nav-tty');
    if (elem) {
        elem.classList.toggle('has-activity', active);
    }
};

/**
 * Asks for the paper to be redrawn, at most once per repaint.
 */
panel.requestTtyRender = function() {
    if (panel.ttyRenderPending)
        return;
    panel.ttyRenderPending = true;
    window.requestAnimationFrame(function() {
        panel.ttyRenderPending = false;
        panel.renderTeletype();
    });
};

/**
 * Escapes text for putting inside the paper's markup.
 * @param {string} text The text.
 * @return {string} The escaped text.
 */
panel.escapeHtml = function(text) {
    return text.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

/**
 * Draws the paper, with the carriage shown where it actually is -
 * which after a carriage return is back at the left margin, over
 * whatever is already printed there.
 */
panel.renderTeletype = function() {
    var textElem = document.getElementById('tty-text');
    if (!textElem || !panel.tty)
        return;
    var lines = panel.tty.lines;
    var out = [];
    for (let i = 0; i < lines.length; i++) {
        if (i < lines.length - 1) {
            out.push(panel.escapeHtml(lines[i]));
            continue;
        }
        let line = lines[i];
        if (line.length < panel.tty.column) {
            line += ' '.repeat(panel.tty.column - line.length);
        }
        let under = line.charAt(panel.tty.column) || ' ';
        out.push(panel.escapeHtml(line.substring(0, panel.tty.column)) +
                 '<span class="tty-cursor">' + panel.escapeHtml(under) +
                 '</span>' +
                 panel.escapeHtml(line.substring(panel.tty.column + 1)));
    }
    textElem.innerHTML = out.join('\n');
    var paper = document.getElementById('tty-paper');
    if (paper) {
        paper.scrollTop = paper.scrollHeight;
    }
};

/**
 * When CLEAR PAPER is pressed. The paper is torn off; what the machine
 * is doing is not disturbed.
 */
panel.onTtyClear = function() {
    panel.tty.clear();
    panel.renderTeletype();
};

/**
 * Handles a key pressed while the teletype tab is on screen.
 * @param {Event} event The keydown event.
 */
panel.onTtyKeyDown = function(event) {
    if (!panel.isTtyTabVisible || event.metaKey || event.altKey)
        return;
    var byte = Teletype.keyToByte(event.key, event.ctrlKey);
    if (byte === null)
        return;
    event.preventDefault();
    panel.ttySend(byte);
};

/**
 * Handles text from a soft keyboard, which often reports its keys as
 * 'Unidentified' and so is not caught by onTtyKeyDown.
 * @param {Event} event The input event.
 */
panel.onTtyInput = function(event) {
    var text = event.target.value;
    event.target.value = '';
    for (let i = 0; i < text.length; i++) {
        panel.ttySend(Teletype.keyToByte(text.charAt(i)));
    }
};

/**
 * Updates the teletype tab's repeat of the address, data and WAIT
 * lamps. The panel's own LEDs are SVG sprites inside the front panel
 * artwork; these are plain elements carrying the same two images.
 * @param {string} prefix The element id prefix, 'tty-a' or 'tty-d'.
 * @param {Array<number>} bits The bits, lowest first.
 */
panel.setRepeaterLeds = function(prefix, bits) {
    for (let i = 0; i < bits.length; i++) {
        let elem = document.getElementById(prefix + i);
        if (elem) {
            elem.classList.toggle('on', !!bits[i]);
        }
    }
};

/**
 * The info of all LEDs.
 */
panel.LED_INFO = [
    {
        id: 'inte',
        x: 194,
        y: 120
    },
    {
        id: 'prot',
        x: 245,
        y: 120
    },
    {
        id: 'memr',
        x: 296,
        y: 120
    },
    {
        id: 'inp',
        x: 347,
        y: 120
    },
    {
        id: 'mi',
        x: 398,
        y: 120
    },
    {
        id: 'out',
        x: 449,
        y: 120
    },
    {
        id: 'hlta',
        x: 500,
        y: 120
    },
    {
        id: 'stack',
        x: 551,
        y: 120
    },
    {
        id: 'wo',
        x: 602,
        y: 120
    },
    {
        id: 'int',
        x: 653,
        y: 120
    },
    {
        id: 'd7',
        x: 830,
        y: 120
    },
    {
        id: 'd6',
        x: 880,
        y: 120
    },
    {
        id: 'd5',
        x: 959,
        y: 120
    },
    {
        id: 'd4',
        x: 1009,
        y: 120
    },
    {
        id: 'd3',
        x: 1059,
        y: 120
    },
    {
        id: 'd2',
        x: 1138,
        y: 120
    },
    {
        id: 'd1',
        x: 1188,
        y: 120
    },
    {
        id: 'd0',
        x: 1238,
        y: 120
    },
    {
        id: 'wait',
        x: 194,
        y: 230
    },
    {
        id: 'hlda',
        x: 245,
        y: 230
    },
    {
        id: 'a15',
        x: 346,
        y: 230
    },
    {
        id: 'a14',
        x: 423,
        y: 230
    },
    {
        id: 'a13',
        x: 473,
        y: 230
    },
    {
        id: 'a12',
        x: 523,
        y: 230
    },
    {
        id: 'a11',
        x: 602,
        y: 230
    },
    {
        id: 'a10',
        x: 652,
        y: 230
    },
    {
        id: 'a9',
        x: 702,
        y: 230
    },
    {
        id: 'a8',
        x: 780,
        y: 230
    },
    {
        id: 'a7',
        x: 830,
        y: 230
    },
    {
        id: 'a6',
        x: 880,
        y: 230
    },
    {
        id: 'a5',
        x: 959,
        y: 230
    },
    {
        id: 'a4',
        x: 1009,
        y: 230
    },
    {
        id: 'a3',
        x: 1059,
        y: 230
    },
    {
        id: 'a2',
        x: 1138,
        y: 230
    },
    {
        id: 'a1',
        x: 1188,
        y: 230
    },
    {
        id: 'a0',
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
        id: 'off-on',
        x: 105,
        y: 439
    },
    {
        id: 's15',
        x: 346,
        y: 334
    },
    {
        id: 's14',
        x: 423,
        y: 334
    },
    {
        id: 's13',
        x: 473,
        y: 334
    },
    {
        id: 's12',
        x: 523,
        y: 334
    },
    {
        id: 's11',
        x: 602,
        y: 334
    },
    {
        id: 's10',
        x: 652,
        y: 334
    },
    {
        id: 's9',
        x: 702,
        y: 334
    },
    {
        id: 's8',
        x: 780,
        y: 334
    },
    {
        id: 's7',
        x: 830,
        y: 334
    },
    {
        id: 's6',
        x: 880,
        y: 334
    },
    {
        id: 's5',
        x: 959,
        y: 334
    },
    {
        id: 's4',
        x: 1009,
        y: 334
    },
    {
        id: 's3',
        x: 1059,
        y: 334
    },
    {
        id: 's2',
        x: 1138,
        y: 334
    },
    {
        id: 's1',
        x: 1188,
        y: 334
    },
    {
        id: 's0',
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
        lowerCmd: null,
    },
    {
        id: 'protect',
        x: 853,
        y: 439,
        upperCmd: null,
        lowerCmd: null,
    },
    {
        id: 'aux1',
        x: 957,
        y: 439,
        upperCmd: null,
        lowerCmd: null,
    },
    {
        id: 'aux2',
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
    // Fills the language menu, then restores the last locale if there
    // is one. The menu has to exist before the messages are applied.
    l10n.initMenu();
    l10n.restoreLocale();

    // Initializes event listener for nav buttons.
    var button = document.getElementById('nav-sim');
    button.addEventListener('click', panel.showTabSim, false);
    button = document.getElementById('nav-tty');
    button.addEventListener('click', panel.showTabTty, false);
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
    panel.switchUp('off-on');

    // Initializes the simulator.
    panel.sim = new Sim8800(
        256, /* 256B MEM */
        1000000, /* 1MHz */
        panel.setAddressLedsCallback, panel.setDataLedsCallback,
        panel.setWaitLedCallback, panel.setStatusLedsCallback,
        panel.getInputAddressCallback,
        panel.dumpCpuCallback, panel.dumpMemCallback);

    // A running CPU asks to redraw the debugger far more often than
    // the screen can show it - hundreds of times a second, each one
    // rebuilding the dumps as HTML. Coalesce the requests onto the
    // browser's own repaint, and drop them altogether while the
    // debugger is not the visible tab.
    panel.sim.dumpScheduler = function(flush) {
        window.requestAnimationFrame(flush);
    };
    panel.sim.dumpFilter = function() {
        return panel.isDebugTabVisible;
    };

    // The teletype. The paper and the serial board are plain objects
    // that keep working whether or not the tab is on screen; only the
    // drawing waits for the tab.
    panel.tty = new Teletype();
    panel.sio = new Sio(panel.onTtyPrint);
    panel.sio.attachTo(panel.sim);
    panel.initTeletypeUi();

    // Adds handler for 'ZERO ALL MEMORY' Button 
    // (it doesn't have a corresponding switch on the actual machine)
    document.getElementById('debug-fill-zero').addEventListener('click', panel.onFillZero)

    // Installed memory, and the controls for the memory dump's window.
    for (let i = 0; i < panel.MEM_SIZES.length; i++) {
        let memSize = panel.MEM_SIZES[i];
        let elem = document.getElementById('mem-size-' + memSize);
        elem.addEventListener('click', function() {
            panel.onSetMemSize(memSize);
        }, false);
    }
    document.getElementById('mem-page-prev').addEventListener(
        'click', function() { panel.onMemPage(-1); }, false);
    document.getElementById('mem-page-next').addEventListener(
        'click', function() { panel.onMemPage(1); }, false);
    document.getElementById('mem-follow-pc').addEventListener(
        'click', panel.onToggleFollowPc, false);
    // The map is rebuilt with every dump, so the listener goes on the
    // container that survives it.
    document.getElementById('mem-dump').addEventListener(
        'click', panel.onMemMapClick, false);
    panel.updateMemoryControls();

};

/**
 * Builds the teletype tab's lamps and hooks up its controls.
 */
panel.initTeletypeUi = function() {
    // The repeater: A15-A0 and D7-D0, highest bit on the left, so that
    // it reads the same way round as the front panel does.
    var row = document.getElementById('tty-address-leds');
    for (let i = 15; i >= 0; i--) {
        let led = document.createElement('div');
        led.id = 'tty-a' + i;
        led.className = 'tty-led';
        row.appendChild(led);
    }
    row = document.getElementById('tty-data-leds');
    for (let i = 7; i >= 0; i--) {
        let led = document.createElement('div');
        led.id = 'tty-d' + i;
        led.className = 'tty-led';
        row.appendChild(led);
    }

    document.getElementById('tty-break').addEventListener(
        'click', function() { panel.ttySend(Teletype.BREAK); }, false);
    document.getElementById('tty-rubout').addEventListener(
        'click', function() { panel.ttySend(Teletype.RUBOUT); }, false);
    document.getElementById('tty-kill').addEventListener(
        'click', function() { panel.ttySend(Teletype.KILL_LINE); }, false);
    document.getElementById('tty-clear').addEventListener(
        'click', panel.onTtyClear, false);

    // Tapping the paper raises the soft keyboard on a phone.
    var input = document.getElementById('tty-input');
    document.getElementById('tty-paper').addEventListener(
        'click', function() { input.focus(); }, false);
    input.addEventListener('input', panel.onTtyInput, false);
    document.addEventListener('keydown', panel.onTtyKeyDown, false);

    panel.renderTeletype();
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
 * the panel's coordinate system.
 * @param {Object} cmd The command info, holding the label's ID and
 *     bounding box plus the callback to run.
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

    // Also installs the helper switch board handler.
    var softElem = document.getElementById('s-' + cmd.id);
    softElem.addEventListener('click', callback, false);
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
        let softSwitchId = 's-' + id;
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
            panel.createCmdLabel(upperCmd, function() {
                panel.switchUpThenBack(id);
                panel.playSwitch();
                upperCmd.callback();
            });
        }
        if (lowerCmd) {
            panel.createCmdLabel(lowerCmd, function() {
                panel.switchDownThenBack(id);
                panel.playSwitch();
                lowerCmd.callback();
            });
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
    if (id[0] == 's') {
        var bitIndex = parseInt(id.substr(1));
        var state = panel.addressSwitchStates[bitIndex];
        if (state == 0) {
            panel.switchUp(id);
        } else {
            panel.switchDown(id);
        }
        panel.addressSwitchStates[bitIndex] = state ? 0 : 1;
    } else if (id == 'off-on') {
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
 * The tabs, in the order they appear. The front panel and the teletype
 * are the two things a 1975 owner actually touched, so they sit
 * together; the debugger is the one view that was never part of the
 * machine. See docs/ms-basic-4k.md.
 * @type {Array<string>}
 */
panel.TABS = ['sim', 'tty', 'debug', 'ref'];

/**
 * Shows one tab and hides the others.
 * @param {string} name One of panel.TABS.
 */
panel.showTab = function(name) {
    panel.currentTab = name;
    panel.isDebugTabVisible = name == 'debug';
    panel.isTtyTabVisible = name == 'tty';
    for (let i = 0; i < panel.TABS.length; i++) {
        let tab = panel.TABS[i];
        let shown = tab == name;
        document.getElementById('tab-' + tab).style.display =
            shown ? 'block' : 'none';
        panel.highlightNavTab(document.getElementById('nav-' + tab), shown);
    }
    // Neither view is kept up to date while it is hidden, so catch up
    // as it comes back.
    if (panel.isDebugTabVisible && panel.sim) {
        panel.sim.flushDump(true);
    }
    if (panel.isTtyTabVisible) {
        panel.setNavActivity(false);
        panel.renderTeletype();
        var input = document.getElementById('tty-input');
        if (input) {
            input.focus();
        }
    }
};

/** Shows the front panel. */
panel.showTabSim = function() {
    panel.showTab('sim');
};

/** Shows the teletype. */
panel.showTabTty = function() {
    panel.showTab('tty');
};

/** Shows the debugger. */
panel.showTabDebug = function() {
    panel.showTab('debug');
};

/** Shows the reference tab. */
panel.showTabRes = function() {
    panel.showTab('ref');
};
