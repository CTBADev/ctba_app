// pages/team/[id].js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getTeamById, getTeamGames } from "../../../lib/contentful";

const TeamPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [team, setTeam] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      if (!id) return;

      try {
        const teamData = await getTeamById(id);
        setTeam(teamData);

        const gamesData = await getTeamGames(id);
        setGames(gamesData);
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!team) return <div>Team not found</div>;

  console.log("zooooooo", team);

  return (
    <div className="container">
      <Link href="/clubs" className="back-button">
        ← Back to Clubs
      </Link>

      <div className="team-header">
        <h1>{team.name}</h1>
        <div className="team-meta">
          <span className="age-group">{team.ageGroup}</span>
          <span className="club-name">
            <Link href={`/clubs`}>{team?.club?.name}</Link>
          </span>
        </div>
      </div>

      <div className="team-details">
        <div className="info-card">
          <h3>Coach</h3>
          <p>{team.coach}</p>
        </div>

        {team.players && team.players.length > 0 && (
          <div className="info-card">
            <h3>Players</h3>
            <ul className="players-list">
              {team.players.map((player) => (
                <li key={player.id}>{player.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h2>Upcoming Games</h2>
      {games.length > 0 ? (
        <div className="games-list">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-teams">
                <span
                  className={game.teamA.id === id ? "highlighted-team" : ""}
                >
                  {game.teamA.name}
                </span>
                <span className="vs">vs</span>
                <span
                  className={game.teamB.id === id ? "highlighted-team" : ""}
                >
                  {game.teamB.name}
                </span>
              </div>

              <div className="game-meta">
                <div className="game-date">
                  {new Date(game.date).toLocaleDateString()}
                </div>
                <div className="game-venue">{game.venue}</div>
              </div>

              {game.status === "completed" && (
                <div className="game-score">
                  {game.scoreA} - {game.scoreB}
                </div>
              )}

              <Link
                href={`/game-score?gameId=${game.id}`}
                className="view-game-button"
              >
                {game.status === "scheduled" ? "View Details" : "View Results"}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No upcoming games scheduled</p>
      )}

      <style jsx>{`
        /* Styling similar to clubs page with team-specific elements */
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-button {
          display: inline-block;
          margin-bottom: 20px;
          padding: 8px 16px;
          background: none;
          border: 1px solid #0070f3;
          color: #0070f3;
          border-radius: 5px;
          text-decoration: none;
        }

        .team-header {
          margin-bottom: 30px;
        }

        .team-meta {
          display: flex;
          gap: 15px;
          margin-top: 5px;
        }

        .age-group {
          background-color: #f0f0f0;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
        }

        .team-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 15px 20px;
        }

        .players-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .players-list li {
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }

        .games-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .game-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
        }

        .game-teams {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 18px;
          margin-bottom: 10px;
        }

        .vs {
          font-size: 14px;
          color: #666;
        }

        .highlighted-team {
          font-weight: bold;
          color: #0070f3;
        }

        .game-meta {
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .game-score {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
        }

        .view-game-button {
          display: block;
          text-align: center;
          padding: 8px 0;
          background-color: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default TeamPage;
