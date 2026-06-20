ALTER TABLE tags
    ADD COLUMN name_eng VARCHAR(255) AFTER name,
    ADD COLUMN description TEXT AFTER name_eng,
    ADD COLUMN example VARCHAR(255) AFTER description,
    ADD COLUMN paired_id BIGINT AFTER image_url,
    ADD CONSTRAINT fk_tags_paired FOREIGN KEY (paired_id) REFERENCES tags(id);

delete from avg_whiskey_tags;
delete from tasting_note_tags;
DELETE FROM tags;

-- tags INSERT queries
-- nose: id 1~28, taste: id 101~128
-- 순서: 1) nose INSERT(paired_id=NULL)  2) taste INSERT(paired_id=NULL)  3) UPDATE로 연결

-- [1] nose
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (1, 'nose', 'Citrus', '시트러스', '레몬, 오렌지, 자몽 등 상큼하고 톡 쏘는 감귤류 향미', '레몬, 라임, 오렌지, 자몽, 귤, 레몬 제스트', 1, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (2, 'nose', 'Orchard Fruit', '사과/배', '사과, 배처럼 과수원에서 나는 신선하고 달콤한 과일 향미', '사과, 배, 살구', 2, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (3, 'nose', 'Stone Fruit', '복숭아/자두', '복숭아, 자두처럼 씨가 있는 과일 특유의 달콤하고 부드러운 향미. 주로 발효 에스테르 혹은 셰리 캐스크 숙성에서 나타나요', '복숭아, 살구, 자두, 넥타린', 3, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (4, 'nose', 'Red Berry', '레드베리', '딸기, 라즈베리처럼 새콤달콤한 붉은 베리류 향미. 주로 발효/증류 과정의 에스테르에서 비롯돼요', '딸기, 라즈베리, 크랜베리, 레드커런트', 4, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (5, 'nose', 'Dark Berry', '다크베리', '체리, 블루베리처럼 진하고 달콤한 어두운 베리류 향미. 셰리 캐스크 숙성에서 두드러지게 나타나요', '체리, 블루베리, 블랙베리, 블랙커런트', 5, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (6, 'nose', 'Dried Fruit', '건과일', '건포도, 무화과처럼 농축되고 달콤한 건조 과일 향미. 셰리 캐스크 장기 숙성에서 주로 나타나요', '건포도, 무화과, 말린 자두, 대추야자', 6, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (7, 'nose', 'Cooked Fruit', '졸인과일', '잼, 과일청처럼 열을 가해 농축된 과일 향미. 건과일보다 더 끈적하고 달콤한 느낌이에요', '잼, 마말레이드, 과일 콤포트, 애플파이 필링', 7, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (8, 'nose', 'Banana', '바나나', '버번 및 라이트 스코치에서 두드러지는 바나나 향미. 이소아밀 아세테이트라는 특정 에스테르에서 비롯되며 다른 열대과일과 구분되는 독특한 향이에요', '바나나, 바나나 캔디, 바나나 브레드', 8, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (9, 'nose', 'Floral', '꽃향', '장미, 라벤더처럼 꽃 특유의 화사하고 은은한 향미. 발효 과정의 플로럴 에스테르에서 비롯돼요', '장미, 라벤더, 제비꽃, 아카시아, 오렌지 블로섬, 헤더', 9, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (10, 'nose', 'Green & Leafy', '풀잎', '잔디, 솔잎처럼 신선하고 풋풋한 초록빛 향미. 주로 그린 에스테르 계열에서 비롯돼요', '잔디, 솔잎, 허브, 녹차, 완두콩', 10, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (11, 'nose', 'Baking Spice', '시나몬', '시나몬을 중심으로 넛맥, 생강, 정향 등 따뜻하고 달콤한 향신료 향미. 오크 캐스크 숙성에서 주로 비롯돼요', '계피, 정향, 넛맥, 생강, 카다멈, 올스파이스', 11, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (12, 'nose', 'Pepper', '후추', '후추처럼 매콤하고 톡 쏘는 자극적인 향신료. 라이 위스키나 숙성 연수가 짧은 위스키에서 두드러져요', '흑후추, 백후추, 핑크페퍼콘', 12, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (13, 'nose', 'Herbal', '허브', '민트, 허브처럼 신선하고 상쾌한 식물성 향미. 발효 과정이나 라이 그레인에서 비롯돼요', '민트, 유칼립투스, 감초, 아니스, 펜넬, 세이지', 13, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (14, 'nose', 'Vanilla', '바닐라', '부드럽고 달콤한 바닐라 향미. 오크 캐스크의 바닐린 성분에서 비롯되며, 특히 버번 캐스크 숙성에서 두드러져요', '바닐라, 바닐라 빈, 커스터드, 크렘 브륄레', 14, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (15, 'nose', 'Fresh Oak', '새 오크', '신선한 나무, 오크처럼 기본적인 우디 향미. 숙성 연수가 짧은 위스키나 새 오크 캐스크에서 두드러져요', '오크, 신선한 나무, 시더, 샌달우드, 연필 깎은 향', 15, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (16, 'nose', 'Old Wood', '숙성 오크', '오래된 나무처럼 산화한 우디 향미. 장기 숙성 위스키에서 두드러져요', '오래된 오크, 도서관, 곰팡내, 코르크, 오래된 책', 16, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (17, 'nose', 'Honey', '꿀', '꿀 특유의 부드럽고 자연스러운 단맛. 발효 과정 및 일부 캐스크 숙성에서 비롯되며, 스페이사이드, 하이랜드 스코치에서 두드러져요', '꿀, 메이플 시럽, 헤더 꿀, 클로버 꿀', 17, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (18, 'nose', 'Caramel', '캐러멜', '캐러멜처럼 진하고 끈적한 단맛. 오크 캐스크의 우드 슈가와 토스팅에서 비롯돼요', '캐러멜, 흑설탕, 버터스카치, 누가, 토피', 18, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (19, 'nose', 'Chocolate & Cocoa', '초콜릿', '초콜릿, 코코아처럼 진하고 깊은 단맛. 주로 셰리 캐스크 장기 숙성이나 강하게 차링된 오크에서 비롯돼요', '다크 초콜릿, 밀크 초콜릿, 코코아, 카카오, 퍼지', 19, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (20, 'nose', 'Nutty', '견과류', '견과류 특유의 고소하고 기름진 향미. 발효, 증류, 숙성 과정에서 비롯되며 셰리 캐스크에서 특히 두드러져요', '아몬드, 호두, 헤이즐넛, 피칸, 마지팬, 구운 견과류', 20, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (21, 'nose', 'Grain', '곡물', '곡물 특유의 구수하고 거친 향미. 위스키의 원료에서 직접 비롯돼요', '맥아, 옥수수, 호밀, 보리, 시리얼, 비스킷, 갓 구운 빵', 21, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (22, 'nose', 'Peat Smoke', '피트', '피트(이탄)를 태워 보리에 입혀지는 독특한 훈연향. 아일라 위스키의 핵심 캐릭터예요', '피트, 이탄, 훈제향, 스모키한 페놀', 22, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (23, 'nose', 'Medicinal', '약품향', '요오드, 약품, 소독약처럼 독특한 약품 계열 향미. 해안가 피트 위스키(라프로익, 아드벡 등)에서 두드러져요', '요오드, 소독약, 병원 냄새, 타르, 디젤', 23, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (24, 'nose', 'Coastal', '바다/소금', '바다 내음, 소금기처럼 해양 계열 향미. 해안가 숙성고에서 비롯되며 피트와 자주 함께 나타나요', '바다 내음, 소금기, 해초, 굴, 조개', 24, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (25, 'nose', 'Bonfire', '모닥불', '장작 타는 냄새처럼 가볍고 직관적인 훈연 향미. 강한 피트 스모크와 달리 부드럽고 따뜻한 느낌이에요', '모닥불, 장작, 캠프파이어, 그을린 나무', 25, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (26, 'nose', 'Leather', '가죽', '가죽 특유의 깊고 묵직한 향미. 셰리 캐스크 장기 숙성에서 비롯되는 산화 향미예요', '가죽, 새 가죽, 오래된 가죽, 버섯, 흙내음', 26, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (27, 'nose', 'Tobacco', '담배', '담배, 시가처럼 깊고 건조한 향미. 장기 숙성 오크에서 비롯돼요', '담배, 시가, 파이프 담배, 마른 담뱃잎', 27, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (28, 'nose', 'Coffee', '커피', '커피 특유의 구수하고 쌉쌀한 향미. 강하게 차링된 오크 캐스크나 장기 숙성 위스키에서 비롯돼요', '원두, 에스프레소, 로스팅 커피, 모카', 28, '', NULL);

-- [2] taste
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (101, 'taste', 'Citrus', '시트러스', '레몬, 오렌지, 자몽 등 상큼하고 톡 쏘는 감귤류 향미', '레몬, 라임, 오렌지, 자몽, 귤, 레몬 제스트', 1, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (102, 'taste', 'Orchard Fruit', '사과/배', '사과, 배처럼 과수원에서 나는 신선하고 달콤한 과일 향미', '사과, 배, 살구', 2, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (103, 'taste', 'Stone Fruit', '복숭아/자두', '복숭아, 자두처럼 씨가 있는 과일 특유의 달콤하고 부드러운 향미. 주로 발효 에스테르 혹은 셰리 캐스크 숙성에서 나타나요', '복숭아, 살구, 자두, 넥타린', 3, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (104, 'taste', 'Red Berry', '레드베리', '딸기, 라즈베리처럼 새콤달콤한 붉은 베리류 향미. 주로 발효/증류 과정의 에스테르에서 비롯돼요', '딸기, 라즈베리, 크랜베리, 레드커런트', 4, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (105, 'taste', 'Dark Berry', '다크베리', '체리, 블루베리처럼 진하고 달콤한 어두운 베리류 향미. 셰리 캐스크 숙성에서 두드러지게 나타나요', '체리, 블루베리, 블랙베리, 블랙커런트', 5, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (106, 'taste', 'Dried Fruit', '건과일', '건포도, 무화과처럼 농축되고 달콤한 건조 과일 향미. 셰리 캐스크 장기 숙성에서 주로 나타나요', '건포도, 무화과, 말린 자두, 대추야자', 6, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (107, 'taste', 'Cooked Fruit', '졸인과일', '잼, 과일청처럼 열을 가해 농축된 과일 향미. 건과일보다 더 끈적하고 달콤한 느낌이에요', '잼, 마말레이드, 과일 콤포트, 애플파이 필링', 7, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (108, 'taste', 'Banana', '바나나', '버번 및 라이트 스코치에서 두드러지는 바나나 향미. 이소아밀 아세테이트라는 특정 에스테르에서 비롯되며 다른 열대과일과 구분되는 독특한 향이에요', '바나나, 바나나 캔디, 바나나 브레드', 8, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (109, 'taste', 'Floral', '꽃향', '장미, 라벤더처럼 꽃 특유의 화사하고 은은한 향미. 발효 과정의 플로럴 에스테르에서 비롯돼요', '장미, 라벤더, 제비꽃, 아카시아, 오렌지 블로섬, 헤더', 9, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (110, 'taste', 'Green & Leafy', '풀잎', '잔디, 솔잎처럼 신선하고 풋풋한 초록빛 향미. 주로 그린 에스테르 계열에서 비롯돼요', '잔디, 솔잎, 허브, 녹차, 완두콩', 10, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (111, 'taste', 'Baking Spice', '시나몬', '시나몬을 중심으로 넛맥, 생강, 정향 등 따뜻하고 달콤한 향신료 향미. 오크 캐스크 숙성에서 주로 비롯돼요', '계피, 정향, 넛맥, 생강, 카다멈, 올스파이스', 11, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (112, 'taste', 'Pepper', '후추', '후추처럼 매콤하고 톡 쏘는 자극적인 향신료. 라이 위스키나 숙성 연수가 짧은 위스키에서 두드러져요', '흑후추, 백후추, 핑크페퍼콘', 12, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (113, 'taste', 'Herbal', '허브', '민트, 허브처럼 신선하고 상쾌한 식물성 향미. 발효 과정이나 라이 그레인에서 비롯돼요', '민트, 유칼립투스, 감초, 아니스, 펜넬, 세이지', 13, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (114, 'taste', 'Vanilla', '바닐라', '부드럽고 달콤한 바닐라 향미. 오크 캐스크의 바닐린 성분에서 비롯되며, 특히 버번 캐스크 숙성에서 두드러져요', '바닐라, 바닐라 빈, 커스터드, 크렘 브륄레', 14, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (115, 'taste', 'Fresh Oak', '새 오크', '신선한 나무, 오크처럼 기본적인 우디 향미. 숙성 연수가 짧은 위스키나 새 오크 캐스크에서 두드러져요', '오크, 신선한 나무, 시더, 샌달우드, 연필 깎은 향', 15, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (116, 'taste', 'Old Wood', '숙성 오크', '오래된 나무처럼 산화한 우디 향미. 장기 숙성 위스키에서 두드러져요', '오래된 오크, 도서관, 곰팡내, 코르크, 오래된 책', 16, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (117, 'taste', 'Honey', '꿀', '꿀 특유의 부드럽고 자연스러운 단맛. 발효 과정 및 일부 캐스크 숙성에서 비롯되며, 스페이사이드, 하이랜드 스코치에서 두드러져요', '꿀, 메이플 시럽, 헤더 꿀, 클로버 꿀', 17, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (118, 'taste', 'Caramel', '캐러멜', '캐러멜처럼 진하고 끈적한 단맛. 오크 캐스크의 우드 슈가와 토스팅에서 비롯돼요', '캐러멜, 흑설탕, 버터스카치, 누가, 토피', 18, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (119, 'taste', 'Chocolate & Cocoa', '초콜릿', '초콜릿, 코코아처럼 진하고 깊은 단맛. 주로 셰리 캐스크 장기 숙성이나 강하게 차링된 오크에서 비롯돼요', '다크 초콜릿, 밀크 초콜릿, 코코아, 카카오, 퍼지', 19, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (120, 'taste', 'Nutty', '견과류', '견과류 특유의 고소하고 기름진 향미. 발효, 증류, 숙성 과정에서 비롯되며 셰리 캐스크에서 특히 두드러져요', '아몬드, 호두, 헤이즐넛, 피칸, 마지팬, 구운 견과류', 20, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (121, 'taste', 'Grain', '곡물', '곡물 특유의 구수하고 거친 향미. 위스키의 원료에서 직접 비롯돼요', '맥아, 옥수수, 호밀, 보리, 시리얼, 비스킷, 갓 구운 빵', 21, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (122, 'taste', 'Peat Smoke', '피트', '피트(이탄)를 태워 보리에 입혀지는 독특한 훈연향. 아일라 위스키의 핵심 캐릭터예요', '피트, 이탄, 훈제향, 스모키한 페놀', 22, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (123, 'taste', 'Medicinal', '약품향', '요오드, 약품, 소독약처럼 독특한 약품 계열 향미. 해안가 피트 위스키(라프로익, 아드벡 등)에서 두드러져요', '요오드, 소독약, 병원 냄새, 타르, 디젤', 23, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (124, 'taste', 'Coastal', '바다/소금', '바다 내음, 소금기처럼 해양 계열 향미. 해안가 숙성고에서 비롯되며 피트와 자주 함께 나타나요', '바다 내음, 소금기, 해초, 굴, 조개', 24, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (125, 'taste', 'Bonfire', '모닥불', '장작 타는 냄새처럼 가볍고 직관적인 훈연 향미. 강한 피트 스모크와 달리 부드럽고 따뜻한 느낌이에요', '모닥불, 장작, 캠프파이어, 그을린 나무', 25, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (126, 'taste', 'Leather', '가죽', '가죽 특유의 깊고 묵직한 향미. 셰리 캐스크 장기 숙성에서 비롯되는 산화 향미예요', '가죽, 새 가죽, 오래된 가죽, 버섯, 흙내음', 26, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (127, 'taste', 'Tobacco', '담배', '담배, 시가처럼 깊고 건조한 향미. 장기 숙성 오크에서 비롯돼요', '담배, 시가, 파이프 담배, 마른 담뱃잎', 27, '', NULL);
INSERT INTO tags (id, category, name_eng, name, description, example, display_order, image_url, paired_id) VALUES (128, 'taste', 'Coffee', '커피', '커피 특유의 구수하고 쌉쌀한 향미. 강하게 차링된 오크 캐스크나 장기 숙성 위스키에서 비롯돼요', '원두, 에스프레소, 로스팅 커피, 모카', 28, '', NULL);

-- [3] paired_id 연결
UPDATE tags SET paired_id = 101 WHERE id = 1;
UPDATE tags SET paired_id = 1 WHERE id = 101;
UPDATE tags SET paired_id = 102 WHERE id = 2;
UPDATE tags SET paired_id = 2 WHERE id = 102;
UPDATE tags SET paired_id = 103 WHERE id = 3;
UPDATE tags SET paired_id = 3 WHERE id = 103;
UPDATE tags SET paired_id = 104 WHERE id = 4;
UPDATE tags SET paired_id = 4 WHERE id = 104;
UPDATE tags SET paired_id = 105 WHERE id = 5;
UPDATE tags SET paired_id = 5 WHERE id = 105;
UPDATE tags SET paired_id = 106 WHERE id = 6;
UPDATE tags SET paired_id = 6 WHERE id = 106;
UPDATE tags SET paired_id = 107 WHERE id = 7;
UPDATE tags SET paired_id = 7 WHERE id = 107;
UPDATE tags SET paired_id = 108 WHERE id = 8;
UPDATE tags SET paired_id = 8 WHERE id = 108;
UPDATE tags SET paired_id = 109 WHERE id = 9;
UPDATE tags SET paired_id = 9 WHERE id = 109;
UPDATE tags SET paired_id = 110 WHERE id = 10;
UPDATE tags SET paired_id = 10 WHERE id = 110;
UPDATE tags SET paired_id = 111 WHERE id = 11;
UPDATE tags SET paired_id = 11 WHERE id = 111;
UPDATE tags SET paired_id = 112 WHERE id = 12;
UPDATE tags SET paired_id = 12 WHERE id = 112;
UPDATE tags SET paired_id = 113 WHERE id = 13;
UPDATE tags SET paired_id = 13 WHERE id = 113;
UPDATE tags SET paired_id = 114 WHERE id = 14;
UPDATE tags SET paired_id = 14 WHERE id = 114;
UPDATE tags SET paired_id = 115 WHERE id = 15;
UPDATE tags SET paired_id = 15 WHERE id = 115;
UPDATE tags SET paired_id = 116 WHERE id = 16;
UPDATE tags SET paired_id = 16 WHERE id = 116;
UPDATE tags SET paired_id = 117 WHERE id = 17;
UPDATE tags SET paired_id = 17 WHERE id = 117;
UPDATE tags SET paired_id = 118 WHERE id = 18;
UPDATE tags SET paired_id = 18 WHERE id = 118;
UPDATE tags SET paired_id = 119 WHERE id = 19;
UPDATE tags SET paired_id = 19 WHERE id = 119;
UPDATE tags SET paired_id = 120 WHERE id = 20;
UPDATE tags SET paired_id = 20 WHERE id = 120;
UPDATE tags SET paired_id = 121 WHERE id = 21;
UPDATE tags SET paired_id = 21 WHERE id = 121;
UPDATE tags SET paired_id = 122 WHERE id = 22;
UPDATE tags SET paired_id = 22 WHERE id = 122;
UPDATE tags SET paired_id = 123 WHERE id = 23;
UPDATE tags SET paired_id = 23 WHERE id = 123;
UPDATE tags SET paired_id = 124 WHERE id = 24;
UPDATE tags SET paired_id = 24 WHERE id = 124;
UPDATE tags SET paired_id = 125 WHERE id = 25;
UPDATE tags SET paired_id = 25 WHERE id = 125;
UPDATE tags SET paired_id = 126 WHERE id = 26;
UPDATE tags SET paired_id = 26 WHERE id = 126;
UPDATE tags SET paired_id = 127 WHERE id = 27;
UPDATE tags SET paired_id = 27 WHERE id = 127;
UPDATE tags SET paired_id = 128 WHERE id = 28;
UPDATE tags SET paired_id = 28 WHERE id = 128;