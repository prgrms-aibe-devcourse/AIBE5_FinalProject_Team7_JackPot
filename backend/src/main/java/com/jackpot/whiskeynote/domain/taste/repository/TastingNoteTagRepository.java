package com.jackpot.whiskeynote.domain.taste.repository;

import com.jackpot.whiskeynote.domain.taste.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.entity.TastingNoteTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TastingNoteTagRepository extends JpaRepository<TastingNoteTag, Long> {

    List<TastingNoteTag> findAllByTastingNote(TastingNote tastingNote);
}
