import React, { useState } from "react";
import {
  MessageCircle,
  CheckSquare,
  BookOpen,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { AQUARIUM_DECOR_ITEMS } from "../data/aquariumDefaults";
import { AquariumDecorSvg } from "./AquariumDecorSvg";

interface AquariumHeroProps {
  onOpenChat: () => void;
  onNavigate: (sectionId: string) => void;
  completedCount: number;
  totalTodoCount: number;
  tankName: string;
  observationPoints: number;
  activeDecorIds: string[];
  onToggleDecor: (id: string) => void;
  npcMoodLine: string;
}

import HERO_AQUARIUM_IMAGE from "../assets/images/aquarium_hero_backdrop_1794900923724.jpg";
import MASCOT_IMAGE from "../assets/images/multeuk_mascot.webp";

export const AquariumHero: React.FC<AquariumHeroProps> = ({
  onOpenChat,
  onNavigate,
  completedCount,
  totalTodoCount,
  tankName,
  observationPoints,
  activeDecorIds,
  onToggleDecor,
  npcMoodLine,
}) => {
  const [heroImgError, setHeroImgError] = useState(false);
  const [mascotImgError, setMascotImgError] = useState(false);
  const [stageMode, setStageMode] = useState<"photo" | "custom">("custom");

  return (
    <section id="top" className="aquarium-section mx-auto max-w-6xl px-4 pt-6 pb-6 sm:px-6 lg:pt-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Clean Aquarium Stage (Photo Mode OR Dedicated Illustrated Custom Tank) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative flex flex-1 flex-col min-h-[340px] lg:min-h-[420px] w-full overflow-hidden rounded-[2rem] border border-teal-200/80 bg-white/90 shadow-[0_16px_40px_rgba(52,154,174,0.12)]">
            {/* Stage Mode Switcher (Top-Right inside stage header bar) */}
            <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-[#f8fcff] px-4 py-2.5">
              <span className="text-xs font-medium text-slate-600 truncate">
                {tankName || "아직 등록된 어항 없음"} · 관찰 스티커 {observationPoints}개
              </span>

              <div
                role="group"
                aria-label="수족관 화면 보기 전환"
                className="flex items-center gap-1 rounded-lg bg-sky-100/70 p-0.5 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setStageMode("photo")}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    stageMode === "photo"
                      ? "bg-white text-[#0f293a] shadow-xs"
                      : "text-slate-600 hover:text-[#0f293a]"
                  }`}
                >
                  맑은 수족관
                </button>
                <button
                  type="button"
                  onClick={() => setStageMode("custom")}
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    stageMode === "custom"
                      ? "bg-white text-[#0f293a] shadow-xs"
                      : "text-slate-600 hover:text-[#0f293a]"
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-teal-600" />
                  <span>내 꾸미기 어항</span>
                </button>
              </div>
            </div>

            {stageMode === "photo" ? (
              /* Clean, natural sunlit aquarium photo — zero pasted stickers */
              <button
                type="button"
                onClick={onOpenChat}
                aria-label="수족관 사진 눌러서 물방울 AI 상담 열기"
                className="group relative flex-1 w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7] cursor-pointer block overflow-hidden"
              >
                {!heroImgError ? (
                  <img
                    src={HERO_AQUARIUM_IMAGE}
                    alt="햇살이 비치는 맑은 민트·하늘빛 수족관과 관상어들"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-200 via-teal-100 to-sky-50 p-8 text-center">
                    <p className="text-base font-medium text-sky-900">
                      맑은 하늘빛 수족관 — 여기를 누르면 물방울과 바로 대화할 수 있어요
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#082233]/80 via-[#082233]/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                  <p className="text-xs font-medium tracking-wide text-teal-200">
                    물특 · AI All-in-One 관상어 통합 케어 서비스
                  </p>
                  <h1
                    className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl leading-tight"
                    style={{ textWrap: "balance" }}
                  >
                    물방울과 함께 만드는 작은 수중 세상
                  </h1>
                  <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-[#0f293a] shadow-sm transition-colors group-hover:bg-sky-50">
                    <MessageCircle className="h-4 w-4 text-[#0284c7]" />
                    <span>수족관 눌러서 물방울과 대화하기</span>
                    <ArrowRight className="h-4 w-4 text-[#0284c7] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            ) : (
              /* Dedicated cohesive pastel-illustrated virtual aquarium for decorations */
              <div className="flex flex-1 flex-col justify-between bg-[#eaf7fc]">
                <div className="aquarium-stage relative flex-1 min-h-[210px] overflow-hidden bg-gradient-to-b from-[#d8f1fb] via-[#c7ecf8] to-[#b5e4f5]">
                  {/* Soft illustrated water ripples & sandy riverbed */}
                  <svg
                    viewBox="0 0 800 300"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full pointer-events-none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 40 Q200 22 400 40 T800 40 V0 H0 Z"
                      fill="#effafe"
                      opacity="0.7"
                    />
                    <circle cx="130" cy="110" r="5" fill="#ffffff" opacity="0.65" />
                    <circle cx="145" cy="82" r="3.5" fill="#ffffff" opacity="0.55" />
                    <circle cx="640" cy="95" r="4.5" fill="#ffffff" opacity="0.65" />
                    <circle cx="655" cy="65" r="3" fill="#ffffff" opacity="0.55" />
                    {/* Gentle illustrated fish */}
                    <g transform="translate(240 120)">
                      <ellipse cx="0" cy="0" rx="18" ry="11" fill="#FB923C" />
                      <path d="M-16 0 L-27 -8 L-27 8 Z" fill="#FDBA74" />
                      <circle cx="8" cy="-2" r="2.2" fill="#0F293A" />
                    </g>
                    <g transform="translate(520 145)">
                      <ellipse cx="0" cy="0" rx="14" ry="8.5" fill="#38BDF8" />
                      <path d="M13 0 L23 -7 L23 7 Z" fill="#7DD3FC" />
                      <circle cx="-6" cy="-1.5" r="2" fill="#0F293A" />
                    </g>
                    {/* Soft sandy bottom */}
                    <path
                      d="M0 245 Q220 230 440 248 T800 242 V300 H0 Z"
                      fill="#F3E8D2"
                    />
                  </svg>

                  {/* Placed illustrations inside their matching illustrated tank */}
                  {AQUARIUM_DECOR_ITEMS.filter(
                    (item) =>
                      observationPoints >= item.unlockCost &&
                      activeDecorIds.includes(item.id)
                  ).map((item) => (
                    <div
                      key={item.id}
                      title={item.name}
                      className={`pointer-events-none absolute z-10 ${item.positionClass}`}
                    >
                      <AquariumDecorSvg id={item.id} className="h-14 w-14 sm:h-16 sm:w-16" />
                    </div>
                  ))}

                  <div className="relative z-20 p-4">
                    <p className="text-xs font-semibold text-[#0369a1]">
                      내 꾸미기 어항 · 관찰 미션과 일기 기록으로 아이템을 열어요
                    </p>
                  </div>
                </div>

                {/* Clean Decoration Picker inside Custom Tank View */}
                <div className="border-t border-sky-100 bg-white p-3.5">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {AQUARIUM_DECOR_ITEMS.map((item) => {
                      const isUnlocked = observationPoints >= item.unlockCost;
                      const isActive = activeDecorIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!isUnlocked}
                          onClick={() => onToggleDecor(item.id)}
                          title={item.description}
                          className={`flex min-h-[42px] items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-colors ${
                            !isUnlocked
                              ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                              : isActive
                              ? "border-[#0284c7] bg-sky-50 text-[#0f293a] cursor-pointer"
                              : "border-teal-100 bg-[#f8fdfd] text-slate-700 hover:border-teal-300 cursor-pointer"
                          }`}
                        >
                          <div className="shrink-0">
                            {isUnlocked ? (
                              <AquariumDecorSvg id={item.id} className="h-6 w-6" />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200/70">
                                <Lock className="h-3 w-3 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[11px] font-semibold">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500 tabular-nums">
                              {isUnlocked
                                ? isActive
                                  ? "배치 중"
                                  : "배치하기"
                                : `스티커 ${item.unlockCost}개`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: NPC '물방울' Speech Bubble + 3 Primary Buttons */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-[2rem] border border-teal-200/80 bg-white/85 p-6 shadow-[0_16px_40px_rgba(52,154,174,0.10)] mascot-card">
          <div>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.6rem] border border-teal-100 bg-sky-50">
                {!mascotImgError ? (
                  <img
                    src={MASCOT_IMAGE}
                    alt="관상어 도우미 물방울 캐릭터"
                    referrerPolicy="no-referrer"
                    onError={() => setMascotImgError(true)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-sky-100 text-sm font-bold text-[#0284c7]">
                    물방울
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-teal-700">
                  오늘의 물방울 친구 🫧
                </p>
                <h2 className="mt-0.5 text-xl font-bold text-[#0f293a]">
                  물방울의 한마디
                </h2>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-sky-100 bg-[#f3fafd] p-4">
              <p className="text-[15px] font-semibold leading-snug text-[#0f293a]">
                &ldquo;{npcMoodLine}&rdquo;
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                입문자 어종 추천부터 실시간 어항 관제, 아픈 물고기 사진 상담까지 물방울이 초보 눈높이에 맞춰 도와드릴게요.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigate("todo-section")}
              className="flex w-full min-h-[54px] items-center justify-between rounded-xl border border-teal-200 bg-[#f4fbfb] px-4 py-3 text-left text-[#0f293a] hover:bg-teal-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CheckSquare className="h-5 w-5 shrink-0 text-teal-600" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">오늘의 돌봄</div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    오늘의 퀘스트 {completedCount} / {totalTodoCount} 완료
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={onOpenChat}
              className="flex w-full min-h-[54px] items-center justify-between rounded-xl bg-[#0284c7] px-4 py-3 text-left text-white hover:bg-[#0369a1] active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <MessageCircle className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">물특에게 물어보기</div>
                  <div className="text-xs text-sky-100 truncate">
                    사진 상담 · 입문 추천 · 어항 관제
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("tank-log-section")}
              className="flex w-full min-h-[54px] items-center justify-between rounded-xl border border-sky-200 bg-[#f6fbff] px-4 py-3 text-left text-[#0f293a] hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen className="h-5 w-5 shrink-0 text-[#0284c7]" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">어항 일기</div>
                  <div className="text-xs text-slate-500 truncate">
                    {tankName
                      ? `${tankName} · 기록하면 꾸미기 스티커 획득`
                      : "아직 입력된 어항 없음 · 선택 입력 후 일기 쓰기"}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
