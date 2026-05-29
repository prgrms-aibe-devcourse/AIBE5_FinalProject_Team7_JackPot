package com.jackpot.whiskeynote.domain.taste.note.controller;

import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteResponse;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteTagResponse;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteTagRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class TastingNoteController {

    private final TastingNoteRepository tastingNoteRepository;
    private final TastingNoteTagRepository tastingNoteTagRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;

    @GetMapping("/api/v1/whiskeys/{whiskeyId}/notes/my")
    public ResponseEntity<TastingNoteResponse> getMyNoteForReview(
            @PathVariable Long whiskeyId,
            @RequestParam Long userId
    ) {
        if (!usersRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }

        if (!whiskeyRepository.existsById(whiskeyId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키를 찾을 수 없습니다.");
        }

        return tastingNoteRepository
                .findFirstByUserIdAndWhiskeyIdAndIsDraftFalseOrderByUpdatedAtDesc(userId, whiskeyId)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/api/v1/tasting-notes/{noteId}")
    public TastingNoteResponse getTastingNote(@PathVariable Long noteId) {
        TastingNote note = tastingNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "시음 노트를 찾을 수 없습니다."
                ));

        return toResponse(note);
    }

    private TastingNoteResponse toResponse(TastingNote note) {
        return TastingNoteResponse.from(
                note,
                tastingNoteTagRepository.findByNote_IdOrderByTag_DisplayOrderAsc(note.getId())
                        .stream()
                        .map(noteTag -> TastingNoteTagResponse.from(noteTag.getTag()))
                        .toList()
        );
    }
}
