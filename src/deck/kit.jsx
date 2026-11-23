import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Counter from '../rb/Counter.jsx';
import OptionWheel from '../rb/OptionWheel.jsx';
import StrokeText from '../rb/StrokeText.jsx';
import { Compass } from '../brand/Compass.jsx';
import { RakayaMark } from '../brand/RakayaMark.jsx';
import { PARTS, TEAL, CHARCOAL, PAPER } from '../brand/palette.js';
import { u, useUnit } from '../engine/unit.js';

export const cx = (...names) => names.filter(Boolean).join(' ');

// Latin words and digits inside an Arabic line.
export const L = ({ children, className }) => <span className={cx('ltr', className)}>{children}</span>;

// ---------- The bar on top of every slide but the first and the last ----------
export function Bar({ part, n, total, hidden }) {
  return (
    <header className={cx('bar', hidden && 'is-off')} style={{ '--i': part.n - 1 }}>
      <div className="bar__chip">
        <RakayaMark className="bar__mark" fill={TEAL} square={CHARCOAL} />
        <span className="bar__name" key={part.n}>
          {part.name}
        </span>
      </div>
      <div className="bar__tape" aria-hidden="true">
        {PARTS.map(p => (
          <span key={p.n} className={cx('bar__stop', p.n < part.n && 'is-done')} style={{ '--k': p.n - 1 }} />
        ))}
        <span className="bar__dot" />
      </div>
      <span className="bar__page ltr">
        {n} / {total}
      </span>
    </header>
  );
}

// ---------- The big dial: Rakaya's mark as the rose, the parts written round it ----------
const NAMES = PARTS.map(part => part.name);
const RING = { x: 358, y: 540, r: 262 };
const WHEEL_R = 300;
const WHEEL_FONT = 34;
const WHEEL_TILT = 40; // degrees between two parts, the same as on the ring

// React Bits' Option Wheel as the compass card: the current part on the needle's line,
// the parts before and after it turning away on either side.
function PartWheel({ active }) {
  const unit = useUnit();
  const ref = useRef(null);
  const rem = typeof window === 'undefined' ? 16 : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  useEffect(() => {
    ref.current?.querySelectorAll('[role="option"]')?.[active - 1]?.click();
  }, [active]);

  return (
    <div className="dial__wheel" ref={ref} inert onClick={event => event.stopPropagation()}>
      <OptionWheel
        items={NAMES}
        defaultSelected={active - 1}
        side="left"
        loop
        fontSize={(WHEEL_FONT * unit) / rem}
        spacing={(WHEEL_R * ((WHEEL_TILT * Math.PI) / 180)) / WHEEL_FONT}
        tilt={WHEEL_TILT}
        blur={1}
        fade={0.56}
        minOpacity={0}
        smoothing={260}
        inset={(RING.x + WHEEL_R) * unit}
        textColor="#5F6F70"
        activeColor={PARTS[active - 1].deep}
        draggable={false}
      />
    </div>
  );
}

export function BigDial({ part, from, intro = false }) {
  const [active, setActive] = useState(from ?? part);
  useEffect(() => {
    if (active === part) return undefined;
    const timer = setTimeout(() => setActive(part), 650);
    return () => clearTimeout(timer);
  }, [active, part]);

  const current = PARTS[active - 1];
  const ticks = [];
  for (let i = 0; i < 180; i++) {
    const major = i % 5 === 0;
    ticks.push(
      <line key={i} x1="0" y1={-RING.r} x2="0" y2={-RING.r + (major ? 16 : 8)} transform={`rotate(${i * 2})`} strokeWidth={major ? 1.6 : 1} />
    );
  }
  return (
    <>
      <svg className="dial" viewBox="0 0 1920 1080" aria-hidden="true">
        <g transform={`translate(${RING.x} ${RING.y})`}>
          <g className={cx('dial__card', intro && 'dial__card--intro')} style={{ transform: `rotate(${90 - current.bearing}deg)` }}>
            <circle r={RING.r} fill="none" stroke={TEAL} strokeOpacity="0.5" strokeWidth="1.6" />
            <circle r={RING.r - 26} fill="none" stroke={TEAL} strokeOpacity="0.16" strokeWidth="1" />
            <g stroke={TEAL} strokeOpacity="0.42" strokeLinecap="round">
              {ticks}
            </g>
            {PARTS.map(p => {
              const a = (p.bearing * Math.PI) / 180;
              return (
                <circle
                  key={p.n}
                  cx={Math.sin(a) * RING.r}
                  cy={-Math.cos(a) * RING.r}
                  r={p.n === active ? 11 : 6}
                  fill={p.deep}
                  stroke={PAPER}
                  strokeWidth="4"
                />
              );
            })}
          </g>
          <line x1={RING.r + 14} y1="0" x2={WHEEL_R - 6} y2="0" stroke={current.deep} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
      <div className="dial__rose">
        <Compass
          bearing={90}
          active={active}
          tone="deep"
          mark={TEAL}
          square={CHARCOAL}
          ring="transparent"
          ground={PAPER}
          south={CHARCOAL}
          dots={false}
          ticks={false}
          spinIn={intro}
          markSize={372}
          needleLength={250}
          needleWidth={12}
        />
      </div>
      <PartWheel active={active} />
    </>
  );
}

