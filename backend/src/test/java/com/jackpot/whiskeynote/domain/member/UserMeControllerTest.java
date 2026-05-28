package com.jackpot.whiskeynote.domain.member;

import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UserMeControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UsersRepository usersRepository;

    private RestClient authClient;
    private RestClient userClient;

    private static final String TEST_EMAIL = "withdraw@whiskey.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_NICKNAME = "탈퇴테스트";
    private static final String TEST_BIRTHDAY = "1990-01-15";

    @BeforeEach
    void setUp() {
        authClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1/auth")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        userClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1/users")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        refreshTokenRepository.deleteAll();
        usersRepository.deleteAll();
    }

    private String registerAndLoginAccessToken() {
        // register
        authClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", TEST_EMAIL,
                        "password", TEST_PASSWORD,
                        "nickname", TEST_NICKNAME,
                        "birthday", TEST_BIRTHDAY
                ))
                .retrieve()
                .toBodilessEntity();

        // login
        ResponseEntity<Map> loginRes = authClient.post()
                .uri("/login")
                .body(Map.of(
                        "email", TEST_EMAIL,
                        "password", TEST_PASSWORD
                ))
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> loginBody = Objects.requireNonNull(loginRes.getBody());
        Map<String, Object> data = (Map<String, Object>) loginBody.get("data");
        return (String) data.get("accessToken");
    }

    private Map<String, Object> registerAndLogin() {
        // register
        authClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", TEST_EMAIL,
                        "password", TEST_PASSWORD,
                        "nickname", TEST_NICKNAME,
                        "birthday", TEST_BIRTHDAY
                ))
                .retrieve()
                .toBodilessEntity();

        // login
        ResponseEntity<Map> loginRes = authClient.post()
                .uri("/login")
                .body(Map.of(
                        "email", TEST_EMAIL,
                        "password", TEST_PASSWORD
                ))
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> loginBody = Objects.requireNonNull(loginRes.getBody());
        return (Map<String, Object>) loginBody.get("data");
    }

    @Test
    @DisplayName("USER-04 | 회원 탈퇴 성공 → 200 + RefreshToken 삭제 + isDeleted=true")
    void deleteMe_success() {
        Map<String, Object> data = registerAndLogin();
        String accessToken = (String) data.get("accessToken");
        Number userIdNum = (Number) data.get("userId");
        long userId = userIdNum.longValue();

        assertThat(refreshTokenRepository.findByUserId(userId)).isPresent();

        // delete me
        ResponseEntity<Map> deleteRes = userClient.delete()
                .uri("/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(deleteRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshTokenRepository.findByUserId(userId)).isEmpty();
        assertThat(usersRepository.findById(userId).orElseThrow().isDeleted()).isTrue();
        assertThat(usersRepository.findById(userId).orElseThrow().getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("USER-02 | 설정/약관 동의 업데이트(bottleShareOptIn, marketingOptIn) 성공 → 200")
    void updateMe_settings_success() {
        String accessToken = registerAndLoginAccessToken();

        ResponseEntity<Map> patchRes = userClient.patch()
                .uri("/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of(
                        "bottleShareOptIn", true,
                        "marketingOptIn", true
                ))
                .retrieve()
                .toEntity(Map.class);

        assertThat(patchRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> body = Objects.requireNonNull(patchRes.getBody());
        Map<String, Object> data = (Map<String, Object>) body.get("data");

        assertThat(data.get("bottleShareOptIn")).isEqualTo(true);
        assertThat(data.get("marketingOptIn")).isEqualTo(true);
    }

    @Test
    @DisplayName("닉네임 가용성 체크 | 사용 중 닉네임이면 available=false")
    void nicknameAvailability_taken() {
        registerAndLoginAccessToken();

        ResponseEntity<Map> res = userClient.get()
                .uri(uriBuilder -> uriBuilder.path("/nickname/available")
                        .queryParam("nickname", TEST_NICKNAME)
                        .build())
                .retrieve()
                .toEntity(Map.class);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> body = Objects.requireNonNull(res.getBody());
        Map<String, Object> data = (Map<String, Object>) body.get("data");

        assertThat(data.get("nickname")).isEqualTo(TEST_NICKNAME);
        assertThat(data.get("available")).isEqualTo(false);
    }
}

