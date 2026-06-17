package com.jackpot.whiskeynote.domain.lounge.service;

import com.jackpot.whiskeynote.domain.community.comment.repository.PostCommentRepository;
import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.entity.PostWhiskey;
import com.jackpot.whiskeynote.domain.community.post.repository.PostRepository;
import com.jackpot.whiskeynote.domain.community.post.repository.PostWhiskeyRepository;
import com.jackpot.whiskeynote.domain.lounge.dto.LoungePostResponse;
import com.jackpot.whiskeynote.domain.lounge.dto.LoungeTrendingWhiskeyResponse;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.follow.repository.FollowsRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LoungeService {

    private final FollowsRepository followsRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;
    private final PostCommentRepository postCommentRepository;
    private final PostWhiskeyRepository postWhiskeyRepository;
    private final WhiskeyRepository whiskeyRepository;

    @Transactional(readOnly = true)
    public List<LoungePostResponse> getLoungeFeed(Long userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        // 팔로우한 사용자들의 ID 목록 조회
        List<Long> followingIds = followsRepository.findFollowingIdsByFollowerId(userId);
        if (followingIds.isEmpty()) {
            return List.of();
        }
        // 팔로우한 사용자들의 게시글 조회 (페이징)
        List<Post> posts = postRepository.findByAuthorIdInAndIsDeletedFalse(followingIds, pageRequest);
        return buildResponses(posts);
    }

    /** 인기 피드 — 조회수 높은 순 (팔로잉과 무관, 라운지 발견 탭) */
    @Transactional(readOnly = true)
    public List<LoungePostResponse> getPopularFeed(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return buildResponses(postRepository.findByIsDeletedFalseOrderByViewCountDesc(pageRequest));
    }

    /** 최신 피드 — 최근 작성 순 (팔로잉과 무관, 라운지 발견 탭) */
    @Transactional(readOnly = true)
    public List<LoungePostResponse> getLatestFeed(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return buildResponses(
                postRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageRequest).getContent());
    }

    /** 게시글 목록 → LoungePostResponse 목록 변환 (작성자/댓글수/위스키명 일괄 조회). */
    private List<LoungePostResponse> buildResponses(List<Post> posts) {
        if (posts.isEmpty()) {
            return List.of();
        }
        List<Long> postIds = posts.stream().map(Post::getId).toList();
        List<Long> authorIds = posts.stream().map(Post::getAuthorId).distinct().toList();

        // 게시글 작성자 ID -> 사용자 정보 매핑 조회
        Map<Long, Users> userMap = usersRepository.findAllById(authorIds)
                .stream()
                .collect(Collectors.toMap(Users::getId, u -> u));
        Map<Long, Integer> commentCountMap = resolveCommentCounts(postIds);
        Map<Long, List<String>> whiskeyNamesMap = resolveWhiskeyNames(postIds);

        return posts.stream()
                .map(post -> {
                    Users author = userMap.get(post.getAuthorId());
                    String nickname = author != null ? author.getNickname() : "알 수 없는 사용자";
                    String profileImageUrl = author != null ? author.getProfileImageUrl() : null;
                    int commentCount = commentCountMap.getOrDefault(post.getId(), 0);
                    List<String> whiskeyNames = whiskeyNamesMap.getOrDefault(post.getId(), List.of());
                    return LoungePostResponse.from(post, nickname, profileImageUrl, commentCount, whiskeyNames);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoungeTrendingWhiskeyResponse> getTrendingWhiskeys(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 10));

        return postWhiskeyRepository.findTrendingWhiskeys(safeLimit).stream()
                .map(row -> new LoungeTrendingWhiskeyResponse(
                        row.getWhiskeyId(),
                        row.getWhiskeyName(),
                        row.getMentionCount()
                ))
                .toList();
    }

    private Map<Long, Integer> resolveCommentCounts(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return Map.of();
        }

        return postCommentRepository.countByPostIds(postIds)
                .stream()
                .collect(Collectors.toMap(
                        PostCommentRepository.PostCommentCount::getPostId,
                        count -> Math.toIntExact(count.getCommentCount())
                ));
    }

    private Map<Long, List<String>> resolveWhiskeyNames(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return Map.of();
        }

        List<PostWhiskey> postWhiskeys = postWhiskeyRepository.findByPostIdsOrderByPostAndOrder(postIds);
        List<Long> whiskeyIds = postWhiskeys.stream()
                .map(PostWhiskey::getWhiskeyId)
                .distinct()
                .toList();
        if (whiskeyIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, String> whiskeyNameMap = whiskeyRepository.findAllById(whiskeyIds)
                .stream()
                .collect(Collectors.toMap(Whiskey::getId, Whiskey::getName));

        return postWhiskeys.stream()
                .collect(Collectors.groupingBy(
                        PostWhiskey::getPostId,
                        Collectors.mapping(
                                postWhiskey -> whiskeyNameMap.get(postWhiskey.getWhiskeyId()),
                                Collectors.filtering(
                                        name -> name != null && !name.isBlank(),
                                        Collectors.toList()
                                )
                        )
                ));
    }
}
