# AI Capsule — Cloud-Deployed AI Prompt Manager

A full-stack CRUD app for saving and managing AI prompts, built for
CSE3CWA/CSE5006 Assignment 3. React frontend, Node/Express backend, GitHub
OAuth login, an Express-issued application JWT stored in a Secure HttpOnly
cookie, and SQLite storage.

> **Before you submit:** every `TODO` / `YOUR-...` placeholder below must be
> filled in with your real, deployed values. This template will not earn
> deployment marks on its own — it has to actually be running on a public
> URL with your own GitHub OAuth app configured.

---

## 1. Public deployed URL

- **Live URL:** `https://TODO-your-app.onrender.com` (or your Azure URL)
- **Cloud platform used:** TODO (Render / Azure App Service / other)

## 2. Tech stack

| Component | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Auth | GitHub OAuth → Express-issued application JWT |
| Session | JWT in a `Secure, HttpOnly` cookie named `token` |
| Storage | SQLite (`better-sqlite3`) |

## 3. Project structure

```
ai-capsule/
├── package.json              # root: orchestrates build/start
├── server/
│   ├── index.js              # Express app entry point
│   ├── db.js                 # SQLite connection + schema
│   ├── middleware/
│   │   └── authenticateJWT.js
│   ├── routes/
│   │   ├── auth.js           # GitHub OAuth + JWT issuance
│   │   └── capsules.js       # protected CRUD routes
│   └── .env.example
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   └── Dashboard.jsx
        └── components/
            ├── CapsuleForm.jsx
            └── CapsuleList.jsx
```

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

Create the GitHub OAuth App at **github.com → Settings → Developer
settings → OAuth Apps**, with:
- Homepage URL: `https://YOUR-APP`
- Authorization callback URL: `https://YOUR-APP/api/auth/github/callback`

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

- SQLite via `better-sqlite3`, schema created automatically on first run
  (`server/db.js`).
- Each row's `user_id` is the GitHub numeric user ID, taken from the
  verified JWT.
- **Persistence:** TODO — state clearly whether your deployed platform's
  filesystem is persistent or ephemeral. On Render's free web service the
  local filesystem is ephemeral, so the SQLite file (and its data) can be
  lost on restart/redeploy. If you switched to Render/Azure managed
  PostgreSQL for persistence, note that here instead.

## 9. Required cURL checks

Run against your **deployed** URL before submitting, and paste the actual
output below (not this placeholder):

```bash
# Test 1 - no authentication
curl -i https://YOUR-APP/api/capsules
# Expected: 401 Unauthorized

# Test 2 - fake / invalid JWT
curl -i -H "Cookie: token=fake-token-123" https://YOUR-APP/api/capsules
# Expected: 401 Unauthorized
```

**Test 1 result:** TODO — paste real output here.

**Test 2 result:** TODO — paste real output here.

## 10. Known limitation

TODO — one honest limitation of this submission, e.g. SQLite storage is
ephemeral on the free hosting tier, no refresh-token rotation, no file
upload for screenshots (URL only), etc.

## 11. AI-assisted development statement

- **AI tool(s) used:** TODO (e.g. Claude)
- **Problem found and corrected in AI-generated code/config:** TODO — be
  specific (e.g. "the initial OAuth callback used the GitHub access token
  directly as the session token instead of issuing a separate application
  JWT; fixed by signing a new JWT with `jsonwebtoken` after fetching the
  GitHub profile").
- **How OAuth login, JWT verification and protected API behaviour were
  verified:** TODO (e.g. manual login test, the two cURL checks above,
  inspecting the `token` cookie's flags in devtools).
- **How CRUD behaviour and user data ownership were verified:** TODO (e.g.
  logged in as two different GitHub accounts and confirmed each only sees
  its own records).
- **One implementation/deployment decision made and explainable:** TODO
  (e.g. "chose to serve the React build from Express on the same origin to
  avoid cross-site cookie issues with `SameSite`/CORS").
