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
 * JWT 기반 stateless 인증.
 * - 로그인/회원 도메인 위주로 적용: users/**, uploads/**, auth/logout
 * - 그 외 API는 기존 동작을 깨지 않도록 기본 permitAll 유지
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
