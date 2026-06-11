package com.jackpot.whiskeynote.domain.admin.controller;

import com.jackpot.whiskeynote.domain.admin.dto.AdminUserDto;
import com.jackpot.whiskeynote.domain.admin.dto.AdminUserRoleDto;
import com.jackpot.whiskeynote.domain.admin.service.AdminUserService;
import com.jackpot.whiskeynote.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 사용자 관리 API
 *
 * GET    /api/v1/admin/users              ADM-USR-01: 사용자 목록 (검색/필터/페이징)
 * PATCH  /api/v1/admin/users/{id}/role   ADM-USR-02: 권한 변경
 * PATCH  /api/v1/admin/users/{id}/ban    ADM-USR-03: 밴 처리
 * PATCH  /api/v1/admin/users/{id}/unban  ADM-USR-04: 밴 해제
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // ADM-USR-01: 사용자 목록 조회
    @GetMapping
    public ApiResponse<Page<AdminUserDto>> getUsers(
            @RequestParam(required = false) String keyword,  // 이메일/닉네임 검색
            @RequestParam(required = false) String filter,   // all | banned | deleted
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(adminUserService.findUsers(keyword, filter, page, size));
    }

    // ADM-USR-02: 권한 변경 (USER ↔ ADMIN)
    @PatchMapping("/{id}/role")
    public ApiResponse<AdminUserDto> updateRole(
            @PathVariable Long id,
            @RequestBody AdminUserRoleDto dto
    ) {
        return ApiResponse.ok(adminUserService.updateRole(id, dto.role()));
    }

    // ADM-USR-03: 밴 처리
    @PatchMapping("/{id}/ban")
    public ApiResponse<AdminUserDto> banUser(@PathVariable Long id) {
        return ApiResponse.ok(adminUserService.banUser(id));
    }

    // ADM-USR-04: 밴 해제
    @PatchMapping("/{id}/unban")
    public ApiResponse<AdminUserDto> unbanUser(@PathVariable Long id) {
        return ApiResponse.ok(adminUserService.unbanUser(id));
    }
}
