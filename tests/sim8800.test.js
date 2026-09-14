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
