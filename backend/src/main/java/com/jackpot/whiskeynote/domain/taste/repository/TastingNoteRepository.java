package com.jackpot.whiskeynote.domain.taste.repository;

import com.jackpot.whiskeynote.domain.taste.entity.TastingNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TastingNoteRepository extends JpaRepository<TastingNote, Long> {

    @Query("SELECT n FROM TastingNote n " +
        "LEFT JOIN FETCH n.noteTags " +
        "WHERE n.id = :noteId")
    Optional<TastingNote> findByIdWithTags(@Param("noteId") Long noteId);
}
