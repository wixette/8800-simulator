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
 * @fileoverview The page: the core of its logic, which js/panel-*.js
 * add to (see the panel namespace below).
 */

import {asmtab} from './asmtab.js';
import {Box} from './box.js';
import {Dialog} from './dialog.js';
import {Dropdown} from './dropdown.js';
import {l10n} from './l10n.js';
import {Sim8800} from './sim8800.js';
import {Sio} from './sio.js';
import {Teletype} from './teletype.js';

/**
 * The page's logic, as one namespace. This file has its core - the
 * status line, About, and init(), which builds the page - and the
 * panel-*.js files each add a part of the page to it: the front panel,
 * loading, the Debugger, links, the Teletype and the dock. They import
 * this namespace, never one another, and reach each other through it
 * as the page runs; js/app.js imports them all. Nothing here may use
 * another part while the files are still loading, only once init()
 * has been called.
 * @type {!Object}
 */
export const panel = {};

/**
 * How the page fetches the files it reads itself - package.json, the
 * examples, the BASIC tape - rather than names in index.html. Their
 * names carry no version (tools/stamp.mjs), so a cache must check with
 * the server before giving one back: a new release's are never the old
 * ones. Unchanged, the check costs a reply with no body.
 * @type {!RequestInit}
 */
panel.FETCH = {cache: 'no-cache'};

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
 * Says so, if the machine is off. A switch thrown on a dead machine does
 * nothing, as on the metal (D17), but the status line says why, rather
 * than reporting a RUN or a RESET that did not happen.
 * @return {boolean} True if the machine is off, and that has been said.
 */
panel.reportIfOff = function() {
    if (panel.isPoweredOn) {
        return false;
    }
    panel.setStatus('status-off');
    return true;
};

/**
 * The tooltip of each control that shows an icon rather than words, as
 * the message that names it.
 * @type {Object<string, string>}
 */
panel.TOOLTIPS = {
    // Load keeps its word on a desktop, but loses it on a phone.
    'load-button': 'load-menu',
    'dock-splitter': 'splitter-label',
    'mem-page-prev': 'mem-page-prev-title',
    'mem-page-next': 'mem-page-next-title',
    'share-button': 'share-menu',
    'switch-locale': 'language-menu',
    'about-button': 'about-button',
    'memory-button': 'debug-memory-title',
};

/**
 * The name each menu's list gives a screen reader, as a message.
 * @type {Object<string, string>}
 */
