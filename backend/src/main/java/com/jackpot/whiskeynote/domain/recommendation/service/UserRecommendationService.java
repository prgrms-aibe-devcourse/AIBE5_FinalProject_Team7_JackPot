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

    private final RecommendationScoreService recommendationScoreService;
    private final UsersRepository usersRepository;
    private final FlavorProfileRepository flavorProfileRepository;

    public List<TasteMatchDto> recommendByAll(Long userId) {
        NoteVector targetVector = recommendationScoreService.calculateScoreByUser(userId);
        // 본인 취향 데이터(설문/픽/리뷰)가 없으면 매칭 불가 → 빈 목록 (프론트는 "활동하면 매칭 가능" 안내)
        if (targetVector == null) return Collections.emptyList();

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

            // NoteVector userNoteVector;
            // if (flavorProfileByUserId.containsKey(user.getId())) {
            //     FlavorProfile userFlavorProfile = flavorProfileByUserId.get(user.getId());
            //     userNoteVector = NoteVector.from(
            //         userFlavorProfile.getScoreArray(),
            //         userFlavorProfile.getTags().stream()
            //             .collect(Collectors.toMap(t -> t.getTag().getId(), FlavorProfileTag::getWeight))
            //     );
            // } else {
            //     userNoteVector = recommendationScoreService.calculateScoreByUser(user.getId());
            // }
            // if (userNoteVector == null) continue;   // ← 취향 데이터 전혀 없는 유저만 스킵

            FlavorProfile userFlavorProfile = flavorProfileByUserId.get(user.getId());
            if (userFlavorProfile == null) continue;   // 프로필 없으면 스킵 (스케줄러가 주기적으로 생성)

            NoteVector userNoteVector = NoteVector.from(
                userFlavorProfile.getScoreArray(),
                userFlavorProfile.getTags().stream()
                    .collect(Collectors.toMap(t -> t.getTag().getId(), FlavorProfileTag::getWeight))
            );

            double score = recommendationScoreService.calcScore(targetVector, userNoteVector);
            tasteMatchDtos.add(TasteMatchDto.create(user, score));
        }

        tasteMatchDtos.sort(Comparator.comparingDouble(TasteMatchDto::similarity).reversed());
        return tasteMatchDtos.subList(0, Integer.min(tasteMatchDtos.size(), USER_RECOMMENDATION_SIZE));
    }
}
