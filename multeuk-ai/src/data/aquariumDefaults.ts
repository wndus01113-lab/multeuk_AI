import type {
  AquariumDecorItem,
  BeginnerGuideTopic,
  TankLogEntry,
  TankProfile,
  TodoTask,
} from "../types/aquarium";

export const QUICK_STARTER_QUESTIONS: Array<{ label: string; prompt: string }> = [
  {
    label: "계속 수면에 머물러요",
    prompt: "물고기가 계속 수면 위쪽에만 머물면서 뻐끔거려요. 언제부터인지 모르겠는데 왜 그런 걸까요?",
  },
  {
    label: "물고기가 밥을 안 먹어요",
    prompt: "물고기가 밥을 안 먹고 구석에 가만히 있어요. 초보자인데 어떻게 확인하고 도와줘야 하나요?",
  },
  {
    label: "어항 물이 뿌옇게 변했어요",
    prompt: "어항 물이 하얗게 뿌옇게 변했어요(백탁). 물고기한테 위험한 건지, 지금 뭘 해야 하는지 쉽게 알려주세요.",
  },
  {
    label: "서로 쫓아다니며 싸워요",
    prompt: "어항 속 물고기들이 서로 꼬리를 물고 쫓아다녀요. 스트레스나 영역 싸움일까요? 어떻게 해줘야 하나요?",
  },
  {
    label: "초보 물잡이 쉽게 알려줘",
    prompt: "수족관에서 '물잡이'를 꼭 하라고 하는데, 대체 무슨 뜻이고 초보자가 실패 없이 하는 법을 알려주세요.",
  },
];

export const DEFAULT_TODO_TASKS: TodoTask[] = [
  {
    id: "observe-fish",
    title: "물고기 상태 관찰하기 (헤엄·지느러미)",
    description: "활발히 헤엄치는지, 수면이나 바닥 구석에만 있지 않은지 관찰해요. (관찰 보상 스티커 대상)",
    frequency: "매일",
    completed: false,
    isObservationQuest: true,
    askPrompt: "초보자가 매일 물고기 상태를 관찰할 때 이상 유영이나 아픈 신호를 구별하는 법을 쉽게 알려주세요.",
  },
  {
    id: "check-temp",
    title: "어항 수온 확인하기 (열대어 24~26°C)",
    description: "온도가 갑자기 2~3도 이상 변하지 않도록 온도계와 히터를 살펴요. (관찰 보상 스티커 대상)",
    frequency: "매일",
    completed: false,
    isObservationQuest: true,
    askPrompt: "열대어랑 금붕어는 적정 수온이 다른가요? 계절이 바뀔 때 물 온도 관리는 어떻게 해야 하나요?",
  },
  {
    id: "check-filter",
    title: "여과기 물 흐름과 수질 맑기 확인",
    description: "물이 너무 뿌옇거나 여과기 물살이 약해지지 않았는지 눈으로 살피기만 해요.",
    frequency: "매일",
    completed: false,
    isObservationQuest: true,
    askPrompt: "여과기 스펀지는 왜 수돗물로 씻으면 안 되고, 물이 뿌옇게 보일 때는 어떻게 대처하나요?",
  },
  {
    id: "feed-morning",
    title: "먹이 소량 주기 (2분 안에 다 먹을 양만!)",
    description: "많이 주면 물이 금방 상해요. 물고기가 아쉬워 보여도 정해진 양만 소량 주세요.",
    frequency: "매일",
    completed: false,
    isObservationQuest: false,
    askPrompt: "물고기 밥은 하루에 몇 번, 얼마나 주는 게 적당한가요? 굶는 것보다 많이 주는 게 더 위험한가요?",
  },
  {
    id: "weekly-water-change",
    title: "부분 물갈이 (주 1회, 물 20~30%만 교체)",
    description: "자주 갈면 오히려 물고기가 힘들어해요. 정해진 주기에만 전체의 3분의 1 이하로 갈아주세요.",
    frequency: "주 1~2회",
    completed: false,
    isObservationQuest: false,
    askPrompt: "어항 물을 한 번에 다 갈거나 너무 자주 갈면 왜 위험한가요? 안전한 부분 물갈이 순서를 알려주세요.",
  },
];

export const DEFAULT_TANK_PROFILE: TankProfile = {
  name: "",
  sizeLiters: "",
  fishList: "",
  setupDate: "",
};

