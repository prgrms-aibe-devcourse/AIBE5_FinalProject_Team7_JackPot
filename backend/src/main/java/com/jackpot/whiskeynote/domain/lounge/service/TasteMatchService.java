package com.jackpot.whiskeynote.domain.lounge.service;

import com.jackpot.whiskeynote.domain.collection.pick.entity.MyPick;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.recommendation.dto.TasteMatchDto;
import com.jackpot.whiskeynote.domain.lounge.dto.UserVector;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.review.entity.Review;
import com.jackpot.whiskeynote.domain.taste.review.repository.ReviewRepository;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfile;
import com.jackpot.whiskeynote.domain.taste.survey.entity.UserTasteProfileTag;
import com.jackpot.whiskeynote.domain.taste.survey.repository.UserTasteProfileRepository;
import com.jackpot.whiskeynote.domain.taste.survey.repository.UserTasteProfileTagRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import com.jackpot.whiskeynote.global.util.SimilarityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TasteMatchService {

    private static final int TOP_POOL_SIZE = 10;

    private final UserTasteProfileRepository    profileRepository;
    private final UserTasteProfileTagRepository profileTagRepository;
    private final PickRepository                pickRepository;
    private final ReviewRepository              reviewRepository;
    private final WhiskeysNoteCacheRepository   cacheRepository;
    private final UsersRepository               usersRepository;

    // ==========================================================================
    // Public API
    // ==========================================================================

    /**
     * 라운지 위젯용 — 상위 10명 중 랜덤 1명 반환
     * 설문 미완료 or 매칭 유저 없으면 null 반환 (에러 없음)
     */
    @Transactional(readOnly = true)
    public TasteMatchDto getRandomMatch(Long userId) {
        List<TasteMatchDto> top = calcTopMatches(userId, TOP_POOL_SIZE);
        if (top.isEmpty()) return null;
        return top.get(new Random().nextInt(top.size()));
    }

    /**
     * 취향 비슷한 유저 목록 — 상위 10명 반환
     * 설문 미완료 or 매칭 유저 없으면 빈 리스트 반환 (에러 없음)
     */
    @Transactional(readOnly = true)
    public List<TasteMatchDto> getTopMatches(Long userId) {
        return calcTopMatches(userId, TOP_POOL_SIZE);
    }

    // ==========================================================================
    // Private — 매칭 계산
    // ==========================================================================

    private List<TasteMatchDto> calcTopMatches(Long userId, int limit) {

        // 1. 내 취향 벡터 생성
        // 설문 없어도 pick/리뷰가 있으면 벡터 생성 가능
        Optional<UserTasteProfile> myProfileOpt = profileRepository.findByUserId(userId);

        List<UserTasteProfileTag> myTags  = myProfileOpt
                .map(p -> profileTagRepository.findByProfileId(p.getId()))
                .orElse(List.of());
        List<MyPick>  myPicks   = pickRepository.findAllByUserIdWithWhiskey(userId);
        List<Review>  myReviews = reviewRepository.findAllByUserIdWithWhiskey(userId);

        // 설문, pick, 4점↑ 리뷰 모두 없으면 매칭 불가
        // (3점 이하 리뷰만 있는 경우도 포함)
        boolean hasAnything = myProfileOpt.isPresent()
                || !myPicks.isEmpty()
                || myReviews.stream().anyMatch(r -> r.getRating().compareTo(new java.math.BigDecimal("4")) >= 0);
        if (!hasAnything) return List.of();

        Set<Long> myWhiskeyIds = new HashSet<>();
        myPicks.forEach(p   -> myWhiskeyIds.add(p.getWhiskey().getId()));
        myReviews.forEach(r -> myWhiskeyIds.add(r.getWhiskey().getId()));
        Map<Long, WhiskeysNoteCache> myCacheMap = myWhiskeyIds.isEmpty() ? Map.of()
                : cacheRepository.findAllByWhiskeyIdWithTags(myWhiskeyIds).stream()
                        .collect(Collectors.toMap(c -> c.getWhiskey().getId(), c -> c));

        UserVector myVector = UserVector.build(
                myProfileOpt.orElse(null), myTags, myPicks, myReviews, myCacheMap);
        if (myVector == null) return List.of();

        // 2. 비교 대상: 프로필 보유 유저 (설문 완료자)
        List<UserTasteProfile> others = profileRepository.findAll().stream()
                .filter(p -> !p.getUserId().equals(userId))
                .toList();
        if (others.isEmpty()) return List.of();

        // 3. 배치 조회 (N+1 방지)
        Set<Long> otherUserIds    = others.stream().map(UserTasteProfile::getUserId).collect(Collectors.toSet());
        Set<Long> otherProfileIds = others.stream().map(UserTasteProfile::getId).collect(Collectors.toSet());

        Map<Long, Users> userMap = usersRepository.findAllById(otherUserIds).stream()
                .collect(Collectors.toMap(Users::getId, u -> u));
        Map<Long, List<UserTasteProfileTag>>  tagsByProfile = profileTagRepository.findByProfileIdIn(otherProfileIds).stream()
                .collect(Collectors.groupingBy(t -> t.getProfile().getId()));
        Map<Long, List<MyPick>> picksByUser = pickRepository.findAllByUserIdInWithWhiskey(otherUserIds).stream()
                .collect(Collectors.groupingBy(p -> p.getUser().getId()));
        Map<Long, List<Review>> reviewsByUser = reviewRepository.findAllByUserIdInWithWhiskey(otherUserIds).stream()
                .collect(Collectors.groupingBy(r -> r.getUser().getId()));

        // 5. 위스키 캐시 배치 조회
        Set<Long> whiskeyIds = new HashSet<>();
        picksByUser.values().forEach(list  -> list.forEach(p -> whiskeyIds.add(p.getWhiskey().getId())));
        reviewsByUser.values().forEach(list -> list.forEach(r -> whiskeyIds.add(r.getWhiskey().getId())));
        Map<Long, WhiskeysNoteCache> cacheMap = whiskeyIds.isEmpty() ? Map.of()
                : cacheRepository.findAllByWhiskeyIdWithTags(whiskeyIds).stream()
                        .collect(Collectors.toMap(c -> c.getWhiskey().getId(), c -> c));

        // 6. 유사도 계산 및 정렬
        return others.stream()
                .map(other -> {
                    Users user = userMap.get(other.getUserId());
                    // 탈퇴·밴 유저 제외
                    if (user == null || user.isDeleted() || user.isBanned()) return null;

                    UserVector otherVector = buildVectorForUser(
                            other,
                            tagsByProfile.getOrDefault(other.getId(), List.of()),
                            picksByUser.getOrDefault(other.getUserId(), List.of()),
                            reviewsByUser.getOrDefault(other.getUserId(), List.of()),
                            cacheMap
                    );
                    // UserVector가 null이면 해당 유저 매칭 스킵 (방어 처리)
                    if (otherVector == null) return null;
                    double score      = SimilarityUtils.calcScore(
                            myVector.scoreVec(), myVector.tagVector(),
                            otherVector.scoreVec(), otherVector.tagVector());
                    double similarity = Math.round(score * 1000.0) / 10.0;
                    return new TasteMatchDto(user.getId(), user.getNickname(),
                            user.getProfileImageUrl(), similarity);
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(TasteMatchDto::similarity).reversed())
                .limit(limit)
                .toList();
    }

    /** 프로필 + 태그 + picks + reviews → UserVector 생성 */
    private UserVector buildVectorForUser(UserTasteProfile profile,
                                          List<UserTasteProfileTag> tags,
                                          List<MyPick> picks,
                                          List<Review> reviews) {
        Set<Long> whiskeyIds = new HashSet<>();
        picks.forEach(p   -> whiskeyIds.add(p.getWhiskey().getId()));
        reviews.forEach(r -> whiskeyIds.add(r.getWhiskey().getId()));

        Map<Long, WhiskeysNoteCache> cacheMap = whiskeyIds.isEmpty() ? Map.of()
                : cacheRepository.findAllByWhiskeyIdWithTags(whiskeyIds).stream()
                        .collect(Collectors.toMap(c -> c.getWhiskey().getId(), c -> c));

        return UserVector.build(profile, tags, picks, reviews, cacheMap);
    }

    /** 배치 조회용 cacheMap 주입 버전 */
    private UserVector buildVectorForUser(UserTasteProfile profile,
                                          List<UserTasteProfileTag> tags,
                                          List<MyPick> picks,
                                          List<Review> reviews,
                                          Map<Long, WhiskeysNoteCache> cacheMap) {
        return UserVector.build(profile, tags, picks, reviews, cacheMap);
    }
}
