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
 * When STOP switch is pressed.
 */
panel.onStop = function() {
    panel.sim.stop();
    panel.setStatus('status-stopped');
};

/**
 * When RUN switch is pressed.
 */
panel.onRun = function() {
    panel.sim.start();
    panel.setStatus('status-running');
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
    panel.setStatus('status-reset');
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
 * When Zero All Memory is pressed. There is no such switch on the real
 * machine.
 */
panel.onFillZero = function() {
    if (panel.reportIfUnavailable('debug-fill-zero')) {
        return;
    }
    panel.sim.initMem(false);
    panel.sim.requestDump();
    panel.setStatus('status-zeroed');
};

/**
 * Where the 4K BASIC image lives. It is optional: see roms/NOTICE.
 * @type {string}
 */
panel.ROM_URL = 'roms/4kbas32.bin';

/**
 * The least memory 4K BASIC will boot in. Below this its own memory
 * probe has nowhere to put anything.
 * @type {number}
 */
panel.MIN_BASIC_MEM = 4096;

/**
 * The largest file the loader will read. The 8080 can address 64 KB
 * and no more, so anything past that is not a memory image and there
 * is no reason to pull it into the browser to find out.
 * @type {number}
 */
panel.MAX_IMAGE_BYTES = 65536;

/**
 * The example programs offered in the Debugger tab, in the order they
 * are offered.
 *
 * First by which face of the machine the program speaks through - the
 * front panel, then the teletype - because a teletype program watched
 * on the panel looks like a machine that has died. Within each group,
 * by how much you need to know to follow it. See Part 5 of
 * docs/ms-basic-4k.md.
 *
 * Only the names are here. Everything else - title, size, device,
 * bytes - is read out of examples/<id>.asm, and tests/listing.test.js
 * keeps this list in step with the directory.
 * @type {Array<string>}
 */
panel.EXAMPLES = [
    // Front panel.
    'pattern-shift',
    'io-echo',
    'adder',
    'bouncing-light',
    'kill-the-bit',
    // Teletype.
    'tty-hello',
    'tty-ascii',
    'tty-echo',
    'tty-leds',
    'guess-letter',
];

/**
 * Whether the page was opened straight off the disk.
 *
 * A browser will not let a file:// page fetch the files beside it, so
 * the example listings and the BASIC tape need the folder to be served.
 * Checked up front rather than by letting the fetch fail, so that those
 * controls are greyed out before they are pressed and give the real
 * reason. See D22 in docs/ms-basic-4k.md.
 * @return {boolean} True if the page cannot read its own folder.
 */
panel.needsServer = function() {
    return window.location.protocol == 'file:';
};

/**
 * Fills the example menu, once, the first time the debugger is looked
 * at. A reader who never opens that tab never fetches anything.
 *
 * The menu acts on choosing and holds no selection, so the same
 * program can be loaded twice running.
 */
panel.buildExampleMenu = function() {
    if (panel.exampleMenuBuilt) {
        return;
    }
    panel.exampleMenuBuilt = true;
    panel.examplePrograms = {};
    panel.exampleMenu = new Dropdown('example-menu', function(id) {
        var program = panel.examplePrograms[id];
        if (!program) {
            return;
        }
        var loaded = panel.loadImage(program.bytes);
        // RUN is on the front panel wherever the program's output
        // goes, but where to look afterwards is not the same place.
        panel.setStatus(program.device == 'teletype' ?
                            'example-loaded-tty' : 'example-loaded',
                        {name: program.name, bytes: loaded.bytes}, '',
                        loaded.poweredOn);
    });
    panel.refreshExampleMenu();
    // An empty menu does not open (see Dropdown.open), so pressing it
    // only says why it is empty.
    document.getElementById('example-button').addEventListener(
        'click', function() {
            panel.reportIfUnavailable('example-button');
        }, false);

    if (panel.needsServer()) {
        panel.examplesProblem = 'needs-server';
        panel.updateDebugControls();
        return;
    }

    // Fetched together, but listed in the order panel.EXAMPLES gives.
    var fetches = panel.EXAMPLES.map(function(id) {
        return window.fetch('examples/' + id + '.asm').then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.text();
        }).then(function(text) {
            var program = Listing.parse(text);
            return program.bytes.length ? {id: id, program: program} : null;
        }).catch(function() {
            // A listing that cannot be read is simply not offered.
            return null;
        });
    });
    Promise.all(fetches).then(function(results) {
        var items = [];
        var lastDevice = null;
        for (let i = 0; i < results.length; i++) {
            if (!results[i]) {
                continue;
            }
            panel.examplePrograms[results[i].id] = results[i].program;
            // A rule where the panel programs end and the teletype
            // ones begin.
            let device = results[i].program.device;
            items.push({
                value: results[i].id,
                label: results[i].program.name + ' \u2014 ' +
                    results[i].program.bytes.length + ' bytes',
                startsGroup: items.length > 0 && device != lastDevice,
            });
            lastDevice = device;
        }
        panel.exampleMenu.setItems(items);
        panel.examplesProblem = items.length ? null : 'examples-unreadable';
        panel.updateDebugControls();
    });
};

