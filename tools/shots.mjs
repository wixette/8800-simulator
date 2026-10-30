/**
 * @fileoverview The release screenshots, `npm run shots`: the README's
 * pictures, and a set for posts - the machine running, in 3D from
 * several sides, taken apart, its key parts, BASIC on the Teletype, the
 * Assembler, the Tutorial, and the app on a phone - in one or more
 * languages.
 *
 *     npm run shots                         (English, into ~/Downloads/8800-simulator-v<version>-media/shots/en/)
 *     npm run shots -- --lang en,zh
 *     npm run shots -- --only 3d            (the shots whose name holds "3d")
 *     npm run shots -- --readme             (and the README's, into screenshots/)
 *
 * Headless Chrome with its GPU (tools/headless.mjs), 1600 x 900 at twice
 * the pixels, written as JPEGs. A stage shot is the panel or the 3D view
 * alone; a page shot is the whole app. Each shot opens the page afresh
 * and sets it up through the app, as a reader would leave it.
 */

import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {ROOT, mediaDir, openBrowser, sleep} from './headless.mjs';
import {HELPERS} from './page-helpers.mjs';

const QUALITY = 90;

/** The sizes a shot is taken at: a desktop window, and a phone. */
const SIZES = {
    desktop: {width: 1600, height: 900, scale: 2, mobile: false},
    phone: {width: 390, height: 844, scale: 3, mobile: true},
};


/**
 * A shot: its file name, its size, whether it is the stage alone, and
 * its setup, run in the page with HELPERS. A README shot is also written
 * to screenshots/, under its README name.
 * @typedef {{name: string, size?: string, stage?: boolean, setup: string,
 *     wait?: number, readme?: string}} Shot
 */

/** @type {!Array<Shot>} */
const SHOTS = [
    // The app as a whole: the machine in 3D, BASIC on the Teletype below.
    // The first picture: the front panel in 3D, large, and under it a
    // short Teletype with BASIC's welcome and a HELLO, WORLD.
    {name: 'app-3d-basic', readme: 'app', setup: `
        strip(false); dockHeight(345); await basic('', 'PRINT "HELLO, WORLD"\\n');
        await view3d('front'); dock(true); tab('tty');`},
    // The front panel in 2D, running; the Tutorial below.
    {name: 'app-2d-tutorial', readme: 'tutorial', setup: `
        await example('bouncing-light'); run(); tab('ref');`},
    // 3D, the stage alone.
    {name: '3d-front-running', stage: true, readme: 'front-panel', setup: `
        dock(false); await example('bouncing-light'); run(); await view3d('front');`},
    {name: '3d-whole-running', stage: true, setup: `
        dock(false); await example('kill-the-bit'); run(); await view3d('whole');`},
    {name: '3d-lamps-close', stage: true, setup: `
        dock(false); await example('bouncing-light'); run(); await view3d('front'); await cam(-28, 8, 0.42, 0.18, 0.06);`},
    {name: '3d-apart', stage: true, readme: '3d', setup: `
        dock(false); await view3d('apart');`},
    {name: '3d-apart-near', stage: true, setup: `
        dock(false); await view3d('apart'); await cam(-20, 10, 0.7);`},
    {name: '3d-case-faded', stage: true, setup: `
        dock(false); await example('bouncing-light'); run(); await view3d('whole'); await show('case-faded');`},
    {name: '3d-inside', stage: true, setup: `
        dock(false); await view3d('above'); await show('case-hidden');`},
    {name: '3d-rear', stage: true, setup: `
        dock(false); await view3d('rear');`},
    {name: '3d-cpu', stage: true, setup: `
        dock(false); await view3d('whole'); await show('cpu');`},
    {name: '3d-memory', stage: true, setup: `
        panel.onSetMemSize(8192); dock(false); await view3d('whole'); await show('memory');`},
    {name: '3d-psu', stage: true, setup: `
        dock(false); await view3d('rear'); await show('psu');`},
    // The tools.
    {name: 'teletype-basic', readme: 'teletype', setup: `
        strip(false); dockHeight(470); await basic(); tab('tty');`},
    {name: 'assembler', readme: 'assembler', setup: `
        strip(false); dockHeight(470); tab('asm'); await panel.fetchExamples(); asmtab.useExample('macros'); await sleep(500);
        asmtab.onAssemble(); await sleep(300); run(); await sleep(400); tab('asm');`},
    {name: 'debugger', readme: 'debugger', setup: `
        strip(false); dockHeight(470); await example('adder'); panel.operate('single', 'up'); panel.operate('single', 'up'); tab('debug');`},
    // On a phone.
    {name: 'phone-3d', size: 'phone', setup: `
        strip(false); await example('bouncing-light'); run(); await view3d('whole'); tab('ref');`},
    {name: 'phone-tutorial', size: 'phone', setup: `
        strip(false); tab('ref'); await sleep(300);
        const body = document.getElementById('dock-body');
        body.scrollTop += document.querySelector('.lesson-intro').getBoundingClientRect().top - body.getBoundingClientRect().top - 50;`},
];

const {values: opts} = parseArgs({options: {
    lang: {type: 'string', default: 'en'},
    out: {type: 'string', default: mediaDir('shots')},
    only: {type: 'string', default: ''},
    readme: {type: 'boolean', default: false},
}});
const shots = SHOTS.filter((s) => s.name.includes(opts.only));
const browser = await openBrowser();
const {send, evaluate, load, errors} = browser;

let failed = 0;
for (const lang of opts.lang.split(',')) {
    const dir = resolve(opts.out, lang);
    mkdirSync(dir, {recursive: true});
    for (const shot of shots) {
        await load(lang, SIZES[shot.size || 'desktop']);
        try {
            await evaluate(`(async () => { ${HELPERS} ${shot.setup} })()`);
        } catch (e) {
            errors.push(String(e));
        }
        await sleep(shot.wait ?? 1500);
        let clip;
        if (shot.stage) {
            // The stage alone: the dock and the switch strip out of its way.
            await evaluate('panel.setDockOpen(false); panel.setHelperShown(false, false)');
            await sleep(1200);
            const box = JSON.parse(await evaluate(`JSON.stringify((() => {
                const e = document.getElementById(panel.view == '3d' ? 'stage3d' : 'panel');
                const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height}; })())`));
            clip = {...box, scale: 1};
        }
        const image = await send('Page.captureScreenshot', {format: 'jpeg', quality: QUALITY, ...(clip && {clip})});
        const bytes = Buffer.from(image.result.data, 'base64');
        writeFileSync(join(dir, shot.name + '.jpg'), bytes);
        if (opts.readme && shot.readme && lang == 'en') {
            // The README's copy, 1600 pixels wide: sharp on GitHub, and light.
            const made = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-i', 'pipe:0',
                                              '-vf', 'scale=1600:-2', '-q:v', '3',
                                              join(ROOT, 'screenshots', shot.readme + '.jpg')], {input: bytes});
            if (made.status) {
                errors.push('ffmpeg: ' + made.stderr);
            }
        }
        if (errors.length) {
            failed++;
        }
        console.log(`${lang}/${shot.name}.jpg${errors.length ? '  ERROR ' + errors.join('; ') : ''}`);
    }
}
await browser.close();
process.exitCode = failed ? 1 : 0;
