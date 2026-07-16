async function run() {
  const url = "https://webws.365scores.com/web/game/?appTypeId=5&langId=27&timezoneName=Africa/Casablanca&userCountryId=127&gameId=4769722";
  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const json = await res.json();
    if (json.game) {
      console.log("officials:", json.game.officials);
      // Let's filter members for any referee, commentator or coach
      if (json.game.members) {
        console.log("Total members count:", json.game.members.length);
        const sampleMembers = json.game.members.slice(0, 5);
        console.log("Sample members:", sampleMembers);
        // Find commentators if any
        const comms = json.game.members.filter(m => m.roleName?.includes("معلق") || m.roleName?.includes("تعليق") || m.role?.includes("comment"));
        console.log("Found commentators in members:", comms);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