/**
 * Puts the hex box's prompt back, in the current language. A
 * placeholder is an attribute rather than content, so the l10n class
 * cannot reach it.
 */
panel.refreshPlaceholders = function() {
    var input = document.getElementById('debug-data-input');
    if (input) {
        input.placeholder = l10n.getMessage('debug-data-placeholder');
    }
    // The two paging buttons are arrowheads with no words in them, so
    // their name lives in a tooltip and on the element, where a screen
    // reader can reach it.
    var arrows = ['mem-page-prev', 'mem-page-next'];
    for (let i = 0; i < arrows.length; i++) {
        let elem = document.getElementById(arrows[i]);
        if (elem) {
            let text = l10n.getMessage(arrows[i] + '-title');
            elem.title = text;
            elem.setAttribute('aria-label', text);
        }
    }
};

/**
 * Puts the menu's own label back, in the current language. The menu
 * holds no selection: picking a program is an action, not a setting,
 * so the button keeps saying the same thing.
 */
panel.refreshExampleMenu = function() {
    if (panel.exampleMenu) {
        panel.exampleMenu.setLabel(l10n.getMessage('example-prompt'));
    }
};

/**
 * Says something on the status line at the foot of the machine. See
 * D15 in docs/ms-basic-4k.md.
 *
 * The message is held as an id rather than as text, so that it can be
 * redrawn after a change of language.
 * @param {?string} id The l10n message id, or null to clear the line.
 * @param {Object=} params Values for {placeholders} in the message.
 * @param {string=} severity '', 'warn' or 'error'.
 * @param {boolean=} afterPowerOn Whether the machine had to be
 *     switched on to do this, which the line says first (D23).
 */
panel.setStatus = function(id, params, severity = '', afterPowerOn = false) {
    panel.statusId = id;
    panel.statusParams = params || {};
    panel.statusSeverity = severity;
    panel.statusAfterPowerOn = afterPowerOn;
    panel.refreshStatus();
};

/**
 * Redraws the status line in the current language.
 */
panel.refreshStatus = function() {
    var bar = document.getElementById('status-bar');
    var text = document.getElementById('status-text');
    if (!bar || !text) {
        return;
    }
    bar.classList.toggle('status-warn', panel.statusSeverity == 'warn');
    bar.classList.toggle('status-error', panel.statusSeverity == 'error');
    if (!panel.statusId) {
        text.textContent = '';
        return;
    }
    var msg = l10n.getMessage(panel.statusId);
    for (let key in panel.statusParams) {
        msg = msg.replace('{' + key + '}', panel.statusParams[key]);
    }
    if (panel.statusAfterPowerOn) {
        // First what happened, then what was loaded, then what to do
        // next - so the note goes in front of the message, not after
        // the instruction at the end of it. Chinese and Japanese put
        // no space after their full stop; a space there reads as a
        // hole in the middle of the line.
        var note = l10n.getMessage('powered-on-first');
        msg = note + (/\u3002$/.test(note) ? '' : ' ') + msg;
    }
    text.textContent = msg;
};

/**
 * How an installed memory size is written in a message.
 * @param {number} bytes The size.
 * @return {string} '256 B', '4 KB' and so on.
 */
panel.formatMemSize = function(bytes) {
    return bytes < 1024 ? bytes + ' B' : (bytes / 1024) + ' KB';
};

/**
 * Switches the machine on if it is not on already. Every way of getting
 * a program in does this (D20 in docs/ms-basic-4k.md).
 * @return {boolean} Whether the machine was off and had to be switched
 *     on, which is worth saying in the status line (D23).
 */
