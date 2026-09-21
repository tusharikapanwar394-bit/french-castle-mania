# French Castle Mania

A lightweight, deployable French cultural quiz experience. It is intentionally dependency-free so it can be hosted on any static file host.

## Run locally

Double-click `index.html` in File Explorer, or serve the folder with any static server. The app uses classic browser scripts so direct `file:///` opening works without a local server. No build step or environment variables are required.

## Edit questions

All question content lives in `src/data/questions.js`. Update the question text, options, zero-based `correctAnswer`, explanation, city, or `visualLocation`; the quiz engine will render the changes automatically.

## Deploy

Upload the project folder to GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages, or any static web host. The entrypoint is `index.html`.

The current implementation includes forward-only scoring, automatic progression, elapsed timer, reduced-motion support, graceful local-storage recovery, muted-by-default sound control, responsive portrait layout, city map transitions, final results, and a shared leaderboard adapter. Sound is represented by the control and can be connected to original audio assets later without changing quiz logic.

## Enable the shared leaderboard

No package installation is required. Firebase Realtime Database is used through its standard HTTPS API.

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Open **Build → Realtime Database → Create Database** and choose a nearby region.
3. For a college event, start in locked mode, then add these temporary event rules under **Rules**:

```json
{
	"rules": {
		".read": true,
		".write": true
	}
}
```

4. Copy the Realtime Database URL. It looks like `https://your-project-default-rtdb.firebaseio.com`.
5. Paste it into `leaderboardDatabaseUrl` in [src/config.js](src/config.js).
6. Upload the whole folder again. Every student will then submit to the same shared ranking.

The ranking sorts by highest score, then fastest elapsed time, then earliest submission. The open event rules are suitable only for a casual quiz because a determined user could submit a fake score. Close or remove the database after the event; a stricter authenticated backend can be added for official competition use.
