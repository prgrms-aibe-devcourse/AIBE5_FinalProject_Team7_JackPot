package com.jackpot.whiskeynote.domain.taste.review.service;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.review.dto.ReviewLikeResponse;
import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import com.jackpot.whiskeynote.domain.taste.review.entity.ReviewLike;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewLikeRepository;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReviewLikeService {

    private final ReviewRepository reviewRepository;
    private final UsersRepository usersRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    // 리뷰 좋아요
    @Transactional
    public ReviewLikeResponse likeReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "리뷰를 찾을 수 없습니다."
                ));
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "사용자를 찾을 수 없습니다."
                ));

        if(reviewLikeRepository.existsByUserIdAndReviewId(userId,reviewId)){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이미 좋아요를 눌렀습니다."
            );
        }
        ReviewLike reviewLike = ReviewLike.create(review,user);
        reviewLikeRepository.save(reviewLike);

        return getReviewLikeStatus(reviewId,userId);
    }
    // 리뷰 좋아요 취소
    @Transactional
    public ReviewLikeResponse unlikeReview(Long reviewId, Long userId) {
        if(!reviewRepository.existsById(reviewId)){
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "리뷰를 찾을 수 없습니다."
            );
        }
        if(!usersRepository.existsById(userId)){
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "사용자를 찾을 수 없습니다."
            );
        }
        if(!reviewLikeRepository.existsByUserIdAndReviewId(userId,reviewId)){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "좋아요를 누르지 않았습니다."
            );
        }

        reviewLikeRepository.deleteByUserIdAndReviewId(userId,reviewId);

        return getReviewLikeStatus(reviewId,userId);
    }

    @Transactional(readOnly = true)
    public ReviewLikeResponse getReviewLikeStatus(Long reviewId, Long userId) {
        if(!reviewRepository.existsById(reviewId)){
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "리뷰를 찾을 수 없습니다."
            );
        }

        long likeCount = reviewLikeRepository.countByReviewId(reviewId);
        boolean likedByme = userId != null && reviewLikeRepository.existsByUserIdAndReviewId(userId,reviewId);

        return new ReviewLikeResponse(reviewId, likeCount, likedByme);
    }
}
