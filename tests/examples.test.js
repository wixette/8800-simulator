/**
 * The example programs in examples/ as a golden set.
 *
 * Every listing is checked against the disassembler, so the bytes and
 * the source printed next to them cannot drift apart, and every program
 * is run on the simulator and checked for what it is supposed to do.
 * Adding a listing to examples/ adds it to the checks below.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {createSim, flushTimers, bitsToNumber, highAddressLeds} =
      require('./fixture.js');
const {EXAMPLES_DIR, loadExamples, loadExample, normalizeSource} =
      require('./examples.js');
const cpu = require('../js/8080.js');
const Sio = require('../js/sio.js');
const Teletype = require('../js/teletype.js');
const fs = require('node:fs');
const path = require('node:path');

const EXAMPLES = loadExamples();

/** Creates a powered-on simulator holding the given example at its org. */
function simFor(example) {
    const fixture = createSim();
    fixture.sim.powerOn();
    flushTimers();
    fixture.sim.initMem(false);
    fixture.sim.loadData(example.org, example.bytes);
    return fixture;
}

test('examples/ holds listings to check', () => {
    assert.ok(EXAMPLES.length >= 5,
              'expected the example programs, found ' + EXAMPLES.length);
    for (const example of EXAMPLES) {
        assert.ok(example.name, example.id + ' needs a name');
        assert.ok(example.desc, example.id + ' needs a description');
        assert.ok(example.bytes.length > 0, example.id + ' has no bytes');
    }
});

test('examples/README.md lists every program and its bytes', () => {
    const readme = fs.readFileSync(
        path.join(EXAMPLES_DIR, 'README.md'), 'utf8');
    for (const example of EXAMPLES) {
        assert.ok(readme.includes(example.id + '.asm'),
                  'README.md does not link ' + example.id + '.asm');
        assert.ok(readme.includes(example.hex),
                  'README.md does not carry the bytes of ' + example.id +
                      '; the listing has: ' + example.hex);
    }
});

for (const example of EXAMPLES) {
    test(example.id + ': the bytes match the source next to them', () => {
        for (const line of example.lines) {
            if (line.isData) {
                continue;  // A DB directive; there is nothing to decode.
            }
            const [text, length] = cpu.disasm(
                line.bytes[0], line.bytes[1] || 0, line.bytes[2] || 0);
            assert.strictEqual(
                length, line.bytes.length,
                example.id + ' at ' + line.address.toString(16) + ': ' +
                    line.source + ' takes ' + length + ' bytes, the listing ' +
                    'gives ' + line.bytes.length);
            assert.strictEqual(
                normalizeSource(text), normalizeSource(line.source, example.labels),
                example.id + ' at ' + line.address.toString(16) +
                    ': the bytes disassemble to "' + text + '", the listing ' +
                    'says "' + line.source + '"');
        }
    });

    test(example.id + ': the listing runs straight through memory', () => {
        let expected = example.org;
        for (const line of example.lines) {
            assert.strictEqual(
                line.address, expected,
                example.id + ': expected an instruction at ' +
                    expected.toString(16) + ', the listing has one at ' +
                    line.address.toString(16));
            expected += line.bytes.length;
        }
    });

    test(example.id + ': runs without leaving its own code', () => {
        const {sim} = simFor(example);
        const limit = example.org + example.bytes.length;
        for (let i = 0; i < 20; i++) {
            sim.step(2000);
            const pc = cpu.status().pc;
            assert.ok(pc >= example.org && pc <= limit,
                      example.id + ': PC ran to ' + pc.toString(16) +
                          ', outside the program at ' +
                          example.org.toString(16) + '-' + limit.toString(16));
        }
    });
}

/**
 * Creates a powered-on simulator holding the example, with an 88-SIO
 * and a sheet of teletype paper plugged in.
 */
function ttySimFor(id) {
    const fixture = simFor(loadExample(id));
    const tty = new Teletype();
    const sio = new Sio((byte) => tty.write(byte));
    sio.attachTo(fixture.sim);
    return {sim: fixture.sim, state: fixture.state, sio: sio, tty: tty};
}

test('tty-echo: prints back what is typed', () => {
    const {sim, sio, tty} = ttySimFor('tty-echo');
    sio.receiveText('PRINT 1');
    sim.step(2000);
    assert.strictEqual(tty.getText(), 'PRINT 1');

    // It keeps waiting, so later keys are echoed too.
    sio.receiveText('0');
    sim.step(500);
    assert.strictEqual(tty.getText(), 'PRINT 10');
});

test('tty-leds: echoes, and shows the ASCII code on the data LEDs', () => {
    const {sim, state, sio, tty} = ttySimFor('tty-leds');
    sio.receiveText('A');
    sim.step(500);
    assert.strictEqual(tty.getText(), 'A');
    // 'A' is 41h: 01000001 on the data LEDs.
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x41);

    sio.receiveText('B');
    sim.step(500);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x42);
});

test('tty-hello: prints its message once and halts', () => {
    const {sim, tty} = ttySimFor('tty-hello');
    sim.step(4000);
    assert.strictEqual(tty.getText(), 'HELLO, WORLD!\n');
    // HLT, so running longer prints nothing more.
    sim.step(4000);
    assert.strictEqual(tty.getText(), 'HELLO, WORLD!\n');
});

test('tty-ascii: prints the printable set, wrapping at the margin', () => {
    const {sim, tty} = ttySimFor('tty-ascii');
    sim.step(20000);   // ~69 cycles per character, 95 of them
    // 20h to 7Eh is 95 characters on a 72 column carriage.
    assert.strictEqual(tty.getText().replace(/\n/g, '').length, 95);
    assert.ok(tty.getText().startsWith(' !"#$%&'));
    assert.ok(tty.getText().endsWith('}~'));
    assert.strictEqual(tty.lines.length, 2, 'the carriage wrapped once');
    assert.strictEqual(tty.lines[0].length, 72);
});

