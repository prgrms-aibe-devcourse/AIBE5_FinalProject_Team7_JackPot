package com.jackpot.whiskeynote.domain.member.service;

import com.jackpot.whiskeynote.domain.member.dto.UpdateUserMeRequest;
import com.jackpot.whiskeynote.domain.member.dto.UserMeDto;
import com.jackpot.whiskeynote.domain.member.dto.UpdateMyPasswordRequest;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.global.storage.MediaUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMeService {

    private final UsersRepository usersRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserMeDto getMe(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return UserMeDto.from(user);
    }

    @Transactional
    public UserMeDto updateMe(Long userId, UpdateUserMeRequest request) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (request.getNickname() != null) {
            String newNickname = request.getNickname().trim();
            if (newNickname.isEmpty()) {
                throw new IllegalArgumentException("닉네임은 비어있을 수 없습니다.");
            }
            if (!newNickname.equals(user.getNickname()) && usersRepository.existsByNickname(newNickname)) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.updateNickname(newNickname);
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

        return UserMeDto.from(user);
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

    // SET-01: 비밀번호 변경 (local 계정만)
    @Transactional
    public void updateMyPassword(Long userId, UpdateMyPasswordRequest request) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new IllegalArgumentException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new IllegalStateException("비밀번호 정보가 존재하지 않습니다.");
        }
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        user.updatePasswordHash(passwordEncoder.encode(request.newPassword()));
    }
}

