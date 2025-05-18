import React, { useState, useEffect } from "react";
import styles from "./Standings.module.css";

const Standings = ({ games }) => {
  const [ageGroups, setAgeGroups] = useState({});
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");

  // Get unique age groups
  const allAgeGroups = [
    "all",
    ...new Set(games.map((game) => game.ageGroup).filter(Boolean)),
  ];

  useEffect(() => {
    // Process games to create standings
    const standings = {};

    // Filter games based on selected age group
    const filteredGames = games.filter((game) => {
      return selectedAgeGroup === "all" || game.ageGroup === selectedAgeGroup;
    });

    filteredGames.forEach((game) => {
      const ageGroup = game.ageGroup;
      if (!ageGroup) return;

      if (!standings[ageGroup]) {
        standings[ageGroup] = {};
      }

      // Initialize teams if they don't exist
      if (!standings[ageGroup][game.teamA]) {
        standings[ageGroup][game.teamA] = {
          wins: 0,
          losses: 0,
          forfeits: 0,
          points: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          team: game.teamA,
        };
      }
      if (!standings[ageGroup][game.teamB]) {
        standings[ageGroup][game.teamB] = {
          wins: 0,
          losses: 0,
          forfeits: 0,
          points: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          team: game.teamB,
        };
      }

      // Update records based on results
      if (game.resultTeamA === "W") {
        standings[ageGroup][game.teamA].wins++;
        standings[ageGroup][game.teamA].points += 2;
        standings[ageGroup][game.teamB].losses++;
        standings[ageGroup][game.teamB].points += 1;
      } else if (game.resultTeamA === "L") {
        standings[ageGroup][game.teamA].losses++;
        standings[ageGroup][game.teamA].points += 1;
        standings[ageGroup][game.teamB].wins++;
        standings[ageGroup][game.teamB].points += 2;
      } else if (game.resultTeamA === "F") {
        standings[ageGroup][game.teamA].forfeits++;
        standings[ageGroup][game.teamB].wins++;
        standings[ageGroup][game.teamB].points += 2;
      }

      // Update points scored and against
      if (game.scoreA !== undefined && game.scoreB !== undefined) {
        standings[ageGroup][game.teamA].pointsFor += game.scoreA;
        standings[ageGroup][game.teamA].pointsAgainst += game.scoreB;
        standings[ageGroup][game.teamB].pointsFor += game.scoreB;
        standings[ageGroup][game.teamB].pointsAgainst += game.scoreA;
      }
    });

    // Convert to arrays and sort by points
    const sortedAgeGroups = {};
    Object.keys(standings).forEach((ageGroup) => {
      sortedAgeGroups[ageGroup] = Object.values(standings[ageGroup])
        .filter((team) => team.wins > 0 || team.losses > 0 || team.forfeits > 0) // Only show teams with games played
        .sort((a, b) => {
          // Sort by points first, then by point difference
          if (b.points !== a.points) return b.points - a.points;
          const diffA = a.pointsFor - a.pointsAgainst;
          const diffB = b.pointsFor - b.pointsAgainst;
          return diffB - diffA;
        });
    });

    setAgeGroups(sortedAgeGroups);
  }, [games, selectedAgeGroup]);

  return (
    <div className={styles.standingsContainer}>
      <div className={styles.filters}>
        <select
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
          className={styles.filterSelect}
        >
          {allAgeGroups.map((ageGroup) => (
            <option key={ageGroup} value={ageGroup}>
              {ageGroup === "all" ? "All Age Groups" : ageGroup}
            </option>
          ))}
        </select>
      </div>

      {Object.entries(ageGroups).map(([ageGroup, teams]) => (
        <div key={ageGroup} className={styles.divisionStandings}>
          <h2 className={styles.divisionTitle}>{ageGroup}</h2>
          <table className={styles.standingsTable}>
            <thead>
              <tr>
                <th>Team</th>
                <th>W</th>
                <th>L</th>
                <th>F</th>
                <th>PF</th>
                <th>PA</th>
                <th>DIFF</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.team}
                  className={index < 2 ? styles.playoffSpot : ""}
                >
                  <td>{team.team || "Unknown Team"}</td>
                  <td>{team.wins}</td>
                  <td>{team.losses}</td>
                  <td>{team.forfeits}</td>
                  <td>{team.pointsFor}</td>
                  <td>{team.pointsAgainst}</td>
                  <td>{team.pointsFor - team.pointsAgainst}</td>
                  <td>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Standings;
