package com.jackpot.whiskeynote.domain.member.oauth;

import com.jackpot.whiskeynote.domain.member.dto.TokenResponse;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.member.service.TokenIssuer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * AUTH-03 2단계 — authorization code → JWT 발급
 * - 호출: POST /api/v1/auth/oauth/{provider}/callback
 * - 흐름: OauthClient.fetchUserInfo → Users upsert → TokenIssuer
 * - 신규 가입: (authProvider, providerId) 매칭, 닉네임 중복 시 접미사, birthday placeholder
 * - provider 추가: OauthClient 구현 + @Component 등록 (List 자동 주입)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OauthLoginService {

    private static final LocalDate PLACEHOLDER_BIRTHDAY = LocalDate.of(1900, 1, 1);

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenIssuer tokenIssuer;
    private final List<OauthClient> oauthClients;

    // AUTH-03: 소셜 로그인
    // 의도: 기존 소셜 회원이면 조회, 없으면 자동 가입 후 이메일 로그인과 동일하게 JWT 발급
    @Transactional
    public TokenResponse login(AuthProvider provider, String code) {
        OauthClient client = oauthClients.stream()
                .filter(c -> c.provider() == provider)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 provider 입니다."));

        OauthUserInfo userInfo = client.fetchUserInfo(code);
        if (userInfo == null || isBlank(userInfo.providerUserId())) {
            throw new IllegalStateException("OAuth 사용자 정보 조회에 실패했습니다.");
        }

        Users user = usersRepository.findByAuthProviderAndProviderId(provider, userInfo.providerUserId())
                .orElseGet(() -> createUser(provider, userInfo));

        return tokenIssuer.issueTokens(user);
    }

    // 소셜 최초 가입
    // 의도: 최초 소셜 로그인 시 users 행 생성 — 로컬 비밀번호 로그인은 불가하도록 랜덤 해시
    private Users createUser(AuthProvider provider, OauthUserInfo userInfo) {
        String nickname = normalizeNickname(userInfo.nickname());
        while (usersRepository.existsByNickname(nickname)) {
            nickname = nickname + "_" + UUID.randomUUID().toString().substring(0, 6);
        }

        Users user = Users.builder()
                .email(userInfo.email())
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .authProvider(provider)
                .providerId(userInfo.providerUserId())
                .nickname(nickname)
                .birthday(PLACEHOLDER_BIRTHDAY)
                .build();

        return usersRepository.save(user);
    }

    // 닉네임 정규화
    // 의도: provider 닉네임 없을 때 충돌 없는 기본 닉네임 생성
    private static String normalizeNickname(String nickname) {
        if (isBlank(nickname)) {
            return "user_" + UUID.randomUUID().toString().substring(0, 8);
        }
        return nickname.trim();
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}

