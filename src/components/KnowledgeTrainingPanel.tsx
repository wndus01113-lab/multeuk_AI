import React, { useState } from "react";
import { ShieldCheck, Plus, Trash2, Search, MessageCircle } from "lucide-react";
import verifiedKnowledge from "../data/verifiedFishKnowledge.json";
import type { CustomKnowledgeRule } from "../types/aquarium";

interface KnowledgeTrainingPanelProps {
  customRules: CustomKnowledgeRule[];
  onAddRule: (text: string) => void;
  onDeleteRule: (id: string) => void;
  onAskSpecies: (prompt: string) => void;
}

export const KnowledgeTrainingPanel: React.FC<KnowledgeTrainingPanelProps> = ({
  customRules,
  onAddRule,
  onDeleteRule,
  onAskSpecies,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newRuleText, setNewRuleText] = useState("");

  const filteredSpecies = verifiedKnowledge.species.filter((sp) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      sp.name.toLowerCase().includes(q) ||
      sp.aliases.some((a) => a.toLowerCase().includes(q)) ||
      sp.waterType.toLowerCase().includes(q)
    );
  });

  const handleRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRuleText.trim();
    if (!trimmed) return;
    onAddRule(trimmed);
    setNewRuleText("");
  };

  return (
    <div className="p-5 sm:p-6 bg-[#fbfdff] space-y-6">
      {/* Top Grid: Safety Guardrails + Custom User Teaching */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-2xl border border-sky-100 bg-white p-5">
          <div className="flex items-center gap-2 text-teal-700">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <h3 className="text-base font-bold text-[#0f293a]">
              물방울이 학습한 6가지 안전 사육 원칙
            </h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            AI가 잘못된 민간요법이나 위험한 대처를 알려주지 않도록, 모든 답변 전에 아래 검증 규칙을 먼저 확인해요.
          </p>

          <ul className="mt-4 space-y-2.5">
            {verifiedKnowledge.safetyRules.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
              >
                <span className="mt-0.5 font-mono-tabular text-xs font-bold text-[#0284c7]">
                  0{idx + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-sky-100 bg-white p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#0284c7]">
              나만의 맞춤 학습 · 우리 집 어항 규칙 가르치기
            </p>
            <h3 className="mt-1 text-base font-bold text-[#0f293a]">
              물방울에게 우리 어항 특징 직접 알려주기
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              여기에 적어둔 규칙은 물방울이 대답할 때마다 자동으로 참고해요. (예: &ldquo;스펀지 여과기를 쓰고 있어요&rdquo;, &ldquo;어항에 수초가 많아요&rdquo;)
            </p>

            <form onSubmit={handleRuleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                placeholder="예: 우리 집 구피는 아침 8시에 밥을 주고, 수초가 많아요"
                className="min-h-[42px] flex-1 rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369a1] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>규칙 학습시키기</span>
              </button>
            </form>
          </div>

          <div className="mt-4 border-t border-sky-100 pt-3">
            {customRules.length === 0 ? (
              <p className="text-xs text-slate-500">
                아직 직접 추가한 규칙이 없어요. 우리 집 어항의 여과기 종류나 먹이 시간 등을 적어두면 더 정확해져요.
              </p>
            ) : (
              <ul className="space-y-2">
                {customRules.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-teal-100 bg-[#f4fbfb] px-3.5 py-2.5"
                  >
                    <span className="text-sm text-[#0f293a]">{rule.text}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteRule(rule.id)}
                      aria-label="학습 규칙 삭제"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Verified Species Dictionary */}
      <div className="rounded-2xl border border-sky-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sky-100 pb-4">
          <div>
            <p className="text-xs font-semibold text-teal-700">
              {verifiedKnowledge.versionLabel} · {verifiedKnowledge.species.length}종 탑재 완료
            </p>
            <h3 className="mt-0.5 text-lg font-bold text-[#0f293a]">
              물방울이 정확히 외우고 있는 어종별 검증 데이터
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="어종 이름 검색 (예: 구피, 베타)"
              className="min-h-[40px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] pl-9 pr-3 py-1.5 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSpecies.map((sp) => (
            <article
              key={sp.id}
              className="flex flex-col justify-between rounded-xl border border-sky-100 bg-[#fbfdff] p-4"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-base font-bold text-[#0f293a]">{sp.name}</h4>
                  <span className="text-xs text-slate-500">{sp.waterType}</span>
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-600 tabular-nums">
                  <p>
                    <strong className="font-semibold text-[#0f293a]">적정 수온:</strong>{" "}
                    {sp.tempRange} · <strong className="font-semibold text-[#0f293a]">pH:</strong>{" "}
                    {sp.phRange}
                  </p>
                  <p>
                    <strong className="font-semibold text-[#0f293a]">최소 어항:</strong>{" "}
                    {sp.minTankLiters}
                  </p>
                  <p>
                    <strong className="font-semibold text-teal-700">합사 추천:</strong>{" "}
                    {sp.compatible}
                  </p>
                  <p>
                    <strong className="font-semibold text-rose-700">주의·금기:</strong>{" "}
                    {sp.incompatible}
                  </p>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                  {sp.beginnerNotes}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onAskSpecies(
                    `'${sp.name}'를 초보자가 건강하게 키우려면 무엇을 가장 신경 써야 하나요? 적정 수온과 합사 주의점도 쉽게 알려주세요.`
                  )
                }
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>이 물고기로 물방울에게 질문하기</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
