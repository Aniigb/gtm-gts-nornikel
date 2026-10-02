/* ============================================================================
   Модуль квартального Акта обследования технического состояния ГТС
   Проект: ГТМ с учётом климатических изменений ГТС ЗФ ПАО «ГМК «Норильский никель»
   Структура акта наследует форму ежеквартальных комиссионных обследований ГТС
   (ФЗ-117; ФНП ГТС — приказ Ростехнадзора от 08.05.2024 № 151, раздел IV;
   Декларация безопасности ГТС объекта; Проект эксплуатации; Программа контроля
   (мониторинга) ГТС). Форма: поэлементный осмотр + инструментальные наблюдения
   (автозаполнение из разделов «Термометрия», «Пьезометрия», «Деформации»
   карточки объекта) + фотофиксация с геопривязкой + геотрек осмотра +
   библиотека формулировок с самообучением. Итог — Word (.docx) с приложениями.
   ============================================================================ */
'use strict';

/* ---------- хранилище (черновики актов и библиотеки — локально; реестр метаданных
   переносится в общую базу db.js через _akt_apply.py) ---------- */
let AKT = null, AKT_LIB = null, AKT_CAPS = null;
let AKT_CUR = null, AKT_OBJ = null, AKT_WATCH = null, AKT_MAP = null, AKT_LINE = null;

