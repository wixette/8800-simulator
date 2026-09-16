/**
 * Checks that package.json carries the version this code belongs to.
 *
 * The releases are git tags, and package.json said 1.0.0 through all of
 * v1.0.1 to v1.3.0 because nothing ever looked. This is what looks.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const VERSION = require('../package.json').version;

/**
 * The release tags, newest first. Only vN.N.N is a release: the repo
 * also carries a stray v2.0 tag on the same commit as v1.0.1, which
 * would otherwise sort above everything and never be caught up with.
 * @return {?Array<string>} The tags, or null where they cannot be read
 *     - no git, or a shallow clone that fetched none of them, which is
 *     what a default actions/checkout gives you.
 */
function releaseTags() {
    try {
        const out = execFileSync(
            'git', ['tag', '--list', 'v*', '--sort=-v:refname'],
            {cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});
        const tags = out.split('\n')
              .map((line) => line.trim())
              .filter((line) => /^v\d+\.\d+\.\d+$/.test(line));
        return tags.length ? tags : null;
    } catch (e) {
        return null;
    }
}

/** A version as numbers, for comparing. */
function parts(version) {
    return version.replace(/^v/, '').split('.').map(Number);
}

/** Compares two versions the way their numbers order, not their text. */
function compare(a, b) {
    const left = parts(a);
    const right = parts(b);
    for (let i = 0; i < 3; i++) {
        if (left[i] !== right[i]) {
            return left[i] - right[i];
        }
    }
    return 0;
}

test('the package version is a release number', () => {
    assert.match(VERSION, /^\d+\.\d+\.\d+$/,
                 'package.json version should be MAJOR.MINOR.PATCH');
});

test('the package version is not behind the newest release tag', () => {
    const tags = releaseTags();
    if (!tags) {
        // Nothing to compare against. Said out loud rather than passed
        // quietly, so that a CI run that fetched no tags does not look
        // like a check that ran.
        console.log('no release tags visible here - version check skipped');
        return;
    }
    const newest = tags[0];
    assert.ok(
        compare(VERSION, newest) >= 0,
        'package.json says ' + VERSION + ', behind the newest release tag '
            + newest + '. Bump it to the version being prepared.');
});