export const DEFAULT_TANK_LOGS: TankLogEntry[] = [];

export const BEGINNER_GUIDE_TOPICS: BeginnerGuideTopic[] = [
  {
    id: "guide-cycling",
    stepNumber: "01",
    title: "물잡이(여과 사이클) 쉽게 이해하기",
    summary:
      "어항 속 배설물과 남은 밥은 보이지 않는 독성 물질로 변해요. 이 독성을 깨끗한 물로 바꿔주는 '착한 청소부 미생물'이 여과기에 자리 잡도록 기다리는 시간입니다.",
    keyRule: "물고기 데려오기 전 최소 1~2주 여유 두기",
    askPrompt:
      "물잡이(여과 사이클)를 처음 어항 세팅할 때 실패 없이 가장 쉽게 하는 방법을 단계별로 알려주세요!",
  },
  {
    id: "guide-water-change",
    stepNumber: "02",
    title: "물갈이(환수)는 절대 한 번에 100% 하지 마세요",
    summary:
      "방 청소를 하려고 집 벽지까지 다 뜯어내면 살기 힘들듯이, 물을 한꺼번에 싹 갈면 착한 미생물도 사라지고 물고기가 수온·수질 충격으로 아파해요.",
    keyRule: "주 1회, 전체 물의 20~30%만 교체",
    askPrompt:
      "수돗물 염소 제거(물받아두기 vs 물갈이제)는 어떻게 해야 하고, 물갈이할 때 물 온도는 어떻게 맞추나요?",
  },
  {
    id: "guide-feeding",
    stepNumber: "03",
    title: "초보자가 가장 많이 하는 실수: 밥 너무 많이 주기",
    summary:
      "물고기는 배고파 보여서 계속 받아먹지만 위가 아주 작아요. 남긴 밥이 썩으면 백탁과 수질 오염의 가장 큰 원인이 되므로 정량만 주는 것이 좋아요.",
    keyRule: "하루 1~2번, 1~2분 안에 다 먹는 양만 급여",
    askPrompt:
      "물고기가 먹이를 달라고 계속 유리벽 앞에서 파닥거리는데 정말 배고픈 건가요? 하루 적정량을 알려주세요.",
  },
  {
    id: "guide-starter-fish",
    stepNumber: "04",
    title: "초보 집사에게 추천하는 순하고 튼튼한 물고기",
    summary:
      "구피(화려하고 튼튼함), 네온테트라(작고 반짝이는 무리 생활), 코리도라스(바닥을 귀엽게 탐험), 베타(혼자 키우기 좋고 우아함)는 초보자도 돌보기 좋아요.",
    keyRule: "처음엔 서로 잘 어울리는 1~2종만 소수로 시작",
    askPrompt:
      "구피, 네온테트라, 코리도라스, 베타 중에서 초보자가 키우기 가장 좋은 조합과 주의할 합사 궁합을 알려주세요!",
  },
];

export const AQUARIUM_DECOR_ITEMS: AquariumDecorItem[] = [
  {
    id: "pebbles",
    name: "동글 강돌 조약돌",
    description: "모래 바닥 위에 자연스럽게 어우러지는 매끈한 강돌",
    unlockCost: 0,
    positionClass: "bottom-4 left-8",
  },
  {
    id: "plant",
    name: "싱그러운 물수초",
    description: "물고기들이 사이를 헤엄치며 쉬기 좋은 푸른 수초",
    unlockCost: 1,
    positionClass: "bottom-4 left-28",
  },
  {
    id: "driftwood",
    name: "천연 유목 쉼터",
    description: "은은한 나뭇결이 편안한 어항 분위기를 만들어 주는 유목",
    unlockCost: 2,
    positionClass: "bottom-4 right-28",
  },
  {
    id: "pearl",
    name: "바다빛 진주 조개",
    description: "꾸준히 관찰 일기를 남긴 집사를 위한 은은한 진주 조개",
    unlockCost: 3,
    positionClass: "bottom-4 right-8",
  },
  {
    id: "arch",
    name: "작은 돌다리 아치",
    description: "물고기 친구들이 아래로 통과하며 노는 아늑한 돌다리",
    unlockCost: 4,
    positionClass: "bottom-4 left-1/2 -translate-x-1/2",
  },
];
