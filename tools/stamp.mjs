/**
 * Writes the version into every file name index.html gives, so that a
 * cache - the browser's, or a CDN's - can keep each file as long as it
 * likes: a new release asks for new names (#19).
 *
 *     npm version 1.7.0     (sets the version, then runs this)
 *     npm run stamp         (after a version set any other way)
 *
 * The unit tests fail while index.html and package.json disagree. It
 * edits index.html in place - there is no build, and no second copy of
 * the page:
 *
 * - each file it names by src or href gets ?v=<version>: the
 *   stylesheet, the images, the sounds, and js/main.js;
 * - its import map gives every module in js/ the same: the modules
 *   import one another by their plain names, and the map turns each
 *   into the versioned one, for the page alone.
 *
 * index.html itself is never cached for long (see the README), so it is
 * always the newest, and so are the names in it.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The modules the page may import: every .js file in js/. */
export function moduleFiles(root = ROOT) {
    return fs.readdirSync(path.join(root, 'js'))
        .filter((name) => name.endsWith('.js')).sort()
        .map((name) => 'js/' + name);
}

/**
 * index.html, with the version in every local file name and in the
 * import map. Stamping a stamped page again changes nothing.
 * @param {string} html The page.
 * @param {string} version The version, as package.json has it.
 * @param {!Array<string>} modules The js/ files, from moduleFiles().
 * @return {string} The page, stamped.
 */
export function stamp(html, version, modules) {
    const v = '?v=' + version;
    // A file of the site's own: not a link to elsewhere, nor a fragment.
    const local = /^(?![a-z]+:|\/\/|#)([^?#"]+\.[a-z0-9]+)(\?v=[^"#]*)?$/i;
    let out = html.replace(/\b(src|href)="([^"]*)"/g, (whole, attr, url) => {
        const m = url.match(local);
        return m ? attr + '="' + m[1] + v + '"' : whole;
    });
    const map = {imports: {}};
    for (const file of modules) {
        map.imports['./' + file] = './' + file + v;
    }
    const json = JSON.stringify(map, null, 2).replace(/\n/g, '\n    ');
    const block = /(<script type="importmap">\n    )[\s\S]*?(\n    <\/script>)/;
    if (!block.test(out)) {
        throw new Error('index.html has no import map to stamp');
    }
    return out.replace(block, (whole, open, close) => open + json + close);
}

if (process.argv[1] && fileURLToPath(import.meta.url) == path.resolve(process.argv[1])) {
    const file = path.join(ROOT, 'index.html');
    const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
    const before = fs.readFileSync(file, 'utf8');
    const after = stamp(before, version, moduleFiles());
    if (after != before) {
        fs.writeFileSync(file, after);
    }
    console.log('index.html ' + (after == before ? 'already has ' : 'now has ') +
                'version ' + version + ' in its file names.');
}
