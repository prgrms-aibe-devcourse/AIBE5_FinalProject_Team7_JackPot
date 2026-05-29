package com.jackpot.whiskeynote.domain.whiskey.repository;

import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyFilterRequest;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class WhiskeySpecification {
    public static Specification<Whiskey> filter(WhiskeyFilterRequest request) {
        // root: 검색대상 테이블 , query: 최종적으로 실행될 쿼리, criteriaBuilder: 조건문을 생성하는 도구
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            // predicate: where절에 들어갈 조건들을 담는 객체, 여러 조건이 있을 수 있기 때문에 List로 관리
            List<Predicate> predicates = new ArrayList<>();
            // 키워드 검색
            if (request.keyword() != null && !request.keyword().isBlank()) {
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("name")),
                                "%" + request.keyword().trim().toLowerCase() + "%"
                        )
                );
            }
            // 타입 필터링
            if (request.types() != null && !request.types().isEmpty()) {
                predicates.add(root.get("type").in(request.types()));
            }
            // 도수 필터링
            if (request.minAbv() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("abv"), request.minAbv()));
            }
            if (request.maxAbv() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("abv"), request.maxAbv()));
            }
            // 숙성연수 필터링
            if (request.minAge() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("ageYears"), request.minAge()));
            }
            if (request.maxAge() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("ageYears"), request.maxAge()));
            }
            // 태그 필터링 (노즈, 테이스트)
            if (request.noseTags() != null && !request.noseTags().isEmpty()) {
                predicates.add(hasTag(root, query.subquery(Long.class), criteriaBuilder, TagCategory.nose, request.noseTags()));
            }
            if (request.tasteTags() != null && !request.tasteTags().isEmpty()) {
                predicates.add(hasTag(root, query.subquery(Long.class), criteriaBuilder, TagCategory.taste, request.tasteTags()));
            }
            // 모든 조건들을 AND로 결합하여 최종 Predicate 생성
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    // 특정위스키가 특정 태그를 가지고 있는지 여부를 검사하는 서브쿼리를 생성하는 메서드
    private static Predicate hasTag(
            Root<Whiskey> whiskeyRoot,
            Subquery<Long> subquery,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
            TagCategory category,
            List<String> tagNames
    ) {
        Root<AvgWhiskeyTag> avgTagRoot = subquery.from(AvgWhiskeyTag.class);
        Join<AvgWhiskeyTag, WhiskeysNoteCache> cacheJoin = avgTagRoot.join("cache");
        var tagJoin = avgTagRoot.join("tag");

        subquery.select(avgTagRoot.get("id"))
                .where(
                        criteriaBuilder.equal(cacheJoin.get("whiskey"), whiskeyRoot),
                        criteriaBuilder.equal(tagJoin.get("category"), category),
                        tagJoin.get("name").in(tagNames)
                );

        return criteriaBuilder.exists(subquery);
    }
}

