/**
 * The Tutorial's chapters and its Show chips (docs/3d-view.md, V7):
 * every chip points at something that exists - a region of the 2D
 * panel, a view, parts of the model - and only shows it, never working
 * the machine.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {l10n} from '../js/l10n.js';
import {panel} from '../js/app.js';
import {CARD_IDS} from '../js/box.js';
import {SHOWS, VIEWS} from '../js/view3d/views.js';
import {readGlb} from './glb.js';
import {stub} from './stub.js';

const ROOT = path.join(import.meta.dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const NODES = new Set(readGlb(path.join(ROOT, 'model', 'altair-8800.glb')).nodes.map((n) => n.name));

/** Every Show chip in the page, as its data. */
function chips() {
    return [...HTML.matchAll(/<button class="show-chip" type="button" ([^>]*)><\/button>/g)]
        .map((m) => Object.fromEntries([...m[1].matchAll(/data-(\w+)="([^"]*)"/g)]
                                       .map((d) => [d[1], d[2]])));
}

test('the Tutorial is four lessons, Meet the Machine first, each with a title and a lead', () => {
    const ids = [...HTML.matchAll(/<section id="(chapter-\w+)" class="tutorial-chapter" role="tabpanel">/g)]
          .map((m) => m[1]);
    assert.deepStrictEqual(ids, ['chapter-meet', 'chapter-first', 'chapter-asm', 'chapter-basic']);
    assert.ok(HTML.includes('<div id="tutorial-lessons" class="lesson-bar" role="tablist"></div>'));
    for (const id of ids) {
        const lesson = HTML.slice(HTML.indexOf('<section id="' + id + '"'));
        const head = lesson.slice(0, lesson.indexOf('</header>'));
        assert.match(head, /class="lesson-kicker"/, id);
        assert.match(head, /<h3 id="[\w-]+" class="lesson-title l10n">/, id);
        assert.match(head, /<p id="[\w-]+" class="lesson-lead l10n">/, id);
    }
    // The lessons that were there keep their words' keys.
    for (const id of ['tutorial-title', 'tutorial-19', 'asm-tutorial-4', 'basic-note']) {
        assert.ok(HTML.includes('id="' + id + '"'), id);
    }
    // And a name that says what it is.
    assert.strictEqual(l10n.MESSAGES['tutorial-title'].en, 'Your First Program');
});

test('a lesson\'s steps are numbered right through it, as they refer to each other', () => {
    // "Repeat steps 4-5" is in Your First Program: its groups' lists
    // carry on one count, which only the lesson resets.
    const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
    assert.match(css, /\.tutorial-chapter \{\n    counter-reset: step;/);
    assert.doesNotMatch(css, /\.steps \{[^}]*counter-reset/);
    const first = HTML.slice(HTML.indexOf('<section id="chapter-first"'), HTML.indexOf('<section id="chapter-asm"'));
    const steps = [...first.matchAll(/<li(?: class="result")?><span id="tutorial-(\d+)"/g)].map((m) => +m[1]);
    assert.deepStrictEqual(steps, Array.from({length: 19}, (_, i) => i + 1));
    assert.ok((first.match(/class="step-group l10n"/g) || []).length >= 3, 'in named groups');
    assert.match(first, /<li class="result"><span id="tutorial-18"/, 'the answer is marked as what you should see');
});

test('every word the lessons show is in every language', () => {
    const tab = HTML.slice(HTML.indexOf('<div id="tab-ref"'), HTML.indexOf('<div id="tab-links"'));
    const ids = [...tab.matchAll(/id="([\w-]+)" class="[^"]*\bl10n\b/g)].map((m) => m[1]);
    assert.ok(ids.length > 50, ids.length);
    for (const id of ids.concat(['tutorial-lesson-of', 'tutorial-next', 'tutorial-contents-label', 'tutorial-show'])) {
        for (const locale of l10n.LOCALES) {
            assert.ok(l10n.MESSAGES[id] && l10n.MESSAGES[id][locale], id + ' in ' + locale);
        }
    }
    for (const locale of l10n.LOCALES) {
        assert.ok(l10n.MESSAGES['tutorial-lesson-of'][locale].includes('{n}') &&
                  l10n.MESSAGES['tutorial-lesson-of'][locale].includes('{total}'), locale);
        assert.ok(l10n.MESSAGES['tutorial-next'][locale].includes('{title}'), locale);
    }
});

