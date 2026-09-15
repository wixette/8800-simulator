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
 * Expects a root element holding a <button> with a label element
 * inside it, and a <ul role="listbox">. See index.html.
 */
class Dropdown {
    /**
     * @param {string} rootId Id of the element holding the button and
     *     the list.
     * @param {function(string)} onSelect Called with the value of
     *     whichever item was chosen.
     */
    constructor(rootId, onSelect) {
        this.root = document.getElementById(rootId);
        if (!this.root) {
            return;
        }
        this.button = this.root.querySelector('button');
        this.label = this.root.querySelector('.dropdown-label');
        this.list = this.root.querySelector('ul');
        this.onSelect = onSelect;

        var self = this;
        this.button.addEventListener('click', function(event) {
            event.stopPropagation();
            if (self.list.hidden) {
                self.open();
            } else {
                self.close();
            }
        }, false);

        // Anywhere else on the page dismisses it.
        document.addEventListener('click', function(event) {
            if (!self.list.hidden && !self.root.contains(event.target)) {
                self.close();
            }
        }, false);

        document.addEventListener('keydown', function(event) {
            self.onKeyDown(event);
        }, false);
    }

    /**
     * Fills the list.
     * @param {Array<{value: string, label: string}>} items The choices.
     */
    setItems(items) {
        if (!this.list) {
            return;
        }
        var self = this;
        this.list.textContent = '';
        for (let i = 0; i < items.length; i++) {
            let item = document.createElement('li');
            item.setAttribute('role', 'option');
            item.setAttribute('tabindex', '-1');
            item.dataset.value = items[i].value;
            item.textContent = items[i].label;
            item.addEventListener('click', function() {
                self.close();
                self.onSelect(items[i].value);
            }, false);
            this.list.appendChild(item);
        }
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
        for (const item of this.list.children) {
            item.setAttribute('aria-selected',
                              item.dataset.value === value ? 'true' : 'false');
        }
    }

    /** Opens the list, with the keyboard on the current choice. */
    open() {
        this.list.hidden = false;
        this.button.setAttribute('aria-expanded', 'true');
        var current = this.list.querySelector('[aria-selected="true"]');
        var first = current || this.list.firstElementChild;
        if (first) {
            first.focus();
        }
    }

    /** Closes the list and puts the keyboard back on the button. */
    close() {
        this.list.hidden = true;
        this.button.setAttribute('aria-expanded', 'false');
        this.button.focus();
    }

    /**
     * The keys a native menu would have handled by itself.
     * @param {Event} event The keydown event.
     */
    onKeyDown(event) {
        if (!this.list || this.list.hidden) {
            return;
        }
        var items = Array.from(this.list.children);
        var at = items.indexOf(document.activeElement);
        if (event.key === 'Escape' || event.key === 'Tab') {
            this.close();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            let step = event.key === 'ArrowDown' ? 1 : -1;
            let next = (at < 0 ? 0 : at + step + items.length) % items.length;
            items[next].focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
            if (at >= 0) {
                event.preventDefault();
                let value = items[at].dataset.value;
                this.close();
                this.onSelect(value);
            }
        }
    }
};

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dropdown;
}
