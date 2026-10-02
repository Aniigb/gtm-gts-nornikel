/* ============================================================
   Сводные карточки площадок (НОФ / ТОФ / НМЗ / Дудинка)
   Агрегация по объектам ГТС площадки: состояние, мониторинг КИА,
   функциональные системы сооружений, контрольные критерии,
   документация, погода площадки.
   Открытие: кнопка «▦» в заголовке аккордеона площадки (левая панель).
   ============================================================ */

/* ---------- функциональные профили площадок ---------- */
const DIST_INFO = {
  'ТОФ': {
    name: 'Талнахская обогатительная фабрика',
    prof: 'Переработка медно-никелевых руд. Хвостовое хозяйство: складирование хвостов флотации (1-я и 2-я очереди), оборотное водоснабжение, гидротранспорт хвостов — в том числе высоконапорная система ТОФ–НМЗ и система ТОФ–УПЗК рудника «Комсомольский».',
    func: ['Хвостохранилище (складирование)', 'Пруд-накопитель оборотной воды', 'Гидротранспортные системы']
  },
  'НМЗ': {
    name: 'Надеждинский металлургический завод',
    prof: 'Металлургическое передельное производство. Отходы: металлургические хвосты и гипсовые отходы (фосфогипс). Особенности: отвод поверхностного стока и паводковых вод (р. Буровая), система возврата фильтрационных вод, оборотное водоснабжение.',
    func: ['Хвостохранилище (металлургические хвосты)', 'Гипсохранилище (отвал фосфогипса)', 'Водоотвод и возврат фильтрата']
  },
  'НОФ': {
    name: 'Норильская обогатительная фабрика',
    prof: 'Переработка медно-никелевых руд (в т.ч. ООО «Медвежий ручей»). Хвостовое хозяйство: хвостохранилища «Лебяжье» и № 1 (поля 1–3), никелевые отстойники, оборотное водоснабжение, водозабор и перекачка.',
    func: ['Хвостохранилища (два действующих)', 'Никелевые отстойники', 'Оборотное водоснабжение и водозабор']
  },
  'Дудинка': {
    name: 'Водохозяйственная система трёх озёр (г. Дудинка)',
    prof: 'Система водоснабжения: плотина водохранилища на ручье Артинатка, водоводы и каналы. Площадка территориально обособлена (~90 км западнее Норильска) — отдельный метеорологический контур.',
    func: ['Плотина водохранилища', 'Водоводы и каналы']
  }
};

/* ---------- типы сооружений (локальный словарь, соответствует FT_TXT) ---------- */
const DST_FT = { damba: 'дамбы', plotina: 'плотины', ns: 'насосные станции', truba: 'трубопроводы', emk: 'ёмкости/резервуары', kanal: 'каналы/водоводы', kia: 'сооружения КИА', proch: 'прочие' };

/* ---------- стили модуля (однократно) ---------- */
(function dstCss() {
  if (document.getElementById('dstCss')) return;
  const st = document.createElement('style');
  st.id = 'dstCss';
  st.textContent = [
    '.acc-h .dsum{border:1px solid var(--line);background:#fff;border-radius:6px;font-size:12px;line-height:1;padding:2px 6px;margin-left:6px;cursor:pointer;color:var(--mut)}',
    '.acc-h .dsum:hover{color:var(--txt);border-color:#9db6cc;background:#eef4fb}',
    '.dst-kpis{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}',
    '.dst-kpi{border:1px solid var(--line);border-radius:8px;background:#fff;padding:8px 12px;min-width:110px;flex:1}',
    '.dst-kpi b{display:block;font-size:19px;line-height:1.15}',
    '.dst-kpi span{font-size:11px;color:var(--mut)}',
    '.dst-h{font-size:13.5px;font-weight:700;margin:16px 0 6px;padding-top:10px;border-top:1px solid var(--line)}',
    '.dst-tbl{width:100%;border-collapse:collapse;font-size:12.3px;background:#fff}',
    '.dst-tbl th{font-size:10.8px;color:var(--mut);text-align:left;padding:5px 7px;border-bottom:1px solid var(--line);font-weight:600}',
    '.dst-tbl td{padding:6px 7px;border-bottom:1px solid #eef1f4;vertical-align:top}',
    '.dst-tbl tr.dst-obj{cursor:pointer}',
    '.dst-tbl tr.dst-obj:hover{background:#f4f8fc}',
    '.dst-tbl tr.dst-tot td{font-weight:700;background:#f7f9fb;border-top:2px solid var(--line)}',
    '.dst-chip{display:inline-block;border:1px solid var(--line);border-radius:14px;padding:3px 10px;font-size:11.6px;margin:0 6px 6px 0;background:#fff}',
    '.dst-chip b{color:#1565c0}',
    '.dst-st{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600}',
    '.dst-note{font-size:11.3px;color:var(--mut);line-height:1.45;margin-top:4px}',
    '.dst-wx{border:1px solid var(--line);border-radius:8px;background:#fff;padding:10px 12px;font-size:12.6px;line-height:1.5}',
    '.dst-rsn{font-size:12.2px;padding:4px 0;border-bottom:1px dashed #eef1f4;cursor:pointer}',
    '.dst-rsn:hover{color:#1565c0}'
  ].join('\n');
  document.head.appendChild(st);
})();

