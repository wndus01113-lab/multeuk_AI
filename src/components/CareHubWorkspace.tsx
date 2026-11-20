import React, { useState } from "react";
import { MessageCircle, Compass, Video, ShieldCheck } from "lucide-react";
import type {
  CareHubTab,
  ChatMessage,
  CustomKnowledgeRule,
  ExplanationMode,
  TankLogEntry,
  TankProfile,
} from "../types/aquarium";
import { ChatbotWorkspace } from "./ChatbotWorkspace";
import { StarterRecommender } from "./StarterRecommender";
import { TankMonitorPanel } from "./TankMonitorPanel";
import { KnowledgeTrainingPanel } from "./KnowledgeTrainingPanel";

interface CareHubWorkspaceProps {
  activeTab: CareHubTab;
  onChangeTab: (tab: CareHubTab) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  mode: ExplanationMode;
  setMode: (mode: ExplanationMode) => void;
  tankProfile: TankProfile;
  latestLog?: TankLogEntry;
  customRules: CustomKnowledgeRule[];
  onAddRule: (text: string) => void;
  onDeleteRule: (id: string) => void;
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
  onApplyRecommendedFish: (fishList: string, sizeLiters: string) => void;
  onAddSuggestedTask: (title: string, description: string) => void;
  onAskMulbangul: (prompt: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

import MASCOT_IMAGE from "../assets/images/multeuk_mascot.webp";

export const CareHubWorkspace: React.FC<CareHubWorkspaceProps> = ({
  activeTab,
  onChangeTab,
  messages,
  setMessages,
  mode,
  setMode,
  tankProfile,
  latestLog,
  customRules,
  onAddRule,
  onDeleteRule,
  pendingPrompt,
  onClearPendingPrompt,
  onApplyRecommendedFish,
  onAddSuggestedTask,
  onAskMulbangul,
  inputRef,
}) => {
  const [mascotImgError, setMascotImgError] = useState(false);

  return (
    <section id="care-hub-section" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-teal-200/80 bg-white/90 shadow-[0_14px_34px_rgba(52,154,174,.09)]">
        {/* Unified 3-Stage AI Header & Tab Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sky-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-teal-100 bg-sky-50">
              {!mascotImgError ? (
                <img
                  src={MASCOT_IMAGE}
                  alt="물방울 도우미"
                  referrerPolicy="no-referrer"
                  onError={() => setMascotImgError(true)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#0284c7]">
                  물방울
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#0f293a] truncate">
                물특 AI 도우미
              </h2>
              <p className="text-xs text-slate-500 truncate">
                검증된 12종 어종 데이터 학습 · 입문 추천 · 관제 스캔 · 사진 상담
              </p>
            </div>
          </div>

          {/* 4 Functional Tabs */}
          <div
            role="tablist"
            aria-label="물특 AI 기능 선택"
            className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-[#eef7fb] p-1 md:w-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "chat"}
              onClick={() => onChangeTab("chat")}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "chat"
                  ? "bg-white text-[#0f293a] shadow-xs"
                  : "text-slate-600 hover:text-[#0f293a]"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>진단·케어 상담</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "starter"}
              onClick={() => onChangeTab("starter")}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "starter"
                  ? "bg-white text-[#0f293a] shadow-xs"
                  : "text-slate-600 hover:text-[#0f293a]"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-teal-600" />
              <span>입문 어종 추천</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "monitor"}
              onClick={() => onChangeTab("monitor")}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "monitor"
                  ? "bg-white text-[#0f293a] shadow-xs"
                  : "text-slate-600 hover:text-[#0f293a]"
              }`}
            >
              <Video className="h-3.5 w-3.5 text-[#0284c7]" />
              <span>수조 관제 스캔</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "knowledge"}
              onClick={() => onChangeTab("knowledge")}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "knowledge"
                  ? "bg-white text-[#0f293a] shadow-xs"
                  : "text-slate-600 hover:text-[#0f293a]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>학습 지식·규칙</span>
            </button>
          </div>
        </div>

        {/* Active Stage Panel */}
        {activeTab === "chat" && (
          <ChatbotWorkspace
            messages={messages}
            setMessages={setMessages}
            mode={mode}
            setMode={setMode}
            tankProfile={tankProfile}
            latestLog={latestLog}
            customRules={customRules}
            pendingPrompt={pendingPrompt}
            onClearPendingPrompt={onClearPendingPrompt}
            onRegisterCareTask={onAddSuggestedTask}
            inputRef={inputRef}
          />
        )}

        {activeTab === "starter" && (
          <StarterRecommender
            tankProfile={tankProfile}
            onApplyToProfile={onApplyRecommendedFish}
            onAskMulbangul={onAskMulbangul}
          />
        )}

        {activeTab === "monitor" && (
          <TankMonitorPanel
            tankProfile={tankProfile}
            customRules={customRules}
            onAddSuggestedTask={onAddSuggestedTask}
            onAskMulbangul={onAskMulbangul}
          />
        )}

        {activeTab === "knowledge" && (
          <KnowledgeTrainingPanel
            customRules={customRules}
            onAddRule={onAddRule}
            onDeleteRule={onDeleteRule}
            onAskSpecies={onAskMulbangul}
          />
        )}
      </div>
    </section>
  );
};
