-- =====================================================
-- [최초 1회만 실행] MySQL 데이터베이스 초기 설정
-- MySQL 클라이언트(DBeaver, MySQL Workbench, CLI 등)에서 직접 실행하세요.
-- =====================================================

CREATE DATABASE IF NOT EXISTS whiskeynote
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 전용 계정 생성이 필요한 경우 (선택사항)
-- CREATE USER 'whiskeynote'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON whiskeynote.* TO 'whiskeynote'@'localhost';
-- FLUSH PRIVILEGES;