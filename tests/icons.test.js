/**
 * The page's icons (tools/icons.mjs): drawn from the logo, and still
 * the logo. A logo changed without npm run icons after it fails here.
 *
 * Run with: npm test
 */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {icoOf, squareSvg} from '../tools/icons.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file));

/** A PNG's width and height, from its header. */
function pngSize(png) {
    assert.strictEqual(png.subarray(1, 4).toString(), 'PNG');
    return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

/** The drawing in an SVG, without its <svg> element's attributes. */
function drawing(svg) {
    return svg.replace(/<svg\b[^>]*>/, '<svg>');
}

test('the SVG favicon is the logo, in a square', () => {
    const logo = read('images/8800-simulator-logo.svg').toString();
    const icon = read('images/favicon.svg').toString();
    assert.strictEqual(drawing(icon), drawing(logo),
                       'the logo has changed since the icons were drawn: npm run icons');
    const [x, y, w, h] = icon.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
    assert.strictEqual(w, h, 'square');
    // Around the whole drawing: wider than tall, it spans the square.
    assert.ok(x <= 114 && x + w >= 1486 && y <= 62 && y + h >= 838, [x, y, w, h].join(' '));
    assert.ok(w <= 1372 * 1.05, 'cropped close');
});

test('favicon.ico holds the logo at 16, 32 and 48 pixels', () => {
    const ico = read('images/favicon.ico');
    assert.strictEqual(ico.readUInt16LE(2), 1, 'an icon');
    const count = ico.readUInt16LE(4);
    const sizes = [];
    for (let i = 0; i < count; i++) {
        const at = 6 + 16 * i;
        const png = ico.subarray(ico.readUInt32LE(at + 12),
                                 ico.readUInt32LE(at + 12) + ico.readUInt32LE(at + 8));
        const [w, h] = pngSize(png);
        assert.strictEqual(w, ico.readUInt8(at));
        assert.strictEqual(h, ico.readUInt8(at + 1));
        sizes.push(w);
    }
    assert.deepStrictEqual(sizes, [16, 32, 48]);
});

test('the home screen icons are the sizes the page and manifest say', () => {
    assert.deepStrictEqual(pngSize(read('images/apple-touch-icon.png')), [180, 180]);
    const manifest = JSON.parse(read('manifest.webmanifest'));
    assert.strictEqual(manifest.icons.length, 2);
    for (const icon of manifest.icons) {
        const [w, h] = pngSize(read(icon.src));
        assert.strictEqual(icon.sizes, w + 'x' + h);
    }
    const html = read('index.html').toString();
    for (const link of ['rel="icon" href="images/favicon.ico', 'rel="icon" href="images/favicon.svg',
                        'rel="apple-touch-icon" href="images/apple-touch-icon.png',
                        'rel="manifest" href="manifest.webmanifest']) {
        assert.ok(html.includes(link), link);
    }
});

test('an .ico is a header, a directory, and the PNGs', () => {
    const png = (n) => Buffer.from('\x89PNG' + 'x'.repeat(n), 'latin1');
    const ico = icoOf([{size: 16, png: png(3)}, {size: 256, png: png(5)}]);
    assert.deepStrictEqual([...ico.subarray(0, 6)], [0, 0, 1, 0, 2, 0]);
    assert.strictEqual(ico.readUInt8(6 + 16), 0, '256 is written as 0');
    assert.strictEqual(ico.readUInt32LE(6 + 12), 6 + 32, 'the first image after the directory');
    assert.strictEqual(ico.readUInt32LE(6 + 16 + 12), 6 + 32 + 7);
    assert.strictEqual(ico.length, 6 + 32 + 7 + 9);
});

test('a square around a drawing wider than it is tall', () => {
    const svg = '<svg width="1600" height="900" viewBox="0 0 1600 900" x="1"><path d="M0 0"/></svg>';
    const out = squareSvg(svg, {x: 100, y: 50, width: 1000, height: 500});
    assert.match(out, /^<svg width="1020" height="1020" viewBox="90 -210 1020 1020" x="1">/);
    assert.ok(out.endsWith('<path d="M0 0"/></svg>'));
});
