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
 * Whether the dock is open on the Debugger. The dumps are expensive, so
 * they are not built while it is not.
 * @type {boolean}
 */
panel.isDebugTabVisible = false;

/**
 * Whether the dock is open on the Teletype, which is when keys go to it.
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
 * The example programs offered in the Load menu, in the order they are
 * offered.
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
 * Reads the example listings, once, the first time the Load menu opens.
 * A reader who never opens it never fetches anything. The menu shows
 * them as they arrive.
 */
panel.fetchExamples = function() {
    if (panel.examplesFetched) {
        return;
    }
    panel.examplesFetched = true;
    panel.examplePrograms = {};
    if (panel.needsServer()) {
        panel.examplesProblem = 'needs-server';
        return;
    }
    panel.examplesLoading = true;
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
        panel.exampleOrder = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i]) {
                panel.examplePrograms[results[i].id] = results[i].program;
                panel.exampleOrder.push(results[i].id);
            }
        }
        panel.examplesLoading = false;
        panel.examplesProblem = panel.exampleOrder.length ?
            null : 'examples-unreadable';
        if (panel.loadMenu && panel.loadMenu.isOpen()) {
            panel.loadMenu.setItems(panel.loadMenuItems());
        }
    });
};

/**
 * The controls that are items of the Load menu, built as it opens
 * rather than written into the page. debugControlReasons() gives them
 * reasons like any other control.
 * @type {Array<string>}
 */
panel.MENU_CONTROLS = ['load-basic', 'examples'];

/**
 * The short form of a reason, for the detail beside a greyed item in
 * the Load menu. The whole reason goes to the status line when the
 * item is chosen.
 * @type {Object<string, string>}
 */
panel.SHORT_REASONS = {
    'needs-server': 'needs-server-short',
    'rom-needs-memory': 'basic-needs-memory',
    'examples-unreadable': 'examples-unreadable-short',
};

/**
 * The Load menu as it stands: the ways in that never move first - your
 * own bytes, your own file, 4K BASIC - then the examples, grouped by
 * which face of the machine they speak through, under headings that
 * set them apart. The list of examples will grow, so it goes last.
 * @return {Array<Object>} Items, as Dropdown.setItems() takes them.
 */
panel.loadMenuItems = function() {
    var msg = l10n.getMessage;
    var reasons = panel.debugControlReasons();
    var short = function(reason) {
        return reason ? msg(panel.SHORT_REASONS[reason.id] || reason.id) : '';
    };
    var items = [
        {value: 'hex', label: msg('load-hex')},
        {value: 'file', label: msg('load-file')},
        {value: 'basic', label: msg('load-basic'),
         disabled: !!reasons['load-basic'],
         detail: short(reasons['load-basic'])},
    ];
    if (reasons['examples'] || panel.examplesLoading) {
        items.push({heading: true, label: msg('examples-heading')});
        items.push(panel.examplesLoading ?
            {value: 'examples-loading', label: msg('examples-loading'),
             disabled: true} :
            {value: 'examples', label: short(reasons['examples']),
             disabled: true});
        return items;
    }
    var groups = [['panel', msg('examples-heading-panel')],
                  ['teletype', msg('examples-heading-tty')]];
    for (let g = 0; g < groups.length; g++) {
        let ids = (panel.exampleOrder || []).filter(function(id) {
            let device = panel.examplePrograms[id].device;
            return (device == 'teletype') == (groups[g][0] == 'teletype');
        });
        if (!ids.length) {
            continue;
        }
        items.push({heading: true, label: groups[g][1]});
        ids.forEach(function(id) {
            let program = panel.examplePrograms[id];
            items.push({value: 'example:' + id, label: program.name,
                        detail: msg('example-size').replace(
                            '{bytes}', program.bytes.length)});
        });
    }
    return items;
};

/**
 * When an item of the Load menu is chosen.
 * @param {string} value The item.
 */
panel.onLoadMenu = function(value) {
    if (value == 'hex') {
        panel.hexDialog.open();
    } else if (value == 'file') {
        document.getElementById('binary-file').click();
    } else if (value == 'basic') {
        panel.onLoadBasic();
    } else if (value == 'examples') {
        panel.reportIfUnavailable('examples');
    } else if (value.indexOf('example:') == 0) {
        panel.loadExample(value.substring('example:'.length));
    }
};

/**
 * Loads one of the example programs.
 * @param {string} id Its name in panel.EXAMPLES.
 */
