/* Shqiponjëza: aplikacioni kryesor */
(function () {
  "use strict";
  const KEY = "shqiponjeza_v1";
  const $app = document.getElementById("app");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return today(d); };

  /* ---------- Gjendja ---------- */
  const fresh = () => ({
    profile: null, progress: {}, coins: 0, xp: 0, medals: {}, streak: { count: 0, last: "" },
    hints: 0, feeds: 0, nest: { food: 70, joy: 70, updated: Date.now(), items: [], outfit: "", owned: [] },
    stats: {}, settings: { sound: true, voice: true }, grade: null, v: 2,
  });
  let S;
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { raw = {}; }
  S = Object.assign(fresh(), raw);
  /* Migrimi: progresi i vjetër (vetëm klasa 1) kalon te çelësat "1-zona" pa humbur asgjë */
  if (!raw.v || raw.v < 2) {
    const mv = (o) => { const n = {}; Object.keys(o || {}).forEach((k) => { n[/^\d-/.test(k) ? k : "1-" + k] = o[k]; }); return n; };
    S.progress = mv(S.progress); S.stats = mv(S.stats);
    if (S.profile && !S.grade) S.grade = 1;
    S.v = 2;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ruajtja dështoi */ }
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ruajtja dështoi */ } };

  const GR = window.GRADES;
  const GRADE_NUMS = Object.keys(GR).map(Number).sort((a, b) => a - b);
  const curGrade = () => (GR[S.grade] ? S.grade : 1);
  let W = GR[curGrade()];
  const setGrade = (g) => { S.grade = g; W = GR[curGrade()]; save(); };
  const pk = (aid, g = curGrade()) => `${g}-${aid}`;
  const areaById = (id) => W.areas.find((a) => a.id === id);
  const lp = (aid, i) => (S.progress[pk(aid)] && S.progress[pk(aid)][i]) || null;
  const areaStars = (aid, g) => Object.values(S.progress[pk(aid, g)] || {}).reduce((s, p) => s + (p.stars || 0), 0);
  const levelsDone = (aid, g) => Object.values(S.progress[pk(aid, g)] || {}).filter((p) => p.stars > 0).length;
  const totalStars = () => Object.values(S.progress).reduce((s, lv) => s + Object.values(lv || {}).reduce((t, p) => t + (p.stars || 0), 0), 0);
  const gradeStars = (g) => GR[g].areas.reduce((s, a) => s + areaStars(a.id, g), 0);
  const gradeDone = (g) => GR[g].areas.reduce((s, a) => s + levelsDone(a.id, g), 0);
  const zonesPlayed = () => Object.values(S.progress).filter((lv) => Object.values(lv || {}).some((p) => p.stars > 0)).length;
  const isUnlocked = (aid, i) => {
    if (i === 0) return true;
    if (i === 10) return [...Array(10).keys()].every((k) => lp(aid, k)) && areaStars(aid) >= 15;
    return !!lp(aid, i - 1);
  };

  /* ---------- Nivelet e lojtarit ---------- */
  const TITLES = [[1, "Zogth"], [6, "Zog Kureshtar"], [11, "Fluturues i Vogël"], [16, "Eksplorues i Rugovës"], [21, "Ruajtës i Kalasë"], [26, "Kalorës i Diturisë"], [31, "Mjeshtër i Sharrit"], [36, "Shqiponjë e Re"], [41, "Shqiponjë e Argjendtë"], [46, "Shqiponjë e Artë"]];
  const need = (L) => (L <= 10 ? 100 : Math.round(100 * Math.pow(1.1, L - 10)));
  const playerLevel = () => { let L = 1, x = S.xp; while (L < 50 && x >= need(L)) { x -= need(L); L++; } return { L, into: x, need: need(L) }; };
  const titleFor = (L) => TITLES.filter(([m]) => L >= m).pop()[1];

  /* ---------- Medaljet ---------- */
  const MEDALS = [
    { id: "hapi", icon: "🐣", name: "Hapi i Parë", cond: "Përfundo nivelin e parë" },
    { id: "treyje", icon: "⭐", name: "Tre Yje", cond: "Merr 3 yje në një nivel" },
    { id: "rrufe", icon: "⚡", name: "Rrufeja", cond: "Përfundo një nivel nën 60 sekonda me të paktën 2 yje" },
    { id: "dorezo", icon: "💪", name: "Mos u Dorëzo", cond: "Kthehu në një nivel dhe merr më shumë yje se më parë" },
    { id: "roja", icon: "🛡️", name: "Mposhtësi i Rojës", cond: "Fito një Sfidë të Rojës" },
    { id: "eksplorues", icon: "🧭", name: "Eksploruesi", cond: "Përfundo një nivel në 3 lëndë të ndryshme" },
    { id: "yje30", icon: "🌟", name: "Mbledhës Yjesh", cond: "Mblidh 30 yje" },
    { id: "zjarri3", icon: "🔥", name: "Zjarri 3", cond: "Mëso 3 ditë radhazi" },
    { id: "kurioz", icon: "💡", name: "Kurioz", cond: "Përdor ndihmën 5 herë" },
    { id: "kujdestar", icon: "🪺", name: "Kujdestari", cond: "Ushqe Zogthin 5 herë te Foleja" },
  ];
  const award = (id) => { if (S.medals[id]) return null; S.medals[id] = today(); S.coins += 10; const m = MEDALS.find((x) => x.id === id); return m; };
  const checkGlobalMedals = () => {
    const got = [];
    const push = (m) => m && got.push(m);
    if (zonesPlayed() >= 3) push(award("eksplorues"));
    if (totalStars() >= 30) push(award("yje30"));
    if (S.streak.count >= 3) push(award("zjarri3"));
    if (S.hints >= 5) push(award("kurioz"));
    if (S.feeds >= 5) push(award("kujdestar"));
    return got;
  };

  /* ---------- Zëri dhe tingujt ---------- */
  let ac = null;
  const tone = (freq, dur, delay = 0, type = "sine", vol = 0.15) => {
    if (!S.settings.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + delay;
      o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* pa audio */ }
  };
  const sfx = {
    ok: () => { tone(660, 0.12); tone(990, 0.18, 0.1); },
    bad: () => { tone(220, 0.22, 0, "triangle", 0.12); },
    tap: () => tone(520, 0.06, 0, "sine", 0.08),
    coin: () => { tone(1200, 0.08); tone(1600, 0.12, 0.07); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, i * 0.12, "triangle", 0.14)); },
    chirp: () => { tone(1800, 0.05); tone(2200, 0.06, 0.06); tone(1900, 0.05, 0.13); },
  };
  let sqVoice = null;
  const findVoice = () => { if (!("speechSynthesis" in window)) return; const vs = speechSynthesis.getVoices(); sqVoice = vs.find((v) => /^sq/i.test(v.lang)) || null; };
  if ("speechSynthesis" in window) { findVoice(); speechSynthesis.onvoiceschanged = findVoice; }
  const canSpeak = () => !!sqVoice && S.settings.voice;
  const speak = (text) => {
    if (!canSpeak()) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/−/g, " minus ").replace(/\+/g, " plus ").replace(/☐/g, " ")); u.voice = sqVoice; u.lang = sqVoice.lang; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) { /* pa zë */ }
  };

  /* ---------- Ndihmës UI ---------- */
  let toastT;
  const toast = (html) => { let t = document.getElementById("toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); } t.innerHTML = html; t.className = "show"; clearTimeout(toastT); toastT = setTimeout(() => (t.className = ""), 2600); };
  const header = () => {
    const pl = playerLevel();
    return `<header class="top">
      <button class="me" data-go="profile"><span class="av">${S.profile.avatar}</span><span class="lv">Niv. ${pl.L}</span></button>
      <div class="pills"><span class="pill" title="Yje">⭐ ${totalStars()}</span><span class="pill" title="Monedha">🪙 ${S.coins}</span><span class="pill fire" title="Seria ditore">🔥 ${S.streak.count}</span></div>
    </header>`;
  };
  const nav = (cur) => `<nav class="bottom">${[["home", "🗺️", "Harta"], ["nest", "🪺", "Foleja"], ["medals", "🏅", "Arritjet"], ["profile", "🙂", "Profili"]].map(([id, ic, l]) => `<button data-go="${id}" class="${cur === id ? "on" : ""}"><span>${ic}</span>${l}</button>`).join("")}</nav>`;
  const starsHTML = (n, max = 3) => Array.from({ length: max }, (_, i) => `<span class="${i < n ? "s-on" : "s-off"}">★</span>`).join("");

  /* ---------- Ekranet ---------- */
  let screen = "home", ctx = {};
  const go = (s, c) => { screen = s; ctx = c || {}; if ("speechSynthesis" in window) speechSynthesis.cancel(); render(); window.scrollTo(0, 0); };

  function render() {
    if (!S.profile) return renderOnboard();
    if (!GR[S.grade] && screen !== "grade") { screen = "grade"; ctx = { first: true }; }
    ({ home: renderHome, grade: renderGrade, area: renderArea, game: renderGame, result: renderResult, nest: renderNest, medals: renderMedals, profile: renderProfile, parent: renderParent })[screen]();
  }

  const AVATARS = ["🦊", "🐻", "🦉", "🐢", "🐰", "🐼", "🐱", "🐶", "🦁", "🐸"];
  function renderOnboard() {
    let av = AVATARS[0];
    $app.innerHTML = `<div class="screen onboard">
      <div class="mascot-big">${chickSVG({ mood: "cheer" })}</div>
      <div class="bubble">Përshëndetje! Unë jam <b>Zogthi</b>. Si quhesh ti?</div>
      <input id="nm" maxlength="16" placeholder="Emri yt" autocomplete="off" aria-label="Emri yt">
      <p class="lbl">Zgjidh kafshën tënde:</p>
      <div class="avatars">${AVATARS.map((a, i) => `<button class="avb${i === 0 ? " on" : ""}" data-av="${a}">${a}</button>`).join("")}</div>
      <p class="lbl">Në cilën klasë je?</p>
      ${gradeButtons(null)}
      <button class="btn primary big" id="start">Fillojmë! 🚀</button>
    </div>`;
    $app.querySelectorAll(".avb").forEach((b) => b.onclick = () => { sfx.tap(); av = b.dataset.av; $app.querySelectorAll(".avb").forEach((x) => x.classList.toggle("on", x === b)); });
    let gr = null;
    $app.querySelectorAll(".grb").forEach((b) => b.onclick = () => { sfx.tap(); gr = +b.dataset.g; $app.querySelectorAll(".grb").forEach((x) => x.classList.toggle("on", x === b)); });
    $app.querySelector("#start").onclick = () => {
      const name = $app.querySelector("#nm").value.trim();
      if (!name) { $app.querySelector("#nm").focus(); toast("Shkruaj emrin tënd 🙂"); return; }
      if (!gr) { toast("Zgjidh klasën tënde 🙂"); return; }
      S.profile = { name, avatar: av }; setGrade(gr); sfx.win(); go("home");
    };
  }

  function renderHome() {
    const hi = ["Sot mësojmë diçka të re!", "Gati për aventurë?", "Çdo yll të çon më lart!", "Le të fluturojmë bashkë!"][new Date().getDate() % 4];
    $app.innerHTML = `${header()}<main class="screen home">
      <div class="greet"><div class="mascot-sm">${chickSVG({ outfit: S.nest.outfit })}</div><div class="bubble">Tungjatjeta, <b>${esc(S.profile.name)}</b>! ${hi}</div></div>
      <div class="world-row"><h2 class="world">${W.emoji} ${W.name}</h2><button class="grade-btn" id="grade" aria-label="Ndrysho klasën">Klasa ${curGrade()} ▾</button></div>
      <div class="islands ${W.areas.length > 5 ? "many" : ""}">${W.areas.map((a) => { const st = areaStars(a.id), d = levelsDone(a.id); return `<button class="island" data-area="${a.id}" style="--c:${a.color}">
        <span class="i-emoji">${a.emoji}</span><span class="i-name">${a.name}</span><span class="i-place">${a.place}</span>
        <span class="bar"><i style="width:${Math.round((d / 11) * 100)}%"></i></span><span class="i-stars">⭐ ${st}/33 · ${d}/11 nivele</span></button>`; }).join("")}</div>
    </main>${nav("home")}`;
    $app.querySelectorAll(".island").forEach((b) => b.onclick = () => { sfx.tap(); go("area", { aid: b.dataset.area }); });
    $app.querySelector("#grade").onclick = () => { sfx.tap(); go("grade"); };
  }

  /* ---------- Zgjedhja e klasës ---------- */
  function gradeButtons(sel) {
    return `<div class="grades">${GRADE_NUMS.map((g) => `<button class="grb${g === sel ? " on" : ""}" data-g="${g}"><b>${g}</b><span>${GR[g].emoji}</span></button>`).join("")}</div>`;
  }
  function renderGrade() {
    const first = !!ctx.first;
    $app.innerHTML = `${S.profile ? header() : ""}<main class="screen grade">
      <div class="area-head">${first ? "" : `<button class="back" data-go="home" aria-label="Kthehu">←</button>`}<h2>🎒 Zgjidh klasën</h2></div>
      <p class="soft">Çdo klasë është një botë më vete me lëndët e saj. Yjet dhe nivelet ruhen veçmas për secilën klasë.</p>
      <div class="grade-list">${GRADE_NUMS.map((g) => { const G = GR[g], st = gradeStars(g), d = gradeDone(g), max = G.areas.length * 11; return `<button class="grade-card${g === S.grade ? " on" : ""}" data-g="${g}">
        <span class="gc-num">${g}</span><span class="gc-main"><b>Klasa ${g}: ${G.emoji} ${G.name}</b><small>${G.areas.map((a) => a.emoji).join(" ")} · ${G.areas.length} lëndë</small>
        <span class="bar"><i style="width:${Math.round((d / max) * 100)}%"></i></span><small>⭐ ${st} · ${d}/${max} nivele</small></span></button>`; }).join("")}</div>
    </main>${S.profile ? nav("home") : ""}`;
    $app.querySelectorAll(".grade-card").forEach((b) => b.onclick = () => { sfx.tap(); setGrade(+b.dataset.g); toast(`Klasa ${b.dataset.g} ✔`); go("home"); });
  }

  function renderArea() {
    const a = areaById(ctx.aid);
    const nodes = a.levels.map((l, i) => ({ i, t: l.t })).concat([{ i: 10, t: `Sfida e Rojës: ${a.boss}`, boss: true }]);
    $app.innerHTML = `${header()}<main class="screen area" style="--c:${a.color}">
      <div class="area-head"><button class="back" data-go="home" aria-label="Kthehu">←</button><div><h2>${a.emoji} ${a.place}</h2><small>${a.name} · ⭐ ${areaStars(a.id)}/33</small></div></div>
      <div class="path">${nodes.map((n) => { const p = lp(a.id, n.i), un = isUnlocked(a.id, n.i); const cur = un && !p; return `<div class="node-row ${n.i % 2 ? "r" : "l"}">
        <button class="node ${n.boss ? "boss" : ""} ${p ? "done" : un ? "open" : "locked"} ${cur ? "current" : ""}" data-lv="${n.i}" ${un ? "" : "disabled"} aria-label="Niveli ${n.i + 1}">
          ${un ? (n.boss ? a.bossEmoji : n.i + 1) : "🔒"}</button>
        <div class="node-info"><b>${n.boss ? "Sfida e Rojës" : "Niveli " + (n.i + 1)}</b><span>${n.boss ? a.boss : esc(n.t)}</span><span class="st">${p ? starsHTML(p.stars) : n.boss && !un ? "Përfundo 10 nivelet dhe mblidh 15 yje" : ""}</span></div>
        ${cur ? `<div class="here">${chickSVG({ outfit: S.nest.outfit })}</div>` : ""}</div>`; }).join("")}</div>
    </main>${nav("home")}`;
    $app.querySelectorAll(".node:not([disabled])").forEach((b) => b.onclick = () => { sfx.tap(); startLevel(a.id, +b.dataset.lv); });
  }

  /* ---------- Loja ---------- */
  function startLevel(aid, i) {
    const a = areaById(aid);
    const qs = i === 10 ? a.challenge() : a.levels[i].gen();
    go("game", { aid, i, qs, k: 0, mistakes: 0, firstTry: 0, missedThis: false, start: Date.now(), hintUsed: false });
  }
  function renderGame() {
    const a = areaById(ctx.aid), q = ctx.qs[ctx.k];
    ctx.missedThis = false; ctx.hintUsed = false;
    $app.innerHTML = `<main class="screen game" style="--c:${a.color}">
      <div class="g-top"><button class="close" id="quit" aria-label="Dil">✕</button>
        <div class="dots">${ctx.qs.map((_, j) => `<i class="${j < ctx.k ? "d" : j === ctx.k ? "c" : ""}"></i>`).join("")}</div>
        ${canSpeak() ? '<button class="ico" id="say" aria-label="Dëgjo pyetjen">🔊</button>' : ""}</div>
      <div class="q-card"><div class="q-text">${esc(q.q)}</div>${q.pic ? `<div class="q-pic">${q.pic}</div>` : ""}</div>
      <div class="opts ${q.big ? "big" : ""} ${q.opts.some((o) => o.length > 5) ? "long" : ""} n${q.opts.length}">${q.opts.map((o) => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>
      <div class="g-bottom"><div class="mascot-xs" id="gm">${chickSVG({ outfit: S.nest.outfit })}</div><div class="feedback" id="fb">${ctx.i === 10 ? `${a.bossEmoji} ${a.boss} të sfidon!` : "Zgjidh përgjigjen 👇"}</div><button class="btn hint" id="hint">💡 Ndihmë</button></div>
    </main>`;
    const fb = $app.querySelector("#fb"), gm = $app.querySelector("#gm");
    $app.querySelector("#quit").onclick = () => go("area", { aid: ctx.aid });
    const sayBtn = $app.querySelector("#say"); if (sayBtn) sayBtn.onclick = () => speak(q.say || q.q);
    speak(q.say || q.q);
    $app.querySelector("#hint").onclick = (e) => {
      const wrong = [...$app.querySelectorAll(".opt:not(.x)")].filter((b) => b.dataset.o !== q.ans);
      if (!ctx.hintUsed) { S.hints++; save(); ctx.hintUsed = true; }
      if (wrong.length > 1) { const w = wrong[Math.floor(Math.random() * wrong.length)]; w.classList.add("x"); w.disabled = true; }
      fb.innerHTML = `💡 ${esc(q.hint || "Mendo me qetësi.")}`; e.currentTarget.disabled = true; sfx.tap();
    };
    let locked = false;
    $app.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
      if (locked) return;
      if (b.dataset.o === q.ans) {
        locked = true; b.classList.add("ok"); sfx.ok(); if (!ctx.missedThis) ctx.firstTry++;
        fb.innerHTML = ["Bravo! 🎉", "Shumë mirë! ⭐", "E saktë! 👏", "Super! 🦅"][Math.floor(Math.random() * 4)];
        gm.innerHTML = chickSVG({ mood: "cheer", outfit: S.nest.outfit });
        setTimeout(() => { ctx.k++; if (ctx.k >= ctx.qs.length) finishLevel(); else renderGame(); }, 850);
      } else {
        b.classList.add("bad", "x"); b.disabled = true; sfx.bad();
        if (!ctx.missedThis) { ctx.mistakes++; ctx.missedThis = true; }
        fb.innerHTML = "Provo përsëri! Ti mundesh 💪"; gm.innerHTML = chickSVG({ mood: "think", outfit: S.nest.outfit });
      }
    });
  }

  function finishLevel() {
    const { aid, i, mistakes } = ctx, secs = Math.round((Date.now() - ctx.start) / 1000);
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    const key = pk(aid);
    S.progress[key] = S.progress[key] || {};
    const prev = S.progress[key][i];
    const first = !prev;
    const p = prev || { stars: 0, plays: 0 };
    const improved = prev && stars > prev.stars;
    p.stars = Math.max(p.stars, stars); p.plays++; p.last = today();
    S.progress[key][i] = p;
    const st = S.stats[key] || (S.stats[key] = { correct: 0, total: 0, secs: 0 });
    st.correct += ctx.firstTry; st.total += ctx.qs.length; st.secs += secs;
    let coins = stars * 3 + (first ? 10 : 0) + (i === 10 ? 20 : 0);
    const xp = 10 + 5 * stars + (i === 10 ? 30 : 0);
    const before = playerLevel().L;
    S.coins += coins; S.xp += xp;
    if (S.streak.last !== today()) { S.streak.count = S.streak.last === yesterday() ? S.streak.count + 1 : 1; S.streak.last = today(); }
    const medals = [];
    const push = (m) => m && medals.push(m);
    push(award("hapi"));
    if (stars === 3) push(award("treyje"));
    if (secs < 60 && stars >= 2) push(award("rrufe"));
    if (improved) push(award("dorezo"));
    if (i === 10) push(award("roja"));
    medals.push(...checkGlobalMedals());
    const after = playerLevel().L;
    save();
    go("result", { aid, i, stars, coins, xp, medals, levelUp: after > before ? after : 0, secs, mistakes });
  }

  function renderResult() {
    const a = areaById(ctx.aid), next = ctx.i < 10 && isUnlocked(ctx.aid, ctx.i + 1) ? ctx.i + 1 : null;
    $app.innerHTML = `<main class="screen result" style="--c:${a.color}">
      <div class="mascot-big">${chickSVG({ mood: "cheer", outfit: S.nest.outfit })}</div>
      <h2>${ctx.i === 10 ? `E mposhte ${a.boss}! 🏆` : ctx.stars === 3 ? "Përsosur!" : ctx.stars === 2 ? "Shumë mirë!" : "E kalove nivelin!"}</h2>
      <div class="big-stars">${starsHTML(ctx.stars)}</div>
      <div class="rewards"><span>🪙 +${ctx.coins}</span><span>✨ +${ctx.xp} XP</span><span>⏱️ ${ctx.secs} s</span></div>
      ${ctx.mistakes ? `<p class="soft">Gabimet janë pjesë e mësimit. Provoje sërish për më shumë yje!</p>` : ""}
      ${ctx.levelUp ? `<div class="lvup">🎉 Niveli ${ctx.levelUp}: <b>${titleFor(ctx.levelUp)}</b></div>` : ""}
      ${ctx.medals.map((m) => `<div class="new-medal"><span>${m.icon}</span><div><b>Medalje e re: ${m.name}</b><small>${m.cond} · +10 🪙</small></div></div>`).join("")}
      <div class="row">${next !== null ? `<button class="btn primary big" id="next">Vazhdo ➜</button>` : ""}
        <button class="btn" id="again">↻ Provo përsëri</button><button class="btn" id="map">🗺️ Harta</button></div>
    </main>`;
    sfx.win(); setTimeout(sfx.coin, 700);
    const n = $app.querySelector("#next"); if (n) n.onclick = () => startLevel(ctx.aid, next);
    $app.querySelector("#again").onclick = () => startLevel(ctx.aid, ctx.i);
    $app.querySelector("#map").onclick = () => go("area", { aid: ctx.aid });
  }

  /* ---------- Foleja ime ---------- */
  const SHOP = {
    food: [{ id: "molle", e: "🍎", n: "Mollë", p: 5, v: 20 }, { id: "boronica", e: "🫐", n: "Boronica", p: 4, v: 15 }, { id: "peshk", e: "🐟", n: "Peshk", p: 8, v: 35 }, { id: "top", e: "⚽", n: "Lojë me top", p: 6, v: 30, joy: true }],
    deco: [{ id: "lule", e: "🌸", n: "Lule", p: 10 }, { id: "luleV", e: "🌼", n: "Lule e verdhë", p: 10 }, { id: "fener", e: "🏮", n: "Fener", p: 20 }, { id: "flamur", e: "🚩", n: "Flamur", p: 15 }, { id: "balona", e: "🎈", n: "Balona", p: 15 }, { id: "kometa", e: "🪁", n: "Balonë letre", p: 25 }, { id: "shtepi", e: "🏡", n: "Shtëpizë", p: 40 }, { id: "ylber", e: "🌈", n: "Ylber", p: 50 }],
    wear: [{ id: "shall", e: "🧣", n: "Shall", p: 20 }, { id: "syze", e: "🕶️", n: "Syze", p: 25 }, { id: "plis", e: "⚪", n: "Plis", p: 30 }, { id: "kurore", e: "👑", n: "Kurorë", p: 60 }],
  };
  const DECO_POS = { lule: [8, 64], luleV: [80, 66], fener: [6, 20], flamur: [84, 14], balona: [16, 2], kometa: [70, 0], shtepi: [74, 42], ylber: [36, -4] };
  const decayNest = () => { const n = S.nest, h = (Date.now() - (n.updated || Date.now())) / 3600000; if (h > 0.01) { n.food = Math.max(20, Math.round(n.food - h * 5)); n.joy = Math.max(20, Math.round(n.joy - h * 3)); n.updated = Date.now(); } };
  function renderNest() {
    decayNest(); save();
    const tab = ctx.tab || "food", n = S.nest;
    const items = SHOP[tab];
    $app.innerHTML = `${header()}<main class="screen nest">
      <h2>🪺 Foleja ime</h2>
      <div class="meters"><div class="meter"><span>🍎 Ushqimi</span><b><i style="width:${n.food}%"></i></b></div><div class="meter joy"><span>💗 Lumturia</span><b><i style="width:${n.joy}%"></i></b></div></div>
      <div class="scene">
        ${n.items.map((id) => { const d = SHOP.deco.find((x) => x.id === id); const [x, y] = DECO_POS[id] || [50, 50]; return d ? `<span class="deco" style="left:${x}%;top:${y}%">${d.e}</span>` : ""; }).join("")}
        <button class="nest-chick" id="pet" aria-label="Përkëdhel Zogthin">${chickSVG({ outfit: n.outfit, mood: n.joy > 60 ? "cheer" : "" })}</button>
        <svg class="nest-svg" viewBox="0 0 300 90"><ellipse cx="150" cy="40" rx="140" ry="40" fill="#8d5a2b"/><ellipse cx="150" cy="30" rx="118" ry="22" fill="#5e3a17"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${20 + i * 19} ${50 + (i % 3) * 8} q20 -14 40 0" stroke="#b07a43" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}</svg>
      </div>
      <p class="soft center">Prek Zogthin për ta bërë të lumtur. Monedhat i fiton duke mësuar!</p>
      <div class="tabs">${[["food", "🍎 Ushqim"], ["deco", "🌸 Dekorime"], ["wear", "🧣 Veshje"]].map(([id, l]) => `<button data-tab="${id}" class="${tab === id ? "on" : ""}">${l}</button>`).join("")}</div>
      <div class="shop">${items.map((it) => { const owned = tab === "deco" ? n.items.includes(it.id) : tab === "wear" ? n.owned.includes(it.id) : false; const worn = n.outfit === it.id;
        return `<button class="item ${owned ? "owned" : ""} ${worn ? "worn" : ""}" data-id="${it.id}"><span class="ie">${it.e}</span><span class="in">${it.n}</span><span class="ip">${tab === "deco" && owned ? "✔ E vendosur" : tab === "wear" && owned ? (worn ? "✔ E veshur" : "Vishe") : `🪙 ${it.p}`}</span></button>`; }).join("")}</div>
    </main>${nav("nest")}`;
    $app.querySelectorAll(".tabs button").forEach((b) => b.onclick = () => { sfx.tap(); ctx.tab = b.dataset.tab; renderNest(); });
    let lastPet = 0;
    $app.querySelector("#pet").onclick = (e) => { const t = Date.now(); e.currentTarget.classList.remove("hop"); void e.currentTarget.offsetWidth; e.currentTarget.classList.add("hop"); sfx.chirp(); if (t - lastPet > 1500) { lastPet = t; n.joy = Math.min(100, n.joy + 5); save(); $app.querySelector(".meter.joy i").style.width = n.joy + "%"; } };
    $app.querySelectorAll(".item").forEach((b) => b.onclick = () => {
      const it = items.find((x) => x.id === b.dataset.id);
      if (tab === "wear" && n.owned.includes(it.id)) { n.outfit = n.outfit === it.id ? "" : it.id; save(); sfx.tap(); return renderNest(); }
      if (tab === "deco" && n.items.includes(it.id)) return;
      if (tab === "food" && (it.joy ? n.joy : n.food) >= 100) { toast("Zogthi është i ngopur dhe i lumtur! 💛"); return; }
      if (S.coins < it.p) { sfx.bad(); toast(`Të duhen ${it.p - S.coins} 🪙 më shumë. Luaj një nivel për të fituar!`); return; }
      S.coins -= it.p; sfx.coin();
      if (tab === "food") { if (it.joy) n.joy = Math.min(100, n.joy + it.v); else { n.food = Math.min(100, n.food + it.v); S.feeds++; } }
      if (tab === "deco") n.items.push(it.id);
      if (tab === "wear") { n.owned.push(it.id); n.outfit = it.id; }
      const m = checkGlobalMedals(); save(); renderNest();
      m.forEach((x) => toast(`🏅 Medalje e re: ${x.icon} ${x.name}`));
    });
  }

  function renderMedals() {
    const pl = playerLevel(), got = Object.keys(S.medals).length;
    $app.innerHTML = `${header()}<main class="screen medals">
      <div class="lv-card"><div class="mascot-sm">${chickSVG({ outfit: S.nest.outfit, mood: "cheer" })}</div><div><b>Niveli ${pl.L}: ${titleFor(pl.L)}</b><div class="xpbar"><i style="width:${Math.round((pl.into / pl.need) * 100)}%"></i></div><small>${pl.into}/${pl.need} XP deri te niveli ${pl.L + 1}</small></div></div>
      <h2>🏅 Arritjet <small>${got}/${MEDALS.length}</small></h2>
      <div class="medal-grid">${MEDALS.map((m) => `<div class="medal ${S.medals[m.id] ? "got" : "lock"}"><span class="mi">${m.icon}</span><b>${m.name}</b><small>${m.cond}</small></div>`).join("")}</div>
    </main>${nav("medals")}`;
  }

  function renderProfile() {
    const pl = playerLevel();
    $app.innerHTML = `${header()}<main class="screen profile">
      <div class="prof-card"><span class="av-big">${S.profile.avatar}</span><div><h2>${esc(S.profile.name)}</h2><small>Niveli ${pl.L}: ${titleFor(pl.L)} · ${S.xp} XP</small></div></div>
      <label class="lbl" for="nm">Emri</label><input id="nm" maxlength="16" value="${esc(S.profile.name)}">
      <p class="lbl">Kafsha</p><div class="avatars">${AVATARS.map((a) => `<button class="avb${a === S.profile.avatar ? " on" : ""}" data-av="${a}">${a}</button>`).join("")}</div>
      <p class="lbl">Klasa</p>${gradeButtons(curGrade())}
      <div class="settings">
        <label><input type="checkbox" id="snd" ${S.settings.sound ? "checked" : ""}> 🔔 Tingujt</label>
        <label><input type="checkbox" id="vc" ${S.settings.voice ? "checked" : ""} ${sqVoice ? "" : "disabled"}> 🔊 Leximi me zë i pyetjeve</label>
        ${sqVoice ? "" : `<small class="soft">Zëri shqip nuk u gjet në këtë pajisje. Mund ta shtoni te cilësimet e telefonit (Text-to-speech).</small>`}
      </div>
      <button class="btn" id="parent">👨‍👩‍👧 Për prindër dhe mësues</button>
      <p class="soft">Pa reklama, pa chat, pa blerje me para. Progresi ruhet vetëm në këtë pajisje.</p>
    </main>${nav("profile")}`;
    const nm = $app.querySelector("#nm");
    nm.onchange = () => { const v = nm.value.trim(); if (v) { S.profile.name = v; save(); toast("Emri u ruajt ✔"); } };
    $app.querySelectorAll(".avb").forEach((b) => b.onclick = () => { S.profile.avatar = b.dataset.av; save(); sfx.tap(); renderProfile(); });
    $app.querySelectorAll(".grb").forEach((b) => b.onclick = () => { setGrade(+b.dataset.g); sfx.tap(); toast(`Klasa ${b.dataset.g} ✔`); renderProfile(); });
    $app.querySelector("#snd").onchange = (e) => { S.settings.sound = e.target.checked; save(); };
    $app.querySelector("#vc").onchange = (e) => { S.settings.voice = e.target.checked; save(); };
    $app.querySelector("#parent").onclick = () => go("parent", { gate: true });
  }

  function renderParent() {
    if (ctx.gate) {
      const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
      $app.innerHTML = `<main class="screen parent"><div class="area-head"><button class="back" data-go="profile">←</button><h2>Zona e prindërve</h2></div>
        <p>Kjo pjesë është për të rriturit. Sa bëjnë <b>${a} × ${b}</b>?</p>
        <input id="gate" type="number" inputmode="numeric" aria-label="Përgjigjja"><button class="btn primary" id="ok">Hyr</button></main>`;
      $app.querySelector("#ok").onclick = () => { if (+$app.querySelector("#gate").value === a * b) go("parent", {}); else toast("Përgjigje e gabuar."); };
      return;
    }
    const pg = GR[ctx.pg] ? ctx.pg : curGrade();
    const rowsFor = (g) => GR[g].areas.map((ar) => {
      const st = S.stats[pk(ar.id, g)] || { correct: 0, total: 0, secs: 0 };
      const acc = st.total ? Math.round((st.correct / st.total) * 100) : null;
      const played = Object.entries(S.progress[pk(ar.id, g)] || {});
      const weak = played.filter(([, p]) => p.stars < 3).sort((x, y) => x[1].stars - y[1].stars)[0];
      const weakName = weak ? (+weak[0] === 10 ? "Sfida e Rojës" : ar.levels[+weak[0]].t) : "—";
      return { ar, done: levelsDone(ar.id, g), stars: areaStars(ar.id, g), acc, mins: st.secs < 60 ? st.secs + " s" : Math.round(st.secs / 60) + " min", weakName };
    });
    const rows = rowsFor(pg);
    const active = GRADE_NUMS.filter((g) => gradeDone(g) > 0);
    const report = `Raporti i progresit: ${S.profile.name} (${today()})\n` + (active.length ? active : [pg]).map((g) => `\nKLASA ${g}: ${GR[g].name}\n` + rowsFor(g).filter((r) => r.done > 0 || g === pg).map((r) => `${r.ar.name}: ${r.done}/11 nivele, ${r.stars}/33 yje, saktësia ${r.acc === null ? "—" : r.acc + "%"}, ${r.mins}, për përsëritje: ${r.weakName}`).join("\n")).join("\n") + `\n\nSeria: ${S.streak.count} ditë · Medalje: ${Object.keys(S.medals).length}/${MEDALS.length} · Niveli: ${playerLevel().L}`;
    $app.innerHTML = `<main class="screen parent"><div class="area-head"><button class="back" data-go="profile">←</button><h2>Progresi i ${esc(S.profile.name)}</h2></div>
      <p class="lbl">Klasa ${pg}: ${GR[pg].emoji} ${GR[pg].name}${pg === curGrade() ? " (klasa aktuale)" : ""}</p>
      <div class="pgrades">${GRADE_NUMS.map((g) => { const d = gradeDone(g); return `<button class="pgb${g === pg ? " on" : ""}${d ? " has" : ""}" data-pg="${g}"><b>${g}</b><small>${d ? "⭐ " + gradeStars(g) : "—"}</small></button>`; }).join("")}</div>
      <div class="ptable">${rows.map((r) => `<div class="prow" style="--c:${r.ar.color}"><b>${r.ar.emoji} ${r.ar.name}</b>
        <div class="bar"><i style="width:${Math.round((r.done / 11) * 100)}%"></i></div>
        <div class="pgrid"><span>Nivele<b>${r.done}/11</b></span><span>Yje<b>${r.stars}/33</b></span><span>Saktësia<b>${r.acc === null ? "—" : r.acc + "%"}</b></span><span>Koha<b>${r.mins}</b></span></div>
        <small>Për përsëritje: ${esc(r.weakName)}</small></div>`).join("")}</div>
      <p class="soft">Saktësia = pyetjet e zgjidhura në provën e parë. Seria: ${S.streak.count} ditë · Medalje: ${Object.keys(S.medals).length}/${MEDALS.length}</p>
      <button class="btn primary" id="copy">📋 Kopjo raportin</button>
      <button class="btn danger" id="reset">Fshi gjithë progresin</button></main>`;
    $app.querySelectorAll(".pgb").forEach((b) => b.onclick = () => { sfx.tap(); go("parent", { pg: +b.dataset.pg }); });
    $app.querySelector("#copy").onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(report) : Promise.reject()).then(() => toast("Raporti u kopjua ✔"), () => { prompt("Kopjo raportin:", report); }); };
    $app.querySelector("#reset").onclick = () => { if (confirm("A jeni të sigurt? I gjithë progresi do të fshihet.")) { localStorage.removeItem(KEY); S = fresh(); W = GR[1]; go("home"); } };
  }

  /* navigimi i përbashkët */
  $app.addEventListener("click", (e) => { const g = e.target.closest("[data-go]"); if (g) { sfx.tap(); go(g.dataset.go); } });
  render();
  if (/[?&]test\b/.test(location.search)) window.__shq = { get ctx() { return ctx; }, get S() { return S; }, get screen() { return screen; }, go };

  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
