/**
 * The Assembler tab's example sources, in examples/source/, as a
 * golden set: each assembles without an error and, run on the
 * simulator, does what its header says (T3 in docs/assembler.md).
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {createSim, flushTimers, bitsToNumber} = require('./fixture.js');
const {loadExample} = require('./examples.js');
const Asm8080 = require('../js/asm8080.js');
const Sio = require('../js/sio.js');
const Teletype = require('../js/teletype.js');

const SOURCE_DIR = path.join(__dirname, '..', 'examples', 'source');

/** Every example source's file name, without .asm. */
function sourceIds() {
    return fs.readdirSync(SOURCE_DIR)
        .filter((f) => f.endsWith('.asm'))
        .map((f) => path.basename(f, '.asm'))
        .sort();
}

/** Reads and assembles one example source. */
function assembled(id) {
    const text = fs.readFileSync(path.join(SOURCE_DIR, id + '.asm'), 'utf8');
    const result = Asm8080.assemble(text, {memSize: 256});
    assert.deepStrictEqual(result.errors, [], id + ' does not assemble');
    return {text: text, result: result};
}

/**
 * A powered-on simulator holding an example, with an 88-SIO and paper.
 * @param {string} id The example.
 * @param {Object<number, number>=} poke Bytes to put in memory too.
 */
function run(id, poke = {}) {
    const fixture = createSim();
    fixture.sim.powerOn();
    flushTimers();
    fixture.sim.initMem(false);
    for (const [address, byte] of assembled(id).result.memory) {
        fixture.sim.mem[address] = byte;
    }
    for (const [address, byte] of Object.entries(poke)) {
        fixture.sim.mem[Number(address)] = byte;
    }
    const tty = new Teletype();
    const sio = new Sio((byte) => tty.write(byte));
    sio.attachTo(fixture.sim);
    return {sim: fixture.sim, state: fixture.state, sio: sio, tty: tty};
}

test('every example source has a header, and the README lists it', () => {
    const ids = sourceIds();
    assert.strictEqual(ids.length, 7);
    const readme = fs.readFileSync(path.join(SOURCE_DIR, 'README.md'), 'utf8');
    for (const id of ids) {
        const {text} = assembled(id);
        assert.match(text, /^;;; name: .+$/m, id + ' needs a name');
        assert.match(text, /^;;; desc: .+$/m, id + ' needs a description');
        assert.match(text, /^;;; device: (panel|teletype)$/m,
                     id + ' needs to say where to watch');
        assert.ok(readme.includes('(' + id + '.asm)'),
                  'the README does not list ' + id);
    }
});

test('switches: the data lamps follow the sense switches', () => {
    const {sim, state} = run('switches');
    state.inputWord = 0xa500;
    sim.step(200);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xa5);
    state.inputWord = 0x3c00;
    sim.step(200);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x3c);
});

test('adder: the bytes of the hand-toggled program, and its sum', () => {
    const {result} = assembled('adder');
    const bytes = [];
    for (let a = 0; a < result.size; a++) bytes.push(result.memory.get(a));
    assert.deepStrictEqual(bytes, loadExample('adder').bytes);
    const {sim} = run('adder', {0x80: 1, 0x81: 2});
    sim.step(200);
    assert.strictEqual(sim.mem[0x82], 3);
});

test('hello: prints its greeting once, and halts', () => {
    const {sim, tty} = run('hello');
    sim.step(4000);
    assert.strictEqual(tty.getText(), 'HELLO, WORLD!\n');
    assert.strictEqual(sim.halted, true);
});

test('echo: prints back what is typed, a new line after RETURN', () => {
    const {sim, sio, tty} = run('echo');
    sio.receiveText('HI');
    sim.step(4000);
    assert.strictEqual(tty.getText(), 'HI');
    sio.receive(0x0d);
    sio.receiveText('THERE');
    sim.step(8000);
    assert.strictEqual(tty.getText(), 'HI\nTHERE');
});

test('multiply: the 16-bit product of two bytes', () => {
    for (const [x, y] of [[12, 13], [255, 255], [0, 99], [1, 200]]) {
        const {sim} = run('multiply', {0x80: x, 0x81: y});
        sim.step(4000);
        assert.strictEqual(sim.halted, true);
        assert.strictEqual(sim.mem[0x82] | (sim.mem[0x83] << 8), x * y,
                           x + ' x ' + y);
    }
});

test('print-number: three decimal digits', () => {
    for (const [value, printed] of [[156, '156'], [7, '007'], [255, '255'],
                                    [40, '040']]) {
        const {sim, tty} = run('print-number', {0x80: value});
        sim.step(8000);
        assert.strictEqual(tty.getText(), printed + '\n');
        assert.strictEqual(sim.halted, true);
    }
});

test('macros: a lamp walks right, one place per delay', () => {
    const {sim, state} = run('macros');
    sim.step(300);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x80, 'it starts left');
    // 3000H rounds of the delay, 25 cycles each, between the steps.
    sim.step(0x3000 * 26);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x40);
    sim.step(0x3000 * 25);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x20);
    // Two DELAYs, each with its own LOOP.
    const {result} = assembled('macros');
    assert.strictEqual(result.symbols.LOOP, undefined,
                       'LOOP is local to each expansion');
});
