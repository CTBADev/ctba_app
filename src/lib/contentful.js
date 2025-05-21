import { createClient as createContentfulClient } from "contentful";
import { createClient as createContentfulManagementClient } from "contentful-management";

// Get environment variables
const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

// Validate environment variables
if (!space || !accessToken) {
  console.error("Missing Contentful environment variables:", {
    space: space ? "set" : "missing",
    accessToken: accessToken ? "set" : "missing",
  });
}

// Create Contentful client
export const client = createContentfulClient({
  space: space,
  accessToken: accessToken,
});

export function getContentfulClient() {
  if (!process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
    throw new Error("CONTENTFUL_MANAGEMENT_ACCESS_TOKEN is required");
  }

  return createContentfulManagementClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  });
}

export async function getAllGames() {
  try {
    console.log("Fetching games from Contentful...");
    const response = await client.getEntries({
      content_type: "game",
      include: 2, // Include linked entries
      order: "fields.gameNumber",
    });

    if (!response.items || response.items.length === 0) {
      console.log("No games found in Contentful");
      return [];
    }

    const games = response.items.map((item) => {
      const fields = item.fields;

      // Log the raw fields for debugging
      console.log("Raw game fields:", {
        id: item.sys.id,
        fields: fields,
      });

      const game = {
        id: item.sys.id,
        gameNumber: fields.gameNumber || null,
        teamA: fields.teamA?.fields?.clubName || null,
        teamB: fields.teamB?.fields?.clubName || null,
        ageGroup: fields.ageGroup?.fields?.name || null,
        venue: fields.venue?.fields?.name || null,
        courtNumber: fields.courtNumber || null,
        fixtureDate: fields.fixtureDate || null,
        scoreA: fields.scoreA || 0,
        scoreB: fields.scoreB || 0,
        resultTeamA: fields.resultTeamA || null,
        resultTeamB: fields.resultTeamB || null,
        isLocked: fields.isLocked || false,
      };

      console.log("Processed game:", game);
      return game;
    });

    console.log("Final games array length:", games.length);
    return games;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}

export async function getGameByNumber(gameNumber) {
  try {
    const response = await client.getEntries({
      content_type: "game",
      "fields.gameNumber": gameNumber,
    });
    return response.items[0];
  } catch (error) {
    console.error(`Error fetching game ${gameNumber}:`, error);
    return null;
  }
}

export async function getGameById(id) {
  try {
    const response = await client.getEntry(id);
    return {
      id: response.sys.id,
      ...response.fields,
    };
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
}

export async function updateGameScore(gameId, scoreA, scoreB) {
  try {
    const response = await fetch("/api/update-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId,
        scoreA,
        scoreB,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update score");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating score:", error);
    throw error;
  }
}

export async function getVenues() {
  try {
    const response = await client.getEntries({
      content_type: "venue",
      order: "fields.name",
    });

    return response.items.map((item) => ({
      id: item.sys.id,
      name: item.fields.name || null,
      address: item.fields.address || null,
      courtCount: item.fields.courtCount || 1,
    }));
  } catch (error) {
    console.error("Error fetching venues:", error);
    return [];
  }
}

export async function getClubs() {
  try {
    const response = await client.getEntries({
      content_type: "club",
      order: "fields.clubName",
    });

    return response.items.map((item) => ({
      id: item.sys.id,
      name: item.fields.clubName || null,
      shortName: item.fields.shortName || null,
      logo: item.fields.logo?.fields?.file?.url || null,
    }));
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return [];
  }
}

export async function getClubBySlug(slug) {
  try {
    const response = await client.getEntries({
      content_type: "club",
      "fields.slug": slug,
    });

    if (!response.items.length) {
      return null;
    }

    const club = response.items[0];
    return {
      id: club.sys.id,
      name: club.fields.clubName || null,
      shortName: club.fields.shortName || null,
      logo: club.fields.logo?.fields?.file?.url || null,
      description: club.fields.description || null,
      website: club.fields.website || null,
      email: club.fields.email || null,
      phone: club.fields.phone || null,
      address: club.fields.address || null,
    };
  } catch (error) {
    console.error(`Error fetching club ${slug}:`, error);
    return null;
  }
}

export async function getAgeGroups() {
  try {
    const response = await client.getEntries({
      content_type: "division",
      order: "fields.name",
    });

    return response.items.map((item) => ({
      id: item.sys.id,
      name: item.fields.name || null,
      description: item.fields.description || null,
    }));
  } catch (error) {
    console.error("Error fetching age groups:", error);
    return [];
  }
}
