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

    'switchboard-helper': {
        'en': 'Switch Board Helper',
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

    'debug-load-data-title': {
        'en': 'Load Data to Addr #0',
        'zh': '从地址0开始加载数据',
    },

    'debug-load-data': {
        'en': 'Load Data',
        'zh': '加载数据',
    },

    'debug-data-sample': {
        'en': 'Bytes in HEX string, such as \'c3 00 00\'',
        'zh': '十六进制字节序列，如 c3 00 00',
    },

    'debug-cpu-dump-title': {
        'en': '8080 CPU Status Dump',
        'zh': '8080 CPU 的状态信息',
    },

    'debug-mem-dump-title': {
        'en': 'Memory Dump',
        'zh': '内存信息',
    },

    'tutorial-title': {
        'en': 'Quick Tutorial',
        'zh': '快速教程',
    },

    'tutorial-desc': {
        'en': 'How to input and run the following program to calculate 1 + 2 = 3:',
        'zh': '如何输入并运行以下加法程序，并计算 1 + 2 = 3：',
    },

    'tutorial-1': {
        'en': 'Turn on Altair 8800 by clicking OFF/ON switch.',
        'zh': '点击 OFF/ON 开关，打开 Altair 8800',
    },

    'tutorial-2': {
        'en': 'Set switches A7-A0 to 00 111 010 (up for 1, down for 0).',
        'zh': '将地址开关 A7-A0 依次设置为 00 111 010 （开关朝上为 1，开关朝下为 0）',
    },

    'tutorial-3': {
        'en': 'Click "DEPOSIT".',
        'zh': '点击 DEPOSIT',
    },

    'tutorial-4': {
        'en': 'Set switches A7-A0 to 10 000 000.',
        'zh': '将地址开关 A7-A0 依次设置为 10 000 000',
    },

    'tutorial-5': {
        'en': 'Click "DEPOSIT NEXT".',
        'zh': '点击 DEPOSIT NEXT',
    },

    'tutorial-6': {
        'en': 'Repeat step 4-5 to input the following bytes one by one: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
        'zh': '重复步骤 4 到步骤 5，逐个输入以下字节：00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000',
    },

    'tutorial-7': {
        'en': 'Set switches A7-A0 to 10 000 000.',
        'zh': '将地址开关 A7-A0 依次设置为 10 000 000',
    },

    'tutorial-8': {
        'en': 'Click "EXAMINE".',
        'zh': '点击 EXAMINE',
    },

    'tutorial-9': {
        'en': 'Set switches A7-A0 to 00 000 001 (the first number to be added, or 1 in decimal).',
        'zh': '将地址开关 A7-A0 依次设置为 00 000 001（即第一个加数的值，也就是十进制的 1）',
    },

    'tutorial-10': {
        'en': 'Click "DEPOSIT".',
        'zh': '点击 DEPOSIT',
    },

    'tutorial-11': {
        'en': 'Set switches A7-A0 to 00 000 010 (the second number to be added, or 2 in decimal).',
        'zh': '将地址开关 A7-A0 依次设置为 00 000 010（即第二个加数的值，也就是十进制的 2）',
    },

    'tutorial-12': {
        'en': 'Click "DEPOSIT NEXT".',
        'zh': '点击 DEPOSIT NEXT',
    },

    'tutorial-13': {
        'en': 'Click "RESET".',
        'zh': '点击 RESET',
    },

    'tutorial-14': {
        'en': 'Click "RUN" and wait for a few seconds.',
        'zh': '点击 RUN 并等待几秒钟',
    },

    'tutorial-15': {
        'en': 'Click "STOP".',
        'zh': '点击 STOP',
    },

    'tutorial-16': {
        'en': 'Set switches A7-A0 to 10 000 010 (the address that holds the sum).',
        'zh': '将地址开关 A7-A0 依次设置为 10 000 010（即存储计算结果的地址）',
    },

    'tutorial-17': {
        'en': 'Click "EXAMINE".',
        'zh': '点击 EXAMINE',
    },

    'tutorial-18': {
        'en': 'The LEDs D7-D0 show the result 00 000 011 (3 in decimal).',
        'zh': 'LED 灯 D7-D0 显示出计算结果 00 000 011（即十进制的 3）',
    },

    'tutorial-19': {
        'en': 'Turn off Altair 8800.',
        'zh': '关闭 Altair 8800',
    },

    'reference-title': {
        'en': 'References',
        'zh': '参考资料',
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
