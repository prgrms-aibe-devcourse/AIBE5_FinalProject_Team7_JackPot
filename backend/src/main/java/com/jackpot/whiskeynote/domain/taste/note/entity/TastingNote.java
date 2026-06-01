package com.jackpot.whiskeynote.domain.taste.note.entity;

import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "tasting_notes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TastingNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiskey_id", nullable = false)
    private Whiskey whiskey;

    @Column(name = "body_score")
    private Short bodyScore;

    @Column(name = "finish_score")
    private Short finishScore;

    @Column(name = "smoky_score")
    private Short smokyScore;

    @Column(name = "spicy_score")
    private Short spicyScore;

    @Column(name = "sweet_score")
    private Short sweetScore;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String memo;

    @Column(name = "is_draft", nullable = false)
    private Boolean isDraft;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TastingNoteTag> noteTags = new ArrayList<>();

    public List<TastingNoteTag> getNoteTags() {
        return Collections.unmodifiableList(noteTags);
    }

    /**
     * TastingNote 생성 정적 팩토리 메서드입니다.
     *
     * <p>엔티티가 DTO에 의존하지 않도록 필요한 값을 직접 파라미터로 받습니다.
     * 외부에서 직접 생성자를 호출하는 것을 막고,
     * 생성 시점의 의도를 명확히 표현하기 위해 정적 팩토리 메서드를 사용합니다.
     *
     * @param user     노트 작성자
     * @param whiskey  노트 대상 위스키
     * @param scoreVo  위스키 점수 VO (body, finish, smoky, spicy, sweet)
     * @param memo     노트 메모
     * @param isDraft  임시저장 여부 (true: 임시저장, false: 공개)
     * @return 생성된 TastingNote 인스턴스
     */

    public static TastingNote create(Users user, Whiskey whiskey, WhiskeyScoreVo scoreVo, String memo, Boolean isDraft) {
        TastingNote note = new TastingNote();
        note.user = user;
        note.whiskey = whiskey;
        note.bodyScore = scoreVo.bodyScore();
        note.finishScore = scoreVo.finishScore();
        note.smokyScore = scoreVo.smokyScore();
        note.spicyScore = scoreVo.spicyScore();
        note.sweetScore = scoreVo.sweetScore();
        note.memo = memo;
        note.isDraft = Boolean.TRUE.equals(isDraft);
        note.createdAt = LocalDateTime.now();
        note.updatedAt = LocalDateTime.now();

        return note;
    }

    /**
     * 테이스팅 노트의 점수, 메모, 임시저장 여부를 수정합니다.
     *
     * @param scoreVo  수정할 위스키 점수 VO
     * @param memo     수정할 메모
     * @param isDraft  수정할 임시저장 여부
     */
    public void update(WhiskeyScoreVo scoreVo, String memo, Boolean isDraft) {
        this.bodyScore = scoreVo.bodyScore();
        this.finishScore = scoreVo.finishScore();
        this.smokyScore = scoreVo.smokyScore();
        this.spicyScore = scoreVo.spicyScore();
        this.sweetScore = scoreVo.sweetScore();
        this.memo = memo;
        this.isDraft = Boolean.TRUE.equals(isDraft);

        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 현재 점수 필드를 WhiskeyScoreVo로 반환합니다.
     *
     * <p>수정 전 점수를 캐시에서 차감할 때 사용합니다.
     *
     * @return 현재 점수 VO
     */
    public WhiskeyScoreVo getScoreVo() {
        return new WhiskeyScoreVo(bodyScore, finishScore, smokyScore, spicyScore, sweetScore);
    }

    /**
     * 테이스팅 노트의 태그 목록을 수정합니다.
     *
     * <p>새 태그 목록과 기존 태그 목록을 비교하여
     * 삭제된 태그는 제거하고 추가된 태그는 새로 생성합니다.
     * orphanRemoval로 인해 제거된 TastingNoteTag는 DB에서도 자동 삭제됩니다.
     *
     * @param newTags 수정할 태그 목록
     */
    public void updateTags(List<Tag> newTags) {
        Set<Long> newTagIds = newTags.stream()
            .map(Tag::getId)
            .collect(Collectors.toSet());

        Set<Long> existingTagIds = this.noteTags.stream()
            .map(nt -> nt.getTag().getId())
            .collect(Collectors.toSet());


        // 새 목록에 없는 태그 제거 (orphanRemoval로 DB에서도 자동 삭제)
        this.noteTags.removeIf(nt -> !newTagIds.contains(nt.getTag().getId()));

        // 기존에 없던 태그만 추가
        newTags.stream()
            .filter(tag -> !existingTagIds.contains(tag.getId()))
            .map(tag -> TastingNoteTag.create(this, tag))
            .forEach(this.noteTags::add);
    }
}
