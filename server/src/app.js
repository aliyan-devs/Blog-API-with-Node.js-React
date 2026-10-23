const cors = require("cors");
const express = require("express");
const posts = require("../data/posts.json");

const app = express();
const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 50;

app.use(cors());

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

app.get("/api/posts", (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const requestedLimit = parsePositiveInteger(req.query.limit, DEFAULT_PAGE_SIZE);

  if (page === null || requestedLimit === null) {
    return res.status(400).json({
      error: "Page and limit must be positive whole numbers."
    });
  }

  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const start = (page - 1) * limit;

  res.json({
    posts: posts.slice(start, start + limit),
    pagination: {
      page,
      limit,
      totalPosts,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  });
});

app.get("/api/posts/:slug", (req, res) => {
  const post = posts.find((item) => item.slug === req.params.slug);

  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  res.json({ post });
});

module.exports = app;
