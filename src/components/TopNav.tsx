import React from "react";
import {Home, BookOpen, MessageCircle, CalendarCheck2, Award, GraduationCap} from "lucide-react";
import mascot from "../assets/images/multeuk_mascot.webp";
export type Page = "home" | "dex" | "ai" | "care" | "badges" | "guide";
export const NAV_ITEMS: {id:Page;label:string; icon:React.ComponentType<{className?:string}>}[] = [
 {id:"home",label:"홈",icon:Home},{id:"dex",label:"물고기 도감",icon:BookOpen},
 {id:"ai",label:"AI 물방울",icon:MessageCircle},{id:"care",label:"돌봄 일기",icon:CalendarCheck2},
 {id:"badges",label:"배지",icon:Award},{id:"guide",label:"초보 백과",icon:GraduationCap}];
interface Props {page:Page;onNavigate:(page:Page)=>void;}
export const TopNav:React.FC<Props>=({page,onNavigate})=><>
 <header className="sticky top-0 z-40 border-b border-sky-100 bg-[#f2fcff]/95 shadow-sm backdrop-blur-xl">
 <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
  <button onClick={()=>onNavigate("home")} type="button" className="flex shrink-0 items-center gap-2 text-left" aria-label="물특 홈">
   <img src={mascot} alt="물방울" className="h-11 w-11 rounded-2xl border border-sky-100 bg-white object-contain"/>
   <span className="text-xl font-black text-[#243b7a]">물특 <span className="hidden text-xs font-semibold text-teal-600 sm:inline">뽀글뽀글 어항 친구</span></span>
  </button>
  <nav aria-label="메인 페이지" className="hidden items-center gap-1 lg:flex">
   {NAV_ITEMS.map(({id,label,icon:Icon})=><button key={id} type="button" aria-current={page===id?"page":undefined} onClick={()=>onNavigate(id)} className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${page===id?"bg-sky-200/70 text-sky-900":"text-slate-600 hover:bg-sky-50"}`}><Icon className="h-4 w-4"/>{label}</button>)}
  </nav>
  <button type="button" onClick={()=>onNavigate("ai")} className="shrink-0 rounded-full bg-[#63b8f5] px-4 py-2.5 text-xs font-bold text-white sm:text-sm">물방울에게 질문</button>
 </div>
 </header>
 <nav aria-label="모바일 하단 메뉴" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 gap-1 border-t border-sky-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(52,154,174,.1)] backdrop-blur lg:hidden">
  {NAV_ITEMS.filter(x=>x.id!=="guide").map(({id,label,icon:Icon})=><button type="button" key={id} aria-current={page===id?"page":undefined} onClick={()=>onNavigate(id)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${page===id?"bg-sky-100 text-sky-700":"text-slate-500"}`}><Icon className="h-5 w-5"/>{id==="dex"?"도감":id==="ai"?"AI":id==="care"?"돌봄":label}</button>)}
 </nav>
 </>;
