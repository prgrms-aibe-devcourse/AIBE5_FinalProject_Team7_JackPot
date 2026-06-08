package com.jackpot.whiskeynote.domain.community.feed.service;

import com.jackpot.whiskeynote.domain.community.feed.dto.ContentFeedRequest;
import com.jackpot.whiskeynote.domain.community.feed.dto.ContentFeedResponse;
import com.jackpot.whiskeynote.domain.community.feed.entity.ContentFeed;
import com.jackpot.whiskeynote.domain.community.feed.repository.ContentFeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ContentFeedService {

    private final ContentFeedRepository feedRepository;

    @Transactional
    public ContentFeedResponse save(ContentFeedRequest req) {
        ContentFeed feed = ContentFeed.create(
                req.sourceType(),
                req.title(),
                req.url(),
                req.thumbnailUrl(),
                req.description(),
                req.whiskeyKeyword(),
                req.publishedAt()
        );
        return ContentFeedResponse.from(feedRepository.save(feed));
    }

    @Transactional(readOnly = true)
    public ContentFeedResponse getFeed(Long id) {
        return feedRepository.findById(id)
                .map(ContentFeedResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Feed not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<ContentFeedResponse> getFeeds(int page, int size) {
        return feedRepository.findAllByOrderByPublishedAtDescCreatedAtDesc(PageRequest.of(page, size))
                .map(ContentFeedResponse::from);
    }

    @Transactional(readOnly = true)
    public List<ContentFeedResponse> getRelatedFeeds(String whiskeyName) {
        return feedRepository
                .findTop5ByWhiskeyKeywordContainingIgnoreCaseOrderByCreatedAtDesc(whiskeyName)
                .stream()
                .map(ContentFeedResponse::from)
                .toList();
    }
}
