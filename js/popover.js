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
 * @fileoverview A toolbar button that opens a panel of controls under it.
 */


/**
 * A button in the toolbar and the panel it opens.
 *
 * Unlike a Dropdown, which is a list to choose one thing from, a
 * popover holds ordinary controls - buttons, a text box, even a
 * Dropdown of its own - for the things done once a session (P4 in
 * docs/ui-design.md). The controls keep their ids and their handlers;
 * the popover only decides when they are on screen.
 *
 * One is open at a time. A click anywhere outside, or Escape, closes
 * it. Escape is taken before anything else hears it, so that it does
 * not also reach the teletype, where it is KILL LINE.
 */
class Popover {
    /**
     * @param {string} buttonId The toolbar button.
     * @param {string} panelId The panel it opens, hidden to begin with.
     * @param {function()=} onOpen Called each time it opens.
     */
    constructor(buttonId, panelId, onOpen) {
        this.button = document.getElementById(buttonId);
        this.panel = document.getElementById(panelId);
        this.onOpen = onOpen || null;
        if (!this.button || !this.panel) {
            return;
        }
        Popover.all.push(this);

        var self = this;
        this.button.addEventListener('click', function(event) {
            event.stopPropagation();
            if (self.isOpen()) {
                self.close();
            } else {
                self.open();
            }
        }, false);

        document.addEventListener('click', function(event) {
            if (self.isOpen() && !self.panel.contains(event.target)) {
                self.close();
            }
        }, false);

        // In the capture phase, so that it runs before the listeners
        // on document, and stops there.
        document.addEventListener('keydown', function(event) {
            if (event.key !== 'Escape' || !self.isOpen()) {
                return;
            }
            // A menu open inside this one closes first, on its own.
            if (self.panel.querySelector('[role="listbox"]:not([hidden])')) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            self.close();
            self.button.focus();
        }, true);
    }

    /**
     * @return {boolean} Whether the panel is on screen.
     */
    isOpen() {
        return !!this.panel && !this.panel.hidden;
    }

    /**
     * Opens the panel, closing any other.
     */
    open() {
        Popover.closeAll();
        this.panel.hidden = false;
        this.button.setAttribute('aria-expanded', 'true');
        this.button.classList.add('selected');
        if (this.onOpen) {
            this.onOpen();
        }
    }

    /**
     * Closes the panel.
     */
    close() {
        if (!this.panel) {
            return;
        }
        this.panel.hidden = true;
        this.button.setAttribute('aria-expanded', 'false');
        this.button.classList.remove('selected');
    }

    /**
     * Closes whichever popover is open. Done after a control in one has
     * done its job, so the reader sees what it did.
     */
    static closeAll() {
        Popover.all.forEach(function(popover) {
            popover.close();
        });
    }

    /**
     * @return {boolean} Whether any popover is open.
     */
    static anyOpen() {
        return Popover.all.some(function(popover) {
            return popover.isOpen();
        });
    }
}

/**
 * Every popover on the page.
 * @type {Array<Popover>}
 */
Popover.all = [];

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Popover;
}
