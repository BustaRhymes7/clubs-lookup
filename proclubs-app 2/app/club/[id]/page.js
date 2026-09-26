import { Suspense } from "react";
import ClubPageClient from "./ClubPageClient";
import { ClubSkeleton } from "../../components/ClubDisplay";

export async function generateMetadata({ params, searchParams }) {
  const name = searchParams?.name ? decodeURIComponent(searchParams.name) : null;
  const title = name ? `${name} — Clubs Lookup` : `Club ${params.id} — Clubs Lookup`;
  const description = name
    ? `Live Pro Clubs stats for ${name}: record, form, squad, and player breakdowns.`
    : "Live Pro Clubs stats: club record, form, squad, and player breakdowns.";

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default function ClubPage({ params }) {
  return (
    <Suspense fallback={<ClubSkeleton />}>
      <ClubPageClient clubId={params.id} />
    </Suspense>
  );
}
