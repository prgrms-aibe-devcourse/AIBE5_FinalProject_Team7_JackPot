package com.jackpot.whiskeynote.domain.admin.service;

import com.jackpot.whiskeynote.domain.admin.dto.AdminUserDto;
import com.jackpot.whiskeynote.domain.member.entity.Role;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * 관리자 사용자 관리 서비스
 * - 목록 조회 (검색 / 필터 / 페이징)
 * - 권한 변경 (USER ↔ ADMIN)
 * - 밴 / 밴 해제
 */
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UsersRepository usersRepository;

    // ── 사용자 목록 조회 ─────────────────────────────
    // ADM-USR-01: 전체 목록 / 검색 / 필터 (페이징)
    @Transactional(readOnly = true)
    public Page<AdminUserDto> findUsers(String keyword, String filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // 검색어가 있으면 검색 우선
        if (keyword != null && !keyword.isBlank()) {
            return usersRepository.searchByKeyword(keyword.trim(), pageable)
                    .map(AdminUserDto::from);
        }

        // 필터 적용
        return switch (filter == null ? "all" : filter) {
            case "banned"  -> usersRepository.findAllByBannedOrderByCreatedAtDesc(true, pageable)
                                             .map(AdminUserDto::from);
            case "deleted" -> usersRepository.findAllByDeletedOrderByCreatedAtDesc(true, pageable)
                                             .map(AdminUserDto::from);
            default        -> usersRepository.findAllByOrderByCreatedAtDesc(pageable)
                                             .map(AdminUserDto::from);
        };
    }

    // ── 권한 변경 ────────────────────────────────────
    // ADM-USR-02: USER ↔ ADMIN 전환 (PRO 제외)
    @Transactional
    public AdminUserDto updateRole(Long userId, String roleName) {
        Users user = findUserOrThrow(userId);

        Role role;
        try {
            role = Role.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 권한입니다. (USER 또는 ADMIN)");
        }

        // 혹시나 PRO 권한 부여는 관리자 화면에서 부여 불가
        if (role == Role.PRO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PRO 권한은 이 화면에서 변경할 수 없습니다.");
        }

        user.updateRole(role);
        return AdminUserDto.from(user);
    }

    // ── 밴 처리 ──────────────────────────────────────
    // ADM-USR-03: 사용자 밴
    @Transactional
    public AdminUserDto banUser(Long userId) {
        Users user = findUserOrThrow(userId);

        if (user.isBanned()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 밴 처리된 사용자입니다.");
        }
        if (user.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "탈퇴한 사용자는 밴할 수 없습니다.");
        }

        user.ban();
        return AdminUserDto.from(user);
    }

    // ── 밴 해제 ──────────────────────────────────────
    // ADM-USR-04: 사용자 밴 해제
    @Transactional
    public AdminUserDto unbanUser(Long userId) {
        Users user = findUserOrThrow(userId);

        if (!user.isBanned()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "밴 처리되지 않은 사용자입니다.");
        }

        user.unban();
        return AdminUserDto.from(user);
    }

    private Users findUserOrThrow(Long userId) {
        return usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }
}
