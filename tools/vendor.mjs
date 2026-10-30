/**
 * Copies the files of three.js the 3D view needs into vendor/three/,
 * where the page loads them through its import map (docs/3d-view.md,
 * M5). The simulator has no dependencies to install, so the library is
 * kept as files, pinned to one version, with a checksum of each:
 *
 *     node tools/vendor.mjs
 *
 * It fetches the release with npm pack (the one time it needs the
 * network), takes the files below from it, and writes
 * vendor/three/SHA256SUMS. tests/vendor.test.js holds vendor/three/ to
 * that list, so a file edited by hand, or one left over from another
 * version, fails the tests. To move to another version, change
 * THREE_VERSION, run this, and run the tests and the browser checks.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The version of three.js the page runs, as npm names it. */
export const THREE_VERSION = '0.186.1';

/**
 * The files the page needs, as paths in the three package. The addons
 * import one another by relative path, so they keep the package's
 * folders.
 */
export const THREE_FILES = [
    'LICENSE',
    'build/three.module.js',
    'build/three.core.js',
    'examples/jsm/controls/OrbitControls.js',
    'examples/jsm/loaders/GLTFLoader.js',
    'examples/jsm/utils/BufferGeometryUtils.js',  // GLTFLoader imports it
    'examples/jsm/utils/SkeletonUtils.js',        // and this
];

/** Where the files go. */
export const VENDOR_DIR = path.join(ROOT, 'vendor', 'three');

/**
 * The SHA-256 of a file, in hex.
 * @param {string} file The file.
 * @return {string} Its checksum.
 */
export function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/**
 * The checksums file's text: a line per file, as sha256sum writes it.
 * @param {string} dir The folder the files are in.
 * @return {string} The text.
 */
export function checksums(dir) {
    return THREE_FILES.map((file) => sha256(path.join(dir, file)) + '  ' + file + '\n').join('');
}

if (process.argv[1] && fileURLToPath(import.meta.url) == path.resolve(process.argv[1])) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'three-'));
    try {
        execFileSync('npm', ['pack', 'three@' + THREE_VERSION, '--silent',
                             '--pack-destination', tmp], {stdio: 'inherit'});
        const tgz = path.join(tmp, 'three-' + THREE_VERSION + '.tgz');
        execFileSync('tar', ['-xzf', tgz, '-C', tmp]);
        fs.rmSync(VENDOR_DIR, {recursive: true, force: true});
        for (const file of THREE_FILES) {
            const to = path.join(VENDOR_DIR, file);
            fs.mkdirSync(path.dirname(to), {recursive: true});
            fs.copyFileSync(path.join(tmp, 'package', file), to);
        }
        fs.writeFileSync(path.join(VENDOR_DIR, 'SHA256SUMS'), checksums(VENDOR_DIR));
        console.log('vendor/three: three.js ' + THREE_VERSION + ', ' +
                    THREE_FILES.length + ' files.');
    } finally {
        fs.rmSync(tmp, {recursive: true, force: true});
    }
}
