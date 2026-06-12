CREATE TABLE IF NOT EXISTS whiskey_aliases (
    id BIGINT NOT NULL AUTO_INCREMENT,
    whiskey_id BIGINT NOT NULL,
    alias VARCHAR(200) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    INDEX idx_whiskey_aliases_whiskey_id (whiskey_id),
    INDEX idx_whiskey_aliases_alias (alias)
);