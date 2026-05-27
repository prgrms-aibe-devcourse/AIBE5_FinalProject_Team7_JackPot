package com.jackpot.whiskeynote.domain.taste.review.service;

import com.jackpot.whiskeynote.domain.taste.review.dto.WhiskeyReviewResponse;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final WhiskeyRepository whiskeyRepository;

    @Transactional(readOnly = true)
    public Page<WhiskeyReviewResponse> getReviewsByWhiskey(Long whiskeyId, int page, int size) {
        if(!whiskeyRepository.existsById(whiskeyId)){
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "위스키를 찾을 수 없습니다."
            );
        }
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return reviewRepository.findByWhiskeyIdOrderByCreatedAtDesc(whiskeyId, pageRequest)
                .map(WhiskeyReviewResponse::from);
    }
}
