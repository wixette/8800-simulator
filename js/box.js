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
 * @fileoverview The machine's box, as it is taken apart and put back:
 * which units are out, which are on their way, and which cards the
 * memory size fits (docs/3d-model.md, Part 2; docs/3d-view.md, V4).
 *
 * The page keeps one Box, whether or not the 3D view has ever been
 * opened, because the box decides whether the machine can be switched
 * on: nothing comes out while it is on, and it will not go on while
 * anything is out. The 3D view only draws it. Nothing here draws, or
 * needs three.js or a document, so all of it runs in the tests.
 *
 * Each unit is named as its node in the model (model/altair-8800.glb),
 * a card as card.<id>, and is somewhere between in (0) and out (1)
 * along its way out. update(dt) moves what is moving.
 */

/** The cards the box can hold. Their nodes are slot.<id> and card.<id>. */
export const CARD_IDS = ['cpu', 'mem1k', 'mem4k_0', 'mem4k_1', 'sio', 'sio2'];

/**
 * The units that are not cards, in the order taking the box apart
 * follows: the lid, the data plug, then (after the cards) the power
 * supply, the chassis and the dress panel.
 */
export const PARTS = ['case.top', 'harness.data_plug', 'psu.t2', 'psu.t1',
                      'psu.t3', 'psu.fan', 'psu.board', 'psu.terminal_block',
                      'chassis.frame', 'panel.dress'];

/**
 * What must be out before each unit can come out, as
 * model/params/machine.json has it (tests/box.test.js holds the two to
 * each other), with the cards' own: every card needs the lid off, and
 * the CPU card its data cable unplugged.
 * @type {!Object<string, !Array<string>>}
 */
export const PREREQS = {
    'case.top': [],
    'harness.data_plug': ['case.top'],
    'psu.t2': ['case.top'],
    'psu.t1': ['case.top', 'psu.t2'],
    'psu.t3': ['case.top'],
    'psu.fan': ['case.top'],
    'psu.board': ['case.top', 'psu.t3', 'psu.fan'],
    'psu.terminal_block': ['case.top'],
    'chassis.frame': ['case.top'],
    'panel.dress': ['chassis.frame'],
};
for (const card of CARD_IDS) {
    PREREQS['card.' + card] = card == 'cpu' ?
        ['case.top', 'harness.data_plug'] : ['case.top'];
}

/**
 * The units a click takes out only once what they need is already out,
 * rather than clearing the way: the dress panel lies among the switches,
 * and a click that missed one must not take the machine to pieces.
 * @type {!Array<string>}
 */
export const WAITS = ['panel.dress'];

/**
 * What must be in before a unit can go back, besides what depends on
 * it: the data cable's plug goes onto the CPU card's wafer.
 * @type {!Object<string, !Array<string>>}
 */
export const NEEDS_IN = {
    'harness.data_plug': ['card.cpu'],
};

/** How long a unit takes to come out, or go back, in seconds. */
export const MOVE_S = 0.8;

/**
 * How long each unit takes when the whole box goes back together on
 * leaving Taken apart: the same order, so nothing passes through
 * anything, but quick - the reader has seen it come apart, and is
 * waiting for the next view.
 */
export const QUICK_MOVE_S = 0.12;

/** A slot: [expander board, slot on it]; board 0 at the right, slot 0 outermost. */
/** @typedef {!Array<number>} Slot */

/**
 * The cards a memory size fits, and their slots: CPU, memory, memory,
 * SIO, 2SIO, from board 0's slot 0 (docs/3d-model.md, Part 2).
 * @param {number} memSize The memory size, in bytes.
 * @return {!Object<string, !Slot>} Each fitted card's slot.
 */
export function fittedFor(memSize) {
    const order = memSize <= 256 ? ['cpu', 'mem1k', 'sio', 'sio2'] :
          memSize <= 4096 ? ['cpu', 'mem4k_0', 'sio', 'sio2'] :
          ['cpu', 'mem4k_0', 'mem4k_1', 'sio', 'sio2'];
    /** @type {!Object<string, !Slot>} */
    const slots = {};
    order.forEach((card, i) => {
        slots[card] = [Math.floor(i / 4), i % 4];
    });
    return slots;
}

/**
 * Why something cannot be done: a message id, and its values, for the
 * status line.
 * @typedef {{id: string, params: !Object<string, string>}} Refusal
 */

/**
 * @param {string} id The message.
 * @param {string=} part The unit it names, if any.
 * @return {!Refusal}
 */
function refusal(id, part) {
    return {id: id, params: part ? {part: part} : {}};
}

/**
 * One move of a card while the memory changes: to a place along its
 * way out, or to another slot (or out of the box, null) while it is out.
 * @typedef {{to: number} | {slot: ?Slot}} CardMove
 */

