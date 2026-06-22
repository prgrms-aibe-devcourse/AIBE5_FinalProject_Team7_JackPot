package com.jackpot.whiskeynote.domain.taste.survey.service;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.recommendation.dto.WhiskeyRecommendationResponse;
import com.jackpot.whiskeynote.domain.recommendation.service.WhiskeyRecommendationService;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyRequest;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyResultResponse;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyResultResponse.*;
import com.jackpot.whiskeynote.domain.taste.survey.dto.TagBundle;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfileTag;
import com.jackpot.whiskeynote.domain.taste.survey.repository.UserTasteProfileRepository;
import com.jackpot.whiskeynote.domain.taste.survey.repository.UserTasteProfileTagRepository;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
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

    private final TagRepository                 tagRepository;
    private final UserTasteProfileRepository    profileRepository;
    private final UserTasteProfileTagRepository profileTagRepository;
    private final WhiskeyRecommendationService  whiskeyRecommendationService;
    private final UsersRepository               usersRepository;

    // ==========================================================================
    // Public API — 입문자 설문
    // ==========================================================================

    /** 결과 계산만 (저장 없음, 로그인 불필요) */
    @Transactional(readOnly = true)
    public SurveyResultResponse calculate(SurveyRequest req) {
        int[] scores   = parseScores(req);
        TagBundle tags = loadTags(req.noseTags(), req.tasteTags());
        return buildResponse(scores, tags);
    }

    /** 결과 계산 + DB 저장 (로그인 필수) */
    @Transactional
    public SurveyResultResponse calculateAndSave(SurveyRequest req, Long userId) {
        int[] scores   = parseScores(req);
        TagBundle tags = loadTags(req.noseTags(), req.tasteTags());

        UserTasteProfile profile = upsertProfile(userId, scores);
        saveTags(profile, tags);
        completeOnboarding(userId);

        return buildResponse(scores, tags);
    }

    // ==========================================================================
    // Public API — 애호가 설문
    // ==========================================================================

    /** 결과 계산만 (저장 없음, 로그인 불필요) */
    @Transactional(readOnly = true)
    public SurveyResultResponse calculateEnthusiast(SurveyRequest req) {
        int[] scores   = parseScores(req);
        TagBundle tags = loadTags(req.noseTags(), req.tasteTags());
        return buildResponseEnthusiast(scores, tags, req.ageMin(), req.ageMax());
    }

    /** 결과 계산 + DB 저장 (로그인 필수) */
    @Transactional
    public SurveyResultResponse calculateAndSaveEnthusiast(SurveyRequest req, Long userId) {
        int[] scores   = parseScores(req);
        TagBundle tags = loadTags(req.noseTags(), req.tasteTags());
        String styleStr = req.styleTags() != null ? String.join(",", req.styleTags()) : "";

        UserTasteProfile profile = upsertEnthusiastProfile(userId, scores, styleStr, req.explorationLevel());
        saveTags(profile, tags);
        completeOnboarding(userId);

        return buildResponseEnthusiast(scores, tags, req.ageMin(), req.ageMax());
    }

    // ==========================================================================
    // Public API — 내 프로필 조회
    // ==========================================================================

    @Transactional(readOnly = true)
    public SurveyResultResponse getMyProfile(Long userId) {
        UserTasteProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "저장된 취향 프로필이 없습니다."));

        List<UserTasteProfileTag> noseTags  = profileTagRepository.findNoseTagsByProfileId(profile.getId());
        List<UserTasteProfileTag> tasteTags = profileTagRepository.findTasteTagsByProfileId(profile.getId());

        Set<Long> allTagIds = new HashSet<>();
        noseTags.forEach(t  -> allTagIds.add(t.getTag().getId()));
        tasteTags.forEach(t -> allTagIds.add(t.getTag().getId()));
        Map<Long, Tag> tagMap = fetchTagMap(allTagIds);

        FlavorSummary flavorProfile = new FlavorSummary(
                profile.getSweetScore(), profile.getBodyScore(),
                profile.getSmokyScore(), profile.getSpicyScore(), profile.getFinishScore(),
                noseTags.stream()
                        .map(t -> tagMap.get(t.getTag().getId())).filter(Objects::nonNull)
                        .map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList(),
                tasteTags.stream()
                        .map(t -> tagMap.get(t.getTag().getId())).filter(Objects::nonNull)
                        .map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList()
        );

        String[] typeAndDesc = classifyUserType(
                profile.getSweetScore(), profile.getBodyScore(),
                profile.getSmokyScore(), profile.getSpicyScore(), profile.getFinishScore());

        return new SurveyResultResponse(flavorProfile, typeAndDesc[0], typeAndDesc[1], List.of());
    }

    // ==========================================================================
    // Private — DB 저장
    // ==========================================================================

    /** 입문자 프로필 upsert */
    private UserTasteProfile upsertProfile(Long userId, int[] scores) {
        return profileRepository.findByUserId(userId)
                .map(existing -> {
                    existing.update(scores[4], scores[0], scores[2], scores[3], scores[1]);
                    return existing;
                })
                .orElseGet(() -> profileRepository.save(UserTasteProfile.builder()
                        .userId(userId)
                        .bodyScore(scores[0]).finishScore(scores[1])
                        .smokyScore(scores[2]).spicyScore(scores[3]).sweetScore(scores[4])
                        .build()));
    }

    /** 애호가 프로필 upsert */
    private UserTasteProfile upsertEnthusiastProfile(Long userId, int[] scores,
                                                      String styleTags, Integer explorationLevel) {
        return profileRepository.findByUserId(userId)
                .map(existing -> {
                    existing.updateEnthusiast(
                            scores[4], scores[0], scores[2], scores[3], scores[1],
                            styleTags, explorationLevel);
                    return existing;
                })
                .orElseGet(() -> profileRepository.save(UserTasteProfile.builder()
                        .userId(userId)
                        .bodyScore(scores[0]).finishScore(scores[1])
                        .smokyScore(scores[2]).spicyScore(scores[3]).sweetScore(scores[4])
                        .surveyType("ENTHUSIAST")
                        .styleTags(styleTags)
                        .explorationLevel(explorationLevel)
                        .build()));
    }

    /** 태그 재저장 — 기존 전체 삭제 후 새로 삽입 */
    private void saveTags(UserTasteProfile profile, TagBundle tags) {
        profileTagRepository.deleteByProfileId(profile.getId());

        List<UserTasteProfileTag> newTags = new ArrayList<>();
        tags.noseTags().forEach(tag  -> newTags.add(UserTasteProfileTag.of(profile, tag, "nose")));
        tags.tasteTags().forEach(tag -> newTags.add(UserTasteProfileTag.of(profile, tag, "taste")));
        profileTagRepository.saveAll(newTags);
    }

    /** 온보딩 완료 처리 */
    private void completeOnboarding(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        user.completeOnboarding();
    }

    // ==========================================================================
    // Private — 계산 및 변환
    // ==========================================================================

    /** SurveyRequest → 점수 배열 [body, finish, smoky, spicy, sweet] */
    private int[] parseScores(SurveyRequest req) {
        return new int[]{
            choiceToScore(req.bodyChoice()),
            choiceToScore(req.finishChoice()),
            choiceToScore(req.smokyChoice()),
            choiceToScore(req.spicyChoice()),
            choiceToScore(req.sweetChoice()),
        };
    }

    /** 태그 ID 목록 → TagBundle (Tag 엔티티 로드 + 합집합 계산) */
    private TagBundle loadTags(List<Long> noseTagIds, List<Long> tasteTagIds) {
        List<Long> safeNose  = noseTagIds  != null ? noseTagIds  : List.of();
        List<Long> safeTaste = tasteTagIds != null ? tasteTagIds : List.of();

        Set<Long> allIds = new HashSet<>(safeNose);
        allIds.addAll(safeTaste);

        Map<Long, Tag> tagMap = fetchTagMap(allIds);
        List<Tag> nose  = safeNose.stream().map(tagMap::get).filter(Objects::nonNull).toList();
        List<Tag> taste = safeTaste.stream().map(tagMap::get).filter(Objects::nonNull).toList();

        return new TagBundle(nose, taste, allIds);
    }

    /** FlavorProfile + 유저 타입 + 추천 결과 조립 */
    private SurveyResultResponse buildResponse(int[] scores, TagBundle tags) {
        // scores: [body, finish, smoky, spicy, sweet]
        int body = scores[0], finish = scores[1], smoky = scores[2],
            spicy = scores[3], sweet = scores[4];

        FlavorSummary profile = new FlavorSummary(
                sweet, body, smoky, spicy, finish,
                tags.noseTags().stream()
                        .map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList(),
                tags.tasteTags().stream()
                        .map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList()
        );
        String[] typeAndDesc = classifyUserType(sweet, body, smoky, spicy, finish);
        List<WhiskeyRecommendationResponse> recs = whiskeyRecommendationService.recommendBySurvey(
            scoreToScoreVec(body, finish, smoky, spicy, sweet), tags.allTagIds());

        return new SurveyResultResponse(profile, typeAndDesc[0], typeAndDesc[1], recs);
    }
    
    private SurveyResultResponse buildResponseEnthusiast(int[] scores, TagBundle tags,
        Integer ageMin, Integer ageMax) {
        int body=scores[0], finish=scores[1], smoky=scores[2], spicy=scores[3], sweet=scores[4];
        FlavorSummary profile = new FlavorSummary(sweet, body, smoky, spicy, finish,
            tags.noseTags().stream().map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList(),
            tags.tasteTags().stream().map(t -> new TagInfo(t.getId(), t.getName(), t.getImageUrl())).toList());
        String[] td = classifyUserType(sweet, body, smoky, spicy, finish);
        List<WhiskeyRecommendationResponse> recs = whiskeyRecommendationService.recommendBySurvey(
            scoreToScoreVec(body, finish, smoky, spicy, sweet), tags.allTagIds(), ageMin, ageMax);
        return new SurveyResultResponse(profile, td[0], td[1], recs);
    }
    // ==========================================================================
    // Private — 점수 변환 유틸
    // ==========================================================================

    private Map<Long, Tag> fetchTagMap(Set<Long> tagIds) {
        return tagRepository.findAllById(new ArrayList<>(tagIds))
                .stream().collect(Collectors.toMap(Tag::getId, t -> t));
    }

    private double[] scoreToScoreVec(int body, int finish, int smoky, int spicy, int sweet) {
        return new double[]{
            (double) body / 10,
            (double) finish / 10,
            (double) smoky / 10,
            (double) spicy / 10,
            (double) sweet / 10
        };
    }

    /** 선택지(1~5) → 점수(0, 25, 50, 75, 100) */
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
        if (smoky >= 75)
            return new String[]{"🔥 피트 탐험가", "스모키하고 강렬한 개성을 즐기는 탐험가형. 피트향 위스키에서 진가를 발휘합니다."};
        if (sweet >= 75 && body >= 50)
            return new String[]{"🍯 달콤한 버번파", "달콤하고 묵직한 스타일을 선호하는 타입. 꿀, 바닐라, 캐러멜 향의 위스키와 잘 맞습니다."};
        if (finish >= 75 && smoky < 50)
            return new String[]{"🍎 과일향 싱글몰트파", "깔끔하면서 긴 여운을 즐기는 섬세한 타입. 과실향이 풍부한 싱글몰트에 잘 어울립니다."};
        if (body >= 75 && spicy >= 50)
            return new String[]{"🥃 묵직한 셰리파", "진하고 스파이시한 복합적인 맛을 즐기는 타입. 셰리 캐스크 숙성 위스키와 잘 맞습니다."};
        return new String[]{"⚖️ 균형잡힌 미각파", "특정 스타일에 치우치지 않고 다양한 위스키를 고루 즐기는 올라운더형."};
    }
}
