package com.pickelton.backend.community.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.community.dto.CommunityPostResponse;
import com.pickelton.backend.community.dto.TournamentPostRequest;
import com.pickelton.backend.community.entity.Post;
import com.pickelton.backend.community.repository.PostRepository;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
import com.pickelton.backend.match.entity.MatchState;
import com.pickelton.backend.match.entity.TournamentMatch;
import com.pickelton.backend.match.repository.MatchParticipantRepository;
import com.pickelton.backend.match.repository.MatchStateRepository;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// A tournament's own feed. Anyone can read it; the host and registered players post. The host posts
// announcements, can pin one post and remove any post. Finished matches post their result automatically.
@Service
@RequiredArgsConstructor
@Transactional
public class TournamentFeedService {

    public static final String ANNOUNCEMENT = "ANNOUNCEMENT";
    public static final String PLAYER = "PLAYER";
    public static final String RESULT = "RESULT";

    private final PostRepository postRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final MatchParticipantRepository participantRepository;
    private final MatchStateRepository matchStateRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public PageResponse<CommunityPostResponse> getFeed(UUID tournamentId, int page, int size) {
        requireTournament(tournamentId);
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));
        return PageResponse.of(postRepository.findByTournamentIdOrderByPinnedDescCreatedAtDesc(tournamentId, pageable)
            .map(CommunityService::toResponse));
    }

    public CommunityPostResponse createPost(UUID tournamentId, TournamentPostRequest request) {
        Tournament tournament = requireTournament(tournamentId);
        User author = currentUserService.getCurrentUser();
        boolean host = isHost(tournament, author.getId());
        if (!host && !registrationRepository.existsByTournamentIdAndUserIdAndStatus(tournamentId, author.getId(), RegistrationStatus.REGISTERED)) {
            throw new ForbiddenException("Only the host and registered players can post in this tournament's feed");
        }
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("tag", host ? ANNOUNCEMENT : PLAYER);
        // saveAndFlush so the database fills in createdAt before we return the post.
        return CommunityService.toResponse(postRepository.saveAndFlush(Post.builder()
            .user(author)
            .tournament(tournament)
            .content(request.content().trim())
            .metadata(metadata)
            .build()));
    }

    // Pinning a post unpins the one pinned before, so the feed has at most one.
    public CommunityPostResponse setPinned(UUID tournamentId, UUID postId, boolean pinned) {
        Tournament tournament = requireTournament(tournamentId);
        requireHost(tournament);
        Post post = requirePost(tournamentId, postId);
        if (pinned) {
            postRepository.findByTournamentIdAndPinnedTrue(tournamentId).forEach(other -> other.setPinned(false));
        }
        post.setPinned(pinned);
        return CommunityService.toResponse(postRepository.save(post));
    }

    public void deletePost(UUID tournamentId, UUID postId) {
        Tournament tournament = requireTournament(tournamentId);
        Post post = requirePost(tournamentId, postId);
        UUID userId = currentUserService.getUserId();
        if (!post.getUser().getId().equals(userId) && !isHost(tournament, userId)) {
            throw new ForbiddenException("Only the author or the host can delete this post");
        }
        postRepository.delete(post);
    }

    // Called when a tournament match is completed (or its score corrected). Posts as the host; updates the
    // existing result post for the match instead of adding another one.
    public void recordResult(TournamentMatch link) {
        Match match = link.getMatch();
        if (match.getWinner() == null) {
            return;
        }
        List<MatchParticipant> players = participantRepository.findByMatchIdAndRole(match.getId(), ParticipantRole.PLAYER);
        String winnerTeam = players.stream().filter(player -> player.getUser().getId().equals(match.getWinner().getId()))
            .map(MatchParticipant::getTeam).findFirst().orElse(null);
        if (winnerTeam == null) {
            return;
        }
        String loserTeam = "A".equalsIgnoreCase(winnerTeam) ? "B" : "A";
        String score = score(matchStateRepository.findByMatchId(match.getId()).orElse(null), winnerTeam, loserTeam);
        StringBuilder content = new StringBuilder()
            .append(names(players, winnerTeam)).append(" beat ").append(names(players, loserTeam));
        if (!score.isEmpty()) {
            content.append(' ').append(score);
        }
        if (link.getCategory() != null) {
            content.append(" · ").append(link.getCategory().getName());
        }
        if (match.getRound() != null && !match.getRound().isBlank()) {
            content.append(" · ").append(match.getRound());
        }

        Tournament tournament = link.getTournament();
        Post post = postRepository.findResultPost(tournament.getId(), match.getId().toString())
            .orElseGet(() -> {
                Map<String, Object> metadata = new LinkedHashMap<>();
                metadata.put("tag", RESULT);
                metadata.put("matchId", match.getId().toString());
                return Post.builder().user(tournament.getCreatedBy()).tournament(tournament).metadata(metadata).build();
            });
        post.setContent(content.toString());
        postRepository.save(post);
    }

    private static String names(List<MatchParticipant> players, String team) {
        // Alphabetical, matching how the leaderboard names a pair.
        return players.stream().filter(player -> team.equalsIgnoreCase(player.getTeam()))
            .map(player -> player.getUser().getName()).sorted(String.CASE_INSENSITIVE_ORDER).collect(Collectors.joining(" / "));
    }

    // "11–7" for one game, "11–7, 9–11, 11–5" for several, always from the winner's side.
    private static String score(MatchState state, String winner, String loser) {
        if (state == null) {
            return "";
        }
        List<String> games = new java.util.ArrayList<>();
        for (Map<String, Object> set : state.getSetSummary()) {
            Map<?, ?> game = set.get("score") instanceof Map<?, ?> nested ? nested : set;
            games.add(number(game.get(winner)) + "–" + number(game.get(loser)));
        }
        int current = number(state.getCurrentScore().get(winner)) + number(state.getCurrentScore().get(loser));
        if (current > 0) {
            games.add(number(state.getCurrentScore().get(winner)) + "–" + number(state.getCurrentScore().get(loser)));
        }
        return String.join(", ", games);
    }

    private static int number(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return value == null ? 0 : Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private boolean isHost(Tournament tournament, UUID userId) {
        return tournament.getCreatedBy().getId().equals(userId);
    }

    private void requireHost(Tournament tournament) {
        if (!isHost(tournament, currentUserService.getUserId())) {
            throw new ForbiddenException("Only the host can pin posts");
        }
    }

    private Tournament requireTournament(UUID id) {
        return tournamentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private Post requirePost(UUID tournamentId, UUID postId) {
        return postRepository.findById(postId)
            .filter(post -> post.getTournament() != null && post.getTournament().getId().equals(tournamentId))
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }
}
