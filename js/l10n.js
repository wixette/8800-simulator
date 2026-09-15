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

    'nav-tty': {
        'en': 'Teletype',
        'es': 'Teletipo',
        'fr': 'Téléscripteur',
        'de': 'Fernschreiber',
        'it': 'Telescrivente',
        'zh': '电传打字机',
        'zh-TW': '電傳打字機',
        'ja': 'テレタイプ',
        'ko': '텔레타이프',
    },

    'tty-title': {
        'en': 'Teletype (ASR-33)',
        'es': 'Teletipo (ASR-33)',
        'fr': 'Téléscripteur (ASR-33)',
        'de': 'Fernschreiber (ASR-33)',
        'it': 'Telescrivente (ASR-33)',
        'zh': '电传打字机 (ASR-33)',
        'zh-TW': '電傳打字機 (ASR-33)',
        'ja': 'テレタイプ (ASR-33)',
        'ko': '텔레타이프 (ASR-33)',
    },

    'tty-helper-title': {
        'en': 'Teletype Helper',
        'es': 'Ayuda del teletipo',
        'fr': 'Aide du téléscripteur',
        'de': 'Fernschreiber-Hilfe',
        'it': 'Aiuto telescrivente',
        'zh': '电传打字机辅助按键',
        'zh-TW': '電傳打字機輔助按鍵',
        'ja': 'テレタイプ補助キー',
        'ko': '텔레타이프 보조 키',
    },

    'tty-break': {
        'en': 'CTRL-C (BREAK)',
        'es': 'CTRL-C (INTERRUMPIR)',
        'fr': 'CTRL-C (INTERRUPTION)',
        'de': 'STRG-C (ABBRUCH)',
        'it': 'CTRL-C (INTERRUZIONE)',
        'zh': 'CTRL-C（中断）',
        'zh-TW': 'CTRL-C（中斷）',
        'ja': 'CTRL-C（中断）',
        'ko': 'CTRL-C (중단)',
    },

    'tty-rubout': {
        'en': 'RUBOUT (_)',
        'es': 'BORRAR (_)',
        'fr': 'EFFACER (_)',
        'de': 'LÖSCHEN (_)',
        'it': 'CANCELLA (_)',
        'zh': '退格删除（_）',
        'zh-TW': '退格刪除（_）',
        'ja': 'ラブアウト（_）',
        'ko': '지우기 (_)',
    },

    'tty-kill': {
        'en': 'KILL LINE (@)',
        'es': 'ANULAR LÍNEA (@)',
        'fr': 'ANNULER LA LIGNE (@)',
        'de': 'ZEILE VERWERFEN (@)',
        'it': 'ANNULLA RIGA (@)',
        'zh': '放弃整行（@）',
        'zh-TW': '放棄整行（@）',
        'ja': '行取り消し（@）',
        'ko': '줄 취소 (@)',
    },

    'tty-clear': {
        'en': 'CLEAR PAPER',
        'es': 'PAPEL NUEVO',
        'fr': 'NOUVELLE FEUILLE',
        'de': 'PAPIER LEEREN',
        'it': 'NUOVO FOGLIO',
        'zh': '换新纸',
        'zh-TW': '換新紙',
        'ja': '紙を取り替える',
        'ko': '새 용지',
    },

    'tty-hint': {
        'en': 'Type here. Nothing echoes by itself - the machine has to be running a program that reads the serial board, so load tty-echo from the examples and RUN it first.',
        'es': 'Escribe aquí. Nada se repite por sí solo: la máquina tiene que estar ejecutando un programa que lea la placa serie, así que carga tty-echo de los ejemplos y ejecútalo primero.',
        'fr': 'Tapez ici. Rien ne s\'affiche tout seul : la machine doit exécuter un programme qui lit la carte série, alors chargez tty-echo depuis les exemples et lancez-le d\'abord.',
        'de': 'Hier tippen. Nichts erscheint von selbst - die Maschine muss ein Programm ausführen, das die serielle Karte liest. Laden Sie also zuerst tty-echo aus den Beispielen und starten Sie es.',
        'it': 'Scrivi qui. Nulla viene ripetuto da solo: la macchina deve eseguire un programma che legge la scheda seriale, quindi carica tty-echo dagli esempi ed eseguilo prima.',
        'zh': '在这里输入。字符不会自动回显——机器必须正在运行一个读取串口板的程序，所以请先从示例中加载 tty-echo 并运行它。',
        'zh-TW': '在這裡輸入。字元不會自動回顯——機器必須正在執行一個讀取串列埠板的程式，所以請先從範例中載入 tty-echo 並執行它。',
        'ja': 'ここで入力します。文字は自動では表示されません。シリアルボードを読むプログラムを動かしている必要があるので、まず例の tty-echo を読み込んで RUN してください。',
        'ko': '여기에 입력하세요. 문자는 저절로 표시되지 않습니다. 직렬 보드를 읽는 프로그램이 실행 중이어야 하므로, 먼저 예제의 tty-echo를 불러와 실행하세요.',
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

    'status-off': {
        'en': 'The machine is off. Click OFF/ON on the front panel to switch it on.',
        'es': 'La máquina está apagada. Pulsa OFF/ON en el panel frontal para encenderla.',
        'fr': 'La machine est éteinte. Cliquez sur OFF/ON en façade pour l\'allumer.',
        'de': 'Die Maschine ist aus. Klicken Sie OFF/ON an der Frontplatte, um sie einzuschalten.',
        'it': 'La macchina è spenta. Premi OFF/ON sul pannello frontale per accenderla.',
        'zh': '机器已关闭。点击前面板上的 OFF/ON 开关即可开机。',
        'zh-TW': '機器已關閉。點擊前面板上的 OFF/ON 開關即可開機。',
        'ja': '電源が切れています。フロントパネルの OFF/ON をクリックすると入ります。',
        'ko': '기계가 꺼져 있습니다. 앞판의 OFF/ON을 눌러 켜세요.',
    },

    'status-on': {
        'en': 'The machine is on and waiting. Memory came up full of random bytes, as the real one did.',
        'es': 'La máquina está encendida y esperando. La memoria arrancó llena de bytes aleatorios, como en la real.',
        'fr': 'La machine est allumée et en attente. La mémoire démarre pleine d’octets aléatoires, comme sur la vraie.',
        'de': 'Die Maschine ist an und wartet. Der Speicher kam voller Zufallsbytes hoch, wie beim Original.',
        'it': 'La macchina è accesa e in attesa. La memoria si è avviata piena di byte casuali, come quella vera.',
        'zh': '机器已开机，正在等待。内存开机时充满随机字节，和真机一样。',
        'zh-TW': '機器已開機，正在等待。記憶體開機時充滿隨機位元組，和真機一樣。',
        'ja': '電源が入り、待機中です。メモリは実機と同じくランダムなバイトで埋まった状態で立ち上がります。',
        'ko': '기계가 켜져 대기 중입니다. 메모리는 실제 기계처럼 무작위 바이트로 채워진 채 시작됩니다.',
    },

    'status-running': {
        'en': 'Running.',
        'es': 'En ejecución.',
        'fr': 'En cours d’exécution.',
        'de': 'Läuft.',
        'it': 'In esecuzione.',
        'zh': '正在运行。',
        'zh-TW': '正在執行。',
        'ja': '実行中です。',
        'ko': '실행 중입니다.',
    },

    'status-stopped': {
        'en': 'Stopped. The program counter is where it stopped; RESET puts it back to 0000H.',
        'es': 'Detenida. El contador de programa está donde se paró; RESET lo devuelve a 0000H.',
        'fr': 'Arrêtée. Le compteur de programme est resté où il s’est arrêté ; RESET le remet à 0000H.',
        'de': 'Angehalten. Der Programmzähler steht, wo er stehen blieb; RESET setzt ihn auf 0000H zurück.',
        'it': 'Ferma. Il contatore di programma è dove si è fermato; RESET lo riporta a 0000H.',
        'zh': '已停止。程序计数器停在当前位置；按 RESET 可让它回到 0000H。',
        'zh-TW': '已停止。程式計數器停在目前位置；按 RESET 可讓它回到 0000H。',
        'ja': '停止しました。プログラムカウンタは止まった位置のままです。RESET で 0000H に戻ります。',
        'ko': '멈췄습니다. 프로그램 카운터는 멈춘 자리에 있으며, RESET을 누르면 0000H로 돌아갑니다.',
    },

    'status-reset': {
        'en': 'RESET. The program counter is back at 0000H; click RUN to start from there.',
        'es': 'RESET. El contador de programa vuelve a 0000H; pulsa RUN para empezar desde ahí.',
        'fr': 'RESET. Le compteur de programme est revenu à 0000H ; cliquez sur RUN pour partir de là.',
        'de': 'RESET. Der Programmzähler steht wieder auf 0000H; klicken Sie RUN, um dort zu starten.',
        'it': 'RESET. Il contatore di programma è tornato a 0000H; premi RUN per partire da lì.',
        'zh': '已 RESET。程序计数器回到 0000H；点击 RUN 即可从这里开始执行。',
        'zh-TW': '已 RESET。程式計數器回到 0000H；點擊 RUN 即可從這裡開始執行。',
        'ja': 'RESET しました。プログラムカウンタは 0000H に戻っています。RUN を押すとそこから実行します。',
        'ko': 'RESET 했습니다. 프로그램 카운터가 0000H로 돌아갔습니다. RUN을 누르면 거기서 시작합니다.',
    },

    'status-mem-installed': {
        'en': '{size} of memory installed. Fitting a memory board means opening the case, so the machine was switched off - click OFF/ON to start it again.',
        'es': 'Instalados {size} de memoria. Montar una placa de memoria implica abrir la caja, así que la máquina se apagó: pulsa OFF/ON para encenderla otra vez.',
        'fr': '{size} de mémoire installés. Poser une carte mémoire suppose d’ouvrir le boîtier, la machine a donc été éteinte : cliquez sur OFF/ON pour la rallumer.',
        'de': '{size} Speicher eingebaut. Eine Speicherkarte einzusetzen heißt das Gehäuse zu öffnen, also wurde die Maschine abgeschaltet - klicken Sie OFF/ON, um sie neu zu starten.',
        'it': 'Installati {size} di memoria. Montare una scheda di memoria significa aprire il contenitore, quindi la macchina è stata spenta: premi OFF/ON per riaccenderla.',
        'zh': '已安装 {size} 内存。插内存板意味着打开机箱，所以机器已关闭——点击 OFF/ON 重新开机。',
        'zh-TW': '已安裝 {size} 記憶體。插記憶體卡意味著打開機殼，所以機器已關閉——點擊 OFF/ON 重新開機。',
        'ja': 'メモリを {size} 搭載しました。メモリボードを挿すのは筐体を開けることなので電源が切れています。OFF/ON を押して入れ直してください。',
        'ko': '메모리 {size}를 설치했습니다. 메모리 보드를 꽂으려면 케이스를 열어야 하므로 기계가 꺼졌습니다. OFF/ON을 눌러 다시 켜세요.',
    },

    'status-zeroed': {
        'en': 'All memory set to zero.',
        'es': 'Toda la memoria puesta a cero.',
        'fr': 'Toute la mémoire mise à zéro.',
        'de': 'Der gesamte Speicher wurde auf null gesetzt.',
        'it': 'Tutta la memoria azzerata.',
        'zh': '全部内存已清零。',
        'zh-TW': '全部記憶體已清零。',
        'ja': 'メモリをすべてゼロにしました。',
        'ko': '메모리를 모두 0으로 지웠습니다.',
    },

    'debug-rom-title': {
        'en': 'Load a Program From a File',
        'es': 'Cargar un programa desde un archivo',
        'fr': 'Charger un programme depuis un fichier',
        'de': 'Ein Programm aus einer Datei laden',
        'it': 'Carica un programma da un file',
        'zh': '从文件加载程序',
        'zh-TW': '從檔案載入程式',
        'ja': 'ファイルからプログラムを読み込む',
        'ko': '파일에서 프로그램 불러오기',
    },

    'load-basic': {
        'en': 'LOAD 4K BASIC',
        'es': 'CARGAR BASIC 4K',
        'fr': 'CHARGER BASIC 4K',
        'de': '4K BASIC LADEN',
        'it': 'CARICA BASIC 4K',
        'zh': '加载 4K BASIC',
        'zh-TW': '載入 4K BASIC',
        'ja': '4K BASIC を読み込む',
        'ko': '4K BASIC 불러오기',
    },

    'load-binary': {
        'en': 'LOAD BINARY FILE',
        'es': 'CARGAR ARCHIVO BINARIO',
        'fr': 'CHARGER UN FICHIER BINAIRE',
        'de': 'BINÄRDATEI LADEN',
        'it': 'CARICA FILE BINARIO',
        'zh': '加载二进制文件',
        'zh-TW': '載入二進位檔',
        'ja': 'バイナリファイルを読み込む',
        'ko': '바이너리 파일 불러오기',
    },

    'rom-hint': {
        'en': '4K BASIC is 4 KB of paper tape, so install at least 4 KB of memory first. In 1975 you would have toggled in a 28 byte boot loader by hand and then listened to the tape read for seven minutes.',
        'es': 'BASIC 4K son 4 KB de cinta de papel, así que instala al menos 4 KB de memoria primero. En 1975 habrías introducido a mano un cargador de 28 bytes y luego escuchado la cinta durante siete minutos.',
        'fr': 'BASIC 4K tient sur 4 Kio de bande perforée, installez donc au moins 4 Kio de mémoire d\'abord. En 1975, il aurait fallu saisir à la main un chargeur de 28 octets puis écouter la bande pendant sept minutes.',
        'de': '4K BASIC sind 4 KB Lochstreifen, installieren Sie also zuerst mindestens 4 KB Speicher. 1975 hätten Sie einen 28 Byte langen Urlader von Hand eingegeben und dann dem Band sieben Minuten lang zugehört.',
        'it': 'BASIC 4K sta in 4 KB di nastro perforato, quindi installa prima almeno 4 KB di memoria. Nel 1975 avresti inserito a mano un boot loader di 28 byte e poi ascoltato il nastro per sette minuti.',
        'zh': '4K BASIC 是 4 KB 的纸带，所以请先安装至少 4 KB 内存。在 1975 年，你得先用开关手工输入 28 字节的引导程序，然后听着纸带读上七分钟。',
        'zh-TW': '4K BASIC 是 4 KB 的紙帶，所以請先安裝至少 4 KB 記憶體。在 1975 年，你得先用開關手工輸入 28 位元組的載入程式，然後聽著紙帶讀上七分鐘。',
        'ja': '4K BASIC は 4 KB の紙テープなので、まず 4 KB 以上のメモリを搭載してください。1975 年なら 28 バイトのブートローダーをスイッチで手入力し、それからテープが読み終わるまで七分間待つことになります。',
        'ko': '4K BASIC은 4 KB짜리 종이 테이프이므로 먼저 4 KB 이상의 메모리를 설치하세요. 1975년이라면 28바이트짜리 부트로더를 스위치로 직접 입력한 뒤, 테이프가 읽히는 7분을 기다렸을 것입니다.',
    },

    'rom-needs-memory': {
        'en': '4K BASIC needs at least 4 KB installed. Choose 4 KB or 8 KB under Installed Memory.',
        'es': 'BASIC 4K necesita al menos 4 KB instalados. Elige 4 KB u 8 KB en Memoria instalada.',
        'fr': 'BASIC 4K exige au moins 4 Kio installés. Choisissez 4 Kio ou 8 Kio dans Mémoire installée.',
        'de': '4K BASIC braucht mindestens 4 KB. Wählen Sie 4 KB oder 8 KB unter Installierter Speicher.',
        'it': 'BASIC 4K richiede almeno 4 KB installati. Scegli 4 KB o 8 KB in Memoria installata.',
        'zh': '4K BASIC 至少需要 4 KB 内存。请在“已安装的内存”中选择 4 KB 或 8 KB。',
        'zh-TW': '4K BASIC 至少需要 4 KB 記憶體。請在「已安裝的記憶體」中選擇 4 KB 或 8 KB。',
        'ja': '4K BASIC には少なくとも 4 KB が必要です。「搭載メモリ」で 4 KB か 8 KB を選んでください。',
        'ko': '4K BASIC에는 최소 4 KB가 필요합니다. "설치된 메모리"에서 4 KB 또는 8 KB를 선택하세요.',
    },

    'rom-loaded': {
        'en': 'Loaded {bytes} bytes at 0000H and pressed RESET. Go to the Simulator tab, click RUN, then watch the Teletype tab.',
        'es': 'Cargados {bytes} bytes en 0000H y pulsado RESET. Ve a la pestaña Simulador, pulsa RUN y mira la pestaña Teletipo.',
        'fr': '{bytes} octets chargés en 0000H et RESET appuyé. Allez dans l\'onglet Simulateur, cliquez sur RUN, puis regardez l\'onglet Téléscripteur.',
        'de': '{bytes} Bytes bei 0000H geladen und RESET gedrückt. Gehen Sie zum Simulator-Tab, klicken Sie RUN und sehen Sie dann im Fernschreiber-Tab nach.',
        'it': 'Caricati {bytes} byte a 0000H e premuto RESET. Vai alla scheda Simulatore, premi RUN e poi guarda la scheda Telescrivente.',
        'zh': '已在 0000H 载入 {bytes} 字节并按下 RESET。请到“模拟器”标签页点击 RUN，然后查看“电传打字机”标签页。',
        'zh-TW': '已在 0000H 載入 {bytes} 位元組並按下 RESET。請到「模擬器」標籤頁點擊 RUN，然後查看「電傳打字機」標籤頁。',
        'ja': '0000H に {bytes} バイトを読み込み、RESET を押しました。シミュレータタブで RUN を押し、テレタイプタブを見てください。',
        'ko': '0000H에 {bytes}바이트를 불러오고 RESET을 눌렀습니다. 시뮬레이터 탭에서 RUN을 누른 뒤 텔레타이프 탭을 보세요.',
    },

    'rom-file-loaded': {
        'en': 'Loaded {bytes} bytes of {name} at 0000H and pressed RESET.',
        'es': 'Cargados {bytes} bytes de {name} en 0000H y pulsado RESET.',
        'fr': '{bytes} octets de {name} chargés en 0000H et RESET appuyé.',
        'de': '{bytes} Bytes aus {name} bei 0000H geladen und RESET gedrückt.',
        'it': 'Caricati {bytes} byte di {name} a 0000H e premuto RESET.',
        'zh': '已从 {name} 在 0000H 载入 {bytes} 字节并按下 RESET。',
        'zh-TW': '已從 {name} 在 0000H 載入 {bytes} 位元組並按下 RESET。',
        'ja': '{name} から 0000H に {bytes} バイトを読み込み、RESET を押しました。',
        'ko': '{name}에서 0000H에 {bytes}바이트를 불러오고 RESET을 눌렀습니다.',
    },

    'rom-file-too-big': {
        'en': '{name} is {bytes} bytes. The 8080 can only address 64 KB, so that is not a memory image - nothing was loaded.',
        'es': '{name} ocupa {bytes} bytes. El 8080 solo puede direccionar 64 KB, así que eso no es una imagen de memoria: no se cargó nada.',
        'fr': '{name} fait {bytes} octets. Le 8080 ne peut adresser que 64 Kio, ce n’est donc pas une image mémoire - rien n’a été chargé.',
        'de': '{name} ist {bytes} Bytes groß. Der 8080 kann nur 64 KB adressieren, das ist also kein Speicherabbild - es wurde nichts geladen.',
        'it': '{name} è di {bytes} byte. L’8080 può indirizzare solo 64 KB, quindi non è un’immagine di memoria: non è stato caricato nulla.',
        'zh': '{name} 有 {bytes} 字节。8080 最多只能寻址 64 KB，所以这不是一个内存映像——什么都没有加载。',
        'zh-TW': '{name} 有 {bytes} 位元組。8080 最多只能定址 64 KB，所以這不是一個記憶體映像——什麼都沒有載入。',
        'ja': '{name} は {bytes} バイトあります。8080 は 64 KB までしかアドレスできないので、これはメモリイメージではありません。何も読み込みませんでした。',
        'ko': '{name}은(는) {bytes}바이트입니다. 8080은 64 KB까지만 주소를 지정할 수 있으므로 이것은 메모리 이미지가 아닙니다. 아무것도 불러오지 않았습니다.',
    },

    'rom-file-truncated': {
        'en': 'Loaded the first {bytes} bytes of {name} at 0000H and pressed RESET. The file is {size} bytes; the rest does not fit in the memory installed.',
        'es': 'Se cargaron los primeros {bytes} bytes de {name} en 0000H y se pulsó RESET. El archivo tiene {size} bytes; el resto no cabe en la memoria instalada.',
        'fr': 'Les {bytes} premiers octets de {name} ont été chargés en 0000H et RESET appuyé. Le fichier fait {size} octets ; le reste ne tient pas dans la mémoire installée.',
        'de': 'Die ersten {bytes} Bytes von {name} wurden bei 0000H geladen und RESET gedrückt. Die Datei hat {size} Bytes; der Rest passt nicht in den installierten Speicher.',
        'it': 'Caricati i primi {bytes} byte di {name} a 0000H e premuto RESET. Il file è di {size} byte; il resto non entra nella memoria installata.',
        'zh': '已把 {name} 的前 {bytes} 字节载入 0000H 并按下 RESET。该文件共 {size} 字节，其余部分装不进已安装的内存。',
        'zh-TW': '已把 {name} 的前 {bytes} 位元組載入 0000H 並按下 RESET。該檔案共 {size} 位元組，其餘部分裝不進已安裝的記憶體。',
        'ja': '{name} の先頭 {bytes} バイトを 0000H に読み込み、RESET を押しました。ファイルは {size} バイトあり、残りは搭載メモリに入りません。',
        'ko': '{name}의 앞 {bytes}바이트를 0000H에 불러오고 RESET을 눌렀습니다. 파일은 {size}바이트이며, 나머지는 설치된 메모리에 들어가지 않습니다.',
    },

    'rom-file-unreadable': {
        'en': '{name} could not be read.',
        'es': 'No se pudo leer {name}.',
        'fr': 'Impossible de lire {name}.',
        'de': '{name} konnte nicht gelesen werden.',
        'it': 'Impossibile leggere {name}.',
        'zh': '无法读取 {name}。',
        'zh-TW': '無法讀取 {name}。',
        'ja': '{name} を読み込めませんでした。',
        'ko': '{name}을(를) 읽을 수 없습니다.',
    },

    'rom-missing': {
        'en': 'roms/4kbas32.bin could not be read. It is optional - see roms/NOTICE - so supply your own image with LOAD BINARY FILE.',
        'es': 'No se pudo leer roms/4kbas32.bin. Es opcional (consulta roms/NOTICE), así que carga tu propia imagen con CARGAR ARCHIVO BINARIO.',
        'fr': 'Impossible de lire roms/4kbas32.bin. Ce fichier est facultatif (voir roms/NOTICE) : fournissez votre propre image avec CHARGER UN FICHIER BINAIRE.',
        'de': 'roms/4kbas32.bin konnte nicht gelesen werden. Die Datei ist optional - siehe roms/NOTICE - laden Sie also mit BINÄRDATEI LADEN Ihr eigenes Abbild.',
        'it': 'Impossibile leggere roms/4kbas32.bin. È facoltativo (vedi roms/NOTICE), quindi carica una tua immagine con CARICA FILE BINARIO.',
        'zh': '无法读取 roms/4kbas32.bin。该文件是可选的（见 roms/NOTICE），请用“加载二进制文件”提供你自己的映像。',
        'zh-TW': '無法讀取 roms/4kbas32.bin。該檔案是選用的（見 roms/NOTICE），請用「載入二進位檔」提供你自己的映像。',
        'ja': 'roms/4kbas32.bin を読み込めませんでした。このファイルは任意です（roms/NOTICE を参照）。「バイナリファイルを読み込む」で自分のイメージを指定してください。',
        'ko': 'roms/4kbas32.bin을 읽을 수 없습니다. 이 파일은 선택 사항이며(roms/NOTICE 참고), "바이너리 파일 불러오기"로 직접 이미지를 지정하세요.',
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

    'debug-memory-title': {
        'en': 'Installed Memory',
        'es': 'Memoria instalada',
        'fr': 'Mémoire installée',
        'de': 'Installierter Speicher',
        'it': 'Memoria installata',
        'zh': '已安装的内存',
        'zh-TW': '已安裝的記憶體',
        'ja': '搭載メモリ',
        'ko': '설치된 메모리',
    },

    'debug-memory-comment': {
        'en': 'Memory came on boards, and you cannot add one to a running machine: changing this switches the Altair off. 256 B is the base machine, 4 KB adds an 88-4MCS board, 8 KB two of them.',
        'es': 'La memoria venía en placas, y no se puede añadir una a una máquina encendida: cambiar esto apaga el Altair. 256 B es la máquina básica, 4 KB añade una placa 88-4MCS, 8 KB dos de ellas.',
        'fr': 'La mémoire se présentait sous forme de cartes, et on ne peut pas en ajouter à une machine en marche : modifier ce réglage éteint l\'Altair. 256 o correspond à la machine de base, 4 Kio ajoutent une carte 88-4MCS, 8 Kio deux.',
        'de': 'Speicher kam auf Steckkarten, und eine davon lässt sich nicht im laufenden Betrieb einbauen: Diese Änderung schaltet den Altair aus. 256 B ist die Grundmaschine, 4 KB fügen eine 88-4MCS-Karte hinzu, 8 KB zwei davon.',
        'it': 'La memoria arrivava su schede, e non se ne può aggiungere una a macchina accesa: cambiare questa impostazione spegne l\'Altair. 256 B è la macchina base, 4 KB aggiungono una scheda 88-4MCS, 8 KB due.',
        'zh': '内存以扩展板的形式提供，而且不能给运行中的机器加装：修改这里会关闭 Altair。256 B 是基础机型，4 KB 相当于加装一块 88-4MCS 板，8 KB 则是两块。',
        'zh-TW': '記憶體以擴充卡的形式提供，而且無法為運行中的機器加裝：修改這裡會關閉 Altair。256 B 是基礎機型，4 KB 相當於加裝一塊 88-4MCS 卡，8 KB 則是兩塊。',
        'ja': 'メモリはボードで供給され、動作中のマシンには追加できません。ここを変更すると Altair の電源が切れます。256 B は基本構成、4 KB は 88-4MCS ボード 1 枚、8 KB は 2 枚に相当します。',
        'ko': '메모리는 보드 형태로 제공되었고, 켜져 있는 기계에는 추가할 수 없습니다. 이 설정을 바꾸면 Altair의 전원이 꺼집니다. 256 B는 기본 기계, 4 KB는 88-4MCS 보드 한 장, 8 KB는 두 장입니다.',
    },

    'mem-follow-pc': {
        'en': 'FOLLOW PC',
        'es': 'SEGUIR PC',
        'fr': 'SUIVRE PC',
        'de': 'PC FOLGEN',
        'it': 'SEGUI PC',
        'zh': '跟随 PC',
        'zh-TW': '跟隨 PC',
        'ja': 'PC を追う',
        'ko': 'PC 따라가기',
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

    'basic-title': {
        'en': 'Running Microsoft BASIC',
        'es': 'Ejecutar Microsoft BASIC',
        'fr': 'Lancer Microsoft BASIC',
        'de': 'Microsoft BASIC ausführen',
        'it': 'Eseguire Microsoft BASIC',
        'zh': '运行 Microsoft BASIC',
        'zh-TW': '執行 Microsoft BASIC',
        'ja': 'Microsoft BASIC を動かす',
        'ko': 'Microsoft BASIC 실행하기',
    },

    'basic-desc': {
        'en': 'The Altair\'s first piece of software, and Microsoft\'s: Altair BASIC 3.2, written in 1975 by Bill Gates, Paul Allen and Monte Davidoff. How to start it:',
        'es': 'El primer software del Altair, y el primero de Microsoft: Altair BASIC 3.2, escrito en 1975 por Bill Gates, Paul Allen y Monte Davidoff. Cómo arrancarlo:',
        'fr': 'Le premier logiciel de l\'Altair, et celui de Microsoft : Altair BASIC 3.2, écrit en 1975 par Bill Gates, Paul Allen et Monte Davidoff. Comment le lancer :',
        'de': 'Die erste Software für den Altair und die erste von Microsoft: Altair BASIC 3.2, 1975 geschrieben von Bill Gates, Paul Allen und Monte Davidoff. So starten Sie es:',
        'it': 'Il primo software dell’Altair, e il primo di Microsoft: Altair BASIC 3.2, scritto nel 1975 da Bill Gates, Paul Allen e Monte Davidoff. Come avviarlo:',
        'zh': 'Altair 的第一个软件，也是微软的第一个产品：Altair BASIC 3.2，1975 年由 Bill Gates、Paul Allen 和 Monte Davidoff 编写。启动方法：',
        'zh-TW': 'Altair 的第一個軟體，也是微軟的第一個產品：Altair BASIC 3.2，1975 年由 Bill Gates、Paul Allen 和 Monte Davidoff 編寫。啟動方法：',
        'ja': 'Altair 最初のソフトウェアであり、マイクロソフト最初の製品でもある Altair BASIC 3.2。1975 年に Bill Gates、Paul Allen、Monte Davidoff が書きました。起動のしかた：',
        'ko': 'Altair의 첫 소프트웨어이자 마이크로소프트의 첫 제품인 Altair BASIC 3.2. 1975년에 Bill Gates, Paul Allen, Monte Davidoff가 만들었습니다. 시작하는 방법:',
    },

    'basic-1': {
        'en': 'Go to the Debugger tab and choose 4 KB (or 8 KB, for room to write longer programs) under Installed Memory. Installing memory switches the machine off, which is what opening the case would have done.',
        'es': 'Ve a la pestaña Depurador y elige 4 KB (u 8 KB, para escribir programas más largos) en Memoria instalada. Instalar memoria apaga la máquina, que es lo que habría pasado al abrir la caja.',
        'fr': 'Allez dans l\'onglet Débogueur et choisissez 4 Kio (ou 8 Kio, pour écrire des programmes plus longs) sous Mémoire installée. Installer de la mémoire éteint la machine, comme le ferait l\'ouverture du boîtier.',
        'de': 'Gehen Sie zum Debugger-Tab und wählen Sie unter Installierter Speicher 4 KB (oder 8 KB für längere Programme). Speicher einzubauen schaltet die Maschine ab - genau wie das Öffnen des Gehäuses.',
        'it': 'Vai alla scheda Debugger e scegli 4 KB (o 8 KB, per programmi più lunghi) in Memoria installata. Installare memoria spegne la macchina, come sarebbe successo aprendo il contenitore.',
        'zh': '打开“调试器”标签页，在“已安装的内存”中选择 4 KB（想写长一点的程序就选 8 KB）。安装内存会关闭机器——当年打开机箱也是如此。',
        'zh-TW': '打開「除錯器」標籤頁，在「已安裝的記憶體」中選擇 4 KB（想寫長一點的程式就選 8 KB）。安裝記憶體會關閉機器——當年打開機殼也是如此。',
        'ja': 'デバッガタブを開き、「搭載メモリ」で 4 KB（長いプログラムを書くなら 8 KB）を選びます。メモリを増設すると電源が切れます。筐体を開けるのですから当然です。',
        'ko': '디버거 탭에서 "설치된 메모리"의 4 KB(더 긴 프로그램을 쓰려면 8 KB)를 고르세요. 메모리를 설치하면 기계가 꺼집니다. 케이스를 여는 일이니까요.',
    },

    'basic-2': {
        'en': 'Click LOAD 4K BASIC. The machine powers up, the tape is read for you, and RESET is pressed.',
        'es': 'Pulsa CARGAR BASIC 4K. La máquina se enciende, la cinta se lee por ti y se pulsa RESET.',
        'fr': 'Cliquez sur CHARGER BASIC 4K. La machine s\'allume, la bande est lue pour vous et RESET est appuyé.',
        'de': 'Klicken Sie 4K BASIC LADEN. Die Maschine geht an, das Band wird für Sie eingelesen und RESET gedrückt.',
        'it': 'Premi CARICA BASIC 4K. La macchina si accende, il nastro viene letto per te e viene premuto RESET.',
        'zh': '点击“加载 4K BASIC”。机器会开机，纸带会替你读入，并按下 RESET。',
        'zh-TW': '點擊「載入 4K BASIC」。機器會開機，紙帶會替你讀入，並按下 RESET。',
        'ja': '「4K BASIC を読み込む」を押します。電源が入り、テープが代わりに読み込まれ、RESET が押されます。',
        'ko': '"4K BASIC 불러오기"를 누르세요. 전원이 켜지고, 테이프가 대신 읽히고, RESET이 눌립니다.',
    },

    'basic-3': {
        'en': 'Before going any further, look at the memory map above the dump. Fifteen of the sixteen pages of a 4 KB machine are full: that is BASIC, and the one page left over is all the room you have for a program. This is what "4K BASIC" means.',
        'es': 'Antes de seguir, mira el mapa de memoria sobre el volcado. Quince de las dieciséis páginas de una máquina de 4 KB están llenas: eso es BASIC, y la página que sobra es todo el espacio que tienes para un programa. Eso significa "BASIC 4K".',
        'fr': 'Avant d\'aller plus loin, regardez la carte mémoire au-dessus du vidage. Quinze des seize pages d\'une machine de 4 Kio sont pleines : c\'est BASIC, et la page qui reste est toute la place dont vous disposez. Voilà ce que veut dire « BASIC 4K ».',
        'de': 'Sehen Sie sich zuerst die Speicherkarte über dem Abbild an. Fünfzehn der sechzehn Seiten einer 4-KB-Maschine sind voll: das ist BASIC, und die eine übrige Seite ist der ganze Platz für Ihr Programm. Genau das bedeutet "4K BASIC".',
        'it': 'Prima di proseguire, guarda la mappa di memoria sopra il dump. Quindici delle sedici pagine di una macchina da 4 KB sono piene: quello è BASIC, e l’unica pagina rimasta è tutto lo spazio per il tuo programma. Questo significa "BASIC 4K".',
        'zh': '先别急着往下走，看看内存转储上方的内存分布图。4 KB 机器的十六页中有十五页是满的：那就是 BASIC，剩下的一页就是你全部的程序空间。这就是“4K BASIC”的含义。',
        'zh-TW': '先別急著往下走，看看記憶體傾印上方的分佈圖。4 KB 機器的十六頁中有十五頁是滿的：那就是 BASIC，剩下的一頁就是你全部的程式空間。這就是「4K BASIC」的含義。',
        'ja': '先に進む前に、ダンプの上のメモリマップを見てください。4 KB マシンの十六ページのうち十五ページが埋まっています。それが BASIC で、残りの一ページがプログラムに使える全部です。これが「4K BASIC」の意味です。',
        'ko': '더 진행하기 전에 덤프 위의 메모리 맵을 보세요. 4 KB 기계의 열여섯 페이지 중 열다섯 페이지가 차 있습니다. 그것이 BASIC이고, 남은 한 페이지가 프로그램에 쓸 수 있는 전부입니다. 이것이 "4K BASIC"의 뜻입니다.',
    },

    'basic-4': {
        'en': 'The address switches A15-A8 tell BASIC which terminal board to use: all down is the 88-SIO at ports 00H and 01H, switch A11 up is the 88-2SIO at 10H and 11H. The teletype here is wired to both slots, so either setting works - a real Altair would have had only one of the two boards fitted, and the wrong setting left it silent.',
        'es': 'Los interruptores A15-A8 le dicen a BASIC qué placa de terminal usar: todos abajo es la 88-SIO en los puertos 00H y 01H, el interruptor A11 arriba es la 88-2SIO en 10H y 11H. Aquí el teletipo está conectado a ambas ranuras, así que cualquiera de las dos funciona; un Altair real solo llevaba una de las dos placas, y el ajuste equivocado lo dejaba mudo.',
        'fr': 'Les interrupteurs A15-A8 indiquent à BASIC quelle carte de terminal utiliser : tous en bas désigne la 88-SIO aux ports 00H et 01H, l\'interrupteur A11 en haut la 88-2SIO en 10H et 11H. Ici le téléscripteur est relié aux deux emplacements, donc les deux réglages fonctionnent ; un vrai Altair n\'avait qu\'une des deux cartes, et le mauvais réglage le laissait muet.',
        'de': 'Die Adressschalter A15-A8 sagen BASIC, welche Terminalkarte es benutzen soll: alle unten heißt die 88-SIO auf den Ports 00H und 01H, Schalter A11 oben die 88-2SIO auf 10H und 11H. Der Fernschreiber hängt hier an beiden Steckplätzen, also funktioniert jede Einstellung - ein echter Altair hatte nur eine der beiden Karten, und die falsche Einstellung ließ ihn stumm.',
        'it': 'Gli interruttori A15-A8 dicono a BASIC quale scheda terminale usare: tutti abbassati è la 88-SIO sulle porte 00H e 01H, l’interruttore A11 alzato è la 88-2SIO su 10H e 11H. Qui la telescrivente è collegata a entrambi gli slot, quindi funzionano entrambe le impostazioni; un Altair vero montava una sola delle due schede, e l’impostazione sbagliata lo lasciava muto.',
        'zh': '地址开关 A15-A8 告诉 BASIC 该用哪块终端板：全部向下是端口 00H 和 01H 上的 88-SIO，A11 向上则是 10H 和 11H 上的 88-2SIO。这里的电传打字机同时接在两个插槽上，所以两种设置都能用——真正的 Altair 只会装其中一块，设错了机器就哑了。',
        'zh-TW': '位址開關 A15-A8 告訴 BASIC 該用哪塊終端卡：全部向下是連接埠 00H 和 01H 上的 88-SIO，A11 向上則是 10H 和 11H 上的 88-2SIO。這裡的電傳打字機同時接在兩個插槽上，所以兩種設定都能用——真正的 Altair 只會裝其中一塊，設錯了機器就啞了。',
        'ja': 'アドレススイッチ A15-A8 は、BASIC がどの端末ボードを使うかを決めます。すべて下ならポート 00H と 01H の 88-SIO、A11 を上げれば 10H と 11H の 88-2SIO です。ここではテレタイプが両方のスロットにつながっているのでどちらの設定でも動きますが、本物の Altair はどちらか一方しか挿さっておらず、設定を間違えると黙り込みました。',
        'ko': '주소 스위치 A15-A8은 BASIC이 어느 터미널 보드를 쓸지 정합니다. 모두 내리면 포트 00H와 01H의 88-SIO, A11을 올리면 10H와 11H의 88-2SIO입니다. 여기서는 텔레타이프가 두 슬롯 모두에 연결되어 있어 어느 쪽으로 설정해도 동작하지만, 실제 Altair에는 둘 중 하나만 꽂혀 있어 설정을 잘못하면 아무 반응이 없었습니다.',
    },

    'basic-5': {
        'en': 'Go to the Simulator tab and click RUN.',
        'es': 'Ve a la pestaña Simulador y pulsa RUN.',
        'fr': 'Allez dans l\'onglet Simulateur et cliquez sur RUN.',
        'de': 'Gehen Sie zum Simulator-Tab und klicken Sie RUN.',
        'it': 'Vai alla scheda Simulatore e premi RUN.',
        'zh': '回到“模拟器”标签页，点击 RUN。',
        'zh-TW': '回到「模擬器」標籤頁，點擊 RUN。',
        'ja': 'シミュレータタブに戻って RUN を押します。',
        'ko': '시뮬레이터 탭으로 가서 RUN을 누르세요.',
    },

    'basic-6': {
        'en': 'Go to the Teletype tab. BASIC asks MEMORY SIZE? - press Enter to take everything it found. Press Enter again for TERMINAL WIDTH?, then Y for WANT SIN? to keep the maths functions.',
        'es': 'Ve a la pestaña Teletipo. BASIC pregunta MEMORY SIZE?: pulsa Intro para usar toda la que ha encontrado. Pulsa Intro otra vez en TERMINAL WIDTH? y luego Y en WANT SIN? para conservar las funciones matemáticas.',
        'fr': 'Allez dans l\'onglet Téléscripteur. BASIC demande MEMORY SIZE? : appuyez sur Entrée pour tout prendre. Entrée à nouveau pour TERMINAL WIDTH?, puis Y pour WANT SIN? afin de garder les fonctions mathématiques.',
        'de': 'Gehen Sie zum Fernschreiber-Tab. BASIC fragt MEMORY SIZE? - Enter nimmt alles, was es gefunden hat. Noch einmal Enter bei TERMINAL WIDTH?, dann Y bei WANT SIN?, um die Mathematikfunktionen zu behalten.',
        'it': 'Vai alla scheda Telescrivente. BASIC chiede MEMORY SIZE?: premi Invio per prendere tutta quella trovata. Invio di nuovo per TERMINAL WIDTH?, poi Y per WANT SIN? per tenere le funzioni matematiche.',
        'zh': '切到“电传打字机”标签页。BASIC 会问 MEMORY SIZE?——直接按回车表示全部使用。TERMINAL WIDTH? 再按一次回车，WANT SIN? 输入 Y 以保留数学函数。',
        'zh-TW': '切到「電傳打字機」標籤頁。BASIC 會問 MEMORY SIZE?——直接按 Enter 表示全部使用。TERMINAL WIDTH? 再按一次 Enter，WANT SIN? 輸入 Y 以保留數學函式。',
        'ja': 'テレタイプタブを開きます。BASIC が MEMORY SIZE? と聞くので、Enter で見つかった分を全部使います。TERMINAL WIDTH? でもう一度 Enter、WANT SIN? では Y と答えて数学関数を残します。',
        'ko': '텔레타이프 탭으로 가세요. BASIC이 MEMORY SIZE?라고 물으면 Enter를 눌러 찾은 메모리를 모두 씁니다. TERMINAL WIDTH?에서 다시 Enter, WANT SIN?에서 Y를 눌러 수학 함수를 남깁니다.',
    },

    'basic-7': {
        'en': 'It prints how many bytes are free, then OK. Try PRINT 22/7 for an answer straight away. To enter a program, type these lines one at a time, pressing Enter after each:',
        'es': 'Imprime cuántos bytes quedan libres y luego OK. Prueba PRINT 22/7 para obtener una respuesta al instante. Para escribir un programa, teclea estas líneas de una en una, pulsando Intro después de cada una:',
        'fr': 'Il affiche le nombre d’octets libres, puis OK. Essayez PRINT 22/7 pour une réponse immédiate. Pour saisir un programme, tapez ces lignes une par une, en appuyant sur Entrée après chacune :',
        'de': 'Es zeigt die freien Bytes und dann OK. Für eine sofortige Antwort probieren Sie PRINT 22/7. Um ein Programm einzugeben, tippen Sie diese Zeilen einzeln und drücken nach jeder Enter:',
        'it': 'Stampa quanti byte sono liberi, poi OK. Prova PRINT 22/7 per una risposta immediata. Per scrivere un programma, digita queste righe una alla volta, premendo Invio dopo ciascuna:',
        'zh': '它会打印剩余字节数，然后显示 OK。输入 PRINT 22/7 可以立刻得到答案。要输入程序，请逐行键入下面几行，每行按一次回车：',
        'zh-TW': '它會印出剩餘位元組數，然後顯示 OK。輸入 PRINT 22/7 可以立刻得到答案。要輸入程式，請逐行鍵入下面幾行，每行按一次 Enter：',
        'ja': '空きバイト数を表示してから OK が出ます。PRINT 22/7 と打てばすぐ答えが返ります。プログラムを入れるときは、次の行を一行ずつ、それぞれの後で Enter を押しながら打ってください。',
        'ko': '남은 바이트 수를 찍은 뒤 OK가 나옵니다. PRINT 22/7을 치면 곧바로 답이 나옵니다. 프로그램을 입력하려면 아래 줄을 한 줄씩, 각 줄마다 Enter를 누르며 입력하세요:',
    },

    'basic-8': {
        'en': 'The keyboard is upper case only. Underscore rubs out the last character, at-sign throws away the line, and Ctrl-C stops a running program.',
        'es': 'El teclado es solo mayúsculas. El guion bajo borra el último carácter, la arroba descarta la línea y Ctrl-C detiene un programa en marcha.',
        'fr': 'Le clavier est en majuscules uniquement. Le tiret bas efface le dernier caractère, l\'arobase annule la ligne, et Ctrl-C arrête un programme en cours.',
        'de': 'Die Tastatur kennt nur Großbuchstaben. Unterstrich löscht das letzte Zeichen, das At-Zeichen verwirft die Zeile, und Strg-C hält ein laufendes Programm an.',
        'it': 'La tastiera è solo maiuscola. Il trattino basso cancella l’ultimo carattere, la chiocciola scarta la riga e Ctrl-C ferma un programma in esecuzione.',
        'zh': '键盘只有大写。下划线删除上一个字符，@ 放弃整行，Ctrl-C 中断正在运行的程序。',
        'zh-TW': '鍵盤只有大寫。底線刪除上一個字元，@ 放棄整行，Ctrl-C 中斷正在執行的程式。',
        'ja': 'キーボードは大文字だけです。アンダースコアで直前の一文字を消し、アットマークで行を捨て、Ctrl-C で実行中のプログラムを止めます。',
        'ko': '키보드는 대문자뿐입니다. 밑줄은 마지막 글자를 지우고, @는 줄 전체를 버리고, Ctrl-C는 실행 중인 프로그램을 멈춥니다.',
    },

    'basic-note': {
        'en': 'What the LOAD button skips: on a real Altair you first toggled a 28 byte boot loader in through the front panel, one byte at a time, then started the paper tape reader and waited about seven minutes while BASIC clattered in. Get one switch wrong and you did it again.',
        'es': 'Lo que se salta el botón CARGAR: en un Altair real primero introducías con los interruptores un cargador de 28 bytes, byte a byte, luego arrancabas el lector de cinta y esperabas unos siete minutos mientras BASIC entraba traqueteando. Un interruptor mal puesto y vuelta a empezar.',
        'fr': 'Ce que le bouton CHARGER escamote : sur un vrai Altair, vous saisissiez d\'abord un chargeur de 28 octets aux interrupteurs, octet par octet, puis vous lanciez le lecteur de bande et attendiez sept minutes pendant que BASIC entrait en cliquetant. Un seul interrupteur de travers et on recommençait.',
        'de': 'Was der LADEN-Knopf überspringt: an einem echten Altair gaben Sie zuerst einen 28 Byte langen Urlader über die Kippschalter ein, Byte für Byte, starteten dann den Lochstreifenleser und warteten etwa sieben Minuten, während BASIC hereinratterte. Ein falscher Schalter, und Sie fingen von vorn an.',
        'it': 'Quello che il pulsante CARICA salta: su un Altair vero inserivi prima con gli interruttori un boot loader di 28 byte, un byte alla volta, poi avviavi il lettore di nastro e aspettavi circa sette minuti mentre BASIC entrava sferragliando. Un interruttore sbagliato e si ricominciava.',
        'zh': '“加载”按钮替你省掉的事：在真正的 Altair 上，你得先用前面板开关一个字节一个字节地输入 28 字节的引导程序，然后启动纸带阅读机，听着 BASIC 哗啦啦读上大约七分钟。有一个开关拨错，就得从头再来。',
        'zh-TW': '「載入」按鈕替你省掉的事：在真正的 Altair 上，你得先用前面板開關一個位元組一個位元組地輸入 28 位元組的載入程式，然後啟動紙帶閱讀機，聽著 BASIC 嘩啦啦讀上大約七分鐘。有一個開關撥錯，就得從頭再來。',
        'ja': '「読み込む」ボタンが省いていること。本物の Altair では、まず 28 バイトのブートローダーをフロントパネルのスイッチで一バイトずつ入力し、それから紙テープリーダーを回して、BASIC がガチャガチャと入ってくるのを七分ほど待ちました。スイッチを一つ間違えれば、最初からやり直しです。',
        'ko': 'LOAD 버튼이 건너뛴 것: 진짜 Altair에서는 먼저 28바이트짜리 부트로더를 앞판 스위치로 한 바이트씩 입력하고, 종이 테이프 리더를 돌린 뒤, BASIC이 달그락거리며 들어오는 7분을 기다렸습니다. 스위치 하나만 틀려도 처음부터 다시였습니다.',
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

    'ref-altair-basic': {
        'en': 'Wikipedia: Altair BASIC - what it is, and how Microsoft started with it',
        'es': 'Wikipedia: Altair BASIC - qué es y cómo Microsoft empezó con él',
        'fr': 'Wikipédia : Altair BASIC - ce que c’est, et comment Microsoft a commencé avec',
        'de': 'Wikipedia: Altair BASIC - was es ist und wie Microsoft damit anfing',
        'it': 'Wikipedia: Altair BASIC - che cos’è e come Microsoft è nata con esso',
        'zh': '维基百科：Altair BASIC——它是什么，以及微软如何由此起家',
        'zh-TW': '維基百科：Altair BASIC——它是什麼，以及微軟如何由此起家',
        'ja': 'Wikipedia: Altair BASIC — それが何か、そしてマイクロソフトがこれで始まった話',
        'ko': '위키백과: Altair BASIC — 무엇인지, 그리고 마이크로소프트가 여기서 시작한 이야기',
    },

    'ref-basic-manual': {
        'en': 'MITS Altair BASIC Reference Manual (1975) - the language itself: a tutorial, every statement and function, the startup questions in Appendix B, and the error codes in Appendix C',
        'es': 'Manual de referencia de MITS Altair BASIC (1975) - el lenguaje en sí: un tutorial, cada sentencia y función, las preguntas de arranque en el Apéndice B y los códigos de error en el Apéndice C',
        'fr': 'Manuel de référence MITS Altair BASIC (1975) - le langage lui-même : un tutoriel, chaque instruction et fonction, les questions de démarrage en Annexe B et les codes d’erreur en Annexe C',
        'de': 'MITS Altair BASIC Reference Manual (1975) - die Sprache selbst: eine Einführung, jede Anweisung und Funktion, die Startfragen in Anhang B und die Fehlercodes in Anhang C',
        'it': 'Manuale di riferimento MITS Altair BASIC (1975) - il linguaggio stesso: un tutorial, ogni istruzione e funzione, le domande di avvio nell’Appendice B e i codici di errore nell’Appendice C',
        'zh': 'MITS Altair BASIC 参考手册（1975）——语言本身：入门教程、全部语句与函数、附录 B 的启动提问，以及附录 C 的错误代码',
        'zh-TW': 'MITS Altair BASIC 參考手冊（1975）——語言本身：入門教學、全部語句與函式、附錄 B 的啟動提問，以及附錄 C 的錯誤代碼',
        'ja': 'MITS Altair BASIC リファレンスマニュアル（1975）— 言語そのもの。入門、全ステートメントと関数、付録 B の起動時の質問、付録 C のエラーコード',
        'ko': 'MITS Altair BASIC 참조 매뉴얼(1975) — 언어 자체: 입문, 모든 문과 함수, 부록 B의 시작 질문, 부록 C의 오류 코드',
    },

    'ref-basic-disassembly': {
        'en': 'Altair BASIC 3.2 (4K) - an annotated disassembly of the exact program this simulator runs',
        'es': 'Altair BASIC 3.2 (4K) - un desensamblado comentado del programa exacto que ejecuta este simulador',
        'fr': 'Altair BASIC 3.2 (4K) - un désassemblage commenté du programme exact que ce simulateur exécute',
        'de': 'Altair BASIC 3.2 (4K) - ein kommentiertes Disassembly genau des Programms, das dieser Simulator ausführt',
        'it': 'Altair BASIC 3.2 (4K) - un disassemblato commentato esattamente del programma che questo simulatore esegue',
        'zh': 'Altair BASIC 3.2（4K）——本模拟器所运行的那个程序的带注释反汇编',
        'zh-TW': 'Altair BASIC 3.2（4K）——本模擬器所執行的那個程式的帶註解反組譯',
        'ja': 'Altair BASIC 3.2（4K）— このシミュレータが動かしているまさにそのプログラムの注釈付き逆アセンブル',
        'ko': 'Altair BASIC 3.2 (4K) — 이 시뮬레이터가 실행하는 바로 그 프로그램의 주석 달린 역어셈블',
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
 * Called after every locale change, for text the page sets at runtime
 * and so cannot be reached through an element id.
 * @type {?function()}
 */
l10n.onUpdate = null;

/**
 * Looks up one message in the current locale.
 * @param {string} id The message id.
 * @return {string} The message, falling back to English, then to ''.
 */
l10n.getMessage = function(id) {
    const entry = l10n.MESSAGES[id];
    if (!entry) {
        return '';
    }
    const locale = l10n.LOCALES[l10n.current];
    return entry.hasOwnProperty(locale) ? entry[locale] : entry['en'];
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
            elems[i].innerHTML = l10n.getMessage(elems[i].id);
        }
    }

    if (l10n.onUpdate) {
        l10n.onUpdate();
    }
};
