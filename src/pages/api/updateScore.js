// pages/api/updateScore.js
import { createClient } from "contentful-management";

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { entryId, team, newScore } = req.body;

  try {
    const space = await client.getSpace(
      process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
    );
    const environment = await space.getEnvironment("master"); // Adjust if you're using a different environment
    const entry = await environment.getEntry(entryId);

    // Update the score field based on the team
    if (team === "A") {
      entry.fields.scoreA["en-US"] = newScore;
    } else if (team === "B") {
      entry.fields.scoreB["en-US"] = newScore;
    }

    await entry.update();
    await entry.publish(); // Publish the entry to make changes live

    res.status(200).json({ message: "Score updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating score" });
  }
}
