/**
 * Unit tests for the 8080 CPU core (js/8080.js), focusing on the
 * instructions that the front panel demos and Kill the Bit rely on.
 *
 * Run with: node --test tests/
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const CPU8080 = require('../js/8080.js');

/**
 * Initializes the CPU singleton with a 64KB memory preloaded with the
 * given program at address 0.
 */
function makeMachine(program) {
    const machine = {
        mem: new Array(65536).fill(0),
        inputValue: 0,
        outputs: {},
    };
    program.forEach((byte, i) => { machine.mem[i] = byte; });
    CPU8080.init(
        (addr, value) => { machine.mem[addr] = value; },
        (addr) => machine.mem[addr],
        null,
        (port, value) => { machine.outputs[port] = value; },
        (port) => machine.inputValue);
    return machine;
}

test('LXI loads 16-bit immediates into register pairs', () => {
    makeMachine([0x21, 0x34, 0x12,   // LXI H,1234h
                 0x01, 0x0e, 0x00]); // LXI B,000Eh
    CPU8080.steps(20);
    const cpu = CPU8080.status();
    assert.strictEqual(cpu.h, 0x12);
    assert.strictEqual(cpu.l, 0x34);
    assert.strictEqual(cpu.b, 0x00);
    assert.strictEqual(cpu.c, 0x0e);
});

test('MVI and LDAX D load A from the address in DE', () => {
    const machine = makeMachine([0x16, 0x12,   // MVI D,12h
                                 0x1e, 0x34,   // MVI E,34h
                                 0x1a]);       // LDAX D
    machine.mem[0x1234] = 0xab;
    CPU8080.steps(21);
    const cpu = CPU8080.status();
    assert.strictEqual(cpu.d, 0x12);
    assert.strictEqual(cpu.e, 0x34);
    assert.strictEqual(cpu.a, 0xab);
});

test('DAD B adds BC to HL and sets carry on 16-bit overflow', () => {
    makeMachine([0x21, 0xff, 0xff,   // LXI H,FFFFh
                 0x01, 0x0e, 0x00,   // LXI B,000Eh
                 0x09]);             // DAD B
    CPU8080.steps(31);
    const cpu = CPU8080.status();
    assert.strictEqual((cpu.h << 8) | cpu.l, 0x000d);
    assert.strictEqual(cpu.f & 0x01, 0x01, 'carry flag should be set');
});

test('DAD B leaves carry clear without 16-bit overflow', () => {
    makeMachine([0x21, 0x00, 0x00,   // LXI H,0000h
                 0x01, 0x0e, 0x00,   // LXI B,000Eh
                 0x09]);             // DAD B
    CPU8080.steps(31);
    const cpu = CPU8080.status();
    assert.strictEqual((cpu.h << 8) | cpu.l, 0x000e);
    assert.strictEqual(cpu.f & 0x01, 0x00, 'carry flag should be clear');
});

test('JNC jumps only when carry is clear', () => {
    // Carry clear: JNC takes the jump.
    makeMachine([0xd2, 0x10, 0x00]); // JNC 0010h
    CPU8080.steps(10);
    assert.strictEqual(CPU8080.status().pc, 0x0010);

    // Carry set (via RRC of 01h): JNC falls through.
    makeMachine([0x3e, 0x01,         // MVI A,01h
                 0x0f,               // RRC (sets carry)
                 0xd2, 0x10, 0x00]); // JNC 0010h
    CPU8080.steps(21);
    assert.strictEqual(CPU8080.status().pc, 0x0006);
});

test('RRC rotates A right with wrap-around', () => {
    makeMachine([0x3e, 0x80,   // MVI A,80h
                 0x0f]);       // RRC
    CPU8080.steps(11);
    assert.strictEqual(CPU8080.status().a, 0x40);

    makeMachine([0x3e, 0x01,   // MVI A,01h
                 0x0f]);       // RRC
    CPU8080.steps(11);
    assert.strictEqual(CPU8080.status().a, 0x80);
});

test('XRA D xors A with D', () => {
    makeMachine([0x3e, 0xff,   // MVI A,FFh
                 0x16, 0x0f,   // MVI D,0Fh
                 0xaa]);       // XRA D
    CPU8080.steps(18);
    assert.strictEqual(CPU8080.status().a, 0xf0);
});

test('MOV D,A copies A to D', () => {
    makeMachine([0x3e, 0x5a,   // MVI A,5Ah
                 0x57]);       // MOV D,A
    CPU8080.steps(12);
    assert.strictEqual(CPU8080.status().d, 0x5a);
});

test('IN and OUT use the port callbacks', () => {
    const machine = makeMachine([0xdb, 0xff,   // IN FFh
                                 0xd3, 0xff]); // OUT FFh
    machine.inputValue = 0xc3;
    CPU8080.steps(20);
    assert.strictEqual(CPU8080.status().a, 0xc3);
    assert.strictEqual(machine.outputs[0xff], 0xc3);
});

test('memory writes go through the write callback (STA)', () => {
    const machine = makeMachine([0x3e, 0x77,         // MVI A,77h
                                 0x32, 0x80, 0x00]); // STA 0080h
    CPU8080.steps(20);
    assert.strictEqual(machine.mem[0x0080], 0x77);
});
