/**
 * Unit tests for the front panel simulator (js/sim8800.js), covering
 * the front panel controls, the CPU wiring and single stepping. The
 * example programs themselves are covered by examples.test.js.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {Sim8800, createSim, flushTimers, bitsToNumber} =
      require('./fixture.js');
const {loadExample} = require('./examples.js');

/**
 * Programs used here to drive the simulator. What each one does is
 * checked in examples.test.js; these tests only need something to run.
 */
const ADDER = loadExample('adder').hex;
const PATTERN_SHIFT = loadExample('pattern-shift').hex;

/**
 * Creates a powered-on simulator with the reset LED blink flushed and
 * its memory zeroed.
 *
 * powerOn() fills memory with random bytes, the way the real machine
 * comes up. Tests that are not about that behaviour zero it again, so
 * that whatever they load is the only thing in memory and a run that
 * falls off the end of a program behaves the same way every time. The
 * power-on contents are covered by their own test below.
 */
function poweredOnSim() {
    const fixture = createSim();
    fixture.sim.powerOn();
    flushTimers();
    fixture.sim.initMem(false);
    return fixture;
}

test('static helpers: toHex and parseBits', () => {
    assert.strictEqual(Sim8800.toHex(0x5, 2), '05');
    assert.strictEqual(Sim8800.toHex(0xabc, 4), '0ABC');
    assert.deepStrictEqual(Sim8800.parseBits(0x80, 8),
                           [0, 0, 0, 0, 0, 0, 0, 1]);
    assert.deepStrictEqual(Sim8800.parseBits(0x03, 4), [1, 1, 0, 0]);
});

test('powerOn initializes memory, LEDs and dumps', () => {
    const {sim, state} = createSim();
    sim.powerOn();
    assert.strictEqual(sim.isPoweredOn, true);
    assert.strictEqual(state.statusLedsArg, true);
    assert.strictEqual(state.waitLedArg, false);
    // The real machine comes up with garbage in memory, so powerOn
    // fills it with random bytes rather than zeros.
    assert.strictEqual(sim.mem.length, 256);
    assert.ok(sim.mem.every(
        (byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255));
    assert.ok(sim.mem.some((byte) => byte !== sim.mem[0]),
              'memory should come up randomized, not uniform');
    // reset() blinks all LEDs on, then a timer turns them off.
    assert.strictEqual(bitsToNumber(state.addressLeds), 0xffff);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xff);
    flushTimers();
    assert.strictEqual(bitsToNumber(state.addressLeds), 0);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0);
    assert.ok(state.cpuDump.includes('PC = 0000'));
    assert.ok(state.memDump.includes('0000'));
});

test('powerOff clears LEDs and dumps', () => {
    const {sim, state} = poweredOnSim();
    sim.powerOff();
    assert.strictEqual(sim.isPoweredOn, false);
    assert.strictEqual(state.statusLedsArg, false);
    assert.strictEqual(bitsToNumber(state.addressLeds), 0);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0);
    assert.strictEqual(state.cpuDump, '');
    assert.strictEqual(state.memDump, '');
});

test('controls are no-ops while powered off', () => {
    const {sim, state} = createSim();
    const memBefore = sim.mem.slice();
    state.inputWord = 0x55;
    sim.loadDataAsHexString(0, 'c3 00 00');
    sim.loadData(0, [1, 2, 3]);
    sim.deposit();
    sim.examine();
    sim.step(100);
    sim.start();
    assert.deepStrictEqual(sim.mem, memBefore);
    assert.strictEqual(sim.isRunning, false);
    assert.strictEqual(state.addressLeds, null);
});

test('loadData and loadDataAsHexString write into memory', () => {
    const {sim} = poweredOnSim();
    sim.loadData(0x80, [1, 2]);
    assert.strictEqual(sim.mem[0x80], 1);
    assert.strictEqual(sim.mem[0x81], 2);
    sim.loadDataAsHexString(0, 'c3 00 00');
    assert.deepStrictEqual(sim.mem.slice(0, 3), [0xc3, 0, 0]);
});

