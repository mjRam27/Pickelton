package com.pickelton.backend.community.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CommunityPostResponse(
    UUID id,
    UUID authorId,
    String authorName,
    UUID clubId,
    String clubName,
    String tag,
    String content,
    OffsetDateTime createdAt
) {
}
