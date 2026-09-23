# AI Capsule — Cloud-Deployed AI Prompt Manager

A full-stack CRUD app for saving and managing AI prompts, built for
CSE3CWA/CSE5006 Assignment 3. React frontend, Node/Express backend, GitHub
OAuth login, an Express-issued application JWT stored in a Secure HttpOnly
cookie, and SQLite storage.

---

## 1. Public deployed URL

- **Live URL:** https://ai-capsule-i2bn.onrender.com
- **Cloud platform used:** Render

## 2. Tech stack

| Component | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Auth | GitHub OAuth → Express-issued application JWT |
| Session | JWT in a `Secure, HttpOnly` cookie named `token` |
| Storage | SQLite (Node's built-in `node:sqlite` module) |

## 3. Project structure
ai-capsule/
├── package.json # root: orchestrates build/start
├── server/
│ ├── index.js # Express app entry point
│ ├── db.js # SQLite connection + schema
│ ├── middleware/
│ │ └── authenticateJWT.js
│ ├── routes/
│ │ ├── auth.js # GitHub OAuth + JWT issuance
│ │ └── capsules.js # protected CRUD routes
│ └── .env.example
└── client/
├── package.json
├── vite.config.js
├── index.html
└── src/
├── main.jsx
├── App.jsx
├── api.js
├── pages/
│ ├── Home.jsx
│ ├── Login.jsx
│ └── Dashboard.jsx
└── components/
├── CapsuleForm.jsx
└── CapsuleList.jsx


## 4. Install & run locally

```bash
# from the project root
npm run install:all        # installs backend deps, then client deps

# create server/.env from the template and fill in real values
cp server/.env.example server/.env

# terminal 1 - backend (http://localhost:5000)
npm run dev:server

# terminal 2 - frontend dev server (http://localhost:5173, proxies /api to :5000)
npm run dev:client
```

For a production-style run (single origin, matches what's deployed):

```bash
npm run build      # builds client/dist
npm start          # Express serves both the API and client/dist
```

## 5. Environment variables

Set these in your cloud platform's dashboard (never commit real values —
`server/.env` is gitignored):

| Variable | Purpose |
|---|---|
| `PORT` | Port Express listens on (most platforms set this for you) |
| `NODE_ENV` | `production` on the deployed app |
| `JWT_SECRET` | Secret used to sign/verify the application JWT |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_CALLBACK_URL` | Must exactly match the callback URL registered on GitHub, e.g. `https://YOUR-APP/api/auth/github/callback` |
| `CLIENT_URL` | Public URL of the deployed app (CORS + redirect target) |

Created a GitHub OAuth App at **github.com → Settings → Developer
settings → OAuth Apps**, with:
- Homepage URL: `https://ai-capsule-i2bn.onrender.com`
- Authorization callback URL: `https://ai-capsule-i2bn.onrender.com/api/auth/github/callback`

## 6. API routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Starts OAuth login |
| `/dashboard` | Protected | Authenticated user's records |
| `GET /api/health` | Public | Returns `{ "status": "ok" }` |
| `GET /api/auth/github` | Public | Redirects to GitHub's OAuth consent screen |
| `GET /api/auth/github/callback` | Public | Exchanges code, issues app JWT, sets `token` cookie |
| `GET /api/auth/me` | Protected | Returns the current user's identity |
| `POST /api/auth/logout` | Public | Clears the `token` cookie |
| `GET /api/capsules` | Protected | Read own records |
| `POST /api/capsules` | Protected | Create own record |
| `PUT /api/capsules/:id` | Protected | Update own record |
| `DELETE /api/capsules/:id` | Protected | Delete own record |

The React frontend talks to Express entirely through `fetch` calls in
`client/src/api.js`, using `credentials: 'include'` so the `token` cookie is
sent automatically. In dev, Vite proxies `/api` to `localhost:5000`; in
production the frontend build is served by Express from the same origin, so
no CORS configuration is needed for normal use.

## 7. OAuth + JWT flow

1. User clicks **Sign in with GitHub** → browser navigates to
   `/api/auth/github`, which redirects to GitHub's OAuth consent screen.
2. GitHub redirects back to `/api/auth/github/callback?code=...`.
3. The server exchanges `code` for a GitHub access token, fetches the
   GitHub profile, then **signs its own application JWT**
   (`{ sub: githubUserId, username }`) with `JWT_SECRET`.
4. That JWT is set as a cookie named `token` with `httpOnly: true`,
   `secure: true` (in production) and `sameSite: 'lax'`. It is never sent to
   the browser as JSON and never stored in `localStorage`.
5. `middleware/authenticateJWT.js` reads and verifies this cookie on every
   `/api/capsules` route. The user's id always comes from the verified
   token (`req.user.id`), never from the request body.

## 8. Database & persistence

- SQLite via Node's built-in `node:sqlite` module (`DatabaseSync`), no
  native compilation required. Schema created automatically on first run
  (`server/db.js`).
- Each row's `user_id` is the GitHub numeric user ID, taken from the
  verified JWT.
- **Persistence:** This deployment uses SQLite on Render's free web
  service tier, which has an ephemeral filesystem. Saved prompt records
  may be lost when the service restarts, redeploys, or spins down after
  inactivity and spins back up.

## 9. Required cURL checks

Run against the deployed URL:

```bash
# Test 1 - no authentication
curl -i https://ai-capsule-i2bn.onrender.com/api/capsules
# Expected: 401 Unauthorized

# Test 2 - fake / invalid JWT
curl -i -H "Cookie: token=fake-token-123" https://ai-capsule-i2bn.onrender.com/api/capsules
# Expected: 401 Unauthorized
```

**Test 1 result:**

HTTP/1.1 401 Unauthorized
{"error":"Unauthorized: no token provided"}


**Test 2 result:**

HTTP/1.1 401 Unauthorized
{"error":"Unauthorized: invalid or expired token"}


## 10. Known limitation

SQLite storage is ephemeral on Render's free tier — saved prompt records
may be lost if the service restarts, redeploys, or spins down and back up
after inactivity. A managed Postgres database (e.g. Render PostgreSQL)
would be needed for persistent storage across restarts.

## 11. AI-assisted development statement

- **AI tool(s) used:** Claude

- **Problem found and corrected in AI-generated code/config:** The initial
  database setup used `better-sqlite3`, which requires native C++
  compilation via node-gyp. This failed both locally on Windows (missing
  Visual Studio Build Tools) and again on Render's Linux build servers
  during deployment. Fixed by switching to Node's built-in `node:sqlite`
  module (`DatabaseSync`), which needs no native compilation and works
  identically across environments. Also found and fixed a related issue
  where `vite` was listed under `devDependencies` in `client/package.json`,
  causing the Render build to fail with `vite: not found` because
  `NODE_ENV=production` skips dev dependency installation — moved `vite`
  and its React plugin into regular `dependencies`.

- **How OAuth login, JWT verification and protected API behaviour were
  verified:** Manually logged in via GitHub OAuth on both localhost and
  the deployed URL, confirmed the `token` cookie was set as
  HttpOnly/Secure via browser devtools, and ran the two required cURL
  checks (no token, fake token) against both environments — both
  correctly returned 401 Unauthorized with the expected error messages.

- **How CRUD behaviour and user data ownership were verified:** Manually
  created, edited, and deleted prompt records after logging in on both
  localhost and the deployed app, confirming each operation persisted and
  reflected correctly in the UI immediately after each action.

- **One implementation/deployment decision made and explainable:** Chose
  to serve the built React frontend directly from Express on the same
  origin/port (rather than deploying frontend and backend as two separate
  services), to avoid cross-origin CORS and cookie (`SameSite`) issues
  with the JWT authentication flow, as recommended in the assignment
  brief.