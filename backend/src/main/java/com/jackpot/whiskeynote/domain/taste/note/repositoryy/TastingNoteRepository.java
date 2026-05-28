package com.jackpot.whiskeynote.domain.taste.note.repositoryy;

import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TastingNoteRepository extends JpaRepository<TastingNote, Long> {

    @EntityGraph(attributePaths = {"whiskey"})
    Optional<TastingNote> findFirstByUserIdAndWhiskeyIdAndDraftFalseOrderByUpdatedAtDesc(
            Long userId,
            Long whiskeyId
    );
}
