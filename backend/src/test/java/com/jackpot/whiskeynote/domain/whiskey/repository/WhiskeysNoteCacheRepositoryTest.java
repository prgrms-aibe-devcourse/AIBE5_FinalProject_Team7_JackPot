package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WhiskeysNoteCacheRepositoryTest {

    @Autowired private WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;
    @Autowired private TagRepository tagRepository;

    @Test
    @DisplayName("위스키 ID로 노트 캐시를 조회한다")
    void findByWhiskeyId() {
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.saveAndFlush(
                WhiskeysNoteCache.init(whiskey)
        );

        WhiskeysNoteCache result = whiskeysNoteCacheRepository.findByWhiskeyId(whiskey.getId())
                .orElseThrow();

        assertThat(result.getId()).isEqualTo(cache.getId());
        assertThat(result.getWhiskey().getId()).isEqualTo(whiskey.getId());
    }

    @Test
    @DisplayName("위스키 ID로 노트 캐시와 평균 태그 목록을 함께 조회한다")
    void findByWhiskeyIdWithAvgTags() {
        Whiskey whiskey = whiskeyRepository.save(whiskey("맥캘란 15년"));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag honey = tagRepository.save(tag(TagCategory.taste, "꿀", 2));
        WhiskeysNoteCache cache = WhiskeysNoteCache.init(whiskey);
        cache.applyTags(List.of(vanilla, honey));
        cache = whiskeysNoteCacheRepository.saveAndFlush(cache);

        WhiskeysNoteCache result = whiskeysNoteCacheRepository
                .findByWhiskeyIdWithAvgTags(whiskey.getId())
                .orElseThrow();

        assertThat(result.getId()).isEqualTo(cache.getId());
        assertThat(result.getAvgWhiskeyTags()).hasSize(2);
        assertThat(result.getAvgWhiskeyTags())
                .extracting(avgTag -> avgTag.getTag().getName())
                .containsExactlyInAnyOrder("바닐라", "꿀");
    }

    @Test
    @DisplayName("모든 노트 캐시를 위스키와 평균 태그, 태그 정보와 함께 조회한다")
    void findAllWithTagsAndWhiskey() {
        Whiskey glenfiddich = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Whiskey macallan = whiskeyRepository.save(whiskey("맥캘란 15년"));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag smoke = tagRepository.save(tag(TagCategory.nose, "스모키", 2));

        WhiskeysNoteCache glenCache = WhiskeysNoteCache.init(glenfiddich);
        glenCache.applyTags(List.of(vanilla));
        whiskeysNoteCacheRepository.saveAndFlush(glenCache);

        WhiskeysNoteCache macallanCache = WhiskeysNoteCache.init(macallan);
        macallanCache.applyTags(List.of(smoke));
        whiskeysNoteCacheRepository.saveAndFlush(macallanCache);

        List<WhiskeysNoteCache> result = whiskeysNoteCacheRepository.findAllWithTagsAndWhiskey();

        assertThat(result).hasSize(2);
        assertThat(result)
                .extracting(cache -> cache.getWhiskey().getName())
                .containsExactlyInAnyOrder("글렌피딕 18년", "맥캘란 15년");
        assertThat(result)
                .flatExtracting(WhiskeysNoteCache::getAvgWhiskeyTags)
                .extracting(avgTag -> avgTag.getTag().getName())
                .containsExactlyInAnyOrder("바닐라", "스모키");
    }

    private Whiskey whiskey(String name) {
        return Whiskey.builder()
                .name(name)
                .type(WhiskeyType.single_malt)
                .abv(40.0)
                .ageYears(12)
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
