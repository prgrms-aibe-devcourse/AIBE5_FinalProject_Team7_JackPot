package com.jackpot.whiskeynote.domain.activity.repository;

import com.jackpot.whiskeynote.domain.activity.entity.WhiskeyViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WhiskeyViewLogRepository extends JpaRepository<WhiskeyViewLog, Long> {

    @Query("SELECT wvl " +
        "FROM WhiskeyViewLog wvl " +
        "LEFT JOIN FETCH wvl.whiskey w " +
        "WHERE wvl.user.id = :userId")
    List<WhiskeyViewLog> findAllByUserIdWithWhiskey(@Param("userId") Long userId);
}
