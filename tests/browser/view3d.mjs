/**
 * The 3D view in the page (docs/3d-view.md): it loads only when chosen,
 * its front panel works as the 2D one does - clicked on the model, as a
 * reader clicks it - the box comes apart and goes back as the power
 * allows, the camera answers the keyboard, and the toggle and a link
 * open the view the reader expects.
 */

/** Waits until the 3D view has loaded, or a few seconds have gone. */
async function load3d(h) {
    for (let i = 0; i < 60 && !(await h.js(`!!panel.stage3d`)); i++) {
        await h.sleep(250);
    }
    await h.sleep(400);
    return h.js(`!!panel.stage3d`);
}

/**
 * Clicks a part of the model where it is on the screen now.
 * @param {!Object} h The harness.
 * @param {string} name The node, as the model names it.
 * @param {!Array<number>|string=} where A point in its frame, 'top', or a
 *     bat's 'upper' or 'lower' half as drawn.
 */
async function click(h, name, where = [0, 0, 0]) {
    const p = await h.js(`panel.stage3d.screenPoint(${JSON.stringify(name)}, ${JSON.stringify(where)})`);
    for (const type of ['mousePressed', 'mouseReleased']) {
        await h.send('Input.dispatchMouseEvent', {type, x: p.x, y: p.y, button: 'left', clickCount: 1});
    }
    await h.sleep(250);
}

/** A bat's tip, in its own frame: its upper half throws it up. */
const TIP = [0, 0, 0.009];

/** Every lamp drawn in 3D as the 2D panel draws it. */
const LAMPS_AGREE = `[...panel.stage3d.panelBind.lamps.keys()].every((id) =>
    panel.stage3d.panelBind.isLit(id) === !!panel.lamps[id])`;

