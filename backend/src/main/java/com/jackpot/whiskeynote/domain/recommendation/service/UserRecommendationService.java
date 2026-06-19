package com.jackpot.whiskeynote.domain.recommendation.service;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.recommendation.dto.NoteVector;
import com.jackpot.whiskeynote.domain.recommendation.dto.TasteMatchDto;
import com.jackpot.whiskeynote.domain.taste.survey.entity.FlavorProfile;
import com.jackpot.whiskeynote.domain.taste.survey.entity.FlavorProfileTag;
import com.jackpot.whiskeynote.domain.taste.survey.repository.FlavorProfileRepository;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserRecommendationService {
    private static final int USER_RECOMMENDATION_SIZE = 10;

    private RecommendationScoreService recommendationScoreService;
    private UsersRepository usersRepository;
    private FlavorProfileRepository flavorProfileRepository;
    private TagRepository tagRepository;

    public List<TasteMatchDto> recommendByAll(Long userId) {
        NoteVector targetVector = recommendationScoreService.calculateScoreByUser(userId);

        // user - flavorProfile 연결
        List<Users> users = usersRepository.findAll();
        List<FlavorProfile> flavorProfiles = flavorProfileRepository.findAllWithTag();
        Map<Long, FlavorProfile> flavorProfileByUserId = new HashMap<>();
        for (FlavorProfile flavorProfile : flavorProfiles) {
            flavorProfileByUserId.put(flavorProfile.getUserId(), flavorProfile);
        }

        // matching
        List<TasteMatchDto> tasteMatchDtos = new ArrayList<>();
        for (Users user : users) {
            if (user.getId().equals(userId)) continue;

            NoteVector userNoteVector;
            if (flavorProfileByUserId.containsKey(user.getId())) {
                FlavorProfile userFlavorProfile = flavorProfileByUserId.get(user.getId());
                userNoteVector = NoteVector.from(
                    userFlavorProfile.getScoreArray(),
                    userFlavorProfile.getTags().stream()
                        .collect(Collectors.toMap(t -> t.getTag().getId(), FlavorProfileTag::getWeight))
                    );
            } else {
                userNoteVector = recommendationScoreService.calculateScoreByUser(user.getId());
            }
            double score = recommendationScoreService.calcScore(targetVector, userNoteVector);
            tasteMatchDtos.add(TasteMatchDto.create(user, score));
        }

        tasteMatchDtos.sort(Comparator.comparingDouble(TasteMatchDto::similarity).reversed());
        return tasteMatchDtos.subList(0, Integer.min(tasteMatchDtos.size(), USER_RECOMMENDATION_SIZE));
    }
}
