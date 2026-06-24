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

    // 저장된 프로필을 "읽기만" 한다(쓰기 없음). 프로필 갱신은 추천(/recommend-whiskey)과
    // 스케줄러가 담당하므로, 매칭은 같은 프로필을 동시에 쓰지 않아 낙관적 락 충돌이 발생하지 않는다.
    @Transactional(readOnly = true)
    public List<TasteMatchDto> recommendByAll(Long userId) {
        // user - flavorProfile 연결 (본인 포함 모두 저장된 프로필을 읽는다)
        List<Users> users = usersRepository.findAll();
        List<FlavorProfile> flavorProfiles = flavorProfileRepository.findAllWithTag();
        Map<Long, FlavorProfile> flavorProfileByUserId = new HashMap<>();
        for (FlavorProfile flavorProfile : flavorProfiles) {
            flavorProfileByUserId.put(flavorProfile.getUserId(), flavorProfile);
        }

        // 본인 취향 벡터: 저장된 프로필을 읽는다(실시간 재계산 X). 없으면 매칭 불가 → 빈 목록
        FlavorProfile myProfile = flavorProfileByUserId.get(userId);
        if (myProfile == null) return Collections.emptyList();
        NoteVector targetVector = NoteVector.from(
            myProfile.getScoreArray(),
            myProfile.getTags().stream()
                .collect(Collectors.toMap(t -> t.getTag().getId(), FlavorProfileTag::getWeight))
        );

        // matching
        List<TasteMatchDto> tasteMatchDtos = new ArrayList<>();
        for (Users user : users) {
            if (user.getId().equals(userId)) continue;

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
