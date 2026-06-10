package com.jackpot.whiskeynote.domain.taste.review.repository;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import com.jackpot.whiskeynote.domain.taste.review.entity.ReviewLike;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ReviewRepositoryTest {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ReviewLikeRepository reviewLikeRepository;
    @Autowired private UsersRepository usersRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;

    @Test
    @DisplayName("위스키 ID로 리뷰를 최신순 페이지 조회한다")
    void findByWhiskeyIdOrderByCreatedAtDesc() {
        Users user = usersRepository.save(user("reviewer@test.com", "리뷰어"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Whiskey otherWhiskey = whiskeyRepository.save(whiskey("맥캘란 15년"));
        Review first = reviewRepository.saveAndFlush(review(user, whiskey, "첫 리뷰"));
        Review second = reviewRepository.saveAndFlush(review(user, whiskey, "두 번째 리뷰"));
        reviewRepository.saveAndFlush(review(user, otherWhiskey, "다른 위스키 리뷰"));

        Page<Review> result = reviewRepository.findByWhiskeyIdOrderByCreatedAtDesc(
                whiskey.getId(),
                PageRequest.of(0, 10)
        );

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent())
                .extracting(Review::getId)
                .containsExactly(second.getId(), first.getId());
        assertThat(result.getContent().getFirst().getUser().getNickname()).isEqualTo("리뷰어");
    }

    @Test
    @DisplayName("유저 ID로 내 리뷰를 최신순 페이지 조회한다")
    void findByUserIdOrderByCreatedAtDesc() {
        Users user = usersRepository.save(user("me@test.com", "나"));
        Users otherUser = usersRepository.save(user("other@test.com", "다른유저"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Whiskey otherWhiskey = whiskeyRepository.save(whiskey("맥캘란 15년"));
        Review first = reviewRepository.saveAndFlush(review(user, whiskey, "첫 리뷰"));
        Review second = reviewRepository.saveAndFlush(review(user, otherWhiskey, "두 번째 리뷰"));
        reviewRepository.saveAndFlush(review(otherUser, whiskey, "다른 유저 리뷰"));

        Page<Review> result = reviewRepository.findByUserIdOrderByCreatedAtDesc(
                user.getId(),
                PageRequest.of(0, 10)
        );

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent())
                .extracting(Review::getId)
                .containsExactly(second.getId(), first.getId());
        assertThat(result.getContent().getFirst().getWhiskey().getName()).isEqualTo("맥캘란 15년");
    }

    @Test
    @DisplayName("리뷰 상세 조회는 유저와 위스키를 함께 조회한다")
    void findWithUserAndWhiskeyById() {
        Users user = usersRepository.save(user("detail@test.com", "상세유저"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Review review = reviewRepository.saveAndFlush(review(user, whiskey, "상세 리뷰"));

        Optional<Review> result = reviewRepository.findWithUserAndWhiskeyById(review.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getUser().getNickname()).isEqualTo("상세유저");
        assertThat(result.get().getWhiskey().getName()).isEqualTo("글렌피딕 18년");
    }

    @Test
    @DisplayName("유저와 위스키 조합으로 리뷰 존재 여부와 유저 리뷰 수를 조회한다")
    void existsByUserIdAndWhiskeyIdAndCountByUserId() {
        Users user = usersRepository.save(user("exists@test.com", "존재유저"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        reviewRepository.saveAndFlush(review(user, whiskey, "리뷰"));

        assertThat(reviewRepository.existsByUserIdAndWhiskeyId(user.getId(), whiskey.getId())).isTrue();
        assertThat(reviewRepository.existsByUserIdAndWhiskeyId(user.getId(), 999L)).isFalse();
        assertThat(reviewRepository.countByUserId(user.getId())).isEqualTo(1);
    }

    @Test
    @DisplayName("리뷰 좋아요는 유저/리뷰 조합으로 조회, 카운트, 삭제할 수 있다")
    void reviewLikeRepositoryMethods() {
        Users user = usersRepository.save(user("like@test.com", "좋아요유저"));
        Users otherUser = usersRepository.save(user("like-other@test.com", "다른좋아요유저"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Review review = reviewRepository.saveAndFlush(review(user, whiskey, "좋아요 대상 리뷰"));
        reviewLikeRepository.saveAndFlush(ReviewLike.create(review, user));
        reviewLikeRepository.saveAndFlush(ReviewLike.create(review, otherUser));

        assertThat(reviewLikeRepository.existsByUserIdAndReviewId(user.getId(), review.getId())).isTrue();
        assertThat(reviewLikeRepository.findByUserIdAndReviewId(user.getId(), review.getId())).isPresent();
        assertThat(reviewLikeRepository.countByReviewId(review.getId())).isEqualTo(2);

        reviewLikeRepository.deleteByUserIdAndReviewId(user.getId(), review.getId());
        reviewLikeRepository.flush();

        assertThat(reviewLikeRepository.existsByUserIdAndReviewId(user.getId(), review.getId())).isFalse();
        assertThat(reviewLikeRepository.countByReviewId(review.getId())).isEqualTo(1);
    }

    private Review review(Users user, Whiskey whiskey, String publicText) {
        return Review.create(user, whiskey, BigDecimal.valueOf(4.5), publicText, null);
    }

    private Users user(String email, String nickname) {
        return Users.builder()
                .email(email)
                .passwordHash("password-hash")
                .authProvider(AuthProvider.LOCAL)
                .nickname(nickname)
                .birthday(LocalDate.of(1990, 1, 1))
                .build();
    }

    private Whiskey whiskey(String name) {
        return Whiskey.builder()
                .name(name)
                .type(WhiskeyType.single_malt)
                .abv(40.0)
                .ageYears(12)
                .status(WhiskeyStatus.active)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
