package com.jackpot.whiskeynote.domain.activity.service;

import com.jackpot.whiskeynote.domain.activity.entity.WhiskeyViewLog;
import com.jackpot.whiskeynote.domain.activity.repository.WhiskeyViewLogRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class WhiskeyViewLogService {

    private final WhiskeyViewLogRepository whiskeyViewLogRepository;
    private final UsersRepository usersRepository;
    private final WhiskeyRepository whiskeyRepository;

    @Transactional
    public void createWhiskeyViewLog(Long userId, Long whiskeyId) {
        Users user = usersRepository.findById(userId).orElse(null);
        Whiskey whiskey = whiskeyRepository.findById(whiskeyId).orElse(null);
        // 굳이 검증까지는 가지 않고, 문제 발견 시, DB에 넣지 않는 방향으로 접근.
        // 이는 추후 프론트에서의 활동이 에러를 일으키는 상황을 막기 위함
        if (user == null || whiskey == null) { return; }

        WhiskeyViewLog log = WhiskeyViewLog.builder()
            .user(user)
            .whiskey(whiskey)
            .build();
        whiskeyViewLogRepository.save(log);
    }
}
