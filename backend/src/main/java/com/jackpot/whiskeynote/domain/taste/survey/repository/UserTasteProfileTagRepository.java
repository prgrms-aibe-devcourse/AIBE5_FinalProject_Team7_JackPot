package com.jackpot.whiskeynote.domain.taste.survey.repository;

import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfileTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserTasteProfileTagRepository extends JpaRepository<UserTasteProfileTag, Long> {

    // 특정 프로필의 모든 태그 조회 (Tag FETCH JOIN으로 N+1 방지)
    @Query("SELECT t FROM UserTasteProfileTag t JOIN FETCH t.tag WHERE t.profile.id = :profileId")
    List<UserTasteProfileTag> findByProfileId(@Param("profileId") Long profileId);

    // 유저 매칭용 — 여러 프로필의 태그를 한 번에 조회 (N+1 방지)
    @Query("SELECT t FROM UserTasteProfileTag t JOIN FETCH t.tag WHERE t.profile.id IN :profileIds")
    List<UserTasteProfileTag> findByProfileIdIn(@Param("profileIds") java.util.Collection<Long> profileIds);

    // 향(nose) 태그만 조회
    @Query("SELECT t FROM UserTasteProfileTag t JOIN FETCH t.tag WHERE t.profile.id = :profileId AND t.category = 'nose'")
    List<UserTasteProfileTag> findNoseTagsByProfileId(@Param("profileId") Long profileId);

    // 맛(taste) 태그만 조회
    @Query("SELECT t FROM UserTasteProfileTag t JOIN FETCH t.tag WHERE t.profile.id = :profileId AND t.category = 'taste'")
    List<UserTasteProfileTag> findTasteTagsByProfileId(@Param("profileId") Long profileId);

    // 카테고리별 조회 (내부용)
    List<UserTasteProfileTag> findByProfileIdAndCategory(Long profileId, String category);

    // 프로필 태그 전체 삭제 (재저장 시 사용)
    void deleteByProfileId(Long profileId);
}
