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
 * @fileoverview The Teletype: its paper, and the keyboard and keys that
 * type at the machine. Part of the panel namespace, which js/panel.js
 * declares (see there).
 */

import {Dialog} from './dialog.js';
import {panel} from './panel.js';
import {Teletype} from './teletype.js';

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
        panel.followCarriage(paper, textElem.querySelector('.tty-cursor'));
    }
};

/**
 * Scrolls the paper sideways, when it is narrower than a line - on a
 * phone - just enough to keep the carriage in view, a few characters
 * clear of the edge, as the paper is kept scrolled down to it. After a
 * carriage return, that is back to the left margin.
 * @param {!Element} paper The paper, which scrolls.
 * @param {?Element} cursor The carriage, in it.
 */
panel.followCarriage = function(paper, cursor) {
    if (!cursor || paper.scrollWidth <= paper.clientWidth) {
        return;
    }
    // The paper is positioned, so the carriage is measured from it.
    var left = cursor.offsetLeft;
    var right = left + cursor.offsetWidth;
    var margin = cursor.offsetWidth * 4;
    if (left - margin < paper.scrollLeft) {
        paper.scrollLeft = Math.max(0, left - margin);
    } else if (right + margin > paper.scrollLeft + paper.clientWidth) {
        paper.scrollLeft = right + margin - paper.clientWidth;
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
    // The keyboard is the teletype's while nothing else needs it. Not
    // while a dialog or a menu is open over the paper, nor while a text
    // box or a menu item has the focus. A focused button or tab keeps
    // only the keys it acts on, so that it never acts and types at
    // once; everything else typed still goes to the machine.
    var target = event.target;
    if (Dialog.anyOpen() ||
        document.querySelector('[role="listbox"]:not([hidden])')) {
        return;
    }
    if (target && target !== document.body && target.id != 'tty-input') {
        if (!panel.isPressable(target) ||
            panel.PRESS_KEYS.indexOf(event.key) >= 0) {
            return;
        }
    }
    var byte = Teletype.keyToByte(event.key, event.ctrlKey);
    if (byte === null)
        return;
    event.preventDefault();
    panel.ttySend(byte);
};

/**
 * After a dialog closes: with the Teletype showing, the reader was
 * typing at the machine, so the keyboard goes back to it rather than to
 * the button the browser returns the focus to, where the first Space of
 * a BASIC line would press that button again.
 */
panel.returnKeyboard = function() {
    var focused = document.activeElement;
    if (panel.isTtyTabVisible && focused && focused !== document.body &&
        focused.blur) {
        focused.blur();
    }
};

/**
 * The keys a focused button or tab acts on itself, and so keeps.
 * @type {Array<string>}
 */
panel.PRESS_KEYS = ['Enter', ' ', 'Tab'];

/**
 * @param {Object} elem A focused element.
 * @return {boolean} Whether it is a control that is pressed rather than
 *     typed into: a button, a tab, the dock's splitter.
 */
panel.isPressable = function(elem) {
    var role = elem.getAttribute ? elem.getAttribute('role') : null;
    return elem.tagName == 'BUTTON' ||
        ['button', 'tab', 'separator'].indexOf(role) >= 0;
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