test('examine and deposit drive LEDs and memory like the real panel', () => {
    const {sim, state} = poweredOnSim();

    // EXAMINE address 0x34.
    state.inputWord = 0x34;
    sim.examine();
    assert.strictEqual(bitsToNumber(state.addressLeds), 0x34);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x00);

    // DEPOSIT 0x55 at the examined address. Only the low 8 input bits
    // are considered.
    state.inputWord = 0xff55;
    sim.deposit();
    assert.strictEqual(sim.mem[0x34], 0x55);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x55);

    // DEPOSIT NEXT writes to the following address.
    state.inputWord = 0x66;
    sim.depositNext();
    assert.strictEqual(sim.mem[0x35], 0x66);
    assert.strictEqual(bitsToNumber(state.addressLeds), 0x35);

    // EXAMINE NEXT moves to the following address.
    sim.examineNext();
    assert.strictEqual(bitsToNumber(state.addressLeds), 0x36);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x00);
});

test('start/stop toggle the running state and the WAIT LED', () => {
    const {sim, state} = poweredOnSim();
    sim.start();
    assert.strictEqual(sim.isRunning, true);
    assert.strictEqual(state.waitLedArg, true);
    sim.stop();
    assert.strictEqual(sim.isRunning, false);
    assert.strictEqual(state.waitLedArg, false);
    flushTimers();  // The pending clock tick must do nothing once stopped.
    assert.strictEqual(sim.isRunning, false);
});

test('reset stops the CPU and resets PC to 0', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, 'c3 00 00');  // JMP 0000h
    sim.step(50);
    sim.start();
    sim.reset();
    assert.strictEqual(sim.isRunning, false);
    flushTimers();
    assert.ok(state.cpuDump.includes('PC = 0000'));
});

test('the RESET flash puts the lamps out when nothing is running', () => {
    const {sim, state} = poweredOnSim();
    sim.reset();
    // RESET lights every lamp for 400 ms, the way the real panel does.
    assert.strictEqual(bitsToNumber(state.addressLeds), 0xffff);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xff);
    flushTimers();
    assert.strictEqual(bitsToNumber(state.addressLeds), 0);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0);
});

test('a program started inside the RESET flash keeps the data LEDs', () => {
    const {sim, state} = poweredOnSim();
    // MVI A,8Ch / OUT FFh / HLT - writes the lamps once and stops, the
    // shape tty-leds has. A program that rewrites them continuously
    // would repair itself and hide this.
    sim.loadDataAsHexString(0, '3e 8c d3 ff 76');
    sim.reset();
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xff, 'flash is on');

    sim.step(20);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x8c,
                       'the program owns the lamps now');

    // The flash's pending timeout must not wipe what the program wrote.
    flushTimers();
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x8c,
                       'the superseded flash must leave the lamps alone');
});

test('RUN ends the RESET flash immediately', () => {
    const {sim, state} = poweredOnSim();
    sim.reset();
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xff);
    sim.start();
    assert.strictEqual(bitsToNumber(state.dataLeds), 0,
                       'pressing RUN hands the lamps over at once');
    assert.strictEqual(bitsToNumber(state.addressLeds), 0);
    sim.stop();
});

test('a second RESET supersedes the first flash', () => {
    const {sim, state} = poweredOnSim();
    sim.reset();
    sim.reset();
    // Two flashes are pending; the first must not put the lamps out
    // early and leave the second one's flash half length.
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xff);
    flushTimers();
    assert.strictEqual(bitsToNumber(state.dataLeds), 0);
    assert.strictEqual(sim.resetFlashPending, false);
});

