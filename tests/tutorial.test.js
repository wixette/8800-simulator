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

test('the Tutorial has four chapters, Meet the Machine first', () => {
    const ids = [...HTML.matchAll(/<section id="(chapter-\w+)" class="tutorial-chapter">/g)]
          .map((m) => m[1]);
    assert.deepStrictEqual(ids, ['chapter-meet', 'chapter-first', 'chapter-asm', 'chapter-basic']);
    assert.ok(HTML.includes('<nav id="tutorial-contents" class="tutorial-contents"></nav>'));
    // The three chapters that were already there keep their words.
    for (const id of ['tutorial-title', 'tutorial-19', 'asm-tutorial-4', 'basic-note']) {
        assert.ok(HTML.includes('id="' + id + '"'), id);
    }
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
