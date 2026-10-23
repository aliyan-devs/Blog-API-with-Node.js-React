import { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useParams,
  useSearchParams
} from "react-router-dom";

const PAGE_SIZE = 6;
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function getApiData(path, signal) {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, { signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new Error("We couldn't connect to the blog. Please try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

function Header() {
  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="The Sunday Edit home">
        the sunday<span>edit</span>
      </Link>
      <span className="header-note">A little room to breathe.</span>
      <a className="header-link" href="#stories">
        THE JOURNAL <span aria-hidden="true">↘</span>
      </a>
    </header>
  );
}

function Loading({ label = "Finding something good to read…" }) {
  return (
    <div className="status-message" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

function RequestError({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <span className="error-mark" aria-hidden="true">
        !
      </span>
      <div>
        <h2>We hit a little snag.</h2>
        <p>{message}</p>
        <button className="text-button" onClick={onRetry} type="button">
          Try again <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function PostCard({ post, index }) {
  return (
    <article className={`post-card accent-${post.accent}`}>
      <Link className="card-art" to={`/posts/${post.slug}`}>
        <span className="art-kicker">{post.category} / No. {String(index + 1).padStart(2, "0")}</span>
        <span className="art-orbit" aria-hidden="true" />
        <span className="art-phrase" aria-hidden="true">
          {post.accent === "sunrise"
            ? "make\nspace"
            : post.accent === "garden"
              ? "grow\nslowly"
              : post.accent === "creative"
                ? "stay\ncurious"
                : post.accent === "reading"
                  ? "turn\na page"
                  : post.accent === "outdoors"
                    ? "take\nthe long way"
                    : post.accent === "notes"
                      ? "keep\na thought"
                      : post.accent === "supper"
                        ? "come\nto the table"
                        : post.accent === "spaces"
                          ? "room\nto be"
                          : post.accent === "journal"
                            ? "read\n& remember"
                            : post.accent === "focus"
                              ? "one\nthing"
                              : post.accent === "learning"
                                ? "begin\nagain"
                                : "just\nbreathe"}
        </span>
        <span className="art-index" aria-hidden="true">
          THE SUNDAY EDIT
        </span>
      </Link>
      <div className="card-copy">
        <div className="card-meta">
          <span>{post.category}</span>
          <span>{post.readTime} min read</span>
        </div>
        <h2>
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <div className="card-footer">
          <span>By {post.author}</span>
          <Link
            className="card-arrow"
            to={`/posts/${post.slug}`}
            aria-label={`Read ${post.title}`}
          >
            ↗
          </Link>
        </div>
      </div>
    </article>
  );
}

function Pagination({ pagination, onPageChange }) {
  const pageNumbers = Array.from(
    { length: pagination.totalPages },
    (_, index) => index + 1
  );

  return (
    <nav className="pagination" aria-label="Post pages">
      <button
        className="page-direction"
        disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.page - 1)}
        type="button"
      >
        <span aria-hidden="true">←</span> Previous
      </button>
      <div className="page-numbers">
        {pageNumbers.map((page) => (
          <button
            aria-current={page === pagination.page ? "page" : undefined}
            aria-label={`Page ${page}`}
            className={page === pagination.page ? "page-number active" : "page-number"}
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {String(page).padStart(2, "0")}
          </button>
        ))}
      </div>
      <button
        className="page-direction"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
        type="button"
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageValue = Number(searchParams.get("page") || "1");
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const [retryKey, setRetryKey] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getApiData(`/api/posts?page=${page}&limit=${PAGE_SIZE}`, controller.signal)
      .then(setResult)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [page, retryKey]);

  function changePage(nextPage) {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow"><span /> AN ONLINE JOURNAL FOR EVERYDAY LIFE</p>
        <h1>
          Stories for
          <br />
          <span>slower days.</span>
        </h1>
        <div className="hero-bottom">
          <p>Notes on making a little more room for the things that matter.</p>
          <span className="hero-stamp">ISSUE NO. 01 <span>✳</span> EST. 2026</span>
        </div>
        <a className="scroll-cue" href="#stories">
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </a>
        <span className="hero-decoration" aria-hidden="true">✳</span>
      </section>

      <main className="stories-section" id="stories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A FEW THINGS WE'VE BEEN THINKING ABOUT</p>
            <h2>Recent stories<span>.</span></h2>
          </div>
          {result && (
            <span className="story-count">
              {String(result.pagination.totalPosts).padStart(2, "0")} STORIES
            </span>
          )}
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <RequestError message={error} onRetry={() => setRetryKey((key) => key + 1)} />
        ) : (
          <>
            <div className="post-grid">
              {result.posts.map((post, index) => (
                <PostCard
                  index={(result.pagination.page - 1) * PAGE_SIZE + index}
                  key={post.slug}
                  post={post}
                />
              ))}
            </div>
            {result.posts.length === 0 && (
              <p className="empty-message">No stories on this page. Try another page.</p>
            )}
            {result.pagination.totalPages > 1 && (
              <Pagination
                onPageChange={changePage}
                pagination={result.pagination}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}

function PostPage() {
  const { slug } = useParams();
  const [retryKey, setRetryKey] = useState(0);
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getApiData(`/api/posts/${encodeURIComponent(slug)}`, controller.signal)
      .then((result) => setPost(result.post))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [slug, retryKey]);

  if (loading) {
    return <main className="article-state"><Loading label="Opening your story…" /></main>;
  }

  if (error) {
    return (
      <main className="article-state">
        <RequestError message={error} onRetry={() => setRetryKey((key) => key + 1)} />
        <Link className="back-link" to="/">← Back to all stories</Link>
      </main>
    );
  }

  return (
    <main className="article-page">
      <Link className="back-link" to="/">← Back to all stories</Link>
      <div className={`article-art accent-${post.accent}`}>
        <span className="eyebrow">{post.category} <span>·</span> THE SUNDAY EDIT</span>
        <span className="article-art-mark" aria-hidden="true">✳</span>
        <span className="article-art-label" aria-hidden="true">A MOMENT FOR YOURSELF</span>
      </div>
      <article className="article-content">
        <div className="article-meta">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readTime} MIN READ</span>
        </div>
        <h1>{post.title}</h1>
        <p className="article-excerpt">{post.excerpt}</p>
        <div className="author-line">
          <span className="author-avatar">{post.author.charAt(0)}</span>
          <span>Words by <strong>{post.author}</strong></span>
        </div>
        <div className="article-body">
          {post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="article-signoff">
          <span aria-hidden="true">✳</span>
          <p>Take what you need. Leave a little room for wonder.</p>
          <Link to="/">Discover more stories <span aria-hidden="true">↗</span></Link>
        </div>
      </article>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <Link className="wordmark" to="/">
        the sunday<span>edit</span>
      </Link>
      <p>A little room to breathe, wherever you are.</p>
      <span>MADE FOR THE IN-BETWEEN MOMENTS <span aria-hidden="true">✳</span></span>
    </footer>
  );
}

export default function App() {
  return (
    <div className="site-shell">
      <Header />
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<PostPage />} path="/posts/:slug" />
        <Route
          element={
            <main className="article-state">
              <h1>That page wandered off.</h1>
              <Link className="back-link" to="/">← Back to all stories</Link>
            </main>
          }
          path="*"
        />
      </Routes>
      <Footer />
    </div>
  );
}
