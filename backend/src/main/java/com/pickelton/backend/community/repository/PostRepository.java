package com.pickelton.backend.community.repository;

import java.util.UUID;

import com.pickelton.backend.community.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, UUID> {

    // The main community feed leaves out tournament feed posts.
    Page<Post> findByTournamentIsNullOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByTournamentIdOrderByPinnedDescCreatedAtDesc(UUID tournamentId, Pageable pageable);

    List<Post> findByTournamentIdAndPinnedTrue(UUID tournamentId);

    // The automatic result post for a match, so a corrected score updates it instead of posting twice.
    @Query(value = "SELECT * FROM posts WHERE tournament_id = :tournamentId AND metadata_json ->> 'matchId' = :matchId LIMIT 1",
        nativeQuery = true)
    Optional<Post> findResultPost(@Param("tournamentId") UUID tournamentId, @Param("matchId") String matchId);

    Page<Post> findByClubIdOrderByCreatedAtDesc(UUID clubId, Pageable pageable);
}
