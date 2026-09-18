import Link from "next/link";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <nav className="footerNav" aria-label="Legal and contact">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms &amp; Conditions</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <p className="footerNote">Not affiliated with or endorsed by EA.</p>
    </footer>
  );
}
