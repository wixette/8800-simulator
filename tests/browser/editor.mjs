/**
 * The Assembler's editor, from the release review: Tab never loses
 * text, the phone's listing scrolls and its toggle answers the keyboard,
 * the Examples menu fits in the dock, the caret sits on wide characters
 * and keeps a character's colour, and Copy and Clear show their focus.
 */
export default async function(h) {
    const {js, send, viewport, fresh, press, verify, setSource, sleep} = h;
    const key = async (k, code, vk, modifiers = 0, commands) => {
        // Enter and Space carry their characters, as a real key does,
        // or a button never hears them as a press.
        const text = k == 'Enter' ? '\r' : k == ' ' ? ' ' : undefined;
        await send('Input.dispatchKeyEvent', {type: text ? 'keyDown' : 'rawKeyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers, ...(text ? {text} : {}), ...(commands ? {commands} : {})});
        await send('Input.dispatchKeyEvent', {type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk, modifiers});
        await sleep(150);
    };
    const value = () => js(`document.getElementById('asm-source').value`);
    await viewport(1280, 860); await fresh();
    await press('#nav-asm'); await sleep(300);

    // Tab with lines selected indents them, and Undo takes it back.
    await press('#asm-source');
    await send('Input.insertText', {text: 'L: MVI A,1\n OUT 0FFH\n JMP L'}); await sleep(300);
    await js(`document.getElementById('asm-source').setSelectionRange(0, 21)`);
    await key('Tab', 'Tab', 9);
    verify('Tab across two lines indents both, losing nothing',
           (await value()) === '        L: MVI A,1\n         OUT 0FFH\n JMP L', JSON.stringify(await value()));
    await key('z', 'KeyZ', 90, 4, ['undo']);
    verify('and Undo takes the indent back', (await value()) === 'L: MVI A,1\n OUT 0FFH\n JMP L', JSON.stringify(await value()));
    await js(`document.getElementById('asm-source').setSelectionRange(3, 3)`);
    await key('Tab', 'Tab', 9);
    await send('Input.insertText', {text: 'X'}); await sleep(200);
    await key('z', 'KeyZ', 90, 4, ['undo']); await key('z', 'KeyZ', 90, 4, ['undo']);
    verify('Undo goes back past a Tab, as past typing', (await value()) === 'L: MVI A,1\n OUT 0FFH\n JMP L', JSON.stringify(await value()));

    // Escape, then a click back in: Tab indents again rather than leaving.
    await key('Escape', 'Escape', 27);
    await press('#asm-source');
    await js(`document.getElementById('asm-source').setSelectionRange(0, 0)`);
    await key('Tab', 'Tab', 9);
    verify('after Escape and a click back in, Tab still indents',
           (await js(`document.activeElement.id`)) === 'asm-source' && (await value()).startsWith('        L:'), await js(`document.activeElement.id`));

    // The caret over a wide character, and its blink.
    await setSource(' NOP ; 中文注释 😀 end'); await sleep(200);
    await press('#asm-source');
    const caretAt = async (at) => {
        await js(`document.getElementById('asm-source').setSelectionRange(${at}, ${at})`); await sleep(200);
        return js(`(() => {
            const c = document.getElementById('asm-caret').getBoundingClientRect();
            const line = document.querySelector('#asm-highlight .asm-line');
            const r = document.createRange(); const walk = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
            let left = ${at}, node; while ((node = walk.nextNode()) && left > node.length) left -= node.length;
            r.setStart(node, Math.min(left, node.length)); r.setEnd(node, Math.min(left, node.length));
            const t = r.getBoundingClientRect();
            return {caret: c.left, text: t.left, under: document.getElementById('asm-caret').textContent};
        })()`);
    };
    const src = ' NOP ; 中文注释 😀 end';
    for (const at of [src.indexOf('中'), src.indexOf('😀'), src.indexOf('end'), src.length]) {
        const p = await caretAt(at);
        verify('the caret is drawn where the text is, at ' + JSON.stringify(src.slice(at, at + 2)),
               Math.abs(p.caret - p.text) < 1.5, JSON.stringify(p));
    }
    verify('and over an emoji shows the whole character', (await caretAt(src.indexOf('😀'))).under === '😀');
    verify('its blink keeps the colour of what is under it',
           (await js(`getComputedStyle(document.getElementById('asm-caret')).animationName`)) === 'asm-caret-blink');

    // Copy and Clear show a ring when the keyboard is on them.
    await setSource(' NOP'); await sleep(200);
    await js(`document.getElementById('asm-copy').focus({focusVisible: true})`); await sleep(100);
    verify('the keyboard focus on Copy shows a ring',
           (await js(`getComputedStyle(document.getElementById('asm-copy')).outlineStyle`)) === 'solid');

    // The Examples menu fits in the dock, and scrolls in itself.
    await press('#asm-examples-button'); await sleep(700);
    const fit = await js(`(() => { const l = document.getElementById('asm-examples-list').getBoundingClientRect(), d = document.getElementById('dock-body').getBoundingClientRect();
        return {listBottom: l.bottom, dockBottom: d.bottom, scrolls: document.getElementById('asm-examples-list').scrollHeight > document.getElementById('asm-examples-list').clientHeight}; })()`);
    verify('the Examples menu ends inside the dock', fit.listBottom <= fit.dockBottom, JSON.stringify(fit));
    await press('#asm-examples-list li[data-value="guess-letter"]'); await sleep(400);
    if (await js(`document.getElementById('asm-replace-dialog').open`)) { await press('#asm-replace-ok'); await sleep(300); }
    verify('and its last example can be chosen', (await value()).includes('Guess my letter'));

    // A phone: the listing scrolls, and the toggle answers the keyboard.
    await viewport(390, 844); await sleep(400);
    await js(`(() => { const s = document.getElementById('asm-source'); s.scrollTop = 600; s.dispatchEvent(new Event('scroll')); })()`); await sleep(200);
    await js(`document.getElementById('asm-view-toggle').focus()`);
    await key('Enter', 'Enter', 13); await sleep(200);
    const shown = await js(`({listing: document.getElementById('tab-asm').classList.contains('show-listing'), pressed: document.getElementById('asm-view-toggle').getAttribute('aria-pressed'), top: document.getElementById('asm-listing').scrollTop})`);
    verify('Enter on the toggle shows the listing, where the source was', shown.listing && shown.pressed === 'true' && Math.abs(shown.top - 600) < 2, JSON.stringify(shown));
    const r = await js(`(() => { const e = document.getElementById('asm-listing').getBoundingClientRect(); return {x: e.x + e.width / 2, y: e.y + e.height / 2}; })()`);
    for (let i = 0; i < 5; i++) await send('Input.dispatchMouseEvent', {type: 'mouseWheel', x: r.x, y: r.y, deltaX: 0, deltaY: 300});
    await sleep(300);
    const scrolled = await js(`document.getElementById('asm-listing').scrollTop`);
    verify('the listing scrolls on its own', scrolled > 1000, scrolled);
    await key(' ', 'Space', 32); await sleep(200);
    const back = await js(`({listing: document.getElementById('tab-asm').classList.contains('show-listing'), top: document.getElementById('asm-source').scrollTop})`);
    verify('Space shows the source again, where the listing was', !back.listing && Math.abs(back.top - scrolled) < 2, JSON.stringify({back, scrolled}));
}