panel.LIST_LABELS = {
    'load-list': 'load-menu',
    'memory-list': 'debug-memory-title',
    'locale-list': 'language-menu',
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
    // The menus' lists, for a screen reader, in the current language.
    for (let id in panel.LIST_LABELS) {
        let elem = document.getElementById(id);
        if (elem) {
            elem.setAttribute('aria-label', l10n.getMessage(panel.LIST_LABELS[id]));
        }
    }
    // The title is the logo, in the toolbar and in About; its words are
    // its alt text.
    for (const id of ['header-logo', 'about-logo']) {
        let logo = document.getElementById(id);
        if (logo) {
            logo.alt = l10n.getMessage('header-title');
        }
    }
    // A tab's name is its tooltip too: on a phone only its icon shows.
    for (let i = 0; i < panel.TABS.length; i++) {
        let nav = document.getElementById('nav-' + panel.TABS[i]);
        if (nav) {
            nav.title = l10n.getMessage('nav-' + panel.TABS[i] + '-name');
        }
    }
    if (document.getElementById('asm-source')) {
        asmtab.refreshText();
    }
    // How to edit the dump, for the pointer and for a screen reader.
    var memDump = document.getElementById('mem-dump');
    if (memDump) {
        memDump.title = l10n.getMessage('mem-dump-hint');
        document.getElementById('mem-input').setAttribute(
            'aria-label', l10n.getMessage('mem-dump-hint'));
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
 * @param {boolean=} afterUnprotect Whether protected memory had to be
 *     unprotected to do this, which the line says first too.
 */
panel.setStatus = function(id, params, severity = '', afterPowerOn = false,
                           afterUnprotect = false) {
    panel.statusId = id;
    panel.statusParams = params || {};
    panel.statusSeverity = severity;
    panel.statusAfterPowerOn = afterPowerOn;
    // The power-up this reports may have put the box together first.
    panel.statusAfterReassemble = afterPowerOn && panel.reassembledForPowerOn;
    if (afterPowerOn) {
        panel.reassembledForPowerOn = false;
    }
    panel.statusAfterUnprotect = afterUnprotect;
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
        // Split and joined, not replace(): a value from a link or a
        // file name may hold $' or $&, which replace() would expand.
        msg = msg.split('{' + key + '}').join(panel.statusParams[key]);
    }
    // First what happened, then what was loaded, then what to do next -
    // so the notes go in front of the message, not after the
    // instruction at the end of it. Chinese and Japanese put no space
    // after their full stop; a space there reads as a hole in the middle
    // of the line.
    var notes = [];
    if (panel.statusAfterReassemble) {
        notes.push('reassembled-first');
    } else if (panel.statusAfterPowerOn) {
        notes.push('powered-on-first');
    }
    if (panel.statusAfterUnprotect) {
        notes.push('unprotected-first');
    }
    for (let i = notes.length - 1; i >= 0; i--) {
        var note = l10n.getMessage(notes[i]);
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
    // A machine taken apart in the 3D view goes back together first:
    // the reader asked for a program, not for a refusal from a view
    // they may not be looking at (docs/3d-view.md, V4). The OFF/ON
    // switch itself refuses instead (panel.onToggle).
    panel.reassembledForPowerOn = panel.box.snapTogether();
    panel.onPowerOn();
    return true;
};

/**
 * Whether the last ensurePoweredOn() had to put the box back together
 * before switching on, for the status line to say so. Taken by the
 * next message that reports that power-up.
 * @type {boolean}
 */
panel.reassembledForPowerOn = false;

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
 * Puts the version in the About dialog, the first time it opens. If
 * package.json cannot be read, it shows no version rather than a wrong
 * one.
 */
panel.showVersion = function() {
    if (panel.versionAsked) {
        return;
    }
    panel.versionAsked = true;
    var line = document.querySelector('.about-version');
    var shown = document.getElementById('app-version');
    line.hidden = true;
    window.fetch('package.json', panel.FETCH).then(function(response) {
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
 * When References is pressed in the About dialog: the References tab,
 * from its top.
 */
panel.onAboutReferences = function() {
    panel.aboutDialog.close();
    panel.showTab('links');
    // The tabs share one scrolling body, so it may still be scrolled
    // to wherever the last tab was read to.
    document.getElementById('dock-body').scrollTop = 0;
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

/** If the power is turned on. */
panel.isPoweredOn = false;

/**
 * The machine's box: which parts are taken out in the 3D view, and so
 * whether the machine may be switched on (js/box.js). There is one
 * whether or not the 3D view has been opened; without it, the box
 * stays whole.
 * @type {!Box}
 */
panel.box = new Box(256);

/**
 * A refusal from the box, with the part it names in the reader's
 * language, for setStatus().
 * @param {{id: string, params: !Object<string, string>}} why The refusal.
 * @param {string=} severity The status line's severity.
 */
panel.sayBox = function(why, severity = 'warn') {
    var params = {};
    if (why.params.part) {
        params.part = l10n.getMessage('part-' + why.params.part);
    }
    panel.setStatus(why.id, params, severity);
};

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

    // The dock's tabs, and the button and handle that size it. Each is
    // reached with the Tab key and pressed with Enter or Space.
    for (let i = 0; i < panel.TABS.length; i++) {
        let name = panel.TABS[i];
        panel.makePressable(document.getElementById('nav-' + name),
                            function(byKey) { panel.onDockTab(name, byKey); });
    }
    panel.makePressable(document.getElementById('dock-toggle'),
                        function(byKey) {
        panel.setDockOpen(!panel.dock.open);
        // Opened on the Teletype from the keyboard, it gets the keyboard.
        if (byKey && panel.isTtyTabVisible) {
            document.getElementById('tty-input').focus({preventScroll: true});
        }
    });
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
    panel.sim.setLampsCallback = panel.setLampsCallback;
    // A byte put in by hand may undo what the Assembler loaded (U7).
    panel.sim.onHandWrite = function(address, value) {
        asmtab.onHandWrite(address, value);
    };
    panel.sim.onProtectedWrite = panel.onProtectedWrite;

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
    asmtab.init();

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
    }, panel.returnKeyboard);
    document.getElementById('debug-load-data').addEventListener(
        'click', panel.onHexDialogLoad, false);
    panel.shareDialog = new Dialog('share-dialog', panel.refreshShareDialog,
                                   panel.returnKeyboard);
    document.getElementById('share-button').addEventListener(
        'click', function() { panel.shareDialog.open(); }, false);
    ['share-program', 'copy-link-state'].forEach(function(id) {
        document.getElementById(id).addEventListener(
            'change', panel.refreshShareDialog, false);
    });
    document.getElementById('copy-link').addEventListener(
        'click', panel.onCopyLink, false);
    panel.aboutDialog = new Dialog('about-dialog', panel.showVersion,
                                   panel.returnKeyboard);
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
    // The dump's bytes, typed over (#14). Likewise one listener, since
    // every redraw replaces the bytes. The keys arrive at the input,
    // and leaving it - a click anywhere else - lets go of the byte.
    var memInput = document.getElementById('mem-input');
    document.getElementById('mem-dump').addEventListener(
        'click', panel.onMemDumpClick, false);
    document.getElementById('mem-dump').addEventListener(
        'pointerdown', panel.onMemDumpPress, false);
    memInput.addEventListener('keydown', panel.onMemKey, false);
    memInput.addEventListener('input', panel.onMemInput, false);
    memInput.addEventListener('blur', panel.clearMemSelection, false);
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