function aktLsGet(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function aktLoad() { if (!AKT) AKT = aktLsGet('gtm_akt_v1', {}); return AKT; }
function aktSave() {
  try { localStorage.setItem('gtm_akt_v1', JSON.stringify(AKT)); return true; }
  catch (e) { alert('Хранилище переполнено — уменьшите количество или размер фотографий. Изменения НЕ сохранены.'); return false; }
}
function aktLibLoad() { if (!AKT_LIB) AKT_LIB = aktLsGet('gtm_akt_lib1', {}); return AKT_LIB; }
function aktLibSave() { try { localStorage.setItem('gtm_akt_lib1', JSON.stringify(AKT_LIB)); } catch (e) {} }
function aktCapsLoad() { if (!AKT_CAPS) AKT_CAPS = aktLsGet('gtm_akt_caps1', {}); return AKT_CAPS; }
function aktCapsSave() { try { localStorage.setItem('gtm_akt_caps1', JSON.stringify(AKT_CAPS)); } catch (e) {} }
function aktList(o) { const A = aktLoad(); return A[o.a] = A[o.a] || []; }
function aktEditRole() { return document.body.classList.contains('role-edit') || document.body.classList.contains('role-insp'); }
function aktEsc(s) { return (typeof esc === 'function') ? esc(String(s == null ? '' : s)) : String(s == null ? '' : s); }

/* ---------- поэлементная структура осмотра ----------
   gts01 (хвостохранилище ТОФ) — по изученным квартальным актам 2020–2026 гг.;
   прочие объекты — автоматически из реестра сооружений карточки (вкладка «Сооружения»). */
const AKT_SECS_TOF = [
  { id: 'skl', t: 'Сооружения системы складирования хвостов', items: [
    ['vd', 'Верховая дамба'],
    ['ob1', 'Дамба обвалования (1-й ярус)'],
    ['ob2', 'Дамба обвалования (2-й ярус)'],
    ['rd', 'Разделительная дамба'],
    ['chasha', 'Чаша хвостохранилища'],
    ['nd', 'Низовая дамба'],
    ['fd', 'Фильтрующая дамба (вкл. фильтрующие вставки № 1–4)']] },
  { id: 'ov', t: 'Сооружения системы оборотного водоснабжения', items: [
    ['op', 'Отстойный пруд'],
    ['plns', 'Плавучие насосные станции (ПлНС)'],
    ['nsov', 'Насосная станция оборотной воды (НСОВ)'],
    ['mvv', 'Магистральные водоводы оборотной воды']] },
  { id: 'gt', t: 'Система гидротранспорта хвостов', items: [
    ['pns', 'Пульпонасосная станция № 1А (ПНС-1А)'],
    ['mp', 'Магистральный пульповод'],
    ['up1', 'Узел переключения трубопроводов № 1 (УП-1)'],
    ['up2', 'Узел переключения трубопроводов № 2 (УП-2)'],
    ['rp', 'Распределительный пульповод']] },
  { id: 'eco', t: 'Сооружения охраны окружающей среды', items: [
    ['me', 'Маневровая ёмкость (ограждающая дамба)'],
    ['be', 'Буферная ёмкость (ограждающая дамба)'],
    ['vb', 'Водоотводной банкет']] },
  { id: 'kia', t: 'Контрольно-измерительная аппаратура', items: [
    ['kia', 'КИА (термометрические, пьезометрические скважины; деформационные марки)']] }
];

function aktSecsFor(o) {
  if (o.id === 'gts01') return AKT_SECS_TOF;
  /* универсальная структура: из реестра сооружений карточки объекта */
  const fac = (typeof facOf === 'function') ? facOf(o.id) : [];
  if (fac.length) {
    const groups = {};
    fac.forEach((f, i) => {
      const g = f.sys || 'Сооружения объекта';
      (groups[g] = groups[g] || []).push([f.id + '_' + i, f.name || ('Сооружение ' + (i + 1))]);
    });
    const secs = Object.keys(groups).map((g, i) => ({ id: 'g' + i, t: g, items: groups[g] }));
    secs.push({ id: 'kia', t: 'Контрольно-измерительная аппаратура', items: [['kia', 'КИА (скважины, пьезометры, марки)']] });
    return secs;
  }
  return [
    { id: 'gen', t: 'Сооружения объекта', items: [
      ['d1', 'Ограждающие дамбы (гребень, откосы, бермы)'],
      ['d2', 'Чаша / водоём (уровень, пляж, намыв)'],
      ['d3', 'Водосбросные и водовыпускные сооружения'],
      ['d4', 'Насосные станции и трубопроводы']] },
    { id: 'kia', t: 'Контрольно-измерительная аппаратура', items: [['kia', 'КИА (скважины, пьезометры, марки)']] }
  ];
}

/* ---------- библиотека формулировок (стартовый корпус — из актов ТОФ 2020–2026;
   пополняется пользователем кнопкой «★» — самообучение) ---------- */
const AKT_LIB_DEF = {
  vd: [
    'Гребень и откосы дамбы находятся под снежным покровом, признаки деформаций (просадок, трещин различной направленности, пучений и иных повреждений) не зафиксированы.',
    'Признаки деформаций гребня и откосов не выявлены. По периметру низового откоса фильтрационных выходов не обнаружено.',
    'Инспекторская автодорога, проходящая по гребню дамбы, поддерживается в проезжем состоянии.',
    'Силами УСХ осуществляется буртование и вывоз снежных масс с гребня и откосов дамбы.'],
  ob1: [
    'Наличие местных деформаций (просадок, трещин различной направленности, пучений и т.д.) не выявлено.',
    'Зафиксированы продольные трещины вдоль бровки верхового откоса; ведутся работы по отсыпке и рихтовке гребня и откосов дамбы.'],
  ob2: [
    'Ведутся работы по отсыпке и рихтовке гребня и откосов дамбы обвалования второго яруса, в том числе зафиксированных ранее продольных трещин.'],
  rd: [
    'Гребень дамбы — наличие местных деформаций (просадок, трещин различной направленности, пучений и т.д.) не выявлено. Фильтрация на низовом откосе не обнаружена.'],
  chasha: [
    'Поступление хвостов в чашу хвостохранилища осуществлялось в соответствии с графиком складирования хвостов, без отступлений от требований Проекта эксплуатации ГТС.'],
  nd: [
    'Деформационных признаков не выявлено. По периметру низового откоса фильтрационных выходов не обнаружено.',
    'На участке нижнего бьефа низового откоса зафиксированы признаки фильтрационных процессов в виде локальных водопроявлений (истечений) на поверхности откоса; признаков суффозии не обнаружено.',
    'Ведутся работы по приведению гребня и верхового откоса дамбы к проектным параметрам.'],
  fd: [
    'Гребень и откосы дамбы — местных деформаций не выявлено. Автодорога по гребню дамбы находится в проезжем состоянии.',
    'Фильтрующие вставки выполняют свою функцию по пропуску осветлённой воды в отстойный пруд, о чём свидетельствуют водные потоки, выходящие из дренажных выпусков.',
    'Пропускная способность фильтрующих вставок ограничена за счёт наличия отложений хвостов со стороны чаши хвостохранилища.'],
  op: [
    'Уровень воды в отстойном пруду не превышал нормативных отметок (НПУ/ФПУ).',
    'ПлНС находится в рабочем состоянии, осуществляется стабильная откачка воды. Доступ к оборудованию обеспечен.'],
  nsov: [
    'Здание насосной станции находится в удовлетворительном состоянии, визуальных дефектов строительных конструкций не выявлено. Доступ к технологическому оборудованию обеспечен. Признаков течи на участках трубопроводов и в местах соединений не обнаружено.'],
  mvv: [
    'Свищей и признаков разгерметизации трубопроводов не выявлены. Возникающие в процессе эксплуатации дефекты устраняются в оперативном порядке.',
    'В ходе осмотра обнаружены локальные участки с нарушением теплоизоляционного покрытия из пенополиуретана (ППУ); ведутся работы по восстановлению изоляционного слоя.'],
  pns: [
    'Состояние станции работоспособное, доступ к оборудованию обеспечен. Водоводы находятся в работоспособном состоянии, визуально дефектов и повреждений не выявлено.'],
  mp: [
    'Свищи и признаки разгерметизации трубопроводов не выявлены, герметичность трассы магистрального пульповода сохраняется. Осадков основания под трассой пульповода не зафиксировано, признаков деформации опорной зоны не обнаружено.'],
  up1: ['Состояние работоспособное, доступ к технологическому оборудованию обеспечен. Водоводы — в исправном состоянии, визуально дефектов и механических повреждений не выявлено.'],
  up2: ['Состояние работоспособное, обеспечен свободный доступ к оборудованию. Водоводы — без визуальных дефектов, нарушений целостности и признаков разгерметизации не установлено.'],
  rp: [
    'Намыв/складирование отвальных хвостов производился согласно журналу учёта работы пульповыпусков.',
    'Ведутся работы по монтажу/демонтажу распределительного пульповода в соответствии с графиком намыва.'],
  me: ['Признаки деформаций гребня и откосов ограждающей дамбы не выявлены. Фильтрационных выходов на низовом откосе не обнаружено.'],
  be: ['Признаки деформаций гребня и откосов ограждающей дамбы не выявлены.'],
  vb: ['Лоток банкета в удовлетворительном состоянии, заиление и размывы не зафиксированы.'],
  kia: [
    'Скважины КИА находятся в рабочем состоянии, оголовки и защитные устройства сохранны, доступ обеспечен.',
    'В отчётном квартале выполнено растепление ледяных пробок в скважинах КИА согласно ведомости работ.']
};

function aktLibFor(key) {
  const U = aktLibLoad();
  const base = (AKT_LIB_DEF[key] || []).slice();
  (U[key] || []).forEach(p => { if (!base.includes(p)) base.push(p); });
  return base;
}
function aktCapsFor(key) {
  const U = aktCapsLoad();
  return (U[key] || []).slice();
}

/* ---------- фабрика нового акта ---------- */
function aktKv(dateStr) { const m = +String(dateStr || '').slice(5, 7) || 1; return Math.min(4, Math.max(1, Math.ceil(m / 3))); }
function aktNew(o) {
  const today = new Date();
  const d = today.toISOString().slice(0, 10);
  const kv = aktKv(d), god = d.slice(0, 4);
  const secs = aktSecsFor(o);
  const elements = {};
  secs.forEach(sec => sec.items.forEach(it => { elements[sec.id + '_' + it[0]] = { st: '', cm: '', pk: '', photos: [] }; }));
  return {
    id: 'a' + Date.now().toString(36),
    obj: o.a, objId: o.id, created: new Date().toISOString(),
    head: {
      date: d, time: today.toTimeString().slice(0, 5), kv: kv, god: god,
      ochered: (o.id === 'gts01') ? '1' : '',
      num: '', osnovanie: 'Федеральный закон от 21.07.1997 № 117-ФЗ «О безопасности гидротехнических сооружений»; Федеральные нормы и правила в области безопасности гидротехнических сооружений (приказ Ростехнадзора от 08.05.2024 № 151); Проект эксплуатации ГТС; Программа контроля (мониторинга) ГТС объекта.',
      cel: 'Контроль технического состояния ГТС, оценка соответствия показателей критериям безопасности, разработка рекомендаций по безопасной эксплуатации в следующем квартале.',
      pred: '', chleny: ['', '', ''], utv: '',
      wx: { t: '', tmin: '', tmax: '', osadki: '', veter: '', obl: '', snow: '', txt: '', src: '' }
    },
    elements: elements,
    instr: { geo: '', ugv: '', term: '', skl: '', journ: '', events: '' },
    kkTxt: '',
    vyvody: { cat: '', txt: '' },
    rekom: [],
    track: [],
    status: 'черновик'
  };
}

/* ---------- погода Open-Meteo (текущая или архив на дату осмотра) ---------- */
const AKT_WMO = { 0: 'ясно', 1: 'преимущественно ясно', 2: 'переменная облачность', 3: 'пасмурно', 45: 'туман', 48: 'изморозь (туман)', 51: 'слабая морось', 53: 'морось', 55: 'сильная морось', 56: 'ледяная морось', 57: 'сильная ледяная морось', 61: 'слабый дождь', 63: 'дождь', 65: 'сильный дождь', 66: 'ледяной дождь', 67: 'сильный ледяной дождь', 71: 'слабый снег', 73: 'снег', 75: 'сильный снег', 77: 'снежная крупа', 80: 'слабый ливень', 81: 'ливень', 82: 'сильный ливень', 85: 'слабый снегопад', 86: 'сильный снегопад', 95: 'гроза', 96: 'гроза с градом', 99: 'гроза с сильным градом' };
async function aktWxFetch(o, dateStr) {
  const lat = o.lat, lon = o.lon;
  if (typeof lat !== 'number') throw new Error('у объекта нет координат');
  const today = new Date().toISOString().slice(0, 10);
  const tz = 'Asia%2FKrasnoyarsk';
  if (dateStr >= today) {
    const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,snow_depth&daily=temperature_2m_max,temperature_2m_min&timezone=' + tz;
    const j = await (await fetch(u)).json();
    const c = j.current || {}, dd = (j.daily || {});
    return {
      t: c.temperature_2m, tmin: (dd.temperature_2m_min || [])[0], tmax: (dd.temperature_2m_max || [])[0],
      osadki: c.precipitation, veter: c.wind_speed_10m, obl: c.cloud_cover,
      snow: (c.snow_depth != null ? Math.round(c.snow_depth * 100) : null),
      txt: AKT_WMO[c.weather_code] || ('код ' + c.weather_code),
      src: 'Open-Meteo (текущая), ' + dateStr
    };
  }
  const u = 'https://archive-api.open-meteo.com/v1/archive?latitude=' + lat + '&longitude=' + lon +
    '&start_date=' + dateStr + '&end_date=' + dateStr +
    '&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max&timezone=' + tz;
  const j = await (await fetch(u)).json();
  const d = j.daily || {};
  const g = k => (d[k] || [])[0];
  return {
    t: g('temperature_2m_mean'), tmin: g('temperature_2m_min'), tmax: g('temperature_2m_max'),
    osadki: g('precipitation_sum'), veter: g('wind_speed_10m_max'), obl: '',
    snow: (g('snowfall_sum') ? 'выпадение ' + g('snowfall_sum') + ' см' : ''),
    txt: (g('snowfall_sum') > 0.1 ? 'снегопад' : (g('precipitation_sum') > 0.1 ? 'осадки' : 'без существенных осадков')),
    src: 'Open-Meteo (архив), ' + dateStr
  };
}
function aktWxLine(wx) {
  if (!wx || (wx.t === '' || wx.t == null)) return '';
  const p = [];
  p.push('температура воздуха ' + (wx.tmin != null && wx.tmin !== '' && wx.tmax != null && wx.tmax !== '' ?
    'от ' + wx.tmin + ' до ' + wx.tmax + ' °C (средняя ' + wx.t + ' °C)' : wx.t + ' °C'));
  p.push(wx.txt || '—');
  if (wx.osadki != null && wx.osadki !== '') p.push('осадки ' + wx.osadki + ' мм');
  if (wx.veter != null && wx.veter !== '') p.push('ветер до ' + wx.veter + ' м/с');
  if (wx.obl !== '' && wx.obl != null) p.push('облачность ' + wx.obl + ' %');
  if (wx.snow !== '' && wx.snow != null && wx.snow !== 0) p.push('снежный покров ' + wx.snow + (typeof wx.snow === 'number' ? ' см' : ''));
  return p.join(', ');
}

/* ---------- автозаполнение инструментальных разделов из базы карточки ---------- */
function aktAutoTerm(o) {
  const prof = o.prof || {};
  const wells = Object.keys(prof);
  if (!wells.length) return { txt: 'Термометрические ряды по объекту в базу не загружены (раздел «Термометрия» карточки).', rows: [], nW: 0 };
  const byDam = {};
  wells.forEach(w => {
    const dam = w.split('·')[0].trim();
    (byDam[dam] = byDam[dam] || []).push(w);
  });
  const parts = [], rows = [];
  let maxDate = '';
  Object.keys(byDam).forEach(dam => {
    const ws = byDam[dam];
    let tmin = 99, tmax = -99, dMax = '', tal = [];
    ws.forEach(w => {
      const wd = prof[w], s = wd.s || [];
      if (!s.length) return;
      const last = s[s.length - 1], dt = last[0], prof0 = last[1] || [];
      if (dt > dMax) dMax = dt;
      if (dt > maxDate) maxDate = dt;
      let wmin = 99, wmax = -99, deepMax = null;
      prof0.forEach(pr => {
        const t = +pr[1]; if (isNaN(t)) return;
        if (t < wmin) wmin = t; if (t > wmax) wmax = t;
        if (+pr[0] >= 5 && (deepMax === null || t > deepMax)) deepMax = t;
      });
      if (wmin < tmin) tmin = wmin; if (wmax > tmax) tmax = wmax;
      const wnm = w.includes('·') ? w.split('·')[1].trim() : w; /* защита: имя скважины без «Дамба · …» */
      if (deepMax !== null && deepMax > 0) tal.push(wnm);
      rows.push([wnm, dam, dt, wmin.toFixed(2), wmax.toFixed(2), (deepMax !== null && deepMax > 0) ? 'талая/переходная зона' : 'мерзлое']);
    });
    parts.push(dam + ': скважин ' + ws.length + ', замер ' + (dMax || '—') + ', диапазон температур от ' +
      (tmin === 99 ? '—' : tmin.toFixed(2)) + ' до ' + (tmax === -99 ? '—' : tmax.toFixed(2)) + ' °C' +
      (tal.length ? '; талые/переходные интервалы на глубине ≥ 5 м — ' + tal.join(', ') : '; грунты преимущественно в мерзлом состоянии'));
  });
  const txt = 'Температурный мониторинг выполняется по термометрическим скважинам (термокосы, шаг замера по глубине). ' +
    'По данным раздела «Термометрия» карточки объекта на ' + (maxDate || '—') + ': ' + parts.join('. ') +
    '. Поскважинные профили температур — в разделе «Термометрия» карточки ГТС и в приложении к акту.';
  return { txt: txt, rows: rows, nW: wells.length, date: maxDate };
}
function aktAutoUgv(o) {
  const ugv = o.ugv || {};
  const keys = Object.keys(ugv).filter(k => !/водоём|водоем/i.test(k));
  if (!keys.length) return { txt: 'Ряды замеров УГВ по объекту в базу не загружены (раздел «Пьезометрия» карточки).', rows: [] };
  let dMax = '';
  const rows = keys.map(k => {
    const s = (ugv[k] || []).filter(r => r && r[0]);
    const last = s[s.length - 1] || [];
    if (last[0] > dMax) dMax = last[0];
    return [k, last[0] || '—', last[1] != null ? last[1] : '—'];
  });
  const lvl = ugv[Object.keys(ugv).find(k => /водоём|водоем/i.test(k)) || ''] || [];
  const lvlLast = lvl[lvl.length - 1];
  const txt = 'Замеры уровней грунтовых вод (УГВ) в пьезометрических скважинах — по данным раздела «Пьезометрия» карточки объекта; ' +
    'последний замер в базе: ' + (dMax || '—') + ' (пьезометров: ' + keys.length + ').' +
    (lvlLast ? ' Уровень водоёма на ' + lvlLast[0] + ': ' + lvlLast[1] + ' м БС.' : '') +
    ' Ведомость замеров — в приложении к акту.';
  return { txt: txt, rows: rows, date: dMax };
}
function aktAutoGeo(o) {
  const g = o.geod || {};
  const n = Object.keys(g).length;
  if (!n) return 'Ряды геодезических наблюдений за деформациями в базу не загружены (раздел «Деформации» карточки). Результаты геодезической съёмки и контроля деформаций по поверхностным маркам приводятся по отчётам специализированной службы (вручную).';
  let dMax = '';
  Object.keys(g).forEach(k => { const s = g[k] || []; const l = s[s.length - 1]; if (l && l[0] > dMax) dMax = l[0]; });
  return 'Геодезический контроль: рядов в базе ' + n + ', последний цикл измерений — ' + (dMax || '—') +
    ' (раздел «Деформации» карточки объекта). Динамика осадок и смещений анализируется от цикла к циклу.';
}
function aktAutoSkl(o) {
  return 'Поступление хвостов в чашу хвостохранилища осуществлялось в соответствии с графиком складирования, без отступлений от требований Проекта эксплуатации ГТС. Объёмы складирования, отношение Т:Ж и гранулометрический состав — по данным эксплуатирующей организации (заполняется вручную).';
}
function aktAutoJourn(o) {
  return 'Журналы, регламентируемые Проектом (Программой) мониторинга, заполнены и соответствуют установленным формам. Службы мониторинга и эксплуатации ГТС обеспечены нормативной, технической, проектной и эксплуатационной документацией.';
}
function aktAutoVyvody(o, cur) {
  const els = cur.elements || {};
  let nOk = 0, nWarn = 0, nViol = 0;
  Object.keys(els).forEach(k => { const st = els[k].st; if (st === 'ok') nOk++; else if (st === 'warn') nWarn++; else if (st === 'viol') nViol++; });
  let cat = 'работоспособное';
  if (nViol > 0) cat = 'частично работоспособное';
  const violEls = aktSecsFor(o).map(sec => sec.items.map(it => [sec.id + '_' + it[0], it[1]])).reduce((a, b) => a.concat(b), [])
    .filter(p => (els[p[0]] || {}).st === 'viol').map(p => p[1]);
  const txt = 'По результатам сопоставления фактических диагностических параметров с критериальными значениями Декларации безопасности ГТС и результатов визуального и инструментального осмотров' +
    (nViol ? ' выявлены несоответствия по элементам: ' + violEls.join('; ') + '. ' : ', несоответствий не выявлено. ') +
    'В соответствии с разделом IV Федеральных норм и правил в области безопасности гидротехнических сооружений (приказ Ростехнадзора от 08.05.2024 № 151) техническое состояние ГТС оценивается как ' + cat + '.';
  return { cat: cat, txt: txt, nOk: nOk, nWarn: nWarn, nViol: nViol };
}
function aktAutoRekom(o, cur) {
  const rec = [];
  const els = cur.elements || {};
  aktSecsFor(o).forEach(sec => sec.items.forEach(it => {
    const r = els[sec.id + '_' + it[0]] || {};
    if (r.st === 'viol' || r.st === 'warn') {
      let t = (r.st === 'viol' ? 'Устранить выявленные несоответствия: ' : 'Принять меры: ') + it[1] +
        (r.pk ? ' (' + r.pk + ')' : '') + (r.cm ? ' — ' + r.cm.replace(/\s+/g, ' ').slice(0, 160) : '');
      rec.push(t);
    }
  }));
  rec.push('Продолжить инструментальные наблюдения (термометрия, пьезометрия, геодезия) в соответствии с Программой контроля (мониторинга) ГТС.');
  rec.push('Вести визуальные наблюдения за состоянием гребней и откосов дамб, поддерживать в проезжем состоянии автодороги хвостового хозяйства.');
  return rec;
}

/* ---------- стили модуля (однократно) ---------- */
(function aktCss() {
  if (document.getElementById('aktCss')) return;
  const st = document.createElement('style');
  st.id = 'aktCss';
  st.textContent = [
    '.akt-sec{border:1px solid var(--line);border-radius:8px;background:#fff;margin:8px 0}',
    '.akt-sec>summary{cursor:pointer;padding:9px 12px;font-weight:600;font-size:13px;list-style:none;display:flex;justify-content:space-between;gap:8px}',
    '.akt-sec>summary::-webkit-details-marker{display:none}',
    '.akt-el{border-top:1px dashed var(--line);padding:8px 12px}',
    '.akt-el .q{font-size:12.8px;font-weight:600}',
    '.akt-el .row{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;align-items:center}',
    '.akt-el textarea{width:100%;min-height:52px;margin-top:6px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit}',
    '.akt-st-ok{color:var(--ok)}.akt-st-warn{color:#c17900}.akt-st-viol{color:var(--crit)}',
    '.akt-photos{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}',
    '.akt-ph{width:128px;font-size:10px;color:var(--mut);position:relative}',
    '.akt-ph img{width:128px;height:96px;object-fit:cover;border-radius:6px;border:1px solid var(--line)}',
    '.akt-ph .del{position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;border:none;background:var(--crit);color:#fff;font-size:11px;cursor:pointer;line-height:1}',
    '.akt-ph input{width:100%;font-size:10.5px;margin-top:2px;border:1px solid var(--line);border-radius:4px;padding:2px 4px}',
    '.akt-hist{border:1px solid var(--line);border-radius:8px;background:#fff;padding:8px 12px;margin:8px 0;font-size:12.8px}',
    '.akt-lib{position:relative;display:inline-block}',
    '.akt-lib-pop{position:absolute;z-index:60;background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:0 6px 22px rgba(20,40,60,.18);max-height:240px;overflow:auto;width:420px;padding:6px}',
    '.akt-lib-pop div{padding:6px 8px;font-size:12px;cursor:pointer;border-radius:5px;line-height:1.35}',
    '.akt-lib-pop div:hover{background:#eef4fb}',
    '.akt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;font-size:12.5px}',
    '.akt-grid label{display:flex;flex-direction:column;gap:3px;font-size:11.5px;color:var(--mut)}',
    '.akt-grid input,.akt-grid textarea{font-size:12.5px;padding:5px 7px;border:1px solid var(--line);border-radius:6px;font-family:inherit;color:var(--txt)}',
    '#aktTrackMap{height:240px;border:1px solid var(--line);border-radius:8px;margin-top:8px}',
    '.akt-note{font-size:11.5px;color:var(--mut);line-height:1.45}'
  ].join('\n');
  document.head.appendChild(st);
})();

/* ---------- вкладка «Акт обследования» ---------- */
function tabAkt(o, el) {
  if (typeof stopSR === 'function') stopSR();
  AKT_OBJ = o;
  const RO = !aktEditRole();
  const list = aktList(o);
  if (AKT_CUR && AKT_CUR.obj !== o.a) AKT_CUR = null;
  const shared = (o.acts || []);
  if (!AKT_CUR) {
    el.innerHTML =
      '<h3 style="margin:4px 0 6px">📋 Акт обследования технического состояния (квартальный)</h3>' +
      '<div class="akt-note">Форма наследует структуру ежеквартальных комиссионных актов обследования ГТС: ФЗ-117; ФНП ГТС (приказ Ростехнадзора от 08.05.2024 № 151, раздел IV — оценка технического состояния); Декларация безопасности ГТС объекта; Проект эксплуатации; Программа контроля (мониторинга). ' +
      'Автозаполнение: характеристики объекта и КИА — из карточки; инструментальные разделы — из вкладок «Термометрия», «Пьезометрия», «Деформации»; погода на дату осмотра — Open-Meteo. Комментарии — диктовка 🎤; фото — с геопривязкой (EXIF/GPS); геотрек осмотра — GPS. Итог — Word с приложениями; ручная правка любого поля. Метаданные сформированного акта переносятся в общую базу (кнопка «📤 Экспорт JSON» → приёмка).</div>' +
      (RO ? '<div class="note" style="margin-top:8px">Роль «наблюдатель» — доступен просмотр реестра. Проведение обследования — роли «оператор»/«надзор».</div>'
          : '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button class="addrow" id="aktNew" style="border-style:solid">+ Новый квартальный акт</button></div>') +
      '<div id="aktHist"></div>';
    if (!RO) document.getElementById('aktNew').onclick = function () {
      const cur = aktNew(o); aktList(o).push(cur); AKT_CUR = cur; aktSave(); tabAkt(o, el);
    };
    const h = document.getElementById('aktHist');
    let html = '';
    if (shared.length) {
      html += '<div class="sect" style="margin:12px 0 4px">Реестр в общей базе · ' + shared.length + '</div>';
      shared.slice().forEach(a => {
        html += '<div class="akt-hist">🗄 <b>Акт ' + aktEsc(a.num || 'б/н') + ' от ' + aktEsc(a.date || '—') + '</b>' +
          (a.kv ? ' · ' + ['','I','II','III','IV'][Math.max(1, Math.min(4, a.kv))] + ' кв. ' + (a.god || '') + (a.ochered ? ' · ' + aktEsc(a.ochered) + ' оч.' : '') : '') +
          (a.cat ? ' · ' + aktEsc(a.cat) : '') +
          (a.file ? '<br><span class="note">файл: ' + aktEsc(a.file) + '</span>' : '') +
          (a.zakl ? '<br><span class="note" style="color:var(--txt)"><b>Выводы:</b> ' + aktEsc(a.zakl) + '</span>' : '') +
          (a.note ? '<br><span class="note">⚠ ' + aktEsc(a.note) + '</span>' : '') + '</div>';
      });
    }
    if (!list.length && !shared.length) { h.innerHTML = '<div class="note" style="margin-top:10px">Акты обследования по объекту ещё не формировались.</div>'; return; }
    if (list.length) html += '<div class="sect" style="margin:12px 0 4px">Черновики (локальные) · ' + list.length + '</div>';
    h.innerHTML = html;
    list.slice().reverse().forEach(cur => {
      const div = document.createElement('div'); div.className = 'akt-hist';
      const c = aktCounts(o, cur);
      div.innerHTML = '<b>📄 Акт ' + (cur.head.num ? aktEsc(cur.head.num) : 'черновик') + ' от ' + aktEsc(cur.head.date) + '</b> · ' +
        cur.head.kv + ' кв. ' + cur.head.god + (cur.head.ochered ? ' · ' + cur.head.ochered + ' оч.' : '') + ' · ' +
        (cur.status === 'сформирован' ? '<b style="color:var(--ok)">сформирован</b>' : 'черновик') +
        ' · осмотрено ' + c.done + '/' + c.tot + (c.viol ? ' · <b style="color:var(--crit)">несоответствий: ' + c.viol + '</b>' : '') +
        (c.nPh ? ' · фото: ' + c.nPh : '');
      const bb = document.createElement('div'); bb.style.cssText = 'margin-top:6px;display:flex;gap:6px;flex-wrap:wrap';
      const open = document.createElement('button'); open.className = 'wbtn'; open.textContent = RO ? 'Открыть (просмотр)' : 'Открыть';
      open.onclick = function () { AKT_CUR = cur; tabAkt(o, el); };
      const word = document.createElement('button'); word.className = 'wbtn'; word.textContent = '📄 Word (.docx)';
      word.onclick = function () { aktExportWord(o, cur); };
      bb.appendChild(open); bb.appendChild(word);
      if (!RO) {
        const js = document.createElement('button'); js.className = 'wbtn'; js.textContent = '📤 Экспорт JSON'; js.title = 'Метаданные акта для переноса в общую базу';
        js.onclick = function () { aktExportJson(o, cur); };
        const del = document.createElement('button'); del.className = 'wbtn'; del.textContent = '🗑'; del.title = 'Удалить черновик';
        del.onclick = function () { if (!confirm('Удалить акт от ' + cur.head.date + '?')) return; const i = list.indexOf(cur); if (i >= 0) list.splice(i, 1); aktSave(); tabAkt(o, el); };
        bb.appendChild(js); bb.appendChild(del);
      }
      div.appendChild(bb); h.appendChild(div);
    });
    return;
  }
  aktForm(o, AKT_CUR, RO, el);
}

function aktCounts(o, cur) {
  let done = 0, tot = 0, viol = 0, warn = 0, nPh = 0;
  aktSecsFor(o).forEach(sec => sec.items.forEach(it => {
    tot++;
    const r = (cur.elements || {})[sec.id + '_' + it[0]] || {};
    if (r.st) done++;
    if (r.st === 'viol') viol++;
    if (r.st === 'warn') warn++;
    nPh += ((r.photos || []).length);
  }));
  return { done: done, tot: tot, viol: viol, warn: warn, nPh: nPh };
}

/* ---------- форма акта ---------- */
function aktForm(o, cur, RO, el) {
  const dis = RO ? 'disabled' : '';
  const H = cur.head;
  el.innerHTML =
    '<h3 style="margin:4px 0 6px">📄 Акт обследования — ' + aktEsc(o.a) + '</h3>' +
    '<div class="akt-note">' + (RO ? 'Просмотр (наблюдатель)' : 'Черновик — все поля редактируются') + ' · ' + H.kv + ' квартал ' + H.god + (H.ochered ? ' · ' + H.ochered + ' очередь' : '') + ' · <a href="#" id="aktBack" style="color:var(--c-centr)">← к реестру актов</a></div>' +

    /* --- общие сведения --- */
    '<details class="akt-sec" open><summary>1. Общие сведения <span class="note">титул акта</span></summary>' +
    '<div style="padding:10px 12px"><div class="akt-grid">' +
    '<label>Дата обследования<input type="date" id="ahDate" value="' + H.date + '" ' + dis + '></label>' +
    '<label>Время<input type="time" id="ahTime" value="' + (H.time || '') + '" ' + dis + '></label>' +
    '<label>Квартал<input type="number" id="ahKv" min="1" max="4" value="' + H.kv + '" ' + dis + '></label>' +
    '<label>Год<input type="number" id="ahGod" value="' + H.god + '" ' + dis + '></label>' +
    ((o.id === 'gts01') ? '<label>Очередь<input id="ahOch" value="' + aktEsc(H.ochered || '') + '" placeholder="1 / 2" ' + dis + '></label>' : '') +
    '<label>№ акта<input id="ahNum" value="' + aktEsc(H.num || '') + '" placeholder="ЗФ-…-акт от …" ' + dis + '></label>' +
    '</div>' +
    '<label style="display:block;margin-top:8px;font-size:11.5px;color:var(--mut)">Основание<textarea id="ahOsn" style="width:100%;min-height:44px;margin-top:3px;font-size:12.5px;padding:5px 7px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(H.osnovanie || '') + '</textarea></label>' +
    '<label style="display:block;margin-top:6px;font-size:11.5px;color:var(--mut)">Цель обследования<textarea id="ahCel" style="width:100%;min-height:34px;margin-top:3px;font-size:12.5px;padding:5px 7px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(H.cel || '') + '</textarea></label>' +
    '<div class="akt-grid" style="margin-top:8px">' +
    '<label>УТВЕРЖДАЮ (должность — ввод вручную)<input id="ahUtv" value="' + aktEsc(H.utv || '') + '" placeholder="должность утверждающего лица" ' + dis + '></label>' +
    '<label>Председатель комиссии (должность, ФИО — вручную)<input id="ahPred" value="' + aktEsc(H.pred || '') + '" ' + dis + '></label>' +
    '<label>Член комиссии 1<input id="ahCh0" value="' + aktEsc((H.chleny || [])[0] || '') + '" ' + dis + '></label>' +
    '<label>Член комиссии 2<input id="ahCh1" value="' + aktEsc((H.chleny || [])[1] || '') + '" ' + dis + '></label>' +
    '<label>Член комиссии 3<input id="ahCh2" value="' + aktEsc((H.chleny || [])[2] || '') + '" ' + dis + '></label>' +
    '</div>' +

    /* --- погода --- */
    '<div class="sect" style="margin:12px 0 4px">Погодные условия на момент осмотра</div>' +
    '<div class="akt-grid">' +
    '<label>t° средняя, °C<input id="ahWxT" value="' + aktEsc(H.wx.t != null ? H.wx.t : '') + '" ' + dis + '></label>' +
    '<label>t° мин, °C<input id="ahWxTn" value="' + aktEsc(H.wx.tmin != null ? H.wx.tmin : '') + '" ' + dis + '></label>' +
    '<label>t° макс, °C<input id="ahWxTx" value="' + aktEsc(H.wx.tmax != null ? H.wx.tmax : '') + '" ' + dis + '></label>' +
    '<label>Осадки, мм<input id="ahWxO" value="' + aktEsc(H.wx.osadki != null ? H.wx.osadki : '') + '" ' + dis + '></label>' +
    '<label>Ветер, м/с<input id="ahWxV" value="' + aktEsc(H.wx.veter != null ? H.wx.veter : '') + '" ' + dis + '></label>' +
    '<label>Облачность, %<input id="ahWxCl" value="' + aktEsc(H.wx.obl != null ? H.wx.obl : '') + '" ' + dis + '></label>' +
    '<label>Снежный покров<input id="ahWxS" value="' + aktEsc(H.wx.snow != null ? H.wx.snow : '') + '" ' + dis + '></label>' +
    '<label>Характер погоды<input id="ahWxTxt" value="' + aktEsc(H.wx.txt || '') + '" ' + dis + '></label>' +
    '</div>' +
    (RO ? '' : '<button class="wbtn" id="ahWxGo" style="margin-top:6px">🌡 Загрузить погоду на дату осмотра (Open-Meteo)</button>') +
    '<div class="akt-note" id="ahWxSrc" style="margin-top:4px">' + (H.wx.src ? 'Источник: ' + aktEsc(H.wx.src) : '') + '</div>' +
    '</div></details>' +

    /* --- поэлементный осмотр --- */
    '<details class="akt-sec" open><summary>2. Результаты визуального осмотра <span class="note" id="aktProg"></span></summary><div id="aktEls"></div></details>' +

    /* --- инструментальные наблюдения --- */
    '<details class="akt-sec" open><summary>3. Результаты инструментальных наблюдений <span class="note">автозаполнение из базы</span></summary><div style="padding:10px 12px">' +
    '<div class="sect">3.1 Геодезический контроль</div>' +
    '<textarea id="aiGeo" style="width:100%;min-height:52px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(cur.instr.geo || '') + '</textarea>' +
    (RO ? '' : '<button class="wbtn" id="aiGeoAuto">⟲ из базы (раздел «Деформации»)</button>') +
    '<div class="sect" style="margin-top:10px">3.2 Фильтрационный режим (УГВ)</div>' +
    '<textarea id="aiUgv" style="width:100%;min-height:52px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(cur.instr.ugv || '') + '</textarea>' +
    (RO ? '' : '<button class="wbtn" id="aiUgvAuto">⟲ из базы (раздел «Пьезометрия», ведомость — в приложение)</button>') +
    '<div class="sect" style="margin-top:10px">3.3 Геотермический мониторинг</div>' +
    '<textarea id="aiTerm" style="width:100%;min-height:64px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(cur.instr.term || '') + '</textarea>' +
    (RO ? '' : '<button class="wbtn" id="aiTermAuto">⟲ из базы (раздел «Термометрия», сводка — в приложение)</button>') +
    '<div class="sect" style="margin-top:10px">3.4 Система складирования хвостов</div>' +
    '<textarea id="aiSkl" style="width:100%;min-height:44px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(cur.instr.skl || '') + '</textarea>' +
    '</div></details>' +

    /* --- журналы, критерии, мероприятия --- */
    '<details class="akt-sec"><summary>4. Журналы, критерии безопасности, мероприятия <span class="note">К1/К2 из декларации</span></summary><div style="padding:10px 12px">' +
    '<div class="sect">4.1 Ведение журналов наблюдений</div>' +
    '<textarea id="aiJourn" style="width:100%;min-height:44px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(cur.instr.journ || '') + '</textarea>' +
    '<div class="sect" style="margin-top:10px">4.2 Анализ соответствия показателей критериям безопасности</div>' +
    '<div id="aktKkTbl"></div>' +
    '<textarea id="aiKk" style="width:100%;min-height:40px;margin-top:6px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" placeholder="Комментарий к анализу критериев (отклонения, превышения)" ' + dis + '>' + aktEsc(cur.kkTxt || '') + '</textarea>' +
    '<div class="sect" style="margin-top:10px">4.3 Сведения о выполнении запланированных мероприятий</div>' +
    '<textarea id="aiEvents" style="width:100%;min-height:44px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(cur.instr.events || '') + '</textarea>' +
    '</div></details>' +

    /* --- выводы и рекомендации --- */
    '<details class="akt-sec" open><summary>5. Выводы и рекомендации <span class="note">раздел IV ФНП № 151</span></summary><div style="padding:10px 12px">' +
    '<label style="font-size:12.5px">Категория технического состояния: <select id="avCat" ' + dis + '>' +
    ['', 'работоспособное', 'частично работоспособное', 'неработоспособное', 'аварийное', 'предаварийное'].map(c =>
      '<option value="' + c + '"' + (cur.vyvody.cat === c ? ' selected' : '') + '>' + (c || '— не установлена —') + '</option>').join('') +
    '</select></label>' +
    '<textarea id="avTxt" style="width:100%;min-height:64px;margin-top:6px;font-size:12.6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + dis + '>' + aktEsc(cur.vyvody.txt || '') + '</textarea>' +
    (RO ? '' : '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button class="wbtn" id="avAuto">⟲ Сформировать выводы автоматически</button><button class="wbtn" id="arAuto">⟲ Собрать рекомендации из осмотра</button></div>') +
    '<div class="sect" style="margin:10px 0 4px">Рекомендации</div><div id="aktRek"></div>' +
    (RO ? '' : '<button class="wbtn" id="arAdd" style="margin-top:4px">+ пункт рекомендаций</button>') +
    '</div></details>' +

    /* --- геотрек --- */
    '<details class="akt-sec"><summary>6. Геотрек осмотра <span class="note" id="aktTrkN"></span></summary><div style="padding:10px 12px">' +
    (RO ? '' : '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="wbtn" id="atStart">⏺ Начать запись трека</button><button class="wbtn" id="atStop" disabled>⏹ Остановить</button><button class="wbtn" id="atClear">🗑 Очистить</button></div>') +
    '<div id="aktTrackMap"></div><div class="akt-note" id="atNote" style="margin-top:4px">Точки трека и фототочки попадают в приложение к акту (таблица с координатами и временем). Запись — через GPS устройства (на смартфоне/планшете).</div>' +
    '</div></details>' +

    /* --- экспорт --- */
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:#fff">' +
    '<button class="addrow" id="aktWord" style="border-style:solid;background:#2e7d32;color:#fff;border-color:#2e7d32">📄 Сформировать Word (.docx)</button>' +
    (RO ? '' : '<button class="wbtn" id="aktJson">📤 Экспорт JSON (в общую базу)</button>' +
      '<button class="wbtn" id="aktCapPack" title="Манифест фото для интеллектуальных подписей: передайте фото и файл манифеста в диалог — подписи вернутся для импорта">📦 Пакет для подписей фото</button>' +
      '<button class="wbtn" id="aktCapImp" title="Импорт подписей фото (JSON, полученный после разбора пакета)">📥 Импорт подписей</button>') +
    '</div>';

  document.getElementById('aktBack').onclick = function (e) { e.preventDefault(); aktCollect(o, cur); aktSave(); AKT_CUR = null; tabAkt(o, el); };

  if (!RO) {
    /* погода */
    document.getElementById('ahWxGo').onclick = async function () {
      const b = this; b.disabled = true; b.textContent = '⏳ загружаю…';
      try {
        const wx = await aktWxFetch(o, document.getElementById('ahDate').value);
        H.wx = wx;
        const set = (id, v) => { document.getElementById(id).value = (v == null ? '' : v); };
        set('ahWxT', wx.t); set('ahWxTn', wx.tmin); set('ahWxTx', wx.tmax); set('ahWxO', wx.osadki);
        set('ahWxV', wx.veter); set('ahWxCl', wx.obl); set('ahWxS', wx.snow); set('ahWxTxt', wx.txt);
        document.getElementById('ahWxSrc').textContent = 'Источник: ' + wx.src;
        aktCollect(o, cur); aktSave();
      } catch (e) { alert('Погода не загрузилась: ' + e.message); }
      b.disabled = false; b.textContent = '🌡 Загрузить погоду на дату осмотра (Open-Meteo)';
    };
    /* автозаполнение инструментальных разделов */
    document.getElementById('aiGeoAuto').onclick = function () { cur.instr.geo = aktAutoGeo(o); document.getElementById('aiGeo').value = cur.instr.geo; aktCollect(o, cur); aktSave(); };
    document.getElementById('aiUgvAuto').onclick = function () { cur.instr.ugv = aktAutoUgv(o).txt; document.getElementById('aiUgv').value = cur.instr.ugv; aktCollect(o, cur); aktSave(); };
    document.getElementById('aiTermAuto').onclick = function () { cur.instr.term = aktAutoTerm(o).txt; document.getElementById('aiTerm').value = cur.instr.term; aktCollect(o, cur); aktSave(); };
    document.getElementById('avAuto').onclick = function () {
      const v = aktAutoVyvody(o, cur); cur.vyvody.cat = v.cat; cur.vyvody.txt = v.txt;
      document.getElementById('avCat').value = v.cat; document.getElementById('avTxt').value = v.txt; aktSave();
    };
    document.getElementById('arAuto').onclick = function () { cur.rekom = aktAutoRekom(o, cur); aktRenderRek(o, cur, RO); aktSave(); };
    document.getElementById('arAdd').onclick = function () { cur.rekom.push(''); aktRenderRek(o, cur, RO); aktSave(); };
    /* экспорт */
    document.getElementById('aktJson').onclick = function () { aktCollect(o, cur); aktSave(); aktExportJson(o, cur); };
    document.getElementById('aktCapPack').onclick = function () { aktCapPackExport(o, cur); };
    document.getElementById('aktCapImp').onclick = function () { aktCapImport(o, cur, RO, el); };
  }
  document.getElementById('aktWord').onclick = function () { aktCollect(o, cur); aktSave(); aktExportWord(o, cur); };

  /* поэлементный осмотр */
  aktRenderEls(o, cur, RO);
  /* критерии К1/К2 */
  aktRenderKk(o);
  /* рекомендации */
  aktRenderRek(o, cur, RO);
  /* трек */
  aktRenderTrack(o, cur, RO);
}

/* ---------- сбор полей формы в объект акта ---------- */
function aktCollect(o, cur) {
  const g = id => { const e = document.getElementById(id); return e ? e.value : ''; };
  const H = cur.head;
  H.date = g('ahDate') || H.date; H.time = g('ahTime');
  H.kv = +g('ahKv') || aktKv(H.date); H.god = g('ahGod') || String(H.date).slice(0, 4);
  if (o.id === 'gts01') H.ochered = g('ahOch');
  H.num = g('ahNum'); H.osnovanie = g('ahOsn'); H.cel = g('ahCel');
  H.utv = g('ahUtv'); H.pred = g('ahPred');
  H.chleny = [g('ahCh0'), g('ahCh1'), g('ahCh2')];
  H.wx = { t: g('ahWxT'), tmin: g('ahWxTn'), tmax: g('ahWxTx'), osadki: g('ahWxO'), veter: g('ahWxV'), obl: g('ahWxCl'), snow: g('ahWxS'), txt: g('ahWxTxt'), src: (H.wx || {}).src || '' };
  cur.instr.geo = g('aiGeo'); cur.instr.ugv = g('aiUgv'); cur.instr.term = g('aiTerm');
  cur.instr.skl = g('aiSkl'); cur.instr.journ = g('aiJourn'); cur.instr.events = g('aiEvents');
  cur.kkTxt = g('aiKk');
  cur.vyvody.cat = g('avCat'); cur.vyvody.txt = g('avTxt');
}

/* ---------- поэлементный осмотр (рендер) ---------- */
const AKT_ST = { '': 'не осмотрено', ok: 'без замечаний', warn: 'замечание', viol: 'несоответствие' };
function aktRenderEls(o, cur, RO) {
  const box = document.getElementById('aktEls');
  if (!box) return;
  const dis = RO ? 'disabled' : '';
  const secs = aktSecsFor(o);
  box.innerHTML = '';
  secs.forEach(sec => {
    const d = document.createElement('details');
    d.className = 'akt-sec'; d.style.margin = '6px 10px';
    const nSt = sec.items.filter(it => ((cur.elements || {})[sec.id + '_' + it[0]] || {}).st).length;
    d.innerHTML = '<summary>' + aktEsc(sec.t) + '<span class="note">' + nSt + '/' + sec.items.length + '</span></summary>';
    const body = document.createElement('div');
    sec.items.forEach(it => {
      const key = sec.id + '_' + it[0];
      const r = (cur.elements[key] = cur.elements[key] || { st: '', cm: '', pk: '', photos: [] });
      const ed = document.createElement('div');
      ed.className = 'akt-el';
      ed.innerHTML =
        '<div class="q">' + aktEsc(it[1]) + ' <span class="akt-st-' + (r.st || 'no') + '" data-stlab>' + (AKT_ST[r.st] || '') + '</span></div>' +
        '<div class="row">' +
        '<select data-f="st" ' + dis + '>' +
        Object.keys(AKT_ST).map(k => '<option value="' + k + '"' + (r.st === k ? ' selected' : '') + '>' + AKT_ST[k] + '</option>').join('') +
        '</select>' +
        '<input data-f="pk" placeholder="ПК-привязка (ПК…–ПК…)" value="' + aktEsc(r.pk || '') + '" style="width:150px;font-size:12px;padding:4px 6px;border:1px solid var(--line);border-radius:5px" ' + dis + '>' +
        (RO ? '' : '<span class="akt-lib"><button class="wbtn" data-act="lib" type="button">📚 Формулировки</button></span>' +
          '<button class="wbtn" data-act="star" type="button" title="Сохранить текущий комментарий в библиотеку формулировок (самообучение)">★</button>' +
          '<button class="wbtn" data-act="mic" type="button" title="Диктовка комментария (русский)">🎤</button>' +
          '<button class="wbtn" data-act="polish" type="button" title="Технический редактор: нормативная терминология">✍</button>' +
          '<button class="wbtn" data-act="photo" type="button">📷 Фото</button>') +
        '<input type="file" accept="image/*" multiple style="display:none" data-f="file">' +
        '</div>' +
        '<textarea data-f="cm" placeholder="Результат осмотра элемента: состояние, дефекты, работы (диктовка 🎤, редактор ✍, библиотека 📚)" ' + dis + '>' + aktEsc(r.cm || '') + '</textarea>' +
        '<div class="akt-photos" data-f="photos"></div>';
      body.appendChild(ed);

      const ta = ed.querySelector('textarea[data-f=cm]');
      ta.oninput = () => { r.cm = ta.value; aktSave(); };
      const stSel = ed.querySelector('select[data-f=st]');
      stSel.onchange = () => { r.st = stSel.value; ed.querySelector('[data-stlab]').textContent = AKT_ST[r.st] || ''; ed.querySelector('[data-stlab]').className = 'akt-st-' + (r.st || 'no'); aktProgUpd(o, cur); aktSave(); };
      const pkInp = ed.querySelector('input[data-f=pk]');
      pkInp.oninput = () => { r.pk = pkInp.value; aktSave(); };

      if (!RO) {
        const fileInp = ed.querySelector('input[data-f=file]');
        ed.querySelector('[data-act=photo]').onclick = () => fileInp.click();
        fileInp.onchange = async () => {
          const files = Array.from(fileInp.files || []);
          fileInp.value = '';
          for (const f of files) {
            const buf = await f.arrayBuffer();
            const g = (typeof exifGps === 'function') ? exifGps(buf) : null;
            const durl = (typeof downscaleImg === 'function') ? await downscaleImg(buf, 1280, 0.72) : null;
            if (!durl) continue;
            r.photos.push({
              d: durl, lat: g ? g.lat : null, lon: g ? g.lon : null,
              ts: (g && g.dt) ? g.dt : new Date().toISOString(),
              cap: aktCapAuto(it[1], r)
            });
          }
          aktSave(); aktRenderPhotos(ed, o, cur, r, key, it[1], RO);
        };
        const micBtn = ed.querySelector('[data-act=mic]');
        if (typeof micAttach === 'function') micAttach(micBtn, ta);
        ed.querySelector('[data-act=polish]').onclick = () => {
          if (typeof polishComment === 'function') { ta.value = polishComment(ta.value); r.cm = ta.value; ta.dispatchEvent(new Event('input', { bubbles: true })); aktSave(); }
        };
        ed.querySelector('[data-act=star]').onclick = () => {
          const t = (ta.value || '').trim();
          if (!t) { alert('Комментарий пуст — нечего сохранять в библиотеку.'); return; }
          const U = aktLibLoad(); U[key] = U[key] || [];
          if (!U[key].includes(t)) { U[key].push(t); aktLibSave(); }
          alert('Формулировка сохранена в библиотеку (самообучение). Всего по элементу: ' + aktLibFor(key).length);
        };
        const libSpan = ed.querySelector('.akt-lib');
        ed.querySelector('[data-act=lib]').onclick = () => {
          const old = libSpan.querySelector('.akt-lib-pop');
          if (old) { old.remove(); return; }
          const pop = document.createElement('div'); pop.className = 'akt-lib-pop';
          const phrases = aktLibFor(key);
          pop.innerHTML = phrases.length ? '' : '<div class="note">библиотека пуста</div>';
          phrases.forEach(p => {
            const di = document.createElement('div'); di.textContent = p;
            di.onclick = () => { ta.value = (ta.value ? ta.value.replace(/\s+$/, '') + ' ' : '') + p; r.cm = ta.value; aktSave(); pop.remove(); };
            pop.appendChild(di);
          });
          libSpan.appendChild(pop);
          const close = (ev) => { if (!libSpan.contains(ev.target)) { pop.remove(); document.removeEventListener('click', close); } };
          setTimeout(() => document.addEventListener('click', close), 10);
        };
      }
      aktRenderPhotos(ed, o, cur, r, key, it[1], RO);
    });
    d.appendChild(body);
    box.appendChild(d);
  });
  aktProgUpd(o, cur);
}
function aktCapAuto(elName, r) {
  let s = elName + (r.pk ? ', ' + r.pk : '') + '. ';
  s += (r.st === 'viol' || r.st === 'warn') ? 'Зафиксированное состояние (см. текст акта).' : 'Общий вид; признаки деформаций не зафиксированы.';
  return s;
}
function aktRenderPhotos(ed, o, cur, r, key, elName, RO) {
  const box = ed.querySelector('[data-f=photos]');
  if (!box) return;
  box.innerHTML = '';
  (r.photos || []).forEach((p, i) => {
    const d = document.createElement('div'); d.className = 'akt-ph';
    d.innerHTML = '<img src="' + p.d + '">' +
      '<input data-f="cap" value="' + aktEsc(p.cap || '') + '" placeholder="Подпись к фото (техническое описание)" ' + (RO ? 'disabled' : '') + '>' +
      '<div>' + (p.lat != null ? ('📍 ' + p.lat.toFixed(5) + ', ' + p.lon.toFixed(5)) : '📍 нет гео') + '</div>' +
      '<div>' + aktEsc((typeof fmtPhTs === 'function') ? fmtPhTs(p.ts) : (p.ts || '')) + '</div>' +
      (RO ? '' : '<button class="del" title="Удалить фото">×</button>');
    box.appendChild(d);
    if (!RO) {
      const capInp = d.querySelector('input[data-f=cap]');
      capInp.oninput = () => { p.cap = capInp.value; aktSave(); };
      d.querySelector('.del').onclick = () => { r.photos.splice(i, 1); aktSave(); aktRenderPhotos(ed, o, cur, r, key, elName, RO); };
    }
  });
}
function aktProgUpd(o, cur) {
  const c = aktCounts(o, cur);
  const e = document.getElementById('aktProg');
  if (e) e.textContent = 'осмотрено ' + c.done + '/' + c.tot + (c.viol ? ' · несоответствий: ' + c.viol : '') + (c.nPh ? ' · фото: ' + c.nPh : '');
}

/* ---------- критерии К1/К2 (из декларации — вкладка «Контрольные критерии») ---------- */
function aktRenderKk(o) {
  const box = document.getElementById('aktKkTbl');
  if (!box) return;
  const rows = (o.kkd && o.kkd.rows) || [];
  if (!rows.length) { box.innerHTML = '<div class="note">Декларационные критерии по объекту в базу не внесены (вкладка «Контрольные критерии»).</div>'; return; }
  box.innerHTML = '<table class="rows static" style="font-size:11.8px"><thead><tr><th>Группа / показатель</th><th>К1</th><th>К2</th><th>Примечание</th></tr></thead><tbody>' +
    rows.map(r => '<tr><td>' + aktEsc((r.g ? r.g + ' — ' : '') + (r.p || '')) + '</td><td>' + aktEsc(r.k1 || '') + '</td><td>' + aktEsc(r.k2 || '') + '</td><td>' + aktEsc(r.n || '') + '</td></tr>').join('') +
    '</tbody></table>' + (o.kkd.decl ? '<div class="akt-note" style="margin-top:4px">Источник: ' + aktEsc(o.kkd.decl) + '</div>' : '');
}

/* ---------- рекомендации ---------- */
function aktRenderRek(o, cur, RO) {
  const box = document.getElementById('aktRek');
  if (!box) return;
  box.innerHTML = '';
  (cur.rekom || []).forEach((t, i) => {
    const d = document.createElement('div');
    d.style.cssText = 'display:flex;gap:6px;margin-top:4px;align-items:flex-start';
    d.innerHTML = '<span style="font-size:12px;color:var(--mut);padding-top:6px">' + (i + 1) + '.</span>' +
      '<textarea style="flex:1;min-height:34px;font-size:12.5px;padding:5px 7px;border:1px solid var(--line);border-radius:6px;font-family:inherit" ' + (RO ? 'disabled' : '') + '>' + aktEsc(t) + '</textarea>' +
      (RO ? '' : '<button class="wbtn" title="Удалить пункт">🗑</button>');
    box.appendChild(d);
    const ta = d.querySelector('textarea');
    ta.oninput = () => { cur.rekom[i] = ta.value; aktSave(); };
    if (!RO) d.querySelector('button').onclick = () => { cur.rekom.splice(i, 1); aktSave(); aktRenderRek(o, cur, RO); };
  });
  if (!(cur.rekom || []).length) box.innerHTML = '<div class="note">Пункты рекомендаций не добавлены — кнопка «⟲ Собрать рекомендации из осмотра» сформирует проект.</div>';
}

/* ---------- геотрек ---------- */
function aktRenderTrack(o, cur, RO) {
  const n = (cur.track || []).length;
  const lab = document.getElementById('aktTrkN');
  if (lab) lab.textContent = n ? ('точек: ' + n) : 'запись не велась';
  const note = document.getElementById('atNote');
  if (note && n) {
    const t0 = cur.track[0].ts, t1 = cur.track[n - 1].ts;
    note.textContent = 'Точек: ' + n + ' · с ' + aktEsc(String(t0).slice(0, 16).replace('T', ' ')) + ' по ' + aktEsc(String(t1).slice(0, 16).replace('T', ' ')) + '. Точки попадают в приложение к акту.';
  }
  /* мини-карта */
  const mapEl = document.getElementById('aktTrackMap');
  if (!mapEl || typeof L === 'undefined') return;
  setTimeout(() => {
    try {
      const el2 = document.getElementById('aktTrackMap');
      if (!el2) return;
      /* пересоздаём карту при каждом рендере: div пересоздаётся формой,
         старый инстанс держит устаревший контейнер и копит фототочки */
      if (AKT_MAP) { try { AKT_MAP.remove(); } catch (e) {} AKT_MAP = null; AKT_LINE = null; }
      AKT_MAP = L.map(el2, { attributionControl: false }).setView([o.lat || 69.35, o.lon || 88.2], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(AKT_MAP);
      if (AKT_LINE) { AKT_MAP.removeLayer(AKT_LINE); AKT_LINE = null; }
      const pts = (cur.track || []).map(p => [p.lat, p.lon]);
      /* фототочки */
      aktSecsFor(o).forEach(sec => sec.items.forEach(it => {
        const r = (cur.elements || {})[sec.id + '_' + it[0]] || {};
        (r.photos || []).forEach(p => {
          if (p.lat != null) L.circleMarker([p.lat, p.lon], { radius: 4, color: '#c17900', weight: 1 }).addTo(AKT_MAP)
            .bindTooltip(aktEsc(it[1]) + (p.ts ? ' · ' + String(p.ts).slice(0, 16).replace('T', ' ') : ''));
        });
      }));
      if (pts.length > 1) {
        AKT_LINE = L.polyline(pts, { color: '#1565c0', weight: 3 }).addTo(AKT_MAP);
        AKT_MAP.fitBounds(AKT_LINE.getBounds().pad(0.2));
      } else if (pts.length === 1) { AKT_MAP.setView(pts[0], 16); }
    } catch (e) {}
  }, 120);
  if (!RO) {
    const bS = document.getElementById('atStart'), bT = document.getElementById('atStop'), bC = document.getElementById('atClear');
    if (bS) bS.onclick = () => {
      if (!navigator.geolocation) { alert('Геолокация не поддерживается этим браузером.'); return; }
      bS.disabled = true; bT.disabled = false;
      AKT_WATCH = navigator.geolocation.watchPosition(pos => {
        cur.track.push({ lat: +pos.coords.latitude.toFixed(6), lon: +pos.coords.longitude.toFixed(6), acc: Math.round(pos.coords.accuracy || 0), ts: new Date().toISOString() });
        aktSave(); aktRenderTrack(o, cur, RO);
      }, err => { alert('Геолокация: ' + err.message); bS.disabled = false; bT.disabled = true; }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    };
    if (bT) bT.onclick = () => {
      if (AKT_WATCH != null) { navigator.geolocation.clearWatch(AKT_WATCH); AKT_WATCH = null; }
      bS.disabled = false; bT.disabled = true;
    };
    if (bC) bC.onclick = () => { if (confirm('Очистить трек (' + (cur.track || []).length + ' точек)?')) { cur.track = []; aktSave(); aktRenderTrack(o, cur, RO); } };
  }
}

/* ---------- экспорт Word (.docx) — полный квартальный акт с приложениями ---------- */
async function aktExportWord(o, cur) {
  try { await libDocx(); } catch (e) { alert('Не удалось загрузить библиотеку Word (' + e.message + '). Попробуйте ещё раз.'); return; }
  if (!window.docx) { alert('Библиотека Word не загрузилась (нужен интернет). Попробуйте ещё раз.'); return; }
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, PageBreak } = window.docx;
  const H = cur.head;
  const T = (t, opts) => new Paragraph({ children: [new TextRun(Object.assign({ text: String(t == null || t === '' ? '—' : t), font: 'Times New Roman', size: 22 }, opts || {}))], spacing: { after: 80 } });
  const Hh = t => new Paragraph({ children: [new TextRun({ text: t, bold: true, font: 'Times New Roman', size: 26 })], spacing: { before: 220, after: 120 } });
  const cell = (t, b) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t == null ? '—' : t), bold: !!b, font: 'Times New Roman', size: 18 })] })] });
  const tbl = (head, rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: head.map(h => cell(h, true)), tableHeader: true }), ...rows.map(r => new TableRow({ children: r.map(x => cell(x)) }))] });
  const ctr = (t, opts) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(Object.assign({ text: t, font: 'Times New Roman', size: 22 }, opts || {}))], spacing: { after: 80 } });
  const wxLine = aktWxLine(H.wx);
  const kvRom = ['I', 'II', 'III', 'IV'][Math.max(0, Math.min(3, (H.kv || 1) - 1))];
  const objName = o.a.replace(/\s*\(ТОФ\)\s*$/, '').trim();

  /* сбор работ и наблюдений (титул) */
  const sostav = [
    'визуальное обследование состояния ограждающих дамб (гребни, откосы, бермы), чаши хранилища, сооружений системы оборотного водоснабжения и гидротранспорта;',
    'гидрогеологическое обследование, визуальное выявление водопроявлений на низовых откосах;',
    'обследование технического состояния КИА: пьезометров, термометрических скважин, деформационных марок;',
    'систематизация данных мониторинга: замеры УГВ, температурные измерения, геодезический контроль;',
    'анализ соответствия показателей состояния ГТС критериям безопасности; общая оценка технического состояния ГТС.'
  ];

  const kids = [];
  /* --- титул --- */
  kids.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Коммерческая тайна', font: 'Times New Roman', size: 20 })] }));
  kids.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Экз. № _____', font: 'Times New Roman', size: 20 })] }));
  kids.push(ctr('ЗФ ПАО «ГОРНО-МЕТАЛЛУРГИЧЕСКАЯ КОМПАНИЯ «НОРИЛЬСКИЙ НИКЕЛЬ»', { size: 22 }));
  kids.push(ctr((o.d || '').toUpperCase(), { size: 22, bold: true }));
  kids.push(new Paragraph({ children: [new TextRun({ text: '', font: 'Times New Roman' })], spacing: { after: 160 } }));
  kids.push(new Paragraph({ children: [new TextRun({ text: 'УТВЕРЖДАЮ', bold: true, font: 'Times New Roman', size: 22 })], alignment: AlignmentType.RIGHT }));
  kids.push(new Paragraph({ children: [new TextRun({ text: (H.utv || '___________________________'), font: 'Times New Roman', size: 22 })], alignment: AlignmentType.RIGHT }));
  kids.push(new Paragraph({ children: [new TextRun({ text: '____________ /____________/  «___» __________ ' + H.god + ' г.', font: 'Times New Roman', size: 22 })], alignment: AlignmentType.RIGHT, spacing: { after: 200 } }));
  kids.push(ctr('АКТ', { bold: true, size: 32 }));
  kids.push(ctr((H.num ? '№ ' + H.num + '  ·  ' : '') + 'от ' + H.date, { size: 24 }));
  kids.push(ctr('О ВЫПОЛНЕННОМ ОБСЛЕДОВАНИИ ТЕХНИЧЕСКОГО СОСТОЯНИЯ ГТС', { bold: true, size: 24 }));
  kids.push(ctr(objName + (H.ochered ? ' (' + H.ochered + ' очередь)' : ''), { bold: true, size: 24 }));
  kids.push(T('Основание: ' + (H.osnovanie || '—')));
  kids.push(T('Составлен комиссией:  Председатель комиссии: ' + (H.pred || '________________ (должность, ФИО)') +
    '.  Члены комиссии: ' + ((H.chleny || []).filter(Boolean).join('; ') || '________________; ________________; ________________')));
  kids.push(T('Комиссией ' + H.date + (H.time ? ' в ' + H.time : '') + ' выполнено комплексное обследование технического состояния гидротехнических сооружений: ' + objName + '.'));
  kids.push(T('Цель обследования: ' + (H.cel || '—')));
  kids.push(T('Погодные условия на момент осмотра: ' + (wxLine || '—') + '.'));
  kids.push(T('В ходе обследования выполнен следующий состав работ и наблюдений:'));
  sostav.forEach(s => kids.push(T('– ' + s)));
  kids.push(new Paragraph({ children: [new PageBreak()] }));

  /* --- 1. визуальный осмотр --- */
  kids.push(Hh('1. Результаты визуального осмотра'));
  const secs = aktSecsFor(o);
  secs.forEach(sec => {
    const rowsTxt = [];
    sec.items.forEach(it => {
      const r = (cur.elements || {})[sec.id + '_' + it[0]] || {};
      if (!r.st && !(r.cm || '').trim() && !(r.photos || []).length) return;
      let t = (r.cm || '').trim();
      if (!t) t = (r.st === 'ok') ? 'Признаки деформаций не выявлены, состояние работоспособное.' : (r.st ? 'Статус: ' + (AKT_ST[r.st] || r.st) + '.' : 'Не осмотрено.');
      rowsTxt.push([it[1] + (r.pk ? ' (' + r.pk + ')' : ''), t]);
    });
    if (!rowsTxt.length) return;
    kids.push(T(sec.t, { bold: true }));
    rowsTxt.forEach(x => {
      kids.push(T(x[0], { bold: true, size: 22 }));
      kids.push(T(x[1]));
    });
  });

  /* --- 2. инструментальные наблюдения --- */
  kids.push(Hh('2. Результаты инструментальных наблюдений'));
  kids.push(T('2.1 Геодезический контроль', { bold: true }));
  kids.push(T(cur.instr.geo || aktAutoGeo(o)));
  kids.push(T('2.2 Фильтрационный режим (уровни грунтовых вод)', { bold: true }));
  kids.push(T(cur.instr.ugv || aktAutoUgv(o).txt));
  kids.push(T('2.3 Геотермический мониторинг', { bold: true }));
  kids.push(T(cur.instr.term || aktAutoTerm(o).txt));
  kids.push(T('2.4 Система складирования хвостов', { bold: true }));
  kids.push(T(cur.instr.skl || aktAutoSkl(o)));

  /* --- 3-5 --- */
  kids.push(Hh('3. Ведение журналов наблюдений, хранение и учёт документации'));
  kids.push(T(cur.instr.journ || aktAutoJourn(o)));
  kids.push(Hh('4. Анализ соответствия показателей состояния ГТС критериям безопасности'));
  const kkRows = (o.kkd && o.kkd.rows) || [];
  if (kkRows.length) {
    kids.push(tbl(['Показатель', 'К1', 'К2', 'Примечание / факт'],
      kkRows.map(r => [(r.g ? r.g + ' — ' : '') + (r.p || ''), r.k1 || '', r.k2 || '', r.n || ''])));
    if (o.kkd.decl) kids.push(T('Источник критериальных значений: ' + o.kkd.decl, { size: 18, italics: true }));
  } else kids.push(T('Декларационные критерии по объекту в базу не внесены.'));
  if ((cur.kkTxt || '').trim()) kids.push(T(cur.kkTxt));
  kids.push(Hh('5. Сведения о выполнении запланированных на отчётный период мероприятий'));
  kids.push(T(cur.instr.events || 'В отчётном квартале эксплуатирующей организацией выполнялись работы по поддержанию ГТС в работоспособном состоянии согласно Проекту эксплуатации (уточняется вручную).'));

  /* --- 6-7 --- */
  kids.push(Hh('6. Выводы'));
  kids.push(T(cur.vyvody.txt || aktAutoVyvody(o, cur).txt));
  kids.push(T('Категория технического состояния: ' + (cur.vyvody.cat || aktAutoVyvody(o, cur).cat) + ' (раздел IV ФНП ГТС — приказ Ростехнадзора от 08.05.2024 № 151).', { bold: true }));
  kids.push(Hh('7. Рекомендации'));
  const rek = (cur.rekom && cur.rekom.length) ? cur.rekom : aktAutoRekom(o, cur);
  rek.forEach((t, i) => kids.push(T((i + 1) + '. ' + t)));
  kids.push(Hh('Подписи членов комиссии'));
  kids.push(T('Председатель комиссии: ________________ / ' + (H.pred || '____________') + ' /'));
  (H.chleny || []).forEach(c => kids.push(T('Член комиссии: ________________ / ' + (c || '____________') + ' /')));

  /* --- Приложение 1: фототаблица --- */
  const ph = [];
  secs.forEach(sec => sec.items.forEach(it => {
    const r = (cur.elements || {})[sec.id + '_' + it[0]] || {};
    (r.photos || []).forEach(p => ph.push({ p: p, el: it[1], pk: r.pk || '', st: r.st }));
  }));
  if (ph.length) {
    kids.push(new Paragraph({ children: [new PageBreak()] }));
    kids.push(ctr('Приложение 1', { bold: true }));
    kids.push(ctr('Фотоматериалы обследования (' + ph.length + ' фото)', { bold: true, size: 24 }));
    ph.forEach((x, i) => {
      const geo = (x.p.lat != null) ? ('координаты: ' + x.p.lat + ', ' + x.p.lon + ' · ') : '';
      kids.push(T('Фотография ' + (i + 1) + '. ' + (x.p.cap || (x.el + (x.pk ? ', ' + x.pk : '') + '.')) +
        (x.pk && !(x.p.cap || '').includes(x.pk) ? (' · ' + x.pk) : ''), { bold: true, size: 20 }));
      kids.push(T(geo + ((typeof fmtPhTs === 'function') ? fmtPhTs(x.p.ts) : (x.p.ts || '')), { size: 18, italics: true }));
      try {
        kids.push(new Paragraph({ children: [new ImageRun({ type: 'jpg', data: durlToU8(x.p.d), transformation: { width: 460, height: 345 } })], spacing: { after: 160 } }));
      } catch (e) { kids.push(T('[фотографию вставить не удалось]', { size: 18 })); }
    });
  }

  /* --- Приложение 2: ведомость УГВ --- */
  const ug = aktAutoUgv(o);
  if (ug.rows.length) {
    kids.push(new Paragraph({ children: [new PageBreak()] }));
    kids.push(ctr('Приложение 2', { bold: true }));
    kids.push(ctr('Ведомость замеров УГВ в пьезометрических скважинах (последний замер в базе: ' + (ug.date || '—') + ')', { bold: true, size: 24 }));
    kids.push(tbl(['Пьезометр', 'Дата замера', 'Показание (отм. / глубина), м'], ug.rows));
    kids.push(T('Источник: раздел «Пьезометрия» карточки ГТС; полная динамика — в базе мониторинга.', { size: 18, italics: true }));
  }

  /* --- Приложение 3: сводка термометрии --- */
  const tm = aktAutoTerm(o);
  if (tm.rows.length) {
    kids.push(new Paragraph({ children: [new PageBreak()] }));
    kids.push(ctr('Приложение 3', { bold: true }));
    kids.push(ctr('Сводка температурного состояния грунтов по термометрическим скважинам (замер: ' + (tm.date || '—') + ')', { bold: true, size: 24 }));
    kids.push(tbl(['Скважина', 'Сооружение', 'Дата', 'T мин, °C', 'T макс, °C', 'Состояние (глубже 5 м)'], tm.rows));
    kids.push(T('Источник: раздел «Термометрия» карточки ГТС; поскважинные профили температур — в базе мониторинга.', { size: 18, italics: true }));
  }

  /* --- Приложение 4: геотрек --- */
  if ((cur.track || []).length) {
    kids.push(new Paragraph({ children: [new PageBreak()] }));
    kids.push(ctr('Приложение 4', { bold: true }));
    kids.push(ctr('Точки осмотра (геотрек, GPS): точек — ' + cur.track.length, { bold: true, size: 24 }));
    kids.push(tbl(['№', 'Дата/время', 'Широта, °', 'Долгота, °', 'Точность, м'],
      cur.track.map((p, i) => [i + 1, String(p.ts).slice(0, 16).replace('T', ' '), p.lat, p.lon, p.acc != null ? p.acc : '—'])));
  }

  const doc = new Document({ sections: [{ children: kids }] });
  const blob = await Packer.toBlob(doc);
  const a2 = document.createElement('a');
  a2.href = URL.createObjectURL(blob);
  a2.download = 'Акт_' + kvRom + 'кв' + H.god + (H.ochered ? '_' + H.ochered + 'оч' : '') + '_' + objName.replace(/[\s\/"«»]+/g, '_').slice(0, 60) + '.docx';
  a2.click();
  cur.status = 'сформирован'; aktSave();
}

/* ---------- экспорт JSON метаданных (для переноса в общую базу) ---------- */
function aktExportJson(o, cur) {
  const c = aktCounts(o, cur);
  const meta = {
    id: cur.id, objId: o.id, obj: o.a,
    num: cur.head.num || '', date: cur.head.date, time: cur.head.time || '',
    kv: cur.head.kv, god: cur.head.god, ochered: cur.head.ochered || '',
    cat: cur.vyvody.cat || '', status: cur.status,
    nEl: c.tot, done: c.done, viol: c.viol, warn: c.warn, nPhotos: c.nPh,
    track: (cur.track || []).length, wx: cur.head.wx || {},
    file: 'Акт_' + ['I', 'II', 'III', 'IV'][Math.max(0, Math.min(3, (cur.head.kv || 1) - 1))] + 'кв' + cur.head.god + (cur.head.ochered ? '_' + cur.head.ochered + 'оч' : '') + '.docx',
    exported: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(meta, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'акт_мета_' + o.id + '_' + cur.head.date + '.json';
  a.click();
}

/* ---------- пакет для интеллектуальных подписей фото + импорт подписей ---------- */
function aktCapPackExport(o, cur) {
  const ph = [];
  aktSecsFor(o).forEach(sec => sec.items.forEach(it => {
    const r = (cur.elements || {})[sec.id + '_' + it[0]] || {};
    (r.photos || []).forEach(p => ph.push({ n: ph.length + 1, element: it[1], pk: r.pk || '', st: r.st || '', ts: p.ts || '', lat: p.lat, lon: p.lon, cap: p.cap || '' }));
  }));
  if (!ph.length) { alert('В акте пока нет фотографий.'); return; }
  const pack = {
    obj: o.a, objId: o.id, act: { num: cur.head.num || 'черновик', date: cur.head.date, kv: cur.head.kv, god: cur.head.god },
    task: 'Для каждой фотографии (по номеру n) написать строго техническое описание подрисуночной подписи: что иллюстрирует снимок с точки зрения обследования технического состояния ГТС (элемент, дефект/норма, ПК-привязка). Без оценочных и пейзажных описаний. Вернуть JSON: [{n, cap}].',
    photos: ph
  };
  const blob = new Blob([JSON.stringify(pack, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'пакет_подписей_' + o.id + '_' + cur.head.date + '.json';
  a.click();
  alert('Пакет из ' + ph.length + ' фото выгружен.\n\nДалее: передайте фотографии и файл манифеста в диалог Кими — получите технические подписи, затем импортируйте их кнопкой «📥 Импорт подписей». Утверждённые подписи пополнят библиотеку самообучения.');
}
function aktCapImport(o, cur, RO, el) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'application/json';
  inp.onchange = async () => {
    try {
      const txt = await inp.files[0].text();
      const arr = JSON.parse(txt);
      const list = Array.isArray(arr) ? arr : (arr.caps || arr.photos || []);
      /* плоский список фото в документном порядке */
      const flat = [];
      aktSecsFor(o).forEach(sec => sec.items.forEach(it => {
        const r = (cur.elements || {})[sec.id + '_' + it[0]] || {};
        (r.photos || []).forEach(p => flat.push(p));
      }));
      let n = 0;
      list.forEach(x => {
        const i = (x.n || 0) - 1, cap = x.cap || x.caption || '';
        if (i >= 0 && i < flat.length && cap) { flat[i].cap = cap; n++; }
      });
      /* утверждённые подписи — в библиотеку самообучения */
      const C = aktCapsLoad();
      aktSecsFor(o).forEach(sec => sec.items.forEach(it => {
        const key = sec.id + '_' + it[0];
        const r = (cur.elements || {})[key] || {};
        (r.photos || []).forEach(p => {
          if (p.cap && p.cap !== aktCapAuto(it[1], r)) {
            C[key] = C[key] || [];
            if (!C[key].includes(p.cap) && C[key].length < 50) C[key].push(p.cap);
          }
        });
      }));
      aktCapsSave(); aktSave();
      alert('Импортировано подписей: ' + n + ' из ' + list.length + '. Библиотека самообучения пополнена.');
      tabAkt(o, el);
    } catch (e) { alert('Не удалось импортировать подписи: ' + e.message); }
  };
  inp.click();
}