panel.ensurePoweredOn = function() {
    if (panel.isPoweredOn) {
        return false;
    }
    panel.onPowerOn();
    return true;
};

/**
 * Zeroes memory, puts an image at 0000H and presses RESET, powering the
 * machine up first if it is off.
 *
 * It deliberately stops short of running, so that the memory map shows
 * what was just loaded before the program writes over it (D14).
 * @param {Array<number>|Uint8Array} bytes The image. Anything longer
 *     than the installed memory is ignored past the top.
 * @return {{bytes: number, poweredOn: boolean}} How many bytes
 *     actually fit in the machine, and whether it had to be switched
 *     on first.
 */
panel.loadImage = function(bytes) {
    var poweredOn = panel.ensurePoweredOn();
    panel.sim.initMem(false);
    panel.sim.loadData(0, bytes);
    panel.sim.reset();
    panel.sim.flushDump(true);
    panel.updateMemoryControls();
    return {bytes: Math.min(bytes.length, panel.sim.mem.length),
            poweredOn: poweredOn};
};

/**
 * When Load 4K BASIC is pressed.
 */
panel.onLoadBasic = function() {
    if (panel.reportIfUnavailable('load-basic')) {
        return;
    }
    window.fetch(panel.ROM_URL).then(function(response) {
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.arrayBuffer();
    }).then(function(buffer) {
        var loaded = panel.loadImage(new Uint8Array(buffer));
        panel.setStatus('rom-loaded', {bytes: loaded.bytes}, '',
                        loaded.poweredOn);
    }).catch(function() {
        panel.setStatus('rom-missing', {}, 'error');
    });
};

/**
 * When a binary file is chosen with Load Binary File.
 * @param {Event} event The change event from the file input.
 */
panel.onBinaryFileChosen = function(event) {
    var file = event.target.files && event.target.files[0];
    // So that choosing the same file twice in a row still fires.
    event.target.value = '';
    if (!file) {
        return;
    }
    // Checked before reading, not after: FileReader would otherwise
    // pull the whole thing into memory just to have it thrown away.
    if (file.size > panel.MAX_IMAGE_BYTES) {
        panel.setStatus('rom-file-too-big',
                        {name: file.name, bytes: file.size,
                         max: panel.MAX_IMAGE_BYTES}, 'error');
        return;
    }
    var reader = new FileReader();
    reader.onload = function() {
        // Only what fits is handed on.
        var size = panel.sim.mem.length;
        var bytes = new Uint8Array(reader.result, 0,
                                   Math.min(reader.result.byteLength, size));
        var loaded = panel.loadImage(bytes);
        if (file.size > size) {
            panel.setStatus('rom-file-truncated',
                            {bytes: loaded.bytes, name: file.name,
                             size: file.size}, 'warn', loaded.poweredOn);
        } else {
            panel.setStatus('rom-file-loaded',
                            {bytes: loaded.bytes, name: file.name}, '',
                            loaded.poweredOn);
        }
    };
    reader.onerror = function() {
        panel.setStatus('rom-file-unreadable', {name: file.name}, 'error');
    };
    reader.readAsArrayBuffer(file);
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
    panel.onPowerOff();
    panel.setStatus('status-mem-installed',
                    {size: panel.formatMemSize(memSize)}, 'warn');
};

/**
 * Why each Debugger control cannot be used at the moment.
 *
 * This is the only place that decides: the greying out and the message
 * a greyed control gives when pressed both read from here, so the two
 * cannot drift apart.
 *
 * @return {Object<string, ?{id: string, params: Object}>} A reason for
 *     each control, or null where the control is available.
 */
panel.debugControlReasons = function() {
    var on = panel.sim.isPoweredOn;
    var memSize = panel.sim.mem.length;
    var reasons = {};
    // The loaders switch the machine on for you, so only BASIC can be
    // unavailable: it needs its tape to be fetchable, then enough memory.
    reasons['load-basic'] = panel.needsServer() ?
        {id: 'needs-server', params: {}} :
        (memSize < panel.MIN_BASIC_MEM ?
             {id: 'rom-needs-memory', params: {}} : null);
    reasons['example-button'] = panel.examplesProblem ?
        {id: panel.examplesProblem, params: {}} : null;
    reasons['debug-load-data'] = null;
    reasons['load-binary'] = null;
    // The dump controls act on the memory dump. With the machine off
    // it is blank, and on the base machine it is one page that cannot
    // be moved.
    var navReason = null;
    if (!on) {
        navReason = {id: 'mem-nav-off', params: {}};
    } else if (memSize <= Sim8800.DUMP_WINDOW_SIZE) {
        navReason = {id: 'mem-nav-fits',
                     params: {size: panel.formatMemSize(memSize)}};
    }
    reasons['mem-page-prev'] = navReason;
    reasons['mem-page-next'] = navReason;
    reasons['mem-follow-pc'] = navReason;
    reasons['debug-fill-zero'] = on ? null : {id: 'zero-mem-off', params: {}};
    return reasons;
};