test('reset clears the program counter and leaves the registers', () => {
    const {sim} = poweredOnSim();
    // MVI A,12h / MVI B,34h / LXI SP,0080h
    sim.loadDataAsHexString(0, '3e 12 06 34 31 80 00');
    sim.step(40);
    assert.strictEqual(CPU8080.status().a, 0x12);
    assert.strictEqual(CPU8080.status().sp, 0x0080);

    sim.reset();
    const cpu = CPU8080.status();
    // The 8080's RESET line clears the program counter, and nothing
    // else. Software depends on it: MITS BASIC's warm start assumes
    // the stack pointer survived.
    assert.strictEqual(cpu.pc, 0);
    assert.strictEqual(cpu.a, 0x12, 'A should survive RESET');
    assert.strictEqual(cpu.b, 0x34, 'B should survive RESET');
    assert.strictEqual(cpu.sp, 0x0080, 'SP should survive RESET');
});

test('powering on clears the CPU, unlike RESET', () => {
    const {sim} = poweredOnSim();
    sim.loadDataAsHexString(0, '3e 12 06 34 31 80 00');
    sim.step(40);
    sim.powerOff();
    sim.powerOn();
    flushTimers();
    const cpu = CPU8080.status();
    assert.strictEqual(cpu.a, 0);
    assert.strictEqual(cpu.b, 0);
    assert.strictEqual(cpu.sp, 0);
});

test('step shows PC on the address LEDs for ordinary programs', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, '00 00');  // Two NOPs, 8 cycles.
    sim.step(8);
    assert.strictEqual(bitsToNumber(state.addressLeds), 2);
});

test('IN from ports other than FFh reads 0', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, 'db 12 d3 ff');  // IN 12h; OUT FFh.
    state.inputWord = 0xffff;
    sim.step(20);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0);
});

test('single step on an LDAX D instruction shows DE on the LEDs', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, '16 12 1e 34 1a');  // MVI D; MVI E; LDAX D.
    sim.step(1);  // MVI D,12h
    sim.step(1);  // MVI E,34h
    assert.strictEqual(bitsToNumber(state.addressLeds), 4);  // PC.
    sim.step(1);  // LDAX D: the address bus shows DE.
    assert.strictEqual(bitsToNumber(state.addressLeds), 0x1234);
});

test('singleStep shows the next opcode on the data LEDs (issue #2)', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, ADDER);  // 3a 80 00 47 3a 81 00 80 ...
    sim.singleStep();  // LDA 0080h; PC is now 3, next opcode is MOV B,A.
    assert.strictEqual(bitsToNumber(state.addressLeds), 3);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x47);
    sim.singleStep();  // MOV B,A; next opcode is LDA.
    assert.strictEqual(bitsToNumber(state.addressLeds), 4);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x3a);
});

test('singleStep on LDAX D shows the byte read at DE (issue #2)', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, '16 00 1e 80 1a');  // MVI D,0; MVI E,80h; LDAX D.
    sim.loadData(0x80, [0xa5]);
    sim.singleStep();  // MVI D,00h
    sim.singleStep();  // MVI E,80h
    sim.singleStep();  // LDAX D: address LEDs show DE, data LEDs the byte read.
    assert.strictEqual(bitsToNumber(state.addressLeds), 0x0080);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xa5);
});

test('singleStep is a no-op while powered off', () => {
    const {sim, state} = createSim();
    sim.singleStep();
    assert.strictEqual(state.addressLeds, null);
    assert.strictEqual(state.dataLeds, null);
});

test('free-running step leaves the data LEDs to OUT FFh', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, PATTERN_SHIFT);
    sim.step(17);  // MVI A,8Ch + OUT FFh: data LEDs show 8Ch.
    sim.step(100); // Keep running: only OUT may change the data LEDs.
    const shown = bitsToNumber(state.dataLeds);
    const validOutputs = [0x8c, 0x46, 0x23, 0x91, 0xc8, 0x64, 0x32, 0x19];
    assert.ok(validOutputs.includes(shown),
              'data LEDs must show a rotation of 8Ch, got ' + shown);
});

/**
 * Phase 1 of the 4K BASIC work: the memory model, the I/O device
 * table and the coalescing of the debugger dumps. See
 * ../docs/ms-basic-4k.md.
 */

