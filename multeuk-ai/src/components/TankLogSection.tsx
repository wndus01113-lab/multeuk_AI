import React, { useState } from "react";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import type { TankLogEntry, TankProfile } from "../types/aquarium";

interface TankLogSectionProps {
  tankProfile: TankProfile;
  onUpdateProfile: (profile: TankProfile) => void;
  logs: TankLogEntry[];
  onAddLog: (entry: Omit<TankLogEntry, "id">) => void;
  onDeleteLog: (id: string) => void;
  onAskWithLog: (entry: TankLogEntry) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<string>;
}

export const TankLogSection: React.FC<TankLogSectionProps> = ({
  tankProfile,
  onUpdateProfile,
  logs,
  onAddLog,
  onDeleteLog,
  onAskWithLog,
  onExportBackup,
  onImportBackup,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tempC, setTempC] = useState("25.0");
  const [waterState, setWaterState] = useState<TankLogEntry["waterState"]>("맑음");
  const [appetite, setAppetite] = useState<TankLogEntry["appetite"]>("잘 먹음");
  const [waterChanged, setWaterChanged] = useState(false);
  const [note, setNote] = useState("");
  const [backupStatus, setBackupStatus] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      date,
      tempC: tempC.trim() || "25.0",
      waterState,
      appetite,
      waterChanged,
      note: note.trim() || "특이사항 없이 평온함",
    });
    setNote("");
    setWaterChanged(false);
  };

  return (
    <section id="tank-log-section" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: My Tank Profile */}
        <div className="lg:col-span-5 rounded-2xl border border-sky-200/80 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#0284c7]">
                내 어항 프로필 · 선택 입력
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#0f293a]">내 어항 정보</h2>
            </div>
            {(tankProfile.name ||
              tankProfile.sizeLiters ||
              tankProfile.fishList ||
              tankProfile.setupDate) && (
              <button
                type="button"
                onClick={() =>
                  onUpdateProfile({
                    name: "",
                    sizeLiters: "",
                    fishList: "",
                    setupDate: "",
                  })
                }
                className="rounded-lg border border-sky-200 bg-[#f6fbff] px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-sky-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                정보 비우기
              </button>
            )}
          </div>
          <div className="mt-4 rounded-2xl border border-sky-200 bg-[#f0fbff] p-3">
            <p className="text-sm font-bold text-[#243b7a]">💾 내 어항 데이터 백업</p>
            <p className="mt-1 text-xs text-slate-600">기록·할 일·꾸미기·사용자 규칙을 JSON 파일로 저장하고 복원해요. 기기 변경 전에 백업해 주세요. 복원 시 현재 기록을 덮어씁니다.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={onExportBackup} className="min-h-11 rounded-xl bg-sky-600 px-3 text-sm font-bold text-white">백업 내려받기</button>
              <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-sky-800">백업 불러오기<input type="file" accept=".json,application/json" className="sr-only" onChange={async(e)=>{const file=e.target.files?.[0];if(file)setBackupStatus(await onImportBackup(file));e.target.value="";}} /></label>
            </div>
            {backupStatus && <p className="mt-2 text-xs" role="status">{backupStatus}</p>}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            아직 물고기를 키우기 전이라면 비워두셔도 괜찮아요! 키우는 물고기가 생겼을 때 적어두면 물방울이 그 어종에 맞춰 답변해 줘요.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="tank-name"
                className="block text-xs font-semibold text-slate-700"
              >
                어항 이름 (선택)
              </label>
              <input
                id="tank-name"
                type="text"
                value={tankProfile.name}
                onChange={(e) =>
                  onUpdateProfile({ ...tankProfile, name: e.target.value })
                }
                placeholder="예: 거실 구피 어항 (없으면 비워두세요)"
                className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="tank-size"
                  className="block text-xs font-semibold text-slate-700"
                >
                  어항 크기 (리터, L)
                </label>
                <input
                  id="tank-size"
                  type="text"
                  value={tankProfile.sizeLiters}
                  onChange={(e) =>
                    onUpdateProfile({ ...tankProfile, sizeLiters: e.target.value })
                  }
                  placeholder="예: 20"
                  className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 tabular-nums focus:border-[#0284c7] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="tank-setup-date"
                  className="block text-xs font-semibold text-slate-700"
                >
                  어항 시작한 날
                </label>
                <input
                  id="tank-setup-date"
                  type="date"
                  value={tankProfile.setupDate}
                  onChange={(e) =>
                    onUpdateProfile({ ...tankProfile, setupDate: e.target.value })
                  }
                  className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] tabular-nums focus:border-[#0284c7] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tank-fish"
                className="block text-xs font-semibold text-slate-700"
              >
                키우는 물고기와 마릿수
              </label>
              <input
                id="tank-fish"
                type="text"
                value={tankProfile.fishList}
                onChange={(e) =>
                  onUpdateProfile({ ...tankProfile, fishList: e.target.value })
                }
                placeholder="아직 키우는 물고기가 없다면 비워두세요 (예: 구피 4마리)"
                className="mt-1.5 min-h-[42px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Tank Care Diary */}
        <div className="lg:col-span-7 rounded-2xl border border-sky-200/80 bg-white p-6">
          <div className="border-b border-sky-100 pb-4">
            <p className="text-xs font-semibold text-[#0284c7]">
              어항 일기 · 수온·물 상태 관찰 일기
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0f293a]">
              오늘 어항 상태 남기기
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label
                  htmlFor="log-date"
                  className="block text-xs font-semibold text-slate-700"
                >
                  날짜
                </label>
                <input
                  id="log-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-1.5 text-sm tabular-nums focus:border-[#0284c7] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="log-temp"
                  className="block text-xs font-semibold text-slate-700"
                >
                  수온 (°C)
                </label>
                <input
                  id="log-temp"
                  type="text"
                  value={tempC}
                  onChange={(e) => setTempC(e.target.value)}
                  placeholder="25.0"
                  className="mt-1 min-h-[40px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-1.5 text-sm tabular-nums focus:border-[#0284c7] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="log-water"
                  className="block text-xs font-semibold text-slate-700"
                >
                  물 맑기
                </label>
                <select
                  id="log-water"
                  value={waterState}
                  onChange={(e) =>
                    setWaterState(e.target.value as TankLogEntry["waterState"])
                  }
                  className="mt-1 min-h-[40px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-1.5 text-sm focus:border-[#0284c7] focus:outline-none"
                >
                  <option value="맑음">맑음</option>
                  <option value="약간 뿌염">약간 뿌염</option>
                  <option value="이끼·녹조">이끼·녹조</option>
                  <option value="냄새·거품">냄새·거품</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="log-appetite"
                  className="block text-xs font-semibold text-slate-700"
                >
                  밥 반응
                </label>
                <select
                  id="log-appetite"
                  value={appetite}
                  onChange={(e) =>
                    setAppetite(e.target.value as TankLogEntry["appetite"])
                  }
                  className="mt-1 min-h-[40px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3 py-1.5 text-sm focus:border-[#0284c7] focus:outline-none"
                >
                  <option value="잘 먹음">잘 먹음</option>
                  <option value="보통">보통</option>
                  <option value="안 먹음">안 먹음</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="관찰한 내용 메모 (예: 암컷 구피 배가 통통해졌어요)"
                className="min-h-[42px] flex-1 rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
              />
              <label className="inline-flex min-h-[42px] items-center gap-2 px-1 text-sm font-medium text-slate-700 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={waterChanged}
                  onChange={(e) => setWaterChanged(e.target.checked)}
                  className="h-4 w-4 accent-[#0284c7]"
                />
                <span>오늘 물갈이 함</span>
              </label>
              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0369a1] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>기록 저장</span>
              </button>
            </div>
          </form>

          {/* Saved Logs List */}
          <div className="mt-6 border-t border-sky-100 pt-4">
            <h3 className="text-sm font-bold text-[#0f293a]">최근 어항 기록</h3>
            {logs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                아직 기록이 없어요. 오늘 어항 온도와 물 상태를 첫 기록으로 남겨보세요.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-sky-100">
                {logs.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-col gap-2.5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 tabular-nums">
                        <span className="font-semibold text-[#0f293a]">
                          {entry.date}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>수온 {entry.tempC}°C</span>
                        <span aria-hidden="true">·</span>
                        <span>물 {entry.waterState}</span>
                        <span aria-hidden="true">·</span>
                        <span>먹이 {entry.appetite}</span>
                        {entry.waterChanged && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#0284c7]">
                              물갈이 완료
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{entry.note}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onAskWithLog(entry)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-sky-200 bg-[#f4f9fd] px-3 py-1.5 text-xs font-semibold text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>물방울에게 점검받기</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLog(entry.id)}
                        aria-label={`${entry.date} 기록 삭제`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
