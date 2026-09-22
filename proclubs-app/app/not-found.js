import Link from "next/link";

export const metadata = {
  title: "Page not found — Clubs Lookup",
};

export default function NotFound() {
  return (
    <main className="shell">
      <p className="badge">⚽ Offside</p>
      <h1 className="title display">Page not found</h1>
      <p className="subtitle">
        That page doesn't exist, or the club link may be out of date. Head back and search
        again.
      </p>
      <Link href="/" className="searchButton" style={{ display: "inline-block", marginTop: 8 }}>
        ← Back to search
      </Link>
    </main>
  );
}
