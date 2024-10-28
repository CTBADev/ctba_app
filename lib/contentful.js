// lib/contentful.js
import { createClient } from "contentful";

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
});

export async function getAllGames() {
  const entries = await client.getEntries({
    content_type: "game",
    include: 2, // Include referenced entries up to two levels deep
  });

  return entries.items.map((item) => {
    // Access the clubName fields from the referenced `club` entries
    const teamA = item.fields.teamA?.fields?.shortName || "Unknown Club A";
    const teamB = item.fields.teamB?.fields?.shortName || "Unknown Club B";

    console.log("games", item.fields);

    return {
      id: item.sys.id,
      teamA,
      teamB,
      scoreA: item.fields.scoreA,
      scoreB: item.fields.scoreB,
      status: item.fields.status,
    };
  });
}
