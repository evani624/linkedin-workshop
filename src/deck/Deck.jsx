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
// Phones only: a tablet or a narrow desktop window keeps the slide the right way up.
const UPRIGHT_PHONE = '(orientation: portrait) and (max-width: 600px) and (pointer: coarse)';
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

// The build step of the slide we were on, so a reload (or the browser throwing the page away
// while the phone sleeps) comes back to the same press. Kept for this tab only.
const STEP_KEY = 'deck:step';
const savedStep = at => {
  try {
    const [n, step] = (sessionStorage.getItem(STEP_KEY) || '').split(':').map(Number);
    const slide = SLIDES[at];
    return slide && n === slide.n && step > 0 && step <= slide.steps ? step : 0;
  } catch {
    return 0;
  }
};

// Fullscreen is missing on iPhone and prefixed on older iPad Safari.
const canFullscreen = () => {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement;
  if (el.requestFullscreen) return document.fullscreenEnabled !== false;
  return Boolean(el.webkitRequestFullscreen && document.webkitFullscreenEnabled !== false);
};
const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export function Deck() {
  const turned = useTurned();
  const [index, setIndex] = useState(fromHash); // -1 = the list of slides
  const [step, setStep] = useState(() => savedStep(fromHash()));
  const [hud, setHud] = useState(false);
  const [fullscreen] = useState(canFullscreen);
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

  useEffect(() => {
    try {
      if (index >= 0) sessionStorage.setItem(STEP_KEY, `${SLIDES[index].n}:${step}`);
    } catch {
      /* private mode: the step is simply not remembered */
    }
  }, [index, step]);

  const toggleFullscreen = useCallback(() => {
    try {
      const el = document.documentElement;
      if (fullscreenElement()) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else el.webkitRequestFullscreen?.();
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
        if (!fullscreenElement()) open(index < 0 ? 0 : -1);
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
      <div className="show__frame">
        <div className="show__body">
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
          {/* With a mouse: three pills that show when the pointer moves. On a touch screen: a rail
              beside the slide, never on top of it. */}
          <div className={`hud${hud ? ' hud--on' : ''}`}>
            <button type="button" className="hud__touch" onClick={back} disabled={index === 0 && step === 0} aria-label="الخطوة السابقة">
              <Icon d="M9 5l7 7-7 7" />
            </button>
            <button
              type="button"
              className="hud__touch"
              onClick={forward}
              disabled={index === SLIDES.length - 1 && step >= slide.steps}
              aria-label="الخطوة التالية"
            >
              <Icon d="M15 5l-7 7 7 7" />
            </button>
            <button type="button" onClick={() => open(-1)} aria-label="كل الشرائح">
              <Icon d="M4 6h16M4 12h16M4 18h16" />
              <span>
                كل الشرائح <kbd>Esc</kbd>
              </span>
            </button>
            {fullscreen && (
              <button type="button" onClick={toggleFullscreen} aria-label="ملء الشاشة">
                <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                <span>
                  ملء الشاشة <kbd>F</kbd>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
