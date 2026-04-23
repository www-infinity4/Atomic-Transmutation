/* =========================================================
   main.js  –  Atomic-Transmutation  www-infinity4
   ========================================================= */

/* ── helpers ─────────────────────────────────────────── */
const π = Math.PI;
const rand = (a, b) => Math.random() * (b - a) + a;
const lerp = (a, b, t) => a + (b - a) * t;

/* =========================================================
   1. HAMBURGER
   ========================================================= */
const ham = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
ham.addEventListener('click', () => {
  ham.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    ham.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

/* =========================================================
   2. HERO PARTICLE CANVAS
   ========================================================= */
(function heroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, orbitals;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    init();
  }

  function init() {
    particles = Array.from({ length: 120 }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(.8, 2.4),
      vx: rand(-.3, .3), vy: rand(-.3, .3),
      alpha: rand(.3, .9),
      color: ['#00e5ff','#7c4dff','#ffd740','#ff6d00'][Math.floor(rand(0,4))]
    }));
    orbitals = Array.from({ length: 5 }, (_, i) => ({
      cx: W / 2, cy: H / 2,
      rx: 120 + i * 62,
      ry: 44 + i * 20,
      angle: 0,
      speed: .0006 * (i % 2 === 0 ? 1 : -1) * (1 + i * .2),
      tilt: i * (π / 6),
      electronAngle: rand(0, π * 2),
      electronSpeed: .008 + i * .003,
      color: ['#00e5ff','#7c4dff','#ffd740','#ff6d00','#00e5ff'][i]
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* soft radial background glow */
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * .6);
    grad.addColorStop(0,   'rgba(0,229,255,.06)');
    grad.addColorStop(.5,  'rgba(124,77,255,.04)');
    grad.addColorStop(1,   'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* connection lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,229,255,${.12 * (1 - d/110)})`;
          ctx.lineWidth = .6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    /* particles */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, π*2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });

    /* orbitals */
    orbitals.forEach(o => {
      o.angle += o.speed;
      ctx.save();
      ctx.translate(o.cx, o.cy);
      ctx.rotate(o.tilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, π*2);
      ctx.strokeStyle = o.color;
      ctx.globalAlpha = .18;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      /* electron */
      o.electronAngle += o.electronSpeed;
      const ex = Math.cos(o.electronAngle) * o.rx;
      const ey = Math.sin(o.electronAngle) * o.ry;
      const eg = ctx.createRadialGradient(ex,ey,0,ex,ey,7);
      eg.addColorStop(0, o.color);
      eg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(ex, ey, 7, 0, π*2);
      ctx.fillStyle = eg; ctx.fill();
      ctx.restore();
    });

    /* nucleus */
    const ng = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,22);
    ng.addColorStop(0,   '#fff');
    ng.addColorStop(.35, '#00e5ff');
    ng.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(W/2, H/2, 22, 0, π*2);
    ctx.fillStyle = ng; ctx.fill();

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* =========================================================
   3. ANIMATED STAT COUNTERS
   ========================================================= */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const start  = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = (Number.isInteger(target)
        ? Math.round(lerp(0, target, ease))
        : lerp(0, target, ease).toFixed(1)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
const statsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { animateCounters(); statsObs.disconnect(); }
}, { threshold: .5 });
statsObs.observe(document.getElementById('stats'));

/* =========================================================
   4. CHART.JS GRAPHS  (Resonance Ladder)
   ========================================================= */
