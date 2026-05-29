package com.jackpot.whiskeynote.domain.taste.review.service;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.review.dto.ReviewCreateRequest;
import com.jackpot.whiskeynote.domain.taste.review.dto.ReviewUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.review.dto.WhiskeyReviewResponse;
import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
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
    private final UsersRepository usersRepository;
    private final TastingNoteRepository tastingNoteRepository;

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
    // 내가 작성한 리뷰 조회
    @Transactional(readOnly = true)
    public Page<WhiskeyReviewResponse> getMyReviews(Long userId, int page, int size) {
        if (!usersRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest)
                .map(WhiskeyReviewResponse::from);
    }
    // 리뷰 작성
    @Transactional
    public WhiskeyReviewResponse createReview(Long userId, Long whiskeyId, ReviewCreateRequest request){
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        Whiskey whiskey = whiskeyRepository.findById(whiskeyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키를 찾을 수 없습니다."));
        Long attachedNoteId = null;

        if (request.attachedNoteId() != null) {
            TastingNote note = tastingNoteRepository.findById(request.attachedNoteId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "시음 노트를 찾을 수 없습니다."
                    ));

            if (!note.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "본인의 시음 노트만 첨부할 수 있습니다."
                );
            }

            if (!note.getWhiskey().getId().equals(whiskeyId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "해당 위스키의 시음 노트만 첨부할 수 있습니다."
                );
            }

            attachedNoteId = note.getId();
        }
        Review review = Review.create(
                user,
                whiskey,
                request.rating(),
                request.publicText(),
                attachedNoteId
        );
        Review savedReview = reviewRepository.save(review);
        return WhiskeyReviewResponse.from(savedReview);
    }
    // 리뷰 수정
    @Transactional
    public WhiskeyReviewResponse updateReview(Long userId, Long reviewId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findWithUserAndWhiskeyById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."));

        if (!review.isWrittenBy(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "리뷰를 수정할 권한이 없습니다.");
        }

        review.update(request.rating(), request.publicText());
        Review updatedReview = reviewRepository.save(review);
        return WhiskeyReviewResponse.from(updatedReview);
    }
    // 리뷰 삭제
    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findWithUserAndWhiskeyById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."));
        reviewRepository.delete(review);
    }
}
