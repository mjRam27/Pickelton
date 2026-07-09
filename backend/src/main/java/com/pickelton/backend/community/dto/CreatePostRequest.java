package com.pickelton.backend.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
    @Size(max = 40, message = "Tag must be at most 40 characters") String tag,
    @NotBlank(message = "Content is required") @Size(max = 2000, message = "Content must be at most 2000 characters") String content
) {
}
