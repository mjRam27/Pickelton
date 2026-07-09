package com.pickelton.backend.community.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.community.entity.Post;

public record CommunityPostResponse(
    UUID id,
    UUID authorId,
    String authorName,
    String tag,
    String content,
    OffsetDateTime createdAt
) {

    public static CommunityPostResponse from(Post post) {
        Object tag = post.getMetadata() == null ? null : post.getMetadata().get("tag");
        return new CommunityPostResponse(
            post.getId(),
            post.getUser().getId(),
            post.getUser().getName(),
            tag == null ? "" : tag.toString(),
            post.getContent(),
            post.getCreatedAt()
        );
    }
}
