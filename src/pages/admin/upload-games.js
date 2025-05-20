import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./UploadGames.module.css";

export default function UploadGames() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-games", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload games");
      }

      setSuccess(`Successfully uploaded ${data.uploadedCount} games`);
      if (data.errors) {
        setError(`Some games failed to upload:\n${data.errors.join("\n")}`);
      }
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateAllScores = async () => {
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/update-all-scores", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setSuccess(
        `Update complete. ${data.updatedCount} games updated.${
          data.errors ? `\nErrors: ${data.errors.join("\n")}` : ""
        }`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Upload Games</h1>

      <div className={styles.instructions}>
        <h2>CSV Format Instructions</h2>
        <p>Your CSV file should have the following columns:</p>
        <ul>
          <li>gameNumber (required) - Unique identifier for the game</li>
          <li>teamA (required) - Must match an existing club name exactly</li>
          <li>teamB (required) - Must match an existing club name exactly</li>
          <li>
            ageGroup (required) - Must match an existing division name exactly
          </li>
          <li>fixtureDate (required, format: YYYY-MM-DD)</li>
          <li>fixtureTime (required, format: HH:mm)</li>
          <li>venue (required) - Must match an existing venue name exactly</li>
          <li>courtNumber (required) - Must be a positive integer</li>
          <li>isLocked (optional, default: false)</li>
          <li>scoreA (optional) - Must be a non-negative integer</li>
          <li>scoreB (optional) - Must be a non-negative integer</li>
        </ul>
        <p>Example CSV line:</p>
        <pre>
          G001,Club A,Club B,U14 Division,2024-03-20,19:30,Venue
          Name,1,false,75,68
        </pre>
        <div className={styles.note}>
          <strong>Important Notes:</strong>
          <ul>
            <li>
              Team names must exactly match existing club names in the system
            </li>
            <li>
              Age group must exactly match an existing division name in the
              system
            </li>
            <li>
              Venue must exactly match an existing venue name in the system
            </li>
            <li>Dates must be in YYYY-MM-DD format</li>
            <li>Times must be in 24-hour format (HH:mm)</li>
            <li>Game numbers should be unique</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fileInput}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <button
          type="submit"
          disabled={!file || isUploading}
          className={styles.submitButton}
        >
          {isUploading ? "Uploading..." : "Upload Games"}
        </button>
      </form>

      <div className={styles.backLink}>
        <a href="/admin" className="aBtn">
          ← Back to Admin
        </a>
      </div>

      <div className={styles.updateAllScores}>
        <button
          onClick={handleUpdateAllScores}
          disabled={updating}
          className={styles.updateButton}
        >
          {updating ? "Updating..." : "Update All Game Results"}
        </button>
      </div>
    </div>
  );
}
