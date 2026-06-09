CREATE TABLE IF NOT EXISTS wishlist_folders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_wishlist_folders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlist_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    whiskey_id BIGINT NOT NULL,
    folder_id BIGINT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_wishlist_items_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT FK_wishlist_items_whiskey FOREIGN KEY (whiskey_id) REFERENCES whiskeys (id),
    CONSTRAINT FK_wishlist_items_folder FOREIGN KEY (folder_id) REFERENCES wishlist_folders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

