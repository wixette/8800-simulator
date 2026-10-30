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
 * @fileoverview The Tutorial's lessons and what a step can show
 * (docs/ui-design.md, U11; docs/3d-view.md, V7): a bar of numbered
 * lessons, one shown at a time, remembered with how far down each was
 * read; and Show chips that point at what a step is about - a part of
 * the 2D panel, or parts of the machine in 3D. A chip changes only what
 * is shown: it never throws a switch or takes a part out; the reader
 * does that. Part of the panel namespace, which js/panel.js declares.
 */

import {l10n} from './l10n.js';
import {panel} from './panel.js';

/**
 * Where the Tutorial is remembered: the lesson open, and how far down
 * each lesson was read, as {lesson: id, scroll: {id: px}}.
 */
panel.tutorialStorageKey = 'sim8800tutorial';

/** Where 1.7 remembered the last chapter jumped to, read once. */
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

/** The Tutorial as remembered: the lesson open, and where each was read to. */
panel.tutorial = {lesson: null, scroll: {}};

/**
 * Builds the lesson bar and each lesson's way on to the next, and makes
 * the Show chips work; then opens the lesson last read.
 */
panel.initTutorial = function() {
    var bar = document.getElementById('tutorial-lessons');
    var lessons = panel.lessons();
    for (let i = 0; i < lessons.length; i++) {
        let lesson = lessons[i];
        let tab = document.createElement('button');
        tab.type = 'button';
        tab.id = 'lesson-tab-' + lesson.id;
        tab.className = 'lesson-tab';
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', lesson.id);
        tab.dataset.lesson = lesson.id;
        let number = document.createElement('span');
        number.className = 'lesson-num';
        number.textContent = String(i + 1);
        let name = document.createElement('span');
        name.className = 'lesson-name';
        tab.append(number, name);
        tab.addEventListener('click', function() {
            panel.showLesson(lesson.id, true);
        }, false);
        bar.appendChild(tab);
        lesson.setAttribute('aria-labelledby', tab.id);
        if (i + 1 < lessons.length) {
            let next = document.createElement('button');
            next.type = 'button';
            next.className = 'lesson-next';
            next.dataset.lesson = lessons[i + 1].id;
            next.addEventListener('click', function() {
                panel.showLesson(lessons[i + 1].id, true);
            }, false);
            lesson.appendChild(next);
        }
    }
    // The bar is one tab stop, and the arrows move along it, as tabs do.
    bar.addEventListener('keydown', function(event) {
        var tabs = Array.from(bar.querySelectorAll('.lesson-tab'));
        var at = tabs.indexOf(/** @type {!HTMLElement} */ (document.activeElement));
        var to = {ArrowLeft: at - 1, ArrowRight: at + 1, Home: 0, End: tabs.length - 1}[event.key];
        if (at < 0 || to === undefined) {
            return;
        }
        event.preventDefault();
        to = (to + tabs.length) % tabs.length;
        tabs[to].focus();
        panel.showLesson(tabs[to].dataset.lesson, true);
    }, false);
    var chips = document.querySelectorAll('.show-chip');
    for (let i = 0; i < chips.length; i++) {
        let chip = chips[i];
        chip.addEventListener('click', function() {
            panel.onShowChip(chip);
        }, false);
    }
    var body = document.getElementById('dock-body');
    if (body) {
        body.addEventListener('scroll', function() {
            panel.noteLessonScroll();
        }, {passive: true});
    }
    panel.tutorial = panel.readTutorial();
    var first = lessons.length ? lessons[0].id : null;
    var saved = panel.tutorial.lesson;
    panel.showLesson(saved && document.getElementById(saved) ? saved : first, false);
    panel.refreshTutorial();
};

/** @return {!Array<!HTMLElement>} The lessons, in order. */
panel.lessons = function() {
    return Array.from(document.querySelectorAll('.tutorial-chapter'));
};

/**
 * @return {{lesson: ?string, scroll: !Object<string, number>}} The
 *     Tutorial as last left, or as 1.7 left it, or nothing.
 */
panel.readTutorial = function() {
    try {
        var saved = JSON.parse(localStorage.getItem(panel.tutorialStorageKey) || 'null');
        if (saved && typeof saved == 'object') {
            return {lesson: typeof saved.lesson == 'string' ? saved.lesson : null,
                    scroll: saved.scroll && typeof saved.scroll == 'object' ? saved.scroll : {}};
        }
        return {lesson: localStorage.getItem(panel.chapterStorageKey), scroll: {}};
    } catch (e) {
        return {lesson: null, scroll: {}};
    }
};

