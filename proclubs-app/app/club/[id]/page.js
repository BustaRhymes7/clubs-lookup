import { Suspense } from "react";
import ClubPageClient from "./ClubPageClient";

export async function generateMetadata({ params }) {
  return {
    title: "Club stats",
    description:
      "Live EA Pro Clubs stats, match history, and player breakdowns for this club.",
  };
}

export default function ClubPage({ params }) {
  return (
    <Suspense
      fallback={
        <main className="shell">
          <p className="status">Loading club…</p>
        </main>
      }
    >
      <ClubPageClient clubId={params.id} />
    </Suspense>
  );
}
