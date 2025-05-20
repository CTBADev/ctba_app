import React from "react";
import { getAllGames } from "../lib/contentful";
import Standings from "../components/organisms/standings/Standings";
import styles from "../styles/Standings.module.css";
import Link from "next/link";

export default function StandingsPage({ games }) {
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
    const games = await getAllGames();
    return {
      props: {
        games,
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
