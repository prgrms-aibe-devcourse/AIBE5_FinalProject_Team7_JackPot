package com.jackpot.whiskeynote.global.security;

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
 *
 * <p>인증 필요 (Bearer JWT):
 * <ul>
 *   <li>{@code /api/v1/users/**} — 마이페이지 (USER-01~04, SET-01)</li>
 *   <li>{@code /api/v1/uploads/**} — presign 업로드</li>
 *   <li>{@code POST /api/v1/auth/logout} — 로그아웃</li>
 *   <li>커뮤니티 POST/PATCH/DELETE — 글·댓글·좋아요 쓰기</li>
 * </ul>
 *
 * <p>인증 불필요 (permitAll):
 * <ul>
 *   <li>{@code /api/v1/auth/register, login, refresh, oauth/**} — 회원가입·로그인·소셜</li>
 *   <li>그 외 대부분 GET API — MVP 단계에서 기존 동작 유지</li>
 * </ul>
 *
 * <p>프론트: {@code apiClient}가 localStorage accessToken을 Authorization 헤더에 자동 첨부.
 * 새 보호 API 추가 시 여기 {@code requestMatchers}에 등록 필요.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource,
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
                        .requestMatchers("/api/v1/auth/logout").authenticated()
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
