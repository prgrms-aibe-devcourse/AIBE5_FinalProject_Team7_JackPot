package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvgWhiskeyTagRepository extends JpaRepository<AvgWhiskeyTag, Long> {

    List<AvgWhiskeyTag> findByCacheIdOrderByCountDesc(Long cacheId);
}
