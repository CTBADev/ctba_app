import { createClient } from "contentful";
const {
  C_SPACE_ID,
  C_DELIVERY_KEY,
} = require("../src/helpers/contentful-config");
const client = createClient({ space: C_SPACE_ID, accessToken: C_DELIVERY_KEY });
function sanitizeField(field) {
  if (field === null || field === undefined) return "";
  if (
    typeof field === "string" ||
    typeof field === "number" ||
    typeof field === "boolean"
  )
    return field;
  if (Array.isArray(field)) return field.map(sanitizeField).join(", ");
  if (typeof field === "object") {
    if (field.fields) return sanitizeField(field.fields);
    if (field.file && field.file.url) return field.file.url;
    return JSON.stringify(field);
  }
  return "";
}
function getClubName(club) {
  if (!club) return "";
  if (typeof club === "string") return club;
  if (club.fields?.clubName) return club.fields.clubName;
  if (club.fields?.name) return club.fields.name;
  return "";
}
export async function getAllGames() {
  try {
    const response = await client.getEntries({
      content_type: "game",
      include: 2,
    });

    console.log(
      "Raw Contentful response:",
      JSON.stringify(response.items[0], null, 2)
    );

    return response.items.map((item) => {
      const fields = item.fields;
      console.log("Processing game fields:", JSON.stringify(fields, null, 2));

      // Helper function to get string value from Contentful reference
      const getStringValue = (field) => {
        console.log("Processing field:", field);

        if (!field) return "";
        if (typeof field === "string") return field;

        // Handle Contentful references
        if (field.fields) {
          console.log("Field has fields:", field.fields);
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

        // Handle sys object (for IDs)
        if (field.sys && field.sys.id) return field.sys.id;

        // If we get here, return empty string to prevent React errors
        console.log("No valid string value found for field:", field);
        return "";
      };

      // Helper function to get number value
      const getNumberValue = (field) => {
        if (typeof field === "number") return field;
        return 0;
      };

      const processedGame = {
        id: item.sys.id,
        gameNumber: getStringValue(fields.gameNumber),
        teamA: getStringValue(fields.teamA),
        teamB: getStringValue(fields.teamB),
        club: getStringValue(fields.club),
        ageGroup: getStringValue(fields.ageGroup),
        resultTeamA: getStringValue(fields.resultTeamA),
        resultTeamB: getStringValue(fields.resultTeamB),
        scoreA: getNumberValue(fields.scoreA),
        scoreB: getNumberValue(fields.scoreB),
        isLocked: fields.isLocked || false,
        scoresheet: fields.scoresheet?.fields?.file?.url || "",
        fixtureDate: fields.fixtureDate || null,
      };

      console.log("Processed game:", processedGame);
      return processedGame;
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}
export async function updateGameScore(gameId, scoreA, scoreB) {
  try {
    console.log("Sending update request for game:", gameId);
    console.log("New scores:", { scoreA, scoreB });
    const response = await fetch("/api/update-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, scoreA, scoreB }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(data.error || "Failed to update score");
    }
    console.log("Update successful:", data);
    return data.data;
  } catch (error) {
    console.error("Error updating game score:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}
