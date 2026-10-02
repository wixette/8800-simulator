/**
 *   Copyright 2020-2026 wixette@gmail.com
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 * @fileoverview A drop down menu that the page draws itself.
 */


/**
 * A button that opens a list under itself.
 *
 * The browser's own <select> would be less code, but its popup is
 * drawn by the operating system: on a phone it arrives in a tiny font,
 * pushed to one side, looking like nothing else on the page, and there
 * is no styling that reaches it. So the page draws its own, which also
 * means the keys a native menu would have handled - arrows, Enter,
 * Escape, Tab - have to be handled here.
 *
 * A menu holds items and nothing else (docs/ui-design.md): no text
 * boxes, no buttons, no menu opening over it. Anything that needs more
 * than a choice is an item that opens a dialog.
 *
 * Expects a root element holding a <button> and a <ul role="listbox">,
 * and optionally an element with the class dropdown-label inside the
 * button for setLabel(). See index.html.
 */
class Dropdown {
    /**
     * @param {string} rootId Id of the element holding the button and
     *     the list.
     * @param {function(string)} onSelect Called with the value of
     *     whichever item was chosen - an unavailable one too, so that it
     *     can say why it is unavailable (D19).
     * @param {function()=} onOpen Called each time the list is about to
     *     open, for a menu whose items depend on the moment.
     */
    constructor(rootId, onSelect, onOpen) {
        this.root = document.getElementById(rootId);
        if (!this.root) {
            return;
        }
        this.button = this.root.querySelector('button');
        this.label = this.root.querySelector('.dropdown-label');
        this.list = this.root.querySelector('ul');
        this.onSelect = onSelect;
        this.onOpen = onOpen || null;
        Dropdown.all.push(this);

        var self = this;
        this.button.addEventListener('click', function(event) {
            event.stopPropagation();
            if (self.list.hidden) {
                self.open();
            } else {
                self.close();
            }
        }, false);

        // Anywhere else on the page dismisses it, leaving the focus on
        // whatever was clicked.
        document.addEventListener('click', function(event) {
            if (!self.list.hidden && !self.root.contains(event.target)) {
                self.close(false);
            }
        }, false);

        document.addEventListener('keydown', function(event) {
            self.onKeyDown(event);
        }, false);
    }

    /**
     * Fills the list.
     * @param {Array<{value: (string|undefined), label: string,
     *     detail: (string|undefined), heading: (boolean|undefined),
     *     disabled: (boolean|undefined)}>} items The choices, in order.
     *     An item marked heading names the group below it and cannot be
     *     chosen; the arrow keys step over it. A disabled one is greyed
     *     but still answers, and its detail - quieter text at its right
     *     - is the place to say why.
     */
    setItems(items) {
        if (!this.list) {
            return;
        }
        var self = this;
        // A list rebuilt while it is open - Load, when the examples
        // arrive - keeps the keyboard on the item it was on.
        var focused = this.list.contains(document.activeElement) ?
            document.activeElement.dataset.value : null;
        this.list.textContent = '';
        for (let i = 0; i < items.length; i++) {
            let item = document.createElement('li');
            if (items[i].heading) {
                item.setAttribute('role', 'presentation');
                item.classList.add('dropdown-heading');
                item.textContent = items[i].label;
                this.list.appendChild(item);
                continue;
            }
            item.setAttribute('role', 'option');
            item.setAttribute('tabindex', '-1');
            item.dataset.value = items[i].value;
            let label = document.createElement('span');
            label.className = 'dropdown-item-label';
            label.textContent = items[i].label;
            item.appendChild(label);
            if (items[i].detail) {
                let detail = document.createElement('span');
                detail.className = 'dropdown-detail';
                detail.textContent = items[i].detail;
                item.appendChild(detail);
            }
            if (items[i].disabled) {
                item.classList.add('disabled');
                item.setAttribute('aria-disabled', 'true');
            }
            item.addEventListener('click', function() {
                self.close();
                self.onSelect(items[i].value);
            }, false);
            this.list.appendChild(item);
            if (focused !== null && item.dataset.value === focused) {
                item.focus();
            }
        }
    }

    /**
     * @return {Array<Element>} The items that can be chosen, headings
     *     left out.
     */
    options() {
        return Array.from(this.list.querySelectorAll('[role="option"]'));
    }

    /**
     * @return {boolean} Whether the list is open.
     */
    isOpen() {
        return !!this.list && !this.list.hidden;
    }

    /**
     * Sets the text on the button itself.
     * @param {string} text The label.
     */
    setLabel(text) {
        if (this.label) {
            this.label.textContent = text;
        }
    }

    /**
     * Marks one item as the current choice, for a menu that holds one.
     * A menu of actions passes null and marks nothing.
     * @param {?string} value The chosen value.
     */
    setSelected(value) {
        if (!this.list) {
            return;
        }
        for (const item of this.options()) {
            item.setAttribute('aria-selected',
                              item.dataset.value === value ? 'true' : 'false');
        }
    }

    /**
     * Opens the list, with the keyboard on the current choice if the
     * menu holds one.
     */
    open() {
        // One menu at a time. The button's click stops where it is, so
        // another menu never hears it as a click outside itself.
        Dropdown.all.forEach((other) => {
            if (other !== this && other.isOpen()) {
                other.close(false);
            }
        });
        if (this.onOpen) {
            this.onOpen();
        }
        if (!this.options().length) {
            // An empty menu does not open; whoever left it empty says
            // why.
            return;
        }
        this.list.hidden = false;
        this.button.setAttribute('aria-expanded', 'true');
        // A menu of actions holds no choice - loading an example does
        // not leave the machine on that example - so it opens with
        // nothing picked out rather than lighting up the first entry
        // as though it were one. The arrow keys step in from the edge.
        var current = this.list.querySelector('[aria-selected="true"]');
        if (current) {
            current.focus();
        }
    }

    /**
     * Closes the list.
     * @param {boolean=} refocus Whether to put the keyboard back on the
     *     button.
     */
    close(refocus = true) {
        this.list.hidden = true;
        this.button.setAttribute('aria-expanded', 'false');
        if (refocus) {
            this.button.focus();
        }
    }

    /**
     * The keys a native menu would have handled by itself.
     * @param {Event} event The keydown event.
     */
    onKeyDown(event) {
        if (!this.list || this.list.hidden) {
            return;
        }
        var items = this.options();
        var at = items.indexOf(document.activeElement);
        if (event.key === 'Tab') {
            this.close();
            return;
        }
        // A key the menu takes is the menu's alone. (The teletype also
        // leaves the keyboard to any open menu - panel.onTtyKeyDown -
        // but this one may hear a key first or last.)
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.close();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            event.stopImmediatePropagation();
            let step = event.key === 'ArrowDown' ? 1 : -1;
            // From nothing, Down steps in at the top and Up at the
            // bottom.
            let next = at < 0 ? (step > 0 ? 0 : items.length - 1) :
                (at + step + items.length) % items.length;
            items[next].focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
            if (at >= 0) {
                event.preventDefault();
                event.stopImmediatePropagation();
                let value = items[at].dataset.value;
                this.close();
                this.onSelect(value);
            }
        }
    }
};

/**
 * Every menu on the page, so that opening one can close the rest.
 * @type {Array<Dropdown>}
 */
Dropdown.all = [];

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dropdown;
}