/* ---------- агрегаты по объекту ---------- */
function dstCounts(o) {
  const prof = o.prof || {}, ugv = o.ugv || {}, geod = o.geod || {};
  const ugvKeys = Object.keys(ugv).filter(k => !/водоём|водоем/i.test(k));
  const hasLake = Object.keys(ugv).length !== ugvKeys.length;
  let last = '';
  const scan = arr => { (arr || []).forEach(r => { if (r && r[0] && r[0] > last) last = r[0]; }); };
  Object.keys(prof).forEach(w => { const s = (prof[w] || {}).s || []; if (s.length && s[s.length - 1][0] > last) last = s[s.length - 1][0]; });
  Object.keys(ugv).forEach(k => scan(ugv[k]));
  Object.keys(geod).forEach(k => scan(geod[k]));
  return {
    wells: Object.keys(prof).length,
    piezo: ugvKeys.length, lake: hasLake,
    geod: Object.keys(geod).length,
    fac: facOf(o.id).length,
    docs: (o.gtsdocs || []).length,
    acts: (o.acts || []).length,
    photos: (o.photos || []).length,
    kk: ((o.kkd || {}).rows || []).length,
    decl: (o.kkd || {}).decl || '',
    last: last
  };
}

/* ---------- погода площадки (тот же контур Open-Meteo, что и в карточках) ---------- */
const DST_WMO = { 0: 'ясно', 1: 'преимущественно ясно', 2: 'переменная облачность', 3: 'пасмурно', 45: 'туман', 48: 'изморозь', 51: 'слабая морось', 53: 'морось', 55: 'сильная морось', 56: 'ледяная морось', 57: 'сильная ледяная морось', 61: 'слабый дождь', 63: 'дождь', 65: 'сильный дождь', 66: 'ледяной дождь', 67: 'сильный ледяной дождь', 71: 'слабый снег', 73: 'снег', 75: 'сильный снег', 77: 'снежная крупа', 80: 'слабый ливень', 81: 'ливень', 82: 'сильный ливень', 85: 'слабый снегопад', 86: 'сильный снегопад', 95: 'гроза', 96: 'гроза с градом', 99: 'гроза с сильным градом' };
async function dstWxFetch(lat, lon) {
  const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,snow_depth&timezone=Asia%2FKrasnoyarsk';
  const j = await (await fetch(u)).json();
  const c = j.current || {};
  const dirs = ['С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ', 'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'];
  return {
    t: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m,
    os: c.precipitation, code: c.weather_code, obl: c.cloud_cover,
    wind: c.wind_speed_10m, wdir: dirs[Math.round((c.wind_direction_10m || 0) / 22.5) % 16],
    snow: (c.snow_depth != null ? Math.round(c.snow_depth * 100) : null)
  };
}

