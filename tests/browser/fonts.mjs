/**
 * Every control and every piece of text is in one of the page's two
 * fonts (P11): the app's own words in the UI sans, the machine's - its
 * legends, dumps, paper and code - in monospace. Browsers give buttons
 * and preformatted text fonts of their own.
 */
export default async function(h) {
    const {js, viewport, fresh, press, sleep, verify} = h;
    await viewport(1280, 860); await fresh();
    // Open the menus once, so their items are on the page too.
    for (const button of ['#load-button', '#asm-examples-button']) {
        await press(button); await sleep(500); await press('body');
    }
    const fonts = await js(`(() => {
        const ui = getComputedStyle(document.body).fontFamily;
        const mono = getComputedStyle(document.getElementById('mem-dump')).fontFamily;
        const odd = [];
        for (const e of document.querySelectorAll('body *')) {
            if (e.closest('svg')) continue;
            const font = getComputedStyle(e).fontFamily;
            if (font != ui && font != mono) odd.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ': ' + font);
        }
        const of = (id) => getComputedStyle(document.getElementById(id)).fontFamily;
        return {ui, mono, odd,
                machine: ['cpu-dump', 'instr-pane', 'tty-paper', 'asm-source', 'asm-highlight', 'asm-listing', 's-sw-run', 's-s0', 'tty-break', 'debug-step-count', 'debug-data-input'].filter((id) => of(id) != mono),
                app: ['asm-assemble', 'asm-examples-button', 'nav-debug', 'load-button', 'debug-step', 'status-text', 'mem-follow-pc'].filter((id) => of(id) != ui)};
    })()`);
    verify('the page has two fonts, a sans and a monospace', fonts.ui != fonts.mono && /monospace/.test(fonts.mono) && /sans-serif/.test(fonts.ui), fonts.ui + ' | ' + fonts.mono);
    verify('everything is in one of them', fonts.odd.length === 0, JSON.stringify(fonts.odd.slice(0, 10)));
    verify('the machine\'s things are in the monospace', fonts.machine.length === 0, JSON.stringify(fonts.machine));
    verify('the app\'s own controls are in the sans', fonts.app.length === 0, JSON.stringify(fonts.app));
    const assemble = await js(`getComputedStyle(document.getElementById('asm-assemble')).fontSize`);
    const examples = await js(`getComputedStyle(document.getElementById('asm-examples-button')).fontSize`);
    verify('Assemble is the size of the button beside it', assemble === examples, assemble + ' vs ' + examples);
}
