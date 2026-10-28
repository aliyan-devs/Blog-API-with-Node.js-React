# The Sunday Edit

A full-stack blog demo with static JSON post data, a paginated Express API, and a responsive React frontend.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

From the project root:

```bash
npm install
npm run dev
```

The temporary Vercel preview is available at [https://speedy-mesa-ux3jgyb.tmp.now](https://speedy-mesa-ux3jgyb.tmp.now); it expires shortly. A permanent production URL requires deploying through the linked Vercel account. For local development, the React app runs at `http://localhost:5173` and the API runs at `http://localhost:4000`. Vite proxies `/api` requests to the API during development.

## API

### `GET /api/posts?page=1&limit=6`

Returns a page of posts and pagination metadata:

```json
{
  "posts": [],
  "pagination": {
    "page": 1,
    "limit": 6,
    "totalPosts": 12,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Both query parameters must be positive whole numbers. The page size is capped at 50.

### `GET /api/posts/:slug`

Returns `{ "post": { ... } }` for a matching slug, or a JSON `404` response when the post does not exist.

The post collection is stored in [`server/data/posts.json`](./server/data/posts.json).

## Tests and production build

```bash
npm test
npm run build
```

## Deployment

Run the API with `npm start` from `server`, and build the frontend with `npm run build` from the project root. For a separately hosted API, set `VITE_API_BASE_URL` to its base URL when building the client.

### Deploy to Vercel

Import the repository into Vercel and use the repository root as the project root. The root [`vercel.json`](./vercel.json) builds the React app into `client/dist`, serves the Express API as a serverless function, and routes client-side pages back to the app. No environment variables are required for the bundled post data.
