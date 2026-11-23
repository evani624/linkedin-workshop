import { useLayoutEffect, useRef, useState } from 'react';
import { UnitContext } from './unit.js';

// A 16:9 slide fitted into whatever room the window gives it. Nothing is scaled with a
// CSS transform: the slide is laid out at its real size, so canvases stay sharp on a
// projector and pointer positions need no correction.
export function Stage({ children, className = '', onClick }) {
  const ref = useRef(null);
  const [unit, setUnit] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setUnit(el.clientWidth / 1920);
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`viewport ${className}`}>
      <div className="stage" ref={ref} onClick={onClick}>
        <UnitContext.Provider value={unit}>{children}</UnitContext.Provider>
      </div>
    </div>
  );
}
