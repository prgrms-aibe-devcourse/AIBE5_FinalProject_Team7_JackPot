-- 로컬 RDS 시드 적재 전 전체 데이터 초기화 (스키마·flyway_schema_history 유지)
USE whiskeynote;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE review_likes;
TRUNCATE TABLE post_likes;
TRUNCATE TABLE post_comment_tree;
TRUNCATE TABLE post_comments;
TRUNCATE TABLE post_whiskeys;
TRUNCATE TABLE posts;
TRUNCATE TABLE my_picks;
TRUNCATE TABLE wishlist_items;
TRUNCATE TABLE wishlist_folders;
TRUNCATE TABLE user_taste_profile_tags;
TRUNCATE TABLE user_taste_profiles;
TRUNCATE TABLE whiskey_requests;
TRUNCATE TABLE report_actions;
TRUNCATE TABLE reports;
TRUNCATE TABLE follows;
TRUNCATE TABLE whiskey_view_logs;
TRUNCATE TABLE whiskey_columns;
TRUNCATE TABLE whiskey_aliases;
TRUNCATE TABLE tasting_note_tags;
TRUNCATE TABLE tasting_notes;
TRUNCATE TABLE reviews;
TRUNCATE TABLE avg_whiskey_tags;
TRUNCATE TABLE whiskeys_note_cache;
TRUNCATE TABLE whiskeys;
TRUNCATE TABLE users;
TRUNCATE TABLE tags;

SET FOREIGN_KEY_CHECKS = 1;
