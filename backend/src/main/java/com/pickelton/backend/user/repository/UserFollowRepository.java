package com.pickelton.backend.user.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pickelton.backend.user.entity.UserFollow;

public interface UserFollowRepository extends JpaRepository<UserFollow, UserFollow.Id> {

    // Ranks people the user recently played with first, then players in the same city, then everyone else.
    @Query(value = """
        WITH recent AS (
            SELECT other.user_id, MAX(m.updated_at) AS last_played
            FROM match_participants mine
            JOIN matches m ON m.id = mine.match_id
            JOIN match_participants other ON other.match_id = m.id AND other.role = 'PLAYER' AND other.user_id <> :userId
            WHERE mine.user_id = :userId AND mine.role = 'PLAYER'
            GROUP BY other.user_id
        )
        SELECT u.id AS "userId", u.name AS "name", u.avatar_url AS "avatarUrl", u.city AS "city",
               to_char(recent.last_played AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "lastPlayedAt",
               (f.follower_id IS NOT NULL) AS "following",
               CASE WHEN recent.last_played IS NOT NULL THEN 'RECENT_PLAYER'
                    WHEN me.city IS NOT NULL AND LOWER(me.city) = LOWER(u.city) THEN 'NEARBY'
                    ELSE 'COMMUNITY' END AS "reason"
        FROM users u
        JOIN users me ON me.id = :userId
        LEFT JOIN recent ON recent.user_id = u.id
        LEFT JOIN user_follows f ON f.follower_id = :userId AND f.followed_id = u.id
        WHERE u.id <> :userId
        ORDER BY (recent.last_played IS NOT NULL) DESC, recent.last_played DESC NULLS LAST,
                 COALESCE(LOWER(me.city) = LOWER(u.city), FALSE) DESC, u.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<SuggestionRow> findSuggestions(@Param("userId") UUID userId, @Param("limit") int limit);

    interface SuggestionRow {
        UUID getUserId();
        String getName();
        String getAvatarUrl();
        String getCity();
        String getLastPlayedAt();
        Boolean getFollowing();
        String getReason();
    }
}
