/**
 * @fileoverview The simulator in a headless Chrome with its GPU, for
 * `npm run shots` and `npm run video`: the repository served on a free
 * port (the browser checks' own server, tests/browser/harness.mjs), the
 * page driven over the DevTools protocol, and the page's modules within
 * reach of a script as window.panel, window.asmtab and window.l10n.
 * Chrome is found where the checks find it, or set CHROME.
 */

import {spawn} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import {ROOT, findChrome, serve} from '../tests/browser/harness.mjs';

export {ROOT};

/** @param {number} ms */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Where release media go unless told otherwise: outside the repository,
 * in ~/Downloads/8800-simulator-v<version>-media/<kind>.
 * @param {string} kind 'shots' or 'videos'.
 * @return {string}
 */
export function mediaDir(kind) {
    const {version} = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    return join(homedir(), 'Downloads', `8800-simulator-v${version}-media`, kind);
}

/** Puts the page's modules where a script can reach them. */
const HANDLES = `(async () => {
    const [p, a, l] = await Promise.all(['panel', 'asmtab', 'l10n'].map((n) => import('./js/' + n + '.js')));
    Object.assign(window, {panel: p.panel, asmtab: a.asmtab, l10n: l.l10n});
})()`;

/**
 * @typedef {object} Browser
 * @property {function(string, Object=): !Promise<*>} send A DevTools call.
 * @property {function(string): !Promise<*>} evaluate Runs JavaScript in
 *     the page, awaiting a promise; throws what the page threw.
 * @property {function(string, {width: number, height: number, scale: number, mobile: boolean}): !Promise}
 *     load Opens the simulator afresh - nothing remembered - in a
 *     language, at a size, and waits for it.
 * @property {!Array<string>} errors What the page threw since it loaded.
 * @property {function(): !Promise} close
 */

/**
 * Serves the repository and opens Chrome on it.
 * @return {!Promise<!Browser>}
 */
export async function openBrowser() {
    const chromePath = findChrome();
    if (!chromePath) {
        throw new Error('Chrome was not found: set CHROME to its path');
    }
    const server = await serve();
    const profile = mkdtempSync(join(tmpdir(), '8800-media-'));
    const port = 9400 + Math.floor(Math.random() * 500);
    const chrome = spawn(chromePath, [
        '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
        '--no-first-run', '--no-default-browser-check', '--enable-gpu', '--hide-scrollbars',
        '--window-size=1920,1080', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
        ...(process.platform == 'darwin' ? ['--use-angle=metal'] : []), 'about:blank',
    ], {stdio: 'ignore'});
    let target = null;
    for (let i = 0; i < 75 && !target; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
            target = list.find((t) => t.type == 'page');
        } catch (e) {
            await sleep(200);
        }
    }
    if (!target) {
        chrome.kill('SIGKILL');
        throw new Error('Chrome did not start: ' + chromePath);
    }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r));
    let id = 0;
    const replies = new Map();
    const errors = [];
    ws.addEventListener('message', (event) => {
        const msg = JSON.parse(String(event.data));
        if (msg.id && replies.has(msg.id)) {
            replies.get(msg.id)(msg);
            replies.delete(msg.id);
        } else if (msg.method == 'Runtime.exceptionThrown') {
            errors.push(msg.params.exceptionDetails.exception?.description ||
                        msg.params.exceptionDetails.text);
        }
    });
    const send = (method, params = {}) => new Promise((r) => {
        replies.set(++id, r);
        ws.send(JSON.stringify({id, method, params}));
    });
    const evaluate = async (expression) => {
        const r = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
        if (r.result?.exceptionDetails) {
            throw new Error(r.result.exceptionDetails.exception?.description ||
                            r.result.exceptionDetails.text);
        }
        return r.result?.result?.value;
    };
    await send('Runtime.enable');
    await send('Page.enable');
    const load = async (lang, {width, height, scale = 1, mobile = false}) => {
        await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: scale, mobile});
        await send('Page.navigate', {url: server.url});
        await sleep(800);
        await evaluate('localStorage.clear()');
        await send('Page.navigate', {url: server.url});
        await sleep(1500);
        await evaluate(HANDLES);
        await evaluate(`l10n.setLocale(${JSON.stringify(lang)})`);
        await sleep(300);
        errors.length = 0;
    };
    const close = async () => {
        ws.close();
        chrome.kill('SIGKILL');
        server.close();
        await sleep(300);
        rmSync(profile, {recursive: true, force: true});
    };
    return {send, evaluate, load, errors, close};
}
