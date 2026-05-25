package com.jackpot.whiskeynote.domain.whiskey.service;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyCardResponse;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor

public class WhiskeyService {
    private final WhiskeyRepository whiskeyRepository;

    // 위스키 전체 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<WhiskeyCardResponse> getWhiskeys(int page, int size) {
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "name")
        );

        return whiskeyRepository.findAll(pageRequest)
                .map(WhiskeyCardResponse::from);
    }
    // 위스키 이름 검색 (포함검색, 대소문자 구분X)
    @Transactional(readOnly = true)
    public Page<WhiskeyCardResponse> searchWhiskeys(String q, int page, int size) {
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "name")
        );

        if (q == null || q.isBlank()) {
            return getWhiskeys(page, size);
        }

        return whiskeyRepository.findByNameContainingIgnoreCase(q.trim(), pageRequest)
                .map(WhiskeyCardResponse::from);
    }
}
