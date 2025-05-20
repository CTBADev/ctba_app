import { createClient } from "contentful-management";

// Get environment variables
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const cmaKey = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

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
    const client = createClient({
      accessToken: cmaKey,
    });

    const space = await client.getSpace(spaceId);
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
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { gameId, scoreA, scoreB } = req.body;

  if (!gameId || scoreA === undefined || scoreB === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    console.log("Updating score for game:", gameId);
    console.log("New scores:", { scoreA, scoreB });

    const client = createClient({
      accessToken: cmaKey,
    });

    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment("master");
    const entry = await environment.getEntry(gameId);

    // Update the fields
    entry.fields.scoreA = { "en-US": scoreA };
    entry.fields.scoreB = { "en-US": scoreB };

    // Update results based on scores
    if (scoreA > scoreB) {
      entry.fields.resultTeamA = { "en-US": "W" };
      entry.fields.resultTeamB = { "en-US": "L" };
    } else if (scoreB > scoreA) {
      entry.fields.resultTeamA = { "en-US": "L" };
      entry.fields.resultTeamB = { "en-US": "W" };
    }

    // Update and publish the entry
    const updatedEntry = await entry.update();
    const publishedEntry = await updatedEntry.publish();

    return res.status(200).json({
      message: "Score updated successfully",
      entry: publishedEntry,
    });
  } catch (error) {
    console.error("Error updating score:", error);
    return res.status(500).json({
      message: "Error updating score",
      error: error.message,
    });
  }
}
