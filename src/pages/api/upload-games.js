import { createClient } from "contentful-management";
import { parse } from "csv-parse/sync";
import formidable from "formidable";
import fs from "fs";
import { detect } from "jschardet";

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

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN || "",
});

// Helper function to detect and convert file encoding
function ensureUTF8(filepath) {
  const buffer = fs.readFileSync(filepath);
  const detected = detect(buffer);
  const encoding = detected.encoding.toLowerCase();

  if (encoding === "utf-8" || encoding === "ascii") {
    return buffer.toString("utf-8");
  }

  // Convert to UTF-8
  const iconv = require("iconv-lite");
  return iconv.decode(buffer, encoding);
}

// Helper function to find club by name
async function findClubByName(environment, clubName) {
  const entries = await environment.getEntries({
    content_type: "club",
    "fields.clubName": clubName,
    limit: 1,
  });

  if (entries.items.length === 0) {
    throw new Error(`Club not found: ${clubName}`);
  }

  return entries.items[0];
}

// Helper function to find division by name
async function findDivisionByName(environment, divisionName) {
  const entries = await environment.getEntries({
    content_type: "division",
    "fields.name": divisionName,
    limit: 1,
  });

  if (entries.items.length === 0) {
    throw new Error(`Division not found: ${divisionName}`);
  }

  return entries.items[0];
}

// Helper function to validate date format (YYYY-MM-DD)
function isValidDateFormat(date) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

// Helper function to validate time format (HH:mm)
function isValidTimeFormat(time) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

// Helper function to validate game number format
function isValidGameNumber(gameNumber) {
  return /^G\d{3}$/.test(gameNumber);
}

// Helper function to validate CSV format
function validateCSVFormat(records) {
  const errors = [];
  const requiredHeaders = [
    "gameNumber",
    "teamA",
    "teamB",
    "ageGroup",
    "fixtureDate",
    "fixtureTime",
    "venue",
    "courtNumber",
    "isLocked",
  ];

  // Optional headers
  const optionalHeaders = ["scoreA", "scoreB"];

  // Check if we have any records
  if (!records || records.length === 0) {
    return ["CSV file is empty"];
  }

  // Debug log the records
  console.log("CSV Records:", JSON.stringify(records, null, 2));
  console.log("Headers found:", Object.keys(records[0]));

  // Check required headers
  const headers = Object.keys(records[0]);
  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  // Validate each record
  records.forEach((record, index) => {
    const rowNumber = index + 2; // +2 because of 0-based index and header row
    console.log(`Validating row ${rowNumber}:`, record);

    // Check required fields
    requiredHeaders.forEach((header) => {
      if (!record[header]) {
        errors.push(`Row ${rowNumber}: Missing required field '${header}'`);
      }
    });

    // Validate game number format
    if (record.gameNumber && !isValidGameNumber(record.gameNumber)) {
      errors.push(
        `Row ${rowNumber}: Invalid game number format. Must be 'G' followed by 3 digits (e.g., G001)`
      );
    }

    // Validate date format
    if (record.fixtureDate && !isValidDateFormat(record.fixtureDate)) {
      errors.push(`Row ${rowNumber}: Invalid date format. Must be YYYY-MM-DD`);
    }

    // Validate time format
    if (record.fixtureTime && !isValidTimeFormat(record.fixtureTime)) {
      errors.push(
        `Row ${rowNumber}: Invalid time format. Must be HH:mm in 24-hour format`
      );
    }

    // Validate court number is a positive integer
    if (
      record.courtNumber &&
      (!Number.isInteger(Number(record.courtNumber)) ||
        Number(record.courtNumber) < 1)
    ) {
      errors.push(
        `Row ${rowNumber}: Invalid court number. Must be a positive integer`
      );
    }

    // Validate scores if provided
    if (
      record.scoreA &&
      (!Number.isInteger(Number(record.scoreA)) || Number(record.scoreA) < 0)
    ) {
      errors.push(
        `Row ${rowNumber}: Invalid scoreA. Must be a non-negative integer`
      );
    }
    if (
      record.scoreB &&
      (!Number.isInteger(Number(record.scoreB)) || Number(record.scoreB) < 0)
    ) {
      errors.push(
        `Row ${rowNumber}: Invalid scoreB. Must be a non-negative integer`
      );
    }

    // Validate isLocked is boolean
    if (
      record.isLocked &&
      !["true", "false"].includes(record.isLocked.toLowerCase())
    ) {
      errors.push(
        `Row ${rowNumber}: Invalid isLocked value. Must be 'true' or 'false'`
      );
    }
  });

  console.log("Validation errors:", errors);
  return errors;
}

