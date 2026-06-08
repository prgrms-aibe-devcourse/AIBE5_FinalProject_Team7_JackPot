package com.jackpot.whiskeynote.domain.community.feed.repository;

import com.jackpot.whiskeynote.domain.community.feed.entity.ContentFeed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentFeedRepository extends JpaRepository<ContentFeed, Long> {

    Page<ContentFeed> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<ContentFeed> findTop5ByWhiskeyKeywordContainingIgnoreCaseOrderByCreatedAtDesc(String keyword);
}
