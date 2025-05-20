// pages/game/[id].js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Scoreboard from "../../components/organisms/scoreboard/Scoreboard";
import { getGameById } from "../../lib/contentful";

const GamePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGame() {
      if (!id) return;

      try {
        const gameData = await getGameById(id);
        setGame(gameData);
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!game) return <div>Game not found</div>;

  return (
    <div className="container">
      <div className="navigation-links">
        {game.teamAId && (
          <Link href={`/team/${game.teamAId}`} className="team-link">
            {game.teamA} Team Page
          </Link>
        )}
        {game.teamBId && (
          <Link href={`/team/${game.teamBId}`} className="team-link">
            {game.teamB} Team Page
          </Link>
        )}
      </div>
      <h1 className="game-title">
        {game.teamA} vs {game.teamB}
      </h1>

      {game.date && (
        <div className="game-date">
          {new Date(game.date).toLocaleDateString()}, {game.venue}
        </div>
      )}

      {!game.isLocked ? (
        <Scoreboard
          entryId={game.id}
          initialTeamA={game.teamA}
          initialTeamB={game.teamB}
          initialScoreA={game.scoreA}
          initialScoreB={game.scoreB}
          scoresheet={game.scoreSheet}
          status={game.status}
          teamAId={game.teamAId}
          teamBId={game.teamBId}
        />
      ) : (
        <div className="locked-message">
          This game is locked and can't be edited.
        </div>
      )}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .navigation-links {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .back-link,
        .team-link {
          display: inline-block;
          padding: 8px 16px;
          background: none;
          border: 1px solid #0070f3;
          color: #0070f3;
          border-radius: 5px;
          text-decoration: none;
        }

        .game-title {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .game-date {
          color: #666;
          margin-bottom: 30px;
        }

        .locked-message {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      `}</style>
      <Link href="/game-score" className="aBtn">
        ← Back to Games
      </Link>
    </div>
  );
};

export default GamePage;
