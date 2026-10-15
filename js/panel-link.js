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
 * @fileoverview Program links: one opened with the page, and the Share dialog
 * that copies one. Part of the
 * panel namespace, which js/panel.js declares (see there).
 */

import {CPU8080} from './8080.js';
import {l10n} from './l10n.js';
import {Link} from './link.js';
import {panel} from './panel.js';
import {Sim8800} from './sim8800.js';

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
                        '', loaded.poweredOn, loaded.unprotected);
    } else {
        panel.setStatus('link-loaded', {bytes: loaded.bytes}, '',
                        loaded.poweredOn, loaded.unprotected);
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
