package com.pickelton.backend.community.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.community.dto.CommunityPostResponse;
import com.pickelton.backend.community.dto.CreatePostRequest;
import com.pickelton.backend.community.entity.Post;
import com.pickelton.backend.community.repository.PostRepository;
import com.pickelton.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityService {

    private final PostRepository postRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public PageResponse<CommunityPostResponse> getFeed(int page, int size) {
        var posts = postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
            .map(CommunityPostResponse::from);
        return PageResponse.of(posts);
    }

    public CommunityPostResponse createPost(CreatePostRequest request) {
        User author = currentUserService.getCurrentUser();
        Map<String, Object> metadata = new LinkedHashMap<>();
        if (request.tag() != null && !request.tag().isBlank()) {
            metadata.put("tag", request.tag().trim());
        }
        Post post = Post.builder()
            .user(author)
            .content(request.content().trim())
            .metadata(metadata)
            .build();
        return CommunityPostResponse.from(postRepository.save(post));
    }

    public void deletePost(UUID postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!post.getUser().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("You can only delete your own posts");
        }
        postRepository.delete(post);
    }
}
