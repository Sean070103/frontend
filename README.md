# Protocol & Discussion Platform – Frontend

Next.js frontend for the community-powered protocol and discussion platform. Connects to a Laravel REST API for protocols, threads, comments, reviews, and votes, with Typesense-backed search proxied through the API.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS**
- **TypeScript**

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set your Laravel API URL:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Use the URL where your Laravel backend is running (no trailing slash).

3. **Run dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Backend (Laravel) expectations

The frontend expects the following from your Laravel API. Typesense is used **on the backend**; the frontend only calls Laravel endpoints.

### Base URL & CORS

- API base: value of `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8000`).
- All requests use `Accept: application/json` and `Content-Type: application/json`.
- Laravel must allow CORS from the frontend origin (e.g. `http://localhost:3000`).

### Endpoints used

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api/protocols` | List protocols. Query: `search`, `sort` (recent \| most_reviewed \| top_rated \| most_upvoted), `page` |
| GET | `/api/protocols/:id` | Single protocol |
| GET | `/api/protocols/:id/threads` | Threads for a protocol. Query: `sort`, `page` |
| GET | `/api/protocols/:id/reviews` | Reviews for a protocol |
| POST | `/api/reviews` | Create review. Body: `{ "protocol_id", "rating", "feedback"?: string }`. Backend should set `user_id` from auth. |
| POST | `/api/threads` | Create thread. Body: `{ "protocol_id", "title", "body" }`. Backend should set `user_id` from auth. |
| GET | `/api/threads` | List threads. Query: `search`, `sort`, `protocol_id`, `page` |
| GET | `/api/threads/:id` | Single thread |
| POST | `/api/votes` | Vote on thread or comment. Body: `{ "voteable_id", "voteable_type": "thread" \| "comment", "value": 1 \| -1 }`. Backend sets `user_id`. If Laravel uses morph map, use full model name (e.g. `App\\Models\\Thread`). |
| GET | `/api/threads/:id/comments` | Comments for thread (flat with `parent_id` or nested `children`) |
| POST | `/api/threads/:id/comments` | Create comment. URL uses real thread id. Body: `{ "body", "parent_id"?: number }` |

### Search

The frontend uses the **list** endpoints with a `search` query param (no separate `/api/search/...` routes):

- **Protocols:** `GET /api/protocols?search=...&sort=...&page=...`
- **Threads:** `GET /api/threads?search=...&sort=...&protocol_id=...&page=...`

Your Laravel API can implement search via Typesense (or DB) inside these endpoints when `search` is present.

### Response shapes (JSON, snake_case)

- **Protocol**: `id`, `title`, `content`, `tags` (array), `author`, `rating`, `created_at`, `updated_at`, `votes_count`, `reviews_count`, `threads_count`
- **Thread**: `id`, `title`, `body`, `protocol_id`, `created_at`, `updated_at`, `votes_count`, `comments_count`, `views_count`, `rating`, `user` (e.g. `{ name, avatar_url }`) or `author`, `protocol` (optional)
- **Comment**: `id`, `body`, `thread_id`, `parent_id`, `created_at`, `updated_at`, `votes_count`, `user` or `author`, optional `children` (nested) or flat list with `parent_id`
- **Review**: `id`, `protocol_id`, `rating`, `feedback`, `created_at`, `user`
- **Paginated**: `{ "data": [...], "meta": { "current_page", "last_page", "per_page", "total" } }` or plain array

## Features

- **Protocols**: List with search and sort (Most Recent, Most Reviews, Top Rated, Most Upvoted); detail page with description, tags, reviews, and threads.
- **Threads**: List with search and sort; detail page with body, voting sidebar, and threaded comments.
- **Reviews**: Shown on protocol detail; submit rating and optional feedback.
- **Voting**: Upvote/downvote threads and comments (one vote per user per item, enforced by backend).
- **Comments**: Nested replies; post new comments and replies.
- **Theme**: Dark/light mode (next-themes).
- **Fallback**: If the API is unavailable, the home page can still show mock threads so the UI is testable.

## Project structure

- `app/` – App Router pages (home, `/protocols`, `/protocols/[id]`, `/threads`, `/thread/[id]`)
- `components/` – Reusable UI (navbar, thread list/card, comment section, voting sidebar, etc.)
- `lib/` – API client (`api.ts`), types (`api-types.ts`), mappers to UI shapes (`mappers.ts`), mock data (`mock-data.ts`)
- `styles/` – Global CSS and Tailwind

## Scripts

- `pnpm dev` – Development server
- `pnpm build` – Production build
- `pnpm start` – Run production server
- `pnpm lint` – ESLint

## Typesense

Typesense is configured and used in the **Laravel backend**. The frontend does not hold Typesense keys; it only calls Laravel endpoints that perform search and return results. Ensure your Laravel app has Typesense configured (host, port, admin key, search-only key) and that search routes are implemented as above.
