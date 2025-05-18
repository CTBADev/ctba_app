// pages/clubs.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllClubs } from "../../lib/contentful";

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    async function fetchClubs() {
      const data = await getAllClubs();
      setClubs(data);
    }
    fetchClubs();
  }, []);

  return (
    <div className="container">
      <h1>Basketball Clubs</h1>

      {selectedClub ? (
        <div className="club-detail">
          <button onClick={() => setSelectedClub(null)} className="back-button">
            ← Back to Clubs
          </button>

          <div className="club-header">
            {selectedClub.logo && (
              <img
                src={selectedClub.logo.url}
                alt={selectedClub.name}
                className="club-logo"
              />
            )}
            <h2>{selectedClub.name}</h2>
          </div>

          <div className="club-description">{selectedClub.description}</div>

          <h3>Teams</h3>
          <div className="teams-grid">
            {selectedClub.teams.map((team) => (
              <div key={team.id} className="team-card">
                <h4>{team.name}</h4>
                <p className="age-group">{team.ageGroup}</p>
                <p>Coach: {team.coach}</p>
                <Link href={`/team/${team.id}`} className="view-button">
                  View Team
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="clubs-grid">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="club-card"
              onClick={() => setSelectedClub(club)}
            >
              {club.logo && (
                <img
                  src={club.logo.url}
                  alt={club.name}
                  className="club-thumbnail"
                />
              )}
              <h2>{club.name}</h2>
              <p>{club.teams.length} Teams</p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .clubs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .club-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .club-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .club-thumbnail {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin-bottom: 10px;
        }

        .back-button {
          margin-bottom: 20px;
          padding: 8px 16px;
          background: none;
          border: 1px solid #0070f3;
          color: #0070f3;
          border-radius: 5px;
          cursor: pointer;
        }

        .club-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .club-logo {
          width: 100px;
          height: 100px;
          object-fit: contain;
          margin-right: 20px;
        }

        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .team-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
        }

        .age-group {
          color: #666;
          font-weight: bold;
        }

        .view-button {
          display: inline-block;
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #0070f3;
          color: white;
          border-radius: 5px;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default ClubsPage;
