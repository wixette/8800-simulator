/**
 * The text that is seen and the text area's own text stay together all
 * the way to the end, whatever room its scrollbars take: a click lands
 * on the character under the mouse, and the block caret is drawn over
 * the character it is at (H1). It once parted by a scrollbar's height
 * in the last stretch of scrolling.
 */
export default async function(h) {
    await editorCaret(h, true);
}

/** The same, where scrollbars take no room, as on a Mac with a trackpad. */
export async function overlayScrollbars(h) {
    await editorCaret(h, false);
}

/**
 * @param {boolean} roomy Whether scrollbars take room from the view, as
 *     they do with a mouse on a Mac and on most other systems. Which kind
 *     a browser draws follows the system, so it is set here rather than
 *     left to the machine the checks happen to run on.
 */
async function editorCaret(h, roomy) {
    const {js, send, viewport, fresh, press, verify, setSource, sleep} = h;
    await viewport(1280, 860); await fresh();
    if (roomy) {
        await js(`(() => { const st = document.createElement('style');
            st.textContent = '::-webkit-scrollbar { width: 15px; height: 15px; background: #ddd; } ::-webkit-scrollbar-thumb { background: #999; }';
            document.head.appendChild(st); })()`);
    }
    await press('#nav-asm'); await sleep(300);
    await press('#asm-examples-button'); await sleep(500);
    await press('#asm-examples-list li[data-value="guess-letter"]'); await sleep(400);
    // Examples fit the editor: a line that does not brings its scrollbar.
    await js(`(() => { const s = document.getElementById('asm-source');
        s.value = ';' + '-'.repeat(200) + '\\n' + s.value; s.dispatchEvent(new Event('input')); })()`);
    await sleep(300);
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
    if (roomy) {
        verify('the text area\'s scrollbar takes room, as on the reported machine', m.bar > 0, JSON.stringify(m));
    }
    verify('the example is in the editor', (await js(`document.getElementById('asm-source').value`)).includes('Guess my letter'));
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

/**
 * The Teletype and the Debugger's dump have no layers to part: the
 * carriage is a span in the paper's own text, and a click on the dump
 * picks the byte element it lands on. This holds them to that, scrolled
 * to their ends as the editor was.
 */
export async function others(h) {
    const {js, send, viewport, fresh, press, verify, sleep} = h;
    const click = async (x, y) => {
        for (const type of ['mousePressed', 'mouseReleased']) {
            await send('Input.dispatchMouseEvent', {type, x, y, button: 'left', clickCount: 1});
        }
        await sleep(200);
    };
    // Whether the element is wholly inside the part of its scroller that
    // can be seen, which the scroller's scrollbars do not cover.
    const inView = (selector, scroller) => js(`(() => {
        const e = document.querySelector('${selector}').getBoundingClientRect();
        const s = document.querySelector('${scroller}');
        const r = s.getBoundingClientRect();
        const bottom = r.top + s.clientTop + s.clientHeight, right = r.left + s.clientLeft + s.clientWidth;
        return {inside: e.top >= r.top - 0.5 && e.bottom <= bottom + 0.5 && e.left >= r.left - 0.5 && e.right <= right + 0.5,
                e: [e.left, e.top, e.right, e.bottom], view: [r.left, r.top, right, bottom]};
    })()`);
    for (const [label, width, height] of [['desktop', 1280, 860], ['phone', 390, 844]]) {
        await viewport(width, height); await fresh();
        // The Teletype, after a long run of printing, the carriage far
        // along its line.
        await press('#nav-tty'); await sleep(300);
        await js(`(() => { for (let i = 0; i < 120; i++) panel.tty.writeText('LINE ' + i + ' ' + 'X'.repeat(60) + '\\r\\n');
            panel.tty.writeText('THE CARRIAGE IS HERE, FAR ALONG THE LINE: ' + '-'.repeat(20)); panel.renderTeletype(); })()`);
        await sleep(300);
        const tty = await inView('.tty-cursor', '#tty-paper');
        verify(label + ': the Teletype\'s carriage is in view after a long print', tty.inside, JSON.stringify(tty));
        // A carriage return takes it, and the view, back to the margin.
        await js(`(() => { panel.tty.writeText('\\r'); panel.renderTeletype(); })()`);
        await sleep(200);
        const back = await inView('.tty-cursor', '#tty-paper');
        verify(label + ': and after a carriage return, at the left margin', back.inside &&
               (await js(`document.getElementById('tty-paper').scrollLeft`)) === 0, JSON.stringify(back));
        // The Debugger's dump, scrolled to its end: a click picks the
        // byte under the mouse, and that byte is the one marked.
        await press('#s-off-on'); await sleep(300);
        await press('#nav-debug'); await sleep(400);
        await js(`(() => { let e = document.getElementById('mem-dump');
            for (; e; e = e.parentElement) { if (e.scrollHeight > e.clientHeight + 1 && getComputedStyle(e).overflowY != 'visible') e.scrollTop = e.scrollHeight;
                                             if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX != 'visible') e.scrollLeft = e.scrollWidth; } })()`);
        await sleep(300);
        // The last byte that can be seen whole, from the bottom right.
        const pick = await js(`(() => {
            let view = document.getElementById('mem-dump'), r = null;
            for (let e = view; e; e = e.parentElement) if (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) { view = e; break; }
            const v = view.getBoundingClientRect();
            const bytes = [...document.querySelectorAll('#mem-dump span[data-a]')].filter(s => {
                const b = s.getBoundingClientRect();
                return b.top >= v.top && b.bottom <= v.top + view.clientHeight && b.left >= v.left && b.right <= v.left + view.clientWidth && b.bottom <= innerHeight;
            });
            const s = bytes[bytes.length - 1], b = s.getBoundingClientRect();
            return {a: +s.dataset.a, x: b.left + b.width / 2, y: b.top + b.height / 2};
        })()`);
        await click(pick.x, pick.y);
        const picked = await js(`(() => { const s = document.querySelector('#mem-dump .mem-selected'); return {sel: panel.memSelection, marked: s ? +s.dataset.a : null}; })()`);
        verify(label + ': scrolled to its end, a click in the dump picks the byte under the mouse',
               picked.sel === pick.a && picked.marked === pick.a, JSON.stringify({pick, picked}));
        await js(`document.querySelector('#mem-input').dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}))`);
        await sleep(200);
        const moved = await js(`(() => { const s = document.querySelector('#mem-dump .mem-selected'); return {sel: panel.memSelection, marked: s ? +s.dataset.a : null}; })()`);
        verify(label + ': and moved with the keys, the mark follows', moved.sel === pick.a - 1 && moved.marked === pick.a - 1, JSON.stringify(moved));
        await js(`panel.clearMemSelection()`);
    }
}
