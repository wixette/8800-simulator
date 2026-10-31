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
 * @fileoverview The dock of tools under the panel: its tabs, its
 * height, and folding it away. Part of the panel namespace, which
 * js/panel.js declares (see there).
 */

import {l10n} from './l10n.js';
import {panel} from './panel.js';

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
 * The dock's tabs, in the order they appear. The teletype comes first:
 * it and the front panel are the two things a 1975 owner actually
 * touched (D8 in docs/ms-basic-4k.md, which U1 in docs/ui-design.md
 * carries over). The Assembler follows, before the Debugger, in the
 * order you work: write a program, then watch it run (U1 in
 * docs/assembler.md).
 * @type {Array<string>}
 */
panel.TABS = ['tty', 'asm', 'debug', 'ref', 'links'];

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
 * When one of the dock's tabs is pressed. Any but the tab already
 * showing opens the dock on itself; that one is left as it is (below).
 *
 * Opening the Teletype hands it the keyboard: from a mouse by letting go
 * of whatever control last had the focus - a menu button, typically -
 * and from the keyboard by putting the focus on the paper.
 * @param {string} name One of panel.TABS.
 * @param {boolean=} byKey Whether it was pressed from the keyboard.
 */
panel.onDockTab = function(name, byKey) {
    // The open tab, pressed again, does nothing: with five tabs it is
    // too easily pressed by mistake, and folding the dock away is the
    // fold button's job, and the handle's.
    if (name == panel.dock.tab && panel.dock.open) {
        return;
    }
    panel.showTab(name);
    if (name != 'tty') {
        return;
    }
    var focused = document.activeElement;
    if (byKey) {
        document.getElementById('tty-input').focus({preventScroll: true});
    } else if (focused && focused !== document.body && focused.blur) {
        focused.blur();
    }
};

/**
 * Makes a <div> standing for a button work like one: a click, or Enter
 * or Space while it has the focus. A mouse press does not give it the
 * focus, though, so that clicking it leaves the keyboard where it was -
 * with the teletype, say - instead of on itself.
 * @param {Element} elem The element, given a tabindex in the page.
 * @param {function(boolean)} action What a press does; told whether it
 *     came from the keyboard.
 */
panel.makePressable = function(elem, action) {
    elem.addEventListener('mousedown', function(event) {
        event.preventDefault();
    }, false);
    elem.addEventListener('click', function() { action(false); }, false);
    elem.addEventListener('keydown', function(event) {
        if (event.key == 'Enter' || event.key == ' ') {
            event.preventDefault();
            action(true);
        }
    }, false);
};

/**
 * Opens the dock on one tab.
 * @param {string} name One of panel.TABS.
 */
panel.showTab = function(name) {
    var arriving = name == 'asm' && !(panel.dock.tab == 'asm' && panel.dock.open);
    var changed = name != panel.dock.tab;
    panel.dock.tab = name;
    panel.dock.open = true;
    panel.applyDock();
    // The tabs share one scroll: a tab opens at its top, not at however
    // far down the last was read. The Tutorial goes back to its place.
    if (changed && name != 'ref') {
        document.getElementById('dock-body').scrollTop = 0;
    }
    // Opening the Assembler is coming to look: its PC line, once.
    if (arriving) {
        panel.followPc(true);
    }
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
        // On a phone the tabs can be wider than the screen.
        if (shown) {
            nav.scrollIntoView({block: 'nearest', inline: 'nearest'});
        }
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
    // The tabs share one scroll: the Tutorial goes back to where its
    // lesson was read to.
    if (dock.open && dock.tab == 'ref' && panel.restoreLessonScroll) {
        panel.restoreLessonScroll();
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
