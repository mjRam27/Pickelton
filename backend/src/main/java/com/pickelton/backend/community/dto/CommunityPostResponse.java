package com.pickelton.backend.community.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CommunityPostResponse(
    UUID id,
    UUID authorId,
    String authorName,
    UUID clubId,
    String clubName,
    UUID tournamentId,
    boolean pinned,
    String tag,
    String content,
    OffsetDateTime createdAt
) {
}
