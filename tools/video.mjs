/**
 * @fileoverview The release videos, `npm run video`: short clips of the
 * machine at work, in one or more languages. 1920 x 1080, H.264 in MP4,
 * silent (the simulator makes no sound but a switch's click).
 *
 *     npm run video                          (English, into ~/Downloads/8800-simulator-v<version>-media/videos/en/)
 *     npm run video -- --lang en,zh
 *     npm run video -- --only apart --fps 60
 *
 * Frame by frame, not in real time: before the page loads, its clock -
 * requestAnimationFrame, performance.now, Date.now, setTimeout and
 * setInterval - is replaced by one this tool moves on by exactly one
 * frame at a time, then takes the frame. Everything that moves runs on
 * that clock: the 3D view's camera and parts, a switch's throw, and the
 * 8080 itself, which runs as many cycles as its 2 MHz makes in a frame's
 * time. So the video is smooth, and the machine runs at its own speed in
 * it, however slowly the frames are taken. Needs ffmpeg.
 */

import {spawn} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {mediaDir, openBrowser, sleep} from './headless.mjs';
import {HELPERS} from './page-helpers.mjs';

/** A 1280 x 720 page at one and a half times: 1920 x 1080 frames, its words big enough to read. */
const SIZE = {width: 1280, height: 720, scale: 1.5, mobile: false};

/** Installed before the page's own scripts: a clock that runs in real time until started. */
const CLOCK = `(() => {
    const real = {now: performance.now.bind(performance), date: Date.now, frame: window.requestAnimationFrame.bind(window),
                  timeout: window.setTimeout.bind(window), clear: window.clearTimeout.bind(window),
                  interval: window.setInterval.bind(window), clearInterval: window.clearInterval.bind(window)};
    let manual = false, t = 0, dateAt = 0, nextId = 1e6, frames = [];
    const timers = new Map();
    performance.now = () => manual ? t : real.now();
    Date.now = () => manual ? Math.round(dateAt + t) : real.date();
    window.requestAnimationFrame = (cb) => {
        if (manual) { frames.push(cb); return ++nextId; }
        return real.frame((ts) => manual ? frames.push(cb) : cb(ts));
    };
    const later = (cb, ms, args, every) => {
        if (!manual) return (every ? real.interval : real.timeout)(cb, ms, ...args);
        const id = ++nextId;
        timers.set(id, {cb, at: t + Math.max(1, ms || 0), args, every: every ? Math.max(1, ms || 0) : 0});
        return id;
    };
    window.setTimeout = (cb, ms, ...args) => later(cb, ms, args, false);
    window.setInterval = (cb, ms, ...args) => later(cb, ms, args, true);
    window.clearTimeout = (id) => timers.has(id) ? timers.delete(id) : real.clear(id);
    window.clearInterval = (id) => timers.has(id) ? timers.delete(id) : real.clearInterval(id);
    window.__clock = {
        start() { t = real.now(); dateAt = real.date() - t; manual = true; },
        // Moves time on: every timer due by then, in order, then the frame.
        advance(ms) {
            const end = t + ms;
            for (let guard = 0; guard < 200000; guard++) {
                let first = null;
                for (const [id, timer] of timers) {
                    if (timer.at <= end && (!first || timer.at < first[1].at)) first = [id, timer];
                }
                if (!first) break;
                const [id, timer] = first;
                t = Math.max(t, timer.at);
                if (timer.every) timer.at += timer.every; else timers.delete(id);
                try { timer.cb(...timer.args); } catch (e) { console.error(e); }
            }
            t = end;
            const due = frames;
            frames = [];
            for (const cb of due) cb(t);
        },
    };
})();`;

/** Run in the page when recording starts: the camera's drift, and frame-by-frame time. */
const RECORDER = `(() => {
    const rec = {drift: [0, 0, 1], each: null, state: {}};
    // Turns the camera by degrees across (+: to the machine's right) and
    // up, and scales its distance.
    rec.orbit = (across, up, zoom) => {
        const v = panel.stage3d && panel.stage3d.viewer;
        if (!v || v.isFlying()) return;
        const c = v.camera, t = v.controls.target, o = c.position.clone().sub(t), r = o.length() * zoom;
        const theta = Math.atan2(o.x, o.z) + across * Math.PI / 180;
        const phi = Math.min(Math.max(Math.acos(o.y / o.length()) - up * Math.PI / 180, 0.1), 1.9);
        c.position.copy(t).add(o.set(Math.sin(phi) * Math.sin(theta), Math.cos(phi),
                                     Math.sin(phi) * Math.cos(theta)).multiplyScalar(r));
        c.lookAt(t);
        panel.stage3d.fitted = null;
        v.invalidate();
    };
    rec.frame = (dt) => {
        if (rec.each) rec.each(rec.state);
        const [a, u, z] = rec.drift;
        if (a || u || z != 1) rec.orbit(a * dt, u * dt, z ** dt);
        __clock.advance(dt * 1000);
    };
    // A program goes in without the dock opening on the Debugger, which
    // the video does not want.
    panel.showLoaded = () => {};
    window.__rec = rec;
    __clock.start();
})();`;

