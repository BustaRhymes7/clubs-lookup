"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// This site's analytics (Vercel Analytics) is cookieless, so this banner
// isn't strictly required for that alone - it's here as a trust signal and
// in case cookie-based tools get added later. Dismissal is remembered via
// localStorage, not a cookie.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-notice-dismissed")) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) - just skip the banner
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem("cookie-notice-dismissed", "1");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookieBanner" role="dialog" aria-label="Cookie notice">
      <p>
        This site uses privacy-friendly, cookieless analytics to see how many people use it.
        See our <Link href="/privacy">Privacy Policy</Link> for details.
      </p>
      <button className="searchButton" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
