// web/components/TournamentFeed.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Pin, PinOff, Trash2, Trophy } from "lucide-react";
import type { CommunityPost } from "@pickelton/types";
import { timeAgo, toneFor } from "../lib/format";
import { api, errorMessage, useResource, useSession } from "../lib/session";
import { Avatar, ConfirmDialog, Loading, Notice, Spinner } from "./ui";

// A tournament's own feed: host announcements, player posts and automatic match results.
// Anyone can read it; the host and registered players post; the host pins and removes posts.
export function TournamentFeed({ tournamentId, isHost, isPlayer }: { tournamentId: string; isHost: boolean; isPlayer: boolean }) {
  const session = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState("");
  const [deleting, setDeleting] = useState<CommunityPost | null>(null);
  const [error, setError] = useState("");
  const canPost = isHost || isPlayer;
  const path = `/tournaments/${tournamentId}`;

  const { loading, error: loadError, reload } = useResource(async () => {
    const result = await api.tournaments.feed(tournamentId);
    setPosts(result.content);
    setPage(result.page);
    setLast(result.last);
    return true;
  }, [tournamentId]);

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    void run("post", async () => {
      const post = await api.tournaments.post(tournamentId, content.trim());
      // New posts go below the pinned one.
      setPosts((current) => [...current.filter((item) => item.pinned), post, ...current.filter((item) => !item.pinned)]);
      setContent("");
    });
  };

  // Pinning moves posts around (and unpins the previous one), so reload the first page afterwards.
  const togglePin = (post: CommunityPost) => run(post.id, async () => {
    await api.tournaments.pinPost(tournamentId, post.id, !post.pinned);
    await reload();
  });

  const remove = (post: CommunityPost) => {
    setDeleting(null);
    void run(post.id, async () => {
      await api.tournaments.removePost(tournamentId, post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    });
  };

  const loadMore = () => run("more", async () => {
    const result = await api.tournaments.feed(tournamentId, page + 1);
    setPosts((current) => [...current, ...result.content]);
    setPage(result.page);
    setLast(result.last);
  });

  return (
    <section className="card">
      <h2>Event feed</h2>
      {canPost ? (
        <form className="vstack" onSubmit={submit} style={{ gap: 8 }}>
          <label className="srOnly" htmlFor="feed-text">{isHost ? "Announcement" : "Post"}</label>
          <textarea className="input" id="feed-text" maxLength={2000} onChange={(event) => setContent(event.target.value)}
            placeholder={isHost ? "Post an announcement: schedule, courts, changes…" : "Share a photo caption, a highlight, or find a partner…"} rows={3} value={content} />
          <button className="btn primary" disabled={busy === "post" || !content.trim()} style={{ alignSelf: "flex-start" }} type="submit">
            {busy === "post" ? <Spinner /> : null}{isHost ? "Post announcement" : "Post"}
          </button>
        </form>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          {session ? "Register for this tournament to post here." : <><Link href={`/login?next=${encodeURIComponent(path)}`}>Log in</Link> and register to post here.</>}
        </p>
      )}
      <Notice message={error} />

      {loading && !posts.length ? <Loading label="Loading the feed" /> : loadError && !posts.length ? (
        <p className="muted" style={{ margin: 0 }}>Couldn't load the feed. <button className="btn ghost small" onClick={reload} type="button">Try again</button></p>
      ) : posts.length ? (
        <div className="vstack" style={{ gap: 0 }}>
          {posts.map((post) => {
            const result = post.tag === "RESULT";
            const mine = post.authorId === session?.userId;
            return (
              <article className="vstack" key={post.id} style={{ borderTop: "1px solid var(--line)", gap: 8, padding: "14px 0" }}>
                {result ? (
                  <div className="row" style={{ flexWrap: "nowrap", gap: 10 }}>
                    <span style={{ alignItems: "center", background: "var(--acc)", borderRadius: 12, color: "var(--on-acc)", display: "flex", flexShrink: 0, height: 36, justifyContent: "center", width: 36 }}><Trophy aria-hidden="true" size={18} /></span>
                    <span className="vstack" style={{ flex: 1, gap: 2, minWidth: 0 }}>
                      <strong style={{ fontSize: 14 }}>{post.content}</strong>
                      <small className="muted">Result · {timeAgo(post.createdAt)}</small>
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <Avatar name={post.authorName} size={36} tone={toneFor(post.authorId)} />
                      <span className="vstack" style={{ flex: 1, gap: 0, minWidth: 0 }}>
                        <strong style={{ fontSize: 14 }}>{post.authorName}</strong>
                        <small className="muted">{timeAgo(post.createdAt)}</small>
                      </span>
                      {post.pinned ? <span className="badge acc"><Pin aria-hidden="true" size={12} />Pinned</span> : null}
                      {post.tag === "ANNOUNCEMENT" ? <span className="badge hot">Host</span> : null}
                    </div>
                    <p style={{ lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>{post.content}</p>
                  </>
                )}
                {isHost || mine ? (
                  <div className="row" style={{ gap: 4 }}>
                    {isHost && !result ? (
                      <button className="btn ghost small" disabled={busy === post.id} onClick={() => togglePin(post)} style={{ color: "var(--muted)", paddingLeft: 0 }} type="button">
                        {post.pinned ? <PinOff aria-hidden="true" size={16} /> : <Pin aria-hidden="true" size={16} />}{post.pinned ? "Unpin" : "Pin to top"}
                      </button>
                    ) : null}
                    <button className="btn ghost small" disabled={busy === post.id} onClick={() => setDeleting(post)} style={{ color: "var(--muted)", paddingLeft: isHost && !result ? undefined : 0 }} type="button"><Trash2 aria-hidden="true" size={16} />Delete</button>
                  </div>
                ) : null}
              </article>
            );
          })}
          {!last ? <button className="btn" disabled={busy === "more"} onClick={() => void loadMore()} type="button">{busy === "more" ? <Spinner /> : null}Load more</button> : null}
        </div>
      ) : <p className="muted" style={{ margin: 0 }}>{isHost ? "Nothing here yet. Post the schedule or a welcome note; match results will show up automatically." : "No posts yet. Match results will appear here as they come in."}</p>}

      <ConfirmDialog body={deleting?.tag === "RESULT" ? "The result stays on the leaderboard; only this post is removed." : "This removes the post for everyone."}
        confirmLabel="Delete post" onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove(deleting)} open={Boolean(deleting)} title="Delete post?" />
    </section>
  );
}
