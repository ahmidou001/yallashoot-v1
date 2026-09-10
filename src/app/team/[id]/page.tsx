import React from "react";
import { notFound } from "next/navigation";
import { 
  getCompetitorProfile, 
  getCompetitorSquad, 
  getCompetitorTransfers, 
  getCompetitorFixtures,
  getCompetitorStandingsTable,
  getCompetitorStats,
  getCompetitorSEO,
  getCompetitorRelatedEntities,
  getCompetitionBrackets,
  getCompetitorResults
} from "@/services/api";
import TeamDetailsClient from "@/components/TeamDetailsClient";

import { Metadata } from "next";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { id: teamId } = await params;
  try {
    const profileRes = await getCompetitorProfile(teamId);
    if (!profileRes || !profileRes.competitors || profileRes.competitors.length === 0) {
      return {
        title: "الفريق غير موجود - يلا شوت لايف",
        alternates: {
          canonical: `/team/${teamId}`,
        },
        robots: {
          index: false,
          follow: true,
        },
      };
    }
    const team = profileRes.competitors[0];
    const teamName = team.name || "الفريق";
    const titleText = `فريق ${teamName} - النتائج والتشكيلة ومباريات اليوم | يلا شوت`;
    const descText = `متابعة مباريات نادي ${teamName} اليوم مباشرة، جداول الترتيب، قائمة اللاعبين، والنتائج الأخيرة مع تغطية شاملة وحصرية.`;

    return {
      title: titleText,
      description: descText,
      alternates: {
        canonical: `/team/${teamId}`,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: titleText,
        description: descText,
        type: "website",
        images: team.id
          ? [`https://imagecache.365scores.com/image/upload/f_auto,w_300,h_300,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${team.id}`]
          : [],
      },
    };
  } catch {
    return {
      title: "تفاصيل الفريق - يلا شوت لايف",
      alternates: {
        canonical: `/team/${teamId}`,
      },
    };
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id: teamId } = await params;
  
  if (!teamId) {
    return notFound();
  }

  try {
    // 1. Fetch competitor profile
    const profileRes = await getCompetitorProfile(teamId);
    if (!profileRes || !profileRes.competitors || profileRes.competitors.length === 0) {
      return notFound();
    }
    const team = profileRes.competitors[0];

    // 2. Fetch squad list
    const squadRes = await getCompetitorSquad(teamId).catch(() => null);

    // 3. Fetch transfers list
    const transfersRes = await getCompetitorTransfers(teamId).catch(() => null);

    // 4. Fetch fixtures and results
    const fixturesRes = await getCompetitorFixtures(teamId).catch(() => null);
    let resultsRes = null;
    if (fixturesRes && Array.isArray(fixturesRes.games) && fixturesRes.games.length > 0) {
      const soonestGameId = fixturesRes.games[0].id;
      resultsRes = await getCompetitorResults(teamId, soonestGameId).catch(() => null);
    } else if (fixturesRes && fixturesRes.paging?.previousPage) {
      const match = fixturesRes.paging.previousPage.match(/aftergame=(\d+)/);
      if (match && match[1]) {
        resultsRes = await getCompetitorResults(teamId, match[1]).catch(() => null);
      }
    }

    // 5. Fetch standings table
    const standingsRes = await getCompetitorStandingsTable(teamId).catch(() => null);
    let standings = null;
    if (standingsRes && standingsRes.standings && standingsRes.standings.length > 0) {
      standings = standingsRes.standings[0];
    }

    // 6. Fetch stats (top scorer rows for this competitor)
    const statsRes = await getCompetitorStats(teamId).catch(() => null);

    // 7. Fetch SEO description and FAQ
    const seoRes = await getCompetitorSEO(teamId).catch(() => null);

    // 8. Fetch related entities (rivals/related teams)
    const relatedRes = await getCompetitorRelatedEntities(teamId).catch(() => null);

    // 9. Find first competition with brackets and fetch its brackets data
    let bracketCompetitionId = null;
    if (profileRes && Array.isArray(profileRes.competitions)) {
      const compWithBrackets = profileRes.competitions.find((c: any) => c.hasBrackets === true);
      if (compWithBrackets) {
        bracketCompetitionId = compWithBrackets.id;
      }
    }

    let brackets = null;
    if (bracketCompetitionId) {
      const bracketsRes = await getCompetitionBrackets(bracketCompetitionId).catch(() => null);
      if (bracketsRes && bracketsRes.brackets) {
        brackets = Array.isArray(bracketsRes.brackets) 
          ? bracketsRes.brackets[0] 
          : bracketsRes.brackets;
      }
    }

    const teamJsonLd = {
      "@context": "https://schema.org",
      "@type": "SportsTeam",
      "name": team.name,
      "url": `https://www.yallahsoot.com/team/${teamId}`,
      "logo": `https://imagecache.365scores.com/image/upload/f_auto,w_300,h_300,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${team.id}`,
      "sport": "Football"
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }}
        />
        <TeamDetailsClient
          team={team}
          squad={squadRes || { squads: [] }}
          transfers={transfersRes || { transfers: [], athletes: [], competitors: [] }}
          games={[...(resultsRes?.games || []), ...(fixturesRes?.games || [])]}
          standings={standings}
          stats={statsRes || null}
          seo={seoRes}
          related={relatedRes || { competitors: [] }}
          brackets={brackets}
        />
      </>
    );
  } catch (error) {
    console.error(`Error loading team page for ID ${teamId}:`, error);
    return notFound();
  }
}
