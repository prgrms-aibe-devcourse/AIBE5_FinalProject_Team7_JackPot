CREATE TABLE IF NOT EXISTS whiskey_columns (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    source_type     VARCHAR(20) NOT NULL,
    title           VARCHAR(512) NOT NULL,
    url             VARCHAR(1024) NOT NULL,
    thumbnail_url   VARCHAR(1024),
    description     TEXT,
    whiskey_keyword VARCHAR(255),
    author          VARCHAR(200),
    source_name     VARCHAR(200),
    published_at    DATETIME(6),
    created_at      DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
