import { createClient } from "contentful-management";
const { C_SPACE_ID, C_CMA_KEY } = require("../../../helpers/contentful-config");

// Queue to store pending updates
const updateQueue = new Map();

// Process updates for a specific game
async function processGameUpdates(gameId) {
  if (!updateQueue.has(gameId) || updateQueue.get(gameId).length === 0) {
    return;
  }

  const updates = updateQueue.get(gameId);
  const latestUpdate = updates[updates.length - 1];

  try {
    const cmaToken = C_CMA_KEY.split("\n")[0].trim();
    const client = createClient({
      accessToken: cmaToken,
    });

    const space = await client.getSpace(C_SPACE_ID);
    const environment = await space.getEnvironment("master");
    const entry = await environment.getEntry(gameId);

    // Update with the latest scores
    entry.fields.scoreA = {
      "en-US": latestUpdate.scoreA,
    };
    entry.fields.scoreB = {
      "en-US": latestUpdate.scoreB,
    };

    // If game is locked and has a scoresheet, update the results
    if (
      entry.fields.isLocked?.["en-US"] &&
      entry.fields.scoresheet?.["en-US"]
    ) {
      const scoreA = entry.fields.scoreA["en-US"];
      const scoreB = entry.fields.scoreB["en-US"];

      if (scoreA > scoreB) {
        entry.fields.resultTeamA = { "en-US": "W" };
        entry.fields.resultTeamB = { "en-US": "L" };
      } else if (scoreB > scoreA) {
        entry.fields.resultTeamA = { "en-US": "L" };
        entry.fields.resultTeamB = { "en-US": "W" };
      }
    }

    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    // Clear the queue for this game
    updateQueue.set(gameId, []);

    return {
      success: true,
      data: {
        id: updatedEntry.sys.id,
        scoreA: updatedEntry.fields.scoreA["en-US"],
        scoreB: updatedEntry.fields.scoreB["en-US"],
        resultTeamA: updatedEntry.fields.resultTeamA?.["en-US"],
        resultTeamB: updatedEntry.fields.resultTeamB?.["en-US"],
      },
    };
  } catch (error) {
    console.error("Error processing updates for game:", gameId, error);
    // Keep the failed update in the queue
    return {
      success: false,
      error: error.message,
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { gameId, scoreA, scoreB } = req.body;

  if (!gameId || typeof scoreA !== "number" || typeof scoreB !== "number") {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  try {
    // Add the update to the queue
    if (!updateQueue.has(gameId)) {
      updateQueue.set(gameId, []);
    }
    updateQueue.get(gameId).push({ scoreA, scoreB });

    // Process the update
    const result = await processGameUpdates(gameId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ error: "Failed to update score" });
  }
}
