import Link from "next/link";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <nav className="footerNav" aria-label="Legal">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms &amp; Conditions</Link>
      </nav>
      <p className="footerNote">Not affiliated with or endorsed by EA.</p>
    </footer>
  );
}
