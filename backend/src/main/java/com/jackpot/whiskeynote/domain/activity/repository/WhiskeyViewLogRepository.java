package com.jackpot.whiskeynote.domain.activity.repository;

import com.jackpot.whiskeynote.domain.activity.entity.WhiskeyViewLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhiskeyViewLogRepository extends JpaRepository<WhiskeyViewLog, Long> {
}
