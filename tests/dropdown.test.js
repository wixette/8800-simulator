/**
 * The page's own drop down menu (js/dropdown.js), on a stand-in for the
 * few parts of the document it touches.
 *
 * Run with: npm test
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert');

/**
 * A stand-in for one element: enough for Dropdown to wire itself up,
 * open and close.
 * @return {Object}
 */
function fakeElement() {
    const attributes = {};
    return {
        hidden: true,
        children: [],
        setAttribute: (name, value) => { attributes[name] = value; },
        getAttribute: (name) => attributes[name],
        addEventListener: () => {},
        focus: () => {},
        contains: () => false,
    };
}

/**
 * A menu's root, with its button, its list, and one item in the list.
 * @return {Object}
 */
function fakeMenu() {
    const button = fakeElement();
    const list = fakeElement();
    list.querySelectorAll = () => [fakeElement()];
    list.querySelector = () => null;
    const root = fakeElement();
    root.querySelector = (selector) =>
        selector == 'button' ? button : selector == 'ul' ? list : null;
    return {root: root, button: button, list: list};
}

test('opening a menu closes whichever other menu is open', (t) => {
    const menus = {a: fakeMenu(), b: fakeMenu()};
    const savedDocument = global.document;
    global.document = {
        getElementById: (id) => menus[id].root,
        addEventListener: () => {},
    };
    t.after(() => { global.document = savedDocument; });
    const Dropdown = require('../js/dropdown.js');
    Dropdown.all.length = 0;
    const a = new Dropdown('a', () => {});
    const b = new Dropdown('b', () => {});
    a.open();
    assert.ok(a.isOpen());
    // The bug this guards: Load and Memory both open at once, because a
    // menu button's click never reaches the other menu as a click
    // outside it.
    b.open();
    assert.ok(b.isOpen(), 'the one asked for opens');
    assert.ok(!a.isOpen(), 'the other one closes');
    assert.strictEqual(menus.a.button.getAttribute('aria-expanded'), 'false');
});
