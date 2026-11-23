import { useEffect, useState } from 'react';
import { StrokeLine, Timer, Counter, Compass, cx, u, PARTS, TEAL, CHARCOAL, PAPER } from './kit.jsx';
import { OPENER_NAMES } from './p2.jsx';
import { QR_LINKEDIN } from './qr.js';
import './p3.css';

// ===== Slide 22: the rule of the dissection =====
export function S22({ step }) {
  return (
    <section className="slide s22">
      <h2 className="ttl">قاعدة التشريح</h2>
      <p className="s22__same dsp in" style={{ '--d': 0.15 }}>
        نفس الخبر، نفس الفترة، ونتيجتين مختلفة
      </p>
      <p className={cx('s22__ask dsp rv', step >= 1 && 'is-on')}>السؤال: وش اللي اختلف؟</p>
      <p className={cx('s22__hide rv', step >= 2 && 'is-on')}>
        <span className="s22__ava" aria-hidden="true" />
        الأسماء والصور مخفية احترامًا لأصحابها
      </p>
    </section>
  );
}

// ===== Slides 23 and 24: guess which post reached further =====
// One row of the comparison on screen at a time; the numbers come with a press, then the reason.
function Game({ title, lateTitle, names, scores, comments, rows, step }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [step]);
  const before = rows.filter(row => !row.why).length;
  const revealed = step >= before;
  const auto = step < before ? step : step === before ? null : Math.min(rows.length - 1, step - 1);
  const at = pick ?? auto;
  const row = at === null ? null : rows[at];
  const showTitle = !lateTitle || revealed;

  const side = k => (
    <div className={cx('game__side', k === 0 && revealed && 'is-lead')}>
      <p className="game__name dsp">{names[k]}</p>
      <div className="game__score mono">
        {revealed ? (
          <Counter value={scores[k]} fontSize={u(200)} fontWeight={500} duration={1.5} bounce={0.1} stagger={0.09} fade={0.16} />
        ) : (
          <span className="game__q dsp">؟</span>
        )}
        <span className={cx('game__unit rv', revealed && 'is-on')}>تفاعل</span>
      </div>
      <p className={cx('game__more rv', revealed && 'is-on')}>{comments[k]}</p>
      {row && (
        <p className="game__val dsp" key={at}>
          {k === 0 ? row.a : row.b}
        </p>
      )}
    </div>
  );

  return (
    <section className={cx('slide game', revealed && 'is-revealed')}>
      <h2 className={cx('ttl', !showTitle && 'acc')} key={showTitle ? 'title' : 'ask'}>
        {showTitle ? title : 'أي منشور وصل أكثر؟'}
      </h2>
      {showTitle && <p className={cx('game__ask dsp', revealed && 'is-off')}>أي منشور وصل أكثر؟</p>}
      <div className="game__arena">
        {side(0)}
        <div className="game__mid">
          <div className="game__dial">
            <Compass
              bearing={revealed ? 90 : 0}
              undecided={!revealed}
              active={6}
              tone="deep"
              mark="rgba(12,59,64,0.16)"
              ring="rgba(12,59,64,0.4)"
              ground={PAPER}
              south={CHARCOAL}
              dots={false}
              needleWidth={20}
              needleLength={246}
              label={revealed ? `الإبرة على ${names[0]}` : 'الإبرة محتارة بين المنشورين'}
            />
          </div>
          <p className={cx('game__label dsp', row?.why && 'is-why')} key={at}>
            {row ? row.label : ' '}
          </p>
          <div className="game__dots" data-hold>
            {rows.map((item, i) => (
              <button
                type="button"
                key={item.label}
                className={cx(i === at && 'is-on', item.why && !revealed && 'is-locked')}
                disabled={item.why && step <= before}
                onClick={() => setPick(i)}
                aria-label={item.label}
              />
            ))}
          </div>
        </div>
        {side(1)}
      </div>
    </section>
  );
}

export const S23 = ({ step }) => (
  <Game
    step={step}
    title="نهاية تدريب تعاوني في نفس الجهة"
    names={['منشور أ', 'منشور ب']}
    scores={[381, 33]}
    comments={['62 تعليق', '7 تعليقات']}
    rows={[
      { label: 'البداية', a: 'حمد ودعاء', b: 'حمد ودعاء' },
      { label: 'المضمون', a: 'درس شخصي: التجربة القصيرة علمتها الانضباط وتحويل الطموح لالتزام يومي', b: 'مديح عام للجهة وعراقتها ودورها' },
      { label: 'الناس', a: 'تشكر المدير والمشرف بالاسم، والزملاء', b: 'ما فيه اسم أحد' },
      { label: 'الصوت', a: 'صوتها هي', b: 'صوت بيان رسمي', why: true }
    ]}
  />
);

