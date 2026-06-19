package com.jackpot.whiskeynote.domain.member.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 * - MySQL users 테이블과 매핑
 * - 소셜 로그인: auth_provider + provider_id 조합으로 식별
 * - 로컬 로그인: email + password_hash 사용
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email",    columnNames = "email"),
        @UniqueConstraint(name = "uk_users_nickname", columnNames = "nickname"),
        @UniqueConstraint(name = "uk_users_provider", columnNames = {"auth_provider", "provider_id"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이메일 (로컬 가입 필수, 소셜 가입 NULL 허용)
    @Column(length = 255)
    private String email;

    // BCrypt 해시 (소셜 가입자는 NULL)
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    // 가입 방식: local / google / kakao / naver
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 32)
    private AuthProvider authProvider;

    // 소셜 로그인 시 provider 고유 ID
    @Column(name = "provider_id", length = 255)
    private String providerId;

    // 닉네임 (유니크)
    @Column(nullable = false, length = 64)
    private String nickname;

    // 실명 (선택)
    @Column(length = 128)
    private String name;

    // 생년월일
    @Column(nullable = false)
    private LocalDate birthday;

    // 프로필 이미지
    @Column(name = "profile_image_url", length = 255)
    private String profileImageUrl;

    // 프로필 소개
    @Column(columnDefinition = "TEXT")
    private String introduction;

    // 권한: user / admin / pro
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private Role role = Role.USER;

    // 온보딩 미완료 여부 (true=온보딩 필요, false=완료)
    @Column(name = "is_new_user", nullable = false)
    @Builder.Default
    private boolean newUser = true;

    // isNewUser getter 명시적 선언 (boolean + is 접두사 Lombok 충돌 방지)
    public boolean isNewUser() {
        return this.newUser;
    }

    // 이메일 인증 여부
    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private boolean isEmailVerified = false;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    // 탈퇴 여부
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_banned", nullable = false)
    @Builder.Default
    private boolean banned = false;

    @Column(name = "banned_at")
    private LocalDateTime bannedAt;

    // 마지막 로그인 시각 갱신
    public void updateLastLoginAt() {
        this.lastLoginAt = LocalDateTime.now();
    }

    // USER-02: 내 프로필 닉네임 수정
    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    // USER-02: 프로필 이미지 (S3 object key)
    public void updateProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    // USER-02: 프로필 소개
    public void updateIntroduction(String introduction) {
        this.introduction = introduction;
    }

    public void updatePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    // 온보딩 완료 처리 (SUR-01 설문 제출 시 호출)
    public void completeOnboarding() {
        this.newUser = false;
    }

    // USER-04: 탈퇴(소프트 삭제)
    public void withdraw() {
        if (this.deleted) {
            return;
        }
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    // ban 처리
    public void ban() {
        this.banned = true;
        this.bannedAt = LocalDateTime.now();
    }

    // unban 처리
    public void unban() {
        this.banned = false;
        this.bannedAt = null;
    }

    // 권한 변경 메서드
    public void updateRole(Role role) {
        this.role = role;
    }
}
