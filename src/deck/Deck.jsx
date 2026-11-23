import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage } from '../engine/Stage.jsx';
import { partOfSlide } from '../brand/palette.js';
import { Bar } from './kit.jsx';
import { SLIDES, TOTAL } from './slides.js';
import { Index } from './Index.jsx';
import './deck.css';

// Where the address bar says we are: #s12 is slide 12, #index is the list of slides.
const fromHash = () => {
  const hash = typeof location === 'undefined' ? '' : location.hash;
  if (hash === '#index') return -1;
  const found = SLIDES.findIndex(slide => `#s${slide.n}` === hash);
  return found < 0 ? 0 : found;
};

// A phone held upright: the slide is turned on its side so it fills the screen once the phone is tilted.
const UPRIGHT_PHONE = '(orientation: portrait) and (max-width: 820px)';
const useTurned = () => {
  const [turned, setTurned] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(UPRIGHT_PHONE).matches);
  useEffect(() => {
    const query = matchMedia(UPRIGHT_PHONE);
    const read = () => setTurned(query.matches);
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);
  return turned;
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export function Deck() {
  const turned = useTurned();
  const [index, setIndex] = useState(fromHash); // -1 = the list of slides
  const [step, setStep] = useState(0);
  const [hud, setHud] = useState(false);
  const hudTimer = useRef(0);
  const slide = SLIDES[Math.max(0, index)];

  const open = useCallback((next, nextStep = 0) => {
    setIndex(next);
    setStep(nextStep);
    const name = next >= 0 ? `s${SLIDES[next].n}` : 'index';
    try {
      if (location.hash !== `#${name}`) history.replaceState(null, '', `#${name}`);
    } catch {
      /* the hash is a convenience only */
    }
  }, []);

  const forward = useCallback(() => {
    if (index < 0) return open(0);
    if (step < slide.steps) return setStep(step + 1);
    if (index < SLIDES.length - 1) return open(index + 1);
    return undefined;
  }, [index, step, slide, open]);

  const back = useCallback(() => {
    if (index < 0) return undefined;
    if (step > 0) return setStep(step - 1);
    if (index > 0) return open(index - 1, SLIDES[index - 1].steps);
    return undefined;
  }, [index, step, open]);

  const toggleFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else document.documentElement.requestFullscreen?.().catch(() => {});
    } catch {
      /* some frames refuse fullscreen; the deck still fills the window */
    }
  }, []);

  useEffect(() => {
    const onKey = event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(key)) {
        if (key === ' ' || key === 'Enter') {
          // Space or Enter on a focused control belongs to that control.
          if (event.target.closest?.('button, a, input, select, textarea')) return;
        }
        event.preventDefault();
        forward();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(key)) {
        event.preventDefault();
        back();
      } else if (key === 'Escape') {
        if (!document.fullscreenElement) open(index < 0 ? 0 : -1);
      } else if (key === 'f' || key === 'F' || key === 'ب') {
        toggleFullscreen();
      } else if (key === 'Home') {
        open(0);
      } else if (key === 'End') {
        open(SLIDES.length - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [forward, back, open, toggleFullscreen, index]);

  useEffect(() => {
    const onHash = () => {
      setIndex(fromHash());
      setStep(0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const showHud = useCallback(() => {
    setHud(true);
    clearTimeout(hudTimer.current);
    hudTimer.current = setTimeout(() => setHud(false), 2400);
  }, []);

  if (index < 0) return <Index onOpen={open} />;

  const part = partOfSlide(slide.n);
  const Slide = slide.Component;
  return (
    <div className={`show${turned ? ' show--turned' : ''}`} onPointerMove={showHud} onPointerDown={showHud}>
      <Stage
        onClick={event => {
          // A click on a control inside the slide belongs to that control, not to "next".
          if (event.target.closest?.('button, a, input, select, textarea, [role="option"], [data-hold]')) return;
          forward();
        }}
      >
        <div className="deck" style={{ '--acc': part.deep }}>
          <Bar part={part} n={slide.n} total={TOTAL} hidden={slide.bare} />
          <Slide key={slide.n} step={step} />
        </div>
      </Stage>
      <div className={`hud${hud ? ' hud--on' : ''}`}>
        <button type="button" className="hud__back" onClick={back} aria-label="الخطوة السابقة">
          <Icon d="M9 5l7 7-7 7" />
          <span>السابق</span>
        </button>
        <button type="button" onClick={() => open(-1)} aria-label="كل الشرائح">
          <Icon d="M4 6h16M4 12h16M4 18h16" />
          <span>
            كل الشرائح <kbd>Esc</kbd>
          </span>
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label="ملء الشاشة">
          <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          <span>
            ملء الشاشة <kbd>F</kbd>
          </span>
        </button>
      </div>
    </div>
  );
}