export const S24 = ({ step }) => (
  <Game
    step={step}
    lateTitle
    title={'الدرس المحدد ضد "تعلمت الكثير"'}
    names={['منشور ج', 'منشور د']}
    scores={[621, 14]}
    comments={['29 تعليق', '2 تعليق']}
    rows={[
      { label: 'المناسبة', a: 'نهاية تدريب', b: 'نهاية تدريب' },
      { label: 'الطول', a: 'قرابة 100 كلمة', b: 'قرابة 130 كلمة' },
      { label: 'وش تعلّم', a: 'يحدد: تحليل الأدلة الرقمية واستخراج البيانات منها', b: '"تعلمت الكثير" بدون ولا مثال' },
      { label: 'المجال', a: 'مجال واضح، وهاشتاقات من نفس المجال', b: 'تجربة عامة', why: true }
    ]}
  />
);

// ===== Slide 25: a whole cohort posts the same news =====
// Reactions on each graduation post of the cohort, highest first. No names: only «أنا» is marked.
const COHORT = [401, 369, 352, 344, 244, 191, 179, 161, 121];
const ME = 1;
const PLOT = { w: 860, h: 640, right: 76, left: 16, base: 560, top: 60, max: 420 };
const BAND = (PLOT.w - PLOT.right - PLOT.left) / COHORT.length;
const BAR = 46;
const yOf = value => PLOT.base - (value / PLOT.max) * (PLOT.base - PLOT.top);
const COHORT_SAYS = [
  <>
    منشورات تخرّج لنفس الدفعة من برنامج قيادي، في نفس الأسبوع: <span className="acc">من 121 إلى 401 تفاعل</span>
  </>,
  <>أعلى منشور وأقل منشور كلامهم عام ومتشابه تقريبًا</>,
  <>عبارات تتكرر في أكثر من منشور: عدد المتقدمين، "49 أخ وأخت"، "وعي قيادي"</>,
  <>
    منشور ذكر بالتحديد وش الورش والجلسات اللي حضرها: <span className="acc">352 تفاعل</span>
  </>
];
const HOT = [[0, 8], [0, 8], [], [2]];
const LABELLED = [[0, 8], [0, 8], [0, 8], [0, 2, 8]];