export default async function(h) {
    const {js, viewport, fresh, press, verify, statusText, sleep} = h;
    await viewport(1280, 860); await fresh();
    verify('a first visit opens on the 2D panel', await js(`panel.view`) === '2d');
    verify('with a dot on 3D, until it is seen', await js(`document.getElementById('view-3d').classList.contains('has-news')`));
    const before = await js(`performance.getEntriesByType('resource').filter((e) => /three|view3d|\\.glb/.test(e.name)).length`);
    verify('nothing of the 3D view is fetched before it is chosen', before === 0, before);
    await press('#view-3d');
    verify('3D loads', await load3d(h));
    verify('and says how to use it', (await statusText()).startsWith('The whole machine in 3D'), await statusText());
    verify('the dot is gone', !(await js(`document.getElementById('view-3d').classList.contains('has-news')`)));
    verify('the 2D panel gives way to it', await js(`getComputedStyle(document.getElementById('panel')).display`) === 'none');
    verify('the 3D lamps start as the 2D ones', await js(LAMPS_AGREE));

    // The 3D panel works the page's machine.
    await click(h, 'panel.switch.off_on', TIP);
    verify('OFF/ON clicked in 3D switches the machine on', await js(`panel.isPoweredOn`));
    await sleep(500);
    await click(h, 'panel.switch.s7', TIP);
    await click(h, 'panel.switch.s0', TIP);
    verify('address switches clicked in 3D raise A7 and A0', await js(`panel.getInputAddressCallback()`) === 0x81);
    await click(h, 'panel.switch.examine', 'upper');
    await sleep(300);
    verify('EXAMINE clicked in 3D examines 0081H', await js(`panel.sim.lastAddress`) === 0x81);
    verify('and the 3D lamps show what the 2D lamps show', await js(LAMPS_AGREE));
    verify('A7 and A0 are lit', await js(`panel.stage3d.panelBind.isLit('a7') && panel.stage3d.panelBind.isLit('a0') && !panel.stage3d.panelBind.isLit('a1')`));
    verify('the EXAMINE bat springs back to centre', await js(`panel.stage3d.panelBind.angleOf('examine')`) === 0);
    await click(h, 'panel.switch.examine', 'lower');
    await sleep(300);
    verify('its lower half gives EXAMINE NEXT', await js(`panel.sim.lastAddress`) === 0x82);
    await click(h, 'panel.switch.single', 'lower');
    verify('SINGLE STEP\'s lower half does nothing', await js(`panel.stage3d.panelBind.angleOf('single')`) === 0);

    // The box and the power.
    await js(`panel.stage3d.setView('whole')`); await sleep(1100);
    await click(h, 'case.top', 'top');
    verify('the lid will not come off while the machine is on', (await statusText()).startsWith('Switch the machine OFF'), await statusText());
    await click(h, 'panel.switch.off_on', TIP);
    verify('OFF in 3D', !(await js(`panel.isPoweredOn`)));
    await click(h, 'case.top', 'top');
    await sleep(1100);
    verify('switched off, the lid comes off', await js(`panel.box.isOut('case.top')`), await statusText());
    await click(h, 'panel.switch.off_on', TIP);
    verify('and ON is refused while it is off', !(await js(`panel.isPoweredOn`)) &&
           (await statusText()).startsWith('The machine is taken apart'), await statusText());
    await click(h, 'card.cpu', 'top');
    verify('the CPU card waits for its data plug', (await statusText()).startsWith('Take this out first: Data cable plug'), await statusText());
    // Show is a menu of its own, and its button shows which.
    const showButton = `(() => { const b = document.getElementById('show-button'); return {changed: b.classList.contains('changed'), title: b.title, icon: document.getElementById('show-current').innerHTML}; })()`;
    const plain = await js(showButton);
    verify('the Show button starts as the whole machine', !plain.changed && plain.title == 'Show: Everything', JSON.stringify(plain));
    await press('#show-button');
    verify('the Show menu lists the four, then the parts, each with its icon',
           await js(`[...document.querySelectorAll('#show-list [role="option"]')].map((li) => li.dataset.value + (li.querySelector('svg.dropdown-icon path') ? '+' : '')).join()`) ==
           'all+,case-faded+,case-hidden+,electronics+,cpu+,memory+,serial+,bus+,psu+');
    await press('#show-list [data-value="case-faded"]');
    const after = await js(showButton);
    verify('choosing one shows its icon, marked as a change', after.changed && after.icon != plain.icon && after.title == 'Show: Case faded', JSON.stringify(after));
    await js(`panel.box.snapTogether()`); await sleep(300);
    await click(h, 'card.mem1k', 'top');
    verify('a click goes through the faded lid to the card under it',
           (await statusText()).startsWith('Take this out first: Case top'), await statusText());
    await press('#show-button');
    await press('#show-list [data-value="all"]');
    verify('and the whole machine again is no change', !(await js(showButton)).changed);
    // A load switches the machine on, putting the box together first.
    await js(`panel.box.takeOut('case.top', false); panel.box.snap()`);
    await js(`document.getElementById('debug-data-input').value = '76'; panel.debugLoadData()`);
    await sleep(200);
    verify('a load puts the box together and switches on', await js(`panel.isPoweredOn && panel.box.isWhole()`));
    verify('and says it did', (await statusText()).startsWith('The machine was taken apart and off, so it was put back together'), await statusText());
    await js(`panel.onPowerOff()`);

    // Taken apart is a view.
    await press('#views-button');
    await press('#views-list [data-value="apart"]');
    for (let i = 0; i < 80 && await js(`panel.box.isBusy()`); i++) {
        await sleep(250);
    }
    verify('Taken apart takes every unit out', await js(`panel.box.units().every((u) => panel.box.isOut(u))`));
    verify('and says how to put it back', (await statusText()).startsWith('Taken apart'), await statusText());
    verify('the menu names the view', await js(`document.querySelector('#views-current > span:not(.dropdown-label-room)').textContent`) === 'Taken apart');
    await press('#views-button');
    await press('#views-list [data-value="front"]');
    for (let i = 0; i < 80 && await js(`panel.box.isBusy()`); i++) {
        await sleep(250);
    }
    verify('another view puts it all back', await js(`panel.box.isWhole()`));

    // The keyboard.
    await js(`document.getElementById('stage3d-canvas').focus()`);
    const at = await js(`panel.stage3d.viewer.camera.position.toArray().join()`);
    await h.send('Input.dispatchKeyEvent', {type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37});
    await h.send('Input.dispatchKeyEvent', {type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37});
    await sleep(400);
    verify('an arrow key turns the view', await js(`panel.stage3d.viewer.camera.position.toArray().join()`) !== at);
    verify('and the camera is the reader\'s now', await js(`panel.stage3d.fitted`) === null);
    await h.send('Input.dispatchKeyEvent', {type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36});
    await sleep(1100);
    verify('Home puts it back', await js(`panel.stage3d.fitted`) === 'front');
    await press('#view-zoom-in'); await sleep(300);
    verify('the zoom buttons zoom', await js(`panel.stage3d.fitted`) === null);

    // Back to 2D, with the box apart.
    await js(`panel.box.takeOut('case.top', false); panel.box.snap()`);
    await press('#view-2d');
    verify('2D shows the panel again, and puts the box together', await js(`panel.view == '2d' && panel.box.isWhole()`));
    verify('saying so', (await statusText()).startsWith('Back to the 2D view'), await statusText());
    verify('the 3D view stops drawing while hidden', !(await js(`panel.stage3d.viewer.running`)));
    verify('no errors so far', h.errors.length === 0, JSON.stringify(h.errors));
}

