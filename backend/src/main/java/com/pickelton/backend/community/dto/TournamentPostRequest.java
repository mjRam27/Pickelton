package com.pickelton.backend.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TournamentPostRequest(@NotBlank(message = "Write something to post") @Size(max = 2000) String content) {
}
