// A damped spring that writes straight to the DOM, so a swinging needle costs no React renders.
// Angles are in degrees and never wrap: the needle takes the short way round unless told to spin.
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function createSpring({ value = 0, stiffness = 60, damping = 5.2, onUpdate }) {
  let x = value;
  let v = 0;
  let target = value;
  let raf = 0;
  let last = 0;

  const frame = now => {
    raf = 0;
    const dt = Math.min(0.2, (now - last) / 1000 || 0.016); // a slow machine drops frames, it does not slow the swing
    last = now;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      v += (stiffness * (target - x) - damping * v) * h;
      x += v * h;
    }
    if (Math.abs(v) < 0.02 && Math.abs(target - x) < 0.02) {
      x = target;
      v = 0;
      onUpdate(x);
      return;
    }
    onUpdate(x);
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  return {
    get value() {
      return x;
    },
    get target() {
      return target;
    },
    // Go to an absolute angle, by the shortest turn from where the needle rests now.
    to(angle) {
      const delta = ((((angle - target) % 360) + 540) % 360) - 180;
      target += delta;
      if (reduced()) {
        x = target;
        v = 0;
        onUpdate(x);
        return;
      }
      wake();
    },
    // Add whole turns on the way, for an entrance.
    spinTo(angle, turns = 2) {
      const delta = ((((angle - target) % 360) + 540) % 360) - 180;
      target += delta + 360 * turns;
      if (reduced()) {
        x = target;
        onUpdate(x);
        return;
      }
      wake();
    },
    kick(velocity) {
      if (reduced()) return;
      v += velocity;
      wake();
    },
    jump(angle) {
      x = angle;
      target = angle;
      v = 0;
      onUpdate(x);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}
