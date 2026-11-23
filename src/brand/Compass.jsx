import { useEffect, useRef } from 'react';
import { MarkShapes } from './RakayaMark.jsx';
import { PARTS } from './palette.js';
import { createSpring } from '../engine/spring.js';

// Rakaya's mark as a compass rose: a ring with the nine parts at their bearings
// (40 degrees apart, each in its own colour) and a needle that pivots on the mark's centre square.
export function Compass({
  active = 1,
  bearing,
  tone = 'tint',
  mark = '#FFFFFF',
  square,
  ring = 'rgba(255,255,255,0.3)',
  ground = '#0C3B40',
  south = '#FFFFFF',
  north,
  dots = true,
  ticks = true,
  spinIn = false,
  undecided = false,
  swing = 62,
  needle = true,
  r = 250,
  markSize = 372,
  needleLength = 236,
  needleWidth = 13,
  loops,
  loopOpacity,
  className = '',
  label
}) {
  const needleRef = useRef(null);
  const springRef = useRef(null);
  const part = PARTS[active - 1] ?? PARTS[0];
  const accent = north ?? part[tone];
  const angle = bearing ?? part.bearing;

  useEffect(() => {
    const spring = createSpring({
      value: spinIn ? angle - 200 : angle,
      onUpdate: value => needleRef.current?.setAttribute('transform', `rotate(${value.toFixed(2)})`)
    });
    springRef.current = spring;
    spring.jump(spinIn ? angle - 200 : angle);
    if (spinIn) spring.spinTo(angle, 2);
    return () => spring.stop();
    // The spring lives as long as the compass; later moves go through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const spring = springRef.current;
    if (!spring) return undefined;
    if (!undecided) {
      spring.to(angle);
      return undefined;
    }
    let side = 1;
    spring.to(angle + swing);
    const timer = setInterval(() => {
      side = -side;
      spring.to(angle + side * swing);
    }, 1150);
    return () => clearInterval(timer);
  }, [angle, undecided, swing]);

  const tickMarks = [];
  if (ticks) {
    for (let i = 0; i < 72; i++) {
      if (i % 8 === 0) continue;
      const long = i % 2 === 0;
      tickMarks.push(
        <line
          key={i}
          x1="0"
          y1={-r - (long ? 9 : 5)}
          x2="0"
          y2={-r + (long ? 9 : 5)}
          transform={`rotate(${i * 5})`}
          stroke={ring}
          strokeWidth={long ? 2 : 1.5}
          strokeLinecap="round"
        />
      );
    }
  }

  return (
    <svg
      className={`compass ${className}`}
      viewBox="-300 -300 600 600"
      role="img"
      aria-label={label ?? `بوصلة ركايا، الجزء ${part.n}: ${part.name}`}
    >
      <circle className="compass__ring" r={r} fill="none" stroke={ring} strokeWidth="2" />
      {tickMarks}
      {dots &&
        PARTS.map(p => {
          const on = p.n === part.n;
          const a = (p.bearing * Math.PI) / 180;
          return (
            <circle
              key={p.n}
              className={`compass__dot${on ? ' compass__dot--on' : ''}`}
              cx={Math.sin(a) * r}
              cy={-Math.cos(a) * r}
              r={on ? 13 : 7}
              fill={p[tone]}
              stroke={ground}
              strokeWidth={on ? 5 : 4}
              opacity={on ? 1 : 0.55}
            />
          );
        })}
      <g className="compass__mark">
        <MarkShapes size={markSize} fill={mark} square={square} loops={loops} loopOpacity={loopOpacity} />
      </g>
      {needle && (
        <g ref={needleRef} className="compass__needle">
          <path
            d={`M${-needleWidth} 0 L0 ${-needleLength} L${needleWidth} 0 L0 ${needleLength * 0.62} Z`}
            fill={ground}
            stroke={ground}
            strokeWidth="9"
            strokeLinejoin="round"
          />
          <path d={`M${-needleWidth} 0 L0 ${-needleLength} L${needleWidth} 0 Z`} fill={accent} />
          <path d={`M${-needleWidth} 0 L0 ${needleLength * 0.62} L${needleWidth} 0 Z`} fill={south} />
          <circle r="7" fill={ground} />
        </g>
      )}
    </svg>
  );
}
