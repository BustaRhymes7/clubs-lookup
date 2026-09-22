# Clubs Lookup

A free, unofficial fan project for looking up EA Sports FC Pro Clubs stats — club record, form,
squad, and player-by-player breakdowns — pulled live from EA's own public Pro Clubs endpoints.

Not affiliated with or endorsed by EA. No ads, no accounts, no tracking. Favorites are saved
only on your own device (browser local storage) — there is no server-side database of any kind.

## Publishing this (no local dev tools needed)

You don't need Node, git, or a terminal on your own computer to run this. Everything below
happens through GitHub's and Render's websites.

### 1. Push this code to GitHub

1. Create a new repository on [github.com](https://github.com) (public or private, either
   works).
2. On the repo's main page, click **Add file → Upload files**.
3. Drag in every file and folder from this project, keeping the folder structure intact
   (`app/`, `lib/`, `package.json`, etc. should all sit at the **root** of the repo, not inside
   an extra `clubs-lookup/` or `proclubs-app/` subfolder — if GitHub's upload UI nests
   everything one level deeper, you'll need to set Render's "Root Directory" to that folder
   name, see the troubleshooting note below).
4. Commit the upload.

### 2. Deploy on Render

1. Go to [render.com](https://render.com) and sign up / log in (GitHub login is easiest).
2. **New → Web Service**, then connect the GitHub repo you just created.
3. Fill in:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Root Directory:** leave blank if your repo root has `package.json` directly in it;
     otherwise set it to whatever subfolder does (see troubleshooting below).
4. Under **Environment**, add one environment variable:
   - `NEXT_PUBLIC_SITE_URL` = your Render URL once you have it, e.g.
     `https://clubs-lookup.onrender.com` (you may need to deploy once first to learn the URL,
     then add this and redeploy).
5. Click **Create Web Service**. The first deploy takes a few minutes.

Render's free tier spins the service down after ~15 minutes of no traffic, so the first visit
after a quiet period can take 20–30 seconds to wake back up. That's normal, not a bug.

### If you're getting 403 errors from EA

EA fronts its API with Akamai bot protection, which scores cloud/datacenter IP ranges down
regardless of request headers. Some hosts (notably Vercel) get blocked outright; Render has
generally tested clean. If you start seeing 403s again after a working deploy, it's very
likely EA has started blocking Render's IP range too — there's no header fix for that, only a
hosting change.

### If Render's build fails with "Could not read package.json"

This means Render is looking one folder level too high or too low. Check your repo's file
listing on GitHub: if `package.json` sits inside a subfolder (e.g. `proclubs-app/package.json`
instead of `package.json` at the root), set Render's **Root Directory** setting to that
subfolder's name.

### If Render's build succeeds but the app won't start

Make sure the **Build Command** is exactly `npm install && npm run build` (not just the
default `yarn`, which only installs dependencies and never actually builds the app) and the
**Start Command** is `npm run start`.

## Hidden debug mode

Regular visitors never see raw API responses or technical error text — everything is
translated into a plain, friendly message. Appending `?debug=1` to any URL on the site
(e.g. `https://your-site.onrender.com/?debug=1`) unlocks a "show raw response" toggle and
technical error details, for troubleshooting when EA's response shape changes.

## Known limitations of the EA data layer

- These are unofficial, undocumented endpoints. EA can change, rate-limit, or remove them at
  any time without notice.
- Not every club has playoff history, a custom crest, or match history for every match type —
  those sections gracefully show a "couldn't load" note instead of breaking the page.
- Some stats (pass accuracy, completed passes, successful tackles) aren't returned directly by
  EA and are derived client-side from the fields that are (e.g. attempts × success rate).

## Production checklist

| Item | Status |
|---|---|
| Custom 404 page | ✅ `app/not-found.js` |
| Meta title on every page | ✅ |
| Meta description on every page | ✅ |
| CTA above the fold | ✅ search box is the first interactive element |
| Favicon set | ✅ `icon.svg`, `apple-icon`, `icon-512` |
| robots.txt | ✅ `app/robots.js` |
| sitemap.xml | ✅ `app/sitemap.js` |
| Open Graph image | ✅ `app/opengraph-image.js` / `twitter-image.js` |
| Alt text on every image | ✅ (crest images use empty decorative alt) |
| Mobile breakpoints | ✅ `globals.css` |
| Sticky mobile CTA | ✅ "New search" bar on club pages |
| Loading states | ✅ skeleton components |
| Form error states | ✅ inline validation on search |
| Privacy policy page | ✅ `app/privacy/page.js` |
| Terms and conditions | ✅ `app/terms/page.js` |
| Cookie banner | ✅ `app/components/CookieBanner.js` (no tracking cookies used) |
| Analytics installed | ⬜ not currently wired in — see note below |
| Compressed images | ✅ generated icons are small; crest images are proxied from EA |

**Analytics note:** this build does not include an analytics package. `@vercel/analytics` was
used earlier in development, but it only works when hosted on Vercel — it silently reports
nothing on Render. If you want visit counts, a cookieless option like
[Simple Analytics](https://simpleanalytics.com) or
[Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (both have free tiers and
work on any host) can be added as a single `<script>` tag in `app/layout.js`.
