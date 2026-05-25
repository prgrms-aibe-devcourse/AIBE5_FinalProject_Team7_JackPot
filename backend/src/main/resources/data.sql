INSERT INTO whiskeys
(id, name, type, etc_detail, image_url, abv, age_years, status, region, country, cask, created_at, updated_at)
VALUES
    (1, 'Glenfiddich 12', 'single_malt', NULL, NULL, 40.00, 12, 'active', 'Speyside', 'Scotland', 'Bourbon Cask', NOW(6), NOW(6)),
    (2, 'Glenfiddich 15', 'single_malt', NULL, NULL, 40.00, 15, 'active', 'Speyside', 'Scotland', 'Sherry Cask', NOW(6), NOW(6)),
    (3, 'Macallan 12 Double Cask', 'single_malt', NULL, NULL, 40.00, 12, 'active', 'Speyside', 'Scotland', 'Sherry Oak Cask', NOW(6), NOW(6)),
    (4, 'Jameson Original', 'blended', NULL, NULL, 40.00, 0, 'active', 'Cork', 'Ireland', 'Bourbon and Sherry Cask', NOW(6), NOW(6)),
    (5, 'Maker''s Mark', 'bourbon', NULL, NULL, 45.00, 0, 'active', 'Kentucky', 'USA', 'New American Oak', NOW(6), NOW(6)),
    (6, 'Bulleit Rye', 'rye', NULL, NULL, 45.00, 0, 'active', 'Kentucky', 'USA', 'New American Oak', NOW(6), NOW(6)),
    (7, 'Yamazaki Distiller''s Reserve', 'single_malt', NULL, NULL, 43.00, 0, 'pending', 'Osaka', 'Japan', 'Mizunara and Wine Cask', NOW(6), NOW(6)),
    (8, 'Hibiki Japanese Harmony', 'blended', NULL, NULL, 43.00, 0, 'active', 'Osaka', 'Japan', 'Mixed Cask', NOW(6), NOW(6)),
    (9, 'Ardbeg 10', 'single_malt', NULL, NULL, 46.00, 10, 'active', 'Islay', 'Scotland', 'Ex-Bourbon Cask', NOW(6), NOW(6)),
    (10, 'Monkey Shoulder', 'blended', NULL, NULL, 40.00, 0, 'active', 'Speyside', 'Scotland', 'First-fill Bourbon Cask', NOW(6), NOW(6));