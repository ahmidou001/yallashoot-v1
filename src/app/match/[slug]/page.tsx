import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getGameDetails } from "@/services/api";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import MatchDetailsClient from "@/components/MatchDetailsClient";
import { extractIdFromSlug } from "@/lib/matchSlug";
import { signSecureStreamUrl } from "@/lib/crypto";

type RouteParams = {
  params: Promise<{ slug: string }>;
};



/**
 * Generate Dynamic SEO Metadata for Match Details Page
 */
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  try {
    const data = await getGameDetails(id);
    if (!data || !data.game) {
      return {
        title: "المباراة غير موجودة - يلا شوت لايف",
        alternates: {
          canonical: `/match/${slug}`,
        },
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const gameAny = data.game as any;
    const { homeCompetitor, awayCompetitor, competitionDisplayName, competitionName } = gameAny;
    const compName = competitionDisplayName || competitionName || "مباراة اليوم";
    const titleText = `بث مباشر مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} اليوم | يلا شوت Yalla Shoot`;
    const descText = `شاهد بث مباشر مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} اليوم في ${compName} بجودة عالية وبدون تقطيع عبر يلا شوت (Yalla Shoot). تفاصيل التشكيلة، القنوات الناقلة، والنتيجة لحظة بلحظة على yallashoot.`;

    return {
      title: titleText,
      description: descText,
      keywords: [
        `مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name}`,
        `بث مباشر مباراة ${homeCompetitor.name}`,
        `بث مباشر ${awayCompetitor.name}`,
        `مباراة ${homeCompetitor.name} اليوم`,
        `مباراة ${awayCompetitor.name} اليوم`,
        compName,
        "يلا شوت",
        "Yalla Shoot",
        "yallashoot",
        "بث مباشر",
        "مباريات اليوم بث مباشر"
      ],
      alternates: {
        canonical: `/match/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: titleText,
        description: descText,
        type: "video.other",
        images: [
          {
            url: "/logo-512.png",
            width: 512,
            height: 512,
            alt: `${homeCompetitor.name} ضد ${awayCompetitor.name} - يلا شوت`,
          }
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: titleText,
        description: descText,
        images: ["/logo-512.png"],
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "تفاصيل المباراة - يلا شوت لايف",
      alternates: {
        canonical: `/match/${slug}`,
      },
    };
  }
}

/**
 * Server Page Component
 */
export default async function MatchPage({ params }: RouteParams) {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);

  // 1. Fetch match details from upstream API
  let detailsData;
  try {
    detailsData = await getGameDetails(id);
  } catch (error) {
    console.error("Failed to load match details on server:", error);
  }

  if (!detailsData || !detailsData.game) {
    notFound();
  }

  const gameAny = detailsData.game as any;
  const { homeCompetitor, awayCompetitor, startTime, venue, competitionDisplayName, competitionName } = gameAny;
  const compName = competitionDisplayName || competitionName || "مباراة كرة قدم";
  const venueName = venue?.name || "الملعب الرئيسي";
  const venueCity = venue?.city || "غير محدد";

  const startIso = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
  const endIso = startTime
    ? new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const homeLogo = `https://imagecache.365scores.com/image/upload/f_auto,w_300,h_300,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${homeCompetitor.id}`;
  const awayLogo = `https://imagecache.365scores.com/image/upload/f_auto,w_300,h_300,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${awayCompetitor.id}`;

  const matchJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name}`,
    "description": `متابعة البث المباشر والتغطية الحية لمباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} اليوم في ${compName}.`,
    "startDate": startIso,
    "endDate": endIso,
    "eventStatus": detailsData.game.statusGroup === 4
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": venueName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": venueCity,
        "addressCountry": "Global"
      }
    },
    "image": [
      homeLogo,
      awayLogo
    ],
    "homeTeam": {
      "@type": "SportsTeam",
      "name": homeCompetitor.name,
      "url": `https://www.yallahsoot.com/team/${homeCompetitor.id}`,
      "logo": homeLogo
    },
    "awayTeam": {
      "@type": "SportsTeam",
      "name": awayCompetitor.name,
      "url": `https://www.yallahsoot.com/team/${awayCompetitor.id}`,
      "logo": awayLogo
    },
    "performer": [
      {
        "@type": "SportsTeam",
        "name": homeCompetitor.name,
        "url": `https://www.yallahsoot.com/team/${homeCompetitor.id}`,
        "image": homeLogo
      },
      {
        "@type": "SportsTeam",
        "name": awayCompetitor.name,
        "url": `https://www.yallahsoot.com/team/${awayCompetitor.id}`,
        "image": awayLogo
      }
    ],
    "organizer": {
      "@type": "Organization",
      "name": compName,
      "url": "https://www.yallahsoot.com"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.yallahsoot.com/match/${slug}`,
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": startIso
    },
    "url": `https://www.yallahsoot.com/match/${slug}`
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(matchJsonLd) }}
      />
      <MatchDetailsClient
        initialDetails={detailsData}
        gameId={id}
        matchSlug={slug}
      />
    </div>
  );
}



