/**
 * Draws the page's icons from the logo, images/8800-simulator-logo.svg
 * (the 16:9 one, with no text): the favicons and the icons a phone puts
 * on its home screen.
 *
 *     npm run icons
 *
 * Run it after the logo changes, and commit what it writes. It needs
 * Chrome, as the browser checks do (or CHROME set to its path), which
 * draws the PNGs, so they are the SVG exactly:
 *
 * - images/favicon.svg: the logo in a square, cropped close, for the
 *   browsers that take an SVG icon - sharp at any size;
 * - favicon.ico: 16, 32 and 48 pixels, for those that do not, and for
 *   anything that asks for /favicon.ico by name;
 * - images/apple-touch-icon.png (180) and images/icon-192.png and
 *   icon-512.png (manifest.webmanifest): on the page's own dark grey,
 *   since a home screen gives an icon no background of its own.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findChrome, start} from '../tests/browser/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'images', '8800-simulator-logo.svg');
// The page's background (css/style.css), behind the home screen icons.
const BACKGROUND = '#222222';

/**
 * The logo in a square: the same drawing, its view moved in to just
 * around it, centred. The drawing is wider than it is tall, so there is
 * room above and below; across, it nearly fills the square.
 * @param {string} svg The logo's SVG.
 * @param {{x: number, y: number, width: number, height: number}} box
 *     The drawing's bounds, in the SVG's own units.
 * @return {string} The square SVG.
 */
export function squareSvg(svg, box) {
    const side = Math.ceil(Math.max(box.width, box.height) * 1.02);
    const x = Math.round(box.x + box.width / 2 - side / 2);
    const y = Math.round(box.y + box.height / 2 - side / 2);
    return svg.replace(/<svg\b[^>]*>/, (open) => open
        .replace(/\swidth="[^"]*"/, ' width="' + side + '"')
        .replace(/\sheight="[^"]*"/, ' height="' + side + '"')
        .replace(/\sviewBox="[^"]*"/, ' viewBox="' + [x, y, side, side].join(' ') + '"'));
}

/**
 * An .ico holding PNGs, as every browser since IE 9 reads them.
 * @param {!Array<{size: number, png: !Buffer}>} images Square PNGs.
 * @return {!Buffer} The .ico file.
 */
export function icoOf(images) {
    const header = Buffer.alloc(6 + 16 * images.length);
    header.writeUInt16LE(0, 0);   // reserved
    header.writeUInt16LE(1, 2);   // an icon, not a cursor
    header.writeUInt16LE(images.length, 4);
    let offset = header.length;
    images.forEach(({size, png}, i) => {
        const at = 6 + 16 * i;
        header.writeUInt8(size >= 256 ? 0 : size, at);       // width
        header.writeUInt8(size >= 256 ? 0 : size, at + 1);   // height
        header.writeUInt8(0, at + 2);                        // no palette
        header.writeUInt8(0, at + 3);                        // reserved
        header.writeUInt16LE(1, at + 4);                     // planes
        header.writeUInt16LE(32, at + 6);                    // bits per pixel
        header.writeUInt32LE(png.length, at + 8);
        header.writeUInt32LE(offset, at + 12);
        offset += png.length;
    });
    return Buffer.concat([header, ...images.map((image) => image.png)]);
}

/** Draws an SVG into a size x size PNG, in Chrome. */
async function draw(h, svg, size, {background = null, fill = 1} = {}) {
    await h.send('Emulation.setDeviceMetricsOverride',
                 {width: size, height: size, deviceScaleFactor: 1, mobile: false});
    await h.send('Emulation.setDefaultBackgroundColorOverride',
                 {color: {r: 0, g: 0, b: 0, a: 0}});
    const url = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
    const inset = Math.round(size * (1 - fill) / 2);
    await h.js(`new Promise((done) => {
        document.documentElement.style.cssText = 'margin:0;background:transparent';
        document.body.style.cssText = 'margin:0;background:${background || 'transparent'}';
        document.body.innerHTML = '<img style="display:block;box-sizing:border-box;' +
            'width:${size}px;height:${size}px;padding:${inset}px">';
        const img = document.body.firstChild;
        img.onload = () => requestAnimationFrame(() => requestAnimationFrame(done));
        img.src = ${JSON.stringify(url)};
    })`);
    const shot = await h.send('Page.captureScreenshot', {format: 'png',
        clip: {x: 0, y: 0, width: size, height: size, scale: 1}});
    return Buffer.from(shot.result.data, 'base64');
}

async function main() {
    const h = await start(findChrome(), 'about:blank');
    try {
        const svg = fs.readFileSync(SOURCE, 'utf8');
        // The drawing's bounds, as the browser measures them.
        await h.js(`document.body.innerHTML = ${JSON.stringify(svg)}`);
        const box = await h.js(`(() => { const b = document.querySelector('svg').getBBox();
            return {x: b.x, y: b.y, width: b.width, height: b.height}; })()`);
        const square = squareSvg(svg, box);
        fs.writeFileSync(path.join(ROOT, 'images', 'favicon.svg'), square);
        const ico = [];
        for (const size of [16, 32, 48]) {
            ico.push({size, png: await draw(h, square, size)});
        }
        fs.writeFileSync(path.join(ROOT, 'favicon.ico'), icoOf(ico));
        // A home screen crops its own corners: the logo kept inside them.
        for (const [file, size] of [['apple-touch-icon.png', 180],
                                    ['icon-192.png', 192], ['icon-512.png', 512]]) {
            fs.writeFileSync(path.join(ROOT, 'images', file),
                             await draw(h, square, size, {background: BACKGROUND, fill: 0.84}));
        }
        console.log('Drew images/favicon.svg, favicon.ico (16, 32, 48), and the ' +
                    'home screen icons (180, 192, 512) from the logo.');
    } finally {
        await h.stop();
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) == path.resolve(process.argv[1])) {
    await main();
}