// ---------- Arabic joining for Stroke Text ----------
// Stroke Text puts every letter in its own <tspan> so it can draw them one after another.
// Chromium and Firefox still shape the line as one run. WebKit (Safari, and every browser on
// iOS) shapes each <tspan> alone: the letters lose their joined forms and the line grows by a
// third, into whatever sits beside it. Where that happens the line is moved into its first
// <tspan>, so it is shaped whole: it is drawn and inked as one piece instead of letter by letter,
// and ends up looking the same as everywhere else.
const SVG_NS = 'http://www.w3.org/2000/svg';

let tspansShapeAlone;
const shapesTspansAlone = () => {
  if (tspansShapeAlone !== undefined) return tspansShapeAlone;
  tspansShapeAlone = false;
  try {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '10');
    svg.setAttribute('height', '10');
    svg.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;font:100px sans-serif';
    const line = split => {
      const node = document.createElementNS(SVG_NS, 'text');
      for (const piece of split ? ['ل', 'ي', 'ن'] : ['لين']) {
        const span = document.createElementNS(SVG_NS, 'tspan');
        span.textContent = piece;
        node.appendChild(span);
      }
      svg.appendChild(node);
      return node;
    };
    const whole = line(false);
    const letters = line(true);
    document.body.appendChild(svg);
    const a = whole.getBBox().width;
    const b = letters.getBBox().width;
    svg.remove();
    tspansShapeAlone = a > 0 && Math.abs(a - b) > a * 0.03;
  } catch {
    /* no SVG text measuring: leave the line as it is */
  }
  return tspansShapeAlone;
};

// Runs before the component's own measuring pass after fonts are ready (a microtask queued at
// mount), so the line is sized from the joined letters.
const joinLetters = root => {
  root.querySelectorAll('text').forEach(node => {
    const spans = [...node.children].filter(child => child.tagName === 'tspan');
    if (spans.length < 2 || !spans[1].textContent) return;
    const line = spans.map(span => span.textContent).join('');
    spans.forEach((span, k) => {
      span.textContent = k === 0 ? line : '';
    });
  });
};

// One line drawn as an outline and then inked in (React Bits, Stroke Text).
// The component sizes itself to its box; this pins it to an exact size in stage units.
export function StrokeLine({ text, size, color, wait = 0, weight = 700 }) {
  const ref = useRef(null);
  const [live, setLive] = useState(wait === 0);

  useEffect(() => {
    if (live) return undefined;
    const timer = setTimeout(() => setLive(true), wait);
    return () => clearTimeout(timer);
  }, [live, wait]);

  useLayoutEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return undefined;
    if (shapesTspansAlone()) joinLetters(svg);
    const fit = () => {
      const box = svg.viewBox.baseVal;
      if (!box || !box.width) return;
      svg.style.maxWidth = 'none';
      svg.style.margin = '0';
      svg.style.width = `calc(${((box.width * size) / 100).toFixed(2)} * var(--u))`;
    };
    fit();
    const observer = new MutationObserver(fit);
    observer.observe(svg, { attributes: true, attributeFilter: ['viewBox'] });
    return () => observer.disconnect();
  }, [live, size, text]);

  return (
    <span className="stroke" ref={ref} style={{ height: u(size * 1.42) }} aria-hidden="true">
      {live && (
        <StrokeText
          text={text}
          fontFamily="'Readex Pro', 'IBM Plex Sans Arabic', sans-serif"
          fontWeight={weight}
          fontSize={100}
          letterSpacing={0}
          strokeColor={color}
          fillColor={color}
          strokeWidth={0.9}
          drawDuration={1.15}
          stagger={0.07}
          fillDelay={0.05}
          wipeFrom="right"
          ease="power2.inOut"
        />
      )}
    </span>
  );
}