/**
 * Says why a control cannot be used, if it cannot be. A greyed control
 * still takes the press and answers (D19 in docs/ms-basic-4k.md).
 *
 * @param {string} id The control.
 * @return {boolean} True if it is unavailable, and the reason has been
 *     shown.
 */
panel.reportIfUnavailable = function(id) {
    var reason = panel.debugControlReasons()[id];
    if (!reason) {
        return false;
    }
    panel.setStatus(reason.id, reason.params, 'warn');
    return true;
};

/**
 * Greys out whatever cannot be used just now. Nothing is hidden (D18).
 */
panel.updateDebugControls = function() {
    var reasons = panel.debugControlReasons();
    for (let id in reasons) {
        let elem = document.getElementById(id);
        if (elem) {
            elem.classList.toggle('disabled', !!reasons[id]);
        }
    }
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
    var follow = document.getElementById('mem-follow-pc');
    if (follow) {
        follow.classList.toggle('selected', panel.sim.followPc);
    }
    panel.updateDebugControls();
    panel.updateMemWindowLabel();
};

/**
 * Shows which window of memory the dump is printing.
 */
panel.updateMemWindowLabel = function() {
    var label = document.getElementById('mem-window-label');
    if (!label)
        return;
    if (!panel.sim.isPoweredOn) {
        label.textContent = '';
        return;
    }
    var window = panel.sim.getDumpWindow();
    label.textContent = Sim8800.toHex(window.start, 4) + ' - ' +
        Sim8800.toHex(window.end - 1, 4);
};

/**
 * Steps the memory dump's window one page back or forward.
 * @param {number} direction -1 for back, 1 for forward.
 */
panel.onMemPage = function(direction) {
    if (panel.reportIfUnavailable(
            direction < 0 ? 'mem-page-prev' : 'mem-page-next')) {
        return;
    }
    var window = panel.sim.getDumpWindow();
    panel.sim.setFollowPc(false);
    panel.sim.setDumpWindow(
        window.start + direction * Sim8800.DUMP_WINDOW_SIZE);
    panel.updateMemoryControls();
};

/**
 * When Follow PC is pressed.
 */
panel.onToggleFollowPc = function() {
    if (panel.reportIfUnavailable('mem-follow-pc')) {
        return;
    }
    panel.sim.setFollowPc(!panel.sim.followPc);
    panel.updateMemoryControls();
};

/**
 * When a cell of the memory map is pressed, moves the window there.
 * Answers the press rather than the click, so that a strip you move
 * along quickly responds at once, for mouse and touch alike.
 * @param {Event} event The pointerdown event.
 */
panel.onMemMapPress = function(event) {
    if (event.button) {
        return;  // Not the primary button.
    }
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
        panel.setLed('a' + i, bits[i]);
    }
    panel.setRepeaterLeds('tty-a', bits);
};

/**
 * When CPU sets the data LEDs.
 */
panel.setDataLedsCallback = function(bits) {
    for (let i = 0; i < bits.length; i++) {
        panel.setLed('d' + i, bits[i]);
    }
    panel.setRepeaterLeds('tty-d', bits);
};

/**
 * When CPU sets the WAIT LED.
 */
panel.setWaitLedCallback = function(isRunning) {
    panel.setLed('wait', !isRunning);
    var repeater = document.getElementById('tty-wait-led');
    if (repeater) {
        repeater.classList.toggle('on', !isRunning);
    }
};

/**
 * When CPU sets the status LEDs.
 */
