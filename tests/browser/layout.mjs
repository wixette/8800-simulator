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
    // The 3D view's modules and three.js wait until the view is first
    // opened (docs/3d-view.md, M5); every other module comes with the page.
    const lazy = (f) => /^(\.\/)?(js\/view3d\/|vendor\/three\/)|^three(\/|$)/.test(f);
    const modules = files.filter((f) => f.startsWith('js/') || f.startsWith('vendor/'));
    const mapped = await js(`Object.keys(JSON.parse(document.querySelector(
        'script[type=importmap]').textContent).imports)`);
    const eager = mapped.filter((f) => !lazy(f));
    verify('every module in the import map that the page needs at once is loaded',
           modules.length == eager.length, modules.length + ' of ' + eager.length);
    verify('and none of the 3D view\'s, nor three.js, until it is opened',
           !modules.some(lazy), modules.filter(lazy).join(' '));
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
    const {js, send, viewport, fresh, verify, sleep} = h;
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
                                        // The narrowest the name is shown at, the longest languages.
                                        [701, '8800-simulator-logo-text-white.svg', true],
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
    // A picture, not text to select or an image to drag: selecting all
    // of the page leaves it as it was, with no highlight over it.
    await viewport(1280, 860); await fresh();
    verify('the logo cannot be dragged', await js(`document.getElementById('header-logo').draggable === false &&
        getComputedStyle(document.getElementById('header-logo')).userSelect == 'none'`));
    const clip = await js(`(() => { const r = document.getElementById('header-logo').getBoundingClientRect();
        return {x: r.x, y: r.y, width: r.width, height: r.height, scale: 1}; })()`);
    const pixels = async () => (await send('Page.captureScreenshot', {format: 'png', clip})).result.data;
    const before = await pixels();
    await js(`getSelection().selectAllChildren(document.body)`); await sleep(150);
    const selected = await pixels();
    await js(`getSelection().removeAllRanges()`);
    verify('selecting all of the page does not highlight the logo', before === selected);
    const icons = await js(`Promise.all([...document.querySelectorAll('link[rel=icon], link[rel=apple-touch-icon], link[rel=manifest]')]
        .map((l) => fetch(l.href).then((r) => l.getAttribute('rel') + ' ' + r.status + ' ' + r.headers.get('content-type'))))`);
    verify('every icon and the manifest are there', icons.length == 4 && icons.every((s) => / 200 /.test(s)), icons.join(', '));
    const manifest = await js(`fetch('manifest.webmanifest').then((r) => r.json())`);
    const sizes = await js(`Promise.all(${JSON.stringify((manifest && manifest.icons) || [])}.map((i) =>
        new Promise((done) => { const img = new Image(); img.onload = () => done(i.sizes == img.naturalWidth + 'x' + img.naturalHeight);
            img.onerror = () => done(false); img.src = i.src; })))`);
    verify("the manifest's icons are the sizes it says", sizes && sizes.length == 2 && sizes.every(Boolean), JSON.stringify(sizes));
}

/**
 * About: headed by the logo, its licences one line each on a wide
 * screen, and no taller than before the logo was added (v1.7.0), but
 * for the two licence lines the 3D view brought and the Tutorial's
 * photo's (v1.8.0), at about 21px each.
 */
export async function about(h) {
    const {js, viewport, fresh, press, verify, sleep} = h;
    await viewport(1280, 860); await fresh();
    for (const [locale, before] of [['en', 614], ['de', 635]]) {
        await js(`l10n.setLocale('${locale}')`); await sleep(150);
        await press('#about-button'); await sleep(500);
        const m = await js(`(() => { const d = document.getElementById('about-dialog'), l = document.getElementById('about-logo');
            const rows = [...d.querySelectorAll('.about-licences dd')].map((e) => Math.round(e.getBoundingClientRect().height));
            const r = l.getBoundingClientRect(), body = d.querySelector('.dialog-body').getBoundingClientRect();
            return {height: Math.round(d.getBoundingClientRect().height), logo: l.complete && l.naturalWidth > 0,
                    centred: Math.abs((r.left + r.right) / 2 - (body.left + body.right) / 2) < 2,
                    alt: l.alt, rows: rows, title: document.getElementById('about-title').textContent}; })()`);
        verify(locale + ': the logo heads About, centred', m.logo && m.centred, JSON.stringify(m));
        verify(locale + ': its alt text is the translated name', m.alt == await js(`l10n.getMessage('header-title')`), m.alt);
        verify(locale + ': the title band says About', m.title == await js(`l10n.getMessage('about-button')`), m.title);
        verify(locale + ': each licence on one line', m.rows.length == 7 && m.rows.every((r) => r == m.rows[0]), m.rows.join(' '));
        verify(locale + ': no taller than the ' + before + 'px it was', m.height <= before, m.height);
        await press('#about-ok'); await sleep(300);
    }
    verify('the logo in About cannot be selected or dragged', await js(`(() => { const l = document.getElementById('about-logo');
        return l.draggable === false && getComputedStyle(l).userSelect == 'none'; })()`));
}

