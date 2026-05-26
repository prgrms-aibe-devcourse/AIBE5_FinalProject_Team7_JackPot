package com.jackpot.whiskeynote.domain.member.repository;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * users 테이블 JPA Repository
 */
public interface UsersRepository extends JpaRepository<Users, Long> {

    // 이메일로 사용자 조회 (로컬 로그인 시 사용)
    Optional<Users> findByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 이메일 중복 확인
    boolean existsByEmail(String email);
}
