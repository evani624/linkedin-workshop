import { useEffect, useState } from 'react';
import { BigDial, StrokeLine, Timer, Counter, Compass, cx, u, PARTS, TEAL, CHARCOAL, PAPER } from './kit.jsx';
import './p1.css';

// House rule for every slide: one idea on screen at a time, in big type with room around it.
// A slide's other points arrive with the next press instead of piling up.

// ===== Slide 1: the title =====
export function S01() {
  return (
    <section className="slide s01">
      <BigDial part={1} intro />
      <div className="s01__text">
        <h1 aria-label="لينكدإن على طريقتك">
          <StrokeLine text="لينكدإن" size={164} color={TEAL} />
          <StrokeLine text="على طريقتك" size={164} color={PARTS[0].deep} wait={420} />
        </h1>
        <p className="s01__sub">حدد اتجاهك، وخلّ منشورك يوصل</p>
      </div>
      <p className="s01__by">محمد الشريف</p>
    </section>
  );
}

// ===== Slide 2: two questions, hands counted with a click =====
function Tally({ question, value, onChange, on }) {
  return (
    <div className={cx('tally rv', on && 'is-on')} data-hold>
      <p className="tally__q dsp">{question}</p>
      <button type="button" className="tally__count" onClick={() => onChange(value + 1)} aria-label={`زد واحد. العدد الحالي ${value}`}>
        <Counter value={value} fontSize={u(260)} fontWeight={500} duration={0.5} bounce={0.25} stagger={0.03} fade={0.16} intro={false} />
      </button>
      <div className="tally__tools">
        <button type="button" onClick={() => onChange(value + 1)} aria-label="زد واحد">
          +
        </button>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label="نقّص واحد">
          −
        </button>
      </div>
    </div>
  );
}

export function S02({ step }) {
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(0);
  const idle = first === 0 && second === 0;
  const bearing = first === second ? 0 : first > second ? 90 : 270;
  return (
    <section className="slide s02">
      <h2 className="ttl">سؤال برفع اليد</h2>
      <div className="s02__arena">
        <Tally question="مين نشر شي في لينكدإن آخر شهر؟" value={first} onChange={setFirst} on />
        <div className="s02__dial in" style={{ '--d': 0.3 }}>
          <Compass
            bearing={bearing}
            undecided={idle}
            active={1}
            tone="deep"
            mark="rgba(12,59,64,0.16)"
            ring="rgba(12,59,64,0.45)"
            ground={PAPER}
            south={CHARCOAL}
            dots={false}
            needleWidth={20}
            needleLength={246}
            label="إبرة تميل للسؤال اللي ارتفعت له أيادي أكثر"
          />
        </div>
        <Tally question="ومين عنده شي يستاهل يننشر وما نشره؟" value={second} onChange={setSecond} on={step >= 1} />
      </div>
    </section>
  );
}

// ===== Slide 3: why now =====
export function S03({ step }) {
  const round = 2 * Math.PI * 150;
  return (
    <section className="slide s03">
      <h2 className="ttl">ليش الحين</h2>
      <div className={cx('vw', step < 2 && 'is-on')}>
        <div className="s03__num">
          <span className="s03__about dsp">قرابة</span>
          <div className="s03__big">
            <span className="mono acc">
              <Counter value={11} fontSize={u(330)} fontWeight={500} duration={1.3} bounce={0.1} stagger={0.12} fade={0.14} />
            </span>
            <span className="dsp">مليون</span>
          </div>
          <p>مستخدم لينكدإن في السعودية</p>
        </div>
        <div className={cx('s03__half rv', step >= 1 && 'is-on')}>
          <svg viewBox="-180 -180 360 360" aria-hidden="true">
            <circle r="150" fill="none" stroke="var(--hair)" strokeWidth="30" />
            <circle
              className="s03__arc"
              r="150"
              fill="none"
              stroke="var(--acc)"
              strokeWidth="30"
              strokeDasharray={`${round / 2} ${round}`}
              transform="rotate(-90)"
              style={{ '--len': round / 2 }}
            />
          </svg>
          <p className="s03__halfword dsp">نصهم</p>
          <p className="s03__ages">أعمارهم بين 25 و34 سنة</p>
        </div>
        <p className="src">NapoleonCat، تقدير أكتوبر 2026</p>
      </div>
      <div className={cx('vw s03__now dsp', step >= 2 && 'is-on')}>
        <p>وأنتم الحين في فترة التدريب:</p>
        <p className="acc">أغنى فترة عندكم بالمحتوى</p>
      </div>
    </section>
  );
}

