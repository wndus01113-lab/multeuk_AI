import React from "react";
import mascotImage from "../assets/images/multeuk_mascot.webp";

interface TopNavProps {
  onAskClick: () => void;
  onNavigate: (sectionId: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onAskClick, onNavigate }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-[#effcff]/85 backdrop-blur-xl shadow-[0_4px_20px_rgba(52,154,174,.07)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 text-xl font-black tracking-tight text-[#243b7a]"
        >
          <img src={mascotImage} alt="" className="h-10 w-10 rounded-full object-contain bg-white/80 border border-sky-100" />
          물특 <span className="hidden sm:inline text-xs font-semibold text-teal-600">뽀글뽀글 어항 친구</span>
        </a>

        <nav
          aria-label="주요 메뉴"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onNavigate("care-hub-section")}
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#0284c7] hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            AI 도우미
          </button>
          <button
            type="button"
            onClick={() => onNavigate("todo-section")}
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#0284c7] hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            오늘의 돌봄
          </button>
          <button
            type="button"
            onClick={() => onNavigate("tank-log-section")}
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#0284c7] hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            어항 일기
          </button>
          <button
            type="button"
            onClick={() => onNavigate("fish-encyclopedia-section")}
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#0284c7] hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            물고기 도감
          </button>
          <button
            type="button"
            onClick={() => onNavigate("guide-section")}
            className="whitespace-nowrap shrink-0 py-1 hover:text-[#0284c7] hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            초보 백과
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onAskClick}
            className="whitespace-nowrap shrink-0 min-h-[40px] rounded-full bg-[#63b8f5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0369a1] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7] cursor-pointer"
          >
            물특에게 물어보기
          </button>
        </div>
      </div>
      <nav aria-label="모바일 빠른 메뉴" className="flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-3 md:hidden sm:px-6">
          {[{id:"care-hub-section",name:"🫧 AI 도우미"},{id:"todo-section",name:"🐚 오늘의 돌봄"},{id:"tank-log-section",name:"🐠 어항 일기"},{id:"fish-encyclopedia-section",name:"📘 물고기 도감"},{id:"guide-section",name:"초보 백과"}].map((item) => <button type="button" key={item.id} onClick={() => onNavigate(item.id)} className="shrink-0 rounded-full border border-sky-100 bg-white/90 px-3 py-2 text-xs font-bold text-[#356b9a] shadow-sm">{item.name}</button>)}
      </nav>
    </header>
  );
};
