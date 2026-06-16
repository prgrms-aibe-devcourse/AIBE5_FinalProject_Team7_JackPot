package com.jackpot.whiskeynote.domain.taste.survey.service;

import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.survey.dto.EnthusiastSurveyRequest;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyRequest;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyResultResponse;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyResultResponse.*;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import com.jackpot.whiskeynote.domain.taste.survey.repository.UserTasteProfileRepository;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import com.jackpot.whiskeynote.domain.recommendation.service.WhiskeyRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TasteSurveyService {

    private final WhiskeysNoteCacheRepository cacheRepository;
    private final TagRepository tagRepository;
    private final UserTasteProfileRepository profileRepository;
    private final WhiskeyRecommendationService whiskeyRecommendationService;
    private final UsersRepository usersRepository;

    @Transactional(readOnly = true)
    public SurveyResultResponse calculate(SurveyRequest req) {
        int sweet  = choiceToScore(req.sweetChoice());
        int body   = choiceToScore(req.bodyChoice());
        int smoky  = choiceToScore(req.smokyChoice());
        int spicy  = choiceToScore(req.spicyChoice());
        int finish = choiceToScore(req.finishChoice());

        List<Long> noseTagIds  = req.noseTags()  != null ? req.noseTags()  : List.of();
        List<Long> tasteTagIds = req.tasteTags() != null ? req.tasteTags() : List.of();

        Set<Long> allTagIdSet = new HashSet<>();
        allTagIdSet.addAll(noseTagIds);
        allTagIdSet.addAll(tasteTagIds);

        Map<Long, Tag> tagMap = tagRepository.findAllById(new ArrayList<>(allTagIdSet))
                .stream().collect(Collectors.toMap(Tag::getId, t -> t));

        List<Tag> noseTags  = noseTagIds.stream()
                .map(tagMap::get).filter(Objects::nonNull).toList();
        List<Tag> tasteTags = tasteTagIds.stream()
                .map(tagMap::get).filter(Objects::nonNull).toList();

        FlavorProfile profile = new FlavorProfile(
                sweet, body, smoky, spicy, finish,
                noseTags.stream().map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList(),
                tasteTags.stream().map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList()
        );

        String[] typeAndDesc = classifyUserType(sweet, body, smoky, spicy, finish);

        List<WhiskeyRecommendationResponse> recommendationResponses = whiskeyRecommendationService.recommendBySurvey(
            scoreToVo(body, finish, smoky, spicy, sweet), allTagIdSet
        );

        return new SurveyResultResponse(profile, typeAndDesc[0], typeAndDesc[1], recommendationResponses);
    }

    /** 설문 계산 + 저장을 한 번에 처리 (취향 반영하기 버튼) */
    @Transactional
    public SurveyResultResponse calculateAndSave(SurveyRequest req, Long userId) {
        SurveyResultResponse result = calculate(req);
        int sweet  = choiceToScore(req.sweetChoice());
        int body   = choiceToScore(req.bodyChoice());
        int smoky  = choiceToScore(req.smokyChoice());
        int spicy  = choiceToScore(req.spicyChoice());
        int finish = choiceToScore(req.finishChoice());
        List<Long> noseTagIds  = req.noseTags()  != null ? req.noseTags()  : List.of();
        List<Long> tasteTagIds = req.tasteTags() != null ? req.tasteTags() : List.of();
        saveProfile(userId, sweet, body, smoky, spicy, finish, noseTagIds, tasteTagIds, result.userType());
        completeOnboarding(userId);
        return result;
    }

    private void completeOnboarding(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        user.completeOnboarding();
    }

    @Transactional
    public void saveProfile(Long userId, int sweet, int body, int smoky, int spicy, int finish,
                            List<Long> noseTagIds, List<Long> tasteTagIds, String userType) {
        String noseStr  = noseTagIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        String tasteStr = tasteTagIds.stream().map(String::valueOf).collect(Collectors.joining(","));

        UserTasteProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            profileRepository.save(UserTasteProfile.builder()
                    .userId(userId)
                    .sweetScore(sweet).bodyScore(body).smokyScore(smoky)
                    .spicyScore(spicy).finishScore(finish)
                    .noseTagIds(noseStr).tasteTagIds(tasteStr)
                    .userType(userType)
                    .build());
        } else {
            profile.update(sweet, body, smoky, spicy, finish, noseStr, tasteStr, userType);
        }
    }

    // ─── 애호가 설문 ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SurveyResultResponse calculateEnthusiast(EnthusiastSurveyRequest req) {
        int sweet  = choiceToScore(req.sweetChoice());
        int body   = choiceToScore(req.bodyChoice());
        int smoky  = choiceToScore(req.smokyChoice());
        int spicy  = choiceToScore(req.spicyChoice());
        int finish = choiceToScore(req.finishChoice());

        // 강도(intensity)가 높을수록 추천 가중치를 높이기 위해 intensity 2인 태그를 두 번 포함
        Set<Long> allTagIdSet = buildWeightedTagSet(req.noseTags(), req.tasteTags());

        Map<Long, Tag> tagMap = tagRepository.findAllById(new ArrayList<>(
                        buildFlatTagSet(req.noseTags(), req.tasteTags())))
                .stream().collect(Collectors.toMap(Tag::getId, t -> t));

        List<Tag> noseTags  = req.noseTags()  != null ? req.noseTags().keySet().stream()
                .map(tagMap::get).filter(Objects::nonNull).toList() : List.of();
        List<Tag> tasteTags = req.tasteTags() != null ? req.tasteTags().keySet().stream()
                .map(tagMap::get).filter(Objects::nonNull).toList() : List.of();

        FlavorProfile profile = new FlavorProfile(
                sweet, body, smoky, spicy, finish,
                noseTags.stream().map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList(),
                tasteTags.stream().map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList()
        );

        String[] typeAndDesc = classifyUserType(sweet, body, smoky, spicy, finish);

        List<WhiskeyRecommendationResponse> recommendationResponses = whiskeyRecommendationService.recommendBySurvey(
                scoreToVo(body, finish, smoky, spicy, sweet), allTagIdSet
        );

        return new SurveyResultResponse(profile, typeAndDesc[0], typeAndDesc[1], recommendationResponses);
    }

    @Transactional
    public SurveyResultResponse calculateAndSaveEnthusiast(EnthusiastSurveyRequest req, Long userId) {
        SurveyResultResponse result = calculateEnthusiast(req);

        int sweet  = choiceToScore(req.sweetChoice());
        int body   = choiceToScore(req.bodyChoice());
        int smoky  = choiceToScore(req.smokyChoice());
        int spicy  = choiceToScore(req.spicyChoice());
        int finish = choiceToScore(req.finishChoice());

        Set<Long> flatTagSet = buildFlatTagSet(req.noseTags(), req.tasteTags());
        String noseStr  = req.noseTags()  != null ? req.noseTags().keySet().stream()
                .map(String::valueOf).collect(Collectors.joining(",")) : "";
        String tasteStr = req.tasteTags() != null ? req.tasteTags().keySet().stream()
                .map(String::valueOf).collect(Collectors.joining(",")) : "";

        String styleStr   = req.styleTags() != null ? String.join(",", req.styleTags()) : "";
        String noseWeightsStr  = encodeWeights(req.noseTags());
        String tasteWeightsStr = encodeWeights(req.tasteTags());

        UserTasteProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            profileRepository.save(UserTasteProfile.builder()
                    .userId(userId)
                    .sweetScore(sweet).bodyScore(body).smokyScore(smoky)
                    .spicyScore(spicy).finishScore(finish)
                    .noseTagIds(noseStr).tasteTagIds(tasteStr)
                    .userType(result.userType())
                    .surveyType("ENTHUSIAST")
                    .styleTags(styleStr)
                    .noseTagWeights(noseWeightsStr)
                    .tasteTagWeights(tasteWeightsStr)
                    .explorationLevel(req.explorationLevel())
                    .build());
        } else {
            profile.updateEnthusiast(sweet, body, smoky, spicy, finish,
                    noseStr, tasteStr, result.userType(),
                    styleStr, noseWeightsStr, tasteWeightsStr, req.explorationLevel());
        }

        completeOnboarding(userId);
        return result;
    }

    /** tagId=intensity 형식으로 직렬화 — 예: "1=2,7=1,8=2" */
    private String encodeWeights(Map<Long, Integer> tags) {
        if (tags == null || tags.isEmpty()) return "";
        return tags.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining(","));
    }

    /** intensity 2인 태그를 두 번 포함해 추천 가중치를 높임 */
    private Set<Long> buildWeightedTagSet(Map<Long, Integer> noseTags, Map<Long, Integer> tasteTags) {
        Set<Long> set = new HashSet<>();
        if (noseTags  != null) noseTags.forEach((id, w)  -> { set.add(id); if (w >= 2) set.add(id); });
        if (tasteTags != null) tasteTags.forEach((id, w) -> { set.add(id); if (w >= 2) set.add(id); });
        return set;
    }

    private Set<Long> buildFlatTagSet(Map<Long, Integer> noseTags, Map<Long, Integer> tasteTags) {
        Set<Long> set = new HashSet<>();
        if (noseTags  != null) set.addAll(noseTags.keySet());
        if (tasteTags != null) set.addAll(tasteTags.keySet());
        return set;
    }

    @Transactional(readOnly = true)
    public SurveyResultResponse getMyProfile(Long userId) {
        UserTasteProfile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "저장된 취향 프로필이 없습니다."));

        List<Long> noseIds  = p.getNoseTagIdList();
        List<Long> tasteIds = p.getTasteTagIdList();

        Set<Long> allTagIds = new HashSet<>();
        allTagIds.addAll(noseIds);
        allTagIds.addAll(tasteIds);

        Map<Long, Tag> tagMap = tagRepository.findAllById(new ArrayList<>(allTagIds))
                .stream().collect(Collectors.toMap(Tag::getId, t -> t));

        FlavorProfile profile = new FlavorProfile(
                p.getSweetScore(), p.getBodyScore(), p.getSmokyScore(), p.getSpicyScore(), p.getFinishScore(),
                noseIds.stream().map(tagMap::get).filter(Objects::nonNull)
                        .map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList(),
                tasteIds.stream().map(tagMap::get).filter(Objects::nonNull)
                        .map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList()
        );

        String[] typeAndDesc = classifyUserType(
                p.getSweetScore(), p.getBodyScore(), p.getSmokyScore(), p.getSpicyScore(), p.getFinishScore());

        List<WhiskeyRecommendationResponse> recs = new ArrayList<>();
        // List<WhiskeyRecommendation> recs = recommend(
        //         p.getSweetScore(), p.getBodyScore(), p.getSmokyScore(), p.getSpicyScore(), p.getFinishScore(),
        //         allTagIds);

        return new SurveyResultResponse(profile, typeAndDesc[0], typeAndDesc[1], recs);
    }

    // ─── Private helpers ───────────────────────────────────────

    private WhiskeyScoreVo scoreToVo(int body, int finish, int smoky, int spicy, int sweet) {
        return new WhiskeyScoreVo(
            (short) (body / 25 * 2 + 1),
            (short) (finish / 25 * 2 + 1),
            (short) (smoky / 25 * 2 + 1),
            (short) (spicy / 25 * 2 + 1),
            (short) (sweet / 25 * 2 + 1)
        );
    }

    private int choiceToScore(int choice) {
        return switch (choice) {
            case 1 -> 0;
            case 2 -> 25;
            case 3 -> 50;
            case 4 -> 75;
            default -> 100;
        };
    }

    private String[] classifyUserType(int sweet, int body, int smoky, int spicy, int finish) {
        if (smoky >= 75) {
            return new String[]{"🔥 피트 탐험가", "스모키하고 강렬한 개성을 즐기는 탐험가형. 피트향 위스키에서 진가를 발휘합니다."};
        }
        if (sweet >= 75 && body >= 50) {
            return new String[]{"🍯 달콤한 버번파", "달콤하고 묵직한 스타일을 선호하는 타입. 꿀, 바닐라, 캐러멜 향의 위스키와 잘 맞습니다."};
        }
        if (finish >= 75 && smoky < 50) {
            return new String[]{"🍎 과일향 싱글몰트파", "깔끔하면서 긴 여운을 즐기는 섬세한 타입. 과실향이 풍부한 싱글몰트에 잘 어울립니다."};
        }
        if (body >= 75 && spicy >= 50) {
            return new String[]{"🥃 묵직한 셰리파", "진하고 스파이시한 복합적인 맛을 즐기는 타입. 셰리 캐스크 숙성 위스키와 잘 맞습니다."};
        }
        return new String[]{"⚖️ 균형잡힌 미각파", "특정 스타일에 치우치지 않고 다양한 위스키를 고루 즐기는 올라운더형."};
    }

}
