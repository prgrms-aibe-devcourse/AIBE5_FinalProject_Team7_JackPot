package com.jackpot.whiskeynote.domain.taste.survey.service;

import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyRequest;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyResultResponse;
import com.jackpot.whiskeynote.domain.taste.survey.dto.SurveyResultResponse.*;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import com.jackpot.whiskeynote.domain.taste.survey.repository.UserTasteProfileRepository;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
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

    private final WhiskeysNoteCacheRepository cacheRepository;
    private final TagRepository tagRepository;
    private final UserTasteProfileRepository profileRepository;

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

        List<WhiskeyRecommendation> recommendations = recommend(sweet, body, smoky, spicy, finish, allTagIdSet);

        return new SurveyResultResponse(profile, typeAndDesc[0], typeAndDesc[1], recommendations);
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
        return result;
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

        List<WhiskeyRecommendation> recs = recommend(
                p.getSweetScore(), p.getBodyScore(), p.getSmokyScore(), p.getSpicyScore(), p.getFinishScore(),
                allTagIds);

        return new SurveyResultResponse(profile, typeAndDesc[0], typeAndDesc[1], recs);
    }

    // ─── Private helpers ───────────────────────────────────────

    private List<WhiskeyRecommendation> recommend(int sweet, int body, int smoky, int spicy, int finish,
                                                   Set<Long> userTagIds) {
        double[] userVec = {sweet, body, smoky, spicy, finish};
        List<WhiskeysNoteCache> caches = cacheRepository.findAllWithTagsAndWhiskey();

        record ScoredCache(WhiskeysNoteCache cache, double score) {}

        List<ScoredCache> sorted = caches.stream()
                .filter(c -> c.getCount() != null && c.getCount() > 0)
                .map(c -> {
                    double[] wVec = {
                            normalize(c.getSweetScore(), c.getCount()),
                            normalize(c.getBodyScore(),  c.getCount()),
                            normalize(c.getSmokyScore(), c.getCount()),
                            normalize(c.getSpicyScore(), c.getCount()),
                            normalize(c.getFinishScore(), c.getCount())
                    };
                    Set<Long> whiskeyTagIds = c.getAvgWhiskeyTags().stream()
                            .map(t -> t.getTag().getId()).collect(Collectors.toSet());

                    double flavorSim = cosineSimilarity(userVec, wVec);
                    double tagSim    = jaccardSimilarity(userTagIds, whiskeyTagIds);
                    double score     = 0.5 * flavorSim + 0.5 * tagSim;
                    return new ScoredCache(c, score);
                })
                .sorted(Comparator.comparingDouble(ScoredCache::score).reversed())
                .limit(3)
                .toList();

        List<WhiskeyRecommendation> result = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            ScoredCache sc = sorted.get(i);
            result.add(new WhiskeyRecommendation(
                    i + 1,
                    sc.cache().getWhiskey().getId(),
                    sc.cache().getWhiskey().getName(),
                    sc.cache().getWhiskey().getImageUrl(),
                    Math.round(sc.score() * 1000.0) / 1000.0,
                    generateReason(sc.cache(), sweet, smoky)
            ));
        }
        return result;
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

    /** 캐시 합산값을 0~100 정규화 (note score 1~9 → (avg-1)/8*100) */
    private double normalize(Long sum, int count) {
        if (sum == null || count <= 0) return 0;
        double avg = (double) sum / count;
        return Math.max(0, Math.min(100, (avg - 1) / 8.0 * 100));
    }

    private double cosineSimilarity(double[] a, double[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot   += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private double jaccardSimilarity(Set<Long> userTags, Set<Long> whiskeyTags) {
        if (userTags.isEmpty() && whiskeyTags.isEmpty()) return 0;
        Set<Long> intersection = new HashSet<>(userTags);
        intersection.retainAll(whiskeyTags);
        Set<Long> union = new HashSet<>(userTags);
        union.addAll(whiskeyTags);
        return union.isEmpty() ? 0 : (double) intersection.size() / union.size();
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

    private String generateReason(WhiskeysNoteCache cache, int userSweet, int userSmoky) {
        double avgSweet  = normalize(cache.getSweetScore(), cache.getCount());
        double avgSmoky  = normalize(cache.getSmokyScore(), cache.getCount());
        double avgFinish = normalize(cache.getFinishScore(), cache.getCount());

        List<String> reasons = new ArrayList<>();
        if (userSweet >= 50 && avgSweet >= 50) reasons.add("달콤한 풍미");
        if (userSmoky >= 50 && avgSmoky >= 50) reasons.add("스모키함");
        if (avgFinish >= 60) reasons.add("긴 피니시");
        if (reasons.isEmpty()) reasons.add("균형잡힌 맛");
        return String.join(", ", reasons) + "이 취향과 잘 맞습니다.";
    }
}
