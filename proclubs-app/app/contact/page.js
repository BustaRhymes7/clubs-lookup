import { CONTACT_EMAIL } from "../../lib/site";

export const metadata = {
  title: "Contact",
  description: "Get in touch about Clubs Lookup.",
};

export default function ContactPage() {
  return (
    <main className="shell">
      <p className="kicker display">GET IN TOUCH</p>
      <h1 className="title display" style={{ fontSize: 34 }}>
        Contact
      </h1>
      <p className="subtitle">
        Questions, bug reports, or an EA representative with concerns about this project — reach
        out directly:
      </p>
      <a href={`mailto:${CONTACT_EMAIL}`} className="searchButton" style={{ display: "inline-block", textDecoration: "none" }}>
        Email {CONTACT_EMAIL}
      </a>
    </main>
  );
}
