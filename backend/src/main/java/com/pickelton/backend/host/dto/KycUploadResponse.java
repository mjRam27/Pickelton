package com.pickelton.backend.host.dto;

// path is the private storage key; url is the same reference, passed back in the host application.
public record KycUploadResponse(String path, String url) {
}
