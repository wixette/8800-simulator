/**
 * The format of a program link (js/link.js): writing a machine as a
 * link, reading it back, and the hex the link and the Load Data box
 * both read.
 *
 * A link is a public contract (P8 in docs/ui-design.md), so these tests
 * pin down what old links mean as much as they check the code.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const Link = require('../js/link.js');

// The memory sizes the page offers (panel.MEM_SIZES), which Link is told
// rather than knowing. Each helper below passes them on.
const SIZES = [256, 4096, 8192];
const queryToState = (query, unzipped) =>
    Link.queryToState(query, SIZES, unzipped);
const stateToQuery = (state, zip) => Link.stateToQuery(state, SIZES, zip);
const stateToLink = (state) => Link.stateToLink(state, SIZES);
const linkToState = (query) => Link.linkToState(query, SIZES);

test('a plain list of bytes reads as itself', () => {
    assert.deepStrictEqual(Link.parseBytes('3e 8c d3 ff 76').bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
});

test('one hex digit is a byte, and case does not matter', () => {
    assert.deepStrictEqual(Link.parseBytes('0 F a 3E').bytes,
                           [0x00, 0x0f, 0x0a, 0x3e]);
});

test('commas, tabs and runs of spaces all separate bytes', () => {
    assert.deepStrictEqual(Link.parseBytes('3e,8c,\td3   ff').bytes,
                           [0x3e, 0x8c, 0xd3, 0xff]);
});

test('leading and trailing space is not a byte', () => {
    assert.deepStrictEqual(Link.parseBytes('   76  ').bytes, [0x76]);
});

test('a pasted listing whose newlines the input box dropped still loads', () => {
    // A one line <input> strips newlines out of a paste, so the two
    // bytes either side of a line break arrive stuck together. Reading
    // a run of hex digits as consecutive bytes is what makes copying a
    // program out of the documentation work.
    const pasted = ['3e 8c', 'd3 ff', '76'].join('\n');
    const throughTheBox = pasted.replace(/\n/g, '');
    assert.strictEqual(throughTheBox, '3e 8cd3 ff76');
    assert.deepStrictEqual(Link.parseBytes(throughTheBox).bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
    assert.deepStrictEqual(Link.parseBytes(pasted).bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
});

test('a run of hex digits is read two at a time', () => {
    assert.deepStrictEqual(Link.parseBytes('3e8cd3ff76').bytes,
                           [0x3e, 0x8c, 0xd3, 0xff, 0x76]);
});

test('something that is not hex is reported, not silently zeroed', () => {
    const parsed = Link.parseBytes('3e hello d3');
    assert.strictEqual(parsed.error, 'load-data-bad');
    assert.strictEqual(parsed.params.text, 'hello');
    assert.strictEqual(parsed.bytes, undefined);
});

test('the reported token is the one that is wrong', () => {
    assert.strictEqual(Link.parseBytes('3e 8c zz').params.text, 'zz');
    assert.strictEqual(Link.parseBytes('0x3e').params.text, '0x3e');
});

test('a run of hex digits that is not whole bytes is reported', () => {
    const parsed = Link.parseBytes('3e 8cd3f');
    assert.strictEqual(parsed.error, 'load-data-odd');
    assert.strictEqual(parsed.params.text, '8cd3f');
});

// The 4K BASIC tape is optional (see roms/NOTICE), as in basic.test.js.
const BASIC_ROM = path.join(__dirname, '..', 'roms', '4kbas32.bin');
const SKIP_WITHOUT_ROM = fs.existsSync(BASIC_ROM) ?
    false : 'roms/4kbas32.bin is not present';

// A program a class wrote out by hand and shared as a table of bytes:
// it copies the capital letters out of a string at 0090H to 00F0H.
const CLASS_PROGRAM =
    '2A 90 00 06 41 0E 5B 11 F0 00 7E FE 00 CA 1E 00 B8 DA 1A 00 ' +
    'B9 D2 1A 00 12 13 23 C3 0A 00 C3 1E 00';

test('a link can carry just a program, written by hand', () => {
    const hex = CLASS_PROGRAM.replace(/ /g, '');
    const state = queryToState('?hex=' + hex);
    assert.strictEqual(state.bytes.length, 33);
    assert.strictEqual(state.bytes[0], 0x2a);
    assert.strictEqual(state.memSize, 256, 'the smallest memory it fits in');
    assert.deepStrictEqual(state.cpu, {}, 'no registers, so a fresh RESET');
    // Spaces survive a link too, as + or %20.
    assert.deepStrictEqual(
        queryToState('hex=' + CLASS_PROGRAM.replace(/ /g, '+')).bytes,
        state.bytes);
    assert.deepStrictEqual(
        queryToState('hex=' + encodeURIComponent(CLASS_PROGRAM)).bytes,
        state.bytes);
});

test('a program too big for 256 bytes installs the memory it needs', () => {
    const state = queryToState('hex=' + '00'.repeat(300) + '76');
    assert.strictEqual(state.memSize, 4096);
    assert.strictEqual(
        queryToState('mem=256&hex=' + '00'.repeat(300) + '76').error,
        'load-data-too-long', 'unless the link says otherwise');
});

test('a page opened without a link loads nothing', () => {
    assert.strictEqual(queryToState(''), null);
    assert.strictEqual(queryToState('?lang=fr'), null);
});

test('a machine part way through a program survives the round trip', () => {
    const bytes = new Array(4096).fill(0);
    Link.parseBytes(CLASS_PROGRAM).bytes.forEach((b, i) => { bytes[i] = b; });
    bytes[0x90] = 0x48;
    const cpu = {pc: 0x0a, sp: 0xf000, a: 0x48, b: 0x41, c: 0x5b,
                 d: 0x00, e: 0xf1, f: 0x02, h: 0x00, l: 0x91};
    const query = stateToQuery(
        {memSize: 4096, bytes: bytes, cpu: cpu, switches: 0x8001});
    assert.ok(query.length < 500, 'the zeros at the top are left off');
    const state = queryToState(query);
    assert.strictEqual(state.memSize, 4096);
    // D, F and H are at their power-on values, so the link leaves them out
    // and the loader puts them back.
    const {d, f, h, ...named} = cpu;
    assert.deepStrictEqual(state.cpu, named);
    assert.strictEqual(state.switches, 0x8001);
    assert.deepStrictEqual(state.bytes, bytes.slice(0, 0x91));
});

test('a link leaves out whatever a fresh machine would have anyway', () => {
    const bytes = new Array(256).fill(0);
    bytes[0] = 0x76;
    const fresh = {pc: 0, sp: 0, a: 0, b: 0, c: 0, d: 0, e: 0, f: 2,
                   h: 0, l: 0};
    assert.strictEqual(
        stateToQuery({memSize: 256, bytes: bytes, cpu: fresh,
                            switches: 0}),
        'hex=76', 'no mem= when the program needs no more than it has');
    assert.strictEqual(
        stateToQuery({memSize: 4096, bytes: bytes,
                            cpu: {...fresh, pc: 0x1a, a: 0x41},
                            switches: 0}),
        'mem=4096&hex=76&pc=001A&a=41');
});

test('without the registers a link is only the program', () => {
    const bytes = new Array(256).fill(0);
    bytes[0] = 0x76;
    assert.strictEqual(
        stateToQuery({memSize: 256, bytes: bytes, cpu: null,
                            switches: 0xffff}),
        'hex=76', 'the switches go with the registers');
});

test('a link that makes no sense says what is wrong with it', () => {
    assert.strictEqual(queryToState('hex=zz').error, 'load-data-bad');
    assert.strictEqual(queryToState('hex=00&mem=1000').error,
                       'link-bad-mem');
    assert.deepStrictEqual(queryToState('hex=00&a=100').params,
                           {name: 'A', text: '100'}, 'A is one byte');
    assert.strictEqual(queryToState('pc=12345').error, 'link-bad-reg');
});

test('zeros padding a program past the top of memory do not count', () => {
    // Loading zeroes memory first, so a 256 byte table with one 00 too
    // many at the end is still a program for the 256 byte machine.
    const state = queryToState('hex=' + CLASS_PROGRAM + '00'.repeat(224));
    assert.strictEqual(state.memSize, 256);
    assert.strictEqual(state.bytes.length, 256, 'cut at the top of memory');
});

test('a copied link spells out a class-sized program in hex', async () => {
    const bytes = new Array(256).fill(0);
    Link.parseBytes(CLASS_PROGRAM).bytes.forEach((b, i) => { bytes[i] = b; });
    bytes[255] = 0x50;
    const cpu = {pc: 0, sp: 0, a: 0, b: 0, c: 0, d: 0, e: 0, f: 2, h: 0, l: 0};
    const query = await stateToLink(
        {memSize: 256, bytes: bytes, cpu: cpu, switches: 0});
    assert.match(query, /hex=2A900006410E5B/, 'readable, all 256 bytes');
    assert.doesNotMatch(query, /zip=/);
});

test('a copied link compresses a big machine and reads it back',
     {skip: SKIP_WITHOUT_ROM}, async () => {
    // 4K BASIC is the machine this is for.
    const basic = fs.readFileSync(BASIC_ROM);
    const bytes = new Array(8192).fill(0);
    basic.forEach((b, i) => { bytes[i] = b; });
    bytes[0x1fff] = 0x76;
    const cpu = {pc: 0x0123, sp: 0x0f00, a: 1, b: 2, c: 3, d: 4, e: 5,
                 f: 0x47, h: 6, l: 7};
    const query = await stateToLink(
        {memSize: 8192, bytes: bytes, cpu: cpu, switches: 0x0800});
    assert.doesNotMatch(query, /hex=/);
    assert.match(query, /zip=[A-Za-z0-9_-]+&/, 'base64 that a URL takes as is');
    const hexLength = 2 * 8192;
    assert.ok(query.length < hexLength / 2,
              'well under half what the hex would be: ' + query.length);
    const state = await linkToState('#' + query);
    assert.strictEqual(state.memSize, 8192);
    assert.deepStrictEqual(state.bytes, bytes);
    assert.deepStrictEqual(state.cpu, cpu, 'none of these is a default');
    assert.strictEqual(state.switches, 0x0800);
});

test('a hand-written link is read the same from ? or #', async () => {
    const hex = CLASS_PROGRAM.replace(/ /g, '');
    assert.deepStrictEqual((await linkToState('?hex=' + hex)).bytes,
                           (await linkToState('#hex=' + hex)).bytes);
    assert.strictEqual(await linkToState(''), null);
});

test('a compressed link cut short says so', async () => {
    const bytes = new Array(4096).fill(0x3c);
    const query = await stateToLink(
        {memSize: 4096, bytes: bytes,
         cpu: {pc: 0, sp: 0, a: 0, b: 0, c: 0, d: 0, e: 0, f: 2, h: 0, l: 0},
         switches: 0});
    const zip = new URLSearchParams(query).get('zip');
    const cut = query.replace(zip, zip.slice(0, zip.length - 6));
    assert.strictEqual((await linkToState(cut)).error, 'link-bad-zip');
    assert.strictEqual((await linkToState('zip=!!!')).error,
                       'link-bad-zip');
});

test('a size too small for the program is reported in bytes', () => {
    // The page words it; Link only counts.
    assert.deepStrictEqual(
        queryToState('mem=256&hex=' + '00'.repeat(300) + '76').params,
        {bytes: 301, size: 256});
});
