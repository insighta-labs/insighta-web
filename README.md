![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

# Insighta Labs+ Web Portal

A React + TypeScript SPA for the Profile Intelligence System. Authenticates via GitHub OAuth with PKCE, stores sessions in HTTP-only cookies (tokens never touch JavaScript), and provides a filterable profile browser, natural language search, and CSV export — all in a single page app.

---

## Pages & Features

| Page | Route | Description |
|---|---|---|
| Login | `/login` | GitHub OAuth entry point |
| Dashboard | `/dashboard` | Total profiles, male/female counts, recently added |
| Profiles | `/profiles` | Filterable list, pagination, create/delete (admin) |
| Profile Detail | `/profiles/:id` | Full demographics, delete (admin) |
| Search | `/search` | Natural language search |
| Account | `/account` | User info, role badge, logout |

---

## Prerequisites

- Node 20+
- A running instance of `insighta-api` — see the [backend repo](../insighta-api/README.md)
- A GitHub OAuth App with your web portal's `/callback` URL registered

### GitHub OAuth App

Create one at **GitHub → Settings → Developer Settings → GitHub Apps → New GitHub App**.

| Field | Value |
| ----- | ----- |
| Homepage URL | `http://localhost:5173` (dev) or your production URL |
| Callback URL 1 | `https://your-production-domain.com/callback` |
| Callback URL 2 | `http://localhost:5173/callback` (dev) |
| Callback URL 3 | `http://127.0.0.1:8182/callback` (CLI) |

Copy the **Client ID** and **Client Secret** into the backend's `.env` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. GitHub Apps support multiple callback URLs — add `http://127.0.0.1:8182/callback` as an additional entry for CLI use.

### Admin Access

Admin role is controlled by the backend via `ADMIN_GITHUB_IDS`. To find a GitHub account's numeric user ID:

```bash
curl https://api.github.com/users/<github-username> | grep '"id"'
# → "id": 12345678
```

Add the ID to the backend's `.env`:

```env
ADMIN_GITHUB_IDS=12345678
```

Role assignment is evaluated on every login — no server restart required for changes to take effect.

---

## Setup

```bash
git clone <repo> && cd insighta-web
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm install
npm run dev       # → http://localhost:5173
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Authentication

The portal uses GitHub OAuth 2.0 with PKCE. Tokens are delivered as HTTP-only cookies — they are never readable by JavaScript.

### Browser PKCE Flow

**Verifier generation**

On button click, the browser generates and stores the PKCE pair using the Web Crypto API:

```
code_verifier  →  32 random bytes, hex-encoded
code_challenge →  BASE64URL-NOPAD( SHA-256(code_verifier) )  [crypto.subtle]
state          →  crypto.randomUUID(), hyphens stripped
```

`state` and `code_verifier` are written to `sessionStorage` immediately.

**GitHub redirect**

```
GET <API>/auth/github
  ?state=<state>
  &code_challenge=<challenge>
  &redirect_uri=<web-origin>/callback
```

**Callback validation**

The `/callback` page reads `code` and `state` from the URL, checks `state` against `sessionStorage`, and retrieves `code_verifier`. Invalid or missing state redirects to `/login?error=invalid_state`.

**Token exchange**

```
POST <API>/auth/web/exchange
  ?code=<code>
  &state=<state>
  &code_verifier=<verifier>
```

The backend validates the PKCE challenge, exchanges the code with GitHub, upserts the user record, and responds with three cookies:

### Session Cookies

| Cookie          | TTL   | `HttpOnly` | JS-readable      | Purpose             |
| --------------- | ----- | :--------: | :--------------: | ------------------- |
| `access_token`  | 3 min | ✅         | ❌               | API authentication  |
| `refresh_token` | 5 min | ✅         | ❌               | Token rotation      |
| `csrf_token`    | 5 min | ❌         | ✅ (intentional) | CSRF double-submit  |

The response body carries `{ id, username, email, avatar_url, role }` — stored in Zustand. The browser navigates to `/dashboard`.

> `access_token` and `refresh_token` are `HttpOnly` and never accessible to JavaScript. `csrf_token` is intentionally readable so the frontend can attach it as `X-CSRF-Token` on mutating requests — it is not an auth credential.

---

## Token Handling

**Access token**

| Property  | Value |
| --------- | ----- |
| Format    | JWT, signed HS256 |
| Expiry    | 3 minutes |
| Transport | `access_token` HttpOnly cookie (sent automatically by browser) |
| Readable  | No — never accessible to JavaScript |

**Refresh token**

| Property    | Value |
| ----------- | ----- |
| Format      | 64-char opaque hex string |
| Expiry      | 5 minutes |
| Transport   | `refresh_token` HttpOnly cookie |
| Consumption | One-time use — atomically invalidated on read |

**Session lifecycle**

- **Page load** — `RequireAuth` calls `GET /auth/me` to hydrate user state from the access token cookie. Unauthenticated or expired → redirect to `/login`.
- **On `401`** — the frontend calls `POST /auth/web/refresh` (with `X-CSRF-Token` header). Both cookies are rotated. The original request is not retried; the page reloads or redirects to login on failure.
- **Logout** — `POST /auth/web/logout` clears all three cookies server-side. Zustand state is cleared client-side.

---

## CSRF Protection

Pattern: **double-submit cookie**. The frontend reads the `csrf_token` cookie via `document.cookie` and sends it as an `X-CSRF-Token` header on every state-mutating request. The backend validates that `cookie_value == header_value`; a mismatch returns `403 Forbidden`.

| Applies to | Exempt |
|---|---|
| `POST /auth/web/refresh` | All `GET` requests |
| `POST /auth/web/logout` | `POST /auth/web/exchange` (no session yet) |
| `POST /api/profiles` | |
| `DELETE /api/profiles/:id` | |

---

## Role Enforcement

The backend enforces roles. The frontend reads `user.role` from Zustand (populated via `/auth/me`) and conditionally renders admin UI elements.

| Element | Location | Visible to |
|---|---|---|
| "New Profile" button | Dashboard, Profiles page | Admin |
| Create profile form | Profiles page | Admin |
| Delete profile button | Profile detail, Profiles list | Admin |

> Hiding UI is convenience only — the backend rejects unauthorized requests with `403 Forbidden` regardless.

---

## Natural Language Search

The Search page sends `q=<query>` to `GET /api/profiles/search`. The backend's rule-based parser handles everything — the frontend just passes the string through.

<details>
<summary>Example queries</summary>

```text
young males from nigeria
females above 30
adults in japan
top 5 women
nigeria
```

</details>

See the [insighta-api README](../insighta-api/README.md) for the full NLP keyword reference.

---

## API Communication

All requests from `src/lib/api.ts` include:

| Header | Value | When |
|---|---|---|
| `credentials` | `"include"` | Always — sends cookies |
| `X-API-Version` | `1` | All `/api/*` endpoints |
| `X-CSRF-Token` | `<csrf_token>` | All `POST` and `DELETE` requests |

---

## Scripts

```bash
npm run dev      # dev server with HMR
npm run build    # TypeScript check + production bundle
npm run lint     # ESLint
npm run preview  # preview production build locally
```

---

## Project Structure

```text
src/
├── pages/          # Login, Callback, Dashboard, Profiles, ProfileDetail, Search, Account
├── components/     # Layout, RequireAuth, Button, Select
├── lib/
│   └── api.ts      # typed fetch wrapper (all API calls)
├── store/
│   └── auth.ts     # Zustand store for user state
├── types/
│   └── index.ts    # shared TypeScript types
├── config.ts       # reads VITE_API_URL
└── styles/         # global CSS variables + base styles
```

---

## The Three-Repo System

| Repo | Auth method | Token storage | Install |
|---|---|---|---|
| `insighta-api` | Issues tokens | MongoDB (refresh tokens) | `cargo run` |
| `insighta-cli` | Bearer token | `~/.insighta/credentials.json` | `./install.sh` |
| `insighta-web` | HTTP-only cookie | Browser (managed by backend) | `npm install` |

All three repos share the same backend data and enforce the same roles.