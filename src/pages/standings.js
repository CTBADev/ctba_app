import React from "react";
import { getAllGames } from "../lib/contentful";
import Standings from "../components/organisms/standings/Standings";
import styles from "../styles/Standings.module.css";
import Link from "next/link";

export default function StandingsPage({ games }) {
  console.log("StandingsPage received games:", {
    count: games?.length || 0,
    firstGame: games?.[0] || null,
  });

  if (!games || games.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>League Standings</h1>
        <p>No games found. Please check back later.</p>
        <div>
          <Link href="/" className="aBtn" style={{ marginTop: "40px" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>League Standings</h1>
      <Standings games={games} />
      <div>
        <Link href="/" className="aBtn" style={{ marginTop: "40px" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    console.log("Fetching games in getStaticProps");
    const games = await getAllGames();
    console.log("Games fetched in getStaticProps:", {
      count: games?.length || 0,
      firstGame: games?.[0] || null,
    });

    return {
      props: {
        games: games || [],
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error("Error fetching games:", error);
    return {
      props: {
        games: [],
      },
    };
  }
}
