import { getSession } from "../../middleware/session";
import { getContentfulClient } from "../../lib/contentful";

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Check for required environment variables
const requiredEnvVars = {
  CONTENTFUL_MANAGEMENT_ACCESS_TOKEN:
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
};

// Validate environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const client = getContentfulClient();
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment("master");

    // Get all games
    const games = await environment.getEntries({
      content_type: "game",
      limit: 1000,
    });

    const errors = [];
    let updatedCount = 0;

    for (const game of games.items) {
      try {
        const scoreA = game.fields.scoreA?.["en-US"] || 0;
        const scoreB = game.fields.scoreB?.["en-US"] || 0;

        // Only update if both scores are present
        if (scoreA !== undefined && scoreB !== undefined) {
          // Get the latest version of the entry
          const freshEntry = await environment.getEntry(game.sys.id);

          // Determine result based on scores
          let resultTeamA, resultTeamB;
          if (scoreA > scoreB) {
            resultTeamA = "W";
            resultTeamB = "L";
          } else if (scoreA < scoreB) {
            resultTeamA = "L";
            resultTeamB = "W";
          } else {
            resultTeamA = "F";
            resultTeamB = "F";
          }

          // Update the entry with new results
          freshEntry.fields.resultTeamA = {
            "en-US": resultTeamA,
          };
          freshEntry.fields.resultTeamB = {
            "en-US": resultTeamB,
          };

          // Save and publish
          const updatedEntry = await freshEntry.update();
          await updatedEntry.publish();
          updatedCount++;
        }
      } catch (error) {
        errors.push(
          `Game ${game.fields.gameNumber?.["en-US"]}: ${error.message}`
        );
      }
    }

    return res.status(200).json({
      updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error updating scores:", error);
    return res.status(500).json({
      error: "Failed to update scores",
      details: error.message,
    });
  }
}
