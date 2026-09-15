/**
 * Boots MITS 4K BASIC on the simulator, end to end.
 *
 * This is the test the rest of the 4K BASIC work exists to make pass:
 * the real ROM, the real CPU, the real memory model and the real
 * serial board, driven through Sim8800's public interface with nothing
 * stubbed but the terminal a person would type at.
 *
 * The ROM is optional - see roms/NOTICE - so these tests skip
 * themselves if it is not there.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {createSim, flushTimers} = require('./fixture.js');
const Sio = require('../js/sio.js');
const Teletype = require('../js/teletype.js');

const ROM_PATH = path.join(__dirname, '..', 'roms', '4kbas32.bin');
const HAVE_ROM = fs.existsSync(ROM_PATH);
const SKIP = HAVE_ROM ? false : 'roms/4kbas32.bin is not present';

/**
 * Boots BASIC and feeds it a script, one line per prompt.
 * @param {number} memSize The installed memory.
 * @param {Array<string>} script Lines to type, in order. Each is sent
 *     once BASIC has stopped printing and is waiting for input.
 * @return {Object} The paper, and the simulator behind it.
 */
function runBasic(memSize, script) {
    const {sim, state} = createSim(memSize, 2000000);
    const tty = new Teletype();
    const sio = new Sio((byte) => tty.write(byte));
    sio.attachTo(sim);

    sim.powerOn();
    flushTimers();
    // The sense switches must be down: BASIC reads port FFh at 0D34h
    // to decide which board the terminal is on, and 0 picks the 88-SIO.
    state.inputWord = 0x0000;
    sim.loadData(0, Array.from(fs.readFileSync(ROM_PATH)));
    sim.reset();
    flushTimers();

    let next = 0;
    let idle = 0;
    let printed = -1;
    for (let tick = 0; tick < 200000; tick++) {
        sim.step(4000);                 // one 2 ms tick at 2 MHz
        const now = tty.getText().length;
        if (now !== printed) {
            printed = now;
            idle = 0;
            continue;
        }
        if (++idle < 25 || sio.rx.length) {
            continue;
        }
        if (next === script.length) {
            break;
        }
        sio.receiveText(script[next++] + '\r');
        idle = 0;
    }
    return {text: tty.getText(), tty: tty, sim: sim};
}

test('4K BASIC boots and reports the memory it found', {skip: SKIP}, () => {
    // Blank answers take everything the probe found, and Y keeps the
    // maths functions.
    const {text} = runBasic(8192, ['', '', 'Y']);
    assert.match(text, /MEMORY SIZE\?/);
    assert.match(text, /TERMINAL WIDTH\?/);
    assert.match(text, /WANT SIN\?/);
    assert.match(text, /4823 BYTES FREE/);
    assert.match(text, /BASIC VERSION 3\.2/);
    assert.match(text, /\[4K VERSION\]/);
    assert.match(text, /OK/);
});

test('4K BASIC finds the top of a 4 KB machine too', {skip: SKIP}, () => {
    const {text} = runBasic(4096, ['', '', 'Y']);
    assert.match(text, /727 BYTES FREE/);
});

test('4K BASIC runs a program', {skip: SKIP}, () => {
    const {text} = runBasic(8192, [
        '', '', 'Y',
        '10 FOR I=1 TO 5',
        '20 PRINT I,I*I',
        '30 NEXT I',
        'RUN',
    ]);
    const after = text.split('RUN')[1];
    for (const [i, square] of [[1, 1], [2, 4], [3, 9], [4, 16], [5, 25]]) {
        assert.ok(new RegExp('\\b' + i + '\\s+' + square + '\\b').test(after),
                  'expected ' + i + ' and ' + square + ' in:\n' + after);
    }
});

test('4K BASIC does arithmetic and the maths functions', {skip: SKIP}, () => {
    const {text} = runBasic(8192, [
        '', '', 'Y', 'PRINT 22/7', 'PRINT SQR(2)', 'PRINT SIN(0)',
    ]);
    assert.match(text, /3\.14286/);
    assert.match(text, /1\.41421/);
});