test('Meet the Machine opens on a photo of the real thing, credited as its licence asks', () => {
    const src = HTML.match(/<img src="(images\/tutorial\/[\w.-]+\.jpg)\?v=[\d.]+" width="960" height="720" alt="" loading="lazy" draggable="false">/);
    assert.ok(src, 'the photo, versioned like every file the page names');
    const file = path.join(ROOT, src[1]);
    assert.ok(fs.statSync(file).size < 200 * 1024, 'small enough for a dock');
    const credits = fs.readFileSync(path.join(ROOT, 'images', 'tutorial', 'CREDITS.md'), 'utf8');
    const name = path.basename(file);
    const row = credits.split('\n').find((line) => line.includes('`' + name + '`'));
    assert.ok(row, name + ' is credited in images/tutorial/CREDITS.md');
    assert.match(row, /Tim Colegrove/);
    assert.match(row, /CC BY-SA 4\.0/);
    assert.match(row, /commons\.wikimedia\.org/);
    // On the page, too: the author, linked to the photo's page, and the
    // licence, linked.
    assert.match(HTML, /<a href="https:\/\/commons\.wikimedia\.org\/wiki\/File:Altair_8800_and_Model_33_ASR_Teletype\.jpg"[^>]*>Tim Colegrove<\/a>, <a href="https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\/"[^>]*>CC BY-SA 4\.0<\/a>/);
});

test('the Tutorial remembers the lesson and where each was read to, and reads 1.7\'s chapter', (t) => {
    const store = {};
    stub(t, global, {localStorage: {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
    }});
    assert.deepStrictEqual(panel.readTutorial(), {lesson: null, scroll: {}}, 'a first visit');
    store[panel.chapterStorageKey] = 'chapter-asm';
    assert.deepStrictEqual(panel.readTutorial(), {lesson: 'chapter-asm', scroll: {}}, '1.7\'s chapter');
    stub(t, panel, {tutorial: {lesson: 'chapter-first', scroll: {'chapter-first': 300, 'chapter-meet': 0}}});
    panel.saveTutorial();
    assert.deepStrictEqual(panel.readTutorial(), {lesson: 'chapter-first', scroll: {'chapter-first': 300, 'chapter-meet': 0}});
    store[panel.tutorialStorageKey] = '{not json';
    assert.deepStrictEqual(panel.readTutorial(), {lesson: null, scroll: {}}, 'nonsense is forgotten');
    store[panel.tutorialStorageKey] = '{"lesson": 3, "scroll": "far"}';
    assert.deepStrictEqual(panel.readTutorial(), {lesson: null, scroll: {}}, 'and so is the wrong shape');
});

test('every Show chip points at something that exists', () => {
    const all = chips();
    assert.ok(all.length >= 10, all.length);
    for (const chip of all) {
        assert.ok(['2d', '3d'].includes(chip.view), JSON.stringify(chip));
        if (chip.view == '2d') {
            assert.ok(panel.PANEL_REGIONS[chip.outline], chip.outline);
            assert.ok(l10n.MESSAGES['tut-region-' + chip.outline], chip.outline + ' has a name');
            continue;
        }
        assert.ok(VIEWS.some((v) => v.id == chip.camera), chip.camera);
        assert.ok(SHOWS.some((s) => s.id == chip.show), chip.show);
    }
    // Meet the Machine picks out each key part, from the menu's own Shows.
    const picked = all.filter((c) => c.show && c.show != 'all').map((c) => c.show);
    assert.deepStrictEqual(picked, SHOWS.filter((s) => s.parts.length).map((s) => s.id));
});

