/**
 * The page's modal dialog (js/dialog.js), on a stand-in for the
 * <dialog> element.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');

/**
 * A stand-in <dialog>, with a text box inside it, that can be sent
 * pointer events.
 * @return {{elem: Object, textBox: Object, send: function(string, Object)}}
 */
function fakeDialog() {
    const handlers = {};
    const elem = {
        open: false,
        showModal() { this.open = true; },
        close() { this.open = false; },
        addEventListener: (type, fn) => { handlers[type] = fn; },
    };
    const textBox = {closest: () => null};
    elem.closest = () => null;
    return {
        elem: elem,
        textBox: textBox,
        // An event nothing listens for is simply not heard.
        send: (type, target) => handlers[type] && handlers[type]({target: target}),
    };
}

/**
 * A Dialog on a fresh stand-in, open.
 * @param {!Object} t The test context.
 * @return {{dialog: Object, fake: Object}}
 */
function openDialog(t) {
    const fake = fakeDialog();
    const savedDocument = global.document;
    global.document = {getElementById: () => fake.elem};
    t.after(() => { global.document = savedDocument; });
    const Dialog = require('../js/dialog.js');
    const dialog = new Dialog('d');
    dialog.open();
    return {dialog: dialog, fake: fake};
}

/** Presses on one element and lets go on another, as the browser does. */
function press(fake, down, up) {
    fake.send('pointerdown', down);
    fake.send('pointerup', up);
    // The click goes to whatever holds both: the <dialog> itself, unless
    // both ends were on the same element inside it.
    fake.send('click', down === up ? down : fake.elem);
}

test('a press on the backdrop closes the dialog', (t) => {
    const {dialog, fake} = openDialog(t);
    press(fake, fake.elem, fake.elem);
    assert.ok(!dialog.isOpen());
});

test('a selection dragged out of the dialog does not close it', (t) => {
    // Press in the text box, drag over the backdrop, let go: the click
    // arrives on the <dialog>, as though the backdrop had been pressed.
    const {dialog, fake} = openDialog(t);
    press(fake, fake.textBox, fake.elem);
    assert.ok(dialog.isOpen());
});

test('closed with the mouse, a dialog lets go of the focus', (t) => {
    // The browser gives the focus back to the button that opened it,
    // which would then keep the keyboard from the teletype.
    const {dialog, fake} = openDialog(t);
    let blurred = false;
    const opener = {blur: () => { blurred = true; }};
    global.document.activeElement = opener;
    global.document.body = {};
    press(fake, fake.elem, fake.elem);
    fake.send('close', fake.elem);
    assert.ok(!dialog.isOpen());
    assert.ok(blurred);
});

test('closed with Escape, it leaves the focus where the browser puts it', (t) => {
    const {dialog, fake} = openDialog(t);
    let blurred = false;
    global.document.activeElement = {blur: () => { blurred = true; }};
    global.document.body = {};
    dialog.close();
    fake.send('close', fake.elem);
    assert.ok(!blurred);
});

test('a press on the backdrop let go inside does not close it', (t) => {
    const {dialog, fake} = openDialog(t);
    press(fake, fake.elem, fake.textBox);
    assert.ok(dialog.isOpen());
});
