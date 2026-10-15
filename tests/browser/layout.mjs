/**
 * Layout from the release review: the dock's fold button stays in reach
 * at every width and language, and a dialog taller than the window
 * scrolls its body, keeping its title and close button in reach.
 */
import {pathToFileURL} from 'node:url';
import {ROOT} from './harness.mjs';

export default async function(h) {
    const {js, viewport, fresh, press, verify, sleep} = h;
    await viewport(1280, 860); await fresh();
    const bad = [];
    for (const locale of ['en', 'fr', 'de', 'it', 'es', 'pt-BR', 'ja']) {
        await js(`l10n.setLocale('${locale}')`); await sleep(150);
        for (const width of [320, 390, 700, 701, 705, 710, 715, 760, 820, 1000, 1280]) {
            await viewport(width, 860); await sleep(120);
            const r = await js(`(() => { const t = document.getElementById('dock-toggle').getBoundingClientRect();
                return {right: t.right, left: t.left, page: document.documentElement.scrollWidth}; })()`);
            if (r.right > width + 0.5 || r.page > width) bad.push(locale + '@' + width + ':' + JSON.stringify(r));
        }
    }
    verify('the fold button is whole, and the page does not widen, at every width and language', bad.length === 0, bad.join(' '));
    await js(`l10n.setLocale('en')`); await sleep(150);
    await viewport(760, 860); await sleep(200);
    const fits = await js(`(() => { const r = document.getElementById('dock-tabs'); return r.scrollWidth <= r.clientWidth; })()`);
    verify('at 760 px in English the five tabs fit without scrolling', fits);
    // About, in German, on a small phone.
    await js(`l10n.setLocale('de')`); await viewport(320, 640); await sleep(200);
    await press('#about-button'); await sleep(400);
    const d = await js(`(() => { const dlg = document.getElementById('about-dialog'), body = dlg.querySelector('.dialog-body'), head = dlg.querySelector('.dialog-head').getBoundingClientRect();
        return {open: dlg.open, dialogBottom: dlg.getBoundingClientRect().bottom, headTop: head.top, scrolls: body.scrollHeight > body.clientHeight, innerHeight}; })()`);
    verify('a dialog taller than the window fits in it, its title in view', d.open && d.dialogBottom <= d.innerHeight && d.headTop >= 0, JSON.stringify(d));
    verify('and its body scrolls', d.scrolls, JSON.stringify(d));
    await js(`(() => { const b = document.querySelector('#about-dialog .dialog-body'); b.scrollTop = b.scrollHeight; })()`); await sleep(100);
    const end = await js(`(() => { const b = document.querySelector('#about-dialog .dialog-body'); return b.scrollTop > 0; })()`);
    verify('down to its end', end);
    await js(`l10n.setLocale('en')`);
}

/**
 * Opened off the disk, the page cannot run its modules, and says so;
 * served, it never shows that (#19).
 */
export async function fileNotice(h) {
    const {js, send, viewport, fresh, verify, sleep} = h;
    const shown = () => js(`(() => { const n = document.getElementById('file-notice');
        return !!n && !n.hidden && getComputedStyle(n).display != 'none'; })()`);
    await viewport(1280, 860); await fresh();
    verify('served, there is no notice', (await shown()) === false);
    verify('and the panel is built', (await js(`document.querySelectorAll('#panel .led, #panel image').length`)) > 40,
           await js(`document.querySelectorAll('#panel .led, #panel image').length`));
    await send('Page.navigate', {url: pathToFileURL(ROOT + '/index.html').href}); await sleep(1200);
    verify('opened as a file, the notice says why nothing works', await shown());
    verify('and gives the command', /python3 -m http\.server 8000/.test(await js(`document.getElementById('file-notice').textContent`)));
}

/**
 * Every file the page loads carries the version, modules included, and
 * no module is loaded twice under two names (#19). The files it
 * fetches itself have none, and are checked with the server instead.
 */
export async function versioned(h) {
    const {js, viewport, fresh, press, verify, sleep} = h;
    await viewport(1280, 860); await fresh();
    await press('#load-button'); await sleep(800);
    await js(`panel.sim`);
    const version = await js(`fetch('package.json').then((r) => r.json()).then((p) => p.version)`);
    const files = await js(`performance.getEntriesByType('resource')
        .map((e) => new URL(e.name)).filter((u) => u.origin == location.origin)
        .map((u) => u.pathname.slice(1) + u.search)`);
    const fetched = (f) => /^(package\.json|examples\/|roms\/)/.test(f);
    const unversioned = files.filter((f) => !fetched(f) && !f.endsWith('?v=' + version));
    verify('every file is asked for with ?v=' + version, unversioned.length == 0, unversioned.join(' '));
    const modules = files.filter((f) => f.startsWith('js/'));
    const mapped = await js(`Object.keys(JSON.parse(document.querySelector(
        'script[type=importmap]').textContent).imports).length`);
    verify('every module in the import map is loaded', modules.length == mapped,
           modules.length + ' of ' + mapped);
    const names = modules.map((f) => f.replace(/\?.*/, ''));
    verify('each once, by one name', new Set(names).size == names.length, names.join(' '));
    verify('and the examples are fetched too, without a version',
           files.some((f) => /^examples\/[\w-]+\.asm$/.test(f)), files.filter(fetched).join(' '));
}
