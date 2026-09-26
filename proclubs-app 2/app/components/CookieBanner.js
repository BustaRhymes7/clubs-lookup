"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "clubslookup:cookie-notice-dismissed";

export default function CookieBanner() {
  const [dismissed, setDismissed] = useState(true); // default hidden until we check storage

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // storage disabled - banner will just show again next visit, fine.
    }
  }

  if (dismissed) return null;

  return (
    <div className="cookieBanner" role="dialog" aria-label="Cookie notice">
      <p>
        This site doesn't use ads or tracking cookies. It only stores your favorites and this
        notice locally on your device, never on a server. See our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <button className="searchButton" style={{ padding: "8px 16px" }} onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
