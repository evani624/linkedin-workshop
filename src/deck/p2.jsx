import { useEffect, useRef, useState } from 'react';
import { Counter, cx, u } from './kit.jsx';
import './p2.css';

// ===== Slide 11: the first two lines are the post =====
// The post's body is the slide's own statement (100 characters); what follows it is drawn
// as plain bars, so the cut after 140 and 210 characters falls exactly where it would.
const WORDS = 'لينكدإن يقص المنشور بعد 140 حرف تقريبًا في الجوال، و210 في اللابتوب. إذا ما ضغط "المزيد"، ما قرا شي.'.split(' ');
const BARS = [5, 3, 6, 4, 7, 2, 6, 4, 6, 3, 7, 5, 2, 6, 4, 7, 3, 5, 6, 6, 3, 5, 7, 4, 6, 2, 5, 8, 3, 6, 4, 7, 5, 3, 6, 4, 7, 2, 5, 6, 4, 3, 7, 5, 6];
const TOKENS = (() => {
  let end = 0;
  const list = [];
  WORDS.forEach(text => {
    end += text.length + 1;
    list.push({ text, end });
  });
  BARS.forEach(len => {
    end += len + 1;
    list.push({ len, end });
  });
  return list;
})();

const PostHead = () => (
  <header className="post__head" aria-hidden="true">
    <span className="post__ava" />
    <span className="post__bar" />
    <span className="post__bar post__bar--soft" />
  </header>
);

export function S11({ step }) {
  const [device, setDevice] = useState('phone');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setDevice(step >= 1 ? 'laptop' : 'phone');
    setOpen(step >= 2);
  }, [step]);
  const limit = device === 'phone' ? 140 : 210;
  const shown = TOKENS.filter(token => open || token.end <= limit);
  return (
    <section className="slide s11">
      <h2 className="ttl">أول سطرين هم المنشور</h2>
      <div className="s11__read in" style={{ '--d': 0.3 }} data-hold>
        <div className="s11__toggle dsp" role="group" aria-label="وين ينعرض المنشور">
          <button type="button" className={cx(device === 'phone' && 'is-on')} onClick={() => setDevice('phone')} aria-pressed={device === 'phone'}>
            الجوال
          </button>
          <button type="button" className={cx(device === 'laptop' && 'is-on')} onClick={() => setDevice('laptop')} aria-pressed={device === 'laptop'}>
            اللابتوب
          </button>
        </div>
        <div className="s11__limit mono acc">
          <Counter value={limit} fontSize={u(210)} fontWeight={500} duration={0.8} bounce={0.15} stagger={0.06} fade={0.16} intro={false} />
        </div>
        <p className="s11__unit">حرف تقريبًا</p>
      </div>
      <article className={cx('post s11__post in', `is-${device}`)} style={{ '--d': 0.15 }} data-hold>
        <PostHead />
        <p className="post__body">
          {shown.map((token, i) => (token.text ? <span key={i}>{token.text} </span> : <i key={i} className="greek" style={{ '--n': token.len }} />))}
          {!open && (
            <button type="button" className="post__more dsp" onClick={() => setOpen(true)}>
              …المزيد
            </button>
          )}
        </p>
      </article>
      <p className="src">AuthoredUp</p>
    </section>
  );
}

// ===== Slide 12: six ways to start, one example at a time =====
const OPENERS = [
  ['الرقم', 'قضيت 40 ساعة أدوّر على خطأ واحد. كان في سطر واحد.'],
  ['المفارقة', 'أول أسبوع في التدريب ما كتبت ولا سطر كود، وكان أهم أسبوع.'],
  ['الاعتراف', 'غلطت في أول مهمة استلمتها، وهذا اللي تعلمته.'],
  ['الاقتباس', 'قال لي مشرفي: لا تجيني بحل، جيني بسؤالين.'],
  ['النتيجة قبل القصة', 'نزّلنا وقت تحميل الصفحة من 6 ثواني لثانيتين. هذي القصة.'],
  ['السؤال', 'وش أول شي تسويه لما تستلم كود ما كتبته؟']
];
export const OPENER_NAMES = OPENERS.map(([name]) => name);

