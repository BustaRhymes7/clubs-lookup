import { CONTACT_EMAIL } from "../../lib/site";

export const metadata = {
  title: "Privacy Policy",
  description: "What Clubs Lookup does and doesn't collect, and how EA's own data is used.",
};

export default function PrivacyPage() {
  return (
    <main className="shell">
      <p className="kicker display">LEGAL</p>
      <h1 className="title display" style={{ fontSize: 34 }}>
        Privacy Policy
      </h1>

      <div className="legalBody">
        <h2>What this site is</h2>
        <p>
          Clubs Lookup is a fan-made tool that searches EA Sports FC Pro Clubs teams and
          displays stats EA's own servers return for that search. It is not affiliated with,
          endorsed by, or connected to Electronic Arts Inc.
        </p>

        <h2>What we collect from you</h2>
        <p>
          We don't have user accounts, logins, or a database of visitors. The club names you
          search are sent to EA's servers to look up that club — we don't store your searches
          ourselves.
        </p>

        <h2>Analytics</h2>
        <p>
          We use Vercel Analytics, which is cookieless: it counts page views in aggregate and
          doesn't track individuals across sites or store personal data about you.
        </p>

        <h2>Data shown about Pro Clubs teams and players</h2>
        <p>
          Club names, gamertags, and match stats shown on this site come directly from EA's
          public Pro Clubs data for teams you search. This is the same data visible in-game and
          on EA's own Pro Clubs website. If you'd like data about your club removed from this
          site's display, contact us below — though since we don't store it, it will simply stop
          appearing once your data changes on EA's end.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy, or an EA representative with concerns about this project:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <p className="legalUpdated">Last updated: this page should be dated when you publish it.</p>
      </div>
    </main>
  );
}
