package com.jackpot.whiskeynote.domain.collection.pick.service;

import com.jackpot.whiskeynote.domain.collection.pick.dto.PickResponse;
import com.jackpot.whiskeynote.domain.collection.pick.dto.PickStatusResponse;
import com.jackpot.whiskeynote.domain.collection.pick.entity.MyPick;
import com.jackpot.whiskeynote.domain.collection.pick.repository.PickRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.global.exception.BannedUserException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PickService {
    private final PickRepository pickRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // Pick 목록
    @Transactional(readOnly = true)
    public Page<PickResponse> findAllByUserId(Long userId, int page, int size) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        if (user.isBanned() || user.isDeleted()) {
            throw new BannedUserException();
        }

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return pickRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageRequest)
                .map(PickResponse::from);
    }

    // Pick 등록
    @Transactional
    public PickResponse createPick(Long userId, Long whiskeyId) {
        // 유저 존재 확인
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // Whiskey의 @JdbcTypeCode(SqlTypes.JSON) 필드(description, note)는 equals() 비교가 불가능해
        // Hibernate dirty check 시 항상 변경된 것으로 판단된다.
        // findById 대신 getReferenceById를 사용해 Whiskey를 영속성 컨텍스트에 로드하지 않고
        // 프록시만 참조함으로써 dirty check 대상에서 제외한다.
        if (!whiskeyRepository.existsById(whiskeyId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키를 찾을 수 없습니다.");
        }
        Whiskey whiskey = whiskeyRepository.getReferenceById(whiskeyId);

        // 중복 픽 방지
        if (pickRepository.existsByUserIdAndWhiskeyId(userId, whiskeyId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 픽한 위스키입니다.");
        }

        MyPick savePick = pickRepository.save(MyPick.create(user, whiskey));

        // PickResponse.from()은 pick.getWhiskey()를 호출해 프록시를 초기화한다.
        // 응답 빌드 완료 후 즉시 detach하여 트랜잭션 종료 시 flush 대상에서 제거한다.
        // (detach를 from() 이전에 하면 LazyInitializationException 발생)
        PickResponse response = PickResponse.from(savePick);
        entityManager.detach(whiskey);
        return response;
    }

    // Pick 삭제
    @Transactional
    public void deletePick(Long userId, Long whiskeyId) {
        MyPick pick = pickRepository.findByUserIdAndWhiskeyId(userId, whiskeyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "픽 목록에 없는 위스키입니다."));

        pickRepository.delete(pick);
    }

    // 픽 여부 조회
    @Transactional(readOnly = true)
    public PickStatusResponse getPickStatus(Long userId, Long whiskeyId) {
        boolean isPicked = pickRepository.existsByUserIdAndWhiskeyId(userId, whiskeyId);
        return PickStatusResponse.of(isPicked);
    }
}
