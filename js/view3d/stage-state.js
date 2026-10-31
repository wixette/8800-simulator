// @ts-check
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
 * @fileoverview What the 3D view does with the box: the transitions of
 * the state machine in docs/3d-view.md (V4b), with no three.js in them,
 * so that tests/state-machine.test.js can walk every state and event in
 * Node. js/view3d/view3d.js is the host, which draws what this decides.
 */

import {HOME_VIEW, VIEWS} from './views.js';

/**
 * What the state needs of the page and the drawing.
 * @typedef {object} Host
 * @property {function(): boolean} isPoweredOn Whether the machine is on.
 * @property {function(string, !Object=, string=): void} say The status line.
 * @property {function(!Object): void} sayBox The status line, for a refusal.
 * @property {function(string): void} place Puts the camera on a view.
 * @property {function(): void} refit Fits the camera to the parts where
 *     they are now, if it is still where a view put it.
 * @property {function(): void} refreshBox Shows or hides Put it all back.
 * @property {function(string): string} partName A part's name, in words.
 * @property {function(): string} shown The Show on view.
 * @property {function(string): void} drawShow Draws the machine as a
 *     Show says.
 */

export class StageState {
    /**
     * @param {!Object} box The page's box (js/box.js).
     * @param {!Host} host The page and the drawing.
     */
    constructor(box, host) {
        this.box = box;
        this.host = host;
        /** The view the Views menu names. */
        this.view = HOME_VIEW;
        /**
         * What to say once the box stops: 'apart' or 'whole', or null.
         * @private @type {?string}
         */
        this.saying = null;
        /**
         * The Show Inside chose, while it is on view, to take away again
         * on leaving; a Show chosen by anyone else stays.
         * @type {?string}
         */
        this.viewShow = null;
    }

    /**
     * A view from the Views menu. Only Taken apart moves parts, and
     * leaving it puts them back; any other view leaves the parts where
     * the reader put them.
     * @param {string} id The view.
     */
    setView(id) {
        const box = this.box;
        if (id == 'apart') {
            const why = box.takeAllApart(this.host.isPoweredOn());
            if (why) {
                this.host.sayBox(why);
                return;
            }
            this.saying = 'apart';
        } else if (box.isTakenApart()) {
            this.reassemble();
        }
        if (id != this.view) {
            this.bringShow(id);
        }
        this.view = id;
        this.host.place(id);
        // Taken apart again, with everything already out: nothing moves,
        // so nothing will say so.
        if (!box.isBusy()) {
            this.boxChanged();
        }
    }

    /**
     * A Show chosen by the reader or a Tutorial chip: theirs from now on.
     * @param {string} id The Show.
     */
    chooseShow(id) {
        this.viewShow = null;
        this.host.drawShow(id);
    }

    /**
     * @private Takes away the Show the last view chose, and brings the
     * one the next view wants, if the reader has not chosen another.
     * @param {string} id The view being gone to.
     */
    bringShow(id) {
        if (this.viewShow) {
            this.viewShow = null;
            this.host.drawShow('all');
        }
        const show = VIEWS.find((view) => view.id == id)?.show;
        if (show && this.host.shown() == 'all') {
            this.viewShow = show;
            this.host.drawShow(show);
        }
    }

    /** Reset view: the front, the whole machine, every part in place. */
    home() {
        this.chooseShow('all');
        this.reassemble();
        this.setView(HOME_VIEW);
    }

    /** Put it all back: the view stays, unless it was Taken apart. */
    putAllBack() {
        if (this.view == 'apart') {
            this.setView(HOME_VIEW);
        } else {
            this.reassemble();
        }
    }

    /** @private Starts every part back, from wherever each has got to. */
    reassemble() {
        const box = this.box;
        if (box.endsWhole()) {
            return;
        }
        box.stopPlan();
        box.putAllBack(true);
        this.saying = 'whole';
        this.host.say('view-reassembling');
    }

    /** @return {boolean} Whether Put it all back has anything to do. */
    canPutBack() {
        return !this.box.endsWhole();
    }

    /**
     * A click on a unit: takes it out, or puts it back, and whatever is
     * in its way with it.
     * @param {string} unit The unit.
     */
    click(unit) {
        const box = this.box;
        const out = box.position(unit) > 0;
        const why = out ? box.putBack(unit) : box.takeOut(unit, this.host.isPoweredOn());
        if (!why) {
            this.host.say(out ? 'box-put-back' : 'box-taken-out',
                          {part: this.host.partName(unit)});
        } else {
            this.host.sayBox(why);
        }
    }

    /**
     * The box changed, by anything at all: a click, a plan, a load, the
     * Memory menu, or going to 2D. Once it is still, the Views menu, the
     * camera and the status line catch up with it.
     */
    boxChanged() {
        const box = this.box;
        this.host.refreshBox();
        if (box.isBusy()) {
            return;
        }
        const said = this.saying;
        this.saying = null;
        if (this.view == 'apart' && !box.isTakenApart()) {
            this.view = HOME_VIEW;
            this.host.place(HOME_VIEW);
        } else {
            this.host.refit();
        }
        if (said == 'apart' && box.isAllOut()) {
            this.host.say('view-apart-done');
        } else if (said == 'whole' && box.isWhole()) {
            this.host.say('view-reassembled');
        }
    }
}
