# Graph Report - yallashoot.com  (2026-09-10)

## Corpus Check
- 71 files · ~89,861 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 352 nodes · 641 edges · 23 communities (15 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `77ca3dbb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dbConnect
- react
- services/api.ts
- toLatinNumerals
- package.json
- types/api.ts
- providers.tsx
- compilerOptions
- indexing.ts
- dependencies
- manifest.json
- Task List
- Task List: Match Page & UI Refinements
- README.md
- competitions/featured/route.ts
- games/featured/route.ts
- proxy.ts
- AGENTS.md
- eslint.config.mjs
- postcss.config.mjs
- sw.js

## God Nodes (most connected - your core abstractions)
1. `react` - 27 edges
2. `lucide-react` - 23 edges
3. `dbConnect()` - 23 edges
4. `toLatinNumerals()` - 20 edges
5. `fetchFrom365Scores()` - 16 edges
6. `compilerOptions` - 16 edges
7. `next` - 15 edges
8. `generateMatchSlug()` - 13 edges
9. `TeamPage()` - 11 edges
10. `getGameDetails()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getCompetitorStats()`  [EXTRACTED]
  src/app/api/competitor-stats/route.ts → src/services/api.ts
- `GET()` --calls--> `dbConnect()`  [EXTRACTED]
  src/app/api/games/route.ts → src/lib/db.ts
- `GET()` --calls--> `dbConnect()`  [EXTRACTED]
  src/app/api/highlights/route.ts → src/lib/db.ts
- `GET()` --calls--> `getGameDetails()`  [EXTRACTED]
  src/app/api/match/[id]/route.ts → src/services/api.ts
- `GET()` --calls--> `getCompetitionStandings()`  [EXTRACTED]
  src/app/api/standings/[leagueId]/route.ts → src/services/api.ts

## Import Cycles
- None detected.

## Communities (23 total, 6 thin omitted)

### Community 0 - "dbConnect"
Cohesion: 0.08
Nodes (40): mongoose, GET(), dynamic, GET(), dynamic, GET(), dynamic, POST() (+32 more)

### Community 1 - "react"
Cohesion: 0.06
Nodes (32): nextConfig, hls.js, lucide-react, next, react, @tanstack/react-query, metadata, metadata (+24 more)

### Community 2 - "services/api.ts"
Cohesion: 0.13
Nodes (28): dynamic, GET(), dynamic, GET(), dynamic, GET(), dynamic, GET() (+20 more)

### Community 3 - "toLatinNumerals"
Cohesion: 0.09
Nodes (26): dynamic, GET(), dynamic, generateMetadata(), mongooseId(), NewsArticlePage(), PageProps, dynamic (+18 more)

### Community 4 - "package.json"
Cohesion: 0.07
Nodes (29): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+21 more)

### Community 5 - "types/api.ts"
Cohesion: 0.10
Nodes (28): COMMENTATORS, getAssignedCommentator(), MatchDetailsClient(), MatchDetailsClientProps, PitchLineups(), PitchLineupsProps, SecurePlayer(), Competitor (+20 more)

### Community 6 - "providers.tsx"
Cohesion: 0.16
Nodes (14): cairo, metadata, viewport, GoogleAnalytics(), Header(), MobileBottomNav(), Providers(), SettingsContext (+6 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "indexing.ts"
Cohesion: 0.24
Nodes (10): dynamic, POST(), dynamic, POST(), getGoogleAccessToken(), IndexNowResponse, notifyAllSearchEngines(), notifyGoogleIndexing() (+2 more)

### Community 9 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, clsx, hls.js, lucide-react, mongodb, mongoose, next, react (+3 more)

### Community 10 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 11 - "Task List"
Cohesion: 0.29
Nodes (6): Implementation Plan: Match Page & UI Refinements, Overview, Phase 1: Core Logic & Dates, Phase 2: Navigation & Lineup 3D, Phase 3: Verification, Task List

### Community 12 - "Task List: Match Page & UI Refinements"
Cohesion: 0.40
Nodes (4): Phase 1: Core Logic & Dates, Phase 2: Navigation & Lineup 3D, Phase 3: Verification, Task List: Match Page & UI Refinements

### Community 13 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started., Learn More

### Community 15 - "games/featured/route.ts"
Cohesion: 0.40
Nodes (3): dynamic, MAJOR_COMPETITION_IDS, TOP_TEAMS_IDS

## Knowledge Gaps
- **155 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+150 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 176 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `dbConnect`, `services/api.ts`, `toLatinNumerals`, `package.json`, `types/api.ts`, `providers.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `next` connect `react` to `dbConnect`, `services/api.ts`, `toLatinNumerals`, `package.json`, `providers.tsx`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `react` to `dbConnect`, `toLatinNumerals`, `package.json`, `types/api.ts`, `providers.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dbConnect` be split into smaller, more focused modules?**
  _Cohesion score 0.07581453634085213 - nodes in this community are weakly interconnected._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._
- **Should `services/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13368983957219252 - nodes in this community are weakly interconnected._