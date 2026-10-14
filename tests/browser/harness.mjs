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
    '.pdf': 'application/pdf', '.woff2': 'font/woff2',
};

/**
 * Serves the repository, as python3 -m http.server would, on a free port.
 * @return {!Promise<{url: string, close: function()}>}
 */
export function serve() {
    const server = createServer((request, response) => {
        let path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
        if (path.endsWith('/')) {
            path += 'index.html';
        }
        const file = normalize(join(ROOT, path));
        if (!file.startsWith(ROOT + sep) || !existsSync(file) ||
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

/**
 * Starts Chrome on a fresh profile, with the page's address, and gives
 * back what a check needs to drive it.
 * @param {string} chromePath
 * @param {string} url The page.
 */
export async function start(chromePath, url) {
    const profile = mkdtempSync(join(tmpdir(), '8800-browser-'));
    const port = 9300 + Math.floor(Math.random() * 500);
    const chrome = spawn(chromePath, ['--headless=new',
        '--remote-debugging-port=' + port, '--user-data-dir=' + profile,
        '--no-first-run', '--no-default-browser-check', '--lang=en-US',
        '--window-size=1280,860', 'about:blank'], {stdio: 'ignore'});
    let target = null;
    for (let i = 0; i < 75 && !target; i++) {
        await sleep(200);
        try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
            target = list.find((t) => t.type == 'page');
        } catch (e) {
            // Not up yet.
        }
    }
    if (!target) {
        chrome.kill();
        throw new Error('Chrome did not start: ' + chromePath);
    }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r));
    let id = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
            pending.get(msg.id)(msg);
            pending.delete(msg.id);
        } else if (msg.method == 'Runtime.exceptionThrown') {
            errors.push(msg.params.exceptionDetails.exception?.description ||
                        msg.params.exceptionDetails.text);
        }
    });
    const send = (method, params = {}) => new Promise((resolveSend) => {
        const n = ++id;
        pending.set(n, resolveSend);
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
    const stop = () => {
        ws.close();
        chrome.kill();
        try {
            rmSync(profile, {recursive: true, force: true});
        } catch (e) {
            // Chrome may still hold it for a moment; it is in tmp.
        }
    };
    return {send, js, viewport, fresh, press, statusText, setSource, sleep,
            verify, results, errors, stop};
}
