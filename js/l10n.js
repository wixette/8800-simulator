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
    'pt-BR',
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
    'pt-BR': 'Português',
    'zh': '简体中文',
    'zh-TW': '繁體中文',
    'ja': '日本語',
    'ko': '한국어',
};

/**
 * What the language button shows for each locale: short, since the
 * button sits in the toolbar beside an icon that already says
 * "language". The menu itself lists the full names.
 * @type {Object}
 */
l10n.LOCALE_SHORT = {
    'en': 'EN',
    'es': 'ES',
    'fr': 'FR',
    'de': 'DE',
    'it': 'IT',
    'pt-BR': 'PT',
    'zh': '简',
    'zh-TW': '繁',
    'ja': '日',
    'ko': '한',
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
        'pt-BR': 'Sim-8800: simulador do Altair 8800',
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
        'pt-BR': 'Simulador do Altair 8800',
        'zh': 'Altair 8800 模拟器',
        'zh-TW': 'Altair 8800 模擬器',
        'ja': 'Altair 8800 シミュレーター',
        'ko': 'Altair 8800 시뮬레이터',
    },

    'load-menu': {
        'en': 'Load',
        'es': 'Cargar',
        'fr': 'Charger',
        'de': 'Laden',
        'it': 'Carica',
        'pt-BR': 'Carregar',
        'zh': '加载',
        'zh-TW': '載入',
        'ja': '読み込み',
        'ko': '불러오기',
    },

    'memory-menu': {
        'en': 'Memory:',
        'es': 'Memoria:',
        'fr': 'Mémoire :',
        'de': 'Speicher:',
        'it': 'Memoria:',
        'pt-BR': 'Memória:',
        'zh': '内存：',
        'zh-TW': '記憶體：',
        'ja': 'メモリ：',
        'ko': '메모리:',
    },

    'splitter-label': {
        'en': 'Drag to share the height between the panel and the tools',
        'es': 'Arrastra para repartir la altura entre el panel y las herramientas',
        'fr': 'Faites glisser pour partager la hauteur entre le panneau et les outils',
        'de': 'Ziehen, um die Höhe zwischen Frontplatte und Werkzeugen aufzuteilen',
        'it': 'Trascina per dividere l’altezza tra il pannello e gli strumenti',
        'pt-BR': 'Arraste para dividir a altura entre o painel e as ferramentas',
        'zh': '拖动以分配面板和工具的高度',
        'zh-TW': '拖曳以分配面板和工具的高度',
        'ja': 'ドラッグしてパネルとツールの高さを配分',
        'ko': '드래그해 패널과 도구의 높이를 나누세요',
    },

    'dock-hide': {
        'en': 'Fold the tools away',
        'es': 'Recoger las herramientas',
        'fr': 'Replier les outils',
        'de': 'Werkzeuge einklappen',
        'it': 'Ripiega gli strumenti',
        'pt-BR': 'Recolher as ferramentas',
        'zh': '收起工具',
        'zh-TW': '收起工具',
        'ja': 'ツールをたたむ',
        'ko': '도구 접기',
    },

    'dock-show': {
        'en': 'Open the tools',
        'es': 'Abrir las herramientas',
        'fr': 'Ouvrir les outils',
        'de': 'Werkzeuge öffnen',
        'it': 'Apri gli strumenti',
        'pt-BR': 'Abrir as ferramentas',
        'zh': '展开工具',
        'zh-TW': '展開工具',
        'ja': 'ツールを開く',
        'ko': '도구 열기',
    },

    'share-menu': {
        'en': 'Share',
        'es': 'Compartir',
        'fr': 'Partager',
        'de': 'Teilen',
        'it': 'Condividi',
        'pt-BR': 'Compartilhar',
        'zh': '分享',
        'zh-TW': '分享',
        'ja': '共有',
        'ko': '공유',
    },

    'load-hex': {
        'en': 'Hex Bytes…',
        'es': 'Bytes en hex…',
        'fr': 'Octets en hexa…',
        'de': 'Hex-Bytes…',
        'it': 'Byte in esadecimale…',
        'pt-BR': 'Bytes em Hex…',
        'zh': '十六进制字节…',
        'zh-TW': '十六進位位元組…',
        'ja': '16 進数のバイト…',
        'ko': '16진수 바이트…',
    },

    'load-file': {
        'en': 'Binary File…',
        'es': 'Archivo binario…',
        'fr': 'Fichier binaire…',
        'de': 'Binärdatei…',
        'it': 'File binario…',
        'pt-BR': 'Arquivo Binário…',
        'zh': '二进制文件…',
        'zh-TW': '二進位檔案…',
        'ja': 'バイナリファイル…',
        'ko': '바이너리 파일…',
    },

    'basic-needs-memory': {
        'en': 'needs 4 KB',
        'es': 'necesita 4 KB',
        'fr': 'exige 4 Kio',
        'de': 'braucht 4 KB',
        'it': 'richiede 4 KB',
        'pt-BR': 'requer 4 KB',
        'zh': '需要 4 KB',
        'zh-TW': '需要 4 KB',
        'ja': '4 KB が必要',
        'ko': '4 KB 필요',
    },

    'needs-server-short': {
        'en': 'needs a web server',
        'es': 'necesita un servidor web',
        'fr': 'exige un serveur web',
        'de': 'braucht einen Webserver',
        'it': 'richiede un server web',
        'pt-BR': 'requer um servidor web',
        'zh': '需要 Web 服务器',
        'zh-TW': '需要 Web 伺服器',
        'ja': 'Web サーバーが必要',
        'ko': '웹 서버 필요',
    },

    'examples-unreadable-short': {
        'en': 'could not be read',
        'es': 'no se pudieron leer',
        'fr': 'illisibles',
        'de': 'nicht lesbar',
        'it': 'non leggibili',
        'pt-BR': 'não foi possível ler',
        'zh': '无法读取',
        'zh-TW': '無法讀取',
        'ja': '読み込めません',
        'ko': '읽을 수 없음',
    },

    'examples-heading': {
        'en': 'Examples',
        'es': 'Ejemplos',
        'fr': 'Exemples',
        'de': 'Beispiele',
        'it': 'Esempi',
        'pt-BR': 'Exemplos',
        'zh': '示例',
        'zh-TW': '範例',
        'ja': 'サンプル',
        'ko': '예제',
    },

    'examples-still-loading': {
        'en': 'The example programs are still being read. Try again in a moment.',
        'es': 'Todavía se están leyendo los programas de ejemplo. Inténtalo de nuevo en un momento.',
        'fr': 'Les programmes d’exemple sont encore en cours de lecture. Réessayez dans un instant.',
        'de': 'Die Beispielprogramme werden noch gelesen. Versuchen Sie es gleich noch einmal.',
        'it': 'I programmi di esempio sono ancora in lettura. Riprova tra un momento.',
        'pt-BR': 'Os programas de exemplo ainda estão sendo lidos. Tente de novo em instantes.',
        'zh': '示例程序还在读取中，请稍后再试。',
        'zh-TW': '範例程式還在讀取中，請稍後再試。',
        'ja': 'サンプルプログラムをまだ読み込んでいます。少し待ってからもう一度どうぞ。',
        'ko': '예제 프로그램을 아직 읽는 중입니다. 잠시 후 다시 시도하세요.',
    },

    'examples-loading': {
        'en': 'Loading…',
        'es': 'Cargando…',
        'fr': 'Chargement…',
        'de': 'Wird geladen…',
        'it': 'Caricamento…',
        'pt-BR': 'Carregando…',
        'zh': '正在加载…',
        'zh-TW': '正在載入…',
        'ja': '読み込み中…',
        'ko': '불러오는 중…',
    },

    'examples-heading-panel': {
        'en': 'Front Panel Examples',
        'es': 'Ejemplos del Panel Frontal',
        'fr': 'Exemples en Façade',
        'de': 'Beispiele für die Frontplatte',
        'it': 'Esempi sul Pannello Frontale',
        'pt-BR': 'Exemplos do Painel Frontal',
        'zh': '前面板示例',
        'zh-TW': '前面板範例',
        'ja': 'フロントパネルのサンプル',
        'ko': '앞판 예제',
    },

    'examples-heading-tty': {
        'en': 'Teletype Examples',
        'es': 'Ejemplos del Teletipo',
        'fr': 'Exemples au Téléscripteur',
        'de': 'Beispiele für den Fernschreiber',
        'it': 'Esempi sulla Telescrivente',
        'pt-BR': 'Exemplos do Teletipo',
        'zh': '电传打字机示例',
        'zh-TW': '電傳打字機範例',
        'ja': 'テレタイプのサンプル',
        'ko': '텔레타이프 예제',
    },

    'example-size': {
        'en': '{bytes} bytes',
        'es': '{bytes} bytes',
        'fr': '{bytes} octets',
        'de': '{bytes} Bytes',
        'it': '{bytes} byte',
        'pt-BR': '{bytes} bytes',
        'zh': '{bytes} 字节',
        'zh-TW': '{bytes} 位元組',
        'ja': '{bytes} バイト',
        'ko': '{bytes}바이트',
    },

    'language-menu': {
        'en': 'Language',
        'es': 'Idioma',
        'fr': 'Langue',
        'de': 'Sprache',
        'it': 'Lingua',
        'pt-BR': 'Idioma',
        'zh': '语言',
        'zh-TW': '語言',
        'ja': '言語',
        'ko': '언어',
    },

    'about-button': {
        'en': 'About',
        'es': 'Acerca de',
        'fr': 'À propos',
        'de': 'Über',
        'it': 'Informazioni',
        'pt-BR': 'Sobre',
        'zh': '关于',
        'zh-TW': '關於',
        'ja': 'このアプリについて',
        'ko': '정보',
    },

    'dialog-close': {
        'en': 'Close',
        'es': 'Cerrar',
        'fr': 'Fermer',
        'de': 'Schließen',
        'it': 'Chiudi',
        'pt-BR': 'Fechar',
        'zh': '关闭',
        'zh-TW': '關閉',
        'ja': '閉じる',
        'ko': '닫기',
    },

    'about-ok': {
        'en': 'Close',
        'es': 'Cerrar',
        'fr': 'Fermer',
        'de': 'Schließen',
        'it': 'Chiudi',
        'pt-BR': 'Fechar',
        'zh': '关闭',
        'zh-TW': '關閉',
        'ja': '閉じる',
        'ko': '닫기',
    },

    'hex-cancel': {
        'en': 'Cancel',
        'es': 'Cancelar',
        'fr': 'Annuler',
        'de': 'Abbrechen',
        'it': 'Annulla',
        'pt-BR': 'Cancelar',
        'zh': '取消',
        'zh-TW': '取消',
        'ja': 'キャンセル',
        'ko': '취소',
    },

    'hex-dialog-title': {
        'en': 'Load Hex Bytes',
        'es': 'Cargar Bytes en Hex',
        'fr': 'Charger des Octets en Hexa',
        'de': 'Hex-Bytes laden',
        'it': 'Carica Byte in Esadecimale',
        'pt-BR': 'Carregar Bytes em Hex',
        'zh': '加载十六进制字节',
        'zh-TW': '載入十六進位位元組',
        'ja': '16 進数のバイトを読み込む',
        'ko': '16진수 바이트 불러오기',
    },

    'hex-dialog-desc': {
        'en': 'Bytes in hex, put into memory from 0000H. Spaces, commas and line breaks may separate them.',
        'es': 'Bytes en hexadecimal, que se ponen en la memoria a partir de 0000H. Pueden ir separados por espacios, comas o saltos de línea.',
        'fr': 'Des octets en hexadécimal, placés en mémoire à partir de 0000H. Espaces, virgules et retours à la ligne peuvent les séparer.',
        'de': 'Bytes in Hex, ab 0000H in den Speicher gelegt. Leerzeichen, Kommas und Zeilenumbrüche dürfen sie trennen.',
        'it': 'Byte in esadecimale, messi in memoria a partire da 0000H. Possono essere separati da spazi, virgole e a capo.',
        'pt-BR': 'Bytes em hexadecimal, gravados na memória a partir de 0000H. Podem ser separados por espaços, vírgulas e quebras de linha.',
        'zh': '十六进制字节，从 0000H 起放入内存。字节之间可以用空格、逗号或换行分隔。',
        'zh-TW': '十六進位位元組，從 0000H 起放入記憶體。位元組之間可以用空格、逗號或換行分隔。',
        'ja': '16 進数のバイトを 0000H からメモリに置きます。空白、カンマ、改行で区切ってかまいません。',
        'ko': '16진수 바이트를 0000H부터 메모리에 넣습니다. 공백, 쉼표, 줄바꿈으로 구분해도 됩니다.',
    },

    'share-title': {
        'en': 'Share a Link',
        'es': 'Compartir un Enlace',
        'fr': 'Partager un Lien',
        'de': 'Einen Link teilen',
        'it': 'Condividi un Link',
        'pt-BR': 'Compartilhar um Link',
        'zh': '分享链接',
        'zh-TW': '分享連結',
        'ja': 'リンクを共有',
        'ko': '링크 공유',
    },

    'share-question': {
        'en': 'What should the link open?',
        'es': '¿Qué debe abrir el enlace?',
        'fr': 'Que doit ouvrir le lien ?',
        'de': 'Was soll der Link öffnen?',
        'it': 'Cosa deve aprire il link?',
        'pt-BR': 'O que o link deve abrir?',
        'zh': '链接要打开什么？',
        'zh-TW': '連結要開啟什麼？',
        'ja': 'リンクで何を開きますか？',
        'ko': '링크로 무엇을 열까요?',
    },

    'share-program-label': {
        'en': 'The program, at RESET',
        'es': 'El programa, tras RESET',
        'fr': 'Le programme, après RESET',
        'de': 'Das Programm, nach RESET',
        'it': 'Il programma, dopo RESET',
        'pt-BR': 'O programa, após RESET',
        'zh': '程序，按下 RESET 后',
        'zh-TW': '程式，按下 RESET 後',
        'ja': 'プログラム（RESET 直後）',
        'ko': '프로그램, RESET 직후',
    },

    'share-program-desc': {
        'en': 'Ready to RUN, as a fresh machine would be.',
        'es': 'Listo para RUN, como estaría una máquina recién encendida.',
        'fr': 'Prêt pour RUN, comme une machine fraîchement allumée.',
        'de': 'Bereit für RUN, wie eine frisch eingeschaltete Maschine.',
        'it': 'Pronto per RUN, come una macchina appena accesa.',
        'pt-BR': 'Pronto para RUN, como uma máquina recém-ligada.',
        'zh': '可直接按 RUN，就像刚开机的机器。',
        'zh-TW': '可直接按 RUN，就像剛開機的機器。',
        'ja': '電源を入れたばかりのマシンのように、すぐ RUN できます。',
        'ko': '막 켠 기계처럼 바로 RUN할 수 있습니다.',
    },

    'share-state-label': {
        'en': 'The machine as it is now',
        'es': 'La máquina tal como está ahora',
        'fr': 'La machine telle qu’elle est maintenant',
        'de': 'Die Maschine, wie sie jetzt ist',
        'it': 'La macchina com’è adesso',
        'pt-BR': 'A máquina como está agora',
        'zh': '机器现在的样子',
        'zh-TW': '機器現在的樣子',
        'ja': '今のままのマシン',
        'ko': '지금 상태 그대로의 기계',
    },

    'share-state-desc': {
        'en': 'Stopped at {pc}H, with its registers and switches.',
        'es': 'Detenida en {pc}H, con sus registros e interruptores.',
        'fr': 'Arrêtée en {pc}H, avec ses registres et ses interrupteurs.',
        'de': 'Angehalten bei {pc}H, mit ihren Registern und Schaltern.',
        'it': 'Ferma a {pc}H, con i suoi registri e interruttori.',
        'pt-BR': 'Parada em {pc}H, com seus registradores e chaves.',
        'zh': '停在 {pc}H，连同寄存器和开关。',
        'zh-TW': '停在 {pc}H，連同暫存器和開關。',
        'ja': '{pc}H で停止したまま、レジスタとスイッチも含めて。',
        'ko': '{pc}H에서 멈춘 채, 레지스터와 스위치도 함께.',
    },

    'link-copy-blocked': {
        'en': 'The browser would not copy the link, so it is selected in the box instead. Copy it from there.',
        'es': 'El navegador no quiso copiar el enlace, así que está seleccionado en el cuadro. Cópialo desde ahí.',
        'fr': 'Le navigateur n\'a pas voulu copier le lien, il est donc sélectionné dans la case. Copiez-le depuis là.',
        'de': 'Der Browser wollte den Link nicht kopieren, deshalb ist er im Feld markiert. Kopieren Sie ihn von dort.',
        'it': 'Il browser non ha voluto copiare il link, quindi è selezionato nella casella. Copialo da lì.',
        'pt-BR': 'O navegador não permitiu copiar o link, então ele foi selecionado na caixa. Copie-o de lá.',
        'zh': '浏览器不允许复制链接，所以已在框中选中它。请从那里复制。',
        'zh-TW': '瀏覽器不允許複製連結，所以已在框中選取它。請從那裡複製。',
        'ja': 'ブラウザーがリンクをコピーさせなかったので、欄の中で選択してあります。そこからコピーしてください。',
        'ko': '브라우저가 링크 복사를 허용하지 않아 상자에서 선택해 두었습니다. 거기서 복사하세요.',
    },

    'about-title': {
        'en': 'Altair 8800 Simulator',
        'es': 'Simulador de Altair 8800',
        'fr': 'Simulateur Altair 8800',
        'de': 'Altair-8800-Simulator',
        'it': 'Simulatore Altair 8800',
        'pt-BR': 'Simulador do Altair 8800',
        'zh': 'Altair 8800 模拟器',
        'zh-TW': 'Altair 8800 模擬器',
        'ja': 'Altair 8800 シミュレーター',
        'ko': 'Altair 8800 시뮬레이터',
    },

    'about-version': {
        'en': 'Version',
        'es': 'Versión',
        'fr': 'Version',
        'de': 'Version',
        'it': 'Versione',
        'pt-BR': 'Versão',
        'zh': '版本',
        'zh-TW': '版本',
        'ja': 'バージョン',
        'ko': '버전',
    },

    'about-desc': {
        'en': 'An Altair 8800 you can switch on in a web page: its front panel, a teletype running Microsoft\'s 4K BASIC, and a debugger the real one never had.',
        'es': 'Un Altair 8800 que puedes encender en una página web: su panel frontal, un teletipo con el 4K BASIC de Microsoft y un depurador que el auténtico nunca tuvo.',
        'fr': 'Un Altair 8800 qu\'on allume dans une page web : sa façade, un téléscripteur qui fait tourner le 4K BASIC de Microsoft, et un débogueur que le vrai n\'a jamais eu.',
        'de': 'Ein Altair 8800, den man in einer Webseite einschalten kann: seine Frontplatte, ein Fernschreiber mit Microsofts 4K BASIC und ein Debugger, den das Original nie hatte.',
        'it': 'Un Altair 8800 da accendere in una pagina web: il suo pannello frontale, una telescrivente con il 4K BASIC di Microsoft e un debugger che quello vero non ha mai avuto.',
        'pt-BR': 'Um Altair 8800 que você liga numa página web: o painel frontal, um teletipo rodando o 4K BASIC da Microsoft e um depurador que o original nunca teve.',
        'zh': '一台能在网页里开机的 Altair 8800：它的前面板、一台运行微软 4K BASIC 的电传打字机，以及真机从未有过的调试器。',
        'zh-TW': '一台能在網頁裡開機的 Altair 8800：它的前面板、一台執行微軟 4K BASIC 的電傳打字機，以及真機從未有過的除錯器。',
        'ja': 'Web ページの中で電源を入れられる Altair 8800。フロントパネル、Microsoft の 4K BASIC が動くテレタイプ、そして本物にはなかったデバッガーを備えています。',
        'ko': '웹 페이지에서 켤 수 있는 Altair 8800: 앞판, 마이크로소프트 4K BASIC이 돌아가는 텔레타이프, 그리고 진짜에는 없던 디버거.',
    },

    'about-source': {
        'en': 'Source code on GitHub',
        'es': 'Código fuente en GitHub',
        'fr': 'Code source sur GitHub',
        'de': 'Quellcode auf GitHub',
        'it': 'Codice sorgente su GitHub',
        'pt-BR': 'Código-fonte no GitHub',
        'zh': 'GitHub 上的源代码',
        'zh-TW': 'GitHub 上的原始碼',
        'ja': 'GitHub のソースコード',
        'ko': 'GitHub의 소스 코드',
    },

    'about-issues': {
        'en': 'Report a problem',
        'es': 'Informar de un problema',
        'fr': 'Signaler un problème',
        'de': 'Ein Problem melden',
        'it': 'Segnala un problema',
        'pt-BR': 'Relatar um problema',
        'zh': '报告问题',
        'zh-TW': '回報問題',
        'ja': '問題を報告',
        'ko': '문제 신고',
    },

    'about-contributors': {
        'en': 'Contributors',
        'es': 'Colaboradores',
        'fr': 'Contributeurs',
        'de': 'Mitwirkende',
        'it': 'Collaboratori',
        'pt-BR': 'Colaboradores',
        'zh': '贡献者',
        'zh-TW': '貢獻者',
        'ja': 'コントリビューター',
        'ko': '기여자',
    },

    'about-licences': {
        'en': 'Licences',
        'es': 'Licencias',
        'fr': 'Licences',
        'de': 'Lizenzen',
        'it': 'Licenze',
        'pt-BR': 'Licenças',
        'zh': '许可证',
        'zh-TW': '授權條款',
        'ja': 'ライセンス',
        'ko': '라이선스',
    },

    'about-license-app': {
        'en': 'The simulator:',
        'es': 'El simulador:',
        'fr': 'Le simulateur :',
        'de': 'Der Simulator:',
        'it': 'Il simulatore:',
        'pt-BR': 'O simulador:',
        'zh': '本模拟器：',
        'zh-TW': '本模擬器：',
        'ja': 'このシミュレーター：',
        'ko': '이 시뮬레이터:',
    },

    'about-license-rom': {
        'en': 'The 4K BASIC tape is Microsoft\'s, and not covered by that licence:',
        'es': 'La cinta de 4K BASIC es de Microsoft y esa licencia no la cubre:',
        'fr': 'La bande 4K BASIC appartient à Microsoft et cette licence ne la couvre pas :',
        'de': 'Das 4K-BASIC-Band gehört Microsoft und fällt nicht unter diese Lizenz:',
        'it': 'Il nastro di 4K BASIC è di Microsoft e quella licenza non lo copre:',
        'pt-BR': 'A fita do 4K BASIC é da Microsoft e não está coberta por essa licença:',
        'zh': '4K BASIC 纸带归微软所有，不在该许可证范围内：',
        'zh-TW': '4K BASIC 紙帶歸微軟所有，不在該授權範圍內：',
        'ja': '4K BASIC のテープは Microsoft のもので、このライセンスの対象外です：',
        'ko': '4K BASIC 테이프는 마이크로소프트의 것이며 이 라이선스가 적용되지 않습니다:',
    },

    'about-license-cpu': {
        'en': 'The 8080 CPU core is 8080js by Martin Maly, under a BSD licence:',
        'es': 'El núcleo de la CPU 8080 es 8080js, de Martin Maly, con licencia BSD:',
        'fr': 'Le cœur du processeur 8080 est 8080js, de Martin Maly, sous licence BSD :',
        'de': 'Der 8080-CPU-Kern ist 8080js von Martin Maly, unter einer BSD-Lizenz:',
        'it': 'Il nucleo della CPU 8080 è 8080js di Martin Maly, con licenza BSD:',
        'pt-BR': 'O núcleo da CPU 8080 é o 8080js, de Martin Maly, sob uma licença BSD:',
        'zh': '8080 CPU 内核是 Martin Maly 的 8080js，采用 BSD 许可证：',
        'zh-TW': '8080 CPU 核心是 Martin Maly 的 8080js，採用 BSD 授權：',
        'ja': '8080 CPU コアは Martin Maly による 8080js で、BSD ライセンスです：',
        'ko': '8080 CPU 코어는 Martin Maly의 8080js이며 BSD 라이선스입니다:',
    },

    'about-license-icons': {
        'en': 'The icons are Google\'s Material Icons:',
        'es': 'Los iconos son los Material Icons de Google:',
        'fr': 'Les icônes sont les Material Icons de Google :',
        'de': 'Die Symbole sind Googles Material Icons:',
        'it': 'Le icone sono i Material Icons di Google:',
        'pt-BR': 'Os ícones são os Material Icons do Google:',
        'zh': '图标来自 Google 的 Material Icons：',
        'zh-TW': '圖示來自 Google 的 Material Icons：',
        'ja': 'アイコンは Google の Material Icons です：',
        'ko': '아이콘은 Google의 Material Icons입니다:',
    },

    'about-references': {
        'en': 'References',
        'es': 'Referencias',
        'fr': 'Références',
        'de': 'Referenzen',
        'it': 'Riferimenti',
        'pt-BR': 'Referências',
        'zh': '参考资料',
        'zh-TW': '參考資料',
        'ja': '参考資料',
        'ko': '참고 자료',
    },

    'strip-hide': {
        'en': 'Fold the switches away',
        'es': 'Recoger los interruptores',
        'fr': 'Replier les interrupteurs',
        'de': 'Schalter einklappen',
        'it': 'Ripiega gli interruttori',
        'pt-BR': 'Recolher as chaves',
        'zh': '收起开关',
        'zh-TW': '收起開關',
        'ja': 'スイッチをたたむ',
        'ko': '스위치 접기',
    },

    'strip-show': {
        'en': 'Show the switches',
        'es': 'Mostrar los interruptores',
        'fr': 'Afficher les interrupteurs',
        'de': 'Schalter zeigen',
        'it': 'Mostra gli interruttori',
        'pt-BR': 'Mostrar as chaves',
        'zh': '显示开关',
        'zh-TW': '顯示開關',
        'ja': 'スイッチを表示',
        'ko': '스위치 보이기',
    },

    'nav-tty-name': {
        'en': 'Teletype',
        'es': 'Teletipo',
        'fr': 'Téléscripteur',
        'de': 'Fernschreiber',
        'it': 'Telescrivente',
        'pt-BR': 'Teletipo',
        'zh': '电传打字机',
        'zh-TW': '電傳打字機',
        'ja': 'テレタイプ',
        'ko': '텔레타이프',
    },

    'nav-asm-name': {
        'en': 'Assembler',
        'es': 'Ensamblador',
        'fr': 'Assembleur',
        'de': 'Assembler',
        'it': 'Assembler',
        'pt-BR': 'Montador',
        'zh': '汇编器',
        'zh-TW': '組譯器',
        'ja': 'アセンブラ',
        'ko': '어셈블러',
    },

    'tty-break': {
        'en': 'CTRL-C (BREAK)',
        'es': 'CTRL-C (INTERRUMPIR)',
        'fr': 'CTRL-C (INTERRUPTION)',
        'de': 'STRG-C (ABBRUCH)',
        'it': 'CTRL-C (INTERRUZIONE)',
        'pt-BR': 'CTRL-C (INTERROMPER)',
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
        'pt-BR': 'APAGAR (_)',
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
        'pt-BR': 'ANULAR LINHA (@)',
        'zh': '放弃整行（@）',
        'zh-TW': '放棄整行（@）',
        'ja': '行取り消し（@）',
        'ko': '줄 취소 (@)',
    },

    'tty-linefeed': {
        'en': 'LINE FEED',
        'es': 'AVANCE DE LÍNEA',
        'fr': 'SAUT DE LIGNE',
        'de': 'ZEILENVORSCHUB',
        'it': 'AVANZAMENTO RIGA',
        'pt-BR': 'AVANÇO DE LINHA',
        'zh': '进纸一行',
        'zh-TW': '進紙一行',
        'ja': '紙送り（改行）',
        'ko': '한 줄 이송',
    },

    'tty-clear': {
        'en': 'CLEAR PAPER',
        'es': 'PAPEL NUEVO',
        'fr': 'NOUVELLE FEUILLE',
        'de': 'PAPIER LEEREN',
        'it': 'NUOVO FOGLIO',
        'pt-BR': 'PAPEL NOVO',
        'zh': '换新纸',
        'zh-TW': '換新紙',
        'ja': '紙を取り替える',
        'ko': '새 용지',
    },

    'tty-hint': {
        'en': 'Nothing has printed yet. Run a program that reads the serial board - try Teletype echo from Load - then type here.',
        'es': 'Todavía no se ha impreso nada. Ejecuta un programa que lea la placa serie - prueba Teletype echo en Cargar - y escribe aquí.',
        'fr': 'Rien n\'a encore été imprimé. Lancez un programme qui lit la carte série - essayez Teletype echo dans Charger - puis tapez ici.',
        'de': 'Noch wurde nichts gedruckt. Starten Sie ein Programm, das die serielle Karte liest - etwa Teletype echo unter Laden - und tippen Sie dann hier.',
        'it': 'Non è ancora stato stampato nulla. Esegui un programma che legge la scheda seriale - prova Teletype echo da Carica - poi scrivi qui.',
        'pt-BR': 'Nada foi impresso ainda. Rode um programa que leia a placa serial - experimente Teletype echo, em Carregar - e digite aqui.',
        'zh': '还没有打印任何内容。先运行一个读取串口板的程序——试试“加载”里的 Teletype echo——然后在这里输入。',
        'zh-TW': '還沒有列印任何內容。先執行一個讀取串列埠板的程式——試試「載入」裡的 Teletype echo——然後在這裡輸入。',
        'ja': 'まだ何も印字されていません。シリアルボードを読むプログラムを動かしてから（「読み込み」の Teletype echo など）、ここで入力してください。',
        'ko': '아직 아무것도 인쇄되지 않았습니다. 직렬 보드를 읽는 프로그램을 실행한 뒤("불러오기"의 Teletype echo 등) 여기에 입력하세요.',
    },

    'nav-debug-name': {
        'en': 'Debugger',
        'es': 'Depurador',
        'fr': 'Débogueur',
        'de': 'Debugger',
        'it': 'Debugger',
        'pt-BR': 'Depurador',
        'zh': '调试器',
        'zh-TW': '除錯器',
        'ja': 'デバッガー',
        'ko': '디버거',
    },

    'nav-ref-name': {
        'en': 'Tutorial',
        'es': 'Tutorial',
        'fr': 'Tutoriel',
        'de': 'Anleitung',
        'it': 'Tutorial',
        'pt-BR': 'Tutorial',
        'zh': '使用手册',
        'zh-TW': '使用手冊',
        'ja': 'チュートリアル',
        'ko': '튜토리얼',
    },

    'nav-links-name': {
        'en': 'References',
        'es': 'Referencias',
        'fr': 'Références',
        'de': 'Referenzen',
        'it': 'Riferimenti',
        'pt-BR': 'Referências',
        'zh': '参考资料',
        'zh-TW': '參考資料',
        'ja': '参考資料',
        'ko': '참고 자료',
    },

    'source-code': {
        'en': 'Source Code',
        'es': 'Código Fuente',
        'fr': 'Code Source',
        'de': 'Quellcode',
        'it': 'Codice Sorgente',
        'pt-BR': 'Código-Fonte',
        'zh': '源代码',
        'zh-TW': '原始碼',
        'ja': 'ソースコード',
        'ko': '소스 코드',
    },

    'debug-load-data': {
        'en': 'Load Data',
        'es': 'Cargar datos',
        'fr': 'Charger les données',
        'de': 'Daten laden',
        'it': 'Carica dati',
        'pt-BR': 'Carregar Dados',
        'zh': '加载数据',
        'zh-TW': '載入資料',
        'ja': 'データを読み込む',
        'ko': '데이터 불러오기',
    },

    'status-off': {
        'en': 'The machine is off. Click OFF/ON on the front panel to switch it on.',
        'es': 'La máquina está apagada. Pulsa OFF/ON en el panel frontal para encenderla.',
        'fr': 'La machine est éteinte. Cliquez sur OFF/ON en façade pour l\'allumer.',
        'de': 'Die Maschine ist aus. Klicken Sie OFF/ON an der Frontplatte, um sie einzuschalten.',
        'it': 'La macchina è spenta. Premi OFF/ON sul pannello frontale per accenderla.',
        'pt-BR': 'A máquina está desligada. Clique em OFF/ON no painel frontal para ligá-la.',
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
        'pt-BR': 'A máquina está ligada e esperando. A memória começou cheia de bytes aleatórios, como na máquina real.',
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
        'pt-BR': 'Rodando.',
        'zh': '正在运行。',
        'zh-TW': '正在執行。',
        'ja': '実行中です。',
        'ko': '실행 중입니다.',
    },

    'status-halted': {
        'en': 'The program ran into a HLT and the machine stopped, with the WAIT lamp lit. RESET and RUN start it again.',
        'es': 'El programa llegó a un HLT y la máquina se detuvo, con la lámpara WAIT encendida. RESET y RUN la reinician.',
        'fr': 'Le programme a atteint un HLT et la machine s’est arrêtée, la lampe WAIT allumée. RESET puis RUN la relancent.',
        'de': 'Das Programm ist auf ein HLT gelaufen und die Maschine steht, die WAIT-Lampe leuchtet. RESET und RUN starten sie wieder.',
        'it': 'Il programma è arrivato a un HLT e la macchina si è fermata, con la spia WAIT accesa. RESET e RUN la riavviano.',
        'pt-BR': 'O programa chegou a um HLT e a máquina parou, com a lâmpada WAIT acesa. RESET e RUN a iniciam de novo.',
        'zh': '程序执行到 HLT，机器停下了，WAIT 灯亮起。按 RESET 再按 RUN 可重新开始。',
        'zh-TW': '程式執行到 HLT，機器停下了，WAIT 燈亮起。按 RESET 再按 RUN 可重新開始。',
        'ja': 'プログラムが HLT に達して機械が止まり、WAIT ランプが点灯しました。RESET と RUN で再度動きます。',
        'ko': '프로그램이 HLT에 도달해 기계가 멈추고 WAIT 램프가 켜졌습니다. RESET 후 RUN으로 다시 시작합니다.',
    },

    'status-stopped': {
        'en': 'Stopped. The program counter is where it stopped; RESET puts it back to 0000H.',
        'es': 'Detenida. El contador de programa está donde se paró; RESET lo devuelve a 0000H.',
        'fr': 'Arrêtée. Le compteur de programme est resté où il s’est arrêté ; RESET le remet à 0000H.',
        'de': 'Angehalten. Der Programmzähler steht, wo er stehen blieb; RESET setzt ihn auf 0000H zurück.',
        'it': 'Ferma. Il contatore di programma è dove si è fermato; RESET lo riporta a 0000H.',
        'pt-BR': 'Parada. O contador de programa ficou onde ela parou; RESET o leva de volta a 0000H.',
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
        'pt-BR': 'RESET. O contador de programa voltou a 0000H; clique em RUN para começar dali.',
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
        'pt-BR': '{size} de memória instalados. Instalar uma placa de memória exige abrir o gabinete, então a máquina foi desligada - clique em OFF/ON para ligá-la de novo.',
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
        'pt-BR': 'Toda a memória foi zerada.',
        'zh': '全部内存已清零。',
        'zh-TW': '全部記憶體已清零。',
        'ja': 'メモリをすべてゼロにしました。',
        'ko': '메모리를 모두 0으로 지웠습니다.',
    },

    'status-protected': {
        'en': 'Memory {start}H-{end}H is protected: neither DEPOSIT nor a running program can change it until UNPROTECT.',
        'es': 'La memoria {start}H-{end}H está protegida: ni DEPOSIT ni un programa en marcha pueden cambiarla hasta UNPROTECT.',
        'fr': 'La mémoire {start}H-{end}H est protégée : ni DEPOSIT ni un programme en cours ne peuvent la modifier avant UNPROTECT.',
        'de': 'Der Speicher {start}H-{end}H ist geschützt: Weder DEPOSIT noch ein laufendes Programm kann ihn ändern, bis UNPROTECT betätigt wird.',
        'it': 'La memoria {start}H-{end}H è protetta: né DEPOSIT né un programma in esecuzione possono modificarla fino a UNPROTECT.',
        'pt-BR': 'A memória {start}H-{end}H está protegida: nem DEPOSIT nem um programa rodando podem alterá-la até UNPROTECT.',
        'zh': '内存 {start}H-{end}H 已受保护：在按下 UNPROTECT 之前，DEPOSIT 和运行中的程序都无法修改它。',
        'zh-TW': '記憶體 {start}H-{end}H 已受保護：在按下 UNPROTECT 之前，DEPOSIT 和執行中的程式都無法修改它。',
        'ja': 'メモリ {start}H-{end}H を保護しました。UNPROTECT するまで、DEPOSIT でも実行中のプログラムでも書き換えられません。',
        'ko': '메모리 {start}H-{end}H를 보호했습니다. UNPROTECT 전까지는 DEPOSIT도, 실행 중인 프로그램도 이 메모리를 바꿀 수 없습니다.',
    },

    'status-unprotected': {
        'en': 'Memory {start}H-{end}H is unprotected, and can be changed again.',
        'es': 'La memoria {start}H-{end}H ya no está protegida y se puede cambiar de nuevo.',
        'fr': 'La mémoire {start}H-{end}H n’est plus protégée et peut de nouveau être modifiée.',
        'de': 'Der Speicher {start}H-{end}H ist nicht mehr geschützt und kann wieder geändert werden.',
        'it': 'La memoria {start}H-{end}H non è più protetta e si può di nuovo modificare.',
        'pt-BR': 'A memória {start}H-{end}H não está mais protegida e pode ser alterada de novo.',
        'zh': '内存 {start}H-{end}H 已解除保护，可以再次修改。',
        'zh-TW': '記憶體 {start}H-{end}H 已解除保護，可以再次修改。',
        'ja': 'メモリ {start}H-{end}H の保護を解除しました。再び書き換えられます。',
        'ko': '메모리 {start}H-{end}H의 보호를 풀었습니다. 다시 바꿀 수 있습니다.',
    },

    'protect-running': {
        'en': 'PROTECT and UNPROTECT work only while the machine is stopped, as on the real one. Click STOP first.',
        'es': 'PROTECT y UNPROTECT solo funcionan con la máquina detenida, como en la real. Pulsa STOP primero.',
        'fr': 'PROTECT et UNPROTECT ne fonctionnent que machine arrêtée, comme sur la vraie. Cliquez d’abord sur STOP.',
        'de': 'PROTECT und UNPROTECT wirken nur, wenn die Maschine steht, wie bei der echten. Klicken Sie zuerst STOP.',
        'it': 'PROTECT e UNPROTECT funzionano solo a macchina ferma, come su quella vera. Premi prima STOP.',
        'pt-BR': 'PROTECT e UNPROTECT só funcionam com a máquina parada, como na real. Clique em STOP primeiro.',
        'zh': '和真机一样，PROTECT 和 UNPROTECT 只在机器停止时起作用。请先点击 STOP。',
        'zh-TW': '和真機一樣，PROTECT 和 UNPROTECT 只在機器停止時起作用。請先點擊 STOP。',
        'ja': '実機と同じく、PROTECT と UNPROTECT は機械が止まっているときだけ働きます。先に STOP をクリックしてください。',
        'ko': '실제 기계와 마찬가지로 PROTECT와 UNPROTECT는 기계가 멈춰 있을 때만 동작합니다. 먼저 STOP을 누르세요.',
    },

    'protect-no-memory': {
        'en': 'No memory answers at {address}H, so there is no board there to protect or unprotect. EXAMINE an address in the installed memory first.',
        'es': 'Ninguna memoria responde en {address}H, así que no hay placa que proteger o desproteger. Haz EXAMINE de una dirección de la memoria instalada primero.',
        'fr': 'Aucune mémoire ne répond en {address}H : il n’y a pas de carte à protéger ou déprotéger. Faites d’abord EXAMINE sur une adresse de la mémoire installée.',
        'de': 'Bei {address}H antwortet kein Speicher, also gibt es dort keine Karte zu schützen oder freizugeben. Wählen Sie zuerst mit EXAMINE eine Adresse im eingebauten Speicher.',
        'it': 'Nessuna memoria risponde a {address}H, quindi non c’è una scheda da proteggere o sproteggere. Fai prima EXAMINE di un indirizzo nella memoria installata.',
        'pt-BR': 'Nenhuma memória responde em {address}H, então não há placa ali para proteger ou desproteger. Faça EXAMINE de um endereço da memória instalada primeiro.',
        'zh': '{address}H 处没有内存响应，那里没有可以保护或解除保护的内存板。请先用 EXAMINE 选择已安装内存中的一个地址。',
        'zh-TW': '{address}H 處沒有記憶體回應，那裡沒有可以保護或解除保護的記憶體卡。請先用 EXAMINE 選擇已安裝記憶體中的一個位址。',
        'ja': '{address}H に応答するメモリがないので、保護や解除の対象となるボードがありません。先に EXAMINE で搭載メモリ内のアドレスを選んでください。',
        'ko': '{address}H에는 응답하는 메모리가 없어 보호하거나 풀 보드가 없습니다. 먼저 EXAMINE으로 설치된 메모리 안의 주소를 고르세요.',
    },

    'deposit-protected': {
        'en': '{address}H is protected, so DEPOSIT changed nothing. UNPROTECT it first.',
        'es': '{address}H está protegida, así que DEPOSIT no cambió nada. Desprotégela primero con UNPROTECT.',
        'fr': '{address}H est protégée : DEPOSIT n’a rien modifié. Faites d’abord UNPROTECT.',
        'de': '{address}H ist geschützt, also hat DEPOSIT nichts geändert. Geben Sie sie zuerst mit UNPROTECT frei.',
        'it': '{address}H è protetta, quindi DEPOSIT non ha cambiato nulla. Prima sproteggila con UNPROTECT.',
        'pt-BR': '{address}H está protegida, então DEPOSIT não alterou nada. Desproteja-a primeiro com UNPROTECT.',
        'zh': '{address}H 受保护，DEPOSIT 没有改动任何内容。请先按 UNPROTECT。',
        'zh-TW': '{address}H 受保護，DEPOSIT 沒有改動任何內容。請先按 UNPROTECT。',
        'ja': '{address}H は保護されているため、DEPOSIT では何も変わりませんでした。先に UNPROTECT してください。',
        'ko': '{address}H는 보호되어 있어 DEPOSIT으로 바뀐 것이 없습니다. 먼저 UNPROTECT하세요.',
    },

    'write-protected': {
        'en': 'The program tried to write to protected memory at {address}H. The write was ignored, as on the real machine.',
        'es': 'El programa intentó escribir en memoria protegida en {address}H. La escritura se ignoró, como en la máquina real.',
        'fr': 'Le programme a tenté d’écrire en mémoire protégée en {address}H. L’écriture a été ignorée, comme sur la vraie machine.',
        'de': 'Das Programm wollte in geschützten Speicher bei {address}H schreiben. Der Schreibzugriff wurde ignoriert, wie bei der echten Maschine.',
        'it': 'Il programma ha tentato di scrivere nella memoria protetta a {address}H. La scrittura è stata ignorata, come sulla macchina vera.',
        'pt-BR': 'O programa tentou escrever na memória protegida em {address}H. A escrita foi ignorada, como na máquina real.',
        'zh': '程序试图写入受保护的内存 {address}H。和真机一样，这次写入被忽略了。',
        'zh-TW': '程式試圖寫入受保護的記憶體 {address}H。和真機一樣，這次寫入被忽略了。',
        'ja': 'プログラムが保護されたメモリ {address}H に書き込もうとしました。実機と同じく、書き込みは無視されました。',
        'ko': '프로그램이 보호된 메모리 {address}H에 쓰려고 했습니다. 실제 기계처럼 그 쓰기는 무시되었습니다.',
    },

    'status-stopped-blocked': {
        'en': "Stopped. The program's writes to protected memory were refused ({count} in all, the first at {address}H).",
        'es': 'Detenida. Se rechazaron las escrituras del programa en memoria protegida ({count} en total, la primera en {address}H).',
        'fr': 'Arrêtée. Les écritures du programme en mémoire protégée ont été refusées ({count} en tout, la première en {address}H).',
        'de': 'Angehalten. Die Schreibzugriffe des Programms auf geschützten Speicher wurden abgewiesen ({count} insgesamt, der erste bei {address}H).',
        'it': 'Ferma. Le scritture del programma nella memoria protetta sono state rifiutate ({count} in tutto, la prima a {address}H).',
        'pt-BR': 'Parada. As escritas do programa na memória protegida foram recusadas ({count} no total, a primeira em {address}H).',
        'zh': '已停止。程序对受保护内存的写入都被拒绝了（共 {count} 次，第一次在 {address}H）。',
        'zh-TW': '已停止。程式對受保護記憶體的寫入都被拒絕了（共 {count} 次，第一次在 {address}H）。',
        'ja': '停止しました。保護されたメモリへのプログラムの書き込みは拒否されました（全 {count} 回、最初は {address}H）。',
        'ko': '멈췄습니다. 보호된 메모리에 대한 프로그램의 쓰기는 거부되었습니다(모두 {count}번, 처음은 {address}H).',
    },

    'status-halted-blocked': {
        'en': 'The program ran into a HLT and the machine stopped, with the WAIT lamp lit. Its writes to protected memory were refused ({count} in all, the first at {address}H).',
        'es': 'El programa llegó a un HLT y la máquina se detuvo, con la lámpara WAIT encendida. Se rechazaron sus escrituras en memoria protegida ({count} en total, la primera en {address}H).',
        'fr': 'Le programme a atteint un HLT et la machine s’est arrêtée, la lampe WAIT allumée. Ses écritures en mémoire protégée ont été refusées ({count} en tout, la première en {address}H).',
        'de': 'Das Programm ist auf ein HLT gelaufen und die Maschine steht, die WAIT-Lampe leuchtet. Seine Schreibzugriffe auf geschützten Speicher wurden abgewiesen ({count} insgesamt, der erste bei {address}H).',
        'it': 'Il programma è arrivato a un HLT e la macchina si è fermata, con la spia WAIT accesa. Le sue scritture nella memoria protetta sono state rifiutate ({count} in tutto, la prima a {address}H).',
        'pt-BR': 'O programa chegou a um HLT e a máquina parou, com a lâmpada WAIT acesa. Suas escritas na memória protegida foram recusadas ({count} no total, a primeira em {address}H).',
        'zh': '程序执行到 HLT，机器停下了，WAIT 灯亮起。它对受保护内存的写入都被拒绝了（共 {count} 次，第一次在 {address}H）。',
        'zh-TW': '程式執行到 HLT，機器停下了，WAIT 燈亮起。它對受保護記憶體的寫入都被拒絕了（共 {count} 次，第一次在 {address}H）。',
        'ja': 'プログラムが HLT に達して機械が止まり、WAIT ランプが点灯しました。保護されたメモリへの書き込みは拒否されました（全 {count} 回、最初は {address}H）。',
        'ko': '프로그램이 HLT에 도달해 기계가 멈추고 WAIT 램프가 켜졌습니다. 보호된 메모리에 대한 쓰기는 거부되었습니다(모두 {count}번, 처음은 {address}H).',
    },

    'status-clr': {
        'en': 'CLR. The serial boards are cleared: anything typed and not yet read is gone.',
        'es': 'CLR. Las placas serie se han borrado: lo que se tecleó y aún no se había leído se ha perdido.',
        'fr': 'CLR. Les cartes série sont remises à zéro : ce qui avait été tapé sans être encore lu est perdu.',
        'de': 'CLR. Die seriellen Karten sind zurückgesetzt: Was getippt, aber noch nicht gelesen wurde, ist verloren.',
        'it': 'CLR. Le schede seriali sono state azzerate: ciò che era stato digitato e non ancora letto è perso.',
        'pt-BR': 'CLR. As placas seriais foram limpas: o que foi digitado e ainda não lido se perdeu.',
        'zh': 'CLR。串行板已清空：已输入但尚未被读取的字符都被丢弃了。',
        'zh-TW': 'CLR。序列卡已清空：已輸入但尚未被讀取的字元都被丟棄了。',
        'ja': 'CLR。シリアルボードをクリアしました。入力済みでまだ読まれていない文字は失われました。',
        'ko': 'CLR. 직렬 보드를 비웠습니다. 입력했지만 아직 읽히지 않은 문자는 사라졌습니다.',
    },

    'status-aux': {
        'en': 'AUX is not connected to anything, as on a new Altair: MITS left both AUX switches spare, for boards added later.',
        'es': 'AUX no está conectado a nada, como en un Altair nuevo: MITS dejó libres los dos interruptores AUX para placas que se añadieran después.',
        'fr': 'AUX n’est relié à rien, comme sur un Altair neuf : MITS a laissé les deux interrupteurs AUX libres, pour des cartes ajoutées plus tard.',
        'de': 'AUX ist mit nichts verbunden, wie bei einem neuen Altair: MITS ließ beide AUX-Schalter frei, für später eingebaute Karten.',
        'it': 'AUX non è collegato a nulla, come su un Altair nuovo: MITS lasciò liberi entrambi gli interruttori AUX, per schede aggiunte in seguito.',
        'pt-BR': 'AUX não está ligado a nada, como num Altair novo: a MITS deixou as duas chaves AUX livres, para placas instaladas depois.',
        'zh': 'AUX 没有连接任何东西，新出厂的 Altair 也是如此：MITS 把两个 AUX 开关留作备用，供日后加装的板卡使用。',
        'zh-TW': 'AUX 沒有連接任何東西，新出廠的 Altair 也是如此：MITS 把兩個 AUX 開關留作備用，供日後加裝的板卡使用。',
        'ja': 'AUX はどこにもつながっていません。新品の Altair でも同じで、MITS は 2 つの AUX スイッチを後から追加するボード用に空けておきました。',
        'ko': 'AUX는 아무 데도 연결되어 있지 않습니다. 새 Altair도 마찬가지로, MITS는 두 AUX 스위치를 나중에 추가할 보드를 위해 비워 두었습니다.',
    },

    'unprotected-first': {
        'en': 'All memory was unprotected first.',
        'es': 'Primero se desprotegió toda la memoria.',
        'fr': 'Toute la mémoire a d’abord été déprotégée.',
        'de': 'Zuerst wurde der gesamte Speicher freigegeben.',
        'it': 'Prima è stata sprotetta tutta la memoria.',
        'pt-BR': 'Toda a memória foi desprotegida primeiro.',
        'zh': '已先解除所有内存的保护。',
        'zh-TW': '已先解除所有記憶體的保護。',
        'ja': '先にすべてのメモリの保護を解除しました。',
        'ko': '먼저 모든 메모리의 보호를 풀었습니다.',
    },

    // Every way of loading switches the machine on if it is off (D20),
    // and on the Debugger tab the front panel is not there to show it.
    // This goes in front of whatever the load itself has to say (D23).
    'powered-on-first': {
        'en': 'The machine was off, so it was switched on first.',
        'es': 'La máquina estaba apagada, así que se encendió primero.',
        'fr': 'La machine était éteinte : elle a d’abord été allumée.',
        'de': 'Die Maschine war aus und wurde zuerst eingeschaltet.',
        'it': 'La macchina era spenta, quindi è stata accesa prima.',
        'pt-BR': 'A máquina estava desligada, então foi ligada primeiro.',
        'zh': '机器原本是关着的，已先行开机。',
        'zh-TW': '機器原本是關著的，已先行開機。',
        'ja': '電源が切れていたので、先に入れました。',
        'ko': '기계가 꺼져 있어서 먼저 켰습니다.',
    },

    'example-loaded': {
        'en': 'Loaded {name}, {bytes} bytes, at 0000H and pressed RESET. Click RUN on the front panel.',
        'es': 'Cargado {name}, {bytes} bytes, en 0000H y pulsado RESET. Pulsa RUN en el panel frontal.',
        'fr': '{name} chargé, {bytes} octets, en 0000H et RESET appuyé. Cliquez sur RUN en façade.',
        'de': '{name} geladen, {bytes} Bytes, bei 0000H, und RESET gedrückt. Klicken Sie RUN an der Frontplatte.',
        'it': 'Caricato {name}, {bytes} byte, a 0000H e premuto RESET. Premi RUN sul pannello frontale.',
        'pt-BR': '{name} carregado, {bytes} bytes, em 0000H, e RESET pressionado. Clique em RUN no painel frontal.',
        'zh': '已在 0000H 载入 {name}（{bytes} 字节）并按下 RESET。请点击前面板上的 RUN。',
        'zh-TW': '已在 0000H 載入 {name}（{bytes} 位元組）並按下 RESET。請點擊前面板上的 RUN。',
        'ja': '{name}（{bytes} バイト）を 0000H に読み込み、RESET を押しました。フロントパネルの RUN を押してください。',
        'ko': '{name}({bytes}바이트)을 0000H에 불러오고 RESET을 눌렀습니다. 앞판의 RUN을 누르세요.',
    },

    'example-loaded-tty': {
        'en': 'Loaded {name}, {bytes} bytes, at 0000H and pressed RESET. Click RUN on the front panel, then watch the Teletype.',
        'es': 'Cargado {name}, {bytes} bytes, en 0000H y pulsado RESET. Pulsa RUN en el panel frontal y luego mira el Teletipo.',
        'fr': '{name} chargé, {bytes} octets, en 0000H et RESET appuyé. Cliquez sur RUN en façade, puis regardez le Téléscripteur.',
        'de': '{name} geladen, {bytes} Bytes, bei 0000H, und RESET gedrückt. Klicken Sie RUN an der Frontplatte und sehen Sie dann im Fernschreiber nach.',
        'it': 'Caricato {name}, {bytes} byte, a 0000H e premuto RESET. Premi RUN sul pannello frontale, poi guarda la Telescrivente.',
        'pt-BR': '{name} carregado, {bytes} bytes, em 0000H, e RESET pressionado. Clique em RUN no painel frontal e acompanhe o Teletipo.',
        'zh': '已在 0000H 载入 {name}（{bytes} 字节）并按下 RESET。请点击前面板上的 RUN，然后看“电传打字机”。',
        'zh-TW': '已在 0000H 載入 {name}（{bytes} 位元組）並按下 RESET。請點擊前面板上的 RUN，然後看「電傳打字機」。',
        'ja': '{name}（{bytes} バイト）を 0000H に読み込み、RESET を押しました。フロントパネルの RUN を押し、テレタイプをご覧ください。',
        'ko': '{name}({bytes}바이트)을 0000H에 불러오고 RESET을 눌렀습니다. 앞판의 RUN을 누른 다음 텔레타이프를 보세요.',
    },

    'load-basic': {
        'en': 'Microsoft 4K BASIC',
        'es': 'Microsoft 4K BASIC',
        'fr': 'Microsoft 4K BASIC',
        'de': 'Microsoft 4K BASIC',
        'it': 'Microsoft 4K BASIC',
        'pt-BR': 'Microsoft 4K BASIC',
        'zh': 'Microsoft 4K BASIC',
        'zh-TW': 'Microsoft 4K BASIC',
        'ja': 'Microsoft 4K BASIC',
        'ko': 'Microsoft 4K BASIC',
    },

    'needs-server': {
        'en': 'This page was opened straight off the disk, so the browser will not let it read the example listings or the BASIC tape. Serve the folder instead: run "python3 -m http.server 8000" in it and open http://localhost:8000/.',
        'es': 'Esta página se abrió directamente desde el disco, así que el navegador no le deja leer los listados de ejemplo ni la cinta de BASIC. Sirve la carpeta: ejecuta "python3 -m http.server 8000" en ella y abre http://localhost:8000/.',
        'fr': 'Cette page a été ouverte directement depuis le disque, le navigateur ne la laisse donc pas lire les listings d’exemple ni la bande BASIC. Servez le dossier : lancez-y « python3 -m http.server 8000 » et ouvrez http://localhost:8000/.',
        'de': 'Diese Seite wurde direkt von der Festplatte geöffnet, daher lässt der Browser sie die Beispiel-Listings und das BASIC-Band nicht lesen. Stellen Sie den Ordner bereit: Führen Sie darin "python3 -m http.server 8000" aus und öffnen Sie http://localhost:8000/.',
        'it': 'Questa pagina è stata aperta direttamente dal disco, quindi il browser non le lascia leggere i listati di esempio né il nastro BASIC. Servi la cartella: esegui "python3 -m http.server 8000" al suo interno e apri http://localhost:8000/.',
        'pt-BR': 'Esta página foi aberta direto do disco, então o navegador não a deixa ler as listagens de exemplo nem a fita do BASIC. Sirva a pasta: rode "python3 -m http.server 8000" nela e abra http://localhost:8000/.',
        'zh': '这个页面是直接从磁盘打开的，浏览器不允许它读取示例程序清单或 BASIC 纸带。请改用服务器：在该目录下运行 "python3 -m http.server 8000"，然后打开 http://localhost:8000/。',
        'zh-TW': '這個頁面是直接從磁碟開啟的，瀏覽器不允許它讀取範例程式清單或 BASIC 紙帶。請改用伺服器：在該目錄下執行 "python3 -m http.server 8000"，然後開啟 http://localhost:8000/。',
        'ja': 'このページはディスクから直接開かれているため、ブラウザーはサンプルのリスティングや BASIC の紙テープを読み込ませてくれません。フォルダーを配信してください。その中で "python3 -m http.server 8000" を実行し、http://localhost:8000/ を開きます。',
        'ko': '이 페이지는 디스크에서 바로 열렸기 때문에 브라우저가 예제 리스팅이나 BASIC 종이테이프를 읽지 못하게 합니다. 폴더를 서버로 제공하세요. 그 안에서 "python3 -m http.server 8000"을 실행하고 http://localhost:8000/ 을 여세요.',
    },

    'examples-unreadable': {
        'en': 'The example listings could not be read. They live in the examples folder beside this page.',
        'es': 'No se pudieron leer los listados de ejemplo. Están en la carpeta examples junto a esta página.',
        'fr': 'Les listings d’exemple n’ont pas pu être lus. Ils se trouvent dans le dossier examples à côté de cette page.',
        'de': 'Die Beispiel-Listings konnten nicht gelesen werden. Sie liegen im Ordner examples neben dieser Seite.',
        'it': 'Non è stato possibile leggere i listati di esempio. Si trovano nella cartella examples accanto a questa pagina.',
        'pt-BR': 'Não foi possível ler as listagens de exemplo. Elas ficam na pasta examples, ao lado desta página.',
        'zh': '无法读取示例程序清单。它们在本页面旁边的 examples 目录里。',
        'zh-TW': '無法讀取範例程式清單。它們在本頁面旁邊的 examples 目錄裡。',
        'ja': 'サンプルのリスティングを読み込めませんでした。このページと同じ場所の examples フォルダーにあります。',
        'ko': '예제 리스팅을 읽을 수 없습니다. 이 페이지 옆 examples 폴더에 있습니다.',
    },

    'rom-needs-memory': {
        'en': '4K BASIC needs at least 4 KB installed. Choose 4 KB or 8 KB in the Memory menu.',
        'es': 'BASIC 4K necesita al menos 4 KB instalados. Elige 4 KB u 8 KB en el menú Memoria.',
        'fr': 'BASIC 4K exige au moins 4 Kio installés. Choisissez 4 Kio ou 8 Kio dans le menu Mémoire.',
        'de': '4K BASIC braucht mindestens 4 KB. Wählen Sie 4 KB oder 8 KB im Menü Speicher.',
        'it': 'BASIC 4K richiede almeno 4 KB installati. Scegli 4 KB o 8 KB nel menu Memoria.',
        'pt-BR': 'O 4K BASIC requer pelo menos 4 KB instalados. Escolha 4 KB ou 8 KB no menu Memória.',
        'zh': '4K BASIC 至少需要 4 KB 内存。请在“内存”菜单中选择 4 KB 或 8 KB。',
        'zh-TW': '4K BASIC 至少需要 4 KB 記憶體。請在「記憶體」選單中選擇 4 KB 或 8 KB。',
        'ja': '4K BASIC には少なくとも 4 KB が必要です。「メモリ」メニューで 4 KB か 8 KB を選んでください。',
        'ko': '4K BASIC에는 최소 4 KB가 필요합니다. "메모리" 메뉴에서 4 KB 또는 8 KB를 선택하세요.',
    },

    'rom-loaded': {
        'en': 'Loaded {bytes} bytes at 0000H and pressed RESET. Click RUN on the front panel, then watch the Teletype.',
        'es': 'Cargados {bytes} bytes en 0000H y pulsado RESET. Pulsa RUN en el panel frontal y luego mira el Teletipo.',
        'fr': '{bytes} octets chargés en 0000H et RESET appuyé. Cliquez sur RUN en façade, puis regardez le Téléscripteur.',
        'de': '{bytes} Bytes bei 0000H geladen und RESET gedrückt. Klicken Sie RUN an der Frontplatte und sehen Sie dann im Fernschreiber nach.',
        'it': 'Caricati {bytes} byte a 0000H e premuto RESET. Premi RUN sul pannello frontale, poi guarda la Telescrivente.',
        'pt-BR': '{bytes} bytes carregados em 0000H, e RESET pressionado. Clique em RUN no painel frontal e acompanhe o Teletipo.',
        'zh': '已在 0000H 载入 {bytes} 字节并按下 RESET。请点击前面板上的 RUN，然后查看“电传打字机”。',
        'zh-TW': '已在 0000H 載入 {bytes} 位元組並按下 RESET。請點擊前面板上的 RUN，然後查看「電傳打字機」。',
        'ja': '0000H に {bytes} バイトを読み込み、RESET を押しました。フロントパネルの RUN を押し、テレタイプを見てください。',
        'ko': '0000H에 {bytes}바이트를 불러오고 RESET을 눌렀습니다. 앞판의 RUN을 누른 뒤 텔레타이프를 보세요.',
    },

    'rom-file-loaded': {
        'en': 'Loaded {bytes} bytes of {name} at 0000H and pressed RESET.',
        'es': 'Cargados {bytes} bytes de {name} en 0000H y pulsado RESET.',
        'fr': '{bytes} octets de {name} chargés en 0000H et RESET appuyé.',
        'de': '{bytes} Bytes aus {name} bei 0000H geladen und RESET gedrückt.',
        'it': 'Caricati {bytes} byte di {name} a 0000H e premuto RESET.',
        'pt-BR': '{bytes} bytes de {name} carregados em 0000H, e RESET pressionado.',
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
        'pt-BR': '{name} tem {bytes} bytes. O 8080 só endereça 64 KB, então isso não é uma imagem de memória - nada foi carregado.',
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
        'pt-BR': 'Os primeiros {bytes} bytes de {name} foram carregados em 0000H, e RESET pressionado. O arquivo tem {size} bytes; o resto não cabe na memória instalada.',
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
        'pt-BR': 'Não foi possível ler {name}.',
        'zh': '无法读取 {name}。',
        'zh-TW': '無法讀取 {name}。',
        'ja': '{name} を読み込めませんでした。',
        'ko': '{name}을(를) 읽을 수 없습니다.',
    },

    'rom-missing': {
        'en': 'roms/4kbas32.bin could not be read. It is optional - see roms/NOTICE - so supply your own image with Binary File… in the Load menu.',
        'es': 'No se pudo leer roms/4kbas32.bin. Es opcional (consulta roms/NOTICE), así que aporta tu propia imagen con Archivo binario… en el menú Cargar.',
        'fr': 'roms/4kbas32.bin n\'a pas pu être lu. Il est facultatif (voir roms/NOTICE) : fournissez votre propre image avec Fichier binaire… dans le menu Charger.',
        'de': 'roms/4kbas32.bin konnte nicht gelesen werden. Es ist optional (siehe roms/NOTICE), laden Sie also ein eigenes Abbild mit Binärdatei… im Menü Laden.',
        'it': 'Impossibile leggere roms/4kbas32.bin. È facoltativo (vedi roms/NOTICE), quindi fornisci una tua immagine con File binario… nel menu Carica.',
        'pt-BR': 'Não foi possível ler roms/4kbas32.bin. Ele é opcional - veja roms/NOTICE - então forneça sua própria imagem com Arquivo Binário…, no menu Carregar.',
        'zh': '无法读取 roms/4kbas32.bin。它是可选的（见 roms/NOTICE），请用“加载”菜单中的“二进制文件…”载入你自己的映像。',
        'zh-TW': '無法讀取 roms/4kbas32.bin。它是選用的（見 roms/NOTICE），請用「載入」選單中的「二進位檔案…」載入你自己的映像。',
        'ja': 'roms/4kbas32.bin を読み込めませんでした。これは任意のものなので（roms/NOTICE を参照）、「読み込み」メニューの「バイナリファイル…」で自分のイメージを読み込んでください。',
        'ko': 'roms/4kbas32.bin을 읽을 수 없습니다. 선택 사항이므로(roms/NOTICE 참고) "불러오기" 메뉴의 "바이너리 파일…"로 직접 가진 이미지를 불러오세요.',
    },

    'mem-size-256': {
        'en': '256 B · as it shipped',
        'es': '256 B · de fábrica',
        'fr': '256 o · d’origine',
        'de': '256 B · wie ausgeliefert',
        'it': '256 B · di serie',
        'pt-BR': '256 B · como vinha de fábrica',
        'zh': '256 B · 出厂配置',
        'zh-TW': '256 B · 出廠配置',
        'ja': '256 B · 出荷時のまま',
        'ko': '256 B · 출고 상태',
    },

    'mem-size-4096': {
        'en': '4 KB · one 88-4MCS',
        'es': '4 KB · una 88-4MCS',
        'fr': '4 Kio · une 88-4MCS',
        'de': '4 KB · eine 88-4MCS',
        'it': '4 KB · una 88-4MCS',
        'pt-BR': '4 KB · uma 88-4MCS',
        'zh': '4 KB · 一块 88-4MCS',
        'zh-TW': '4 KB · 一塊 88-4MCS',
        'ja': '4 KB · 88-4MCS 一枚',
        'ko': '4 KB · 88-4MCS 한 장',
    },

    'mem-size-8192': {
        'en': '8 KB · two 88-4MCS',
        'es': '8 KB · dos 88-4MCS',
        'fr': '8 Kio · deux 88-4MCS',
        'de': '8 KB · zwei 88-4MCS',
        'it': '8 KB · due 88-4MCS',
        'pt-BR': '8 KB · duas 88-4MCS',
        'zh': '8 KB · 两块 88-4MCS',
        'zh-TW': '8 KB · 兩塊 88-4MCS',
        'ja': '8 KB · 88-4MCS 二枚',
        'ko': '8 KB · 88-4MCS 두 장',
    },

    'debug-data-placeholder': {
        'en': 'Bytes in hex, such as c3 00 00',
        'es': 'Bytes en hex, por ejemplo c3 00 00',
        'fr': 'Octets en hexa, par exemple c3 00 00',
        'de': 'Bytes in Hex, etwa c3 00 00',
        'it': 'Byte in esadecimale, ad esempio c3 00 00',
        'pt-BR': 'Bytes em hex, como c3 00 00',
        'zh': '十六进制字节，例如 c3 00 00',
        'zh-TW': '十六進位位元組，例如 c3 00 00',
        'ja': '16 進数のバイト列、例えば c3 00 00',
        'ko': '16진수 바이트, 예: c3 00 00',
    },

    'tty-off': {
        'en': 'The machine is off, so keys typed here go nowhere. Switch it on first.',
        'es': 'La máquina está apagada, así que las teclas escritas aquí no van a ninguna parte. Enciéndela primero.',
        'fr': 'La machine est éteinte, les touches tapées ici ne vont donc nulle part. Allumez-la d’abord.',
        'de': 'Die Maschine ist aus, hier getippte Tasten gehen also ins Leere. Schalten Sie sie zuerst ein.',
        'it': 'La macchina è spenta, quindi i tasti premuti qui non vanno da nessuna parte. Accendila prima.',
        'pt-BR': 'A máquina está desligada, então as teclas digitadas aqui não vão a lugar nenhum. Ligue-a primeiro.',
        'zh': '机器已关闭，在这里打出的字符无处可去。请先开机。',
        'zh-TW': '機器已關閉，在這裡打出的字元無處可去。請先開機。',
        'ja': '電源が入っていないので、ここで打ったキーはどこにも届きません。先に電源を入れてください。',
        'ko': '기계가 꺼져 있어 여기서 누른 키는 아무 데도 가지 않습니다. 먼저 전원을 켜세요.',
    },

    'zero-mem-off': {
        'en': 'The machine is off, so there is no memory to zero. Switch it on first.',
        'es': 'La máquina está apagada, así que no hay memoria que poner a cero. Enciéndela primero.',
        'fr': 'La machine est éteinte, il n\'y a donc pas de mémoire à remettre à zéro. Allumez-la d\'abord.',
        'de': 'Die Maschine ist aus, es gibt also keinen Speicher zum Nullsetzen. Schalten Sie sie zuerst ein.',
        'it': 'La macchina è spenta, quindi non c\'è memoria da azzerare. Accendila prima.',
        'pt-BR': 'A máquina está desligada, então não há memória para zerar. Ligue-a primeiro.',
        'zh': '机器已关闭，没有内存可以清零。请先开机。',
        'zh-TW': '機器已關閉，沒有記憶體可以清零。請先開機。',
        'ja': '電源が入っていないので、ゼロにするメモリがありません。先に電源を入れてください。',
        'ko': '기계가 꺼져 있어 0으로 만들 메모리가 없습니다. 먼저 전원을 켜세요.',
    },

    'instr-title': {
        'en': 'Next Instruction',
        'es': 'Siguiente Instrucción',
        'fr': 'Instruction Suivante',
        'de': 'Nächster Befehl',
        'it': 'Istruzione Successiva',
        'pt-BR': 'Próxima Instrução',
        'zh': '下一条指令',
        'zh-TW': '下一道指令',
        'ja': '次の命令',
        'ko': '다음 명령',
    },

    'instr-undocumented': {
        'en': '(undocumented opcode; the 8080 runs it as this)',
        'es': '(código de operación no documentado; el 8080 lo ejecuta así)',
        'fr': '(opcode non documenté ; le 8080 l\'exécute ainsi)',
        'de': '(undokumentierter Opcode; der 8080 führt ihn so aus)',
        'it': '(opcode non documentato; l\'8080 lo esegue così)',
        'pt-BR': '(opcode não documentado; o 8080 o executa como este)',
        'zh': '（未公开的操作码；8080 按此执行）',
        'zh-TW': '（未公開的操作碼；8080 依此執行）',
        'ja': '（非公開のオペコード。8080 はこのように実行します）',
        'ko': '(문서화되지 않은 옵코드. 8080은 이렇게 실행합니다)',
    },

    'copy-link': {
        'en': 'Copy Link',
        'es': 'Copiar enlace',
        'fr': 'Copier le lien',
        'de': 'Link kopieren',
        'it': 'Copia link',
        'pt-BR': 'Copiar Link',
        'zh': '复制链接',
        'zh-TW': '複製連結',
        'ja': 'リンクをコピー',
        'ko': '링크 복사',
    },

    'copy-link-done': {
        'en': 'Copied \u2713',
        'es': 'Copiado \u2713',
        'fr': 'Copié \u2713',
        'de': 'Kopiert \u2713',
        'it': 'Copiato \u2713',
        'pt-BR': 'Copiado ✓',
        'zh': '已复制 \u2713',
        'zh-TW': '已複製 \u2713',
        'ja': 'コピー済み \u2713',
        'ko': '복사됨 \u2713',
    },

    'copy-link-off': {
        'en': 'The machine is off, so there is nothing to link to. Load a program first.',
        'es': 'La máquina está apagada, así que no hay nada que enlazar. Carga un programa primero.',
        'fr': 'La machine est éteinte, il n\'y a donc rien à partager. Chargez d\'abord un programme.',
        'de': 'Die Maschine ist aus, es gibt also nichts zu verlinken. Laden Sie zuerst ein Programm.',
        'it': 'La macchina è spenta, quindi non c\'è nulla da condividere. Carica prima un programma.',
        'pt-BR': 'A máquina está desligada, então não há nada para compartilhar. Carregue um programa primeiro.',
        'zh': '机器已关闭，没有可链接的内容。请先载入程序。',
        'zh-TW': '機器已關閉，沒有可連結的內容。請先載入程式。',
        'ja': 'マシンの電源が切れているため、リンクするものがありません。先にプログラムを読み込んでください。',
        'ko': '기계가 꺼져 있어 링크할 것이 없습니다. 먼저 프로그램을 불러오세요.',
    },

    'link-copied': {
        'en': 'Link copied. It opens the simulator with this memory, these registers and these switches, stopped here.',
        'es': 'Enlace copiado. Abre el simulador con esta memoria, estos registros y estos interruptores, detenido aquí.',
        'fr': 'Lien copié. Il ouvre le simulateur avec cette mémoire, ces registres et ces interrupteurs, arrêté ici.',
        'de': 'Link kopiert. Er öffnet den Simulator mit diesem Speicher, diesen Registern und diesen Schaltern, hier angehalten.',
        'it': 'Link copiato. Apre il simulatore con questa memoria, questi registri e questi interruttori, fermo qui.',
        'pt-BR': 'Link copiado. Ele abre o simulador com esta memória, estes registradores e estas chaves, parado aqui.',
        'zh': '链接已复制。它会以当前的内存、寄存器和开关打开模拟器，并停在此处。',
        'zh-TW': '連結已複製。它會以目前的記憶體、暫存器和開關開啟模擬器，並停在此處。',
        'ja': 'リンクをコピーしました。このメモリ、レジスタ、スイッチの状態で、ここで停止したシミュレーターが開きます。',
        'ko': '링크를 복사했습니다. 현재 메모리, 레지스터, 스위치 상태로 여기서 멈춘 시뮬레이터가 열립니다.',
    },

    'link-copied-program': {
        'en': 'Link copied. It opens the simulator with this memory loaded and RESET pressed, ready to RUN.',
        'es': 'Enlace copiado. Abre el simulador con esta memoria cargada y RESET pulsado, listo para RUN.',
        'fr': 'Lien copié. Il ouvre le simulateur avec cette mémoire chargée et RESET enfoncé, prêt pour RUN.',
        'de': 'Link kopiert. Er öffnet den Simulator mit diesem Speicher geladen und RESET gedrückt, bereit für RUN.',
        'it': 'Link copiato. Apre il simulatore con questa memoria caricata e RESET premuto, pronto per RUN.',
        'pt-BR': 'Link copiado. Ele abre o simulador com esta memória carregada e RESET pressionado, pronto para RUN.',
        'zh': '链接已复制。它会载入当前内存并按下 RESET 打开模拟器，可直接按 RUN。',
        'zh-TW': '連結已複製。它會載入目前記憶體並按下 RESET 開啟模擬器，可直接按 RUN。',
        'ja': 'リンクをコピーしました。このメモリを読み込み RESET を押した状態でシミュレーターが開き、すぐに RUN できます。',
        'ko': '링크를 복사했습니다. 현재 메모리를 불러오고 RESET을 누른 상태로 시뮬레이터가 열리며, 바로 RUN할 수 있습니다.',
    },

    'link-loaded': {
        'en': 'Loaded {bytes} bytes from the link at 0000H. Press RUN.',
        'es': 'Cargados {bytes} bytes del enlace en 0000H. Pulsa RUN.',
        'fr': '{bytes} octets du lien chargés en 0000H. Appuyez sur RUN.',
        'de': '{bytes} Bytes aus dem Link bei 0000H geladen. Drücken Sie RUN.',
        'it': 'Caricati {bytes} byte dal link a 0000H. Premi RUN.',
        'pt-BR': '{bytes} bytes carregados do link em 0000H. Pressione RUN.',
        'zh': '已从链接在 0000H 载入 {bytes} 字节。请按 RUN。',
        'zh-TW': '已從連結在 0000H 載入 {bytes} 位元組。請按 RUN。',
        'ja': 'リンクから 0000H に {bytes} バイトを読み込みました。RUN を押してください。',
        'ko': '링크에서 0000H에 {bytes}바이트를 불러왔습니다. RUN을 누르세요.',
    },

    'link-state-loaded': {
        'en': 'Loaded the machine from the link: {size} of memory, stopped at {pc}H. Press RUN or SINGLE STEP to carry on.',
        'es': 'Máquina cargada desde el enlace: {size} de memoria, detenida en {pc}H. Pulsa RUN o SINGLE STEP para seguir.',
        'fr': 'Machine chargée depuis le lien : {size} de mémoire, arrêtée en {pc}H. Appuyez sur RUN ou SINGLE STEP pour continuer.',
        'de': 'Maschine aus dem Link geladen: {size} Speicher, angehalten bei {pc}H. Mit RUN oder SINGLE STEP geht es weiter.',
        'it': 'Macchina caricata dal link: {size} di memoria, ferma a {pc}H. Premi RUN o SINGLE STEP per continuare.',
        'pt-BR': 'Máquina carregada do link: {size} de memória, parada em {pc}H. Pressione RUN ou SINGLE STEP para continuar.',
        'zh': '已从链接载入机器：内存 {size}，停在 {pc}H。按 RUN 或 SINGLE STEP 继续。',
        'zh-TW': '已從連結載入機器：記憶體 {size}，停在 {pc}H。按 RUN 或 SINGLE STEP 繼續。',
        'ja': 'リンクからマシンを読み込みました：メモリ {size}、{pc}H で停止中。RUN か SINGLE STEP で続行します。',
        'ko': '링크에서 기계를 불러왔습니다: 메모리 {size}, {pc}H에서 정지. RUN이나 SINGLE STEP으로 계속하세요.',
    },

    'link-bad-reg': {
        'en': 'The link sets {name} to "{text}", which is not a hex value that fits in it.',
        'es': 'El enlace pone {name} a "{text}", que no es un valor hex que quepa en él.',
        'fr': 'Le lien donne à {name} la valeur « {text} », qui n\'est pas une valeur hex qui y tient.',
        'de': 'Der Link setzt {name} auf „{text}“ – kein Hex-Wert, der hineinpasst.',
        'it': 'Il link imposta {name} a "{text}", che non è un valore hex che ci stia.',
        'pt-BR': 'O link define {name} como "{text}", que não é um valor hexadecimal que caiba nele.',
        'zh': '链接将 {name} 设为“{text}”，这不是能放进它的十六进制值。',
        'zh-TW': '連結將 {name} 設為「{text}」，這不是能放進它的十六進位值。',
        'ja': 'リンクは {name} を「{text}」にしていますが、これは収まる 16 進数値ではありません。',
        'ko': '링크가 {name}을(를) "{text}"(으)로 설정하지만, 들어갈 수 있는 16진수 값이 아닙니다.',
    },

    'link-bad-zip': {
        'en': 'The memory in the link is damaged, probably cut short when it was copied. Copy the whole link again.',
        'es': 'La memoria del enlace está dañada, seguramente se cortó al copiarlo. Vuelve a copiar el enlace entero.',
        'fr': 'La mémoire contenue dans le lien est abîmée, sans doute tronquée à la copie. Recopiez le lien en entier.',
        'de': 'Der Speicher im Link ist beschädigt, vermutlich beim Kopieren abgeschnitten. Kopieren Sie den ganzen Link erneut.',
        'it': 'La memoria nel link è danneggiata, probabilmente troncata durante la copia. Copia di nuovo il link intero.',
        'pt-BR': 'A memória no link está danificada, provavelmente cortada quando foi copiada. Copie o link inteiro de novo.',
        'zh': '链接中的内存数据已损坏，可能是复制时被截断了。请重新复制完整的链接。',
        'zh-TW': '連結中的記憶體資料已損壞，可能是複製時被截斷了。請重新複製完整的連結。',
        'ja': 'リンク内のメモリが壊れています。コピーの際に途中で切れたのかもしれません。リンク全体をもう一度コピーしてください。',
        'ko': '링크 안의 메모리가 손상되었습니다. 복사할 때 잘린 것 같습니다. 링크 전체를 다시 복사하세요.',
    },

    'link-bad-mem': {
        'en': 'The link asks for {text} bytes of memory. The machine can have 256, 4096 or 8192.',
        'es': 'El enlace pide {text} bytes de memoria. La máquina puede tener 256, 4096 u 8192.',
        'fr': 'Le lien demande {text} octets de mémoire. La machine peut en avoir 256, 4096 ou 8192.',
        'de': 'Der Link verlangt {text} Bytes Speicher. Die Maschine kann 256, 4096 oder 8192 haben.',
        'it': 'Il link chiede {text} byte di memoria. La macchina può averne 256, 4096 o 8192.',
        'pt-BR': 'O link pede {text} bytes de memória. A máquina pode ter 256, 4096 ou 8192.',
        'zh': '链接要求 {text} 字节内存。机器只能有 256、4096 或 8192 字节。',
        'zh-TW': '連結要求 {text} 位元組記憶體。機器只能有 256、4096 或 8192 位元組。',
        'ja': 'リンクはメモリ {text} バイトを求めています。マシンに載せられるのは 256、4096、8192 のいずれかです。',
        'ko': '링크가 메모리 {text}바이트를 요구합니다. 기계는 256, 4096, 8192 중 하나만 가능합니다.',
    },

    'load-data-empty': {
        'en': 'Nothing to load. Type some bytes in hex, such as c3 00 00.',
        'es': 'No hay nada que cargar. Escribe algunos bytes en hex, por ejemplo c3 00 00.',
        'fr': 'Rien à charger. Tapez des octets en hexadécimal, par exemple c3 00 00.',
        'de': 'Nichts zu laden. Geben Sie Bytes in Hex ein, etwa c3 00 00.',
        'it': 'Non c’è nulla da caricare. Scrivi dei byte in esadecimale, ad esempio c3 00 00.',
        'pt-BR': 'Nada para carregar. Digite alguns bytes em hex, como c3 00 00.',
        'zh': '没有可加载的内容。请输入十六进制字节，例如 c3 00 00。',
        'zh-TW': '沒有可載入的內容。請輸入十六進位位元組，例如 c3 00 00。',
        'ja': '読み込むものがありません。16 進数でバイト列を入力してください。例えば c3 00 00。',
        'ko': '불러올 내용이 없습니다. 16진수 바이트를 입력하세요. 예: c3 00 00.',
    },

    'load-data-bad': {
        'en': '"{text}" is not a byte. A byte is one or two hex digits, such as c3 or 0f.',
        'es': '"{text}" no es un byte. Un byte son uno o dos dígitos hex, por ejemplo c3 o 0f.',
        'fr': '« {text} » n’est pas un octet. Un octet s’écrit avec un ou deux chiffres hexadécimaux, par exemple c3 ou 0f.',
        'de': '"{text}" ist kein Byte. Ein Byte sind eine oder zwei Hex-Ziffern, etwa c3 oder 0f.',
        'it': '"{text}" non è un byte. Un byte è una o due cifre esadecimali, ad esempio c3 o 0f.',
        'pt-BR': '"{text}" não é um byte. Um byte tem um ou dois dígitos hexadecimais, como c3 ou 0f.',
        'zh': '“{text}” 不是一个字节。字节是一到两位十六进制数字，例如 c3 或 0f。',
        'zh-TW': '「{text}」不是一個位元組。位元組是一到兩位十六進位數字，例如 c3 或 0f。',
        'ja': '「{text}」はバイトではありません。バイトは 16 進数 1 桁か 2 桁です。例えば c3 や 0f。',
        'ko': '"{text}"은(는) 바이트가 아닙니다. 바이트는 16진수 한두 자리입니다. 예: c3 또는 0f.',
    },

    'load-data-too-long': {
        'en': 'That is {bytes} bytes and the machine has {size}. Install more memory, or load fewer.',
        'es': 'Son {bytes} bytes y la máquina tiene {size}. Instala más memoria o carga menos.',
        'fr': 'Cela fait {bytes} octets et la machine en a {size}. Installez plus de mémoire, ou chargez-en moins.',
        'de': 'Das sind {bytes} Bytes, die Maschine hat {size}. Bauen Sie mehr Speicher ein oder laden Sie weniger.',
        'it': 'Sono {bytes} byte e la macchina ne ha {size}. Installa più memoria, o caricane meno.',
        'pt-BR': 'São {bytes} bytes, e a máquina tem {size}. Instale mais memória ou carregue menos.',
        'zh': '这是 {bytes} 字节，而机器只有 {size}。请加装内存，或少载入一些。',
        'zh-TW': '這是 {bytes} 位元組，而機器只有 {size}。請加裝記憶體，或少載入一些。',
        'ja': '{bytes} バイトありますが、マシンは {size} しかありません。メモリを増やすか、量を減らしてください。',
        'ko': '{bytes}바이트인데 기계에는 {size}뿐입니다. 메모리를 늘리거나 더 적게 불러오세요.',
    },

    'load-data-odd': {
        'en': '"{text}" has an odd number of hex digits, so it is not a whole number of bytes.',
        'es': '"{text}" tiene un número impar de dígitos hex, así que no son bytes completos.',
        'fr': '« {text} » a un nombre impair de chiffres hexadécimaux, ce ne sont donc pas des octets entiers.',
        'de': '"{text}" hat eine ungerade Anzahl Hex-Ziffern und ergibt damit keine ganzen Bytes.',
        'it': '"{text}" ha un numero dispari di cifre esadecimali, quindi non sono byte interi.',
        'pt-BR': '"{text}" tem um número ímpar de dígitos hexadecimais, então não forma um número inteiro de bytes.',
        'zh': '“{text}” 的十六进制位数是奇数，凑不成整数个字节。',
        'zh-TW': '「{text}」的十六進位位數是奇數，湊不成整數個位元組。',
        'ja': '「{text}」は 16 進数の桁数が奇数なので、バイトの区切りになりません。',
        'ko': '"{text}"은(는) 16진수 자릿수가 홀수여서 온전한 바이트가 되지 않습니다.',
    },

    'load-data-loaded': {
        'en': 'Loaded {bytes} bytes at 0000H.',
        'es': 'Cargados {bytes} bytes en 0000H.',
        'fr': '{bytes} octets chargés en 0000H.',
        'de': '{bytes} Bytes bei 0000H geladen.',
        'it': 'Caricati {bytes} byte a 0000H.',
        'pt-BR': '{bytes} bytes carregados em 0000H.',
        'zh': '已在 0000H 载入 {bytes} 字节。',
        'zh-TW': '已在 0000H 載入 {bytes} 位元組。',
        'ja': '0000H に {bytes} バイトを読み込みました。',
        'ko': '0000H에 {bytes}바이트를 불러왔습니다.',
    },

    'debug-fill-zero': {
        'en': 'Zero All Memory',
        'es': 'Poner Memoria a Cero',
        'fr': 'Mettre la Mémoire à Zéro',
        'de': 'Speicher Nullsetzen',
        'it': 'Azzera la Memoria',
        'pt-BR': 'Zerar Toda a Memória',
        'zh': '内存清零',
        'zh-TW': '記憶體清零',
        'ja': 'メモリをゼロに',
        'ko': '메모리 0으로',
    },

    'mem-page-prev-title': {
        'en': 'Previous page of memory',
        'es': 'Página anterior de memoria',
        'fr': 'Page de mémoire précédente',
        'de': 'Vorherige Speicherseite',
        'it': 'Pagina di memoria precedente',
        'pt-BR': 'Página anterior da memória',
        'zh': '上一页内存',
        'zh-TW': '上一頁記憶體',
        'ja': 'メモリの前のページ',
        'ko': '이전 메모리 페이지',
    },

    'mem-page-next-title': {
        'en': 'Next page of memory',
        'es': 'Página siguiente de memoria',
        'fr': 'Page de mémoire suivante',
        'de': 'Nächste Speicherseite',
        'it': 'Pagina di memoria successiva',
        'pt-BR': 'Próxima página da memória',
        'zh': '下一页内存',
        'zh-TW': '下一頁記憶體',
        'ja': 'メモリの次のページ',
        'ko': '다음 메모리 페이지',
    },

    'mem-nav-off': {
        'en': 'The machine is off, so there is no memory dump to move around in. Switch it on first.',
        'es': 'La máquina está apagada, así que no hay volcado de memoria por el que moverse. Enciéndela primero.',
        'fr': 'La machine est éteinte, il n\'y a donc aucun vidage mémoire à parcourir. Allumez-la d\'abord.',
        'de': 'Die Maschine ist aus, es gibt also keinen Speicherauszug zum Blättern. Schalten Sie sie zuerst ein.',
        'it': 'La macchina è spenta, quindi non c\'è alcun dump di memoria da scorrere. Accendila prima.',
        'pt-BR': 'A máquina está desligada, então não há despejo de memória para percorrer. Ligue-a primeiro.',
        'zh': '机器已关闭，没有内存转储可以浏览。请先开机。',
        'zh-TW': '機器已關閉，沒有記憶體傾印可以瀏覽。請先開機。',
        'ja': '電源が入っていないので、たどるメモリダンプがありません。先に電源を入れてください。',
        'ko': '기계가 꺼져 있어 살펴볼 메모리 덤프가 없습니다. 먼저 전원을 켜세요.',
    },

    'mem-nav-fits': {
        'en': 'All {size} is on screen at once. Install 4 KB or 8 KB and the dump gets a window to move.',
        'es': 'Los {size} caben en pantalla de una vez. Instala 4 KB u 8 KB y el volcado tendrá una ventana que mover.',
        'fr': 'Les {size} tiennent à l’écran d’un seul coup. Installez 4 Ko ou 8 Ko et le vidage aura une fenêtre à déplacer.',
        'de': 'Die {size} passen auf einmal auf den Bildschirm. Bauen Sie 4 KB oder 8 KB ein, dann bekommt der Auszug ein Fenster zum Verschieben.',
        'it': 'Tutti i {size} stanno sullo schermo in una volta. Installa 4 KB o 8 KB e il dump avrà una finestra da spostare.',
        'pt-BR': 'Todos os {size} cabem na tela de uma vez. Instale 4 KB ou 8 KB e o despejo ganha uma janela para percorrer.',
        'zh': '{size} 一屏就能显示完。装上 4 KB 或 8 KB，转储才会有可移动的窗口。',
        'zh-TW': '{size} 一個畫面就能顯示完。裝上 4 KB 或 8 KB，傾印才會有可移動的視窗。',
        'ja': '{size} は一画面に収まります。4 KB か 8 KB を増設すると、ダンプに動かせる窓ができます。',
        'ko': '{size}는 한 화면에 모두 들어갑니다. 4 KB나 8 KB를 설치하면 덤프에 옮길 창이 생깁니다.',
    },

    'mem-dump-hint': {
        'en': 'Click a byte, then type two hex digits to change it.',
        'es': 'Haz clic en un byte y escribe dos dígitos hex para cambiarlo.',
        'fr': 'Cliquez sur un octet, puis tapez deux chiffres hexadécimaux pour le modifier.',
        'de': 'Klicken Sie auf ein Byte und tippen Sie zwei Hex-Ziffern, um es zu ändern.',
        'it': 'Fai clic su un byte, poi digita due cifre esadecimali per cambiarlo.',
        'pt-BR': 'Clique em um byte e digite dois dígitos hex para alterá-lo.',
        'zh': '点击一个字节，再输入两位十六进制数即可修改它。',
        'zh-TW': '點擊一個位元組，再輸入兩位十六進位數即可修改它。',
        'ja': 'バイトをクリックし、16 進数を 2 桁入力すると書き換えられます。',
        'ko': '바이트를 클릭한 뒤 16진수 두 자리를 입력하면 바뀝니다.',
    },

    'mem-edit-hint': {
        'en': 'Type two hex digits to change the selected byte. The arrow keys move between bytes; Esc stops.',
        'es': 'Escribe dos dígitos hex para cambiar el byte seleccionado. Las flechas mueven entre bytes; Esc termina.',
        'fr': 'Tapez deux chiffres hexadécimaux pour modifier l’octet choisi. Les flèches passent d’un octet à l’autre ; Échap arrête.',
        'de': 'Tippen Sie zwei Hex-Ziffern, um das gewählte Byte zu ändern. Die Pfeiltasten wechseln das Byte; Esc beendet.',
        'it': 'Digita due cifre esadecimali per cambiare il byte scelto. Le frecce passano da un byte all’altro; Esc termina.',
        'pt-BR': 'Digite dois dígitos hex para alterar o byte selecionado. As setas movem entre os bytes; Esc encerra.',
        'zh': '输入两位十六进制数即可修改选中的字节。方向键在字节间移动；按 Esc 结束。',
        'zh-TW': '輸入兩位十六進位數即可修改選取的位元組。方向鍵在位元組間移動；按 Esc 結束。',
        'ja': '16 進数を 2 桁入力すると、選んだバイトを書き換えます。矢印キーでバイト間を移動し、Esc で終わります。',
        'ko': '16진수 두 자리를 입력하면 선택한 바이트가 바뀝니다. 화살표 키로 바이트 사이를 이동하고, Esc로 끝냅니다.',
    },

    'mem-edit-running': {
        'en': 'Memory can be edited only while the machine is stopped. Click STOP first.',
        'es': 'La memoria solo se puede editar con la máquina detenida. Pulsa STOP primero.',
        'fr': 'La mémoire ne se modifie que machine arrêtée. Cliquez d’abord sur STOP.',
        'de': 'Der Speicher lässt sich nur bei angehaltener Maschine bearbeiten. Klicken Sie zuerst STOP.',
        'it': 'La memoria si può modificare solo a macchina ferma. Premi prima STOP.',
        'pt-BR': 'A memória só pode ser editada com a máquina parada. Clique em STOP primeiro.',
        'zh': '只有机器停止时才能编辑内存。请先点击 STOP。',
        'zh-TW': '只有機器停止時才能編輯記憶體。請先點擊 STOP。',
        'ja': 'メモリは機械が止まっているときだけ編集できます。先に STOP をクリックしてください。',
        'ko': '메모리는 기계가 멈춰 있을 때만 편집할 수 있습니다. 먼저 STOP을 누르세요.',
    },

    'mem-edit-protected': {
        'en': '{address}H is protected, so it was not changed. UNPROTECT it first.',
        'es': '{address}H está protegida, así que no se cambió. Desprotégela primero con UNPROTECT.',
        'fr': '{address}H est protégée : rien n’a été modifié. Faites d’abord UNPROTECT.',
        'de': '{address}H ist geschützt und wurde nicht geändert. Geben Sie sie zuerst mit UNPROTECT frei.',
        'it': '{address}H è protetta, quindi non è stata cambiata. Prima sproteggila con UNPROTECT.',
        'pt-BR': '{address}H está protegida, então não foi alterada. Desproteja-a primeiro com UNPROTECT.',
        'zh': '{address}H 受保护，没有被修改。请先按 UNPROTECT。',
        'zh-TW': '{address}H 受保護，沒有被修改。請先按 UNPROTECT。',
        'ja': '{address}H は保護されているため、書き換えられませんでした。先に UNPROTECT してください。',
        'ko': '{address}H는 보호되어 있어 바뀌지 않았습니다. 먼저 UNPROTECT하세요.',
    },

    'asm-assemble': {
        'en': 'Assemble',
        'es': 'Ensamblar',
        'fr': 'Assembler',
        'de': 'Assemblieren',
        'it': 'Assembla',
        'pt-BR': 'Montar',
        'zh': '汇编',
        'zh-TW': '組譯',
        'ja': 'アセンブル',
        'ko': '어셈블',
    },

    'asm-assemble-title': {
        'en': 'Assemble, and put the program into memory (Ctrl+Enter)',
        'es': 'Ensamblar y poner el programa en memoria (Ctrl+Intro)',
        'fr': 'Assembler, et mettre le programme en mémoire (Ctrl+Entrée)',
        'de': 'Assemblieren und das Programm in den Speicher laden (Strg+Eingabe)',
        'it': 'Assembla e metti il programma in memoria (Ctrl+Invio)',
        'pt-BR': 'Montar e pôr o programa na memória (Ctrl+Enter)',
        'zh': '汇编，并把程序放入内存（Ctrl+Enter）',
        'zh-TW': '組譯，並把程式放入記憶體（Ctrl+Enter）',
        'ja': 'アセンブルして、プログラムをメモリに入れます（Ctrl+Enter）',
        'ko': '어셈블하고 프로그램을 메모리에 넣습니다(Ctrl+Enter)',
    },

    'asm-examples': {
        'en': 'Examples',
        'es': 'Ejemplos',
        'fr': 'Exemples',
        'de': 'Beispiele',
        'it': 'Esempi',
        'pt-BR': 'Exemplos',
        'zh': '示例',
        'zh-TW': '範例',
        'ja': 'サンプル',
        'ko': '예제',
    },

    'asm-source-label': {
        'en': 'Source',
        'es': 'Código fuente',
        'fr': 'Source',
        'de': 'Quelltext',
        'it': 'Sorgente',
        'pt-BR': 'Código-fonte',
        'zh': '源程序',
        'zh-TW': '原始程式',
        'ja': 'ソース',
        'ko': '소스',
    },

    'asm-listing-label': {
        'en': 'Listing',
        'es': 'Listado',
        'fr': 'Listage',
        'de': 'Listing',
        'it': 'Listato',
        'pt-BR': 'Listagem',
        'zh': '列表',
        'zh-TW': '列表',
        'ja': 'リスト',
        'ko': '리스팅',
    },

    'asm-show-listing': {
        'en': 'Listing',
        'es': 'Listado',
        'fr': 'Listage',
        'de': 'Listing',
        'it': 'Listato',
        'pt-BR': 'Listagem',
        'zh': '列表',
        'zh-TW': '列表',
        'ja': 'リスト',
        'ko': '리스팅',
    },

    'asm-show-source': {
        'en': 'Source',
        'es': 'Código fuente',
        'fr': 'Source',
        'de': 'Quelltext',
        'it': 'Sorgente',
        'pt-BR': 'Código-fonte',
        'zh': '源程序',
        'zh-TW': '原始程式',
        'ja': 'ソース',
        'ko': '소스',
    },

    'asm-summary-ok': {
        'en': '{bytes} bytes, {start}H-{end}H',
        'es': '{bytes} bytes, {start}H-{end}H',
        'fr': '{bytes} octets, {start}H-{end}H',
        'de': '{bytes} Bytes, {start}H-{end}H',
        'it': '{bytes} byte, {start}H-{end}H',
        'pt-BR': '{bytes} bytes, {start}H-{end}H',
        'zh': '{bytes} 字节，{start}H-{end}H',
        'zh-TW': '{bytes} 位元組，{start}H-{end}H',
        'ja': '{bytes} バイト、{start}H-{end}H',
        'ko': '{bytes}바이트, {start}H-{end}H',
    },

    'asm-summary-errors': {
        'en': 'Errors: {count}',
        'es': 'Errores: {count}',
        'fr': 'Erreurs : {count}',
        'de': 'Fehler: {count}',
        'it': 'Errori: {count}',
        'pt-BR': 'Erros: {count}',
        'zh': '错误：{count}',
        'zh-TW': '錯誤：{count}',
        'ja': 'エラー：{count}',
        'ko': '오류: {count}',
    },

    'asm-error-at': {
        'en': 'Line {line}: {message}',
        'es': 'Línea {line}: {message}',
        'fr': 'Ligne {line} : {message}',
        'de': 'Zeile {line}: {message}',
        'it': 'Riga {line}: {message}',
        'pt-BR': 'Linha {line}: {message}',
        'zh': '第 {line} 行：{message}',
        'zh-TW': '第 {line} 行：{message}',
        'ja': '{line} 行目：{message}',
        'ko': '{line}행: {message}',
    },

    'asm-error-in-macro': {
        'en': 'Line {line}, in {macro} (line {macroLine}): {message}',
        'es': 'Línea {line}, en {macro} (línea {macroLine}): {message}',
        'fr': 'Ligne {line}, dans {macro} (ligne {macroLine}) : {message}',
        'de': 'Zeile {line}, in {macro} (Zeile {macroLine}): {message}',
        'it': 'Riga {line}, in {macro} (riga {macroLine}): {message}',
        'pt-BR': 'Linha {line}, em {macro} (linha {macroLine}): {message}',
        'zh': '第 {line} 行，在 {macro} 中（第 {macroLine} 行）：{message}',
        'zh-TW': '第 {line} 行，在 {macro} 中（第 {macroLine} 行）：{message}',
        'ja': '{line} 行目、{macro} の中（{macroLine} 行目）：{message}',
        'ko': '{line}행, {macro} 안({macroLine}행): {message}',
    },

    'asm-loaded': {
        'en': 'Assembled {bytes} bytes at {start}H-{end}H and pressed RESET. Click RUN on the front panel.',
        'es': 'Ensamblados {bytes} bytes en {start}H-{end}H y pulsado RESET. Pulsa RUN en el panel frontal.',
        'fr': '{bytes} octets assemblés en {start}H-{end}H, et RESET appuyé. Cliquez sur RUN en façade.',
        'de': '{bytes} Bytes bei {start}H-{end}H assembliert und RESET gedrückt. Klicken Sie RUN an der Frontplatte.',
        'it': 'Assemblati {bytes} byte a {start}H-{end}H e premuto RESET. Premi RUN sul pannello frontale.',
        'pt-BR': '{bytes} bytes montados em {start}H-{end}H, e RESET pressionado. Clique em RUN no painel frontal.',
        'zh': '已在 {start}H-{end}H 汇编 {bytes} 字节并按下 RESET。请点击前面板上的 RUN。',
        'zh-TW': '已在 {start}H-{end}H 組譯 {bytes} 位元組並按下 RESET。請點擊前面板上的 RUN。',
        'ja': '{start}H-{end}H に {bytes} バイトをアセンブルし、RESET を押しました。フロントパネルの RUN をクリックしてください。',
        'ko': '{start}H-{end}H에 {bytes}바이트를 어셈블하고 RESET을 눌렀습니다. 앞판의 RUN을 누르세요.',
    },

    'asm-loaded-at': {
        'en': 'Assembled {bytes} bytes at {start}H-{end}H, pressed RESET and examined {entry}H, where the program starts. Click RUN on the front panel.',
        'es': 'Ensamblados {bytes} bytes en {start}H-{end}H, pulsado RESET y examinada {entry}H, donde empieza el programa. Pulsa RUN en el panel frontal.',
        'fr': '{bytes} octets assemblés en {start}H-{end}H, RESET appuyé et {entry}H examinée, là où le programme commence. Cliquez sur RUN en façade.',
        'de': '{bytes} Bytes bei {start}H-{end}H assembliert, RESET gedrückt und {entry}H, wo das Programm beginnt, mit EXAMINE gewählt. Klicken Sie RUN an der Frontplatte.',
        'it': 'Assemblati {bytes} byte a {start}H-{end}H, premuto RESET ed esaminato {entry}H, dove il programma comincia. Premi RUN sul pannello frontale.',
        'pt-BR': '{bytes} bytes montados em {start}H-{end}H, RESET pressionado e {entry}H examinado, onde o programa começa. Clique em RUN no painel frontal.',
        'zh': '已在 {start}H-{end}H 汇编 {bytes} 字节，按下 RESET 并 EXAMINE 了程序起点 {entry}H。请点击前面板上的 RUN。',
        'zh-TW': '已在 {start}H-{end}H 組譯 {bytes} 位元組，按下 RESET 並 EXAMINE 了程式起點 {entry}H。請點擊前面板上的 RUN。',
        'ja': '{start}H-{end}H に {bytes} バイトをアセンブルし、RESET を押して、プログラムの始まる {entry}H を EXAMINE しました。フロントパネルの RUN をクリックしてください。',
        'ko': '{start}H-{end}H에 {bytes}바이트를 어셈블하고, RESET을 누른 뒤 프로그램이 시작하는 {entry}H를 EXAMINE했습니다. 앞판의 RUN을 누르세요.',
    },

    'asm-has-errors': {
        'en': 'The program has errors, so nothing was loaded. They are listed under the source: {count} in all.',
        'es': 'El programa tiene errores, así que no se cargó nada. Están bajo el código fuente: {count} en total.',
        'fr': 'Le programme comporte des erreurs : rien n’a été chargé. Elles sont listées sous la source, {count} en tout.',
        'de': 'Das Programm hat Fehler, also wurde nichts geladen. Sie stehen unter dem Quelltext: {count} insgesamt.',
        'it': 'Il programma ha errori, quindi non è stato caricato nulla. Sono elencati sotto il sorgente: {count} in tutto.',
        'pt-BR': 'O programa tem erros, então nada foi carregado. Eles estão listados sob o código-fonte: {count} no total.',
        'zh': '程序有错误，所以没有载入任何内容。错误列在源程序下方，共 {count} 个。',
        'zh-TW': '程式有錯誤，所以沒有載入任何內容。錯誤列在原始程式下方，共 {count} 個。',
        'ja': 'プログラムにエラーがあるため、何も読み込みませんでした。ソースの下に全 {count} 件を挙げています。',
        'ko': '프로그램에 오류가 있어 아무것도 불러오지 않았습니다. 소스 아래에 모두 {count}개를 적었습니다.',
    },

    'asm-empty': {
        'en': 'There is nothing to assemble yet. Write a program, or choose one from Examples.',
        'es': 'Aún no hay nada que ensamblar. Escribe un programa o elige uno de Ejemplos.',
        'fr': 'Il n’y a encore rien à assembler. Écrivez un programme, ou choisissez-en un dans Exemples.',
        'de': 'Es gibt noch nichts zu assemblieren. Schreiben Sie ein Programm, oder wählen Sie eines unter Beispiele.',
        'it': 'Non c’è ancora nulla da assemblare. Scrivi un programma o scegline uno da Esempi.',
        'pt-BR': 'Ainda não há nada para montar. Escreva um programa ou escolha um em Exemplos.',
        'zh': '还没有可汇编的内容。请写一个程序，或从“示例”中选一个。',
        'zh-TW': '還沒有可組譯的內容。請寫一個程式，或從「範例」中選一個。',
        'ja': 'まだアセンブルするものがありません。プログラムを書くか、サンプルから選んでください。',
        'ko': '아직 어셈블할 것이 없습니다. 프로그램을 쓰거나 예제에서 고르세요.',
    },

    'asm-example-loaded': {
        'en': '{name} is in the editor. Click Assemble to put it into memory.',
        'es': '{name} está en el editor. Pulsa Ensamblar para ponerlo en memoria.',
        'fr': '{name} est dans l’éditeur. Cliquez sur Assembler pour le mettre en mémoire.',
        'de': '{name} steht im Editor. Klicken Sie Assemblieren, um es in den Speicher zu laden.',
        'it': '{name} è nell’editor. Premi Assembla per metterlo in memoria.',
        'pt-BR': '{name} está no editor. Clique em Montar para pô-lo na memória.',
        'zh': '{name} 已在编辑器中。点击“汇编”即可放入内存。',
        'zh-TW': '{name} 已在編輯器中。點擊「組譯」即可放入記憶體。',
        'ja': '{name} をエディタに入れました。アセンブルをクリックするとメモリに入ります。',
        'ko': '{name}을(를) 편집기에 넣었습니다. 어셈블을 누르면 메모리에 들어갑니다.',
    },

    'asm-replace-title': {
        'en': 'Replace the Source?',
        'es': '¿Reemplazar el Código?',
        'fr': 'Remplacer la Source ?',
        'de': 'Quelltext Ersetzen?',
        'it': 'Sostituire il Sorgente?',
        'pt-BR': 'Substituir o Código?',
        'zh': '替换源程序？',
        'zh-TW': '替換原始程式？',
        'ja': 'ソースを置き換えますか？',
        'ko': '소스를 바꿀까요?',
    },

    'asm-replace-desc': {
        'en': "The editor's text will be replaced by {name}. It is not kept anywhere else.",
        'es': 'El texto del editor se reemplazará por {name}. No se guarda en ningún otro sitio.',
        'fr': 'Le texte de l’éditeur sera remplacé par {name}. Il n’est conservé nulle part ailleurs.',
        'de': 'Der Text im Editor wird durch {name} ersetzt. Er wird nirgends sonst aufbewahrt.',
        'it': 'Il testo dell’editor sarà sostituito da {name}. Non è conservato altrove.',
        'pt-BR': 'O texto do editor será substituído por {name}. Ele não é guardado em nenhum outro lugar.',
        'zh': '编辑器中的文本将被 {name} 替换，而它没有保存在别处。',
        'zh-TW': '編輯器中的文字將被 {name} 替換，而它沒有保存在別處。',
        'ja': 'エディタの内容は {name} に置き換わります。ほかのどこにも保存されていません。',
        'ko': '편집기의 내용이 {name}(으)로 바뀝니다. 다른 곳에는 남아 있지 않습니다.',
    },

    'asm-replace-cancel': {
        'en': 'Cancel',
        'es': 'Cancelar',
        'fr': 'Annuler',
        'de': 'Abbrechen',
        'it': 'Annulla',
        'pt-BR': 'Cancelar',
        'zh': '取消',
        'zh-TW': '取消',
        'ja': 'キャンセル',
        'ko': '취소',
    },

    'asm-replace-ok': {
        'en': 'Replace',
        'es': 'Reemplazar',
        'fr': 'Remplacer',
        'de': 'Ersetzen',
        'it': 'Sostituisci',
        'pt-BR': 'Substituir',
        'zh': '替换',
        'zh-TW': '替換',
        'ja': '置き換える',
        'ko': '바꾸기',
    },

    'asm-unterminated-string': {
        'en': '{text} is not closed: a string needs a quote at its end.',
        'es': '{text} no está cerrada: una cadena necesita una comilla al final.',
        'fr': '{text} n’est pas fermée : une chaîne a besoin d’un guillemet à la fin.',
        'de': '{text} ist nicht geschlossen: Eine Zeichenkette braucht am Ende ein Anführungszeichen.',
        'it': '{text} non è chiusa: una stringa ha bisogno di una virgoletta alla fine.',
        'pt-BR': '{text} não está fechada: uma string precisa de uma aspa no fim.',
        'zh': '{text} 没有结束：字符串的末尾需要一个引号。',
        'zh-TW': '{text} 沒有結束：字串的結尾需要一個引號。',
        'ja': '{text} が閉じていません。文字列の終わりには引用符が必要です。',
        'ko': '{text}가 닫히지 않았습니다. 문자열 끝에는 따옴표가 필요합니다.',
    },

    'asm-bad-character': {
        'en': '{text} has no meaning in 8080 assembly language.',
        'es': '{text} no significa nada en el lenguaje ensamblador del 8080.',
        'fr': '{text} n’a pas de sens dans le langage d’assemblage du 8080.',
        'de': '{text} hat in der Assemblersprache des 8080 keine Bedeutung.',
        'it': '{text} non ha significato nel linguaggio assembly dell’8080.',
        'pt-BR': '{text} não tem significado na linguagem assembly do 8080.',
        'zh': '{text} 在 8080 汇编语言中没有意义。',
        'zh-TW': '{text} 在 8080 組合語言中沒有意義。',
        'ja': '{text} は 8080 のアセンブリ言語では意味を持ちません。',
        'ko': '{text}는 8080 어셈블리 언어에서 아무 뜻이 없습니다.',
    },

    'asm-unknown-code': {
        'en': '{word} is not an instruction, a pseudo-instruction or a macro. A label needs a colon after it.',
        'es': '{word} no es una instrucción, una pseudoinstrucción ni una macro. Una etiqueta necesita dos puntos detrás.',
        'fr': '{word} n’est ni une instruction, ni une pseudo-instruction, ni une macro. Une étiquette est suivie de deux-points.',
        'de': '{word} ist weder ein Befehl noch eine Pseudoanweisung noch ein Makro. Hinter einem Label steht ein Doppelpunkt.',
        'it': '{word} non è un’istruzione, una pseudo-istruzione o una macro. Un’etichetta vuole i due punti dopo.',
        'pt-BR': '{word} não é uma instrução, uma pseudoinstrução nem uma macro. Um rótulo precisa de dois-pontos depois.',
        'zh': '{word} 不是指令、伪指令，也不是宏。标号后面要有冒号。',
        'zh-TW': '{word} 不是指令、虛擬指令，也不是巨集。標籤後面要有冒號。',
        'ja': '{word} は命令でも疑似命令でもマクロでもありません。ラベルの後にはコロンが必要です。',
        'ko': '{word}는 명령어도, 의사 명령어도, 매크로도 아닙니다. 레이블 뒤에는 콜론이 필요합니다.',
    },

    'asm-macro-before-definition': {
        'en': '{word} is a macro defined further down. Define it above its first use.',
        'es': '{word} es una macro definida más abajo. Defínela antes de su primer uso.',
        'fr': '{word} est une macro définie plus bas. Définissez-la avant sa première utilisation.',
        'de': '{word} ist ein Makro, das weiter unten definiert ist. Definieren Sie es vor seiner ersten Verwendung.',
        'it': '{word} è una macro definita più in basso. Definiscila prima del suo primo uso.',
        'pt-BR': '{word} é uma macro definida mais abaixo. Defina-a acima do seu primeiro uso.',
        'zh': '{word} 是在下面才定义的宏。请把它定义在第一次使用之前。',
        'zh-TW': '{word} 是在下面才定義的巨集。請把它定義在第一次使用之前。',
        'ja': '{word} はこれより下で定義されているマクロです。最初に使う所より上で定義してください。',
        'ko': '{word}는 더 아래에서 정의된 매크로입니다. 처음 쓰는 곳보다 위에서 정의하세요.',
    },

    'asm-operands': {
        'en': '{code} is not written like that. It is written as in {example}.',
        'es': '{code} no se escribe así. Se escribe como en {example}.',
        'fr': '{code} ne s’écrit pas ainsi. Il s’écrit comme dans {example}.',
        'de': '{code} wird nicht so geschrieben, sondern wie in {example}.',
        'it': '{code} non si scrive così. Si scrive come in {example}.',
        'pt-BR': '{code} não se escreve assim. Escreve-se como em {example}.',
        'zh': '{code} 不是这样写的，应写作 {example} 的样子。',
        'zh-TW': '{code} 不是這樣寫的，應寫作 {example} 的樣子。',
        'ja': '{code} の書き方が違います。{example} のように書きます。',
        'ko': '{code}는 그렇게 쓰지 않습니다. {example}처럼 씁니다.',
    },

    'asm-not-register': {
        'en': '{text} is not a register. A register is B, C, D, E, H, L, M or A.',
        'es': '{text} no es un registro. Un registro es B, C, D, E, H, L, M o A.',
        'fr': '{text} n’est pas un registre. Un registre est B, C, D, E, H, L, M ou A.',
        'de': '{text} ist kein Register. Ein Register ist B, C, D, E, H, L, M oder A.',
        'it': '{text} non è un registro. Un registro è B, C, D, E, H, L, M o A.',
        'pt-BR': '{text} não é um registrador. Um registrador é B, C, D, E, H, L, M ou A.',
        'zh': '{text} 不是寄存器。寄存器是 B、C、D、E、H、L、M 或 A。',
        'zh-TW': '{text} 不是暫存器。暫存器是 B、C、D、E、H、L、M 或 A。',
        'ja': '{text} はレジスタではありません。レジスタは B、C、D、E、H、L、M、A です。',
        'ko': '{text}는 레지스터가 아닙니다. 레지스터는 B, C, D, E, H, L, M, A입니다.',
    },

    'asm-not-pair': {
        'en': '{text} is not a register pair here. It takes B, D, H or SP.',
        'es': '{text} no es aquí un par de registros. Se admite B, D, H o SP.',
        'fr': '{text} n’est pas ici une paire de registres. Il faut B, D, H ou SP.',
        'de': '{text} ist hier kein Registerpaar. Möglich sind B, D, H oder SP.',
        'it': '{text} non è qui una coppia di registri. Si usa B, D, H o SP.',
        'pt-BR': '{text} não é aqui um par de registradores. Aceita B, D, H ou SP.',
        'zh': '{text} 在这里不是寄存器对。这里可用 B、D、H 或 SP。',
        'zh-TW': '{text} 在這裡不是暫存器對。這裡可用 B、D、H 或 SP。',
        'ja': '{text} はここではレジスタペアではありません。B、D、H、SP のどれかです。',
        'ko': '{text}는 여기서 레지스터 쌍이 아닙니다. B, D, H, SP 중 하나입니다.',
    },

    'asm-not-pair-psw': {
        'en': '{text} is not a register pair for PUSH and POP. They take B, D, H or PSW.',
        'es': '{text} no es un par de registros para PUSH y POP. Admiten B, D, H o PSW.',
        'fr': '{text} n’est pas une paire de registres pour PUSH et POP. Ils prennent B, D, H ou PSW.',
        'de': '{text} ist kein Registerpaar für PUSH und POP. Möglich sind B, D, H oder PSW.',
        'it': '{text} non è una coppia di registri per PUSH e POP. Usano B, D, H o PSW.',
        'pt-BR': '{text} não é um par de registradores para PUSH e POP. Eles aceitam B, D, H ou PSW.',
        'zh': '{text} 不是 PUSH 和 POP 的寄存器对。它们可用 B、D、H 或 PSW。',
        'zh-TW': '{text} 不是 PUSH 和 POP 的暫存器對。它們可用 B、D、H 或 PSW。',
        'ja': '{text} は PUSH と POP のレジスタペアではありません。B、D、H、PSW のどれかです。',
        'ko': '{text}는 PUSH와 POP의 레지스터 쌍이 아닙니다. B, D, H, PSW 중 하나입니다.',
    },

    'asm-not-bd': {
        'en': '{text} cannot be used here: LDAX and STAX take only B or D.',
        'es': '{text} no se puede usar aquí: LDAX y STAX solo admiten B o D.',
        'fr': '{text} ne convient pas ici : LDAX et STAX ne prennent que B ou D.',
        'de': '{text} geht hier nicht: LDAX und STAX nehmen nur B oder D.',
        'it': '{text} non si può usare qui: LDAX e STAX accettano solo B o D.',
        'pt-BR': '{text} não pode ser usado aqui: LDAX e STAX só aceitam B ou D.',
        'zh': '这里不能用 {text}：LDAX 和 STAX 只接受 B 或 D。',
        'zh-TW': '這裡不能用 {text}：LDAX 和 STAX 只接受 B 或 D。',
        'ja': 'ここでは {text} は使えません。LDAX と STAX は B か D だけです。',
        'ko': '여기서는 {text}를 쓸 수 없습니다. LDAX와 STAX는 B나 D만 받습니다.',
    },

    'asm-rst-range': {
        'en': 'RST takes a number from 0 to 7, not {text}.',
        'es': 'RST admite un número del 0 al 7, no {text}.',
        'fr': 'RST prend un nombre de 0 à 7, pas {text}.',
        'de': 'RST nimmt eine Zahl von 0 bis 7, nicht {text}.',
        'it': 'RST accetta un numero da 0 a 7, non {text}.',
        'pt-BR': 'RST aceita um número de 0 a 7, não {text}.',
        'zh': 'RST 只接受 0 到 7 的数，不接受 {text}。',
        'zh-TW': 'RST 只接受 0 到 7 的數，不接受 {text}。',
        'ja': 'RST に使えるのは 0 から 7 までの数で、{text} は使えません。',
        'ko': 'RST는 0부터 7까지의 수만 받으며, {text}는 안 됩니다.',
    },

    'asm-mov-m-m': {
        'en': "MOV M,M is not an instruction: its code is HLT's.",
        'es': 'MOV M,M no es una instrucción: su código es el de HLT.',
        'fr': 'MOV M,M n’est pas une instruction : son code est celui de HLT.',
        'de': 'MOV M,M ist kein Befehl: Sein Code ist der von HLT.',
        'it': 'MOV M,M non è un’istruzione: il suo codice è quello di HLT.',
        'pt-BR': 'MOV M,M não é uma instrução: seu código é o de HLT.',
        'zh': 'MOV M,M 不是指令：它的编码是 HLT 的。',
        'zh-TW': 'MOV M,M 不是指令：它的編碼是 HLT 的。',
        'ja': 'MOV M,M は命令ではありません。そのコードは HLT のものです。',
        'ko': 'MOV M,M은 명령어가 아닙니다. 그 코드는 HLT의 것입니다.',
    },

    'asm-byte-range': {
        'en': '{text} is {value}H, which does not fit in a byte, 0 to 0FFH. For -1, write 0FFH, or add AND 0FFH.',
        'es': '{text} vale {value}H, que no cabe en un byte, de 0 a 0FFH. Para -1, escribe 0FFH o añade AND 0FFH.',
        'fr': '{text} vaut {value}H, qui ne tient pas dans un octet, de 0 à 0FFH. Pour -1, écrivez 0FFH, ou ajoutez AND 0FFH.',
        'de': '{text} ist {value}H und passt nicht in ein Byte, 0 bis 0FFH. Für -1 schreiben Sie 0FFH, oder fügen Sie AND 0FFH an.',
        'it': '{text} vale {value}H, che non sta in un byte, da 0 a 0FFH. Per -1 scrivi 0FFH, o aggiungi AND 0FFH.',
        'pt-BR': '{text} vale {value}H, que não cabe em um byte, de 0 a 0FFH. Para -1, escreva 0FFH ou acrescente AND 0FFH.',
        'zh': '{text} 等于 {value}H，放不进一个字节（0 到 0FFH）。要写 -1，请写 0FFH，或加上 AND 0FFH。',
        'zh-TW': '{text} 等於 {value}H，放不進一個位元組（0 到 0FFH）。要寫 -1，請寫 0FFH，或加上 AND 0FFH。',
        'ja': '{text} は {value}H で、1 バイト（0 から 0FFH）に収まりません。-1 なら 0FFH と書くか、AND 0FFH を付けてください。',
        'ko': '{text}는 {value}H로, 한 바이트(0부터 0FFH)에 들어가지 않습니다. -1이라면 0FFH로 쓰거나 AND 0FFH를 붙이세요.',
    },

    'asm-word-range': {
        'en': '{text} is bigger than 16 bits can hold.',
        'es': '{text} es mayor de lo que caben en 16 bits.',
        'fr': '{text} dépasse ce que 16 bits peuvent contenir.',
        'de': '{text} ist größer, als 16 Bit fassen.',
        'it': '{text} è più grande di quanto stia in 16 bit.',
        'pt-BR': '{text} é maior do que cabe em 16 bits.',
        'zh': '{text} 超出了 16 位能表示的范围。',
        'zh-TW': '{text} 超出了 16 位元能表示的範圍。',
        'ja': '{text} は 16 ビットに収まりません。',
        'ko': '{text}는 16비트에 담을 수 있는 것보다 큽니다.',
    },

    'asm-bad-number': {
        'en': '{text} is not a number. Hexadecimal ends in H and starts with a digit, as 0FFH.',
        'es': '{text} no es un número. El hexadecimal termina en H y empieza por un dígito, como 0FFH.',
        'fr': '{text} n’est pas un nombre. L’hexadécimal finit par H et commence par un chiffre, comme 0FFH.',
        'de': '{text} ist keine Zahl. Hexadezimal endet auf H und beginnt mit einer Ziffer, wie 0FFH.',
        'it': '{text} non è un numero. L’esadecimale finisce con H e comincia con una cifra, come 0FFH.',
        'pt-BR': '{text} não é um número. O hexadecimal termina em H e começa com um dígito, como 0FFH.',
        'zh': '{text} 不是数。十六进制数以 H 结尾、以数字开头，如 0FFH。',
        'zh-TW': '{text} 不是數。十六進位數以 H 結尾、以數字開頭，如 0FFH。',
        'ja': '{text} は数ではありません。16 進数は数字で始まり H で終わります。たとえば 0FFH です。',
        'ko': '{text}는 수가 아닙니다. 16진수는 숫자로 시작해 H로 끝납니다. 0FFH처럼요.',
    },

    'asm-bad-expression': {
        'en': '{text} is not an expression the assembler can read.',
        'es': '{text} no es una expresión que el ensamblador pueda leer.',
        'fr': '{text} n’est pas une expression que l’assembleur sait lire.',
        'de': '{text} ist kein Ausdruck, den der Assembler lesen kann.',
        'it': '{text} non è un’espressione che l’assembler sappia leggere.',
        'pt-BR': '{text} não é uma expressão que o montador consiga ler.',
        'zh': '{text} 不是汇编器能读懂的表达式。',
        'zh-TW': '{text} 不是組譯器能讀懂的運算式。',
        'ja': '{text} はアセンブラが読める式ではありません。',
        'ko': '{text}는 어셈블러가 읽을 수 있는 식이 아닙니다.',
    },

    'asm-empty-operand': {
        'en': 'An operand is missing.',
        'es': 'Falta un operando.',
        'fr': 'Il manque un opérande.',
        'de': 'Ein Operand fehlt.',
        'it': 'Manca un operando.',
        'pt-BR': 'Falta um operando.',
        'zh': '缺少一个操作数。',
        'zh-TW': '缺少一個運算元。',
        'ja': 'オペランドが足りません。',
        'ko': '피연산자가 빠졌습니다.',
    },

    'asm-string-value': {
        'en': '{text} has to be one or two characters to be a value.',
        'es': '{text} debe tener uno o dos caracteres para ser un valor.',
        'fr': '{text} doit faire un ou deux caractères pour être une valeur.',
        'de': '{text} muss ein oder zwei Zeichen lang sein, um ein Wert zu sein.',
        'it': '{text} deve avere uno o due caratteri per essere un valore.',
        'pt-BR': '{text} precisa ter um ou dois caracteres para ser um valor.',
        'zh': '{text} 要作为数值，只能有一到两个字符。',
        'zh-TW': '{text} 要作為數值，只能有一到兩個字元。',
        'ja': '{text} を値にするには 1 文字か 2 文字でなければなりません。',
        'ko': '{text}를 값으로 쓰려면 한두 글자여야 합니다.',
    },

    'asm-undefined': {
        'en': '{name} is not defined anywhere.',
        'es': '{name} no está definido en ningún sitio.',
        'fr': '{name} n’est défini nulle part.',
        'de': '{name} ist nirgends definiert.',
        'it': '{name} non è definito da nessuna parte.',
        'pt-BR': '{name} não está definido em lugar nenhum.',
        'zh': '{name} 没有在任何地方定义。',
        'zh-TW': '{name} 沒有在任何地方定義。',
        'ja': '{name} はどこにも定義されていません。',
        'ko': '{name}는 어디에도 정의되어 있지 않습니다.',
    },

    'asm-later': {
        'en': 'The address of what follows depends on {name}, which is defined further down. Define it above this line.',
        'es': 'La dirección de lo que sigue depende de {name}, que se define más abajo. Defínelo antes de esta línea.',
        'fr': 'L’adresse de ce qui suit dépend de {name}, défini plus bas. Définissez-le avant cette ligne.',
        'de': 'Die Adresse des Folgenden hängt von {name} ab, das weiter unten definiert ist. Definieren Sie es über dieser Zeile.',
        'it': 'L’indirizzo di ciò che segue dipende da {name}, definito più in basso. Definiscilo prima di questa riga.',
        'pt-BR': 'O endereço do que vem a seguir depende de {name}, definido mais abaixo. Defina-o acima desta linha.',
        'zh': '后面内容的地址取决于 {name}，而它在下面才定义。请把它定义在这一行之前。',
        'zh-TW': '後面內容的位址取決於 {name}，而它在下面才定義。請把它定義在這一行之前。',
        'ja': 'この後のアドレスは {name} で決まりますが、それはもっと下で定義されています。この行より上で定義してください。',
        'ko': '뒤따르는 것의 주소가 {name}에 달려 있는데, 그것은 더 아래에서 정의됩니다. 이 줄보다 위에서 정의하세요.',
    },

    'asm-divide-by-zero': {
        'en': 'This divides by zero.',
        'es': 'Esto divide entre cero.',
        'fr': 'Ceci divise par zéro.',
        'de': 'Hier wird durch null geteilt.',
        'it': 'Questo divide per zero.',
        'pt-BR': 'Isto divide por zero.',
        'zh': '这里除以零了。',
        'zh-TW': '這裡除以零了。',
        'ja': 'ゼロで割っています。',
        'ko': '0으로 나누고 있습니다.',
    },

    'asm-duplicate': {
        'en': '{name} is already defined, on line {other}.',
        'es': '{name} ya está definido, en la línea {other}.',
        'fr': '{name} est déjà défini, ligne {other}.',
        'de': '{name} ist schon definiert, in Zeile {other}.',
        'it': '{name} è già definito, alla riga {other}.',
        'pt-BR': '{name} já está definido, na linha {other}.',
        'zh': '{name} 已在第 {other} 行定义过。',
        'zh-TW': '{name} 已在第 {other} 行定義過。',
        'ja': '{name} はすでに {other} 行目で定義されています。',
        'ko': '{name}는 이미 {other}행에서 정의되었습니다.',
    },

    'asm-equ-of-set': {
        'en': '{name} was given its value by SET, on line {other}, so EQU cannot give it another.',
        'es': '{name} recibió su valor con SET, en la línea {other}, así que EQU no puede darle otro.',
        'fr': '{name} a reçu sa valeur par SET, ligne {other} : EQU ne peut pas lui en donner une autre.',
        'de': '{name} hat seinen Wert durch SET in Zeile {other} bekommen, also kann EQU ihm keinen anderen geben.',
        'it': '{name} ha avuto il suo valore da SET, alla riga {other}, quindi EQU non può dargliene un altro.',
        'pt-BR': '{name} recebeu seu valor por SET, na linha {other}, então EQU não pode lhe dar outro.',
        'zh': '{name} 在第 {other} 行已由 SET 赋值，EQU 不能再给它一个值。',
        'zh-TW': '{name} 在第 {other} 行已由 SET 賦值，EQU 不能再給它一個值。',
        'ja': '{name} は {other} 行目で SET により値が決まっているので、EQU で別の値にはできません。',
        'ko': '{name}는 {other}행에서 SET으로 값을 받았으므로 EQU로 다른 값을 줄 수 없습니다.',
    },

    'asm-set-of-equ': {
        'en': '{name} was given its value by EQU, on line {other}, so SET cannot change it.',
        'es': '{name} recibió su valor con EQU, en la línea {other}, así que SET no puede cambiarlo.',
        'fr': '{name} a reçu sa valeur par EQU, ligne {other} : SET ne peut pas la changer.',
        'de': '{name} hat seinen Wert durch EQU in Zeile {other} bekommen, also kann SET ihn nicht ändern.',
        'it': '{name} ha avuto il suo valore da EQU, alla riga {other}, quindi SET non può cambiarlo.',
        'pt-BR': '{name} recebeu seu valor por EQU, na linha {other}, então SET não pode mudá-lo.',
        'zh': '{name} 在第 {other} 行已由 EQU 赋值，SET 不能改变它。',
        'zh-TW': '{name} 在第 {other} 行已由 EQU 賦值，SET 不能改變它。',
        'ja': '{name} は {other} 行目で EQU により値が決まっているので、SET では変えられません。',
        'ko': '{name}는 {other}행에서 EQU로 값을 받았으므로 SET으로 바꿀 수 없습니다.',
    },

    'asm-needs-name': {
        'en': '{code} needs a name in front of it, as in COUNT {code} 5.',
        'es': '{code} necesita un nombre delante, como en COUNT {code} 5.',
        'fr': '{code} a besoin d’un nom devant lui, comme dans COUNT {code} 5.',
        'de': '{code} braucht einen Namen davor, wie in COUNT {code} 5.',
        'it': '{code} ha bisogno di un nome davanti, come in COUNT {code} 5.',
        'pt-BR': '{code} precisa de um nome antes, como em COUNT {code} 5.',
        'zh': '{code} 前面需要一个名字，如 COUNT {code} 5。',
        'zh-TW': '{code} 前面需要一個名字，如 COUNT {code} 5。',
        'ja': '{code} の前には名前が必要です。COUNT {code} 5 のように書きます。',
        'ko': '{code} 앞에는 이름이 필요합니다. COUNT {code} 5처럼 씁니다.',
    },

    'asm-reserved': {
        'en': '{name} belongs to the language, and cannot be used as a name.',
        'es': '{name} pertenece al lenguaje y no se puede usar como nombre.',
        'fr': '{name} appartient au langage, et ne peut pas servir de nom.',
        'de': '{name} gehört zur Sprache und kann nicht als Name dienen.',
        'it': '{name} appartiene al linguaggio e non si può usare come nome.',
        'pt-BR': '{name} pertence à linguagem e não pode ser usado como nome.',
        'zh': '{name} 是语言本身的词，不能用作名字。',
        'zh-TW': '{name} 是語言本身的詞，不能用作名字。',
        'ja': '{name} は言語そのものの語なので、名前には使えません。',
        'ko': '{name}는 언어 자체의 낱말이라 이름으로 쓸 수 없습니다.',
    },

    'asm-endif-without-if': {
        'en': 'This ENDIF has no IF before it.',
        'es': 'Este ENDIF no tiene un IF antes.',
        'fr': 'Ce ENDIF n’a pas de IF avant lui.',
        'de': 'Vor diesem ENDIF steht kein IF.',
        'it': 'Questo ENDIF non ha un IF prima.',
        'pt-BR': 'Este ENDIF não tem um IF antes.',
        'zh': '这个 ENDIF 前面没有 IF。',
        'zh-TW': '這個 ENDIF 前面沒有 IF。',
        'ja': 'この ENDIF の前に IF がありません。',
        'ko': '이 ENDIF 앞에 IF가 없습니다.',
    },

    'asm-if-without-endif': {
        'en': 'An IF is not closed by an ENDIF.',
        'es': 'Un IF no se cierra con ENDIF.',
        'fr': 'Un IF n’est pas fermé par un ENDIF.',
        'de': 'Ein IF wird nicht durch ein ENDIF geschlossen.',
        'it': 'Un IF non è chiuso da un ENDIF.',
        'pt-BR': 'Um IF não é fechado por um ENDIF.',
        'zh': '有一个 IF 没有用 ENDIF 结束。',
        'zh-TW': '有一個 IF 沒有用 ENDIF 結束。',
        'ja': 'IF が ENDIF で閉じられていません。',
        'ko': 'IF가 ENDIF로 닫히지 않았습니다.',
    },

    'asm-endm-without-macro': {
        'en': 'This ENDM has no MACRO before it.',
        'es': 'Este ENDM no tiene un MACRO antes.',
        'fr': 'Ce ENDM n’a pas de MACRO avant lui.',
        'de': 'Vor diesem ENDM steht kein MACRO.',
        'it': 'Questo ENDM non ha un MACRO prima.',
        'pt-BR': 'Este ENDM não tem um MACRO antes.',
        'zh': '这个 ENDM 前面没有 MACRO。',
        'zh-TW': '這個 ENDM 前面沒有 MACRO。',
        'ja': 'この ENDM の前に MACRO がありません。',
        'ko': '이 ENDM 앞에 MACRO가 없습니다.',
    },

    'asm-macro-without-endm': {
        'en': 'This MACRO is not closed by an ENDM.',
        'es': 'Este MACRO no se cierra con ENDM.',
        'fr': 'Ce MACRO n’est pas fermé par un ENDM.',
        'de': 'Dieses MACRO wird nicht durch ein ENDM geschlossen.',
        'it': 'Questo MACRO non è chiuso da un ENDM.',
        'pt-BR': 'Este MACRO não é fechado por um ENDM.',
        'zh': '这个 MACRO 没有用 ENDM 结束。',
        'zh-TW': '這個 MACRO 沒有用 ENDM 結束。',
        'ja': 'この MACRO が ENDM で閉じられていません。',
        'ko': '이 MACRO가 ENDM으로 닫히지 않았습니다.',
    },

    'asm-macro-in-macro': {
        'en': 'A macro cannot be defined inside another.',
        'es': 'Una macro no se puede definir dentro de otra.',
        'fr': 'Une macro ne peut pas être définie dans une autre.',
        'de': 'Ein Makro kann nicht in einem anderen definiert werden.',
        'it': 'Una macro non può essere definita dentro un’altra.',
        'pt-BR': 'Uma macro não pode ser definida dentro de outra.',
        'zh': '不能在一个宏里定义另一个宏。',
        'zh-TW': '不能在一個巨集裡定義另一個巨集。',
        'ja': 'マクロの中で別のマクロを定義することはできません。',
        'ko': '매크로 안에서 다른 매크로를 정의할 수 없습니다.',
    },

    'asm-macro-twice': {
        'en': 'The macro {name} is already defined.',
        'es': 'La macro {name} ya está definida.',
        'fr': 'La macro {name} est déjà définie.',
        'de': 'Das Makro {name} ist schon definiert.',
        'it': 'La macro {name} è già definita.',
        'pt-BR': 'A macro {name} já está definida.',
        'zh': '宏 {name} 已经定义过了。',
        'zh-TW': '巨集 {name} 已經定義過了。',
        'ja': 'マクロ {name} はすでに定義されています。',
        'ko': '매크로 {name}는 이미 정의되었습니다.',
    },

    'asm-macro-depth': {
        'en': '{name} uses macros more than {depth} deep, or uses itself.',
        'es': '{name} usa macros a más de {depth} niveles, o se usa a sí misma.',
        'fr': '{name} imbrique des macros sur plus de {depth} niveaux, ou s’utilise elle-même.',
        'de': '{name} verschachtelt Makros tiefer als {depth} Ebenen oder verwendet sich selbst.',
        'it': '{name} usa macro per più di {depth} livelli, o usa sé stessa.',
        'pt-BR': '{name} usa macros com mais de {depth} níveis, ou usa a si mesma.',
        'zh': '{name} 嵌套使用宏超过了 {depth} 层，或者用到了它自己。',
        'zh-TW': '{name} 巢狀使用巨集超過了 {depth} 層，或者用到了它自己。',
        'ja': '{name} はマクロを {depth} 段より深く使っているか、自分自身を使っています。',
        'ko': '{name}가 매크로를 {depth}단계보다 깊이 쓰거나, 자기 자신을 씁니다.',
    },

    'asm-macro-arg': {
        'en': "{text} is not an expression. Text passed to a macro goes in quotes: '{text}'.",
        'es': "{text} no es una expresión. El texto que se pasa a una macro va entre comillas: '{text}'.",
        'fr': "{text} n’est pas une expression. Un texte passé à une macro se met entre guillemets : '{text}'.",
        'de': "{text} ist kein Ausdruck. Text für ein Makro steht in Anführungszeichen: '{text}'.",
        'it': "{text} non è un’espressione. Il testo passato a una macro va tra virgolette: '{text}'.",
        'pt-BR': "{text} não é uma expressão. Texto passado a uma macro vai entre aspas: '{text}'.",
        'zh': "{text} 不是表达式。传给宏的文本要加引号：'{text}'。",
        'zh-TW': "{text} 不是運算式。傳給巨集的文字要加引號：'{text}'。",
        'ja': "{text} は式ではありません。マクロに渡す文字列は引用符で囲みます：'{text}'。",
        'ko': "{text}는 식이 아닙니다. 매크로에 넘기는 글은 따옴표로 감쌉니다: '{text}'.",
    },

    'asm-include': {
        'en': "INCLUDE is not part of Intel's 8080 language. Paste the file's text here in its place.",
        'es': 'INCLUDE no forma parte del lenguaje 8080 de Intel. Pega aquí el texto del archivo en su lugar.',
        'fr': 'INCLUDE ne fait pas partie du langage 8080 d’Intel. Collez ici le texte du fichier à sa place.',
        'de': 'INCLUDE gehört nicht zu Intels 8080-Sprache. Fügen Sie stattdessen den Text der Datei hier ein.',
        'it': 'INCLUDE non fa parte del linguaggio 8080 di Intel. Incolla qui il testo del file al suo posto.',
        'pt-BR': 'INCLUDE não faz parte da linguagem 8080 da Intel. Cole aqui o texto do arquivo no lugar dele.',
        'zh': 'INCLUDE 不属于 Intel 的 8080 语言。请把那个文件的文本粘贴到这里代替它。',
        'zh-TW': 'INCLUDE 不屬於 Intel 的 8080 語言。請把那個檔案的文字貼到這裡代替它。',
        'ja': 'INCLUDE は Intel の 8080 言語にはありません。代わりにそのファイルの中身をここに貼り付けてください。',
        'ko': 'INCLUDE는 Intel의 8080 언어에 없습니다. 대신 그 파일의 내용을 여기에 붙여 넣으세요.',
    },

    'asm-overlap': {
        'en': 'Something is already assembled at {address}H, by line {other}.',
        'es': 'Ya hay algo ensamblado en {address}H, por la línea {other}.',
        'fr': 'Quelque chose est déjà assemblé en {address}H, par la ligne {other}.',
        'de': 'Bei {address}H ist schon etwas assembliert, von Zeile {other}.',
        'it': 'C’è già qualcosa assemblato a {address}H, dalla riga {other}.',
        'pt-BR': 'Já há algo montado em {address}H, pela linha {other}.',
        'zh': '{address}H 处已经由第 {other} 行汇编了内容。',
        'zh-TW': '{address}H 處已經由第 {other} 行組譯了內容。',
        'ja': '{address}H には {other} 行目がすでにアセンブルしています。',
        'ko': '{address}H에는 이미 {other}행이 어셈블한 것이 있습니다.',
    },

    'asm-too-big': {
        'en': 'This program reaches {end}H, but the machine has {size} of memory. Install more in the Memory menu.',
        'es': 'Este programa llega a {end}H, pero la máquina tiene {size} de memoria. Instala más en el menú Memoria.',
        'fr': 'Ce programme va jusqu’à {end}H, mais la machine a {size} de mémoire. Installez-en plus dans le menu Mémoire.',
        'de': 'Dieses Programm reicht bis {end}H, aber die Maschine hat {size} Speicher. Bauen Sie im Menü Speicher mehr ein.',
        'it': 'Questo programma arriva a {end}H, ma la macchina ha {size} di memoria. Installane di più dal menu Memoria.',
        'pt-BR': 'Este programa vai até {end}H, mas a máquina tem {size} de memória. Instale mais no menu Memória.',
        'zh': '这个程序用到 {end}H，但机器只有 {size} 内存。请在“内存”菜单中安装更多。',
        'zh-TW': '這個程式用到 {end}H，但機器只有 {size} 記憶體。請在「記憶體」選單中安裝更多。',
        'ja': 'このプログラムは {end}H まで使いますが、機械のメモリは {size} です。メモリメニューで増やしてください。',
        'ko': '이 프로그램은 {end}H까지 쓰지만 기계의 메모리는 {size}입니다. 메모리 메뉴에서 더 설치하세요.',
    },

    'debug-cpu-dump-title': {
        'en': '8080 CPU Status Dump',
        'es': 'Estado de la CPU 8080',
        'fr': 'État du processeur 8080',
        'de': 'Status der 8080-CPU',
        'it': 'Stato della CPU 8080',
        'pt-BR': 'Estado da CPU 8080',
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
        'pt-BR': 'Memória Instalada',
        'zh': '已安装的内存',
        'zh-TW': '已安裝的記憶體',
        'ja': '搭載メモリ',
        'ko': '설치된 메모리',
    },

    'mem-follow-pc': {
        'en': 'Follow PC',
        'es': 'Seguir el PC',
        'fr': 'Suivre le PC',
        'de': 'PC folgen',
        'it': 'Segui il PC',
        'pt-BR': 'Seguir o PC',
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
        'pt-BR': 'Despejo de Memória',
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
        'pt-BR': 'Tutorial Rápido',
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
        'pt-BR': 'Como inserir e rodar o programa a seguir, que calcula 1 + 2 = 3:',
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
        'pt-BR': 'Ligue o Altair 8800 clicando na chave OFF/ON.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 00 111 010 (para cima é 1, para baixo é 0).',
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
        'pt-BR': 'Clique em DEPOSIT.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 10 000 000.',
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
        'pt-BR': 'Clique em DEPOSIT NEXT.',
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
        'pt-BR': 'Repita os passos 4-5 para inserir os bytes a seguir, um a um: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 10 000 000.',
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
        'pt-BR': 'Clique em EXAMINE.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 00 000 001 (o primeiro número a somar, ou 1 em decimal).',
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
        'pt-BR': 'Clique em DEPOSIT.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 00 000 010 (o segundo número a somar, ou 2 em decimal).',
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
        'pt-BR': 'Clique em DEPOSIT NEXT.',
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
        'pt-BR': 'Clique em RESET.',
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
        'pt-BR': 'Clique em RUN e espere alguns segundos.',
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
        'pt-BR': 'Clique em STOP.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 10 000 010 (o endereço que guarda a soma).',
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
        'pt-BR': 'Clique em EXAMINE.',
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
        'pt-BR': 'Os LEDs D7-D0 mostram o resultado 00 000 011 (3 em decimal).',
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
        'pt-BR': 'Desligue o Altair 8800.',
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
        'pt-BR': 'Rodando o Microsoft BASIC',
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
        'pt-BR': 'O primeiro software do Altair, e da Microsoft: o Altair BASIC 3.2, escrito em 1975 por Bill Gates, Paul Allen e Monte Davidoff. Como iniciá-lo:',
        'zh': 'Altair 的第一个软件，也是微软的第一个产品：Altair BASIC 3.2，1975 年由 Bill Gates、Paul Allen 和 Monte Davidoff 编写。启动方法：',
        'zh-TW': 'Altair 的第一個軟體，也是微軟的第一個產品：Altair BASIC 3.2，1975 年由 Bill Gates、Paul Allen 和 Monte Davidoff 編寫。啟動方法：',
        'ja': 'Altair 最初のソフトウェアであり、マイクロソフト最初の製品でもある Altair BASIC 3.2。1975 年に Bill Gates、Paul Allen、Monte Davidoff が書きました。起動のしかた：',
        'ko': 'Altair의 첫 소프트웨어이자 마이크로소프트의 첫 제품인 Altair BASIC 3.2. 1975년에 Bill Gates, Paul Allen, Monte Davidoff가 만들었습니다. 시작하는 방법:',
    },

    'basic-1': {
        'en': 'In the Memory menu, choose 4 KB (or 8 KB, for room to write longer programs). Installing memory switches the machine off, which is what opening the case would have done.',
        'es': 'En el menú Memoria, elige 4 KB (u 8 KB, para escribir programas más largos). Instalar memoria apaga la máquina, que es lo que habría pasado al abrir la caja.',
        'fr': 'Dans le menu Mémoire, choisissez 4 Kio (ou 8 Kio, pour écrire des programmes plus longs). Installer de la mémoire éteint la machine, comme le ferait l\'ouverture du boîtier.',
        'de': 'Wählen Sie im Menü Speicher 4 KB (oder 8 KB für längere Programme). Speicher einzubauen schaltet die Maschine ab - genau wie das Öffnen des Gehäuses.',
        'it': 'Nel menu Memoria scegli 4 KB (o 8 KB, per programmi più lunghi). Installare memoria spegne la macchina, come sarebbe successo aprendo il contenitore.',
        'pt-BR': 'No menu Memória, escolha 4 KB (ou 8 KB, para ter espaço para programas mais longos). Instalar memória desliga a máquina, como abrir o gabinete teria feito.',
        'zh': '在“内存”菜单中选择 4 KB（想写长一点的程序就选 8 KB）。安装内存会关闭机器——当年打开机箱也是如此。',
        'zh-TW': '在「記憶體」選單中選擇 4 KB（想寫長一點的程式就選 8 KB）。安裝記憶體會關閉機器——當年打開機殼也是如此。',
        'ja': '「メモリ」メニューで 4 KB（長いプログラムを書くなら 8 KB）を選びます。メモリを増設すると電源が切れます。筐体を開けるのですから当然です。',
        'ko': '"메모리" 메뉴에서 4 KB(더 긴 프로그램을 쓰려면 8 KB)를 고르세요. 메모리를 설치하면 기계가 꺼집니다. 케이스를 여는 일이니까요.',
    },

    'basic-2': {
        'en': 'In the Load menu, choose Microsoft 4K BASIC. The machine powers up, the tape is read for you, RESET is pressed, and the Debugger opens to show what arrived.',
        'es': 'En el menú Cargar, elige Microsoft 4K BASIC. La máquina se enciende, la cinta se lee por ti, se pulsa RESET y se abre el Depurador para mostrar lo que ha llegado.',
        'fr': 'Dans le menu Charger, choisissez Microsoft 4K BASIC. La machine s\'allume, la bande est lue pour vous, RESET est appuyé et le Débogueur s\'ouvre pour montrer ce qui est arrivé.',
        'de': 'Wählen Sie im Menü Laden Microsoft 4K BASIC. Die Maschine geht an, das Band wird für Sie eingelesen, RESET gedrückt, und der Debugger öffnet sich und zeigt, was angekommen ist.',
        'it': 'Nel menu Carica, scegli Microsoft 4K BASIC. La macchina si accende, il nastro viene letto per te, viene premuto RESET e si apre il Debugger per mostrare cosa è arrivato.',
        'pt-BR': 'No menu Carregar, escolha Microsoft 4K BASIC. A máquina liga, a fita é lida para você, RESET é pressionado e o Depurador se abre para mostrar o que chegou.',
        'zh': '在“加载”菜单中选择 Microsoft 4K BASIC。机器会开机，纸带会替你读入，按下 RESET，并打开调试器显示载入的内容。',
        'zh-TW': '在「載入」選單中選擇 Microsoft 4K BASIC。機器會開機，紙帶會替你讀入，按下 RESET，並打開除錯器顯示載入的內容。',
        'ja': '「読み込み」メニューで Microsoft 4K BASIC を選びます。電源が入り、テープが代わりに読み込まれ、RESET が押され、デバッガーが開いて読み込んだものを見せます。',
        'ko': '"불러오기" 메뉴에서 Microsoft 4K BASIC을 고르세요. 전원이 켜지고, 테이프가 대신 읽히고, RESET이 눌리고, 디버거가 열려 불러온 내용을 보여 줍니다.',
    },

    'basic-3': {
        'en': 'Before going any further, look at the memory map above the dump. Fifteen of the sixteen pages of a 4 KB machine are full: that is BASIC, and the one page left over is all the room you have for a program. This is what "4K BASIC" means.',
        'es': 'Antes de seguir, mira el mapa de memoria sobre el volcado. Quince de las dieciséis páginas de una máquina de 4 KB están llenas: eso es BASIC, y la página que sobra es todo el espacio que tienes para un programa. Eso significa "BASIC 4K".',
        'fr': 'Avant d\'aller plus loin, regardez la carte mémoire au-dessus du vidage. Quinze des seize pages d\'une machine de 4 Kio sont pleines : c\'est BASIC, et la page qui reste est toute la place dont vous disposez. Voilà ce que veut dire « BASIC 4K ».',
        'de': 'Sehen Sie sich zuerst die Speicherkarte über dem Abbild an. Fünfzehn der sechzehn Seiten einer 4-KB-Maschine sind voll: das ist BASIC, und die eine übrige Seite ist der ganze Platz für Ihr Programm. Genau das bedeutet "4K BASIC".',
        'it': 'Prima di proseguire, guarda la mappa di memoria sopra il dump. Quindici delle sedici pagine di una macchina da 4 KB sono piene: quello è BASIC, e l’unica pagina rimasta è tutto lo spazio per il tuo programma. Questo significa "BASIC 4K".',
        'pt-BR': 'Antes de continuar, olhe o mapa de memória acima do despejo. Quinze das dezesseis páginas de uma máquina de 4 KB estão cheias: isso é o BASIC, e a única página que sobra é todo o espaço que você tem para um programa. É isso que "4K BASIC" quer dizer.',
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
        'pt-BR': 'As chaves de endereço A15-A8 dizem ao BASIC qual placa de terminal usar: todas para baixo é a 88-SIO, nas portas 00H e 01H; a chave A11 para cima é a 88-2SIO, em 10H e 11H. O teletipo aqui está ligado aos dois slots, então qualquer ajuste funciona - um Altair real teria só uma das duas placas instalada, e o ajuste errado o deixava mudo.',
        'zh': '地址开关 A15-A8 告诉 BASIC 该用哪块终端板：全部向下是端口 00H 和 01H 上的 88-SIO，A11 向上则是 10H 和 11H 上的 88-2SIO。这里的电传打字机同时接在两个插槽上，所以两种设置都能用——真正的 Altair 只会装其中一块，设错了机器就哑了。',
        'zh-TW': '位址開關 A15-A8 告訴 BASIC 該用哪塊終端卡：全部向下是連接埠 00H 和 01H 上的 88-SIO，A11 向上則是 10H 和 11H 上的 88-2SIO。這裡的電傳打字機同時接在兩個插槽上，所以兩種設定都能用——真正的 Altair 只會裝其中一塊，設錯了機器就啞了。',
        'ja': 'アドレススイッチ A15-A8 は、BASIC がどの端末ボードを使うかを決めます。すべて下ならポート 00H と 01H の 88-SIO、A11 を上げれば 10H と 11H の 88-2SIO です。ここではテレタイプが両方のスロットにつながっているのでどちらの設定でも動きますが、本物の Altair はどちらか一方しか挿さっておらず、設定を間違えると黙り込みました。',
        'ko': '주소 스위치 A15-A8은 BASIC이 어느 터미널 보드를 쓸지 정합니다. 모두 내리면 포트 00H와 01H의 88-SIO, A11을 올리면 10H와 11H의 88-2SIO입니다. 여기서는 텔레타이프가 두 슬롯 모두에 연결되어 있어 어느 쪽으로 설정해도 동작하지만, 실제 Altair에는 둘 중 하나만 꽂혀 있어 설정을 잘못하면 아무 반응이 없었습니다.',
    },

    'basic-5': {
        'en': 'Click RUN on the front panel.',
        'es': 'Pulsa RUN en el panel frontal.',
        'fr': 'Cliquez sur RUN en façade.',
        'de': 'Klicken Sie RUN an der Frontplatte.',
        'it': 'Premi RUN sul pannello frontale.',
        'pt-BR': 'Clique em RUN no painel frontal.',
        'zh': '点击前面板上的 RUN。',
        'zh-TW': '點擊前面板上的 RUN。',
        'ja': 'フロントパネルの RUN を押します。',
        'ko': '앞판의 RUN을 누르세요.',
    },

    'basic-6': {
        'en': 'Open the Teletype, under the panel. BASIC asks MEMORY SIZE? - press Enter to take everything it found. Press Enter again for TERMINAL WIDTH?, then Y for WANT SIN? to keep the maths functions.',
        'es': 'Abre el Teletipo, bajo el panel. BASIC pregunta MEMORY SIZE?: pulsa Intro para usar toda la que ha encontrado. Pulsa Intro otra vez en TERMINAL WIDTH? y luego Y en WANT SIN? para conservar las funciones matemáticas.',
        'fr': 'Ouvrez le Téléscripteur, sous le panneau. BASIC demande MEMORY SIZE? : appuyez sur Entrée pour tout prendre. Entrée à nouveau pour TERMINAL WIDTH?, puis Y pour WANT SIN? afin de garder les fonctions mathématiques.',
        'de': 'Öffnen Sie den Fernschreiber unter der Frontplatte. BASIC fragt MEMORY SIZE? - Enter nimmt alles, was es gefunden hat. Noch einmal Enter bei TERMINAL WIDTH?, dann Y bei WANT SIN?, um die Mathematikfunktionen zu behalten.',
        'it': 'Apri la Telescrivente, sotto il pannello. BASIC chiede MEMORY SIZE?: premi Invio per prendere tutta quella trovata. Invio di nuovo per TERMINAL WIDTH?, poi Y per WANT SIN? per tenere le funzioni matematiche.',
        'pt-BR': 'Abra o Teletipo, abaixo do painel. O BASIC pergunta MEMORY SIZE? - pressione Enter para usar toda a memória que ele encontrou. Pressione Enter de novo em TERMINAL WIDTH? e depois Y em WANT SIN? para manter as funções matemáticas.',
        'zh': '打开面板下方的“电传打字机”。BASIC 会问 MEMORY SIZE?——直接按回车表示全部使用。TERMINAL WIDTH? 再按一次回车，WANT SIN? 输入 Y 以保留数学函数。',
        'zh-TW': '打開面板下方的「電傳打字機」。BASIC 會問 MEMORY SIZE?——直接按 Enter 表示全部使用。TERMINAL WIDTH? 再按一次 Enter，WANT SIN? 輸入 Y 以保留數學函式。',
        'ja': 'パネルの下のテレタイプを開きます。BASIC が MEMORY SIZE? と聞くので、Enter で見つかった分を全部使います。TERMINAL WIDTH? でもう一度 Enter、WANT SIN? では Y と答えて数学関数を残します。',
        'ko': '패널 아래의 텔레타이프를 여세요. BASIC이 MEMORY SIZE?라고 물으면 Enter를 눌러 찾은 메모리를 모두 씁니다. TERMINAL WIDTH?에서 다시 Enter, WANT SIN?에서 Y를 눌러 수학 함수를 남깁니다.',
    },

    'basic-7': {
        'en': 'It prints how many bytes are free, then OK. Try PRINT 22/7 for an answer straight away. To enter a program, type these lines one at a time, pressing Enter after each:',
        'es': 'Imprime cuántos bytes quedan libres y luego OK. Prueba PRINT 22/7 para obtener una respuesta al instante. Para escribir un programa, teclea estas líneas de una en una, pulsando Intro después de cada una:',
        'fr': 'Il affiche le nombre d’octets libres, puis OK. Essayez PRINT 22/7 pour une réponse immédiate. Pour saisir un programme, tapez ces lignes une par une, en appuyant sur Entrée après chacune :',
        'de': 'Es zeigt die freien Bytes und dann OK. Für eine sofortige Antwort probieren Sie PRINT 22/7. Um ein Programm einzugeben, tippen Sie diese Zeilen einzeln und drücken nach jeder Enter:',
        'it': 'Stampa quanti byte sono liberi, poi OK. Prova PRINT 22/7 per una risposta immediata. Per scrivere un programma, digita queste righe una alla volta, premendo Invio dopo ciascuna:',
        'pt-BR': 'Ele mostra quantos bytes estão livres e depois OK. Experimente PRINT 22/7 para ter uma resposta na hora. Para digitar um programa, entre estas linhas uma de cada vez, pressionando Enter após cada uma:',
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
        'pt-BR': 'O teclado só tem maiúsculas. O sublinhado apaga o último caractere, a arroba descarta a linha e Ctrl-C interrompe um programa em execução.',
        'zh': '键盘只有大写。下划线删除上一个字符，@ 放弃整行，Ctrl-C 中断正在运行的程序。',
        'zh-TW': '鍵盤只有大寫。底線刪除上一個字元，@ 放棄整行，Ctrl-C 中斷正在執行的程式。',
        'ja': 'キーボードは大文字だけです。アンダースコアで直前の一文字を消し、アットマークで行を捨て、Ctrl-C で実行中のプログラムを止めます。',
        'ko': '키보드는 대문자뿐입니다. 밑줄은 마지막 글자를 지우고, @는 줄 전체를 버리고, Ctrl-C는 실행 중인 프로그램을 멈춥니다.',
    },

    'basic-note': {
        'en': 'What loading 4K BASIC skips: on a real Altair you first toggled a 28 byte boot loader in through the front panel, one byte at a time, then started the paper tape reader and waited about seven minutes while BASIC clattered in. Get one switch wrong and you did it again.',
        'es': 'Lo que se salta al cargar 4K BASIC: en un Altair real primero introducías con los interruptores un cargador de 28 bytes, byte a byte, luego arrancabas el lector de cinta y esperabas unos siete minutos mientras BASIC entraba traqueteando. Un interruptor mal puesto y vuelta a empezar.',
        'fr': 'Ce que le chargement de 4K BASIC escamote : sur un vrai Altair, vous saisissiez d\'abord un chargeur de 28 octets aux interrupteurs, octet par octet, puis vous lanciez le lecteur de bande et attendiez sept minutes pendant que BASIC entrait en cliquetant. Un seul interrupteur de travers et on recommençait.',
        'de': 'Was das Laden von 4K BASIC überspringt: an einem echten Altair gaben Sie zuerst einen 28 Byte langen Urlader über die Kippschalter ein, Byte für Byte, starteten dann den Lochstreifenleser und warteten etwa sieben Minuten, während BASIC hereinratterte. Ein falscher Schalter, und Sie fingen von vorn an.',
        'it': 'Quello che il caricamento di 4K BASIC salta: su un Altair vero inserivi prima con gli interruttori un boot loader di 28 byte, un byte alla volta, poi avviavi il lettore di nastro e aspettavi circa sette minuti mentre BASIC entrava sferragliando. Un interruttore sbagliato e si ricominciava.',
        'pt-BR': 'O que carregar o 4K BASIC poupa: num Altair real, primeiro você inseria pelo painel frontal um carregador de boot de 28 bytes, um byte de cada vez, depois ligava a leitora de fita de papel e esperava uns sete minutos enquanto o BASIC entrava, ruidoso. Errou uma chave, fazia tudo de novo.',
        'zh': '加载 4K BASIC 替你省掉的事：在真正的 Altair 上，你得先用前面板开关一个字节一个字节地输入 28 字节的引导程序，然后启动纸带阅读机，听着 BASIC 哗啦啦读上大约七分钟。有一个开关拨错，就得从头再来。',
        'zh-TW': '載入 4K BASIC 替你省掉的事：在真正的 Altair 上，你得先用前面板開關一個位元組一個位元組地輸入 28 位元組的載入程式，然後啟動紙帶閱讀機，聽著 BASIC 嘩啦啦讀上大約七分鐘。有一個開關撥錯，就得從頭再來。',
        'ja': '4K BASIC の読み込みが省いていること。本物の Altair では、まず 28 バイトのブートローダーをフロントパネルのスイッチで一バイトずつ入力し、それから紙テープリーダーを回して、BASIC がガチャガチャと入ってくるのを七分ほど待ちました。スイッチを一つ間違えれば、最初からやり直しです。',
        'ko': '4K BASIC을 불러오면서 건너뛴 것: 진짜 Altair에서는 먼저 28바이트짜리 부트로더를 앞판 스위치로 한 바이트씩 입력하고, 종이 테이프 리더를 돌린 뒤, BASIC이 달그락거리며 들어오는 7분을 기다렸습니다. 스위치 하나만 틀려도 처음부터 다시였습니다.',
    },

    'reference-title': {
        'en': 'Further Reading',
        'es': 'Para Saber Más',
        'fr': 'Pour Aller Plus Loin',
        'de': 'Weiterlesen',
        'it': 'Per Approfondire',
        'pt-BR': 'Para Saber Mais',
        'zh': '延伸阅读',
        'zh-TW': '延伸閱讀',
        'ja': 'さらに詳しく',
        'ko': '더 읽을거리',
    },

    'ref-wikipedia-altair': {
        'en': 'Wikipedia: Altair 8800',
        'es': 'Wikipedia: Altair 8800',
        'fr': 'Wikipédia : Altair 8800',
        'de': 'Wikipedia: Altair 8800',
        'it': 'Wikipedia: Altair 8800',
        'pt-BR': 'Wikipédia: Altair 8800',
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
        'pt-BR': 'Wikipédia: CPU Intel 8080',
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
        'pt-BR': 'Conjunto de instruções do Intel 8080 - referência rápida da codificação dos opcodes (texto)',
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
        'pt-BR': 'Manuais originais do Altair 8800 - PDFs digitalizados, arquivados em altairclone.com',
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
        'pt-BR': "Altair 8800 Operator's Manual - o manual original, em PDF digitalizado",
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
        'pt-BR': "Altair 8800 Operator's Manual v2.0 - uma edição em HTML de Kevin Cole",
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
        'pt-BR': 'Intel 8080 Assembly Language Programming Manual - o manual original da Intel, em PDF digitalizado',
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
        'pt-BR': 'Demystifying Computers - um livro de código aberto de Chris Jones e Jeff Elkner',
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
        'pt-BR': 'Wikipédia: Altair BASIC - o que é, e como a Microsoft começou com ele',
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
        'pt-BR': 'MITS Altair BASIC Reference Manual (1975) - a própria linguagem: um tutorial, cada comando e função, as perguntas de inicialização no Apêndice B e os códigos de erro no Apêndice C',
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
        'pt-BR': 'Altair BASIC 3.2 (4K) - uma desmontagem comentada exatamente do programa que este simulador roda',
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
        'pt-BR': 'MITS Altair Simulator - outro simulador em JavaScript, que roda o Microsoft BASIC num teletipo simulado',
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
 * and wires it up. See js/dropdown.js for why it is not a <select>.
 */
l10n.initMenu = function() {
    l10n.menu = new Dropdown('locale-menu', function(locale) {
        l10n.setLocale(locale);
    });
    l10n.menu.setItems(l10n.LOCALES.map(function(locale) {
        return {value: locale, label: l10n.LOCALE_NAMES[locale] || locale};
    }));
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
    if (l10n.menu) {
        l10n.menu.setLabel(l10n.LOCALE_SHORT[locale] || locale);
        l10n.menu.setSelected(locale);
    }

    const elems = document.getElementsByClassName('l10n');
    for (let i = 0; i < elems.length; i++) {
        if (l10n.MESSAGES.hasOwnProperty(elems[i].id)) {
            elems[i].innerHTML = l10n.getMessage(elems[i].id);
        }
    }

    if (l10n.onUpdate) {
        l10n.onUpdate();
    }
};
