package com.jackpot.whiskeynote.domain.member;

import com.jackpot.whiskeynote.support.TestDataCleaner;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListFolderRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.HttpClientErrorException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Auth API 통합 테스트
 *
 * - @SpringBootTest(RANDOM_PORT) : 실제 서버를 랜덤 포트로 띄움
 * - RestClient                   : Spring 6.1+ HTTP 클라이언트 (TestRestTemplate 대체)
 * - @ActiveProfiles("test")      : H2 인메모리 DB 사용 → MySQL 불필요
 * - DB 격리: @BeforeEach에서 수동 deleteAll (RANDOM_PORT + 별도 트랜잭션으로 @Transactional 롤백 불가)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestDataCleaner cleaner;

    private RestClient restClient;

    private static final String TEST_EMAIL    = "test@whiskey.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_NICKNAME = "위스키러버";
    private static final String TEST_BIRTHDAY = "1990-01-15";

    @BeforeEach
    void setUp() {
        // 매 테스트마다 랜덤 포트 기준으로 RestClient 생성
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1/auth")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        cleaner.cleanAll();
    }

    // ── 회원가입 테스트 ──────────────────────────────────

    @Test
    @DisplayName("AUTH-01 | 회원가입 성공 → 201 + isNewUser=true")
    void register_success() {

        Map<String, String> request = Map.of(
                "email",    TEST_EMAIL,
                "password", TEST_PASSWORD,
                "nickname", TEST_NICKNAME,
                "birthday", TEST_BIRTHDAY
        );

        ResponseEntity<Map> response = restClient.post()
                .uri("/register")
                .body(request)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        Map<String, Object> body = response.getBody();
        assertThat(body.get("success")).isEqualTo(true);
        assertThat(body.get("error")).isNull();

        Map<String, Object> data = (Map<String, Object>) body.get("data");
        assertThat(data.get("accessToken")).isNotNull();
        assertThat(data.get("refreshToken")).isNotNull();
        assertThat(data.get("userId")).isNotNull();
        assertThat(data.get("isNewUser")).isEqualTo(true);
    }

    @Test
    @DisplayName("AUTH-01 | 이메일 중복 → 400 + BAD_REQUEST")
    void register_duplicateEmail() {

        Map<String, String> request = Map.of(
                "email",    TEST_EMAIL,
                "password", TEST_PASSWORD,
                "nickname", TEST_NICKNAME,
                "birthday", TEST_BIRTHDAY
        );

        // 첫 번째 가입
        restClient.post().uri("/register").body(request).retrieve().toBodilessEntity();

        // 같은 이메일로 두 번째 가입
        Map<String, String> duplicateRequest = Map.of(
                "email",    TEST_EMAIL,
                "password", TEST_PASSWORD,
                "nickname", "다른닉네임",
                "birthday", TEST_BIRTHDAY
        );

        try {
            restClient.post().uri("/register").body(duplicateRequest).retrieve().toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

            String responseBody = e.getResponseBodyAsString();
            assertThat(responseBody).contains("BAD_REQUEST");
            assertThat(responseBody).contains("이미 사용 중인 이메일입니다.");
        }
    }

    @Test
    @DisplayName("AUTH-01 | 비밀번호 8자 미만 → 400 + VALIDATION_ERROR")
    void register_invalidPassword() {

        Map<String, String> request = Map.of(
                "email",    "new@whiskey.com",
                "password", "1234",
                "nickname", TEST_NICKNAME,
                "birthday", TEST_BIRTHDAY
        );

        try {
            restClient.post().uri("/register").body(request).retrieve().toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(e.getResponseBodyAsString()).contains("VALIDATION_ERROR");
            assertThat(e.getResponseBodyAsString()).contains("비밀번호는 최소 8자 이상이어야 합니다.");
        }
    }

    @Test
    @DisplayName("AUTH-01 | 이메일 형식 오류 → 400 + VALIDATION_ERROR")
    void register_invalidEmail() {

        Map<String, String> request = Map.of(
                "email",    "invalid-email",
                "password", TEST_PASSWORD,
                "nickname", TEST_NICKNAME,
                "birthday", TEST_BIRTHDAY
        );

        try {
            restClient.post().uri("/register").body(request).retrieve().toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(e.getResponseBodyAsString()).contains("VALIDATION_ERROR");
        }
    }

    // ── 로그인 테스트 ──────────────────────────────────

    @Test
    @DisplayName("AUTH-02 | 로그인 성공 → 200 + isNewUser=true")
    void login_success() {

        // 먼저 회원가입
        Map<String, String> registerRequest = Map.of(
                "email",    TEST_EMAIL,
                "password", TEST_PASSWORD,
                "nickname", TEST_NICKNAME,
                "birthday", TEST_BIRTHDAY
        );
        restClient.post().uri("/register").body(registerRequest).retrieve().toBodilessEntity();

        // 로그인
        Map<String, String> loginRequest = Map.of(
                "email",    TEST_EMAIL,
                "password", TEST_PASSWORD
        );

        ResponseEntity<Map> response = restClient.post()
                .uri("/login")
                .body(loginRequest)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> body = response.getBody();
        assertThat(body.get("success")).isEqualTo(true);

        Map<String, Object> data = (Map<String, Object>) body.get("data");
        assertThat(data.get("accessToken")).isNotNull();
        assertThat(data.get("refreshToken")).isNotNull();
        assertThat(data.get("isNewUser")).isEqualTo(true);
    }

    @Test
    @DisplayName("AUTH-02 | 비밀번호 오류 → 400 + BAD_REQUEST")
    void login_wrongPassword() {

        // 먼저 회원가입
        Map<String, String> registerRequest = Map.of(
                "email",    TEST_EMAIL,
                "password", TEST_PASSWORD,
                "nickname", TEST_NICKNAME,
                "birthday", TEST_BIRTHDAY
        );
        restClient.post().uri("/register").body(registerRequest).retrieve().toBodilessEntity();

        // 틀린 비밀번호
        Map<String, String> loginRequest = Map.of(
                "email",    TEST_EMAIL,
                "password", "wrongpassword"
        );

        try {
            restClient.post().uri("/login").body(loginRequest).retrieve().toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(e.getResponseBodyAsString()).contains("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    @Test
    @DisplayName("AUTH-02 | 존재하지 않는 이메일 → 400 + BAD_REQUEST")
    void login_emailNotFound() {

        Map<String, String> loginRequest = Map.of(
                "email",    "notexist@whiskey.com",
                "password", TEST_PASSWORD
        );

        try {
            restClient.post().uri("/login").body(loginRequest).retrieve().toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(e.getResponseBodyAsString()).contains("등록되지 않은 이메일 입니다.");
        }
    }

    @Test
    @DisplayName("AUTH-03 | 소셜 로그인 redirect → 302 + Location 헤더 포함")
    void oauthRedirect_success() throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("http://localhost:" + port + "/api/v1/auth/oauth/google"))
                .GET()
                .build();

        HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());

        assertThat(response.statusCode()).isEqualTo(302);
        Optional<String> location = response.headers().firstValue("location");
        assertThat(location).isPresent();
        assertThat(location.get()).contains("accounts.google.com");
        assertThat(location.get()).contains("client_id=test-google-client-id");
    }

    @Test
    @DisplayName("AUTH-03 | 지원하지 않는 provider → 400")
    void oauthRedirect_invalidProvider() throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("http://localhost:" + port + "/api/v1/auth/oauth/unknown"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.body()).contains("BAD_REQUEST");
    }

}
