/**
 * The PC followed in the Assembler's source: marked, moved, scrolled to
 * only after something the reader did (U7).
 */
export default async function(h) {
    const {js, viewport, fresh, press, verify, setSource, sleep, send} = h;

    const marked = async () => JSON.parse(await js(`JSON.stringify({
      src: [...document.querySelectorAll('#asm-highlight .asm-line')].findIndex(e => e.classList.contains('asm-line-pc')) + 1,
      gut: [...document.querySelectorAll('#asm-gutter .asm-gutter-line')].findIndex(e => e.classList.contains('asm-gutter-pc')) + 1,
      lst: [...document.querySelectorAll('#asm-listing .asm-listing-line')].findIndex(e => e.classList.contains('asm-listing-pc')) + 1,
      top: document.getElementById('asm-source').scrollTop})`));
    const scrollTo = (top) => js(`(() => { const s = document.getElementById('asm-source'); s.scrollTop = ${top}; s.dispatchEvent(new Event('scroll')); })()`);

    await viewport(1280, 860); await fresh();
    await press('#nav-asm'); await sleep(300);
    const lines = [];
    for (let k = 0; k < 40; k++) lines.push('        NOP');
    lines.push('LOOP:   INR     A', '        JMP     LOOP');
    await setSource(lines.join('\n')); await sleep(300);
    await press('#asm-assemble'); await sleep(300);
    let m = await marked();
    verify('Assemble marks the first line, its number and its bytes', m.src === 1 && m.gut === 1 && m.lst === 1, JSON.stringify(m));
    await press('#s-sw-single'); await sleep(150);
    m = await marked();
    verify('SINGLE STEP moves the mark', m.src === 2 && m.lst === 2, JSON.stringify(m));
    await press('#s-sw-run'); await sleep(200);
    m = await marked();
    verify('nothing is marked while it runs', m.src === 0, JSON.stringify(m));
    await press('#s-sw-stop'); await sleep(250);
    m = await marked();
    verify('STOP marks the loop, and scrolls to it', (m.src === 41 || m.src === 42) && m.top > 0, JSON.stringify(m));
    await scrollTo(0); await sleep(150);
    await press('#s-sw-single'); await sleep(250);
    m = await marked();
    verify('a step after scrolling away brings the line back', m.top > 0, JSON.stringify(m));
    const before = m.top;
    await press('#s-sw-single'); await sleep(250);
    m = await marked();
    verify('no scroll while the line is in view', m.top === before, JSON.stringify(m));
    await press('#s-sw-reset'); await sleep(300);
    m = await marked();
    verify('RESET marks the first line and scrolls to it', m.src === 1 && m.top === 0, JSON.stringify(m));
    // An edit takes the mark away, and typing never scrolls.
    await press('#asm-source');
    await js(`(() => { const s = document.getElementById('asm-source'); s.setSelectionRange(s.value.length, s.value.length); })()`);
    await send('Input.insertText', {text: ' '}); await sleep(300);
    m = await marked();
    verify('an edit takes the mark away', m.src === 0, JSON.stringify(m));
    await press('#s-sw-single'); await sleep(250);
    m = await marked();
    verify('stepping marks nothing until it is assembled again', m.src === 0, JSON.stringify(m));
    await press('#asm-assemble'); await sleep(300);
    m = await marked();
    verify('Assemble brings it back', m.src === 1, JSON.stringify(m));
    // A DEPOSIT over the bytes under the PC takes the mark away.
    await js(`panel.setAddressSwitches(0x00ff); panel.sim.lastAddress = 0; panel.onDeposit()`); await sleep(300);
    m = await marked();
    verify('a DEPOSIT over the PC\'s bytes takes it away', m.src === 0, JSON.stringify(m));
    // A program that halts by itself: marked, never scrolled.
    await setSource(lines.slice(0, 40).join('\n') + '\n        HLT'); await sleep(300);
    await press('#asm-assemble'); await sleep(300);
    await scrollTo(0); await press('#asm-source'); await sleep(100);
    await js(`panel.onRun()`); await sleep(500);
    m = await marked();
    verify('a halt by itself is marked, but does not scroll', m.src === 41 && m.top === 0, JSON.stringify(m));
    // Opening the tab after looking elsewhere scrolls to it, once.
    await press('#nav-debug'); await sleep(200);
    await press('#nav-asm'); await sleep(350);
    m = await marked();
    verify('opening the tab brings the line into view', m.src === 41 && m.top > 0, JSON.stringify(m));
}

/**
 * A program with its data written first starts at its first
 * instruction, not at the data (#20): the PC, the lamps and the mark.
 */
export async function dataFirst(h) {
    const {js, viewport, fresh, press, verify, setSource, sleep, statusText} = h;
    const pcLine = () => js(`[...document.querySelectorAll('#asm-highlight .asm-line')].findIndex(e => e.classList.contains('asm-line-pc')) + 1`);
    await viewport(1280, 860); await fresh();
    await press('#nav-asm'); await sleep(300);
    // The program from #20, as the student wrote it.
    await setSource(['ORG 0030H', 'db "t"', 'db "a"', 'db "C"\t', 'ORG 0000H',
                     '\tLXI\tSP, 0040H', '\tLXI\tH, 0030H', '', 'loopo:\t\t',
                     '\tPUSH\tH', '        MOV A,M', '\tINX\tH ', 'ORA A',
                     'JNZ\tloopo', 'POP\tH', 'LXI\tB, 0030H', 'loopt:\t\t',
                     '\tMOV\tA, M', '\tSTAX\tB ', '\tINX\tB', '\tDCR\tH',
                     'ORA A', 'JNZ\tloopt', 'HLT\t'].join('\n'));
    await sleep(300);
    await press('#asm-assemble'); await sleep(300);
    verify('Assemble leaves the PC at 0000H', (await js(`panel.linkCpu().pc`)) === 0, await js(`panel.linkCpu().pc`));
    verify('and says nothing was examined elsewhere', !/examined/.test(await statusText()), await statusText());
    verify('the mark is on LXI SP, not on the data', (await pcLine()) === 6, await pcLine());
    await press('#s-sw-single'); await sleep(200);
    verify('SINGLE STEP runs LXI SP: the PC is at 0003H', (await js(`panel.linkCpu().pc`)) === 3, await js(`panel.linkCpu().pc`));
    verify('and the mark follows it', (await pcLine()) === 7, await pcLine());
    // With END START, as before: the PC goes where it says.
    await setSource(' ORG 0030H\nMSG: DB 1\n ORG 0000H\n NOP\nSTART: HLT\n END START'); await sleep(300);
    await press('#asm-assemble'); await sleep(300);
    verify('END START still decides', (await js(`panel.linkCpu().pc`)) === 1 && /examined 0001H/.test(await statusText()), await statusText());
}