export function S25({ step }) {
  const at = Math.min(step, 3);
  const end = step >= 4;
  return (
    <section className={cx('slide s25', end && 'is-end')}>
      <h2 className="ttl">دفعة كاملة تنشر نفس الخبر</h2>
      <svg className="s25__chart" viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} role="img" aria-label="تفاعل منشورات التخرّج التسعة للدفعة، من الأعلى للأقل">
        {[100, 200, 300, 400].map(tick => (
          <g key={tick}>
            <path className="s25__grid" d={`M${PLOT.left} ${yOf(tick)}H${PLOT.w - PLOT.right}`} />
            <text className="s25__tick" x={PLOT.w - PLOT.right + 14} y={yOf(tick) + 8}>
              {tick}
            </text>
          </g>
        ))}
        <path className="s25__base" d={`M${PLOT.left} ${PLOT.base}H${PLOT.w - PLOT.right}`} />
        {COHORT.map((value, i) => {
          const cxp = PLOT.w - PLOT.right - (i + 0.5) * BAND;
          const top = yOf(value);
          const hot = HOT[at].includes(i);
          const labelled = LABELLED[at].includes(i) || i === ME;
          return (
            <g
              key={i}
              className={cx('s25__bar', i === ME && 'is-me', hot && 'is-hot', labelled && 'is-lab')}
              tabIndex={0}
              role="img"
              aria-label={`${i === ME ? 'منشوري أنا' : `منشور ${i + 1}`}: ${value} تفاعل`}
              data-hold
            >
              <rect className="s25__hit" x={cxp - BAND / 2} y={PLOT.top - 30} width={BAND} height={PLOT.base - PLOT.top + 30} />
              <path
                className="s25__col"
                style={{ '--d': 0.3 + i * 0.07 }}
                d={`M${cxp - BAR / 2} ${PLOT.base}V${top + 8}a8 8 0 0 1 8-8h${BAR - 16}a8 8 0 0 1 8 8V${PLOT.base}z`}
              />
              <text className="s25__val" x={cxp} y={top - 16} textAnchor="middle">
                {value}
              </text>
              {i === ME && (
                <text className="s25__me" x={cxp} y={PLOT.base + 50} textAnchor="middle">
                  أنا
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr">
        <caption>تفاعل منشورات التخرّج للدفعة</caption>
        <tbody>
          {COHORT.map((value, i) => (
            <tr key={i}>
              <th scope="row">{i === ME ? 'أنا' : `منشور ${i + 1}`}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="s25__say dsp" key={at} aria-live="polite">
        {COHORT_SAYS[at]}
      </p>
      <p className="s25__sum dsp">
        الوصول <span className="mono">=</span> شبكتك <span className="mono acc">×</span> توقيتك <span className="mono acc">×</span> كتابتك
      </p>
    </section>
  );
}

// ===== Slide 26: the trainee's limits, as a boundary on the chart =====
const LIMITS = [
  ['وش تعلمت وكيف فكرت', 'أسماء العملاء والمشاريع'],
  ['المهارة اللي اكتسبتها', 'الأنظمة الداخلية ولقطات الشاشة من الشغل'],
  ['شكر حقيقي لناس بأسمائهم', 'أرقام الشركة ونتائجها الداخلية'],
  ['صورة من فعالية عامة بإذن اللي فيها', 'أي مشروع ما انعلن رسميًا']
];

export function S26({ step }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [step]);
  const at = pick ?? Math.min(step, LIMITS.length - 1);
  return (
    <section className={cx('slide s26', step === 4 && 'is-doubt')}>
      <h2 className="ttl">حدود المتدرب</h2>
      <div className={cx('vw', step <= 4 && 'is-on')}>
        <span className="s26__line" aria-hidden="true" />
        <div className={cx('s26__rows', step === 4 && 'is-off')}>
          <p className="s26__head s26__head--yes dsp">انشر</p>
          <p className="s26__head s26__head--no dsp">لا تنشر</p>
          <p className="s26__val s26__val--yes dsp" key={`y${at}`}>
            {LIMITS[at][0]}
          </p>
          <p className="s26__val s26__val--no dsp" key={`n${at}`}>
            {LIMITS[at][1]}
          </p>
          <div className="s26__dots" data-hold>
            {LIMITS.map((pair, i) => (
              <button type="button" key={pair[0]} className={cx(i === at && 'is-on', i < at && 'is-seen')} onClick={() => setPick(i)} aria-label={`${pair[0]} مقابل ${pair[1]}`} />
            ))}
          </div>
        </div>
        <p className={cx('s26__doubt dsp rv', step === 4 && 'is-on')}>
          <span>إذا شاكّ، اسأل مشرفك قبل ما تنشر</span>
        </p>
      </div>
      <div className={cx('vw s26__last dsp', step >= 5 && 'is-on')}>
        <p>مو كل خبر لازم يننشر:</p>
        <p className="acc">اختار اللي يخدم اتجاهك</p>
      </div>
    </section>
  );
}

// ===== Slides 27 and 28: the two exercises =====
export function S27({ step }) {
  return (
    <section className="slide s27 drill">
      <h2 className="ttl">تمرين 1، العنوان (3 دقائق)</h2>
      <div className="drill__timer in" style={{ '--d': 0.2 }}>
        <Timer seconds={180} go={step >= 1} />
      </div>
      <ul className="drill__list drill__list--plain">
        <li className="in" style={{ '--d': 0.3 }}>
          <span className="dsp">اكتب عنوان جديد بالصيغة:</span>
          <span className="drill__chips dsp">
            <i>وش تسوي</i>
            <b className="mono">+</b>
            <i>في وش</i>
            <b className="mono">+</b>
            <i>دليل واحد</i>
          </span>
        </li>
        <li className="in" style={{ '--d': 0.45 }}>
          <span className="dsp">اقراه للي جنبك: يعرف وش تسوي من العنوان بس؟</span>
        </li>
      </ul>
    </section>
  );
}

export function S28({ step }) {
  return (
    <section className="slide s28 drill">
      <h2 className="ttl">تمرين 2، أول سطرين (5 دقائق)</h2>
      <div className="drill__timer in" style={{ '--d': 0.2 }}>
        <Timer seconds={300} go={step >= 1} />
      </div>
      <ul className="drill__list drill__list--plain">
        <li className="in" style={{ '--d': 0.3 }}>
          <span className="dsp">اكتب أول سطرين لمنشور عن شي تعلمته في التدريب هالأسبوع</span>
        </li>
        <li className="in" style={{ '--d': 0.45 }}>
          <span className="dsp">استخدم وحدة من الطرق الست</span>
          <span className="drill__chips drill__chips--small dsp">
            {OPENER_NAMES.map(name => (
              <i key={name}>{name}</i>
            ))}
          </span>
        </li>
        <li className="in" style={{ '--d': 0.6 }}>
          <span className="dsp">بدّل الورقة مع اللي جنبك: لو ما ودّه يكمل يقرا، أعد الكتابة</span>
        </li>
      </ul>
    </section>
  );
}

// ===== Slide 29: finish the draft at home, with a checklist to photograph =====
const CHECKS = ['فيه تفصيلة وحدة على الأقل ما يعرفها غيرك؟', 'وش تعلمت واضح بجملة؟', 'ما فيه معلومة داخلية عن الشركة؟', 'ما فيه عبارات شريحة 15؟'];

export function S29() {
  const [done, setDone] = useState([]);
  const toggle = i => setDone(list => (list.includes(i) ? list.filter(k => k !== i) : [...list, i]));
  return (
    <section className="slide s29">
      <h2 className="ttl">كمّل المسودة في البيت</h2>
      <p className="s29__do dsp in" style={{ '--d': 0.15 }}>
        كمّل المنشور في البيت بالبناء البسيط، وانشره خلال أسبوع
      </p>
      <p className="s29__label dsp in" style={{ '--d': 0.3 }}>
        قبل ما تنشر، راجع:
      </p>
      <ul className="s29__list" data-hold>
        {CHECKS.map((check, i) => (
          <li key={check} className="in" style={{ '--d': 0.4 + i * 0.1 }}>
            <button type="button" className={cx(done.includes(i) && 'is-done')} onClick={() => toggle(i)} role="checkbox" aria-checked={done.includes(i)}>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect x="4" y="4" width="40" height="40" rx="10" />
                <path d="M13 25l8 9 15-18" pathLength="100" />
              </svg>
              <span>{check}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ===== A QR code: Rakaya teal on white =====
export function Qr({ data, label }) {
  const n = data.rows.length;
  const pad = 2;
  let d = '';
  data.rows.forEach((row, y) => {
    for (let x = 0; x < n; x++) if (row[x] === '1') d += `M${x + pad} ${y + pad}h1v1h-1z`;
  });
  return (
    <svg className="qr" viewBox={`0 0 ${n + pad * 2} ${n + pad * 2}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={n + pad * 2} height={n + pad * 2} fill="#fff" />
      <path d={d} fill={TEAL} />
    </svg>
  );
}

// ===== Slide 30: the thirty-day challenge =====
// The follow-up link is not decided yet. Put it here and the QR appears on the left of the slide.
const FOLLOW_UP = null;

export function S30({ step }) {
  const days = [];
  for (let day = 0; day <= 30; day++) days.push(<path key={day} className={cx('s30__day', day % 5 === 0 && 'is-major')} d={`M${1728 - day * 57.6} ${day % 5 === 0 ? 46 : 60}V100`} />);
  return (
    <section className="slide s30">
      <h2 className="ttl">تحدي 30 يوم</h2>
      <ol className={cx('s30__list', FOLLOW_UP && 'has-qr')}>
        <li className="in dsp" style={{ '--d': 0.15 }}>
          منشورين خلال <span className="mono acc">30</span> يوم حسب اتجاهك، أولهم المسودة اللي بديتها اليوم
        </li>
        <li className={cx('rv dsp', step >= 1 && 'is-on')}>
          <span className="mono acc">10</span> تعليقات فيها رأي على منشورات غيرك
        </li>
        <li className={cx('rv dsp', step >= 2 && 'is-on')}>نتقابل بعد شهر: وش صار؟</li>
      </ol>
      {FOLLOW_UP && (
        <div className="qrcard s30__qr in" style={{ '--d': 0.4 }}>
          <Qr data={FOLLOW_UP} label="كود QR للمتابعة بعد الورشة" />
        </div>
      )}
      <svg className="s30__tape in" viewBox="0 0 1728 140" style={{ '--d': 0.3 }} aria-hidden="true">
        <path className="s30__base" d="M0 100H1728" />
        {days}
        <circle className="s30__post" cx={1728 - 3 * 57.6} cy="100" r="24" />
        <circle className="s30__post" cx={1728 - 19 * 57.6} cy="100" r="24" style={{ '--d': 0.5 }} />
        {[2, 5, 8, 10, 13, 16, 20, 22, 25, 28].map((day, i) => (
          <circle key={day} className={cx('s30__note', step >= 1 && 'is-on')} cx={1728 - day * 57.6} cy="100" r="9" style={{ '--d': i * 0.06 }} />
        ))}
        <path className={cx('s30__flag', step >= 2 && 'is-on')} d="M0 100V14l52 22-52 22" />
      </svg>
    </section>
  );
}

// ===== Slide 31: the close =====
export function S31() {
  return (
    <section className="slide s31">
      <div className="s31__text" role="group" aria-label="لينكدإن على طريقتك. بس اختار طريقتك بقصد.">
        <StrokeLine text="لينكدإن على طريقتك." size={118} color={TEAL} wait={300} />
        <StrokeLine text="بس اختار طريقتك بقصد." size={104} color={PARTS[8].deep} wait={1000} />
      </div>
      <div className="qrcard s31__qr in" style={{ '--d': 0.5 }}>
        <Qr data={QR_LINKEDIN} label="كود QR لحسابي في لينكدإن" />
        <p className="mono ltr">linkedin.com/in/muhmmadalsharif</p>
      </div>
      <p className="s31__by">محمد الشريف</p>
    </section>
  );
}
