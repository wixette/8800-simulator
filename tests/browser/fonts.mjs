/**
 * Every control and every piece of text is in the page's font: browsers
 * give buttons and preformatted text fonts of their own.
 */
export default async function(h) {
    const {js, viewport, fresh, press, sleep, verify} = h;
    await viewport(1280, 860); await fresh();
    // Open the menus once, so their items are on the page too.
    for (const button of ['#load-button', '#asm-examples-button']) {
        await press(button); await sleep(500); await press('body');
    }
    const odd = await js(`(() => {
        const page = getComputedStyle(document.body).fontFamily;
        const out = [];
        for (const e of document.querySelectorAll('body *')) {
            if (e.closest('svg')) continue;
            const font = getComputedStyle(e).fontFamily;
            if (font != page) out.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ': ' + font);
        }
        return out;
    })()`);
    verify('everything is in the page\'s font', odd.length === 0, JSON.stringify(odd.slice(0, 10)));
    const assemble = await js(`getComputedStyle(document.getElementById('asm-assemble')).fontSize`);
    const examples = await js(`getComputedStyle(document.getElementById('asm-examples-button')).fontSize`);
    verify('Assemble is the size of the button beside it', assemble === examples, assemble + ' vs ' + examples);
}