test('memory above the installed size reads FFh and swallows writes', () => {
    const {sim} = poweredOnSim();
    const read = sim.getReadByteCallback();
    const write = sim.getWriteByteCallback();

    sim.mem[0] = 0x11;
    sim.mem[1] = 0x22;
    // 0100h is one past the top of a 256 byte machine. It must not be
    // mirrored back onto 0000h.
    assert.strictEqual(read(0x0100), 0xff);
    write(0x0100, 0x99);
    assert.strictEqual(sim.mem[0], 0x11);
    assert.strictEqual(sim.mem.length, 256);
    // Nor anywhere else above the top.
    assert.strictEqual(read(0x8000), 0xff);
    write(0x8001, 0x99);
    assert.strictEqual(sim.mem[1], 0x22);
    // Addresses inside the machine are untouched by any of this.
    write(0x34, 0x56);
    assert.strictEqual(read(0x34), 0x56);
});

test('the memory size probe terminates (issue behind 4K BASIC)', () => {
    const {sim} = poweredOnSim();
    // The shape of MITS BASIC's own probe, in twelve bytes: walk
    // upwards writing 37h and reading it back, and stop where the
    // read-back fails. With memory mirrored instead of bounded, this
    // wraps onto itself, overwrites the program and never stops.
    //
    //   0000  21 f0 00   LXI H,00F0h
    //   0003  23         INX H
    //   0004  3e 37      MVI A,37h
    //   0006  77         MOV M,A
    //   0007  be         CMP M
    //   0008  ca 03 00   JZ 0003h     ; still memory, keep walking
    //   000b  76         HLT          ; found the top
    sim.loadDataAsHexString(0, '21 f0 00 23 3e 37 77 be ca 03 00 76');
    sim.step(5000);

    const cpu = CPU8080.status();
    assert.strictEqual((cpu.h << 8) | cpu.l, 0x0100,
                       'the probe should stop one past the top');
    assert.strictEqual(sim.mem[0xff], 0x37, 'the last byte is memory');
    assert.strictEqual(sim.mem[0], 0x21, 'the program is not overwritten');
});

test('EXAMINE above the top shows FFh rather than a stray byte', () => {
    const {sim, state} = poweredOnSim();
    state.inputWord = 0x0140;   // above a 256 byte machine
    sim.examine();
    assert.strictEqual(bitsToNumber(state.addressLeds), 0x0140);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xff);
    // DEPOSIT there must go nowhere - and in particular must not land
    // at 0140h mod 256, which is what it used to do.
    state.inputWord = 0x0155;
    sim.deposit();
    assert.notStrictEqual(sim.mem[0x40], 0x55);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xff);
});

test('EXAMINE NEXT wraps at the top of the 16 bit address space', () => {
    const {sim, state} = poweredOnSim();
    state.inputWord = 0xffff;
    sim.examine();
    sim.examineNext();
    assert.strictEqual(sim.lastAddress, 0);
    assert.strictEqual(bitsToNumber(state.addressLeds), 0);
});

test('devices can be attached to any port', () => {
    const {sim, state} = poweredOnSim();
    const written = [];
    sim.attachDevice(0x12, {
        readPort: (port) => 0xa5,
        writePort: (port, value) => { written.push([port, value]); },
    });
    // IN 12h; OUT 12h; OUT FFh - the last one proves the front panel
    // is still a device like any other.
    sim.loadDataAsHexString(0, 'db 12 d3 12 d3 ff');
    sim.step(40);
    assert.deepStrictEqual(written, [[0x12, 0xa5]]);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xa5);
});

test('a device may implement only one direction', () => {
    const {sim} = poweredOnSim();
    sim.attachDevice(0x20, {readPort: () => 0x7e});   // no writePort
    sim.attachDevice(0x21, {writePort: () => {}});    // no readPort
    const read = sim.getReadPortCallback();
    const write = sim.getWritePortCallback();
    assert.strictEqual(read(0x20), 0x7e);
    assert.doesNotThrow(() => write(0x20, 1));
    assert.strictEqual(read(0x21), 0);
    assert.doesNotThrow(() => write(0x21, 1));
});

