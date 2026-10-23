const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const request = require("supertest");
const app = require("../src/app");

let api;

before(() => {
  api = app.listen(0);
});

after((done) => {
  api.close(done);
});

test("GET /api/posts returns the first page and pagination metadata", async () => {
  const response = await request(api).get("/api/posts");

  assert.equal(response.status, 200);
  assert.equal(response.body.posts.length, 6);
  assert.equal(response.body.posts[0].slug, "the-art-of-slow-mornings");
  assert.deepEqual(response.body.pagination, {
    page: 1,
    limit: 6,
    totalPosts: 12,
    totalPages: 2,
    hasNextPage: true,
    hasPreviousPage: false
  });
});

test("GET /api/posts supports page and limit query parameters", async () => {
  const response = await request(api).get("/api/posts?page=2&limit=3");

  assert.equal(response.status, 200);
  assert.equal(response.body.posts.length, 3);
  assert.equal(response.body.posts[0].slug, "the-quiet-pleasure-of-reading-together");
  assert.equal(response.body.pagination.hasPreviousPage, true);
});

test("GET /api/posts rejects invalid pagination parameters", async () => {
  const response = await request(api).get("/api/posts?page=0&limit=3");

  assert.equal(response.status, 400);
  assert.match(response.body.error, /positive whole numbers/);
});

test("GET /api/posts/:slug returns a matching post", async () => {
  const response = await request(api).get("/api/posts/the-art-of-slow-mornings");

  assert.equal(response.status, 200);
  assert.equal(response.body.post.title, "The art of slow mornings");
  assert.equal(response.body.post.content.length, 3);
});

test("GET /api/posts/:slug returns 404 for an unknown post", async () => {
  const response = await request(api).get("/api/posts/not-a-real-post");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "Post not found." });
});
