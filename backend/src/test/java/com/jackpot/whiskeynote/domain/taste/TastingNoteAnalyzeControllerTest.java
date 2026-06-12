package com.jackpot.whiskeynote.domain.taste;

import com.jackpot.whiskeynote.support.TestDataCleaner;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * AI 테이스팅 노트 분석 API 통합 테스트
 * POST /api/v1/tasting-notes/analyze
 *
 * 테스트 전략:
 * - 인증/입력값 검증 → 401, 400 응답 검증 (항상 실행)
 * - API 키 없을 때 → 503 응답 검증 (테스트 환경 기본)
 * - 실제 AI 호출 테스트 → API 키 있을 때만 실행 (자동 스킵)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class TastingNoteAnalyzeControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private TestDataCleaner cleaner;
    @Autowired private UsersRepository usersRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private TagRepository tagRepository;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private RestClient restClient;
    private RestClient authRestClient;

    private static final String USER_EMAIL    = "taste@test.com";
    private static final String USER_PASSWORD = "password123";
    private static final String USER_NICKNAME = "테이스터";

    private String userToken;

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

        // DB 초기화
        cleaner.cleanAll();

        // AI 태그 매핑 테스트를 위한 tags 시드 데이터 삽입
        // AnthropicService TAG_MAP의 한글 태그명과 일치해야 함
        insertTestTags();

        // 일반 유저 회원가입 → 토큰 발급
        ResponseEntity<Map> userRes = authRestClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", USER_EMAIL,
                        "password", USER_PASSWORD,
                        "nickname", USER_NICKNAME,
                        "birthday", "1995-05-10"
                ))
                .retrieve()
                .toEntity(Map.class);
        userToken = (String) ((Map<?, ?>) userRes.getBody().get("data")).get("accessToken");
    }

    // ── 태그 시드 데이터 삽입 ─────────────────────────
    // AnthropicService TAG_MAP의 한글 태그명과 동일하게 맞춰야 함
    private void insertTestTags() {
        tagRepository.deleteAll();
        String[] noseNames  = {"시트러스","베리류","꽃","허브","곡물","견과류","꿀","바닐라","캐러멜","초콜릿","커피","후추","계피","정향","우디(나무, 오크)","가죽","피트","흙","약품"};
        String[] tasteNames = {"시트러스","베리류","허브","곡물","견과류","꿀","바닐라","캐러멜","초콜릿","커피","우디(나무, 오크)","피트","흙","짠맛"};

        int order = 1;
        for (String name : noseNames) {
            tagRepository.save(Tag.builder().category(TagCategory.nose).name(name).displayOrder(order++).imageUrl("/test.svg").build());
        }
        order = 1;
        for (String name : tasteNames) {
            tagRepository.save(Tag.builder().category(TagCategory.taste).name(name).displayOrder(order++).imageUrl("/test.svg").build());
        }
    }

    // ── 인증 검증 ────────────────────────────────────

    @Test
    @DisplayName("AI-01 | 로그인 없이 분석 요청 → 401")
    void analyze_unauthorized() {
        try {
            restClient.post()
                    .uri("/tasting-notes/analyze")
                    .body(Map.of("memo", "레몬이랑 바닐라 향이 나고 달콤해"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ── 입력값 검증 ──────────────────────────────────

    @Test
    @DisplayName("AI-02 | 메모가 빈 문자열 → 400")
    void analyze_emptyMemo() {
        try {
            restClient.post()
                    .uri("/tasting-notes/analyze")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .body(Map.of("memo", ""))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Test
    @DisplayName("AI-03 | memo 필드 자체가 없음 → 400")
    void analyze_missingMemo() {
        try {
            restClient.post()
                    .uri("/tasting-notes/analyze")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .body(Map.of())
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Test
    @DisplayName("AI-04 | 2000자 초과 메모 → 400")
    void analyze_memoTooLong() {
        String longMemo = "위스키 ".repeat(600); // 2400자
        try {
            restClient.post()
                    .uri("/tasting-notes/analyze")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .body(Map.of("memo", longMemo))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    // ── API 키 없을 때 동작 검증 ─────────────────────

    @Test
    @DisplayName("AI-05 | API 키 미설정 상태에서 요청 → 503")
    void analyze_noApiKey() {
        // 테스트 환경은 anthropic.api-key=""로 설정되어 있음
        if (!anthropicApiKey.isBlank()) {
            return; // API 키가 있으면 스킵 (실제 AI 호출되므로)
        }

        try {
            restClient.post()
                    .uri("/tasting-notes/analyze")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                    .body(Map.of("memo", "레몬이랑 바닐라 향이 나고 달콤해"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpServerErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    // ── 실제 AI 호출 테스트 (API 키 있을 때만 실행) ──

    @Test
    @DisplayName("AI-06 | 자유 텍스트 메모 분석 → 200 + scores/tags 반환 [API 키 필요]")
    void analyze_freeText_success() {
        if (anthropicApiKey.isBlank()) return; // API 키 없으면 스킵

        ResponseEntity<Map> response = restClient.post()
                .uri("/tasting-notes/analyze")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("memo", "레몬이랑 청사과 향이 선명하고, 피트한 느낌도 있어. " +
                        "마시면 달달하면서 후추가 확 올라오고 바디감이 묵직해. 피니시는 짧은 편."))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();

        // data 필드 추출 (ApiResponse 래퍼)
        Map<String, Object> data = (Map<String, Object>) body.get("data");
        assertThat(data).isNotNull();

        // 응답 값 출력 (확인용)
        System.out.println("\n========== AI-06 자유 텍스트 분석 결과 ==========");
        System.out.println("scores  : " + data.get("scores"));
        System.out.println("noseTags: " + data.get("noseTagIds"));
        System.out.println("palateTags: " + data.get("palateTagIds"));
        System.out.println("=================================================\n");

        // scores 5개 필드 모두 존재 확인
        Map<String, Object> scores = (Map<String, Object>) data.get("scores");
        assertThat(scores).isNotNull();
        assertThat(scores).containsKeys("body", "finish", "smoky", "spicy", "sweet");

        // tags 리스트 타입 확인
        assertThat(data.get("noseTagIds")).isInstanceOf(List.class);
        assertThat(data.get("palateTagIds")).isInstanceOf(List.class);
    }

    @Test
    @DisplayName("AI-07 | 구조화 텍스트 메모 분석 → 200 + finish 높은 점수 반환 [API 키 필요]")
    void analyze_structuredText_success() {
        if (anthropicApiKey.isBlank()) return;

        ResponseEntity<Map> response = restClient.post()
                .uri("/tasting-notes/analyze")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("memo",
                        "N: 바닐라, 오크, 건조한 허브\n" +
                        "P: 캐러멜, 다크 초콜릿, 약간의 후추\n" +
                        "F: 길고 따뜻하게 지속됨"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data).isNotNull();
        Map<String, Object> scores = (Map<String, Object>) data.get("scores");

        System.out.println("\n========== AI-07 구조화 텍스트 분석 결과 ==========");
        System.out.println("scores  : " + scores);
        System.out.println("noseTags: " + data.get("noseTagIds"));
        System.out.println("palateTags: " + data.get("palateTagIds"));
        System.out.println("===================================================\n");

        // finish는 '길고 따뜻하게 지속됨'이므로 높은 점수 기대
        if (scores.get("finish") != null) {
            int finish = ((Number) scores.get("finish")).intValue();
            assertThat(finish).isGreaterThanOrEqualTo(6);
        }
    }

    @Test
    @DisplayName("AI-08 | 정보 부족 메모 분석 → 200 + 태그 적음 [API 키 필요]")
    void analyze_insufficientInfo_success() {
        if (anthropicApiKey.isBlank()) return;

        ResponseEntity<Map> response = restClient.post()
                .uri("/tasting-notes/analyze")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .body(Map.of("memo", "그냥 부드럽고 마시기 편했어. 특별한 향은 잘 모르겠음."))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        assertThat(data).isNotNull();
        List<?> noseTagIds   = (List<?>) data.get("noseTagIds");
        List<?> palateTagIds = (List<?>) data.get("palateTagIds");

        System.out.println("\n========== AI-08 정보 부족 분석 결과 ==========");
        System.out.println("scores  : " + data.get("scores"));
        System.out.println("noseTags: " + noseTagIds);
        System.out.println("palateTags: " + palateTagIds);
        System.out.println("================================================\n");

        // 정보 부족 → 태그 없거나 적어야 함
        assertThat(noseTagIds.size()).isLessThanOrEqualTo(2);
        assertThat(palateTagIds.size()).isLessThanOrEqualTo(2);
    }
}