export class Box {
    /**
     * @param {number=} memSize The memory size the cards are fitted for.
     */
    constructor(memSize = 256) {
        /**
         * How far each unit is along its way out: 0 in, 1 out.
         * @private @type {!Object<string, number>}
         */
        this.at = {};
        /**
         * Where each moving unit is going: 0 or 1.
         * @private @type {!Map<string, number>}
         */
        this.going = new Map();
        /**
         * Each card's slot, or null while it is not in the box.
         * @private @type {!Object<string, ?Slot>}
         */
        this.slots = {};
        /**
         * Moves still to make for the cards a new memory size moves.
         * @private @type {!Map<string, !Array<CardMove>>}
         */
        this.refits = new Map();
        /**
         * What a click, "take it all apart" or "put it all back" still has
         * to do, one unit after another: [unit, 0 or 1].
         * @private @type {!Array<!Array<*>>}
         */
        this.plan = [];
        /** How long each unit in the plan takes to move, in seconds. */
        this.moveS = MOVE_S;
        /** Whether what is going is the plan's, at its pace. @private */
        this.planning = false;
        /** Whether Take it all apart was the last word on the box. @private */
        this.takenApart = false;
        /** The memory size the cards are fitted for. */
        this.memSize = memSize;
        /**
         * Called after anything starts or stops moving, or jumps.
         * @type {?function(): void}
         */
        this.onChange = null;
        for (const unit of PARTS) {
            this.at[unit] = 0;
        }
        const fitted = fittedFor(memSize);
        for (const card of CARD_IDS) {
            this.at['card.' + card] = 0;
            this.slots[card] = fitted[card] || null;
        }
    }

    /**
     * The units in the box now, in the order taking it apart follows:
     * the lid, the data plug, the cards, then the rest.
     * @return {!Array<string>} Node names.
     */
    units() {
        const cards = CARD_IDS.filter((card) => this.slots[card])
              .map((card) => 'card.' + card);
        return PARTS.slice(0, 2).concat(cards, PARTS.slice(2));
    }

    /** @return {!Array<string>} The cards in the box. */
    cards() {
        return CARD_IDS.filter((card) => this.slots[card]);
    }

    /**
     * @param {string} card A card.
     * @return {?Slot} Its slot, or null if it is not in the box.
     */
    slotOf(card) {
        return this.slots[card];
    }

    /**
     * @param {string} unit A unit.
     * @return {number} How far along its way out it is: 0 in, 1 out.
     */
    position(unit) {
        return this.at[unit];
    }

    /**
     * Where a unit will be once the moves now under way, and the plan,
     * are done: what a view frames.
     * @param {string} unit The unit.
     * @return {number} 0 in, 1 out.
     */
    destination(unit) {
        const going = this.going.get(unit);
        let at = going === undefined ? this.at[unit] : going;
        for (const [planned, to] of this.plan) {
            if (planned == unit) {
                at = to;
            }
        }
        const moves = this.refits.get(unit);
        if (moves) {
            for (const move of moves) {
                if ('to' in move) {
                    at = move.to;
                }
            }
        }
        return at;
    }

    /** @param {string} unit @return {boolean} Whether it is in, and still. */
    isIn(unit) {
        return this.at[unit] == 0 && !this.going.has(unit) && !this.refits.has(unit);
    }

    /** @param {string} unit @return {boolean} Whether it is out, and still. */
    isOut(unit) {
        return this.at[unit] == 1 && !this.going.has(unit) && !this.refits.has(unit);
    }

    /** @return {boolean} Whether anything is moving, or about to. */
    isBusy() {
        return this.going.size > 0 || this.refits.size > 0 || this.plan.length > 0;
    }

    /** @return {boolean} Whether every unit is in and nothing moves. */
    isWhole() {
        return !this.isBusy() && this.units().every((unit) => this.at[unit] == 0);
    }

    /** @return {boolean} Whether every unit will be in once what moves stops. */
    endsWhole() {
        return this.units().every((unit) => this.destination(unit) == 0);
    }

    /** @return {boolean} Whether every unit is out and nothing moves. */
    isAllOut() {
        return !this.isBusy() && this.units().every((unit) => this.at[unit] == 1);
    }

    /**
     * Whether the box is taken apart as a whole, by takeAllApart(), and
     * has not since been put back together, however that came about: the
     * one place the Taken apart view asks.
     * @return {boolean}
     */
    isTakenApart() {
        return this.takenApart && !this.endsWhole();
    }

    /**
     * Why the machine cannot be switched on now: anything not in place.
     * @return {?Refusal} Why, or null if it can be.
     */
    interlock() {
        if (this.isWhole()) {
            return null;
        }
        // On its way back together: there is nothing to do but wait.
        if (this.endsWhole()) {
            return refusal('box-busy');
        }
        const out = this.units().find((unit) => this.at[unit] != 0 ||
                                      this.going.has(unit) || this.refits.has(unit));
        return refusal('box-power-apart', out);
    }

