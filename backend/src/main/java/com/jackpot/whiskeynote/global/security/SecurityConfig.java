package com.jackpot.whiskeynote.global.security;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * JWT 기반 stateless 인증
 * - permitAll: /api/v1/auth/register, login, refresh, oauth/**
 * - authenticated: /api/v1/users/me/** 등, /uploads/**, auth/logout, 커뮤니티 쓰기
 * - permitAll GET: /api/v1/users/{id}/picks, /api/v1/users/{id}/cabinet/stats (타인 캐비넷)
 * - 그 외 GET: MVP permitAll 유지
 * - 새 보호 API 추가 시 requestMatchers에 등록
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/auth/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/oauth/**",
                                "/api/v1/auth/refresh"
                        ).permitAll()
                        // 팔로우 API — JWT 인증 유저 기준으로 팔로우/언팔로우와 카운트 조회
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/followers",
                                "/api/v1/followings",
                                "/api/v1/follows/status",
                                "/api/v1/followers/list",
                                "/api/v1/followings/list",
                                "/api/v1/lounge/feed",
                                "/api/v1/lounge/popular",
                                "/api/v1/lounge/latest",
                                "/api/v1/lounge/trending-whiskeys",
                                "/api/v1/lounge/recommend-whiskey",
                                "/api/v1/lounge/suggested-users",
                                "/api/v1/lounge/today"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/follows"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/v1/follows"
                        ).authenticated()
                        .requestMatchers("/api/v1/auth/logout").authenticated()
                        // 취향 설문 — 결과 조회·저장은 인증 필수, 계산만은 비인증 허용
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/taste/survey/me",
                                "/api/v1/lounge/match",
                                "/api/v1/lounge/match/random"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/taste/survey/save"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/taste/survey"
                        ).permitAll()
                        // 타인 캐비넷·픽 목록·공개 프로필·공개 노트 조회 — 비로그인 허용 (/users/** 보다 위에 둘 것)
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/users/*/picks",
                                "/api/v1/users/*/cabinet/stats",
                                "/api/v1/users/*/profile",
                                "/api/v1/users/*/tasting-notes"
                        ).permitAll()
                        .requestMatchers("/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/uploads/**").authenticated()
                        // 커뮤니티 쓰기 (인증 필수)
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/posts",
                                "/api/v1/posts/*/comments",
                                "/api/v1/posts/*/likes"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.PATCH,
                                "/api/v1/posts/*",
                                "/api/v1/comments/*"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/v1/posts/*",
                                "/api/v1/posts/*/likes",
                                "/api/v1/comments/*"
                        ).authenticated()
                        // 픽 등록/삭제 — 인증 필요
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/whiskeys/*/pick"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/whiskeys/*/pick"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/v1/whiskeys/*/pick"
                        ).authenticated()
                        // 시음 노트 — my/작성은 인증, 단건 조회는 리뷰 첨부 공개 노트 허용
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/tasting-notes/my",
                                "/api/v1/whiskeys/*/notes/my"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/tasting-notes/*"
                        ).permitAll()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/tasting-notes",
                                "/api/v1/tasting-notes/analyze"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.PATCH,
                                "/api/v1/tasting-notes/*"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/v1/tasting-notes/*"
                        ).authenticated()
                        // 위시 — 전체 인증 필요 (비공개)
                        .requestMatchers(
                                "/api/v1/users/me/wishlists",
                                "/api/v1/users/me/wishlists/**",
                                "/api/v1/whiskeys/wish/**"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/whiskeys/*/wish"
                        ).authenticated()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/v1/whiskeys/*/wish/folders"
                        ).authenticated()
                        // 위스키 등록 요청 — 로그인 필요
                        .requestMatchers("/api/v1/whiskey-requests/**").authenticated()
                        // 신고 — 로그인 필요
                        .requestMatchers("/api/v1/reports/**").authenticated()
                        // 관리자 전용 API — ADMIN 권한만
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().permitAll()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
