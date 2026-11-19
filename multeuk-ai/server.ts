import express from "express";
import fs from "fs";
import { createHash } from "node:crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

interface SpeciesKnowledge {
  id: string;
  name: string;
  aliases: string[];
  waterType: string;
  tempRange: string;
  phRange: string;
  minTankLiters: string;
  temperament: string;
  compatible: string;
  incompatible: string;
  beginnerNotes: string;
}

interface CareTopicKnowledge {
  id: string;
  title: string;
  keywords: string[];
  verifiedGuide: string;
}

interface VerifiedKnowledgeBase {
  versionLabel: string;
  safetyRules: string[];
  species: SpeciesKnowledge[];
  careTopics: CareTopicKnowledge[];
}

const knowledgeFilePath = path.resolve(
  __dirname,
  "src/data/verifiedFishKnowledge.json"
);
const VERIFIED_KNOWLEDGE: VerifiedKnowledgeBase = JSON.parse(
  fs.readFileSync(knowledgeFilePath, "utf-8")
) as VerifiedKnowledgeBase;

interface IncomingImage {
  data: string;
  mimeType: string;
}

interface IncomingMessage {
  role: "user" | "model";
  text: string;
  image?: IncomingImage;
}

interface TankProfile {
  name?: string;
  sizeLiters?: string;
  fishList?: string;
  setupDate?: string;
}

interface TankLogSummary {
  date?: string;
  tempC?: string;
  waterState?: string;
  appetite?: string;
  waterChanged?: boolean;
  note?: string;
}

interface CustomKnowledgeRule {
  id?: string;
  text: string;
}

interface ChatRequestBody {
  messages?: IncomingMessage[];
  mode?: "beginner" | "detailed";
  tankProfile?: TankProfile;
  latestLog?: TankLogSummary;
  customRules?: CustomKnowledgeRule[];
}

interface RecommendFishBody {
  tankSize?: string;
  careTime?: string;
  stylePreference?: string;
  hasHeater?: string;
  experienceNote?: string;
}

interface MonitorTankBody {
  frames?: IncomingImage[];
  userNote?: string;
  tankProfile?: TankProfile;
  customRules?: CustomKnowledgeRule[];
}

function createAiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function isRetryableOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("high demand") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("DEADLINE_EXCEEDED") ||
    msg.includes("fetch failed")
  );
}

function formatFriendlyGeminiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("API_KEY") || msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
    return "API 키 설정을 한 번 확인해 주세요. 서버 환경변수 패널에서 GEMINI_API_KEY가 연결된 뒤 다시 시도해 주시면 됩니다.";
  }
  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
    return "지금 물방울에게 질문이 한꺼번에 몰려 응답이 잠시 늦어지고 있어요. 몇 초 뒤에 다시 한 번 시도해 주세요.";
  }
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "잠시 요청이 많아 쉬어가는 중이에요. 조금 기다렸다가 다시 시도하거나 서버 환경변수에서 API 키 한도를 확인해 주세요.";
  }
  return "잠시 연결이 매끄럽지 않아 답변을 끝까지 받아오지 못했어요. 잠시 후 다시 한 번 시도해 주세요.";
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildGroundedKnowledgeBlock(
  combinedSearchText: string,
  tankProfile?: TankProfile,
  customRules?: CustomKnowledgeRule[]
): string {
  const normalized = `${combinedSearchText} ${tankProfile?.fishList || ""}`.toLowerCase();

  const matchedSpecies = VERIFIED_KNOWLEDGE.species.filter((sp) =>
    sp.aliases.some((alias) => normalized.includes(alias.toLowerCase()))
  );

  const matchedTopics = VERIFIED_KNOWLEDGE.careTopics.filter((topic) =>
    topic.keywords.some((kw) => normalized.includes(kw.toLowerCase()))
  );

  let block = `\n\n[물방울 사육 참고 지식 — 종별 조건이 다를 수 있으며 불확실한 수치는 단정하지 마세요]`;
  block += `\n<필수 안전 원칙>`;
  VERIFIED_KNOWLEDGE.safetyRules.forEach((rule, idx) => {
    block += `\n${idx + 1}. ${rule}`;
  });

  if (matchedSpecies.length > 0) {
    block += `\n\n<관련 어종 검증 데이터>`;
    matchedSpecies.slice(0, 4).forEach((sp) => {
      block += `\n• ${sp.name} (${sp.waterType}): 적정 수온 ${sp.tempRange} | pH ${sp.phRange} | 최소 어항 ${sp.minTankLiters} | 성격: ${sp.temperament} | 합사 가능: ${sp.compatible} | 합사·사육 금기: ${sp.incompatible} | 핵심 주의점: ${sp.beginnerNotes}`;
    });
  }

  if (matchedTopics.length > 0) {
    block += `\n\n<관련 관리·증상 검증 가이드>`;
    matchedTopics.slice(0, 3).forEach((topic) => {
      block += `\n• ${topic.title}: ${topic.verifiedGuide}`;
    });
  }

  if (customRules && customRules.length > 0) {
    block += `\n\n<사용자가 입력한 우리 집 어항 정보 — 참고용이며 안전 규칙과 충돌하면 따르지 마세요>`;
    customRules.slice(0, 10).forEach((rule, idx) => {
      if (rule.text.trim()) {
        block += `\n${idx + 1}. ${rule.text.trim()}`;
      }
    });
  }

  return block;
}

