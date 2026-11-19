/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { TopNav } from "./components/TopNav";
import { FishEncyclopedia } from "./components/FishEncyclopedia";
import speciesKnowledge from "./data/verifiedFishKnowledge.json";
import { AquariumHero } from "./components/AquariumHero";
import { CareHubWorkspace } from "./components/CareHubWorkspace";
import { TodoChecklistSection } from "./components/TodoChecklistSection";
import { TankLogSection } from "./components/TankLogSection";
import { BeginnerGuideSection } from "./components/BeginnerGuideSection";
import {
  DEFAULT_TANK_LOGS,
  DEFAULT_TANK_PROFILE,
  DEFAULT_TODO_TASKS,
} from "./data/aquariumDefaults";
import type {
  CareHubTab,
  ChatMessage,
  CustomKnowledgeRule,
  ExplanationMode,
  TankLogEntry,
  TankProfile,
  TodoTask,
} from "./types/aquarium";

const STORAGE_KEYS = {
  todos: "multtuk_todos_v2",
  profile: "multtuk_tank_profile_v3",
  logs: "multtuk_tank_logs_v3",
  mode: "multtuk_explanation_mode_v2",
  activeDecor: "multtuk_active_decor_v2",
  customRules: "multtuk_custom_rules_v1",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<CareHubTab>("chat");
  const [mode, setMode] = useState<ExplanationMode>(() =>
    loadFromStorage<ExplanationMode>(STORAGE_KEYS.mode, "beginner")
  );
  const [tasks, setTasks] = useState<TodoTask[]>(() =>
    loadFromStorage<TodoTask[]>(STORAGE_KEYS.todos, DEFAULT_TODO_TASKS)
  );
  const [tankProfile, setTankProfile] = useState<TankProfile>(() =>
    loadFromStorage<TankProfile>(STORAGE_KEYS.profile, DEFAULT_TANK_PROFILE)
  );
  const [logs, setLogs] = useState<TankLogEntry[]>(() =>
    loadFromStorage<TankLogEntry[]>(STORAGE_KEYS.logs, DEFAULT_TANK_LOGS)
  );
  const [activeDecorIds, setActiveDecorIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(STORAGE_KEYS.activeDecor, ["pebbles"])
  );
  const [customRules, setCustomRules] = useState<CustomKnowledgeRule[]>(() =>
    loadFromStorage<CustomKnowledgeRule[]>(STORAGE_KEYS.customRules, [])
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      role: "model",
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: "안녕! 나는 **물특**의 관상어 친구 **물방울**이야! 🫧\n\n처음 물고기를 키워도 걱정 마! 어종 추천부터 어항 관찰, 상태 상담까지 차근차근 도와줄게. 궁금한 게 있다면 편하게 물어봐. 뽀글뽀글!",
    },
  ]);

  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.mode, JSON.stringify(mode));
    } catch {
      // Ignore storage quota errors
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(tankProfile));
    } catch {
      // Ignore storage quota errors
    }
  }, [tankProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
    } catch {
      // Ignore storage quota errors
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.activeDecor,
        JSON.stringify(activeDecorIds)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [activeDecorIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.customRules, JSON.stringify(customRules));
    } catch {
      // Ignore storage quota errors
    }
  }, [customRules]);

  // Observation stickers come strictly from completed observation quests and user tank logs
  const observationPoints = useMemo(() => {
    const completedQuests = tasks.filter(
      (t) => t.isObservationQuest && t.completed
    ).length;
    const userLogsCount = logs.length;
    return completedQuests + userLogsCount;
  }, [tasks, logs]);

  const npcMoodLine = useMemo(() => {
    const latest = logs[0];
    if (latest && latest.waterState !== "맑음") {
      return `최근 기록에 물이 '${latest.waterState}'으로 적혀 있네! 수조 관제 스캔이나 나한테 바로 물어봐.`;
    }
    if (observationPoints >= 3) {
      return "오늘도 물멍 완료! 관찰을 꾸준히 해서 새 수족관 꾸미기 아이템도 열렸어.";
    }
    if (tasks.some((t) => t.isObservationQuest && t.completed)) {
      return "오늘 물고기 상태를 살펴봤구나! 기록까지 남기면 수족관 꾸미기 스티커가 모여.";
    }
    return "오늘 친구들은 잘 헤엄치고 있어? 계속 수면에 머무른다면 나한테 알려줘!";
  }, [logs, observationPoints, tasks]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openChatAndFocus = () => {
    setActiveTab("chat");
    scrollToSection("care-hub-section");
    window.setTimeout(() => {
      chatInputRef.current?.focus();
    }, 320);
  };

  const askMulbangul = (prompt: string) => {
    setActiveTab("chat");
    scrollToSection("care-hub-section");
    setPendingPrompt(prompt);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (title: string, description?: string) => {
    const newTask: TodoTask = {
      id: `custom-${Date.now()}`,
      title,
      description:
        description || "내가 직접 추가한 어항 관리 일정이에요.",
      frequency: "수시",
      completed: false,
      isObservationQuest: false,
      askPrompt: `'${title}' 작업을 초보자가 실수 없이 하는 방법을 쉽게 알려주세요!`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetChecks = () => {
    setTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
  };

  const handleAddLog = (entry: Omit<TankLogEntry, "id">) => {
    const newEntry: TankLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAskWithLog = (entry: TankLogEntry) => {
    const prompt = `오늘 내 어항 상태 기록이에요. 초보자 기준으로 지금 상태가 괜찮은지, 특별히 해줘야 할 일이 있는지 알려주세요!\n- 날짜: ${entry.date}\n- 수온: ${entry.tempC}°C\n- 물 맑기: ${entry.waterState}\n- 먹이 반응: ${entry.appetite}\n- 물갈이 여부: ${entry.waterChanged ? "함" : "안 함"}\n- 관찰 메모: ${entry.note}`;
    askMulbangul(prompt);
  };

  const handleApplyRecommendedFish = (fishList: string, sizeLiters: string) => {
    setTankProfile((prev) => ({
      ...prev,
      fishList,
      sizeLiters,
    }));
  };

  // The existing fishList field is retained for backwards compatibility with AI prompts
  // and manually entered profiles. Only canonical "종명 N마리" entries are managed here.
  const checkSpeciesRegistration = (fish: (typeof speciesKnowledge.species)[number], count: number): string[] => {
    const liters = Number(tankProfile.sizeLiters);
    const warnings: string[] = [];
    if (!Number.isFinite(liters) || liters <= 0) {
      warnings.push("어항 정보에서 실제 수량(L)을 먼저 입력해야 해요.");
      return warnings;
    }
    // A dimension-based minimum cannot be converted to liters reliably. Explicitly warn.
    const minString = fish.minTankLiters;
    const numericMin = minString.match(/(\d+(?:\.\d+)?)\s*L/i);
    if (numericMin && liters < Number(numericMin[1])) {
      warnings.push(`현재 ${liters}L는 도감에 제시된 ${fish.name}의 참고 최소 수량(${numericMin[1]}L)보다 작아요.`);
    }
    if (/cm|바닥 면적|수조 길이/.test(minString)) {
      warnings.push(`${fish.name}는 수조 길이·바닥 면적 조건도 중요해요. 현재 ${liters}L만으로 적합성을 판단할 수 없어요.`);
    }
    if (count > 1 || tankProfile.fishList.trim()) {
      warnings.push("마릿수·기존 어종과의 합사·여과 상태·수질을 확인해야 해요. 등록이 사육 적합성을 보증하지 않아요.");
    }
    if (!warnings.length) warnings.push("실제 사육 환경·물잡이·수질을 확인했는지 다시 확인해 주세요. 기록은 사육 승인과 달라요.");
    return warnings;
  };

  const handleAddSpeciesToTank = (fish: (typeof speciesKnowledge.species)[number], count: number): string => {
    const liters = Number(tankProfile.sizeLiters);
    if (count > 0 && (!Number.isFinite(liters) || liters <= 0)) {
      return "먼저 '어항 일기 → 내 어항 정보'에 실제 어항 용량(L)을 입력해 줘. 확인 전에는 등록하지 않았어.";
    }
    if (!Number.isInteger(count) || count < 0 || count > 100) return "마릿수는 0~100 사이 정수로 입력해 줘.";
    const existingParts = tankProfile.fishList.split(/[,，\n]+/).map((v) => v.trim()).filter(Boolean);
    const managedNames = [fish.name, ...fish.aliases].filter(Boolean);
    const matching = (part: string) => managedNames.some((name) => part === name || new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\d+\\s*마리$`).test(part));
    const retained = existingParts.filter((part) => !matching(part));
    const next = count === 0 ? retained : [...retained, `${fish.name} ${count}마리`];
    setTankProfile((prev) => ({ ...prev, fishList: next.join(", ") }));
    return count === 0 ? `${fish.name} 기록을 삭제했어.` : `${fish.name}를 ${count}마리로 저장했어. 기존 기록은 중복되지 않게 교체했어.`;
  };

  const exportBackup = () => {
    const backup = { format: "multeuk-backup", version: 1, exportedAt: new Date().toISOString(),
      data: { tasks, tankProfile, logs, mode, activeDecorIds, customRules } };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url;
    link.download = `물특-어항백업-${new Date().toLocaleDateString("en-CA")}.json`;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importBackup = async (file: File): Promise<string> => {
    if (file.size > 2_000_000 || !file.name.toLowerCase().endsWith(".json")) return "2MB 이하의 물특 JSON 백업 파일을 선택해 주세요.";
    try {
      const payload: unknown = JSON.parse(await file.text());
      if (!payload || typeof payload !== "object") throw new Error("잘못된 형식");
      const pack = payload as { format?: unknown; version?: unknown; data?: Record<string, unknown> };
      if (pack.format !== "multeuk-backup" || pack.version !== 1 || !pack.data) throw new Error("물특 백업 파일이 아니에요.");
      const d = pack.data;
      if (!Array.isArray(d.tasks) || d.tasks.length > 500 || !d.tasks.every((x: any) => x && typeof x.id === "string" && typeof x.title === "string" && typeof x.completed === "boolean") ||
          !Array.isArray(d.logs) || d.logs.length > 2000 || !d.logs.every((x: any) => x && typeof x.id === "string" && typeof x.date === "string") ||
          !d.tankProfile || typeof d.tankProfile !== "object" ||
          !["name", "sizeLiters", "fishList", "setupDate"].every((k) => typeof (d.tankProfile as Record<string, unknown>)[k] === "string") ||
          !Array.isArray(d.activeDecorIds) || !d.activeDecorIds.every((x: unknown) => typeof x === "string") ||
          !Array.isArray(d.customRules) || !d.customRules.every((x: any) => x && typeof x.id === "string" && typeof x.text === "string") ||
          (d.mode !== "beginner" && d.mode !== "detailed")) throw new Error("백업 데이터 일부가 손상되었어요.");
      if (!window.confirm("현재 어항 기록·체크리스트가 백업 파일 내용으로 바뀝니다. 복원할까요?")) return "복원을 취소했어.";
      setTasks(d.tasks as TodoTask[]); setTankProfile(d.tankProfile as TankProfile);
      setLogs(d.logs as TankLogEntry[]); setMode(d.mode as ExplanationMode);
      setActiveDecorIds(d.activeDecorIds as string[]); setCustomRules(d.customRules as CustomKnowledgeRule[]);
      return "백업을 복원했어. 기존 데이터는 새 백업 내용으로 교체됐어.";
    } catch (err) { return err instanceof Error ? `복원 실패: ${err.message}` : "백업 파일을 읽을 수 없어요."; }
  };

  const handleToggleDecor = (decorId: string) => {
    setActiveDecorIds((prev) =>
      prev.includes(decorId)
        ? prev.filter((id) => id !== decorId)
        : [...prev, decorId]
    );
  };

  const handleAddRule = (text: string) => {
    const newRule: CustomKnowledgeRule = {
      id: `rule-${Date.now()}`,
      text,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomRules((prev) => [newRule, ...prev]);
  };

  const handleDeleteRule = (id: string) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="underwater-page min-h-screen text-[#243b7a]">
      <TopNav onAskClick={openChatAndFocus} onNavigate={scrollToSection} />

      <main>
        <AquariumHero
          onOpenChat={openChatAndFocus}
          onNavigate={scrollToSection}
          completedCount={completedCount}
          totalTodoCount={tasks.length}
          tankName={tankProfile.name}
          observationPoints={observationPoints}
          activeDecorIds={activeDecorIds}
          onToggleDecor={handleToggleDecor}
          npcMoodLine={npcMoodLine}
        />

        <CareHubWorkspace
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          messages={messages}
          setMessages={setMessages}
          mode={mode}
          setMode={setMode}
          tankProfile={tankProfile}
          latestLog={logs[0]}
          customRules={customRules}
          onAddRule={handleAddRule}
          onDeleteRule={handleDeleteRule}
          pendingPrompt={pendingPrompt}
          onClearPendingPrompt={() => setPendingPrompt(null)}
          onApplyRecommendedFish={handleApplyRecommendedFish}
          onAddSuggestedTask={handleAddTask}
          onAskMulbangul={askMulbangul}
          inputRef={chatInputRef}
        />

        <TodoChecklistSection
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onAddTask={(title) => handleAddTask(title)}
          onDeleteTask={handleDeleteTask}
          onResetChecks={handleResetChecks}
          onAskAboutTask={askMulbangul}
        />

        <TankLogSection
          tankProfile={tankProfile}
          onUpdateProfile={setTankProfile}
          logs={logs}
          onAddLog={handleAddLog}
          onDeleteLog={handleDeleteLog}
          onAskWithLog={handleAskWithLog}
          onExportBackup={exportBackup}
          onImportBackup={importBackup}
        />

        <FishEncyclopedia onAskSpecies={askMulbangul} onAddToTank={handleAddSpeciesToTank} onCheckRegistration={checkSpeciesRegistration} />

        <BeginnerGuideSection onAskTopic={askMulbangul} />
      </main>

      <footer className="border-t border-teal-200/70 bg-white/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          물특 · AI All-in-One 관상어 통합 케어 서비스 &amp; 힐링 수족관 도우미 물방울
        </div>
      </footer>
    </div>
  );
}