/** The view is remembered, and a link can choose it. */
export async function remembered(h) {
    const {js, viewport, fresh, press, verify, send, sleep} = h;
    await viewport(1280, 860); await fresh();
    await press('#view-3d');
    await load3d(h);
    const url = await js(`location.href.split('#')[0]`);
    await send('Page.navigate', {url}); await sleep(1500);
    verify('a reload opens the 3D view again', await js(`panel.view`) === '3d' && await load3d(h));
    await send('Page.navigate', {url: url + '#view=2d'}); await sleep(1500);
    verify('a link with view=2d opens the 2D panel', await js(`panel.view`) === '2d');
    await js(`localStorage.clear()`);
    await send('Page.navigate', {url: url + '?view=3d#hex=3E8C'}); await sleep(1500);
    verify('a link with view=3d opens the 3D view', await js(`panel.view`) === '3d' && await load3d(h));
    verify('and loads its program too', await js(`panel.sim.mem[0] == 0x3e && panel.sim.mem[1] == 0x8c`));
    await js(`document.getElementById('copy-link-state').checked = false`);
    verify('a link shared from 3D opens in 3D', /view=3d/.test(await js(`panel.currentLink()`)));
}

/** On a phone, the same toggle, and a 3D view with room. */
export async function phone(h) {
    const {js, viewport, fresh, press, verify} = h;
    await viewport(375, 740); await fresh();
    const tab = await js(`(() => { const b = document.getElementById('view-3d').getBoundingClientRect(); return b.width > 20 && b.right <= innerWidth; })()`);
    verify('the toggle is on screen', tab);
    await press('#view-3d');
    verify('3D loads on a phone', await load3d(h));
    const box = await js(`(() => { const b = document.getElementById('stage3d').getBoundingClientRect(); return {w: b.width, h: b.height}; })()`);
    verify('with room to see the machine', box.h >= 220 && box.w >= 300, JSON.stringify(box));
    verify('the tools fit across the top', await js(`(() => { const t = document.getElementById('view-tools'); return t.scrollWidth <= t.clientWidth + 1 && t.getBoundingClientRect().height < 40; })()`));
    verify('nothing to scroll sideways', await js(`document.documentElement.scrollWidth <= innerWidth`));
    const label = await js(`(() => { const c = getComputedStyle(document.getElementById('part-label')); return c.top + ' ' + c.bottom; })()`);
    verify('a part\'s label goes over the case top, not the panel', label.startsWith('8px') && label.endsWith('auto'), label);
    // Choosing a view moves nothing on the top edge, in any language (U8).
    const tools = `JSON.stringify(['view-reset', 'view-zoom-out', 'views-button', 'show-button', 'view-2d'].map((id) => { const b = document.getElementById(id).getBoundingClientRect(); return [Math.round(b.left), Math.round(b.width)]; }))`;
    const moved = [];
    for (const locale of await js(`l10n.LOCALES`)) {
        await js(`l10n.setLocale('${locale}')`); await h.sleep(80);
        const at = [];
        for (const view of ['front', 'whole', 'above', 'rear']) {
            await js(`panel.stage3d.setView('${view}')`);
            at.push(await js(tools));
        }
        await js(`panel.stage3d.setShow('electronics')`);
        at.push(await js(tools));
        await js(`panel.stage3d.setShow('all')`);
        const fits = await js(`(() => { const t = document.getElementById('view-tools'); return t.scrollWidth <= t.clientWidth + 1; })()`);
        if (new Set(at).size != 1 || !fits) {
            moved.push(locale + (fits ? '' : ' (does not fit)') + ': ' + [...new Set(at)].join(' / '));
        }
    }
    await js(`l10n.setLocale('en')`); await h.sleep(80);
    verify('the tools stay put whichever view or Show, in every language', moved.length == 0, moved.join('; '));
}