// Helper function to find venue by name
async function findVenueByName(environment, venueName) {
  const entries = await environment.getEntries({
    content_type: "venue",
    "fields.name": venueName,
    limit: 1,
  });

  if (entries.items.length === 0) {
    throw new Error(`Venue not found: ${venueName}`);
  }

  return entries.items[0];
}

// Add this helper function to find game by number
async function findGameByNumber(environment, gameNumber) {
  const entries = await environment.getEntries({
    content_type: "game",
    "fields.gameNumber": gameNumber,
    limit: 1,
  });

  if (entries.items.length === 0) {
    return null;
  }

  return entries.items[0];
}

export default async function handler(req, res) {
  // Check for required environment variables
  if (missingEnvVars.length > 0) {
    return res.status(500).json({
      message: "Server configuration error",
      error: `Missing required environment variables: ${missingEnvVars.join(
        ", "
      )}`,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Parse the incoming form data
    const form = formidable();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file?.[0]; // Access the first file from the array
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read and convert file to UTF-8
    const fileContent = ensureUTF8(file.filepath);

    // Parse the CSV file
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true, // Remove whitespace around values
    });

    // Validate CSV format
    const formatErrors = validateCSVFormat(records);
    if (formatErrors.length > 0) {
      return res.status(400).json({
        message: "CSV format validation failed",
        errors: formatErrors,
      });
    }

    // Get the space and environment
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment("master");

    let uploadedCount = 0;
    const errors = [];

    // Process each record
    for (const record of records) {
      try {
        // Find team references
        const teamA = await findClubByName(environment, record.teamA);
        const teamB = await findClubByName(environment, record.teamB);
        const ageGroup = await findDivisionByName(environment, record.ageGroup);
        const venue = await findVenueByName(environment, record.venue);

        // Check if game already exists
        const existingGame = await findGameByNumber(
          environment,
          record.gameNumber
        );

        const gameFields = {
          gameNumber: {
            "en-US": record.gameNumber,
          },
          teamA: {
            "en-US": {
              sys: {
                type: "Link",
                linkType: "Entry",
                id: teamA.sys.id,
              },
            },
          },
          teamB: {
            "en-US": {
              sys: {
                type: "Link",
                linkType: "Entry",
                id: teamB.sys.id,
              },
            },
          },
          ageGroup: {
            "en-US": {
              sys: {
                type: "Link",
                linkType: "Entry",
                id: ageGroup.sys.id,
              },
            },
          },
          venue: {
            "en-US": {
              sys: {
                type: "Link",
                linkType: "Entry",
                id: venue.sys.id,
              },
            },
          },
          courtNumber: {
            "en-US": Number(record.courtNumber),
          },
          fixtureDate: {
            "en-US": `${record.fixtureDate}T${record.fixtureTime}:00.000Z`,
          },
          scoreA: {
            "en-US": record.scoreA ? Number(record.scoreA) : 0,
          },
          scoreB: {
            "en-US": record.scoreB ? Number(record.scoreB) : 0,
          },
          isLocked: {
            "en-US": record.isLocked === "true",
          },
          gameName: {
            "en-US": `${record.gameNumber} - ${ageGroup.fields.name["en-US"]}: ${teamA.fields.clubName["en-US"]} v ${teamB.fields.clubName["en-US"]}`,
          },
        };

        let entry;
        if (existingGame) {
          // Update existing game
          entry = existingGame;
          Object.keys(gameFields).forEach((field) => {
            entry.fields[field] = gameFields[field];
          });
          entry = await entry.update();
        } else {
          // Create new game
          entry = await environment.createEntry("game", { fields: gameFields });
        }

        // Publish the entry
        await entry.publish();
        uploadedCount++;
      } catch (error) {
        errors.push(`Row ${uploadedCount + 1}: ${error.message}`);
      }
    }

    // Clean up the temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      message: "Upload complete",
      uploadedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return res.status(500).json({
      message: "Error processing upload",
      error: error.message,
    });
  }
}
