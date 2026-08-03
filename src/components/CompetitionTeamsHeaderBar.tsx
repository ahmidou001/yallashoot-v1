"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface TeamItem {
  id: number;
  name: string;
}

interface CompetitionItem {
  id: number;
  name: string;
  shortName: string;
  logo: string;
  teams: TeamItem[];
}

const FEATURED_COMPETITIONS: CompetitionItem[] = [
  {
    id: 572,
    name: "دوري أبطال أوروبا",
    shortName: "أبطال أوروبا",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/572",
    teams: [
      { id: 131, name: "ريال مدريد" },
      { id: 132, name: "برشلونة" },
      { id: 110, name: "مانشستر سيتي" },
      { id: 331, name: "بايرن ميونخ" },
      { id: 480, name: "باريس سان جيرمان" },
      { id: 104, name: "أرسنال" },
      { id: 108, name: "ليفربول" },
      { id: 224, name: "إنتر ميلان" },
      { id: 341, name: "بوروسيا دورتموند" },
      { id: 134, name: "أتلتيكو مدريد" },
      { id: 227, name: "ميلان" },
      { id: 226, name: "يوفنتوس" },
      { id: 106, name: "تشيلسي" },
      { id: 114, name: "توتنهام" },
      { id: 234, name: "نابولي" },
      { id: 232, name: "أتالانتا" },
      { id: 890, name: "سبورتنج لشبونة" },
      { id: 144, name: "أتلتيك بلباو" },
      { id: 337, name: "فرانكفورت" },
      { id: 333, name: "باير ليفركوزن" },
    ],
  },
  {
    id: 7,
    name: "الدوري الإنجليزي الممتاز",
    shortName: "الدوري الإنجليزي",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/7",
    teams: [
      { id: 104, name: "أرسنال" },
      { id: 110, name: "مانشستر سيتي" },
      { id: 108, name: "ليفربول" },
      { id: 105, name: "مانشستر يونايتد" },
      { id: 106, name: "تشيلسي" },
      { id: 114, name: "توتنهام" },
      { id: 109, name: "أستون فيلا" },
      { id: 116, name: "نيوكاسل" },
      { id: 38, name: "برايتون" },
      { id: 107, name: "إيفرتون" },
      { id: 120, name: "فولهام" },
      { id: 50, name: "بورنموث" },
      { id: 63, name: "برينتفورد" },
      { id: 10, name: "كريستال بالاس" },
      { id: 29, name: "نوتنجهام فورست" },
      { id: 36, name: "ليدز يونايتد" },
      { id: 9, name: "إبسويتش تاون" },
      { id: 117, name: "سندرلاند" },
      { id: 11, name: "هال سيتي" },
      { id: 24, name: "كوفنتري سيتي" },
    ],
  },
  {
    id: 11,
    name: "الدوري الإسباني الممتاز",
    shortName: "الدوري الإسباني",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/11",
    teams: [
      { id: 131, name: "ريال مدريد" },
      { id: 132, name: "برشلونة" },
      { id: 134, name: "أتلتيكو مدريد" },
      { id: 135, name: "إشبيلية" },
      { id: 144, name: "أتلتيك بلباو" },
      { id: 146, name: "ريال بيتيس" },
      { id: 154, name: "ريال سوسيداد" },
      { id: 133, name: "فياريال" },
      { id: 139, name: "فالنسيا" },
      { id: 7067, name: "جيرونا" },
      { id: 158, name: "سيلتا فيجو" },
      { id: 143, name: "أوساسونا" },
      { id: 140, name: "خيتافي" },
      { id: 168, name: "ألافيس" },
      { id: 174, name: "رايو فاييكانو" },
      { id: 136, name: "إسبانيول" },
      { id: 156, name: "إلتشي" },
      { id: 150, name: "ليفانتي" },
      { id: 152, name: "مالقا" },
      { id: 148, name: "ديبورتيفو لاكورونيا" },
    ],
  },
  {
    id: 557,
    name: "البطولة الاحترافية المغربية",
    shortName: "الدوري المغربي",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/557",
    teams: [
      { id: 8204, name: "الرجاء البيضاوي" },
      { id: 8326, name: "الوداد الرياضي" },
      { id: 5455, name: "الجيش الملكي" },
      { id: 9974, name: "نهضة بركان" },
      { id: 8321, name: "المغرب الفاسي" },
      { id: 14596, name: "اتحاد طنجة" },
      { id: 8206, name: "الفتح الرباطي" },
      { id: 8323, name: "حسنية أكادير" },
      { id: 8203, name: "الدفاع الجديدي" },
      { id: 8210, name: "أولمبيك آسفي" },
      { id: 14597, name: "اتحاد تواركة" },
      { id: 8677, name: "النادي المكناسي" },
      { id: 8209, name: "الكوكب المراكشي" },
      { id: 49266, name: "نهضة الزمامرة" },
    ],
  },
  {
    id: 649,
    name: "الدوري السعودي للمحترفين",
    shortName: "الدوري السعودي",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/649",
    teams: [
      { id: 5457, name: "الهلال" },
      { id: 7549, name: "النصر" },
      { id: 8593, name: "الاتحاد" },
      { id: 8946, name: "الأهلي" },
      { id: 8945, name: "الشباب" },
      { id: 8947, name: "القادسية" },
      { id: 8941, name: "التعاون" },
      { id: 8943, name: "الاتفاق" },
      { id: 55793, name: "نيوم" },
      { id: 20733, name: "الفيحاء" },
      { id: 8942, name: "الفتح" },
      { id: 12138, name: "الخليج" },
      { id: 55800, name: "الخلود" },
      { id: 12135, name: "الرياض" },
      { id: 14895, name: "الحزم" },
      { id: 14898, name: "أبها" },
      { id: 8949, name: "الفيصلي" },
    ],
  },
  {
    id: 552,
    name: "الدوري المصري الممتاز",
    shortName: "الدوري المصري",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/552",
    teams: [
      { id: 8200, name: "الأهلي المصري" },
      { id: 8201, name: "الزمالك" },
      { id: 22143, name: "بيراميدز" },
      { id: 8303, name: "المصري البورسعيدي" },
      { id: 8312, name: "الاتحاد السكندري" },
      { id: 8310, name: "المقاولون العرب" },
      { id: 50882, name: "سيراميكا كليوباترا" },
      { id: 50877, name: "مودرن سبورت" },
      { id: 50527, name: "البنك الأهلي" },
      { id: 8300, name: "إنبي" },
      { id: 8309, name: "سموحة" },
      { id: 29732, name: "زد إف سي" },
      { id: 8306, name: "طلائع الجيش" },
      { id: 8308, name: "الجونة" },
      { id: 8610, name: "غزل المحلة" },
      { id: 8302, name: "بتروجت" },
      { id: 8311, name: "وادي دجلة" },
      { id: 19480, name: "أبو قير للأسمدة" },
    ],
  },
  {
    id: 623,
    name: "دوري أبطال آسيا للنخبة",
    shortName: "أبطال آسيا",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/623",
    teams: [
      { id: 5457, name: "الهلال" },
      { id: 7549, name: "النصر" },
      { id: 8593, name: "الاتحاد" },
      { id: 8946, name: "الأهلي السعودي" },
      { id: 7548, name: "العين الإماراتي" },
      { id: 8344, name: "الجزيرة الإماراتي" },
      { id: 7551, name: "السد القطري" },
      { id: 7552, name: "الريان القطري" },
      { id: 7553, name: "الغرافة" },
      { id: 7554, name: "الوصل" },
      { id: 14897, name: "الشرطة العراقي" },
      { id: 8285, name: "الحسين إربد" },
      { id: 10345, name: "باختاكور" },
      { id: 2150, name: "غامبا أوساكا" },
      { id: 9825, name: "غانغوون" },
      { id: 2200, name: "أدليد يونايتد" },
    ],
  },
  {
    id: 17,
    name: "الدوري الإيطالي الدرجة الأولى",
    shortName: "الدوري الإيطالي",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/17",
    teams: [
      { id: 224, name: "إنتر ميلان" },
      { id: 227, name: "ميلان" },
      { id: 226, name: "يوفنتوس" },
      { id: 234, name: "نابولي" },
      { id: 225, name: "روما" },
      { id: 236, name: "لاتسيو" },
      { id: 232, name: "أتالانتا" },
      { id: 228, name: "فيورنتينا" },
      { id: 245, name: "بولونيا" },
      { id: 235, name: "تورينو" },
      { id: 231, name: "جنوى" },
      { id: 229, name: "أودينيزي" },
      { id: 241, name: "بارما" },
      { id: 243, name: "كالياري" },
      { id: 246, name: "ليتشي" },
      { id: 266, name: "ساسولو" },
      { id: 6117, name: "كومو" },
      { id: 293, name: "مونزا" },
      { id: 308, name: "فينيزيا" },
      { id: 254, name: "فروزينوني" },
    ],
  },
  {
    id: 25,
    name: "الدوري الألماني البوندسليغا",
    shortName: "الدوري الألماني",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/25",
    teams: [
      { id: 331, name: "بايرن ميونخ" },
      { id: 341, name: "بوروسيا دورتموند" },
      { id: 333, name: "باير ليفركوزن" },
      { id: 7171, name: "لايبزيج" },
      { id: 337, name: "فرانكفورت" },
      { id: 338, name: "شتوتجارت" },
      { id: 349, name: "مونشنجلادباخ" },
      { id: 354, name: "فرايبورج" },
      { id: 351, name: "هوفنهايم" },
      { id: 332, name: "فيردر بريمن" },
      { id: 352, name: "ماينز 05" },
      { id: 358, name: "أوغسبورغ" },
      { id: 392, name: "يونيون برلين" },
      { id: 350, name: "كولن" },
      { id: 334, name: "هامبورج" },
      { id: 335, name: "شالكة" },
      { id: 366, name: "بادربورن" },
      { id: 418, name: "إلفيرسبيرج" },
    ],
  },
  {
    id: 35,
    name: "الدوري الفرنسي الدرجة الأولى",
    shortName: "الدوري الفرنسي",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/35",
    teams: [
      { id: 480, name: "باريس سان جيرمان" },
      { id: 469, name: "أولمبيك مارسيليا" },
      { id: 465, name: "أولمبيك ليون" },
      { id: 471, name: "موناكو" },
      { id: 478, name: "ليل" },
      { id: 481, name: "لانس" },
      { id: 470, name: "نيس" },
      { id: 477, name: "ستاد رين" },
      { id: 534, name: "بريست" },
      { id: 479, name: "ستراسبورج" },
      { id: 482, name: "تولوز" },
      { id: 493, name: "أنجيه" },
      { id: 476, name: "أوكسير" },
      { id: 472, name: "لوريان" },
      { id: 485, name: "لو آفر" },
      { id: 6075, name: "باريس أف.سي." },
      { id: 488, name: "تروا" },
      { id: 468, name: "لومان" },
    ],
  },
  {
    id: 624,
    name: "دوري أبطال أفريقيا",
    shortName: "أبطال أفريقيا",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/624",
    teams: [
      { id: 8200, name: "الأهلي المصري" },
      { id: 8204, name: "الرجاء البيضاوي" },
      { id: 8326, name: "الوداد الرياضي" },
      { id: 5455, name: "الجيش الملكي" },
      { id: 9974, name: "نهضة بركان" },
      { id: 3248, name: "الترجي التونسي" },
      { id: 3247, name: "صن داونز" },
      { id: 8201, name: "الزمالك" },
      { id: 8321, name: "المغرب الفاسي" },
      { id: 3251, name: "النجم الساحلي" },
    ],
  },
  {
    id: 167,
    name: "كأس أمم أفريقيا",
    shortName: "أمم أفريقيا",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/167",
    teams: [
      { id: 1649, name: "المغرب" },
      { id: 1648, name: "مصر" },
      { id: 1650, name: "الجزائر" },
      { id: 1651, name: "تونس" },
      { id: 1644, name: "السنغال" },
      { id: 1641, name: "كوت ديفوار" },
      { id: 1653, name: "نيجيريا" },
      { id: 1655, name: "الكاميرون" },
      { id: 1656, name: "غانا" },
      { id: 1657, name: "مالي" },
      { id: 1658, name: "بوركينا فاسو" },
      { id: 1659, name: "جنوب أفريقيا" },
    ],
  },
  {
    id: 5930,
    name: "كأس العالم 2026",
    shortName: "كأس العالم",
    logo: "https://imagecache.365scores.com/image/upload/f_auto,w_80,h_80,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitions/5930",
    teams: [
      { id: 1649, name: "المغرب" },
      { id: 1654, name: "الأرجنتين" },
      { id: 1642, name: "فرنسا" },
      { id: 1647, name: "البرازيل" },
      { id: 1645, name: "إسبانيا" },
      { id: 1646, name: "إنجلترا" },
      { id: 1640, name: "ألمانيا" },
      { id: 1643, name: "البرتغال" },
      { id: 1652, name: "السعودية" },
      { id: 1648, name: "مصر" },
    ],
  },
];

