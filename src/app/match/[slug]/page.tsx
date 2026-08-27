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
      };
    }

    const { homeCompetitor, awayCompetitor } = data.game;
    const titleText = `بث مباشر مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} | نتائج المباريات والتشكيلة`;
    const descText = `تابع التغطية المباشرة والبث المباشر لمباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} اليوم مع التشكيلة الرسمية والإحصائيات الحية لحظة بلحظة.`;

    return {
      title: titleText,
      description: descText,
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

  const { homeCompetitor, awayCompetitor, startTime } = detailsData.game;
  const matchJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${homeCompetitor.name} ضد ${awayCompetitor.name}`,
    "startDate": startTime ? new Date(startTime).toISOString() : undefined,
    "homeTeam": {
      "@type": "SportsTeam",
      "name": homeCompetitor.name
    },
    "awayTeam": {
      "@type": "SportsTeam",
      "name": awayCompetitor.name
    },
    "eventStatus": detailsData.game.statusGroup === 4 ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
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



