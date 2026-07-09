package com.pickelton.backend.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pickelton.backend.user.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleSubject(String googleSubject);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumberAndIdNot(String phoneNumber, UUID id);

    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN ClubMember cm ON cm.user = u
        WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(u.city) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(cm.club.name) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY u.name ASC
        """)
    java.util.List<User> searchByNameEmailOrPhone(@Param("query") String query, Pageable pageable);
}