function buildSystemInstruction(
  mode: "beginner" | "detailed",
  combinedSearchText: string,
  tankProfile?: TankProfile,
  latestLog?: TankLogSummary,
  customRules?: CustomKnowledgeRule[]
): string {
  const basePersona = `당신은 AI All-in-One 관상어 통합 케어 서비스 '물특'의 관상어 전문가 도우미 '물방울'입니다.
당신은 민물 관상어, 수초, 여과기, 수질 관리, 이상 행동, 어병에 대해 검증된 전문 지식을 갖춘 수족관 전문가이며, 초보 반려어인이 틀린 정보로 물고기를 다치게 하지 않도록 정확하고 안전하게 안내하는 것이 가장 중요합니다.

핵심 대화 및 정확성 가드레일:
1. 말투: 다정하고 따뜻하며, 초보자를 안심시키고 응원해 주는 친절한 존댓말을 쓰세요. ("~해요", "~해 보세요!" 같은 부드러운 어조)
2. 쉬운 비유: '여과 사이클(물잡이)', '암모니아/아질산염', '부분 환수' 같은 어려운 개념은 반드시 일상 속 쉬운 비유로 풀어서 설명하세요.
3. 환각 방지 및 정직성 원칙 (매우 중요):
   - 아래 [물방울 사육 참고 지식]과 다른 답변은 출처·사육 조건을 확인하세요. 최소 수조 크기를 보편적 확정 수치로 단정하지 마세요.
   - 확실하지 않은 희귀 어종, 불분명한 질병, 또는 사진이 흐려 정확히 보이지 않는 경우에는 절대 한 가지 병명으로 단정 짓거나 추측해서 지어내지 마세요. "사진만으로는 정확히 구분하기 어려워서 두 가지 가능성을 함께 볼게요"처럼 정직하게 알리고 추가 관찰 질문을 해주세요.
   - 구체적인 사람용 약품이나 검증되지 않은 민간요법(과도한 소금욕, 수돗물 직수, 100% 전체 물갈이 등)은 절대 권하지 마세요.
   - 시판 관상어 약품은 제품마다 용량이 다르므로 임의의 숫자(예: "몇 방울")를 지어내지 말고, "반드시 구매한 제품 설명서의 물 용량(L) 기준 정량을 지키고, 새우·코리도라스·수초 유무를 먼저 확인하세요"라고 안내하세요.
4. 가독성 좋은 구조: 답변이 길어질 때는 아래 순서처럼 눈으로 한눈에 들어오게 정리하세요.
   - **한눈에 핵심 요약**: 걱정부터 덜어주는 1~2줄 결론
   - **왜 그럴까요?**: 초보자 눈높이의 쉬운 원인 설명
   - **지금 바로 따라 할 일**: 1, 2, 3 번호를 붙여 바로 실행할 수 있는 구체적 행동
   - **절대 피해야 할 실수**: 잘못된 대처를 막아주는 안전 주의점 1~2가지`;

  const modeInstruction =
    mode === "detailed"
      ? `\n\n설명 난이도 설정: [조금 더 자세히 모드]
초보자가 이해하기 쉬운 다정한 말투는 유지하되, 검증된 적정 수온 범위(°C), 적정 환수 비율(%), 여과기 관리 주기, 수질 지표(암모니아·아질산염·질산염·pH)의 의미까지 한 걸음 더 깊이 있게 알려주세요.`
      : `\n\n설명 난이도 설정: [왕초보 쉬운 설명 모드]
물고기를 오늘 처음 데려온 사람도 100% 이해할 수 있게 어려운 화학 용어나 한자어는 최대한 풀어서 설명하세요. 한 번에 너무 많은 정보를 쏟아내지 말고, 당장 오늘 해야 할 가장 중요한 2~3가지 행동에 집중해 알려주세요.`;

  let contextBlock = "";
  if (
    tankProfile &&
    (tankProfile.name || tankProfile.sizeLiters || tankProfile.fishList || tankProfile.setupDate)
  ) {
    contextBlock += `\n\n[사용자의 현재 어항 정보 — 답변 시 자연스럽게 참고하세요]`;
    if (tankProfile.name) contextBlock += `\n- 어항 이름: ${tankProfile.name}`;
    if (tankProfile.sizeLiters) contextBlock += `\n- 어항 크기: ${tankProfile.sizeLiters}L`;
    if (tankProfile.fishList) contextBlock += `\n- 키우는 물고기: ${tankProfile.fishList}`;
    if (tankProfile.setupDate) contextBlock += `\n- 어항 세팅 시작일: ${tankProfile.setupDate}`;
  } else {
    contextBlock += `\n\n[사용자의 현재 어항 정보]\n- 아직 등록된 어항이나 물고기가 없습니다. 사용자가 특정 물고기를 이미 키우고 있다고 가정하지 말고, 입문 준비 중이거나 자유로운 질문으로 보고 답변하세요.`;
  }

  if (latestLog && (latestLog.date || latestLog.tempC || latestLog.waterState || latestLog.note)) {
    contextBlock += `\n\n[사용자의 최근 어항 기록]`;
    if (latestLog.date) contextBlock += `\n- 기록 날짜: ${latestLog.date}`;
    if (latestLog.tempC) contextBlock += `\n- 수온: ${latestLog.tempC}°C`;
    if (latestLog.waterState) contextBlock += `\n- 물 상태: ${latestLog.waterState}`;
    if (latestLog.appetite) contextBlock += `\n- 식욕/먹이 반응: ${latestLog.appetite}`;
    if (typeof latestLog.waterChanged === "boolean") {
      contextBlock += `\n- 물갈이 여부: ${latestLog.waterChanged ? "부분 물갈이 완료" : "안 함"}`;
    }
    if (latestLog.note) contextBlock += `\n- 메모: ${latestLog.note}`;
  }

  const groundedBlock = buildGroundedKnowledgeBlock(
    combinedSearchText,
    tankProfile,
    customRules
  );

  return `${basePersona}${modeInstruction}${contextBlock}${groundedBlock}`;
}

