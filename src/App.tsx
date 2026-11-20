import {useEffect,useRef,useState} from "react";
import {TopNav,type Page} from "./components/TopNav";
import {HomeScreen} from "./components/HomeScreen";
import {BadgeGallery,getBadgeCount} from "./components/BadgeGallery";
import {CareDiary} from "./components/CareDiary";
import {FishEncyclopedia} from "./components/FishEncyclopedia";
import {CareHubWorkspace} from "./components/CareHubWorkspace";
import {TodoChecklistSection} from "./components/TodoChecklistSection";
import {BeginnerGuideSection} from "./components/BeginnerGuideSection";
import {DEFAULT_TANK_PROFILE,DEFAULT_TODO_TASKS} from "./data/aquariumDefaults";
import type {CareHubTab,ChatMessage,CustomKnowledgeRule,ExplanationMode,TankLogEntry,TodoTask} from "./types/aquarium";
const keys={todos:"multtuk_todos_v2",logs:"multtuk_tank_logs_v3",mode:"multtuk_explanation_mode_v2",seen:"multeuk_pages_seen_v1",reset:"multeuk_last_daily_reset_v1"};
function readStorage<T>(key:string,fallback:T):T{try{const v=localStorage.getItem(key);return v?JSON.parse(v) as T:fallback;}catch{return fallback;}}
function dateKey(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
const hiddenTasks=["feed-morning","weekly-water-change"];
const defaultMessages:ChatMessage[]=[{id:"hi",role:"model",text:"안녕! 나는 물특의 물방울이야. 🫧 물고기를 키우고 싶거나 처음 키우고 있다면 편하게 질문해 줘!",timestamp:""}];
export default function App(){
 const [page,setPage]=useState<Page>(()=>{const hash=location.hash.replace("#","");return (["home","dex","ai","care","badges","guide"] as string[]).includes(hash)?hash as Page:"home";});
 const [activeTab,setActiveTab]=useState<CareHubTab>("chat");
 const [mode,setMode]=useState<ExplanationMode>(()=>readStorage(keys.mode,"beginner"));
 const [tasks,setTasks]=useState<TodoTask[]>(()=>readStorage(keys.todos,DEFAULT_TODO_TASKS));
 const [logs,setLogs]=useState<TankLogEntry[]>(()=>readStorage(keys.logs,[]));
 const [seen,setSeen]=useState<{dex:boolean;guide:boolean}>(()=>readStorage(keys.seen,{dex:false,guide:false}));
 const [messages,setMessages]=useState<ChatMessage[]>(defaultMessages);
 const [prompt,setPrompt]=useState<string|null>(null);
 const [today,setToday]=useState(dateKey);
 const [isKeeper,setIsKeeper]=useState<boolean>(()=>readStorage("multeuk_is_keeper_v1",false));
 const chatInputRef=useRef<HTMLTextAreaElement|null>(null);
 const [customRules,setCustomRules]=useState<CustomKnowledgeRule[]>(()=>readStorage("multtuk_custom_rules_v1",[]));
 const safeTaskList=tasks.filter(x=>isKeeper||!hiddenTasks.includes(x.id));
 const done=safeTaskList.filter(x=>x.completed).length;
 const badges=getBadgeCount({logCount:logs.length,done,guideViewed:seen.guide,dexViewed:seen.dex});
 const navigate=(next:Page)=>{setPage(next);history.replaceState(null,"",`#${next}`);window.scrollTo({top:0,behavior:"instant"});if(next==="guide"||next==="dex")setSeen(p=>({...p,[next]:true}));};
 useEffect(()=>{const onHash=()=>{const p=location.hash.slice(1);if(["home","dex","ai","care","badges","guide"].includes(p)){setPage(p as Page);window.scrollTo(0,0);}};window.addEventListener("hashchange",onHash);return ()=>window.removeEventListener("hashchange",onHash);},[]);
 useEffect(()=>{if(page==="dex"||page==="guide")setSeen(p=>p[page]?p:{...p,[page]:true});},[page]);
 useEffect(()=>{try{localStorage.setItem(keys.todos,JSON.stringify(tasks));}catch{}},[tasks]);
 useEffect(()=>{try{localStorage.setItem(keys.logs,JSON.stringify(logs));}catch{}},[logs]);
 useEffect(()=>{try{localStorage.setItem(keys.mode,JSON.stringify(mode));}catch{}},[mode]);
 useEffect(()=>{try{localStorage.setItem(keys.seen,JSON.stringify(seen));}catch{}},[seen]);
 useEffect(()=>{try{localStorage.setItem("multtuk_custom_rules_v1",JSON.stringify(customRules));}catch{}},[customRules]);
 useEffect(()=>{try{localStorage.setItem("multeuk_is_keeper_v1",JSON.stringify(isKeeper));}catch{}},[isKeeper]);
 useEffect(()=>{const check=()=>{const d=dateKey();try{if(localStorage.getItem(keys.reset)!==d){setTasks(p=>p.map(t=>t.frequency==="매일"?{...t,completed:false}:t));localStorage.setItem(keys.reset,d);}}catch{}setToday(d);};check();window.addEventListener("focus",check);const visibility=()=>{if(document.visibilityState==="visible")check();};document.addEventListener("visibilitychange",visibility);return()=>{window.removeEventListener("focus",check);document.removeEventListener("visibilitychange",visibility);};},[]);
 const ask=(text:string)=>{setPrompt(text);setActiveTab("chat");navigate("ai");};
 const handleAddLog=(entry:Omit<TankLogEntry,"id">)=>setLogs(p=>[{...entry,id:`log-${Date.now()}-${Math.random().toString(36).slice(2,6)}`},...p]);
 const handleAskLog=(e:TankLogEntry)=>ask(`초보자 눈높이에서 아래 관찰을 짧게 점검해 줘. 미측정 값은 추정하지 마.\n날짜: ${e.date}\n수온: ${e.tempC||"미측정"}\n물: ${e.waterState}\n먹이 반응: ${e.appetite}\n메모: ${e.note||"없음"}`);
 const handleAddTask=(title:string,description?:string)=>setTasks(p=>[{id:`custom-${Date.now()}`,title,description:description||"내가 추가한 실천 활동",frequency:"수시",completed:false,isObservationQuest:false,askPrompt:`${title}를 안전하게 수행하는 방법을 3단계로 알려줘.`},...p]);
 const exportData=()=>{const blob=new Blob([JSON.stringify({format:"multeuk-care-backup",version:1,exportedAt:new Date().toISOString(),logs,tasks},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`물특-돌봄기록-${dateKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <div className="underwater-page min-h-screen pb-20 text-[#243b7a] lg:pb-0"><TopNav page={page} onNavigate={navigate}/>
 <main id="main-content" className="min-h-[70vh]">
 {page==="home"&&<HomeScreen navigate={navigate} startKeeping={()=>{setIsKeeper(true);navigate("care");}} done={done}total={safeTaskList.length}badges={badges}/>}
 {page==="dex"&&<FishEncyclopedia onAskSpecies={ask}/>}
 {page==="ai"&&<CareHubWorkspace activeTab={activeTab} onChangeTab={setActiveTab} messages={messages} setMessages={setMessages} mode={mode} setMode={setMode} tankProfile={DEFAULT_TANK_PROFILE} latestLog={logs[0]} customRules={customRules} onAddRule={text=>setCustomRules(p=>[{id:`rule-${Date.now()}`,text,createdAt:dateKey()},...p])} onDeleteRule={id=>setCustomRules(p=>p.filter(x=>x.id!==id))} pendingPrompt={prompt} onClearPendingPrompt={()=>setPrompt(null)} onApplyRecommendedFish={()=>{}} onAddSuggestedTask={handleAddTask} onAskMulbangul={ask} inputRef={chatInputRef}/>}
 {page==="care"&&<><div className="mx-auto max-w-6xl px-4 pt-7 sm:px-6"><h1 className="text-3xl font-black">📅 돌봄 일기</h1><p className="mt-2 text-sm text-slate-600">어항 등록 없이도 돌봄 습관을 만들고 관찰 내용을 기록할 수 있어.</p><div className="mt-4 inline-flex flex-wrap gap-2 rounded-xl bg-sky-50 p-1"><button onClick={()=>setIsKeeper(false)} className={`rounded-lg px-4 py-2 text-sm font-bold ${!isKeeper?"bg-white text-sky-800 shadow":"text-slate-500"}`}>키우기 전</button><button onClick={()=>setIsKeeper(true)} className={`rounded-lg px-4 py-2 text-sm font-bold ${isKeeper?"bg-white text-sky-800 shadow":"text-slate-500"}`}>이미 키우는 중</button></div><button type="button" onClick={exportData} className="mt-4 rounded-xl border border-sky-200 bg-white px-4 py-2 text-xs font-bold text-sky-700">💾 관찰기록 백업 내려받기</button></div><TodoChecklistSection tasks={tasks} tankSpecies={[]} isKeeper={isKeeper} today={today} onOpenFishDex={()=>navigate("dex")} onToggleTask={id=>setTasks(p=>p.map(t=>t.id===id?{...t,completed:!t.completed}:t))} onAddTask={handleAddTask} onDeleteTask={id=>setTasks(p=>p.filter(t=>t.id!==id))} onResetChecks={()=>setTasks(p=>p.map(t=>({...t,completed:false})))} onAskAboutTask={ask}/><CareDiary logs={logs} onAdd={handleAddLog} onDelete={id=>setLogs(p=>p.filter(e=>e.id!==id))} onAsk={handleAskLog}/></>}
 {page==="badges"&&<BadgeGallery logCount={logs.length} done={done} guideViewed={seen.guide} dexViewed={seen.dex}/>}
 {page==="guide"&&<BeginnerGuideSection onAskTopic={ask}/>}
 </main><footer className="border-t border-teal-100 bg-white/75 px-4 py-6 text-center text-xs text-slate-500">물특 · 관상어를 처음 키우거나 키우고 싶은 사람을 위한 AI 친구 · 기록은 현재 브라우저에 저장됩니다.</footer></div>
}
