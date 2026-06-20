package com.jackpot.whiskeynote.domain.taste.note.repository;

import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TastingNoteRepository extends JpaRepository<TastingNote, Long> {

    @Query("SELECT n FROM TastingNote n " +
        "LEFT JOIN FETCH n.noteTags " +
        "WHERE n.id = :noteId")
    Optional<TastingNote> findByIdWithTags(@Param("noteId") Long noteId);
    // 유저가 특정 위스키에 대해 작성한 가장 최신의 공개된 테이스팅 노트를 조회하는 메서드
    @EntityGraph(attributePaths = {"whiskey"})
    Optional<TastingNote> findFirstByUserIdAndWhiskeyIdAndIsDraftFalseOrderByUpdatedAtDesc(
            Long userId,
            Long whiskeyId
    );
    // 내 노트 목록 조회
    @EntityGraph(attributePaths = {"whiskey", "noteTags", "noteTags.tag"})
    Page<TastingNote> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    // 유저 매칭용 — 공개 노트 전체 (태그 포함)
    @Query("SELECT n FROM TastingNote n JOIN FETCH n.noteTags nt JOIN FETCH nt.tag WHERE n.user.id = :userId AND n.isDraft = false")
    List<TastingNote> findAllByUserIdAndIsDraftFalseWithTags(@Param("userId") Long userId);

    // 타인 공개 노트 목록 조회 (isDraft=false만)
    @EntityGraph(attributePaths = {"whiskey", "noteTags", "noteTags.tag"})
    Page<TastingNote> findByUserIdAndIsDraftFalseOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    //캐비넷 노트 수 집계용
    Long countByUserId(Long userId);
}
