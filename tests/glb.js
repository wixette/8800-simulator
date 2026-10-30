/**
 * Reads the glTF JSON out of a .glb file, for the tests that hold the
 * 3D model to what the page relies on. No three.js: the suite stays
 * dependency-free.
 */
'use strict';

import assert from 'node:assert';
import fs from 'node:fs';

/**
 * The glTF JSON chunk of a .glb file.
 * @param {string} file The file.
 * @return {!Object} The glTF document.
 */
export function readGlb(file) {
    const bytes = fs.readFileSync(file);
    assert.strictEqual(bytes.toString('latin1', 0, 4), 'glTF', 'a .glb file');
    const length = bytes.readUInt32LE(12);
    assert.strictEqual(bytes.toString('latin1', 16, 20), 'JSON');
    return JSON.parse(bytes.toString('utf8', 20, 20 + length));
}
