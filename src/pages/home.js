import Link from "next/link";

export default function Home() {
  return (
    <div className="anchor" id="top" style={{ textAlign: "center" }}>
      <h1 style={{ display: "block", margin: "50px auto" }}>CTBL</h1>
      <Link
        className={`aBtn`}
        href={"/fixtures"}
        style={{ marginRight: "10px" }}
      >
        Upcoming Games
      </Link>
      <Link
        className={`aBtn`}
        style={{ marginRight: "10px" }}
        href={"/standings"}
      >
        Standings
      </Link>
      <Link className={`aBtn`} href={"/score"}>
        Active Games
      </Link>
    </div>
  );
}
