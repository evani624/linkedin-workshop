import { PARTS, TEAL, CHARCOAL } from '../brand/palette.js';
import { RakayaMark } from '../brand/RakayaMark.jsx';
import { SLIDES } from './slides.js';

// Esc: every slide by part, to jump anywhere during questions.
export function Index({ onOpen }) {
  return (
    <main className="index">
      <header className="index__head">
        <RakayaMark className="index__mark" fill={TEAL} square={CHARCOAL} />
        <div>
          <h1>لينكدإن على طريقتك</h1>
          <p className="index__hint">
            اضغط أي شريحة تفتحها. داخل العرض: <kbd>→</kbd> أو <kbd>Space</kbd> أو ضغطة للخطوة الجاية، <kbd>←</kbd> للرجوع، <kbd>F</kbd> ملء
            الشاشة، <kbd>Esc</kbd> يرجعك هنا.
          </p>
        </div>
      </header>
      <div className="index__grid">
        {PARTS.map(part => {
          const slides = SLIDES.map((slide, at) => ({ ...slide, at })).filter(slide => slide.n >= part.from && slide.n <= part.to);
          if (!slides.length) return null;
          return (
            <section className="index__part" key={part.n} style={{ '--c': part.deep }}>
              <h2>{part.name}</h2>
              <ol>
                {slides.map(slide => (
                  <li key={slide.n}>
                    <button type="button" onClick={() => onOpen(slide.at)}>
                      <span>{slide.n}</span>
                      <span>{slide.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </main>
  );
}