/**
 * The views: each centres the machine, the front shows a band of the
 * top, Taken apart looks at the cards' chips, and leaving it is quick.
 * And the label keeps out of the way of the panel being worked.
 */
export async function views(h) {
    const {js, send, viewport, fresh, press, verify, sleep} = h;
    await viewport(1280, 860); await fresh();
    await press('#view-3d');
    verify('3D loads', await load3d(h));
    const settle = async () => {
        for (let i = 0; i < 120 && await js(`panel.box.isBusy() || panel.stage3d.viewer.isFlying()`); i++) {
            await sleep(100);
        }
    };
    // Where the box itself - the case, without the cord - is on the stage.
    const placed = `(async () => {
        const {silhouette, corners} = await import('./js/view3d/framing.js');
        const s = panel.stage3d; const b = s.boxBind;
        const camera = {position: s.viewer.camera.position.toArray(), target: s.viewer.controls.target.toArray()};
        const {width, height} = s.viewer.size();
        const sil = silhouette(corners(b.boxes((n) => /^case\\./.test(b.modelName(n)))), camera, 35, width, height);
        const top = b.boxes((n) => b.modelName(n) == 'case.top')[0];
        return {dx: ((sil.left + sil.right) / 2 - width / 2) / width, dy: ((sil.top + sil.bottom) / 2 - height / 2) / height,
                cam: camera.position, target: camera.target, caseTop: top ? top.max[1] : null};
    })()`;
    for (const view of ['front', 'whole', 'above', 'rear']) {
        await js(`panel.stage3d.setView('${view}')`); await settle();
        const at = await js(placed);
        verify(view + ' centres the box on the stage', Math.abs(at.dx) < 0.02 && Math.abs(at.dy) < 0.04,
               JSON.stringify({dx: at.dx.toFixed(3), dy: at.dy.toFixed(3)}));
        if (view == 'front') {
            verify('the front looks from just above the top, so a band of it shows',
                   at.cam[1] > at.caseTop && at.cam[1] < at.caseTop + 0.15, JSON.stringify(at));
        }
    }
    // A bat's halves, as drawn, throw it up and down from every view:
    // from above, a bat sticking out shows only its top, every point of
    // it above the pivot, so world height cannot tell them apart.
    const halves = [];
    for (const view of ['front', 'whole', 'above']) {
        await js(`panel.stage3d.setView('${view}')`); await settle();
        for (const half of ['upper', 'lower']) {
            halves.push(view + ' ' + half + ': ' + await js(`(() => { const s = panel.stage3d; const p = s.screenPoint('panel.switch.examine', '${half}');
                const hit = s.hitAt({clientX: p.x, clientY: p.y}); const t = hit && s.panelBind.pick(hit.object, hit.point, s.viewer.camera); return t ? t.id + ' ' + t.dir : 'nothing'; })()`));
        }
    }
    verify('a bat\'s upper half throws it up, its lower half down, from every view',
           halves.every((x) => x.endsWith(x.includes('upper') ? 'examine up' : 'examine down')), halves.join('; '));
    await js(`panel.stage3d.setView('apart')`); await settle();
    const apart = await js(placed);
    verify('Taken apart looks from the right and behind, at the cards\' chips',
           apart.cam[0] > apart.target[0] && apart.cam[2] < apart.target[2], JSON.stringify(apart));
    const t0 = Date.now();
    await js(`panel.stage3d.setView('front')`);
    for (let i = 0; i < 100 && await js(`panel.box.isBusy()`); i++) await sleep(50);
    const took = Date.now() - t0;
    verify('leaving it puts the box back in a couple of seconds', took < 3000 && await js(`panel.box.isWhole()`), took + ' ms');
    await settle();

    // The label: in the stage's corner, never over the pointer, and a
    // click it offers is one that works.
    const move = async (x, y) => {
        await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x, y});
        await sleep(150);
    };
    const tip = await js(`panel.stage3d.screenPoint('panel.switch.s7', [0, 0, 0.009])`);
    // Sliding across the panel shows no labels: one shows only once the
    // pointer rests (U8).
    const s0 = await js(`panel.stage3d.screenPoint('panel.switch.s0', [0, 0, 0.009])`);
    const shownWhileSliding = [];
    for (let i = 0; i <= 20; i++) {
        await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: s0.x + (tip.x - s0.x) * i / 20, y: tip.y + 6 * Math.sin(i)});
        await sleep(40);
        shownWhileSliding.push(await js(`!document.getElementById('part-label').hidden`));
    }
    verify('sliding across the panel shows no label', !shownWhileSliding.includes(true), shownWhileSliding.join());
    await move(tip.x, tip.y);
    verify('the hand shows at once over a switch', await js(`document.getElementById('stage3d-canvas').style.cursor`) == 'pointer');
    await sleep(450);
    const label = `(() => { const l = document.getElementById('part-label'); const r = l.getBoundingClientRect(); const s = document.getElementById('stage3d').getBoundingClientRect();
        return {shown: !l.hidden, left: Math.round(r.left - s.left), bottom: Math.round(s.bottom - r.bottom), right: r.right, top: r.top, text: l.innerText.replace(/\\n/g, ' | '), cursor: document.getElementById('stage3d-canvas').style.cursor}; })()`;
    const onSwitch = await js(label);
    verify('over a switch, the label names it', onSwitch.shown && onSwitch.text.startsWith('Switch A07'), JSON.stringify(onSwitch));
    verify('in the stage\'s bottom left corner', onSwitch.left <= 10 && onSwitch.bottom <= 10, JSON.stringify(onSwitch));
    verify('not over the pointer', tip.x > onSwitch.right || tip.y < onSwitch.top, JSON.stringify([tip, onSwitch]));
    verify('and the hand says a click throws it', onSwitch.cursor == 'pointer');
    // A spot of the dress panel between the switches and lamps.
    const bare = await js(`(() => {
        const s = panel.stage3d; const r = s.canvas.getBoundingClientRect();
        for (let y = 0.3; y < 0.8; y += 0.02) {
            for (let x = 0.3; x < 0.7; x += 0.01) {
                const px = {clientX: r.left + x * r.width, clientY: r.top + y * r.height};
                const hit = s.hitAt(px);
                if (hit && !s.panelBind.pick(hit.object, hit.point, s.viewer.camera) && (s.boxBind.partAt(hit.object) || {}).unit == 'panel.dress') {
                    return {x: px.clientX, y: px.clientY};
                }
            }
        }
        return null;
    })()`);
    verify('the dress panel shows between the switches', !!bare);
    if (bare) {
        await move(bare.x, bare.y);
        await sleep(450);
        const onDress = await js(label);
        verify('over it, the label says why it cannot come out yet, not "click to take it out"',
               onDress.text.includes('Take this out first: Chassis') && !onDress.text.includes('Click'), onDress.text);
        verify('and no hand, as a click there does nothing', onDress.cursor == '', onDress.cursor);
    }
}

