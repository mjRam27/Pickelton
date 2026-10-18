package com.pickelton.backend.host.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.host.dto.KycUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

// Stores identity documents on private disk. Files are never served publicly; only reviewers read them.
@Service
public class KycStorageService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
        "image/jpeg", "jpg",
        "image/png", "png",
        "application/pdf", "pdf"
    );

    private final Path root;

    public KycStorageService(@Value("${kyc.upload-dir:uploads/kyc}") String uploadDir) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public KycUploadResponse store(UUID userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("A JPEG, PNG, or PDF file is required");
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new BadRequestException("A JPEG, PNG, or PDF file is required");
        }
        String key = "kyc/" + userId + "/" + UUID.randomUUID() + "." + extension;
        Path target = root.resolve(userId.toString()).resolve(key.substring(key.lastIndexOf('/') + 1));
        try (InputStream input = file.getInputStream()) {
            Files.createDirectories(target.getParent());
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store KYC document", ex);
        }
        return new KycUploadResponse(key, key);
    }
}