panel.setStatusLedsCallback = function(isPoweredOn) {
    ['memr', 'mi', 'wo'].forEach(function(id) {
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
 * When CPU dumps the CPU status for debug.
 */
panel.dumpCpuCallback = function(dumpHtml) {
    document.getElementById('cpu-dump').innerHTML = dumpHtml;
};

/**
 * When CPU dumps the MEM contents for debug.
 */
panel.dumpMemCallback = function(dumpHtml, pages) {
    document.getElementById('mem-dump').innerHTML = dumpHtml;
    panel.renderMemMap(pages);
    // Follow PC moves the window on its own, so the label is refreshed
    // with every dump.
    panel.updateMemWindowLabel();
};

/**
 * Draws the memory map strip, editing the cells rather than replacing
 * them.
 *
 * The strip is redrawn on every repaint, sixty times a second while a
 * program runs, and a cell rebuilt that often cannot keep a tooltip or
 * a hover state. So the cells are built once and only what changed is
 * written. Each assignment is guarded by a comparison, because
 * assigning the same title again dismisses a tooltip that is already
 * up. See D21 in docs/ms-basic-4k.md.
 *
 * @param {?Array<Object>} pages From Sim8800.getMemMap(), or null when
 *     the machine has no more memory than one window shows.
 */
panel.renderMemMap = function(pages) {
    var strip = document.getElementById('mem-map');
    if (!strip) {
        return;
    }
    if (!pages || !pages.length) {
        strip.hidden = true;
        strip.textContent = '';
        return;
    }
    strip.hidden = false;
    // Only when the machine itself changed size.
    if (strip.children.length != pages.length) {
        strip.textContent = '';
        for (let i = 0; i < pages.length; i++) {
            let cell = document.createElement('span');
            strip.appendChild(cell);
        }
    }
    for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        let cell = strip.children[i];
        let classes = 'mem-page mem-page-' + page.level;
        if (page.shown) classes += ' mem-page-shown';
        if (page.pc) classes += ' mem-page-pc';
        if (page.sp) classes += ' mem-page-sp';
        if (cell.className !== classes) {
            cell.className = classes;
        }
        if (cell.title !== page.label) {
            cell.title = page.label;
        }
        let address = String(page.start);
        if (cell.dataset.address !== address) {
            cell.dataset.address = address;
        }
    }
};

/**
 * Turns the text of the hex box into bytes.
 *
 * @param {string} text What the reader typed or pasted.
 * @return {{bytes: (Array<number>|undefined), error: (string|undefined),
 *     params: (Object|undefined)}} The bytes, or the l10n id of what is
 *     wrong with the text and the values that message needs.
 */
panel.parseBytes = function(text) {
    // Splits on any run of whitespace or commas, so a block pasted out
    // of the documentation arrives intact whatever it is separated by.
    var tokens = text.trim().split(/[\s,]+/);
    var bytes = [];
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (!/^[0-9a-fA-F]+$/.test(token)) {
            return {error: 'load-data-bad', params: {text: token}};
        }
        if (token.length > 2 && token.length % 2) {
            return {error: 'load-data-odd', params: {text: token}};
        }
        // A longer run of hex digits is several bytes running together.
        // A one line input box drops the newlines out of a paste, so
        // "3e 8c\nd3 ff" arrives as "3e 8cd3 ff".
        for (let j = 0; j < token.length; j += 2) {
            bytes.push(parseInt(token.substr(j, 2), 16));
        }
    }
    return {bytes: bytes};
};

/**
 * Reads the hex box and puts those bytes at 0000H, saying in the status
 * bar what happened.
 */
panel.debugLoadData = function() {
    var text = document.getElementById('debug-data-input').value.trim();
    if (!text) {
        panel.setStatus('load-data-empty', {}, 'warn');
        return;
    }
    var parsed = panel.parseBytes(text);
    if (parsed.error) {
        panel.setStatus(parsed.error, parsed.params, 'error');
        return;
    }
    if (parsed.bytes.length > panel.sim.mem.length) {
        panel.setStatus('load-data-too-long',
                        {bytes: parsed.bytes.length,
                         size: panel.sim.mem.length}, 'error');
        return;
    }
    // On, but not wiped: this is a deposit into the machine as it
    // stands, not a fresh tape. loadImage() is the one that clears.
    var poweredOn = panel.ensurePoweredOn();
    panel.sim.loadData(0, parsed.bytes);
    panel.updateMemoryControls();
    panel.setStatus('load-data-loaded', {bytes: parsed.bytes.length}, '',
                    poweredOn);
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
    if (!panel.isTtyTabVisible) {
        // Focus left in here after switching away must not go on
        // feeding the machine from another tab.
        return;
    }
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
 * The position of every LED on the panel artwork.
 */
panel.LED_INFO = [
    {id: 'inte', x: 194, y: 120},
    {id: 'prot', x: 245, y: 120},
    {id: 'memr', x: 296, y: 120},
    {id: 'inp', x: 347, y: 120},
    {id: 'mi', x: 398, y: 120},
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

    // The nav tabs.
    for (let i = 0; i < panel.TABS.length; i++) {
        let name = panel.TABS[i];
        document.getElementById('nav-' + name).addEventListener(
            'click', function() { panel.showTab(name); }, false);
    }

    // Initializes svg components for all LEDs.
    for (let i = 0; i < panel.LED_INFO.length; i++) {
        let info = panel.LED_INFO[i];
        panel.createLed(info.id, info.x, info.y);
    }

    // Initializes svg components for all switches.
    for (let i = 0; i < panel.TOGGLE_SWITCH_INFO.length; i++) {
        let info = panel.TOGGLE_SWITCH_INFO[i];
        panel.createSwitch(info.id, panel.TOGGLE_SWITCH, info.x, info.y,
                           null, null);
    }
    for (let i = 0; i < panel.STATELESS_SWITCH_INFO.length; i++) {
        let info = panel.STATELESS_SWITCH_INFO[i];
        panel.createSwitch(info.id, panel.STATELESS_SWITCH, info.x, info.y,
                           info.upperCmd, info.lowerCmd);
    }

    // Initializes internal states.
    panel.isPoweredOn = false;
    panel.addressSwitchStates.fill(0);
    panel.switchUp('off-on');

    // Initializes the simulator.
    panel.sim = new Sim8800(
        256, /* 256B MEM */
        2000000, /* 2MHz, as the Altair 8800 ran */
        panel.setAddressLedsCallback, panel.setDataLedsCallback,
        panel.setWaitLedCallback, panel.setStatusLedsCallback,
        panel.getInputAddressCallback,
        panel.dumpCpuCallback, panel.dumpMemCallback);

    // Coalesce dump requests onto the browser's repaint, and drop them
    // while the debugger is not the visible tab.
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
    // Two boards, one teletype. Software picks which one it talks to -
    // MITS BASIC reads the sense switches at startup and chooses the
    // 88-SIO with them down, the 88-2SIO with A11 up - and wiring the
    // terminal to both slots means either choice works instead of the
    // machine going silent. They share one key queue, since there is
    // only one keyboard.
    panel.sio = new Sio(panel.onTtyPrint);
    panel.sio.attachTo(panel.sim, Sio.BASE_PORT, true);
    panel.sio2 = new Sio(panel.onTtyPrint, panel.sio.rx);
    panel.sio2.attachTo(panel.sim, Sio.TWO_SIO_BASE_PORT, false);
    panel.initTeletypeUi();

    // The Debugger tab: loaders, installed memory, and the controls for
    // the memory dump's window.
    document.getElementById('load-basic').addEventListener(
        'click', panel.onLoadBasic, false);
    document.getElementById('debug-load-data').addEventListener(
        'click', panel.debugLoadData, false);
    var filePicker = document.getElementById('binary-file');
    document.getElementById('load-binary').addEventListener(
        'click', function() { filePicker.click(); }, false);
    filePicker.addEventListener('change', panel.onBinaryFileChosen, false);
    document.getElementById('debug-fill-zero').addEventListener(
        'click', panel.onFillZero, false);
    for (let i = 0; i < panel.MEM_SIZES.length; i++) {
        let memSize = panel.MEM_SIZES[i];
        document.getElementById('mem-size-' + memSize).addEventListener(
            'click', function() { panel.onSetMemSize(memSize); }, false);
    }
    // Text set at runtime has to be redrawn after a change of language.
    l10n.onUpdate = function() {
        panel.refreshStatus();
        panel.refreshExampleMenu();
        panel.refreshPlaceholders();
    };
    panel.refreshPlaceholders();

    document.getElementById('mem-page-prev').addEventListener(
        'click', function() { panel.onMemPage(-1); }, false);
    document.getElementById('mem-page-next').addEventListener(
        'click', function() { panel.onMemPage(1); }, false);
    document.getElementById('mem-follow-pc').addEventListener(
        'click', panel.onToggleFollowPc, false);
    // One listener on the strip rather than one per cell, so that
    // cells can come and go when the memory size changes.
    document.getElementById('mem-map').addEventListener(
        'pointerdown', panel.onMemMapPress, false);
    panel.updateMemoryControls();
    // The machine comes up switched off, and the empty dump and dark
    // panel should say why rather than look broken.
    panel.setStatus('status-off');
    // Last, because showing a tab refreshes what is on it, and that
    // needs the simulator and the teletype to exist first.
    panel.showTab(panel.readSavedTab());
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
        'click', function() {
            // preventScroll for the same reason the tab switch does
            // not focus at all: the input sits below the paper, and
            // scrolling it into view would jump the page.
            input.focus({preventScroll: true});
        }, false);
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
 * Turns the specified LED on or off.
 * @param {string} id The LED ID.
 * @param {*} on Whether it is lit.
 */
panel.setLed = function(id, on) {
    document.getElementById(id + '-on').style.display = on ? 'inline' : 'none';
    document.getElementById(id + '-off').style.display = on ? 'none' : 'inline';
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

    document.getElementById('s-' + cmd.id).addEventListener(
        'click', callback, false);
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

    if (type == panel.TOGGLE_SWITCH) {
        let toggle = function() {
            panel.onToggle(id);
        };
        upElem.addEventListener('click', toggle, false);
        downElem.addEventListener('click', toggle, false);
        // The helper button below the panel.
        document.getElementById('s-' + id).addEventListener(
            'click', toggle, false);
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
        panel.updateHelperSwitches();
    } else if (id == 'off-on') {
        if (panel.isPoweredOn) {
            panel.onPowerOff();
        } else {
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
 * The tabs, in the order they appear. The front panel and the teletype
 * are the two things a 1975 owner actually touched, so they sit
 * together (D8 in docs/ms-basic-4k.md).
 * @type {Array<string>}
 */
panel.TABS = ['sim', 'tty', 'debug', 'ref'];

/**
 * Where the chosen tab is remembered between visits. Only the view is
 * remembered, like the language; the machine itself starts afresh on
 * every page load.
 * @type {string}
 */
panel.tabStorageKey = 'sim8800tab';

/**
 * Remembers the tab on screen.
 * @param {string} name One of panel.TABS.
 */
panel.saveTab = function(name) {
    try {
        localStorage.setItem(panel.tabStorageKey, name);
    } catch (e) {
        // Site data is blocked, so the choice is not remembered. The
        // simulator itself works either way.
    }
};

/**
 * @return {string} The tab to open on, defaulting to the front panel.
 */
panel.readSavedTab = function() {
    var name = null;
    try {
        name = localStorage.getItem(panel.tabStorageKey);
    } catch (e) {
        name = null;
    }
    return panel.TABS.indexOf(name) < 0 ? 'sim' : name;
};

/**
 * Shows one tab and hides the others.
 * @param {string} name One of panel.TABS.
 */
panel.showTab = function(name) {
    panel.saveTab(name);
    panel.isDebugTabVisible = name == 'debug';
    panel.isTtyTabVisible = name == 'tty';
    for (let i = 0; i < panel.TABS.length; i++) {
        let tab = panel.TABS[i];
        let shown = tab == name;
        document.getElementById('tab-' + tab).style.display =
            shown ? 'block' : 'none';
        document.getElementById('nav-' + tab).classList.toggle(
            'selected', shown);
    }
    // The status line reports on the machine, which the Tutorial tab
    // does not show. It keeps updating while hidden.
    document.getElementById('status-bar').hidden = name == 'ref';
    // Neither view is kept up to date while it is hidden, so catch up
    // as it comes back.
    if (panel.isDebugTabVisible) {
        panel.buildExampleMenu();
        if (panel.sim) {
            panel.sim.flushDump(true);
        }
    }
    if (panel.isTtyTabVisible) {
        panel.setNavActivity(false);
        panel.renderTeletype();
    }
    // The teletype's hidden input is deliberately not focused here:
    // focusing scrolls it into view below the paper, and on a phone
    // raises the keyboard. Keys are handled on document, and tapping
    // the paper focuses it when the soft keyboard is wanted. Focus left
    // behind in another tab's input is dropped, so that it cannot
    // swallow keys or feed them to the machine.
    var focused = document.activeElement;
    if (focused && focused !== document.body && focused.blur) {
        focused.blur();
    }
};
