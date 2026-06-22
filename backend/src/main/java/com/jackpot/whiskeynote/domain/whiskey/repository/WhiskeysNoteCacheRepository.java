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
        "LEFT JOIN FETCH nc.whiskey w " +
        "WHERE w.id = :whiskeyId")
    Optional<WhiskeysNoteCache> findByWhiskeyIdWithAvgTags(@Param("whiskeyId") Long whiskeyId);

    @Query("SELECT nc FROM WhiskeysNoteCache nc " +
        "LEFT JOIN FETCH nc.avgWhiskeyTags at " +
        "LEFT JOIN FETCH at.tag " +
        "LEFT JOIN FETCH nc.whiskey w " +
        "WHERE w.id IN :whiskeyIds")
    List<WhiskeysNoteCache> findAllWithTagsAndWhiskey(@Param("whiskeyIds") Collection<Long> whiskeyIds);

    @Query("SELECT nc FROM WhiskeysNoteCache nc LEFT JOIN FETCH nc.avgWhiskeyTags awt LEFT JOIN FETCH awt.tag LEFT JOIN FETCH nc.whiskey")
    List<WhiskeysNoteCache> findAllWithTagsAndWhiskey();

    @Query("""
    SELECT nc FROM WhiskeysNoteCache nc
    LEFT JOIN FETCH nc.avgWhiskeyTags awt
    LEFT JOIN FETCH awt.tag
    LEFT JOIN FETCH nc.whiskey w
    WHERE (:ageMin IS NULL OR COALESCE(w.ageYears, 0) >= :ageMin)
      AND (:ageMax IS NULL OR COALESCE(w.ageYears, 0) <= :ageMax)
    """)
    List<WhiskeysNoteCache> findAllWithTagsAndWhiskeyInAgeRange(
        @Param("ageMin") Integer ageMin,
        @Param("ageMax") Integer ageMax);

    // TODO: 현재 위스키의 cachenote의 값이 비어있는 경우를 처리하지 않고 있음.
    @Query("SELECT nc " +
        "FROM WhiskeysNoteCache nc " +
        "LEFT JOIN FETCH nc.avgWhiskeyTags " +
        "JOIN FETCH nc.whiskey " +
        "WHERE nc.whiskey.id IN :whiskeyIds")
    List<WhiskeysNoteCache> findAllByWhiskeyIdWithTags(@Param("whiskeyIds") Collection<Long> whiskeyId);
}
