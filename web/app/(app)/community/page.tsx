// web/app/(app)/community/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Heart, Trash2 } from "lucide-react";
import type { CommunityPost } from "@pickelton/types";
import { Avatar, ConfirmDialog, Empty, LoadError, Loading, Notice, PageHeader, Spinner } from "../../../components/ui";
import { timeAgo, toneFor } from "../../../lib/format";
import { api, errorMessage, useResource, useSession } from "../../../lib/session";

const TAGS = ["MATCHDAY", "PARTNER WANTED", "CLUB UPDATE", "QUESTION"] as const;
const tagClass = (tag: string) => (tag === "PARTNER WANTED" ? "badge blu" : tag === "CLUB UPDATE" ? "badge hot" : "badge plain");

export default function CommunityPage() {
  const session = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [liked, setLiked] = useState<string[]>([]);
  const [form, setForm] = useState<{ tag: string; content: string }>({ tag: "MATCHDAY", content: "" });
  const [posting, setPosting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState<CommunityPost | null>(null);
  const [error, setError] = useState("");

  const { loading, error: loadError, reload } = useResource(async () => {
    const result = await api.community.list(0);
    setPosts(result.content);
    setPage(result.page);
    setLast(result.last);
    return true;
  });

  async function loadMore() {
    setLoadingMore(true);
    try {
      const result = await api.community.list(page + 1);
      setPosts((current) => [...current, ...result.content]);
      setPage(result.page);
      setLast(result.last);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoadingMore(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.content.trim()) return;
    setPosting(true);
    setError("");
    try {
      const post = await api.community.create({ tag: form.tag, content: form.content.trim() });
      setPosts((current) => [post, ...current]);
      setForm({ tag: "MATCHDAY", content: "" });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPosting(false);
    }
  }

  async function remove(post: CommunityPost) {
    setDeleting(null);
    try {
      await api.community.remove(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return (
    <>
      <PageHeader sub="Results, partner requests and club news from players near you" title="Community" />
      <div className="columns">
        <section className="wide">
          {loading && !posts.length ? <Loading label="Loading the feed" /> : loadError && !posts.length ? <LoadError message={loadError} onRetry={reload} /> : posts.length ? (
            <>
              {posts.map((post) => {
                const isLiked = liked.includes(post.id);
                return (
                  <article className="card" key={post.id} style={{ gap: 10 }}>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <Avatar name={post.authorName} tone={toneFor(post.authorId)} />
                      <span className="grow" style={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 0 }}>
                        <strong style={{ fontSize: 14 }}>{post.authorName}</strong>
                        <small className="muted">{[post.clubName, timeAgo(post.createdAt)].filter(Boolean).join(" · ")}</small>
                      </span>
                      {post.tag && post.tag !== "MATCHDAY" ? <span className={tagClass(post.tag)}>{post.tag}</span> : null}
                    </div>
                    <p style={{ lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>{post.content}</p>
                    <div className="row" style={{ gap: 18 }}>
                      <button aria-pressed={isLiked} className="btn ghost small" onClick={() => setLiked((current) => (isLiked ? current.filter((item) => item !== post.id) : [...current, post.id]))} style={{ color: isLiked ? "var(--hot-ink)" : "var(--muted)", paddingLeft: 0 }} type="button">
                        <Heart aria-hidden="true" fill={isLiked ? "currentColor" : "none"} size={18} />{isLiked ? "Liked" : "Like"}
                      </button>
                      {post.authorId === session?.userId ? (
                        <button className="btn ghost small" onClick={() => setDeleting(post)} style={{ color: "var(--muted)" }} type="button"><Trash2 aria-hidden="true" size={17} />Delete</button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
              {!last ? <button className="btn" disabled={loadingMore} onClick={loadMore} type="button">{loadingMore ? <Spinner /> : null}Load more</button> : null}
            </>
          ) : <Empty copy="Share a result, find a partner or ask a question." title="The feed is quiet" />}
        </section>

        <aside className="narrow" style={{ position: "sticky", top: 24 }}>
          <form className="card" onSubmit={submit}>
            <h2>New post</h2>
            <div className="row" style={{ gap: 6 }}>
              {TAGS.map((tag) => <button aria-pressed={form.tag === tag} className="chip ink" key={tag} onClick={() => setForm((current) => ({ ...current, tag }))} type="button">{tag.charAt(0) + tag.slice(1).toLowerCase()}</button>)}
            </div>
            <label className="srOnly" htmlFor="post-text">Post text</label>
            <textarea className="input" id="post-text" maxLength={2000} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="What's happening on court?" rows={5} value={form.content} />
            <Notice message={error} />
            <button className="btn primary" disabled={posting || !form.content.trim()} type="submit">{posting ? <Spinner /> : null}Post</button>
          </form>
        </aside>
      </div>
      <ConfirmDialog body="This removes the post for everyone." confirmLabel="Delete post" onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove(deleting)} open={Boolean(deleting)} title="Delete post?" />
    </>
  );
}
