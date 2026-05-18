package com.pickelton.backend.security;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Date;
import java.util.UUID;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Slf4j
@Component
public class JwtUtil {

    private static final String CLAIM_EMAIL = "email";
    private static final String KEY_ALGORITHM = "RSA";

    @Value("${jwt.private-key:}")
    private String privateKeyPem;

    @Value("${jwt.public-key:}")
    private String publicKeyPem;

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    private PrivateKey signingKey;
    private PublicKey verificationKey;

    @PostConstruct
    void initKeys() {
        if (hasText(privateKeyPem) && hasText(publicKeyPem)) {
            signingKey = parsePrivateKey(privateKeyPem);
            verificationKey = parsePublicKey(publicKeyPem);
            return;
        }

        KeyPair generated = generateDevelopmentKeyPair();
        signingKey = generated.getPrivate();
        verificationKey = generated.getPublic();
        log.warn("JWT_PRIVATE_KEY/JWT_PUBLIC_KEY are not configured. Using an ephemeral development RSA key pair.");
    }

    public String generateToken(UUID userId, String email) {
        Date now = new Date();
        return Jwts.builder()
            .subject(userId.toString())
            .claim(CLAIM_EMAIL, email)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expirationMs))
            .signWith(signingKey, Jwts.SIG.RS256)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration() == null || claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return parseClaims(token).get(CLAIM_EMAIL, String.class);
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    public boolean isTokenValid(String token) {
        return validateToken(token);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(verificationKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private PrivateKey parsePrivateKey(String pem) {
        try {
            String normalized = stripPem(pem, "PRIVATE KEY");
            byte[] keyBytes = java.util.Base64.getDecoder().decode(normalized);
            return KeyFactory.getInstance(KEY_ALGORITHM).generatePrivate(new PKCS8EncodedKeySpec(keyBytes));
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid JWT private key. Provide a PKCS#8 RSA private key.", ex);
        }
    }

    private PublicKey parsePublicKey(String pem) {
        try {
            String normalized = stripPem(pem, "PUBLIC KEY");
            byte[] keyBytes = java.util.Base64.getDecoder().decode(normalized);
            return KeyFactory.getInstance(KEY_ALGORITHM).generatePublic(new X509EncodedKeySpec(keyBytes));
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid JWT public key. Provide an X.509 RSA public key.", ex);
        }
    }

    private String stripPem(String value, String label) {
        return value
            .replace("-----BEGIN " + label + "-----", "")
            .replace("-----END " + label + "-----", "")
            .replace("\\n", "")
            .replace("\n", "")
            .replace("\r", "")
            .replace(" ", "")
            .trim();
    }

    private KeyPair generateDevelopmentKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance(KEY_ALGORITHM);
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate development JWT key pair", ex);
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
