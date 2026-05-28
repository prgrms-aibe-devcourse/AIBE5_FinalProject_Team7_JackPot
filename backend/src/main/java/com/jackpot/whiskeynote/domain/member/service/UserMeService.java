package com.jackpot.whiskeynote.domain.member.service;

import com.jackpot.whiskeynote.domain.member.dto.UpdateUserMeRequest;
import com.jackpot.whiskeynote.domain.member.dto.UserMeDto;
import com.jackpot.whiskeynote.domain.member.dto.NicknameAvailabilityResponse;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.global.storage.MediaUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMeService {

    private final UsersRepository usersRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private static final int NICKNAME_MIN = 2;
    private static final int NICKNAME_MAX = 20;
    private static final String NICKNAME_REGEX = "^[a-zA-Z0-9가-힣_]+$";

    public UserMeDto getMe(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return UserMeDto.from(user);
    }

    public NicknameAvailabilityResponse checkNicknameAvailable(String nickname) {
        String normalized = normalizeNickname(nickname);
        boolean available = !usersRepository.existsByNickname(normalized);
        return NicknameAvailabilityResponse.of(normalized, available);
    }

    @Transactional
    public UserMeDto updateMe(Long userId, UpdateUserMeRequest request) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            String newNickname = normalizeNickname(request.getNickname());
            if (usersRepository.existsByNicknameAndIdNot(newNickname, userId)) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.updateNickname(newNickname);
        } else if (request.getNickname() != null) {
            throw new IllegalArgumentException("닉네임은 비어있을 수 없습니다.");
        }

        if (request.getProfileImageUrl() != null) {
            String key = request.getProfileImageUrl().trim();
            if (key.isEmpty()) {
                user.updateProfileImageUrl(null);
            } else {
                MediaUploadService.validateProfileObjectKeyForUser(userId, key);
                user.updateProfileImageUrl(key);
            }
        }

        if (request.getBottleShareOptIn() != null) {
            user.updateBottleShareOptIn(request.getBottleShareOptIn());
        }

        if (request.getMarketingOptIn() != null) {
            user.updateMarketingOptIn(request.getMarketingOptIn());
        }

        return UserMeDto.from(user);
    }

    private String normalizeNickname(String nickname) {
        if (nickname == null) {
            throw new IllegalArgumentException("닉네임은 비어있을 수 없습니다.");
        }
        String normalized = nickname.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("닉네임은 비어있을 수 없습니다.");
        }
        if (normalized.length() < NICKNAME_MIN || normalized.length() > NICKNAME_MAX) {
            throw new IllegalArgumentException("닉네임은 2자 이상 20자 이하여야 합니다.");
        }
        if (!normalized.matches(NICKNAME_REGEX)) {
            throw new IllegalArgumentException("닉네임은 한글/영문/숫자/_(언더스코어)만 사용할 수 있습니다.");
        }
        return normalized;
    }

    // USER-04: 탈퇴
    @Transactional
    public void deleteMe(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        user.withdraw();
        // 탈퇴 시 RefreshToken 제거 → 재발급 불가
        refreshTokenRepository.deleteByUserId(userId);
    }
}

