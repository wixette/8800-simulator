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

/**
 * Step and Run to, under the next instruction (#28): Step runs that
 * many instructions and says where the PC is; Run to runs until the PC
 * gets there; both are greyed, and say why, while the machine is off or
 * running.
 */
export async function stepTools(h) {
    const {js, viewport, fresh, press, verify, statusText, sleep} = h;
    await viewport(1280, 860); await fresh();
    await js(`panel.showTab('debug')`); await sleep(300);
    verify('off, Step is greyed', await js(`document.getElementById('debug-step').classList.contains('disabled')`));
    await press('#debug-step');
    verify('and says why', (await statusText()).startsWith('The machine is off, so there is no program to step through'), await statusText());
    await js(`panel.onPowerOn()`); await sleep(300);
    verify('on, Step and Run to can be pressed', await js(`!document.getElementById('debug-step').classList.contains('disabled') && !document.getElementById('debug-run-to').classList.contains('disabled')`));
    // B counts down from 5 in a loop at 0002; 0010 is past it.
    await js(`document.getElementById('debug-data-input').value = '06 05 05 c2 02 00 c3 10 00 00 00 00 00 00 00 00 00 c3 10 00'; panel.debugLoadData(); panel.onReset()`);
    await sleep(200);
    await js(`document.getElementById('debug-step-count').value = '3'`);
    await press('#debug-step'); await sleep(200);
    verify('Step 3 runs three instructions', (await statusText()) === 'Instructions stepped: 3. The next one is at 0002H.', await statusText());
    verify('and the next instruction is shown', (await js(`document.getElementById('instr-pane').textContent`)).startsWith('0002'));
    await js(`document.getElementById('debug-step-count').value = 'x'`);
    await press('#debug-step'); await sleep(150);
    verify('a count that is not one says so', (await statusText()).startsWith('Step needs a number'), await statusText());
    await js(`(() => { const f = document.getElementById('debug-run-to-address'); f.value = '10'; f.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})); })()`);
    await sleep(500);
    verify('Enter in Run to\'s box runs to 0010H and stops there', (await statusText()) === 'Stopped at 0010H, as Run to asked.' && (await js(`CPU8080.status().pc`)) === 0x10, await statusText());
    verify('the address is written out in full', (await js(`document.getElementById('debug-run-to-address').value`)) === '0010');
    await js(`document.getElementById('debug-run-to-address').value = '0100'`);
    await press('#debug-run-to'); await sleep(300);
    verify('a run to somewhere never reached keeps running', await js(`panel.sim.isRunning`) && (await statusText()).startsWith('Running to 0100H'), await statusText());
    verify('and greys Step while it does', await js(`document.getElementById('debug-step').classList.contains('disabled')`));
    await press('#debug-step'); await sleep(150);
    verify('which says to stop first', (await statusText()).startsWith('Step works only while the machine is stopped'), await statusText());
    await press('#s-sw-stop'); await sleep(300);
    verify('STOP ends it, and Step is back', !(await js(`panel.sim.isRunning`)) && !(await js(`document.getElementById('debug-step').classList.contains('disabled')`)) && (await js(`panel.sim.breakAt`)) === null);
}
