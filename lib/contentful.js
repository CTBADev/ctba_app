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
  const response = await client.getEntries({
    content_type: "game",
    include: 2,
    order: "-sys.createdAt",
  });
  return response.items.map((item) => {
    const { fields } = item;
    return {
      id: item.sys.id,
      gameName: sanitizeField(fields.gameName),
      gameNumber: sanitizeField(fields.gameNumber),
      ageGroup: sanitizeField(fields.ageGroup?.fields?.divisionName),
      teamA: getClubName(fields.teamA),
      teamB: getClubName(fields.teamB),
      teamAId: sanitizeField(fields.teamA?.sys?.id),
      teamBId: sanitizeField(fields.teamB?.sys?.id),
      teamADivision: sanitizeField(fields.teamADivision?.fields?.divisionName),
      teamBDivision: sanitizeField(fields.teamBDivision?.fields?.divisionName),
      scoreA: typeof fields.scoreA === "number" ? fields.scoreA : 0,
      scoreB: typeof fields.scoreB === "number" ? fields.scoreB : 0,
      scoresheet: sanitizeField(fields.scoresheet?.fields?.file?.url),
      resultTeamA: sanitizeField(fields.resultTeamA),
      resultTeamB: sanitizeField(fields.resultTeamB),
      status: sanitizeField(fields.status),
      isLocked: Boolean(fields.isLocked),
    };
  });
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