// ===== Slide 4: the part opens, the dial turns to «حدد اتجاهك» =====
export function S04() {
  return (
    <section className="slide s04">
      <BigDial part={2} from={1} />
      <h2 className="ttl">ما فيه طريقة وحدة صح</h2>
      <div className="s04__text" role="group" aria-label="لينكدإن أداة. السؤال: وش تبي منه؟">
        <StrokeLine text="لينكدإن أداة." size={150} color={TEAL} wait={500} />
        <StrokeLine text="السؤال: وش تبي منه؟" size={100} color={PARTS[1].deep} wait={1250} />
      </div>
    </section>
  );
}

// ===== Slides 5 and 6: the four ways are the four loops of Rakaya's mark =====
const WAYS = [
  {
    key: 'n',
    name: 'المعرض',
    goal: 'سمعة تكبر مع كل محطة',
    post: 'الإنجازات والمحطات الكبيرة',
    freq: 'مع كل حدث',
    watch: 'زيارات البروفايل والرسائل اللي تجيك',
    priceName: 'المعرض',
    price: 'يبي إنجازات، وبين إنجاز والثاني سكوت'
  },
  {
    key: 'e',
    name: 'التعلم أمام الناس',
    goal: 'تثبت إنك تتطور',
    post: 'اللي تعلمته هالأسبوع وكيف طبقته',
    freq: 'كل أسبوع أو أسبوعين',
    watch: 'التعليقات والأسئلة',
    priceName: 'التعلم أمام الناس',
    price: 'يبي انتظام'
  },
  {
    key: 's',
    name: 'العلاقات والفرص',
    goal: 'توصل للناس الصح',
    post: 'تعليقات ورسائل أكثر من المنشورات',
    freq: 'تعليقات شبه يومية، ومنشور أحيانًا',
    watch: 'الردود على رسائلك وطلبات التواصل المقبولة',
    priceName: 'العلاقات',
    price: 'يبي وقت شبه يومي'
  },
  {
    key: 'w',
    name: 'اسم في مجالك',
    goal: 'ينربط اسمك بموضوع واحد',
    post: 'رأيك وتجاربك في موضوع واحد',
    freq: 'أسبوعيًا بانتظام',
    watch: 'المتابعين من نفس المجال والدعوات اللي تجيك',
    priceName: 'الاسم في المجال',
    price: 'يبي صبر شهور قبل ما تشوف نتيجة'
  }
];
const FIELDS = [
  ['goal', 'الهدف'],
  ['post', 'وش تنشر'],
  ['freq', 'كم مرة'],
  ['watch', 'وش تراقب']
];

function WayRose({ current, onPick, nameKey = 'name' }) {
  const loops = {};
  const loopOpacity = {};
  WAYS.forEach((way, i) => {
    loops[way.key] = current === i ? 'var(--acc)' : TEAL;
    loopOpacity[way.key] = current === null || current === i ? 1 : 0.2;
  });
  return (
    <div className="rose">
      <Compass
        bearing={current === null ? 0 : current * 90}
        undecided={current === null}
        swing={46}
        active={2}
        tone="deep"
        mark={TEAL}
        square={CHARCOAL}
        ring="rgba(12,59,64,0.32)"
        ground={PAPER}
        south={CHARCOAL}
        dots={false}
        loops={loops}
        loopOpacity={loopOpacity}
        markSize={336}
        needleLength={218}
        needleWidth={11}
        r={240}
        label={current === null ? 'رمز ركايا: أربع حلقات، كل حلقة طريقة' : `الإبرة على: ${WAYS[current][nameKey]}`}
      />
      {WAYS.map((way, i) => (
        <button
          type="button"
          key={way.key}
          className={cx('rose__way dsp', `rose__way--${way.key}`, current === i && 'is-on')}
          onClick={() => onPick(i)}
          aria-pressed={current === i}
        >
          {way[nameKey]}
        </button>
      ))}
    </div>
  );
}

