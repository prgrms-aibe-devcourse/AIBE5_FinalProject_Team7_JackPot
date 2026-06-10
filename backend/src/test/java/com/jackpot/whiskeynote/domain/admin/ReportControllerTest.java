package com.jackpot.whiskeynote.domain.admin;

import com.jackpot.whiskeynote.domain.admin.entity.ReportStatus;
import com.jackpot.whiskeynote.domain.admin.repository.ReportActionsRepository;
import com.jackpot.whiskeynote.domain.admin.repository.ReportsRepository;
import com.jackpot.whiskeynote.domain.admin.repository.WhiskeyRequestRepository;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListFolderRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostCategory;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;
import com.jackpot.whiskeynote.domain.community.post.repository.PostRepository;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
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
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 신고 API 통합 테스트
 * FK 삭제 순서: wishlist_items → wishlist_folders → picks
 *   → whiskey_requests → report_actions → reports
 *   → refresh_tokens → users → posts
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ReportControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private TestDataCleaner cleaner;
    @Autowired private ReportsRepository reportsRepository;
    @Autowired private ReportActionsRepository reportActionsRepository;
    @Autowired private UsersRepository usersRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private RestClient restClient;
    private RestClient authRestClient;

    private static final String USER_EMAIL    = "user@report.com";
    private static final String USER_PASSWORD = "password123";
    private static final String USER_NICKNAME = "신고유저";

    private static final String ADMIN_EMAIL    = "admin@report.com";
    private static final String ADMIN_PASSWORD = "password123";
    private static final String ADMIN_NICKNAME = "관리자";

    private String userToken;
    private String adminToken;
    private Long postId;

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

        cleaner.cleanAll();
        postRepository.deleteAll();

        // 일반 유저 회원가입 → 토큰 발급
        ResponseEntity<Map> userRes = authRestClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", USER_EMAIL,
                        "password", USER_PASSWORD,
                        "nickname", USER_NICKNAME,
                        "birthday", "1990-01-15"
                ))
                .retrieve()
                .toEntity(Map.class);
        userToken = (String) ((Map<?, ?>) userRes.getBody().get("data")).get("accessToken");
        Long userId = ((Number) ((Map<?, ?>) userRes.getBody().get("data")).get("userId")).longValue();

        // 관리자 계정 생성
        Users admin = Users.builder()
                .email(ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                .nickname(ADMIN_NICKNAME)
                .name("관리자")
                .birthday(LocalDate.of(1985, 1, 1))
                .role(Role.ADMIN)
                .authProvider(AuthProvider.LOCAL)
                .build();
        usersRepository.save(admin);

        // 관리자 로그인 → 토큰 발급
        ResponseEntity<Map> adminRes = authRestClient.post()
                .uri("/login")
                .body(Map.of("email", ADMIN_EMAIL, "password", ADMIN_PASSWORD))
                .retrieve()
                .toEntity(Map.class);
        adminToken = (String) ((Map<?, ?>) adminRes.getBody().get("data")).get("accessToken");

        // 신고 대상 게시글 생성
        Post post = Post.create(userId, PostType.FREE, PostCategory.F, "테스트 게시글", "테스트 내용");
        postId = postRepository.save(post).getId();
    }

    // ── RPT-01: 신고 생성 ────────────────────────────

    @Test
    @DisplayName("RPT-01 | 게시글 신고 성공 → 200")
    void createReport_post_success() {
        ResponseEntity<Map> response = restClient.post()
                .uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of(
                        "targetId", postId,
                        "targetType", "POST",
                        "reason", "SPAM",
                        "detail", "스팸 게시글입니다."
                ))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(reportsRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("RPT-01 | 로그인 없이 신고 → 401")
    void createReport_unauthorized() {
        try {
            restClient.post()
                    .uri("/reports")
                    .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Test
    @DisplayName("RPT-01 | 존재하지 않는 게시글 신고 → 404")
    void createReport_postNotFound() {
        try {
            restClient.post()
                    .uri("/reports")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .body(Map.of("targetId", 99999L, "targetType", "POST", "reason", "SPAM"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ── ADM-03: 신고 목록 조회 ───────────────────────

    @Test
    @DisplayName("ADM-03 | 관리자 신고 목록 조회 성공 → 200")
    void getReports_success() {
        // 신고 1건 생성
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                .retrieve().toBodilessEntity();

        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(1);
    }

    @Test
    @DisplayName("ADM-03 | status 필터링 조회 → PENDING 건만 반환")
    void getReports_withStatusFilter() {
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                .retrieve().toBodilessEntity();

        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/reports?status=PENDING")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(1);
    }

    @Test
    @DisplayName("ADM-03 | 일반 유저 접근 → 403")
    void getReports_forbidden() {
        try {
            restClient.get()
                    .uri("/admin/reports")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    // ── ADM-03-1: 신고 상세 조회 ─────────────────────

    @Test
    @DisplayName("ADM-03-1 | 신고 상세 조회 성공 → 200 + 처리 이력 포함")
    void getReportDetail_success() {
        // 신고 생성
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                .retrieve().toBodilessEntity();

        Long reportId = reportsRepository.findAll().get(0).getId();

        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/reports/{id}", reportId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("status")).isEqualTo("PENDING");
        assertThat(data.get("actions")).isNotNull();
    }

    @Test
    @DisplayName("ADM-03-1 | 존재하지 않는 신고 → 404")
    void getReportDetail_notFound() {
        try {
            restClient.get()
                    .uri("/admin/reports/{id}", 99999L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ── ADM-04: 신고 처리 ───────────────────────────

    @Test
    @DisplayName("ADM-04 | 숨김 처리 성공 → 200 + status=HIDDEN + 게시글 softDelete")
    void createReportAction_hide_success() {
        // 신고 생성
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "OBSCENE"))
                .retrieve().toBodilessEntity();

        Long reportId = reportsRepository.findAll().get(0).getId();

        // 숨김 처리
        ResponseEntity<Map> response = restClient.post()
                .uri("/admin/reports/{id}/actions", reportId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("action", "HIDE", "note", "음란 게시글 숨김 처리"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // reports.status = HIDDEN 확인
        assertThat(reportsRepository.findById(reportId).get().getStatus())
                .isEqualTo(ReportStatus.HIDDEN);

        // 게시글 softDelete 확인
        assertThat(postRepository.findById(postId).get().isDeleted()).isTrue();

        // 처리 이력 저장 확인
        assertThat(reportActionsRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("ADM-04 | 기각 처리 성공 → 200 + status=DISMISSED")
    void createReportAction_dismiss_success() {
        // 신고 생성
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                .retrieve().toBodilessEntity();

        Long reportId = reportsRepository.findAll().get(0).getId();

        // 기각 처리
        ResponseEntity<Map> response = restClient.post()
                .uri("/admin/reports/{id}/actions", reportId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("action", "DISMISS", "note", "스팸 아님"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(reportsRepository.findById(reportId).get().getStatus())
                .isEqualTo(ReportStatus.DISMISSED);
    }

    @Test
    @DisplayName("ADM-04 | 복구 처리 성공 → 200 + status=RESTORED + 게시글 restore")
    void createReportAction_restore_success() {
        // 신고 생성 후 숨김 처리
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                .retrieve().toBodilessEntity();

        Long reportId = reportsRepository.findAll().get(0).getId();

        restClient.post()
                .uri("/admin/reports/{id}/actions", reportId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("action", "HIDE", "note", "숨김"))
                .retrieve().toBodilessEntity();

        // 복구 처리
        ResponseEntity<Map> response = restClient.post()
                .uri("/admin/reports/{id}/actions", reportId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("action", "RESTORE", "note", "복구 처리"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(reportsRepository.findById(reportId).get().getStatus())
                .isEqualTo(ReportStatus.RESTORED);
        assertThat(postRepository.findById(postId).get().isDeleted()).isFalse();
    }

    @Test
    @DisplayName("ADM-04 | 잘못된 action 값 → 400")
    void createReportAction_invalidAction() {
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                .retrieve().toBodilessEntity();

        Long reportId = reportsRepository.findAll().get(0).getId();

        try {
            restClient.post()
                    .uri("/admin/reports/{id}/actions", reportId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .body(Map.of("action", "INVALID_ACTION"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Test
    @DisplayName("ADM-04 | 일반 유저 처리 시도 → 403")
    void createReportAction_forbidden() {
        restClient.post().uri("/reports")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("targetId", postId, "targetType", "POST", "reason", "SPAM"))
                .retrieve().toBodilessEntity();

        Long reportId = reportsRepository.findAll().get(0).getId();

        try {
            restClient.post()
                    .uri("/admin/reports/{id}/actions", reportId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .body(Map.of("action", "DISMISS"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }
    }
}
