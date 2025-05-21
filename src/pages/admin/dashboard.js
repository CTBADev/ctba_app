import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Dashboard.module.css";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/admin");
    }
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/admin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button onClick={handleSignOut} className={styles.signOutButton}>
          Sign Out
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Update Scores</h2>
          <p className={styles.cardDescription}>
            Update game scores and manage fixtures
          </p>
          <button
            onClick={() => router.push("/fixtures")}
            className={styles.cardButton}
          >
            Go to Fixtures
          </button>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>View Standings</h2>
          <p className={styles.cardDescription}>
            Check current standings and statistics
          </p>
          <button
            onClick={() => router.push("/standings")}
            className={styles.cardButton}
          >
            View Standings
          </button>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Manage Content</h2>
          <p className={styles.cardDescription}>
            Update teams, venues, and other content
          </p>
          <button
            onClick={() => router.push("/admin/content")}
            className={styles.cardButton}
          >
            Manage Content
          </button>
        </div>
      </div>
    </div>
  );
}
