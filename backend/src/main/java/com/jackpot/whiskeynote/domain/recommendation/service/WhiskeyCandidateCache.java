package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyCandidate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 추천 후보 위스키 목록의 인메모리 TTL 캐시.
 * 후보 데이터는 사용자와 무관하고 거의 바뀌지 않으므로, 매 요청 DB 조회 대신
 * 일정 시간(TTL) 동안 메모리에서 공유한다. TTL 경과 후 첫 요청이 갱신한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WhiskeyCandidateCache {

    private static final long TTL_MILLIS = 10 * 60 * 1000L; // 10분

    private final WhiskeyCandidateProvider provider;

    private volatile List<WhiskeyCandidate> snapshot;
    private volatile long expiresAt;

    /** 앱 기동 완료 시 캐시를 미리 적재해 cold-start 시 동시 요청 몰림을 방지한다. */
    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        try {
            refresh();
            log.info("위스키 추천 후보 캐시 워밍 완료: {}건", snapshot == null ? 0 : snapshot.size());
        } catch (Exception e) {
            // 워밍 실패는 치명적이지 않음 — 첫 요청이 cold load로 채운다.
            log.warn("위스키 추천 후보 캐시 워밍 실패, 첫 요청 시 적재됨", e);
        }
    }

    public List<WhiskeyCandidate> get() {
        List<WhiskeyCandidate> current = snapshot;
        if (current != null && System.currentTimeMillis() < expiresAt) {
            return current;
        }
        return refresh();
    }

    private synchronized List<WhiskeyCandidate> refresh() {
        // 락을 기다리는 사이 다른 스레드가 이미 갱신했으면 그대로 사용 (동시 재적재 방지)
        if (snapshot != null && System.currentTimeMillis() < expiresAt) {
            return snapshot;
        }
        List<WhiskeyCandidate> loaded = provider.load();
        snapshot = loaded;
        expiresAt = System.currentTimeMillis() + TTL_MILLIS;
        return loaded;
    }
}
