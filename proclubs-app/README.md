# Clubs Lookup (prototype)

A tiny website that searches Pro Clubs teams and shows their stats and recent
matches, pulled live from EA's own (unofficial, undocumented) servers. Not
affiliated with or endorsed by EA — see the disclaimer in the app itself.

This is the **full-featured version**: platform selector (PS5/XSX/PC, PS4/Xbox
One, Switch), club search, overview (record, skill rating, division, playoff
achievements), match history with per-player breakdowns (goals, assists,
tackles, passes, red cards, MOTM, rating) across league/playoff/friendly
games, and a full roster stats table. No sign-in needed for you or your
friends — anyone with the link can use it.

## Why it needs to be "deployed" and can't just run on your computer

EA's API blocks direct requests from a browser (no CORS headers, checks the
request looks like it came from their own site). So this app has a small
server-side piece that fetches from EA on the browser's behalf. That server
piece needs to live somewhere reachable by a URL — that's what "deploying"
does. Vercel (the company behind Next.js, the framework this uses) hosts
projects like this for free.

## Deploying it (no coding tools needed) — about 10 minutes

**1. Put this project on GitHub**
   - Go to [github.com](https://github.com) and create a free account if you
     don't have one.
   - Click the **+** in the top right → **New repository**. Name it
     `clubs-lookup`, keep it Public or Private (either is fine), click
     **Create repository**.
   - On the next page, click **uploading an existing file**.
   - Drag in every file and folder from this project (keep the folder
     structure — `app/`, `lib/`, `package.json`, etc.) and click
     **Commit changes**.

**2. Connect it to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up using your GitHub
     account (there's a "Continue with GitHub" button).
   - Click **Add New… → Project**.
   - Find `clubs-lookup` in the list and click **Import**.
   - Leave all the settings as-is (Vercel auto-detects Next.js) and click
     **Deploy**.
   - Wait about a minute. You'll get a URL like
     `clubs-lookup-yourname.vercel.app` — that's the live link you can send
     to friends.

**3. Test it**
   - Open the URL, search a real club name (exact in-game name works best),
     and open a result. If EA's API is blocking Vercel's servers or the
     response shape doesn't match what the app expects, use the **Show raw
     API response** link at the bottom of the page to see exactly what EA
     sent back — that tells us what to fix next.

## If you're getting 403 errors

This is a known issue, not a bug in the code: EA's bot-protection system
(Akamai) scores down requests from cloud-hosting IP ranges — Vercel, AWS,
Cloudflare, and most other free hosts included — regardless of what headers
are sent. The app already sends a full, realistic browser header set, but
that alone isn't guaranteed to get past an IP-reputation block.

If you hit this:
1. **Try again after a few minutes** — sometimes it's transient rate
   limiting rather than a hard block.
2. **Try a different free host** (Render, Railway) — different IP ranges,
   not guaranteed to work, but free to test by re-importing the same
   GitHub repo.
3. **If neither works**, the only reliable fix is routing requests through
   a paid residential-proxy service (roughly $10-30/month), which trades
   away the free/no-servers setup. Don't set this up without deciding
   that trade-off is worth it first.

From then on, any time you want to update the site: change files in the
GitHub repo (or send me the changes to make), and Vercel automatically
redeploys within a minute or two. No servers to manage.

## Deploying to Render instead

Same GitHub repo, different host — about 5 minutes.

1. Go to [render.com](https://render.com) and sign up with **"Continue with
   GitHub"**.
2. Click **New +** → **Web Service**.
3. Find and select your `clubs-lookup` repo, click **Connect**.
4. Fill in:
   - **Name:** `clubs-lookup` (or anything)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** **Free**
5. Click **Create Web Service**. First deploy takes a few minutes — Render
   shows live logs while it builds.
6. Once live, you'll get a URL like `clubs-lookup.onrender.com`. Copy it.
7. Go to the **Environment** tab → **Add Environment Variable**:
   - Key: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://clubs-lookup.onrender.com` (your actual URL from step 6)
   - Save — this triggers a redeploy automatically. Without this, the
     share-preview image and sitemap will point at the wrong address.
8. Test it the same way: search a real club, check for the 403.

**The free-tier trade-off:** Render's free web services spin down after
about 15 minutes with no visitors. The next person to open the link waits
30-50 seconds for it to wake back up, then it's fast again until it goes
idle once more. No card required, and it costs nothing either way.

## Before you share the link — 2 things to fill in

**1. Your real contact email.** I didn't invent an address — open
   `lib/site.js` and replace `REPLACE-ME@example.com` with a real email you
   check. It's used on the Contact, Privacy, and Terms pages (all in one
   place, so you only edit it once). You can either edit this directly on
   GitHub (open the file, click the pencil icon, edit, commit) or send me
   your email and I'll update it for you.

**2. Turn on Analytics.** The code for it is already in (`@vercel/analytics`,
   cookieless — no cookie banner legally required just for this). To
   actually start collecting data: open your project on vercel.com → the
   **Analytics** tab → **Enable**. No code or API key needed.

## Production-readiness checklist — what's in and what isn't

| Item | Status |
|---|---|
| Custom 404 page | ✅ styled to match the site |
| Meta title / description on every page | ✅ (site-wide default + one per page: privacy, terms, contact, 404) |
| CTA above the fold | ✅ search bar is the first thing visible, no scrolling needed |
| Favicon set | ✅ SVG favicon (modern browsers) + generated Apple touch icon + Android/PWA icons via the web manifest. No literal `.ico` file — not needed by any current browser, but flagging it as the one gap |
| robots.txt | ✅ auto-generated, allows all crawling |
| sitemap.xml | ✅ auto-generated, lists home/privacy/terms/contact |
| Open Graph image | ✅ generated on the fly (1200×630), no image file to keep updated |
| Alt text on every image | ✅ N/A currently — the site has no `<img>` tags (icons are emoji/CSS); the OG image itself has descriptive alt text set |
| Mobile breakpoints | ✅ layout, type size, and grid columns adjust under 640px and 400px |
| Sticky mobile CTA | ✅ "New search" button pinned to the bottom on mobile once you're viewing a club |
| Loading states | ✅ skeleton placeholders for search results and club pages (previously plain text) |
| Form error states | ✅ empty search now shows an inline message instead of doing nothing |
| Thank you page | ⚠️ **not added** — there's no form that submits anywhere (the Contact page is a `mailto:` link, which opens your email client directly). A thank-you page implies a server received something; building one here would be misleading since nothing is actually processed. If you want a real contact *form* later, that needs an email-sending service (e.g. Resend) and an API key — happy to wire that up when you have one |
| Privacy policy page | ✅ `/privacy` — explains what is and isn't collected |
| Terms and conditions | ✅ `/terms` — unofficial-project disclaimer, no-warranty, acceptable use |
| Cookie banner | ✅ added, but note: analytics is cookieless, so this isn't legally required for that alone. It's there as a trust signal / in case you add cookie-based tools later. Dismissal is remembered via `localStorage`, not an actual cookie |
| Analytics installed | ✅ code is in; you flip it on in the Vercel dashboard (see above) |
| Real contact address | ⚠️ **placeholder** — I won't invent a real email or street address for you. See "fill in" section above |
| Compressed images | ✅ N/A in the traditional sense — there are no uploaded photos/binary images in this repo; the favicon and OG image are generated on-demand as small vector/simple graphics, not stored as heavy files |

## Known limitations of the EA data layer

- The club page is now one continuous flow: stats → form (last 5 league
  results) → podium (top 3 by average rating) → full squad (tap a name for
  their stats, or "Compare players" to pick two and see them side by side).
  Matches stay on their own tab. Roster is no longer a separate tab — it's
  folded into Overview.
- The podium only appears once at least 3 players have a recorded average
  rating — with fewer, there's nothing to rank yet.

- Each club now has its own real URL: `/club/<id>?platform=...`. Clicking a
  search result or favorite opens it in a new tab, and that link is
  shareable/bookmarkable on its own — it no longer relies on in-page state.
- If a section (overview stats, playoff achievements, roster, matches)
  shows an amber "couldn't load X" message, open that same club link with
  `&debug=1` added to the end and check "Show raw API response" — that
  shows exactly what EA returned, which is the fastest way to tell me
  what's wrong so I can fix the field mapping.
- Roster and playoff-achievements field names/endpoints are now confirmed
  against a real, actively-maintained third-party SDK's source code (not
  guessed) — `members/stats` returns `{ members: [...], positionCount }`,
  and `club/playoffAchievements` takes `clubId` (singular), unlike every
  other per-club endpoint here which take `clubIds` (plural).

- `overallStats`, `playoffAchievements`, and `members/career/stats` endpoints
  are based on community reports, not confirmed against a live response yet.
  If EA doesn't actually expose them at these exact paths, those sections
  will show a small amber note instead of breaking the page — everything
  else keeps working. The raw-response viewer will show us the truth once
  you search a real club.
- No penalty-missed or yellow-card field has been confirmed in EA's match
  data — if it's not there, there's nothing the app can surface for it.
- Whether these endpoints are currently serving FC26 or FC27 data isn't
  confirmed — they aren't versioned by game year in the URL, so they likely
  just follow whichever game is live, but this needs a real search against
  an active FC27 club to verify.
- No caching — every search/click hits EA directly. Fine for friends-group
  scale; would need light caching if this got wider usage, to avoid EA
  rate-limiting or blocking the site's IP.
- EA's endpoints have gone down for days at a time before (this happened as
  recently as June 2026) — if the site suddenly stops working, it's likely
  EA's API, not this code.
