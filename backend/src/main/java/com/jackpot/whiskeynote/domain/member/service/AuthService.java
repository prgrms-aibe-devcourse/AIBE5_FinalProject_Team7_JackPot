package com.jackpot.whiskeynote.domain.member.service;

import com.jackpot.whiskeynote.domain.member.dto.LoginRequest;
import com.jackpot.whiskeynote.domain.member.dto.RefreshRequest;
import com.jackpot.whiskeynote.domain.member.dto.RegisterRequest;
import com.jackpot.whiskeynote.domain.member.dto.TokenResponse;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.RefreshToken;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.RefreshTokenRepository;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 인증 비즈니스 로직
 * - AUTH-01: register — 이메일·닉네임 중복 확인 → BCrypt → TokenIssuer
 * - AUTH-02: login    — 비밀번호 검증 → TokenIssuer
 * - AUTH-04: refresh  — RefreshToken 검증 → AccessToken만 재발급
 * - AUTH-05: logout   — RefreshToken 삭제
 *
 * 토큰: Access 30분 / Refresh 14일 (refresh_tokens 테이블)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UsersRepository usersRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final TokenIssuer tokenIssuer;

    // AUTH-01: 회원가입
    // 의도: 중복 검증 후 LOCAL 계정 생성, 가입=로그인으로 TokenIssuer 호출
    @Transactional
    public TokenResponse register(RegisterRequest request) {

        // 이메일 중복 확인
        if (usersRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 확인
        if (usersRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 비밀번호 BCrypt 해시 후 MySQL에 사용자 저장
        Users user = Users.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .authProvider(AuthProvider.LOCAL)
                .nickname(request.getNickname())
                .birthday(request.getBirthday())
                .name(request.getName())
                .build();

        Users savedUser = usersRepository.save(user);

        // 토큰 발급 및 MySQL 저장
        return tokenIssuer.issueTokens(savedUser);
    }

    // AUTH-02: 로그인
    // 의도: BCrypt 검증 + lastLoginAt 갱신 후 JWT 발급
    @Transactional
    public TokenResponse login(LoginRequest request) {

        // 이메일로 사용자 조회
        Users user = usersRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 이메일 입니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // 탈퇴 계정 로그인 차단
        if (user.isDeleted()) {
            throw new IllegalArgumentException("탈퇴한 계정입니다.");
        }

        // 밴 계정 로그인 차단
        if (user.isBanned()) {
            throw new IllegalArgumentException("관리자에 의해 이용이 제한된 계정입니다.");
        }

        // 마지막 로그인 시각 갱신
        user.updateLastLoginAt();

        // 토큰 발급 및 MySQL 저장
        return tokenIssuer.issueTokens(user);
    }

    // AUTH-05: 로그아웃
    // 의도: refresh_tokens 행 삭제로 refresh 기반 재발급 차단
    @Transactional
    public void logout(Long userId) {
        // MySQL에서 RefreshToken 삭제 → 재발급 불가
        refreshTokenRepository.deleteByUserId(userId);
    }

    // AUTH-04: AccessToken 재발급
    // 의도: 유효한 Refresh만으로 Access 재발급 — Refresh는 교체하지 않음
    @Transactional
    public TokenResponse refresh(RefreshRequest request) {

        // DB에서 토큰 조회
        RefreshToken saved = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다. 다시 로그인해주세요."));

        // 만료 시각 체크
        if (saved.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(saved); // 만료 토큰 즉시 정리
            throw new IllegalArgumentException("만료된 토큰입니다. 다시 로그인해주세요.");
        }

        // userId로 사용자 조회
        Users user = usersRepository.findById(saved.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 새 AccessToken만 발급 (RefreshToken은 그대로 유지)
        String newAccessToken = jwtProvider.createAccessToken(user.getId(), user.getRole().name());

        return new TokenResponse(
                newAccessToken,
                saved.getToken(),
                user.getId(),
                user.isNewUser(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getRole().name()
        );
    }

}
