package com.jackpot.whiskeynote.domain.lounge.service;

import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.repository.PostRepository;
import com.jackpot.whiskeynote.domain.lounge.dto.LoungePostResponse;
import com.jackpot.whiskeynote.domain.member.follow.repository.FollowsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LoungeService {

    private final FollowsRepository followsRepository;
    private final PostRepository postRepository;

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

        // 게시글을 LoungePostResponse로 변환
        List<LoungePostResponse> postInfos = posts.stream()
                .map(LoungePostResponse::from)
                .toList();

        return postInfos;
    }
}