/**
 * What a scene's script can do, frame-exact. Page code runs between
 * frames, as a reader's presses would.
 * @typedef {object} Take
 * @property {function(string): !Promise<*>} run Runs page code now.
 * @property {function(number): !Promise} hold Records this long, in seconds.
 * @property {function(number=): !Promise} settle Records until the camera
 *     has landed and the box's parts are at rest.
 * @property {function(number, number=, number=): !Promise} drift Turns the
 *     camera on its own: degrees across and up, and a zoom, a second.
 * @property {function(string, number=): !Promise} view Flies to a view, and
 *     records the flight and a little after.
 * @property {function(string, number=): !Promise} type Types at the
 *     Teletype, a key at a time, this many seconds apart.
 * @property {function(number, number=): !Promise} toggle Sets the switches
 *     A7-A0 to a byte, one lever at a time.
 */

/** @typedef {{name: string, setup: string, script: function(!Take): !Promise}} Scene */

/** The program the Operator's Manual has you toggle in: its first bytes. */
const ADDER = [0x3a, 0x80, 0x00, 0x47, 0x3a, 0x81, 0x00];

/** @type {!Array<Scene>} */
const SCENES = [
    {
        // Switched on from the front, a program loaded and run, then the
        // camera round to the whole machine with its lamps going.
        name: '01-switch-on-and-run',
        setup: `strip(false); dock(false); await view3d('front');`,
        async script(t) {
            await t.drift(-1.2, 0.3);
            await t.hold(1.5);
            await t.run(`power(true)`);
            await t.hold(1.2);
            await t.run(`(async () => { await panel.fetchExamples(); panel.loadImage(panel.examplePrograms['bouncing-light'].bytes); })()`);
            await t.hold(0.8);
            await t.run(`run()`);
            await t.hold(3);
            await t.drift(0);
            await t.view('whole', 2.2);
            await t.drift(-5, 0, 0.995);
            await t.hold(6);
            await t.drift(0);
            await t.hold(0.6);
        },
    },
    {
        // Taken apart, every unit out in order; looked round; put back.
        name: '02-take-apart',
        setup: `strip(false); dock(false); await view3d('whole');
                const update = panel.box.update.bind(panel.box);
                panel.box.update = (dt) => update(dt * 2);`,
        async script(t) {
            await t.drift(2);
            await t.hold(1.2);
            await t.drift(0);
            await t.view('apart', 0.5);
            await t.settle(20);
            await t.drift(9, 0, 0.99);
            await t.hold(7);
            await t.drift(0);
            await t.hold(0.5);
            await t.view('front', 0.5);
            await t.settle(6);
            await t.hold(1.2);
        },
    },
    {
        // Its key parts, one after another, each lit in a faded machine.
        name: '03-key-parts',
        setup: `strip(false); dock(false); panel.onSetMemSize(8192); await view3d('whole');`,
        async script(t) {
            await t.drift(2.5);
            await t.hold(1.2);
            for (const part of ['cpu', 'memory', 'serial', 'bus']) {
                await t.run(`panel.stage3d.setShow('${part}')`);
                await t.hold(2.2);
            }
            await t.drift(0);
            await t.view('rear', 1.6);
            await t.run(`panel.stage3d.setShow('psu')`);
            await t.drift(-2.5);
            await t.hold(2.4);
            await t.run(`panel.stage3d.setShow('all')`);
            await t.drift(0);
            await t.view('whole', 2.2);
        },
    },
    {
        // A program toggled in by hand, as in 1975: a byte on the switches,
        // DEPOSIT, the next byte, DEPOSIT NEXT - close up on the panel.
        name: '04-toggle-in-by-hand',
        setup: `strip(false); dock(false); await view3d('front'); await cam(0, -4, 0.8, 0.03, -0.02);`,
        async script(t) {
            await t.hold(1);
            await t.run(`power(true)`);
            await t.hold(1);
            for (let i = 0; i < ADDER.length; i++) {
                await t.toggle(ADDER[i]);
                await t.hold(0.3);
                await t.run(`panel.operate('deposit', '${i ? 'down' : 'up'}')`);
                await t.hold(0.9);
            }
            await t.toggle(0);
            await t.run(`panel.operate('examine', 'up')`);
            await t.hold(1.5);
        },
    },
    {
        // Microsoft 4K BASIC on the Teletype: a program typed in and run.
        name: '05-basic-on-the-teletype',
        setup: `strip(false); dockHeight(400); await basic('');`,
        async script(t) {
            await t.hold(1);
            await t.type('10 FOR X=0 TO 6.3 STEP .45\n20 PRINT TAB(18+16*SIN(X));"*"\n30 NEXT X\n', 0.07);
            await t.hold(0.6);
            await t.type('RUN\n', 0.12);
            await t.hold(5);
        },
    },
];

