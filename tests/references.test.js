/**
 * Checks that the repository stands on its own: no file names a path on
 * somebody's own computer, every relative link in a Markdown file leads
 * to a file that is here, and nothing names the private workspace the
 * 3D model was first made in (docs/3d-view.md, M2). That name is not
 * written here either: the check compares each word's SHA-256 with its.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT = path.join(import.meta.dirname, '..');

/** The words that must not appear, as SHA-256 hex. */
const FORBIDDEN = new Set([
    '11b3eb8bf69fd731c9af4db46ede59d5a375305765f2f16134769e6075bc6c22',
]);

/** Files that are not text. */
const BINARY = /\.(png|ico|jpg|jpeg|gif|bin|mp3|wav|glb|pdf|woff2?)$/i;

/**
 * The repository's text files: those git tracks, and new ones not yet
 * added, without what .gitignore leaves out.
 * @return {!Array<string>} Paths relative to the root.
 */
function textFiles() {
    const out = execFileSync(
        'git', ['ls-files', '--cached', '--others', '--exclude-standard'],
        {cwd: ROOT, encoding: 'utf8'});
    return out.split('\n').filter((file) => file && !BINARY.test(file) &&
                                  fs.existsSync(path.join(ROOT, file)));
}

const FILES = textFiles();

test('there are files to check', () => {
    assert.ok(FILES.includes('index.html'));
    assert.ok(FILES.includes('model/params/machine.json'));
});

test('no file names a path on a local computer', () => {
    const local = /(^|[\s"'(`=])(\/Users\/|\/home\/[a-z]|[A-Z]:\\Users\\)/;
    for (const file of FILES) {
        const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n');
        lines.forEach((line, i) => {
            assert.ok(!local.test(line), file + ':' + (i + 1) + ': ' + line.trim());
        });
    }
});

test('no file names the private workspace', () => {
    for (const file of FILES) {
        const text = fs.readFileSync(path.join(ROOT, file), 'utf8').toLowerCase();
        for (const word of text.split(/[^a-z0-9-]+/)) {
            const hash = crypto.createHash('sha256').update(word).digest('hex');
            assert.ok(!FORBIDDEN.has(hash), file);
        }
    }
});

test('every relative link in the Markdown files leads to a file here', () => {
    const link = /\]\(([^)\s]+)\)/g;
    for (const file of FILES.filter((name) => name.endsWith('.md'))) {
        const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
        for (const [, target] of text.matchAll(link)) {
            if (/^([a-z]+:|#)/i.test(target)) {
                continue;
            }
            const resolved = path.resolve(ROOT, path.dirname(file), target.split('#')[0]);
            assert.ok(resolved.startsWith(ROOT + path.sep),
                      file + ': ' + target + ' leads outside the repository');
            assert.ok(fs.existsSync(resolved), file + ': ' + target + ' is not here');
        }
    }
});
