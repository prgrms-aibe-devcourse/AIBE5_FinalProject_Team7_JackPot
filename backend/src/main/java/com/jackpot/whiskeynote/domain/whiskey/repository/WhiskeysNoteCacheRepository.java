package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WhiskeysNoteCacheRepository extends JpaRepository<WhiskeysNoteCache, Long> {

    Optional<WhiskeysNoteCache> findByWhiskeyId(Long whiskeyId);

    @Query("SELECT nc FROM WhiskeysNoteCache nc " +
        "LEFT JOIN FETCH nc.avgWhiskeyTags " +
        "WHERE nc.whiskey.id = :whiskeyId")
    Optional<WhiskeysNoteCache> findByWhiskeyIdWithAvgTags(@Param("whiskeyId") Long whiskeyId);
}
