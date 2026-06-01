package com.jackpot.whiskeynote.domain.taste.note.repository;

import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
