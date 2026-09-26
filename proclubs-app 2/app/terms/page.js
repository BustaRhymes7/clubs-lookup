export const metadata = {
  title: "Terms & Conditions — Clubs Lookup",
  description: "Terms of use for the free, non-commercial Clubs Lookup fan project.",
};

export default function TermsPage() {
  return (
    <main className="shell">
      <h1 className="title display" style={{ fontSize: 32 }}>
        Terms &amp; Conditions
      </h1>
      <div className="legalBody">
        <h2>Not affiliated with EA</h2>
        <p>
          Clubs Lookup is an independent, unofficial fan project. It is not affiliated with,
          endorsed by, sponsored by, or in any way officially connected with Electronic Arts
          Inc. or any of its subsidiaries or affiliates. EA, EA SPORTS, and any associated
          names, logos, and marks are trademarks of Electronic Arts Inc. All club and player
          data shown belongs to EA and the respective clubs and players; we simply display it.
        </p>

        <h2>Free, non-commercial use</h2>
        <p>
          This site is provided free of charge, for fun, with no ads and no monetization of
          any kind. It exists purely for players to look up their own and their friends' Pro
          Clubs stats.
        </p>

        <h2>Data accuracy</h2>
        <p>
          Stats are pulled live from EA's own public, unofficial endpoints. We don't control
          EA's data, its accuracy, or its availability. EA can change, rate-limit, or remove
          these endpoints at any time without notice, which may cause this site to show
          incomplete or outdated information, or to stop working entirely, until we can adapt.
        </p>

        <h2>No warranty</h2>
        <p>
          This site is provided "as is," without warranty of any kind, express or implied. We
          make no guarantee that it will be available, accurate, or error-free at any given
          time.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Please don't attempt to abuse, scrape at scale, or disrupt this site or the
          underlying EA endpoints it relies on — doing so risks EA blocking access for
          everyone who uses this project.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may be updated from time to time. Continued use of the site after a
          change means you accept the updated terms.
        </p>

        <p className="legalUpdated">Last updated: {new Date().getFullYear()}</p>
      </div>
    </main>
  );
}
