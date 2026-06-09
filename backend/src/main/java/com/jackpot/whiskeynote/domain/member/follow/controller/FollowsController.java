package com.jackpot.whiskeynote.domain.member.follow.controller;

import com.jackpot.whiskeynote.domain.member.follow.dto.FollowUserResponse;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowsCountResponse;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowsRequest;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowsResponse;
import com.jackpot.whiskeynote.domain.member.follow.dto.FollowsStatusResponse;
import com.jackpot.whiskeynote.domain.member.follow.service.FollowsService;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FollowsController {

    private final FollowsService followsService;
    // 나를 팔로우하는 사람 수 조회
    @GetMapping("/api/v1/followers")
    public FollowsCountResponse getFollows(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(required = false) Long userId
            ) {
        Long targetUserId = userId != null ? userId : principal.userId();
        return followsService.getFollowerCount(targetUserId);
    }
    // 내가 팔로우하는 사람 수 조회
    @GetMapping("/api/v1/followings")
    public FollowsCountResponse getFollowings(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(required = false) Long userId
    ) {
        Long targetUserId = userId != null ? userId : principal.userId();
        return followsService.getFollowingCount(targetUserId);
    }

    // 현재 로그인 사용자가 특정 사용자를 팔로우 중인지 조회
    @GetMapping("/api/v1/follows/status")
    public FollowsStatusResponse getFollowStatus(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam Long targetUserId
    ) {
        return followsService.getFollowStatus(principal.userId(), targetUserId);
    }

    // 특정 사용자를 팔로우하는 사용자 목록 조회
    @GetMapping("/api/v1/followers/list")
    public List<FollowUserResponse> getFollowerList(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(required = false) Long userId
    ) {
        Long targetUserId = userId != null ? userId : principal.userId();
        return followsService.getFollowers(targetUserId);
    }

    // 특정 사용자가 팔로우하는 사용자 목록 조회
    @GetMapping("/api/v1/followings/list")
    public List<FollowUserResponse> getFollowingList(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam(required = false) Long userId
    ) {
        Long targetUserId = userId != null ? userId : principal.userId();
        return followsService.getFollowings(targetUserId);
    }

    // 팔로우
    @PostMapping("/api/v1/follows")
    @ResponseStatus(HttpStatus.CREATED)
    public FollowsResponse follow(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestBody @Valid FollowsRequest request
    ) {
        return followsService.addFollow(principal.userId(), request.targetUserId());
    }

    // 언팔로우
    @DeleteMapping("/api/v1/follows")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollow(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestBody @Valid FollowsRequest request
    ) {
        followsService.removeFollow(principal.userId(), request.targetUserId());
    }
}
