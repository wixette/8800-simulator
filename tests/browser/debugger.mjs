/**
 * The Debugger's dump and the switches while a program runs: a running
 * machine's dump is drawn light, and edited only once it stops; and
 * EXAMINE, DEPOSIT and SINGLE STEP wait for STOP, as on the real panel.
 */
export default async function(h) {
    const {js, send, viewport, fresh, press, verify, statusText, sleep} = h;
    await viewport(1280, 860); await fresh();
    await js(`panel.onPowerOn()`); await sleep(300);
    await js(`document.getElementById('debug-data-input').value = 'c3 00 00'; panel.debugLoadData(); panel.onReset()`);
    await js(`panel.showTab('debug')`); await sleep(300);
    await press('#s-sw-run'); await sleep(400);
    const running = await js(`document.querySelectorAll('#mem-dump span[data-a]').length`);
    verify('running, the dump draws no element per byte', running === 0, running);
    const r = await js(`(() => { const b = document.getElementById('mem-dump').getBoundingClientRect(); return {x: b.x + 120, y: b.y + 40}; })()`);
    for (const type of ['mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', {type, x: r.x, y: r.y, button: 'left', clickCount: 1});
    }
    await sleep(200);
    verify('a click on it says to stop first', /stopped|STOP/.test(await statusText()), await statusText());
    const before = await js(`panel.sim.mem[0x80]`);
    for (const [id, name] of [['#s-sw-examine', 'EXAMINE'], ['#s-sw-deposit', 'DEPOSIT'], ['#s-sw-single', 'SINGLE STEP']]) {
        await js(`panel.setAddressSwitches(0x0080)`);
        await press(id); await sleep(150);
        verify(name + ' while running says to stop first', (await statusText()).startsWith(name + ' works only while the machine is stopped'), await statusText());
    }
    verify('and the byte at 0080H is untouched', (await js(`panel.sim.mem[0x80]`)) === before);
    await press('#s-sw-stop'); await sleep(400);
    const stopped = await js(`document.querySelectorAll('#mem-dump span[data-a]').length`);
    verify('stopped, every byte is its own again', stopped === 256, stopped);
    const b = await js(`(() => { const s = document.querySelector('#mem-dump span[data-a="16"]').getBoundingClientRect(); return {x: s.x + s.width / 2, y: s.y + s.height / 2}; })()`);
    for (const type of ['mousePressed', 'mouseReleased']) {
        await send('Input.dispatchMouseEvent', {type, x: b.x, y: b.y, button: 'left', clickCount: 1});
    }
    await sleep(200);
    await send('Input.insertText', {text: '3e'}); await sleep(300);
    verify('and a byte clicked and typed over is edited', (await js(`panel.sim.mem[16]`)) === 0x3e, await js(`panel.sim.mem[16]`));
    await press('#s-sw-examine'); await sleep(150);
    verify('EXAMINE works again', !(await statusText()).includes('works only while'), await statusText());
}