/** Remembers the Tutorial: the lesson open, and where each was read to. */
panel.saveTutorial = function() {
    try {
        localStorage.setItem(panel.tutorialStorageKey, JSON.stringify(panel.tutorial));
    } catch (e) {
        // Not remembered; no harm.
    }
};

/**
 * Writes the lessons' names into the bar, their numbers over them, and
 * the chips' word, in the reader's language.
 */
panel.refreshTutorial = function() {
    var lessons = panel.lessons();
    var title = function(lesson) {
        var heading = lesson.querySelector('.lesson-title');
        return heading ? heading.textContent : '';
    };
    for (let i = 0; i < lessons.length; i++) {
        let lesson = lessons[i];
        let name = document.querySelector('#lesson-tab-' + lesson.id + ' .lesson-name');
        if (name) {
            name.textContent = title(lesson);
            name.parentElement.title = title(lesson);
        }
        let kicker = lesson.querySelector('.lesson-kicker');
        if (kicker) {
            kicker.textContent = l10n.getMessage('tutorial-lesson-of')
                .replace('{n}', String(i + 1)).replace('{total}', String(lessons.length));
        }
        let next = lesson.querySelector('.lesson-next');
        if (next) {
            next.textContent = l10n.getMessage('tutorial-next')
                .replace('{title}', title(lessons[i + 1])) + ' \u2192';
        }
    }
    var bar = document.getElementById('tutorial-lessons');
    if (bar) {
        bar.setAttribute('aria-label', l10n.getMessage('tutorial-contents-label'));
    }
    var photo = document.querySelector('.lesson-photo img');
    if (photo) {
        photo.alt = l10n.getMessage('tut-meet-photo');
    }
    var chips = document.querySelectorAll('.show-chip');
    for (let i = 0; i < chips.length; i++) {
        chips[i].innerHTML = panel.SHOW_EYE;
        let word = document.createElement('span');
        word.textContent = l10n.getMessage('tutorial-show');
        chips[i].appendChild(word);
    }
};

/**
 * The eye on a Show chip, Material's "visibility": look - it lights up
 * what the step is about, in the view above, rather than going anywhere.
 */
panel.SHOW_EYE = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';

/**
 * Opens a lesson: the others go out of sight, and the Tutorial goes
 * back to where this one was read to.
 * @param {?string} id The lesson's element.
 * @param {boolean} save Whether the reader chose it, to be remembered.
 */
panel.showLesson = function(id, save) {
    var lessons = panel.lessons();
    if (!id || !document.getElementById(id)) {
        return;
    }
    for (const lesson of lessons) {
        let shown = lesson.id == id;
        lesson.hidden = !shown;
        let tab = document.getElementById('lesson-tab-' + lesson.id);
        if (tab) {
            tab.setAttribute('aria-selected', shown ? 'true' : 'false');
            tab.tabIndex = shown ? 0 : -1;
            tab.classList.toggle('current', shown);
            if (shown) {
                tab.scrollIntoView({block: 'nearest', inline: 'nearest'});
            }
        }
    }
    panel.tutorial.lesson = id;
    if (save) {
        panel.saveTutorial();
    }
    panel.restoreLessonScroll();
};

/**
 * Puts the Tutorial back where its open lesson was read to - when it
 * opens, and when the dock comes back to it.
 */
panel.restoreLessonScroll = function() {
    var body = document.getElementById('dock-body');
    var pane = document.getElementById('tab-ref');
    if (!body || !pane || pane.hidden) {
        return;
    }
    panel.restoringScroll = true;
    body.scrollTop = panel.tutorial.scroll[panel.tutorial.lesson] || 0;
    panel.restoringScroll = false;
};

/** The reader scrolled: remember how far down the open lesson is read. */
panel.noteLessonScroll = function() {
    var body = document.getElementById('dock-body');
    var pane = document.getElementById('tab-ref');
    if (panel.restoringScroll || !body || !pane || pane.hidden || !panel.tutorial.lesson) {
        return;
    }
    panel.tutorial.scroll[panel.tutorial.lesson] = Math.round(body.scrollTop);
    window.clearTimeout(panel.tutorialSaveTimer);
    panel.tutorialSaveTimer = window.setTimeout(panel.saveTutorial, 300);
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
