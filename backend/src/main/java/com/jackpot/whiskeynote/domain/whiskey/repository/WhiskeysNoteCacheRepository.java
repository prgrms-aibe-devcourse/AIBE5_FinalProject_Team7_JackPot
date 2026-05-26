package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WhiskeysNoteCacheRepository extends JpaRepository<WhiskeysNoteCache, Long> {

    Optional<WhiskeysNoteCache> findByWhiskeyId(Long whiskeyId);
}
