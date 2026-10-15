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
 * @fileoverview The Debugger: its controls, the memory dump and a byte edited in
 * it, the next instruction, and the memory map. Part of the
 * panel namespace, which js/panel.js declares (see there).
 */

import {l10n} from './l10n.js';
import {panel} from './panel.js';
import {Sim8800} from './sim8800.js';

/**
 * When Zero All Memory is pressed. There is no such switch on the real
 * machine.
 */
panel.onFillZero = function() {
    if (panel.reportIfUnavailable('debug-fill-zero')) {
        return;
    }
    // All of it, as the button says: protection is lifted first.
    var unprotected = panel.sim.unprotectAll();
    panel.sim.initMem(false);
    panel.sim.requestDump();
    panel.setStatus('status-zeroed', {}, '', false, unprotected);
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
    // unavailable: it needs enough memory.
    reasons['load-basic'] = memSize < panel.MIN_BASIC_MEM ?
        {id: 'rom-needs-memory', params: {}} : null;
    reasons['examples'] = panel.examplesProblem ?
        {id: panel.examplesProblem, params: {}} : null;
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
 * The byte picked in the memory dump for editing, by address, or null.
 * Bytes are typed over as in a hex editor (#14): two hex digits write
 * one whole byte, and the next byte is picked.
 * @type {?number}
 */
panel.memSelection = null;

/**
 * The first hex digit typed over the picked byte, waiting for its
 * second; memory is not touched until that arrives. Null if none.
 * @type {?number}
 */
panel.memPending = null;

/**
 * The dump's element that is drawn as picked, to be put back as it was
 * when the pick moves on.
 * @type {?Element}
 */
panel.memSelectedElem = null;

/**
 * When the memory dump is clicked: picks the byte under the pointer, if
 * there is one. A click that ends a text selection is left alone, so
 * the dump can still be copied.
 * @param {Event} event The click event.
 */
panel.onMemDumpClick = function(event) {
    var target = event.target && event.target.closest ?
        event.target.closest('span[data-a]') : null;
    if (!target) {
        // A running machine's bytes are not elements of their own (see
        // Sim8800.dumpMem), but a click on them still deserves the why.
        if (panel.sim.isRunning) {
            panel.setStatus('mem-edit-running', {}, 'warn');
        }
        return;
    }
    var selection = window.getSelection ? window.getSelection() : null;
    if (selection && !selection.isCollapsed) {
        return;
    }
    panel.selectMemByte(parseInt(target.dataset.a, 10));
};

/**
 * Picks a byte for editing, and gives the keyboard to the dump. Only a
 * stopped machine is edited, as on the panel only a stopped machine
 * takes a DEPOSIT.
 * @param {number} address The byte's address.
 */
panel.selectMemByte = function(address) {
    if (panel.sim.isRunning) {
        panel.setStatus('mem-edit-running', {}, 'warn');
        return;
    }
    panel.memSelection = address;
    panel.memPending = null;
    panel.renderMemSelection();
    // preventScroll: the input sits beside the dump, and scrolling it
    // into view would move the dock's contents.
    document.getElementById('mem-input').focus({preventScroll: true});
    panel.setStatus('mem-edit-hint');
};

/**
 * Lets go of the picked byte, dropping a digit typed but not finished.
 */
panel.clearMemSelection = function() {
    if (panel.memSelection === null) {
        return;
    }
    panel.memSelection = null;
    panel.memPending = null;
    panel.renderMemSelection();
};

/**
 * Moves the pick, turning the dump's page when it crosses an edge of
 * the window shown. Following the PC would turn the page straight back,
 * so moving the pick stops that, as paging by hand does.
 * @param {number} delta How many bytes on, or back if negative.
 */
panel.moveMemSelection = function(delta) {
    var top = panel.sim.mem.length - 1;
    var address = Math.min(Math.max(panel.memSelection + delta, 0), top);
    panel.memSelection = address;
    panel.memPending = null;
    var shown = panel.sim.getDumpWindow();
    if (address < shown.start || address >= shown.end) {
        panel.sim.setFollowPc(false);
        panel.sim.setDumpWindow(address);
        panel.updateMemoryControls();
    }
    panel.renderMemSelection();
};

/**
 * Takes one hex digit typed over the picked byte. The first is held;
 * the second writes the whole byte and picks the next, as DEPOSIT NEXT
 * moves on. A protected board refuses, and the pick stays put.
 * @param {number} digit 0 to 15.
 */
panel.typeMemDigit = function(digit) {
    if (panel.memSelection === null) {
        return;
    }
    if (panel.memPending === null) {
        panel.memPending = digit;
        panel.renderMemSelection();
        return;
    }
    var address = panel.memSelection;
    var value = panel.memPending * 16 + digit;
    panel.memPending = null;
    var result = panel.sim.editByte(address, value);
    if (result == 'protected') {
        panel.setStatus('mem-edit-protected',
                        {address: Sim8800.toHex(address, 4)}, 'warn');
        panel.renderMemSelection();
        return;
    }
    if (result != 'ok') {
        if (result == 'running') {
            panel.setStatus('mem-edit-running', {}, 'warn');
        }
        panel.clearMemSelection();
        return;
    }
    if (address < panel.sim.mem.length - 1) {
        panel.moveMemSelection(1);
    } else {
        panel.renderMemSelection();
    }
};

/**
 * The keys the picked byte answers: hex digits, the arrows, Backspace
 * and Escape. Every other key that would type something is swallowed,
 * so that nothing collects in the input; Tab still moves the focus on,
 * which lets go of the byte.
 * @param {Event} event The keydown event, from the dump's input.
 */
panel.onMemKey = function(event) {
    if (panel.memSelection === null || event.ctrlKey || event.metaKey ||
        event.altKey) {
        return;
    }
    var key = event.key;
    var moves = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -16, ArrowDown: 16};
    if (/^[0-9a-fA-F]$/.test(key)) {
        panel.typeMemDigit(parseInt(key, 16));
    } else if (moves[key]) {
        panel.moveMemSelection(moves[key]);
    } else if (key == 'Backspace') {
        panel.memPending = null;
        panel.renderMemSelection();
    } else if (key == 'Escape') {
        if (panel.memPending !== null) {
            panel.memPending = null;
            panel.renderMemSelection();
        } else {
            panel.clearMemSelection();
            event.target.blur();
        }
    } else if (key.length != 1) {
        return;
    }
    event.preventDefault();
};

/**
 * Takes text from a soft keyboard, which often reports its keys as
 * 'Unidentified' and so is not caught by onMemKey.
 * @param {Event} event The input event.
 */
panel.onMemInput = function(event) {
    var text = event.target.value;
    event.target.value = '';
    for (let i = 0; i < text.length; i++) {
        if (/[0-9a-fA-F]/.test(text[i])) {
            panel.typeMemDigit(parseInt(text[i], 16));
        }
    }
};

/**
 * Draws the pick on the dump: the byte filled, with an underline cursor
 * under the digit the next key types over - the first, or once one has
 * been typed, the second, the typed one shown in its place.
 * Called again after every redraw of the dump, which replaces the
 * bytes; a pick the dump no longer shows - the machine went off, or
 * less memory is installed - is let go.
 */
panel.renderMemSelection = function() {
    var old = panel.memSelectedElem;
    if (old) {
        old.classList.remove('mem-selected');
        old.textContent = Sim8800.toHex(
            panel.sim.readByte(parseInt(old.dataset.a, 10)), 2);
        panel.memSelectedElem = null;
    }
    if (panel.memSelection === null) {
        return;
    }
    if (!panel.sim.isPoweredOn ||
        panel.memSelection >= panel.sim.mem.length) {
        panel.memSelection = null;
        panel.memPending = null;
        return;
    }
    var elem = document.querySelector(
        '#mem-dump span[data-a="' + panel.memSelection + '"]');
    if (!elem) {
        return;
    }
    elem.classList.add('mem-selected');
    // Hex digits only, so safe to write as markup.
    var digits = Sim8800.toHex(panel.sim.readByte(panel.memSelection), 2);
    if (panel.memPending === null) {
        elem.innerHTML = '<span class="mem-caret">' + digits[0] + '</span>' +
            digits[1];
    } else {
        elem.innerHTML = '<span class="mem-typed">' +
            panel.memPending.toString(16).toUpperCase() + '</span>' +
            '<span class="mem-caret">' + digits[1] + '</span>';
    }
    panel.memSelectedElem = elem;
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
    // The bytes were all replaced, the picked one among them.
    panel.memSelectedElem = null;
    panel.renderMemSelection();
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