export function S12({ step }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [step]);
  const at = pick ?? (step > 0 ? step - 1 : null);
  return (
    <section className="slide s12">
      <h2 className="ttl">ست طرق تبدأ فيها</h2>
      <ol className="s12__list">
        {OPENERS.map(([name], i) => (
          <li key={name} className="in" style={{ '--d': 0.15 + i * 0.08 }}>
            <button type="button" className={cx('dsp', at === i && 'is-on', at !== null && at !== i && 'is-dim')} onClick={() => setPick(i)} aria-pressed={at === i}>
              <span className="mono">{i + 1}</span>
              {name}
            </button>
          </li>
        ))}
      </ol>
      {at !== null && (
        <blockquote className="s12__quote" key={at} aria-live="polite">
          <p className="dsp">{OPENERS[at][1]}</p>
          <span className="s12__more dsp">…المزيد</span>
        </blockquote>
      )}
    </section>
  );
}

// ===== Slide 13: details carry the feeling, adjectives do not =====
export function S13({ step }) {
  const [p, setP] = useState(0);
  const [drag, setDrag] = useState(false);
  const box = useRef(null);
  useEffect(() => setP(step >= 1 ? 100 : 0), [step]);

  const move = event => {
    const rect = box.current.getBoundingClientRect();
    // On an upright phone the slide lies on its side: its right edge is the screen's bottom edge.
    const turned = Boolean(box.current.closest('.show--turned'));
    const along = turned ? (rect.bottom - event.clientY) / rect.height : (rect.right - event.clientX) / rect.width;
    setP(Math.min(100, Math.max(0, along * 100)));
  };
  const down = event => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag(true);
    move(event);
  };
  const key = event => {
    if (event.key === 'ArrowLeft') setP(value => Math.min(100, value + 10));
    else if (event.key === 'ArrowRight') setP(value => Math.max(0, value - 10));
    else return;
    event.preventDefault();
    event.stopPropagation();
  };
  const after = p >= 50;

  return (
    <section className={cx('slide s13', step >= 2 && 'is-marked')}>
      <h2 className="ttl">
        <span className="acc">التفاصيل</span> توصّل الشعور، <span className="s13__dull">والصفات</span> لا
      </h2>
      <div className="s13__tags dsp" aria-hidden="true">
        <span className={cx('s13__tag', !after && 'is-on')}>قبل</span>
        <span className={cx('s13__tag s13__tag--after', after && 'is-on')}>بعد</span>
      </div>
      <div
        className={cx('s13__box', drag && 'is-drag')}
        ref={box}
        data-hold
        onPointerDown={down}
        onPointerMove={event => drag && move(event)}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
      >
        <p className="s13__before dsp">
          كانت تجربة <span className="adj">ثرية</span> و<span className="adj">مليئة بالتعلم</span>.
        </p>
        <p className="s13__after dsp" style={{ clipPath: `inset(-4% 0 -4% ${100 - p}%)` }}>
          <span className="det">نزلنا الميدان</span> و<span className="det">اشتغلنا في المكتبة بأنفسنا</span>، واكتشفنا إن{' '}
          <span className="det">فكرتنا الأولى ما تحل المشكلة</span>.
        </p>
        <span
          className="s13__grip"
          style={{ right: `${p}%` }}
          role="slider"
          tabIndex={0}
          aria-label="اسحب بين قبل وبعد"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(p)}
          onKeyDown={key}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l-5 6 5 6M15 6l5 6-5 6" />
          </svg>
        </span>
      </div>
    </section>
  );
}

// ===== Slide 14: a simple structure for any post =====
const BUILD = [
  ['سطر يوقف القارئ', 164],
  ['القصة بتفصيلة وحدة على الأقل', 284],
  ['وش تعلمت', 433],
  ['سؤال حقيقي أو دعوة واضحة', 534]
];