panel.loadExample = function(id) {
    var program = panel.examplePrograms && panel.examplePrograms[id];
    if (!program) {
        return;
    }
    var loaded = panel.loadImage(program.bytes);
    // RUN is on the front panel wherever the program's output goes, but
    // where to look afterwards is not the same place.
    panel.setStatus(program.device == 'teletype' ?
                        'example-loaded-tty' : 'example-loaded',
                    {name: program.name, bytes: loaded.bytes}, '',
                    loaded.poweredOn);
};

/**
 * The Memory menu's items, in the current language: the size, and what
 * it was as hardware.
 * @return {Array<Object>} Items, as Dropdown.setItems() takes them.
 */
panel.memoryMenuItems = function() {
    return panel.MEM_SIZES.map(function(size) {
        let parts = l10n.getMessage('mem-size-' + size).split(' \u00b7 ');
        return {value: String(size), label: parts[0], detail: parts[1]};
    });
};

/**
 * The tooltip of each control that shows an icon rather than words, as
 * the message that names it.
 * @type {Object<string, string>}
 */
panel.TOOLTIPS = {
    'mem-page-prev': 'mem-page-prev-title',
    'mem-page-next': 'mem-page-next-title',
    'share-button': 'share-menu',
    'switch-locale': 'language-menu',
    'about-button': 'about-button',
    'memory-button': 'debug-memory-title',
};

/**
 * Puts the hex box's prompt and the buttons' tooltips back, in the
 * current language. These are attributes rather than content, so the
 * l10n class cannot reach them.
 */