/* ---------- главная функция: сводная карточка площадки ---------- */
function renderDistrict(g) {
  const d = document.getElementById('detail');
  if (!d) return;
  const info = DIST_INFO[g] || { name: g, prof: '', func: [] };
  const col = (typeof DCOL === 'object' && DCOL[g]) || '#666';
  const objs = DB.objects.map((o, i) => ({ o: o, i: i })).filter(r => r.o.d === g);
  if (!objs.length) { d.innerHTML = '<div class="empty">Объекты площадки не найдены</div>'; return; }

  /* агрегаты */
  const rows = objs.map(r => ({ o: r.o, i: r.i, c: dstCounts(r.o), sd: (typeof statusDetail === 'function') ? statusDetail(r.o) : { status: '', reasons: [] } }));
  const tot = rows.reduce((a, r) => {
    a.wells += r.c.wells; a.piezo += r.c.piezo; a.geod += r.c.geod; a.fac += r.c.fac;
    a.docs += r.c.docs; a.acts += r.c.acts; a.kk += r.c.kk;
    if (r.c.last > a.last) a.last = r.c.last;
    return a;
  }, { wells: 0, piezo: 0, geod: 0, fac: 0, docs: 0, acts: 0, kk: 0, last: '' });
  const stN = { 'НОРМА': 0, 'РИСК': 0, 'КРИТИЧНО': 0, '': 0 };
  rows.forEach(r => { stN[r.sd.status || ''] = (stN[r.sd.status || ''] || 0) + 1; });
  const reasons = [];
  rows.forEach(r => (r.sd.reasons || []).forEach(x => { if (x.level === 'crit' || x.level === 'warn') reasons.push({ lvl: x.level, txt: r.o.a.split('(')[0].trim() + ': ' + x.text, i: r.i }); }));
  reasons.sort((a, b) => (a.lvl === 'crit' ? 0 : 1) - (b.lvl === 'crit' ? 0 : 1));

  /* сооружения по функциональным системам и типам */
  const bySys = {}, byT = {};
  rows.forEach(r => facOf(r.o.id).forEach(f => {
    const s = f.sys || 'Прочие системы';
    bySys[s] = (bySys[s] || 0) + 1;
    byT[f.t || 'proch'] = (byT[f.t || 'proch'] || 0) + 1;
  }));
  const sysChips = Object.keys(bySys).sort((a, b) => bySys[b] - bySys[a]).map(s => '<span class="dst-chip">' + esc(s) + ' — <b>' + bySys[s] + '</b></span>').join('');
  const tChips = Object.keys(byT).sort((a, b) => byT[b] - byT[a]).map(t => '<span class="dst-chip">' + esc(DST_FT[t] || t) + ' — <b>' + byT[t] + '</b></span>').join('');

  /* центроид для погоды */
  const pts = rows.filter(r => typeof r.o.lat === 'number' && typeof r.o.lon === 'number');
  const clat = pts.reduce((a, r) => a + r.o.lat, 0) / (pts.length || 1);
  const clon = pts.reduce((a, r) => a + r.o.lon, 0) / (pts.length || 1);

  const klassSet = [];
  rows.forEach(r => { const k = r.o.gts && r.o.gts.klass; if (k && klassSet.indexOf(k) < 0) klassSet.push(k); });

  d.innerHTML =
    '<div class="crumbs"><a id="dstHome" title="Снять выбор и вернуться к общей карте">⌂ Карта</a><span class="csep">›</span><span>' + esc(g) + '</span><span class="csep">›</span><span class="cobj">Сводная карточка площадки</span></div>' +
    '<h2>' + esc(info.name) + '<span class="badge b-card" style="background:' + col + '">площадка · ' + rows.length + ' ГТС</span></h2>' +
    '<div class="rayon">Классы ГТС: <b>' + (klassSet.join(', ') || '—') + '</b> · Сооружений в составе ГТС: <b>' + tot.fac + '</b> · Последний замер в базе: <b>' + (tot.last || '—') + '</b></div>' +
    (info.prof ? '<div class="dst-note" style="margin:6px 0 0;max-width:900px">' + esc(info.prof) + '</div>' : '') +

    '<div class="dst-h">Состояние объектов площадки</div>' +
    '<div class="dst-kpis">' +
    '<div class="dst-kpi"><b style="color:' + (SCOL['КРИТИЧНО'] || '#c8372d') + '">' + (stN['КРИТИЧНО'] || 0) + '</b><span>КРИТИЧНО</span></div>' +
    '<div class="dst-kpi"><b style="color:' + (SCOL['РИСК'] || '#e08a00') + '">' + (stN['РИСК'] || 0) + '</b><span>РИСК (превентивные пороги)</span></div>' +
    '<div class="dst-kpi"><b style="color:' + (SCOL['НОРМА'] || '#2e7d32') + '">' + (stN['НОРМА'] || 0) + '</b><span>НОРМА</span></div>' +
    '<div class="dst-kpi"><b>' + (stN[''] || 0) + '</b><span>без оценки (нет рядов)</span></div>' +
    '</div>' +
    (reasons.length ? '<div>' + reasons.slice(0, 6).map(x => '<div class="dst-rsn" data-i="' + x.i + '">' + (x.lvl === 'crit' ? '⛔' : '⚠️') + ' ' + esc(x.txt) + '</div>').join('') + (reasons.length > 6 ? '<div class="dst-note">и ещё ' + (reasons.length - 6) + ' — см. карточки объектов</div>' : '') + '</div>'
      : '<div class="dst-note">Превышений превентивных порогов по объектам площадки не зарегистрировано.</div>') +

    '<div class="dst-h">Мониторинг и контрольно-измерительная аппаратура</div>' +
    '<div style="overflow-x:auto"><table class="dst-tbl"><thead><tr>' +
    '<th>Объект ГТС</th><th>Тип · класс</th><th>Статус</th><th title="Термометрические скважины">Термо</th><th title="Пьезометрические скважины">Пьезо</th><th title="Геодезические ряды/марки">Геод</th><th>Соор.</th><th>Последний замер</th>' +
    '</tr></thead><tbody>' +
    rows.map(r => {
      const st = r.sd.status || '';
      return '<tr class="dst-obj" data-i="' + r.i + '" title="Открыть карточку объекта">' +
        '<td><b>' + esc(r.o.a) + '</b></td>' +
        '<td>' + esc(r.o.gts ? r.o.gts.type : '—') + (r.o.gts && r.o.gts.klass ? ' · ' + esc(r.o.gts.klass) : '') + '</td>' +
        '<td>' + (st ? '<span class="dst-st"><span style="width:9px;height:9px;border-radius:50%;background:' + (SCOL[st] || '#999') + ';display:inline-block"></span>' + st + '</span>' : '<span style="color:var(--mut)">—</span>') + '</td>' +
        '<td>' + (r.c.wells || '—') + '</td><td>' + (r.c.piezo || '—') + (r.c.lake ? ' <span style="color:var(--mut)" title="Плюс ряд уровня водоёма">+ур.</span>' : '') + '</td><td>' + (r.c.geod || '—') + '</td>' +
        '<td>' + r.c.fac + '</td><td>' + (r.c.last || '—') + '</td></tr>';
    }).join('') +
    '<tr class="dst-tot"><td>Итого по площадке</td><td></td><td></td><td>' + tot.wells + '</td><td>' + tot.piezo + '</td><td>' + tot.geod + '</td><td>' + tot.fac + '</td><td>' + (tot.last || '—') + '</td></tr>' +
    '</tbody></table></div>' +
    '<div class="dst-note">Термо — термометрические скважины; Пьезо — пьезометрические скважины (+ур. — дополнительно ведётся ряд уровня водоёма); Геод — геодезические ряды (марки/реперы). Детализация — в карточках объектов: разделы «Термометрия», «Пьезометрия», «Деформации».</div>' +

    '<div class="dst-h">Сооружения по функциональным системам</div>' +
    '<div>' + sysChips + '</div>' +
    '<div style="margin-top:4px">' + tChips + '</div>' +
    (info.func.length ? '<div class="dst-note">Функционал площадки: ' + esc(info.func.join(' · ')) + '.</div>' : '') +

    '<div class="dst-h">Контрольные критерии безопасности (декларации)</div>' +
    '<div style="overflow-x:auto"><table class="dst-tbl"><thead><tr><th>Объект</th><th>Декларация безопасности ГТС</th><th>Критериев К1/К2</th></tr></thead><tbody>' +
    rows.map(r => '<tr class="dst-obj" data-i="' + r.i + '"><td><b>' + esc(r.o.a.split('(')[0].trim()) + '</b></td><td style="font-size:11.6px">' + esc(r.c.decl || '—') + '</td><td>' + (r.c.kk || '—') + '</td></tr>').join('') +
    '</tbody></table></div>' +

    '<div class="dst-h">Документация и наблюдения</div>' +
    '<div class="dst-kpis">' +
    '<div class="dst-kpi"><b>' + tot.docs + '</b><span>документов по ГТС площадки</span></div>' +
    '<div class="dst-kpi"><b>' + tot.acts + '</b><span>актов обследования в общей базе</span></div>' +
    '<div class="dst-kpi"><b>' + tot.kk + '</b><span>критериев К1/К2 под контролем</span></div>' +
    '<div class="dst-kpi"><b>' + (tot.wells + tot.piezo + tot.geod) + '</b><span>точек инструментального контроля</span></div>' +
    '</div>' +

    '<div class="dst-h">Метеоконтроль площадки</div>' +
    '<div class="dst-wx" id="dstWx"><span style="color:var(--mut)">Текущая погода в центре площадки (' + clat.toFixed(3) + ', ' + clon.toFixed(3) + '). </span><button class="btn" id="dstWxGo" style="margin-left:6px">Обновить</button></div>' +
    '<div class="dst-note" style="margin-bottom:14px">Дежурный метеоконтроль с автопредупреждениями — в Центре контроля ГТМ (главное окно). Для площадки «Дудинка» погода запрашивается по её собственным координатам.</div>';

  /* переходы */
  const home = document.getElementById('dstHome');
  if (home) home.onclick = () => {
    document.querySelectorAll('.item,.fitem').forEach(e => e.classList.remove('sel'));
    d.innerHTML = '<div class="empty">Выберите объект на карте или в списке слева</div>';
  };
  d.querySelectorAll('.dst-obj,.dst-rsn').forEach(el => el.addEventListener('click', () => {
    const li = document.getElementById('it' + el.getAttribute('data-i'));
    if (li) li.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
  const wxB = document.getElementById('dstWxGo');
  if (wxB) wxB.onclick = async () => {
    const box = document.getElementById('dstWx');
    box.innerHTML = '<span style="color:var(--mut)">Загружаю погоду площадки…</span>';
    try {
      const w = await dstWxFetch(clat.toFixed(4), clon.toFixed(4));
      box.innerHTML = '<b>' + (w.t != null ? w.t + ' °C' : '—') + '</b> (ощущается ' + (w.feels != null ? w.feels + ' °C' : '—') + '), ' + esc(DST_WMO[w.code] || ('код ' + w.code)) +
        ', ветер ' + (w.wind != null ? w.wind + ' м/с' : '—') + ' ' + esc(w.wdir || '') +
        (w.os ? ', осадки ' + w.os + ' мм' : '') +
        (w.hum != null ? ', влажность ' + w.hum + ' %' : '') +
        (w.obl != null ? ', облачность ' + w.obl + ' %' : '') +
        (w.snow ? ', снежный покров ' + w.snow + ' см' : '') +
        ' <span style="color:var(--mut);font-size:11px">· Open-Meteo, сейчас</span> ' +
        '<button class="btn" id="dstWxGo2" style="margin-left:6px">Обновить</button>';
      const b2 = document.getElementById('dstWxGo2');
      if (b2) b2.onclick = () => wxB.onclick();
    } catch (e) {
      box.innerHTML = '<span style="color:var(--crit)">Погода временно недоступна (нет связи с метеосервисом).</span> <button class="btn" id="dstWxGo3" style="margin-left:6px">Повторить</button>';
      const b3 = document.getElementById('dstWxGo3');
      if (b3) b3.onclick = () => wxB.onclick();
    }
  };
  d.scrollIntoView({ block: 'start' });
}
