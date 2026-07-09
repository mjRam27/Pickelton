package com.pickelton.backend.community.repository;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.community.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, UUID> {

    List<Post> findByClubIdOrderByCreatedAtDesc(UUID clubId);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
