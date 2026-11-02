/* Ndihmës të përbashkët dhe përmbajtja e Klasës 1: Matematikë, Gjuhë shqipe, Njeriu dhe natyra */
(function () {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const numOpts = (ans, min, max, n = 3) => {
    const s = new Set([ans]);
    let guard = 0;
    while (s.size < n && guard++ < 100) { const v = ans + pick([-3, -2, -1, 1, 2, 3]); if (v >= min && v <= max) s.add(v); }
    while (s.size < n) s.add(s.size + max + 1);
    return shuffle([...s].map(String));
  };
  const optsWith = (ans, pool, n = 3) => shuffle([ans, ...sample(pool.filter((x) => x !== ans), n - 1)]);
  const many = (e, n) => `<div class="count-grid">${Array.from({ length: n }, () => `<span>${e}</span>`).join("")}</div>`;
  const bigPic = (e) => `<div class="big-pic">${e}</div>`;
  const repeat = (n, gen) => { const out = []; const seen = new Set(); let g = 0; while (out.length < n && g++ < 200) { const q = gen(); const k = q.q + "|" + q.ans + "|" + (q.pic || ""); if (!seen.has(k)) { seen.add(k); out.push(q); } } return out; };
  const fromBank = (bank, n) => sample(bank, n).map((b) => Object.assign({}, b, { opts: shuffle(b.opts) }));
  /* pyetje nga tabela [çelës, vlerë]: distraktorët janë vlera të tjera, kurrë e njëjta vlerë */
  const tableQ = (pairs, qf, n = 6, extra) => repeat(n, () => {
    const [k, v] = pick(pairs);
    const others = [...new Set(pairs.map((p) => p[1]).filter((x) => x !== v))];
    const q = Object.assign({ q: qf(k), ans: v, opts: shuffle([v, ...sample(others, 2)]) }, extra ? extra(k, v) : {});
    return q;
  });
  /* pyetje e kundërt: vlera -> çelësi (vetëm kur çdo çelës ka vlerë të ndryshme) */
  const tableRev = (pairs, qf, n = 6, extra) => repeat(n, () => {
    const [k, v] = pick(pairs);
    const others = pairs.filter((p) => p[1] !== v && p[0] !== k).map((p) => p[0]);
    return Object.assign({ q: qf(v), ans: k, opts: shuffle([k, ...sample([...new Set(others)], 2)]) }, extra ? extra(k, v) : {});
  });
  /* klasifikim: grupet {kategoria: [elemente]} */
  const classQ = (groups, mode, n = 6, qtxt) => repeat(n, () => {
    const cats = Object.keys(groups); const c = pick(cats);
    if (mode === "which") {
      const item = pick(groups[c]);
      const others = cats.filter((x) => x !== c).flatMap((x) => groups[x]);
      return { q: qtxt ? qtxt(c) : `Cila është ${c}?`, ans: item, opts: shuffle([item, ...sample(others, 2)]) };
    }
    const item = pick(groups[c]);
    return { q: qtxt ? qtxt(item) : `Ku bën pjesë: ${item}?`, ans: c, opts: cats.length <= 4 ? shuffle(cats) : shuffle([c, ...sample(cats.filter((x) => x !== c), 3)]) };
  });
  /* bankë: [pyetja, saktë, gabim1, gabim2, ...] */
  const bankQ = (rows, n = 6, hint) => sample(rows, Math.min(n, rows.length)).map((r) => ({ q: r[0], ans: r[1], opts: shuffle(r.slice(1)), hint: hint }));
  const L = (t, gen) => ({ t, gen });
  const mix = (levels, n = 8) => () => shuffle(levels.map((l) => l.gen()[0]).filter(Boolean)).slice(0, n);
  const AREA_STYLE = {
    mat: ["Matematikë", "Kalaja e Prizrenit", "🏰", "#ff8a3d", "Bufi i Urtë", "🦉"],
    shq: ["Gjuhë shqipe", "Lugina e Rugovës", "🏞️", "#4c9aff", "Ariu i Rugovës", "🐻"],
    nat: ["Njeriu dhe natyra", "Malet e Sharrit", "🏔️", "#36b37e", "Rrëqebulli i Sharrit", "🐆"],
    sho: ["Shoqëria dhe mjedisi", "Ulpiana", "🏛️", "#a368fc", "Dhelpra e Ulpianës", "🦊"],
    ang: ["Gjuhë angleze", "Ura e Terzive", "🌉", "#ff5d8f", "Kunadhja e Urës", "🦡"],
    bio: ["Biologji", "Ujëvarat e Mirushës", "💧", "#2bb3a3", "Gjarpri i Mirushës", "🐍"],
    fiz: ["Fizikë", "Ujëvara e Drinit të Bardhë", "⚡", "#f2b705", "Shqiponja e Drinit", "🦅"],
    kim: ["Kimi", "Shpella e Gadimes", "🧪", "#7a5af8", "Lakuriqi i Shpellës", "🦇"],
    his: ["Histori", "Kalaja e Novobërdës", "📜", "#c2410c", "Kalorësi i Kalasë", "🐴"],
    gjeo: ["Gjeografi", "Maja e Gjeravicës", "🗺️", "#0ea5e9", "Dhia e Malit", "🐐"],
    tik: ["TIK", "Kulla Dixhitale", "💻", "#475569", "Roboti i Kullës", "🤖"],
  };
  const area = (id, levels) => { const [name, place, emoji, color, boss, bossEmoji] = AREA_STYLE[id]; return { id, name, place, emoji, color, boss, bossEmoji, levels, challenge: mix(levels, 8) }; };
  const fmt = (x) => String(Math.round(x * 1000) / 1000).replace(".", ",");
  window.QH = { R, shuffle, pick, sample, numOpts, optsWith, many, bigPic, repeat, fromBank, tableQ, tableRev, classQ, bankQ, L, mix, area, fmt };
  window.GRADES = window.GRADES || {};

  const THINGS = ["🍎", "⭐", "🎈", "🐟", "🌸", "🍌", "⚽", "🐥", "🍓", "🚗"];

  const SHAPES = {
    "rreth": '<svg viewBox="0 0 100 100" class="shape"><circle cx="50" cy="50" r="40" fill="#ff7a59"/></svg>',
    "katror": '<svg viewBox="0 0 100 100" class="shape"><rect x="12" y="12" width="76" height="76" rx="4" fill="#4c9aff"/></svg>',
    "trekëndësh": '<svg viewBox="0 0 100 100" class="shape"><polygon points="50,8 94,90 6,90" fill="#36b37e"/></svg>',
    "drejtkëndësh": '<svg viewBox="0 0 100 100" class="shape"><rect x="5" y="25" width="90" height="50" rx="4" fill="#a368fc"/></svg>',
  };
  const SHAPE_LIST = Object.keys(SHAPES);

  /* ---------- MATEMATIKË ---------- */
  const mat = [
    { t: "Numërojmë deri në 5", gen: () => repeat(6, () => { const n = R(1, 5), e = pick(THINGS); return { q: "Sa janë?", pic: many(e, n), opts: numOpts(n, 1, 6), ans: String(n), hint: "Prek me gisht secilin dhe numëro: një, dy, tre…" }; }) },
    { t: "Numërojmë deri në 10", gen: () => repeat(6, () => { const n = R(5, 10), e = pick(THINGS); return { q: "Sa janë?", pic: many(e, n), opts: numOpts(n, 1, 12), ans: String(n), hint: "Numëro ngadalë, rresht pas rreshti." }; }) },
    { t: "Më shumë apo më pak", gen: () => repeat(6, () => {
        const a = R(1, 10); let b = R(1, 10); while (b === a) b = R(1, 10);
        if (Math.random() < 0.5) { const e = pick(THINGS); return { q: "Ku ka më shumë?", pic: `<div class="compare"><div class="side">${many(e, a)}<b>A</b></div><div class="side">${many(e, b)}<b>B</b></div></div>`, opts: ["A", "B"], ans: a > b ? "A" : "B", hint: "Numëro të dy grupet dhe krahasoji." }; }
        const c = Math.random() < 0.2 ? a : b;
        return { q: `Cila shenjë shkon? ${a} ☐ ${c}`, say: `Cila shenjë shkon mes ${a} dhe ${c}?`, opts: ["<", "=", ">"], ans: a < c ? "<" : a > c ? ">" : "=", hint: "Goja e krokodilit hapet nga numri më i madh." };
      }) },
    { t: "Mbledhja deri në 5", gen: () => repeat(6, () => { const a = R(0, 4), b = R(1, 5 - a), e = pick(THINGS); return { q: `${a} + ${b} = ?`, say: `${a} plus ${b} sa bëjnë?`, pic: `<div class="sum">${many(e, a)}<b>+</b>${many(e, b)}</div>`, opts: numOpts(a + b, 0, 6), ans: String(a + b), hint: "Numëro të gjitha figurat bashkë." }; }) },
    { t: "Mbledhja deri në 10", gen: () => repeat(6, () => { const a = R(1, 8), b = R(1, 10 - a); return { q: `${a} + ${b} = ?`, say: `${a} plus ${b} sa bëjnë?`, opts: numOpts(a + b, 0, 11), ans: String(a + b), hint: `Fillo nga ${Math.max(a, b)} dhe numëro përpara ${Math.min(a, b)} hapa.` }; }) },
    { t: "Zbritja deri në 10", gen: () => repeat(6, () => { const a = R(2, 10), b = R(1, a); return { q: `${a} − ${b} = ?`, say: `${a} minus ${b} sa bëjnë?`, pic: `<div class="count-grid">${Array.from({ length: a }, (_, i) => `<span class="${i >= a - b ? "gone" : ""}">🍎</span>`).join("")}</div>`, opts: numOpts(a - b, 0, 10), ans: String(a - b), hint: "Molla e zbehtë është ngrënë. Numëro ato që mbeten." }; }) },
    { t: "Format gjeometrike", gen: () => repeat(6, () => {
        if (Math.random() < 0.6) { const s = pick(SHAPE_LIST); return { q: "Si quhet kjo formë?", pic: SHAPES[s], opts: optsWith(s, SHAPE_LIST, 3), ans: s, hint: "Numëro brinjët e saj. Rrethi nuk ka asnjë kënd." }; }
        const [qq, ans] = pick([["Sa brinjë ka trekëndëshi?", "3"], ["Sa brinjë ka katrori?", "4"], ["Sa kënde ka drejtkëndëshi?", "4"], ["Sa kënde ka rrethi?", "0"]]);
        return { q: qq, opts: optsWith(ans, ["0", "3", "4", "5"], 3), ans, hint: "Shiko formën në mendje dhe numëro." };
      }) },
    { t: "Numrat deri në 20", gen: () => repeat(6, () => {
        const kind = R(0, 2);
        if (kind === 0) { const n = R(10, 19); return { q: `Cili numër vjen pas ${n}?`, opts: numOpts(n + 1, 9, 21), ans: String(n + 1), hint: "Shto një." }; }
        if (kind === 1) { const n = R(11, 20); return { q: `Cili numër vjen para ${n}?`, opts: numOpts(n - 1, 9, 20), ans: String(n - 1), hint: "Hiq një." }; }
        const u = R(1, 9); return { q: "Një dhjetëshe dhe njëshet: sa bëjnë?", say: `Një dhjetëshe dhe ${u} njëshe, sa bëjnë?`, pic: `<div class="tens"><span class="ten">🔟</span>${"🟡".repeat(u)}</div>`, opts: numOpts(10 + u, 10, 20), ans: String(10 + u), hint: "Dhjetë dhe njëshet bashkë." };
      }) },
    { t: "Mbledhja deri në 20", gen: () => repeat(7, () => { const a = R(3, 12), b = R(2, 20 - a); return { q: `${a} + ${b} = ?`, say: `${a} plus ${b} sa bëjnë?`, opts: numOpts(a + b, 0, 21), ans: String(a + b), hint: a + b > 10 && a < 10 ? `Plotëso dhjetën: ${a} + ${10 - a} = 10, pastaj shto edhe ${b - (10 - a)}.` : "Fillo nga numri më i madh dhe numëro përpara." }; }) },
    { t: "Zbritja deri në 20", gen: () => repeat(7, () => { const a = R(11, 20), b = R(1, a - 1); return { q: `${a} − ${b} = ?`, say: `${a} minus ${b} sa bëjnë?`, opts: numOpts(a - b, 0, 20), ans: String(a - b), hint: `Numëro mbrapa nga ${a}, ${b} hapa.` }; }) },
  ];

  /* ---------- GJUHË SHQIPE ---------- */
  const W = {
    ari: "🐻", elefant: "🐘", iriq: "🦔", orë: "⏰", ujë: "💧", yll: "⭐", ylber: "🌈", ujk: "🐺",
    mollë: "🍎", mace: "🐱", mi: "🐭", lule: "🌸", luan: "🦁", libër: "📖", top: "⚽", tortë: "🎂",
    dardhë: "🍐", diell: "☀️", dele: "🐑", peshk: "🐟", pulë: "🐔", pemë: "🌳", kalë: "🐴", karotë: "🥕",
    bletë: "🐝", banane: "🍌", breshkë: "🐢", rosë: "🦆", zog: "🐦", zemër: "❤️", qen: "🐶", qershi: "🍒",
    fluturë: "🦋", hënë: "🌙", hundë: "👃", vezë: "🥚", sy: "👁️", supë: "🍲", gotë: "🥛", çantë: "🎒", çokollatë: "🍫",
    shtëpi: "🏠", shi: "🌧️", shqiponjë: "🦅", gjarpër: "🐍", gjethe: "🍃", dhi: "🐐", dhëmb: "🦷", dhuratë: "🎁",
    xhaketë: "🧥", llambë: "💡", zhabë: "🐸", njeri: "🧍", rrush: "🍇",
  };
  const firstLetter = (w) => { const di = ["dh", "gj", "ll", "nj", "rr", "sh", "th", "xh", "zh"]; const two = w.slice(0, 2); return (di.includes(two) ? two : w[0]).toUpperCase(); };
  const capFirst = (s) => s.length === 2 ? s[0] + s[1].toLowerCase() : s;
  const letterQ = (words, pool) => repeat(6, () => { const w = pick(words); const L = firstLetter(w); return { q: "Me cilën shkronjë fillon fjala?", say: `Me cilën shkronjë fillon fjala ${w}?`, pic: bigPic(W[w]), opts: optsWith(capFirst(L), pool.map(capFirst), 3), ans: capFirst(L), hint: `Thuaje fjalën me zë: ${w}. Cili tingull dëgjohet i pari?` }; });
  const ALPHA = ["A", "B", "C", "Ç", "D", "Dh", "E", "Ë", "F", "G", "Gj", "H", "I", "J", "K", "L", "Ll", "M", "N", "Nj", "O", "P", "Q", "R", "Rr", "S", "Sh", "T", "Th", "U", "V", "X", "Xh", "Y", "Z", "Zh"];
  const SYL = [["top", 1], ["qen", 1], ["zog", 1], ["yll", 1], ["shi", 1], ["mi", 1], ["ma-ce", 2], ["lu-le", 2], ["pe-më", 2], ["ve-zë", 2], ["ro-së", 2], ["hë-në", 2], ["ze-mër", 2], ["li-bër", 2], ["çan-të", 2], ["shtë-pi", 2], ["ba-na-ne", 3], ["ka-ro-të", 3], ["flu-tu-rë", 3], ["dhu-ra-të", 3], ["e-le-fant", 3], ["ço-ko-lla-të", 4]];
  const MISSING = [["M_CE", "A", "mace"], ["L_LE", "U", "lule"], ["T_P", "O", "top"], ["Q_N", "E", "qen"], ["Z_G", "O", "zog"], ["H_NË", "Ë", "hënë"], ["V_ZË", "E", "vezë"], ["PEM_", "Ë", "pemë"], ["ÇANT_", "Ë", "çantë"], ["_ANTË", "Ç", "çantë"], ["DARDH_", "Ë", "dardhë"], ["B_ETË", "L", "bletë"], ["R_SË", "O", "rosë"], ["_ULË", "P", "pulë"], ["PESH_", "K", "peshk"]];

  const shq = [
    { t: "Zanoret", gen: () => letterQ(["ari", "elefant", "iriq", "orë", "ujë", "yll", "ylber", "ujk"], ["A", "E", "I", "O", "U", "Y", "Ë"]) },
    { t: "Shkronjat M, L, T, D, P", gen: () => letterQ(["mollë", "mace", "mi", "lule", "luan", "libër", "top", "tortë", "dardhë", "diell", "dele", "peshk", "pulë", "pemë"], ["M", "L", "T", "D", "P", "N", "B"]) },
    { t: "Shkronjat K, B, R, Z, Q", gen: () => letterQ(["kalë", "karotë", "bletë", "banane", "breshkë", "rosë", "zog", "zemër", "qen", "qershi"], ["K", "B", "R", "Z", "Q", "G", "Ç"]) },
    { t: "Shkronjat F, H, V, S, G, Ç", gen: () => letterQ(["fluturë", "hënë", "hundë", "vezë", "sy", "supë", "gotë", "çantë", "çokollatë"], ["F", "H", "V", "S", "G", "Ç", "C"]) },
    { t: "Shkronjat dyshe", gen: () => letterQ(["shtëpi", "shi", "shqiponjë", "gjarpër", "gjethe", "dhi", "dhëmb", "dhuratë", "xhaketë", "llambë", "zhabë", "njeri", "rrush"], ["SH", "GJ", "DH", "XH", "LL", "ZH", "NJ", "RR", "S", "D", "L"]) },
    { t: "Fotoja dhe fjala", gen: () => repeat(6, () => { const keys = Object.keys(W); const w = pick(keys); return { q: "Cila fjalë është kjo?", pic: bigPic(W[w]), opts: optsWith(w, keys, 3).map((x) => x.toUpperCase()), ans: w.toUpperCase(), hint: "Thuaje emrin e figurës dhe kërko shkronjën e parë." }; }) },
    { t: "Fjala dhe fotoja", gen: () => repeat(6, () => { const keys = Object.keys(W); const w = pick(keys); const others = sample(keys.filter((k) => k !== w), 2); return { q: `Gjej: ${w.toUpperCase()}`, say: `Gjej fotografinë: ${w}`, opts: shuffle([W[w], ...others.map((k) => W[k])]), ans: W[w], big: true, hint: `Fjala fillon me shkronjën ${capFirst(firstLetter(w))}.` }; }) },
    { t: "Rrokjet", gen: () => fromBank(SYL.map(([s, n]) => ({ q: `Sa rrokje ka fjala ${s.replace(/-/g, "").toUpperCase()}?`, say: `Sa rrokje ka fjala ${s.replace(/-/g, " ")}?`, pic: W[s.replace(/-/g, "")] ? bigPic(W[s.replace(/-/g, "")]) : "", opts: ["1", "2", "3", "4"], ans: String(n), hint: `Duartrokit: ${s.toUpperCase()}` })), 6) },
    { t: "Shkronja që mungon", gen: () => fromBank(MISSING.map(([w, a, full]) => ({ q: `Plotëso fjalën: ${w.replace("_", " _ ")}`, say: `Cila shkronjë mungon te fjala ${full}?`, pic: W[full] ? bigPic(W[full]) : "", opts: optsWith(a, ["A", "E", "Ë", "I", "O", "U", "Ç", "C", "L", "P", "K"], 4), ans: a, hint: `Fjala është: ${full}.` })), 7) },
    { t: "Alfabeti", gen: () => repeat(7, () => { const i = R(0, ALPHA.length - 2); return { q: `Cila shkronjë vjen pas ${ALPHA[i]}?`, say: `Në alfabet, cila shkronjë vjen pas ${ALPHA[i]}?`, opts: optsWith(ALPHA[i + 1], ALPHA, 3), ans: ALPHA[i + 1], hint: `Alfabeti: ${ALPHA.slice(Math.max(0, i - 2), i + 1).join(", ")}, …` }; }) },
  ];

  /* ---------- NJERIU DHE NATYRA ---------- */
  const N = (q, ans, opts, extra = {}) => Object.assign({ q, ans, opts }, extra);
  const nat = [
    { t: "Kafshët shtëpiake dhe të egra", gen: () => fromBank([
      N("Cila është kafshë e egër?", "🐺", ["🐺", "🐶", "🐱"], { big: true, hint: "Ujku jeton në pyll." }),
      N("Cila është kafshë e egër?", "🦁", ["🦁", "🐄", "🐑"], { big: true, hint: "Luani nuk jeton në shtëpi." }),
      N("Cila është kafshë shtëpiake?", "🐄", ["🐄", "🐻", "🦊"], { big: true, hint: "Lopa jeton në fermë." }),
      N("Cila është kafshë shtëpiake?", "🐔", ["🐔", "🐍", "🦔"], { big: true, hint: "Pula jeton në oborr." }),
      N("Cila është kafshë e egër?", "🦊", ["🦊", "🐴", "🐐"], { big: true, hint: "Dhelpra jeton në pyll." }),
      N("Cila është kafshë shtëpiake?", "🐑", ["🐑", "🐺", "🐻"], { big: true, hint: "Delja jep lesh." }),
      N("Cila është kafshë e egër?", "🐻", ["🐻", "🐶", "🐔"], { big: true, hint: "Ariu jeton në male, si në Rugovë." }),
    ], 6) },
    { t: "Ku jetojnë kafshët", gen: () => fromBank([
      N("Ku jeton peshku?", "Në ujë", ["Në ujë", "Në pemë", "Në shpellë"], { pic: bigPic("🐟"), hint: "Peshku noton." }),
      N("Ku e bën zogu folenë?", "Në pemë", ["Në pemë", "Në ujë", "Nën tokë"], { pic: bigPic("🐦"), hint: "Zogu fluturon lart." }),
      N("Ku jeton bleta?", "Në koshere", ["Në koshere", "Në det", "Në fole"], { pic: bigPic("🐝"), hint: "Bleta bën mjaltë në koshere." }),
      N("Ku jeton qeni?", "Në shtëpi ose oborr", ["Në shtëpi ose oborr", "Në det", "Në pyll"], { pic: bigPic("🐶"), hint: "Qeni është kafshë shtëpiake." }),
      N("Ku dimëron ariu?", "Në strofull", ["Në strofull", "Në fole", "Në ujë"], { pic: bigPic("🐻"), hint: "Ariu fle gjatë dimrit." }),
      N("Ku jeton lopa?", "Në stallë", ["Në stallë", "Në koshere", "Në pemë"], { pic: bigPic("🐄"), hint: "Lopa jeton në fermë." }),
      N("Ku jeton bretkosa?", "Afër ujit", ["Afër ujit", "Në shkretëtirë", "Në fole"], { pic: bigPic("🐸"), hint: "Bretkosa kërcen në liqen." }),
    ], 6) },
    { t: "Çka na japin kafshët", gen: () => fromBank([
      N("Çka na jep lopa?", "🥛", ["🥛", "🥚", "🍯"], { big: true, pic: bigPic("🐄"), hint: "Me të bëjmë djathë." }),
      N("Çka na jep pula?", "🥚", ["🥚", "🥛", "🧶"], { big: true, pic: bigPic("🐔"), hint: "E hamë në mëngjes." }),
      N("Çka na jep bleta?", "🍯", ["🍯", "🥚", "🥛"], { big: true, pic: bigPic("🐝"), hint: "Është e ëmbël." }),
      N("Çka na jep delja?", "🧶", ["🧶", "🍯", "🥚"], { big: true, pic: bigPic("🐑"), hint: "Me të thurim çorape." }),
      N("Cila kafshë na jep vezë?", "🐔", ["🐔", "🐄", "🐶"], { big: true, hint: "Ajo bën: kot-kot!" }),
      N("Cila kafshë na jep mjaltë?", "🐝", ["🐝", "🐑", "🐱"], { big: true, hint: "Fluturon nga lulja në lule." }),
    ], 6) },
    { t: "Pjesët e bimës", gen: () => fromBank([
      N("Cila pjesë e bimës është nën tokë?", "Rrënja", ["Rrënja", "Gjethja", "Lulja"], { pic: bigPic("🌱"), hint: "Ajo thith ujin nga toka." }),
      N("Cila pjesë e bimës është zakonisht e gjelbër dhe e sheshtë?", "Gjethja", ["Gjethja", "Rrënja", "Fara"], { pic: bigPic("🍃"), hint: "Në vjeshtë ajo bie." }),
      N("Çka i duhet bimës për t'u rritur?", "Ujë dhe dritë", ["Ujë dhe dritë", "Vetëm errësirë", "Lodra"], { pic: bigPic("🌻"), hint: "Bima pi ujë dhe do diell." }),
      N("Nga çka rritet një bimë e re?", "Nga fara", ["Nga fara", "Nga guri", "Nga gota"], { pic: bigPic("🌰"), hint: "E mbjellim në tokë." }),
      N("Cila pjesë e mban bimën drejt?", "Kërcelli", ["Kërcelli", "Lulja", "Gjethja"], { pic: bigPic("🌷"), hint: "Është si një shtyllë." }),
      N("Cila është pemë?", "🌳", ["🌳", "🌸", "🍄"], { big: true, hint: "Ka trung të trashë." }),
    ], 6) },
    { t: "Frutat dhe perimet", gen: () => fromBank([
      N("Cila është frutë?", "🍎", ["🍎", "🥕", "🥔"], { big: true, hint: "Rritet në pemë dhe është e ëmbël." }),
      N("Cila është perime?", "🥕", ["🥕", "🍌", "🍒"], { big: true, hint: "Rritet nën tokë, e portokalltë." }),
      N("Cila është frutë?", "🍓", ["🍓", "🥦", "🧅"], { big: true, hint: "Është e kuqe dhe e vogël." }),
      N("Cila është perime?", "🥦", ["🥦", "🍐", "🍇"], { big: true, hint: "Është e gjelbër si një pemë e vogël." }),
      N("Cila është perime?", "🍅", ["🍅", "🍑", "🍉"], { big: true, hint: "Hyn në sallatë me kastravec." }),
      N("Cila frutë rritet në hardhi?", "🍇", ["🍇", "🍎", "🍌"], { big: true, hint: "Prej saj bëhet lëng rrushi." }),
    ], 6) },
    { t: "Stinët", gen: () => fromBank([
      N("Në cilën stinë bie borë?", "Dimri", ["Dimri", "Vera", "Pranvera"], { pic: bigPic("❄️"), hint: "Bën shumë ftohtë." }),
      N("Në cilën stinë çelin lulet?", "Pranvera", ["Pranvera", "Dimri", "Vjeshta"], { pic: bigPic("🌷"), hint: "Vjen pas dimrit." }),
      N("Në cilën stinë bien gjethet?", "Vjeshta", ["Vjeshta", "Vera", "Pranvera"], { pic: bigPic("🍂"), hint: "Fillon shkolla." }),
      N("Në cilën stinë bën më nxehtë?", "Vera", ["Vera", "Dimri", "Vjeshta"], { pic: bigPic("☀️"), hint: "Shkojmë në det." }),
      N("Cila stinë vjen pas dimrit?", "Pranvera", ["Pranvera", "Vera", "Vjeshta"], { hint: "Stinët: pranvera, vera, vjeshta, dimri." }),
      N("Sa stinë ka një vit?", "4", ["4", "3", "12"], { hint: "Pranvera, vera, vjeshta, dimri." }),
      N("Cila stinë vjen pas verës?", "Vjeshta", ["Vjeshta", "Dimri", "Pranvera"], { hint: "Stinët: pranvera, vera, vjeshta, dimri." }),
    ], 6) },
    { t: "Moti dhe veshja", gen: () => fromBank([
      N("Çka marrim kur bie shi?", "☂️", ["☂️", "🕶️", "🩳"], { big: true, pic: bigPic("🌧️"), hint: "Na mban të thatë." }),
      N("Çka veshim kur bie borë?", "🧤", ["🧤", "🩴", "👙"], { big: true, pic: bigPic("☃️"), hint: "Na i ngroh duart." }),
      N("Çka veshim në verë kur ka diell?", "🧢", ["🧢", "🧣", "🧤"], { big: true, pic: bigPic("☀️"), hint: "Na mbron kokën nga dielli." }),
      N("Si quhet kur fryn shumë?", "Erë", ["Erë", "Borë", "Diell"], { pic: bigPic("🌬️"), hint: "Lëviz gjethet dhe flamujt." }),
      N("Çka shohim pas shiut kur del dielli?", "🌈", ["🌈", "⛄", "🌙"], { big: true, hint: "Ka shumë ngjyra." }),
      N("Çka është kjo?", "Bubullimë dhe vetëtimë", ["Bubullimë dhe vetëtimë", "Ylber", "Mjegull"], { pic: bigPic("⛈️"), hint: "Dëgjohet: bum!" }),
    ], 6) },
    { t: "Shqisat", gen: () => fromBank([
      N("Me çka shohim?", "👁️", ["👁️", "👂", "👃"], { big: true, hint: "Sytë." }),
      N("Me çka dëgjojmë?", "👂", ["👂", "👅", "✋"], { big: true, hint: "Veshët." }),
      N("Me çka nuhasim lulen?", "👃", ["👃", "👁️", "👂"], { big: true, pic: bigPic("🌹"), hint: "Hunda." }),
      N("Me çka e shijojmë ushqimin?", "👅", ["👅", "👃", "✋"], { big: true, hint: "Gjuha." }),
      N("Me çka prekim?", "✋", ["✋", "👂", "👁️"], { big: true, hint: "Dora dhe lëkura." }),
      N("Sa shqisa ka njeriu?", "5", ["5", "3", "10"], { hint: "Të pamurit, të dëgjuarit, të nuhaturit, të shijuarit, të prekurit." }),
    ], 6) },
    { t: "Trupi i njeriut", gen: () => fromBank([
      N("Sa gishta ka një dorë?", "5", ["5", "4", "10"], { pic: bigPic("🖐️"), hint: "Numëroji!" }),
      N("Me çka ecim?", "Me këmbë", ["Me këmbë", "Me veshë", "Me hundë"], { pic: bigPic("🦶"), hint: "Ato janë poshtë." }),
      N("Çka është kjo?", "Dhëmbi", ["Dhëmbi", "Syri", "Gishti"], { pic: bigPic("🦷"), hint: "Me të përtypim." }),
      N("Ku e kemi zemrën?", "Në gjoks", ["Në gjoks", "Në kokë", "Në këmbë"], { pic: bigPic("❤️"), hint: "Vëre dorën dhe ndjeje si rreh." }),
      N("Sa sy ka njeriu?", "2", ["2", "1", "3"], { hint: "Një majtas, një djathtas." }),
      N("Çka mendon dhe mëson në trupin tonë?", "Truri", ["Truri", "Stomaku", "Këmba"], { pic: bigPic("🧠"), hint: "Ndodhet në kokë." }),
    ], 6) },
    { t: "Shprehitë e shëndetshme", gen: () => fromBank([
      N("Çka bëjmë para se të hamë?", "I lajmë duart", ["I lajmë duart", "Flemë", "Luajmë"], { pic: bigPic("🧼"), hint: "Me ujë dhe sapun." }),
      N("Sa herë në ditë i lajmë dhëmbët?", "2 herë", ["2 herë", "Asnjëherë", "1 herë në javë"], { pic: bigPic("🪥"), hint: "Në mëngjes dhe në mbrëmje." }),
      N("Cili ushqim është më i shëndetshëm?", "🥦", ["🥦", "🍭", "🍟"], { big: true, hint: "Perimet na bëjnë të fortë." }),
      N("Çka pimë më shumë gjatë ditës?", "💧", ["💧", "🥤", "🧃"], { big: true, hint: "Uji është më i miri." }),
      N("Kur shkojmë në gjumë?", "Herët në mbrëmje", ["Herët në mbrëmje", "Në mesnatë", "Kurrë"], { pic: bigPic("🛌"), hint: "Fëmijët kanë nevojë për shumë gjumë." }),
      N("Çka na bën të fortë dhe të shëndetshëm?", "Lëvizja dhe sporti", ["Lëvizja dhe sporti", "Televizori gjithë ditën", "Ëmbëlsirat"], { pic: bigPic("🤸"), hint: "Vrapo, kërce, luaj jashtë!" }),
    ], 6) },
  ];

  const challenge = (levels, n) => () => {
    const qs = [];
    levels.slice(3).forEach((l) => qs.push(...l.gen().slice(0, 1)));
    levels.slice(0, 3).forEach((l) => qs.push(l.gen()[0]));
    return shuffle(qs).slice(0, n);
  };

  window.GRADES[1] = {
    name: "Bota e Pranverës", emoji: "🌷",
    areas: [
      { id: "mat", name: "Matematikë", place: "Kalaja e Prizrenit", emoji: "🏰", color: "#ff8a3d", boss: "Bufi i Urtë", bossEmoji: "🦉", levels: mat, challenge: challenge(mat, 8) },
      { id: "shq", name: "Gjuhë shqipe", place: "Lugina e Rugovës", emoji: "🏞️", color: "#4c9aff", boss: "Ariu i Rugovës", bossEmoji: "🐻", levels: shq, challenge: challenge(shq, 8) },
      { id: "nat", name: "Njeriu dhe natyra", place: "Malet e Sharrit", emoji: "🏔️", color: "#36b37e", boss: "Rrëqebulli i Sharrit", bossEmoji: "🐆", levels: nat, challenge: challenge(nat, 8) },
    ],
  };
})();
