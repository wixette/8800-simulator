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
 * Opened off the disk, the page cannot run its modules, and shows only
 * a notice that says so; served, it never shows that (#19).
 */
export async function fileNotice(h) {
    const {js, send, viewport, fresh, verify, sleep} = h;
    const shown = () => js(`(() => { const n = document.getElementById('file-notice');
        return !!n && !n.hidden && getComputedStyle(n).display != 'none'; })()`);
    await viewport(1280, 860); await fresh();
    verify('served, there is no notice', (await shown()) === false);
    verify('and nothing is hidden for it', !(await js(`document.documentElement.classList.contains('needs-server')`)));
    verify('and the panel is built', (await js(`document.querySelectorAll('#panel .led, #panel image').length`)) > 40,
           await js(`document.querySelectorAll('#panel .led, #panel image').length`));
    await send('Page.navigate', {url: pathToFileURL(ROOT + '/index.html').href}); await sleep(1200);
    verify('opened as a file, the notice says why nothing works', await shown());
    verify('and gives the command', /python3 -m http\.server 8000/.test(await js(`document.getElementById('file-notice').textContent`)));
    const visible = await js(`[...document.body.querySelectorAll('*')]
        .filter((e) => e.getClientRects().length && !e.closest('#file-notice'))
        .map((e) => e.id || e.tagName)`);
    verify('and is all the page shows: no panel that does nothing', visible.length === 0, visible.slice(0, 8).join(' '));
    verify('with nothing to scroll', await js(`document.documentElement.scrollHeight <= innerHeight &&
        document.documentElement.scrollWidth <= innerWidth`));
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

/**
 * The logo: the machine and its name on a wide screen, the machine
 * alone on a phone, none where a phone has no room, and the toolbar
 * one row at every width (v1.7.0). The icons the page offers exist.
 */
export async function logo(h) {
    const {js, viewport, fresh, verify, sleep} = h;
    const seen = () => js(`(() => { const l = document.getElementById('header-logo'),
        t = document.getElementById('toolbar'), r = l.getBoundingClientRect();
        // On one row, every item overlaps every other from top to bottom.
        // (Not the spacer between the two groups, which has no height.)
        const boxes = [...t.children].filter((e) => e.getClientRects().length)
            .map((e) => e.getBoundingClientRect()).filter((b) => b.height > 0);
        const oneRow = Math.max(...boxes.map((b) => b.top)) < Math.min(...boxes.map((b) => b.bottom));
        return {file: l.currentSrc.replace(/^.*\\//, '').replace(/\\?.*/, ''),
                shown: r.width > 0, height: Math.round(r.height), oneRow: oneRow}; })()`);
    for (const [width, file, shown] of [[1280, '8800-simulator-logo-text-white.svg', true],
                                        [760, '8800-simulator-logo-text-white.svg', true],
                                        [700, '8800-simulator-logo.svg', true],
                                        [375, '8800-simulator-logo.svg', true],
                                        [360, '8800-simulator-logo.svg', false]]) {
        await viewport(width, 860); await fresh();
        const bad = [];
        for (const locale of ['en', 'de', 'fr', 'ja', 'pt-BR']) {
            await js(`l10n.setLocale('${locale}')`); await sleep(120);
            const m = await seen();
            if (m.file != file || m.shown != shown || (shown && m.height < 20)) bad.push(locale + ' ' + JSON.stringify(m));
            if (!m.oneRow) bad.push(locale + ' wraps onto two rows');
        }
        verify(width + 'px: ' + (shown ? file : 'no logo') + ', toolbar on one row', bad.length == 0, bad.join('; '));
    }
    verify('the alt text is the translated title', (await js(`document.getElementById('header-logo').alt`)) == (await js(`l10n.getMessage('header-title')`)));
    const icons = await js(`Promise.all([...document.querySelectorAll('link[rel=icon], link[rel=apple-touch-icon], link[rel=manifest]')]
        .map((l) => fetch(l.href).then((r) => l.getAttribute('rel') + ' ' + r.status + ' ' + r.headers.get('content-type'))))`);
    verify('every icon and the manifest are there', icons.length == 4 && icons.every((s) => / 200 /.test(s)), icons.join(', '));
    const manifest = await js(`fetch('manifest.webmanifest').then((r) => r.json())`);
    const sizes = await js(`Promise.all(${JSON.stringify((manifest && manifest.icons) || [])}.map((i) =>
        new Promise((done) => { const img = new Image(); img.onload = () => done(i.sizes == img.naturalWidth + 'x' + img.naturalHeight);
            img.onerror = () => done(false); img.src = i.src; })))`);
    verify("the manifest's icons are the sizes it says", sizes && sizes.length == 2 && sizes.every(Boolean), JSON.stringify(sizes));
}
