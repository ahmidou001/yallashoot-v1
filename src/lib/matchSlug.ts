const AR_MAP: Record<string, string> = {
  أ: "a", إ: "e", آ: "a", ا: "a", ب: "b", ت: "t", ث: "th", ج: "j",
  ح: "h", خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh",
  ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q",
  ك: "k", ل: "l", م: "m", n: "n", ه: "h", و: "w", ي: "y", ى: "a",
  ة: "a", ء: "", ئ: "y", ؤ: "w", لا: "la",
};

const TEAM_TRANSLATIONS: Record<string, string> = {
  // Countries
  "انجلترا": "england",
  "الارجنتين": "argentina",
  "فرنسا": "france",
  "اسبانيا": "spain",
  "ايطاليا": "italy",
  "المانيا": "germany",
  "البرازيل": "brazil",
  "البرتغال": "portugal",
  "المغرب": "morocco",
  "كرواتيا": "croatia",
  "هولندا": "netherlands",
  "الاوروغواي": "uruguay",
  "الارجواي": "uruguay",
  "السنغال": "senegal",
  "مصر": "egypt",
  "تونس": "tunisia",
  "الجزائر": "algeria",
  "السعوديه": "saudi-arabia",
  "المملكه العربيه السعوديه": "saudi-arabia",
  "قطر": "qatar",
  "بلجيكا": "belgium",
  "اليابان": "japan",
  "كوريا الجنوبيه": "south-korea",
  "استراليا": "australia",
  "امريكا": "usa",
  "الولايات المتحده": "usa",
  "الولايات المتحده الامريكيه": "usa",
  "كندا": "canada",
  "المكسيك": "mexico",
  "الكاميرون": "cameroon",
  "غانا": "ghana",
  "نيجيريا": "nigeria",
  "كوت ديفوار": "ivory-coast",
  "ساحل العاج": "ivory-coast",
  "كولومبيا": "colombia",
  "تشيلي": "chile",
  "بيرو": "peru",
  "السويد": "sweden",
  "سويسرا": "switzerland",
  "النمسا": "austria",
  "بولندا": "poland",
  "تركيا": "turkey",
  "الدنمارك": "denmark",
  "اوكرانيا": "ukraine",
  "ويلز": "wales",
  "ايرلندا": "ireland",
  "اسكتلندا": "scotland",
  "اليونان": "greece",
  "روسيا": "russia",
  "رومانيا": "romania",
  "المجر": "hungary",
  "التشيك": "czech-republic",
  "جمهوريه التشيك": "czech-republic",
  "سلوفاكيا": "slovakia",
  "سلوفينيا": "slovenia",
  "صربيا": "serbia",
  "البانيا": "albania",
  "فنلندا": "finland",
  "النرويج": "norway",
  "آيسلندا": "iceland",
  "الاكوادور": "ecuador",
  "باراغواي": "paraguay",
  "بوليفيا": "bolivia",
  "فنزويلا": "venezuela",
  "جمهوريه الكونغو": "congo",
  "الكونغو": "congo",
  "الكونغو الديمقراطيه": "dr-congo",
  "جنوب افريقيا": "south-africa",
  "مالي": "mali",
  "غينيا": "guinea",
  "بوركينا فاسو": "burkina-faso",
  "الاردن": "jordan",
  "العراق": "iraq",
  "الامارات": "uae",
  "عمان": "oman",
  "البحرين": "bahrain",
  "الكويت": "kuwait",
  "سوريا": "syria",
  "لبنان": "lebanon",
  "فلسطين": "palestine",
  "اليمن": "yemen",

  // Clubs
  "ريال مدريد": "real-madrid",
  "برشلونه": "barcelona",
  "اتلتيكو مدريد": "atletico-madrid",
  "اشبيليه": "sevilla",
  "ريال بيتيس": "real-betis",
  "ريال سوسيداد": "real-sociedad",
  "فالنسيا": "valencia",
  "فياريال": "villarreal",
  "ليفربول": "liverpool",
  "مانشستر سيتي": "manchester-city",
  "مانشستر يونايتد": "manchester-united",
  "تشيلسي": "chelsea",
  "ارسنال": "arsenal",
  "توتنهام": "tottenham",
  "نيوكاسل": "newcastle",
  "نيوكاسل يونايتد": "newcastle",
  "استون فيلا": "aston-villa",
  "برايتون": "brighton",
  "بايرن ميونخ": "bayern-munich",
  "بوروسيا دورتموند": "borussia-dortmund",
  "باير ليفركوزن": "bayer-leverkusen",
  "لايبزيج": "rb-leipzig",
  "اينتراخت فرانكفورت": "eintracht-frankfurt",
  "باريس سان جيرمان": "paris-saint-germain",
  "اولمبيك مارسيليا": "marseille",
  "مارسيليا": "marseille",
  "اولمبيك ليون": "lyon",
  "ليون": "lyon",
  "موناكو": "monaco",
  "ليل": "lille",
  "يوفنتوس": "juventus",
  "انتر ميلان": "inter-milan",
  "ميلان": "ac-milan",
  "ايه سي ميلان": "ac-milan",
  "روما": "roma",
  "نابولي": "napoli",
  "لاتسيو": "lazio",
  "فيورنتينا": "fiorentina",
  "اتالانتا": "atalanta",
  "الهلال": "al-hilal",
  "النصر": "al-nassr",
  "الاتحاد": "al-ittihad",
  "الاهلي": "al-ahli",
  "الشباب": "al-shabab",
  "الوداد": "wydad",
  "الوداد الرياضي": "wydad",
  "الرجاء": "raja",
  "الرجاء الرياضي": "raja",
  "الجيش الملكي": "as-far",
  "نهضه بركان": "rs-berkane",
  "الفتح الرياضي": "fath-union-sport",
  "اتحاد طنجه": "irt",
  "المغرب التطواني": "mat",
  "الاهلي المصري": "al-ahly",
  "الزمالك": "zamalek",
  "بيراميدز": "pyramids",
  "الترجي": "esperance",
  "الترجي التونسي": "esperance",
  "النجم الساحلي": "etoile-du-sahel",
  "اياكس": "ajax",
  "بورتو": "porto",
  "بنفيكا": "benfica",
  "سبورتينغ لشبونه": "sporting-lisbon",
  "انتر ميامي": "inter-miami",
};

export function toSlugSegment(name: string | undefined | null): string {
  if (!name) return "team";

  // Normalize name for translation lookup
  const normalized = name.trim()
    .replace(/^(نادي|منتخب|فريق)\s+/, "")
    .replace(/[أإآ]/g, "a") // wait, replace to "ا" for mapping consistency
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .trim();

  // Check dictionary
  if (TEAM_TRANSLATIONS[normalized]) {
    return TEAM_TRANSLATIONS[normalized];
  }

  // Fallback to phonetic transliteration
  let result = "";
  for (const char of name) {
    result += AR_MAP[char] ?? char;
  }

  return result
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateMatchSlug(
  home: string | { name: string; nameForURL?: string },
  away: string | { name: string; nameForURL?: string },
  id: string | number
): string {
  const homeName = typeof home === "string" ? home : (home.nameForURL || home.name);
  const awayName = typeof away === "string" ? away : (away.nameForURL || away.name);
  const homeSegment = toSlugSegment(homeName);
  const awaySegment = toSlugSegment(awayName);
  return `${homeSegment}-${awaySegment}-${id}`;
}

export function extractIdFromSlug(slug: string | undefined | null): string {
  if (!slug) return "";
  const parts = slug.split("-");
  return parts[parts.length - 1];
}