test('adder: adds the two bytes it is given', () => {
    const {sim} = simFor(loadExample('adder'));
    sim.loadData(0x80, [1, 2]);
    sim.step(200);
    assert.strictEqual(sim.mem[0x82], 3);

    // It loops, so new operands are picked up on the next pass.
    sim.loadData(0x80, [0x10, 0x20]);
    sim.step(200);
    assert.strictEqual(sim.mem[0x82], 0x30);
});

test('pattern shift: 8Ch rotates right across the data LEDs', () => {
    const {sim, state} = simFor(loadExample('pattern-shift'));
    sim.step(17);  // MVI A,8Ch (7) + OUT FFh (10).
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x8c);

    // Every later value is a rotation of the same pattern.
    const rotations = [0x8c, 0x46, 0x23, 0x91, 0xc8, 0x64, 0x32, 0x19];
    for (let i = 0; i < 8; i++) {
        sim.step(100);
        assert.ok(rotations.includes(bitsToNumber(state.dataLeds)),
                  'data LEDs must hold a rotation of 8Ch, got ' +
                      bitsToNumber(state.dataLeds));
    }
});

test('I/O echo: the data LEDs follow the sense switches', () => {
    const {sim, state} = simFor(loadExample('io-echo'));
    state.inputWord = 0xab12;  // The sense switches are A15-A8.
    sim.step(20);              // IN FFh (10) + OUT FFh (10).
    assert.strictEqual(bitsToNumber(state.dataLeds), 0xab);

    // One pass is IN (10) + OUT (10) + JMP (10), so give it a full loop
    // to pick the new value up.
    state.inputWord = 0x5a00;
    sim.step(60);
    assert.strictEqual(bitsToNumber(state.dataLeds), 0x5a);
});

test('bouncing light: one dark bit walks the row and turns around', () => {
    const {sim, state} = simFor(loadExample('bouncing-light'));
    state.inputWord = 0;  // Switches down: the fastest setting.

    // The program writes the complement of a single set bit, so the
    // display is one dark LED on a lit row.
    const positions = [];
    for (let i = 0; i < 40; i++) {
        sim.step(4000);
        const shown = bitsToNumber(state.dataLeds);
        const dark = (~shown) & 0xff;
        assert.ok(dark !== 0 && (dark & (dark - 1)) === 0,
                  'exactly one LED must be dark, data LEDs held ' +
                      shown.toString(16));
        const position = Math.log2(dark);
        if (positions[positions.length - 1] !== position) {
            positions.push(position);
        }
    }

    // It moves one place at a time and only ever turns around at the
    // ends of the row, which is what makes it bounce instead of wrap.
    const seen = positions.join(',');
    let turns = 0;
    for (let i = 1; i < positions.length; i++) {
        const move = positions[i] - positions[i - 1];
        assert.ok(Math.abs(move) === 1,
                  'the bit moves one place at a time: ' + seen);
        if (i > 1 && move !== positions[i - 1] - positions[i - 2]) {
            turns++;
            assert.ok(positions[i - 1] === 0 || positions[i - 1] === 7,
                      'it may only turn around at D0 or D7: ' + seen);
        }
    }
    assert.ok(turns > 0, 'the bit should turn around: ' + seen);
});

test('bouncing light: raising the sense switches slows it down', () => {
    const stepsIn = function(inputWord) {
        const {sim, state} = simFor(loadExample('bouncing-light'));
        state.inputWord = inputWord;
        let moves = 0;
        let last = null;
        for (let i = 0; i < 30; i++) {
            sim.step(4000);
            const shown = bitsToNumber(state.dataLeds);
            if (last !== null && shown !== last) {
                moves++;
            }
            last = shown;
        }
        return moves;
    };
    assert.ok(stepsIn(0) > stepsIn(0xff00),
              'the bit should move less often with the switches raised');
});

test('kill the bit: the bit shows on the upper address LEDs (issue #1)', () => {
    const {sim, state} = simFor(loadExample('kill-the-bit'));
    // The game has no OUT; the display is the address bus side effect
    // of its LDAX D loop, which holds register D on A15-A8.
    sim.step(200);
    assert.strictEqual(highAddressLeds(state), 0x80);
});

test('kill the bit: the lit bit rotates over time', () => {
    const {sim, state} = simFor(loadExample('kill-the-bit'));
    let rotated = false;
    for (let i = 0; i < 20 && !rotated; i++) {
        sim.step(50000);
        if (highAddressLeds(state) == 0x40) {
            rotated = true;
        }
    }
    assert.ok(rotated, 'the lit bit should rotate from A15 to A14');
});

test('kill the bit: the matching sense switch kills the bit', () => {
    const {sim, state} = simFor(loadExample('kill-the-bit'));
    sim.step(200);
    const litBit = highAddressLeds(state);
    assert.notStrictEqual(litBit, 0);

    // Raise the switch under the lit bit until XRA D clears the display.
    state.inputWord = litBit << 8;
    let killed = false;
    for (let i = 0; i < 300 && !killed; i++) {
        sim.step(2000);
        if (cpu.status().d == 0) {
            killed = true;
        }
    }
    assert.ok(killed, 'XRA D should zero the display register');

    // Lower it again and the row stays dark.
    state.inputWord = 0;
    sim.step(300000);
    assert.strictEqual(highAddressLeds(state), 0);
});
