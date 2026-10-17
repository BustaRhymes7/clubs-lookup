"use client";

import { useEffect, useState } from "react";

// Extra Halloween animations. Only renders while the Halloween theme is on
// (the data-season attribute set in app/layout.js), so it switches off by
// itself after 31 October. Everything is pointer-events: none, so nothing
// here can block a tap. Skipped entirely for reduced-motion users.

const FALLING = ["🍂", "🍬", "🍂", "🕸️", "🍭", "🍂", "🍬", "💀", "🍂", "🍫"];
const GHOSTS = [
  { left: "8%", delay: "0s", duration: "16s" },
  { left: "72%", delay: "6s", duration: "19s" },
  { left: "40%", delay: "11s", duration: "17s" },
];

export default function HalloweenFX() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setOn(document.documentElement.dataset.season === "halloween" && !reduced);
  }, []);

  if (!on) return null;

  return (
    <div className="hfx" aria-hidden="true">
      <div className="hfxLightning" />

      <div className="hfxSpider">
        <div className="hfxThread" />
        <div className="hfxSpiderBody">🕷️</div>
      </div>

      <div className="hfxFlapBat">🦇</div>

      {GHOSTS.map((g, i) => (
        <div
          key={i}
          className="hfxGhost"
          style={{ left: g.left, animationDelay: g.delay, animationDuration: g.duration }}
        >
          👻
        </div>
      ))}

      {FALLING.map((item, i) => (
        <div
          key={i}
          className="hfxFall"
          style={{
            left: `${(i * 37 + 5) % 100}%`,
            animationDelay: `${(i * 2.3) % 14}s`,
            animationDuration: `${11 + ((i * 3) % 8)}s`,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
