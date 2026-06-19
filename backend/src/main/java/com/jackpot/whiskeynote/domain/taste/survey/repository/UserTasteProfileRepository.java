package com.jackpot.whiskeynote.domain.taste.survey.repository;

import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserTasteProfileRepository extends JpaRepository<UserTasteProfile, Long> {
    Optional<UserTasteProfile> findByUserId(Long userId);

    // 전체 tag에 대해 1회 조회 후 진행한다고 가정. 그렇지 않으면 N+1 문제 발생함.
    @Query("SELECT p FROM UserTasteProfile p " +
        "LEFT JOIN FETCH p.tags pt " +
        "WHERE p.userId = :userId ")
    Optional<UserTasteProfile> findByUserIdWithTags(@Param("userId") Long userId);
}
