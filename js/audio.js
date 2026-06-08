// ==================== AUDIO ENGINE ====================
let audioCtx = null;
let masterGain = null;
let globalVolume = 0.5;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = globalVolume;
  masterGain.connect(audioCtx.destination);
}

function setVolume(v) {
  globalVolume = v;
  if (masterGain) masterGain.gain.value = v;
}

document.getElementById('volumeSlider').addEventListener('input', e => {
  setVolume(e.target.value / 100);
});

function createNoiseBuffer(duration) {
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

let noiseBuffer = null;
function ensureNoiseBuffer() {
  if (!noiseBuffer) noiseBuffer = createNoiseBuffer(2);
}

function playShootSound() {
  if (!audioCtx) return;
  ensureNoiseBuffer();
  const t = audioCtx.currentTime;
  const ns = audioCtx.createBufferSource();
  ns.buffer = noiseBuffer;
  const nf = audioCtx.createBiquadFilter();
  nf.type = 'lowpass';
  nf.frequency.setValueAtTime(3000, t);
  nf.frequency.exponentialRampToValueAtTime(200, t + 0.15);
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.8, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  ns.connect(nf).connect(ng).connect(masterGain);
  ns.start(t); ns.stop(t + 0.25);
  const osc = audioCtx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
  const og = audioCtx.createGain();
  og.gain.setValueAtTime(0.5, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(og).connect(masterGain);
  osc.start(t); osc.stop(t + 0.15);
  const cr = audioCtx.createOscillator();
  cr.type = 'sawtooth';
  cr.frequency.setValueAtTime(800, t);
  cr.frequency.exponentialRampToValueAtTime(100, t + 0.05);
  const cg = audioCtx.createGain();
  cg.gain.setValueAtTime(0.3, t);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  cr.connect(cg).connect(masterGain);
  cr.start(t); cr.stop(t + 0.08);
}

function playEnemyShootSound(distance) {
  if (!audioCtx) return;
  ensureNoiseBuffer();
  const t = audioCtx.currentTime;
  const df = Math.max(0.2, 1 - distance / 30);
  const ns = audioCtx.createBufferSource();
  ns.buffer = noiseBuffer;
  const nf = audioCtx.createBiquadFilter();
  nf.type = 'lowpass';
  nf.frequency.setValueAtTime(2000 * df, t);
  nf.frequency.exponentialRampToValueAtTime(150, t + 0.12);
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.4 * df, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  ns.connect(nf).connect(ng).connect(masterGain);
  ns.start(t); ns.stop(t + 0.2);
}

function playHitSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.4, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(g).connect(masterGain);
  osc.start(t); osc.stop(t + 0.12);
}

function playDeathSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(g).connect(masterGain);
  osc.start(t); osc.stop(t + 0.55);
}

function playDamageSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.linearRampToValueAtTime(80, t + 0.2);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.connect(g).connect(masterGain);
  osc.start(t); osc.stop(t + 0.3);
}

function playReloadSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const c1 = audioCtx.createOscillator();
  c1.type = 'square'; c1.frequency.value = 1200;
  const cg1 = audioCtx.createGain();
  cg1.gain.setValueAtTime(0.2, t);
  cg1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  c1.connect(cg1).connect(masterGain);
  c1.start(t); c1.stop(t + 0.04);
  ensureNoiseBuffer();
  const sl = audioCtx.createBufferSource();
  sl.buffer = noiseBuffer;
  const sf = audioCtx.createBiquadFilter();
  sf.type = 'bandpass';
  sf.frequency.setValueAtTime(800, t + 0.2);
  sf.frequency.linearRampToValueAtTime(2000, t + 0.8);
  const sg = audioCtx.createGain();
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(0.15, t + 0.3);
  sg.gain.linearRampToValueAtTime(0.15, t + 0.7);
  sg.gain.linearRampToValueAtTime(0, t + 1.0);
  sl.connect(sf).connect(sg).connect(masterGain);
  sl.start(t); sl.stop(t + 1.1);
  const c2 = audioCtx.createOscillator();
  c2.type = 'square'; c2.frequency.value = 1400;
  const cg2 = audioCtx.createGain();
  cg2.gain.setValueAtTime(0.25, t + 1.2);
  cg2.gain.exponentialRampToValueAtTime(0.001, t + 1.23);
  c2.connect(cg2).connect(masterGain);
  c2.start(t + 1.2); c2.stop(t + 1.25);
}

function playEmptyClick() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'square'; osc.frequency.value = 2000;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  osc.connect(g).connect(masterGain);
  osc.start(t); osc.stop(t + 0.04);
}

function playGameOverSound() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [200, 160, 120].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.3, t + i * 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.3 + 0.4);
    osc.connect(g).connect(masterGain);
    osc.start(t + i * 0.3); osc.stop(t + i * 0.3 + 0.45);
  });
}
