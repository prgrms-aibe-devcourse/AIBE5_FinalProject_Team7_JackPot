package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvgWhiskeyTagRepository extends JpaRepository<AvgWhiskeyTag, Long> {

    List<AvgWhiskeyTag> findByCacheIdOrderByCountDesc(Long cacheId);

    Optional<AvgWhiskeyTag> findByCacheAndTag(WhiskeysNoteCache cache, Tag tag);
}