test('dumps coalesce onto a scheduler instead of firing every batch', () => {
    const {sim, state} = poweredOnSim();
    const scheduled = [];
    sim.dumpScheduler = (flush) => { scheduled.push(flush); };
    sim.loadDataAsHexString(0, '00 00 00 00');   // NOPs
    state.memDump = null;

    // Many batches, and nothing is rendered yet.
    for (let i = 0; i < 20; i++) {
        sim.step(8);
    }
    assert.strictEqual(state.memDump, null);
    assert.strictEqual(scheduled.length, 1, 'requests coalesce into one');

    scheduled[0]();
    assert.ok(state.memDump.includes('0000'));
    assert.ok(state.cpuDump.includes('PC ='));

    // Once flushed, the next batch asks again.
    sim.step(8);
    assert.strictEqual(scheduled.length, 2);
});

test('dumpFilter skips the dumps while nobody is looking', () => {
    const {sim, state} = poweredOnSim();
    let visible = false;
    sim.dumpFilter = () => visible;
    state.memDump = null;

    sim.step(4);
    assert.strictEqual(state.memDump, null, 'nothing built while hidden');

    // Becoming visible again catches up, even though the filter is
    // still the only thing that changed.
    sim.flushDump(true);
    assert.ok(state.memDump.includes('0000'));

    state.memDump = null;
    visible = true;
    sim.step(4);
    assert.ok(state.memDump.includes('0000'), 'built again once visible');
});

test('a dump flush on a powered off machine stays blank', () => {
    const {sim, state} = poweredOnSim();
    sim.step(4);
    assert.ok(state.memDump.includes('0000'));

    sim.powerOff();
    assert.strictEqual(state.memDump, '');
    // Opening the debugger, or a repaint scheduled just before the
    // power went off, must not put the contents back.
    sim.flushDump(true);
    assert.strictEqual(state.memDump, '');
    assert.strictEqual(state.cpuDump, '');
});

/**
 * Phase 2: the installed memory size, and the memory dump's window.
 */

/** The hex part of a memory dump, without the map strip above it. */
function hexOf(memDump) {
    return memDump.split('<pre>')[1] || '';
}

/** Powers a machine of the given size on, zeroed, LED blink flushed. */
function sizedSim(memSize) {
    const fixture = createSim(memSize);
    fixture.sim.powerOn();
    flushTimers();
    fixture.sim.initMem(false);
    return fixture;
}

test('setMemSize installs memory and switches the machine off', () => {
    const {sim, state} = poweredOnSim();
    assert.strictEqual(sim.mem.length, 256);

    sim.setDumpWindow(0);
    sim.setMemSize(4096);
    assert.strictEqual(sim.mem.length, 4096);
    // You cannot add a board to a running machine.
    assert.strictEqual(sim.isPoweredOn, false);
    assert.strictEqual(state.memDump, '');
    assert.strictEqual(sim.dumpWindow, 0);
    // The new memory comes up with garbage in it, like the real thing.
    assert.ok(sim.mem.every((b) => Number.isInteger(b) && b >= 0 && b <= 255));
});

test('setMemSize to the size already installed does nothing', () => {
    const {sim} = poweredOnSim();
    sim.setMemSize(256);
    assert.strictEqual(sim.isPoweredOn, true, 'no pointless power cycle');
});

test('the 256 byte machine still dumps whole, with no map', () => {
    const {sim, state} = poweredOnSim();
    sim.flushDump(true);
    assert.ok(!state.memDump.includes('mem-map'),
              'nothing to navigate, so no map strip');
    assert.ok(hexOf(state.memDump).includes('0000'));
    assert.ok(hexOf(state.memDump).includes('00F0'), 'the last line is shown');
    assert.deepStrictEqual(sim.getDumpWindow(), {start: 0, end: 256});
});

