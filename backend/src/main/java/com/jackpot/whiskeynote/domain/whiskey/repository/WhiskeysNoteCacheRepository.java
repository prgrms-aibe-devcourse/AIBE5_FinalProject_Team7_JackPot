package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface WhiskeysNoteCacheRepository extends JpaRepository<WhiskeysNoteCache, Long> {

    Optional<WhiskeysNoteCache> findByWhiskeyId(Long whiskeyId);

    @Query("SELECT nc FROM WhiskeysNoteCache nc " +
        "LEFT JOIN FETCH nc.avgWhiskeyTags at " +
        "LEFT JOIN FETCH at.tag " +
        "WHERE nc.whiskey.id = :whiskeyId")
    Optional<WhiskeysNoteCache> findByWhiskeyIdWithAvgTags(@Param("whiskeyId") Long whiskeyId);

    @Query("SELECT nc FROM WhiskeysNoteCache nc LEFT JOIN FETCH nc.avgWhiskeyTags awt LEFT JOIN FETCH awt.tag LEFT JOIN FETCH nc.whiskey")
    List<WhiskeysNoteCache> findAllWithTagsAndWhiskey();

    @Query("SELECT nc " +
        "FROM WhiskeysNoteCache nc " +
        "LEFT JOIN FETCH nc.avgWhiskeyTags " +
        "JOIN FETCH nc.whiskey " +
        "WHERE nc.whiskey.id IN :whiskeyIds")
    List<WhiskeysNoteCache> findAllByWhiskeyIdWithTags(@Param("whiskeyIds") Collection<Long> whiskeyId);
}
