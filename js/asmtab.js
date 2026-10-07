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
 * @fileoverview The dock's Assembler tab.
 */


/**
 * The Assembler tab: an editor for 8080 source, highlighted, with the
 * listing beside it line for line and the errors under it, and the
 * Assemble button that puts the program into the machine. U1 to U6
 * and H1 to H3 in docs/assembler.md.
 *
 * The assembling is js/asm8080.js's; this is only the page around it.
 * It reaches the machine through what js/panel.js already uses to load
 * a program.
 */
asmtab = {};

/**
 * Where the source is kept between visits, in this browser only (U3).
 * @type {string}
 */
asmtab.STORAGE_KEY = 'sim8800asm';

/**
 * The example sources in examples/source/, in the order the Examples
 * menu offers them: the front panel's first, then the teletype's, each
 * from the simplest up. Only the names are here; the rest is read from
 * each file's header (T3).
 * @type {Array<string>}
 */
asmtab.EXAMPLES = [
    'switches', 'adder', 'multiply', 'macros',
    'hello', 'echo', 'print-number',
];

/**
 * How long typing must pause before the source is assembled again for
 * the listing and the error marks.
 * @type {number}
 */
asmtab.ASSEMBLE_DELAY = 150;

/**
 * Bytes a listing row shows before it is cut short with an ellipsis.
 * @type {number}
 */
asmtab.LISTING_BYTES = 6;

/** The last assembly, for the listing and the marks. @type {?Object} */
asmtab.result = null;

/** The examples, once read: id -> {name, device, text}. */
asmtab.examples = null;

/** The text of the example last put in the editor, unchanged. */
asmtab.exampleText = null;

/** Whether the next Tab moves the focus on, after an Escape (U3). */
asmtab.tabLeaves = false;

/**
 * Sets the tab up. Called by panel.init().
 */
asmtab.init = function() {
    var source = asmtab.source();
    source.value = asmtab.readSaved();
    source.addEventListener('input', asmtab.onEdit, false);
    source.addEventListener('scroll', asmtab.syncScroll, false);
    source.addEventListener('keydown', asmtab.onKey, false);
    // The listing scrolls with the source, never by itself.
    document.getElementById('asm-listing').addEventListener(
        'wheel', function(event) {
            source.scrollTop += event.deltaY;
            source.scrollLeft += event.deltaX;
            event.preventDefault();
        }, {passive: false});
    document.getElementById('asm-assemble').addEventListener(
        'click', asmtab.onAssemble, false);
    document.getElementById('asm-errors').addEventListener(
        'click', asmtab.onErrorClick, false);
    document.getElementById('asm-view-toggle').addEventListener(
        'click', asmtab.onViewToggle, false);
    asmtab.examplesMenu = new Dropdown('asm-examples-dropdown',
                                       asmtab.onExampleChosen,
                                       asmtab.onExamplesOpen);
    asmtab.replaceDialog = new Dialog('asm-replace-dialog',
                                      asmtab.onReplaceOpen,
                                      panel.returnKeyboard);
    document.getElementById('asm-replace-ok').addEventListener(
        'click', asmtab.onReplaceConfirmed, false);
    asmtab.refresh();
};

/** @return {!Element} The source's text area. */
asmtab.source = function() {
    return document.getElementById('asm-source');
};

/**
 * The source as it was left. Site data may be blocked, in which case
 * the editor simply starts empty.
 * @return {string}
 */
asmtab.readSaved = function() {
    try {
        return localStorage.getItem(asmtab.STORAGE_KEY) || '';
    } catch (e) {
        return '';
    }
};

/** Keeps the source, in this browser. */
asmtab.save = function() {
    try {
        localStorage.setItem(asmtab.STORAGE_KEY, asmtab.source().value);
    } catch (e) {
        // Not kept; it still works for this visit.
    }
};

/**
 * After every change to the source: it is kept, redrawn at once, and
 * assembled again once typing pauses.
 */
