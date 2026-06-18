package com.jackpot.whiskeynote.domain.taste.tag;

import com.jackpot.whiskeynote.domain.taste.tag.dto.TagResponse;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<TagResponse> getTags(TagCategory category) {
        List<TagResponse> tagResponses = new ArrayList<>();
        List<Tag> tags = tagRepository.findAllByCategory(category);

        for (Tag tag : tags) {
            tagResponses.add(TagResponse.from(tag));
        }
        return tagResponses;
    }
}