export function S05({ step }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [step]);
  const current = pick ?? (step > 0 ? step - 1 : null);
  const way = current === null ? null : WAYS[current];
  return (
    <section className="slide s05">
      <h2 className="ttl">أربع طرق</h2>
      <WayRose current={current} onPick={setPick} />
      {way && (
        <div className="s05__info" key={current} aria-live="polite">
          <p className="s05__name dsp">{way.name}</p>
          {FIELDS.map(([key, label], i) => (
            <div className="s05__row in" key={key} style={{ '--d': 0.12 + i * 0.1 }}>
              <span className="s05__label dsp">{label}</span>
              <span className="s05__val">{way[key]}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function S06({ step }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [step]);
  const current = pick ?? Math.min(step, 3);
  const way = WAYS[current];
  return (
    <section className="slide s06">
      <h2 className="ttl">كل طريقة لها ثمن</h2>
      <WayRose current={current} onPick={setPick} nameKey="priceName" />
      <div className="s06__say" key={current} aria-live="polite">
        <p className="s06__name dsp">{way.priceName}</p>
        <p className="s06__price dsp">{way.price}</p>
      </div>
    </section>
  );
}

// ===== Slide 7: the exercise, two minutes =====
const ASKS = ['وش تبي من لينكدإن خلال 6 شهور؟', 'كم ساعة بالأسبوع تقدر تعطيه؟', 'وش الموضوع اللي تقدر تتكلم فيه 20 مرة بدون ما تمل؟'];

export function S07({ step }) {
  return (
    <section className="slide s07 drill">
      <h2 className="ttl">تمرين اختيار الاتجاه</h2>
      <div className="drill__timer in" style={{ '--d': 0.2 }}>
        <Timer seconds={120} go={step >= 1} />
      </div>
      <ol className="drill__list">
        {ASKS.map((ask, i) => (
          <li key={ask} className="in" style={{ '--d': 0.3 + i * 0.14 }}>
            <span className="drill__n mono">{i + 1}</span>
            <span className="dsp">{ask}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ===== Slide 8: the direction in one line, blanks filled one at a time =====
const Blank = ({ on, children }) => (
  <span className={cx('blank', on && 'is-on')}>
    <span className="blank__text">{children}</span>
  </span>
);

export function S08({ step }) {
  return (
    <section className="slide s08">
      <h2 className="ttl">اتجاهك بسطر</h2>
      <p className={cx('s08__eg dsp rv', step >= 1 && 'is-on')}>مثال</p>
      <p className="s08__line dsp in" style={{ '--d': 0.2 }}>
        <span>
          أستخدم لينكدإن عشان <Blank on={step >= 1}>أبني اسم في تحليل البيانات</Blank>،
        </span>
        <span>
          وبأنشر عن <Blank on={step >= 2}>اللي أتعلمه في تدريبي</Blank>،
        </span>
        <span>
          كل <Blank on={step >= 3}>أسبوعين</Blank>.
        </span>
      </p>
    </section>
  );
}

// ===== Slide 9: the headline says your direction, in four views =====
export function S09({ step }) {
  return (
    <section className="slide s09">
      <h2 className="ttl">العنوان يقول اتجاهك</h2>

      <div className={cx('vw', step === 0 && 'is-on')}>
        <p className="s09__say dsp">العنوان (Headline) يطلع مع كل تعليق وكل طلب تواصل</p>
        <div className="s09__id" aria-hidden="true">
          <span className="s09__ava" />
          <span className="s09__namebar" />
          <span className="s09__headbar" />
          <span className="s09__speech" />
        </div>
      </div>

      <div className={cx('vw', step === 1 && 'is-on')}>
        <p className="s09__fit dsp">
          يسع 220 حرف، بس اللي يبان في البحث والتعليقات <span className="acc">أول 60 إلى 70 حرف تقريبًا</span>
        </p>
        <div className="s09__ruler" aria-hidden="true">
          <span className="s09__zone" />
          <span className="s09__hatch" />
          <span className="s09__mark mono" style={{ '--at': 60 }}>
            60
          </span>
          <span className="s09__mark mono" style={{ '--at': 70 }}>
            70
          </span>
          <span className="s09__mark mono" style={{ '--at': 220 }}>
            220
          </span>
        </div>
        <p className="src">AuthoredUp</p>
      </div>

      <div className={cx('vw', step === 2 && 'is-on')}>
        <p className="s09__flabel dsp">الصيغة</p>
        <div className="s09__formula dsp">
          <span className="s09__chip">وش تسوي</span>
          <span className="s09__plus mono">+</span>
          <span className="s09__chip">في وش</span>
          <span className="s09__plus mono">+</span>
          <span className="s09__chip">دليل واحد</span>
        </div>
      </div>

      <div className={cx('vw', step >= 3 && 'is-on')}>
        <div className="s09__pair">
          <span className="s09__tag dsp">قبل</span>
          <p className="s09__before dsp">طالب هندسة برمجيات | شغوف بالتقنية</p>
          <span className="s09__tag s09__tag--after dsp">بعد</span>
          <p className="s09__after dsp">متدرب Backend في ركايا | أكتب عن اللي أتعلمه في بناء الـAPIs</p>
        </div>
      </div>
    </section>
  );
}

// ===== Slide 10: the first screen of the profile, one region at a time =====
const SCREEN = [
  ['الصورة', 'وجهك واضح'],
  ['الغلاف', 'سطر عن اتجاهك بدل صورة عامة'],
  ['النبذة', 'أول 300 حرف تقريبًا هي اللي تبان قبل "المزيد"'],
  ['قسم Featured', 'أفضل شيئين أو ثلاثة تثبت اتجاهك'],
  ['التوثيق', 'أكثر من 100 مليون عضو أضافوا توثيق لحساباتهم']
];

function Pin({ n, x, y, on, onPick }) {
  return (
    <g className={cx('pin', on && 'is-on')} transform={`translate(${x} ${y})`} onClick={onPick} role="button" aria-label={`${n}: ${SCREEN[n - 1][0]}`} data-hold>
      <circle r="22" />
      <text y="8" textAnchor="middle">
        {n}
      </text>
    </g>
  );
}

export function S10({ step }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [step]);
  const at = pick ?? step + 1;
  const hot = n => (at === n ? 'is-hot' : '');
  const pin = n => ({ n, on: at === n, onPick: () => setPick(n) });
  return (
    <section className="slide s10">
      <h2 className="ttl">أول شاشة في البروفايل</h2>
      <svg className="s10__screen in" viewBox="0 0 704 700" style={{ '--d': 0.2 }} role="img" aria-label="رسم مبسط لأول شاشة في البروفايل">
        <defs>
          <pattern id="s10hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(12,59,64,0.13)" strokeWidth="3" />
          </pattern>
          <clipPath id="s10clip">
            <rect x="1" y="1" width="702" height="698" rx="22" />
          </clipPath>
        </defs>
        <rect x="1" y="1" width="702" height="698" rx="22" fill="#fff" stroke="rgba(12,59,64,0.16)" strokeWidth="2" />
        <g clipPath="url(#s10clip)">
          <rect className={cx('s10__cover', hot(2))} x="0" y="0" width="704" height="188" />
          <rect x="0" y="0" width="704" height="188" fill="url(#s10hatch)" />
          <rect className={cx('s10__coverline', hot(2))} x="56" y="76" width="360" height="30" rx="15" />
        </g>
        <circle className={cx('s10__ava', hot(1))} cx="556" cy="190" r="88" />
        <g className={cx('s10__face', hot(1))}>
          <circle cx="556" cy="170" r="30" />
          <path d="M500 250a56 50 0 0 1 112 0" />
        </g>
        <rect className="s10__bar" x="296" y="298" width="340" height="28" rx="14" />
        <g className={cx('s10__badge', hot(5))}>
          <circle cx="262" cy="312" r="19" />
          <path d="M253 312l6 7 12-13" />
        </g>
        <rect className="s10__bar s10__bar--soft" x="236" y="346" width="400" height="18" rx="9" />
        <g className={cx('s10__about', hot(3))}>
          <rect x="116" y="412" width="520" height="16" rx="8" />
          <rect x="86" y="444" width="550" height="16" rx="8" />
          <rect x="236" y="476" width="400" height="16" rx="8" />
          <rect className="s10__more" x="130" y="470" width="90" height="28" rx="14" />
        </g>
        <g className={cx('s10__feat', hot(4))}>
          <rect x="446" y="546" width="190" height="112" rx="12" />
          <rect x="240" y="546" width="190" height="112" rx="12" />
          <rect x="34" y="546" width="190" height="112" rx="12" />
        </g>
        <Pin {...pin(1)} x={452} y={236} />
        <Pin {...pin(2)} x={56} y={150} />
        <Pin {...pin(3)} x={44} y={452} />
        <Pin {...pin(4)} x={672} y={602} />
        <Pin {...pin(5)} x={218} y={312} />
      </svg>
      <div className="s10__one" key={at} aria-live="polite">
        <span className="s10__n mono">{at}</span>
        <p className="s10__lead dsp">{SCREEN[at - 1][0]}</p>
        <p className="s10__rest">{SCREEN[at - 1][1]}</p>
      </div>
      <p className="src">AuthoredUp · لينكدإن</p>
    </section>
  );
}
