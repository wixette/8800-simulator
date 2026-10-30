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
 * @fileoverview The messages of the 3D view and of the machine's box
 * (docs/3d-view.md), in the same form as js/l10n.js, which merges them
 * into its own. Kept apart only for size: they are loaded with the
 * page, since the box answers the OFF/ON switch in the 2D view too.
 *
 * Part names ('part-' and the part's node in the model) are written to
 * stand alone - in a label, and after a colon in a message - so that no
 * language has to fit them into a sentence's grammar.
 */

export const MESSAGES_3D = {
    // ---- The box: taking it apart, and the power (V4) ----

    'box-power-apart': {
        'en': 'The machine is taken apart, so it will not switch on. Put it back together first (out: {part}).',
        'es': 'La máquina está desmontada, así que no se enciende. Vuelve a montarla primero (fuera: {part}).',
        'fr': 'La machine est démontée, elle ne s’allume donc pas. Remontez-la d’abord (sorti : {part}).',
        'de': 'Die Maschine ist zerlegt und lässt sich nicht einschalten. Bauen Sie sie zuerst wieder zusammen (ausgebaut: {part}).',
        'it': 'La macchina è smontata, quindi non si accende. Rimontala prima (fuori: {part}).',
        'pt-BR': 'A máquina está desmontada, então não liga. Monte-a de novo primeiro (fora: {part}).',
        'zh': '机器已拆开，无法开机。请先把它装回去（已取出：{part}）。',
        'zh-TW': '機器已拆開，無法開機。請先把它裝回去（已取出：{part}）。',
        'ja': 'マシンが分解されているので電源が入りません。先に組み立て直してください（取り外し中：{part}）。',
        'ko': '기계가 분해되어 있어 켜지지 않습니다. 먼저 다시 조립하세요(분리됨: {part}).',
    },

    'box-switch-off': {
        'en': 'Switch the machine OFF before taking it apart.',
        'es': 'Apaga la máquina (OFF) antes de desmontarla.',
        'fr': 'Éteignez la machine (OFF) avant de la démonter.',
        'de': 'Schalten Sie die Maschine aus (OFF), bevor Sie sie zerlegen.',
        'it': 'Spegni la macchina (OFF) prima di smontarla.',
        'pt-BR': 'Desligue a máquina (OFF) antes de desmontá-la.',
        'zh': '拆开之前，请先关机（OFF）。',
        'zh-TW': '拆開之前，請先關機（OFF）。',
        'ja': '分解する前にマシンの電源を切ってください（OFF）。',
        'ko': '분해하기 전에 기계를 끄세요(OFF).',
    },

    'box-busy': {
        'en': 'Wait until the part that is moving has stopped.',
        'es': 'Espera a que la pieza que se mueve se detenga.',
        'fr': 'Attendez que la pièce en mouvement se soit arrêtée.',
        'de': 'Warten Sie, bis das Teil, das sich bewegt, stillsteht.',
        'it': 'Aspetta che il pezzo in movimento si fermi.',
        'pt-BR': 'Espere a peça que está se movendo parar.',
        'zh': '请等正在移动的部件停下。',
        'zh-TW': '請等正在移動的部件停下。',
        'ja': '動いている部品が止まるまでお待ちください。',
        'ko': '움직이는 부품이 멈출 때까지 기다리세요.',
    },

    'box-out-first': {
        'en': 'Take this out first: {part}.',
        'es': 'Saca esto primero: {part}.',
        'fr': 'Retirez d’abord ceci : {part}.',
        'de': 'Zuerst ausbauen: {part}.',
        'it': 'Togli prima questo: {part}.',
        'pt-BR': 'Tire isto primeiro: {part}.',
        'zh': '请先取出：{part}。',
        'zh-TW': '請先取出：{part}。',
        'ja': '先にこれを外してください：{part}。',
        'ko': '이것을 먼저 빼세요: {part}.',
    },

    'box-in-first': {
        'en': 'Put this back first: {part}.',
        'es': 'Vuelve a poner esto primero: {part}.',
        'fr': 'Remettez d’abord ceci : {part}.',
        'de': 'Zuerst wieder einbauen: {part}.',
        'it': 'Rimetti prima questo: {part}.',
        'pt-BR': 'Recoloque isto primeiro: {part}.',
        'zh': '请先装回：{part}。',
        'zh-TW': '請先裝回：{part}。',
        'ja': '先にこれを戻してください：{part}。',
        'ko': '이것을 먼저 다시 넣으세요: {part}.',
    },

    'reassembled-first': {
        'en': 'The machine was taken apart and off, so it was put back together and switched on first.',
        'es': 'La máquina estaba desmontada y apagada, así que primero se volvió a montar y se encendió.',
        'fr': 'La machine était démontée et éteinte : elle a d’abord été remontée et allumée.',
        'de': 'Die Maschine war zerlegt und aus und wurde zuerst zusammengebaut und eingeschaltet.',
        'it': 'La macchina era smontata e spenta, quindi prima è stata rimontata e accesa.',
        'pt-BR': 'A máquina estava desmontada e desligada, então primeiro foi montada de novo e ligada.',
        'zh': '机器原本已拆开且关着，已先装回并开机。',
        'zh-TW': '機器原本已拆開且關著，已先裝回並開機。',
        'ja': 'マシンが分解されて電源も切れていたので、先に組み立てて電源を入れました。',
        'ko': '기계가 분해되어 꺼져 있어서 먼저 다시 조립하고 켰습니다.',
    },

    // ---- The parts that come out ----

    'part-case.top': {
        'en': 'Case top (the lid)',
        'es': 'Tapa de la caja',
        'fr': 'Capot du boîtier',
        'de': 'Gehäusedeckel',
        'it': 'Coperchio del contenitore',
        'pt-BR': 'Tampa do gabinete',
        'zh': '机箱上盖',
        'zh-TW': '機殼上蓋',
        'ja': '筐体の上ぶた',
        'ko': '케이스 덮개',
    },

    'part-harness.data_plug': {
        'en': 'Data cable plug',
        'es': 'Conector del cable de datos',
        'fr': 'Fiche du câble de données',
        'de': 'Stecker des Datenkabels',
        'it': 'Spina del cavo dati',
        'pt-BR': 'Plugue do cabo de dados',
        'zh': '数据线插头',
        'zh-TW': '資料線插頭',
        'ja': 'データケーブルのプラグ',
        'ko': '데이터 케이블 플러그',
    },

    'part-psu.t1': {
        'en': 'Transformer T1',
        'es': 'Transformador T1',
        'fr': 'Transformateur T1',
        'de': 'Transformator T1',
        'it': 'Trasformatore T1',
        'pt-BR': 'Transformador T1',
        'zh': '变压器 T1',
        'zh-TW': '變壓器 T1',
        'ja': 'トランス T1',
        'ko': '변압기 T1',
    },

    'part-psu.t2': {
        'en': 'Transformer T2',
        'es': 'Transformador T2',
        'fr': 'Transformateur T2',
        'de': 'Transformator T2',
        'it': 'Trasformatore T2',
        'pt-BR': 'Transformador T2',
        'zh': '变压器 T2',
        'zh-TW': '變壓器 T2',
        'ja': 'トランス T2',
        'ko': '변압기 T2',
    },

    'part-psu.t3': {
        'en': 'Transformer T3',
        'es': 'Transformador T3',
        'fr': 'Transformateur T3',
        'de': 'Transformator T3',
        'it': 'Trasformatore T3',
        'pt-BR': 'Transformador T3',
        'zh': '变压器 T3',
        'zh-TW': '變壓器 T3',
        'ja': 'トランス T3',
        'ko': '변압기 T3',
    },

    'part-psu.fan': {
        'en': 'Fan',
        'es': 'Ventilador',
        'fr': 'Ventilateur',
        'de': 'Lüfter',
        'it': 'Ventola',
        'pt-BR': 'Ventilador',
        'zh': '风扇',
        'zh-TW': '風扇',
        'ja': 'ファン',
        'ko': '팬',
    },

    'part-psu.board': {
        'en': 'Power supply board',
        'es': 'Placa de la fuente de alimentación',
        'fr': 'Carte d’alimentation',
        'de': 'Netzteilplatine',
        'it': 'Scheda di alimentazione',
        'pt-BR': 'Placa da fonte de alimentação',
        'zh': '电源板',
        'zh-TW': '電源板',
        'ja': '電源ボード',
        'ko': '전원 보드',
    },

    'part-psu.terminal_block': {
        'en': 'Terminal block',
        'es': 'Regleta de bornes',
        'fr': 'Bornier',
        'de': 'Klemmleiste',
        'it': 'Morsettiera',
        'pt-BR': 'Régua de bornes',
        'zh': '接线端子排',
        'zh-TW': '接線端子排',
        'ja': '端子台',
        'ko': '단자대',
    },

    'part-chassis.frame': {
        'en': 'Chassis',
        'es': 'Chasis',
        'fr': 'Châssis',
        'de': 'Chassis',
        'it': 'Telaio',
        'pt-BR': 'Chassi',
        'zh': '机架',
        'zh-TW': '機架',
        'ja': 'シャーシ',
        'ko': '섀시',
    },

    'part-panel.dress': {
        'en': 'Dress panel (the lettered front)',
        'es': 'Panel frontal rotulado',
        'fr': 'Façade sérigraphiée',
        'de': 'Beschriftete Frontplatte',
        'it': 'Pannello frontale serigrafato',
        'pt-BR': 'Painel frontal serigrafado',
        'zh': '前面板（印字面板）',
        'zh-TW': '前面板（印字面板）',
        'ja': '前面パネル（文字入りの化粧板）',
        'ko': '전면 패널(글자가 인쇄된 판)',
    },

    'part-card.cpu': {
        'en': 'CPU card (Intel 8080)',
        'es': 'Tarjeta de CPU (Intel 8080)',
        'fr': 'Carte processeur (Intel 8080)',
        'de': 'CPU-Karte (Intel 8080)',
        'it': 'Scheda CPU (Intel 8080)',
        'pt-BR': 'Placa da CPU (Intel 8080)',
        'zh': 'CPU 卡（Intel 8080）',
        'zh-TW': 'CPU 卡（Intel 8080）',
        'ja': 'CPU カード（Intel 8080）',
        'ko': 'CPU 카드(Intel 8080)',
    },

    'part-card.mem1k': {
        'en': '1K memory card (256 bytes fitted)',
        'es': 'Tarjeta de memoria 1K (con 256 bytes)',
        'fr': 'Carte mémoire 1K (256 octets montés)',
        'de': '1K-Speicherkarte (256 Byte bestückt)',
        'it': 'Scheda di memoria 1K (256 byte montati)',
        'pt-BR': 'Placa de memória 1K (com 256 bytes)',
        'zh': '1K 内存卡（装有 256 字节）',
        'zh-TW': '1K 記憶體卡（裝有 256 位元組）',
        'ja': '1K メモリカード（256 バイト実装）',
        'ko': '1K 메모리 카드(256바이트 장착)',
    },

    'part-card.mem4k_0': {
        'en': '4K memory card (88-4MCS)',
        'es': 'Tarjeta de memoria 4K (88-4MCS)',
        'fr': 'Carte mémoire 4K (88-4MCS)',
        'de': '4K-Speicherkarte (88-4MCS)',
        'it': 'Scheda di memoria 4K (88-4MCS)',
        'pt-BR': 'Placa de memória 4K (88-4MCS)',
        'zh': '4K 内存卡（88-4MCS）',
        'zh-TW': '4K 記憶體卡（88-4MCS）',
        'ja': '4K メモリカード（88-4MCS）',
        'ko': '4K 메모리 카드(88-4MCS)',
    },

    'part-card.mem4k_1': {
        'en': 'Second 4K memory card (88-4MCS)',
        'es': 'Segunda tarjeta de memoria 4K (88-4MCS)',
        'fr': 'Deuxième carte mémoire 4K (88-4MCS)',
        'de': 'Zweite 4K-Speicherkarte (88-4MCS)',
        'it': 'Seconda scheda di memoria 4K (88-4MCS)',
        'pt-BR': 'Segunda placa de memória 4K (88-4MCS)',
        'zh': '第二块 4K 内存卡（88-4MCS）',
        'zh-TW': '第二塊 4K 記憶體卡（88-4MCS）',
        'ja': '2 枚目の 4K メモリカード（88-4MCS）',
        'ko': '두 번째 4K 메모리 카드(88-4MCS)',
    },

    'part-card.sio': {
        'en': 'Serial card (88-SIO)',
        'es': 'Tarjeta serie (88-SIO)',
        'fr': 'Carte série (88-SIO)',
        'de': 'Serielle Karte (88-SIO)',
        'it': 'Scheda seriale (88-SIO)',
        'pt-BR': 'Placa serial (88-SIO)',
        'zh': '串口卡（88-SIO）',
        'zh-TW': '序列埠卡（88-SIO）',
        'ja': 'シリアルカード（88-SIO）',
        'ko': '시리얼 카드(88-SIO)',
    },

    'part-card.sio2': {
        'en': 'Two-port serial card (88-2SIO)',
        'es': 'Tarjeta serie de dos puertos (88-2SIO)',
        'fr': 'Carte série à deux ports (88-2SIO)',
        'de': 'Serielle Karte mit zwei Ports (88-2SIO)',
        'it': 'Scheda seriale a due porte (88-2SIO)',
        'pt-BR': 'Placa serial de duas portas (88-2SIO)',
        'zh': '双口串口卡（88-2SIO）',
        'zh-TW': '雙埠序列埠卡（88-2SIO）',
        'ja': '2 ポートシリアルカード（88-2SIO）',
        'ko': '2포트 시리얼 카드(88-2SIO)',
    },
};
