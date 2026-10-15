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
 * @fileoverview Putting a program in: the Load menu, the examples, 4K BASIC, a
 * binary file or hex bytes, and the Memory menu. Part of the
 * panel namespace, which js/panel.js declares (see there).
 */

import {Asm8080} from './asm8080.js';
import {l10n} from './l10n.js';
import {Link} from './link.js';
import {panel} from './panel.js';

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
 * bytes - is read out of examples/<id>.asm, and tests/examples.test.js
 * keeps this list in step with the directory.
 * @type {Array<string>}
 */
panel.EXAMPLES = [
    // Front panel.
    'pattern-shift',
    'io-echo',
    'adder',
    'multiply',
    'bouncing-light',
    'kill-the-bit',
    'macros',
    // Teletype.
    'tty-hello',
    'tty-ascii',
    'tty-echo',
    'tty-leds',
    'tty-subroutines',
    'print-number',
    'guess-letter',
];

/**
 * Whether the page was opened straight off the disk.
 *
 * A browser will not let a file:// page fetch the files beside it, so
 * the example programs and the BASIC tape need the folder to be served.
 * Checked up front rather than by letting the fetch fail, so that those
 * controls are greyed out before they are pressed and give the real
 * reason. See D22 in docs/ms-basic-4k.md.
 * @return {boolean} True if the page cannot read its own folder.
 */
panel.needsServer = function() {
    return window.location.protocol == 'file:';
};

/**
 * Reads one example: its header, and its source assembled. Both menus
 * offer the same programs from the same files: the Load menu loads the
 * bytes, and the Assembler's Examples menu shows the source (U5 in
 * docs/assembler.md).
 * @param {string} text An examples/*.asm file.
 * @return {?{name: string, desc: string, device: string,
 *     bytes: !Array<number>, text: string}} The program, or null if it
 *     does not assemble. Its text has the line endings a text area
 *     gives back, so the editor can tell it is unchanged.
 */
panel.parseExample = function(text) {
    text = text.replace(/\r\n?/g, '\n');
    var meta = {};
    var re = /^;;;\s*(name|desc|device):\s*(.*)$/gm;
    var m;
    while ((m = re.exec(text))) {
        meta[m[1]] = m[2].trim();
    }
    var result = Asm8080.assemble(text);
    if (!result.ok || !result.size) {
        return null;
    }
    // From 0000H, where every way of loading puts a program.
    var bytes = [];
    for (let a = 0; a <= result.end; a++) {
        bytes.push(result.memory.has(a) ? result.memory.get(a) : 0);
    }
    return {name: meta.name || '', desc: meta.desc || '',
            device: meta.device || '', bytes: bytes, text: text};
};

/**
 * Reads the examples, once, the first time either menu opens. A reader
 * who never opens one never fetches anything. The menus show them as
 * they arrive.
 * @return {!Promise} Settles once they are read, or cannot be.
 */
panel.fetchExamples = function() {
    if (panel.examplesFetched) {
        return panel.examplesPromise;
    }
    panel.examplesFetched = true;
    panel.examplePrograms = {};
    if (panel.needsServer()) {
        panel.examplesProblem = 'needs-server';
        panel.examplesPromise = Promise.resolve();
        return panel.examplesPromise;
    }
    panel.examplesLoading = true;
    // Fetched together, but listed in the order panel.EXAMPLES gives.
    var fetches = panel.EXAMPLES.map(function(id) {
        var url = 'examples/' + id + '.asm';
        return window.fetch(url, panel.FETCH).then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.text();
        }).then(function(text) {
            var program = panel.parseExample(text);
            return program ? {id: id, program: program} : null;
        }).catch(function() {
            // An example that cannot be read is simply not offered.
            return null;
        });
    });
    panel.examplesPromise = Promise.all(fetches).then(function(results) {
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
    return panel.examplesPromise;
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
    } else if (value == 'examples-loading') {
        panel.setStatus('examples-still-loading', {}, 'warn');
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
                    loaded.poweredOn, loaded.unprotected);
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
 * Zeroes memory, puts an image at 0000H and presses RESET, powering the
 * machine up first if it is off.
 *
 * It deliberately stops short of running, so that the memory map shows
 * what was just loaded before the program writes over it (D14).
 * @param {Array<number>|Uint8Array} bytes The image. Anything longer
 *     than the installed memory is ignored past the top.
 * @return {{bytes: number, poweredOn: boolean, unprotected: boolean}}
 *     How many bytes actually fit in the machine, whether it had to be
 *     switched on first, and whether protected memory had to be
 *     unprotected.
 */
panel.loadImage = function(bytes) {
    var poweredOn = panel.ensurePoweredOn();
    // A program going in is a fresh start, and one that half went in
    // around a protected board would be worse than none.
    var unprotected = panel.sim.unprotectAll();
    panel.sim.initMem(false);
    panel.sim.loadData(0, bytes);
    panel.sim.reset();
    panel.sim.flushDump(true);
    panel.updateMemoryControls();
    panel.showLoaded();
    return {bytes: Math.min(bytes.length, panel.sim.mem.length),
            poweredOn: poweredOn, unprotected: unprotected};
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
 * When Microsoft 4K BASIC is chosen from the Load menu.
 */
panel.onLoadBasic = function() {
    if (panel.reportIfUnavailable('load-basic')) {
        return;
    }
    window.fetch(panel.ROM_URL, panel.FETCH).then(function(response) {
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.arrayBuffer();
    }).then(function(buffer) {
        var loaded = panel.loadImage(new Uint8Array(buffer));
        panel.setStatus('rom-loaded', {bytes: loaded.bytes}, '',
                        loaded.poweredOn, loaded.unprotected);
    }).catch(function() {
        panel.setStatus('rom-missing', {}, 'error');
    });
};

/**
 * When a file is chosen with Binary File... in the Load menu.
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
                        {name: file.name, bytes: file.size}, 'error');
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
                             size: file.size}, 'warn', loaded.poweredOn, loaded.unprotected);
        } else {
            panel.setStatus('rom-file-loaded',
                            {bytes: loaded.bytes, name: file.name}, '',
                            loaded.poweredOn, loaded.unprotected);
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
                         size: panel.formatMemSize(panel.sim.mem.length)},
                        'error');
        return false;
    }
    // On, but not wiped: this is a deposit into the machine as it
    // stands, not a fresh tape. loadImage() is the one that clears.
    var poweredOn = panel.ensurePoweredOn();
    var unprotected = panel.sim.unprotectAll();
    panel.sim.loadData(0, parsed.bytes);
    panel.updateMemoryControls();
    panel.showLoaded();
    panel.setStatus('load-data-loaded', {bytes: parsed.bytes.length}, '',
                    poweredOn, unprotected);
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
