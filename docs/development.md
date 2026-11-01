# Developing the simulator

The simulator is one page and its files: every script is an ES module,
nothing is compiled, and nothing needs installing. To run it, see
[Run it locally](../README.md#run-it-locally). What is in
[tools/](../tools/) is not part of the page.

The design notes say why things are the way they are:
[ui-design.md](ui-design.md) for the layout and its
principles, [ms-basic-4k.md](ms-basic-4k.md) for the
memory, the serial boards, the Teletype and BASIC,
[assembler.md](assembler.md) for the assembler and the
language it takes, [kill-the-bit.md](kill-the-bit.md)
for the address-bus trick Kill the Bit relies on, and
[3d-view.md](3d-view.md) and [3d-model.md](3d-model.md)
for the 3D view and its model.

## Deploying behind a cache

Every file `index.html` names carries the version, `css/style.css?v=1.7.0`,
and so does every module the scripts import, through the page's import
map. A release asks for new names, so a cache can keep each file as long
as it likes and still never give an old one to the new page. Only
`index.html` itself must not be kept. On a server or a CDN that lets you
set the headers:

| What | `Cache-Control` |
| --- | --- |
| `index.html` (and `/`) | `no-cache`: kept, but checked with the server each time, which costs a reply with no body when nothing changed |
| Everything asked for with `?v=` | `public, max-age=31536000, immutable` |
| `package.json`, `examples/`, `roms/` | `no-cache`; the page fetches these itself, and asks for a check anyway |

A CDN must count the query string in its cache key (most do unless told
not to), and should be told to purge `index.html` on each deploy.
GitHub Pages sets no headers you can change and keeps everything for 10
minutes, so there a release reaches everyone within 10 minutes.

The version is kept in one place, `package.json`; the names in
`index.html` are copies, written from it and never by hand. Set it with
npm, which writes them too:

```
npm version 1.7.0        # or: npm version patch | minor | major
```

It sets the version, then runs `npm run stamp`
([tools/stamp.mjs](../tools/stamp.mjs)) to write it into `index.html`'s
file names and import map, and stops there: it does not commit or tag
([.npmrc](../.npmrc)), since a release is tagged on GitHub, on its merge
commit. Commit the two files as usual. A version changed any other way,
by hand in `package.json`, needs `npm run stamp` after it; until then
`npm test` fails and says so, so a release cannot go out half stamped.

## The logo and icons

The logo is in [images/](../images/) in three forms: the machine alone, 16:9
(`8800-simulator-logo.svg`), and the machine with its name, 8:1, in
white for dark backgrounds and black for light ones
(`8800-simulator-logo-text-white.svg`, `-text-black.svg`). The toolbar
shows the one with the name, and on a phone the machine alone; the
README shows the name in whichever colour suits the reader's theme.

The favicons and home screen icons are drawn from the 16:9 one, and
kept with it in `images/`: `favicon.svg`, `favicon.ico` (16, 32 and 48
pixels), and the 180, 192 and 512 pixel PNGs that `index.html` and
[manifest.webmanifest](../manifest.webmanifest) name. After a change to
the logo, draw them again (it needs Chrome, as the browser checks do):

```
npm run icons
```

`npm test` fails until they have been, since it checks that the SVG
favicon still has the logo's drawing.

## Tests

```
npm test
```

Node.js 24, nothing to install. The suite covers the 8080 CPU, the
front panel, the serial boards and the Teletype, the page's own logic
and translations, the link format, the assembler against Intel's
manual, every program in [examples/](../examples/), 4K BASIC booting
and running end to end, and the 3D view's logic: the box and the
power, the model against its params, framing, the toggle, and a walk
of every state its state machine can reach. It runs on each push and
pull request.

The page itself - clicks, menus, the Assembler's editor, the layout -
is checked in a headless Chrome:

```
npm run test:browser
npm run test:browser -- sync clear
```

It needs Chrome installed (or `CHROME` set to its path, Chromium too),
so it is not part of CI, and the whole of it takes several minutes, so
it is not run on every change either. The checks are in
[tests/browser/](../tests/browser/). Run what a change can affect, and
name the checks to run only those:

| What changed | What to run |
|---|---|
| Docs or text | `npm test` |
| How a part of the model looks, nothing moved | `npm run build:model`, `npm test`, and a look at a render beside its reference photo |
| A part moved, resized or added, or a way out changed | The above, and `npm run test:model` |
| Anything near the switches or what can be clicked in 3D | The above, and `npm run test:browser -- view3d` |
| Page code | `npm test`, `npm run typecheck`, and the browser checks for that area |
| Before a release, or for a really large commit | All of it: every browser check, `npm run test:model`, and the README's screenshots (`npm run shots -- --readme`) |

Don't commit while one of these is failing.

The JSDoc types are checked against the code by TypeScript's checker,
which `npx` fetches for the run; nothing is compiled, and the page
runs the files as they are. CI runs it after the tests:

```
npm run typecheck
```

Only the files that start with `// @ts-check` are checked, so far
`js/asm8080.js`, `js/sim8800.js`, `js/box.js` and the 3D view's
framing, views and state; [tsconfig.json](../tsconfig.json)
says how strictly.

## Screenshots and videos

The README's pictures, and a larger set for posts, are taken from
the page itself in a headless Chrome, as a reader would leave it:

```
npm run shots -- --readme            # English, and the README's pictures into screenshots/
npm run shots -- --lang en,zh        # any languages, into ~/Downloads/8800-simulator-v<version>-media/shots/
npm run video -- --lang en,zh        # 1080p clips into .../videos/ (needs ffmpeg)
```

`--only <name>` takes the shots or clips whose names hold it. The clips
are rendered frame by frame on a clock the tool moves on, so they are
smooth however slowly the frames are taken, and the 8080 runs at its own
2 MHz in them. The shots and scenes are listed in
[tools/shots.mjs](../tools/shots.mjs) and [tools/video.mjs](../tools/video.mjs).

## The link format

A link opens the simulator with a program loaded at 0000H, ready to
RUN. The fields go after `?` or `#`:

```
https://wixette.github.io/8800-simulator/?hex=3E8CD3FF76
```

[Try it](https://wixette.github.io/8800-simulator/?hex=3E8CD3FF76):
the bytes are `MVI A,8CH`, `OUT 0FFH` and `HLT`. Click RUN and the
data lamps show 10001100.

The bytes of `hex` can run together, or be separated by `+` or `%20`.
Memory is installed to fit, and zeros at the end do not count.

**Share** writes its links after `#`, which is never sent to the web
server, so a long one is not turned away (GitHub Pages refuses a link
of 16,000 characters). It leaves out whatever a machine just switched
on would have anyway. Memory in use that fits in 256 bytes is written
as hex, so it can be read in the link; past that it is compressed under
`zip`, and 4K BASIC comes to about 4,500 characters instead of 8,300.
Every field is optional:

| Field | Holds |
|---|---|
| `hex` | Memory from 0000H up, in hex |
| `zip` | The same memory, deflated and in URL-safe base64, in place of `hex` |
| `mem` | Installed memory: `256`, `4096` or `8192` (decimal) |
| `pc`, `sp` | The 16-bit registers, in hex |
| `a`, `b`, `c`, `d`, `e`, `h`, `l`, `f` | The 8-bit registers, in hex, `f` being the flags |
| `sw` | The address switches, A15–A0, as a 16-bit hex word |
| `view` | `3d` to open in the 3D view, `2d` for the front panel (since v1.8.0); a link from Share in 3D carries `view=3d` |

A linked machine always opens stopped. The Teletype's paper and the
interrupt enable are not in the link. The format is a promise to
everyone who has put a link in a document: fields may be added, but
never renamed or read differently ([js/link.js](../js/link.js)).