export function S14({ step }) {
  const hot = n => cx('s14__block', step === n && 'is-hot', step > n && 'is-seen');
  return (
    <section className={cx('slide s14', step >= 4 && 'is-gaps')}>
      <h2 className="ttl">بناء بسيط لأي منشور</h2>
      <svg className="s14__card in" viewBox="0 0 544 660" style={{ '--d': 0.15 }} role="img" aria-label="هيكل منشور من أربع فقرات">
        <defs>
          <pattern id="s14hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(12,59,64,0.16)" strokeWidth="3" />
          </pattern>
        </defs>
        <rect x="1" y="1" width="542" height="658" rx="26" fill="#fff" stroke="rgba(12,59,64,0.18)" strokeWidth="2" />
        <circle cx="462" cy="70" r="34" fill="url(#s14hatch)" stroke="rgba(12,59,64,0.2)" strokeWidth="2" />
        <rect x="240" y="48" width="170" height="16" rx="8" fill="rgba(12,59,64,0.2)" />
        <rect x="290" y="76" width="120" height="13" rx="6.5" fill="rgba(12,59,64,0.1)" />
        <g className={hot(0)}>
          <rect x="72" y="150" width="424" height="28" rx="14" />
        </g>
        <g className={hot(1)}>
          <rect x="60" y="224" width="436" height="18" rx="9" />
          <rect x="96" y="258" width="400" height="18" rx="9" />
          <rect x="72" y="292" width="424" height="18" rx="9" />
          <rect x="236" y="326" width="260" height="18" rx="9" />
        </g>
        <g className={hot(2)}>
          <rect x="84" y="390" width="412" height="18" rx="9" />
          <rect x="60" y="424" width="436" height="18" rx="9" />
          <rect x="296" y="458" width="200" height="18" rx="9" />
        </g>
        <g className={hot(3)}>
          <rect x="176" y="522" width="320" height="24" rx="12" />
        </g>
        <g className="s14__gaps">
          <path d="M40 184v34M32 184h16M32 218h16" />
          <path d="M40 350v34M32 350h16M32 384h16" />
          <path d="M40 482v34M32 482h16M32 516h16" />
        </g>
      </svg>
      {BUILD.map(([label, y], i) => (
        <p key={label} className={cx('s14__label dsp rv', step >= i && 'is-on', step === i && 'is-now')} style={{ top: u(286 + y - 44) }}>
          <span className="mono">{i + 1}</span>
          {label}
        </p>
      ))}
      <p className={cx('s14__note dsp rv', step >= 4 && 'is-on')}>فقرات قصيرة، وسطر فاضي بينها</p>
    </section>
  );
}

// ===== Slide 15: phrases that make your post sound like everyone's =====
const TIRED = [['يسعدني أن أعلن'], ['رحلة ثرية', 'تجربة لا تُنسى'], ['شغف', 'فخور جدًا'], ['لم تكن مجرد… بل…'], ['والقادم أجمل']];

export function S15({ step }) {
  return (
    <section className="slide s15">
      <h2 className="ttl">عبارات تخلي منشورك يشبه غيره</h2>
      <ul className={cx('s15__list vw dsp', step <= 5 && 'is-on')}>
        {TIRED.map((row, i) => (
          <li key={row[0]} className={cx(step > i && 'is-out')}>
            {row.map((phrase, k) => (
              <span key={phrase}>
                {k > 0 && <span className="s15__and"> و</span>}
                <span className="s15__ph" style={{ '--k': k }}>
                  "{phrase}"
                </span>
              </span>
            ))}
          </li>
        ))}
      </ul>
      <div className={cx('vw', step >= 6 && 'is-on')}>
        <p className="s15__say dsp">
          لينكدإن يقلل انتشار المحتوى العام اللي <span className="acc">بلا رأي ولا تفصيلة</span> برا شبكتك
        </p>
        <p className="src">لينكدإن</p>
      </div>
    </section>
  );
}

// ===== Slide 16: photo and video =====
const SHOTS = [
  'صورة حقيقية من اللحظة أقوى من صورة الشهادة',
  'صوّر الناس اللي معك بإذنهم، واذكرهم بالاسم',
  'الفيديو لازم يطابق كلام المنشور: لينكدإن يقلل الفيديوهات اللي ما تطابق النص'
];
const SHOT_ICONS = [
  <>
    <rect x="10" y="22" width="100" height="76" rx="10" />
    <path d="M22 86l26-30 18 20 12-13 22 23" />
    <circle className="fill" cx="84" cy="46" r="9" />
  </>,
  <>
    <circle cx="40" cy="42" r="17" />
    <circle cx="84" cy="42" r="17" />
    <rect className="fill" x="18" y="74" width="44" height="14" rx="7" />
    <rect className="fill" x="62" y="74" width="44" height="14" rx="7" transform="translate(4 0)" />
  </>,
  <>
    <rect x="10" y="24" width="56" height="72" rx="10" />
    <path className="fill" d="M30 46l20 14-20 14z" />
    <path d="M78 54h12M78 66h12" />
    <path d="M100 40h14M100 54h14M100 68h14M100 82h9" />
  </>
];

export function S16({ step }) {
  return (
    <section className="slide s16">
      <h2 className="ttl">الصورة والفيديو</h2>
      <ol className="s16__list">
        {SHOTS.map((line, i) => (
          <li key={line} className={cx('rv', step >= i && 'is-on')}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              {SHOT_ICONS[i]}
            </svg>
            <span className="dsp">{line}</span>
          </li>
        ))}
      </ol>
      <p className="src">لينكدإن</p>
    </section>
  );
}

