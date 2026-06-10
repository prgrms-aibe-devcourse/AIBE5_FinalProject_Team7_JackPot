package com.jackpot.whiskeynote.domain.taste.note.repository;

import com.jackpot.whiskeynote.domain.member.entity.AuthProvider;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNoteTag;
import com.jackpot.whiskeynote.domain.taste.note.vo.WhiskeyScoreVo;
import com.jackpot.whiskeynote.domain.taste.tag.entity.Tag;
import com.jackpot.whiskeynote.domain.taste.tag.entity.TagCategory;
import com.jackpot.whiskeynote.domain.taste.tag.repository.TagRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyStatus;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeyType;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TastingNoteRepositoryTest {

    @Autowired private TastingNoteRepository tastingNoteRepository;
    @Autowired private TastingNoteTagRepository tastingNoteTagRepository;
    @Autowired private UsersRepository usersRepository;
    @Autowired private WhiskeyRepository whiskeyRepository;
    @Autowired private TagRepository tagRepository;

    @Test
    @DisplayName("노트 ID로 시음노트와 노트 태그를 함께 조회한다")
    void findByIdWithTags() {
        Users user = usersRepository.save(user("note@test.com", "노트유저"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        Tag honey = tagRepository.save(tag(TagCategory.taste, "꿀", 2));
        TastingNote note = tastingNoteRepository.saveAndFlush(note(user, whiskey, false, List.of(vanilla, honey)));

        TastingNote result = tastingNoteRepository.findByIdWithTags(note.getId()).orElseThrow();

        assertThat(result.getId()).isEqualTo(note.getId());
        assertThat(result.getNoteTags()).hasSize(2);
    }

    @Test
    @DisplayName("특정 유저가 특정 위스키에 작성한 최신 공개 노트를 조회한다")
    void findFirstByUserIdAndWhiskeyIdAndIsDraftFalseOrderByUpdatedAtDesc() {
        Users user = usersRepository.save(user("public-note@test.com", "공개노트유저"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        TastingNote oldPublished = tastingNoteRepository.saveAndFlush(note(user, whiskey, false, List.of()));
        TastingNote latestPublished = tastingNoteRepository.saveAndFlush(note(user, whiskey, false, List.of()));
        tastingNoteRepository.saveAndFlush(note(user, whiskey, true, List.of()));

        TastingNote result = tastingNoteRepository
                .findFirstByUserIdAndWhiskeyIdAndIsDraftFalseOrderByUpdatedAtDesc(user.getId(), whiskey.getId())
                .orElseThrow();

        assertThat(result.getId()).isEqualTo(latestPublished.getId());
        assertThat(result.getId()).isNotEqualTo(oldPublished.getId());
        assertThat(result.getWhiskey().getName()).isEqualTo("글렌피딕 18년");
    }

    @Test
    @DisplayName("내 시음노트 목록은 수정일 최신순으로 위스키와 태그 정보를 함께 조회한다")
    void findByUserIdOrderByUpdatedAtDesc() {
        Users user = usersRepository.save(user("my-note@test.com", "내노트유저"));
        Users otherUser = usersRepository.save(user("other-note@test.com", "다른노트유저"));
        Whiskey glenfiddich = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Whiskey macallan = whiskeyRepository.save(whiskey("맥캘란 15년"));
        Tag vanilla = tagRepository.save(tag(TagCategory.nose, "바닐라", 1));
        TastingNote first = tastingNoteRepository.saveAndFlush(note(user, glenfiddich, false, List.of(vanilla)));
        TastingNote second = tastingNoteRepository.saveAndFlush(note(user, macallan, false, List.of(vanilla)));
        tastingNoteRepository.saveAndFlush(note(otherUser, glenfiddich, false, List.of(vanilla)));

        Page<TastingNote> result = tastingNoteRepository.findByUserIdOrderByUpdatedAtDesc(
                user.getId(),
                PageRequest.of(0, 10)
        );

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent())
                .extracting(TastingNote::getId)
                .containsExactly(second.getId(), first.getId());
        assertThat(result.getContent().getFirst().getWhiskey().getName()).isEqualTo("맥캘란 15년");
        assertThat(result.getContent().getFirst().getNoteTags().getFirst().getTag().getName()).isEqualTo("바닐라");
    }

    @Test
    @DisplayName("시음노트 태그는 태그 displayOrder 오름차순으로 조회된다")
    void findByNoteIdOrderByTagDisplayOrderAsc() {
        Users user = usersRepository.save(user("tag-order@test.com", "태그정렬유저"));
        Whiskey whiskey = whiskeyRepository.save(whiskey("글렌피딕 18년"));
        Tag late = tagRepository.save(tag(TagCategory.nose, "늦은 태그", 20));
        Tag early = tagRepository.save(tag(TagCategory.nose, "빠른 태그", 1));
        TastingNote note = tastingNoteRepository.saveAndFlush(note(user, whiskey, false, List.of(late, early)));

        List<TastingNoteTag> result = tastingNoteTagRepository.findByNote_IdOrderByTag_DisplayOrderAsc(note.getId());

        assertThat(result).extracting(noteTag -> noteTag.getTag().getName())
                .containsExactly("빠른 태그", "늦은 태그");
    }

    private TastingNote note(Users user, Whiskey whiskey, boolean draft, List<Tag> tags) {
        TastingNote note = TastingNote.create(
                user,
                whiskey,
                new WhiskeyScoreVo((short) 7, (short) 6, (short) 3, (short) 4, (short) 8),
                "테스트 시음 노트",
                draft
        );
        note.updateTags(tags);
        return note;
    }

    private Users user(String email, String nickname) {
        return Users.builder()
                .email(email)
                .passwordHash("password-hash")
                .authProvider(AuthProvider.LOCAL)
                .nickname(nickname)
                .birthday(LocalDate.of(1990, 1, 1))
                .build();
    }

    private Whiskey whiskey(String name) {
        return Whiskey.builder()
                .name(name)
                .type(WhiskeyType.single_malt)
                .abv(40.0)
                .ageYears(12)
                .status(WhiskeyStatus.active)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private Tag tag(TagCategory category, String name, int displayOrder) {
        return Tag.builder()
                .category(category)
                .name(name)
                .displayOrder(displayOrder)
                .imageUrl(null)
                .build();
    }
}