export default function CompetitionTeamsHeaderBar() {
  const [selectedComp, setSelectedComp] = useState<CompetitionItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const teamsScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md transition-all duration-300 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Mode 1: Competitions Bar (Default View) */}
      {!selectedComp ? (
        <div className="flex items-center gap-2">
          {/* Scroll Right */}
          <button
            onClick={() => handleScroll(scrollRef, "right")}
            aria-label="تمرير لليمين"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 shrink-0 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Competitions Carousel */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-1"
          >
            {FEATURED_COMPETITIONS.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedComp(comp)}
                className="group flex flex-col items-center justify-center gap-1.5 p-2 sm:px-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 shrink-0 transition-all duration-200 cursor-pointer min-w-[75px] sm:min-w-[90px]"
                title={`عرض أندية ${comp.name}`}
              >
                <img
                  src={comp.logo}
                  alt={comp.name}
                  width={32}
                  height={32}
                  className="h-7 w-7 sm:h-8 sm:w-8 object-contain transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <span className="text-[10px] sm:text-[11px] font-extrabold text-zinc-300 group-hover:text-emerald-400 truncate max-w-[85px]">
                  {comp.shortName}
                </span>
              </button>
            ))}
          </div>

          {/* Scroll Left */}
          <button
            onClick={() => handleScroll(scrollRef, "left")}
            aria-label="تمرير لليسار"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 shrink-0 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Header Mode 2: Teams Sub-Bar (When Competition Selected) */
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Active Competition Indicator & Back Button */}
          <div className="flex items-center gap-2 shrink-0 border-b sm:border-b-0 sm:border-l border-zinc-800 pb-2 sm:pb-0 sm:pl-3">
            <button
              onClick={() => setSelectedComp(null)}
              aria-label="الرجوع لكل البطولات"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-950 border border-zinc-700 hover:border-emerald-500/50 text-xs font-bold text-zinc-200 hover:text-emerald-400 transition cursor-pointer shrink-0"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>الكل</span>
            </button>

            <Link
              href={`/standings/${selectedComp.id}`}
              className="flex items-center gap-2 group hover:opacity-90 transition"
              title={`جدول ترتيب ${selectedComp.name}`}
            >
              <img
                src={selectedComp.logo}
                alt={selectedComp.name}
                width={28}
                height={28}
                className="h-7 w-7 object-contain shrink-0"
              />
              <span className="text-xs font-extrabold text-emerald-400 truncate max-w-[120px] sm:max-w-[150px]">
                {selectedComp.shortName}
              </span>
            </Link>
          </div>

          {/* Teams Navigation Controls & Carousel */}
          <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
            <button
              onClick={() => handleScroll(teamsScrollRef, "right")}
              aria-label="تمرير لليمين"
              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 shrink-0 transition cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <div
              ref={teamsScrollRef}
              className="flex-1 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1"
            >
              {selectedComp.teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className="group flex flex-col items-center gap-1 p-1.5 px-2 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/60 hover:bg-emerald-950/30 shrink-0 transition-all cursor-pointer min-w-[65px] sm:min-w-[72px]"
                  title={`صفحة فريق ${team.name}`}
                >
                  <img
                    src={`https://imagecache.365scores.com/image/upload/f_auto,w_60,h_60,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${team.id}`}
                    alt={team.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                  <span className="text-[10px] font-bold text-zinc-300 group-hover:text-emerald-400 truncate max-w-[70px] text-center">
                    {team.name}
                  </span>
                </Link>
              ))}
            </div>

            <button
              onClick={() => handleScroll(teamsScrollRef, "left")}
              aria-label="تمرير لليسار"
              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 shrink-0 transition cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
