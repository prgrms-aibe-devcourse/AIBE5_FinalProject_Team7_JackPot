// 위스키 칼럼의 출처 유형을 나타내는 열거형 — BLOG·YOUTUBE 두 채널만 지원
package com.jackpot.whiskeynote.domain.community.column.entity;

/**
 * 칼럼 수집 출처 구분 값.
 *
 * <p><b>주의 — DB 마이그레이션 필요:</b> 이 enum 값들은 {@code @Enumerated(EnumType.STRING)}으로
 * DB에 문자열 그대로 저장됩니다. 값 이름을 변경하면(예: BLOG → ARTICLE) 기존 레코드와 불일치가
 * 발생하므로, 반드시 Flyway 마이그레이션 스크립트(UPDATE 문)를 함께 작성해야 합니다.
 * {@code EnumType.ORDINAL}을 사용하지 않는 이유는 상수 순서 변경 시 데이터 오염 위험이 있기
 * 때문입니다.</p>
 */
public enum ColumnSourceType {
    BLOG, YOUTUBE
}
