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
 * @fileoverview The stage's two views, the front panel in 2D and the
 * whole machine in 3D, one at a time, chosen from the [2D | 3D] toggle
 * on the stage's top edge (docs/3d-view.md, V1). The 3D view itself is
 * js/view3d/, loaded the first time it is chosen (M5). Part of the
 * panel namespace, which js/panel.js declares (see there).
 */

import {l10n} from './l10n.js';
import {Link} from './link.js';
import {panel} from './panel.js';

/** The views, in the toggle's order. */
panel.VIEWS = ['2d', '3d'];

/** Where the chosen view is remembered between visits. */
panel.viewStorageKey = 'sim8800view';

/** Where it is remembered that the 3D view has been seen (V8). */
panel.seen3dStorageKey = 'sim8800seen3d';

/** The view on show: '2d' or '3d'. */
panel.view = '2d';

/**
 * The 3D view once it has loaded (js/view3d/view3d.js's Stage), or the
 * promise of it while it loads.
 * @type {?Object}
 */
panel.stage3d = null;

/** @type {?Promise} */
panel.stage3dLoading = null;

/**
 * @return {boolean} Whether this browser can draw the 3D view: three.js
 *     needs WebGL 2.
 */
panel.canDraw3d = function() {
    try {
        var canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
    } catch (e) {
        return false;
    }
};

/**
 * @return {string} The view to open on: a link's, or the reader's last,
 *     or the 2D view.
 */
panel.initialView = function() {
    var linked = Link.queryToView(window.location.hash) ||
        Link.queryToView(window.location.search);
    if (linked) {
        return linked;
    }
    var saved = null;
    try {
        saved = localStorage.getItem(panel.viewStorageKey);
    } catch (e) {
        saved = null;
    }
    return panel.VIEWS.indexOf(saved) >= 0 ? saved : '2d';
};

/**
 * Builds the toggle and opens the first view.
 */
panel.initView = function() {
    panel.has3d = panel.canDraw3d();
    panel.VIEWS.forEach(function(view) {
        var tab = document.getElementById('view-' + view);
        panel.makePressable(tab, function(byKey) {
            panel.chooseView(view, byKey);
        });
        tab.addEventListener('keydown', function(event) {
            // The toggle is a pair of tabs: the arrows move between them.
            if (event.key == 'ArrowLeft' || event.key == 'ArrowRight') {
                event.preventDefault();
                var other = view == '2d' ? '3d' : '2d';
                panel.chooseView(other, true);
                document.getElementById('view-' + other).focus();
            }
        }, false);
    });
    // The 3D view's own tools answer while it loads, rather than look
    // broken (P6); once loaded, they are its own.
    document.getElementById('view3d-tools').addEventListener('click', function(event) {
        if (panel.reportIf3dLoading()) {
            event.stopPropagation();
            event.preventDefault();
        }
    }, true);
    var first = panel.initialView();
    panel.setView(first == '3d' && panel.has3d ? '3d' : '2d', false);
};

/**
 * When the reader presses a tab of the toggle.
 * @param {string} view '2d' or '3d'.
 * @param {boolean=} byKey Whether by the keyboard.
 */
panel.chooseView = function(view, byKey) {
    if (view == '3d' && !panel.has3d) {
        panel.setStatus('view3d-no-webgl', {}, 'warn');
        return;
    }
    if (view == panel.view) {
        return;
    }
    panel.setView(view, true);
};

/**
 * Shows a view.
 * @param {string} view '2d' or '3d'.
 * @param {boolean} save Whether the reader chose it, to be remembered.
 */
