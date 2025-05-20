import React, { useEffect, useState } from "react";
import { getAllGames } from "../../lib/contentful";
import Link from "next/link";
import styles from "./Fixtures.module.css";

export default function FixturesPage() {
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
      <h1 className={styles.title}>Upcoming Games</h1>

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

      <div className={styles.gamesList}>
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => {
            // Ensure all values are strings before rendering
            const safeGame = {
              ...game,
              teamA: String(game.teamA || ""),
              teamB: String(game.teamB || ""),
              ageGroup: String(game.ageGroup || ""),
            };

            return (
              <div key={game.id} className={styles.gameCard}>
                <div className={styles.gameDate}>
                  {game.fixtureDate
                    ? new Date(game.fixtureDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Date TBD"}
                </div>
                <div className={styles.gameTeams}>
                  <div className={styles.team}>
                    <span className={styles.teamName}>{safeGame.teamA}</span>
                  </div>
                  <div className={styles.vs}>vs</div>
                  <div className={styles.team}>
                    <span className={styles.teamName}>{safeGame.teamB}</span>
                  </div>
                </div>
                <div className={styles.gameMeta}>
                  <span className={styles.ageGroup}>{safeGame.ageGroup}</span>
                </div>
                <Link
                  href={`/game/${safeGame.gameNumber}`}
                  className={styles.viewGame}
                >
                  View Game
                </Link>
              </div>
            );
          })
        ) : (
          <p className={styles.noGames}>No upcoming games scheduled</p>
        )}
      </div>
    </div>
  );
}
