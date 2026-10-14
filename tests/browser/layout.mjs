/**
 * Layout from the release review: the dock's fold button stays in reach
 * at every width and language, and a dialog taller than the window
 * scrolls its body, keeping its title and close button in reach.
 */
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
