package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyFilterRequest;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WhiskeyRepositoryTest {

    @Autowired private WhiskeyRepository whiskeyRepository;
    @Autowired private WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    @Autowired private AvgWhiskeyTagRepository avgWhiskeyTagRepository;
    @Autowired private TagRepository tagRepository;

    @Test
    @DisplayName("위스키 이름 포함 검색은 대소문자를 구분하지 않는다")
    void findByNameContainingIgnoreCase() {
        Whiskey glenfiddich = whiskeyRepository.save(whiskey("Glenfiddich 18", WhiskeyType.single_malt, 40.0, 18));
        whiskeyRepository.save(whiskey("Macallan 15", WhiskeyType.single_malt, 43.0, 15));

        Page<Whiskey> result = whiskeyRepository.findByNameContainingIgnoreCase(
                "glen",
                PageRequest.of(0, 10)
        );

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().getFirst().getId()).isEqualTo(glenfiddich.getId());
    }

    @Test
    @DisplayName("필터 검색은 키워드, 타입, 도수, 숙성연수 조건을 함께 적용한다")
    void whiskeySpecification_filterByBasicConditions() {
        Whiskey target = whiskeyRepository.save(whiskey("글렌피딕 18년", WhiskeyType.single_malt, 40.0, 18));
        whiskeyRepository.save(whiskey("글렌피딕 IPA", WhiskeyType.single_malt, 43.0, 0));
        whiskeyRepository.save(whiskey("버번 테스트", WhiskeyType.bourbon, 50.0, 8));

        WhiskeyFilterRequest request = new WhiskeyFilterRequest(
                "글렌",
                List.of(WhiskeyType.single_malt),
                null,
                null,
                39.0,
                41.0,
                12,
                20,
                0,
                10
        );

        Page<Whiskey> result = whiskeyRepository.findAll(
                WhiskeySpecification.filter(request),
                PageRequest.of(0, 10)
        );

        assertThat(result.getContent())
                .extracting(Whiskey::getId)
                .containsExactly(target.getId());
    }

    @Test
    @DisplayName("필터 검색은 위스키 노트 캐시의 향/맛 태그 조건을 적용한다")
    void whiskeySpecification_filterByTastingTags() {
        Whiskey target = whiskeyRepository.save(whiskey("태그 매칭 위스키", WhiskeyType.single_malt, 46.0, 12));
        Whiskey other = whiskeyRepository.save(whiskey("다른 위스키", WhiskeyType.single_malt, 46.0, 12));
        Tag vanillaNose = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag honeyTaste = tagRepository.save(tag(TagCategory.taste, "꿀", 1));
        Tag peatTaste = tagRepository.save(tag(TagCategory.taste, "피트", 2));

        saveCacheWithTags(target, List.of(vanillaNose, honeyTaste));
        saveCacheWithTags(other, List.of(vanillaNose, peatTaste));

        WhiskeyFilterRequest request = new WhiskeyFilterRequest(
                null,
                null,
                List.of("바닐라"),
                List.of("꿀"),
                null,
                null,
                null,
                null,
                0,
                10
        );

        Page<Whiskey> result = whiskeyRepository.findAll(
                WhiskeySpecification.filter(request),
                PageRequest.of(0, 10)
        );

        assertThat(result.getContent())
                .extracting(Whiskey::getId)
                .containsExactly(target.getId());
    }

    @Test
    @DisplayName("위스키 노트 캐시는 위스키 ID로 조회할 수 있고 평균 태그는 count 내림차순으로 조회된다")
    void noteCacheAndAvgTagRepositories() {
        Whiskey whiskey = whiskeyRepository.save(whiskey("캐시 위스키", WhiskeyType.single_malt, 46.0, 12));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag smoke = tagRepository.save(tag(TagCategory.nose, "스모키", 2));
        WhiskeysNoteCache cache = WhiskeysNoteCache.init(whiskey);
        cache.applyTags(List.of(vanilla, smoke));
        cache.applyTags(List.of(smoke));
        cache = whiskeysNoteCacheRepository.saveAndFlush(cache);

        WhiskeysNoteCache foundCache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId()).orElseThrow();
        List<AvgWhiskeyTag> avgTags = avgWhiskeyTagRepository.findByCacheIdOrderByCountDesc(cache.getId());

        assertThat(foundCache.getId()).isEqualTo(cache.getId());
        assertThat(avgTags).extracting(AvgWhiskeyTag::getCount).containsExactly(2, 1);
        assertThat(avgWhiskeyTagRepository.findByCacheAndTag(cache, vanilla)).isPresent();
    }

    private WhiskeysNoteCache saveCacheWithTags(Whiskey whiskey, List<Tag> tags) {
        WhiskeysNoteCache cache = WhiskeysNoteCache.init(whiskey);
        cache.applyTags(tags);
        return whiskeysNoteCacheRepository.saveAndFlush(cache); // 같은 트랜잭션 내에서 바로 조회 가능하도록 flush() 호출
    }

    private Whiskey whiskey(String name, WhiskeyType type, Double abv, Integer ageYears) {
        return Whiskey.builder()
                .name(name)
                .type(type)
                .abv(abv)
                .ageYears(ageYears)
                .status(WhiskeyStatus.active)
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
