/**
 * Unit tests for the front panel simulator (js/sim8800.js), covering
 * the existing panel features and the Kill the Bit fix (issue #1).
 *
 * Run with: node --test tests/
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {Sim8800, createSim, flushTimers, bitsToNumber, highAddressLeds} =
      require('./fixture.js');

/** The demo programs from asm/tiny_programs.md. */
const ADDER = '3a 80 00 47 3a 81 00 80 32 82 00 c3 00 00';
const PATTERN_SHIFT = '3e 8c d3 ff 0f c3 02 00';
const IO_ECHO = 'db ff d3 ff c3 00 00';

/** Kill the Bit by Dean McDaniel, 1975. See doc/kill_the_bit.md. */
const KILL_THE_BIT =
      '21 00 00 16 80 01 0e 00 1a 1a 1a 1a 09 d2 08 00 db ff aa 0f 57 c3 08 00';

/** Creates a powered-on simulator with the reset LED blink flushed. */
function poweredOnSim() {
    const fixture = createSim();
    fixture.sim.powerOn();
    flushTimers();
    return fixture;
}

test('static helpers: toHex and parseBits', () => {
    assert.strictEqual(Sim8800.toHex(0x5, 2), '05');
    assert.strictEqual(Sim8800.toHex(0xabc, 4), '0abc');
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
    assert.ok(sim.mem.every((byte) => byte == 0));
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
    state.inputWord = 0x55;
    sim.loadDataAsHexString(0, 'c3 00 00');
    sim.loadData(0, [1, 2, 3]);
    sim.deposit();
    sim.examine();
    sim.step(100);
    sim.start();
    assert.ok(sim.mem.every((byte) => byte == 0 || byte === undefined));
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
    // Memory is all NOPs; two NOPs take 8 cycles.
    sim.step(8);
    assert.strictEqual(bitsToNumber(state.addressLeds), 2);
});

test('adder demo: 1 + 2 = 3', () => {
    const {sim} = poweredOnSim();
    sim.loadDataAsHexString(0, ADDER);
    sim.loadData(0x80, [1, 2]);
    sim.step(200);
    assert.strictEqual(sim.mem[0x82], 3);
});

test('pattern shift demo: OUT FFh drives the data LEDs', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, PATTERN_SHIFT);
    sim.step(17);  // MVI A,8Ch (7) + OUT FFh (10).
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x8c);
});

test('I/O echo demo: IN FFh reads the high 8 address switches', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, IO_ECHO);
    state.inputWord = 0xab12;  // Sense switches are A15-A8.
    sim.step(20);              // IN FFh (10) + OUT FFh (10).
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xab);
});

test('IN from ports other than FFh reads 0', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, 'db 12 d3 ff');  // IN 12h; OUT FFh.
    state.inputWord = 0xffff;
    sim.step(20);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0);
});

test('kill the bit: LDAX D lights the high address LEDs (issue #1)', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, KILL_THE_BIT);
    // A short run reaches the LDAX D display loop; the initial bit
    // pattern in D is 80h.
    sim.step(200);
    assert.strictEqual(highAddressLeds(state), 0x80);
});

test('kill the bit: the lit bit rotates over time', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, KILL_THE_BIT);
    // One full delay loop takes roughly 230K cycles, after which the
    // bit moves from A15 to A14.
    let rotated = false;
    for (let i = 0; i < 20 && !rotated; i++) {
        sim.step(50000);
        if (highAddressLeds(state) == 0x40) {
            rotated = true;
        }
    }
    assert.ok(rotated, 'the lit bit should rotate from A15 to A14');
});

test('kill the bit: raising the matching sense switch kills the bit', () => {
    const {sim, state} = poweredOnSim();
    sim.loadDataAsHexString(0, KILL_THE_BIT);
    sim.step(200);
    const litBit = highAddressLeds(state);
    assert.notStrictEqual(litBit, 0);

    // Raise the sense switch right over the lit bit and run until the
    // program reads it (IN FFh; XRA D zeroes the display register).
    state.inputWord = litBit << 8;
    let killed = false;
    for (let i = 0; i < 300 && !killed; i++) {
        sim.step(2000);
        if (global.CPU8080.status().d == 0) {
            killed = true;
        }
    }
    assert.ok(killed, 'XRA D should zero the display register');

    // Lower the switch; with no bits left the high LEDs stay dark.
    state.inputWord = 0;
    sim.step(300000);
    assert.strictEqual(highAddressLeds(state), 0);
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
