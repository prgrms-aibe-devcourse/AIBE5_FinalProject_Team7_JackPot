package com.jackpot.whiskeynote.domain.taste.note.controller;

import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteCreateRequest;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteResponse;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteTagResponse;
import com.jackpot.whiskeynote.domain.taste.note.dto.TastingNoteUpdateRequest;
import com.jackpot.whiskeynote.domain.taste.note.entity.TastingNote;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteRepository;
import com.jackpot.whiskeynote.domain.taste.note.repository.TastingNoteTagRepository;
import com.jackpot.whiskeynote.domain.taste.note.service.TastingNoteService;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class TastingNoteController {

    private final TastingNoteRepository tastingNoteRepository;
    private final TastingNoteTagRepository tastingNoteTagRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;
    private final TastingNoteService tastingNoteService;
    // 리뷰 작성 시, 특정 위스키에 대해 내가 작성한 공개 시음 노트 조회
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
    // 첨부된 시음 노트 상세 조회
    @GetMapping("/api/v1/tasting-notes/{noteId}")
    public TastingNoteResponse getTastingNote(@PathVariable Long noteId) {
        TastingNote note = tastingNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "시음 노트를 찾을 수 없습니다."
                ));

        return toResponse(note);
    }
    // 시음 노트 생성
    @PostMapping("/api/v1/tasting-notes")
    @ResponseStatus(HttpStatus.CREATED)
    public TastingNoteResponse createTastingNote(
            @RequestParam Long userId,
            @Valid@RequestBody TastingNoteCreateRequest request){
        return tastingNoteService.createTastingNote(userId,request);
    }
    // 시음 노트 수정
    @PatchMapping("/api/v1/tasting-notes/{noteId}")
    public TastingNoteResponse updateTastingNote(
            @PathVariable Long noteId,
            @RequestParam Long userId,
            @Valid@RequestBody TastingNoteUpdateRequest request){
        return tastingNoteService.updateTastingNote(userId, noteId, request);
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
