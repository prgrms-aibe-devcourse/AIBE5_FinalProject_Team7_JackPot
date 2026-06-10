package com.jackpot.whiskeynote.domain.member;

import com.jackpot.whiskeynote.support.TestDataCleaner;
import com.jackpot.whiskeynote.support.TestDataCleaner;
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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UpdateMyPasswordTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestDataCleaner cleaner;

    private RestClient authClient;
    private RestClient userClient;

    private static final String TEST_EMAIL = "pwchange@whiskey.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_NEW_PASSWORD = "password1234";
    private static final String TEST_NICKNAME = "비번변경";
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

        cleaner.cleanAll();
    }

    @Test
    @DisplayName("SET-01 | 비밀번호 변경 성공 → 204 + 새 비밀번호로 로그인 가능")
    void updatePassword_success() {
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

        // login to get token
        ResponseEntity<Map> loginRes = authClient.post()
                .uri("/login")
                .body(Map.of("email", TEST_EMAIL, "password", TEST_PASSWORD))
                .retrieve()
                .toEntity(Map.class);
        Map<String, Object> loginBody = Objects.requireNonNull(loginRes.getBody());
        Map<String, Object> data = (Map<String, Object>) loginBody.get("data");
        String accessToken = (String) data.get("accessToken");

        // change password
        ResponseEntity<Void> patchRes = userClient.patch()
                .uri("/me/password")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of(
                        "currentPassword", TEST_PASSWORD,
                        "newPassword", TEST_NEW_PASSWORD
                ))
                .retrieve()
                .toBodilessEntity();

        assertThat(patchRes.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // old password should fail
        try {
            authClient.post()
                    .uri("/login")
                    .body(Map.of("email", TEST_EMAIL, "password", TEST_PASSWORD))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        // new password should succeed
        ResponseEntity<Map> loginRes2 = authClient.post()
                .uri("/login")
                .body(Map.of("email", TEST_EMAIL, "password", TEST_NEW_PASSWORD))
                .retrieve()
                .toEntity(Map.class);

        assertThat(loginRes2.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
