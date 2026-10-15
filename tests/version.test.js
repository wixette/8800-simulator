/**
 * Checks that package.json carries the version this code belongs to.
 *
 * The releases are git tags, and package.json said 1.0.0 through all of
 * v1.0.1 to v1.3.0 because nothing ever looked. This is what looks.
 *
 * Run with: npm test
 */
'use strict';

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {panel} from '../js/panel.js';
import {moduleFiles, stamp} from '../tools/stamp.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

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

test('the About dialog reads the version from package.json', () => {
    // About reads this file itself (panel.showVersion), so that what it
    // says cannot fall behind. The version in index.html's file names
    // is checked against it below.
    const text = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
    assert.strictEqual(panel.versionFrom(text), VERSION);
    assert.strictEqual(panel.versionFrom('not json'), null);
    assert.strictEqual(panel.versionFrom('{"version": "two"}'), null);
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.match(html, /id="app-version"><\/span>/,
                 'index.html should leave the version to package.json');
});

test('every file the page names carries the version, for caches (#19)', () => {
    // A release asks for new names, so that no cache - the browser's or
    // a CDN's - gives an old file to the new page. npm version writes
    // them as it sets the version; a version changed any other way, by
    // hand in package.json, fails here until npm run stamp has been run.
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.strictEqual(stamp(html, VERSION, moduleFiles()), html,
                       'index.html is not stamped with ' + VERSION +
                       ': set versions with npm version, or run npm run stamp');
    // Read here without the stamp's own code, as a second opinion.
    const local = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1])
          .filter((url) => !/^([a-z]+:|\/\/|#)/i.test(url));
    assert.ok(local.length >= 14, 'the stylesheet, images, sounds and script: ' + local.length);
    for (const url of local) {
        assert.match(url, new RegExp('\\?v=' + VERSION.replace(/\./g, '\\.') + '$'), url);
        assert.ok(fs.existsSync(path.join(ROOT, url.replace(/\?.*/, ''))), url + ' exists');
    }
    assert.match(html, new RegExp('<script type="module" src="js/main\\.js\\?v=' +
                                  VERSION.replace(/\./g, '\\.') + '"></script>'));
    // Every module, and only those, in the import map, each to its own
    // file with the version; the map comes before the module script.
    const map = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
    const files = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js'));
    assert.deepStrictEqual(Object.keys(map.imports).sort(),
                           files.map((f) => './js/' + f).sort());
    for (const [from, to] of Object.entries(map.imports)) {
        assert.strictEqual(to, from + '?v=' + VERSION);
    }
    assert.ok(html.indexOf('type="importmap"') < html.indexOf('type="module"'));
});

test('the stamp puts a new version over an old one, and nothing else', () => {
    const page = '<link href="css/a.css?v=0.9.0"><img src="images/b.svg">' +
          '<a href="https://example.com/x.js">x</a><a href="#top">t</a>' +
          '<script type="importmap">\n    {}\n    </script>';
    const once = stamp(page, '2.0.0', ['js/a.js']);
    assert.ok(once.includes('href="css/a.css?v=2.0.0"'));
    assert.ok(once.includes('src="images/b.svg?v=2.0.0"'));
    assert.ok(once.includes('href="https://example.com/x.js"'), 'another site is left alone');
    assert.ok(once.includes('href="#top"'));
    assert.ok(once.includes('"./js/a.js": "./js/a.js?v=2.0.0"'));
    assert.strictEqual(stamp(once, '2.0.0', ['js/a.js']), once, 'a second time changes nothing');
});

test('what the page fetches itself, it checks with the server first (#19)', () => {
    // Those names carry no version, so a cache must not answer alone.
    assert.deepStrictEqual(panel.FETCH, {cache: 'no-cache'});
    const js = path.join(ROOT, 'js');
    let calls = 0;
    for (const file of fs.readdirSync(js).filter((f) => f.endsWith('.js'))) {
        for (const m of fs.readFileSync(path.join(js, file), 'utf8').matchAll(/\bfetch\(([^;]*)/g)) {
            calls++;
            assert.match(m[1], /, panel\.FETCH\)/, file + ': fetch(' + m[1]);
        }
    }
    assert.strictEqual(calls, 3, 'package.json, the examples and the BASIC tape');
});

test('npm version stamps the page as it sets the version, and stops there', () => {
    // One command for a version bump: npm runs package.json's "version"
    // script between setting the version and committing. Its own commit
    // and tag are off (.npmrc): a release is tagged on GitHub, on the
    // merge commit.
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.scripts.version, 'node tools/stamp.mjs');
    assert.strictEqual(pkg.scripts.stamp, 'node tools/stamp.mjs');
    const npmrc = fs.readFileSync(path.join(ROOT, '.npmrc'), 'utf8');
    assert.match(npmrc, /^git-tag-version=false$/m);
});