asmtab.onEdit = function() {
    asmtab.save();
    asmtab.renderText();
    window.clearTimeout(asmtab.assembleTimer);
    asmtab.assembleTimer = window.setTimeout(asmtab.refresh,
                                             asmtab.ASSEMBLE_DELAY);
};

/**
 * Assembles the source for the listing and the marks, without loading
 * it, and redraws everything.
 */
asmtab.refresh = function() {
    var memSize = panel.sim ? panel.sim.mem.length : 256;
    asmtab.result = Asm8080.assemble(asmtab.source().value,
                                     {memSize: memSize});
    asmtab.renderText();
    asmtab.renderListing();
    asmtab.renderErrors();
    asmtab.renderSummary();
};

/**
 * The lines with an error, by number.
 * @return {!Set<number>}
 */
asmtab.errorLines = function() {
    var lines = new Set();
    var result = asmtab.result;
    if (result) {
        result.errors.forEach(function(e) { lines.add(e.line); });
    }
    return lines;
};

/**
 * Redraws the highlighting behind the text area, and the line numbers
 * beside it (H1, H2).
 */
asmtab.renderText = function() {
    var text = asmtab.source().value;
    var lines = text.split('\n');
    var errors = asmtab.errorLines();
    var macros = Asm8080.macroNames(text);
    var html = [];
    var gutter = [];
    for (let i = 0; i < lines.length; i++) {
        let bad = errors.has(i + 1);
        html.push('<span class="asm-line' + (bad ? ' asm-line-error' : '') +
                  '">' + asmtab.highlightLine(lines[i], macros) + '</span>');
        gutter.push('<span class="asm-gutter-line' +
                    (bad ? ' asm-gutter-error' : '') + '">' + (i + 1) +
                    '</span>');
    }
    document.getElementById('asm-highlight').innerHTML = html.join('');
    document.getElementById('asm-gutter').innerHTML = gutter.join('');
    asmtab.syncScroll();
};

/**
 * One line, as coloured markup (H2). It is coloured by the assembler's
 * own tokenizer, so the colours agree with what the assembler reads.
 * @param {string} line The line.
 * @param {!Set<string>} macros The macros the source defines.
 * @return {string} Markup, the line's text escaped.
 */
asmtab.highlightLine = function(line, macros) {
    var tokens = Asm8080.tokenize(line);
    var words = tokens.filter(function(t) {
        return t.type != 'space' && t.type != 'comment';
    });
    // Which word is the label or name, and which the code (L1).
    var label = null;
    var code = null;
    var k = 0;
    if (words[0] && words[0].type == 'name' && words[1] &&
        words[1].type == 'colon') {
        label = words[0];
        k = 2;
    }
    var named = function(t) {
        return t && t.type == 'name' &&
            ['EQU', 'SET', 'MACRO'].indexOf(t.text.toUpperCase()) >= 0;
    };
    if (!label && words[k] && words[k].type == 'name' && named(words[k + 1])) {
        label = words[k];
        k++;
    }
    if (words[k] && words[k].type == 'name') {
        code = words[k];
    }
    var out = '';
    for (const t of tokens) {
        let cls = null;
        switch (t.type) {
        case 'comment': cls = 'asm-comment'; break;
        case 'string': cls = 'asm-string'; break;
        case 'bad': cls = 'asm-bad'; break;
        case 'number':
        case 'dollar': cls = 'asm-number'; break;
        case 'colon': cls = 'asm-label'; break;
        case 'name': {
            let kind = Asm8080.classify(t.text);
            if (t === label) {
                cls = 'asm-label';
            } else if (t === code) {
                cls = kind == 'mnemonic' ? 'asm-mnemonic' :
                    kind == 'pseudo' ? 'asm-pseudo' :
                    macros.has(t.text.toUpperCase()) ? 'asm-macro' :
                    'asm-bad';
            } else if (kind == 'register') {
                cls = 'asm-register';
            } else if (kind == 'operator') {
                cls = 'asm-operator';
            } else if (kind == 'mnemonic') {
                // An instruction in parentheses (L7).
                cls = 'asm-mnemonic';
            }
            break;
        }
        }
        let text = asmtab.escape(t.text);
        out += cls ? '<span class="' + cls + '">' + text + '</span>' : text;
    }
    return out;
};

