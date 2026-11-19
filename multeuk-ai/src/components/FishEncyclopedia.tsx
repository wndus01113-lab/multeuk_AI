import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Droplets, HeartHandshake, Search, Thermometer, Waves, X } from "lucide-react";
import knowledge from "../data/verifiedFishKnowledge.json";
import fishPhotos from "../data/fishPhotos.json";

type Species = (typeof knowledge.species)[number];
type Filter = "all" | "tropical" | "cool" | "shrimp";

const icons: Record<string, string> = {
  guppy: "🐟", "neon-tetra": "🐠", betta: "🐟", corydoras: "🐡",
  platy: "🐠", goldfish: "🐠", "cherry-shrimp": "🦐", otocinclus: "🐟",
  "zebra-danio": "🐟", molly: "🐠", "bristlenose-pleco": "🐡", angelfish: "🐠",
};
const shades = ["#dbf6ff", "#e1f9ee", "#e8eeff", "#fff0ee", "#e5f8f4", "#fff3df"];
function speciesType(f: Species): Filter {
  if (f.id === "cherry-shrimp") return "shrimp";
  if (f.id === "goldfish" || f.id === "zebra-danio") return "cool";
  return "tropical";
}

interface Props { onAskSpecies: (prompt: string) => void; onAddToTank: (fish: Species, count: number) => string; onCheckRegistration: (fish: Species, count: number) => string[]; }
export function FishEncyclopedia({ onAskSpecies, onAddToTank, onCheckRegistration }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Species | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [fishCount, setFishCount] = useState("1");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const [retryPhotos, setRetryPhotos] = useState<Record<string, number>>({});
  const filtered = useMemo(() => knowledge.species.filter((fish) => {
    const q = query.trim().toLocaleLowerCase("ko-KR");
    return (filter === "all" || speciesType(fish) === filter) &&
      (!q || [fish.name, fish.waterType, ...fish.aliases].some((s) => s.toLocaleLowerCase("ko-KR").includes(q)));
  }), [query, filter]);
  const filters: { label: string; value: Filter }[] = [
    { label: "모두 보기", value: "all" }, { label: "열대어", value: "tropical" },
    { label: "냉수·아열대", value: "cool" }, { label: "새우", value: "shrimp" },
  ];
  return (
    <section id="fish-encyclopedia-section" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 scroll-mt-24" aria-labelledby="fish-dex-heading">
      <div className="rounded-[32px] border-2 border-white/90 bg-white/80 p-4 shadow-[0_12px_40px_rgba(62,157,179,.12)] backdrop-blur-md sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[#dff8f6] px-3 py-1 text-xs font-bold text-teal-700">🐚 물특 탐험 노트</div>
            <h2 id="fish-dex-heading" className="text-2xl font-black text-[#243b7a] sm:text-3xl">🐠 물고기 도감</h2>
            <p className="mt-1 text-sm text-slate-600">처음 만나는 어항 친구들! 물고기 11종과 관상새우 1종을 귀여운 도감 일러스트로 살펴봐요.</p>
          </div>
          <span className="rounded-full bg-[#e8f8ff] px-4 py-2 text-sm font-bold text-[#2879a3]">{filtered.length} / 12종</span>
        </div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-sky-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-300">
            <Search className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
            <span className="sr-only">관상어 검색</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름으로 물고기 찾기 (예: 구피, 베타)" className="min-w-0 w-full bg-transparent text-sm text-[#243b7a] outline-none placeholder:text-slate-400" />
            {query && <button type="button" aria-label="검색어 지우기" onClick={() => setQuery("")}><X className="h-4 w-4" /></button>}
          </label>
          <div aria-label="도감 분류" className="flex flex-wrap gap-1.5">
            {filters.map((item) => <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${filter === item.value ? "bg-[#63b8f5] text-white shadow-sm" : "border border-sky-100 bg-[#f0fbff] text-[#39749a] hover:bg-sky-100"}`}>{item.label}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((fish, i) => <button type="button" key={fish.id} onClick={() => {setSelected(fish);setFishCount("1");setRegistrationMessage("");setPendingConfirmation(false);}} className="group flex min-h-48 flex-col items-start overflow-hidden rounded-[24px] border border-sky-100 bg-white p-3 text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-sky-500 sm:p-4">
            <div className="relative mb-3 flex h-20 w-full items-center justify-center overflow-hidden rounded-[18px]" style={{background: shades[i % shades.length]}}>
              <span className="absolute left-3 top-2 text-xs opacity-60">✧ · 🫧</span>
              {!failedPhotos.includes(fish.id) ? <img src={`${fishPhotos[fish.id as keyof typeof fishPhotos].src}${retryPhotos[fish.id] ? `?retry=${retryPhotos[fish.id]}` : ""}`} alt={`${fish.name} 도감 일러스트`} loading="lazy" onError={() => setFailedPhotos((p)=>[...p,fish.id])} className="h-full w-full object-contain p-1" /> : <span className="text-5xl" aria-label="이미지를 불러오지 못해 임시 아이콘 표시">{icons[fish.id] || "🐟"}</span>}
              <span className="absolute bottom-2 right-3 text-xs opacity-60">◌ ◌</span>
            </div>
            <span className="mb-1 text-sm font-extrabold text-[#243b7a] sm:text-base">{fish.name}</span>
            <span className="mb-2 text-[11px] text-slate-500">{fish.waterType}</span>
            <div className="mt-auto flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#e3f7ff] px-2 py-1 text-[11px] font-semibold text-sky-800">🌡 {fish.tempRange}</span>
              <span className="rounded-full bg-[#e9fbef] px-2 py-1 text-[11px] font-semibold text-teal-800">💧 {fish.phRange}</span>
            </div>
            <span className="mt-3 text-xs font-bold text-sky-700">자세히 보기 →</span>
          </button>)}
        </div>
        {filtered.length === 0 && <div className="rounded-2xl bg-[#eefaff] py-12 text-center text-sm text-slate-600">🐚 찾는 친구가 없네! 다른 이름으로 검색해 봐.</div>}
        <div className="mt-5 rounded-2xl bg-[#f0fbfb] px-4 py-3 text-xs leading-relaxed text-slate-600">
          <strong className="text-teal-800">안전 안내</strong> · 이 도감은 학생 프로젝트에 저장된 참고 데이터를 보여줘요. 수온·pH·최소 어항 크기와 합사 정보는 품종, 개체 수, 성장 크기, 여과 상태에 따라 달라질 수 있으므로 최종 사육 전에 추가 확인해 주세요. AI 상담은 진료나 수질 검사를 대신하지 않아요.
          <button type="button" onClick={() => setShowNotes((v) => !v)} className="ml-2 inline-flex items-center gap-1 font-bold text-teal-700 underline underline-offset-2">자료 출처 안내 {showNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</button>
          {showNotes && <p className="mt-2">사육 데이터는 Seriously Fish, RSPCA 등의 사육 자료와 대조해 보수적으로 개정했으며, 각 종 상세 카드에 참고 링크가 있습니다. 종·품종·사육 환경에 따른 차이를 확인하세요. 도감 이미지는 물특 프로젝트용으로 제작한 귀여운 일러스트이며 프로젝트 파일에 함께 포함되어 있습니다.</p>}
        </div>
      </div>
      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0a2b4a]/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-4" onClick={() => setSelected(null)}>
        <div role="dialog" aria-modal="true" aria-labelledby="fish-detail-title" onClick={(e) => e.stopPropagation()} className="max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-[30px] bg-[#f8fdff] p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[30px] sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#dff8f6] px-3 py-1 text-xs font-bold text-teal-700">🫧 어항 친구 소개</span>
            <button type="button" aria-label="상세 정보 닫기" onClick={() => setSelected(null)} className="rounded-full bg-white p-2 text-slate-600 shadow-sm"><X className="h-5 w-5" /></button>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[26px] bg-[#dff6ff] text-5xl">{!failedPhotos.includes(selected.id) ? <img src={`${fishPhotos[selected.id as keyof typeof fishPhotos].src}${retryPhotos[selected.id] ? `?retry=${retryPhotos[selected.id]}` : ""}`} alt={`${selected.name} 도감 일러스트`} onError={() => setFailedPhotos((p)=>[...p,selected.id])} className="h-full w-full object-contain p-1" /> : icons[selected.id] || "🐟"}</div>
            <div><h3 id="fish-detail-title" className="text-2xl font-black text-[#243b7a]">{selected.name}</h3><p className="mt-1 text-sm text-slate-500">{selected.waterType}</p><p className="mt-1 text-xs text-slate-500">{selected.temperament}</p></div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            {[{icon:<Thermometer className="h-4 w-4" />, label:"참고 수온", value:selected.tempRange},{icon:<Droplets className="h-4 w-4" />,label:"참고 pH",value:selected.phRange},{icon:<Waves className="h-4 w-4" />,label:"최소 수조 기준*",value:selected.minTankLiters},{icon:<HeartHandshake className="h-4 w-4" />,label:"성격",value:selected.temperament}].map((s) => <div key={s.label} className="rounded-2xl border border-sky-100 bg-white p-3"><p className="mb-1 flex items-center gap-1 text-xs font-bold text-sky-700">{s.icon}{s.label}</p><p className="text-sm font-semibold text-[#243b7a]">{s.value}</p></div>)}
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            <div className="rounded-2xl bg-[#e9fbf3] p-4"><h4 className="mb-1 font-extrabold text-teal-800">🌿 함께 살기 참고</h4>{selected.compatible}</div>
            <div className="rounded-2xl bg-[#fff1ee] p-4"><h4 className="mb-1 font-extrabold text-rose-700">⚠️ 합사 주의</h4>{selected.incompatible}</div>
            <div className="rounded-2xl bg-white p-4"><h4 className="mb-1 font-extrabold text-[#243b7a]">📘 물특의 사육 메모</h4>{selected.beginnerNotes}</div>
            <div className="rounded-2xl border border-sky-100 bg-white p-3 text-xs leading-relaxed text-slate-600"><strong>사육 정보 참고 자료</strong> · <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline">외부 자료 확인 ↗</a><p className="mt-1">수조 기준은 권장 출발점이며 정확한 종·품종·마릿수·바닥 면적에 따라 달라져요.</p></div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">* 수조 크기·길이는 외부 사육 자료를 바탕으로 개정한 보수적인 참고값이며, 해당 크기만 확보했다고 적절한 사육 환경이 보장되는 것은 아닙니다. 합사 가능 여부도 개별 환경에 따라 확인해야 합니다.</p>
          <div className="mt-4 rounded-2xl border border-teal-100 bg-[#e8faf4] p-3">
            <label htmlFor="fish-count" className="text-sm font-bold text-teal-900">🐠 내 어항에 등록할 마릿수</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input id="fish-count" type="number" inputMode="numeric" min="0" max="100" value={fishCount} onChange={(e)=>{setFishCount(e.target.value);setPendingConfirmation(false);setRegistrationMessage("");}} className="min-h-11 w-24 rounded-xl border border-teal-200 bg-white px-3 text-base" />
              <button type="button" onClick={() => {
                const count = Number(fishCount);
                if (fishCount.trim() === "" || !Number.isInteger(count) || count < 0 || count > 100) {setRegistrationMessage("마릿수는 0~100 사이로 입력해 줘.");return;}
                const warnings = onCheckRegistration(selected, count);
                if (count > 0 && !pendingConfirmation) {setRegistrationMessage(`등록 전 확인해 줘!\n• ${warnings.join("\n• ")}\n문제를 확인했다면 아래 버튼을 한 번 더 눌러 등록할 수 있어.`);setPendingConfirmation(true);return;}
                setRegistrationMessage(onAddToTank(selected,count));setPendingConfirmation(false);
              }} className="min-h-11 flex-1 rounded-xl bg-teal-600 px-4 font-bold text-white">{pendingConfirmation ? "경고 확인 후 등록" : "내 어항에 저장하기"}</button>
            </div>
            {registrationMessage && <p role="status" className="mt-2 whitespace-pre-line text-xs leading-relaxed text-teal-900">{registrationMessage}</p>}
            <p className="mt-1 text-xs text-teal-800">같은 어종은 기존 마릿수를 교체하고, 0마리로 저장하면 해당 어종 기록을 삭제해요.</p>
            <p className="mt-1 text-xs text-teal-800">등록은 실제 사육 적합성을 보증하지 않아요. 어항 크기·수질·합사 조건을 꼭 확인하세요.</p>
          </div>
          <p className="mt-3 break-words text-[11px] leading-relaxed text-slate-500">도감 이미지 · {fishPhotos[selected.id as keyof typeof fishPhotos].author} · {fishPhotos[selected.id as keyof typeof fishPhotos].license} · 물특 프로젝트 파일에 포함된 내부 PNG 자산</p>
          {failedPhotos.includes(selected.id) && <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => {setFailedPhotos((ids)=>ids.filter((id)=>id!==selected.id));setRetryPhotos((v)=>({...v,[selected.id]: (v[selected.id]||0)+1}));}} className="rounded-full border border-sky-200 px-3 py-2 text-sky-800">🖼️ 이미지 다시 불러오기</button>
            <span className="text-slate-500">연결 실패 시 임시 아이콘을 표시합니다.</span>
          </div>}
          <button type="button" onClick={() => {onAskSpecies(`${selected.name}를 처음 키우려 해요. 현재 어항 크기, 마릿수, 수온, 물잡이, 합사 주의사항을 초보자에게 안전하게 설명해 주세요. 특히 사육 환경에 따라 달라지는 기준은 확인이 필요하다고 알려주세요.`);setSelected(null);}} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#63b8f5] px-4 py-3 font-bold text-white hover:bg-[#3999df]"><BookOpen className="h-4 w-4" /> 물방울에게 이 친구 물어보기</button>
        </div>
      </div>}
    </section>
  );
}
