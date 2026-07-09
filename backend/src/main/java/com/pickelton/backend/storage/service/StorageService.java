package com.pickelton.backend.storage.service;

import com.pickelton.backend.storage.dto.StorageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StorageUploadResponse upload(String folder, MultipartFile file);
}