/**
 * @param {string} text Plain text.
 * @return {string} The text, safe to write as markup.
 */
asmtab.escape = function(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

/**
 * Keeps the highlighting, the line numbers and the listing where the
 * text area has scrolled to (H1).
 */
asmtab.syncScroll = function() {
    var source = asmtab.source();
    var highlight = document.getElementById('asm-highlight');
    highlight.scrollTop = source.scrollTop;
    highlight.scrollLeft = source.scrollLeft;
    document.getElementById('asm-gutter').scrollTop = source.scrollTop;
    document.getElementById('asm-listing').scrollTop = source.scrollTop;
};

/**
 * What the listing shows beside each line of the source: its address
 * and the bytes it made, in hex. A macro's use shows its expansion's.
 * @param {!Object} result An assembly.
 * @param {number} count How many lines the source has.
 * @return {!Array<{text: string, title: string, error: boolean}>} One
 *     cell per line, from line 1.
 */
asmtab.listingCells = function(result, count) {
    var byLine = [];
    for (let i = 0; i < count; i++) {
        byLine.push([]);
    }
    result.rows.forEach(function(row) {
        if (row.line >= 1 && row.line <= count) {
            byLine[row.line - 1].push(row);
        }
    });
    var errors = new Set(result.errors.map(function(e) { return e.line; }));
    var hex = Asm8080.hex;
    return byLine.map(function(rows, i) {
        var cell = {text: '', title: '', error: errors.has(i + 1)};
        var own = rows[0];
        if (!own || own.skipped) {
            return cell;
        }
        var bytes = [];
        var address = null;
        rows.forEach(function(row) {
            if (row.bytes.length && address === null) {
                address = row.address;
            }
            bytes = bytes.concat(row.bytes);
        });
        if (bytes.length) {
            let shown = bytes.slice(0, asmtab.LISTING_BYTES).map(function(b) {
                return hex(b, 2);
            }).join(' ');
            cell.text = hex(address, 4) + '  ' + shown +
                (bytes.length > asmtab.LISTING_BYTES ? ' …' : '');
        } else if (own.value !== null) {
            cell.text = '= ' + hex(own.value, 4);
        } else if (own.address !== null) {
            cell.text = hex(own.address, 4);
        }
        // The whole of it, where a row could not hold it all: a long
        // DB, or a macro's expansion, line by line.
        if (rows.length > 1 || bytes.length > asmtab.LISTING_BYTES) {
            cell.title = rows.filter(function(row) {
                return !row.skipped && (rows.length == 1 || row.depth > 0);
            }).map(function(row) {
                var at = row.address === null ? '    ' : hex(row.address, 4);
                var made = row.bytes.map(function(b) {
                    return hex(b, 2);
                }).join(' ');
                return at + '  ' + made.padEnd(12) + '  ' + row.text.trim();
            }).join('\n');
        }
        return cell;
    });
};

/** Redraws the listing beside the source (U2). */
asmtab.renderListing = function() {
    var count = asmtab.source().value.split('\n').length;
    var cells = asmtab.listingCells(asmtab.result, count);
    document.getElementById('asm-listing').innerHTML = cells.map(function(c) {
        return '<span class="asm-listing-line' +
            (c.error ? ' asm-listing-error' : '') + '"' +
            (c.title ? ' title="' + asmtab.escape(c.title) + '"' : '') + '>' +
            asmtab.escape(c.text) + '</span>';
    }).join('');
    asmtab.syncScroll();
};

/**
 * An error, as a sentence in the reader's language (L14, L22).
 * @param {!Object} error One of an assembly's errors.
 * @return {string}
 */
asmtab.errorText = function(error) {
    var params = Object.assign({}, error.params);
    if (error.id == 'too-big' && params.size) {
        params.size = panel.formatMemSize(params.size);
    }
    var message = asmtab.fill(l10n.getMessage('asm-' + error.id), params);
    return asmtab.fill(l10n.getMessage(error.macro ? 'asm-error-in-macro' :
                                       'asm-error-at'),
                       {line: error.line, macro: error.macro,
                        macroLine: error.macroLine, message: message});
};

/**
 * Puts values in place of a message's {placeholders}.
 * @param {string} message The message.
 * @param {!Object} params The values.
 * @return {string}
 */
asmtab.fill = function(message, params) {
    for (let key in params) {
        message = message.split('{' + key + '}').join(params[key]);
    }
    return message;
};

/** Redraws the list of errors under the source (U2). */
asmtab.renderErrors = function() {
    var list = document.getElementById('asm-errors');
    var errors = asmtab.result ? asmtab.result.errors : [];
    list.hidden = !errors.length;
    list.innerHTML = errors.map(function(e) {
        return '<li><button type="button" class="asm-error" data-line="' +
            e.line + '">' + asmtab.escape(asmtab.errorText(e)) +
            '</button></li>';
    }).join('');
};

/** Redraws the summary beside the toolbar's buttons. */
asmtab.renderSummary = function() {
    var result = asmtab.result;
    var summary = document.getElementById('asm-summary');
    summary.classList.toggle('asm-summary-bad', !!result && !result.ok);
    if (!result || (result.ok && !result.size)) {
        summary.textContent = '';
    } else if (!result.ok) {
        summary.textContent = asmtab.fill(l10n.getMessage('asm-summary-errors'),
                                          {count: result.errors.length});
    } else {
        summary.textContent = asmtab.fill(l10n.getMessage('asm-summary-ok'), {
            bytes: result.size, start: Asm8080.hex(result.start, 4),
            end: Asm8080.hex(result.end, 4)});
    }
};

/**
 * When an error in the list is pressed: the cursor goes to its line.
 * @param {Event} event The click.
 */
asmtab.onErrorClick = function(event) {
    var button = event.target.closest ? event.target.closest('.asm-error') :
        null;
    if (!button) {
        return;
    }
    asmtab.goToLine(parseInt(button.dataset.line, 10));
};

/**
 * Puts the cursor at the start of a line, and the line in view.
 * @param {number} line From 1.
 */
asmtab.goToLine = function(line) {
    var source = asmtab.source();
    var lines = source.value.split('\n');
    var at = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
        at += lines[i].length + 1;
    }
    source.focus({preventScroll: true});
    source.setSelectionRange(at, at + (lines[line - 1] || '').length);
    var lineHeight = parseFloat(getComputedStyle(source).lineHeight) || 26;
    var top = (line - 1) * lineHeight;
    if (top < source.scrollTop ||
        top > source.scrollTop + source.clientHeight - 2 * lineHeight) {
        source.scrollTop = Math.max(0, top - source.clientHeight / 3);
    }
};

