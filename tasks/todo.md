# قائمة المهام التنفيذية (Task List)

## Task 1: تحديث الـ Metadata لصفحة المباراة في Next.js
**Description:** تعديل دالة `generateMetadata` في `src/app/match/[slug]/page.tsx` لجعل عنوان الصفحة يتضمن اسم الفريقين، البطولة، ومصطلحات البحث الأساسية: `يلا شوت | Yalla Shoot`.

**Acceptance criteria:**
- [x] العنوان (Title) يصبح بصيغة: `بث مباشر مباراة [فريق 1] ضد [فريق 2] اليوم | يلا شوت Yalla Shoot`
- [x] الوصف (Description) يذكر البطولة والقناة والتغطية الحية عبر yallashoot.
- [x] الـ OpenGraph والـ Twitter يعكسان العنوان المحسن.

**Verification:**
- [x] فحص كود `src/app/match/[slug]/page.tsx`
- [x] التأكد من عدم وجود أخطاء TypeScript

**Dependencies:** None
**Files likely touched:** `src/app/match/[slug]/page.tsx`
**Estimated scope:** S (1 file)

---

## Task 2: تصميم وتضمين نص الـ SEO الديناميكي في تبويب تفاصيل اللقاء مع الروابط الداخلية
**Description:** إضافة قسم محتوى تحليلي وتقديمي في تبويب "التفاصيل" بصفحة المباراة بأسلوب رياضي احترافي يحتوي على الكلمات المستهدفة ويدمج شبكة روابط داخلية قوية (صفحات الفرق، جدول الترتيب، ملخصات، أخبار).

**Acceptance criteria:**
- [x] عنوان المقال `<h3>` يحتوي على: `تقديم مباراة [فريق 1] و[فريق 2] بث مباشر اليوم | يلا شوت Yalla Shoot`.
- [x] الفقرات تحتوي على صياغة صحفية متقنة تذكر اسم الفريقين، البطولة، القناة الناقلة، والمعلق.
- [x] إضافة شبكة روابط داخلية لكلا الفريقين، جدول ترتيب البطولة، مباريات اليوم، الملخصات، والأخبار.
- [x] إضافة شريط وسوم (Hashtags) بالكلمات الشائعة مثل `#مباراة_[الفريق]` و `#يلا_شوت` و `#Yalla_Shoot`.
- [x] تصميم داكن أنيق ومتناسق 100% مع واجهة الموقع ومتجاوب مع الهواتف.

**Verification:**
- [x] مراجعة الكود في `src/components/MatchDetailsClient.tsx`
- [x] التأكد من تجاوب التصميم مع جميع الشاشات

**Dependencies:** Task 1
**Files likely touched:** `src/components/MatchDetailsClient.tsx`
**Estimated scope:** S (1 file)

---

## Task 3: التحقق والبناء (Build Verification) ورفع التحديث
**Description:** تشغيل `npm run build` للتأكد من خلو المشروع من أي أخطاء ورفع التعديل عبر Git ليتم نشره في Vercel الجديد.

**Acceptance criteria:**
- [x] اكتمال `npm run build` بنجاح دون أي خطأ (0 errors).
- [x] رفع التعديلات عبر Git إلى المستودع الجديد `yallakooora/yallahsoot-v2`.

**Verification:**
- [x] `git status` نظيف
- [x] `git push` تم بنجاح

**Dependencies:** Task 1, Task 2
**Estimated scope:** XS (Commands)
