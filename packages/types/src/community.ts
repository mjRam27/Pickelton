// packages/types/src/community.ts
import type { ISODateTime, UUID } from "./common";

export type CommunityPost = {
  id: UUID; authorId: UUID; authorName: string; clubId: UUID | null; clubName: string | null;
  // Set for posts in a tournament's own feed. Their tag is ANNOUNCEMENT (host), PLAYER or RESULT (automatic).
  tournamentId: UUID | null; pinned: boolean;
  tag: string; content: string; createdAt: ISODateTime;
};
export type CreatePostRequest = { tag: string; content: string; clubId?: UUID };
