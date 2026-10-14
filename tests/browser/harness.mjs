/**
 * A small harness for the browser checks: serves the repository, starts
 * a headless Chrome on a fresh profile, and drives the page through the
 * DevTools protocol the way a reader would - clicks, keys, typing.
 *
 * No dependencies: Node's own http server and WebSocket. Chrome is found
 * where it usually lives, or named with the CHROME environment variable.
 * See run.mjs.
 */
import {spawn, execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {existsSync, mkdtempSync, readFileSync, rmSync, statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {extname, join, normalize, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/plain',
    '.asm': 'text/plain', '.txt': 'text/plain', '.bin': 'application/octet-stream',
    '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg',
};

/**
 * Serves the repository, as python3 -m http.server would, on a free port,
 * and only to this machine. Not its hidden files, .git among them: the
 * page never asks for one.
 * @return {!Promise<{url: string, close: function()}>}
 */
export function serve() {
    const server = createServer((request, response) => {
        let path;
        try {
            path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
        } catch (e) {
            // A malformed address is the asker's mistake, not a crash.
            response.writeHead(400);
            response.end();
            return;
        }
        if (path.endsWith('/')) {
            path += 'index.html';
        }
        const file = normalize(join(ROOT, path));
        const hidden = file.slice(ROOT.length).split(sep)
              .some((part) => part.startsWith('.'));
        if (!file.startsWith(ROOT + sep) || hidden || !existsSync(file) ||
            !statSync(file).isFile()) {
            response.writeHead(404);
            response.end();
            return;
        }
        response.writeHead(200, {'Content-Type': TYPES[extname(file)] ||
                                                 'application/octet-stream'});
        response.end(readFileSync(file));
    });
    return new Promise((resolveServer) => {
        server.listen(0, '127.0.0.1', () => {
            resolveServer({url: `http://127.0.0.1:${server.address().port}/`,
                           close: () => server.close()});
        });
    });
}

/** Finds Chrome, or Chromium. @return {?string} */
export function findChrome() {
    if (process.env.CHROME) {
        return process.env.CHROME;
    }
    const paths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const path of paths) {
        if (existsSync(path)) {
            return path;
        }
    }
    for (const name of ['google-chrome', 'google-chrome-stable', 'chromium',
                        'chromium-browser']) {
        try {
            return execFileSync('which', [name], {encoding: 'utf8'}).trim();
        } catch (e) {
            // Not this one.
        }
    }
    return null;
}

/** The browsers running now, so that an interrupted run can end them. */
const LIVE = new Set();

/** How long a DevTools call may take before the check is failed. */
const ANSWER_MS = 20000;

/**
 * Ends every browser still running and removes its profile: for a run
 * that is interrupted (Ctrl-C), which would otherwise leave them.
 */
export function killAll() {
    for (const live of LIVE) {
        live.chrome.kill('SIGKILL');
        try {
            rmSync(live.profile, {recursive: true, force: true});
        } catch (e) {
            // In tmp; the system clears it in time.
        }
    }
    LIVE.clear();
}

/**
 * Starts Chrome on a fresh profile, with the page's address, and gives
 * back what a check needs to drive it.
 * @param {string} chromePath
 * @param {string} url The page.
 */
export async function start(chromePath, url) {
    if (!existsSync(chromePath)) {
        throw new Error('Chrome is not at ' + chromePath);
    }
    const profile = mkdtempSync(join(tmpdir(), '8800-browser-'));
    // Port 0: Chrome takes a free one and writes it in the profile, so
    // two runs at once can never find each other's browser.
    const chrome = spawn(chromePath, ['--headless=new',
        '--remote-debugging-port=0', '--user-data-dir=' + profile,
        '--no-first-run', '--no-default-browser-check', '--lang=en-US',
        '--window-size=1280,860', 'about:blank'], {stdio: 'ignore'});
    const live = {chrome, profile, exited: false};
    LIVE.add(live);
    let failed = null;
    chrome.on('error', (e) => { failed = e; });
    chrome.on('exit', () => { live.exited = true; });
    const quit = async (why) => {
        await stopChrome(live);
        throw new Error(why);
    };
    let port = null;
    for (let i = 0; i < 75 && !port && !failed && !live.exited; i++) {
        await sleep(200);
        try {
            port = Number(readFileSync(join(profile, 'DevToolsActivePort'),
                                       'utf8').split('\n')[0]) || null;
        } catch (e) {
            // Not written yet.
        }
    }
    if (!port) {
        await quit('Chrome did not start: ' + chromePath +
                   (failed ? ' (' + failed.message + ')' : ''));
    }
    let target = null;
    for (let i = 0; i < 50 && !target; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
            target = list.find((t) => t.type == 'page');
        } catch (e) {
            await sleep(100);
        }
    }
    if (!target) {
        await quit('Chrome started, but offered no page to drive');
    }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, reject) => {
        ws.addEventListener('open', r);
        ws.addEventListener('error', () => reject(new Error('no DevTools connection')));
    });
    let id = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
            pending.get(msg.id).resolve(msg);
            pending.delete(msg.id);
        } else if (msg.method == 'Runtime.exceptionThrown') {
            errors.push(msg.params.exceptionDetails.exception?.description ||
                        msg.params.exceptionDetails.text);
        }
    });
    // A browser that goes away fails what was waiting on it, rather
    // than leaving the run hung.
    ws.addEventListener('close', () => {
        for (const [n, call] of pending) {
            call.reject(new Error('the browser went away during ' + call.method));
        }
        pending.clear();
    });
    const send = (method, params = {}) => new Promise((resolveSend, reject) => {
        const n = ++id;
        const timer = setTimeout(() => {
            pending.delete(n);
            reject(new Error('the browser did not answer ' + method));
        }, ANSWER_MS);
        pending.set(n, {method,
                        resolve: (msg) => { clearTimeout(timer); resolveSend(msg); },
                        reject: (e) => { clearTimeout(timer); reject(e); }});
        ws.send(JSON.stringify({id: n, method, params}));
    });
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', {cacheDisabled: true});

    /** Evaluates an expression in the page, awaiting a promise. */
    const js = async (expr) => {
        const r = await send('Runtime.evaluate', {expression: expr,
            awaitPromise: true, returnByValue: true});
        if (r.result?.exceptionDetails) {
            errors.push('eval: ' + (r.result.exceptionDetails.exception?.description ||
                                    r.result.exceptionDetails.text));
            return undefined;
        }
        return r.result?.result?.value;
    };
    const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride',
        {width, height, deviceScaleFactor: 1, mobile: false});
    /** Opens the page as a first visit: nothing kept from before. */
    const fresh = async () => {
        await send('Page.navigate', {url}); await sleep(700);
        await js('localStorage.clear()');
        await send('Page.navigate', {url}); await sleep(1500);
    };
    /** Clicks the middle of an element, as the mouse would. */
    const press = async (selector) => {
        const r = await js(`(() => { const e = document.querySelector(${JSON.stringify(selector)});
            if (!e) return null; e.scrollIntoView({block: 'nearest'});
            const b = e.getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; })()`);
        if (!r) {
            errors.push('no element ' + selector);
            return;
        }
        for (const type of ['mousePressed', 'mouseReleased']) {
            await send('Input.dispatchMouseEvent', {type, x: r.x, y: r.y,
                                                    button: 'left', clickCount: 1});
        }
        await sleep(200);
    };
    const statusText = () => js(`document.getElementById('status-text').textContent`);
    /** Puts text in the Assembler's editor, as typing would. */
    const setSource = (text) => js(`(() => { const s = document.getElementById('asm-source');
        s.value = ${JSON.stringify(text)}; s.dispatchEvent(new Event('input')); })()`);
    const results = [];
    const verify = (name, ok, info = '') => {
        results.push({name, ok: !!ok});
        console.log('  ' + (ok ? 'PASS ' : 'FAIL ') + name +
                    (info !== '' && !ok ? '  | ' + info : ''));
    };
    const stop = async () => {
        ws.close();
        await stopChrome(live);
    };
    return {send, js, viewport, fresh, press, statusText, setSource, sleep,
            verify, results, errors, stop};
}

/**
 * Ends a browser and, once it has let go of its profile, removes it:
 * removed at once, Chrome writes into it again as it shuts down.
 */
async function stopChrome(live) {
    if (!live.exited) {
        live.chrome.kill();
        for (let i = 0; i < 50 && !live.exited; i++) {
            await sleep(100);
        }
        if (!live.exited) {
            live.chrome.kill('SIGKILL');
        }
    }
    try {
        rmSync(live.profile, {recursive: true, force: true, maxRetries: 5,
                              retryDelay: 100});
    } catch (e) {
        // In tmp; the system clears it in time.
    }
    LIVE.delete(live);
}
