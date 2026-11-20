import React, { useState } from "react";
import { Check, Plus, RotateCcw, HelpCircle, Trash2 } from "lucide-react";
import type { TodoTask, TankSpecies } from "../types/aquarium";

interface TodoChecklistSectionProps {
  tasks: TodoTask[];
  tankSpecies: TankSpecies[];
  today: string;
  isKeeper?: boolean;
  onOpenFishDex: () => void;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (id: string) => void;
  onResetChecks: () => void;
  onAskAboutTask: (prompt: string) => void;
}

export const TodoChecklistSection: React.FC<TodoChecklistSectionProps> = ({
  tasks,
  tankSpecies,
  today,
  isKeeper = false,
  onOpenFishDex,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onResetChecks,
  onAskAboutTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const visibleTasks = tasks.filter(t=>isKeeper||!["feed-morning","weekly-water-change"].includes(t.id));
  const completedCount = visibleTasks.filter((t) => t.completed).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setNewTaskTitle("");
  };

  return (
    <section id="todo-section" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="rounded-2xl border border-teal-200/80 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-sky-100 pb-5">
          <div>
            <p className="text-xs font-semibold text-teal-700">
              오늘의 돌봄 · 오늘의 관찰 퀘스트 &amp; 케어 일정
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0f293a]">
              건강한 어항을 지키는 오늘의 미션
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              관찰과 돌봄 활동으로 배지를 모아 봐요. 먹이를 많이 주거나 물을 억지로 자주 갈 필요는 없어요!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">오늘 진행 현황</div>
              <div className="text-xl font-bold text-[#0f293a] tabular-nums">
                {completedCount} / {visibleTasks.length} 완료
              </div>
            </div>
            <button
              type="button"
              onClick={onResetChecks}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-sky-200 bg-[#f6fbff] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>오늘 체크 초기화</span>
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#effaff] p-4">
          <p className="font-bold text-sky-900">📅 {today} · 초보자를 위한 돌봄 체크</p>
          {isKeeper ? <>
            <p className="mt-1 text-sm text-slate-700">지금 키우고 있는 물고기의 상태를 확인해 봐요.</p>
            <p className="mt-1 text-xs text-slate-600">오늘은 상태·수온·여과 흐름을 관찰하고 기록해요. 먹이와 환수는 어종·측정 결과에 맞춰 판단하세요.</p>
          </> : <>
            <p className="mt-1 text-sm text-slate-700">물고기를 키우기 전이라면 어종 공부와 준비 과정을 체크해 봐요.</p>
            <button type="button" onClick={onOpenFishDex} className="mt-2 min-h-11 rounded-xl bg-white px-3 text-xs font-bold text-sky-800">물고기 도감 공부하기 →</button>
          </>}
        </div>
        <ul className="divide-y divide-sky-100">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className="flex flex-1 items-start gap-3.5 text-left cursor-pointer group min-h-[44px]"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    task.completed
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-sky-300 bg-white group-hover:border-[#0284c7]"
                  }`}
                >
                  {task.completed && <Check className="h-4 w-4" />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[15px] font-semibold ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-[#0f293a]"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      · {task.frequency}
                    </span>
                    {task.isObservationQuest && (
                      <span className="text-xs font-medium text-teal-700">
                        · 배지 도전 미션
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                </div>
              </button>

              <div className="flex items-center gap-2 pl-9 sm:pl-0 shrink-0">
                <button
                  type="button"
                  onClick={() => onAskAboutTask(task.askPrompt)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-sky-200 bg-[#f4f9fd] px-3 py-1.5 text-xs font-semibold text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>어떻게 해요?</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`${task.title} 삭제`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="내가 추가하고 싶은 어항 할 일 적기 (예: 수초 시든 잎 떼어내기)"
            className="min-h-[44px] flex-1 rounded-xl border border-sky-200 bg-[#fbfdff] px-4 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#0284c7] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0369a1] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>할 일 추가</span>
          </button>
        </form>
      </div>
    </section>
  );
};
