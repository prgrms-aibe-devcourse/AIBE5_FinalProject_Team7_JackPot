package com.jackpot.whiskeynote.domain.member.follow.service;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowUserResponse;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowsCountResponse;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowsResponse;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowsStatusResponse;
import com.jackpot.whiskeynote.domain.member.follow.entity.Follows;
import com.jackpot.whiskeynote.domain.member.follow.repository.FollowsRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FollowsService {
    private final UsersRepository usersRepository;
    private final FollowsRepository followsRepository;
    // 팔로우 추가
    public FollowsResponse addFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자기 자신은 팔로우할 수 없습니다.");
        }

        if (!usersRepository.existsById(followerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "팔로워를 찾을 수 없습니다.");
        }

        if (!usersRepository.existsById(followingId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "팔로우할 사용자를 찾을 수 없습니다.");
        }

        if (followsRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 팔로우한 사용자입니다.");
        }
        Follows follows = Follows.create(followerId, followingId);
        Follows savedFollows = followsRepository.save(follows);
        return FollowsResponse.from(savedFollows);
    }

    // 팔로우 삭제
    public void removeFollow(Long followerId, Long followingId) {
        Follows follows = followsRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "팔로우 관계를 찾을 수 없습니다."));
        followsRepository.delete(follows);
    }

    // 팔로워 수 조회
    @Transactional(readOnly = true)
    public FollowsCountResponse getFollowerCount(Long userId) {
        validateUserExists(userId);
        return new FollowsCountResponse(followsRepository.countByFollowingId(userId));
    }


    // 팔로잉 수 조회
    @Transactional(readOnly = true)
    public FollowsCountResponse getFollowingCount(Long userId) {
        validateUserExists(userId);
        return new FollowsCountResponse(followsRepository.countByFollowerId(userId));
    }

    @Transactional(readOnly = true)
    public FollowsStatusResponse getFollowStatus(Long followerId, Long followingId) {
        validateUserExists(followerId);
        validateUserExists(followingId);
        return new FollowsStatusResponse(
                followsRepository.existsByFollowerIdAndFollowingId(followerId, followingId)
        );
    }

    // 특정 사용자를 팔로우하는 사용자 목록 조회
    @Transactional(readOnly = true)
    public List<FollowUserResponse> getFollowers(Long userId) {
        validateUserExists(userId);

        List<Long> followerIds = followsRepository.findByFollowingIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(Follows::getFollowerId)
                .toList();

        return toUserResponses(followerIds);
    }
    // 특정 사용자가 팔로우하는 사용자 목록 조회
    @Transactional(readOnly = true)
    public List<FollowUserResponse> getFollowings(Long userId) {
        validateUserExists(userId);

        List<Long> followingIds = followsRepository.findByFollowerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(Follows::getFollowingId)
                .toList();

        return toUserResponses(followingIds);
    }

    private void validateUserExists(Long userId) {
        if (!usersRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }
    }

    // 사용자 ID 목록을 받아서 해당 사용자들의 정보를 FollowUserResponse DTO로 변환하는 메서드
    private List<FollowUserResponse> toUserResponses(List<Long> userIds) {
        if (userIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Users> userMap = usersRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(Users::getId, Function.identity()));

        return userIds.stream()
                .map(userMap::get)
                .filter(user -> user != null && !user.isDeleted())
                .map(FollowUserResponse::from)
                .toList();
    }
}
