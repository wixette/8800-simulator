/**
 * Checks that vendor/three/ is exactly the three.js release
 * tools/vendor.mjs names: its files, unedited, and nothing else.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {THREE_FILES, THREE_VERSION, VENDOR_DIR, checksums} from '../tools/vendor.mjs';

test('vendor/three holds the listed files and its checksums, nothing more', () => {
    const present = fs.readdirSync(VENDOR_DIR, {recursive: true})
          .map((name) => name.split(path.sep).join('/'))
          .filter((name) => fs.statSync(path.join(VENDOR_DIR, name)).isFile());
    assert.deepStrictEqual(present.sort(), THREE_FILES.concat(['SHA256SUMS']).sort());
});

test('no vendored file has been changed since tools/vendor.mjs wrote it', () => {
    const recorded = fs.readFileSync(path.join(VENDOR_DIR, 'SHA256SUMS'), 'utf8');
    assert.strictEqual(checksums(VENDOR_DIR), recorded,
                       'run node tools/vendor.mjs rather than editing vendor/three/');
});

test('the vendored three.js is the version tools/vendor.mjs pins', () => {
    const core = fs.readFileSync(path.join(VENDOR_DIR, 'build', 'three.core.js'), 'utf8');
    const revision = core.match(/REVISION = '(\d+)'/)[1];
    assert.strictEqual(revision, THREE_VERSION.split('.')[1]);
    assert.match(fs.readFileSync(path.join(VENDOR_DIR, 'LICENSE'), 'utf8'), /The MIT License/);
});

test('every vendored module imports only what is vendored beside it, or three', () => {
    for (const file of THREE_FILES.filter((name) => name.endsWith('.js'))) {
        const source = fs.readFileSync(path.join(VENDOR_DIR, file), 'utf8');
        for (const [, from] of source.matchAll(/^\s*(?:import|export)\b[^'"]*?from\s*'([^']+)'/gm)) {
            if (from == 'three') {
                continue;
            }
            const resolved = path.posix.join(path.posix.dirname(file), from);
            assert.ok(THREE_FILES.includes(resolved), file + ' imports ' + from);
        }
    }
});
