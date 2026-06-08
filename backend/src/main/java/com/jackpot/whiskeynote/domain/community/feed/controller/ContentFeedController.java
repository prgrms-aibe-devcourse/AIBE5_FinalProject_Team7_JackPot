package com.jackpot.whiskeynote.domain.community.feed.controller;

import com.jackpot.whiskeynote.domain.community.feed.dto.ContentFeedRequest;
import com.jackpot.whiskeynote.domain.community.feed.dto.ContentFeedResponse;
import com.jackpot.whiskeynote.domain.community.feed.service.ContentFeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ContentFeedController {

    private final ContentFeedService feedService;

    /** 크롤러가 수집한 칼럼/영상 데이터 등록 (관리자 전용) */
    @PostMapping("/api/v1/admin/feeds")
    @ResponseStatus(HttpStatus.CREATED)
    public ContentFeedResponse createFeed(@RequestBody ContentFeedRequest request) {
        return feedService.save(request);
    }

    /** 전체 피드 목록 조회 */
    @GetMapping("/api/v1/feeds")
    public Page<ContentFeedResponse> getFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return feedService.getFeeds(page, size);
    }

    /** 피드 단건 조회 */
    @GetMapping("/api/v1/feeds/{id}")
    public ContentFeedResponse getFeed(@PathVariable Long id) {
        return feedService.getFeed(id);
    }

    /** 위스키 이름 기반 관련 칼럼 피드 조회 */
    @GetMapping("/api/v1/feeds/related")
    public List<ContentFeedResponse> getRelatedFeeds(@RequestParam String keyword) {
        return feedService.getRelatedFeeds(keyword);
    }
}