window.addEventListener('load', () => {
  /* 4a – Voltage Potential across stack */
  new Chart(document.getElementById('chart-voltage'), {
    type: 'bar',
    data: {
      labels: ['H (1)', 'He (2)', 'Li (3)', 'Be (4)', 'B (5)',
               'C (6)', 'N (7)', 'O (8)', 'F (9)', 'Ne (10)'],
      datasets: [{
        label: 'Relative Potential (normalised)',
        data: [0.9, 0.2, 1.3, 0.4, 1.1, 0.5, 1.8, 0.7, 2.6, 0.3],
        backgroundColor: [
          'rgba(0,229,255,.75)','rgba(124,77,255,.75)','rgba(0,229,255,.75)',
          'rgba(124,77,255,.75)','rgba(0,229,255,.75)','rgba(124,77,255,.75)',
          'rgba(0,229,255,.75)','rgba(124,77,255,.75)','rgba(255,109,0,.85)',
          'rgba(124,77,255,.75)'
        ],
        borderColor: 'rgba(0,229,255,.5)',
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8ab4c8' } } },
      scales: {
        x: { ticks: { color: '#8ab4c8' }, grid: { color: 'rgba(255,255,255,.06)' } },
        y: { ticks: { color: '#8ab4c8' }, grid: { color: 'rgba(255,255,255,.06)' }, beginAtZero: true }
      }
    }
  });

  /* 4b – Cu / Pd / Ag resonance stack (radar) */
  new Chart(document.getElementById('chart-stack'), {
    type: 'radar',
    data: {
      labels: ['Conductivity','Inertia','Reactivity','Well Gap','Broadcast Strength','Thermal Stability'],
      datasets: [
        {
          label: 'Copper (29)',
          data: [95, 30, 72, 40, 88, 62],
          fill: true,
          backgroundColor: 'rgba(255,109,0,.15)',
          borderColor: '#ff6d00',
          pointBackgroundColor: '#ff6d00',
        },
        {
          label: 'Palladium (46)',
          data: [62, 74, 45, 70, 55, 80],
          fill: true,
          backgroundColor: 'rgba(124,77,255,.15)',
          borderColor: '#7c4dff',
          pointBackgroundColor: '#7c4dff',
        },
        {
          label: 'Silver (47)',
          data: [98, 52, 58, 76, 70, 75],
          fill: true,
          backgroundColor: 'rgba(0,229,255,.12)',
          borderColor: '#00e5ff',
          pointBackgroundColor: '#00e5ff',
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8ab4c8' } } },
      scales: {
        r: {
          ticks: { color: '#8ab4c8', backdropColor: 'transparent' },
          grid: { color: 'rgba(255,255,255,.1)' },
          pointLabels: { color: '#e8f4fd', font: { size: 11 } },
          suggestedMin: 0, suggestedMax: 100
        }
      }
    }
  });

  /* 4c – Voltage well-gap line chart */
  new Chart(document.getElementById('chart-wellgap'), {
    type: 'line',
    data: {
      labels: ['Cu (29)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pd (46)', 'Ag (47)'],
      datasets: [{
        label: 'Voltage Potential (V)',
        data: [
          30, 28.5, 27, 25, 23, 21, 18.5, 16, 14, 12, 10.5, 9, 7.5, 5, 3.5, 2, 1.5, 0
        ],
        borderColor: '#00e5ff',
        backgroundColor: 'rgba(0,229,255,.08)',
        fill: true,
        tension: .4,
        pointRadius: 3,
        pointHoverRadius: 6,
      }, {
        label: 'Bias Threshold (V)',
        data: Array(18).fill(1.5),
        borderColor: '#ffd740',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8ab4c8' } } },
      scales: {
        x: { ticks: { color: '#8ab4c8' }, grid: { color: 'rgba(255,255,255,.06)' } },
        y: { ticks: { color: '#8ab4c8' }, grid: { color: 'rgba(255,255,255,.06)' }, beginAtZero: true }
      }
    }
  });

  /* 4d – Odd/Even potential doughnut */
  new Chart(document.getElementById('chart-oddeven'), {
    type: 'doughnut',
    data: {
      labels: ['Odd (Reactive)', 'Even (Inertial)'],
      datasets: [{
        data: [47, 53],
        backgroundColor: ['rgba(0,229,255,.8)', 'rgba(124,77,255,.8)'],
        borderColor: ['#00e5ff','#7c4dff'],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8ab4c8', padding: 16 } }
      }
    }
  });
});

/* =========================================================
   5. ELEMENT DETAIL PANEL
   ========================================================= */
const ELEMENTS = [
  { num:1,  sym:'H',  name:'Hydrogen',  mass:'1.008',   type:'Nonmetal',        role:'Source / Well of Power',           odd:true,  config:'1s¹' },
  { num:2,  sym:'He', name:'Helium',    mass:'4.003',   type:'Noble Gas',        role:'Inner containment buffer',         odd:false, config:'1s²' },
  { num:3,  sym:'Li', name:'Lithium',   mass:'6.941',   type:'Alkali Metal',     role:'Tritium breeder / fuel layer',     odd:true,  config:'[He] 2s¹' },
  { num:4,  sym:'Be', name:'Beryllium', mass:'9.012',   type:'Alkaline Metal',   role:'Reflector / structural wall',      odd:false, config:'[He] 2s²' },
  { num:5,  sym:'B',  name:'Boron',     mass:'10.811',  type:'Metalloid',        role:'Throttle / neutron absorber',      odd:true,  config:'[He] 2s² 2p¹' },
  { num:6,  sym:'C',  name:'Carbon',    mass:'12.011',  type:'Nonmetal',         role:'Armour / heat shield',             odd:false, config:'[He] 2s² 2p²' },
  { num:7,  sym:'N',  name:'Nitrogen',  mass:'14.007',  type:'Nonmetal',         role:'Plasma buffer field',              odd:true,  config:'[He] 2s² 2p³' },
  { num:8,  sym:'O',  name:'Oxygen',    mass:'15.999',  type:'Nonmetal',         role:'Plasma buffer field',              odd:false, config:'[He] 2s² 2p⁴' },
  { num:9,  sym:'F',  name:'Fluorine',  mass:'18.998',  type:'Halogen',          role:'EM skin / electronegativity field',odd:true,  config:'[He] 2s² 2p⁵' },
  { num:29, sym:'Cu', name:'Copper',    mass:'63.546',  type:'Transition Metal', role:'Receiver node / power bank',       odd:true,  config:'[Ar] 3d¹⁰ 4s¹' },
  { num:46, sym:'Pd', name:'Palladium', mass:'106.42',  type:'Transition Metal', role:'Inertial mid-layer',               odd:false, config:'[Kr] 4d¹⁰' },
  { num:47, sym:'Ag', name:'Silver',    mass:'107.868', type:'Transition Metal', role:'Source tone / signal origin',      odd:true,  config:'[Kr] 4d¹⁰ 5s¹' },
];

const CARD_COLORS = {
  'Nonmetal':       { bg:'rgba(0,229,255,.08)', accent:'#00e5ff' },
  'Noble Gas':      { bg:'rgba(124,77,255,.08)', accent:'#7c4dff' },
  'Alkali Metal':   { bg:'rgba(255,109,0,.08)', accent:'#ff6d00' },
  'Alkaline Metal': { bg:'rgba(0,229,255,.08)', accent:'#00e5ff' },
  'Metalloid':      { bg:'rgba(255,215,64,.08)', accent:'#ffd740' },
  'Halogen':        { bg:'rgba(255,109,0,.1)', accent:'#ff6d00' },
  'Transition Metal':{ bg:'rgba(124,77,255,.08)', accent:'#7c4dff' },
};

const elGrid   = document.getElementById('element-grid');
const elDetail = document.getElementById('el-detail');

ELEMENTS.forEach(el => {
  const c = CARD_COLORS[el.type] || { bg:'transparent', accent:'#00e5ff' };
  const div = document.createElement('div');
  div.className = 'el-card';
  div.style.setProperty('--card-glow', c.bg);
  div.innerHTML = `
    <div class="el-num">${el.num}</div>
    <div class="el-sym">${el.sym}</div>
    <div class="el-name">${el.name}</div>
  `;
  div.addEventListener('click', () => {
    document.querySelectorAll('.el-card').forEach(d => d.classList.remove('active'));
    div.classList.add('active');
    showDetail(el, c);
  });
  elGrid.appendChild(div);
});

function showDetail(el, c) {
  elDetail.innerHTML = `
    <div class="el-detail-header">
      <div class="el-detail-sym">${el.sym}</div>
      <div class="el-detail-info">
        <h2>${el.name}</h2>
        <p>Atomic #${el.num} · ${el.type} · ${el.odd ? '⚡ Odd / Reactive' : '⊕ Even / Inertial'}</p>
      </div>
    </div>
    <div class="el-props">
      <div class="el-prop"><div class="pk">Atomic Mass</div><div class="pv">${el.mass} u</div></div>
      <div class="el-prop"><div class="pk">Electron Config</div><div class="pv" style="font-size:.9rem">${el.config}</div></div>
      <div class="el-prop"><div class="pk">Layer Role</div><div class="pv" style="color:${c.accent};font-size:.85rem">${el.role}</div></div>
      <div class="el-prop"><div class="pk">Parity</div><div class="pv">${el.odd ? 'Odd (Receptive)' : 'Even (Inertial)'}</div></div>
    </div>
  `;
  elDetail.classList.add('visible');
}

/* =========================================================
   6. VEIN MAP CANVAS
   ========================================================= */
(function veinMap() {
  const canvas = document.getElementById('vein-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  const VEINS = [];
  const SIGNALS = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = Math.round(W * .48);
    canvas.style.height = H + 'px';
    buildVeins();
  }

  function buildVeins() {
    VEINS.length = 0;
    SIGNALS.length = 0;

    /* generate fractal-ish veins */
    for (let v = 0; v < 14; v++) {
      const sx = rand(0, W), sy = rand(0, H);
      let angle = rand(0, π * 2);
      const pts = [{ x: sx, y: sy }];
      const steps = Math.floor(rand(8, 22));
      for (let s = 0; s < steps; s++) {
        angle += rand(-.6, .6);
        const len = rand(18, 48);
        const lx = pts[pts.length-1].x + Math.cos(angle) * len;
        const ly = pts[pts.length-1].y + Math.sin(angle) * len;
        pts.push({ x: lx, y: ly });
        if (lx < 0 || lx > W || ly < 0 || ly > H) break;
      }
      const gold = Math.random() > .55;
      VEINS.push({ pts, gold, alpha: rand(.4, .85) });
    }

    /* signal propagation dots */
    for (let i = 0; i < 30; i++) {
      const vi = Math.floor(rand(0, VEINS.length));
      SIGNALS.push({ vi, t: rand(0, 1), speed: rand(.002, .008) });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* rock texture background */
    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rand(.01,.04)})`;
      ctx.fillRect(rand(0,W), rand(0,H), rand(.5,2.5), rand(.5,2.5));
    }

    /* veins */
    VEINS.forEach(v => {
      if (v.pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(v.pts[0].x, v.pts[0].y);
      for (let i = 1; i < v.pts.length; i++) {
        ctx.lineTo(v.pts[i].x, v.pts[i].y);
      }
      ctx.strokeStyle = v.gold
        ? `rgba(255,215,64,${v.alpha})`
        : `rgba(220,220,255,${v.alpha * .6})`;
      ctx.lineWidth = v.gold ? rand(1.5, 3.5) : rand(.8, 1.8);
      ctx.shadowColor = v.gold ? '#ffd740' : '#aaa';
      ctx.shadowBlur = v.gold ? 6 : 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* terminator dot */
      const last = v.pts[v.pts.length - 1];
      ctx.beginPath(); ctx.arc(last.x, last.y, 4, 0, π*2);
      ctx.fillStyle = v.gold ? '#ffd740' : '#fff';
      ctx.globalAlpha = v.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      /* direction arrow */
      if (v.pts.length >= 2) {
        const a = v.pts[v.pts.length - 2];
        const b = v.pts[v.pts.length - 1];
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-10, -5); ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fillStyle = v.gold ? '#ffd740' : '#8ab4c8';
        ctx.globalAlpha = v.alpha * .8;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    });

    /* signal pulses */
    SIGNALS.forEach(s => {
      const vein = VEINS[s.vi];
      if (!vein || vein.pts.length < 2) return;
      s.t += s.speed;
      if (s.t > 1) s.t = 0;
      const idx = s.t * (vein.pts.length - 1);
      const i0 = Math.floor(idx), i1 = Math.min(i0 + 1, vein.pts.length - 1);
      const frac = idx - i0;
      const x = lerp(vein.pts[i0].x, vein.pts[i1].x, frac);
      const y = lerp(vein.pts[i0].y, vein.pts[i1].y, frac);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
      g.addColorStop(0,  vein.gold ? '#ffd740' : '#00e5ff');
      g.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(x, y, 8, 0, π*2);
      ctx.fillStyle = g; ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* =========================================================
   7. LAYER DIAGRAM CANVAS (cross-section)
   ========================================================= */
(function layerDiagram() {
  const canvas = document.getElementById('layer-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  let t = 0;

  const LAYERS_DEF = [
    { label:'H / He / Li',   color:'#ff6d00', glow:'rgba(255,109,0,.6)',   note:'Well of Power' },
    { label:'Beryllium',     color:'#00e5ff', glow:'rgba(0,229,255,.5)',   note:'Reflector Wall' },
    { label:'Boron',         color:'#ffd740', glow:'rgba(255,215,64,.5)',  note:'Throttle' },
    { label:'Carbon',        color:'#8ab4c8', glow:'rgba(138,180,200,.4)', note:'Armour / Hull' },
    { label:'N / O Plasma',  color:'#7c4dff', glow:'rgba(124,77,255,.5)',  note:'Plasma Buffer' },
    { label:'Fluorine EM',   color:'#ff6d00', glow:'rgba(255,109,0,.55)',  note:'EM Skin' },
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = W;
    canvas.style.height = W + 'px';
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#03060e';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) / 2 - 18;
    const n = LAYERS_DEF.length;

    for (let i = n - 1; i >= 0; i--) {
      const r = maxR * ((i + 1) / n);
      const ld = LAYERS_DEF[i];
      const pulse = Math.sin(t * .03 + i * .7) * .12 + .88;

      /* ring glow */
      const grad = ctx.createRadialGradient(cx, cy, r * .55, cx, cy, r);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(.7, ld.glow.replace(/[\d.]+\)$/, `.${Math.round(pulse * 3)})`));
      grad.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, π*2);
      ctx.fillStyle = grad; ctx.fill();

      /* ring stroke */
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, π*2);
      ctx.strokeStyle = ld.color;
      ctx.lineWidth = i === 0 ? 2.5 : 1.5;
      ctx.globalAlpha = .5 + pulse * .4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      /* label */
      const labelR = r - maxR / n / 2;
      const lx = cx + labelR * Math.cos(-π / 2 - i * .38);
      const ly = cy + labelR * Math.sin(-π / 2 - i * .38);
      ctx.fillStyle = ld.color;
      ctx.font = `bold ${Math.max(9, Math.round(W * .028))}px 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ld.label, lx, ly);
    }

    /* nucleus pulse */
    const nr = maxR * (1/n) * .55;
    const np = Math.sin(t * .05) * .2 + .8;
    const ng = ctx.createRadialGradient(cx,cy,0,cx,cy,nr);
    ng.addColorStop(0,   '#fff');
    ng.addColorStop(.4, '#ff6d00');
    ng.addColorStop(1,  'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, nr * np, 0, π*2);
    ctx.fillStyle = ng; ctx.fill();

    /* rotating ring indicator */
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * .008);
    ctx.beginPath();
    ctx.arc(0, 0, maxR + 10, 0, π * 1.6);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = .4;
    ctx.setLineDash([8, 14]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();

    t++;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* =========================================================
   8. SCROLL REVEAL
   ========================================================= */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); }
  });
}, { threshold: .12 });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));
