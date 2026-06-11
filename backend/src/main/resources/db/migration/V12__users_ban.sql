-- 사용자 밴(이용 제한) 기능 추가
-- is_banned : 밴 여부 (0 = 정상, 1 = 밴)
-- banned_at : 밴 처리 일시 (밴 해제 시 NULL 로 초기화)
ALTER TABLE users
    ADD COLUMN is_banned TINYINT(1)  NOT NULL DEFAULT 0   COMMENT '밴 여부(0: 정상, 1: 밴)',
    ADD COLUMN banned_at DATETIME(6) NULL                 COMMENT '밴 처리 일시';