const {values: opts} = parseArgs({options: {
    lang: {type: 'string', default: 'en'},
    out: {type: 'string', default: mediaDir('videos')},
    only: {type: 'string', default: ''},
    fps: {type: 'string', default: '30'},
}});
const FPS = Number(opts.fps);
const scenes = SCENES.filter((s) => s.name.includes(opts.only));
const work = mkdtempSync(join(tmpdir(), '8800-video-'));
const browser = await openBrowser();
const {send, evaluate, load, errors} = browser;
await send('Page.addScriptToEvaluateOnNewDocument', {source: CLOCK});

let failed = 0;
for (const lang of opts.lang.split(',')) {
    const dir = resolve(opts.out, lang);
    mkdirSync(dir, {recursive: true});
    for (const scene of scenes) {
        await load(lang, SIZE);
        await evaluate(`(async () => { ${HELPERS} window.__h = {power, run, cam, dock, strip, tab}; ${scene.setup} })()`);
        await sleep(800);
        await evaluate(RECORDER);
        const out = join(dir, scene.name + '.mp4');
        const encoder = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe',
            '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow',
            '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], {stdio: ['pipe', 'ignore', 'inherit']});
        const encoded = new Promise((r) => encoder.on('exit', r));
        let frames = 0;
        const frame = async () => {
            await evaluate(`__rec.frame(${1 / FPS})`);
            const shot = await send('Page.captureScreenshot', {format: 'jpeg', quality: 95});
            if (!encoder.stdin.write(Buffer.from(shot.result.data, 'base64'))) {
                await new Promise((r) => encoder.stdin.once('drain', r));
            }
            frames++;
        };
        const hold = async (seconds) => {
            for (let i = Math.round(seconds * FPS); i > 0; i--) {
                await frame();
            }
        };
        const page = (js) => `(() => { const {power, run, cam, dock, strip, tab} = window.__h; return ${js}; })()`;
        /** @type {!Take} */
        const take = {
            run: (js) => evaluate(page(js)),
            hold,
            async settle(seconds = 10) {
                await frame();
                for (let i = seconds * FPS; i > 0 &&
                     await evaluate('panel.box.isBusy() || (panel.stage3d && panel.stage3d.viewer.isFlying())'); i--) {
                    await frame();
                }
            },
            drift: async (across, up = 0, zoom = 1) => void await evaluate(`__rec.drift = [${across}, ${up}, ${zoom}]`),
            async view(v, seconds = 1.5) {
                await evaluate(`panel.stage3d.setView(${JSON.stringify(v)})`);
                await hold(seconds);
            },
            async type(text, gap = 0.08) {
                for (const ch of text) {
                    await evaluate(`panel.ttySend(${ch == '\n' ? 13 : ch.charCodeAt(0)})`);
                    await hold(ch == '\n' ? gap * 4 : gap);
                }
            },
            async toggle(byte, gap = 0.12) {
                for (let i = 7; i >= 0; i--) {
                    const r = await evaluate(`panel.operate('s${i}', '${(byte >> i) & 1 ? 'up' : 'down'}')`);
                    if (r == 'done') {
                        await hold(gap);
                    }
                }
            },
        };
        await scene.script(take);
        encoder.stdin.end();
        await encoded;
        if (errors.length) {
            failed++;
        }
        console.log(`${lang}/${scene.name}.mp4  ${(frames / FPS).toFixed(1)} s${errors.length ? '  ERROR ' + errors.join('; ') : ''}`);
    }
}
await browser.close();
rmSync(work, {recursive: true, force: true});
process.exitCode = failed ? 1 : 0;
