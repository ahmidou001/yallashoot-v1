import { redirect } from "next/navigation";

export default function StandingsIndexPage() {
  // Default to Premier League (League ID: 7) as the main standings hub
  redirect("/standings/7");
}
