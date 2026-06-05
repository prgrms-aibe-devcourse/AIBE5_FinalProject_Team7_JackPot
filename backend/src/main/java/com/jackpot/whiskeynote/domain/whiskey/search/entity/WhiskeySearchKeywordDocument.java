package com.jackpot.whiskeynote.domain.whiskey.search.entity;

import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "whiskey_search_keywords", createIndex = false)
public class WhiskeySearchKeywordDocument {
    @Id
    private String id; // 위스키 ID를 문자열로 저장

    @Field(type = FieldType.Text)
    private String keyword; // 자동완성에 보여줄 검색어

    @Field(type = FieldType.Integer)
    private Integer weight; //
}
