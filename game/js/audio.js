const SOUNDS = new Map([
  ['ui.click', [420, 0.04]],
  ['store.scan', [880, 0.08]],
  ['store.coffee', [240, 0.16]],
  ['store.receipt', [620, 0.1]],
  ['store.lock', [130, 0.12]],
  ['store.unlock', [520, 0.14]],
  ['warehouse.place', [180, 0.08]],
  ['warehouse.cable', [330, 0.12]],
  ['warehouse.dial', [460, 0.06]],
  ['warehouse.portal', [110, 0.4]],
]);

/**
 * Create a dependency-free Web Audio manager.
 * @returns {import('./contracts.js').AudioManager}
 */
export function createAudioManager() {
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
  let context = null;
  let ambience = null;
  let ambienceRequested = false;
  let destroyed = false;

  async function unlock() {
    if (destroyed || !AudioContextClass) return;
    if (!context) context = new AudioContextClass();
    if (context.state === 'suspended') await context.resume();
    if (ambienceRequested) startAmbience();
  }

  /** @param {import('./contracts.js').SoundId} id */
  function play(id) {
    if (destroyed || !context || context.state !== 'running') return;
    const sound = SOUNDS.get(id);
    if (!sound) return;

    const [frequency, duration] = sound;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    }, { once: true });
  }

  function startAmbience() {
    ambienceRequested = true;
    if (destroyed || !context || context.state !== 'running' || ambience) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 55;
    gain.gain.value = 0.008;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    ambience = { oscillator, gain };
  }

  function stopAmbience() {
    ambienceRequested = false;
    if (!ambience) return;
    ambience.oscillator.stop();
    ambience.oscillator.disconnect();
    ambience.gain.disconnect();
    ambience = null;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stopAmbience();
    if (context && context.state !== 'closed') {
      void context.close().catch(() => {});
    }
    context = null;
  }

  return { unlock, play, startAmbience, stopAmbience, destroy };
}
