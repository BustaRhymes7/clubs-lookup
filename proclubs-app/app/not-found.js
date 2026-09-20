import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "This page doesn't exist. Head back to search for a Pro Clubs team.",
};

export default function NotFound() {
  return (
    <main className="shell">
      <p className="kicker display">404</p>
      <h1 className="title display">Offside.</h1>
      <p className="subtitle">
        That page doesn't exist. It might have been moved, or the link's just wrong.
      </p>
      <Link href="/" className="searchButton" style={{ display: "inline-block", textDecoration: "none" }}>
        Back to search
      </Link>
    </main>
  );
}