panel.refreshPlaceholders = function() {
    var input = document.getElementById('debug-data-input');
    if (input) {
        input.placeholder = l10n.getMessage('debug-data-placeholder');
    }
    // Buttons that are an icon or an arrowhead, with no words in them,
    // keep their name in a tooltip and on the element, where a screen
    // reader can reach it.
    var named = panel.TOOLTIPS;
    for (let id in named) {
        let elem = document.getElementById(id);
        if (elem) {
            let text = l10n.getMessage(named[id]);
            elem.title = text;
            if (id != 'memory-button') {
                elem.setAttribute('aria-label', text);
            }
        }
    }
    var closers = document.querySelectorAll('.dialog-close');
    for (let i = 0; i < closers.length; i++) {
        closers[i].title = l10n.getMessage('dialog-close');
        closers[i].setAttribute('aria-label', l10n.getMessage('dialog-close'));
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
    panel.showLoaded();
    return {bytes: Math.min(bytes.length, panel.sim.mem.length),
            poweredOn: poweredOn};
};

/**
 * After a program goes in, by any of the ways in: the dock shows the
 * Debugger, where the memory map shows what arrived before anything
 * has run over it (D14).
 */
panel.showLoaded = function() {
    panel.showTab('debug');
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
    reasons['examples'] = panel.examplesProblem ?
        {id: panel.examplesProblem, params: {}} : null;
    reasons['debug-load-data'] = null;
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
    // A machine that is off has nothing in it to link to.
    reasons['copy-link'] = on ? null : {id: 'copy-link-off', params: {}};
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
    if (panel.memoryMenu) {
        panel.memoryMenu.setSelected(String(memSize));
    }
    var follow = document.getElementById('mem-follow-pc');
    if (follow) {
        follow.classList.toggle('selected', panel.sim.followPc);
    }
    if (panel.memoryMenu) {
        panel.memoryMenu.setLabel(panel.formatMemSize(memSize));
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
        panel.setStatus('status-halted');
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
panel.dumpMemCallback = function(dumpHtml, pages, instr) {
    document.getElementById('mem-dump').innerHTML = dumpHtml;
    panel.renderMemMap(pages);
    panel.lastInstr = instr || null;
    panel.renderInstrPane();
    // Follow PC moves the window on its own, so the label is refreshed
    // with every dump.
    panel.updateMemWindowLabel();
};

/**
 * The instruction at the program counter, as the last dump found it.
 * Kept so that a change of language can redraw the pane.
 * @type {?Object}
 */
panel.lastInstr = null;

/**
 * Writes out the instruction at the program counter, beside the
 * registers: its address, its bytes and its mnemonic with the operand
 * named, then the operand's value this time, then whether the opcode is
 * one Intel never documented. A line each, to fit its box.
 */
panel.renderInstrPane = function() {
    var elem = document.getElementById('instr-pane');
    var instr = panel.lastInstr;
    if (!elem) {
        return;
    }
    // Blank while the machine is off, like the dumps.
    if (!instr) {
        elem.textContent = '';
        return;
    }
    var hex = instr.bytes.map(function(b) {
        return Sim8800.toHex(b, 2);
    });
    var lines = [
        Sim8800.toHex(instr.address, 4) +
            '  <span class="at-pc">' + hex[0] + '</span>' +
            hex.slice(1).map(function(b) {
                return ' <span class="at-operand">' + b + '</span>';
            }).join('') +
            '   '.repeat(3 - hex.length) +
            '  ' + instr.mnemonic,
    ];
    // Under the mnemonic, lined up with it: the address, a gap, the
    // bytes padded to three, and a gap.
    var indent = ' '.repeat(4 + 2 + 8 + 2);
    if (instr.operand) {
        lines.push(indent + instr.operandName + ' = ' + instr.operand);
    }
    if (instr.undocumented) {
        lines.push(l10n.getMessage('instr-undocumented'));
    }
    elem.innerHTML = '<pre>' + lines.join('\n') + '</pre>';
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
 * Reads the hex box and puts those bytes at 0000H, saying in the status
 * bar what happened.
 * @return {boolean} Whether the bytes went in.
 */
panel.debugLoadData = function() {
    var text = document.getElementById('debug-data-input').value.trim();
    if (!text) {
        panel.setStatus('load-data-empty', {}, 'warn');
        return false;
    }
    var parsed = Link.parseBytes(text);
    if (parsed.error) {
        panel.setStatus(parsed.error, parsed.params, 'error');
        return false;
    }
    if (parsed.bytes.length > panel.sim.mem.length) {
        panel.setStatus('load-data-too-long',
                        {bytes: parsed.bytes.length,
                         size: panel.sim.mem.length}, 'error');
        return false;
    }
    // On, but not wiped: this is a deposit into the machine as it
    // stands, not a fresh tape. loadImage() is the one that clears.
    var poweredOn = panel.ensurePoweredOn();
    panel.sim.loadData(0, parsed.bytes);
    panel.updateMemoryControls();
    panel.showLoaded();
    panel.setStatus('load-data-loaded', {bytes: parsed.bytes.length}, '',
                    poweredOn);
    return true;
};

/**
 * When Load Data is pressed in the hex dialog. The dialog closes on
 * success; on a mistake it stays, and says what the status line says,
 * since the status line is behind it.
 */
panel.onHexDialogLoad = function() {
    if (panel.debugLoadData()) {
        panel.hexDialog.close();
        return;
    }
    var error = document.getElementById('hex-dialog-error');
    error.textContent = document.getElementById('status-text').textContent;
    error.hidden = false;
};

/**
 * Reads the version out of package.json, which is the one place it is
 * kept: the page has no build step to copy it anywhere else.
 * @param {string} text The file.
 * @return {?string} The version, or null if the text does not hold one.
 */
panel.versionFrom = function(text) {
    try {
        var version = JSON.parse(text).version;
        return /^\d+\.\d+\.\d+$/.test(version) ? version : null;
    } catch (e) {
        return null;
    }
};

/**
 * Puts the version in the About dialog, the first time it opens. A
 * page opened straight off the disk cannot read package.json (D22), and
 * shows no version rather than a wrong one.
 */
panel.showVersion = function() {
    if (panel.versionAsked) {
        return;
    }
    panel.versionAsked = true;
    var line = document.querySelector('.about-version');
    var shown = document.getElementById('app-version');
    line.hidden = true;
    if (panel.needsServer()) {
        return;
    }
    window.fetch('package.json').then(function(response) {
        return response.ok ? response.text() : '';
    }).then(function(text) {
        var version = panel.versionFrom(text);
        if (version) {
            shown.textContent = version;
            line.hidden = false;
        }
    }).catch(function() {
        // No version, rather than a wrong one.
    });
};

/**
 * When Further Reading is pressed in the About dialog: the Tutorial,
 * at its references.
 */
panel.onAboutReferences = function() {
    panel.aboutDialog.close();
    panel.showTab('ref');
    var heading = document.getElementById('reference-title');
    if (heading) {
        heading.scrollIntoView({block: 'start'});
    }
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
 * Loads the machine a link describes, if the page was opened from one.
 * The machine is left stopped, like any other load, for RUN or SINGLE
 * STEP to take on from there.
 */
panel.loadFromLink = function() {
    // Copy Link writes the fragment, which never goes to the server and
    // so has no length limit there. A link written by hand is as likely
    // to use the query string.
    var search = window.location.search;
    return Link.linkToState(window.location.hash, panel.MEM_SIZES).then(
        function(state) {
            return state || Link.linkToState(search, panel.MEM_SIZES);
        }).then(panel.applyLinkState);
};

/**
 * When a link is pasted into the address bar of a page already open.
 * That changes only the fragment, which does not reload the page, so
 * only the fragment is read. The query string is what the page was
 * opened with, and loading it again would throw away the machine as it
 * stands.
 * @return {!Promise} Settles once the link, if any, is loaded.
 */
panel.onHashChange = function() {
    return Link.linkToState(window.location.hash, panel.MEM_SIZES).then(
        panel.applyLinkState);
};

/**
 * Puts the machine a link described into the simulator.
 * @param {?Object} state What Link.linkToState() read.
 */
panel.applyLinkState = function(state) {
    if (!state) {
        return;
    }
    if (state.error) {
        // Link gives sizes in bytes; the status line names them as the
        // memory buttons do.
        var params = Object.assign({}, state.params);
        if (params.size !== undefined) {
            params.size = panel.formatMemSize(params.size);
        }
        panel.setStatus(state.error, params, 'error');
        return;
    }
    // Through the panel, as the memory buttons do, so that the panel
    // knows the machine went off. Behind its back, the load below would
    // go into a machine the panel still thought was on, and be dropped.
    panel.onSetMemSize(state.memSize);
    var loaded = panel.loadImage(state.bytes);
    // Every register, not just the ones the link names: a machine that
    // was already on keeps its registers through RESET, and a register
    // the link leaves out is one that should be at its power-on value.
    Link.REGS16.concat(Link.REGS8).forEach(function(name) {
        CPU8080.set(name, name in state.cpu ?
                    state.cpu[name] : Link.regDefault(name));
    });
    panel.setAddressSwitches(state.switches);
    panel.sim.flushDump(true);
    // The PC as it now is: a link leaves it out when it is 0000H.
    if (Object.keys(state.cpu).length || state.switches) {
        panel.setStatus('link-state-loaded',
                        {size: panel.formatMemSize(state.memSize),
                         pc: Sim8800.toHex(CPU8080.status().pc, 4)},
                        '', loaded.poweredOn);
    } else {
        panel.setStatus('link-loaded', {bytes: loaded.bytes}, '',
                        loaded.poweredOn);
    }
};

/**
 * The registers a link to this moment carries. A halted CPU has already
 * stepped past its HLT; pointing the link back at the HLT brings the
 * machine up halted in the same place, which the core's halt flag,
 * private to it, could not.
 * @return {Object} CPU8080.status(), with that PC.
 */
panel.linkCpu = function() {
    var cpu = CPU8080.status();
    if (panel.sim.halted &&
        panel.sim.readByte((cpu.pc - 1) & 0xffff) == 0x76) {
        cpu.pc = (cpu.pc - 1) & 0xffff;
    }
    return cpu;
};

/**
 * A link that opens the simulator with what is in this machine: the
 * program at RESET, or - the second choice in the Share dialog - the
 * machine as it stands, registers and switches too.
 * @return {!Promise<string>} The link.
 */
panel.currentLink = function() {
    var base = window.location.href.split(/[?#]/)[0];
    var withState = document.getElementById('copy-link-state').checked;
    return Link.stateToLink({
        memSize: panel.sim.mem.length,
        bytes: panel.sim.mem,
        cpu: withState ? panel.linkCpu() : null,
        switches: panel.getInputAddressCallback(),
    }, panel.MEM_SIZES).then(function(query) {
        return base + '#' + query;
    });
};

/**
 * Fills the Share dialog in for the machine as it is: what each choice
 * would open, and the link the chosen one makes. A machine that is off
 * has nothing to link to, and the dialog says so instead.
 */
panel.refreshShareDialog = function() {
    var reason = panel.debugControlReasons()['copy-link'];
    var off = document.getElementById('share-off');
    off.hidden = !reason;
    off.textContent = reason ? l10n.getMessage(reason.id) : '';
    document.getElementById('share-choices').hidden = !!reason;
    document.getElementById('copy-link').classList.toggle('disabled', !!reason);
    if (reason) {
        return;
    }
    document.getElementById('share-state-desc').textContent =
        l10n.getMessage('share-state-desc').replace(
            '{pc}', Sim8800.toHex(panel.linkCpu().pc, 4));
    var field = document.getElementById('share-link');
    panel.currentLink().then(function(link) {
        field.value = link;
    });
};

/**
 * When Copy Link is pressed. A browser that will not let the page write
 * to the clipboard leaves the link selected in its box, to be copied by
 * hand.
 */
panel.onCopyLink = function() {
    if (panel.reportIfUnavailable('copy-link')) {
        return;
    }
    var field = document.getElementById('share-link');
    panel.currentLink().then(function(link) {
        field.value = link;
        var byHand = function() {
            field.focus();
            field.select();
            panel.setStatus('link-copy-blocked');
        };
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            byHand();
            return;
        }
        navigator.clipboard.writeText(link).then(function() {
            panel.setStatus(
                document.getElementById('copy-link-state').checked ?
                    'link-copied' : 'link-copied-program');
            panel.flashCopyLink('copy-link-done');
        }, byHand);
    });
};

/**
 * How long Copy Link shows what it did before it goes back to its name.
 * @type {number}
 */
panel.COPY_LINK_FLASH_MS = 1500;

/**
 * Says on the Copy Link button itself that the link went somewhere.
 * The status line says it too, but behind the dialog.
 * @param {string} id The l10n message to show on the button.
 */
panel.flashCopyLink = function(id) {
    var button = document.getElementById('copy-link');
    button.textContent = l10n.getMessage(id);
    button.classList.add('copied');
    window.clearTimeout(panel.copyLinkTimer);
    panel.copyLinkTimer = window.setTimeout(function() {
        button.textContent = l10n.getMessage('copy-link');
        button.classList.remove('copied');
    }, panel.COPY_LINK_FLASH_MS);
};

/**
 * Sends one byte to the machine, as if it had been typed at the
 * teletype keyboard.
 *
 * A machine that is off receives nothing: the board holding characters
 * for the CPU to read is unpowered, so the keys go nowhere rather than
 * being saved up for the next time it comes on (D24).
 * @param {number} byte The byte.
 */
panel.ttySend = function(byte) {
    if (byte === null || !panel.sio)
        return;
    if (!panel.isPoweredOn) {
        panel.setStatus('tty-off', {}, 'warn');
        return;
    }
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
        // Something is being printed where nobody is looking.
        panel.setNavActivity(true);
    }
    panel.requestTtyRender();
};

/**
 * Marks, or unmarks, the dock's Teletype tab as having something new.
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
    // Until something prints, the paper says what it takes to make it.
    var hint = document.getElementById('tty-hint');
    if (hint) {
        hint.hidden = !(lines.length == 1 && lines[0] == '' &&
                        panel.tty.column == 0);
    }
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
 * Handles a key pressed while the teletype is on screen.
 * @param {Event} event The keydown event.
 */
panel.onTtyKeyDown = function(event) {
    if (!panel.isTtyTabVisible || event.metaKey || event.altKey)
        return;
    // A dialog or a menu open over the paper, or a box of its own being
    // typed in, has the keyboard first.
    var target = event.target;
    if (Dialog.anyOpen() ||
        document.querySelector('[role="listbox"]:not([hidden])') ||
        (target && target.tagName == 'TEXTAREA') ||
        (target && target.tagName == 'INPUT' && target.id != 'tty-input')) {
        return;
    }
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
        // feeding the machine once the Teletype is out of sight.
        return;
    }
    for (let i = 0; i < text.length; i++) {
        panel.ttySend(Teletype.keyToByte(text.charAt(i)));
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

    // The dock as it was left, before anything below redraws it - and
    // so saves it - with the defaults.
    var savedDock = panel.readSavedDock();
    panel.dock = {tab: panel.readSavedTab(), open: savedDock.open,
                  height: savedDock.height};

    // The dock's tabs, and the button and handle that size it.
    for (let i = 0; i < panel.TABS.length; i++) {
        let name = panel.TABS[i];
        document.getElementById('nav-' + name).addEventListener(
            'click', function() { panel.onDockTab(name); }, false);
    }
    document.getElementById('dock-toggle').addEventListener(
        'click', function() { panel.setDockOpen(!panel.dock.open); }, false);
    panel.initDockSplitter();
    window.addEventListener('resize', function() { panel.applyDock(); },
                            false);

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
    // while the dock is not showing the Debugger.
    panel.sim.dumpScheduler = function(flush) {
        window.requestAnimationFrame(flush);
    };
    panel.sim.dumpFilter = function() {
        return panel.isDebugTabVisible;
    };

    // The teletype. The paper and the serial board are plain objects
    // that keep working whether or not the dock shows them; only the
    // drawing waits for it.
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

    panel.initSwitchStrip();
    panel.setHelperShown(panel.readHelperShown(), false);

    // The toolbar. Load is built as it opens, since what it offers
    // depends on the moment: 4K BASIC needs 4 KB, the examples a server.
    panel.loadMenu = new Dropdown('load-dropdown', panel.onLoadMenu,
                                  function() {
        panel.fetchExamples();
        panel.loadMenu.setItems(panel.loadMenuItems());
    });
    panel.memoryMenu = new Dropdown('memory-dropdown', function(value) {
        panel.onSetMemSize(Number(value));
    });
    panel.memoryMenu.setItems(panel.memoryMenuItems());
    document.getElementById('binary-file').addEventListener(
        'change', panel.onBinaryFileChosen, false);

    // The dialogs.
    panel.hexDialog = new Dialog('hex-dialog', function() {
        document.getElementById('hex-dialog-error').hidden = true;
    });
    document.getElementById('debug-load-data').addEventListener(
        'click', panel.onHexDialogLoad, false);
    panel.shareDialog = new Dialog('share-dialog', panel.refreshShareDialog);
    document.getElementById('share-button').addEventListener(
        'click', function() { panel.shareDialog.open(); }, false);
    ['share-program', 'copy-link-state'].forEach(function(id) {
        document.getElementById(id).addEventListener(
            'change', panel.refreshShareDialog, false);
    });
    document.getElementById('copy-link').addEventListener(
        'click', panel.onCopyLink, false);
    panel.aboutDialog = new Dialog('about-dialog', panel.showVersion);
    document.getElementById('about-button').addEventListener(
        'click', function() { panel.aboutDialog.open(); }, false);
    document.getElementById('about-references').addEventListener(
        'click', panel.onAboutReferences, false);

    // The controls for the memory dump's window.
    document.getElementById('debug-fill-zero').addEventListener(
        'click', panel.onFillZero, false);
    // Text set at runtime has to be redrawn after a change of language.
    l10n.onUpdate = function() {
        panel.refreshStatus();
        panel.refreshPlaceholders();
        panel.renderInstrPane();
        panel.refreshDockToggle();
        panel.refreshStripTab();
        if (panel.memoryMenu) {
            panel.memoryMenu.setItems(panel.memoryMenuItems());
            panel.updateMemoryControls();
        }
        if (panel.shareDialog && panel.shareDialog.isOpen()) {
            panel.refreshShareDialog();
        }
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
    // A link to a program, or to a machine part way through one.
    panel.loadFromLink();
    // A link pasted into the address bar while the page is open only
    // changes the fragment, which does not reload the page.
    window.addEventListener('hashchange', panel.onHashChange, false);
    // Last, because showing the dock refreshes what is in it, and that
    // needs the simulator and the teletype to exist first.
    panel.applyDock();
};

/**
 * Hooks up the teletype's controls.
 */
panel.initTeletypeUi = function() {
    document.getElementById('tty-break').addEventListener(
        'click', function() { panel.ttySend(Teletype.BREAK); }, false);
    document.getElementById('tty-rubout').addEventListener(
        'click', function() { panel.ttySend(Teletype.RUBOUT); }, false);
    document.getElementById('tty-kill').addEventListener(
        'click', function() { panel.ttySend(Teletype.KILL_LINE); }, false);
    // The ASR-33's other paper key. It goes to the machine like any
    // other key, so the paper moves only if a program echoes it -
    // which is the thing worth seeing (D25).
    document.getElementById('tty-linefeed').addEventListener(
        'click', function() { panel.ttySend(Teletype.LF); }, false);
    document.getElementById('tty-clear').addEventListener(
        'click', panel.onTtyClear, false);

    // Tapping the paper raises the soft keyboard on a phone.
    var input = document.getElementById('tty-input');
    document.getElementById('tty-paper').addEventListener(
        'click', function() {
            // preventScroll: the input sits below the paper, and
            // scrolling it into view would move the dock's contents.
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

    panelElem.appendChild(midElem);
    panelElem.appendChild(upElem);
    panelElem.appendChild(downElem);

    // Each switch also takes a press anywhere near its lever, not only
    // on the 20 by 30 sprite: a scaled-down panel leaves that very
    // small. The address switches stand 50 apart, so a target 40 wide
    // still leaves a gap between neighbours.
    if (type == panel.TOGGLE_SWITCH) {
        let toggle = function() {
            panel.onToggle(id);
        };
        upElem.addEventListener('click', toggle, false);
        downElem.addEventListener('click', toggle, false);
        panel.createHitArea(x - 10, y - 8, 40, 46, toggle);
        // The helper button below the panel.
        document.getElementById('s-' + id).addEventListener(
            'click', toggle, false);
    } else {
        let upper = upperCmd && function() {
            panel.switchUpThenBack(id);
            panel.playSwitch();
            upperCmd.callback();
        };
        let lower = lowerCmd && function() {
            panel.switchDownThenBack(id);
            panel.playSwitch();
            lowerCmd.callback();
        };
        if (upper) {
            panel.createCmdLabel(upperCmd, upper);
        }
        if (lower) {
            panel.createCmdLabel(lowerCmd, lower);
        }
        // The lever's top half throws it up and its bottom half down,
        // as on the metal. SINGLE STEP only goes one way, so all of its
        // lever is that way.
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
 * The dock's tabs, in the order they appear. The teletype comes first:
 * it and the front panel are the two things a 1975 owner actually
 * touched (D8 in docs/ms-basic-4k.md, which U1 in docs/ui-design.md
 * carries over).
 * @type {Array<string>}
 */
panel.TABS = ['tty', 'debug', 'ref'];

/**
 * The tab a first visit opens on: the Tutorial, which says what to do
 * with the machine it sits under.
 * @type {string}
 */
panel.DEFAULT_TAB = 'ref';

/**
 * Where the chosen tab is remembered between visits. Only the view is
 * remembered, like the language; the machine itself starts afresh on
 * every page load.
 * @type {string}
 */
panel.tabStorageKey = 'sim8800tab';

/**
 * Where whether the dock is open, and how tall, is remembered.
 * @type {string}
 */
panel.dockStorageKey = 'sim8800dock';

/**
 * The dock as it stands: which tab, whether it is open or folded down
 * to its tabs, and its height in pixels (null for the default).
 * @type {{tab: string, open: boolean, height: ?number}}
 */
panel.dock = {tab: 'ref', open: true, height: null};

/**
 * The least the dock and the front panel may each be left with, in
 * pixels, however the dock is dragged.
 * @type {number}
 */
panel.DOCK_MIN_HEIGHT = 120;
panel.STAGE_MIN_HEIGHT = 160;

/**
 * Remembers the dock: its tab, and whether it is open and how tall.
 */
panel.saveDock = function() {
    try {
        localStorage.setItem(panel.tabStorageKey, panel.dock.tab);
        localStorage.setItem(panel.dockStorageKey, JSON.stringify(
            {open: panel.dock.open, height: panel.dock.height}));
    } catch (e) {
        // Site data is blocked, so the choice is not remembered. The
        // simulator itself works either way.
    }
};

/**
 * @return {string} The tab to open on. A tab that no longer exists -
 *     'sim', from before the front panel stopped being one - opens the
 *     default instead.
 */
panel.readSavedTab = function() {
    var name = null;
    try {
        name = localStorage.getItem(panel.tabStorageKey);
    } catch (e) {
        name = null;
    }
    return panel.TABS.indexOf(name) < 0 ? panel.DEFAULT_TAB : name;
};

/**
 * @return {{open: boolean, height: ?number}} The dock as it was left,
 *     or open at its default height on a first visit.
 */
panel.readSavedDock = function() {
    var saved = null;
    try {
        saved = JSON.parse(localStorage.getItem(panel.dockStorageKey));
    } catch (e) {
        saved = null;
    }
    if (!saved || typeof saved != 'object') {
        return {open: true, height: null};
    }
    return {open: saved.open !== false,
            height: typeof saved.height == 'number' ? saved.height : null};
};

/**
 * When one of the dock's tabs is pressed. The tab already showing
 * folds the dock away, as a tool window does in an IDE; any other opens
 * the dock on itself.
 * @param {string} name One of panel.TABS.
 */
panel.onDockTab = function(name) {
    if (name == panel.dock.tab && panel.dock.open) {
        panel.setDockOpen(false);
    } else {
        panel.showTab(name);
    }
};

/**
 * Opens the dock on one tab.
 * @param {string} name One of panel.TABS.
 */
panel.showTab = function(name) {
    panel.dock.tab = name;
    panel.dock.open = true;
    panel.applyDock();
};

/**
 * Opens the dock, or folds it down to its tabs.
 * @param {boolean} open Whether it should be open.
 */
panel.setDockOpen = function(open) {
    panel.dock.open = open;
    panel.applyDock();
};

/**
 * The tallest the dock may be in this window: whatever leaves the front
 * panel its minimum, on top of the switch strip.
 * @return {number} Pixels.
 */
panel.maxDockHeight = function() {
    var app = document.getElementById('app');
    var toolbar = document.getElementById('toolbar');
    var status = document.getElementById('status-bar');
    var splitter = document.getElementById('dock-splitter');
    var strip = document.getElementById('switch-strip');
    var room = app.clientHeight - toolbar.offsetHeight -
        status.offsetHeight - splitter.offsetHeight - panel.STAGE_MIN_HEIGHT -
        strip.offsetHeight;
    return Math.max(panel.DOCK_MIN_HEIGHT, room);
};

/**
 * The dock's height in this window: the one chosen, or the default,
 * kept between the least it may be and the most.
 * @return {number} Pixels.
 */
panel.dockHeight = function() {
    var app = document.getElementById('app');
    var wanted = panel.dock.height !== null ? panel.dock.height :
        Math.round(app.clientHeight * 0.4);
    return Math.min(Math.max(wanted, panel.DOCK_MIN_HEIGHT),
                    panel.maxDockHeight());
};

/**
 * Puts the dock on screen as panel.dock says, and brings whatever it
 * now shows up to date.
 */
panel.applyDock = function() {
    var dock = panel.dock;
    var app = document.getElementById('app');
    panel.isDebugTabVisible = dock.open && dock.tab == 'debug';
    panel.isTtyTabVisible = dock.open && dock.tab == 'tty';
    app.classList.toggle('dock-closed', !dock.open);
    app.style.setProperty('--dock-height', panel.dockHeight() + 'px');
    for (let i = 0; i < panel.TABS.length; i++) {
        let tab = panel.TABS[i];
        let shown = dock.open && tab == dock.tab;
        document.getElementById('tab-' + tab).hidden = !shown;
        let nav = document.getElementById('nav-' + tab);
        nav.classList.toggle('selected', shown);
        nav.setAttribute('aria-selected', shown ? 'true' : 'false');
    }
    panel.refreshDockToggle();
    panel.saveDock();
    panel.fitSwitchStrip();
    // Neither tool is kept up to date while it is out of sight, so catch
    // up as it comes back.
    if (panel.isDebugTabVisible && panel.sim) {
        panel.sim.flushDump(true);
    }
    if (panel.isTtyTabVisible) {
        panel.setNavActivity(false);
        panel.renderTeletype();
    }
    // The teletype's hidden input is deliberately not focused here:
    // focusing it on a phone raises the keyboard. Keys are handled on
    // document, and tapping the paper focuses it when the soft
    // keyboard is wanted. Focus left behind in a tool that has gone out
    // of sight is dropped, so that it cannot swallow keys or feed them
    // to the machine.
    var focused = document.activeElement;
    if (focused && focused !== document.body && focused.blur &&
        focused.closest && focused.closest('#dock-body') &&
        !focused.closest('.dock-pane:not([hidden])')) {
        focused.blur();
    }
};

/**
 * Names the dock's fold button for what it will do, in the current
 * language. It is an arrowhead, so the words live in a tooltip and on
 * the element, where a screen reader can reach them.
 */
panel.refreshDockToggle = function() {
    var toggle = document.getElementById('dock-toggle');
    if (!toggle) {
        return;
    }
    var id = panel.dock.open ? 'dock-hide' : 'dock-show';
    toggle.textContent = panel.dock.open ? '▾' : '▴';
    toggle.title = l10n.getMessage(id);
    toggle.setAttribute('aria-label', l10n.getMessage(id));
};

/**
 * Lets the handle between the front panel and the dock be dragged, or
 * moved with the arrow keys.
 */
panel.initDockSplitter = function() {
    var splitter = document.getElementById('dock-splitter');
    var resizeTo = function(height) {
        panel.dock.height = Math.min(
            Math.max(Math.round(height), panel.DOCK_MIN_HEIGHT),
            panel.maxDockHeight());
        panel.dock.open = true;
        panel.applyDock();
    };
    splitter.addEventListener('pointerdown', function(event) {
        if (event.button) {
            return;
        }
        event.preventDefault();
        splitter.setPointerCapture(event.pointerId);
        splitter.classList.add('dragging');
        var bottom = document.getElementById('dock').getBoundingClientRect()
            .bottom;
        var move = function(e) {
            resizeTo(bottom - e.clientY);
        };
        var up = function() {
            splitter.classList.remove('dragging');
            splitter.removeEventListener('pointermove', move);
            splitter.removeEventListener('pointerup', up);
            splitter.removeEventListener('pointercancel', up);
        };
        splitter.addEventListener('pointermove', move);
        splitter.addEventListener('pointerup', up);
        splitter.addEventListener('pointercancel', up);
    }, false);
    splitter.addEventListener('keydown', function(event) {
        var step = {ArrowUp: 24, ArrowDown: -24}[event.key];
        if (step) {
            event.preventDefault();
            resizeTo(panel.dockHeight() + step);
        }
    }, false);
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
    var tab = document.getElementById('strip-tab');
    var toggle = function() {
        panel.setHelperShown(!panel.isHelperShown, true);
    };
    tab.addEventListener('click', toggle, false);
    tab.addEventListener('keydown', function(event) {
        if (event.key == 'Enter' || event.key == ' ') {
            event.preventDefault();
            toggle();
        }
    }, false);
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
