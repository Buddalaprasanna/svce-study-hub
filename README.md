# SVCE Study Hub — Setup Guide

## Folder structure
- `/server` — Node.js + Express backend (talks to MongoDB Atlas via GridFS)
- `/frontend` — your existing website, updated to talk to the backend

## 1. Backend setup (do this first)

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and paste your real MongoDB Atlas connection string (from the
setup steps earlier), replacing `<password>` with your actual database
user password.

Then run it locally:

```bash
npm start
```

You should see:
```
Mongoose connected
GridFS bucket ready
Server running on port 5000
```

Test it's alive by opening `http://localhost:5000/api/health` in a browser
— it should show `{"status":"ok"}`.

## 2. Frontend setup

The frontend is plain HTML/CSS/JS, so no build step. Just open
`frontend/home.html` in a browser (or use VS Code's "Live Server"
extension for a smoother experience — plain `file://` URLs sometimes
block fetch requests).

`frontend/config.js` currently points at `http://localhost:5000` — that's
correct for local testing since your backend is running locally too.

## 3. Try it end-to-end
1. Open `index.html`, log in with any `@svce.eng.in` email
2. Go to Upload, pick a subject + module, choose a PDF, click Upload
3. Go to Notes → find that same subject → click the module → your file
   should appear with an "Open" button

## 4. Deploying so it works outside your laptop (needed for submission demo)

**Backend → Render (free, no card):**
1. Push the `server` folder to a GitHub repo
2. Go to render.com → New → Web Service → connect your repo
3. Build command: `npm install`  |  Start command: `npm start`
4. Add an environment variable `MONGODB_URI` with your real connection
   string (don't commit your `.env` file to GitHub — it's already safe
   since `.env` isn't in the repo, only `.env.example` is)
5. Once deployed, Render gives you a URL like
   `https://svce-study-hub.onrender.com`

**Frontend:**
1. Update `frontend/config.js` — change `API_BASE_URL` to your Render URL
2. Host the frontend for free too — easiest is GitHub Pages, or Render's
   free static site hosting, or Netlify

**Note on Render free tier:** the free web service "spins down" after
15 minutes of no traffic and takes ~30-50 seconds to wake up on the next
request. Fine for a project demo, just give it a moment to wake up before
your first click during your presentation — or open the `/api/health`
URL a minute before you start.

## 5. Known limitations to mention if asked in your viva
- File size cap is currently 25MB per file (adjustable in `server.js`)
- Login is currently a simple email-domain check, not real password
  authentication — flagged separately if you want that added
- MongoDB Atlas free tier (M0) gives 512MB storage — plenty for a
  college project's worth of PDFs/PPTs
