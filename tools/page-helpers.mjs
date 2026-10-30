/**
 * @fileoverview What `npm run shots` and `npm run video` set the page up
 * with: helpers run in the page before a shot's or a scene's setup, which
 * work the simulator through its own functions, as a reader's presses
 * would.
 */

/** Run in the page before each setup. */
export const HELPERS = `
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dock = (open) => panel.setDockOpen(open);
const tab = (name) => panel.showTab(name);
// The dock this tall, in CSS pixels.
const dockHeight = (px) => { panel.dock.height = px; panel.applyDock(); };
// The Switch Board Helper under the panel, shown or folded away.
const strip = (shown) => panel.setHelperShown(shown, false);
const stage = () => panel.stage3d;
// Until nothing moves: the camera landed, the box's parts at rest.
const settle = async () => {
    await sleep(200);
    for (let i = 0; i < 200 && stage() && (stage().viewer.isFlying() || panel.box.isBusy()); i++) {
        await sleep(100);
    }
};
// The 3D view, on one of its views.
const view3d = async (v = 'front') => {
    panel.chooseView('3d');
    await panel.whenStage3d();
    stage().setView(v);
    await settle();
};
const show = async (id) => { stage().setShow(id); await sleep(300); };
// Turns the camera from where it is, in degrees across (+: to the
// machine's right) and up; scales its distance (below 1: nearer); and
// moves it across and up by shares of that distance.
const cam = async (across = 0, up = 0, zoom = 1, panX = 0, panY = 0) => {
    const v = stage().viewer, c = v.camera, t = v.controls.target.clone();
    const o = c.position.clone().sub(t), r = o.length() * zoom;
    const theta = Math.atan2(o.x, o.z) + across * Math.PI / 180;
    const phi = Math.min(Math.max(Math.acos(o.y / o.length()) - up * Math.PI / 180, 0.1), 1.9);
    const p = t.clone().add(o.set(Math.sin(phi) * Math.sin(theta), Math.cos(phi),
                                  Math.sin(phi) * Math.cos(theta)).multiplyScalar(r));
    c.position.copy(p);
    c.lookAt(t);
    c.updateMatrixWorld();
    const x = o.clone().setFromMatrixColumn(c.matrixWorld, 0).multiplyScalar(panX * r);
    const y = o.clone().setFromMatrixColumn(c.matrixWorld, 1).multiplyScalar(panY * r);
    v.jumpTo(p.add(x).add(y).toArray(), t.add(x).add(y).toArray());
    // Put there by hand, as a reader would: the view leaves it there.
    stage().fitted = null;
    await sleep(400);
};
const power = (on) => { if (panel.isPoweredOn != on) panel.onToggle('off-on'); };
const run = () => panel.operate('stop-run', 'down');
const stop = () => panel.operate('stop-run', 'up');
const example = async (id) => { await panel.fetchExamples(); panel.loadExample(id); };
// Sets the address switches, A15-A0, to a number.
const switches = (n) => {
    for (let i = 0; i < 16; i++) {
        panel.operate('s' + i, (n >> i) & 1 ? 'up' : 'down');
    }
};
// Typed at the Teletype, a key at a time; a newline is Return.
const type = async (text, gap = 30) => {
    for (const ch of text) {
        panel.ttySend(ch == '\\n' ? 13 : ch.charCodeAt(0));
        await sleep(gap);
    }
};
// Microsoft 4K BASIC, booted on 8 KB and answered, a program typed in
// and run: a sine wave of stars down the paper.
const BASIC_PROGRAM = '10 FOR X=0 TO 6.3 STEP .9\\n20 PRINT TAB(16+14*SIN(X));"*"\\n30 NEXT X\\nRUN\\n';
const basic = async (program = BASIC_PROGRAM) => {
    panel.onSetMemSize(8192);
    await sleep(300);
    panel.onLoadBasic();
    for (let i = 0; i < 50 && !panel.isPoweredOn; i++) await sleep(100);
    await sleep(500);
    run();
    tab('tty');
    await sleep(1500);
    await type('\\n'); await sleep(800);
    await type('\\n'); await sleep(800);
    await type('Y\\n'); await sleep(1500);
    await type('PRINT 22/7\\n'); await sleep(800);
    await type(program); await sleep(3000);
};
`;
