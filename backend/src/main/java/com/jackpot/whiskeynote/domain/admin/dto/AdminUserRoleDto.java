package com.jackpot.whiskeynote.domain.admin.dto;

/**
 * 관리자 권한 변경 요청 Dto
 * role: "USER" or "ADMIN"
 */
public record AdminUserRoleDto(String role) {}