test('the sense switches choose the board (issue if left up)',
     {skip: SKIP}, () => {
         // 08h is switch A11 up, which sends BASIC to the 88-2SIO at
         // 10h/11h instead - so the 88-SIO sees nothing and the boot
         // never reaches its first prompt.
         const {sim, state} = createSim(8192, 2000000);
         const tty = new Teletype();
         new Sio((byte) => tty.write(byte)).attachTo(sim);
         sim.powerOn();
         flushTimers();
         state.inputWord = 0x0800;      // the switches are A15-A8
         sim.loadData(0, Array.from(fs.readFileSync(ROM_PATH)));
         sim.reset();
         flushTimers();
         sim.step(2000000);
         assert.strictEqual(tty.getText(), '',
                            'nothing should reach the 88-SIO');
     });

test('RESET and RUN warm starts BASIC, keeping the program',
     {skip: SKIP}, () => {
         const {sim, state} = createSim(4096, 2000000);
         const tty = new Teletype();
         const sio = new Sio((byte) => tty.write(byte));
         sio.attachTo(sim);
         sim.powerOn();
         flushTimers();
         state.inputWord = 0;
         sim.loadData(0, Array.from(fs.readFileSync(ROM_PATH)));
         sim.reset();
         flushTimers();

         const drive = (script) => {
             let next = 0, idle = 0, printed = -1;
             for (let tick = 0; tick < 200000; tick++) {
                 sim.step(4000);
                 const now = tty.getText().length;
                 if (now !== printed) { printed = now; idle = 0; continue; }
                 if (++idle < 25 || sio.rx.length) continue;
                 if (next === script.length) break;
                 sio.receiveText(script[next++] + '\r');
                 idle = 0;
             }
         };

         drive(['', '', 'Y', '10 PRINT "KEPT"']);
         assert.match(tty.getText(), /727 BYTES FREE/);

         // Once BASIC has initialised it rewrites the jump at 0000H to
         // point at its warm start instead of its cold start, so the
         // front panel's RESET and RUN comes back to OK rather than
         // asking MEMORY SIZE? again - and the program is still there.
         assert.notStrictEqual(sim.mem[2] | (sim.mem[3] << 8), 0x0d21,
                               'BASIC should have patched its restart vector');
         tty.clear();
         sim.reset();
         flushTimers();
         drive(['LIST']);

         const out = tty.getText();
         assert.match(out, /OK/, 'the warm start should reach its prompt');
         assert.ok(!/MEMORY SIZE/.test(out),
                   'a warm start must not ask the questions again');
         assert.match(out, /10 PRINT "KEPT"/, 'the program should survive');
     });

test('Control-C breaks out of a running program', {skip: SKIP}, () => {
    const {sim, state} = createSim(8192, 2000000);
    const tty = new Teletype();
    const sio = new Sio((byte) => tty.write(byte));
    sio.attachTo(sim);
    sim.powerOn();
    flushTimers();
    state.inputWord = 0;
    sim.loadData(0, Array.from(fs.readFileSync(ROM_PATH)));
    sim.reset();
    flushTimers();

    const script = ['', '', 'Y', '10 PRINT "X";', '20 GOTO 10', 'RUN'];
    let next = 0, idle = 0, printed = -1, broke = false;
    for (let tick = 0; tick < 200000; tick++) {
        sim.step(4000);
        if (next === script.length && !broke &&
            tty.getText().length > 400) {
            sio.receive(Teletype.BREAK);
            broke = true;
        }
        const now = tty.getText().length;
        if (now !== printed) {
            printed = now;
            idle = 0;
            continue;
        }
        if (++idle < 25 || sio.rx.length) continue;
        if (next < script.length) {
            sio.receiveText(script[next++] + '\r');
            idle = 0;
            continue;
        }
        if (broke) break;
    }
    assert.ok(broke, 'the program should have printed enough to interrupt');
    const tail = tty.getText().slice(-40);
    assert.match(tail, /OK/, 'BASIC should be back at its prompt: ' + tail);
});
