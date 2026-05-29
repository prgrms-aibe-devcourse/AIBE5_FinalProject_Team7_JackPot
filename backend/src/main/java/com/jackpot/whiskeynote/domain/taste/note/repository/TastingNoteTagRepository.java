package com.jackpot.whiskeynote.domain.taste.note.repository;

import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNoteTag;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TastingNoteTagRepository extends JpaRepository<TastingNoteTag, Long> {

    @EntityGraph(attributePaths = {"tag"})
    List<TastingNoteTag> findByNote_IdOrderByTag_DisplayOrderAsc(Long noteId);
}