panel.setView = function(view, save) {
    var was = panel.view;
    panel.view = view;
    var app = document.getElementById('app');
    app.classList.toggle('view-3d', view == '3d');
    document.getElementById('panel').style.display = view == '3d' ? 'none' : '';
    document.getElementById('stage3d').hidden = view != '3d';
    document.getElementById('view3d-tools').hidden = view != '3d';
    panel.refreshViewSwitch();
    if (save) {
        try {
            localStorage.setItem(panel.viewStorageKey, view);
        } catch (e) {
            // Not remembered; it still applies to this visit.
        }
    }
    if (view == '3d') {
        try {
            localStorage.setItem(panel.seen3dStorageKey, '1');
        } catch (e) {
            // The dot comes back next time; no harm.
        }
        panel.refreshViewSwitch();
        panel.open3d();
    } else {
        if (panel.stage3d && panel.stage3d.hide) {
            panel.stage3d.hide();
        }
        // The 2D panel always stands for a whole machine (V4a).
        if (panel.box.snapTogether() && was == '3d') {
            panel.setStatus('view2d-reassembled');
        }
    }
    panel.applyDock();
};

/**
 * Shows the 3D view, loading it the first time.
 */
panel.open3d = function() {
    if (panel.stage3d) {
        panel.stage3d.show();
        return;
    }
    if (panel.stage3dLoading) {
        return;
    }
    var host = document.getElementById('stage3d');
    var bar = document.getElementById('stage3d-progress');
    var message = document.getElementById('stage3d-message');
    var tools = document.getElementById('view3d-tools');
    tools.classList.add('loading');
    bar.hidden = false;
    bar.style.setProperty('--progress', '0');
    message.hidden = false;
    message.textContent = l10n.getMessage('view3d-loading');
    panel.setStatus('view3d-loading');
    panel.stage3dLoading = import('./view3d/view3d.js').then(function(module) {
        var stage = new module.Stage(panel, host);
        return stage.load(host.dataset.src, function(share) {
            bar.style.setProperty('--progress', String(share));
        }).then(function() {
            panel.stage3d = stage;
            tools.classList.remove('loading');
            bar.hidden = true;
            message.hidden = true;
            if (panel.view == '3d') {
                stage.show();
                panel.setStatus('view3d-ready');
            }
        });
    }).catch(function(e) {
        console.error(e);
        bar.hidden = true;
        message.textContent = l10n.getMessage('view3d-failed');
        panel.setStatus('view3d-failed', {}, 'error');
        // Choosing 3D again tries again.
        panel.stage3dLoading = null;
        var canvas = host.querySelector('canvas');
        if (canvas) {
            canvas.remove();
        }
    });
};

/**
 * Draws the toggle as things stand, in the reader's language.
 */
panel.refreshViewSwitch = function() {
    var seen = false;
    try {
        seen = !!localStorage.getItem(panel.seen3dStorageKey);
    } catch (e) {
        seen = true;
    }
    panel.VIEWS.forEach(function(view) {
        var tab = document.getElementById('view-' + view);
        var on = view == panel.view;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.classList.toggle('selected', on);
        tab.tabIndex = on ? 0 : -1;
        var title = l10n.getMessage(view == '3d' && !seen ? 'view-3d-new' :
                                    'view-' + view + '-title');
        tab.title = title;
        tab.setAttribute('aria-label', title);
    });
    var three = document.getElementById('view-3d');
    three.classList.toggle('disabled', !panel.has3d);
    three.setAttribute('aria-disabled', panel.has3d ? 'false' : 'true');
    // A dot until the 3D view has been seen once.
    three.classList.toggle('has-news', !seen && panel.has3d);
    document.getElementById('view-switch').setAttribute(
        'aria-label', l10n.getMessage('view-switch-label'));
    var tooltips = {'view-reset': 'view-reset', 'view-zoom-in': 'view-zoom-in',
                    'view-zoom-out': 'view-zoom-out'};
    for (let id in tooltips) {
        let elem = document.getElementById(id);
        elem.title = l10n.getMessage(tooltips[id]);
        elem.setAttribute('aria-label', l10n.getMessage(tooltips[id]));
    }
    var views = document.getElementById('views-button');
    views.title = l10n.getMessage('views-menu');
    if (panel.stage3d) {
        panel.stage3d.refreshTools();
    }
};

/**
 * Something on the 3D view's top band that cannot be used yet answers
 * with why (P6).
 * @return {boolean} Whether it is still loading, and that was said.
 */
panel.reportIf3dLoading = function() {
    if (panel.stage3d) {
        return false;
    }
    panel.setStatus('view3d-wait', {}, 'warn');
    return true;
};
