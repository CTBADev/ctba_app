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
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { gameId, scoreA, scoreB } = req.body;

    if (!gameId || scoreA === undefined || scoreB === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: gameId, scoreA, or scoreB",
      });
    }

    console.log("Queueing score update for game:", gameId);
    console.log("New scores:", { scoreA, scoreB });

    // Add update to queue
    if (!updateQueue.has(gameId)) {
      updateQueue.set(gameId, []);
    }
    updateQueue.get(gameId).push({ scoreA, scoreB });

    // Process the update
    const result = await processGameUpdates(gameId);

    if (result.success) {
      console.log("Update successful");
      res.status(200).json(result);
    } else {
      console.error("Update failed:", result.error);
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error in update-score API:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
    });
  }
}
