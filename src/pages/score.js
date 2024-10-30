import React, { useEffect, useState } from "react";
import { getAllGames } from "../../lib/contentful";
import Scoreboard from "../components/organisms/scoreboard/Scoreboard";

const GameScore = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    async function fetchGames() {
      const data = await getAllGames();
      setGames(data);
    }
    fetchGames();
  }, []);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
  };

  return (
    <div>
      <h1>Select a Game to Update Scores</h1>
      {selectedGame ? (
        <>
          <Scoreboard
            entryId={selectedGame.id}
            initialTeamA={selectedGame.teamA}
            initialTeamB={selectedGame.teamB}
            initialScoreA={selectedGame.scoreA}
            initialScoreB={selectedGame.scoreB}
            status={selectedGame.status}
          />
          <button onClick={() => setSelectedGame(null)}>back to list</button>
        </>
      ) : (
        <div className="game-list">
          {games.map((game) => (
            <div key={game.id} className="game-item">
              <h2>
                {game.teamA} vs {game.teamB}
              </h2>
              <p>Status: {game.status}</p>
              <p>
                Score: {game.scoreA} - {game.scoreB}
              </p>
              <button onClick={() => handleSelectGame(game)}>
                Update Score
              </button>
            </div>
          ))}
        </div>
      )}

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
  );
};

export default GameScore;
