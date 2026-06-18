package com.jackpot.whiskeynote.domain.collection;

import com.jackpot.whiskeynote.support.TestDataCleaner;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListFolderRepository;
import com.jackpot.whiskeynote.domain.collection.wishlist.repository.WishListItemRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.support.TestDataCleaner;
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
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Wish(위시리스트) API 통합 테스트
 *
 * - @SpringBootTest(RANDOM_PORT) : 실제 서버를 랜덤 포트로 띄움
 * - @ActiveProfiles("test")      : H2 인메모리 DB 사용
 * - DB 격리: @BeforeEach에서 FK 순서에 맞게 수동 deleteAll
 *   순서: wishlist_items → wishlist_folders → picks → refresh_tokens → users → whiskeys
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class WishControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private TestDataCleaner cleaner;
    @Autowired private WishListItemRepository wishListItemRepository;
    @Autowired private WishListFolderRepository wishListFolderRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;

    private RestClient restClient;
    private RestClient authRestClient;

    private static final String TEST_EMAIL    = "wish@whiskey.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_NICKNAME = "위시테스터";
    private static final String TEST_BIRTHDAY = "1990-01-15";

    private Long testWhiskeyId;
    private Long testWhiskey2Id;
    private String accessToken;

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

        cleaner.cleanAllWithWhiskey();

        // 테스트용 위스키 2개 저장
        testWhiskeyId = whiskeyRepository.save(Whiskey.builder()
                .name("글렌피딕 12년")
                .type(WhiskeyType.single_malt)
                .abv(40.0).ageYears(12)
                .country("Scotland")
                .status(WhiskeyStatus.active)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build()).getId();

        testWhiskey2Id = whiskeyRepository.save(Whiskey.builder()
                .name("라프로익 10년")
                .type(WhiskeyType.single_malt)
                .abv(40.0).ageYears(10)
                .country("Scotland")
                .status(WhiskeyStatus.active)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build()).getId();

        // 회원가입 후 accessToken 발급
        ResponseEntity<Map> response = authRestClient.post()
                .uri("/register")
                .body(Map.of(
                        "email", TEST_EMAIL,
                        "password", TEST_PASSWORD,
                        "nickname", TEST_NICKNAME,
                        "birthday", TEST_BIRTHDAY
                ))
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        accessToken = (String) data.get("accessToken");
    }

    // ── 폴더 생성 테스트 ─────────────────────────────────

    @Test
    @DisplayName("WISH-01 | 폴더 생성 성공 → 201 + 폴더 목록 반환")
    void createFolder_success() {
        ResponseEntity<Map> response = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "입문 후보", "sortOrder", 0))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        Map<String, Object> body = response.getBody();
        assertThat(body.get("success")).isEqualTo(true);

        List<Map<String, Object>> data = (List<Map<String, Object>>) body.get("data");
        assertThat(data).hasSize(1);
        assertThat(data.get(0).get("name")).isEqualTo("입문 후보");
    }

    @Test
    @DisplayName("WISH-01 | 로그인 없이 폴더 생성 → 401")
    void createFolder_unauthorized() {
        try {
            restClient.post()
                    .uri("/users/me/wishlists")
                    .body(Map.of("name", "입문 후보", "sortOrder", 0))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    @Test
    @DisplayName("WISH-01 | 폴더 이름 없이 생성 → 400")
    void createFolder_blankName() {
        try {
            restClient.post()
                    .uri("/users/me/wishlists")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .body(Map.of("name", "", "sortOrder", 0))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    // ── 폴더 목록 조회 테스트 ────────────────────────────

    @Test
    @DisplayName("WISH-02 | 폴더 목록 조회 성공 → 200 + sortOrder·이름순 정렬")
    void getFolderList_success() {
        // 폴더 3개 생성 (sortOrder 혼합)
        restClient.post().uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "피트 도전", "sortOrder", 1)).retrieve().toBodilessEntity();
        restClient.post().uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "입문 후보", "sortOrder", 0)).retrieve().toBodilessEntity();
        restClient.post().uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "가나다순첫번째", "sortOrder", 0)).retrieve().toBodilessEntity();

        ResponseEntity<Map> response = restClient.get()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
        assertThat(data).hasSize(3);

        // sortOrder 0인 것들 중 이름순 확인
        assertThat(data.get(0).get("name")).isEqualTo("가나다순첫번째");
        assertThat(data.get(1).get("name")).isEqualTo("입문 후보");
        assertThat(data.get(2).get("name")).isEqualTo("피트 도전");
    }

    // ── 폴더 이름 수정 테스트 ────────────────────────────

    @Test
    @DisplayName("WISH-03 | 폴더 이름 수정 성공 → 200 + 수정된 이름 반환")
    void updateFolderName_success() {
        // 폴더 생성 후 ID 추출
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "입문 후보", "sortOrder", 0))
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> folders = (List<Map<String, Object>>) createRes.getBody().get("data");
        Long folderId = ((Number) folders.get(0).get("folderId")).longValue();

        // 이름 수정
        ResponseEntity<Map> response = restClient.patch()
                .uri("/users/me/wishlists/folders/{folderId}", folderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "수정된 이름"))
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
        assertThat(data.get(0).get("name")).isEqualTo("수정된 이름");
    }

    @Test
    @DisplayName("WISH-03 | 존재하지 않는 폴더 수정 → 404")
    void updateFolderName_notFound() {
        try {
            restClient.patch()
                    .uri("/users/me/wishlists/folders/{folderId}", 99999L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .body(Map.of("name", "수정된 이름"))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ── 폴더 삭제 테스트 ─────────────────────────────────

    @Test
    @DisplayName("WISH-04 | 폴더 삭제 성공 → 200 + 폴더 및 아이템 삭제")
    void deleteFolder_success() {
        // 폴더 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "삭제할 폴더", "sortOrder", 0))
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> folders = (List<Map<String, Object>>) createRes.getBody().get("data");
        Long folderId = ((Number) folders.get(0).get("folderId")).longValue();

        // 위시 추가
        restClient.post()
                .uri("/whiskeys/{whiskeyId}/wish?folderId={folderId}", testWhiskeyId, folderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve().toBodilessEntity();

        // 폴더 삭제
        ResponseEntity<Map> response = restClient.delete()
                .uri("/users/me/wishlists/folders/{folderId}", folderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // 폴더와 아이템 모두 DB에서 삭제됐는지 확인
        assertThat(wishListFolderRepository.existsById(folderId)).isFalse();
        assertThat(wishListItemRepository.findAllByFolderIdWithWhiskey(folderId)).isEmpty();
    }

    // ── 위시 추가 테스트 ─────────────────────────────────

    @Test
    @DisplayName("WISH-05 | 위시 추가 성공 → 201 + 해당 폴더 아이템 목록 반환")
    void addWish_success() {
        // 폴더 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "입문 후보", "sortOrder", 0))
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> folders = (List<Map<String, Object>>) createRes.getBody().get("data");
        Long folderId = ((Number) folders.get(0).get("folderId")).longValue();

        // 위시 추가
        ResponseEntity<Map> response = restClient.post()
                .uri("/whiskeys/{whiskeyId}/wish?folderId={folderId}", testWhiskeyId, folderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
        assertThat(data).hasSize(1);

        Map<String, Object> whiskey = (Map<String, Object>) data.get(0).get("whiskey");
        assertThat(whiskey.get("name")).isEqualTo("글렌피딕 12년");
    }

    @Test
    @DisplayName("WISH-05 | 중복 위시 추가 → 409 CONFLICT")
    void addWish_duplicate() {
        // 폴더 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "입문 후보", "sortOrder", 0))
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> folders = (List<Map<String, Object>>) createRes.getBody().get("data");
        Long folderId = ((Number) folders.get(0).get("folderId")).longValue();

        // 첫 번째 위시 추가
        restClient.post()
                .uri("/whiskeys/{whiskeyId}/wish?folderId={folderId}", testWhiskeyId, folderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve().toBodilessEntity();

        // 중복 추가
        try {
            restClient.post()
                    .uri("/whiskeys/{whiskeyId}/wish?folderId={folderId}", testWhiskeyId, folderId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve().toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(e.getResponseBodyAsString()).contains("이미 해당 폴더에 위시한 위스키입니다.");
        }
    }

    @Test
    @DisplayName("WISH-05 | 로그인 없이 위시 추가 → 401")
    void addWish_unauthorized() {
        try {
            restClient.post()
                    .uri("/whiskeys/{whiskeyId}/wish?folderId={folderId}", testWhiskeyId, 1L)
                    .retrieve().toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ── 위시 삭제 테스트 ─────────────────────────────────

    @Test
    @DisplayName("WISH-06 | 위시 삭제 성공 → 204 + DB에서 삭제 확인")
    void removeWish_success() {
        // 폴더 생성
        ResponseEntity<Map> createRes = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "입문 후보", "sortOrder", 0))
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> folders = (List<Map<String, Object>>) createRes.getBody().get("data");
        Long folderId = ((Number) folders.get(0).get("folderId")).longValue();

        // 위시 추가 후 itemId 추출
        ResponseEntity<Map> addRes = restClient.post()
                .uri("/whiskeys/{whiskeyId}/wish?folderId={folderId}", testWhiskeyId, folderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> items = (List<Map<String, Object>>) addRes.getBody().get("data");
        Long wishItemId = ((Number) items.get(0).get("itemId")).longValue();

        // 위시 삭제
        ResponseEntity<Void> response = restClient.delete()
                .uri("/whiskeys/wish/{wishItemId}?folderId={folderId}", wishItemId, folderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toBodilessEntity();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(wishListItemRepository.existsById(wishItemId)).isFalse();
    }

    @Test
    @DisplayName("WISH-06 | 존재하지 않는 위시 삭제 → 404")
    void removeWish_notFound() {
        try {
            restClient.delete()
                    .uri("/whiskeys/wish/{wishItemId}?folderId={folderId}", 99999L, 1L)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    // ── 아이템 폴더 이동 테스트 ──────────────────────────

    @Test
    @DisplayName("WISH-07 | 아이템 폴더 이동 성공 → 200 + 이동한 폴더 아이템 목록 반환")
    void moveItem_success() {
        // 폴더 2개 생성
        ResponseEntity<Map> folderRes1 = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "폴더A", "sortOrder", 0))
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> folders1 = (List<Map<String, Object>>) folderRes1.getBody().get("data");
        Long folderAId = ((Number) folders1.get(0).get("folderId")).longValue();

        ResponseEntity<Map> folderRes2 = restClient.post()
                .uri("/users/me/wishlists")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(Map.of("name", "폴더B", "sortOrder", 1))
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> folders2 = (List<Map<String, Object>>) folderRes2.getBody().get("data");
        Long folderBId = ((Number) folders2.stream()
                .filter(f -> f.get("name").equals("폴더B"))
                .findFirst().get().get("folderId")).longValue();

        // 폴더A에 위시 추가
        ResponseEntity<Map> addRes = restClient.post()
                .uri("/whiskeys/{whiskeyId}/wish?folderId={folderId}", testWhiskeyId, folderAId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve().toEntity(Map.class);

        List<Map<String, Object>> items = (List<Map<String, Object>>) addRes.getBody().get("data");
        Long itemId = ((Number) items.get(0).get("itemId")).longValue();

        // 폴더B로 이동
        ResponseEntity<Map> response = restClient.patch()
                .uri("/users/me/wishlists/items/{itemId}/move?targetFolderId={targetFolderId}", itemId, folderBId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        List<Map<String, Object>> movedItems = (List<Map<String, Object>>) data.get("items");

        // 폴더B에 아이템이 있는지 확인
        assertThat(movedItems).hasSize(1);
        Map<String, Object> whiskey = (Map<String, Object>) movedItems.get(0).get("whiskey");
        assertThat(whiskey.get("name")).isEqualTo("글렌피딕 12년");
    }
}
