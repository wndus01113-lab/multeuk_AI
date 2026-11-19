export type ExplanationMode = "beginner" | "detailed";

export type CareHubTab = "chat" | "starter" | "monitor" | "knowledge";

export interface CustomKnowledgeRule {
  id: string;
  text: string;
  createdAt: string;
}

export interface AttachedImage {
  data: string;
  mimeType: string;
  previewUrl: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  image?: AttachedImage;
  isErrorRetry?: boolean;
}

export interface TodoTask {
  id: string;
  title: string;
  description: string;
  frequency: "매일" | "주 1~2회" | "수시";
  completed: boolean;
  askPrompt: string;
  isObservationQuest?: boolean;
}

export interface TankProfile {
  name: string;
  sizeLiters: string;
  fishList: string;
  setupDate: string;
}

export interface TankLogEntry {
  id: string;
  date: string;
  tempC: string;
  waterState: "맑음" | "약간 뿌염" | "이끼·녹조" | "냄새·거품";
  appetite: "잘 먹음" | "보통" | "안 먹음";
  waterChanged: boolean;
  note: string;
}

export interface BeginnerGuideTopic {
  id: string;
  stepNumber: string;
  title: string;
  summary: string;
  keyRule: string;
  askPrompt: string;
}

export interface FishRecommendation {
  name: string;
  difficulty: string;
  recommendedCount: string;
  whyFit: string;
  careTip: string;
  compatibleWith: string;
}

export interface FishRecommendResponse {
  starterAdvice: string;
  recommendedFish: FishRecommendation[];
}

export interface MonitorTankResult {
  overallStatus: "정상" | "주의" | "점검 필요";
  swimmingBehavior: string;
  waterQualityState: string;
  alertSummary: string;
  recommendedAction: string;
  suggestedTaskTitle: string;
}

export interface AquariumDecorItem {
  id: string;
  name: string;
  description: string;
  unlockCost: number;
  positionClass: string;
}