// ---------- Countdown: a dial that drains, with the time on an odometer ----------
// `go` starts it (the slide's build step); a click on the dial pauses and resumes; T does the same.
export function Timer({ seconds, go }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [touched, setTouched] = useState(false);
  const clock = useRef({ end: 0, remain: seconds * 1000 });

  const start = () => {
    if (clock.current.remain <= 0) return;
    clock.current.end = performance.now() + clock.current.remain;
    setRunning(true);
    setTouched(true);
  };
  const pause = () => {
    clock.current.remain = Math.max(0, clock.current.end - performance.now());
    setRunning(false);
  };
  const reset = () => {
    clock.current.remain = seconds * 1000;
    setRunning(false);
    setLeft(seconds);
    setTouched(false);
  };
  const toggle = () => {
    if (left <= 0) reset();
    else if (running) pause();
    else start();
  };

  useEffect(() => {
    if (go) start();
    else reset();
    // Only the build step drives this; the handlers above are stable enough for that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go]);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      const ms = clock.current.end - performance.now();
      const next = Math.max(0, Math.ceil(ms / 1000));
      setLeft(next);
      if (next <= 0) {
        clock.current.remain = 0;
        setRunning(false);
      }
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [running]);

  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;
  useEffect(() => {
    const onKey = event => {
      if (event.key === 't' || event.key === 'T' || event.key === 'ف') toggleRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const R = 214;
  const round = 2 * Math.PI * R;
  const done = left <= 0;
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    ticks.push(<line key={i} x1="0" y1={-R + 20} x2="0" y2={-R + (major ? 44 : 32)} transform={`rotate(${i * 6})`} strokeWidth={major ? 3 : 1.6} />);
  }
  const digits = { fontSize: u(118), fontWeight: 500, duration: 0.45, bounce: 0, stagger: 0, fade: 0.2, intro: false };

  return (
    <div className={cx('timer', running && 'is-running', done && 'is-done', touched && 'is-touched')} data-hold>
      <button
        type="button"
        className="timer__dial"
        onClick={toggle}
        aria-label={done ? 'أعد المؤقت' : running ? 'أوقف المؤقت' : 'شغّل المؤقت'}
      >
        <svg className="timer__ring" viewBox="-230 -230 460 460" aria-hidden="true">
          <circle r={R} fill="var(--sheet)" stroke="var(--rule)" strokeWidth="2" />
          <g stroke="var(--ink)" strokeOpacity="0.4" strokeLinecap="round">
            {ticks}
          </g>
          <circle
            className="timer__arc"
            r={R}
            fill="none"
            stroke="var(--acc)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={round}
            strokeDashoffset={round * (1 - left / seconds)}
            transform="rotate(-90)"
          />
        </svg>
        <span className="timer__time">
          <Counter value={Math.floor(left / 60)} {...digits} />
          <span className="timer__colon">:</span>
          <Counter value={left % 60} minDigits={2} {...digits} />
        </span>
        <svg className="timer__state" viewBox="0 0 24 24" aria-hidden="true">
          {running ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : done ? null : <path d="M7 4l13 8-13 8z" />}
        </svg>
      </button>
      <button type="button" className="timer__reset" onClick={reset} aria-label="أعد المؤقت من البداية">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12a8 8 0 1 0 2.6-5.9" />
          <path d="M4 4v4.5h4.5" />
        </svg>
      </button>
    </div>
  );
}

export { Counter, Compass, RakayaMark, PARTS, TEAL, CHARCOAL, PAPER, u, useUnit };
