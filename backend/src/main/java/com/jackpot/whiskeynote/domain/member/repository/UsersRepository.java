package com.jackpot.whiskeynote.domain.member.repository;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * users 테이블 JPA Repository
 */
public interface UsersRepository extends JpaRepository<Users, Long> {

    // 이메일로 사용자 조회 (로컬 로그인 시 사용)
    Optional<Users> findByEmail(String email);

    Optional<Users> findByAuthProviderAndProviderId(AuthProvider authProvider, String providerId);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 관리자용 — 전체 목록 (최신 가입순)
    Page<Users> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 관리자용 — 이메일 또는 닉네임 검색 (최신 가입순)
    @Query("SELECT u FROM Users u WHERE " +
           "(:keyword IS NULL OR u.email LIKE %:keyword% OR u.nickname LIKE %:keyword%) " +
           "ORDER BY u.createdAt DESC")
    Page<Users> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 관리자용 — 밴 여부 필터
    Page<Users> findAllByBannedOrderByCreatedAtDesc(boolean banned, Pageable pageable);

    // 관리자용 — 탈퇴 여부 필터
    Page<Users> findAllByDeletedOrderByCreatedAtDesc(boolean deleted, Pageable pageable);
}
