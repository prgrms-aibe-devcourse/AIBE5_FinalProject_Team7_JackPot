CREATE TABLE IF NOT EXISTS whiskey_view_logs
(
    id         BIGINT   NOT NULL AUTO_INCREMENT,
    user_id    BIGINT   NOT NULL,
    whiskey_id BIGINT   NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_whiskey_view_logs_user    FOREIGN KEY (user_id)    REFERENCES users (id),
    CONSTRAINT FK_whiskey_view_logs_whiskey FOREIGN KEY (whiskey_id) REFERENCES whiskeys (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;