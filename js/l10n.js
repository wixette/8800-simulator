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
    'es',
    'fr',
    'de',
    'it',
    'zh',
    'zh-TW',
    'ja',
    'ko',
];

/**
 * What each locale calls itself, for the language menu. A reader who
 * needs another language cannot be expected to recognise its name in
 * the one currently on screen.
 * @type {Object}
 */
l10n.LOCALE_NAMES = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'zh': '简体中文',
    'zh-TW': '繁體中文',
    'ja': '日本語',
    'ko': '한국어',
};

/**
 * Localized messages.
 */
l10n.MESSAGES = {
    'title': {
        'en': 'Sim-8800: Altair 8800 Simulator',
        'es': 'Sim-8800: simulador de Altair 8800',
        'fr': 'Sim-8800 : simulateur Altair 8800',
        'de': 'Sim-8800: Altair-8800-Simulator',
        'it': 'Sim-8800: simulatore Altair 8800',
        'zh': 'Sim-8800: Altair 8800 模拟器',
        'zh-TW': 'Sim-8800: Altair 8800 模擬器',
        'ja': 'Sim-8800: Altair 8800 シミュレーター',
        'ko': 'Sim-8800: Altair 8800 시뮬레이터',
    },

    'header-title': {
        'en': 'Altair 8800 Simulator',
        'es': 'Simulador de Altair 8800',
        'fr': 'Simulateur Altair 8800',
        'de': 'Altair-8800-Simulator',
        'it': 'Simulatore Altair 8800',
        'zh': 'Altair 8800 模拟器',
        'zh-TW': 'Altair 8800 模擬器',
        'ja': 'Altair 8800 シミュレーター',
        'ko': 'Altair 8800 시뮬레이터',
    },

    'nav-sim': {
        'en': 'Simulator',
        'es': 'Simulador',
        'fr': 'Simulateur',
        'de': 'Simulator',
        'it': 'Simulatore',
        'zh': '模拟器',
        'zh-TW': '模擬器',
        'ja': 'シミュレーター',
        'ko': '시뮬레이터',
    },

    'nav-debug': {
        'en': 'Debugger',
        'es': 'Depurador',
        'fr': 'Débogueur',
        'de': 'Debugger',
        'it': 'Debugger',
        'zh': '调试器',
        'zh-TW': '除錯器',
        'ja': 'デバッガー',
        'ko': '디버거',
    },

    'nav-ref': {
        'en': 'Tutorial',
        'es': 'Tutorial',
        'fr': 'Tutoriel',
        'de': 'Anleitung',
        'it': 'Tutorial',
        'zh': '使用手册',
        'zh-TW': '使用手冊',
        'ja': 'チュートリアル',
        'ko': '튜토리얼',
    },

    'switchboard-helper': {
        'en': 'Switch Board Helper',
        'es': 'Panel de interruptores auxiliar',
        'fr': "Panneau d'interrupteurs auxiliaire",
        'de': 'Zusätzliches Schalterfeld',
        'it': 'Pannello interruttori ausiliario',
        'zh': '辅助开关面板',
        'zh-TW': '輔助開關面板',
        'ja': '補助スイッチパネル',
        'ko': '보조 스위치 패널',
    },

    'back-home': {
        'en': 'Source Code',
        'es': 'Código fuente',
        'fr': 'Code source',
        'de': 'Quellcode',
        'it': 'Codice sorgente',
        'zh': '源代码',
        'zh-TW': '原始碼',
        'ja': 'ソースコード',
        'ko': '소스 코드',
    },

    'source-code': {
        'en': 'Source code',
        'es': 'Código fuente',
        'fr': 'Code source',
        'de': 'Quellcode',
        'it': 'Codice sorgente',
        'zh': '源代码',
        'zh-TW': '原始碼',
        'ja': 'ソースコード',
        'ko': '소스 코드',
    },

    'debug-load-data-title': {
        'en': 'Load Data to Addr #0',
        'es': 'Cargar datos desde la dirección 0',
        'fr': "Charger les données à l'adresse 0",
        'de': 'Daten ab Adresse 0 laden',
        'it': "Carica i dati dall'indirizzo 0",
        'zh': '从地址0开始加载数据',
        'zh-TW': '從位址 0 開始載入資料',
        'ja': 'アドレス 0 からデータを読み込む',
        'ko': '주소 0부터 데이터 적재',
    },

    'debug-load-data': {
        'en': 'Load Data',
        'es': 'Cargar datos',
        'fr': 'Charger',
        'de': 'Daten laden',
        'it': 'Carica dati',
        'zh': '加载数据',
        'zh-TW': '載入資料',
        'ja': '読み込み',
        'ko': '적재',
    },

    'debug-data-sample': {
        'en': "Bytes in HEX string, such as 'c3 00 00'",
        'es': "Bytes en hexadecimal, por ejemplo 'c3 00 00'",
        'fr': "Octets en hexadécimal, par exemple 'c3 00 00'",
        'de': "Bytes als Hex-Zeichenkette, z. B. 'c3 00 00'",
        'it': "Byte in esadecimale, ad esempio 'c3 00 00'",
        'zh': '十六进制字节序列，如 c3 00 00',
        'zh-TW': '十六進位位元組序列，例如 c3 00 00',
        'ja': '16 進数のバイト列（例: c3 00 00）',
        'ko': "16진수 바이트 문자열, 예: 'c3 00 00'",
    },

    'debug-cpu-dump-title': {
        'en': '8080 CPU Status Dump',
        'es': 'Estado de la CPU 8080',
        'fr': 'État du processeur 8080',
        'de': 'Status der 8080-CPU',
        'it': 'Stato della CPU 8080',
        'zh': '8080 CPU 的状态信息',
        'zh-TW': '8080 CPU 的狀態資訊',
        'ja': '8080 CPU のステータス',
        'ko': '8080 CPU 상태',
    },

    'debug-mem-dump-title': {
        'en': 'Memory Dump',
        'es': 'Volcado de memoria',
        'fr': 'Contenu de la mémoire',
        'de': 'Speicherabbild',
        'it': 'Dump della memoria',
        'zh': '内存信息',
        'zh-TW': '記憶體內容',
        'ja': 'メモリダンプ',
        'ko': '메모리 덤프',
    },

    'tutorial-title': {
        'en': 'Quick Tutorial',
        'es': 'Tutorial rápido',
        'fr': 'Tutoriel rapide',
        'de': 'Kurzanleitung',
        'it': 'Tutorial rapido',
        'zh': '快速教程',
        'zh-TW': '快速教學',
        'ja': 'クイックチュートリアル',
        'ko': '빠른 튜토리얼',
    },

    'tutorial-desc': {
        'en': 'How to input and run the following program to calculate 1 + 2 = 3:',
        'es': 'Cómo introducir y ejecutar el siguiente programa para calcular 1 + 2 = 3:',
        'fr': 'Comment saisir et exécuter le programme suivant pour calculer 1 + 2 = 3 :',
        'de': 'So geben Sie das folgende Programm ein und führen es aus, um 1 + 2 = 3 zu berechnen:',
        'it': 'Come inserire ed eseguire il seguente programma per calcolare 1 + 2 = 3:',
        'zh': '如何输入并运行以下加法程序，并计算 1 + 2 = 3：',
        'zh-TW': '如何輸入並執行以下加法程式，計算 1 + 2 = 3：',
        'ja': '次のプログラムを入力して実行し、1 + 2 = 3 を計算する手順:',
        'ko': '다음 프로그램을 입력하고 실행하여 1 + 2 = 3을 계산하는 방법:',
    },

    'tutorial-1': {
        'en': 'Turn on Altair 8800 by clicking OFF/ON switch.',
        'es': 'Enciende el Altair 8800 con el interruptor OFF/ON.',
        'fr': "Allumez l'Altair 8800 avec l'interrupteur OFF/ON.",
        'de': 'Schalten Sie den Altair 8800 mit dem Schalter OFF/ON ein.',
        'it': "Accendi l'Altair 8800 con l'interruttore OFF/ON.",
        'zh': '点击 OFF/ON 开关，打开 Altair 8800',
        'zh-TW': '點擊 OFF/ON 開關，打開 Altair 8800',
        'ja': 'OFF/ON スイッチをクリックして Altair 8800 の電源を入れます',
        'ko': 'OFF/ON 스위치를 클릭해 Altair 8800의 전원을 켭니다',
    },

    'tutorial-2': {
        'en': 'Set switches A7-A0 to 00 111 010 (up for 1, down for 0).',
        'es': 'Pon los interruptores A7-A0 en 00 111 010 (arriba = 1, abajo = 0).',
        'fr': 'Placez les interrupteurs A7-A0 sur 00 111 010 (haut = 1, bas = 0).',
        'de': 'Stellen Sie die Schalter A7-A0 auf 00 111 010 (oben = 1, unten = 0).',
        'it': 'Imposta gli interruttori A7-A0 su 00 111 010 (su = 1, giù = 0).',
        'zh': '将开关 A7-A0 依次设置为 00 111 010 （开关朝上为 1，开关朝下为 0）',
        'zh-TW': '將開關 A7-A0 依序設定為 00 111 010（開關朝上為 1，朝下為 0）',
        'ja': 'スイッチ A7-A0 を 00 111 010 に設定します（上が 1、下が 0）',
        'ko': '스위치 A7-A0을 00 111 010(으)로 설정합니다 (위가 1, 아래가 0)',
    },

    'tutorial-3': {
        'en': 'Click "DEPOSIT".',
        'es': 'Haz clic en DEPOSIT.',
        'fr': 'Cliquez sur DEPOSIT.',
        'de': 'Klicken Sie auf DEPOSIT.',
        'it': 'Fai clic su DEPOSIT.',
        'zh': '点击 DEPOSIT',
        'zh-TW': '點擊 DEPOSIT',
        'ja': 'DEPOSIT をクリックします',
        'ko': 'DEPOSIT을(를) 클릭합니다',
    },

    'tutorial-4': {
        'en': 'Set switches A7-A0 to 10 000 000.',
        'es': 'Pon los interruptores A7-A0 en 10 000 000.',
        'fr': 'Placez les interrupteurs A7-A0 sur 10 000 000.',
        'de': 'Stellen Sie die Schalter A7-A0 auf 10 000 000.',
        'it': 'Imposta gli interruttori A7-A0 su 10 000 000.',
        'zh': '将开关 A7-A0 依次设置为 10 000 000',
        'zh-TW': '將開關 A7-A0 依序設定為 10 000 000',
        'ja': 'スイッチ A7-A0 を 10 000 000 に設定します',
        'ko': '스위치 A7-A0을 10 000 000(으)로 설정합니다',
    },

    'tutorial-5': {
        'en': 'Click "DEPOSIT NEXT".',
        'es': 'Haz clic en DEPOSIT NEXT.',
        'fr': 'Cliquez sur DEPOSIT NEXT.',
        'de': 'Klicken Sie auf DEPOSIT NEXT.',
        'it': 'Fai clic su DEPOSIT NEXT.',
        'zh': '点击 DEPOSIT NEXT',
        'zh-TW': '點擊 DEPOSIT NEXT',
        'ja': 'DEPOSIT NEXT をクリックします',
        'ko': 'DEPOSIT NEXT을(를) 클릭합니다',
    },

    'tutorial-6': {
        'en': 'Repeat step 4-5 to input the following bytes one by one: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
        'es': 'Repite los pasos 4 y 5 para introducir los siguientes bytes uno a uno: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
        'fr': 'Répétez les étapes 4 et 5 pour saisir les octets suivants un par un : 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
        'de': 'Wiederholen Sie die Schritte 4 und 5, um die folgenden Bytes nacheinander einzugeben: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
        'it': 'Ripeti i passaggi 4 e 5 per inserire i seguenti byte uno alla volta: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
        'zh': '重复步骤 4 到步骤 5，逐个输入以下字节：00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000',
        'zh-TW': '重複步驟 4 到步驟 5，逐一輸入以下位元組：00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000',
        'ja': '手順 4〜5 を繰り返して、次のバイトを 1 つずつ入力します: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000',
        'ko': '4~5단계를 반복하여 다음 바이트를 하나씩 입력합니다: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000',
    },

    'tutorial-7': {
        'en': 'Set switches A7-A0 to 10 000 000.',
        'es': 'Pon los interruptores A7-A0 en 10 000 000.',
        'fr': 'Placez les interrupteurs A7-A0 sur 10 000 000.',
        'de': 'Stellen Sie die Schalter A7-A0 auf 10 000 000.',
        'it': 'Imposta gli interruttori A7-A0 su 10 000 000.',
        'zh': '将开关 A7-A0 依次设置为 10 000 000',
        'zh-TW': '將開關 A7-A0 依序設定為 10 000 000',
        'ja': 'スイッチ A7-A0 を 10 000 000 に設定します',
        'ko': '스위치 A7-A0을 10 000 000(으)로 설정합니다',
    },

    'tutorial-8': {
        'en': 'Click "EXAMINE".',
        'es': 'Haz clic en EXAMINE.',
        'fr': 'Cliquez sur EXAMINE.',
        'de': 'Klicken Sie auf EXAMINE.',
        'it': 'Fai clic su EXAMINE.',
        'zh': '点击 EXAMINE',
        'zh-TW': '點擊 EXAMINE',
        'ja': 'EXAMINE をクリックします',
        'ko': 'EXAMINE을(를) 클릭합니다',
    },

    'tutorial-9': {
        'en': 'Set switches A7-A0 to 00 000 001 (the first number to be added, or 1 in decimal).',
        'es': 'Pon los interruptores A7-A0 en 00 000 001 (el primer sumando, 1 en decimal).',
        'fr': 'Placez les interrupteurs A7-A0 sur 00 000 001 (le premier nombre à additionner, 1 en décimal).',
        'de': 'Stellen Sie die Schalter A7-A0 auf 00 000 001 (der erste Summand, dezimal 1).',
        'it': 'Imposta gli interruttori A7-A0 su 00 000 001 (il primo addendo, 1 in decimale).',
        'zh': '将开关 A7-A0 依次设置为 00 000 001（即第一个加数的值，也就是十进制的 1）',
        'zh-TW': '將開關 A7-A0 依序設定為 00 000 001（即第一個加數的值，也就是十進位的 1）',
        'ja': 'スイッチ A7-A0 を 00 000 001 に設定します（最初の加数、10 進数の 1）',
        'ko': '스위치 A7-A0을 00 000 001(으)로 설정합니다 (첫 번째 피가산수, 10진수 1)',
    },

    'tutorial-10': {
        'en': 'Click "DEPOSIT".',
        'es': 'Haz clic en DEPOSIT.',
        'fr': 'Cliquez sur DEPOSIT.',
        'de': 'Klicken Sie auf DEPOSIT.',
        'it': 'Fai clic su DEPOSIT.',
        'zh': '点击 DEPOSIT',
        'zh-TW': '點擊 DEPOSIT',
        'ja': 'DEPOSIT をクリックします',
        'ko': 'DEPOSIT을(를) 클릭합니다',
    },

    'tutorial-11': {
        'en': 'Set switches A7-A0 to 00 000 010 (the second number to be added, or 2 in decimal).',
        'es': 'Pon los interruptores A7-A0 en 00 000 010 (el segundo sumando, 2 en decimal).',
        'fr': 'Placez les interrupteurs A7-A0 sur 00 000 010 (le second nombre à additionner, 2 en décimal).',
        'de': 'Stellen Sie die Schalter A7-A0 auf 00 000 010 (der zweite Summand, dezimal 2).',
        'it': 'Imposta gli interruttori A7-A0 su 00 000 010 (il secondo addendo, 2 in decimale).',
        'zh': '将开关 A7-A0 依次设置为 00 000 010（即第二个加数的值，也就是十进制的 2）',
        'zh-TW': '將開關 A7-A0 依序設定為 00 000 010（即第二個加數的值，也就是十進位的 2）',
        'ja': 'スイッチ A7-A0 を 00 000 010 に設定します（2 番目の加数、10 進数の 2）',
        'ko': '스위치 A7-A0을 00 000 010(으)로 설정합니다 (두 번째 피가산수, 10진수 2)',
    },

    'tutorial-12': {
        'en': 'Click "DEPOSIT NEXT".',
        'es': 'Haz clic en DEPOSIT NEXT.',
        'fr': 'Cliquez sur DEPOSIT NEXT.',
        'de': 'Klicken Sie auf DEPOSIT NEXT.',
        'it': 'Fai clic su DEPOSIT NEXT.',
        'zh': '点击 DEPOSIT NEXT',
        'zh-TW': '點擊 DEPOSIT NEXT',
        'ja': 'DEPOSIT NEXT をクリックします',
        'ko': 'DEPOSIT NEXT을(를) 클릭합니다',
    },

    'tutorial-13': {
        'en': 'Click "RESET".',
        'es': 'Haz clic en RESET.',
        'fr': 'Cliquez sur RESET.',
        'de': 'Klicken Sie auf RESET.',
        'it': 'Fai clic su RESET.',
        'zh': '点击 RESET',
        'zh-TW': '點擊 RESET',
        'ja': 'RESET をクリックします',
        'ko': 'RESET을(를) 클릭합니다',
    },

    'tutorial-14': {
        'en': 'Click "RUN" and wait for a few seconds.',
        'es': 'Haz clic en RUN y espera unos segundos.',
        'fr': 'Cliquez sur RUN et attendez quelques secondes.',
        'de': 'Klicken Sie auf RUN und warten Sie einige Sekunden.',
        'it': 'Fai clic su RUN e attendi qualche secondo.',
        'zh': '点击 RUN 并等待几秒钟',
        'zh-TW': '點擊 RUN 並等待幾秒鐘',
        'ja': 'RUN をクリックして数秒待ちます',
        'ko': 'RUN을 클릭하고 몇 초 기다립니다',
    },

    'tutorial-15': {
        'en': 'Click "STOP".',
        'es': 'Haz clic en STOP.',
        'fr': 'Cliquez sur STOP.',
        'de': 'Klicken Sie auf STOP.',
        'it': 'Fai clic su STOP.',
        'zh': '点击 STOP',
        'zh-TW': '點擊 STOP',
        'ja': 'STOP をクリックします',
        'ko': 'STOP을(를) 클릭합니다',
    },

    'tutorial-16': {
        'en': 'Set switches A7-A0 to 10 000 010 (the address that holds the sum).',
        'es': 'Pon los interruptores A7-A0 en 10 000 010 (la dirección que contiene la suma).',
        'fr': "Placez les interrupteurs A7-A0 sur 10 000 010 (l'adresse qui contient la somme).",
        'de': 'Stellen Sie die Schalter A7-A0 auf 10 000 010 (die Adresse, die die Summe enthält).',
        'it': "Imposta gli interruttori A7-A0 su 10 000 010 (l'indirizzo che contiene la somma).",
        'zh': '将开关 A7-A0 依次设置为 10 000 010（即存储计算结果的地址）',
        'zh-TW': '將開關 A7-A0 依序設定為 10 000 010（即儲存計算結果的位址）',
        'ja': 'スイッチ A7-A0 を 10 000 010 に設定します（合計が格納されているアドレス）',
        'ko': '스위치 A7-A0을 10 000 010(으)로 설정합니다 (합이 저장된 주소)',
    },

    'tutorial-17': {
        'en': 'Click "EXAMINE".',
        'es': 'Haz clic en EXAMINE.',
        'fr': 'Cliquez sur EXAMINE.',
        'de': 'Klicken Sie auf EXAMINE.',
        'it': 'Fai clic su EXAMINE.',
        'zh': '点击 EXAMINE',
        'zh-TW': '點擊 EXAMINE',
        'ja': 'EXAMINE をクリックします',
        'ko': 'EXAMINE을(를) 클릭합니다',
    },

    'tutorial-18': {
        'en': 'The LEDs D7-D0 show the result 00 000 011 (3 in decimal).',
        'es': 'Los LED D7-D0 muestran el resultado 00 000 011 (3 en decimal).',
        'fr': 'Les LED D7-D0 affichent le résultat 00 000 011 (3 en décimal).',
        'de': 'Die LEDs D7-D0 zeigen das Ergebnis 00 000 011 (dezimal 3).',
        'it': 'I LED D7-D0 mostrano il risultato 00 000 011 (3 in decimale).',
        'zh': 'LED 灯 D7-D0 显示出计算结果 00 000 011（即十进制的 3）',
        'zh-TW': 'LED 燈 D7-D0 顯示計算結果 00 000 011（即十進位的 3）',
        'ja': 'LED D7-D0 に結果 00 000 011（10 進数の 3）が表示されます',
        'ko': 'LED D7-D0에 결과 00 000 011 (10진수 3)이 표시됩니다',
    },

    'tutorial-19': {
        'en': 'Turn off Altair 8800.',
        'es': 'Apaga el Altair 8800.',
        'fr': "Éteignez l'Altair 8800.",
        'de': 'Schalten Sie den Altair 8800 aus.',
        'it': "Spegni l'Altair 8800.",
        'zh': '关闭 Altair 8800',
        'zh-TW': '關閉 Altair 8800',
        'ja': 'Altair 8800 の電源を切ります',
        'ko': 'Altair 8800의 전원을 끕니다',
    },

    'reference-title': {
        'en': 'References',
        'es': 'Referencias',
        'fr': 'Références',
        'de': 'Referenzen',
        'it': 'Riferimenti',
        'zh': '参考资料',
        'zh-TW': '參考資料',
        'ja': '参考資料',
        'ko': '참고 자료',
    },

    'ref-wikipedia-altair': {
        'en': 'Wikipedia: Altair 8800',
        'es': 'Wikipedia: Altair 8800',
        'fr': 'Wikipédia : Altair 8800',
        'de': 'Wikipedia: Altair 8800',
        'it': 'Wikipedia: Altair 8800',
        'zh': '维基百科：Altair 8800',
        'zh-TW': '維基百科：Altair 8800',
        'ja': 'Wikipedia: Altair 8800',
        'ko': '위키백과: Altair 8800',
    },

    'ref-wikipedia-8080': {
        'en': 'Wikipedia: Intel 8080 CPU',
        'es': 'Wikipedia: CPU Intel 8080',
        'fr': 'Wikipédia : processeur Intel 8080',
        'de': 'Wikipedia: Intel 8080 CPU',
        'it': 'Wikipedia: CPU Intel 8080',
        'zh': '维基百科：Intel 8080 CPU',
        'zh-TW': '維基百科：Intel 8080 CPU',
        'ja': 'Wikipedia: Intel 8080 CPU',
        'ko': '위키백과: Intel 8080 CPU',
    },

    'ref-instruction-set': {
        'en': 'Intel 8080 instruction set - an opcode encoding quick reference (text)',
        'es': 'Juego de instrucciones del Intel 8080: referencia rápida de códigos de operación (texto)',
        'fr': "Jeu d'instructions de l'Intel 8080 : aide-mémoire des codes d'opération (texte)",
        'de': 'Intel-8080-Befehlssatz: Kurzreferenz der Opcodes (Text)',
        'it': "Set di istruzioni dell'Intel 8080: guida rapida agli opcode (testo)",
        'zh': 'Intel 8080 指令集，操作码编码速查表（纯文本）',
        'zh-TW': 'Intel 8080 指令集，操作碼編碼速查表（純文字）',
        'ja': 'Intel 8080 命令セット: オペコード表（テキスト）',
        'ko': 'Intel 8080 명령어 집합: 옵코드 빠른 참조 (텍스트)',
    },

    'ref-original-manuals': {
        'en': 'Original Altair 8800 manuals - scanned PDFs archived at altairclone.com',
        'es': 'Manuales originales del Altair 8800: PDF escaneados archivados en altairclone.com',
        'fr': "Manuels d'origine de l'Altair 8800 : PDF numérisés archivés sur altairclone.com",
        'de': 'Originalhandbücher des Altair 8800: gescannte PDFs auf altairclone.com',
        'it': "Manuali originali dell'Altair 8800: PDF scansionati su altairclone.com",
        'zh': 'Altair 8800 原版手册，altairclone.com 收藏的 PDF 扫描版',
        'zh-TW': 'Altair 8800 原版手冊，altairclone.com 收藏的 PDF 掃描版',
        'ja': 'Altair 8800 のオリジナルマニュアル: altairclone.com に保存されたスキャン PDF',
        'ko': 'Altair 8800 원본 매뉴얼: altairclone.com에 보관된 스캔 PDF',
    },

    'ref-operators-manual': {
        'en': "Altair 8800 Operator's Manual - the original manual as a scanned PDF",
        'es': "Altair 8800 Operator's Manual: el manual original escaneado en PDF",
        'fr': "Altair 8800 Operator's Manual : le manuel d'origine numérisé en PDF",
        'de': "Altair 8800 Operator's Manual: das Originalhandbuch als gescanntes PDF",
        'it': "Altair 8800 Operator's Manual: il manuale originale in PDF scansionato",
        'zh': 'Altair 8800 操作手册，原版手册的 PDF 扫描版',
        'zh-TW': 'Altair 8800 操作手冊，原版手冊的 PDF 掃描版',
        'ja': "Altair 8800 Operator's Manual: 原本のスキャン PDF",
        'ko': "Altair 8800 Operator's Manual: 원본 매뉴얼 스캔 PDF",
    },

    'ref-operators-manual-html': {
        'en': "Altair 8800 Operator's Manual v2.0 - an HTML edition by Kevin Cole",
        'es': "Altair 8800 Operator's Manual v2.0: edición HTML de Kevin Cole",
        'fr': "Altair 8800 Operator's Manual v2.0 : édition HTML par Kevin Cole",
        'de': "Altair 8800 Operator's Manual v2.0: HTML-Ausgabe von Kevin Cole",
        'it': "Altair 8800 Operator's Manual v2.0: edizione HTML di Kevin Cole",
        'zh': 'Altair 8800 操作手册 v2.0，Kevin Cole 制作的 HTML 版本',
        'zh-TW': 'Altair 8800 操作手冊 v2.0，Kevin Cole 製作的 HTML 版本',
        'ja': "Altair 8800 Operator's Manual v2.0: Kevin Cole による HTML 版",
        'ko': "Altair 8800 Operator's Manual v2.0: Kevin Cole의 HTML 판",
    },

    'ref-asm-manual': {
        'en': "Intel 8080 Assembly Language Programming Manual - Intel's original manual as a scanned PDF",
        'es': 'Intel 8080 Assembly Language Programming Manual: el manual original de Intel escaneado en PDF',
        'fr': "Intel 8080 Assembly Language Programming Manual : le manuel original d'Intel numérisé en PDF",
        'de': 'Intel 8080 Assembly Language Programming Manual: Intels Originalhandbuch als gescanntes PDF',
        'it': 'Intel 8080 Assembly Language Programming Manual: il manuale originale Intel in PDF scansionato',
        'zh': 'Intel 8080 汇编语言编程手册，Intel 原版手册的 PDF 扫描版',
        'zh-TW': 'Intel 8080 組合語言程式設計手冊，Intel 原版手冊的 PDF 掃描版',
        'ja': 'Intel 8080 Assembly Language Programming Manual: Intel 純正マニュアルのスキャン PDF',
        'ko': 'Intel 8080 Assembly Language Programming Manual: Intel 원본 매뉴얼 스캔 PDF',
    },

    'ref-demystifying-computers': {
        'en': 'Demystifying Computers - an open source book by Chris Jones and Jeff Elkner',
        'es': 'Demystifying Computers: un libro de código abierto de Chris Jones y Jeff Elkner',
        'fr': 'Demystifying Computers : un livre libre de Chris Jones et Jeff Elkner',
        'de': 'Demystifying Computers: ein Open-Source-Buch von Chris Jones und Jeff Elkner',
        'it': 'Demystifying Computers: un libro open source di Chris Jones e Jeff Elkner',
        'zh': 'Demystifying Computers（揭秘计算机），Chris Jones 和 Jeff Elkner 撰写的开源书籍',
        'zh-TW': 'Demystifying Computers（揭開電腦的神秘面紗），Chris Jones 與 Jeff Elkner 撰寫的開源書籍',
        'ja': 'Demystifying Computers: Chris Jones と Jeff Elkner によるオープンソースの書籍',
        'ko': 'Demystifying Computers: Chris Jones와 Jeff Elkner가 쓴 오픈 소스 책',
    },

    'ref-altair-simulator': {
        'en': 'MITS Altair Simulator - another JavaScript simulator, running Microsoft BASIC on a simulated teletype',
        'es': 'MITS Altair Simulator: otro simulador en JavaScript, ejecuta Microsoft BASIC en un teletipo simulado',
        'fr': 'MITS Altair Simulator : un autre simulateur JavaScript, qui exécute Microsoft BASIC sur un téléscripteur simulé',
        'de': 'MITS Altair Simulator: ein weiterer JavaScript-Simulator, der Microsoft BASIC auf einem simulierten Fernschreiber ausführt',
        'it': 'MITS Altair Simulator: un altro simulatore JavaScript, esegue Microsoft BASIC su una telescrivente simulata',
        'zh': 'MITS Altair Simulator，另一个 JavaScript 模拟器，在模拟的电传打字机上运行 Microsoft BASIC',
        'zh-TW': 'MITS Altair Simulator，另一個 JavaScript 模擬器，在模擬的電傳打字機上執行 Microsoft BASIC',
        'ja': 'MITS Altair Simulator: 別の JavaScript シミュレーター。模擬テレタイプ上で Microsoft BASIC を実行します',
        'ko': 'MITS Altair Simulator: 또 다른 JavaScript 시뮬레이터, 모의 텔레타이프에서 Microsoft BASIC 실행',
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
 * The locales as they were when the saved value was a position in the
 * list rather than the locale itself. A reader who chose Chinese then
 * has a 1 saved, which has to keep meaning Chinese now that eight more
 * languages sit between.
 * @type {Array<string>}
 */
l10n.LEGACY_LOCALES = [
    'en',
    'zh',
];

/**
 * Reads the saved locale from local storage.
 *
 * A browser that is set to block site data throws on local storage
 * instead of returning null. This runs before the panel is built, so a
 * failure here must not stop the rest of the page from loading.
 * @return {?string} The saved value, or null if there is none.
 */
l10n.readSavedLocale = function() {
    try {
        return localStorage.getItem(l10n.localStorageKey);
    } catch (e) {
        return null;
    }
};

/**
 * Saves the current locale to local storage.
 */
l10n.saveLocale = function() {
    try {
        localStorage.setItem(l10n.localStorageKey, l10n.LOCALES[l10n.current]);
    } catch (e) {
        // Site data is blocked, so the choice is not remembered. The
        // simulator itself works either way.
    }
};

/**
 * Switches to the given locale and remembers it.
 * @param {string} locale One of l10n.LOCALES.
 */
l10n.setLocale = function(locale) {
    const index = l10n.LOCALES.indexOf(locale);
    if (index < 0) {
        return;
    }
    l10n.current = index;
    l10n.updateMessages();
    l10n.saveLocale();
};

/**
 * Fills the language menu with the locales, each under its own name,
 * and wires it up.
 *
 * This is a button and a list rather than a select element because a
 * native menu is drawn by the operating system, which on macOS puts the
 * list over the button with the current choice under the pointer. That
 * cannot be restyled from the page, and it reads as a misplaced popup
 * here, so the menu is built out of ordinary elements that sit where
 * they are told.
 */
l10n.initMenu = function() {
    const button = document.getElementById('switch-locale');
    const list = document.getElementById('locale-list');
    if (!button || !list) {
        return;
    }

    for (const locale of l10n.LOCALES) {
        const item = document.createElement('li');
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '-1');
        item.dataset.locale = locale;
        item.textContent = l10n.LOCALE_NAMES[locale] || locale;
        item.addEventListener('click', function() {
            l10n.setLocale(locale);
            l10n.closeMenu();
        }, false);
        list.appendChild(item);
    }

    button.addEventListener('click', function(event) {
        event.stopPropagation();
        if (list.hidden) {
            l10n.openMenu();
        } else {
            l10n.closeMenu();
        }
    }, false);

    // Anywhere else on the page dismisses it.
    document.addEventListener('click', function(event) {
        if (!list.hidden && !document.getElementById('locale-menu')
                .contains(event.target)) {
            l10n.closeMenu();
        }
    }, false);

    // The keys a native menu would have handled by itself.
    document.addEventListener('keydown', function(event) {
        if (list.hidden) {
            return;
        }
        const items = Array.from(list.children);
        const at = items.indexOf(document.activeElement);
        if (event.key === 'Escape' || event.key === 'Tab') {
            l10n.closeMenu();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            const next = (at < 0 ? 0 : at + step + items.length) % items.length;
            items[next].focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
            if (at >= 0) {
                event.preventDefault();
                l10n.setLocale(items[at].dataset.locale);
                l10n.closeMenu();
            }
        }
    }, false);
};

/** Opens the language menu, with the current locale focused. */
l10n.openMenu = function() {
    const button = document.getElementById('switch-locale');
    const list = document.getElementById('locale-list');
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    const current = list.querySelector('[aria-selected="true"]');
    (current || list.firstElementChild).focus();
};

/** Closes the language menu and puts focus back on the button. */
l10n.closeMenu = function() {
    const button = document.getElementById('switch-locale');
    const list = document.getElementById('locale-list');
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.focus();
};

/**
 * Restores the last locale from local storage.
 */
l10n.restoreLocale = function() {
    var val = l10n.readSavedLocale();
    var index = l10n.LOCALES.indexOf(val);
    if (index < 0 && val) {
        var savedIndex = parseInt(val);
        if (!isNaN(savedIndex)) {
            index = l10n.LOCALES.indexOf(
                l10n.LEGACY_LOCALES[savedIndex % l10n.LEGACY_LOCALES.length]);
        }
    }
    l10n.current = index < 0 ? 0 : index;
    l10n.updateMessages();
};

/**
 * Updates UI messages to the current locale.
 */
l10n.updateMessages = function() {
    const locale = l10n.LOCALES[l10n.current];
    document.documentElement.lang = locale;

    // Keep the language menu showing what is actually selected.
    const current = document.getElementById('locale-current');
    if (current) {
        current.textContent = l10n.LOCALE_NAMES[locale] || locale;
    }
    const list = document.getElementById('locale-list');
    if (list) {
        for (const item of list.children) {
            item.setAttribute(
                'aria-selected', item.dataset.locale === locale ? 'true' : 'false');
        }
    }

    elems = document.getElementsByClassName('l10n');
    for (let i = 0; i < elems.length; i++) {
        if (l10n.MESSAGES.hasOwnProperty(elems[i].id)) {
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