/**
 * The spaces Tab inserts: up to the next stop, every eight columns, the
 * field layout of the manual's listings. A tab already in the text
 * counts as reaching its own stop.
 * @param {string} text The source.
 * @param {number} at Where the cursor is.
 * @return {string} One to eight spaces.
 */
asmtab.spacesToStop = function(text, at) {
    var start = text.lastIndexOf('\n', at - 1) + 1;
    var column = asmtab.columnOf(text.slice(start, at));
    return ' '.repeat(asmtab.TAB_STOP - column % asmtab.TAB_STOP);
};

/**
 * How many columns the start of a line takes on screen, its tabs
 * expanded to their stops.
 * @param {string} text Part of one line, from its start.
 * @return {number}
 */
asmtab.columnOf = function(text) {
    var column = 0;
    for (let i = 0; i < text.length; i++) {
        column = text[i] == '\t' ?
            column + asmtab.TAB_STOP - column % asmtab.TAB_STOP : column + 1;
    }
    return column;
};

/** Columns between tab stops, in the editor. @type {number} */
asmtab.TAB_STOP = 8;

/**
 * The editor's keys: Tab inserts spaces to the next stop, as editors
 * do, unless Escape came just before, so the keyboard is never trapped;
 * Ctrl+Enter (Cmd+Enter on a Mac) assembles (U3).
 * @param {Event} event The keydown event.
 */
