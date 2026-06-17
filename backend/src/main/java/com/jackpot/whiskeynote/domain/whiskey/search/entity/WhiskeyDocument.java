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

import java.util.List;

@Document(indexName = "whiskeys_current", createIndex = false)
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
    // 별칭은 여러 개가 있을 수 있으므로 리스트로 저장. 검색 시에도 텍스트 분석기로 처리하여 유연한 검색이 가능하도록 설정.
    @Field(type = FieldType.Text)
    private List<String> aliases;
    // 검색 시 name과 aliases를 함께 분석하여 검색할 수 있도록 별도의 필드로 설정. 검색어가 name이나 aliases 중 하나와 일치하면 검색 결과에 포함되도록 설정.
    @Field(
            type = FieldType.Text,
            analyzer = "whiskey_index_analyzer",
            searchAnalyzer = "whiskey_search_analyzer"
    )
    private String searchText;
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
