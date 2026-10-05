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
    'pt-BR',
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
    'pt-BR': 'Português (Brasil)',
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
    'zh': '简',
    'zh-TW': '繁',
    'ja': '日',
    'ko': '한',
    'pt-BR': 'PT',
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
        'pt-BR': 'Sim-8800: simulador do Altair 8800',
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
        'pt-BR': 'Simulador do Altair 8800',
    },

    'load-menu': {
        'en': 'Load',
        'es': 'Cargar',
        'fr': 'Charger',
        'de': 'Laden',
        'it': 'Carica',
        'zh': '加载',
        'zh-TW': '載入',
        'ja': '読み込み',
        'ko': '불러오기',
        'pt-BR': 'Carregar',
    },

    'memory-menu': {
        'en': 'Memory:',
        'es': 'Memoria:',
        'fr': 'Mémoire :',
        'de': 'Speicher:',
        'it': 'Memoria:',
        'zh': '内存：',
        'zh-TW': '記憶體：',
        'ja': 'メモリ：',
        'ko': '메모리:',
        'pt-BR': 'Memória:',
    },

    'splitter-label': {
        'en': 'Drag to share the height between the panel and the tools',
        'es': 'Arrastra para repartir la altura entre el panel y las herramientas',
        'fr': 'Faites glisser pour partager la hauteur entre le panneau et les outils',
        'de': 'Ziehen, um die Höhe zwischen Frontplatte und Werkzeugen aufzuteilen',
        'it': 'Trascina per dividere l’altezza tra il pannello e gli strumenti',
        'zh': '拖动以分配面板和工具的高度',
        'zh-TW': '拖曳以分配面板和工具的高度',
        'ja': 'ドラッグしてパネルとツールの高さを配分',
        'ko': '드래그해 패널과 도구의 높이를 나누세요',
        'pt-BR': 'Arraste para dividir a altura entre o painel e as ferramentas',
    },

    'dock-hide': {
        'en': 'Fold the tools away',
        'es': 'Recoger las herramientas',
        'fr': 'Replier les outils',
        'de': 'Werkzeuge einklappen',
        'it': 'Ripiega gli strumenti',
        'zh': '收起工具',
        'zh-TW': '收起工具',
        'ja': 'ツールをたたむ',
        'ko': '도구 접기',
        'pt-BR': 'Recolher as ferramentas',
    },

    'dock-show': {
        'en': 'Open the tools',
        'es': 'Abrir las herramientas',
        'fr': 'Ouvrir les outils',
        'de': 'Werkzeuge öffnen',
        'it': 'Apri gli strumenti',
        'zh': '展开工具',
        'zh-TW': '展開工具',
        'ja': 'ツールを開く',
        'ko': '도구 열기',
        'pt-BR': 'Abrir as ferramentas',
    },

    'share-menu': {
        'en': 'Share',
        'es': 'Compartir',
        'fr': 'Partager',
        'de': 'Teilen',
        'it': 'Condividi',
        'zh': '分享',
        'zh-TW': '分享',
        'ja': '共有',
        'ko': '공유',
        'pt-BR': 'Compartilhar',
    },

    'load-hex': {
        'en': 'Hex Bytes…',
        'es': 'Bytes en hex…',
        'fr': 'Octets en hexa…',
        'de': 'Hex-Bytes…',
        'it': 'Byte in esadecimale…',
        'zh': '十六进制字节…',
        'zh-TW': '十六進位位元組…',
        'ja': '16 進数のバイト…',
        'ko': '16진수 바이트…',
        'pt-BR': 'Bytes em Hex…',
    },

    'load-file': {
        'en': 'Binary File…',
        'es': 'Archivo binario…',
        'fr': 'Fichier binaire…',
        'de': 'Binärdatei…',
        'it': 'File binario…',
        'zh': '二进制文件…',
        'zh-TW': '二進位檔案…',
        'ja': 'バイナリファイル…',
        'ko': '바이너리 파일…',
        'pt-BR': 'Arquivo Binário…',
    },

    'basic-needs-memory': {
        'en': 'needs 4 KB',
        'es': 'necesita 4 KB',
        'fr': 'exige 4 Kio',
        'de': 'braucht 4 KB',
        'it': 'richiede 4 KB',
        'zh': '需要 4 KB',
        'zh-TW': '需要 4 KB',
        'ja': '4 KB が必要',
        'ko': '4 KB 필요',
        'pt-BR': 'requer 4 KB',
    },

    'needs-server-short': {
        'en': 'needs a web server',
        'es': 'necesita un servidor web',
        'fr': 'exige un serveur web',
        'de': 'braucht einen Webserver',
        'it': 'richiede un server web',
        'zh': '需要 Web 服务器',
        'zh-TW': '需要 Web 伺服器',
        'ja': 'Web サーバーが必要',
        'ko': '웹 서버 필요',
        'pt-BR': 'requer um servidor web',
    },

    'examples-unreadable-short': {
        'en': 'could not be read',
        'es': 'no se pudieron leer',
        'fr': 'illisibles',
        'de': 'nicht lesbar',
        'it': 'non leggibili',
        'zh': '无法读取',
        'zh-TW': '無法讀取',
        'ja': '読み込めません',
        'ko': '읽을 수 없음',
        'pt-BR': 'não foi possível ler',
    },

    'examples-heading': {
        'en': 'Examples',
        'es': 'Ejemplos',
        'fr': 'Exemples',
        'de': 'Beispiele',
        'it': 'Esempi',
        'zh': '示例',
        'zh-TW': '範例',
        'ja': 'サンプル',
        'ko': '예제',
        'pt-BR': 'Exemplos',
    },

    'examples-still-loading': {
        'en': 'The example programs are still being read. Try again in a moment.',
        'es': 'Todavía se están leyendo los programas de ejemplo. Inténtalo de nuevo en un momento.',
        'fr': 'Les programmes d’exemple sont encore en cours de lecture. Réessayez dans un instant.',
        'de': 'Die Beispielprogramme werden noch gelesen. Versuchen Sie es gleich noch einmal.',
        'it': 'I programmi di esempio sono ancora in lettura. Riprova tra un momento.',
        'zh': '示例程序还在读取中，请稍后再试。',
        'zh-TW': '範例程式還在讀取中，請稍後再試。',
        'ja': 'サンプルプログラムをまだ読み込んでいます。少し待ってからもう一度どうぞ。',
        'ko': '예제 프로그램을 아직 읽는 중입니다. 잠시 후 다시 시도하세요.',
        'pt-BR': 'Os programas de exemplo ainda estão sendo lidos. Tente de novo em instantes.',
    },

    'examples-loading': {
        'en': 'Loading…',
        'es': 'Cargando…',
        'fr': 'Chargement…',
        'de': 'Wird geladen…',
        'it': 'Caricamento…',
        'zh': '正在加载…',
        'zh-TW': '正在載入…',
        'ja': '読み込み中…',
        'ko': '불러오는 중…',
        'pt-BR': 'Carregando…',
    },

    'examples-heading-panel': {
        'en': 'Front Panel Examples',
        'es': 'Ejemplos del Panel Frontal',
        'fr': 'Exemples en Façade',
        'de': 'Beispiele für die Frontplatte',
        'it': 'Esempi sul Pannello Frontale',
        'zh': '前面板示例',
        'zh-TW': '前面板範例',
        'ja': 'フロントパネルのサンプル',
        'ko': '앞판 예제',
        'pt-BR': 'Exemplos do Painel Frontal',
    },

    'examples-heading-tty': {
        'en': 'Teletype Examples',
        'es': 'Ejemplos del Teletipo',
        'fr': 'Exemples au Téléscripteur',
        'de': 'Beispiele für den Fernschreiber',
        'it': 'Esempi sulla Telescrivente',
        'zh': '电传打字机示例',
        'zh-TW': '電傳打字機範例',
        'ja': 'テレタイプのサンプル',
        'ko': '텔레타이프 예제',
        'pt-BR': 'Exemplos do Teletipo',
    },

    'example-size': {
        'en': '{bytes} bytes',
        'es': '{bytes} bytes',
        'fr': '{bytes} octets',
        'de': '{bytes} Bytes',
        'it': '{bytes} byte',
        'zh': '{bytes} 字节',
        'zh-TW': '{bytes} 位元組',
        'ja': '{bytes} バイト',
        'ko': '{bytes}바이트',
        'pt-BR': '{bytes} bytes',
    },

    'language-menu': {
        'en': 'Language',
        'es': 'Idioma',
        'fr': 'Langue',
        'de': 'Sprache',
        'it': 'Lingua',
        'zh': '语言',
        'zh-TW': '語言',
        'ja': '言語',
        'ko': '언어',
        'pt-BR': 'Idioma',
    },

    'about-button': {
        'en': 'About',
        'es': 'Acerca de',
        'fr': 'À propos',
        'de': 'Über',
        'it': 'Informazioni',
        'zh': '关于',
        'zh-TW': '關於',
        'ja': 'このアプリについて',
        'ko': '정보',
        'pt-BR': 'Sobre',
    },

    'dialog-close': {
        'en': 'Close',
        'es': 'Cerrar',
        'fr': 'Fermer',
        'de': 'Schließen',
        'it': 'Chiudi',
        'zh': '关闭',
        'zh-TW': '關閉',
        'ja': '閉じる',
        'ko': '닫기',
        'pt-BR': 'Fechar',
    },

    'about-ok': {
        'en': 'Close',
        'es': 'Cerrar',
        'fr': 'Fermer',
        'de': 'Schließen',
        'it': 'Chiudi',
        'zh': '关闭',
        'zh-TW': '關閉',
        'ja': '閉じる',
        'ko': '닫기',
        'pt-BR': 'Fechar',
    },

    'hex-cancel': {
        'en': 'Cancel',
        'es': 'Cancelar',
        'fr': 'Annuler',
        'de': 'Abbrechen',
        'it': 'Annulla',
        'zh': '取消',
        'zh-TW': '取消',
        'ja': 'キャンセル',
        'ko': '취소',
        'pt-BR': 'Cancelar',
    },

    'hex-dialog-title': {
        'en': 'Load Hex Bytes',
        'es': 'Cargar Bytes en Hex',
        'fr': 'Charger des Octets en Hexa',
        'de': 'Hex-Bytes laden',
        'it': 'Carica Byte in Esadecimale',
        'zh': '加载十六进制字节',
        'zh-TW': '載入十六進位位元組',
        'ja': '16 進数のバイトを読み込む',
        'ko': '16진수 바이트 불러오기',
        'pt-BR': 'Carregar Bytes em Hex',
    },

    'hex-dialog-desc': {
        'en': 'Bytes in hex, put into memory from 0000H. Spaces, commas and line breaks may separate them.',
        'es': 'Bytes en hexadecimal, que se ponen en la memoria a partir de 0000H. Pueden ir separados por espacios, comas o saltos de línea.',
        'fr': 'Des octets en hexadécimal, placés en mémoire à partir de 0000H. Espaces, virgules et retours à la ligne peuvent les séparer.',
        'de': 'Bytes in Hex, ab 0000H in den Speicher gelegt. Leerzeichen, Kommas und Zeilenumbrüche dürfen sie trennen.',
        'it': 'Byte in esadecimale, messi in memoria a partire da 0000H. Possono essere separati da spazi, virgole e a capo.',
        'zh': '十六进制字节，从 0000H 起放入内存。字节之间可以用空格、逗号或换行分隔。',
        'zh-TW': '十六進位位元組，從 0000H 起放入記憶體。位元組之間可以用空格、逗號或換行分隔。',
        'ja': '16 進数のバイトを 0000H からメモリに置きます。空白、カンマ、改行で区切ってかまいません。',
        'ko': '16진수 바이트를 0000H부터 메모리에 넣습니다. 공백, 쉼표, 줄바꿈으로 구분해도 됩니다.',
        'pt-BR': 'Bytes em hexadecimal, gravados na memória a partir de 0000H. Podem ser separados por espaços, vírgulas e quebras de linha.',
    },

    'share-title': {
        'en': 'Share a Link',
        'es': 'Compartir un Enlace',
        'fr': 'Partager un Lien',
        'de': 'Einen Link teilen',
        'it': 'Condividi un Link',
        'zh': '分享链接',
        'zh-TW': '分享連結',
        'ja': 'リンクを共有',
        'ko': '링크 공유',
        'pt-BR': 'Compartilhar um Link',
    },

    'share-question': {
        'en': 'What should the link open?',
        'es': '¿Qué debe abrir el enlace?',
        'fr': 'Que doit ouvrir le lien ?',
        'de': 'Was soll der Link öffnen?',
        'it': 'Cosa deve aprire il link?',
        'zh': '链接要打开什么？',
        'zh-TW': '連結要開啟什麼？',
        'ja': 'リンクで何を開きますか？',
        'ko': '링크로 무엇을 열까요?',
        'pt-BR': 'O que o link deve abrir?',
    },

    'share-program-label': {
        'en': 'The program, at RESET',
        'es': 'El programa, tras RESET',
        'fr': 'Le programme, après RESET',
        'de': 'Das Programm, nach RESET',
        'it': 'Il programma, dopo RESET',
        'zh': '程序，按下 RESET 后',
        'zh-TW': '程式，按下 RESET 後',
        'ja': 'プログラム（RESET 直後）',
        'ko': '프로그램, RESET 직후',
        'pt-BR': 'O programa, após RESET',
    },

    'share-program-desc': {
        'en': 'Ready to RUN, as a fresh machine would be.',
        'es': 'Listo para RUN, como estaría una máquina recién encendida.',
        'fr': 'Prêt pour RUN, comme une machine fraîchement allumée.',
        'de': 'Bereit für RUN, wie eine frisch eingeschaltete Maschine.',
        'it': 'Pronto per RUN, come una macchina appena accesa.',
        'zh': '可直接按 RUN，就像刚开机的机器。',
        'zh-TW': '可直接按 RUN，就像剛開機的機器。',
        'ja': '電源を入れたばかりのマシンのように、すぐ RUN できます。',
        'ko': '막 켠 기계처럼 바로 RUN할 수 있습니다.',
        'pt-BR': 'Pronto para RUN, como uma máquina recém-ligada.',
    },

    'share-state-label': {
        'en': 'The machine as it is now',
        'es': 'La máquina tal como está ahora',
        'fr': 'La machine telle qu’elle est maintenant',
        'de': 'Die Maschine, wie sie jetzt ist',
        'it': 'La macchina com’è adesso',
        'zh': '机器现在的样子',
        'zh-TW': '機器現在的樣子',
        'ja': '今のままのマシン',
        'ko': '지금 상태 그대로의 기계',
        'pt-BR': 'A máquina como está agora',
    },

    'share-state-desc': {
        'en': 'Stopped at {pc}H, with its registers and switches.',
        'es': 'Detenida en {pc}H, con sus registros e interruptores.',
        'fr': 'Arrêtée en {pc}H, avec ses registres et ses interrupteurs.',
        'de': 'Angehalten bei {pc}H, mit ihren Registern und Schaltern.',
        'it': 'Ferma a {pc}H, con i suoi registri e interruttori.',
        'zh': '停在 {pc}H，连同寄存器和开关。',
        'zh-TW': '停在 {pc}H，連同暫存器和開關。',
        'ja': '{pc}H で停止したまま、レジスタとスイッチも含めて。',
        'ko': '{pc}H에서 멈춘 채, 레지스터와 스위치도 함께.',
        'pt-BR': 'Parada em {pc}H, com seus registradores e chaves.',
    },

    'link-copy-blocked': {
        'en': 'The browser would not copy the link, so it is selected in the box instead. Copy it from there.',
        'es': 'El navegador no quiso copiar el enlace, así que está seleccionado en el cuadro. Cópialo desde ahí.',
        'fr': 'Le navigateur n\'a pas voulu copier le lien, il est donc sélectionné dans la case. Copiez-le depuis là.',
        'de': 'Der Browser wollte den Link nicht kopieren, deshalb ist er im Feld markiert. Kopieren Sie ihn von dort.',
        'it': 'Il browser non ha voluto copiare il link, quindi è selezionato nella casella. Copialo da lì.',
        'zh': '浏览器不允许复制链接，所以已在框中选中它。请从那里复制。',
        'zh-TW': '瀏覽器不允許複製連結，所以已在框中選取它。請從那裡複製。',
        'ja': 'ブラウザーがリンクをコピーさせなかったので、欄の中で選択してあります。そこからコピーしてください。',
        'ko': '브라우저가 링크 복사를 허용하지 않아 상자에서 선택해 두었습니다. 거기서 복사하세요.',
        'pt-BR': 'O navegador não permitiu copiar o link, então ele foi selecionado na caixa. Copie-o de lá.',
    },

    'about-title': {
        'en': 'Altair 8800 Simulator',
        'es': 'Simulador de Altair 8800',
        'fr': 'Simulateur Altair 8800',
        'de': 'Altair-8800-Simulator',
        'it': 'Simulatore Altair 8800',
        'zh': 'Altair 8800 模拟器',
        'zh-TW': 'Altair 8800 模擬器',
        'ja': 'Altair 8800 シミュレーター',
        'ko': 'Altair 8800 시뮬레이터',
        'pt-BR': 'Simulador do Altair 8800',
    },

    'about-version': {
        'en': 'Version',
        'es': 'Versión',
        'fr': 'Version',
        'de': 'Version',
        'it': 'Versione',
        'zh': '版本',
        'zh-TW': '版本',
        'ja': 'バージョン',
        'ko': '버전',
        'pt-BR': 'Versão',
    },

    'about-desc': {
        'en': 'An Altair 8800 you can switch on in a web page: its front panel, a teletype running Microsoft\'s 4K BASIC, and a debugger the real one never had.',
        'es': 'Un Altair 8800 que puedes encender en una página web: su panel frontal, un teletipo con el 4K BASIC de Microsoft y un depurador que el auténtico nunca tuvo.',
        'fr': 'Un Altair 8800 qu\'on allume dans une page web : sa façade, un téléscripteur qui fait tourner le 4K BASIC de Microsoft, et un débogueur que le vrai n\'a jamais eu.',
        'de': 'Ein Altair 8800, den man in einer Webseite einschalten kann: seine Frontplatte, ein Fernschreiber mit Microsofts 4K BASIC und ein Debugger, den das Original nie hatte.',
        'it': 'Un Altair 8800 da accendere in una pagina web: il suo pannello frontale, una telescrivente con il 4K BASIC di Microsoft e un debugger che quello vero non ha mai avuto.',
        'zh': '一台能在网页里开机的 Altair 8800：它的前面板、一台运行微软 4K BASIC 的电传打字机，以及真机从未有过的调试器。',
        'zh-TW': '一台能在網頁裡開機的 Altair 8800：它的前面板、一台執行微軟 4K BASIC 的電傳打字機，以及真機從未有過的除錯器。',
        'ja': 'Web ページの中で電源を入れられる Altair 8800。フロントパネル、Microsoft の 4K BASIC が動くテレタイプ、そして本物にはなかったデバッガーを備えています。',
        'ko': '웹 페이지에서 켤 수 있는 Altair 8800: 앞판, 마이크로소프트 4K BASIC이 돌아가는 텔레타이프, 그리고 진짜에는 없던 디버거.',
        'pt-BR': 'Um Altair 8800 que você liga numa página web: o painel frontal, um teletipo rodando o 4K BASIC da Microsoft e um depurador que o original nunca teve.',
    },

    'about-source': {
        'en': 'Source code on GitHub',
        'es': 'Código fuente en GitHub',
        'fr': 'Code source sur GitHub',
        'de': 'Quellcode auf GitHub',
        'it': 'Codice sorgente su GitHub',
        'zh': 'GitHub 上的源代码',
        'zh-TW': 'GitHub 上的原始碼',
        'ja': 'GitHub のソースコード',
        'ko': 'GitHub의 소스 코드',
        'pt-BR': 'Código-fonte no GitHub',
    },

    'about-issues': {
        'en': 'Report a problem',
        'es': 'Informar de un problema',
        'fr': 'Signaler un problème',
        'de': 'Ein Problem melden',
        'it': 'Segnala un problema',
        'zh': '报告问题',
        'zh-TW': '回報問題',
        'ja': '問題を報告',
        'ko': '문제 신고',
        'pt-BR': 'Relatar um problema',
    },

    'about-contributors': {
        'en': 'Contributors',
        'es': 'Colaboradores',
        'fr': 'Contributeurs',
        'de': 'Mitwirkende',
        'it': 'Collaboratori',
        'zh': '贡献者',
        'zh-TW': '貢獻者',
        'ja': 'コントリビューター',
        'ko': '기여자',
        'pt-BR': 'Colaboradores',
    },

    'about-licences': {
        'en': 'Licences',
        'es': 'Licencias',
        'fr': 'Licences',
        'de': 'Lizenzen',
        'it': 'Licenze',
        'zh': '许可证',
        'zh-TW': '授權條款',
        'ja': 'ライセンス',
        'ko': '라이선스',
        'pt-BR': 'Licenças',
    },

    'about-license-app': {
        'en': 'The simulator:',
        'es': 'El simulador:',
        'fr': 'Le simulateur :',
        'de': 'Der Simulator:',
        'it': 'Il simulatore:',
        'zh': '本模拟器：',
        'zh-TW': '本模擬器：',
        'ja': 'このシミュレーター：',
        'ko': '이 시뮬레이터:',
        'pt-BR': 'O simulador:',
    },

    'about-license-rom': {
        'en': 'The 4K BASIC tape is Microsoft\'s, and not covered by that licence:',
        'es': 'La cinta de 4K BASIC es de Microsoft y esa licencia no la cubre:',
        'fr': 'La bande 4K BASIC appartient à Microsoft et cette licence ne la couvre pas :',
        'de': 'Das 4K-BASIC-Band gehört Microsoft und fällt nicht unter diese Lizenz:',
        'it': 'Il nastro di 4K BASIC è di Microsoft e quella licenza non lo copre:',
        'zh': '4K BASIC 纸带归微软所有，不在该许可证范围内：',
        'zh-TW': '4K BASIC 紙帶歸微軟所有，不在該授權範圍內：',
        'ja': '4K BASIC のテープは Microsoft のもので、このライセンスの対象外です：',
        'ko': '4K BASIC 테이프는 마이크로소프트의 것이며 이 라이선스가 적용되지 않습니다:',
        'pt-BR': 'A fita do 4K BASIC é da Microsoft e não está coberta por essa licença:',
    },

    'about-license-cpu': {
        'en': 'The 8080 CPU core is 8080js by Martin Maly, under a BSD licence:',
        'es': 'El núcleo de la CPU 8080 es 8080js, de Martin Maly, con licencia BSD:',
        'fr': 'Le cœur du processeur 8080 est 8080js, de Martin Maly, sous licence BSD :',
        'de': 'Der 8080-CPU-Kern ist 8080js von Martin Maly, unter einer BSD-Lizenz:',
        'it': 'Il nucleo della CPU 8080 è 8080js di Martin Maly, con licenza BSD:',
        'zh': '8080 CPU 内核是 Martin Maly 的 8080js，采用 BSD 许可证：',
        'zh-TW': '8080 CPU 核心是 Martin Maly 的 8080js，採用 BSD 授權：',
        'ja': '8080 CPU コアは Martin Maly による 8080js で、BSD ライセンスです：',
        'ko': '8080 CPU 코어는 Martin Maly의 8080js이며 BSD 라이선스입니다:',
        'pt-BR': 'O núcleo da CPU 8080 é o 8080js, de Martin Maly, sob uma licença BSD:',
    },

    'about-license-icons': {
        'en': 'The icons are Google\'s Material Icons:',
        'es': 'Los iconos son los Material Icons de Google:',
        'fr': 'Les icônes sont les Material Icons de Google :',
        'de': 'Die Symbole sind Googles Material Icons:',
        'it': 'Le icone sono i Material Icons di Google:',
        'zh': '图标来自 Google 的 Material Icons：',
        'zh-TW': '圖示來自 Google 的 Material Icons：',
        'ja': 'アイコンは Google の Material Icons です：',
        'ko': '아이콘은 Google의 Material Icons입니다:',
        'pt-BR': 'Os ícones são os Material Icons do Google:',
    },

    'about-references': {
        'en': 'References',
        'es': 'Referencias',
        'fr': 'Références',
        'de': 'Referenzen',
        'it': 'Riferimenti',
        'zh': '参考资料',
        'zh-TW': '參考資料',
        'ja': '参考資料',
        'ko': '참고 자료',
        'pt-BR': 'Referências',
    },

    'strip-hide': {
        'en': 'Fold the switches away',
        'es': 'Recoger los interruptores',
        'fr': 'Replier les interrupteurs',
        'de': 'Schalter einklappen',
        'it': 'Ripiega gli interruttori',
        'zh': '收起开关',
        'zh-TW': '收起開關',
        'ja': 'スイッチをたたむ',
        'ko': '스위치 접기',
        'pt-BR': 'Recolher as chaves',
    },

    'strip-show': {
        'en': 'Show the switches',
        'es': 'Mostrar los interruptores',
        'fr': 'Afficher les interrupteurs',
        'de': 'Schalter zeigen',
        'it': 'Mostra gli interruttori',
        'zh': '显示开关',
        'zh-TW': '顯示開關',
        'ja': 'スイッチを表示',
        'ko': '스위치 보이기',
        'pt-BR': 'Mostrar as chaves',
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
        'pt-BR': 'Teletipo',
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
        'pt-BR': 'CTRL-C (INTERROMPER)',
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
        'pt-BR': 'APAGAR (_)',
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
        'pt-BR': 'ANULAR LINHA (@)',
    },

    'tty-linefeed': {
        'en': 'LINE FEED',
        'es': 'AVANCE DE LÍNEA',
        'fr': 'SAUT DE LIGNE',
        'de': 'ZEILENVORSCHUB',
        'it': 'AVANZAMENTO RIGA',
        'zh': '进纸一行',
        'zh-TW': '進紙一行',
        'ja': '紙送り（改行）',
        'ko': '한 줄 이송',
        'pt-BR': 'AVANÇO DE LINHA',
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
        'pt-BR': 'PAPEL NOVO',
    },

    'tty-hint': {
        'en': 'Nothing has printed yet. Run a program that reads the serial board - try Teletype echo from Load - then type here.',
        'es': 'Todavía no se ha impreso nada. Ejecuta un programa que lea la placa serie - prueba Teletype echo en Cargar - y escribe aquí.',
        'fr': 'Rien n\'a encore été imprimé. Lancez un programme qui lit la carte série - essayez Teletype echo dans Charger - puis tapez ici.',
        'de': 'Noch wurde nichts gedruckt. Starten Sie ein Programm, das die serielle Karte liest - etwa Teletype echo unter Laden - und tippen Sie dann hier.',
        'it': 'Non è ancora stato stampato nulla. Esegui un programma che legge la scheda seriale - prova Teletype echo da Carica - poi scrivi qui.',
        'zh': '还没有打印任何内容。先运行一个读取串口板的程序——试试“加载”里的 Teletype echo——然后在这里输入。',
        'zh-TW': '還沒有列印任何內容。先執行一個讀取串列埠板的程式——試試「載入」裡的 Teletype echo——然後在這裡輸入。',
        'ja': 'まだ何も印字されていません。シリアルボードを読むプログラムを動かしてから（「読み込み」の Teletype echo など）、ここで入力してください。',
        'ko': '아직 아무것도 인쇄되지 않았습니다. 직렬 보드를 읽는 프로그램을 실행한 뒤("불러오기"의 Teletype echo 등) 여기에 입력하세요.',
        'pt-BR': 'Nada foi impresso ainda. Rode um programa que leia a placa serial - experimente Teletype echo, em Carregar - e digite aqui.',
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
        'pt-BR': 'Depurador',
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
        'pt-BR': 'Tutorial',
    },

    'nav-links': {
        'en': 'References',
        'es': 'Referencias',
        'fr': 'Références',
        'de': 'Referenzen',
        'it': 'Riferimenti',
        'zh': '参考资料',
        'zh-TW': '參考資料',
        'ja': '参考資料',
        'ko': '참고 자료',
        'pt-BR': 'Referências',
    },

    'source-code': {
        'en': 'Source Code',
        'es': 'Código Fuente',
        'fr': 'Code Source',
        'de': 'Quellcode',
        'it': 'Codice Sorgente',
        'zh': '源代码',
        'zh-TW': '原始碼',
        'ja': 'ソースコード',
        'ko': '소스 코드',
        'pt-BR': 'Código-Fonte',
    },

    'debug-load-data': {
        'en': 'Load Data',
        'es': 'Cargar datos',
        'fr': 'Charger les données',
        'de': 'Daten laden',
        'it': 'Carica dati',
        'zh': '加载数据',
        'zh-TW': '載入資料',
        'ja': 'データを読み込む',
        'ko': '데이터 불러오기',
        'pt-BR': 'Carregar Dados',
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
        'pt-BR': 'A máquina está desligada. Clique em OFF/ON no painel frontal para ligá-la.',
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
        'pt-BR': 'A máquina está ligada e esperando. A memória começou cheia de bytes aleatórios, como na máquina real.',
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
        'pt-BR': 'Rodando.',
    },

    'status-halted': {
        'en': 'The program ran into a HLT and the machine stopped, with the WAIT lamp lit. RESET and RUN start it again.',
        'es': 'El programa llegó a un HLT y la máquina se detuvo, con la lámpara WAIT encendida. RESET y RUN la reinician.',
        'fr': 'Le programme a atteint un HLT et la machine s’est arrêtée, la lampe WAIT allumée. RESET puis RUN la relancent.',
        'de': 'Das Programm ist auf ein HLT gelaufen und die Maschine steht, die WAIT-Lampe leuchtet. RESET und RUN starten sie wieder.',
        'it': 'Il programma è arrivato a un HLT e la macchina si è fermata, con la spia WAIT accesa. RESET e RUN la riavviano.',
        'zh': '程序执行到 HLT，机器停下了，WAIT 灯亮起。按 RESET 再按 RUN 可重新开始。',
        'zh-TW': '程式執行到 HLT，機器停下了，WAIT 燈亮起。按 RESET 再按 RUN 可重新開始。',
        'ja': 'プログラムが HLT に達して機械が止まり、WAIT ランプが点灯しました。RESET と RUN で再度動きます。',
        'ko': '프로그램이 HLT에 도달해 기계가 멈추고 WAIT 램프가 켜졌습니다. RESET 후 RUN으로 다시 시작합니다.',
        'pt-BR': 'O programa chegou a um HLT e a máquina parou, com a lâmpada WAIT acesa. RESET e RUN a iniciam de novo.',
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
        'pt-BR': 'Parada. O contador de programa ficou onde ela parou; RESET o leva de volta a 0000H.',
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
        'pt-BR': 'RESET. O contador de programa voltou a 0000H; clique em RUN para começar dali.',
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
        'pt-BR': '{size} de memória instalados. Instalar uma placa de memória exige abrir o gabinete, então a máquina foi desligada - clique em OFF/ON para ligá-la de novo.',
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
        'pt-BR': 'Toda a memória foi zerada.',
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
        'zh': '机器原本是关着的，已先行开机。',
        'zh-TW': '機器原本是關著的，已先行開機。',
        'ja': '電源が切れていたので、先に入れました。',
        'ko': '기계가 꺼져 있어서 먼저 켰습니다.',
        'pt-BR': 'A máquina estava desligada, então foi ligada primeiro.',
    },

    'example-loaded': {
        'en': 'Loaded {name}, {bytes} bytes, at 0000H and pressed RESET. Click RUN on the front panel.',
        'es': 'Cargado {name}, {bytes} bytes, en 0000H y pulsado RESET. Pulsa RUN en el panel frontal.',
        'fr': '{name} chargé, {bytes} octets, en 0000H et RESET appuyé. Cliquez sur RUN en façade.',
        'de': '{name} geladen, {bytes} Bytes, bei 0000H, und RESET gedrückt. Klicken Sie RUN an der Frontplatte.',
        'it': 'Caricato {name}, {bytes} byte, a 0000H e premuto RESET. Premi RUN sul pannello frontale.',
        'zh': '已在 0000H 载入 {name}（{bytes} 字节）并按下 RESET。请点击前面板上的 RUN。',
        'zh-TW': '已在 0000H 載入 {name}（{bytes} 位元組）並按下 RESET。請點擊前面板上的 RUN。',
        'ja': '{name}（{bytes} バイト）を 0000H に読み込み、RESET を押しました。フロントパネルの RUN を押してください。',
        'ko': '{name}({bytes}바이트)을 0000H에 불러오고 RESET을 눌렀습니다. 앞판의 RUN을 누르세요.',
        'pt-BR': '{name} carregado, {bytes} bytes, em 0000H, e RESET pressionado. Clique em RUN no painel frontal.',
    },

    'example-loaded-tty': {
        'en': 'Loaded {name}, {bytes} bytes, at 0000H and pressed RESET. Click RUN on the front panel, then watch the Teletype.',
        'es': 'Cargado {name}, {bytes} bytes, en 0000H y pulsado RESET. Pulsa RUN en el panel frontal y luego mira el Teletipo.',
        'fr': '{name} chargé, {bytes} octets, en 0000H et RESET appuyé. Cliquez sur RUN en façade, puis regardez le Téléscripteur.',
        'de': '{name} geladen, {bytes} Bytes, bei 0000H, und RESET gedrückt. Klicken Sie RUN an der Frontplatte und sehen Sie dann im Fernschreiber nach.',
        'it': 'Caricato {name}, {bytes} byte, a 0000H e premuto RESET. Premi RUN sul pannello frontale, poi guarda la Telescrivente.',
        'zh': '已在 0000H 载入 {name}（{bytes} 字节）并按下 RESET。请点击前面板上的 RUN，然后看“电传打字机”。',
        'zh-TW': '已在 0000H 載入 {name}（{bytes} 位元組）並按下 RESET。請點擊前面板上的 RUN，然後看「電傳打字機」。',
        'ja': '{name}（{bytes} バイト）を 0000H に読み込み、RESET を押しました。フロントパネルの RUN を押し、テレタイプをご覧ください。',
        'ko': '{name}({bytes}바이트)을 0000H에 불러오고 RESET을 눌렀습니다. 앞판의 RUN을 누른 다음 텔레타이프를 보세요.',
        'pt-BR': '{name} carregado, {bytes} bytes, em 0000H, e RESET pressionado. Clique em RUN no painel frontal e acompanhe o Teletipo.',
    },

    'load-basic': {
        'en': 'Microsoft 4K BASIC',
        'es': 'Microsoft 4K BASIC',
        'fr': 'Microsoft 4K BASIC',
        'de': 'Microsoft 4K BASIC',
        'it': 'Microsoft 4K BASIC',
        'zh': 'Microsoft 4K BASIC',
        'zh-TW': 'Microsoft 4K BASIC',
        'ja': 'Microsoft 4K BASIC',
        'ko': 'Microsoft 4K BASIC',
        'pt-BR': 'Microsoft 4K BASIC',
    },

    'needs-server': {
        'en': 'This page was opened straight off the disk, so the browser will not let it read the example listings or the BASIC tape. Serve the folder instead: run "python3 -m http.server 8000" in it and open http://localhost:8000/.',
        'es': 'Esta página se abrió directamente desde el disco, así que el navegador no le deja leer los listados de ejemplo ni la cinta de BASIC. Sirve la carpeta: ejecuta "python3 -m http.server 8000" en ella y abre http://localhost:8000/.',
        'fr': 'Cette page a été ouverte directement depuis le disque, le navigateur ne la laisse donc pas lire les listings d’exemple ni la bande BASIC. Servez le dossier : lancez-y « python3 -m http.server 8000 » et ouvrez http://localhost:8000/.',
        'de': 'Diese Seite wurde direkt von der Festplatte geöffnet, daher lässt der Browser sie die Beispiel-Listings und das BASIC-Band nicht lesen. Stellen Sie den Ordner bereit: Führen Sie darin "python3 -m http.server 8000" aus und öffnen Sie http://localhost:8000/.',
        'it': 'Questa pagina è stata aperta direttamente dal disco, quindi il browser non le lascia leggere i listati di esempio né il nastro BASIC. Servi la cartella: esegui "python3 -m http.server 8000" al suo interno e apri http://localhost:8000/.',
        'zh': '这个页面是直接从磁盘打开的，浏览器不允许它读取示例程序清单或 BASIC 纸带。请改用服务器：在该目录下运行 "python3 -m http.server 8000"，然后打开 http://localhost:8000/。',
        'zh-TW': '這個頁面是直接從磁碟開啟的，瀏覽器不允許它讀取範例程式清單或 BASIC 紙帶。請改用伺服器：在該目錄下執行 "python3 -m http.server 8000"，然後開啟 http://localhost:8000/。',
        'ja': 'このページはディスクから直接開かれているため、ブラウザーはサンプルのリスティングや BASIC の紙テープを読み込ませてくれません。フォルダーを配信してください。その中で "python3 -m http.server 8000" を実行し、http://localhost:8000/ を開きます。',
        'ko': '이 페이지는 디스크에서 바로 열렸기 때문에 브라우저가 예제 리스팅이나 BASIC 종이테이프를 읽지 못하게 합니다. 폴더를 서버로 제공하세요. 그 안에서 "python3 -m http.server 8000"을 실행하고 http://localhost:8000/ 을 여세요.',
        'pt-BR': 'Esta página foi aberta direto do disco, então o navegador não a deixa ler as listagens de exemplo nem a fita do BASIC. Sirva a pasta: rode "python3 -m http.server 8000" nela e abra http://localhost:8000/.',
    },

    'examples-unreadable': {
        'en': 'The example listings could not be read. They live in the examples folder beside this page.',
        'es': 'No se pudieron leer los listados de ejemplo. Están en la carpeta examples junto a esta página.',
        'fr': 'Les listings d’exemple n’ont pas pu être lus. Ils se trouvent dans le dossier examples à côté de cette page.',
        'de': 'Die Beispiel-Listings konnten nicht gelesen werden. Sie liegen im Ordner examples neben dieser Seite.',
        'it': 'Non è stato possibile leggere i listati di esempio. Si trovano nella cartella examples accanto a questa pagina.',
        'zh': '无法读取示例程序清单。它们在本页面旁边的 examples 目录里。',
        'zh-TW': '無法讀取範例程式清單。它們在本頁面旁邊的 examples 目錄裡。',
        'ja': 'サンプルのリスティングを読み込めませんでした。このページと同じ場所の examples フォルダーにあります。',
        'ko': '예제 리스팅을 읽을 수 없습니다. 이 페이지 옆 examples 폴더에 있습니다.',
        'pt-BR': 'Não foi possível ler as listagens de exemplo. Elas ficam na pasta examples, ao lado desta página.',
    },

    'rom-needs-memory': {
        'en': '4K BASIC needs at least 4 KB installed. Choose 4 KB or 8 KB in the Memory menu.',
        'es': 'BASIC 4K necesita al menos 4 KB instalados. Elige 4 KB u 8 KB en el menú Memoria.',
        'fr': 'BASIC 4K exige au moins 4 Kio installés. Choisissez 4 Kio ou 8 Kio dans le menu Mémoire.',
        'de': '4K BASIC braucht mindestens 4 KB. Wählen Sie 4 KB oder 8 KB im Menü Speicher.',
        'it': 'BASIC 4K richiede almeno 4 KB installati. Scegli 4 KB o 8 KB nel menu Memoria.',
        'zh': '4K BASIC 至少需要 4 KB 内存。请在“内存”菜单中选择 4 KB 或 8 KB。',
        'zh-TW': '4K BASIC 至少需要 4 KB 記憶體。請在「記憶體」選單中選擇 4 KB 或 8 KB。',
        'ja': '4K BASIC には少なくとも 4 KB が必要です。「メモリ」メニューで 4 KB か 8 KB を選んでください。',
        'ko': '4K BASIC에는 최소 4 KB가 필요합니다. "메모리" 메뉴에서 4 KB 또는 8 KB를 선택하세요.',
        'pt-BR': 'O 4K BASIC requer pelo menos 4 KB instalados. Escolha 4 KB ou 8 KB no menu Memória.',
    },

    'rom-loaded': {
        'en': 'Loaded {bytes} bytes at 0000H and pressed RESET. Click RUN on the front panel, then watch the Teletype.',
        'es': 'Cargados {bytes} bytes en 0000H y pulsado RESET. Pulsa RUN en el panel frontal y luego mira el Teletipo.',
        'fr': '{bytes} octets chargés en 0000H et RESET appuyé. Cliquez sur RUN en façade, puis regardez le Téléscripteur.',
        'de': '{bytes} Bytes bei 0000H geladen und RESET gedrückt. Klicken Sie RUN an der Frontplatte und sehen Sie dann im Fernschreiber nach.',
        'it': 'Caricati {bytes} byte a 0000H e premuto RESET. Premi RUN sul pannello frontale, poi guarda la Telescrivente.',
        'zh': '已在 0000H 载入 {bytes} 字节并按下 RESET。请点击前面板上的 RUN，然后查看“电传打字机”。',
        'zh-TW': '已在 0000H 載入 {bytes} 位元組並按下 RESET。請點擊前面板上的 RUN，然後查看「電傳打字機」。',
        'ja': '0000H に {bytes} バイトを読み込み、RESET を押しました。フロントパネルの RUN を押し、テレタイプを見てください。',
        'ko': '0000H에 {bytes}바이트를 불러오고 RESET을 눌렀습니다. 앞판의 RUN을 누른 뒤 텔레타이프를 보세요.',
        'pt-BR': '{bytes} bytes carregados em 0000H, e RESET pressionado. Clique em RUN no painel frontal e acompanhe o Teletipo.',
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
        'pt-BR': '{bytes} bytes de {name} carregados em 0000H, e RESET pressionado.',
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
        'pt-BR': '{name} tem {bytes} bytes. O 8080 só endereça 64 KB, então isso não é uma imagem de memória - nada foi carregado.',
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
        'pt-BR': 'Os primeiros {bytes} bytes de {name} foram carregados em 0000H, e RESET pressionado. O arquivo tem {size} bytes; o resto não cabe na memória instalada.',
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
        'pt-BR': 'Não foi possível ler {name}.',
    },

    'rom-missing': {
        'en': 'roms/4kbas32.bin could not be read. It is optional - see roms/NOTICE - so supply your own image with Binary File… in the Load menu.',
        'es': 'No se pudo leer roms/4kbas32.bin. Es opcional (consulta roms/NOTICE), así que aporta tu propia imagen con Archivo binario… en el menú Cargar.',
        'fr': 'roms/4kbas32.bin n\'a pas pu être lu. Il est facultatif (voir roms/NOTICE) : fournissez votre propre image avec Fichier binaire… dans le menu Charger.',
        'de': 'roms/4kbas32.bin konnte nicht gelesen werden. Es ist optional (siehe roms/NOTICE), laden Sie also ein eigenes Abbild mit Binärdatei… im Menü Laden.',
        'it': 'Impossibile leggere roms/4kbas32.bin. È facoltativo (vedi roms/NOTICE), quindi fornisci una tua immagine con File binario… nel menu Carica.',
        'zh': '无法读取 roms/4kbas32.bin。它是可选的（见 roms/NOTICE），请用“加载”菜单中的“二进制文件…”载入你自己的映像。',
        'zh-TW': '無法讀取 roms/4kbas32.bin。它是選用的（見 roms/NOTICE），請用「載入」選單中的「二進位檔案…」載入你自己的映像。',
        'ja': 'roms/4kbas32.bin を読み込めませんでした。これは任意のものなので（roms/NOTICE を参照）、「読み込み」メニューの「バイナリファイル…」で自分のイメージを読み込んでください。',
        'ko': 'roms/4kbas32.bin을 읽을 수 없습니다. 선택 사항이므로(roms/NOTICE 참고) "불러오기" 메뉴의 "바이너리 파일…"로 직접 가진 이미지를 불러오세요.',
        'pt-BR': 'Não foi possível ler roms/4kbas32.bin. Ele é opcional - veja roms/NOTICE - então forneça sua própria imagem com Arquivo Binário…, no menu Carregar.',
    },

    'mem-size-256': {
        'en': '256 B · as it shipped',
        'es': '256 B · de fábrica',
        'fr': '256 o · d’origine',
        'de': '256 B · wie ausgeliefert',
        'it': '256 B · di serie',
        'zh': '256 B · 出厂配置',
        'zh-TW': '256 B · 出廠配置',
        'ja': '256 B · 出荷時のまま',
        'ko': '256 B · 출고 상태',
        'pt-BR': '256 B · como vinha de fábrica',
    },

    'mem-size-4096': {
        'en': '4 KB · one 88-4MCS',
        'es': '4 KB · una 88-4MCS',
        'fr': '4 Kio · une 88-4MCS',
        'de': '4 KB · eine 88-4MCS',
        'it': '4 KB · una 88-4MCS',
        'zh': '4 KB · 一块 88-4MCS',
        'zh-TW': '4 KB · 一塊 88-4MCS',
        'ja': '4 KB · 88-4MCS 一枚',
        'ko': '4 KB · 88-4MCS 한 장',
        'pt-BR': '4 KB · uma 88-4MCS',
    },

    'mem-size-8192': {
        'en': '8 KB · two 88-4MCS',
        'es': '8 KB · dos 88-4MCS',
        'fr': '8 Kio · deux 88-4MCS',
        'de': '8 KB · zwei 88-4MCS',
        'it': '8 KB · due 88-4MCS',
        'zh': '8 KB · 两块 88-4MCS',
        'zh-TW': '8 KB · 兩塊 88-4MCS',
        'ja': '8 KB · 88-4MCS 二枚',
        'ko': '8 KB · 88-4MCS 두 장',
        'pt-BR': '8 KB · duas 88-4MCS',
    },

    'debug-data-placeholder': {
        'en': 'Bytes in hex, such as c3 00 00',
        'es': 'Bytes en hex, por ejemplo c3 00 00',
        'fr': 'Octets en hexa, par exemple c3 00 00',
        'de': 'Bytes in Hex, etwa c3 00 00',
        'it': 'Byte in esadecimale, ad esempio c3 00 00',
        'zh': '十六进制字节，例如 c3 00 00',
        'zh-TW': '十六進位位元組，例如 c3 00 00',
        'ja': '16 進数のバイト列、例えば c3 00 00',
        'ko': '16진수 바이트, 예: c3 00 00',
        'pt-BR': 'Bytes em hex, como c3 00 00',
    },

    'tty-off': {
        'en': 'The machine is off, so keys typed here go nowhere. Switch it on first.',
        'es': 'La máquina está apagada, así que las teclas escritas aquí no van a ninguna parte. Enciéndela primero.',
        'fr': 'La machine est éteinte, les touches tapées ici ne vont donc nulle part. Allumez-la d’abord.',
        'de': 'Die Maschine ist aus, hier getippte Tasten gehen also ins Leere. Schalten Sie sie zuerst ein.',
        'it': 'La macchina è spenta, quindi i tasti premuti qui non vanno da nessuna parte. Accendila prima.',
        'zh': '机器已关闭，在这里打出的字符无处可去。请先开机。',
        'zh-TW': '機器已關閉，在這裡打出的字元無處可去。請先開機。',
        'ja': '電源が入っていないので、ここで打ったキーはどこにも届きません。先に電源を入れてください。',
        'ko': '기계가 꺼져 있어 여기서 누른 키는 아무 데도 가지 않습니다. 먼저 전원을 켜세요.',
        'pt-BR': 'A máquina está desligada, então as teclas digitadas aqui não vão a lugar nenhum. Ligue-a primeiro.',
    },

    'zero-mem-off': {
        'en': 'The machine is off, so there is no memory to zero. Switch it on first.',
        'es': 'La máquina está apagada, así que no hay memoria que poner a cero. Enciéndela primero.',
        'fr': 'La machine est éteinte, il n\'y a donc pas de mémoire à remettre à zéro. Allumez-la d\'abord.',
        'de': 'Die Maschine ist aus, es gibt also keinen Speicher zum Nullsetzen. Schalten Sie sie zuerst ein.',
        'it': 'La macchina è spenta, quindi non c\'è memoria da azzerare. Accendila prima.',
        'zh': '机器已关闭，没有内存可以清零。请先开机。',
        'zh-TW': '機器已關閉，沒有記憶體可以清零。請先開機。',
        'ja': '電源が入っていないので、ゼロにするメモリがありません。先に電源を入れてください。',
        'ko': '기계가 꺼져 있어 0으로 만들 메모리가 없습니다. 먼저 전원을 켜세요.',
        'pt-BR': 'A máquina está desligada, então não há memória para zerar. Ligue-a primeiro.',
    },

    'instr-title': {
        'en': 'Next Instruction',
        'es': 'Siguiente Instrucción',
        'fr': 'Instruction Suivante',
        'de': 'Nächster Befehl',
        'it': 'Istruzione Successiva',
        'zh': '下一条指令',
        'zh-TW': '下一道指令',
        'ja': '次の命令',
        'ko': '다음 명령',
        'pt-BR': 'Próxima Instrução',
    },

    'instr-undocumented': {
        'en': '(undocumented opcode; the 8080 runs it as this)',
        'es': '(código de operación no documentado; el 8080 lo ejecuta así)',
        'fr': '(opcode non documenté ; le 8080 l\'exécute ainsi)',
        'de': '(undokumentierter Opcode; der 8080 führt ihn so aus)',
        'it': '(opcode non documentato; l\'8080 lo esegue così)',
        'zh': '（未公开的操作码；8080 按此执行）',
        'zh-TW': '（未公開的操作碼；8080 依此執行）',
        'ja': '（非公開のオペコード。8080 はこのように実行します）',
        'ko': '(문서화되지 않은 옵코드. 8080은 이렇게 실행합니다)',
        'pt-BR': '(opcode não documentado; o 8080 o executa como este)',
    },

    'copy-link': {
        'en': 'Copy Link',
        'es': 'Copiar enlace',
        'fr': 'Copier le lien',
        'de': 'Link kopieren',
        'it': 'Copia link',
        'zh': '复制链接',
        'zh-TW': '複製連結',
        'ja': 'リンクをコピー',
        'ko': '링크 복사',
        'pt-BR': 'Copiar Link',
    },

    'copy-link-done': {
        'en': 'Copied \u2713',
        'es': 'Copiado \u2713',
        'fr': 'Copié \u2713',
        'de': 'Kopiert \u2713',
        'it': 'Copiato \u2713',
        'zh': '已复制 \u2713',
        'zh-TW': '已複製 \u2713',
        'ja': 'コピー済み \u2713',
        'ko': '복사됨 \u2713',
        'pt-BR': 'Copiado ✓',
    },

    'copy-link-off': {
        'en': 'The machine is off, so there is nothing to link to. Load a program first.',
        'es': 'La máquina está apagada, así que no hay nada que enlazar. Carga un programa primero.',
        'fr': 'La machine est éteinte, il n\'y a donc rien à partager. Chargez d\'abord un programme.',
        'de': 'Die Maschine ist aus, es gibt also nichts zu verlinken. Laden Sie zuerst ein Programm.',
        'it': 'La macchina è spenta, quindi non c\'è nulla da condividere. Carica prima un programma.',
        'zh': '机器已关闭，没有可链接的内容。请先载入程序。',
        'zh-TW': '機器已關閉，沒有可連結的內容。請先載入程式。',
        'ja': 'マシンの電源が切れているため、リンクするものがありません。先にプログラムを読み込んでください。',
        'ko': '기계가 꺼져 있어 링크할 것이 없습니다. 먼저 프로그램을 불러오세요.',
        'pt-BR': 'A máquina está desligada, então não há nada para compartilhar. Carregue um programa primeiro.',
    },

    'link-copied': {
        'en': 'Link copied. It opens the simulator with this memory, these registers and these switches, stopped here.',
        'es': 'Enlace copiado. Abre el simulador con esta memoria, estos registros y estos interruptores, detenido aquí.',
        'fr': 'Lien copié. Il ouvre le simulateur avec cette mémoire, ces registres et ces interrupteurs, arrêté ici.',
        'de': 'Link kopiert. Er öffnet den Simulator mit diesem Speicher, diesen Registern und diesen Schaltern, hier angehalten.',
        'it': 'Link copiato. Apre il simulatore con questa memoria, questi registri e questi interruttori, fermo qui.',
        'zh': '链接已复制。它会以当前的内存、寄存器和开关打开模拟器，并停在此处。',
        'zh-TW': '連結已複製。它會以目前的記憶體、暫存器和開關開啟模擬器，並停在此處。',
        'ja': 'リンクをコピーしました。このメモリ、レジスタ、スイッチの状態で、ここで停止したシミュレーターが開きます。',
        'ko': '링크를 복사했습니다. 현재 메모리, 레지스터, 스위치 상태로 여기서 멈춘 시뮬레이터가 열립니다.',
        'pt-BR': 'Link copiado. Ele abre o simulador com esta memória, estes registradores e estas chaves, parado aqui.',
    },

    'link-copied-program': {
        'en': 'Link copied. It opens the simulator with this memory loaded and RESET pressed, ready to RUN.',
        'es': 'Enlace copiado. Abre el simulador con esta memoria cargada y RESET pulsado, listo para RUN.',
        'fr': 'Lien copié. Il ouvre le simulateur avec cette mémoire chargée et RESET enfoncé, prêt pour RUN.',
        'de': 'Link kopiert. Er öffnet den Simulator mit diesem Speicher geladen und RESET gedrückt, bereit für RUN.',
        'it': 'Link copiato. Apre il simulatore con questa memoria caricata e RESET premuto, pronto per RUN.',
        'zh': '链接已复制。它会载入当前内存并按下 RESET 打开模拟器，可直接按 RUN。',
        'zh-TW': '連結已複製。它會載入目前記憶體並按下 RESET 開啟模擬器，可直接按 RUN。',
        'ja': 'リンクをコピーしました。このメモリを読み込み RESET を押した状態でシミュレーターが開き、すぐに RUN できます。',
        'ko': '링크를 복사했습니다. 현재 메모리를 불러오고 RESET을 누른 상태로 시뮬레이터가 열리며, 바로 RUN할 수 있습니다.',
        'pt-BR': 'Link copiado. Ele abre o simulador com esta memória carregada e RESET pressionado, pronto para RUN.',
    },

    'link-loaded': {
        'en': 'Loaded {bytes} bytes from the link at 0000H. Press RUN.',
        'es': 'Cargados {bytes} bytes del enlace en 0000H. Pulsa RUN.',
        'fr': '{bytes} octets du lien chargés en 0000H. Appuyez sur RUN.',
        'de': '{bytes} Bytes aus dem Link bei 0000H geladen. Drücken Sie RUN.',
        'it': 'Caricati {bytes} byte dal link a 0000H. Premi RUN.',
        'zh': '已从链接在 0000H 载入 {bytes} 字节。请按 RUN。',
        'zh-TW': '已從連結在 0000H 載入 {bytes} 位元組。請按 RUN。',
        'ja': 'リンクから 0000H に {bytes} バイトを読み込みました。RUN を押してください。',
        'ko': '링크에서 0000H에 {bytes}바이트를 불러왔습니다. RUN을 누르세요.',
        'pt-BR': '{bytes} bytes carregados do link em 0000H. Pressione RUN.',
    },

    'link-state-loaded': {
        'en': 'Loaded the machine from the link: {size} of memory, stopped at {pc}H. Press RUN or SINGLE STEP to carry on.',
        'es': 'Máquina cargada desde el enlace: {size} de memoria, detenida en {pc}H. Pulsa RUN o SINGLE STEP para seguir.',
        'fr': 'Machine chargée depuis le lien : {size} de mémoire, arrêtée en {pc}H. Appuyez sur RUN ou SINGLE STEP pour continuer.',
        'de': 'Maschine aus dem Link geladen: {size} Speicher, angehalten bei {pc}H. Mit RUN oder SINGLE STEP geht es weiter.',
        'it': 'Macchina caricata dal link: {size} di memoria, ferma a {pc}H. Premi RUN o SINGLE STEP per continuare.',
        'zh': '已从链接载入机器：内存 {size}，停在 {pc}H。按 RUN 或 SINGLE STEP 继续。',
        'zh-TW': '已從連結載入機器：記憶體 {size}，停在 {pc}H。按 RUN 或 SINGLE STEP 繼續。',
        'ja': 'リンクからマシンを読み込みました：メモリ {size}、{pc}H で停止中。RUN か SINGLE STEP で続行します。',
        'ko': '링크에서 기계를 불러왔습니다: 메모리 {size}, {pc}H에서 정지. RUN이나 SINGLE STEP으로 계속하세요.',
        'pt-BR': 'Máquina carregada do link: {size} de memória, parada em {pc}H. Pressione RUN ou SINGLE STEP para continuar.',
    },

    'link-bad-reg': {
        'en': 'The link sets {name} to "{text}", which is not a hex value that fits in it.',
        'es': 'El enlace pone {name} a "{text}", que no es un valor hex que quepa en él.',
        'fr': 'Le lien donne à {name} la valeur « {text} », qui n\'est pas une valeur hex qui y tient.',
        'de': 'Der Link setzt {name} auf „{text}“ – kein Hex-Wert, der hineinpasst.',
        'it': 'Il link imposta {name} a "{text}", che non è un valore hex che ci stia.',
        'zh': '链接将 {name} 设为“{text}”，这不是能放进它的十六进制值。',
        'zh-TW': '連結將 {name} 設為「{text}」，這不是能放進它的十六進位值。',
        'ja': 'リンクは {name} を「{text}」にしていますが、これは収まる 16 進数値ではありません。',
        'ko': '링크가 {name}을(를) "{text}"(으)로 설정하지만, 들어갈 수 있는 16진수 값이 아닙니다.',
        'pt-BR': 'O link define {name} como "{text}", que não é um valor hexadecimal que caiba nele.',
    },

    'link-bad-zip': {
        'en': 'The memory in the link is damaged, probably cut short when it was copied. Copy the whole link again.',
        'es': 'La memoria del enlace está dañada, seguramente se cortó al copiarlo. Vuelve a copiar el enlace entero.',
        'fr': 'La mémoire contenue dans le lien est abîmée, sans doute tronquée à la copie. Recopiez le lien en entier.',
        'de': 'Der Speicher im Link ist beschädigt, vermutlich beim Kopieren abgeschnitten. Kopieren Sie den ganzen Link erneut.',
        'it': 'La memoria nel link è danneggiata, probabilmente troncata durante la copia. Copia di nuovo il link intero.',
        'zh': '链接中的内存数据已损坏，可能是复制时被截断了。请重新复制完整的链接。',
        'zh-TW': '連結中的記憶體資料已損壞，可能是複製時被截斷了。請重新複製完整的連結。',
        'ja': 'リンク内のメモリが壊れています。コピーの際に途中で切れたのかもしれません。リンク全体をもう一度コピーしてください。',
        'ko': '링크 안의 메모리가 손상되었습니다. 복사할 때 잘린 것 같습니다. 링크 전체를 다시 복사하세요.',
        'pt-BR': 'A memória no link está danificada, provavelmente cortada quando foi copiada. Copie o link inteiro de novo.',
    },

    'link-bad-mem': {
        'en': 'The link asks for {text} bytes of memory. The machine can have 256, 4096 or 8192.',
        'es': 'El enlace pide {text} bytes de memoria. La máquina puede tener 256, 4096 u 8192.',
        'fr': 'Le lien demande {text} octets de mémoire. La machine peut en avoir 256, 4096 ou 8192.',
        'de': 'Der Link verlangt {text} Bytes Speicher. Die Maschine kann 256, 4096 oder 8192 haben.',
        'it': 'Il link chiede {text} byte di memoria. La macchina può averne 256, 4096 o 8192.',
        'zh': '链接要求 {text} 字节内存。机器只能有 256、4096 或 8192 字节。',
        'zh-TW': '連結要求 {text} 位元組記憶體。機器只能有 256、4096 或 8192 位元組。',
        'ja': 'リンクはメモリ {text} バイトを求めています。マシンに載せられるのは 256、4096、8192 のいずれかです。',
        'ko': '링크가 메모리 {text}바이트를 요구합니다. 기계는 256, 4096, 8192 중 하나만 가능합니다.',
        'pt-BR': 'O link pede {text} bytes de memória. A máquina pode ter 256, 4096 ou 8192.',
    },

    'load-data-empty': {
        'en': 'Nothing to load. Type some bytes in hex, such as c3 00 00.',
        'es': 'No hay nada que cargar. Escribe algunos bytes en hex, por ejemplo c3 00 00.',
        'fr': 'Rien à charger. Tapez des octets en hexadécimal, par exemple c3 00 00.',
        'de': 'Nichts zu laden. Geben Sie Bytes in Hex ein, etwa c3 00 00.',
        'it': 'Non c’è nulla da caricare. Scrivi dei byte in esadecimale, ad esempio c3 00 00.',
        'zh': '没有可加载的内容。请输入十六进制字节，例如 c3 00 00。',
        'zh-TW': '沒有可載入的內容。請輸入十六進位位元組，例如 c3 00 00。',
        'ja': '読み込むものがありません。16 進数でバイト列を入力してください。例えば c3 00 00。',
        'ko': '불러올 내용이 없습니다. 16진수 바이트를 입력하세요. 예: c3 00 00.',
        'pt-BR': 'Nada para carregar. Digite alguns bytes em hex, como c3 00 00.',
    },

    'load-data-bad': {
        'en': '"{text}" is not a byte. A byte is one or two hex digits, such as c3 or 0f.',
        'es': '"{text}" no es un byte. Un byte son uno o dos dígitos hex, por ejemplo c3 o 0f.',
        'fr': '« {text} » n’est pas un octet. Un octet s’écrit avec un ou deux chiffres hexadécimaux, par exemple c3 ou 0f.',
        'de': '"{text}" ist kein Byte. Ein Byte sind eine oder zwei Hex-Ziffern, etwa c3 oder 0f.',
        'it': '"{text}" non è un byte. Un byte è una o due cifre esadecimali, ad esempio c3 o 0f.',
        'zh': '“{text}” 不是一个字节。字节是一到两位十六进制数字，例如 c3 或 0f。',
        'zh-TW': '「{text}」不是一個位元組。位元組是一到兩位十六進位數字，例如 c3 或 0f。',
        'ja': '「{text}」はバイトではありません。バイトは 16 進数 1 桁か 2 桁です。例えば c3 や 0f。',
        'ko': '"{text}"은(는) 바이트가 아닙니다. 바이트는 16진수 한두 자리입니다. 예: c3 또는 0f.',
        'pt-BR': '"{text}" não é um byte. Um byte tem um ou dois dígitos hexadecimais, como c3 ou 0f.',
    },

    'load-data-too-long': {
        'en': 'That is {bytes} bytes and the machine has {size}. Install more memory, or load fewer.',
        'es': 'Son {bytes} bytes y la máquina tiene {size}. Instala más memoria o carga menos.',
        'fr': 'Cela fait {bytes} octets et la machine en a {size}. Installez plus de mémoire, ou chargez-en moins.',
        'de': 'Das sind {bytes} Bytes, die Maschine hat {size}. Bauen Sie mehr Speicher ein oder laden Sie weniger.',
        'it': 'Sono {bytes} byte e la macchina ne ha {size}. Installa più memoria, o caricane meno.',
        'zh': '这是 {bytes} 字节，而机器只有 {size}。请加装内存，或少载入一些。',
        'zh-TW': '這是 {bytes} 位元組，而機器只有 {size}。請加裝記憶體，或少載入一些。',
        'ja': '{bytes} バイトありますが、マシンは {size} しかありません。メモリを増やすか、量を減らしてください。',
        'ko': '{bytes}바이트인데 기계에는 {size}뿐입니다. 메모리를 늘리거나 더 적게 불러오세요.',
        'pt-BR': 'São {bytes} bytes, e a máquina tem {size}. Instale mais memória ou carregue menos.',
    },

    'load-data-odd': {
        'en': '"{text}" has an odd number of hex digits, so it is not a whole number of bytes.',
        'es': '"{text}" tiene un número impar de dígitos hex, así que no son bytes completos.',
        'fr': '« {text} » a un nombre impair de chiffres hexadécimaux, ce ne sont donc pas des octets entiers.',
        'de': '"{text}" hat eine ungerade Anzahl Hex-Ziffern und ergibt damit keine ganzen Bytes.',
        'it': '"{text}" ha un numero dispari di cifre esadecimali, quindi non sono byte interi.',
        'zh': '“{text}” 的十六进制位数是奇数，凑不成整数个字节。',
        'zh-TW': '「{text}」的十六進位位數是奇數，湊不成整數個位元組。',
        'ja': '「{text}」は 16 進数の桁数が奇数なので、バイトの区切りになりません。',
        'ko': '"{text}"은(는) 16진수 자릿수가 홀수여서 온전한 바이트가 되지 않습니다.',
        'pt-BR': '"{text}" tem um número ímpar de dígitos hexadecimais, então não forma um número inteiro de bytes.',
    },

    'load-data-loaded': {
        'en': 'Loaded {bytes} bytes at 0000H.',
        'es': 'Cargados {bytes} bytes en 0000H.',
        'fr': '{bytes} octets chargés en 0000H.',
        'de': '{bytes} Bytes bei 0000H geladen.',
        'it': 'Caricati {bytes} byte a 0000H.',
        'zh': '已在 0000H 载入 {bytes} 字节。',
        'zh-TW': '已在 0000H 載入 {bytes} 位元組。',
        'ja': '0000H に {bytes} バイトを読み込みました。',
        'ko': '0000H에 {bytes}바이트를 불러왔습니다.',
        'pt-BR': '{bytes} bytes carregados em 0000H.',
    },

    'debug-fill-zero': {
        'en': 'Zero All Memory',
        'es': 'Poner Memoria a Cero',
        'fr': 'Mettre la Mémoire à Zéro',
        'de': 'Speicher Nullsetzen',
        'it': 'Azzera la Memoria',
        'zh': '内存清零',
        'zh-TW': '記憶體清零',
        'ja': 'メモリをゼロに',
        'ko': '메모리 0으로',
        'pt-BR': 'Zerar Toda a Memória',
    },

    'mem-page-prev-title': {
        'en': 'Previous page of memory',
        'es': 'Página anterior de memoria',
        'fr': 'Page de mémoire précédente',
        'de': 'Vorherige Speicherseite',
        'it': 'Pagina di memoria precedente',
        'zh': '上一页内存',
        'zh-TW': '上一頁記憶體',
        'ja': 'メモリの前のページ',
        'ko': '이전 메모리 페이지',
        'pt-BR': 'Página anterior da memória',
    },

    'mem-page-next-title': {
        'en': 'Next page of memory',
        'es': 'Página siguiente de memoria',
        'fr': 'Page de mémoire suivante',
        'de': 'Nächste Speicherseite',
        'it': 'Pagina di memoria successiva',
        'zh': '下一页内存',
        'zh-TW': '下一頁記憶體',
        'ja': 'メモリの次のページ',
        'ko': '다음 메모리 페이지',
        'pt-BR': 'Próxima página da memória',
    },

    'mem-nav-off': {
        'en': 'The machine is off, so there is no memory dump to move around in. Switch it on first.',
        'es': 'La máquina está apagada, así que no hay volcado de memoria por el que moverse. Enciéndela primero.',
        'fr': 'La machine est éteinte, il n\'y a donc aucun vidage mémoire à parcourir. Allumez-la d\'abord.',
        'de': 'Die Maschine ist aus, es gibt also keinen Speicherauszug zum Blättern. Schalten Sie sie zuerst ein.',
        'it': 'La macchina è spenta, quindi non c\'è alcun dump di memoria da scorrere. Accendila prima.',
        'zh': '机器已关闭，没有内存转储可以浏览。请先开机。',
        'zh-TW': '機器已關閉，沒有記憶體傾印可以瀏覽。請先開機。',
        'ja': '電源が入っていないので、たどるメモリダンプがありません。先に電源を入れてください。',
        'ko': '기계가 꺼져 있어 살펴볼 메모리 덤프가 없습니다. 먼저 전원을 켜세요.',
        'pt-BR': 'A máquina está desligada, então não há despejo de memória para percorrer. Ligue-a primeiro.',
    },

    'mem-nav-fits': {
        'en': 'All {size} is on screen at once. Install 4 KB or 8 KB and the dump gets a window to move.',
        'es': 'Los {size} caben en pantalla de una vez. Instala 4 KB u 8 KB y el volcado tendrá una ventana que mover.',
        'fr': 'Les {size} tiennent à l’écran d’un seul coup. Installez 4 Ko ou 8 Ko et le vidage aura une fenêtre à déplacer.',
        'de': 'Die {size} passen auf einmal auf den Bildschirm. Bauen Sie 4 KB oder 8 KB ein, dann bekommt der Auszug ein Fenster zum Verschieben.',
        'it': 'Tutti i {size} stanno sullo schermo in una volta. Installa 4 KB o 8 KB e il dump avrà una finestra da spostare.',
        'zh': '{size} 一屏就能显示完。装上 4 KB 或 8 KB，转储才会有可移动的窗口。',
        'zh-TW': '{size} 一個畫面就能顯示完。裝上 4 KB 或 8 KB，傾印才會有可移動的視窗。',
        'ja': '{size} は一画面に収まります。4 KB か 8 KB を増設すると、ダンプに動かせる窓ができます。',
        'ko': '{size}는 한 화면에 모두 들어갑니다. 4 KB나 8 KB를 설치하면 덤프에 옮길 창이 생깁니다.',
        'pt-BR': 'Todos os {size} cabem na tela de uma vez. Instale 4 KB ou 8 KB e o despejo ganha uma janela para percorrer.',
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
        'pt-BR': 'Estado da CPU 8080',
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
        'pt-BR': 'Memória Instalada',
    },

    'mem-follow-pc': {
        'en': 'Follow PC',
        'es': 'Seguir el PC',
        'fr': 'Suivre le PC',
        'de': 'PC folgen',
        'it': 'Segui il PC',
        'zh': '跟随 PC',
        'zh-TW': '跟隨 PC',
        'ja': 'PC を追う',
        'ko': 'PC 따라가기',
        'pt-BR': 'Seguir o PC',
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
        'pt-BR': 'Despejo de Memória',
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
        'pt-BR': 'Tutorial Rápido',
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
        'pt-BR': 'Como inserir e rodar o programa a seguir, que calcula 1 + 2 = 3:',
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
        'pt-BR': 'Ligue o Altair 8800 clicando na chave OFF/ON.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 00 111 010 (para cima é 1, para baixo é 0).',
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
        'pt-BR': 'Clique em DEPOSIT.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 10 000 000.',
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
        'pt-BR': 'Clique em DEPOSIT NEXT.',
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
        'pt-BR': 'Repita os passos 4-5 para inserir os bytes a seguir, um a um: 00 000 000, 01 000 111, 00 111 010, 10 000 001, 00 000 000, 10 000 000, 00 110 010, 10 000 010, 00 000 000, 11 000 011, 00 000 000, 00 000 000.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 10 000 000.',
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
        'pt-BR': 'Clique em EXAMINE.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 00 000 001 (o primeiro número a somar, ou 1 em decimal).',
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
        'pt-BR': 'Clique em DEPOSIT.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 00 000 010 (o segundo número a somar, ou 2 em decimal).',
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
        'pt-BR': 'Clique em DEPOSIT NEXT.',
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
        'pt-BR': 'Clique em RESET.',
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
        'pt-BR': 'Clique em RUN e espere alguns segundos.',
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
        'pt-BR': 'Clique em STOP.',
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
        'pt-BR': 'Coloque as chaves A7-A0 em 10 000 010 (o endereço que guarda a soma).',
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
        'pt-BR': 'Clique em EXAMINE.',
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
        'pt-BR': 'Os LEDs D7-D0 mostram o resultado 00 000 011 (3 em decimal).',
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
        'pt-BR': 'Desligue o Altair 8800.',
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
        'pt-BR': 'Rodando o Microsoft BASIC',
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
        'pt-BR': 'O primeiro software do Altair, e da Microsoft: o Altair BASIC 3.2, escrito em 1975 por Bill Gates, Paul Allen e Monte Davidoff. Como iniciá-lo:',
    },

    'basic-1': {
        'en': 'In the Memory menu, choose 4 KB (or 8 KB, for room to write longer programs). Installing memory switches the machine off, which is what opening the case would have done.',
        'es': 'En el menú Memoria, elige 4 KB (u 8 KB, para escribir programas más largos). Instalar memoria apaga la máquina, que es lo que habría pasado al abrir la caja.',
        'fr': 'Dans le menu Mémoire, choisissez 4 Kio (ou 8 Kio, pour écrire des programmes plus longs). Installer de la mémoire éteint la machine, comme le ferait l\'ouverture du boîtier.',
        'de': 'Wählen Sie im Menü Speicher 4 KB (oder 8 KB für längere Programme). Speicher einzubauen schaltet die Maschine ab - genau wie das Öffnen des Gehäuses.',
        'it': 'Nel menu Memoria scegli 4 KB (o 8 KB, per programmi più lunghi). Installare memoria spegne la macchina, come sarebbe successo aprendo il contenitore.',
        'zh': '在“内存”菜单中选择 4 KB（想写长一点的程序就选 8 KB）。安装内存会关闭机器——当年打开机箱也是如此。',
        'zh-TW': '在「記憶體」選單中選擇 4 KB（想寫長一點的程式就選 8 KB）。安裝記憶體會關閉機器——當年打開機殼也是如此。',
        'ja': '「メモリ」メニューで 4 KB（長いプログラムを書くなら 8 KB）を選びます。メモリを増設すると電源が切れます。筐体を開けるのですから当然です。',
        'ko': '"메모리" 메뉴에서 4 KB(더 긴 프로그램을 쓰려면 8 KB)를 고르세요. 메모리를 설치하면 기계가 꺼집니다. 케이스를 여는 일이니까요.',
        'pt-BR': 'No menu Memória, escolha 4 KB (ou 8 KB, para ter espaço para programas mais longos). Instalar memória desliga a máquina, como abrir o gabinete teria feito.',
    },

    'basic-2': {
        'en': 'In the Load menu, choose Microsoft 4K BASIC. The machine powers up, the tape is read for you, RESET is pressed, and the Debugger opens to show what arrived.',
        'es': 'En el menú Cargar, elige Microsoft 4K BASIC. La máquina se enciende, la cinta se lee por ti, se pulsa RESET y se abre el Depurador para mostrar lo que ha llegado.',
        'fr': 'Dans le menu Charger, choisissez Microsoft 4K BASIC. La machine s\'allume, la bande est lue pour vous, RESET est appuyé et le Débogueur s\'ouvre pour montrer ce qui est arrivé.',
        'de': 'Wählen Sie im Menü Laden Microsoft 4K BASIC. Die Maschine geht an, das Band wird für Sie eingelesen, RESET gedrückt, und der Debugger öffnet sich und zeigt, was angekommen ist.',
        'it': 'Nel menu Carica, scegli Microsoft 4K BASIC. La macchina si accende, il nastro viene letto per te, viene premuto RESET e si apre il Debugger per mostrare cosa è arrivato.',
        'zh': '在“加载”菜单中选择 Microsoft 4K BASIC。机器会开机，纸带会替你读入，按下 RESET，并打开调试器显示载入的内容。',
        'zh-TW': '在「載入」選單中選擇 Microsoft 4K BASIC。機器會開機，紙帶會替你讀入，按下 RESET，並打開除錯器顯示載入的內容。',
        'ja': '「読み込み」メニューで Microsoft 4K BASIC を選びます。電源が入り、テープが代わりに読み込まれ、RESET が押され、デバッガーが開いて読み込んだものを見せます。',
        'ko': '"불러오기" 메뉴에서 Microsoft 4K BASIC을 고르세요. 전원이 켜지고, 테이프가 대신 읽히고, RESET이 눌리고, 디버거가 열려 불러온 내용을 보여 줍니다.',
        'pt-BR': 'No menu Carregar, escolha Microsoft 4K BASIC. A máquina liga, a fita é lida para você, RESET é pressionado e o Depurador se abre para mostrar o que chegou.',
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
        'pt-BR': 'Antes de continuar, olhe o mapa de memória acima do despejo. Quinze das dezesseis páginas de uma máquina de 4 KB estão cheias: isso é o BASIC, e a única página que sobra é todo o espaço que você tem para um programa. É isso que "4K BASIC" quer dizer.',
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
        'pt-BR': 'As chaves de endereço A15-A8 dizem ao BASIC qual placa de terminal usar: todas para baixo é a 88-SIO, nas portas 00H e 01H; a chave A11 para cima é a 88-2SIO, em 10H e 11H. O teletipo aqui está ligado aos dois slots, então qualquer ajuste funciona - um Altair real teria só uma das duas placas instalada, e o ajuste errado o deixava mudo.',
    },

    'basic-5': {
        'en': 'Click RUN on the front panel.',
        'es': 'Pulsa RUN en el panel frontal.',
        'fr': 'Cliquez sur RUN en façade.',
        'de': 'Klicken Sie RUN an der Frontplatte.',
        'it': 'Premi RUN sul pannello frontale.',
        'zh': '点击前面板上的 RUN。',
        'zh-TW': '點擊前面板上的 RUN。',
        'ja': 'フロントパネルの RUN を押します。',
        'ko': '앞판의 RUN을 누르세요.',
        'pt-BR': 'Clique em RUN no painel frontal.',
    },

    'basic-6': {
        'en': 'Open the Teletype, under the panel. BASIC asks MEMORY SIZE? - press Enter to take everything it found. Press Enter again for TERMINAL WIDTH?, then Y for WANT SIN? to keep the maths functions.',
        'es': 'Abre el Teletipo, bajo el panel. BASIC pregunta MEMORY SIZE?: pulsa Intro para usar toda la que ha encontrado. Pulsa Intro otra vez en TERMINAL WIDTH? y luego Y en WANT SIN? para conservar las funciones matemáticas.',
        'fr': 'Ouvrez le Téléscripteur, sous le panneau. BASIC demande MEMORY SIZE? : appuyez sur Entrée pour tout prendre. Entrée à nouveau pour TERMINAL WIDTH?, puis Y pour WANT SIN? afin de garder les fonctions mathématiques.',
        'de': 'Öffnen Sie den Fernschreiber unter der Frontplatte. BASIC fragt MEMORY SIZE? - Enter nimmt alles, was es gefunden hat. Noch einmal Enter bei TERMINAL WIDTH?, dann Y bei WANT SIN?, um die Mathematikfunktionen zu behalten.',
        'it': 'Apri la Telescrivente, sotto il pannello. BASIC chiede MEMORY SIZE?: premi Invio per prendere tutta quella trovata. Invio di nuovo per TERMINAL WIDTH?, poi Y per WANT SIN? per tenere le funzioni matematiche.',
        'zh': '打开面板下方的“电传打字机”。BASIC 会问 MEMORY SIZE?——直接按回车表示全部使用。TERMINAL WIDTH? 再按一次回车，WANT SIN? 输入 Y 以保留数学函数。',
        'zh-TW': '打開面板下方的「電傳打字機」。BASIC 會問 MEMORY SIZE?——直接按 Enter 表示全部使用。TERMINAL WIDTH? 再按一次 Enter，WANT SIN? 輸入 Y 以保留數學函式。',
        'ja': 'パネルの下のテレタイプを開きます。BASIC が MEMORY SIZE? と聞くので、Enter で見つかった分を全部使います。TERMINAL WIDTH? でもう一度 Enter、WANT SIN? では Y と答えて数学関数を残します。',
        'ko': '패널 아래의 텔레타이프를 여세요. BASIC이 MEMORY SIZE?라고 물으면 Enter를 눌러 찾은 메모리를 모두 씁니다. TERMINAL WIDTH?에서 다시 Enter, WANT SIN?에서 Y를 눌러 수학 함수를 남깁니다.',
        'pt-BR': 'Abra o Teletipo, abaixo do painel. O BASIC pergunta MEMORY SIZE? - pressione Enter para usar toda a memória que ele encontrou. Pressione Enter de novo em TERMINAL WIDTH? e depois Y em WANT SIN? para manter as funções matemáticas.',
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
        'pt-BR': 'Ele mostra quantos bytes estão livres e depois OK. Experimente PRINT 22/7 para ter uma resposta na hora. Para digitar um programa, entre estas linhas uma de cada vez, pressionando Enter após cada uma:',
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
        'pt-BR': 'O teclado só tem maiúsculas. O sublinhado apaga o último caractere, a arroba descarta a linha e Ctrl-C interrompe um programa em execução.',
    },

    'basic-note': {
        'en': 'What loading 4K BASIC skips: on a real Altair you first toggled a 28 byte boot loader in through the front panel, one byte at a time, then started the paper tape reader and waited about seven minutes while BASIC clattered in. Get one switch wrong and you did it again.',
        'es': 'Lo que se salta al cargar 4K BASIC: en un Altair real primero introducías con los interruptores un cargador de 28 bytes, byte a byte, luego arrancabas el lector de cinta y esperabas unos siete minutos mientras BASIC entraba traqueteando. Un interruptor mal puesto y vuelta a empezar.',
        'fr': 'Ce que le chargement de 4K BASIC escamote : sur un vrai Altair, vous saisissiez d\'abord un chargeur de 28 octets aux interrupteurs, octet par octet, puis vous lanciez le lecteur de bande et attendiez sept minutes pendant que BASIC entrait en cliquetant. Un seul interrupteur de travers et on recommençait.',
        'de': 'Was das Laden von 4K BASIC überspringt: an einem echten Altair gaben Sie zuerst einen 28 Byte langen Urlader über die Kippschalter ein, Byte für Byte, starteten dann den Lochstreifenleser und warteten etwa sieben Minuten, während BASIC hereinratterte. Ein falscher Schalter, und Sie fingen von vorn an.',
        'it': 'Quello che il caricamento di 4K BASIC salta: su un Altair vero inserivi prima con gli interruttori un boot loader di 28 byte, un byte alla volta, poi avviavi il lettore di nastro e aspettavi circa sette minuti mentre BASIC entrava sferragliando. Un interruttore sbagliato e si ricominciava.',
        'zh': '加载 4K BASIC 替你省掉的事：在真正的 Altair 上，你得先用前面板开关一个字节一个字节地输入 28 字节的引导程序，然后启动纸带阅读机，听着 BASIC 哗啦啦读上大约七分钟。有一个开关拨错，就得从头再来。',
        'zh-TW': '載入 4K BASIC 替你省掉的事：在真正的 Altair 上，你得先用前面板開關一個位元組一個位元組地輸入 28 位元組的載入程式，然後啟動紙帶閱讀機，聽著 BASIC 嘩啦啦讀上大約七分鐘。有一個開關撥錯，就得從頭再來。',
        'ja': '4K BASIC の読み込みが省いていること。本物の Altair では、まず 28 バイトのブートローダーをフロントパネルのスイッチで一バイトずつ入力し、それから紙テープリーダーを回して、BASIC がガチャガチャと入ってくるのを七分ほど待ちました。スイッチを一つ間違えれば、最初からやり直しです。',
        'ko': '4K BASIC을 불러오면서 건너뛴 것: 진짜 Altair에서는 먼저 28바이트짜리 부트로더를 앞판 스위치로 한 바이트씩 입력하고, 종이 테이프 리더를 돌린 뒤, BASIC이 달그락거리며 들어오는 7분을 기다렸습니다. 스위치 하나만 틀려도 처음부터 다시였습니다.',
        'pt-BR': 'O que carregar o 4K BASIC poupa: num Altair real, primeiro você inseria pelo painel frontal um carregador de boot de 28 bytes, um byte de cada vez, depois ligava a leitora de fita de papel e esperava uns sete minutos enquanto o BASIC entrava, ruidoso. Errou uma chave, fazia tudo de novo.',
    },

    'reference-title': {
        'en': 'Further Reading',
        'es': 'Para Saber Más',
        'fr': 'Pour Aller Plus Loin',
        'de': 'Weiterlesen',
        'it': 'Per Approfondire',
        'zh': '延伸阅读',
        'zh-TW': '延伸閱讀',
        'ja': 'さらに詳しく',
        'ko': '더 읽을거리',
        'pt-BR': 'Para Saber Mais',
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
        'pt-BR': 'Wikipédia: Altair 8800',
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
        'pt-BR': 'Wikipédia: CPU Intel 8080',
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
        'pt-BR': 'Conjunto de instruções do Intel 8080 - referência rápida da codificação dos opcodes (texto)',
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
        'pt-BR': 'Manuais originais do Altair 8800 - PDFs digitalizados, arquivados em altairclone.com',
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
        'pt-BR': "Altair 8800 Operator's Manual - o manual original, em PDF digitalizado",
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
        'pt-BR': "Altair 8800 Operator's Manual v2.0 - uma edição em HTML de Kevin Cole",
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
        'pt-BR': 'Intel 8080 Assembly Language Programming Manual - o manual original da Intel, em PDF digitalizado',
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
        'pt-BR': 'Demystifying Computers - um livro de código aberto de Chris Jones e Jeff Elkner',
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
        'pt-BR': 'Wikipédia: Altair BASIC - o que é, e como a Microsoft começou com ele',
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
        'pt-BR': 'MITS Altair BASIC Reference Manual (1975) - a própria linguagem: um tutorial, cada comando e função, as perguntas de inicialização no Apêndice B e os códigos de erro no Apêndice C',
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
        'pt-BR': 'Altair BASIC 3.2 (4K) - uma desmontagem comentada exatamente do programa que este simulador roda',
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
        'pt-BR': 'MITS Altair Simulator - outro simulador em JavaScript, que roda o Microsoft BASIC num teletipo simulado',
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
