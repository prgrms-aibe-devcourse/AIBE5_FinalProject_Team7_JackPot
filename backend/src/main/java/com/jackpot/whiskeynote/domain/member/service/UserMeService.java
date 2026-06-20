package com.jackpot.whiskeynote.domain.member.service;

import com.jackpot.whiskeynote.domain.member.dto.UpdateUserMeRequest;
import com.jackpot.whiskeynote.domain.member.dto.UserMeDto;
import com.jackpot.whiskeynote.domain.member.dto.PublicUserDto;
import com.jackpot.whiskeynote.domain.member.dto.UpdateMyPasswordRequest;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.global.exception.BannedUserException;
import com.jackpot.whiskeynote.global.storage.MediaUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * 마이페이지 비즈니스 로직
 * - USER-01: getMe — 프로필 조회
 * - USER-02: updateMe — nickname, profileImageUrl(S3 key, 소유 검증)
 * - USER-04: deleteMe — 탈퇴 + RefreshToken 삭제
 * - SET-01: updateMyPassword — LOCAL 계정만
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMeService {

    private final UsersRepository usersRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    // USER-01: 내 프로필 조회
    // 의도: Entity → DTO 변환 (프론트에 passwordHash 등 노출 방지)
    public UserMeDto getMe(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return UserMeDto.from(user);
    }

    // 타인 공개 프로필 조회 (닉네임·프로필 이미지)
    // 의도: 리뷰/픽 등 다른 데이터 존재 여부와 무관하게 항상 닉네임·프로필 이미지를 가져올 수 있어야 함
    // 밴·탈퇴 계정은 타 캐비넷 조회와 동일하게 차단
    public PublicUserDto getPublicProfile(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."));
        if (user.isBanned() || user.isDeleted()) {
            throw new BannedUserException();
        }
        return PublicUserDto.from(user);
    }

    // USER-02: 내 프로필 수정
    // 의도: 명세 필드만 갱신, profileImageUrl은 본인 S3 key인지 검증
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

        if (request.getIntroduction() != null) {
            String intro = request.getIntroduction().trim();
            user.updateIntroduction(intro.isEmpty() ? null : intro);
        }

        return UserMeDto.from(user);
    }

    // USER-04: 탈퇴
    // 의도: soft withdraw + RefreshToken 삭제로 세션 완전 종료
    @Transactional
    public void deleteMe(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        user.withdraw();
        // 탈퇴 시 RefreshToken 제거 → 재발급 불가
        refreshTokenRepository.deleteByUserId(userId);
    }

    // SET-01: 비밀번호 변경 (local 계정만)
    // 의도: 현재 비밀번호 확인 후 LOCAL만 해시 갱신
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

