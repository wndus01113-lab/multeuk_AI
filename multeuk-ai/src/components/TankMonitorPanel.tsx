import React, { useEffect, useRef, useState } from "react";
import {
  Video,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  PlusCircle,
  MessageCircle,
  Square,
} from "lucide-react";
import type {
  AttachedImage,
  CustomKnowledgeRule,
  MonitorTankResult,
  TankProfile,
} from "../types/aquarium";

interface TankMonitorPanelProps {
  tankProfile: TankProfile;
  customRules: CustomKnowledgeRule[];
  onAddSuggestedTask: (title: string, description: string) => void;
  onAskMulbangul: (prompt: string) => void;
}

export const TankMonitorPanel: React.FC<TankMonitorPanelProps> = ({
  tankProfile,
  customRules,
  onAddSuggestedTask,
  onAskMulbangul,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [frames, setFrames] = useState<AttachedImage[]>([]);
  const [userNote, setUserNote] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MonitorTankResult | null>(null);
  const [lastScannedAt, setLastScannedAt] = useState<string | null>(null);
  const [taskAdded, setTaskAdded] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    setAutoScan(false);
    setCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "이 브라우저에서는 실시간 카메라를 지원하지 않아요. 대신 아래에서 어항 사진이나 짧은 영상을 올려보세요!"
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 60);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "카메라 권한을 열 수 없어요.";
      setError(
        msg.includes("지원하지")
          ? msg
          : "카메라를 연결할 수 없어요(권한 거부 또는 카메라 없음). 오른쪽 버튼으로 어항 영상·사진 파일을 올려 바로 분석할 수 있어요!"
      );
      setCameraActive(false);
    }
  };

  const captureSingleFrame = (): AttachedImage | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }
    const canvas = document.createElement("canvas");
    const targetWidth = Math.min(720, video.videoWidth);
    const scale = targetWidth / video.videoWidth;
    canvas.width = targetWidth;
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const commaIdx = dataUrl.indexOf(",");
    return {
      data: dataUrl.slice(commaIdx + 1),
      mimeType: "image/jpeg",
      previewUrl: dataUrl,
    };
  };

  const runAnalysis = async (framesToAnalyze: AttachedImage[]) => {
    if (analyzing || framesToAnalyze.length === 0) return;
    setAnalyzing(true);
    setError(null);
    setTaskAdded(false);

    try {
      const res = await fetch("/api/monitor-tank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: framesToAnalyze.map((f) => ({
            data: f.data,
            mimeType: f.mimeType,
          })),
          userNote,
          tankProfile,
          customRules,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "관제 분석에 실패했어요.");
      }
      setResult(data as MonitorTankResult);
      setLastScannedAt(
        new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "어항 화면 분석 중 문제가 생겼어요."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCaptureFromCamera = async () => {
    const first = captureSingleFrame();
    if (!first) {
      setError("카메라 화면이 아직 준비되지 않았어요. 잠시 후 다시 눌러주세요.");
      return;
    }
    setFrames([first]);
    await runAnalysis([first]);
  };

  useEffect(() => {
    if (!cameraActive || !autoScan) return;
    const timer = window.setInterval(() => {
      if (!analyzing) {
        const frame = captureSingleFrame();
        if (frame) {
          setFrames([frame]);
          void runAnalysis([frame]);
        }
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, [cameraActive, autoScan, analyzing]);

  const extractVideoFrames = (file: File): Promise<AttachedImage[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => URL.revokeObjectURL(objectUrl);

      video.onloadedmetadata = async () => {
        try {
          const duration = Number.isFinite(video.duration) ? video.duration : 1;
          const sampleTimes =
            duration > 2
              ? [0.2, Math.min(duration * 0.5, duration - 0.1), Math.max(0.1, duration - 0.3)]
              : [0.1];

          const extracted: AttachedImage[] = [];
          for (const t of sampleTimes) {
            await new Promise<void>((resSeek) => {
              video.currentTime = t;
              video.onseeked = () => resSeek();
            });
            const canvas = document.createElement("canvas");
            const width = Math.min(640, video.videoWidth || 640);
            const height = Math.round(
              width * ((video.videoHeight || 360) / (video.videoWidth || 640))
            );
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0, width, height);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
              extracted.push({
                data: dataUrl.slice(dataUrl.indexOf(",") + 1),
                mimeType: "image/jpeg",
                previewUrl: dataUrl,
              });
            }
          }
          cleanup();
          resolve(extracted);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error("영상 파일을 읽을 수 없어요. MP4 또는 사진 파일로 시도해 주세요."));
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (file.type.startsWith("video/")) {
      try {
        const extracted = await extractVideoFrames(file);
        if (extracted.length === 0) {
          throw new Error("영상에서 장면을 추출하지 못했어요.");
        }
        setFrames(extracted);
        await runAnalysis(extracted);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "영상 파일을 처리하는 중 오류가 발생했어요."
        );
      }
      return;
    }

    if (file.type.startsWith("image/")) {
      if (file.size > 8 * 1024 * 1024) {
        setError("사진 크기는 8MB 이하만 지원해요.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const resStr = typeof reader.result === "string" ? reader.result : "";
        const idx = resStr.indexOf(",");
        if (idx === -1) return;
        const img: AttachedImage = {
          data: resStr.slice(idx + 1),
          mimeType: file.type,
          previewUrl: resStr,
        };
        setFrames([img]);
        await runAnalysis([img]);
      };
      reader.readAsDataURL(file);
      return;
    }

    setError("어항 동영상(MP4/MOV)이나 사진(JPG/PNG) 파일을 선택해 주세요.");
  };

  const renderStatusBadge = (status: MonitorTankResult["overallStatus"]) => {
    if (status === "정상") {
      return (
        <div className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>상태: 정상 (평온해요)</span>
        </div>
      );
    }
    if (status === "주의") {
      return (
        <div className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>상태: 주의 관찰 필요</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-700">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>상태: 즉시 점검 필요</span>
      </div>
    );
  };

  return (
    <div className="p-5 sm:p-6 bg-[#fbfdff]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Live Camera or Video/Photo Input */}
        <div className="lg:col-span-6 space-y-4 rounded-2xl border border-sky-100 bg-white p-5">
          <div>
            <p className="text-xs font-semibold text-teal-700">
              2단계 · 이상 유영 및 수질 관제 스캔
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#0f293a]">
              어항 화면으로 스트레스·백탁·이끼 점검하기
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              실시간 카메라를 비추거나 어항 영상·사진을 올리면, 물고기들의 이상 유영(수면 뻐끔거림·싸움)과 물 상태(백탁·이끼)를 살펴 알림을 드려요.
            </p>
          </div>

          {/* Live Video Preview or Uploaded Frames Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-[#f0f7fb] aspect-video flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : frames.length > 0 ? (
              <div className="grid h-full w-full grid-cols-1 gap-1 sm:grid-flow-col sm:auto-cols-fr">
                {frames.map((f, idx) => (
                  <img
                    key={idx}
                    src={f.previewUrl}
                    alt={`분석 중인 어항 화면 ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 text-center">
                <Video className="mx-auto h-9 w-9 text-[#0284c7]/70" />
                <p className="mt-2 text-sm font-semibold text-[#0f293a]">
                  어항 카메라를 켜거나 영상을 올려주세요
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  짧은 어항 동영상은 자동으로 여러 장면을 뽑아 움직임까지 분석해요.
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="monitor-note"
              className="block text-xs font-semibold text-slate-700"
            >
              지금 신경 쓰이는 점이 있다면 적어주세요 (선택)
            </label>
            <input
              id="monitor-note"
              type="text"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="예: 어제부터 물이 뿌옇고 한 마리가 계속 수면 위쪽에 있어요"
              className="mt-1.5 min-h-[40px] w-full rounded-xl border border-sky-200 bg-[#fbfdff] px-3.5 py-2 text-sm text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!cameraActive ? (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369a1] cursor-pointer whitespace-nowrap"
              >
                <Camera className="h-4 w-4" />
                <span>실시간 카메라 켜기</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => void handleCaptureFromCamera()}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369a1] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  <Camera className="h-4 w-4" />
                  <span>{analyzing ? "스캔 중..." : "지금 화면 스캔"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAutoScan((prev) => !prev)}
                  className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                    autoScan
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-sky-200 bg-white text-slate-700 hover:bg-sky-50"
                  }`}
                >
                  <span>{autoScan ? "15초 자동 관제 중 (끄기)" : "15초마다 자동 관제"}</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex min-h-[42px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>카메라 끄기</span>
                </button>
              </>
            )}

            <input
              ref={mediaInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={(e) => void handleFileUpload(e)}
              className="hidden"
            />
            <button
              type="button"
              disabled={analyzing}
              onClick={() => mediaInputRef.current?.click()}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-sky-200 bg-[#f4f9fd] px-4 py-2 text-xs font-semibold text-[#0f293a] hover:bg-sky-50 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Upload className="h-4 w-4 text-[#0284c7]" />
              <span>어항 영상·사진 올리기</span>
            </button>
          </div>
        </div>

        {/* Right: Structured Monitoring Alert Card */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-5">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </div>
          )}

          {!result && !analyzing && (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#0284c7]">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0f293a]">
                아직 어항 스캔 결과가 없어요
              </h4>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
                어항이 잘 돌아가고 있는지 궁금하거나 물이 조금 뿌예 보일 때 화면을 스캔하면, 이상 유영과 수질 상태를 초보자 언어로 진단해 드려요.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-semibold text-[#0284c7]">
                물방울이 어항 물 맑기와 물고기 유영 모습을 꼼꼼히 살피고 있어요...
              </p>
            </div>
          )}

          {result && !analyzing && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-3">
                {renderStatusBadge(result.overallStatus)}
                {lastScannedAt && (
                  <span className="text-xs text-slate-400 tabular-nums">
                    최근 점검 {lastScannedAt}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-sky-100 bg-[#f6fbff] p-4">
                <p className="text-xs font-semibold text-[#0284c7]">한눈에 요약</p>
                <p className="mt-1 text-sm leading-relaxed text-[#0f293a]">
                  {result.alertSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-sky-100 bg-[#fbfdff] p-3.5">
                  <p className="text-xs font-semibold text-slate-500">
                    유영 · 행동 상태
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#0f293a]">
                    {result.swimmingBehavior}
                  </p>
                </div>

                <div className="rounded-xl border border-sky-100 bg-[#fbfdff] p-3.5">
                  <p className="text-xs font-semibold text-slate-500">
                    수질 · 어항 외관 상태
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#0f293a]">
                    {result.waterQualityState}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-teal-100 bg-[#f2fafb] p-4">
                <p className="text-xs font-semibold text-teal-700">
                  물방울의 추천 대처법
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#0f293a]">
                  {result.recommendedAction}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={taskAdded}
                  onClick={() => {
                    onAddSuggestedTask(
                      result.suggestedTaskTitle || "어항 관제 후 상태 재확인",
                      result.recommendedAction
                    );
                    setTaskAdded(true);
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3.5 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>
                    {taskAdded
                      ? "'오늘 할 일'에 등록 완료"
                      : `'${result.suggestedTaskTitle}' 일정 추가`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAskMulbangul(
                      `방금 어항 관제 스캔에서 [${result.overallStatus}] 결과가 나왔어요.\n- 유영 상태: ${result.swimmingBehavior}\n- 수질 상태: ${result.waterQualityState}\n- 요약: ${result.alertSummary}\n초보자가 순서대로 무엇부터 확인하면 좋을지 더 자세히 알려주세요!`
                    )
                  }
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#0284c7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0369a1] cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>이 결과로 물방울에게 상담받기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
