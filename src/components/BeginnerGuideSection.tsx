import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { BEGINNER_GUIDE_TOPICS } from "../data/aquariumDefaults";

interface BeginnerGuideSectionProps {
  onAskTopic: (prompt: string) => void;
}

import GUIDE_IMAGE from "../assets/images/beginner_fish_guide_card_1794900924448.jpg";

export const BeginnerGuideSection: React.FC<BeginnerGuideSectionProps> = ({
  onAskTopic,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="guide-section" className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6">
      <div className="rounded-2xl border border-sky-200/80 bg-white p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div>
              <p className="text-xs font-semibold text-[#0284c7]">
                초보 백과 · 왕초보 탈출 핵심 4가지
              </p>
              <h2
                className="mt-1 text-2xl font-bold text-[#0f293a]"
                style={{ textWrap: "balance" }}
              >
                이 네 가지만 알아도 물고기 키우기가 훨씬 쉬워져요
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                백과사전처럼 어려운 글은 잠시 접어두고, 처음 어항을 들였을 때 꼭 알아야 하는 핵심만 모았어요.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 aspect-[4/3]">
              {!imgError ? (
                <img
                  src={GUIDE_IMAGE}
                  alt="햇살 드는 창가 원목 책상 위의 맑은 미니 수족관과 구피들"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-sky-800">
                  초보자를 위한 맑고 편안한 미니 수족관 가이드
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {BEGINNER_GUIDE_TOPICS.map((topic) => (
              <article
                key={topic.id}
                className="flex flex-col justify-between rounded-2xl border border-sky-100 bg-[#f8fcff] p-5"
              >
                <div>
                  <div className="text-xs font-semibold text-[#0284c7] tabular-nums">
                    {topic.stepNumber}. 핵심 가이드
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-[#0f293a] leading-snug">
                    {topic.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {topic.summary}
                  </p>
                </div>

                <div className="mt-4 border-t border-sky-100 pt-3">
                  <p className="text-xs font-semibold text-[#0f293a]">
                    기억할 규칙: {topic.keyRule}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAskTopic(topic.askPrompt)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] cursor-pointer"
                  >
                    <span>물방울에게 자세히 물어보기</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