    /**
     * Why a click cannot take a unit out now. What is in its way is no
     * reason: that comes out first (routeOut).
     * @param {string} unit The unit.
     * @param {boolean} poweredOn Whether the machine is on.
     * @return {?Refusal} Why, or null if it can.
     */
    whyNotOut(unit, poweredOn) {
        if (poweredOn) {
            return refusal('box-switch-off');
        }
        if (this.isBusy()) {
            return refusal('box-busy');
        }
        const blocking = PREREQS[unit].filter((other) => !this.isOut(other));
        return WAITS.includes(unit) && blocking.length ? refusal('box-out-first', blocking[0]) : null;
    }

    /**
     * Why a click cannot put a unit back now. What is in its way is no
     * reason: that goes back first (routeIn).
     * @param {string} unit The unit.
     * @return {?Refusal} Why, or null if it can.
     */
    whyNotIn(unit) {
        return this.isBusy() ? refusal('box-busy') : null;
    }

    /**
     * What has to come out for a unit to, in order.
     * @param {string} unit The unit.
     * @return {!Array<string>} The units not yet out, ending with it.
     */
    routeOut(unit) {
        const route = [];
        const visit = (next) => {
            if (!this.isOut(next) && !route.includes(next)) {
                PREREQS[next].forEach(visit);
                route.push(next);
            }
        };
        visit(unit);
        return route;
    }

    /**
     * What has to go back for a unit to, in order: what depends on it,
     * and what it needs in.
     * @param {string} unit The unit.
     * @return {!Array<string>} The units not yet in, ending with it.
     */
    routeIn(unit) {
        const route = [];
        const visit = (next) => {
            if (!this.isIn(next) && !route.includes(next)) {
                this.units().reverse().filter((other) => PREREQS[other].includes(next))
                    .concat(NEEDS_IN[next] || []).forEach(visit);
                route.push(next);
            }
        };
        visit(unit);
        return route;
    }

    /**
     * Takes a unit out, after whatever is in its way.
     * @param {string} unit The unit.
     * @param {boolean} poweredOn Whether the machine is on.
     * @return {?Refusal} Why not, or null if it has started.
     */
    takeOut(unit, poweredOn) {
        if (this.isOut(unit)) {
            return null;
        }
        const why = this.whyNotOut(unit, poweredOn);
        if (why) {
            return why;
        }
        this.moveS = MOVE_S;
        this.plan = this.routeOut(unit).map((next) => [next, 1]);
        this.step();
        return null;
    }

    /**
     * Puts a unit back, after whatever has to go first: by itself at
     * MOVE_S, several at QUICK_MOVE_S, as when the whole box goes back.
     * @param {string} unit The unit.
     * @return {?Refusal} Why not, or null if it has started.
     */
    putBack(unit) {
        if (this.isIn(unit)) {
            return null;
        }
        const why = this.whyNotIn(unit);
        if (why) {
            return why;
        }
        const route = this.routeIn(unit);
        this.moveS = route.length > 1 ? QUICK_MOVE_S : MOVE_S;
        this.plan = route.map((next) => [next, 0]);
        // The last of Taken apart: what comes out after this is by hand.
        this.takenApart = this.takenApart && !this.endsWhole();
        this.step();
        return null;
    }

    /**
     * Takes every unit out, one after another, in an order the rules
     * allow.
     * @param {boolean} poweredOn Whether the machine is on.
     * @return {?Refusal} Why not, or null if it has started.
     */
    takeAllApart(poweredOn) {
        if (poweredOn) {
            return refusal('box-switch-off');
        }
        if (this.isBusy()) {
            return refusal('box-busy');
        }
        this.moveS = MOVE_S;
        this.takenApart = true;
        this.plan = this.units().filter((unit) => !this.isOut(unit))
            .map((unit) => [unit, 1]);
        this.step();
        return null;
    }

    /**
     * Puts every unit back, one after another, in the reverse order.
     * @param {boolean=} quick Whether each takes QUICK_MOVE_S, not MOVE_S.
     * @return {?Refusal} Why not, or null if it has started.
     */
    putAllBack(quick = false) {
        if (this.isBusy()) {
            return refusal('box-busy');
        }
        this.moveS = quick ? QUICK_MOVE_S : MOVE_S;
        this.takenApart = false;
        this.plan = this.units().reverse().filter((unit) => !this.isIn(unit))
            .map((unit) => [unit, 0]);
        this.step();
        return null;
    }

    /**
     * Stops a plan where it has got to: what is moving finishes, and the
     * rest stays as it is. To go the other way from part of the way
     * through, rather than to the end first.
     */
    stopPlan() {
        this.plan = [];
        this.snap();
    }

