import React, { useEffect, useState } from "react";
import { getGames, getDivisions, getVenues } from "../lib/contentful";
import Link from "next/link";
import styles from "./Fixtures.module.css";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

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

export async function getServerSideProps() {
  try {
    const [games, divisions, venues] = await Promise.all([
      getGames(),
      getDivisions(),
      getVenues(),
    ]);

    return {
      props: {
        games,
        divisions,
        venues,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        games: [],
        divisions: [],
        venues: [],
      },
    };
  }
}

export default function Fixtures({
  games: initialGames,
  divisions: initialDivisions,
  venues: initialVenues,
}) {
  const [games, setGames] = useState(initialGames);
  const [divisions, setDivisions] = useState(initialDivisions);
  const [venues, setVenues] = useState(initialVenues);
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Get current date and time
  const now = new Date();

  // Sort games by date and time, and filter for future games only
  const sortedGames = games
    .filter((game) => {
      const gameDate = new Date(game.fields.fixtureDate);
      return gameDate > now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.fields.fixtureDate);
      const dateB = new Date(b.fields.fixtureDate);
      return dateA - dateB;
    });

  const filteredGames = sortedGames.filter((game) => {
    const divisionMatch =
      selectedDivision === "all" ||
      game.fields.ageGroup?.fields?.name === selectedDivision;
    const venueMatch =
      selectedVenue === "all" ||
      game.fields.venue?.fields?.name === selectedVenue;
    return divisionMatch && venueMatch;
  });

  // Group games by date first, then by venue
  const gamesByDateAndVenue = filteredGames.reduce((acc, game) => {
    const gameDate = new Date(game.fields.fixtureDate);
    const dateKey = format(gameDate, "yyyy-MM-dd");
    const venueName = game.fields.venue?.fields?.name || "Unassigned Venue";

    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    if (!acc[dateKey][venueName]) {
      acc[dateKey][venueName] = [];
    }
    acc[dateKey][venueName].push(game);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(gamesByDateAndVenue).sort();

  // Debug log
  console.log("Current time:", now);
  console.log("Games by Date and Venue:", gamesByDateAndVenue);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (sortedGames.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <div className={styles.header}>
              <h1 className={styles.title}>Fixtures</h1>
              <p className={styles.noGames}>No upcoming fixtures scheduled.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Fixtures</h1>
            <p className={styles.subtitle}>
              View and manage upcoming basketball fixtures
            </p>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label htmlFor="division" className={styles.filterLabel}>
                Division
              </label>
              <select
                id="division"
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Divisions</option>
                {divisions.map((division) => (
                  <option key={division.sys.id} value={division.fields.name}>
                    {division.fields.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="venue" className={styles.filterLabel}>
                Venue
              </label>
              <select
                id="venue"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Venues</option>
                {venues.map((venue) => (
                  <option key={venue.sys.id} value={venue.fields.name}>
                    {venue.fields.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Games by Date and Venue */}
          <div className={styles.gamesContainer}>
            {sortedDates.map((dateKey) => (
              <div key={dateKey} className={styles.dateSection}>
                <h2 className={styles.dateHeader}>
                  {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                </h2>
                <div>
                  {Object.entries(gamesByDateAndVenue[dateKey])
                    .sort(([venueA], [venueB]) => venueA.localeCompare(venueB))
                    .map(([venueName, games]) => (
                      <div key={venueName} className={styles.venueCard}>
                        <div className={styles.venueHeader}>
                          <h3 className={styles.venueTitle}>{venueName}</h3>
                        </div>
                        <div className={styles.gameList}>
                          {games.map((game) => (
                            <div key={game.sys.id} className={styles.gameItem}>
                              <div className={styles.gameInfo}>
                                <p className={styles.gameNumber}>
                                  {game.fields.gameNumber} -{" "}
                                  {game.fields.ageGroup?.fields?.name}
                                </p>
                                <p className={styles.gameTime}>
                                  {format(
                                    new Date(game.fields.fixtureDate),
                                    "h:mm a"
                                  )}
                                  {game.fields.courtNumber &&
                                    ` - Court ${game.fields.courtNumber}`}
                                </p>
                              </div>
                              <div className={styles.gameTeams}>
                                <p className={styles.teamNames}>
                                  {game.fields.teamA?.fields?.clubName} vs{" "}
                                  {game.fields.teamB?.fields?.clubName}
                                </p>
                                {game.fields.scoreA !== undefined &&
                                  game.fields.scoreB !== undefined && (
                                    <p className={styles.score}>
                                      {game.fields.scoreA} -{" "}
                                      {game.fields.scoreB}
                                    </p>
                                  )}
                              </div>
                              {user && (
                                <button
                                  onClick={() =>
                                    router.push(`/update-score/${game.sys.id}`)
                                  }
                                  className={styles.updateButton}
                                >
                                  Update Score
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
