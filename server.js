// PIRLS Tarbiya 4-sinf: o'quvchilar va o'qituvchi paneli (tashqi kutubxonasiz, Node 18+)
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const PORT = process.env.PORT || 3000;
const TEACHER_PIN = process.env.TEACHER_PIN || '1234';
const DB = path.join(__dirname, 'data', 'db.json');
const Q = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'questions.json'), 'utf8'));
let db = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, 'utf8')) : { students: {} };
let dirty = false;
setInterval(() => { if (dirty) { fs.writeFileSync(DB, JSON.stringify(db)); dirty = false; } }, 2000);

// to'g'ri javoblar faqat serverda saqlanadi, o'quvchiga javob berilgandan keyin yuboriladi
const items = {};
Q.topics.forEach(t => t.items.forEach(i => items[t.id + ':' + i.id] = i));
const publicQ = { sections: Q.sections, topics: Q.topics.map(t => ({ ...t, items: t.items.map(({ correct, answer, ...r }) => r) })) };

const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => { let b = ''; req.on('data', c => { b += c; if (b.length > 1e6) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch { r({}); } }); });
const score = s => Object.values(s.answers).filter(a => a.correct === true).length;

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (req.method === 'GET' && u.pathname === '/api/questions') return send(res, 200, publicQ);

  if (req.method === 'POST' && u.pathname === '/api/join') {
    const { name } = await body(req);
    const n = String(name || '').trim().slice(0, 40);
    if (!n) return send(res, 400, { error: 'Ism kiriting' });
    const id = n.toLowerCase().replace(/\s+/g, ' ');
    const s = db.students[id] ||= { id, name: n, started: Date.now(), topic: 1, answers: {} };
    s.seen = Date.now(); dirty = true;
    const mine = {};
    for (const [k, a] of Object.entries(s.answers)) mine[k] = { value: a.value, correct: a.correct, ref: a.type === 'mcq' ? items[k].correct : items[k].answer };
    return send(res, 200, { id, name: s.name, topic: s.topic, answers: mine });
  }

  if (req.method === 'POST' && u.pathname === '/api/pos') {
    const { id, topic } = await body(req); const s = db.students[id];
    if (!s) return send(res, 404, {});
    s.topic = +topic || 1; s.seen = Date.now(); dirty = true; return send(res, 200, {});
  }

  if (req.method === 'POST' && u.pathname === '/api/answer') {
    const { id, topic, qid, value } = await body(req); const s = db.students[id], it = items[topic + ':' + qid];
    if (!s || !it) return send(res, 404, {});
    const k = topic + ':' + qid;
    if (s.answers[k]) return send(res, 200, { value: s.answers[k].value, correct: s.answers[k].correct, ref: it.type === 'mcq' ? it.correct : it.answer });
    const a = { type: it.type, value: String(value).slice(0, 2000), at: Date.now() };
    if (it.type === 'mcq') a.correct = +value === it.correct;
    s.answers[k] = a; s.topic = +topic; s.seen = Date.now(); dirty = true;
    return send(res, 200, { correct: a.correct, ref: it.type === 'mcq' ? it.correct : it.answer });
  }

  if (u.pathname.startsWith('/api/teacher')) {
    if (req.headers['x-pin'] !== TEACHER_PIN) return send(res, 401, { error: 'PIN noto\'g\'ri' });
    if (req.method === 'GET' && u.pathname === '/api/teacher/students') {
      const list = Object.values(db.students).map(s => ({
        id: s.id, name: s.name, topic: s.topic, seen: s.seen, correct: score(s),
        mcqDone: Object.values(s.answers).filter(a => a.type === 'mcq').length,
        openDone: Object.values(s.answers).filter(a => a.type !== 'mcq').length,
        topics: Object.keys(s.answers).filter(k => s.answers[k].type === 'mcq').map(k => [+k.split(':')[0], s.answers[k].correct])
      }));
      return send(res, 200, { now: Date.now(), students: list });
    }
    if (req.method === 'GET' && u.pathname === '/api/teacher/student') {
      const s = db.students[u.searchParams.get('id')]; if (!s) return send(res, 404, {});
      return send(res, 200, s);
    }
    if (req.method === 'POST' && u.pathname === '/api/teacher/reset') {
      const { id } = await body(req); if (id === '*') db.students = {}; else delete db.students[id];
      dirty = true; return send(res, 200, {});
    }
  }

  // statik fayllar
  const f = path.join(__dirname, 'public', u.pathname === '/' ? 'index.html' : u.pathname.replace(/\.\./g, ''));
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Topilmadi'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(d);
  });
}).listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log('\nO\'quvchilar uchun manzil:');
  ips.forEach(ip => console.log(`   http://${ip}:${PORT}`));
  console.log(`O'qituvchi paneli:  http://localhost:${PORT}/#teacher  (PIN: ${TEACHER_PIN})\n`);
});
