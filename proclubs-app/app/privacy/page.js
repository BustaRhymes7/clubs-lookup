export const metadata = {
  title: "Privacy Policy — Clubs Lookup",
  description: "How Clubs Lookup handles data: in short, it doesn't collect any.",
};

export default function PrivacyPage() {
  return (
    <main className="shell">
      <h1 className="title display" style={{ fontSize: 32 }}>
        Privacy Policy
      </h1>
      <div className="legalBody">
        <p>
          Clubs Lookup is a free, non-commercial fan project. It does not have user accounts,
          does not run ads, and does not use tracking or advertising cookies.
        </p>

        <h2>What we store</h2>
        <p>
          Favorites you save are stored only in your browser's local storage, on your own
          device. They are never sent to, or stored on, any server we run. Clearing your
          browser's site data, using a different browser, or switching devices will remove
          them or start you fresh.
        </p>
        <p>
          A small "cookie notice dismissed" flag is stored the same way, locally, so this
          banner doesn't reappear every visit.
        </p>

        <h2>What we don't store</h2>
        <p>
          We don't require sign-up, don't collect names, emails, or payment details, and don't
          run any database of user information. There is nothing to be lost in a data breach
          because there is no user data on any server.
        </p>

        <h2>Third-party data</h2>
        <p>
          Club and player stats are fetched live, on demand, from EA's own public Pro Clubs
          endpoints, directly from our server to EA's servers. Your search terms are sent to
          EA (as they would be if you used EA's own site) but nothing about that request is
          logged or stored by us afterward.
        </p>

        <h2>Analytics</h2>
        <p>
          If analytics are enabled, they are limited to aggregate, cookieless page-view counts
          used to understand overall traffic. No individual visitor is identified or tracked
          across sites.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes, the update will be posted on this page. Continued use of the
          site after a change means you accept the updated policy.
        </p>

        <p className="legalUpdated">Last updated: {new Date().getFullYear()}</p>
      </div>
    </main>
  );
}
