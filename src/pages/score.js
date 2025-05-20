import React, { useEffect, useState } from "react";
import { getAllGames } from "../../lib/contentful";
import Scoreboard from "../components/organisms/scoreboard/Scoreboard";
import Link from "next/link";
const GameScore = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const fetchGames = async () => {
    try {
      const gamesData = await getAllGames();
      setGames(gamesData);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };
  useEffect(() => {
    fetchGames();
  }, []);
  const handleScoreUpdate = async () => {
    await fetchGames();
  };
  if (selectedGame) {
    return (
      <div>
        <Scoreboard
          entryId={selectedGame.id}
          initialTeamA={selectedGame.teamA}
          initialTeamB={selectedGame.teamB}
          initialScoreA={selectedGame.scoreA}
          initialScoreB={selectedGame.scoreB}
          scoresheet={selectedGame.scoresheet}
          teamAId={selectedGame.teamAId}
          teamBId={selectedGame.teamBId}
          onScoreUpdate={handleScoreUpdate}
        />
        <button onClick={() => setSelectedGame(null)} className="aBtn">
          ← Back to Games
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="game-list">
        {games.map((game) => (
          <div key={game.id} className="game-item">
            <h3>
              {game.teamA} vs {game.teamB}
            </h3>
            <p>
              Score: {game.scoreA} - {game.scoreB}
            </p>
            <>
              {game.scoreSheet && (
                <p>
                  <Link href={`http:${game.scoreSheet}`} target="_blank">
                    scoresheet uploaded
                  </Link>
                </p>
              )}
            </>
            <>
              {!game.isLocked && (
                <button onClick={() => setSelectedGame(game)}>
                  Update Score
                </button>
              )}
            </>
          </div>
        ))}
        <style jsx>{`
          .game-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .game-item {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .game-item button {
            margin-top: 10px;
            padding: 8px 12px;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
        `}</style>
      </div>
      <div>
        <Link href="/" className="aBtn" style={{ marginTop: "40px" }}>
          ← Back to Home
        </Link>
      </div>
    </>
  );
};
export default GameScore;
