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
 * AUTH-03 2단계: authorization code → JWT 발급
 *
 * <p>흐름: {@code OauthClient.fetchUserInfo(code)} → DB upsert → {@link TokenIssuer#issueTokens}.
 *
 * <p>신규 사용자 자동 가입 규칙:
 * <ul>
 *   <li>매칭 키: {@code (authProvider, providerId)} — {@code UsersRepository.findByAuthProviderAndProviderId}</li>
 *   <li>닉네임: provider에서 받은 값, 없으면 {@code user_xxxxxxxx}, 중복 시 접미사 추가</li>
 *   <li>birthday: MVP placeholder {@code 1900-01-01} (온보딩/설문에서 갱신 예정)</li>
 *   <li>passwordHash: OAuth 전용 랜덤 값 (로컬 로그인 불가)</li>
 * </ul>
 *
 * <p>새 provider 추가: {@link OauthClient} 구현 + {@code @Component} 등록 →
 * {@code List<OauthClient>}에 자동 주입. {@code AuthProvider} enum·SecurityConfig 변경 불필요.
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

