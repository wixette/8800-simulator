/**
 * The PC is marked only while the source and memory are one program:
 * every way memory changes, from the table in U7 of docs/assembler.md.
 */
export default async function(h) {
    const {js, viewport, fresh, press, verify, setSource, sleep} = h;
    const ADDER = ['X       EQU     80H', 'START:  LDA     X', '        MOV     B,A', '        LDA     X+1',
                   '        ADD     B', '        STA     X+2', '        JMP     START'].join('\n');
    const BYTES = '3a 80 00 47 3a 81 00 80 32 82 00 c3 00 00';
    const marked = async () => (await js(`[...document.querySelectorAll('#asm-highlight .asm-line')].findIndex(e => e.classList.contains('asm-line-pc')) + 1`));
    const synced = () => js(`asmtab.loaded !== null`);
    const examine = async (a) => { await js(`panel.setAddressSwitches(${a})`); await press('#s-sw-examine'); await sleep(150); };
    const deposit = async (v) => { await js(`panel.setAddressSwitches(${v})`); await press('#s-sw-deposit'); await sleep(150); };
    const toPc = async (a) => { await js(`CPU8080.set('PC', ${a}); panel.followPc(false)`); await sleep(150); };
    const assemble = async (src = ADDER) => {
      await press('#nav-asm'); await sleep(150);
      await setSource(src); await sleep(150);
      await press('#asm-assemble'); await sleep(250);
    };
    const check = async (name, expectSync, expectLine) => {
      const s = await synced(), m = await marked();
      verify(name, s === expectSync && m === expectLine, JSON.stringify({synced: s, marked: m}));
    };
    await viewport(1280, 860); await fresh();
    await press('#nav-asm'); await sleep(300);

    await assemble();
    await check('Assemble: in sync, START marked', true, 2);
    await press('#s-sw-single'); await sleep(200);
    await check('SINGLE STEP moves it', true, 3);

    // Hand writes that miss the program keep the sync.
    await examine(0x80); await deposit(1);
    await press('#s-sw-deposit-next'); await sleep(150);
    await check('DEPOSIT/DEPOSIT NEXT of data at 0080H: still in sync, still marked', true, 3);
    await js(`panel.selectMemByte(0x81); panel.typeMemDigit(0); panel.typeMemDigit(2)`); await sleep(200);
    await press('#nav-asm'); await sleep(150);
    await check('a Debugger edit of data at 0081H: still in sync, still marked', true, 3);
    const data = await js(`[panel.sim.mem[0x80], panel.sim.mem[0x81]].join(',')`);
    verify('the data really went in', data === '1,2', data);
    await examine(1); await deposit(0x80);
    await check('DEPOSIT of the same byte over the program: still in sync', true, 3);

    // Hand writes that change the program break it.
    await examine(1); await deposit(0x81); await toPc(0);
    await check('DEPOSIT of a different byte over the program: out of sync', false, 0);
    await assemble();
    await js(`panel.selectMemByte(0x0b); panel.typeMemDigit(0); panel.typeMemDigit(0)`); await sleep(200);
    await press('#nav-asm'); await toPc(0);
    await check('a Debugger edit over the program: out of sync', false, 0);
    await press('#s-sw-single'); await sleep(200);
    await check('and it stays so after stepping', false, 0);

    // Every whole load breaks it, even with the very same bytes.
    const loads = [
      ['Load › Add two numbers (the same bytes)', async () => { await press('#load-button'); await sleep(500); await press('#load-dropdown li[data-value="example:adder"]'); }],
      ['Load › Hex Bytes (the same bytes)', () => js(`document.getElementById('debug-data-input').value = '${BYTES}'; panel.debugLoadData()`)],
      ['a binary file, 4K BASIC or a link (loadImage, the same bytes)', () => js(`panel.loadImage([${BYTES.split(' ').map(h => '0x' + h).join(',')}])`)],
      ['Zero All Memory', () => js(`panel.onFillZero()`)],
      ['a power cycle', async () => { await js(`panel.onPowerOff()`); await sleep(100); await js(`panel.onPowerOn()`); }],
      ['a change of memory size', async () => { await js(`panel.onSetMemSize(4096)`); }],
    ];
    for (const [name, act] of loads) {
      await assemble();
      await check('(before: ' + name + ') in sync', true, 2);
      await act(); await sleep(300);
      if (!(await js(`panel.sim.isPoweredOn`))) { await js(`panel.onPowerOn()`); await sleep(200); }
      await press('#nav-asm'); await toPc(0);
      await check(name + ': out of sync', false, 0);
    }
    await js(`panel.onSetMemSize(256)`); await sleep(200);
    if (!(await js(`panel.sim.isPoweredOn`))) { await js(`panel.onPowerOn()`); await sleep(200); }

    // The coincidence case found before: tty-echo assembled, tty-leds loaded.
    await press('#nav-asm'); await sleep(200);
    await press('#asm-examples-button'); await sleep(400);
    await press('#asm-examples-list li[data-value="tty-echo"]'); await sleep(300);
    const replace = await js(`document.getElementById('asm-replace-dialog').open`);
    if (replace) { await press('#asm-replace-ok'); await sleep(300); }
    await press('#asm-assemble'); await sleep(250);
    verify('tty-echo assembled and marked', (await marked()) > 0 && await synced());
    await press('#load-button'); await sleep(400);
    await press('#load-dropdown li[data-value="example:tty-leds"]'); await sleep(300);
    await press('#nav-asm'); await sleep(200);
    await check('tty-leds loaded over it: out of sync at once', false, 0);
    for (let i = 0; i < 4; i++) { await press('#s-sw-single'); await sleep(120); }
    await check('tty-leds loaded over it: no line marked while stepping the shared bytes', false, 0);

    // A program's own stores, into a variable among its bytes, keep the sync.
    const COUNTER = ['START:  LDA     COUNT', '        INR     A', '        STA     COUNT', '        JMP     START', 'COUNT:  DB      0'].join('\n');
    await assemble(COUNTER);
    for (let i = 0; i < 4; i++) { await press('#s-sw-single'); await sleep(120); }
    await check('a program storing its own variable: still in sync, back on START', true, 1);
    verify('and it did store', (await js(`panel.sim.mem[10]`)) === 1, await js(`panel.sim.mem[10]`));
    // An edit, and undoing it: back in sync.
    await setSource(COUNTER + ' '); await sleep(200);
    await check('an edit: no mark', true, 0);
    await setSource(COUNTER); await sleep(200);
    await check('the edit undone: the same text, so marked again', true, 1);
}
