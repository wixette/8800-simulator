/**
 * The text that is seen and the text area's own text stay together all
 * the way to the end, whatever room its scrollbars take: a click lands
 * on the character under the mouse, and the block caret is drawn over
 * the character it is at (H1). It once parted by a scrollbar's height
 * in the last stretch of scrolling.
 */
export default async function(h) {
    const {js, send, viewport, fresh, press, verify, setSource, sleep} = h;
    await viewport(1280, 860); await fresh();
    await press('#nav-asm'); await sleep(300);
    await press('#asm-examples-button'); await sleep(500);
    await press('#asm-examples-list li[data-value="guess-letter"]'); await sleep(400);
    const layers = () => js(`(() => {
        const s = document.getElementById('asm-source');
        return {source: [s.scrollTop, s.scrollLeft],
                bar: s.offsetHeight - s.clientHeight,
                others: ['asm-highlight', 'asm-gutter', 'asm-listing'].map(id => document.getElementById(id).scrollTop),
                highlightLeft: document.getElementById('asm-highlight').scrollLeft};
    })()`);
    const scrollTo = (top, left = 0) => js(`(() => { const s = document.getElementById('asm-source');
        s.scrollTop = ${top}; s.scrollLeft = ${left}; s.dispatchEvent(new Event('scroll')); })()`);
    // Where the text area puts a character, and where the coloured copy
    // shows it, on screen.
    const both = (line, column) => js(`(() => {
        const s = document.getElementById('asm-source'), cs = getComputedStyle(s), r = s.getBoundingClientRect();
        const w = document.querySelector('#asm-measure span').getBoundingClientRect().width / 10;
        const seen = document.querySelectorAll('#asm-highlight .asm-line')[${line} - 1].getBoundingClientRect();
        return {real: r.top + parseFloat(cs.paddingTop) + (${line} - 1) * parseFloat(cs.lineHeight) - s.scrollTop,
                seen: seen.top,
                x: r.left + parseFloat(cs.paddingLeft) + ${column} * w - s.scrollLeft + w / 4,
                lineHeight: parseFloat(cs.lineHeight)};
    })()`);
    const caretAt = () => js(`(() => { const s = document.getElementById('asm-source');
        const t = s.value.slice(0, s.selectionStart).split('\\n'); return {line: t.length, column: t[t.length - 1].length}; })()`);
    const caretBox = () => js(`(() => { const c = document.getElementById('asm-caret').getBoundingClientRect();
        return {top: c.top, hidden: document.getElementById('asm-caret').hidden}; })()`);

    let m = await layers();
    verify('the text area has a horizontal scrollbar here, as on the reported machine', m.bar > 0, JSON.stringify(m));
    for (const [where, frac] of [['top', 0], ['middle', 0.5], ['very end', 1]]) {
        await js(`(() => { const s = document.getElementById('asm-source'); s.scrollTop = (s.scrollHeight - s.clientHeight) * ${frac}; s.dispatchEvent(new Event('scroll')); })()`);
        await sleep(200);
        m = await layers();
        verify('at the ' + where + ', every layer is scrolled as far as the text', m.others.every(t => t === m.source[0]), JSON.stringify(m));
    }
    // A click near the bottom, scrolled to the very end, where the two
    // parted most: on END's N, two lines from the last.
    const lines = (await js(`document.getElementById('asm-source').value.split('\\n').length`));
    const target = lines - 1;
    const p = await both(target, 9);
    verify('the line is seen where the text area has it', Math.abs(p.real - p.seen) < 1, JSON.stringify(p));
    for (const type of ['mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', {type, x: p.x, y: p.seen + p.lineHeight / 2, button: 'left', clickCount: 1});
    }
    await sleep(250);
    const at = await caretAt();
    verify('a click lands on the character under the mouse', at.line === target && at.column === 9, JSON.stringify({at, target}));
    let box = await caretBox();
    let q = await both(at.line, at.column);
    verify('and the caret is drawn on that line', !box.hidden && box.top >= q.seen && box.top < q.seen + q.lineHeight, JSON.stringify({box, q}));
    // The arrow keys, down to the last line.
    for (let i = 0; i < 20; i++) {
        await send('Input.dispatchKeyEvent', {type: 'rawKeyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40});
        await send('Input.dispatchKeyEvent', {type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40});
    }
    await sleep(300);
    const last = await caretAt();
    box = await caretBox();
    q = await both(last.line, last.column);
    verify('Down to the last line: the caret is drawn on it', last.line === lines && box.top >= q.seen && box.top < q.seen + q.lineHeight, JSON.stringify({last, box, q}));
    m = await layers();
    verify('and the layers are still together', m.others.every(t => t === m.source[0]), JSON.stringify(m));
    // Sideways: a long line, scrolled right to its end.
    await setSource('START:  MVI     A,1     ; ' + 'a long comment '.repeat(30) + 'END\n' + Array(60).fill('        NOP').join('\n'));
    await sleep(300);
    await js(`(() => { const s = document.getElementById('asm-source'); s.scrollLeft = s.scrollWidth; s.scrollTop = s.scrollHeight; s.dispatchEvent(new Event('scroll')); })()`);
    await sleep(200);
    m = await layers();
    verify('scrolled right to the end, the coloured text is as far as the text', m.highlightLeft === m.source[1] && m.others.every(t => t === m.source[0]), JSON.stringify(m));
    // A phone, with its own room for scrollbars.
    await viewport(390, 844); await sleep(400);
    await js(`(() => { const s = document.getElementById('asm-source'); s.scrollTop = s.scrollHeight; s.dispatchEvent(new Event('scroll')); })()`);
    await sleep(200);
    m = await layers();
    verify('on a phone too', m.others[0] === m.source[0] && m.others[1] === m.source[0], JSON.stringify(m));
}
