/**
 * Unit tests for the 88-SIO board (js/sio.js) and the ASR-33 paper
 * model (js/teletype.js). See ../docs/ms-basic-4k.md.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {createSim, flushTimers} = require('./fixture.js');
const Sio = require('../js/sio.js');
const Teletype = require('../js/teletype.js');

/** A powered-on machine with a zeroed memory and an SIO plugged in. */
function simWithSio(memSize = 256) {
    const fixture = createSim(memSize);
    fixture.sim.powerOn();
    flushTimers();
    fixture.sim.initMem(false);
    const printed = [];
    const sio = new Sio((byte) => printed.push(byte));
    sio.attachTo(fixture.sim);
    return {sim: fixture.sim, state: fixture.state, sio, printed};
}

test('the status port is active low', () => {
    const sio = new Sio();
    // Nothing typed: the "no input" bit is SET.
    assert.strictEqual(sio.readStatus() & Sio.STATUS_NO_INPUT,
                       Sio.STATUS_NO_INPUT);
    sio.receive(0x41);
    // A character is waiting: the bit is CLEAR. Getting this backwards
    // makes BASIC hang silently with no output at all.
    assert.strictEqual(sio.readStatus() & Sio.STATUS_NO_INPUT, 0);
    // The transmitter is never busy here.
    assert.strictEqual(sio.readStatus() & Sio.STATUS_OUTPUT_BUSY, 0);

    assert.strictEqual(sio.readData(), 0x41);
    assert.strictEqual(sio.readStatus() & Sio.STATUS_NO_INPUT,
                       Sio.STATUS_NO_INPUT);
    assert.strictEqual(sio.readData(), 0, 'reading an empty port gives 0');
});

test('the board answers two ports, status then data', () => {
    const sent = [];
    const sio = new Sio((b) => sent.push(b));
    sio.receiveText('OK');
    assert.strictEqual(sio.readPort(0x00) & Sio.STATUS_NO_INPUT, 0);
    assert.strictEqual(sio.readPort(0x01), 0x4f);   // 'O'
    assert.strictEqual(sio.readPort(0x01), 0x4b);   // 'K'
    sio.writePort(0x01, 0x21);
    assert.deepStrictEqual(sent, [0x21]);
    // Writing the status port is the control register; harmless.
    sio.writePort(0x00, 0x03);
    assert.deepStrictEqual(sent, [0x21], 'control writes print nothing');
});

test('the board can be strapped to the 2SIO ports instead', () => {
    const {sim} = simWithSio();
    const sio = new Sio();
    sio.attachTo(sim, 0x10);
    sio.receive(0x5a);
    const read = sim.getReadPortCallback();
    assert.strictEqual(read(0x10) & Sio.STATUS_NO_INPUT, 0);
    assert.strictEqual(read(0x11), 0x5a);
});

test('a program echoes what is typed, through the real CPU', () => {
    const {sim, sio, printed} = simWithSio();
    // examples/tty-echo.asm
    sim.loadDataAsHexString(
        0, 'db 00 e6 01 c2 00 00 db 01 e6 7f d3 01 c3 00 00');
    sio.receiveText('HI');
    sim.step(400);
    assert.deepStrictEqual(printed, [0x48, 0x49]);
});

test('reset throws away anything typed but not yet read', () => {
    const sio = new Sio();
    sio.receiveText('XYZ');
    sio.reset();
    assert.strictEqual(sio.readStatus() & Sio.STATUS_NO_INPUT,
                       Sio.STATUS_NO_INPUT);
});

test('the paper separates carriage return from line feed', () => {
    const tty = new Teletype();
    // What MITS BASIC actually emits between lines.
    tty.writeText('OK\r\r\nREADY');
    assert.strictEqual(tty.getText(), 'OK\nREADY');
});

test('printing after a carriage return overprints the line', () => {
    const tty = new Teletype();
    tty.writeText('HELLO\rBYE');
    assert.strictEqual(tty.getText(), 'BYELO');
});

test('the eighth bit is stripped, as the printer stripped it', () => {
    const tty = new Teletype();
    // BASIC sets bit 7 on the last character of every message.
    tty.writeText('MEMORY SIZ');
    tty.write(0xc5);       // 'E' | 0x80
    tty.writeText('? ');
    assert.strictEqual(tty.getText(), 'MEMORY SIZE? ');
});

test('control characters print nothing', () => {
    const tty = new Teletype();
    tty.write(0x07);       // bell
    tty.write(0x00);
    tty.writeText('A');
    tty.write(0x7f);       // rubout
    assert.strictEqual(tty.getText(), 'A');
});

test('the carriage wraps at the width of the paper', () => {
    const tty = new Teletype(10);
    tty.writeText('ABCDEFGHIJKL');
    assert.deepStrictEqual(tty.lines, ['ABCDEFGHIJ', 'KL']);
    assert.strictEqual(tty.column, 2);
});

test('the roll is trimmed once it gets long', () => {
    const tty = new Teletype(72, 3);
    tty.writeText('1\n2\n3\n4\n');
    assert.strictEqual(tty.lines.length, 3);
    assert.ok(!tty.getText().includes('1'), 'the top of the roll fell off');
    assert.ok(tty.getText().includes('4'));
});

test('clear tears off the paper', () => {
    const tty = new Teletype();
    tty.writeText('SOMETHING');
    tty.clear();
    assert.strictEqual(tty.getText(), '');
    assert.strictEqual(tty.column, 0);
});

test('the keyboard is upper case, with BASIC editing keys', () => {
    // Lower case would earn a ?SN ERROR from BASIC, so it is folded.
    assert.strictEqual(Teletype.keyToByte('a'), 0x41);
    assert.strictEqual(Teletype.keyToByte('Z'), 0x5a);
    assert.strictEqual(Teletype.keyToByte('7'), 0x37);
    assert.strictEqual(Teletype.keyToByte('"'), 0x22);
    assert.strictEqual(Teletype.keyToByte(' '), 0x20);

    assert.strictEqual(Teletype.keyToByte('Enter'), Teletype.CR);
    // BASIC rubs out with underscore and kills the line with at sign.
    assert.strictEqual(Teletype.keyToByte('Backspace'), Teletype.RUBOUT);
    assert.strictEqual(Teletype.keyToByte('Escape'), Teletype.KILL_LINE);
    assert.strictEqual(Teletype.keyToByte('c', true), Teletype.BREAK);
    assert.strictEqual(Teletype.keyToByte('u', true), Teletype.KILL_LINE);

    // Keys the ASR-33 never had send nothing at all.
    assert.strictEqual(Teletype.keyToByte('ArrowLeft'), null);
    assert.strictEqual(Teletype.keyToByte('F5'), null);
    assert.strictEqual(Teletype.keyToByte('Shift'), null);
    assert.strictEqual(Teletype.keyToByte('x', true), null);
    assert.strictEqual(Teletype.keyToByte('é'), null);
});

test('board and paper together print what a program sends', () => {
    const {sim, printed} = simWithSio();
    const tty = new Teletype();
    // examples/tty-hello.asm
    sim.loadDataAsHexString(
        0,
        '21 17 00 7e b7 ca 16 00 db 00 e6 80 c2 08 00 7e d3 01 23 c3 03 00 ' +
        '76 48 45 4c 4c 4f 2c 20 57 4f 52 4c 44 21 0d 0a 00');
    sim.step(2000);
    printed.forEach((b) => tty.write(b));
    assert.strictEqual(tty.getText(), 'HELLO, WORLD!\n');
});
