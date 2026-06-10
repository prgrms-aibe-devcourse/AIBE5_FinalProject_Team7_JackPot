package com.jackpot.whiskeynote.domain.admin;

import com.jackpot.whiskeynote.domain.admin.entity.WhiskeyRequestStatus;
import com.jackpot.whiskeynote.domain.admin.repository.WhiskeyRequestRepository;
import com.jackpot.whiskeynote.support.TestDataCleaner;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListFolderRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.member.entity.Role;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.support.TestDataCleaner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 위스키 등록 요청 API 통합 테스트
 * - FK 삭제 순서: wishlist_items → wishlist_folders → picks → whiskey_requests → refresh_tokens → users
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class WhiskeyRequestControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private TestDataCleaner cleaner;
    @Autowired private WhiskeyRequestRepository whiskeyRequestRepository;
    @Autowired private UsersRepository usersRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private RestClient restClient;
    private RestClient authRestClient;

    // 일반 사용자
    private static final String USER_EMAIL    = "user@whiskey.com";
    private static final String USER_PASSWORD = "password123";
    private static final String USER_NICKNAME = "일반유저";
    private static final String USER_BIRTHDAY = "1990-01-15";

    // 관리자
    private static final String ADMIN_EMAIL    = "admin@whiskey.com";
    private static final String ADMIN_PASSWORD = "password123";
    private static final String ADMIN_NICKNAME = "관리자";
    private static final String ADMIN_BIRTHDAY = "1985-06-01";

    private String userToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        authRestClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1/auth")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        // FK 순서에 맞게 삭제
        cleaner.cleanAll();

        // 일반 사용자 회원가입 → 토큰 발급
        ResponseEntity<Map> userRes = authRestClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", USER_EMAIL,
                        "password", USER_PASSWORD,
                        "nickname", USER_NICKNAME,
                        "birthday", USER_BIRTHDAY
                ))
                .retrieve()
                .toEntity(Map.class);
        userToken = (String) ((Map<?, ?>) userRes.getBody().get("data")).get("accessToken");

        // 관리자 계정 직접 생성 (회원가입은 USER 고정이므로 DB에 직접 저장)
        Users admin = Users.builder()
                .email(ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                .nickname(ADMIN_NICKNAME)
                .name("관리자")
                .birthday(LocalDate.of(1985, 6, 1))
                .role(Role.ADMIN)
                .authProvider(com.jackpot.whiskeynote.domain.member.entity.AuthProvider.LOCAL)
                .build();
        usersRepository.save(admin);

        // 관리자 로그인 → 토큰 발급
        ResponseEntity<Map> adminRes = authRestClient.post()
                .uri("/login")
                .body(Map.of("email", ADMIN_EMAIL, "password", ADMIN_PASSWORD))
                .retrieve()
                .toEntity(Map.class);
        adminToken = (String) ((Map<?, ?>) adminRes.getBody().get("data")).get("accessToken");
    }

    // ── 사용자: 등록 요청 생성 ──────────────────────────

    @Test
    @DisplayName("WH-01 | 위스키 등록 요청 생성 성공 → 200 + 요청 상세 반환")
    void createRequest_success() {
        ResponseEntity<Map> response = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of(
                        "name", "글렌피딕 21년",
                        "type", "single_malt",
                        "abv", 40.0
                )))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("status")).isEqualTo("pending");

        Map<String, Object> description = (Map<String, Object>) data.get("description");
        assertThat(description.get("name")).isEqualTo("글렌피딕 21년");
    }

    @Test
    @DisplayName("WH-01 | 로그인 없이 등록 요청 → 401")
    void createRequest_unauthorized() {
        try {
            restClient.post()
                    .uri("/whiskey-requests")
                    .body(Map.of("description", Map.of("name", "테스트 위스키")))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ── 사용자: 내 요청 목록 조회 ───────────────────────

    @Test
    @DisplayName("WH-02 | 내 요청 목록 조회 성공 → 200 + 페이지 반환")
    void getMyRequests_success() {
        // 요청 2건 생성
        restClient.post().uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "위스키A")))
                .retrieve().toBodilessEntity();

        restClient.post().uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "위스키B")))
                .retrieve().toBodilessEntity();

        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(2);
    }

    @Test
    @DisplayName("WH-02 | status 필터링 조회 → pending 건만 반환")
    void getMyRequests_withStatusFilter() {
        // pending 요청 생성
        restClient.post().uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "위스키A")))
                .retrieve().toBodilessEntity();

        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskey-requests?status=pending")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(1);
    }

    @Test
    @DisplayName("WH-02 | 잘못된 status 값 → 400")
    void getMyRequests_invalidStatus() {
        try {
            restClient.get()
                    .uri("/whiskey-requests?status=invalid")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    // ── 사용자: 요청 상세 조회 ──────────────────────────

    @Test
    @DisplayName("WH-03 | 요청 상세 조회 성공 → 200")
    void getRequest_success() {
        // 요청 생성 후 ID 추출
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "글렌피딕 21년")))
                .retrieve()
                .toEntity(Map.class);

        Long requestId = ((Number) ((Map<?, ?>) createRes.getBody().get("data")).get("requestId")).longValue();

        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskey-requests/{requestId}", requestId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("requestId")).longValue()).isEqualTo(requestId);
    }

    @Test
    @DisplayName("WH-03 | 존재하지 않는 요청 조회 → 404")
    void getRequest_notFound() {
        try {
            restClient.get()
                    .uri("/whiskey-requests/{requestId}", 99999L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ── 사용자: 요청 수정 ───────────────────────────────

    @Test
    @DisplayName("WH-04 | 요청 수정 성공 → 200 + 수정된 내용 반환")
    void updateRequest_success() {
        // 요청 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "원래 이름")))
                .retrieve()
                .toEntity(Map.class);

        Long requestId = ((Number) ((Map<?, ?>) createRes.getBody().get("data")).get("requestId")).longValue();

        // 수정
        ResponseEntity<Map> response = restClient.patch()
                .uri("/whiskey-requests/{requestId}", requestId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "수정된 이름")))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        Map<String, Object> description = (Map<String, Object>) data.get("description");
        assertThat(description.get("name")).isEqualTo("수정된 이름");
    }

    @Test
    @DisplayName("WH-04 | 다른 사람 요청 수정 → 403")
    void updateRequest_forbidden() {
        // 일반 유저2 회원가입
        ResponseEntity<Map> user2Res = authRestClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", "user2@whiskey.com",
                        "password", "password123",
                        "nickname", "유저2",
                        "birthday", "1995-03-01"
                ))
                .retrieve()
                .toEntity(Map.class);
        String user2Token = (String) ((Map<?, ?>) user2Res.getBody().get("data")).get("accessToken");

        // 일반 유저1이 요청 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "위스키")))
                .retrieve()
                .toEntity(Map.class);

        Long requestId = ((Number) ((Map<?, ?>) createRes.getBody().get("data")).get("requestId")).longValue();

        // 유저2가 수정 시도
        try {
            restClient.patch()
                    .uri("/whiskey-requests/{requestId}", requestId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + user2Token)
                    .body(Map.of("description", Map.of("name", "불법 수정")))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    // ── 사용자: 요청 삭제 ───────────────────────────────

    @Test
    @DisplayName("WH-05 | 요청 삭제 성공 → 204 + DB에서 삭제 확인")
    void deleteRequest_success() {
        // 요청 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "삭제할 위스키")))
                .retrieve()
                .toEntity(Map.class);

        Long requestId = ((Number) ((Map<?, ?>) createRes.getBody().get("data")).get("requestId")).longValue();

        // 삭제
        ResponseEntity<Void> response = restClient.delete()
                .uri("/whiskey-requests/{requestId}", requestId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(whiskeyRequestRepository.existsById(requestId)).isFalse();
    }

    // ── 관리자: 전체 목록 조회 ──────────────────────────

    @Test
    @DisplayName("ADM-01 | 관리자 전체 요청 목록 조회 성공 → 200")
    void adminGetRequests_success() {
        // 요청 2건 생성
        restClient.post().uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "위스키A")))
                .retrieve().toBodilessEntity();

        restClient.post().uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "위스키B")))
                .retrieve().toBodilessEntity();

        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(2);
    }

    @Test
    @DisplayName("ADM-01 | 일반 유저가 관리자 API 접근 → 403")
    void adminGetRequests_forbidden() {
        try {
            restClient.get()
                    .uri("/admin/whiskey-requests")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    // ── 관리자: 승인/반려 처리 ──────────────────────────

    @Test
    @DisplayName("ADM-02 | 관리자 요청 승인 성공 → 200 + status=approved")
    void adminApproveRequest_success() {
        // 요청 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "승인할 위스키")))
                .retrieve()
                .toEntity(Map.class);

        Long requestId = ((Number) ((Map<?, ?>) createRes.getBody().get("data")).get("requestId")).longValue();

        // 승인
        ResponseEntity<Map> response = restClient.patch()
                .uri("/admin/whiskey-requests/{requestId}", requestId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("status", "approved"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("status")).isEqualTo("approved");
        assertThat(data.get("reviewedByNickName")).isEqualTo(ADMIN_NICKNAME);

        // DB 확인
        assertThat(whiskeyRequestRepository.findById(requestId).get().getStatus())
                .isEqualTo(WhiskeyRequestStatus.approved);
    }

    @Test
    @DisplayName("ADM-02 | 관리자 요청 반려 성공 → 200 + status=rejected")
    void adminRejectRequest_success() {
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "반려할 위스키")))
                .retrieve()
                .toEntity(Map.class);

        Long requestId = ((Number) ((Map<?, ?>) createRes.getBody().get("data")).get("requestId")).longValue();

        ResponseEntity<Map> response = restClient.patch()
                .uri("/admin/whiskey-requests/{requestId}", requestId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("status", "rejected"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("status")).isEqualTo("rejected");
    }

    @Test
    @DisplayName("ADM-02 | 이미 처리된 요청 재처리 → 400")
    void adminReviewRequest_alreadyProcessed() {
        // 요청 생성 후 승인
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/whiskey-requests")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("description", Map.of("name", "위스키")))
                .retrieve()
                .toEntity(Map.class);

        Long requestId = ((Number) ((Map<?, ?>) createRes.getBody().get("data")).get("requestId")).longValue();

        restClient.patch()
                .uri("/admin/whiskey-requests/{requestId}", requestId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("status", "approved"))
                .retrieve()
                .toBodilessEntity();

        // 다시 처리 시도
        try {
            restClient.patch()
                    .uri("/admin/whiskey-requests/{requestId}", requestId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .body(Map.of("status", "rejected"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }
}
