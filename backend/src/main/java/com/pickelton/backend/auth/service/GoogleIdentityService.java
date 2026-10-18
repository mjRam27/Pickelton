package com.pickelton.backend.auth.service;

import java.util.Map;

import com.pickelton.backend.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class GoogleIdentityService {

    private final RestClient restClient = RestClient.create();

    @Value("${google.client-id:}")
    private String googleClientId;

    public GoogleIdentity verify(String idToken) {
        Map<String, String> payload = restClient.get()
            .uri("https://oauth2.googleapis.com/tokeninfo?id_token={idToken}", idToken)
            .retrieve()
            .body(new ParameterizedTypeReference<>() {
            });

        if (payload == null || payload.get("sub") == null || payload.get("email") == null) {
            throw new BadRequestException("Invalid Google token");
        }
        if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(payload.get("aud"))) {
            throw new BadRequestException("Google token audience does not match this app");
        }
        boolean emailVerified = Boolean.parseBoolean(payload.getOrDefault("email_verified", "false"));
        if (!emailVerified) {
            throw new BadRequestException("Google email is not verified");
        }
        return new GoogleIdentity(
            payload.get("sub"),
            payload.get("email").toLowerCase(),
            payload.getOrDefault("name", payload.get("email")),
            emailVerified
        );
    }

    public record GoogleIdentity(String subject, String email, String name, boolean emailVerified) {
    }
}
