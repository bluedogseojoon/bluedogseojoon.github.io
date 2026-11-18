/* ============================================================
   블루독 월간 예약 스케줄 – 서버 연결
   ✏️ 여기만 바꾸면 돼요: 구글 Apps Script 배포 주소를 "" 안에 붙여넣기
   비워두면 '미리보기 모드'로 동작해요. (이 기기 안에만 임시 저장, 진짜 예약 아님)
   ============================================================ */
var SCHEDULE_API_URL = "https://script.google.com/macros/s/AKfycbwzMlXbFhZvp-crgYSxRqh-rmUM4huN1QAJToJE8SoybPo1J7dwHN5KmIP-BKrgfwnw6g/exec";

/* ---------- 아래는 손대지 않아도 돼요 ---------- */
var SCHED = (function () {
  var DEMO = !SCHEDULE_API_URL;
  var SLOTS = [
    { key: 's1', label: '오전 9~12시', start: '09:00', end: '12:00' },
    { key: 's2', label: '낮 12~3시', start: '12:00', end: '15:00' },
    { key: 's3', label: '오후 3~6시', start: '15:00', end: '18:00' },
    { key: 's4', label: '저녁 6~9시', start: '18:00', end: '21:00' },
  ];
  var pad = function (n) { return String(n).padStart(2, '0'); };

  function addMonths(ym, n) {
    var p = ym.split('-').map(Number), y = p[0], m = p[1] + n;
    while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; }
    return y + '-' + pad(m);
  }

  /* ---- 미리보기용 가짜 서버: 이 브라우저(localStorage)에만 저장 ---- */
  var KEY = 'bluedog-schedule-demo';
  function load() {
    var db = null;
    try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) {}
    if (db) return db;
    db = { sched: {}, books: [] };
    var t = new Date();
    for (var i = 0; i < 45; i++) {
      var d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
      if (d.getDay() === 1) continue; // 예시: 월요일 휴무
      var date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      db.sched[date] = {};
      SLOTS.forEach(function (s, j) {
        if (j === 3 && d.getDay() === 0) return;
        db.sched[date][s.key] = { cap: j === 2 ? 4 : 1, memo: j === 2 ? '북항 풀 트레이닝' : '' };
      });
      if (i % 3 === 1) db.books.push({ id: 'd' + i + 'a', date: date, slot: 's1', name: '예시회원', phone: '010-0000-0000', req: '', at: '' });
      if (i % 4 === 2) db.books.push({ id: 'd' + i + 'b', date: date, slot: 's3', name: '예시회원', phone: '010-0000-0001', req: '', at: '' });
      if (i % 5 === 0) db.books.push({ id: 'd' + i + 'c', date: date, slot: 's2', name: '예시회원', phone: '010-0000-0002', req: '', at: '' });
    }
    save(db); return db;
  }
  function save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) {} }
  function nowInfo() {
    var d = new Date();
    return { today: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
             time: pad(d.getHours()) + ':' + pad(d.getMinutes()),
             month: d.getFullYear() + '-' + pad(d.getMonth() + 1) };
  }
  function view(db, month, withPeople) {
    var n = nowInfo(), days = {};
    function cell(date, key) { days[date] = days[date] || {}; return days[date][key] = days[date][key] || { open: false, cap: 0, booked: 0, memo: '' }; }
    Object.keys(db.sched).forEach(function (date) {
      if (date.slice(0, 7) !== month) return;
      Object.keys(db.sched[date]).forEach(function (k) { var c = cell(date, k), s = db.sched[date][k]; c.open = true; c.cap = s.cap; c.memo = s.memo; });
    });
    var books = db.books.filter(function (b) { return b.date.slice(0, 7) === month; });
    books.forEach(function (b) { cell(b.date, b.slot).booked++; });
    var out = { ok: true, month: month, today: n.today, time: n.time, thisMonth: n.month, lastMonth: addMonths(n.month, 3), slots: SLOTS, days: days };
    if (withPeople) out.bookings = books;
    return out;
  }
  function demo(p) {
    var db = load(), n = nowInfo();
    if (!p.month) p.month = n.month;
    if (p.action === 'get') return view(db, p.month, false);
    if (p.action === 'book' || p.action === 'admin_book') {
      var admin = p.action === 'admin_book';
      var s = db.sched[p.date] && db.sched[p.date][p.slot];
      var slot = SLOTS.filter(function (x) { return x.key === p.slot; })[0];
      var same = db.books.filter(function (b) { return b.date === p.date && b.slot === p.slot; });
      if (!admin && (p.date < n.today || (p.date === n.today && slot.start <= n.time))) return { ok: false, message: '이미 지난 시간이에요.' };
      if (!admin && !s) return { ok: false, message: '예약을 받지 않는 시간이에요.' };
      var ph = String(p.phone || '').replace(/\D/g, '');
      if (ph ? same.some(function (b) { return b.phone.replace(/\D/g, '') === ph; }) : same.some(function (b) { return b.name === p.name; })) return { ok: false, message: '이미 이 시간에 예약하셨어요.' };
      if (!admin && same.length >= s.cap) return { ok: false, message: '방금 예약이 꽉 찼어요.' };
      db.books.push({ id: 'x' + Date.now(), date: p.date, slot: p.slot, name: p.name, phone: p.phone || '', req: (admin ? '[강사 입력] ' : '') + (p.req || ''), at: n.today + ' ' + n.time });
      save(db);
      return admin ? view(db, p.month, true) : { ok: true };
    }
    if (p.action.indexOf('admin_') === 0 && p.pw !== '1234') return { ok: false, code: 'bad_password', message: '비밀번호가 맞지 않아요. (미리보기 비밀번호: 1234)' };
    if (p.action === 'admin_month') return view(db, p.month, true);
    if (p.action === 'admin_cancel') { db.books = db.books.filter(function (b) { return b.id !== p.id; }); save(db); return view(db, p.month, true); }
    if (p.action === 'admin_save') {
      (p.changes || []).forEach(function (c) {
        if (c.open) { db.sched[c.date] = db.sched[c.date] || {}; db.sched[c.date][c.slot] = { cap: Math.max(1, +c.cap || 1), memo: c.memo || '' }; }
        else if (db.sched[c.date]) delete db.sched[c.date][c.slot];
      });
      save(db); return view(db, p.month, true);
    }
    return { ok: false, message: '알 수 없는 요청' };
  }

  /* ---- 진짜 서버 / 미리보기 공통 호출 ---- */
  function get(month) {
    if (DEMO) return new Promise(function (r) { setTimeout(function () { r(demo({ action: 'get', month: month })); }, 250); });
    return fetch(SCHEDULE_API_URL + '?month=' + encodeURIComponent(month)).then(function (r) { return r.json(); });
  }
  function post(body) {
    if (DEMO) return new Promise(function (r) { setTimeout(function () { r(demo(body)); }, 400); });
    return fetch(SCHEDULE_API_URL, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  }

  return { DEMO: DEMO, SLOTS: SLOTS, get: get, post: post, addMonths: addMonths };
})();