test('a larger machine dumps one window, with a map of the rest', () => {
    const {sim, state} = sizedSim(8192);
    sim.flushDump(true);

    // One cell per 256 byte page: 8192 / 256 = 32.
    assert.strictEqual((state.memDump.match(/class="mem-page/g) || []).length,
                       32);
    // One window of hex, not the whole machine.
    assert.ok(hexOf(state.memDump).includes('0000'));
    assert.ok(hexOf(state.memDump).includes('00F0'));
    assert.ok(!hexOf(state.memDump).includes('0100'),
              'the window stops after 256 bytes');

    sim.setDumpWindow(0x0f40);
    sim.flushDump(true);
    assert.deepStrictEqual(sim.getDumpWindow(), {start: 0x0f00, end: 0x1000},
                           'the window aligns down to a page');
    assert.ok(hexOf(state.memDump).includes('0F00'));
    assert.ok(!hexOf(state.memDump).includes('0000'),
              'and only that window');
});

test('the dump window is clamped to the installed memory', () => {
    const {sim} = sizedSim(4096);
    sim.setDumpWindow(0x99999);
    assert.deepStrictEqual(sim.getDumpWindow(), {start: 0x0f00, end: 0x1000});
    sim.setDumpWindow(-100);
    assert.deepStrictEqual(sim.getDumpWindow(), {start: 0, end: 256});
});

test('FOLLOW PC moves the window to wherever the CPU is', () => {
    const {sim} = sizedSim(8192);
    // JMP 0500h, then sit in a loop there.
    sim.loadDataAsHexString(0, 'c3 00 05');
    sim.loadDataAsHexString(0x0500, 'c3 00 05');
    sim.setDumpWindow(0x1000);
    assert.strictEqual(sim.getDumpWindow().start, 0x1000);

    sim.setFollowPc(true);
    sim.step(40);
    assert.strictEqual(sim.getDumpWindow().start, 0x0500,
                       'the window followed the PC');

    // Turning it off leaves the window wherever it was pointed.
    sim.setFollowPc(false);
    sim.setDumpWindow(0x0200);
    sim.step(40);
    assert.strictEqual(sim.getDumpWindow().start, 0x0200);
});

test('the dump marks the bytes at PC and SP, and their pages', () => {
    const {sim, state} = sizedSim(4096);
    // LXI SP,0080h - puts the stack pointer somewhere findable.
    sim.loadDataAsHexString(0, '31 80 00 00');
    sim.step(20);
    sim.flushDump(true);

    assert.ok(/<span class="at-pc">[0-9A-F]{2}<\/span>/.test(state.memDump),
              'the byte at PC is marked');
    assert.ok(/<span class="at-sp">[0-9A-F]{2}<\/span>/.test(state.memDump),
              'the byte at SP is marked');
    // Both live in page 0 here, so that cell carries both marks.
    assert.ok(/class="mem-page mem-page-\d mem-page-shown mem-page-pc mem-page-sp"/
              .test(state.memDump));
});

test('map cells explain their own shading in a tooltip', () => {
    const {sim, state} = sizedSim(4096);
    // Page 0 half full, page 1 empty.
    for (let i = 0; i < 128; i++) {
        sim.mem[i] = 0xff;
    }
    sim.flushDump(true);
    const titles = [...state.memDump.matchAll(/title="([^"]+)"/g)]
          .map((m) => m[1]);
    assert.strictEqual(titles[0], '0000-00FF  50%');
    assert.strictEqual(titles[1], '0100-01FF  0%');
    assert.strictEqual(titles[15], '0F00-0FFF  0%');
});

test('map cells carry the address they jump to', () => {
    const {sim, state} = sizedSim(4096);
    sim.flushDump(true);
    const addresses = [...state.memDump.matchAll(/data-address="(\d+)"/g)]
          .map((m) => Number(m[1]));
    assert.strictEqual(addresses.length, 16);
    assert.strictEqual(addresses[0], 0);
    assert.strictEqual(addresses[15], 0x0f00);
});
