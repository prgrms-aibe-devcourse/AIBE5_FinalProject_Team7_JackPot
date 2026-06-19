export interface TagTooltipContent {
  englishName: string;
  description: string;
  examples: string;
}

/** tag v2.txt — Korean display name (`tags.name`) keyed tooltips */
export const TAG_TOOLTIPS: Record<string, TagTooltipContent> = {
  '시트러스': {
    englishName: 'Citrus',
    description: '레몬, 오렌지, 자몽 등 상큼하고 톡 쏘는 감귤류 향미',
    examples: '레몬, 라임, 오렌지, 자몽, 귤, 레몬 제스트',
  },
  '사과/배': {
    englishName: 'Orchard Fruit',
    description: '사과, 배처럼 과수원에서 나는 신선하고 달콤한 과일 향미',
    examples: '사과, 배',
  },
  '복숭아/자두': {
    englishName: 'Stone Fruit',
    description:
      '복숭아, 자두처럼 씨가 있는 과일 특유의 달콤하고 부드러운 향미. 주로 발효 에스테르 혹은 셰리 캐스크 숙성에서 나타나요',
    examples: '복숭아, 살구, 자두, 넥타린',
  },
  '레드베리': {
    englishName: 'Red Berry',
    description:
      '딸기, 라즈베리처럼 새콤달콤한 붉은 베리류 향미. 주로 발효/증류 과정의 에스테르에서 비롯돼요',
    examples: '딸기, 라즈베리, 크랜베리, 레드커런트',
  },
  '다크베리': {
    englishName: 'Dark Berry',
    description:
      '체리, 블루베리처럼 진하고 달콤한 어두운 베리류 향미. 셰리 캐스크 숙성에서 두드러지게 나타나요',
    examples: '체리, 블루베리, 블랙베리, 블랙커런트',
  },
  '건과일': {
    englishName: 'Dried Fruit',
    description:
      '건포도, 무화과처럼 농축되고 달콤한 건조 과일 향미. 셰리 캐스크 장기 숙성에서 주로 나타나요',
    examples: '건포도, 무화과, 말린 자두, 대추야자',
  },
  '졸인과일': {
    englishName: 'Cooked Fruit',
    description: '잼, 과일청처럼 열을 가해 농축된 과일 향미. 건과일보다 더 끈적하고 달콤한 느낌이에요',
    examples: '잼, 마말레이드, 과일 콤포트, 애플파이 필링',
  },
  '바나나': {
    englishName: 'Banana',
    description:
      '버번 및 라이트 스코치에서 두드러지는 바나나 향미. 이소아밀 아세테이트라는 특정 에스테르에서 비롯되며 다른 열대과일과 구분되는 독특한 향이에요',
    examples: '바나나, 바나나 캔디, 바나나 브레드',
  },
  '꽃향': {
    englishName: 'Floral',
    description:
      '장미, 라벤더처럼 꽃 특유의 화사하고 은은한 향미. 발효 과정의 플로럴 에스테르에서 비롯돼요',
    examples: '장미, 라벤더, 제비꽃, 아카시아, 오렌지 블로섬, 헤더',
  },
  '풀잎': {
    englishName: 'Green & Leafy',
    description: '잔디, 솔잎처럼 신선하고 풋풋한 초록빛 향미. 주로 그린 에스테르 계열에서 비롯돼요',
    examples: '잔디, 솔잎, 허브, 녹차, 완두콩',
  },
  '시나몬': {
    englishName: 'Baking Spice',
    description:
      '시나몬을 중심으로 넛맥, 생강, 정향 등 따뜻하고 달콤한 향신료 향미. 오크 캐스크 숙성에서 주로 비롯돼요',
    examples: '계피, 정향, 넛맥, 생강, 카다멈, 올스파이스',
  },
  '후추': {
    englishName: 'Pepper',
    description:
      '후추처럼 매콤하고 톡 쏘는 자극적인 향신료. 라이 위스키나 숙성 연수가 짧은 위스키에서 두드러져요',
    examples: '흑후추, 백후추, 핑크페퍼콘',
  },
  '허브': {
    englishName: 'Herbal',
    description: '민트, 허브처럼 신선하고 상쾌한 식물성 향미. 발효 과정이나 라이 그레인에서 비롯돼요',
    examples: '민트, 유칼립투스, 감초, 아니스, 펜넬, 세이지',
  },
  '바닐라': {
    englishName: 'Vanilla',
    description:
      '부드럽고 달콤한 바닐라 향미. 오크 캐스크의 바닐린 성분에서 비롯되며, 특히 버번 캐스크 숙성에서 두드러져요',
    examples: '바닐라, 바닐라 빈, 커스터드, 크렘 브륄레',
  },
  '새 오크': {
    englishName: 'Fresh Oak',
    description:
      '신선한 나무, 오크처럼 기본적인 우디 향미. 숙성 연수가 짧은 위스키나 새 오크 캐스크에서 두드러져요',
    examples: '오크, 신선한 나무, 시더, 샌달우드, 연필 깎은 향',
  },
  '숙성 오크': {
    englishName: 'Old Wood',
    description: '오래된 나무처럼 산화한 우디 향미. 장기 숙성 위스키에서 두드러져요',
    examples: '오래된 오크, 도서관, 곰팡내, 코르크, 오래된 책',
  },
  '꿀': {
    englishName: 'Honey',
    description:
      '꿀 특유의 부드럽고 자연스러운 단맛. 발효 과정 및 일부 캐스크 숙성에서 비롯되며, 스페이사이드, 하이랜드 스코치에서 두드러져요',
    examples: '꿀, 메이플 시럽, 헤더 꿀, 클로버 꿀',
  },
  '캐러멜': {
    englishName: 'Caramel',
    description: '캐러멜처럼 진하고 끈적한 단맛. 오크 캐스크의 우드 슈가와 토스팅에서 비롯돼요',
    examples: '캐러멜, 흑설탕, 버터스카치, 누가, 토피',
  },
  '초콜릿': {
    englishName: 'Chocolate & Cocoa',
    description:
      '초콜릿, 코코아처럼 진하고 깊은 단맛. 주로 셰리 캐스크 장기 숙성이나 강하게 차링된 오크에서 비롯돼요',
    examples: '다크 초콜릿, 밀크 초콜릿, 코코아, 카카오, 퍼지',
  },
  '견과류': {
    englishName: 'Nutty',
    description:
      '견과류 특유의 고소하고 기름진 향미. 발효, 증류, 숙성 과정에서 비롯되며 셰리 캐스크에서 특히 두드러져요',
    examples: '아몬드, 호두, 헤이즐넛, 피칸, 마지팬, 구운 견과류',
  },
  '곡물': {
    englishName: 'Grain',
    description: '곡물 특유의 구수하고 거친 향미. 위스키의 원료에서 직접 비롯돼요',
    examples: '맥아, 옥수수, 호밀, 보리, 시리얼, 비스킷, 갓 구운 빵',
  },
  '피트': {
    englishName: 'Peat Smoke',
    description: '피트(이탄)를 태워 보리에 입혀지는 독특한 훈연향. 아일라 위스키의 핵심 캐릭터예요',
    examples: '피트, 이탄, 훈제향, 스모키한 페놀',
  },
  '약품향': {
    englishName: 'Medicinal',
    description:
      '요오드, 약품, 소독약처럼 독특한 약품 계열 향미. 해안가 피트 위스키(라프로익, 아드벡 등)에서 두드러져요',
    examples: '요오드, 소독약, 병원 냄새, 타르, 디젤',
  },
  '바다/소금': {
    englishName: 'Coastal',
    description:
      '바다 내음, 소금기처럼 해양 계열 향미. 해안가 숙성고에서 비롯되며 피트와 자주 함께 나타나요',
    examples: '바다 내음, 소금기, 해초, 굴, 조개',
  },
  '모닥불': {
    englishName: 'Bonfire',
    description:
      '장작 타는 냄새처럼 가볍고 직관적인 훈연 향미. 강한 피트 스모크와 달리 부드럽고 따뜻한 느낌이에요',
    examples: '모닥불, 장작, 캠프파이어, 그을린 나무',
  },
  '가죽': {
    englishName: 'Leather',
    description: '가죽 특유의 깊고 묵직한 향미. 셰리 캐스크 장기 숙성에서 비롯되는 산화 향미예요',
    examples: '가죽, 새 가죽, 오래된 가죽, 버섯, 흙내음',
  },
  '담배': {
    englishName: 'Tobacco',
    description: '담배, 시가처럼 깊고 건조한 향미. 장기 숙성 오크에서 비롯돼요',
    examples: '담배, 시가, 파이프 담배, 마른 담뱃잎',
  },
  '커피': {
    englishName: 'Coffee',
    description:
      '커피 특유의 구수하고 쌉쌀한 향미. 강하게 차링된 오크 캐스크나 장기 숙성 위스키에서 비롯돼요',
    examples: '원두, 에스프레소, 로스팅 커피, 모카',
  },
};

export function getTagTooltip(name: string): TagTooltipContent | undefined {
  return TAG_TOOLTIPS[name];
}