/** The Tutorial's contents and its Show chips (V7). */
export async function tutorial(h) {
    const {js, viewport, fresh, verify, statusText, sleep} = h;
    await viewport(1280, 860); await fresh();
    const names = await js(`[...document.querySelectorAll('.tutorial-jump')].map((b) => b.textContent)`);
    verify('the contents name the four chapters', names.length == 4 && names[0] == 'Meet the Machine', names.join(' | '));
    await js(`document.querySelectorAll('.tutorial-jump')[2].click()`); await sleep(200);
    const top = await js(`document.getElementById('chapter-asm').getBoundingClientRect().top - document.getElementById('dock-body').getBoundingClientRect().top`);
    verify('a chapter\'s button scrolls to it', Math.abs(top) < 4, top);
    const chip = (i) => js(`document.querySelectorAll('.show-chip')[${i}].click()`);
    await chip(1); await sleep(200);
    verify('a 2D Show outlines the data lamps', await js(`!!document.getElementById('tutorial-outline')`));
    verify('and names them', (await statusText()) == 'Showing: the data lamps D7–D0.', await statusText());
    await chip(6);
    for (let i = 0; i < 60 && !(await js(`!!panel.stage3d`)); i++) await sleep(250);
    await sleep(1200);
    verify('a 3D Show opens the 3D view', await js(`panel.view`) === '3d');
    verify('and picks out the CPU card', await js(`panel.stage3d.boxBind.show`) === 'cpu');
    verify('saying so', (await statusText()) == 'Showing: CPU card.', await statusText());
    // The menus say what the chip chose: they are the same choices.
    const tools = `(() => { const b = document.getElementById('show-button'); return {view: document.querySelector('#views-current > span:not(.dropdown-label-room)').textContent, title: b.title, changed: b.classList.contains('changed')}; })()`;
    const picked = await js(tools);
    verify('the Views button names where it looks from', picked.view == 'Whole machine', JSON.stringify(picked));
    verify('the Show button names the part, in orange', picked.changed && picked.title == 'Show: CPU card', JSON.stringify(picked));
    await h.press('#show-button');
    const menu = await js(`[...document.querySelectorAll('#show-list li')].map((li) => li.getAttribute('aria-selected') == 'true' ? '[' + li.textContent + ']' : li.textContent).join(' | ')`);
    verify('the Show menu lists the parts after the four, the CPU card chosen',
           menu == 'Everything | Case faded | Case hidden | Electronics only | Parts | [CPU card] | Memory cards | Serial cards | The bus | Power supply', menu);
    await h.press('#show-list [data-value="case-faded"]'); await sleep(300);
    const lid = `(() => { let m, lines; panel.stage3d.boxBind.find('case.top').traverse((o) => { if (o.isMesh && !m) m = [].concat(o.material)[0]; if (o.isLineSegments) lines = o.visible; }); const cpu = panel.stage3d.boxBind.find('card.cpu'); let c; cpu.traverse((o) => { if (o.isMesh && !c) c = [].concat(o.material)[0]; }); return {opacity: +m.opacity.toFixed(2), lines, cpuGlows: c.emissive.getHex() == 0xff9900}; })()`;
    verify('Case faded shows the case as glass, outlined, not gone, the CPU card no longer picked out',
           JSON.stringify(await js(lid)) == '{"opacity":0.4,"lines":true,"cpuGlows":false}', JSON.stringify(await js(lid)));
    verify('as its button says', (await js(tools)).title == 'Show: Case faded');
    await h.press('#show-button'); await h.press('#show-list [data-value="psu"]'); await sleep(200);
    verify('a part chosen from the menu glows, the case fading round it',
           JSON.stringify(await js(lid)) == '{"opacity":0.16,"lines":false,"cpuGlows":false}' && await js(`panel.stage3d.boxBind.show`) === 'psu', JSON.stringify(await js(lid)));
    await js(`panel.stage3d.setView('rear')`); await sleep(200);
    verify('and stays picked out from another view, as any Show does', await js(`panel.stage3d.boxBind.show`) === 'psu');
    await chip(7); await sleep(300);
    verify('the memory Show picks out the cards the Memory menu fitted', await js(`(() => { const b = panel.stage3d.boxBind; const glow = (n) => { let c; b.find(n).traverse((o) => { if (o.isMesh && !c) c = [].concat(o.material)[0]; }); return c.emissive.getHex() == 0xff9900; }; return b.show == 'memory' && glow('card.mem1k') && !glow('card.cpu'); })()`));
    await chip(5); await sleep(300);
    verify('See it whole puts the whole machine back', await js(`panel.stage3d.boxBind.show`) === 'all' && !(await js(tools)).changed);
    verify('a Show never switched the machine on', !(await js(`panel.isPoweredOn`)));
}
