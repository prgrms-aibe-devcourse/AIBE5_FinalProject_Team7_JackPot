package com.jackpot.whiskeynote.domain.taste.tag;

import com.jackpot.whiskeynote.domain.taste.tag.dto.TagMapResponse;
import com.jackpot.whiskeynote.domain.taste.tag.dto.TagResponse;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static com.jackpot.whiskeynote.domain.taste.tag.TagService.TagGroup.*;

@Service
@Transactional
@RequiredArgsConstructor
public class TagService {
    public enum TagGroup {
        FRUIT("과일"), FLORAL_HERBAL("꽃·풀·허브"), SWEET_SPICE("단맛·향신료"),
        WOOD_GRAIN_NUT("오크·곡물·견과"), SMOKY_COASTAL("스모키·바다"), AGED_RICH("숙성 향"),
        ETC("기타");
        public final String label;
        TagGroup(String label) { this.label = label; }
    }

    private static final Map<String, TagGroup> GROUP = Map.ofEntries(
        Map.entry("시트러스", FRUIT), Map.entry("사과/배", FRUIT), Map.entry("복숭아/자두", FRUIT),
        Map.entry("레드베리", FRUIT), Map.entry("다크베리", FRUIT), Map.entry("건과일", FRUIT),
        Map.entry("졸인과일", FRUIT), Map.entry("바나나", FRUIT),

        Map.entry("꽃향", FLORAL_HERBAL), Map.entry("풀잎", FLORAL_HERBAL), Map.entry("허브", FLORAL_HERBAL),

        Map.entry("바닐라", SWEET_SPICE), Map.entry("꿀", SWEET_SPICE), Map.entry("캐러멜", SWEET_SPICE),
        Map.entry("초콜릿", SWEET_SPICE), Map.entry("시나몬", SWEET_SPICE), Map.entry("후추", SWEET_SPICE),

        Map.entry("새 오크", WOOD_GRAIN_NUT), Map.entry("숙성 오크", WOOD_GRAIN_NUT),
        Map.entry("곡물", WOOD_GRAIN_NUT), Map.entry("견과류", WOOD_GRAIN_NUT),

        Map.entry("피트", SMOKY_COASTAL), Map.entry("모닥불", SMOKY_COASTAL),
        Map.entry("약품향", SMOKY_COASTAL), Map.entry("바다/소금", SMOKY_COASTAL),

        Map.entry("가죽", AGED_RICH), Map.entry("담배", AGED_RICH), Map.entry("커피", AGED_RICH)
    );

    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public TagMapResponse getTags(TagCategory category) {
        Map<String, List<TagResponse>> tagMap = new LinkedHashMap<>();
        List<Tag> tags = tagRepository.findAllByCategory(category);
        for (TagGroup g : TagGroup.values()) {
            tagMap.put(g.label, new ArrayList<>());
        }

        for (Tag tag : tags) {
            String groupValue = GROUP.getOrDefault(tag.getName(), ETC).label;
            tagMap.computeIfAbsent(groupValue, k -> new ArrayList<>());
            tagMap.get(groupValue).add(TagResponse.from(tag));
        }
        for (List<TagResponse> list : tagMap.values()) {
            list.sort(Comparator.comparingInt(TagResponse::displayOrder));
        }
        return new TagMapResponse(tagMap);
    }
}