asmtab.onKey = function(event) {
    if (event.key == 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        asmtab.onAssemble();
        return;
    }
    if (event.key == 'Escape') {
        asmtab.tabLeaves = true;
        return;
    }
    if (event.key == 'Tab' && !event.shiftKey && !event.altKey &&
        !event.ctrlKey && !event.metaKey && !asmtab.tabLeaves) {
        event.preventDefault();
        var source = event.target;
        source.setRangeText(asmtab.spacesToStop(source.value,
                                                source.selectionStart),
                            source.selectionStart, source.selectionEnd, 'end');
        asmtab.onEdit();
        return;
    }
    asmtab.tabLeaves = false;
};

/**
 * When Assemble is pressed: assembles the source and, if it has no
 * error, puts it into the machine as every other load does (U4).
 */
asmtab.onAssemble = function() {
    window.clearTimeout(asmtab.assembleTimer);
    asmtab.refresh();
    var result = asmtab.result;
    if (!result.ok) {
        panel.setStatus('asm-has-errors', {count: result.errors.length},
                        'error');
        return;
    }
    if (!result.size) {
        panel.setStatus('asm-empty', {}, 'warn');
        return;
    }
    var loaded = asmtab.load(result);
    var params = {bytes: result.size, start: Asm8080.hex(result.start, 4),
                  end: Asm8080.hex(result.end, 4),
                  entry: Asm8080.hex(result.entry, 4)};
    panel.setStatus(result.entry ? 'asm-loaded-at' : 'asm-loaded', params, '',
                    loaded.poweredOn, loaded.unprotected);
};

/**
 * Puts an assembled program into the machine: switched on if it was
 * off, unprotected, cleared, the bytes written and RESET pressed; and
 * a program that does not start at 0000H examined at its start, so
 * that PC is there, as an owner would have with EXAMINE.
 * @param {!Object} result An assembly with no error.
 * @return {{poweredOn: boolean, unprotected: boolean}} Whether the
 *     machine had to be switched on, and memory unprotected.
 */
asmtab.load = function(result) {
    var poweredOn = panel.ensurePoweredOn();
    var unprotected = panel.sim.unprotectAll();
    panel.sim.initMem(false);
    for (const [address, byte] of result.memory) {
        panel.sim.mem[address] = byte;
    }
    panel.sim.reset();
    if (result.entry) {
        CPU8080.set('PC', result.entry);
        panel.sim.lastAddress = result.entry;
        panel.sim.endResetFlash();
        panel.sim.showAddressAndData();
    }
    panel.sim.flushDump(true);
    panel.updateMemoryControls();
    return {poweredOn: poweredOn, unprotected: unprotected};
};

/**
 * On a phone, the source and the listing take turns: this shows the
 * other one (U2).
 */
asmtab.onViewToggle = function() {
    var tab = document.getElementById('tab-asm');
    tab.classList.toggle('show-listing');
    asmtab.refreshViewToggle();
};

/** Names the phone's toggle after what it would show. */
asmtab.refreshViewToggle = function() {
    var listing = document.getElementById('tab-asm')
        .classList.contains('show-listing');
    document.getElementById('asm-view-toggle').textContent =
        l10n.getMessage(listing ? 'asm-show-source' : 'asm-show-listing');
};

/**
 * Before the Examples menu opens: the examples are read, the first
 * time, and offered.
 */
asmtab.onExamplesOpen = function() {
    asmtab.examplesMenu.setItems(asmtab.exampleItems());
    if (asmtab.examples || asmtab.examplesLoading) {
        return;
    }
    if (panel.needsServer()) {
        asmtab.examplesProblem = 'needs-server-short';
        asmtab.examplesMenu.setItems(asmtab.exampleItems());
        return;
    }
    asmtab.examplesLoading = true;
    Promise.all(asmtab.EXAMPLES.map(function(id) {
        return window.fetch('examples/source/' + id + '.asm')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();
            }).then(function(text) {
                return [id, asmtab.parseHeader(text)];
            });
    })).then(function(pairs) {
        asmtab.examples = Object.fromEntries(pairs);
        asmtab.examplesProblem = null;
    }).catch(function() {
        asmtab.examplesProblem = 'examples-unreadable-short';
    }).then(function() {
        asmtab.examplesLoading = false;
        if (asmtab.examplesMenu.isOpen()) {
            asmtab.examplesMenu.setItems(asmtab.exampleItems());
        }
    });
};

