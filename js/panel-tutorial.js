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
 * @fileoverview The Tutorial's chapters and what a step can show
 * (docs/3d-view.md, V7): a contents row that jumps to each chapter, and
 * Show chips that point at what a step is about - a part of the 2D
 * panel, or parts of the machine in 3D. A chip changes only what is
 * shown: it never throws a switch or takes a part out; the reader does
 * that. Part of the panel namespace, which js/panel.js declares.
 */

import {l10n} from './l10n.js';
import {panel} from './panel.js';

/** Where the last chapter read is remembered. */
panel.chapterStorageKey = 'sim8800chapter';

/**
 * The parts of the 2D panel a step can point at, as boxes in the
 * artwork's coordinates (1440 x 644): x, y, width, height.
 * @type {!Object<string, !Array<number>>}
 */
panel.PANEL_REGIONS = {
    status: [178, 98, 510, 50],
    data: [814, 98, 460, 50],
    address: [178, 208, 1096, 50],
    switches: [330, 318, 944, 64],
    controls: [88, 404, 1010, 96],
};

/** How long an outline on the 2D panel stays, in milliseconds. */
panel.OUTLINE_MS = 6000;

/**
 * Builds the contents row and makes the Show chips work.
 */
panel.initTutorial = function() {
    var contents = document.getElementById('tutorial-contents');
    var chapters = document.querySelectorAll('.tutorial-chapter');
    for (let i = 0; i < chapters.length; i++) {
        let chapter = chapters[i];
        let button = document.createElement('button');
        button.type = 'button';
        button.className = 'tutorial-jump';
        button.dataset.chapter = chapter.id;
        button.addEventListener('click', function() {
            panel.showChapter(chapter.id, true);
        }, false);
        contents.appendChild(button);
    }
    var chips = document.querySelectorAll('.show-chip');
    for (let i = 0; i < chips.length; i++) {
        let chip = chips[i];
        chip.addEventListener('click', function() {
            panel.onShowChip(chip);
        }, false);
    }
    panel.refreshTutorial();
    var saved = null;
    try {
        saved = localStorage.getItem(panel.chapterStorageKey);
    } catch (e) {
        saved = null;
    }
    if (saved && document.getElementById(saved) && panel.dock.tab == 'ref') {
        panel.showChapter(saved, false);
    }
};

/**
 * Writes the chapters' names into the contents row and the chips'
 * word, in the reader's language.
 */
panel.refreshTutorial = function() {
    var buttons = document.querySelectorAll('.tutorial-jump');
    for (let i = 0; i < buttons.length; i++) {
        let title = document.querySelector('#' + buttons[i].dataset.chapter + ' .l10n');
        buttons[i].textContent = title ? title.textContent : '';
    }
    var contents = document.getElementById('tutorial-contents');
    if (contents) {
        contents.setAttribute('aria-label', l10n.getMessage('tutorial-contents-label'));
    }
    var chips = document.querySelectorAll('.show-chip');
    for (let i = 0; i < chips.length; i++) {
        chips[i].textContent = l10n.getMessage('tutorial-show');
    }
};

/**
 * Scrolls the Tutorial to a chapter.
 * @param {string} id The chapter's element.
 * @param {boolean} save Whether the reader chose it, to be remembered.
 */
panel.showChapter = function(id, save) {
    var chapter = document.getElementById(id);
    var body = document.getElementById('dock-body');
    if (!chapter || !body) {
        return;
    }
    body.scrollTop += chapter.getBoundingClientRect().top - body.getBoundingClientRect().top;
    if (save) {
        try {
            localStorage.setItem(panel.chapterStorageKey, id);
        } catch (e) {
            // Not remembered; no harm.
        }
    }
};

/**
 * When a step's Show is pressed: it shows what the step is about.
 * @param {!Element} chip The chip, whose data says what: data-view,
 *     then data-outline (a region of the 2D panel), or data-camera (a
 *     view in 3D) and data-show (a Show preset: one of the key parts,
 *     or the whole machine).
 * @return {!Promise} Settles once it is shown.
 */
panel.onShowChip = function(chip) {
    var data = chip.dataset;
    if (data.view == '2d') {
        panel.chooseView('2d');
        panel.outlinePanel(data.outline);
        panel.setStatus('tutorial-showing',
                        {part: l10n.getMessage('tut-region-' + data.outline)});
        return Promise.resolve();
    }
    if (!panel.has3d) {
        panel.setStatus('view3d-no-webgl', {}, 'warn');
        return Promise.resolve();
    }
    panel.chooseView('3d');
    return panel.whenStage3d().then(function(stage) {
        if (!stage) {
            return;
        }
        // The same two choices as the Views and Show menus make, so the
        // menus say what the chip did.
        stage.setView(data.camera);
        stage.setShow(data.show);
        if (data.show != 'all') {
            panel.setStatus('tutorial-showing', {part: l10n.getMessage('show-' + data.show)});
        }
    });
};

/**
 * Outlines a region of the 2D panel for a while.
 * @param {string} region One of panel.PANEL_REGIONS.
 */
panel.outlinePanel = function(region) {
    var svg = document.getElementById('panel');
    var old = document.getElementById('tutorial-outline');
    if (old) {
        old.remove();
    }
    var box = panel.PANEL_REGIONS[region];
    var rect = document.createElementNS(panel.SVG_NS, 'rect');
    rect.id = 'tutorial-outline';
    rect.setAttribute('x', box[0]);
    rect.setAttribute('y', box[1]);
    rect.setAttribute('width', box[2]);
    rect.setAttribute('height', box[3]);
    rect.setAttribute('rx', 10);
    rect.setAttribute('class', 'tutorial-outline');
    rect.setAttribute('pointer-events', 'none');
    svg.appendChild(rect);
    window.clearTimeout(panel.outlineTimer);
    panel.outlineTimer = window.setTimeout(function() {
        rect.remove();
    }, panel.OUTLINE_MS);
};
