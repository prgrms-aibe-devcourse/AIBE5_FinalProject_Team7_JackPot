package com.jackpot.whiskeynote.domain.admin;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Role;
import com.jackpot.whiskeynote.domain.member.entity.Users;
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
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 관리자 사용자 관리 API 통합 테스트
 * ADM-USR-01: 사용자 목록 조회 (검색/필터/페이징)
 * ADM-USR-02: 권한 변경 (USER ↔ ADMIN)
 * ADM-USR-03: 밴 처리
 * ADM-USR-04: 밴 해제
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AdminUserControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private TestDataCleaner cleaner;
    @Autowired private UsersRepository usersRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private RestClient restClient;
    private RestClient authRestClient;

    private static final String ADMIN_EMAIL    = "admin@user.com";
    private static final String ADMIN_PASSWORD = "password123";
    private static final String ADMIN_NICKNAME = "관리자";

    private static final String USER_EMAIL    = "user@user.com";
    private static final String USER_PASSWORD = "password123";
    private static final String USER_NICKNAME = "일반유저";

    private String adminToken;
    private String userToken;
    private Long targetUserId;  // 테스트 대상 일반 유저 ID

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

        // 관리자 계정 직접 생성
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

        // 관리자 로그인
        ResponseEntity<Map> adminRes = authRestClient.post()
                .uri("/login")
                .body(Map.of("email", ADMIN_EMAIL, "password", ADMIN_PASSWORD))
                .retrieve()
                .toEntity(Map.class);
        adminToken = (String) ((Map<?, ?>) adminRes.getBody().get("data")).get("accessToken");

        // 일반 유저 회원가입
        ResponseEntity<Map> userRes = authRestClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", USER_EMAIL,
                        "password", USER_PASSWORD,
                        "nickname", USER_NICKNAME,
                        "birthday", "1995-06-15"
                ))
                .retrieve()
                .toEntity(Map.class);
        userToken = (String) ((Map<?, ?>) userRes.getBody().get("data")).get("accessToken");
        targetUserId = ((Number) ((Map<?, ?>) userRes.getBody().get("data")).get("userId")).longValue();
    }

    // ── ADM-USR-01: 사용자 목록 조회 ─────────────────────

    @Test
    @DisplayName("ADM-USR-01 | 전체 목록 조회 성공 → 200 + 2명 반환")
    void getUsers_success() {
        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        // admin + user = 2명
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(2);
    }

    @Test
    @DisplayName("ADM-USR-01 | 이메일 키워드 검색 → 해당 유저만 반환")
    void getUsers_searchByEmail() {
        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/users?keyword=user@user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(1);

        List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");
        assertThat(content.get(0).get("email")).isEqualTo(USER_EMAIL);
    }

    @Test
    @DisplayName("ADM-USR-01 | 닉네임 키워드 검색 → 해당 유저만 반환")
    void getUsers_searchByNickname() {
        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/users?keyword=일반유저")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(1);
    }

    @Test
    @DisplayName("ADM-USR-01 | 밴 필터 → 밴된 유저만 반환")
    void getUsers_filterBanned() {
        // 밴 처리
        restClient.patch()
                .uri("/admin/users/{id}/ban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toBodilessEntity();

        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/users?filter=banned")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(((Number) data.get("totalElements")).intValue()).isEqualTo(1);

        List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");
        assertThat(content.get(0).get("email")).isEqualTo(USER_EMAIL);
    }

    @Test
    @DisplayName("ADM-USR-01 | 일반 유저 접근 → 403")
    void getUsers_forbidden() {
        try {
            restClient.get()
                    .uri("/admin/users")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    @Test
    @DisplayName("ADM-USR-01 | 응답에 필요한 필드 포함 확인")
    void getUsers_responseFields() {
        ResponseEntity<Map> response = restClient.get()
                .uri("/admin/users?keyword=일반유저")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");
        Map<String, Object> user = content.get(0);

        // 필수 필드 확인
        assertThat(user).containsKeys("id", "email", "nickname", "role",
                "isDeleted", "isBanned", "isNewUser", "createdAt");
    }

    // ── ADM-USR-02: 권한 변경 ────────────────────────────

    @Test
    @DisplayName("ADM-USR-02 | USER → ADMIN 권한 변경 성공 → 200 + role=ADMIN")
    void updateRole_userToAdmin() {
        ResponseEntity<Map> response = restClient.patch()
                .uri("/admin/users/{id}/role", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("role", "ADMIN"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("role")).isEqualTo("ADMIN");

        // DB 확인
        assertThat(usersRepository.findById(targetUserId).get().getRole())
                .isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("ADM-USR-02 | ADMIN → USER 권한 변경 성공 → 200 + role=USER")
    void updateRole_adminToUser() {
        // 먼저 ADMIN으로 올리고
        restClient.patch()
                .uri("/admin/users/{id}/role", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("role", "ADMIN"))
                .retrieve().toBodilessEntity();

        // 다시 USER로 내림
        ResponseEntity<Map> response = restClient.patch()
                .uri("/admin/users/{id}/role", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .body(Map.of("role", "USER"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("role")).isEqualTo("USER");
    }

    @Test
    @DisplayName("ADM-USR-02 | PRO 권한 변경 시도 → 400")
    void updateRole_proNotAllowed() {
        try {
            restClient.patch()
                    .uri("/admin/users/{id}/role", targetUserId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .body(Map.of("role", "PRO"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Test
    @DisplayName("ADM-USR-02 | 잘못된 권한 값 → 400")
    void updateRole_invalidRole() {
        try {
            restClient.patch()
                    .uri("/admin/users/{id}/role", targetUserId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .body(Map.of("role", "SUPER_ADMIN"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Test
    @DisplayName("ADM-USR-02 | 존재하지 않는 유저 권한 변경 → 404")
    void updateRole_userNotFound() {
        try {
            restClient.patch()
                    .uri("/admin/users/{id}/role", 99999L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .body(Map.of("role", "ADMIN"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ── ADM-USR-03: 밴 처리 ──────────────────────────────

    @Test
    @DisplayName("ADM-USR-03 | 밴 처리 성공 → 200 + isBanned=true")
    void banUser_success() {
        ResponseEntity<Map> response = restClient.patch()
                .uri("/admin/users/{id}/ban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("isBanned")).isEqualTo(true);
        assertThat(data.get("bannedAt")).isNotNull();

        // DB 확인
        assertThat(usersRepository.findById(targetUserId).get().isBanned()).isTrue();
    }

    @Test
    @DisplayName("ADM-USR-03 | 밴 처리 후 로그인 시도 → 400 (밴 차단)")
    void banUser_loginBlocked() {
        // 밴 처리
        restClient.patch()
                .uri("/admin/users/{id}/ban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toBodilessEntity();

        // 밴된 계정으로 로그인 시도
        try {
            authRestClient.post()
                    .uri("/login")
                    .body(Map.of("email", USER_EMAIL, "password", USER_PASSWORD))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            // 밴된 계정은 로그인 불가
            assertThat(e.getStatusCode().is4xxClientError()).isTrue();
        }
    }

    @Test
    @DisplayName("ADM-USR-03 | 이미 밴된 유저 재밴 → 409")
    void banUser_alreadyBanned() {
        // 첫 번째 밴
        restClient.patch()
                .uri("/admin/users/{id}/ban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toBodilessEntity();

        // 두 번째 밴 시도
        try {
            restClient.patch()
                    .uri("/admin/users/{id}/ban", targetUserId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        }
    }

    @Test
    @DisplayName("ADM-USR-03 | 존재하지 않는 유저 밴 → 404")
    void banUser_notFound() {
        try {
            restClient.patch()
                    .uri("/admin/users/{id}/ban", 99999L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ── ADM-USR-04: 밴 해제 ──────────────────────────────

    @Test
    @DisplayName("ADM-USR-04 | 밴 해제 성공 → 200 + isBanned=false + bannedAt=null")
    void unbanUser_success() {
        // 먼저 밴
        restClient.patch()
                .uri("/admin/users/{id}/ban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toBodilessEntity();

        // 밴 해제
        ResponseEntity<Map> response = restClient.patch()
                .uri("/admin/users/{id}/unban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("isBanned")).isEqualTo(false);
        assertThat(data.get("bannedAt")).isNull();

        // DB 확인
        assertThat(usersRepository.findById(targetUserId).get().isBanned()).isFalse();
    }

    @Test
    @DisplayName("ADM-USR-04 | 밴 해제 후 로그인 성공 → 200")
    void unbanUser_loginRestored() {
        // 밴 → 밴 해제
        restClient.patch()
                .uri("/admin/users/{id}/ban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve().toBodilessEntity();

        restClient.patch()
                .uri("/admin/users/{id}/unban", targetUserId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .retrieve().toBodilessEntity();

        // 로그인 시도
        ResponseEntity<Map> response = authRestClient.post()
                .uri("/login")
                .body(Map.of("email", USER_EMAIL, "password", USER_PASSWORD))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data.get("accessToken")).isNotNull();
    }

    @Test
    @DisplayName("ADM-USR-04 | 밴 처리 안 된 유저 밴 해제 → 409")
    void unbanUser_notBanned() {
        try {
            restClient.patch()
                    .uri("/admin/users/{id}/unban", targetUserId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        }
    }

    @Test
    @DisplayName("ADM-USR-04 | 존재하지 않는 유저 밴 해제 → 404")
    void unbanUser_notFound() {
        try {
            restClient.patch()
                    .uri("/admin/users/{id}/unban", 99999L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }
}
