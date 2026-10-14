/**
 * The editor's Clear button: empties the editor, Undo brings it back,
 * memory is left alone.
 */
export default async function(h) {
    const {js, send, viewport, fresh, press, verify, setSource, sleep, statusText} = h;
    const val = () => js(`document.getElementById('asm-source').value`);
    const dis = () => js(`document.getElementById('asm-clear').disabled`);
    const marked = () => js(`document.querySelectorAll('#asm-highlight .asm-line-pc').length`);
    await viewport(1280, 860); await fresh();
    await press('#nav-asm'); await sleep(300);
    verify('an empty editor has nothing to clear', await dis());
    verify('Clear has its tooltip', (await js(`document.getElementById('asm-clear').title`)) === 'Clear the editor');
    await press('#asm-examples-button'); await sleep(500);
    await press('#asm-examples-list li[data-value="adder"]'); await sleep(300);
    verify('with source in it, Clear is offered', !(await dis()));
    await press('#asm-assemble'); await sleep(300);
    const memBefore = await js(`Array.from(panel.sim.mem.slice(0, 14)).join(',')`);
    verify('the PC is marked after Assemble', (await marked()) === 1);
    const original = await val();
    await press('#asm-clear'); await sleep(400);
    verify('Clear empties the editor', (await val()) === '');
    verify('and says how to undo it', /Undo \(Ctrl\+Z|Undo \(⌘Z/.test(await statusText()), await statusText());
    verify('and leaves memory alone', (await js(`Array.from(panel.sim.mem.slice(0, 14)).join(',')`)) === memBefore);
    verify('the PC mark goes, as after any edit', (await marked()) === 0);
    verify('nothing left to clear', await dis());
    verify('the editor keeps the focus', await js(`document.activeElement.id`) === 'asm-source');
    verify('the listing is empty too', (await js(`document.getElementById('asm-listing').textContent.trim()`)) === '');
    await send('Input.dispatchKeyEvent', {type: 'rawKeyDown', key: 'z', code: 'KeyZ', modifiers: 4, windowsVirtualKeyCode: 90, commands: ['undo']});
    await send('Input.dispatchKeyEvent', {type: 'keyUp', key: 'z', code: 'KeyZ', modifiers: 4, windowsVirtualKeyCode: 90});
    await sleep(500);
    verify('Undo brings the source back', (await val()) === original, (await val()).slice(0, 30));
    verify('and Clear is offered again', !(await dis()));
    verify('and it is saved again', (await js(`localStorage.getItem('${await js(`asmtab.STORAGE_KEY`)}')`)) === original);
    await press('#asm-clear'); await sleep(300);
    await press('#asm-examples-button'); await sleep(300);
    await press('#asm-examples-list li[data-value="macros"]'); await sleep(300);
    verify('after a clear, an example goes in without asking', !(await js(`document.getElementById('asm-replace-dialog').open`)) && (await val()).includes('Macros'));
    await press('#asm-clear'); await sleep(300);
    await js(`location.reload()`); await sleep(1500);
    await press('#nav-asm'); await sleep(300);
    verify('a reload keeps the cleared editor', (await val()) === '' && await dis());
    await setSource('  NOP'); await sleep(200);
    verify('typing offers Clear again', !(await dis()));
    await js(`l10n.setLocale ? l10n.setLocale('ja') : panel.setLocale('ja')`); await sleep(300);
    verify('the tooltip follows the language', (await js(`document.getElementById('asm-clear').title`)) === 'エディターを空にする', await js(`document.getElementById('asm-clear').title`));
    await viewport(390, 844); await sleep(300);
    const r = await js(`(() => { const a = document.getElementById('asm-clear').getBoundingClientRect(), b = document.getElementById('asm-copy').getBoundingClientRect(); return [a.right <= b.left - 8, b.right <= window.innerWidth, a.top === b.top]; })()`);
    verify('on a phone the two sit side by side, apart', r.every(Boolean), JSON.stringify(r));
}
