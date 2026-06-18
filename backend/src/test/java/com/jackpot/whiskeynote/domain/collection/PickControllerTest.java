package com.jackpot.whiskeynote.domain.collection;

import com.jackpot.whiskeynote.support.TestDataCleaner;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pick API 통합 테스트
 *
 * - @SpringBootTest(RANDOM_PORT) : 실제 서버를 랜덤 포트로 띄움
 * - RestClient                   : Spring 6.1+ HTTP 클라이언트
 * - @ActiveProfiles("test")      : H2 인메모리 DB 사용 → MySQL 불필요
 * - DB 격리: @BeforeEach에서 수동 deleteAll
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PickControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private TestDataCleaner cleaner;
    @Autowired private PickRepository pickRepository;
    @Autowired private UsersRepository usersRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;

    private RestClient restClient;
    private RestClient authRestClient;

    // 테스트용 상수
    private static final String TEST_EMAIL    = "pick@whiskey.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_NICKNAME = "픽테스터";
    private static final String TEST_BIRTHDAY = "1990-01-15";

    // 테스트마다 공유할 상태
    private Long testWhiskeyId;
    private String accessToken;

    @BeforeEach
    void setUp() {
        // RestClient 초기화
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        authRestClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1/auth")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        cleaner.cleanAllWithWhiskey();

        // 테스트용 위스키 DB에 저장
        Whiskey whiskey = Whiskey.builder()
                .name("글렌피딕 12년")
                .type(WhiskeyType.single_malt)
                .abv(40.0)
                .ageYears(12)
                .country("Scotland")
                .status(WhiskeyStatus.active)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        testWhiskeyId = whiskeyRepository.save(whiskey).getId();

        // 테스트용 유저 회원가입 후 accessToken 발급
        Map<String, String> registerRequest = Map.of(
                "email",    TEST_EMAIL,
                "password", TEST_PASSWORD,
                "nickname", TEST_NICKNAME,
                "birthday", TEST_BIRTHDAY
        );

        ResponseEntity<Map> response = authRestClient.post()
                .uri("/register")
                .body(registerRequest)
                .retrieve()
                .toEntity(Map.class);

        // 응답에서 accessToken 추출
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        accessToken = (String) data.get("accessToken");
    }

    // ── 픽 목록 조회 테스트 ──────────────────────────────

    @Test
    @DisplayName("PICK-01 | 픽 목록 조회 성공 → 200 + 빈 목록")
    void getPickList_success_empty() {
        // 유저 ID 조회
        Long userId = usersRepository.findAll().get(0).getId();

        ResponseEntity<Map> response = restClient.get()
                .uri("/users/{userId}/picks", userId)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> body = response.getBody();
        assertThat(body.get("success")).isEqualTo(true);
        assertThat(body.get("error")).isNull();

        // 빈 목록 확인
        Map<String, Object> data = (Map<String, Object>) body.get("data");
        assertThat((int) data.get("totalElements")).isEqualTo(0);
    }

    @Test
    @DisplayName("PICK-01 | 존재하지 않는 유저 픽 조회 → 404")
    void getPickList_userNotFound() {
        try {
            restClient.get()
                    .uri("/users/{userId}/picks", 99999L)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(e.getResponseBodyAsString()).contains("사용자를 찾을 수 없습니다.");
        }
    }

    // ── 픽 등록 테스트 ──────────────────────────────────

    @Test
    @DisplayName("PICK-02 | 픽 등록 성공 → 201 + 위스키 정보 포함")
    void createPick_success() {
        ResponseEntity<Map> response = restClient.post()
                .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        Map<String, Object> body = response.getBody();
        assertThat(body.get("success")).isEqualTo(true);
        assertThat(body.get("error")).isNull();

        // 위스키 정보 포함 여부 확인
        Map<String, Object> data = (Map<String, Object>) body.get("data");
        Map<String, Object> whiskey = (Map<String, Object>) data.get("whiskey");
        assertThat(whiskey.get("name")).isEqualTo("글렌피딕 12년");
        assertThat(data.get("createdAt")).isNotNull();
    }

    @Test
    @DisplayName("PICK-02 | 로그인 없이 픽 등록 → 401")
    void createPick_unauthorized() {
        try {
            restClient.post()
                    .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                    // Authorization 헤더 없음
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Test
    @DisplayName("PICK-02 | 중복 픽 등록 → 409 CONFLICT")
    void createPick_duplicate() {
        // 첫 번째 픽 등록
        restClient.post()
                .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toBodilessEntity();

        // 같은 위스키 두 번째 픽 등록
        try {
            restClient.post()
                    .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(e.getResponseBodyAsString()).contains("이미 픽한 위스키입니다.");
        }
    }

    @Test
    @DisplayName("PICK-02 | 존재하지 않는 위스키 픽 → 404")
    void createPick_whiskeyNotFound() {
        try {
            restClient.post()
                    .uri("/whiskeys/{whiskeyId}/pick", 99999L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(e.getResponseBodyAsString()).contains("위스키를 찾을 수 없습니다.");
        }
    }

    // ── 픽 삭제 테스트 ──────────────────────────────────

    @Test
    @DisplayName("PICK-03 | 픽 삭제 성공 → 204 NO CONTENT")
    void deletePick_success() {
        // 먼저 픽 등록
        restClient.post()
                .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toBodilessEntity();

        // 픽 삭제
        ResponseEntity<Void> response = restClient.delete()
                .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // DB에서도 실제로 삭제됐는지 확인
        Long userId = usersRepository.findAll().get(0).getId();
        assertThat(pickRepository.existsByUserIdAndWhiskeyId(userId, testWhiskeyId)).isFalse();
    }

    @Test
    @DisplayName("PICK-03 | 픽하지 않은 위스키 삭제 → 404")
    void deletePick_notFound() {
        try {
            restClient.delete()
                    .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(e.getResponseBodyAsString()).contains("픽 목록에 없는 위스키입니다.");
        }
    }

    @Test
    @DisplayName("PICK-03 | 로그인 없이 픽 삭제 → 401")
    void deletePick_unauthorized() {
        try {
            restClient.delete()
                    .uri("/whiskeys/{whiskeyId}/pick", testWhiskeyId)
                    // Authorization 헤더 없음
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }
}
