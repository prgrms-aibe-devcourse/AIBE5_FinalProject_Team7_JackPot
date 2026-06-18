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

    @Query("SELECT n FROM TastingNote n LEFT JOIN FETCH n.noteTags WHERE n.id = :noteId")
    Optional<TastingNote> findByIdWithTags(@Param("noteId") Long noteId);

    @EntityGraph(attributePaths = {"whiskey"})
    Optional<TastingNote> findFirstByUserIdAndWhiskeyIdAndIsDraftFalseOrderByUpdatedAtDesc(
            Long userId, Long whiskeyId);

    @EntityGraph(attributePaths = {"whiskey", "noteTags", "noteTags.tag"})
    Page<TastingNote> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    // 유저 매칭용 — 공개 노트 전체 (태그 포함)
    @Query("SELECT n FROM TastingNote n JOIN FETCH n.noteTags nt JOIN FETCH nt.tag WHERE n.user.id = :userId AND n.isDraft = false")
    List<TastingNote> findAllByUserIdAndIsDraftFalseWithTags(@Param("userId") Long userId);

    Long countByUserId(Long userId);
}
