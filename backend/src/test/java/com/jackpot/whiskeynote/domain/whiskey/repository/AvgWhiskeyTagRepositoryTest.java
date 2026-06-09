package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
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
class AvgWhiskeyTagRepositoryTest {

    @Autowired private AvgWhiskeyTagRepository avgWhiskeyTagRepository;
    @Autowired private WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;
    @Autowired private TagRepository tagRepository;

    @Test
    @DisplayName("캐시 ID로 평균 태그를 count 내림차순 조회한다")
    void findByCacheIdOrderByCountDesc() {
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag honey = tagRepository.save(tag(TagCategory.taste, "꿀", 2));
        Tag smoky = tagRepository.save(tag(TagCategory.nose, "스모키", 3));

        WhiskeysNoteCache cache = WhiskeysNoteCache.init(whiskey);
        cache.applyTags(List.of(vanilla, honey, smoky));
        cache.applyTags(List.of(vanilla, honey));
        cache.applyTags(List.of(vanilla));
        cache = whiskeysNoteCacheRepository.saveAndFlush(cache);

        List<AvgWhiskeyTag> result = avgWhiskeyTagRepository
                .findByCacheIdOrderByCountDesc(cache.getId());

        assertThat(result).hasSize(3);
        assertThat(result)
                .extracting(avgTag -> avgTag.getTag().getName())
                .containsExactly("바닐라", "꿀", "스모키");
        assertThat(result)
                .extracting(AvgWhiskeyTag::getCount)
                .containsExactly(3, 2, 1);
    }

    @Test
    @DisplayName("캐시와 태그로 평균 태그를 조회한다")
    void findByCacheAndTag() {
        Whiskey whiskey = whiskeyRepository.save(whiskey("맥캘란 15년"));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));

        WhiskeysNoteCache cache = WhiskeysNoteCache.init(whiskey);
        cache.applyTags(List.of(vanilla));
        cache = whiskeysNoteCacheRepository.saveAndFlush(cache);

        AvgWhiskeyTag result = avgWhiskeyTagRepository.findByCacheAndTag(cache, vanilla)
                .orElseThrow();

        assertThat(result.getCache().getId()).isEqualTo(cache.getId());
        assertThat(result.getTag().getId()).isEqualTo(vanilla.getId());
        assertThat(result.getCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("캐시에 없는 태그 조합은 조회되지 않는다")
    void findByCacheAndTagNotFound() {
        Whiskey whiskey = whiskeyRepository.save(whiskey("발베니 12년"));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag smoky = tagRepository.save(tag(TagCategory.nose, "스모키", 2));

        WhiskeysNoteCache cache = WhiskeysNoteCache.init(whiskey);
        cache.applyTags(List.of(vanilla));
        cache = whiskeysNoteCacheRepository.saveAndFlush(cache);

        assertThat(avgWhiskeyTagRepository.findByCacheAndTag(cache, smoky)).isEmpty();
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
