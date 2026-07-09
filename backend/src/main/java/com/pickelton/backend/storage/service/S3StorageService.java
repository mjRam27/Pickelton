package com.pickelton.backend.storage.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ServiceUnavailableException;
import com.pickelton.backend.storage.dto.StorageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class S3StorageService implements StorageService {

    private static final long MAX_FILE_BYTES = 8L * 1024L * 1024L;

    @Value("${storage.s3.access-key-id}")
    private String accessKeyId;

    @Value("${storage.s3.secret-access-key}")
    private String secretAccessKey;

    @Value("${storage.s3.region}")
    private String region;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Override
    public StorageUploadResponse upload(String folder, MultipartFile file) {
        validate(file);
        String key = buildKey(folder, file);
        try (S3Client client = buildClient()) {
            client.putObject(PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException ex) {
            throw new BadRequestException("Could not read uploaded file");
        } catch (RuntimeException ex) {
            throw new ServiceUnavailableException("Could not upload file to storage");
        }
        String encodedKey = URLEncoder.encode(key, StandardCharsets.UTF_8).replace("+", "%20").replace("%2F", "/");
        String url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + encodedKey;
        return new StorageUploadResponse(key, url);
    }

    private S3Client buildClient() {
        if (isBlank(accessKeyId) || isBlank(secretAccessKey) || isBlank(bucketName)) {
            throw new ServiceUnavailableException("Storage is not configured");
        }
        return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
            .build();
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Upload a file");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new BadRequestException("File must be 8MB or smaller");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("image/") && !"application/pdf".equals(contentType)) {
            throw new BadRequestException("Only image or PDF uploads are supported");
        }
    }

    private String buildKey(String folder, MultipartFile file) {
        String extension = extension(file.getOriginalFilename(), file.getContentType());
        return sanitize(folder) + "/" + OffsetDateTime.now().toLocalDate() + "/" + UUID.randomUUID() + extension;
    }

    private String extension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            String extension = filename.substring(filename.lastIndexOf(".")).toLowerCase(Locale.ROOT);
            if (extension.length() <= 10) return extension;
        }
        if ("application/pdf".equalsIgnoreCase(contentType)) return ".pdf";
        return ".jpg";
    }

    private String sanitize(String folder) {
        if (isBlank(folder)) return "uploads";
        return folder.replaceAll("[^A-Za-z0-9/_-]", "").replaceAll("/{2,}", "/");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
