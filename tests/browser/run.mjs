/**
 * The browser checks: the page itself, in a headless Chrome, for what
 * the unit tests cannot reach - clicks, menus, the editor, layout.
 *
 *     npm run test:browser              every check
 *     npm run test:browser -- sync pc   just these
 *
 * They take a minute or so and need Chrome (or set CHROME to its path),
 * so they are run by hand before a release rather than on every push;
 * `npm test` is what CI runs. Each check gets a fresh browser profile.
 */
import {findChrome, serve, start} from './harness.mjs';

const CHECKS = ['examples', 'pc', 'sync', 'clear', 'caret', 'editor', 'fonts'];

const chrome = findChrome();
if (!chrome) {
    console.error('Chrome was not found. Set CHROME to its path, e.g.\n' +
                  '  CHROME=/usr/bin/chromium npm run test:browser');
    process.exit(2);
}
const wanted = process.argv.slice(2);
const unknown = wanted.filter((name) => !CHECKS.includes(name));
if (unknown.length) {
    console.error('No such check: ' + unknown.join(', ') +
                  '. The checks are: ' + CHECKS.join(', '));
    process.exit(2);
}
const server = await serve();
let passed = 0;
let failed = 0;
for (const name of wanted.length ? wanted : CHECKS) {
    console.log(name);
    const module = await import(`./${name}.mjs`);
    // A file's default check, then any other it exports, each in a
    // browser of its own.
    for (const [part, check] of Object.entries(module)) {
        if (part != 'default') {
            console.log(name + ' (' + part + ')');
        }
        await runCheck(check);
    }
}
server.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

/** Runs one check in a fresh browser, and counts what it found. */
async function runCheck(check) {
    const h = await start(chrome, server.url);
    try {
        await check(h);
    } catch (e) {
        h.verify('ran to the end', false, e.stack || String(e));
    } finally {
        h.stop();
    }
    if (h.errors.length) {
        h.verify('no errors in the page', false, JSON.stringify(h.errors));
    }
    passed += h.results.filter((r) => r.ok).length;
    failed += h.results.filter((r) => !r.ok).length;
}