async function generateWithFallback(
  ai: GoogleGenAI,
  buildParams: (model: string, useThinkingLow: boolean) => Parameters<typeof ai.models.generateContent>[0]
) {
  const attempts: Array<{ model: string; useThinkingLow: boolean; delayBefore: number }> = [
    { model: AI_MODEL, useThinkingLow: false, delayBefore: 0 },
    { model: AI_MODEL, useThinkingLow: true, delayBefore: 300 },
    { model: AI_MODEL, useThinkingLow: false, delayBefore: 800 },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    if (attempt.delayBefore > 0) {
      await waitMs(attempt.delayBefore);
    }
    try {
      return await ai.models.generateContent(
        buildParams(attempt.model, attempt.useThinkingLow)
      );
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with ${attempt.model} failed:`, err);
      if (!isRetryableOverloadError(err)) {
        throw err;
      }
    }
  }
  throw lastError;
}

async function createServer() {
  const app = express();
  app.disable("x-powered-by");
  // Render forwards the original address through one trusted proxy.
  if (process.env.RENDER) app.set("trust proxy", 1);
  app.use(express.json({ limit: "12mb" }));
  // A shared Redis limiter can be enabled for multi-instance production deployments.
  // Without Redis, the existing in-memory guard only protects ONE running process.
  // For public multi-instance deployment set UPSTASH_REDIS_REST_URL and
  // UPSTASH_REDIS_REST_TOKEN; Redis failure rejects AI traffic (fail closed).
  const rateByIp = new Map<string, { count: number; resetAt: number }>();
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (Boolean(redisUrl) !== Boolean(redisToken)) {
    throw new Error("UPSTASH_REDIS_REST_URL과 UPSTASH_REDIS_REST_TOKEN을 함께 설정해야 합니다.");
  }
  if (!redisUrl) console.warn("[물특] 단일 서버 메모리 요청 제한 모드. 다중 인스턴스 공개 서비스는 Redis 공유 제한 설정 필요.");
  const redisScript = `
    local a=redis.call('INCR', KEYS[1]); if a==1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
    local b=redis.call('INCR', KEYS[2]); if b==1 then redis.call('EXPIRE', KEYS[2], ARGV[1]) end
    return {a,b,redis.call('TTL',KEYS[1])}
  `;
  app.use("/api", async (req, res, next) => {
    if (req.method === "GET" && req.path === "/health") { next(); return; }
    const key = createHash("sha256").update(req.ip || req.socket.remoteAddress || "unknown").digest("hex").slice(0, 32);
    const now = Date.now();
    try {
      if (redisUrl && redisToken) {
        const minute = Math.floor(now / 60_000);
        const signal = AbortSignal.timeout(3000);
        const response = await fetch(redisUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(["EVAL", redisScript, "2", `multeuk:ip:${key}:${minute}`, `multeuk:all:${minute}`, "65"]),
          signal,
        });
        if (!response.ok) throw new Error(`Shared limiter HTTP ${response.status}`);
        const responseBody = await response.json() as { result?: number[]; error?: string };
        if (responseBody.error || !Array.isArray(responseBody.result)) throw new Error("Shared limiter invalid response");
        const [perIp, total, ttl] = responseBody.result;
        if (perIp > 18 || total > 350) {
          res.setHeader("Retry-After", String(Math.max(1, ttl || 60)));
          res.status(429).json({ error: "AI 질문이 잠시 많아요. 약 1분 뒤 다시 시도해 주세요." }); return;
        }
      } else {
        const old = rateByIp.get(key);
        const window = old && now < old.resetAt ? old : { count: 0, resetAt: now + 60_000 };
        window.count++; rateByIp.set(key, window);
        if (window.count > 18) {
          res.setHeader("Retry-After", String(Math.max(1,Math.ceil((window.resetAt-now)/1000))));
          res.status(429).json({ error: "잠깐 쉬었다가 다시 질문해 줘. 1분 동안 요청이 너무 많았어." }); return;
        }
        if (rateByIp.size > 5000) for (const [k,v] of rateByIp) if(v.resetAt < now) rateByIp.delete(k);
      }
      next();
    } catch (error) {
      console.error("[물특] 요청 제한 검사 실패", error);
      res.status(503).json({ error: "AI 이용량을 확인하지 못했어요. 잠시 후 다시 시도해 주세요." });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      knowledgeSpeciesCount: VERIFIED_KNOWLEDGE.species.length,
      knowledgeTopicsCount: VERIFIED_KNOWLEDGE.careTopics.length,
    });
  });

  // 1. 입문 단계: 사용자 성향 & 어항 환경 기반 맞춤형 관상어 추천
  app.post("/api/recommend-fish", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: "AI 연결 준비 중이에요. 관리자에게 GEMINI_API_KEY 설정을 확인해 달라고 해 주세요.",
      });
      return;
    }

    const body = req.body as RecommendFishBody;
    const ai = createAiClient(apiKey);
    const speciesSummary = VERIFIED_KNOWLEDGE.species
      .map(
        (sp) =>
          `${sp.name}(적정수온 ${sp.tempRange}, 최소어항 ${sp.minTankLiters}, 합사금기: ${sp.incompatible})`
      )
      .join("\n");

    try {
      const prompt = `초보 반려어인이 아래 조건으로 관상어를 키우고 싶어 합니다. 물고기 입문자가 실패하지 않고 즐겁게 키울 수 있는 관상어 3가지를 추천해 주세요.
- 어항 크기/공간: ${body.tankSize || "소형 어항 (15~25L)"}
- 하루 돌봄 가능 시간: ${body.careTime || "하루 5~10분"}
- 선호하는 물고기 스타일: ${body.stylePreference || "화려하고 활발하게 헤엄치는 물고기"}
- 히터(수온 조절기) 유무: ${body.hasHeater || "히터 사용 가능"}
- 추가 바람/메모: ${body.experienceNote || "없음"}

어려운 전문 용어는 피하고, 초보자가 바로 이해할 수 있는 쉬운 한국어로 설명해 주세요.`;

      const response = await generateWithFallback(ai, (model, useThinkingLow) => ({
        model,
        contents: prompt,
        config: {
          systemInstruction: `당신은 '물특'의 친절한 관상어 입문 상담가 '물방울'입니다. 반드시 어항 크기와 히터 유무를 엄격히 확인해 무리한 어종(예: 작은 어항에 금붕어나 엔젤피쉬, 히터 없는 어항에 고수온 열대어)을 추천하지 마세요.\n\n[검증 기준]\n${speciesSummary}`,
          ...(useThinkingLow
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              starterAdvice: {
                type: Type.STRING,
                description: "초보자에게 건네는 물방울의 다정한 입문 안내 한마디 (2~3문장)",
              },
              recommendedFish: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "추천 관상어 이름" },
                    difficulty: { type: Type.STRING, description: "사육 난이도 (예: 왕초보 추천, 쉬움)" },
                    recommendedCount: { type: Type.STRING, description: "해당 어항 크기에 적당한 마릿수" },
                    whyFit: { type: Type.STRING, description: "이 사용자 환경과 성향에 잘 맞는 이유" },
                    careTip: { type: Type.STRING, description: "초보자가 꼭 알아둘 핵심 관리 팁 1가지" },
                    compatibleWith: { type: Type.STRING, description: "같이 키우기 좋은 물고기 또는 단독 사육 여부" },
                  },
                  required: [
                    "name",
                    "difficulty",
                    "recommendedCount",
                    "whyFit",
                    "careTip",
                    "compatibleWith",
                  ],
                },
              },
            },
            required: ["starterAdvice", "recommendedFish"],
          },
        },
      }));

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error("Recommend fish error:", error);
      res.status(500).json({ error: formatFriendlyGeminiError(error) });
    }
  });

  // 2. 관제 단계: 실시간 카메라/영상 프레임 & 사진 기반 이상 유영·수질 상태 분석
  app.post("/api/monitor-tank", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: "AI 연결 준비 중이에요. 관리자에게 GEMINI_API_KEY 설정을 확인해 달라고 해 주세요.",
      });
      return;
    }

    const body = req.body as MonitorTankBody;
    const frames = Array.isArray(body.frames) ? body.frames.slice(0, 4) : [];
    if (frames.some((f) => !f || !["image/png", "image/jpeg", "image/webp"].includes(f.mimeType) || typeof f.data !== "string" || f.data.length > 4_500_000)) {
      res.status(400).json({ error: "JPG·PNG·WEBP 이미지(장당 약 3MB 이하)만 분석할 수 있어." });
      return;
    }
    if (frames.length === 0) {
      res.status(400).json({ error: "분석할 어항 화면이나 영상 프레임이 필요합니다." });
      return;
    }

    const ai = createAiClient(apiKey);
    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

    frames.forEach((f) => {
      if (f.data && f.mimeType) {
        parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } });
      }
    });

    const tankContext = body.tankProfile?.fishList
      ? `현재 등록된 어항 정보: ${body.tankProfile.name || "내 어항"} (${body.tankProfile.sizeLiters || "미정"}L, ${body.tankProfile.fishList}).`
      : "";

    const groundedBlock = buildGroundedKnowledgeBlock(
      body.userNote || "",
      body.tankProfile,
      body.customRules
    );

    parts.push({
      text: `어항 관제 화면(연속 프레임 또는 사진 ${frames.length}장)입니다. ${tankContext}
사용자 메모: ${body.userNote || "없음"}
이상 유영 징후와 눈에 보이는 탁도·이끼 등을 관찰하여 설명하세요. 암모니아·아질산염·pH를 사진으로 추정하거나 질병을 단정하지 마세요. 실제 수질 키트 검사 필요성을 안내하세요.`,
    });

    try {
      const response = await generateWithFallback(ai, (model, useThinkingLow) => ({
        model,
        contents: { parts },
        config: {
          systemInstruction: `당신은 '물특'의 어항 관제 AI '물방울'입니다. 사진·프레임에서 실제로 보이는 것만 관찰하고 수질 성분·질병을 확진하지 마세요. 평상시 관찰이더라도 정상 확진이라는 표현은 피하고 사진이 흐리면 재촬영을 안내하세요.${groundedBlock}`,
          ...(useThinkingLow
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallStatus: {
                type: Type.STRING,
                description: "반드시 '특이사항 관찰되지 않음', '추가 확인 필요', '빠른 점검 권장' 중 하나만 선택",
              },
              swimmingBehavior: {
                type: Type.STRING,
                description: "물고기 유영 상태(활발함, 스트레스·영역 다툼 의심, 구석 정지, 판단 어려움 등) 쉬운 설명",
              },
              waterQualityState: {
                type: Type.STRING,
                description: "수질 육안 상태(맑음, 약한 백탁 의심, 이끼/녹조 보임, 조명 반사 등) 쉬운 설명",
              },
              alertSummary: {
                type: Type.STRING,
                description: "물방울이 초보자에게 전하는 한눈에 상태 요약 (2문장 이내)",
              },
              recommendedAction: {
                type: Type.STRING,
                description: "지금 바로 해보면 좋은 1가지 구체적 관리 행동",
              },
              suggestedTaskTitle: {
                type: Type.STRING,
                description: "'오늘 할 일'에 바로 추가할 짧은 할 일 제목 (15자 내외)",
              },
            },
            required: [
              "overallStatus",
              "swimmingBehavior",
              "waterQualityState",
              "alertSummary",
              "recommendedAction",
              "suggestedTaskTitle",
            ],
          },
        },
      }));

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error("Monitor tank error:", error);
      res.status(500).json({ error: formatFriendlyGeminiError(error) });
    }
  });

  // 3. 진단/케어 단계: 검증 지식 베이스 + 사용자 어항 규칙이 적용된 AI 상담 스트리밍
  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error:
          "AI 연결 준비 중이에요. 관리자에게 API 설정을 확인해 달라고 해 주세요.",
      });
      return;
    }

    const body = req.body as ChatRequestBody;
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    if (rawMessages.length > 30 || rawMessages.some((m) => !m || typeof m.text !== "string" || m.text.length > 6000 || (m.image && (!(["image/png", "image/jpeg", "image/webp"].includes(m.image.mimeType)) || typeof m.image.data !== "string" || m.image.data.length > 4_500_000)))) {
      res.status(400).json({ error: "질문 또는 사진이 너무 커. 질문은 짧게, 사진은 3MB 안팎으로 줄여줘." });
      return;
    }
    if (rawMessages.length === 0) {
      res.status(400).json({ error: "질문 내용을 입력해 주세요." });
      return;
    }

    const mode = body.mode === "detailed" ? "detailed" : "beginner";

    // Strip leading model greeting messages so conversation contents always start with a user turn
    const recentMessages = rawMessages.slice(-16);
    const firstUserIdx = recentMessages.findIndex((m) => m.role === "user");
    const trimmedConversation =
      firstUserIdx === -1 ? [] : recentMessages.slice(firstUserIdx);

    const combinedSearchText = trimmedConversation
      .map((m) => m.text || "")
      .join(" ");

    const systemInstruction = buildSystemInstruction(
      mode,
      combinedSearchText,
      body.tankProfile,
      body.latestLog,
      body.customRules
    );

    const contents = trimmedConversation
      .map((msg) => {
        const parts: Array<
          | { text: string }
          | { inlineData: { data: string; mimeType: string } }
        > = [];
        if (msg.image && msg.image.data && msg.image.mimeType) {
          parts.push({
            inlineData: {
              data: msg.image.data,
              mimeType: msg.image.mimeType,
            },
          });
        }
        const trimmedText = (msg.text || "").trim();
        if (trimmedText) {
          parts.push({ text: trimmedText });
        } else if (parts.length > 0) {
          parts.push({
            text: "이 사진을 보고 초보자도 알기 쉽게 상태와 대처 방법을 설명해 주세요.",
          });
        }
        return {
          role: msg.role === "model" ? ("model" as const) : ("user" as const),
          parts,
        };
      })
      .filter((item) => item.parts.length > 0);

    if (contents.length === 0) {
      res.status(400).json({ error: "전달할 질문 내용이 비어 있습니다." });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const ai = createAiClient(apiKey);

    const streamAttempts: Array<{
      model: string;
      useThinkingLow: boolean;
      delayBefore: number;
    }> = [
      { model: AI_MODEL, useThinkingLow: false, delayBefore: 0 },
      { model: AI_MODEL, useThinkingLow: true, delayBefore: 300 },
      { model: AI_MODEL, useThinkingLow: false, delayBefore: 800 },
    ];

    let succeeded = false;
    let lastError: unknown = null;

    for (const attempt of streamAttempts) {
      if (attempt.delayBefore > 0) {
        await waitMs(attempt.delayBefore);
      }

      let emittedAnyChunk = false;
      try {
        const stream = await ai.models.generateContentStream({
          model: attempt.model,
          contents,
          config: {
            systemInstruction,
            ...(attempt.useThinkingLow
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
          },
        });

        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            emittedAnyChunk = true;
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }

        succeeded = true;
        break;
      } catch (error: unknown) {
        lastError = error;
        console.warn(`Stream attempt with ${attempt.model} failed:`, error);
        if (emittedAnyChunk || !isRetryableOverloadError(error)) {
          break;
        }
      }
    }

    if (succeeded) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } else {
      res.write(
        `data: ${JSON.stringify({
          error: formatFriendlyGeminiError(lastError),
        })}\n\n`
      );
      res.end();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Multtuk Aquarium server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