// ===== Slide 17: how it decides who sees your post, as a plotted course =====
const STOPS = [
  [1600, 430],
  [980, 450],
  [440, 430]
];
const FAN = [
  [318, 356],
  [262, 452],
  [336, 524],
  [226, 380],
  [136, 300],
  [118, 474],
  [196, 604],
  [262, 262]
];

export function S17({ step }) {
  return (
    <section className="slide s17">
      <h2 className="ttl">كيف يقرر مين يشوف منشورك</h2>
      <svg className="s17__map" viewBox="0 0 1920 1080" aria-hidden="true">
        <path className="s17__course" d="M1600 430 C 1420 350, 1180 530, 980 450 S 620 350, 440 430" />
        <path className={cx('s17__leg', step >= 1 && 'is-on')} d="M1600 430 C 1420 350, 1180 530, 980 450" pathLength="100" />
        <path className={cx('s17__leg', step >= 2 && 'is-on')} d="M980 450 C 780 370, 620 350, 440 430" pathLength="100" />
        <g className={cx('s17__fan', step >= 2 && 'is-on')}>
          <circle className="s17__net" cx="300" cy="430" r="150" />
          {FAN.map(([x, y], i) => (
            <g key={i} style={{ '--d': 0.7 + i * 0.07 }}>
              <line x1="440" y1="430" x2={x} y2={y} />
              <circle cx={x} cy={y} r="10" />
            </g>
          ))}
        </g>
        {STOPS.map(([x, y], i) => (
          <g key={i} className={cx('s17__stop', step >= i && 'is-on', step === i && 'is-now')} transform={`translate(${x} ${y})`}>
            <circle r="38" />
            <text y="14" textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <div className={cx('vw', step === 0 && 'is-on')}>
        <p className="s17__say dsp">يفهم وش موضوع منشورك</p>
      </div>
      <div className={cx('vw', step === 1 && 'is-on')}>
        <p className="s17__say dsp">لكل شخص يقلّب، يتوقع:</p>
        <div className="s17__asks dsp">
          <span>هل الموضوع يهمه؟</span>
          <span>هل بيوقف يقرا؟</span>
          <span>هل بيتفاعل؟</span>
        </div>
      </div>
      <div className={cx('vw', step >= 2 && 'is-on')}>
        <p className="s17__say s17__say--long dsp">اللي يوقفون ويتفاعلون يعلّمونه إن المنشور يستاهل، فيعرضه لناس يشبهونهم، من شبكتك ومن برّاها</p>
      </div>
      <p className="src">
        المصادر: ترتيب بنماذج لغوية تفهم المنشور واهتمامات العضو (لينكدإن، مارس 2026)، ووقت القراءة إشارة في الترتيب (هندسة لينكدإن)، ونموذج 2026 يقيس
        نجاحه بالوقت المصروف والإعجابات والتعليقات وإعادات النشر (arXiv)
      </p>
    </section>
  );
}

// ===== Slides 18 and 19: what helps and what hurts, as reach that widens or shrinks =====
const RINGS = [84, 132, 180, 228, 276];

function Reach({ title, items, step, mode, source }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [step]);
  const at = pick ?? Math.min(step, items.length - 1);
  const [lead, rest] = items[at];
  return (
    <section className={cx('slide reach', `reach--${mode}`)}>
      <h2 className="ttl">{title}</h2>
      <svg className="reach__rings in" viewBox="-300 -300 600 600" style={{ '--d': 0.15 }} aria-hidden="true">
        {RINGS.map((r, i) => {
          const on = mode === 'up' ? at >= i : at < RINGS.length - 1 - i;
          return <circle key={r} r={r} className={cx('reach__ring', on && 'is-on')} pathLength="100" />;
        })}
        <rect className="reach__post" x="-34" y="-26" width="68" height="52" rx="10" />
        <path className="reach__lines" d="M-18 -8h36M-18 8h22" />
      </svg>
      <div className="reach__one" key={at} aria-live="polite">
        <p className="reach__lead dsp">{lead}</p>
        {rest && <p className="reach__rest">{rest}</p>}
      </div>
      <div className="reach__dots" data-hold>
        {items.map((item, i) => (
          <button type="button" key={item[0]} className={cx(i === at && 'is-on', i < at && 'is-seen')} onClick={() => setPick(i)} aria-label={`${i + 1}: ${item[0]}`} />
        ))}
      </div>
      <p className="src">{source}</p>
    </section>
  );
}

const HELPS = [
  ['موضوع واضح', 'مرتبط بمجالك'],
  ['كلام يوقف القارئ', 'ويخليه يكمل'],
  ['فكرة حقيقية تنفع الناس', 'لينكدإن قال إنه بيعرض منها أكثر'],
  ['تعليقات فيها رأي', 'وردودك عليها'],
  ['الانتظام', 'لينكدإن يقول في صفحة الإحصائيات إن اللي ينشر مرة بالأسبوع ممكن توصل زيارات بروفايله لـ 4 أضعاف']
];
const HURTS = [
  ['طلب التفاعل', '"علّق نعم إذا توافق"'],
  ['منشورات مكررة', 'ما فيها شي جديد'],
  ['مجموعات التفاعل (pods)', 'جماعة متفقين يعلقون على منشورات بعض'],
  ['التعليقات الآلية', 'بالأدوات والإضافات'],
  ['فيديو ما يطابق كلام المنشور', '']
];

export const S18 = ({ step }) => <Reach title="وش يساعد منشورك" items={HELPS} step={step} mode="up" source="لينكدإن" />;
export const S19 = ({ step }) => (
  <Reach title="وش يضر منشورك" items={HURTS} step={step} mode="down" source="المصادر: لينكدإن، 12 مارس 2026 · لينكدإن، 13 مارس 2026" />
);

// ===== Slide 20: colleagues and comments, the right way =====
export function S20({ step }) {
  return (
    <section className="slide s20">
      <h2 className="ttl">الزملاء والتعليقات، بالطريقة الصح</h2>
      <div className="s20__col s20__col--do in" style={{ '--d': 0.15 }}>
        <p className="s20__head dsp">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M10 25l10 11 18-23" />
          </svg>
          سوّ
        </p>
        <p className="s20__item">قل لزملاءك إنك نشرت، واطلب رأيهم بسؤال محدد</p>
        <p className="s20__item">رد على كل تعليق بجملة فيها كلام</p>
      </div>
      <div className={cx('s20__col s20__col--dont rv', step >= 1 && 'is-on')}>
        <p className="s20__head dsp">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M12 12l24 24M36 12L12 36" />
          </svg>
          لا تسوي
        </p>
        <p className="s20__item">اتفاق ثابت "علّق لي وأعلّق لك"</p>
        <p className="s20__item">تعليقات جاهزة أو منسوخة</p>
      </div>
    </section>
  );
}

// ===== Slide 21: rhythm and timing, on a month's tape =====
const RHYTHM = ['انشر في وقت تقدر ترد فيه على التعليقات', 'لا تنزّل كل أخبارك في أسبوع واحد، وزّعها', 'منشورين زينين بالشهر أحسن من عشرة مستعجلة'];
// Twelve dots re-arranged for each statement: [x, size, tone]. x runs from the right edge (week 1).
const beat = (step, spread) => {
  const dots = [];
  for (let i = 0; i < 12; i++) {
    if (step === 0) {
      if (i === 0) dots.push([1500, 3, 'acc']);
      else if (i < 5) dots.push([1500 - 46 - i * 46, 1, 'ink']);
      else dots.push([1500, 0, 'ink']);
    } else if (step === 1) {
      if (i < 5) dots.push([spread ? 1560 - i * 350 : 1690 - i * 52, 2.2, 'acc']);
      else dots.push([1600, 0, 'ink']);
    } else if (i < 2) dots.push([i === 0 ? 1296 : 432, 3.4, 'acc']);
    else dots.push([1700 - (i - 2) * 34, 0.8, 'quiet']);
  }
  return dots;
};

export function S21({ step }) {
  const [spread, setSpread] = useState(false);
  useEffect(() => {
    setSpread(false);
    if (step !== 1) return undefined;
    const timer = setTimeout(() => setSpread(true), 1100);
    return () => clearTimeout(timer);
  }, [step]);
  const at = Math.min(step, 2);
  return (
    <section className="slide s21">
      <h2 className="ttl">الإيقاع والتوقيت</h2>
      <p className="s21__say dsp" key={at}>
        {RHYTHM[at]}
      </p>
      <svg className="s21__tape in" viewBox="0 0 1728 160" style={{ '--d': 0.2 }} aria-hidden="true">
        <path className="s21__base" d="M0 90H1728" />
        {[0, 1, 2, 3, 4].map(week => (
          <path key={week} className="s21__week" d={`M${1728 - week * 432} 58v64`} />
        ))}
        {beat(at, spread).map(([x, size, tone], i) => (
          <circle key={i} className={`s21__dot s21__dot--${tone}`} r="10" cy="90" style={{ transform: `translateX(${x}px) scale(${size})`, opacity: size ? 1 : 0 }} />
        ))}
      </svg>
    </section>
  );
}
