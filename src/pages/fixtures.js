import React, { useEffect, useState } from "react";
import { getAllGames, getFutureFixtures } from "../../lib/contentful";
import Link from "next/link";
import styles from "./Fixtures.module.css";

// Helper function to format date consistently
function formatDate(dateString) {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/,/g, ""); // Remove commas for consistency
}

export async function getStaticProps() {
  const fixtures = await getFutureFixtures();
  return {
    props: {
      fixtures,
    },
    // Revalidate every 5 minutes
    revalidate: 300,
  };
}

export default function Fixtures({ fixtures }) {
  const [games, setGames] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getAllGames();
        console.log("Fetched games data:", gamesData);

        // Filter future games and sort by date
        const futureGames = gamesData
          .filter((game) => {
            if (!game.fixtureDate) return false;
            const gameDate = new Date(game.fixtureDate);
            return gameDate > new Date();
          })
          .sort((a, b) => new Date(a.fixtureDate) - new Date(b.fixtureDate));

        console.log("Processed future games:", futureGames);
        setGames(futureGames);
      } catch (error) {
        console.error("Error fetching games:", error);
        setError("Failed to load games. Please try again later.");
      }
    };

    fetchGames();
  }, []);

  // Get unique age groups
  const ageGroups = [
    "all",
    ...new Set(games.map((game) => game.ageGroup).filter(Boolean)),
  ];

  // Filter games based on selected age group
  const filteredGames = games.filter(
    (game) => selectedAgeGroup === "all" || game.ageGroup === selectedAgeGroup
  );

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upcoming Fixtures</h1>

      <div className={styles.filters}>
        <select
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
          className={styles.filterSelect}
        >
          {ageGroups.map((ageGroup) => (
            <option key={ageGroup} value={ageGroup}>
              {ageGroup === "all" ? "All Age Groups" : ageGroup}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fixturesList}>
        {fixtures.length === 0 ? (
          <p>No upcoming fixtures scheduled.</p>
        ) : (
          fixtures.map((fixture) => (
            <div key={fixture.id} className={styles.fixture}>
              <div className={styles.fixtureHeader}>
                <span className={styles.date}>
                  {formatDate(fixture.fixtureDate)}
                </span>
                <span className={styles.time}>{fixture.fixtureTime}</span>
              </div>
              <div className={styles.teams}>
                <div className={styles.team}>
                  <span className={styles.teamName}>{fixture.teamA}</span>
                  <span className={styles.division}>
                    {fixture.teamADivision}
                  </span>
                </div>
                <div className={styles.vs}>vs</div>
                <div className={styles.team}>
                  <span className={styles.teamName}>{fixture.teamB}</span>
                  <span className={styles.division}>
                    {fixture.teamBDivision}
                  </span>
                </div>
              </div>
              <div className={styles.details}>
                <span className={styles.club}>{fixture.club}</span>
                <span className={styles.ageGroup}>{fixture.ageGroup}</span>
              </div>
              <Link href={`/score/${fixture.id}`} className={styles.scoreLink}>
                View Score
              </Link>
            </div>
          ))
        )}
      </div>
      <div>
        <Link href="/" className="aBtn" style={{ marginTop: "40px" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
