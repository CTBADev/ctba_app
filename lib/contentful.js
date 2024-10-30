// lib/contentful.js
import { createClient } from "contentful";

const {
  C_DELIVERY_KEY,
  C_SPACE_ID,
} = require("../src/helpers/contentful-config");

const client = createClient({
  space: C_SPACE_ID,
  accessToken: C_DELIVERY_KEY,
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
