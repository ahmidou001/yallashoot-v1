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

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

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

    return (
      <TeamDetailsClient
        team={team}
        squad={squadRes || { squads: [] }}
        transfers={transfersRes || { transfers: [], athletes: [], competitors: [] }}
        games={[...(resultsRes?.games || []), ...(fixturesRes?.games || [])]}
        standings={standings}
        stats={statsRes?.stats || null}
        seo={seoRes}
        related={relatedRes || { competitors: [] }}
        brackets={brackets}
      />
    );
  } catch (error) {
    console.error(`Error loading team page for ID ${teamId}:`, error);
    return notFound();
  }
}
