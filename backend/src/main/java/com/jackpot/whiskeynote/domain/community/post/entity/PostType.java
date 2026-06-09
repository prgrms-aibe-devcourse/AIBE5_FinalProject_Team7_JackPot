// 커뮤니티 게시판 종류를 구분하는 열거형 - 하나의 posts 테이블을 논리적으로 여러 게시판으로 분리하기 위해 사용
package com.jackpot.whiskeynote.domain.community.post.entity;

/**
 * 게시판 유형 열거형.
 * 단일 posts 테이블에서 PostType으로 게시판을 구분하는 전략을 택한 이유:
 * - 게시판마다 별도 테이블을 두면 공통 기능(좋아요, 댓글, 검색) 코드가 중복됨
 * - 신규 게시판 추가 시 enum 값만 늘리면 되므로 스키마 변경 최소화
 *
 * 주의: DB 컬럼은 EnumType.STRING으로 저장되므로 enum 이름을 변경하면 기존 데이터와 불일치 발생
 */
public enum PostType {
    NOTICE,  // 공지사항 (관리자만 작성 가능하도록 서비스 레이어에서 권한 체크 필요)
    COLUMN,  // 전문가/운영자 칼럼
    QA,      // Q&A (질문/답변 형식)
    FREE,    // 자유 게시판
    FEED     // 피드 (소셜 형식의 짧은 게시글)
}
