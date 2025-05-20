import { createClient } from "contentful";

// Get environment variables
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const cmaKey = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const graphqlUrl = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/master`;

console.log("Contentful Config:", {
  spaceId: spaceId ? "Set" : "Not Set",
  accessToken: accessToken ? "Set" : "Not Set",
  cmaKey: cmaKey ? "Set" : "Not Set",
});

if (!spaceId || !accessToken) {
  console.error("Missing Contentful configuration:", {
    spaceId: spaceId || "missing",
    accessToken: accessToken ? "set" : "missing",
    cmaKey: cmaKey ? "set" : "missing",
  });
  throw new Error(
    "Contentful space ID and access token must be provided in environment variables"
  );
}

const client = createClient({
  space: spaceId,
  accessToken: accessToken,
});

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

    const now = new Date();

    return response.items
      .map((item) => {
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

        const gameDate = fields.fixtureDate
          ? new Date(fields.fixtureDate)
          : null;
        const gameTime = fields.fixtureTime ? fields.fixtureTime : "00:00";

        // Combine date and time
        let gameDateTime = null;
        if (gameDate) {
          const [hours, minutes] = gameTime.split(":");
          gameDateTime = new Date(gameDate);
          gameDateTime.setHours(
            parseInt(hours, 10),
            parseInt(minutes, 10),
            0,
            0
          );
        }

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
          fixtureTime: fields.fixtureTime || null,
          gameDateTime: gameDateTime,
        };

        console.log("Processed game:", processedGame);
        return processedGame;
      })
      .filter((game) => {
        // If no date/time is set, show the game
        if (!game.gameDateTime) return true;
        // Only show games that have started
        return game.gameDateTime <= now;
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
    const response = await fetch("/api/updateScore", {
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

export async function getAllClubs() {
  try {
    const response = await client.getEntries({
      content_type: "club",
      include: 2,
    });

    return response.items.map((item) => {
      const fields = item.fields;
      return {
        id: item.sys.id,
        name: fields.name || "",
        clubName: fields.clubName || "",
        division: fields.division || "",
        ageGroup: fields.ageGroup || "",
      };
    });
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return [];
  }
}

export async function getTeamById(id) {
  try {
    const response = await client.getEntry(id);
    const fields = response.fields;
    return {
      id: response.sys.id,
      name: fields.name || "",
      division: fields.division || "",
      ageGroup: fields.ageGroup || "",
      club: fields.club
        ? {
            id: fields.club.sys.id,
            name: fields.club.fields.name || "",
            clubName: fields.club.fields.clubName || "",
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
}

export async function getTeamGames(teamId) {
  try {
    const response = await client.getEntries({
      content_type: "game",
      include: 2,
      "fields.teamA.sys.id": teamId,
      "fields.teamB.sys.id": teamId,
    });

    return response.items.map((item) => {
      const fields = item.fields;
      return {
        id: item.sys.id,
        teamA: fields.teamA
          ? {
              id: fields.teamA.sys.id,
              name: fields.teamA.fields.name || "",
            }
          : null,
        teamB: fields.teamB
          ? {
              id: fields.teamB.sys.id,
              name: fields.teamB.fields.name || "",
            }
          : null,
        scoreA: fields.scoreA || 0,
        scoreB: fields.scoreB || 0,
        resultTeamA: fields.resultTeamA || "",
        resultTeamB: fields.resultTeamB || "",
        fixtureDate: fields.fixtureDate || null,
      };
    });
  } catch (error) {
    console.error("Error fetching team games:", error);
    return [];
  }
}

export async function getFutureFixtures() {
  try {
    const response = await client.getEntries({
      content_type: "game",
      include: 2,
    });

    const now = new Date();

    return response.items
      .map((item) => {
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

          // Handle sys object (for IDs)
          if (field.sys && field.sys.id) return field.sys.id;

          return "";
        };

        // Helper function to get number value
        const getNumberValue = (field) => {
          if (typeof field === "number") return field;
          return 0;
        };

        const gameDate = fields.fixtureDate
          ? new Date(fields.fixtureDate)
          : null;
        const gameTime = fields.fixtureTime ? fields.fixtureTime : "00:00";

        // Combine date and time
        let gameDateTime = null;
        if (gameDate) {
          const [hours, minutes] = gameTime.split(":");
          gameDateTime = new Date(gameDate);
          gameDateTime.setHours(
            parseInt(hours, 10),
            parseInt(minutes, 10),
            0,
            0
          );
        }

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
          fixtureTime: fields.fixtureTime || null,
          gameDateTime: gameDateTime ? gameDateTime.toISOString() : null,
        };

        return processedGame;
      })
      .filter((game) => {
        // If no date/time is set, don't show the game
        if (!game.gameDateTime) return false;
        // Only show games that haven't started yet
        return new Date(game.gameDateTime) > now;
      })
      .sort((a, b) => {
        // Sort by date/time, earliest first
        if (!a.gameDateTime) return 1;
        if (!b.gameDateTime) return -1;
        return new Date(a.gameDateTime) - new Date(b.gameDateTime);
      });
  } catch (error) {
    console.error("Error fetching future fixtures:", error);
    return [];
  }
}
