import { MARK_CENTER, MARK_HALF, MARK_LOOPS, MARK_SQUARE } from './mark.js';

const ORDER = ['n', 'e', 's', 'w'];

// The mark's five shapes, to place inside any SVG. `size` is the mark's full width in
// the host's units; it is centred on (0, 0). Only fills and opacity change, never the shapes.
export function MarkShapes({ size = 400, fill = 'currentColor', square, loops = {}, loopOpacity = {} }) {
  const scale = size / (MARK_HALF * 2);
  const [cx, cy] = MARK_CENTER;
  return (
    <g transform={`scale(${scale}) translate(${-cx} ${-cy})`}>
      {ORDER.map(key => (
        <path
          key={key}
          className={`mark-loop mark-loop--${key}`}
          d={MARK_LOOPS[key]}
          fill={loops[key] ?? fill}
          opacity={loopOpacity[key] ?? 1}
          fillRule="evenodd"
        />
      ))}
      <path className="mark-square" d={MARK_SQUARE} fill={square ?? fill} />
    </g>
  );
}

// The mark on its own, as the identity's signature.
export function RakayaMark({ className = '', fill = 'currentColor', square, label = 'ركايا' }) {
  const half = MARK_HALF * 1.04;
  return (
    <svg className={className} viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`} role="img" aria-label={label}>
      <MarkShapes size={MARK_HALF * 2} fill={fill} square={square} />
    </svg>
  );
}
