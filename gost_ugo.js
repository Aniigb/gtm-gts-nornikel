/* ГОСТ Р 21.302-2021 — условные графические обозначения грунтов (SVG-паттерны).
   Верифицировано визуально по официальному тексту стандарта (Нормативка/ГОСТ_Р_21.302-2021.pdf,
   табл. 7.1–7.4, 7.9–7.11). Ничего не выдумывать: новые обозначения добавлять только сверкой с PDF.
   Использование: GOST_UGO.defs(prefix) — блок <defs> для SVG; GOST_UGO.fill(prefix,key) — fill="url(#...)".
   Буквенный код песков (Г/К/С/М/П в круге) рисуется отдельно — GOST_UGO.sandLetter(key). */
window.GOST_UGO=(function(){
const P={
/* --- дисперсные несвязные (табл. 7.2) --- */
glyby:{name:'Глыбы (глыбовый грунт)',svg:'<path d="M8 6l7 2 2 6-5 4-6-2-1-6z M28 20l7 1 3 6-4 5-7-1-2-6z M6 26l6 2 1 6-5 3-5-3 0-5z" fill="none" stroke="#000" stroke-width="1.1"/>'},
valun:{name:'Валуны (валунный грунт)',svg:'<ellipse cx="9" cy="9" rx="7" ry="4.6" fill="none" stroke="#000" stroke-width="1.1" transform="rotate(-12 9 9)"/><ellipse cx="30" cy="24" rx="7.5" ry="4.6" fill="none" stroke="#000" stroke-width="1.1" transform="rotate(9 30 24)"/><ellipse cx="13" cy="31" rx="6" ry="4" fill="none" stroke="#000" stroke-width="1.1"/>'},
galka:{name:'Галька (галечниковый грунт)',svg:'<ellipse cx="7" cy="7" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/><ellipse cx="22" cy="7" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/><ellipse cx="36" cy="7" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/><ellipse cx="14" cy="20" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/><ellipse cx="29" cy="20" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/><ellipse cx="7" cy="33" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/><ellipse cx="22" cy="33" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/><ellipse cx="36" cy="33" rx="5" ry="2.6" fill="none" stroke="#000" stroke-width="1"/>'},
sheben:{name:'Щебень (щебенистый грунт)',svg:'<path d="M4 12l4-8 4 8z M18 4l4 8 4-8z M30 12l4-8 4 8z M8 30l4-8 4 8z M24 36l4-8 4 8z M32 22l4 8 4-8z" fill="none" stroke="#000" stroke-width="1.1"/>'},
gravel:{name:'Гравий (гравийный грунт)',svg:'<circle cx="6" cy="6" r="2.4" fill="none" stroke="#000"/><circle cx="20" cy="10" r="2.4" fill="none" stroke="#000"/><circle cx="33" cy="5" r="2.4" fill="none" stroke="#000"/><circle cx="11" cy="22" r="2.4" fill="none" stroke="#000"/><circle cx="27" cy="26" r="2.4" fill="none" stroke="#000"/><circle cx="38" cy="18" r="2.4" fill="none" stroke="#000"/><circle cx="5" cy="36" r="2.4" fill="none" stroke="#000"/><circle cx="19" cy="35" r="2.4" fill="none" stroke="#000"/><circle cx="34" cy="34" r="2.4" fill="none" stroke="#000"/>'},
dresva:{name:'Дресва (дресвяный грунт)',svg:'<path d="M3 8l3-5 3 5z M12 8l3-5 3 5z M21 8l3-5 3 5z M30 8l3-5 3 5z M7 19l3-5 3 5z M16 19l3-5 3 5z M25 19l3-5 3 5z M34 19l3-5 3 5z M3 30l3-5 3 5z M12 30l3-5 3 5z M21 30l3-5 3 5z M30 30l3-5 3 5z" fill="none" stroke="#000" stroke-width="0.9"/>'},
sand_g:{name:'Песок гравелистый',sand:'Г',svg:'<circle cx="4" cy="4" r="1" fill="#000"/><circle cx="14" cy="8" r="1" fill="#000"/><circle cx="26" cy="4" r="1" fill="#000"/><circle cx="36" cy="9" r="1" fill="#000"/><circle cx="8" cy="16" r="1" fill="#000"/><circle cx="20" cy="20" r="1" fill="#000"/><circle cx="32" cy="16" r="1" fill="#000"/><circle cx="5" cy="28" r="1" fill="#000"/><circle cx="16" cy="32" r="1" fill="#000"/><circle cx="28" cy="28" r="1" fill="#000"/><circle cx="38" cy="33" r="1" fill="#000"/><circle cx="10" cy="38" r="1" fill="#000"/><circle cx="24" cy="37" r="1" fill="#000"/><circle cx="7" cy="11" r="2.1" fill="none" stroke="#000" stroke-width="0.8"/><circle cx="30" cy="24" r="2.1" fill="none" stroke="#000" stroke-width="0.8"/><circle cx="17" cy="26" r="2.1" fill="none" stroke="#000" stroke-width="0.8"/><circle cx="36" cy="4" r="2.1" fill="none" stroke="#000" stroke-width="0.8"/>'},
sand_k:{name:'Песок крупный',sand:'К',svg:'<circle cx="4" cy="4" r="1" fill="#000"/><circle cx="14" cy="8" r="1" fill="#000"/><circle cx="26" cy="4" r="1" fill="#000"/><circle cx="36" cy="9" r="1" fill="#000"/><circle cx="8" cy="16" r="1" fill="#000"/><circle cx="20" cy="20" r="1" fill="#000"/><circle cx="32" cy="16" r="1" fill="#000"/><circle cx="5" cy="28" r="1" fill="#000"/><circle cx="16" cy="32" r="1" fill="#000"/><circle cx="28" cy="28" r="1" fill="#000"/><circle cx="38" cy="33" r="1" fill="#000"/><circle cx="10" cy="38" r="1" fill="#000"/><circle cx="24" cy="37" r="1" fill="#000"/>'},
sand_s:{name:'Песок средней крупности',sand:'С',svg:'<circle cx="4" cy="4" r="0.9" fill="#000"/><circle cx="12" cy="8" r="0.9" fill="#000"/><circle cx="22" cy="4" r="0.9" fill="#000"/><circle cx="32" cy="8" r="0.9" fill="#000"/><circle cx="38" cy="3" r="0.9" fill="#000"/><circle cx="7" cy="15" r="0.9" fill="#000"/><circle cx="17" cy="19" r="0.9" fill="#000"/><circle cx="27" cy="15" r="0.9" fill="#000"/><circle cx="37" cy="19" r="0.9" fill="#000"/><circle cx="3" cy="26" r="0.9" fill="#000"/><circle cx="13" cy="30" r="0.9" fill="#000"/><circle cx="23" cy="26" r="0.9" fill="#000"/><circle cx="33" cy="30" r="0.9" fill="#000"/><circle cx="8" cy="37" r="0.9" fill="#000"/><circle cx="19" cy="36" r="0.9" fill="#000"/><circle cx="29" cy="37" r="0.9" fill="#000"/><circle cx="38" cy="34" r="0.9" fill="#000"/>'},
sand_m:{name:'Песок мелкий',sand:'М',svg:'<circle cx="4" cy="4" r="0.8" fill="#000"/><circle cx="11" cy="7" r="0.8" fill="#000"/><circle cx="19" cy="4" r="0.8" fill="#000"/><circle cx="27" cy="7" r="0.8" fill="#000"/><circle cx="35" cy="4" r="0.8" fill="#000"/><circle cx="6" cy="13" r="0.8" fill="#000"/><circle cx="14" cy="16" r="0.8" fill="#000"/><circle cx="22" cy="13" r="0.8" fill="#000"/><circle cx="30" cy="16" r="0.8" fill="#000"/><circle cx="38" cy="13" r="0.8" fill="#000"/><circle cx="3" cy="22" r="0.8" fill="#000"/><circle cx="10" cy="25" r="0.8" fill="#000"/><circle cx="18" cy="22" r="0.8" fill="#000"/><circle cx="26" cy="25" r="0.8" fill="#000"/><circle cx="34" cy="22" r="0.8" fill="#000"/><circle cx="7" cy="31" r="0.8" fill="#000"/><circle cx="15" cy="34" r="0.8" fill="#000"/><circle cx="23" cy="31" r="0.8" fill="#000"/><circle cx="31" cy="34" r="0.8" fill="#000"/><circle cx="38" cy="31" r="0.8" fill="#000"/><circle cx="4" cy="38" r="0.8" fill="#000"/><circle cx="20" cy="38" r="0.8" fill="#000"/><circle cx="36" cy="38" r="0.8" fill="#000"/>'},
sand_p:{name:'Песок пылеватый',sand:'П',svg:'<circle cx="4" cy="4" r="0.7" fill="#000"/><circle cx="10" cy="6" r="0.7" fill="#000"/><circle cx="16" cy="4" r="0.7" fill="#000"/><circle cx="22" cy="6" r="0.7" fill="#000"/><circle cx="28" cy="4" r="0.7" fill="#000"/><circle cx="34" cy="6" r="0.7" fill="#000"/><circle cx="6" cy="11" r="0.7" fill="#000"/><circle cx="12" cy="13" r="0.7" fill="#000"/><circle cx="18" cy="11" r="0.7" fill="#000"/><circle cx="24" cy="13" r="0.7" fill="#000"/><circle cx="30" cy="11" r="0.7" fill="#000"/><circle cx="36" cy="13" r="0.7" fill="#000"/><circle cx="4" cy="18" r="0.7" fill="#000"/><circle cx="10" cy="20" r="0.7" fill="#000"/><circle cx="16" cy="18" r="0.7" fill="#000"/><circle cx="22" cy="20" r="0.7" fill="#000"/><circle cx="28" cy="18" r="0.7" fill="#000"/><circle cx="34" cy="20" r="0.7" fill="#000"/><circle cx="6" cy="25" r="0.7" fill="#000"/><circle cx="12" cy="27" r="0.7" fill="#000"/><circle cx="18" cy="25" r="0.7" fill="#000"/><circle cx="24" cy="27" r="0.7" fill="#000"/><circle cx="30" cy="25" r="0.7" fill="#000"/><circle cx="36" cy="27" r="0.7" fill="#000"/><circle cx="4" cy="32" r="0.7" fill="#000"/><circle cx="10" cy="34" r="0.7" fill="#000"/><circle cx="16" cy="32" r="0.7" fill="#000"/><circle cx="22" cy="34" r="0.7" fill="#000"/><circle cx="28" cy="32" r="0.7" fill="#000"/><circle cx="34" cy="34" r="0.7" fill="#000"/><circle cx="38" cy="38" r="0.7" fill="#000"/><circle cx="6" cy="38" r="0.7" fill="#000"/><circle cx="20" cy="38" r="0.7" fill="#000"/>'},
/* --- дисперсные связные --- */
glina:{name:'Глина',svg:'<path d="M0 5h40 M0 13h40 M0 21h40 M0 29h40 M0 37h40" stroke="#000" stroke-width="1.2" fill="none"/>'},
suglinok:{name:'Суглинок',svg:'<path d="M-6 42L20 -6 M4 46L34 -2 M14 50L42 6 M-16 32L2 4 M24 54L46 16" stroke="#000" stroke-width="1.1" fill="none"/>'},
supes:{name:'Супесь',svg:'<path d="M2 12l8-10 M16 12l8-10 M30 12l8-10 M9 26l8-10 M23 26l8-10 M37 26l8-10 M2 40l8-10 M16 40l8-10 M30 40l8-10" stroke="#000" stroke-width="1.1" fill="none"/>'},
il:{name:'Ил',svg:'<path d="M0 8q5-6 10 0t10 0 M20 8q5-6 10 0t10 0 M0 22q5-6 10 0t10 0 M20 22q5-6 10 0t10 0 M0 36q5-6 10 0t10 0 M20 36q5-6 10 0t10 0" stroke="#000" stroke-width="1.1" fill="none"/>'},
sapropel:{name:'Сапропель',svg:'<path d="M0 7q5-5 10 0t10 0 M20 7q5-5 10 0t10 0 M0 12q5-5 10 0t10 0 M20 12q5-5 10 0t10 0 M0 27q5-5 10 0t10 0 M20 27q5-5 10 0t10 0 M0 32q5-5 10 0t10 0 M20 32q5-5 10 0t10 0" stroke="#000" stroke-width="1" fill="none"/>'},
torf1:{name:'Торф слаборазложившийся',svg:'<path d="M0 6h40 M0 16h40 M0 26h40 M0 36h40 M6 6v6 M4 9h4 M20 16v6 M18 19h4 M34 6v6 M32 9h4 M12 26v6 M10 29h4 M27 36v6 M25 39h4" stroke="#000" stroke-width="1" fill="none"/>'},
torf2:{name:'Торф среднеразложившийся',svg:'<path d="M0 6h40 M0 16h40 M0 26h40 M0 36h40 M8 4v7 M5 7l3 3 M11 7l-3 3 M24 14v7 M21 17l3 3 M27 17l-3 3 M36 24v7 M33 27l3 3 M39 27l-3 3 M14 34v7 M11 37l3 3 M17 37l-3 3" stroke="#000" stroke-width="1" fill="none"/>'},
torf3:{name:'Торф сильноразложившийся',svg:'<path d="M0 5h40 M0 15h40 M0 25h40 M0 35h40 M8 0v10 M24 10v10 M14 20v10 M32 30v10 M20 0v5 M36 15v10 M6 25v10" stroke="#000" stroke-width="1" fill="none"/>'},
pochva:{name:'Почва (ПРС)',svg:'<path d="M2 10l6-8 M14 10l6-8 M26 10l6-8 M38 10l6-8 M8 24l6-8 M20 24l6-8 M32 24l6-8 M2 38l6-8 M14 38l6-8 M26 38l6-8 M38 38l6-8 M12 8v6 M9 11h6 M30 22v6 M27 25h6 M18 34v6 M15 37h6" stroke="#000" stroke-width="0.95" fill="none"/>'},
/* --- мерзлые (табл. 7.3) --- */
led:{name:'Лёд',svg:'<rect width="40" height="40" fill="#000"/>'},
ledogrunt:{name:'Ледогрунт',svg:'<path d="M-10 44L22 -8 M6 52L38 0 M-22 32L-2 8 M26 56L50 12" stroke="#000" stroke-width="9" fill="none"/>'},
/* --- техногенные (табл. 7.4) --- */
techno:{name:'Техногенный грунт (насыпной)',svg:'<path d="M-8 44L44 -8 M-8 -4L44 48 M-20 32L32 -20 M-12 52L52 -12" stroke="#000" stroke-width="1" fill="none"/><path d="M-8 -4L44 48 M-8 44L44 -8" stroke="#000" stroke-width="1" fill="none"/>'},
/* --- скальные (табл. 7.1) --- */
basalt:{name:'Базальт, долерит',svg:'<path d="M6 4v8h8 M26 4v8h8 M16 20v8h8 M36 20v8h8 M6 36v-8h8 M26 36v-8h8" fill="none" stroke="#000" stroke-width="1.3"/>'},
limestone:{name:'Известняк',svg:'<path d="M0 8h40 M0 16h40 M0 24h40 M0 32h40 M12 0v8 M32 0v8 M22 8v8 M6 16v8 M34 16v8 M18 24v8 M10 32v8 M30 32v8" stroke="#000" stroke-width="1.1" fill="none"/>'},
dolomite:{name:'Доломит',svg:'<path d="M0 8h40 M0 20h40 M0 32h40 M10 0v8 M11.8 0v8 M28 8v12 M29.8 8v12 M14 20v12 M15.8 20v12 M34 32v8 M35.8 32v8" stroke="#000" stroke-width="1.1" fill="none"/>'},
mergel:{name:'Мергель',svg:'<path d="M0 6h40 M0 18h40 M0 30h40 M8 6l10 12 M26 18l10 12 M4 30l10 10 M22 6l10 12 M36 18l8 10" stroke="#000" stroke-width="1" fill="none"/>'},
peschanik:{name:'Песчаник',svg:'<path d="M4 4l6 6 M10 4l-6 6 M22 14l6 6 M28 14l-6 6 M4 26l6 6 M10 26l-6 6 M28 30l6 6 M34 30l-6 6" stroke="#000" stroke-width="1.1" fill="none"/><circle cx="20" cy="6" r="0.8" fill="#000"/><circle cx="34" cy="8" r="0.8" fill="#000"/><circle cx="14" cy="20" r="0.8" fill="#000"/><circle cx="36" cy="22" r="0.8" fill="#000"/><circle cx="20" cy="34" r="0.8" fill="#000"/><circle cx="8" cy="38" r="0.8" fill="#000"/>'},
alevrolit:{name:'Алевролит',svg:'<path d="M4 4l6 6 M10 4l-6 6 M22 14l6 6 M28 14l-6 6 M4 26l6 6 M10 26l-6 6 M28 30l6 6 M34 30l-6 6 M16 6q2 2 0 4 M36 18q2 2 0 4 M16 28q2 2 0 4 M36 34q2 2 0 4" stroke="#000" stroke-width="1" fill="none"/>'},
argillit:{name:'Аргиллит',svg:'<path d="M0 6h40 M0 16h40 M0 26h40 M0 36h40 M10 6l6 10 M28 16l6 10 M16 26l6 10 M34 36l4 6" stroke="#000" stroke-width="1" fill="none"/>'},
gravelit:{name:'Гравелит',svg:'<path d="M0 8a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0 M-5 16a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0 M0 24a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0 M-5 32a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0" stroke="#000" stroke-width="1" fill="none"/>'},
konglom:{name:'Конгломерат',svg:'<path d="M2 2l7 7 M9 2l-7 7 M22 22l7 7 M29 22l-7 7" stroke="#000" stroke-width="1.1" fill="none"/><path d="M22 6l6 4-6 4-6-4z M4 24l6 4-6 4-6-4z M32 34l6 4-6 4-6-4z" fill="none" stroke="#000" stroke-width="1"/>'},
brekchia:{name:'Брекчия',svg:'<path d="M0 4h40 M0 36h40 M4 12l3-5 3 5z M14 12l3-5 3 5z M24 12l3-5 3 5z M34 12l3-5 3 5z M9 24l3-5 3 5z M19 24l3-5 3 5z M29 24l3-5 3 5z" stroke="#000" stroke-width="1" fill="none"/>'},
ugol:{name:'Каменный уголь',svg:'<path d="M2 10q10-8 22-4q8 3 14 0q-6 8-18 8q-12 0-18-4z M14 30q8-5 18-3q6 2 8 0q-4 6-14 6q-10 0-12-3z" fill="#000"/>'},
/* --- прочее --- */
none:{name:'Нет данных / УГО по легенде источника',svg:'<rect width="40" height="40" fill="#f2f2f2"/><path d="M0 40L40 0" stroke="#bbb" stroke-width="0.8"/>'}};
/* --- криогенная текстура (табл. 7.9, оверлей черным) --- */
const CRYO={
massiv:{name:'Массивная криогенная текстура',svg:'<path d="M8 4v8 M4 8h8 M5.5 5.5l5 5 M10.5 5.5l-5 5 M30 16v8 M26 20h8 M27.5 17.5l5 5 M32.5 17.5l-5 5 M14 30v8 M10 34h8 M11.5 31.5l5 5 M16.5 31.5l-5 5" stroke="#000" stroke-width="0.9" fill="none"/>'},
sloist:{name:'Слоистая криогенная текстура',svg:'<path d="M2 6h10 M18 6h10 M34 6h6 M8 14h10 M24 14h10 M2 22h10 M18 22h10 M34 22h6 M8 30h10 M24 30h10 M2 38h10 M18 38h10" stroke="#000" stroke-width="0.9" fill="none"/>'},
setch:{name:'Сетчатая криогенная текстура',svg:'<path d="M8 2v12 M2 8h12 M30 14v12 M24 20h12 M14 28v12 M8 34h12" stroke="#000" stroke-width="0.9" fill="none"/>'},
ataksit:{name:'Атакситовая криогенная текстура',svg:'<rect width="40" height="40" fill="#000"/><ellipse cx="10" cy="8" rx="8" ry="2.4" fill="#fff"/><ellipse cx="28" cy="20" rx="9" ry="2.4" fill="#fff"/><ellipse cx="12" cy="32" rx="8" ry="2.4" fill="#fff"/>'},
bazaln:{name:'Базальная криогенная текстура',svg:'<rect width="40" height="40" fill="#000"/><path d="M8 6l7 2 2 6-5 4-6-2-1-6z" fill="#fff"/><path d="M28 22l7 1 3 6-4 5-7-1-2-6z" fill="#fff"/>'},
porfir:{name:'Порфировидная криогенная текстура',svg:'<path d="M8 6l7 2 2 6-5 4-6-2-1-6z M28 20l7 1 3 6-4 5-7-1-2-6z" fill="#000"/><circle cx="6" cy="24" r="1" fill="#000"/><circle cx="16" cy="30" r="1" fill="#000"/><circle cx="26" cy="8" r="1" fill="#000"/><circle cx="36" cy="12" r="1" fill="#000"/><circle cx="34" cy="34" r="1" fill="#000"/><circle cx="22" cy="38" r="1" fill="#000"/>'},
kork:{name:'Корковая криогенная текстура',svg:'<ellipse cx="10" cy="10" rx="8" ry="5.4" fill="none" stroke="#000"/><ellipse cx="28" cy="26" rx="9" ry="5.6" fill="none" stroke="#000"/><ellipse cx="12" cy="32" rx="6" ry="4" fill="none" stroke="#000"/><circle cx="24" cy="8" r="1" fill="#000"/><circle cx="36" cy="12" r="1" fill="#000"/><circle cx="6" cy="24" r="1" fill="#000"/>'}};
/* --- полоса состояния (табл. 7.10–7.11) --- */
const STATE={
hard:{name:'Твердая / малой степени водонасыщения',svg:'<path d="M0 2h10 M0 5h10 M0 8h10 M0 11h10 M0 14h10 M0 17h10 M0 20h10 M0 23h10 M0 26h10 M0 29h10 M0 32h10 M0 35h10 M0 38h10" stroke="#000" stroke-width="0.8"/>'},
semihard:{name:'Полутвердая',svg:'<path d="M0 3h10 M0 9h10 M0 15h10 M0 21h10 M0 27h10 M0 33h10 M0 39h10" stroke="#000" stroke-width="0.8"/>'},
tugoplast:{name:'Тугопластичная',svg:'<path d="M5 0v40" stroke="#000" stroke-width="0.9"/>'},
plastic:{name:'Пластичная / средней степени водонасыщения / мягкопластичная / текучепластичная',svg:'<path d="M-2 12L12 -2 M-2 24L12 10 M-2 36L12 22 M-2 48L12 34" stroke="#000" stroke-width="1"/>'},
flow:{name:'Текучая / водонасыщенные',svg:'<rect width="10" height="40" fill="#000"/>'},
frozen:{name:'Мерзлый грунт (t<0 °C)',svg:'<path d="M5 1v8 M1 5h8 M2 2l6 6 M8 2l-6 6 M5 13v8 M1 17h8 M2 14l6 6 M8 14l-6 6 M5 25v8 M1 29h8 M2 26l6 6 M8 26l-6 6 M5 37v8 M1 41h8" stroke="#8040c0" stroke-width="0.9" fill="none"/>'}};
/* маппинг наименования грунта → ключ паттерна (порядок = приоритет) */
const RULES=[
[/ледогрунт/i,'ledogrunt'],[/(^|[^а-яё])л[её]д($|[^а-яё])|(^|[^а-яё])льд[ыа]($|[^а-яё])/i,'led'],
[/глыб/i,'glyby'],[/валун/i,'valun'],[/галечник|гальк|галька/i,'galka'],[/щебен|щебень/i,'sheben'],[/дресв/i,'dresva'],[/гравелит/i,'gravelit'],[/грави/i,'gravel'],
[/песок\s+гравелист|гравелистый/i,'sand_g'],[/песок\s+крупн|крупный\s+песок/i,'sand_k'],[/песок\s+средн/i,'sand_s'],[/песок\s+мелк|мелкий\s+песок/i,'sand_m'],[/песок\s+пылеват|пылеватый\s+песок/i,'sand_p'],[/(^|[^а-яё])песок($|[^а-яё])|(^|[^а-яё])песк[аи]($|[^а-яё])|(^|[^а-яё])пески($|[^а-яё])/i,'sand_s'],
[/сапропел/i,'sapropel'],[/(^|[^а-яё])ил[ы]?($|[^а-яё])|иловат/i,'il'],
[/торф.*слаборазлож|слаборазлож/i,'torf1'],[/торф.*среднеразлож|среднеразлож/i,'torf2'],[/торф.*сильноразлож|сильноразлож/i,'torf3'],[/торф|заторф/i,'torf2'],
[/почв|(^|[^а-яё])прс($|[^а-яё])|почвенно-растительн/i,'pochva'],
[/супесь|супес/i,'supes'],[/суг?лин/i,'suglinok'],[/глин/i,'glina'],
[/насып|техноген|отвал|хвост/i,'techno'],
[/базальт|долерит|трапп/i,'basalt'],[/известн/i,'limestone'],[/доломит/i,'dolomite'],[/мергел/i,'mergel'],[/песчаник/i,'peschanik'],[/алевролит/i,'alevrolit'],[/аргиллит/i,'argillit'],[/конгломер/i,'konglom'],[/брекчи/i,'brekchia'],[/угол|углист/i,'ugol']];
const CRYO_RULES=[[/атаксит/i,'ataksit'],[/базальн/i,'bazaln'],[/порфир/i,'porfir'],[/корков/i,'kork'],[/слоист/i,'sloist'],[/сетчат/i,'setch'],[/массивн/i,'massiv']];
const STATE_RULES=[[/мерзл|твердомерзл/i,'frozen'],[/текуч|водонасыщ/i,'flow'],[/полутверд/i,'semihard'],[/тугопласт/i,'tugoplast'],[/пластич|мягкопласт|текучепласт|средней степени/i,'plastic'],[/твердая|твердый|маловлажн|малой степени/i,'hard']];
/* нормализация смешанной кириллицы/латиницы источников (C→С, c→с и т.п.) — только для сопоставления */
function normTxt(s){ return String(s).replace(/[Cc]/g,'С').replace(/[Xx]/g,'Х').replace(/[Oo]/g,'О').replace(/[Pp]/g,'Р').replace(/[Aa]/g,'А').replace(/[Ee]/g,'Е').replace(/[Hh]/g,'Н').replace(/[Tt]/g,'Т').replace(/[Kk]/g,'К').replace(/[Mm]/g,'М').replace(/[Bb]/g,'В'); }
function match(txt){
  if(!txt) return 'none';
  /* генезис-префиксы («Хвосты ОФ.», «ХОФ:») снимаем; основной грунт — до маркеров вторичных включений
     («заполнитель …», «с прослоями …», «с галькой …» и т.п.); в пределах главы побеждает первое упоминание */
  let head=normTxt(txt).replace(/^\s*(хвосты\s+ОФ\.?|ХОФ\s*:?|хвосты\s+обогащения|[A-Я]{2,5}\s*:)\s*/i,'');
  const sm=head.match(/заполнител|с\s+просло|с\s+примес|с\s+гальк|с\s+валун|с\s+грави|с\s+щебен|с\s+обломк|в\s+интервал/i);
  if(sm) head=head.slice(0,sm.index);
  let best=null,bi=1e9;
  for(const r of RULES){ const i=head.search(r[0]); if(i>=0&&i<bi){ bi=i; best=r[1]; } }
  if(best) return best;
  const full=normTxt(txt);
  for(const r of RULES){ if(r[0].test(full)) return r[1]; }
  return 'none';
}
function matchCryo(txt){ if(!txt) return null; const t=normTxt(txt); for(const r of CRYO_RULES){ if(r[0].test(t)) return r[1]; } return null; }
function matchState(txt){ if(!txt) return null; const t=normTxt(txt); for(const r of STATE_RULES){ if(r[0].test(t)) return r[1]; } return null; }
function defs(px,keys,extra){
  px=px||'g'; const out=[];
  const list=keys||Object.keys(P);
  list.forEach(k=>{ if(P[k]) out.push('<pattern id="'+px+'_'+k+'" width="40" height="40" patternUnits="userSpaceOnUse">'+P[k].svg+'</pattern>'); });
  (extra&&extra.cryo?Object.keys(CRYO):[]).forEach(k=>out.push('<pattern id="'+px+'_cryo_'+k+'" width="40" height="40" patternUnits="userSpaceOnUse">'+CRYO[k].svg+'</pattern>'));
  (extra&&extra.state?Object.keys(STATE):[]).forEach(k=>out.push('<pattern id="'+px+'_st_'+k+'" width="10" height="40" patternUnits="userSpaceOnUse">'+STATE[k].svg+'</pattern>'));
  return '<defs>'+out.join('')+'</defs>';
}
function fill(px,k){ return 'url(#'+px+'_'+k+')'; }
function sandLetter(k){ return P[k]&&P[k].sand?P[k].sand:null; }
return {P:P,CRYO:CRYO,STATE:STATE,match:match,matchCryo:matchCryo,matchState:matchState,defs:defs,fill:fill,sandLetter:sandLetter,
 legendHtml:function(keys,px){ px=px||'g'; return keys.map(function(k){ return '<span style="display:inline-flex;align-items:center;gap:5px;margin:2px 8px 2px 0"><svg width="26" height="18"><rect width="26" height="18" fill="url(#'+px+'_'+k+')" stroke="#666" stroke-width="0.6"/></svg><span style="font-size:11.5px">'+P[k].name+'</span></span>'; }).join(''); }};
})();
