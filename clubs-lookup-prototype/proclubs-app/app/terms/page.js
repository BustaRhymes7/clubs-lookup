import { CONTACT_EMAIL } from "../../lib/site";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms of use for Clubs Lookup, an unofficial EA Pro Clubs stats tool.",
};

export default function TermsPage() {
  return (
    <main className="shell">
      <p className="kicker display">LEGAL</p>
      <h1 className="title display" style={{ fontSize: 34 }}>
        Terms &amp; Conditions
      </h1>

      <div className="legalBody">
        <h2>Unofficial fan project</h2>
        <p>
          This site is not affiliated with, endorsed by, or connected to Electronic Arts Inc.
          It's a small side project built by a fan, for fun, purely so other Pro Clubs players
          can look up their own and their friends' stats more easily — not a commercial product.
          "EA Sports FC" and "Pro Clubs" are trademarks of their respective owners. Data is
          fetched live from EA's public, unofficial Pro Clubs endpoints, which EA has not
          authorized for third-party use and could change or shut down at any time.
        </p>

        <h2>No warranty</h2>
        <p>
          This site is provided "as is," with no guarantee of accuracy, uptime, or availability.
          Stats displayed reflect whatever EA's servers return at the time of your search and may
          be incomplete, delayed, or wrong.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Use this site for personal, non-commercial lookups. Don't use it to overload, scrape at
          scale, or resell EA's data, and don't attempt to interfere with the site or EA's
          underlying services.
        </p>

        <h2>Changes</h2>
        <p>These terms may be updated at any time as the site or EA's endpoints change.</p>

        <h2>Contact</h2>
        <p>
          Questions, or an EA representative with concerns about this project:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <p className="legalUpdated">Last updated: this page should be dated when you publish it.</p>
      </div>
    </main>
  );
}
