/* Zogthi: maskota (zog shqiponje i kuq e i zi), e vizatuar me SVG */
window.chickSVG = function (opts) {
  opts = opts || {};
  const outfit = opts.outfit || "";
  const cheer = opts.mood === "cheer";
  const sad = opts.mood === "think";
  const wingL = cheer ? 'transform="rotate(-35 62 118)"' : "";
  const wingR = cheer ? 'transform="rotate(35 138 118)"' : "";
  let hat = "";
  if (outfit === "plis") hat = '<path d="M70 52 Q100 18 130 52 Z" fill="#fbfbf5" stroke="#d9d6c8" stroke-width="2"/><rect x="66" y="49" width="68" height="8" rx="4" fill="#efece0"/>';
  if (outfit === "kurore") hat = '<path d="M72 54 L76 26 L89 42 L100 20 L111 42 L124 26 L128 54 Z" fill="#ffc927" stroke="#e0a400" stroke-width="2"/><circle cx="100" cy="36" r="4" fill="#ff4d6d"/>';
  const glasses = outfit === "syze" ? '<g fill="none" stroke="#1d1d3b" stroke-width="4"><circle cx="84" cy="80" r="14"/><circle cx="116" cy="80" r="14"/><path d="M98 80 h4"/></g>' : "";
  const scarf = outfit === "shall" ? '<path d="M66 112 Q100 128 134 112 L134 124 Q100 140 66 124 Z" fill="#e63946"/><path d="M118 122 l10 26 l-12 2 l-6 -24 Z" fill="#c1121f"/>' : "";
  const mouth = sad ? '<path d="M92 104 Q100 99 108 104" stroke="#7a3b00" stroke-width="3" fill="none"/>' : "";
  return `<svg class="chick${cheer ? " cheer" : ""}" viewBox="0 0 200 200" aria-label="Zogthi" role="img">
  <ellipse cx="100" cy="188" rx="46" ry="7" fill="rgba(0,0,0,.12)"/>
  <g ${wingL}><path d="M64 110 Q30 120 34 160 Q52 150 70 150 Z" fill="#1f1f2e"/><path d="M50 128 Q40 140 40 152" stroke="#e63946" stroke-width="4" fill="none"/></g>
  <g ${wingR}><path d="M136 110 Q170 120 166 160 Q148 150 130 150 Z" fill="#1f1f2e"/><path d="M150 128 Q160 140 160 152" stroke="#e63946" stroke-width="4" fill="none"/></g>
  <ellipse cx="100" cy="135" rx="44" ry="46" fill="#1f1f2e"/>
  <ellipse cx="100" cy="142" rx="28" ry="34" fill="#e63946"/>
  <path d="M86 132 q6 6 12 0 M102 146 q6 6 12 0 M88 158 q6 6 12 0" stroke="#ff8fa3" stroke-width="3" fill="none"/>
  <rect x="74" y="104" width="7" height="44" rx="3" fill="#2f6fde"/><rect x="119" y="104" width="7" height="44" rx="3" fill="#2f6fde"/>
  <path d="M84 178 l-6 12 M84 178 l0 13 M84 178 l6 12" stroke="#ff9f1c" stroke-width="5" stroke-linecap="round"/>
  <path d="M116 178 l-6 12 M116 178 l0 13 M116 178 l6 12" stroke="#ff9f1c" stroke-width="5" stroke-linecap="round"/>
  <path d="M84 40 Q92 22 98 40 Q104 18 112 40 Q122 26 118 46 Z" fill="#1f1f2e"/>
  <circle cx="100" cy="80" r="42" fill="#e63946"/>
  <path d="M60 78 Q62 46 100 40 Q74 52 72 80 Z" fill="#1f1f2e" opacity=".9"/>
  <path d="M140 78 Q138 46 100 40 Q126 52 128 80 Z" fill="#1f1f2e" opacity=".9"/>
  <circle cx="84" cy="80" r="13" fill="#fff"/><circle cx="116" cy="80" r="13" fill="#fff"/>
  <circle cx="86" cy="82" r="7" fill="#1d1d3b"/><circle cx="114" cy="82" r="7" fill="#1d1d3b"/>
  <circle cx="89" cy="78" r="2.6" fill="#fff"/><circle cx="117" cy="78" r="2.6" fill="#fff"/>
  <path d="M88 92 Q100 86 112 92 Q110 106 100 112 Q92 104 88 92 Z" fill="#ffb703"/>
  <path d="M100 112 Q104 108 106 102" stroke="#e08e00" stroke-width="2" fill="none"/>
  <circle cx="72" cy="96" r="5" fill="#ff8fa3" opacity=".7"/><circle cx="128" cy="96" r="5" fill="#ff8fa3" opacity=".7"/>
  ${mouth}${scarf}${glasses}${hat}
</svg>`;
};
