// pages/api/updateScore.js
import { createClient } from "contentful-management";
const { C_CMA_KEY, C_SPACE_ID } = require("../../helpers/contentful-config");

const client = createClient({
  accessToken: C_CMA_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { entryId, team, newScore } = req.body;

  try {
    const space = await client.getSpace(C_SPACE_ID);
    const environment = await space.getEnvironment("master"); // Adjust if you're using a different environment
    const entry = await environment.getEntry(entryId);

    // Update the score field based on the team
    if (team === "A") {
      entry.fields.scoreA["en-US"] = newScore;
    } else if (team === "B") {
      entry.fields.scoreB["en-US"] = newScore;
    }

    const updatedEntry = await entry.update();
    const publishedEntry = await updatedEntry.publish(); // Publish the updated entry

    res.status(200).json({ message: "Score updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating score" });
  }
}
