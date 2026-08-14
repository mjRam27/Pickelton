package com.pickelton.backend.community.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
    @NotBlank @Size(max = 40) String tag,
    @NotBlank @Size(max = 2000) String content,
    UUID clubId
) {
}
