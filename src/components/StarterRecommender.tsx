import React, { useState } from "react";
import { Fish, MessageCircle } from "lucide-react";
import type { FishRecommendResponse, TankProfile } from "../types/aquarium";

interface StarterRecommenderProps {
  tankProfile: TankProfile;
  onApplyToProfile: (fishList: string, sizeLabel: string) => void;
  onAskMulbangul: (prompt: string) => void;
}

export const StarterRecommender: React.FC<StarterRecommenderProps> = ({
  tankProfile,
  onApplyToProfile,
  onAskMulbangul,
}) => {
  const [tankSize, setTankSize] = useState("소형 어항 (15~25L · 책상 위 추천)");
  const [careTime, setCareTime] = useState("하루 5~10분 가볍게 관찰 가능");
  const [stylePreference, setStylePreference] = useState("화려하고 활발하게 헤엄치는 물고기");
  const [hasHeater, setHasHeater] = useState("히터(수온 조절기) 사용 가능");
  const [experienceNote, setExperienceNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FishRecommendResponse | null>(null);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recommend-fish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tankSize,
          careTime,
          stylePreference,
          hasHeater,
          experienceNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "추천을 불러오지 못했어요.");
      }
      setResult(data as FishRecommendResponse);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "관상어 추천 중 문제가 발생했어요."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-5 sm:p-6 bg-[#fbfdff]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Questionnaire */}
        <form
          onSubmit={handleRecommend}
          className="lg:col-span-5 space-y-4 rounded-2xl border border-sky-100 bg-white p-5"
        >
          <div>
            <p className="text-xs font-semibold text-teal-700">
              1단계 · 입문 과정 어종 추천
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#0f293a]">
              내 성향에 맞는 물고기 알아보기
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              처음 물고기를 고를 때 어항 크기와 관리 여유 시간에 맞는 친구를 고르면 훨씬 실패 없이 키울 수 있어요.
            </p>
          </div>

          <div>
            <label
              htmlFor="rec-size"
              className="block text-xs font-semibold text-slate-700"
            >
              준비한(또는 생각 중인) 어항 크기
            </label>
            <select
              id="rec-size"
              value={tankSize}
              onChange={(e) => setTankSize(e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-2 text-sm text-[#0f293a] focus:border-[#0284c7] focus:outline-none"
            >
              <option value="소형 어항 (15~25L · 책상 위 추천)">
                소형 어항 (15~25L · 책상 위 추천)
              </option>
              <option value="표준 어항 (30~50L · 거실/방 한쪽)">
                표준 어항 (30~50L · 거실/방 한쪽)
              </option>
              <option value="넉넉한 어항 (60L 이상 · 여럿이 합사)">
                넉넉한 어항 (60L 이상 · 여럿이 합사)
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rec-time"
              className="block text-xs font-semibold text-slate-700"
            >
              평소 어항에 쓸 수 있는 시간
            </label>
            <select
              id="rec-time"
              value={careTime}
              onChange={(e) => setCareTime(e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-2 text-sm text-[#0f293a] focus:border-[#0284c7] focus:outline-none"
            >
              <option value="하루 5분 미만 (바쁜 직장인·학생)">
                하루 5분 미만 (바쁜 직장인·학생)
              </option>
              <option value="하루 5~10분 가볍게 관찰 가능">
                하루 5~10분 가볍게 관찰 가능
              </option>
              <option value="매일 15분 이상 꼼꼼히 돌볼 수 있음">
                매일 15분 이상 꼼꼼히 돌볼 수 있음
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rec-style"
              className="block text-xs font-semibold text-slate-700"
            >
              좋아하는 물고기 스타일
            </label>
            <select
              id="rec-style"
              value={stylePreference}
              onChange={(e) => setStylePreference(e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-2 text-sm text-[#0f293a] focus:border-[#0284c7] focus:outline-none"
            >
              <option value="화려하고 활발하게 헤엄치는 물고기">
                화려하고 활발하게 헤엄치는 물고기
              </option>
              <option value="작고 반짝이며 무리 지어 다니는 물고기">
                작고 반짝이며 무리 지어 다니는 물고기
              </option>
              <option value="바닥을 귀엽게 돌아다니는 온순한 물고기">
                바닥을 귀엽게 돌아다니는 온순한 물고기
              </option>
              <option value="혼자 조용히 교감하며 우아하게 크는 물고기">
                혼자 조용히 교감하며 우아하게 크는 물고기
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rec-heater"
              className="block text-xs font-semibold text-slate-700"
            >
              히터(온도 조절기) 사용 여부
            </label>
            <select
              id="rec-heater"
              value={hasHeater}
              onChange={(e) => setHasHeater(e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-2 text-sm text-[#0f293a] focus:border-[#0284c7] focus:outline-none"
            >
              <option value="히터(수온 조절기) 사용 가능">
                히터(수온 조절기) 사용 가능
              </option>
              <option value="히터 없이 상온에서 키우고 싶음">
                히터 없이 상온에서 키우고 싶음
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rec-note"
              className="block text-xs font-semibold text-slate-700"
            >
              추가로 바라는 점 (선택)
            </label>
            <input
              id="rec-note"
              type="text"
              value={experienceNote}
              onChange={(e) => setExperienceNote(e.target.value)}
              placeholder="예: 새끼를 안 낳았으면 좋겠어요 / 초등학생 아이와 같이 키워요"
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0369a1] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <Fish className="h-4 w-4" />
            <span>{loading ? "물방울이 맞춤 어종 찾는 중..." : "맞춤 관상어 추천받기"}</span>
          </button>
        </form>

        {/* Right: Recommendation Results */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-5">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#0284c7]">
                <Fish className="h-7 w-7" />
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0f293a]">
                아직 어떤 물고기를 키울지 고민 중이신가요?
              </h4>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
                왼쪽에서 어항 크기와 돌볼 수 있는 시간을 고른 뒤 버튼을 누르면, 물방울 AI가 가장 키우기 편하고 어울리는 물고기 3가지를 골라드려요.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-semibold text-[#0284c7]">
                사용자 환경과 성향을 분석해 순하고 튼튼한 관상어를 고르고 있어요...
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              <div className="rounded-xl border border-teal-100 bg-[#f2fafb] p-4">
                <p className="text-xs font-semibold text-teal-700">물방울의 입문 조언</p>
                <p className="mt-1 text-sm leading-relaxed text-[#0f293a]">
                  {result.starterAdvice}
                </p>
              </div>

              <div className="space-y-3">
                {result.recommendedFish?.map((fish, idx) => (
                  <article
                    key={`${fish.name}-${idx}`}
                    className="rounded-xl border border-sky-100 bg-[#fbfdff] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-[#0f293a]">
                          {idx + 1}. {fish.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {fish.difficulty} · 권장 마릿수: {fish.recommendedCount} · 짝꿍: {fish.compatibleWith}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onAskMulbangul(
                              `'${fish.name}'를 처음 키우려고 해요! 어항 세팅부터 먹이, 물갈이까지 초보자가 꼭 알아야 할 준비물을 쉽게 알려주세요.`
                            )
                          }
                          className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-[#0284c7] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#0369a1] cursor-pointer whitespace-nowrap"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>준비물 물어보기</span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-2.5 text-sm leading-relaxed text-slate-700">
                      {fish.whyFit}
                    </p>
                    <p className="mt-2 text-xs font-medium text-[#0369a1]">
                      핵심 관리 팁: {fish.careTip}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
