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
 * @fileoverview Localization utilities and message translations.
 */

/**
 * Simple namespace.
 * @type {Object}
 */
l10n = {};

/**
 * Pre-defined locales.
 * @type {Array<string>}
 */
l10n.LOCALES = [
    'en',
    'zh',
];

/**
 * Localized messages.
 */
l10n.MESSAGES = {
    'title': {
        'en': 'Sim-8800: Altair 8800 Simulator',
        'zh': 'Sim-8800: Altair 8800 模拟器',
    },

    'header-title': {
        'en': 'Sim-8800: Altair 8800 Simulator',
        'zh': 'Sim-8800: Altair 8800 模拟器',
    },

    'nav-sim': {
        'en': 'Sim',
        'zh': '模拟器',
    },

    'nav-debug': {
        'en': 'Debug',
        'zh': '调试',
    },

    'nav-ref': {
        'en': 'Ref',
        'zh': '参考',
    },

    'switchboard': {
        'en': 'Soft Switch Board',
        'zh': '辅助开关面板',
    },

    'back-home': {
        'en': 'Home',
        'zh': '首页',
    },

    'source-code': {
        'en': 'Source code',
        'zh': '源代码',
    },
};

/**
 * Current locale index.
 * @type {number}
 */
l10n.current = 0;

/**
 * Local storage key.
 */
l10n.localStorageKey = 'sim8800locale';

/**
 * Switches to the next locale.
 */
l10n.nextLocale = function() {
    l10n.current++;
    l10n.current = l10n.current % l10n.LOCALES.length;
    l10n.updateMessages();
    localStorage.setItem(l10n.localStorageKey, l10n.current);
};

/**
 * Restores the last locale from local storage.
 */
l10n.restoreLocale = function() {
    var val = localStorage.getItem(l10n.localStorageKey);
    if (!val) {
        val = '0';
    }
    var index = parseInt(val);
    if (!isNaN(index)) {
        l10n.current = index % l10n.LOCALES.length;
        l10n.updateMessages();
    }
};

/**
 * Updates UI messages to the current locale.
 */
l10n.updateMessages = function() {
    elems = document.getElementsByClassName('l10n');
    for (let i = 0; i < elems.length; i++) {
        if (l10n.MESSAGES.hasOwnProperty(elems[i].id)) {
            var locale = l10n.LOCALES[l10n.current];
            var msg = '';
            if (l10n.MESSAGES[elems[i].id].hasOwnProperty(locale)) {
                msg = l10n.MESSAGES[elems[i].id][locale];
            } else {
                msg = l10n.MESSAGES[elems[i].id]['en'];
            }
            elems[i].innerHTML = msg;
        }
    }
};
