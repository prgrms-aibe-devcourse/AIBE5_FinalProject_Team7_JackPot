// 게시글 세부 카테고리 열거형 - 게시판(PostType) 내에서 주제별로 글을 분류하기 위해 사용
package com.jackpot.whiskeynote.domain.community.post.entity;

/**
 * 게시글 카테고리 열거형.
 * 현재 단일 문자(F, R, L, Q, G, B) 로 정의되어 있어 의미를 코드만으로 파악하기 어려움.
 * 추후 확장 시 아래 매핑 참고:
 *   F = Free (자유)
 *   R = Review (리뷰)
 *   L = Like/Recommendation (추천)
 *   Q = Question (질문)
 *   G = General (일반)
 *   B = Beginner (입문)
 *
 * 주의: DB 컬럼은 EnumType.STRING으로 저장되므로 enum 이름 변경 시 기존 데이터와 불일치 발생.
 *       의미를 명확히 하려면 enum 이름을 풀네임으로 바꾸고 DB 마이그레이션 스크립트를 함께 제공해야 함.
 */
public enum PostCategory {
    F, R, L, Q, G, B
}
