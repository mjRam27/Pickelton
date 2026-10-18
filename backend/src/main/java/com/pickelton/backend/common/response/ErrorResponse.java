package com.pickelton.backend.common.response;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(boolean success, String message, List<FieldError> errors, OffsetDateTime timestamp) {

    public static ErrorResponse of(String message) {
        return new ErrorResponse(false, message, null, OffsetDateTime.now());
    }

    public static ErrorResponse of(String message, List<FieldError> errors) {
        return new ErrorResponse(false, message, errors, OffsetDateTime.now());
    }

    public record FieldError(String field, String message) {
    }
}
