import { createContext, useContext } from 'react';

// One stage unit is 1/1920 of the slide's width. CSS files write it as `48u`
// (the build turns that into calc(48 * var(--u))); inline styles use u(48).
export const u = n => `calc(${n} * var(--u))`;

// The same unit as a number of CSS pixels, for canvas work and for components
// that only take pixel numbers.
export const UnitContext = createContext(1);
export const useUnit = () => useContext(UnitContext);
