package com.pickelton.backend.common.response;

import java.time.OffsetDateTime;
import java.util.Map;

public record ErrorResponse(String error, String message, String path, Map<String, String> validationErrors,
                            OffsetDateTime timestamp) {
}