/**
 * One set of examples behind both menus: Load runs one and says where its
 * source is, the Assembler's Examples puts it in the editor (U5).
 */
export default async function(h) {
    const {js, viewport, fresh, press, verify, setSource, sleep, statusText} = h;
    const labels = (list) => js(`[...document.querySelectorAll('${list} li')].map(e => e.getAttribute('role') == 'presentation' ? '#' + e.textContent : e.dataset.value)`);
    await viewport(1280, 860); await fresh();
    // Load menu
    await press('#load-button'); await sleep(800);
    const load = await labels('#load-dropdown ul');
    const exampleIds = load.filter(v => v && v.startsWith('example:')).map(v => v.slice(8));
    verify('Load offers the 14 examples', exampleIds.length === 14, exampleIds.length);
    verify('Load still offers 4K BASIC', load.some(v => /basic/i.test(v || '')));
    // Choose Pattern shift from Load
    await press('#load-dropdown li[data-value="example:pattern-shift"]'); await sleep(400);
    const st = await statusText();
    verify('Load names where its source is', /Assembler › Examples/.test(st), st);
    verify('the Assembler editor is untouched by Load', (await js(`document.getElementById('asm-source').value`)) === '');
    await press('#s-sw-run'); await sleep(600);
    await press('#s-sw-stop'); await sleep(200);
    const pc = await js(`panel.linkCpu().pc`);
    verify('the loaded program runs (PC in its loop, past its start)', pc >= 2 && pc < 8, pc);
    // Assembler examples
    await press('#nav-asm'); await sleep(300);
    await press('#asm-examples-button'); await sleep(500);
    const asm = await labels('#asm-examples-list');
    const asmIds = asm.filter(v => v && !v.startsWith('#'));
    verify('Assembler offers the same 14, in the same order', JSON.stringify(asmIds) === JSON.stringify(exampleIds), JSON.stringify(asmIds));
    verify('Assembler offers no 4K BASIC', !asmIds.some(v => /basic/i.test(v)));
    await press('#asm-examples-list li[data-value="tty-subroutines"]'); await sleep(400);
    const src = await js(`document.getElementById('asm-source').value`);
    verify('Examples puts the source in the editor', src.startsWith(';;; name: Echo, with subroutines'), src.slice(0, 40));
    verify('and says so', /Echo, with subroutines/.test(await statusText()), await statusText());
    await press('#asm-assemble'); await sleep(400);
    const b = await js(`[0,1,2,3,4].map(i => panel.sim.mem[i])`);
    verify('Assemble loads its bytes (31 00 01 cd 16)', JSON.stringify(b) === '[49,0,1,205,22]', JSON.stringify(b));
    // Switching to another example asks first? No: unchanged example replaces freely.
    await press('#asm-examples-button'); await sleep(300);
    await press('#asm-examples-list li[data-value="guess-letter"]'); await sleep(400);
    verify('an unchanged example is replaced without asking',
           (await js(`document.getElementById('asm-source').value`)).includes('Guess my letter') &&
           !(await js(`document.getElementById('asm-replace-dialog').open`)));
    await setSource('  NOP  ; mine'); await sleep(200);
    await press('#asm-examples-button'); await sleep(300);
    await press('#asm-examples-list li[data-value="adder"]'); await sleep(400);
    verify('own text asks first', await js(`document.getElementById('asm-replace-dialog').open`));
    await press('#asm-replace-ok'); await sleep(300);
    verify('Replace puts in the adder', (await js(`document.getElementById('asm-source').value`)).includes('Add two numbers'));
    // Teletype example from Load
    await press('#load-button'); await sleep(300);
    await press('#load-dropdown li[data-value="example:tty-hello"]'); await sleep(300);
    const st2 = await statusText();
    verify('a teletype load names the source too', /Teletype\. Its source is in Assembler › Examples/.test(st2), st2);
    verify('Load leaves the editor alone', (await js(`document.getElementById('asm-source').value`)).includes('Add two numbers'));
    await press('#s-sw-run'); await sleep(800);
    await press('#nav-tty'); await sleep(300);
    const paper = await js(`document.getElementById('tty-paper').textContent`);
    verify('tty-hello prints its greeting', /HELLO, WORLD!/.test(paper), JSON.stringify(paper.replace(/\s+/g, " ").trim()));
    await viewport(390, 844); await press('#load-button'); await sleep(300);
    await press('#load-dropdown li[data-value="example:kill-the-bit"]'); await sleep(300);
    const ov = await js(`(() => { const e = document.getElementById('status-text'); return [e.scrollWidth, e.clientWidth, document.documentElement.scrollWidth]; })()`);
    verify('on a phone the longer status does not widen the page', ov[2] <= 390, JSON.stringify(ov));
    // The Assembler's toolbar: Examples, then Assemble, in the order
    // they are used, and nothing else beside them.
    for (const [width, height] of [[1280, 860], [390, 844]]) {
        await viewport(width, height); await press('#nav-asm'); await sleep(300);
        const bar = await js(`(() => {
            const e = document.querySelector('#asm-examples-button').getBoundingClientRect();
            const a = document.querySelector('#asm-assemble').getBoundingClientRect();
            const shown = [...document.querySelector('.asm-toolbar').children]
                .filter(c => c.offsetParent !== null && !c.classList.contains('toolbar-spacer')).map(c => c.id);
            return {order: e.right <= a.left && Math.abs(e.top - a.top) < 2, shown};
        })()`);
        verify(width + 'px: Examples, then Assemble, on one row', bar.order, JSON.stringify(bar));
        const expected = width < 700 ? ['asm-examples-dropdown', 'asm-assemble', 'asm-view-toggle']
                                     : ['asm-examples-dropdown', 'asm-assemble'];
        verify(width + 'px: and no summary beside them', JSON.stringify(bar.shown) === JSON.stringify(expected), JSON.stringify(bar.shown));
    }
}