/**
 * An example source's name and where to watch it, from its header.
 * @param {string} text The file.
 * @return {{name: string, device: string, text: string}}
 */
asmtab.parseHeader = function(text) {
    var name = text.match(/^;;;\s*name:\s*(.*)$/m);
    var device = text.match(/^;;;\s*device:\s*(.*)$/m);
    return {name: name ? name[1].trim() : '', device:
            device ? device[1].trim() : '', text: text};
};

/**
 * The Examples menu's items: grouped by where to watch, as the Load
 * menu's are.
 * @return {!Array<Object>}
 */
asmtab.exampleItems = function() {
    var msg = l10n.getMessage;
    if (!asmtab.examples) {
        return [asmtab.examplesProblem ?
                {value: 'unavailable', label: msg(asmtab.examplesProblem),
                 disabled: true} :
                {value: 'loading', label: msg('examples-loading'),
                 disabled: true}];
    }
    var items = [];
    [['panel', 'examples-heading-panel'],
     ['teletype', 'examples-heading-tty']].forEach(function(group) {
        items.push({heading: true, label: msg(group[1])});
        asmtab.EXAMPLES.forEach(function(id) {
            var example = asmtab.examples[id];
            if (example && (example.device == 'teletype') ==
                (group[0] == 'teletype')) {
                items.push({value: id, label: example.name});
            }
        });
    });
    return items;
};

/**
 * When an example is chosen. Text in the editor that is not an
 * unchanged example would be lost, so a dialog asks first (U5).
 * @param {string} id The example.
 */
asmtab.onExampleChosen = function(id) {
    var example = asmtab.examples && asmtab.examples[id];
    if (!example) {
        return;
    }
    var text = asmtab.source().value;
    if (text.trim() && text != asmtab.exampleText) {
        asmtab.pendingExample = id;
        asmtab.replaceDialog.open();
        return;
    }
    asmtab.useExample(id);
};

/** Names the example the dialog is about to put in. */
asmtab.onReplaceOpen = function() {
    var example = asmtab.examples[asmtab.pendingExample];
    document.getElementById('asm-replace-desc').textContent = asmtab.fill(
        l10n.getMessage('asm-replace-desc'), {name: example.name});
};

/** When Replace is pressed in the dialog. */
asmtab.onReplaceConfirmed = function() {
    asmtab.replaceDialog.close();
    asmtab.useExample(asmtab.pendingExample);
};

/**
 * Puts an example in the editor, in place of what was there.
 * @param {string} id The example.
 */
asmtab.useExample = function(id) {
    var example = asmtab.examples[id];
    var source = asmtab.source();
    source.value = example.text;
    asmtab.exampleText = example.text;
    source.scrollTop = 0;
    source.scrollLeft = 0;
    asmtab.save();
    window.clearTimeout(asmtab.assembleTimer);
    asmtab.refresh();
    panel.setStatus('asm-example-loaded', {name: example.name});
};

/**
 * Text set at runtime, again after a change of language. Called from
 * panel.refreshPlaceholders().
 */
asmtab.refreshText = function() {
    if (!asmtab.result) {
        return;
    }
    asmtab.renderErrors();
    asmtab.renderSummary();
    asmtab.refreshViewToggle();
    var msg = l10n.getMessage;
    asmtab.source().setAttribute('aria-label', msg('asm-source-label'));
    document.getElementById('asm-listing').setAttribute(
        'aria-label', msg('asm-listing-label'));
    document.getElementById('asm-assemble').title = msg('asm-assemble-title');
};

// Exports the namespace for unit tests when running in Node.js. This
// has no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = asmtab;
}