test('the key parts\' Shows pick out parts that are in the model', () => {
    for (const show of SHOWS) {
        for (const part of show.parts) {
            assert.ok(NODES.has(part), show.id + ': ' + part);
        }
    }
    const memory = SHOWS.find((s) => s.id == 'memory').parts;
    assert.deepStrictEqual(memory, CARD_IDS.filter((c) => /^mem/.test(c)).map((c) => 'card.' + c),
                           'every card the Memory menu can fit');
});

test('the outlines sit on the 2D panel\'s artwork, round its lamps and switches', () => {
    const inside = (box, x, y) => x >= box[0] && x <= box[0] + box[2] && y >= box[1] && y <= box[1] + box[3];
    const centre = (info, w, h) => [info.x + w / 2, info.y + h / 2];
    const lamp = (id) => centre(panel.LED_INFO.find((l) => l.id == id), 20, 20);
    const lever = (id) => centre(panel.TOGGLE_SWITCH_INFO.concat(panel.STATELESS_SWITCH_INFO)
                                 .find((s) => s.id == id), 20, 30);
    const R = panel.PANEL_REGIONS;
    for (const id of ['inte', 'int']) assert.ok(inside(R.status, ...lamp(id)), id);
    for (const id of ['d7', 'd0']) assert.ok(inside(R.data, ...lamp(id)), id);
    for (const id of ['wait', 'a15', 'a0']) assert.ok(inside(R.address, ...lamp(id)), id);
    for (const id of ['s15', 's0']) assert.ok(inside(R.switches, ...lever(id)), id);
    for (const id of ['off-on', 'stop-run', 'aux2']) assert.ok(inside(R.controls, ...lever(id)), id);
    for (const box of Object.values(R)) {
        assert.ok(box[0] >= 0 && box[1] >= 0 && box[0] + box[2] <= 1440 && box[1] + box[3] <= 644);
    }
});

test('a Show only shows: it never throws a switch or moves a part', () => {
    const source = panel.onShowChip.toString();
    assert.doesNotMatch(source, /operate|onToggle|takeOut|putBack|takeAllApart|onPower|ensurePoweredOn/);
});

test('a 2D Show outlines its region, and says what it is', (t) => {
    const said = [];
    const views = [];
    const outlined = [];
    stub(t, panel, {
        chooseView(view) { views.push(view); },
        outlinePanel(region) { outlined.push(region); },
        setStatus(id, params) { said.push([id, params]); },
    });
    panel.onShowChip({dataset: {view: '2d', outline: 'data'}});
    assert.deepStrictEqual(views, ['2d']);
    assert.deepStrictEqual(outlined, ['data']);
    assert.deepStrictEqual(said, [['tutorial-showing', {part: l10n.getMessage('tut-region-data')}]]);
});

test('a 3D Show chooses a view and a Show, as the menus do, and names what it picks out', async (t) => {
    const said = [];
    const chosen = [];
    const stage = {
        setView(id) { chosen.push(['view', id]); },
        setShow(id) { chosen.push(['show', id]); },
    };
    stub(t, panel, {
        has3d: true,
        view: '3d',
        chooseView() {},
        whenStage3d: () => Promise.resolve(stage),
        setStatus(id, params) { said.push([id, params]); },
    });
    await panel.onShowChip({dataset: {view: '3d', camera: 'whole', show: 'cpu'}});
    assert.deepStrictEqual(chosen, [['view', 'whole'], ['show', 'cpu']]);
    assert.deepStrictEqual(said, [['tutorial-showing', {part: l10n.getMessage('show-cpu')}]]);
    await panel.onShowChip({dataset: {view: '3d', camera: 'whole', show: 'all'}});
    assert.deepStrictEqual(chosen.slice(2), [['view', 'whole'], ['show', 'all']]);
    assert.strictEqual(said.length, 1, 'the whole machine needs no naming');
    panel.has3d = false;
    await panel.onShowChip({dataset: {view: '3d', camera: 'whole', show: 'cpu'}});
    assert.strictEqual(said.at(-1)[0], 'view3d-no-webgl', 'without WebGL 2 it says why');
});
