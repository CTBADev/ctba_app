import { createClient } from "contentful";
import { C_SPACE_ID, C_DELIVERY_KEY } from "../helpers/contentful-config";

export function getClient() {
  return createClient({
    space: C_SPACE_ID,
    accessToken: C_DELIVERY_KEY,
  });
}

export async function getAllGames() {
  try {
    const response = await getClient().getEntries({
      content_type: "game",
      include: 2,
    });

    return response.items.map((item) => {
      const fields = item.fields;

      // Helper function to get string value from Contentful reference
      const getStringValue = (field) => {
        if (!field) return "";
        if (typeof field === "string") return field;
        // Handle Contentful references
        if (field.fields) {
          // Check for name field first
          if (field.fields.name) return field.fields.name;
          // Check for title field
          if (field.fields.title) return field.fields.title;
          // Check for clubName field
          if (field.fields.clubName) return field.fields.clubName;
          // If no specific field found, try to get the first string field
          const firstStringField = Object.values(field.fields).find(
            (val) => typeof val === "string"
          );
          if (firstStringField) return firstStringField;
        }
        return "";
      };

      // Helper function to get number value
      const getNumberValue = (field) => {
        if (typeof field === "number") return field;
        return 0;
      };

      // Log the club field for debugging
      console.log("Club field:", fields.club);

      return {
        id: item.sys.id,
        teamA: getStringValue(fields.teamA),
        teamB: getStringValue(fields.teamB),
        teamADivision: getStringValue(fields.teamADivision),
        teamBDivision: getStringValue(fields.teamBDivision),
        club: getStringValue(fields.club),
        ageGroup: getStringValue(fields.ageGroup),
        resultTeamA: getStringValue(fields.resultTeamA),
        resultTeamB: getStringValue(fields.resultTeamB),
        scoreA: getNumberValue(fields.scoreA),
        scoreB: getNumberValue(fields.scoreB),
        isLocked: fields.isLocked || false,
        scoresheet: fields.scoresheet?.fields?.file?.url || "",
      };
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}

export async function getGameById(id) {
  try {
    const response = await getClient().getEntry(id);
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
