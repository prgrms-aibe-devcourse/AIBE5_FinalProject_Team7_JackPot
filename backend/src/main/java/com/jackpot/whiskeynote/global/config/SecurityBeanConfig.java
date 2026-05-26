package com.jackpot.whiskeynote.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Security 관련 Bean 설정
 * SecurityConfig와 분리한 이유:
 * SecurityConfig에서 PasswordEncoder를 Bean으로 선언하면
 * 순환 참조(circular dependency) 발생 가능 → 별도 파일로 분리
 */
@Configuration
public class SecurityBeanConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
