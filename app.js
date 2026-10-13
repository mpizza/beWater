// ===========================
// WATER PHRASES
// ===========================
const phrases = [
  { text: 'Flow',               size: '3.5rem'  },
  { text: 'Adapt',              size: '2.8rem'  },
  { text: 'Be Water',           size: '4rem'    },
  { text: 'Empty your mind',    size: '2rem'    },
  { text: 'Be formless',        size: '2.4rem'  },
  { text: 'Find the way',       size: '2.2rem'  },
  { text: 'Be shapeless',       size: '2.3rem'  },
  { text: '水善利萬物',          size: '2.6rem'  },
  { text: 'Unstoppable',        size: '3rem'    },
  { text: 'Yield to overcome',  size: '1.8rem'  },
  { text: 'Soft overcomes hard',size: '1.8rem'  },
  { text: 'Like water…',        size: '3.2rem'  },
  { text: 'Crash or flow',      size: '2.4rem'  },
  { text: 'Fluid',              size: '4.5rem'  },
  { text: 'My friend',          size: '2rem'    },
];

let phraseIndex = 0;

// ===========================
// RIPPLE ENGINE
// ===========================
const canvas = document.getElementById('ripple-canvas');
const ctx    = canvas.getContext('2d');
let ripples  = [];

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Ripple {
  constructor(x, y, opts = {}) {
    this.x         = x;
    this.y         = y;
    this.radius    = opts.radius    ?? 0;
    this.maxRadius = opts.maxRadius ?? (Math.random() * 140 + 80);
    this.alpha     = opts.alpha     ?? 0.75;
    this.speed     = opts.speed     ?? (Math.random() * 2 + 2);
    this.lineWidth = opts.lineWidth ?? (Math.random() * 1.5 + 0.8);
    this.color     = opts.color     ?? '0, 212, 255';
    this.rings     = opts.rings     ?? 2;
  }

  update() {
    this.radius += this.speed;
    this.alpha  -= this.speed / (this.maxRadius * 1.6);
  }

  draw() {
    for (let r = 0; r < this.rings; r++) {
      const rr = this.radius - r * 28;
      if (rr <= 0) continue;
      const a = Math.max(0, this.alpha - r * 0.18);
      ctx.beginPath();
      ctx.arc(this.x, this.y, rr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.color}, ${a})`;
      ctx.lineWidth   = this.lineWidth * (1 - r * 0.25);
      ctx.shadowBlur  = 18;
      ctx.shadowColor = `rgba(${this.color}, ${a * 0.5})`;
      ctx.stroke();
    }
  }

  isDone() { return this.alpha <= 0 || this.radius >= this.maxRadius; }
}

// Ambient slow ripple
let ambientTick = 0;
function spawnAmbient() {
  ripples.push(new Ripple(
    Math.random() * canvas.width,
    Math.random() * canvas.height,
    { maxRadius: 70, alpha: 0.12, speed: 0.7, lineWidth: 0.8, rings: 1 }
  ));
}

function loop() {
  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ambientTick++;
  if (ambientTick % 140 === 0) spawnAmbient();

  ripples = ripples.filter(r => !r.isDone());
  ripples.forEach(r => { r.update(); r.draw(); });
}
loop();

// ===========================
// CLICK — SPAWN RIPPLES + WORD
// ===========================
const wordContainer = document.getElementById('word-container');

function spawnRipples(x, y) {
  // 3 concentric bursts at slightly different speeds
  [
    { speed: 2.5, maxRadius: 100, alpha: 0.85, lineWidth: 2.0, rings: 2 },
    { speed: 1.8, maxRadius: 160, alpha: 0.55, lineWidth: 1.2, rings: 1 },
    { speed: 3.5, maxRadius:  60, alpha: 0.65, lineWidth: 1.0, rings: 1 },
  ].forEach(opts => ripples.push(new Ripple(x, y, opts)));
}

function spawnWord(x, y) {
  const phrase = phrases[phraseIndex % phrases.length];
  phraseIndex++;

  const el = document.createElement('div');
  el.className  = 'water-word';
  el.textContent = phrase.text;
  el.style.left  = x + 'px';
  el.style.top   = y + 'px';
  el.style.fontSize = phrase.size;

  wordContainer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

document.addEventListener('click', (e) => {
  spawnRipples(e.clientX, e.clientY);
  spawnWord(e.clientX, e.clientY);

  // Fade the hint after first click
  const hint = document.getElementById('hint');
  if (hint) {
    hint.style.transition = 'opacity 0.6s';
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 700);
  }
});
