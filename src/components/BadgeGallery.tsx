import {Award, CheckCircle2, BookOpen, Waves, Sparkles, Heart, CalendarDays, Leaf} from "lucide-react";
import mascot from "../assets/images/multeuk_mascot.webp";
import fishPhotos from "../data/fishPhotos.json";
interface Props{logCount:number;done:number;guideViewed:boolean;dexViewed:boolean;}
export function getBadgeCount({logCount,done,guideViewed,dexViewed}:Props){return Number(logCount>=1)+Number(logCount>=7)+Number(logCount>=30)+Number(done>=1)+Number(done>=3)+Number(guideViewed)+Number(dexViewed);}
export function BadgeGallery(props:Props){const data=[
 {name:"첫 관찰일기",desc:"관찰일기 1회 작성",unlocked:props.logCount>=1,icon:BookOpen,img:fishPhotos.guppy.src},
 {name:"7회 기록가",desc:"관찰일기 7회 작성",unlocked:props.logCount>=7,icon:CalendarDays,img:fishPhotos["neon-tetra"].src},
 {name:"30회 관찰왕",desc:"관찰일기 30회 작성",unlocked:props.logCount>=30,icon:Heart,img:fishPhotos.platy.src},
 {name:"첫 돌봄",desc:"돌봄 체크 1개 완료",unlocked:props.done>=1,icon:CheckCircle2,img:fishPhotos.molly.src},
 {name:"세 가지 실천",desc:"오늘 돌봄 체크 3개 완료",unlocked:props.done>=3,icon:Waves,img:fishPhotos.corydoras.src},
 {name:"초보 탐험가",desc:"초보 백과 방문",unlocked:props.guideViewed,icon:Leaf,img:mascot},
 {name:"도감 탐험가",desc:"12종 도감 방문",unlocked:props.dexViewed,icon:Award,img:fishPhotos.betta.src},
 ]; const earned=data.filter(x=>x.unlocked).length;
 return <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6"><div className="mb-6 rounded-[28px] border border-sky-100 bg-gradient-to-r from-[#e9faff] to-[#f5f0ff] p-6 sm:p-8"><p className="text-xs font-bold text-teal-700">✨ 물특의 보물상자</p><h1 className="mt-1 text-3xl font-black text-[#243b7a]">🏅 관상어 배지 도감</h1><p className="mt-2 text-sm text-slate-600">관찰하고 배우는 만큼 반짝이는 배지를 모아봐! 물특 캐릭터와 함께 모으는 새로운 성취 보상이야.</p><div className="mt-4 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-sky-400" style={{width:`${earned/data.length*100}%`}}/></div><p className="mt-2 text-sm font-bold text-sky-800">{earned} / {data.length}개 획득</p></div>
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{data.map(({name,desc,unlocked,img,icon:Icon})=><div key={name} className={`flex min-w-0 flex-col items-center rounded-[26px] border bg-white p-4 text-center shadow-sm sm:p-6 ${unlocked?"border-sky-200":"border-slate-100 opacity-65"}`}><div className={`relative flex h-28 w-28 items-center justify-center rounded-full border-[5px] shadow-inner ${unlocked?"border-[#a6e0ef] bg-gradient-to-br from-[#e0faff] to-[#e9f4ff]":"border-slate-200 bg-slate-100 grayscale"}`}><img src={img} alt="" className="h-20 w-20 object-contain"/><span className="absolute -bottom-1 rounded-full bg-white px-2 py-1 shadow-sm"><Icon className={`h-4 w-4 ${unlocked?"text-teal-600":"text-slate-400"}`}/></span></div><h2 className="mt-5 text-sm font-black text-[#243b7a] sm:text-base">{name}</h2><p className="mt-1 min-h-9 text-xs leading-relaxed text-slate-500">{desc}</p><span className={`mt-3 rounded-full px-3 py-1 text-xs font-bold ${unlocked?"bg-teal-50 text-teal-700":"bg-slate-100 text-slate-500"}`}>{unlocked?"✨ 획득 완료":"🔒 도전 중"}</span></div>)}</div>
 <p className="mt-5 text-xs text-slate-500">배지는 현재 브라우저의 기록을 기준으로 표시돼. 기록을 지우거나 다른 기기로 이동하면 상태가 달라질 수 있어.</p>
 </section>}
