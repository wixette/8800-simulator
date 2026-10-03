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
 * @fileoverview A modal dialog, on the browser's own <dialog>.
 */


/**
 * A dialog for anything that needs more than a choice from a menu: text
 * to type, a link to see and copy, things to read (docs/ui-design.md).
 *
 * The browser's <dialog> already does the hard parts - it sits above the
 * page, keeps the keyboard inside, and closes on Escape - so this adds
 * only the habits the page wants on top: a press on the dimmed backdrop
 * closes it, so does any element inside marked data-close, and an
 * onOpen hook fills it in just before it shows.
 *
 * Expects a <dialog> whose padding is on an inner element, so that a
 * click whose target is the <dialog> itself can only be on the backdrop.
 */
class Dialog {
    /**
     * @param {string} id The <dialog>'s id.
     * @param {function()=} onOpen Called each time, just before it shows.
     * @param {function()=} onClose Called each time it has closed, by
     *     whatever means.
     */
    constructor(id, onOpen, onClose) {
        this.elem = document.getElementById(id);
        this.onOpen = onOpen || null;
        this.onClose = onClose || null;
        if (!this.elem) {
            return;
        }
        var self = this;
        // The backdrop closes the dialog only when the button went down
        // and came up on it. A click lands on whatever holds both ends,
        // so a selection dragged out of the text box and let go over the
        // backdrop arrives as a click on the <dialog> itself, and must
        // not close it; nor must a press on the backdrop let go inside.
        this.pressedOnBackdrop = false;
        this.releasedOnBackdrop = false;
        this.elem.addEventListener('pointerdown', function(event) {
            self.pressedOnBackdrop = event.target === self.elem;
        }, false);
        this.elem.addEventListener('pointerup', function(event) {
            self.releasedOnBackdrop = event.target === self.elem;
        }, false);
        this.elem.addEventListener('click', function(event) {
            var onBackdrop = event.target === self.elem &&
                self.pressedOnBackdrop && self.releasedOnBackdrop;
            self.pressedOnBackdrop = false;
            self.releasedOnBackdrop = false;
            if (onBackdrop ||
                (event.target.closest && event.target.closest('[data-close]'))) {
                self.closedByPointer = true;
                self.close();
            }
        }, false);
        // The browser hands the focus back to whatever opened the dialog.
        // That suits the keyboard, which closes it with Escape. Closed
        // with the mouse, the focus is let go of instead, so that the
        // next key goes where the reader is looking - the teletype, say.
        this.closedByPointer = false;
        this.elem.addEventListener('close', function() {
            if (self.closedByPointer) {
                self.closedByPointer = false;
                var focused = document.activeElement;
                if (focused && focused !== document.body && focused.blur) {
                    focused.blur();
                }
            }
            if (self.onClose) {
                self.onClose();
            }
        }, false);
    }

    /**
     * Fills the dialog in and shows it.
     */
    open() {
        if (!this.elem || this.elem.open) {
            return;
        }
        if (this.onOpen) {
            this.onOpen();
        }
        this.elem.showModal();
    }

    /**
     * Closes it.
     */
    close() {
        if (this.elem && this.elem.open) {
            this.elem.close();
        }
    }

    /**
     * @return {boolean} Whether it is on screen.
     */
    isOpen() {
        return !!this.elem && this.elem.open;
    }

    /**
     * @return {boolean} Whether any dialog on the page is open. While
     *     one is, the keyboard belongs to it, not to the teletype.
     */
    static anyOpen() {
        return !!document.querySelector('dialog[open]');
    }
}

// Exports the class for unit tests when running in Node.js. This has
// no effect when the script is loaded in a browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dialog;
}
