/**
 * Shared test fixture: loads the browser-oriented scripts into Node.js
 * and wires Sim8800 instances to fake callbacks that record the last
 * values they received.
 */
'use strict';

import {Sim8800} from '../js/sim8800.js';

// sim8800.js runs its clock on the browser's timers.
global.window = {
    pendingTimers: [],
    setTimeout: function(callback, delay) {
        global.window.pendingTimers.push({callback: callback, delay: delay});
    },
};

/** Runs and clears all timers captured by the fake window.setTimeout. */
function flushTimers() {
    const timers = global.window.pendingTimers.splice(0);
    for (const timer of timers) {
        timer.callback();
    }
}

/**
 * Creates a Sim8800 wired to recording fake callbacks.
 * @return {{sim: Sim8800, state: Object}}
 */
function createSim(memSize = 256, clockRate = 1000000) {
    const state = {
        addressLeds: null,    // Array of 16 bits, LSB first.
        dataLeds: null,       // Array of 8 bits, LSB first.
        waitLedArg: null,     // Last raw argument of setWaitLedCallback.
        statusLedsArg: null,  // Last raw argument of setStatusLedsCallback.
        inputWord: 0,         // The value the address switches report.
        cpuDump: null,
        memDump: null,       // The <pre> of hex.
        memMap: undefined,   // The map strip, as data. Null when none.
        instr: undefined,    // The instruction at PC, decoded.
    };
    const sim = new Sim8800(
        memSize, clockRate,
        (bits) => { state.addressLeds = bits.slice(); },
        (bits) => { state.dataLeds = bits.slice(); },
        (isRunning) => { state.waitLedArg = isRunning; },
        (isPoweredOn) => { state.statusLedsArg = isPoweredOn; },
        () => state.inputWord,
        (html) => { state.cpuDump = html; },
        (html, pages, instr) => {
            state.memDump = html;
            state.memMap = pages;
            state.instr = instr;
        });
    return {sim: sim, state: state};
}

/** Converts an LSB-first bit array to a number. */
function bitsToNumber(bits) {
    let n = 0;
    for (let i = 0; i < bits.length; i++) {
        n |= bits[i] << i;
    }
    return n;
}

/** Returns the number shown on the high 8 address LEDs (A15-A8). */
function highAddressLeds(state) {
    return bitsToNumber(state.addressLeds.slice(8));
}

export {
    Sim8800,
    createSim,
    flushTimers,
    bitsToNumber,
    highAddressLeds,
};
