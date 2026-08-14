package com.pickelton.backend.community.service;

import java.util.LinkedHashMap;
import java.util.UUID;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.club.repository.ClubRepository;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.community.dto.CommunityPostResponse;
import com.pickelton.backend.community.dto.CreatePostRequest;
import com.pickelton.backend.community.entity.Post;
import com.pickelton.backend.community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final PostRepository postRepository;
    private final ClubRepository clubRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public PageResponse<CommunityPostResponse> getPosts(UUID clubId, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.unsorted());
        var posts = clubId == null
            ? postRepository.findAllByOrderByCreatedAtDesc(pageable)
            : postRepository.findByClubIdOrderByCreatedAtDesc(clubId, pageable);
        return PageResponse.of(posts.map(this::toResponse));
    }

    @Transactional
    public CommunityPostResponse createPost(CreatePostRequest request) {
        Club club = request.clubId() == null ? null : clubRepository.findById(request.clubId())
            .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        var metadata = new LinkedHashMap<String, Object>();
        metadata.put("tag", request.tag().trim().toUpperCase());
        Post post = Post.builder()
            .user(currentUserService.getCurrentUser())
            .club(club)
            .content(request.content().trim())
            .metadata(metadata)
            .build();
        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void deletePost(UUID id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!post.getUser().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the author can delete this post");
        }
        postRepository.delete(post);
    }

    private CommunityPostResponse toResponse(Post post) {
        String tag = String.valueOf(post.getMetadata().getOrDefault("tag", "COMMUNITY"));
        return new CommunityPostResponse(
            post.getId(), post.getUser().getId(), post.getUser().getName(),
            post.getClub() == null ? null : post.getClub().getId(),
            post.getClub() == null ? null : post.getClub().getName(),
            tag, post.getContent(), post.getCreatedAt()
        );
    }
}
