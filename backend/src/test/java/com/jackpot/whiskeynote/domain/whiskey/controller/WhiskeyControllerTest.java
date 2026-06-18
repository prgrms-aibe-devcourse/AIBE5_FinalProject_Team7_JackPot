package com.jackpot.whiskeynote.domain.whiskey.controller;

import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewLikeRepository;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.whiskey.repository.AvgWhiskeyTagRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * WhiskeyController 통합 테스트
 *
 * <p>실제 HTTP 요청으로 위스키 조회 API의 컨트롤러-서비스-리포지토리 흐름을 검증한다.
 * Elasticsearch는 test 프로필에서 mock WhiskeySearchService로 대체된다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class WhiskeyControllerTest {

    @LocalServerPort
    private int port;

    @Autowired private WhiskeyRepository whiskeyRepository;
    @Autowired private WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    @Autowired private AvgWhiskeyTagRepository avgWhiskeyTagRepository;
    @Autowired private TagRepository tagRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ReviewLikeRepository reviewLikeRepository;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api/v1")
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();

        clearDatabase();
    }

    @AfterEach
    void tearDown() {
        clearDatabase();
    }

    private void clearDatabase() {
        reviewLikeRepository.deleteAll();
        reviewRepository.deleteAll();
        avgWhiskeyTagRepository.deleteAll();
        whiskeysNoteCacheRepository.deleteAll();
        tagRepository.deleteAll();
        whiskeyRepository.deleteAll();
    }

    @Test
    @DisplayName("WHISKEY-01 | 위스키 전체 목록 조회 → 200 + 페이징 목록")
    void getWhiskeys_success() {
        whiskeyRepository.save(whiskey("글렌피딕 18년", WhiskeyType.single_malt, 40.0, 18));
        whiskeyRepository.save(whiskey("와일드터키 101", WhiskeyType.bourbon, 50.5, 0));

        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskeys?page=0&size=10")
                .retrieve()
                .toEntity(Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<String, Object> data = response.getBody();
        List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");

        assertThat((int) data.get("totalElements")).isEqualTo(2);
        assertThat(content)
                .extracting(item -> item.get("name"))
                .containsExactlyInAnyOrder("글렌피딕 18년", "와일드터키 101");
    }

    @Test
    @DisplayName("WHISKEY-02 | 위스키 필터 조회 → 선택한 타입과 범위에 맞는 목록만 반환")
    void filterWhiskeys_success() {
        whiskeyRepository.save(whiskey("글렌피딕 18년", WhiskeyType.single_malt, 40.0, 18));
        whiskeyRepository.save(whiskey("와일드터키 101", WhiskeyType.bourbon, 50.5, 0));

        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskeys/filter?types=single_malt&minAge=10&maxAge=20&page=0&size=10")
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = response.getBody();
        List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat((int) data.get("totalElements")).isEqualTo(1);
        assertThat(content.get(0).get("name")).isEqualTo("글렌피딕 18년");
    }

    @Test
    @DisplayName("WHISKEY-03 | 위스키 상세 조회 → 기본 정보, 시음 요약, 태그 반환")
    void getWhiskeyDetail_success() {
        Whiskey whiskey = whiskeyRepository.save(
                whiskey("맥캘란 15년", WhiskeyType.single_malt, 43.0, 15)
        );
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag honey = tagRepository.save(tag(TagCategory.taste, "꿀", 2));

        WhiskeysNoteCache cache = WhiskeysNoteCache.init(whiskey);
        cache.applyScore(new WhiskeyScoreVo((short) 8, (short) 7, (short) 3, (short) 5, (short) 9));
        cache.applyTags(List.of(vanilla, honey));
        whiskeysNoteCacheRepository.saveAndFlush(cache);

        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskeys/{id}", whiskey.getId())
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = response.getBody();
        Map<String, Object> noteSummary = (Map<String, Object>) data.get("noteSummary");
        List<Map<String, Object>> tastingTags = (List<Map<String, Object>>) data.get("tastingTags");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(data.get("name")).isEqualTo("맥캘란 15년");
        assertThat(noteSummary.get("noteCount")).isEqualTo(1);
        assertThat(noteSummary.get("bodyScore")).isEqualTo(8);
        assertThat(tastingTags)
                .extracting(tag -> tag.get("name"))
                .containsExactlyInAnyOrder("바닐라", "꿀");
    }

    @Test
    @DisplayName("WHISKEY-03 | 존재하지 않는 위스키 상세 조회 → 404")
    void getWhiskeyDetail_notFound() {
        try {
            restClient.get()
                    .uri("/whiskeys/{id}", 99999L)
                    .retrieve()
                    .toEntity(Map.class);
        } catch (HttpClientErrorException e) {
            assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(e.getResponseBodyAsString()).contains("위스키를 찾을 수 없습니다.");
        }
    }

    @Test
    @DisplayName("WHISKEY-04 | 검색어 조회 → 200 + 검색 서비스 결과 반환")
    void searchWhiskeys_success() {
        ResponseEntity<Map> response = restClient.get()
                .uri("/whiskeys/search?q=글렌&page=0&size=10")
                .retrieve()
                .toEntity(Map.class);

        Map<String, Object> data = response.getBody();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat((int) data.get("totalElements")).isEqualTo(0);
    }

    private Whiskey whiskey(String name, WhiskeyType type, Double abv, Integer ageYears) {
        return Whiskey.builder()
                .name(name)
                .type(type)
                .abv(abv)
                .ageYears(ageYears)
                .status(WhiskeyStatus.active)
                .country("Scotland")
                .cask("Bourbon")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private Tag tag(TagCategory category, String name, int displayOrder) {
        return Tag.builder()
                .category(category)
                .name(name)
                .displayOrder(displayOrder)
                .imageUrl(null)
                .build();
    }
}
