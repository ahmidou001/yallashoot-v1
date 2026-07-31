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

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      <MatchDetailsClient
        initialDetails={detailsData}
        gameId={id}
        matchSlug={slug}
      />
    </div>
  );
}



