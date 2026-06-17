package com.jackpot.whiskeynote.domain.whiskey.entity;

import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyDescriptionDto;
import com.jackpot.whiskeynote.domain.whiskey.dto.WhiskeyOfficialNote;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Getter
@Table(name = "whiskeys")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Whiskey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private WhiskeyType type;

    private String brand;

    private String imageUrl;

    private Double abv;

    private Integer ageYears;

    @Enumerated(EnumType.STRING)
    private WhiskeyStatus status;

    private String country;

    private String cask;

    private Integer volume;

    private String nameEng;

    private Integer price;

    private String costUrl;

    private String costUrlSource;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private WhiskeyDescriptionDto description = new WhiskeyDescriptionDto();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private WhiskeyOfficialNote note = new WhiskeyOfficialNote();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
