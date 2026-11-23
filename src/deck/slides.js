import { S01, S02, S03, S04, S05, S06, S07, S08, S09, S10 } from './p1.jsx';
import { S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21 } from './p2.jsx';
import { S22, S23, S24, S25, S26, S27, S28, S29, S30, S31 } from './p3.jsx';

// The whole workshop is 31 slides; `steps` is how many presses a slide takes before the next one.
export const TOTAL = 31;
export const SLIDES = [
  { n: 1, title: 'لينكدإن على طريقتك', steps: 0, Component: S01, bare: true },
  { n: 2, title: 'سؤال برفع اليد', steps: 1, Component: S02 },
  { n: 3, title: 'ليش الحين', steps: 2, Component: S03 },
  { n: 4, title: 'ما فيه طريقة وحدة صح', steps: 0, Component: S04 },
  { n: 5, title: 'أربع طرق', steps: 4, Component: S05 },
  { n: 6, title: 'كل طريقة لها ثمن', steps: 3, Component: S06 },
  { n: 7, title: 'تمرين اختيار الاتجاه', steps: 1, Component: S07 },
  { n: 8, title: 'اتجاهك بسطر', steps: 3, Component: S08 },
  { n: 9, title: 'العنوان يقول اتجاهك', steps: 3, Component: S09 },
  { n: 10, title: 'أول شاشة في البروفايل', steps: 4, Component: S10 },
  { n: 11, title: 'أول سطرين هم المنشور', steps: 2, Component: S11 },
  { n: 12, title: 'ست طرق تبدأ فيها', steps: 6, Component: S12 },
  { n: 13, title: 'التفاصيل توصّل الشعور، والصفات لا', steps: 2, Component: S13 },
  { n: 14, title: 'بناء بسيط لأي منشور', steps: 4, Component: S14 },
  { n: 15, title: 'عبارات تخلي منشورك يشبه غيره', steps: 6, Component: S15 },
  { n: 16, title: 'الصورة والفيديو', steps: 2, Component: S16 },
  { n: 17, title: 'كيف يقرر مين يشوف منشورك', steps: 2, Component: S17 },
  { n: 18, title: 'وش يساعد منشورك', steps: 4, Component: S18 },
  { n: 19, title: 'وش يضر منشورك', steps: 4, Component: S19 },
  { n: 20, title: 'الزملاء والتعليقات، بالطريقة الصح', steps: 1, Component: S20 },
  { n: 21, title: 'الإيقاع والتوقيت', steps: 2, Component: S21 },
  { n: 22, title: 'قاعدة التشريح', steps: 2, Component: S22 },
  { n: 23, title: 'نهاية تدريب تعاوني في نفس الجهة', steps: 4, Component: S23 },
  { n: 24, title: 'الدرس المحدد ضد "تعلمت الكثير"', steps: 4, Component: S24 },
  { n: 25, title: 'دفعة كاملة تنشر نفس الخبر', steps: 4, Component: S25 },
  { n: 26, title: 'حدود المتدرب', steps: 5, Component: S26 },
  { n: 27, title: 'تمرين 1، العنوان (3 دقائق)', steps: 1, Component: S27 },
  { n: 28, title: 'تمرين 2، أول سطرين (5 دقائق)', steps: 1, Component: S28 },
  { n: 29, title: 'كمّل المسودة في البيت', steps: 0, Component: S29 },
  { n: 30, title: 'تحدي 30 يوم', steps: 2, Component: S30 },
  { n: 31, title: 'الخاتمة', steps: 0, Component: S31 }
];