    /**
     * Puts the box together at once, every unit in place and nothing
     * moving: what switching the machine on for a program does, and
     * leaving the 3D view (docs/3d-view.md, V4).
     * @return {boolean} Whether anything was out of place.
     */
    snapTogether() {
        const apart = !this.isWhole();
        this.plan = [];
        this.planning = false;
        this.takenApart = false;
        this.moveS = MOVE_S;
        this.going.clear();
        this.refits.clear();
        const fitted = fittedFor(this.memSize);
        for (const unit of PARTS) {
            this.at[unit] = 0;
        }
        for (const card of CARD_IDS) {
            this.at['card.' + card] = 0;
            this.slots[card] = fitted[card] || null;
        }
        if (apart) {
            this.changed();
        }
        return apart;
    }

    /**
     * Fits the cards a new memory size means. The machine is off (the
     * simulator switches it off to change memory). With the lid on the
     * cards change at once, out of sight; with it off they are seen to:
     * those no longer wanted come up and leave, those that change slot
     * come up, move across and go down, and new ones come down into
     * their slots. A card that was out stays out, in its new slot.
     * Anything moving finishes first, so that no unit is left part of
     * the way out, and a plan is carried through.
     * @param {number} memSize The new memory size, in bytes.
     */
    setMemSize(memSize) {
        this.snap();
        this.memSize = memSize;
        const want = fittedFor(memSize);
        const seen = !this.isIn('case.top');
        for (const card of CARD_IDS) {
            const unit = 'card.' + card;
            const now = this.slots[card];
            const next = want[card] || null;
            if (!seen) {
                this.slots[card] = next;
                this.at[unit] = 0;
                continue;
            }
            const out = this.at[unit] == 1;
            if (!now && next) {
                this.slots[card] = next;
                this.at[unit] = 1;
                this.refits.set(unit, [{to: 0}]);
            } else if (now && !next) {
                this.refits.set(unit, [{to: 1}, {slot: null}]);
            } else if (now && next && (now[0] != next[0] || now[1] != next[1])) {
                this.refits.set(unit, out ? [{slot: next}] :
                                [{to: 1}, {slot: next}, {to: 0}]);
            }
        }
        this.changed();
    }

    /**
     * Moves everything that is moving on by some time.
     * @param {number} dt Seconds.
     * @return {boolean} Whether anything moved.
     */
    update(dt) {
        const step = dt / MOVE_S;
        // The units of a plan move at its pace; the cards a refit moves
        // at MOVE_S.
        const planned = dt / this.moveS;
        let moved = false;
        let ended = false;
        for (const [unit, to] of [...this.going]) {
            this.at[unit] = this.towards(this.at[unit], to, this.planning ? planned : step);
            moved = true;
            if (this.at[unit] == to) {
                this.going.delete(unit);
                ended = true;
            }
        }
        for (const [unit, moves] of [...this.refits]) {
            let budget = step;
            while (moves.length && budget > 0) {
                const move = moves[0];
                if ('slot' in move) {
                    this.slots[unit.slice(5)] = move.slot;
                    moves.shift();
                    moved = true;
                    continue;
                }
                const left = Math.abs(move.to - this.at[unit]);
                this.at[unit] = this.towards(this.at[unit], move.to, budget);
                budget -= Math.min(left, budget);
                moved = true;
                if (this.at[unit] == move.to) {
                    moves.shift();
                }
            }
            if (!moves.length) {
                this.refits.delete(unit);
                // A card that left the box is in its place for next time.
                if (!this.slots[unit.slice(5)]) {
                    this.at[unit] = 0;
                }
                ended = true;
            }
        }
        if (ended && !this.going.size) {
            this.step();
            if (!this.going.size) {
                this.planning = false;
                this.moveS = MOVE_S;
            }
        }
        if (ended) {
            this.changed();
        }
        return moved;
    }

    /** Finishes every move at once. */
    snap() {
        for (let i = 0; this.isBusy() && i < 1000; i++) {
            this.update(MOVE_S);
        }
    }

    /**
     * Starts the next unit of a plan, skipping any already there.
     * @private
     */
    step() {
        this.planning = this.plan.length > 0;
        while (this.plan.length) {
            const [unit, to] = /** @type {!Array<*>} */ (this.plan.shift());
            if (this.at[unit] != to) {
                this.going.set(unit, to);
                this.changed();
                return;
            }
        }
    }

    /**
     * @private
     * @param {number} from Where it is.
     * @param {number} to Where it is going.
     * @param {number} step How far it may move.
     * @return {number} Where it gets to.
     */
    towards(from, to, step) {
        return Math.abs(to - from) <= step ? to : from + Math.sign(to - from) * step;
    }

    /** @private */
    changed() {
        if (this.onChange) {
            this.onChange();
        }
    }
}
