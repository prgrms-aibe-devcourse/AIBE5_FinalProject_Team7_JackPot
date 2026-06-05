package com.jackpot.whiskeynote.domain.whiskey.search.entity;

import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "whiskeys", createIndex = false)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhiskeyDocument {
    @Id
    private Long id;
    // 로컬 기본 Elasticsearch 이미지에는 nori 분석기가 없으므로 우선 기본 Text 분석기로 검색한다.
    // 한국어 검색 품질을 높일 때는 nori 플러그인이 포함된 이미지/설정을 준비한 뒤 analyzer를 추가한다.
    @Field(type = FieldType.Text)
    private String name;
    // Enum -> Keyword로 저장하여 정확한 일치 검색이 가능하도록 설정
    @Field(type = FieldType.Keyword)
    private WhiskeyType type;

    @Field(type = FieldType.Keyword)
    private String region;

    @Field(type = FieldType.Keyword)
    private String country;

    @Field(type = FieldType.Keyword)
    private String cask;

    @Field(type = FieldType.Double)
    private Double abv;

    @Field(type = FieldType.Integer)
    private Integer ageYears;

    @Field(type = FieldType.Keyword)
    private String imageUrl;
}
