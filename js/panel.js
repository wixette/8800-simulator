/**
 *   Copyright 2020 wixette@gmail.com
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
 * @fileoverview The main logic to control the front panel UI.
 */

/**
 * Simple namespace.
 * @type {Object}
 */
panel = {};

/**
 * Initializes thie UI.
 */
panel.init = function() {
    var localeButtonElem = document.getElementById('locale');
    localeButtonElem.addEventListener('click', l10n.nextLocale, false);

    var led = panel.createLed(100, 200, 'intl');

    /*
      var switchMidElem = document.getElementById('switch-mid');
      var switchUpElem = document.getElementById('switch-up');
      var switchDownElem = document.getElementById('switch-down');
    */
};

/**
 * Creates a new LED inside the panel svg.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {string} idPrefix The prefix of the element ID.
 * @return {Object} The created object. { onElem: elem1, offElem: elem2 }
 */
panel.createLed = function(x, y, idPrefix) {
    var panelElem = document.getElementById('panel');
    var ledOnElem = document.getElementById('led-on');
    var ledOffElem = document.getElementById('led-off');

    var onElem = ledOnElem.cloneNode(true);
    onElem.x.baseVal.value = '' + x;
    onElem.y.baseVal.value = '' + y;
    onElem.id = idPrefix + '-on';
    onElem.style.display = 'none';

    var offElem = ledOffElem.cloneNode(true);
    offElem.id = idPrefix + '-off';
    offElem.x.baseVal.value = '' + x;
    offElem.y.baseVal.value = '' + y;
    offElem.style.display = 'inline';

    panelElem.appendChild(onElem);
    panelElem.appendChild(offElem);

    var ret = {};
    ret.onElem = onElem;
    ret.offElem = offElem;
    return ret;
};
