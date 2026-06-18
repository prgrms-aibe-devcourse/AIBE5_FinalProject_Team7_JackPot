package com.jackpot.whiskeynote.domain.taste.review.controller;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Role;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewLikeRepository;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ReviewController 통합 테스트
 *
 * <p>현재 Review API는 JWT 인증 객체가 아니라 userId 요청 파라미터로 작성자를 전달한다.
 * 테스트도 실제 운영 코드의 현재 계약에 맞춰 userId 파라미터를 사용한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ReviewControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ReviewLikeRepository reviewLikeRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;
    @Autowired private UsersRepository usersRepository;

    private RestClient restClient;
    private Users user;
    private Whiskey whiskey;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1")
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();

        clearDatabase();
        user = usersRepository.save(user("review-user@whiskey.com", "리뷰테스터"));
        whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
    }

    @AfterEach
    void tearDown() {
        clearDatabase();
    }

    private void clearDatabase() {
        reviewLikeRepository.deleteAll();
        reviewRepository.deleteAll();
        usersRepository.deleteAll();
        whiskeyRepository.deleteAll();
    }

    @Test
    @DisplayName("REVIEW-01 | 내 리뷰 목록 조회 → 200 + 내가 쓴 리뷰 반환")
    void getMyReviews_success() {
        reviewRepository.save(Review.create(
                user,
                whiskey,
                BigDecimal.valueOf(4.5),
                "부드럽고 달콤한 리뷰",
                null
        ));

        ResponseEntity<Map> response = restClient.get()
                .uri("/reviews?userId={userId}&page=0&size=10", user.getId())
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = response.getBody();
        List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat((int) data.get("totalElements")).isEqualTo(1);
        assertThat(content.get(0).get("whiskeyName")).isEqualTo("글렌피딕 18년");
        assertThat(content.get(0).get("publicText")).isEqualTo("부드럽고 달콤한 리뷰");
    }

    @Test
    @DisplayName("REVIEW-01 | 존재하지 않는 사용자의 리뷰 목록 조회 → 404")
    void getMyReviews_userNotFound() {
        try {
            restClient.get()
                    .uri("/reviews?userId={userId}", 99999L)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(e.getResponseBodyAsString()).contains("사용자를 찾을 수 없습니다.");
        }
    }

    @Test
    @DisplayName("REVIEW-02 | 위스키별 리뷰 목록 조회 → 200 + 해당 위스키 리뷰 반환")
    void getWhiskeyReviews_success() {
        reviewRepository.save(Review.create(
                user,
                whiskey,
                BigDecimal.valueOf(4.0),
                "향이 좋습니다.",
                null
        ));

        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskeys/{whiskeyId}/reviews?userId={userId}&page=0&size=5", whiskey.getId(), user.getId())
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = response.getBody();
        List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat((int) data.get("totalElements")).isEqualTo(1);
        assertThat(content.get(0).get("whiskeyId")).isEqualTo(whiskey.getId().intValue());
        assertThat(content.get(0).get("nickname")).isEqualTo("리뷰테스터");
    }

    @Test
    @DisplayName("REVIEW-03 | 리뷰 작성 → 201 + 생성된 리뷰 반환")
    void createReview_success() {
        Map<String, Object> request = Map.of(
                "rating", 4.5,
                "publicText", "다시 마시고 싶은 위스키입니다."
        );

        ResponseEntity<Map> response = restClient.post()
                .uri("/whiskeys/{whiskeyId}/reviews?userId={userId}", whiskey.getId(), user.getId())
                .body(request)
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = response.getBody();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(data.get("whiskeyName")).isEqualTo("글렌피딕 18년");
        assertThat(data.get("publicText")).isEqualTo("다시 마시고 싶은 위스키입니다.");
        assertThat(reviewRepository.existsByUserIdAndWhiskeyId(user.getId(), whiskey.getId())).isTrue();
    }

    @Test
    @DisplayName("REVIEW-03 | 같은 사용자가 같은 위스키에 리뷰 중복 작성 → 409")
    void createReview_duplicate() {
        reviewRepository.save(Review.create(
                user,
                whiskey,
                BigDecimal.valueOf(4.0),
                "이미 작성한 리뷰",
                null
        ));

        Map<String, Object> request = Map.of(
                "rating", 3.5,
                "publicText", "중복 리뷰"
        );

        try {
            restClient.post()
                    .uri("/whiskeys/{whiskeyId}/reviews?userId={userId}", whiskey.getId(), user.getId())
                    .body(request)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(e.getResponseBodyAsString()).contains("이미 이 위스키에 작성한 리뷰가 있습니다.");
        }
    }

    @Test
    @DisplayName("REVIEW-04 | 리뷰 수정 → 200 + 수정된 리뷰 반환")
    void updateReview_success() {
        Review review = reviewRepository.save(Review.create(
                user,
                whiskey,
                BigDecimal.valueOf(4.0),
                "수정 전 리뷰",
                null
        ));
        Map<String, Object> request = Map.of(
                "rating", 5.0,
                "publicText", "수정 후 리뷰"
        );

        ResponseEntity<Map> response = restClient.patch()
                .uri("/reviews/{reviewId}?userId={userId}", review.getId(), user.getId())
                .body(request)
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = response.getBody();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(data.get("publicText")).isEqualTo("수정 후 리뷰");
        assertThat(data.get("rating").toString()).isEqualTo("5.0");
    }

    @Test
    @DisplayName("REVIEW-04 | 다른 사용자가 리뷰 수정 → 403")
    void updateReview_forbidden() {
        Review review = reviewRepository.save(Review.create(
                user,
                whiskey,
                BigDecimal.valueOf(4.0),
                "작성자 리뷰",
                null
        ));
        Users otherUser = usersRepository.save(user("other-reviewer@whiskey.com", "다른리뷰어"));
        Map<String, Object> request = Map.of(
                "rating", 2.0,
                "publicText", "다른 사용자의 수정 시도"
        );

        try {
            restClient.patch()
                    .uri("/reviews/{reviewId}?userId={userId}", review.getId(), otherUser.getId())
                    .body(request)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(e.getResponseBodyAsString()).contains("리뷰를 수정할 권한이 없습니다.");
        }
    }

    @Test
    @DisplayName("REVIEW-05 | 리뷰 삭제 → 204 + DB에서 삭제")
    void deleteReview_success() {
        Review review = reviewRepository.save(Review.create(
                user,
                whiskey,
                BigDecimal.valueOf(4.0),
                "삭제할 리뷰",
                null
        ));

        ResponseEntity<Void> response = restClient.delete()
                .uri("/reviews/{reviewId}?userId={userId}", review.getId(), user.getId())
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(reviewRepository.existsById(review.getId())).isFalse();
    }

    private Users user(String email, String nickname) {
        return Users.builder()
                .email(email)
                .passwordHash("encoded-password")
                .authProvider(AuthProvider.LOCAL)
                .providerId(null)
                .nickname(nickname)
                .birthday(LocalDate.of(1990, 1, 1))
                .role(Role.USER)
                .isEmailVerified(true)
                .deleted(false)
                .build();
    }

    private Whiskey whiskey(String name) {
        return Whiskey.builder()
                .name(name)
                .type(WhiskeyType.single_malt)
                .abv(40.0)
                .ageYears(18)
                .status(WhiskeyStatus.active)
                .country("Scotland")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