/**
 * Controls are pressed, not read: no button, tab, menu item, switch or
 * choice has words to select, and no picture can be dragged off. What
 * they act on - the editor, the paper, the dumps, the dialogs' text
 * and the link field - can still be selected (v1.7.0).
 */
export async function controls(h) {
    const {js, viewport, fresh, press, verify, sleep} = h;
    await viewport(1280, 860); await fresh();
    await js(`panel.onPowerOn()`); await sleep(200);
    // The menus build their items as they open.
    for (const b of ['#load-button', '#memory-button', '#switch-locale']) {
        await press(b); await sleep(400); await press(b); await sleep(200);
    }
    const selectable = await js(`[...document.querySelectorAll('button, [role=button], [role=tab], [role=option], ' +
        '.button, .dropdown li, label, #panel *')]
        .filter((e) => getComputedStyle(e).userSelect != 'none')
        .map((e) => e.id || e.className.baseVal || e.className || e.tagName)`);
    verify('no control has words to select', selectable.length === 0, selectable.slice(0, 8).join(' '));
    const draggable = await js(`[...document.querySelectorAll('img, [draggable=true]')].filter((e) => e.draggable).map((e) => e.id || e.src)`);
    verify('no picture can be dragged off', draggable.length === 0, draggable.join(' '));
    const content = await js(`['asm-source', 'tty-paper', 'mem-dump', 'cpu-dump', 'share-link', 'debug-data-input',
        'status-text', 'about-desc', 'tutorial-desc'].filter((id) => getComputedStyle(document.getElementById(id)).userSelect == 'none')`);
    verify('what they act on can still be selected', content.length === 0, content.join(' '));
    // Share, where it was seen: selecting all of the dialog takes its
    // words, but not its choices' or its button's.
    await press('#share-button'); await sleep(500);
    const selected = await js(`(() => { getSelection().selectAllChildren(document.getElementById('share-dialog'));
        const text = getSelection().toString(); getSelection().removeAllRanges(); return text; })()`);
    verify('in Share, selecting everything takes the question, not the choices or the button',
           /What should the link open/.test(selected) && !/The program, at RESET|Copy Link/.test(selected), selected);
}

/**
 * A switch throws only the ways the panel prints a function for:
 * SINGLE STEP and the two AUX switches only up, wherever the lever is
 * pressed; EXAMINE, with a function each way, down from its lower half.
 */
export async function switches(h) {
    const {js, send, viewport, fresh, verify, sleep, statusText} = h;
    await viewport(1280, 860); await fresh();
    await js(`panel.onPowerOn()`); await sleep(200);
    /** Presses a lever's upper or lower half; which ways did it show? */
    const throwOf = async (id, half) => {
        const at = await js(`(() => { const info = panel.STATELESS_SWITCH_INFO.find((s) => s.id == '${id}');
            const svg = document.getElementById('panel'), p = svg.createSVGPoint();
            p.x = info.x + 10; p.y = info.y + ('${half}' == 'lower' ? 30 : 0);
            const q = p.matrixTransform(svg.getScreenCTM());
            window.thrown = new Set();
            const look = () => ['up', 'down'].forEach((way) => {
                if (document.getElementById('${id}-' + way).style.display == 'inline') window.thrown.add(way); });
            window.watching = setInterval(look, 20);
            return {x: q.x, y: q.y}; })()`);
        for (const type of ['mousePressed', 'mouseReleased']) {
            await send('Input.dispatchMouseEvent', {type, x: at.x, y: at.y, button: 'left', clickCount: 1});
        }
        await sleep(800);
        return js(`(() => { clearInterval(window.watching); return [...window.thrown].join(','); })()`);
    };
    for (const id of ['single', 'aux1', 'aux2']) {
        const lower = await throwOf(id, 'lower');
        verify(id + ': its lower half throws it up, not down', lower == 'up', lower);
    }
    verify('AUX still says it is spare', /AUX is not connected to anything/.test(await statusText()), await statusText());
    verify('examine: its lower half throws it down, to EXAMINE NEXT', (await throwOf('examine', 'lower')) == 'down');
    verify('examine: and its upper half up', (await throwOf('examine', 'upper')) == 'up');
}
