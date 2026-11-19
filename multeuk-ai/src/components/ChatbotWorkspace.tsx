import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, Send, X, CalendarPlus, RefreshCw } from "lucide-react";
import type {
  AttachedImage,
  ChatMessage,
  CustomKnowledgeRule,
  ExplanationMode,
  TankLogEntry,
  TankProfile,
} from "../types/aquarium";
import { QUICK_STARTER_QUESTIONS } from "../data/aquariumDefaults";
import { FormattedMessage } from "./FormattedMessage";

interface ChatbotWorkspaceProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  mode: ExplanationMode;
  setMode: (mode: ExplanationMode) => void;
  tankProfile: TankProfile;
  latestLog?: TankLogEntry;
  customRules: CustomKnowledgeRule[];
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
  onRegisterCareTask: (title: string, description: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

import MASCOT_IMAGE from "../assets/images/multeuk_mascot.webp";

export const ChatbotWorkspace: React.FC<ChatbotWorkspaceProps> = ({
  messages,
  setMessages,
  mode,
  setMode,
  tankProfile,
  latestLog,
  customRules,
  pendingPrompt,
  onClearPendingPrompt,
  onRegisterCareTask,
  inputRef,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [mascotImgError, setMascotImgError] = useState(false);
  const [savedMsgIds, setSavedMsgIds] = useState<string[]>([]);
  const [failedRetryInfo, setFailedRetryInfo] = useState<{
    text: string;
    image?: AttachedImage | null;
    userMsgId: string;
    retryMsgId: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastHandledPromptRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isStreaming]);

  const sendMessage = async (
    customText?: string,
    customImage?: AttachedImage | null,
    replaceIds?: [string, string]
  ) => {
    if (isStreaming) return;
    const textToSend = (customText ?? inputValue).trim();
    const imageToSend = customImage === undefined ? attachedImage : customImage;

    if (!textToSend && !imageToSend) return;

    setErrorText(null);
    setFailedRetryInfo(null);
    const nowTime = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: textToSend || "사진 속 물고기와 어항 상태를 초보자도 알기 쉽게 봐주세요!",
      timestamp: nowTime,
      image: imageToSend ?? undefined,
    };

    const assistantMsgId = `model-${Date.now() + 1}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantMsgId,
      role: "model",
      text: "",
      timestamp: nowTime,
    };

    const baseMessages = replaceIds
      ? messages.filter((m) => m.id !== replaceIds[0] && m.id !== replaceIds[1])
      : messages;
    const apiHistory = [...baseMessages.filter((m) => !m.isErrorRetry), userMsg];
    setMessages([...baseMessages, userMsg, placeholderAssistant]);

    if (customText === undefined && !replaceIds) {
      setInputValue("");
      setAttachedImage(null);
    }

    setIsStreaming(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          mode,
          tankProfile,
          latestLog,
          customRules,
          messages: apiHistory.map((m) => ({
            role: m.role,
            text: m.text,
            image: m.image
              ? { data: m.image.data, mimeType: m.image.mimeType }
              : undefined,
          })),
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(
          errPayload.error ||
            "잠시 물방울 서버 응답이 원활하지 않아요. 다시 한 번 시도해 주세요."
        );
      }

      if (!response.body) {
        throw new Error("응답 데이터를 받지 못했어요. 다시 한 번 시도해 주세요.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr) as {
              text?: string;
              done?: boolean;
              error?: string;
            };
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, text: accumulated } : m
                )
              );
            }
          } catch (innerErr) {
            if (
              innerErr instanceof Error &&
              innerErr.message !== "Unexpected end of JSON input"
            ) {
              throw innerErr;
            }
          }
        }
      }

      if (!accumulated.trim()) {
        throw new Error("응답 내용이 비어 있어요. 다시 한 번 시도해 주세요.");
      }
    } catch (err: unknown) {
      const isTimeoutOrNetwork =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error &&
          (err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError") ||
            err.message.includes("network")));

      const friendlyMessage = isTimeoutOrNetwork
        ? "앗, 지금 네트워크 연결이 잠시 느리거나 물방울에게 질문이 몰려 답변이 지연되고 있어요.\n\n잠시 숨을 고른 뒤 아래 **다시 시도하기** 버튼을 눌러 한 번만 더 보내주시면 바로 확인해 드릴게요!"
        : `잠시 물방울과의 연결이 고르지 않아 답변을 가져오지 못했어요.\n\n${
            err instanceof Error && err.message
              ? err.message
              : "일시적인 통신 지연일 수 있어요."
          }\n\n아래 **다시 시도하기** 버튼을 눌러 한 번 더 질문해 보실래요?`;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, text: friendlyMessage, isErrorRetry: true }
            : m
        )
      );
      setFailedRetryInfo({
        text: textToSend,
        image: imageToSend,
        userMsgId,
        retryMsgId: assistantMsgId,
      });
    } finally {
      window.clearTimeout(timeoutId);
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt && pendingPrompt !== lastHandledPromptRef.current && !isStreaming) {
      lastHandledPromptRef.current = pendingPrompt;
      onClearPendingPrompt();
      void sendMessage(pendingPrompt, null).finally(() => {
        lastHandledPromptRef.current = null;
      });
    }
  }, [pendingPrompt, isStreaming]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorText("사진 파일(JPG, PNG 등)만 올릴 수 있어요.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setErrorText("사진 크기가 너무 커요. 6MB 이하의 사진을 올려주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIndex = result.indexOf(",");
      if (commaIndex === -1) return;
      const base64Data = result.slice(commaIndex + 1);
      setAttachedImage({
        data: base64Data,
        mimeType: file.type,
        previewUrl: result,
      });
      setErrorText(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleResetChat = () => {
    if (isStreaming) return;
    lastHandledPromptRef.current = null;
    setErrorText(null);
    setFailedRetryInfo(null);
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: "새 대화를 시작했어요! 오늘 어항에서 궁금한 점이나 물고기 사진을 편하게 올려주세요.",
      },
    ]);
  };

  const handleSaveAsCareSchedule = (msg: ChatMessage) => {
    if (savedMsgIds.includes(msg.id)) return;
    const firstLine = msg.text
      .split("\n")
      .map((l) => l.replace(/[#*`]/g, "").trim())
      .find((l) => l.length > 4);
    const title = firstLine
      ? `물방울 케어: ${firstLine.slice(0, 26)}${firstLine.length > 26 ? "..." : ""}`
      : "물방울 상담 대처 확인하기";
    onRegisterCareTask(title, msg.text.replace(/[#*]/g, "").slice(0, 120));
    setSavedMsgIds((prev) => [...prev, msg.id]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div>
      {/* Chat Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-[#f8fcff] px-5 py-3">
        <p className="text-xs text-slate-600">
          {tankProfile.fishList
            ? `내 어항 연동 중: ${tankProfile.fishList}${tankProfile.sizeLiters ? ` · ${tankProfile.sizeLiters}L` : ""}`
            : "등록된 물고기 없음 · 입문 전 질문도 편하게 물어보세요"}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="설명 난이도 선택"
            className="flex items-center gap-1 rounded-xl bg-sky-100/80 p-1"
          >
            <button
              type="button"
              onClick={() => setMode("beginner")}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                mode === "beginner"
                  ? "bg-white text-[#0f293a] shadow-xs"
                  : "text-slate-600 hover:text-[#0f293a]"
              }`}
            >
              왕초보 쉬운 설명
            </button>
            <button
              type="button"
              onClick={() => setMode("detailed")}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                mode === "detailed"
                  ? "bg-white text-[#0f293a] shadow-xs"
                  : "text-slate-600 hover:text-[#0f293a]"
              }`}
            >
              조금 더 자세히
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            disabled={isStreaming}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-sky-50 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>새 대화</span>
          </button>
        </div>
      </div>

      {/* Quick Starter Questions */}
      <div className="border-b border-sky-100 bg-white px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">
            자주 묻는 질문:
          </span>
          {QUICK_STARTER_QUESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={isStreaming}
              onClick={() => void sendMessage(item.prompt, null)}
              className="rounded-lg border border-sky-200 bg-[#f4f9fd] px-3 py-1.5 text-xs font-medium text-[#0f293a] hover:border-[#0284c7] hover:bg-sky-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Feed */}
      <div className="h-[420px] sm:h-[460px] overflow-y-auto px-4 py-5 sm:px-6 space-y-5 bg-[#fbfdff]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isSaved = savedMsgIds.includes(msg.id);
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-sky-100 bg-sky-50 mt-0.5">
                  {!mascotImgError ? (
                    <img
                      src={MASCOT_IMAGE}
                      alt="물방울"
                      referrerPolicy="no-referrer"
                      onError={() => setMascotImgError(true)}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[#0284c7]">
                      물방울
                    </div>
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[76%] ${
                  isUser
                    ? "rounded-2xl rounded-tr-sm bg-[#0284c7] px-4 py-3 text-white"
                    : "rounded-2xl rounded-tl-sm border border-sky-100 bg-white px-4 py-3.5 text-[#0f293a]"
                }`}
              >
                <div
                  className={`mb-1 flex items-center gap-2 text-[11px] ${
                    isUser ? "text-sky-100 justify-end" : "text-slate-400"
                  }`}
                >
                  <span className="font-medium">
                    {isUser ? "나 (반려어 집사)" : "물방울 도우미"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{msg.timestamp}</span>
                </div>

                {msg.image && (
                  <div className="mb-2.5 overflow-hidden rounded-xl border border-black/10">
                    <img
                      src={msg.image.previewUrl}
                      alt="사용자가 올린 어항 또는 물고기 사진"
                      referrerPolicy="no-referrer"
                      className="max-h-52 w-auto object-contain"
                    />
                  </div>
                )}

                {isUser ? (
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                ) : msg.text ? (
                  <>
                    <FormattedMessage text={msg.text} />
                    {msg.isErrorRetry &&
                      failedRetryInfo &&
                      failedRetryInfo.retryMsgId === msg.id &&
                      !isStreaming && (
                        <div className="mt-3 border-t border-sky-100 pt-3">
                          <button
                            type="button"
                            onClick={() =>
                              void sendMessage(
                                failedRetryInfo.text,
                                failedRetryInfo.image ?? null,
                                [
                                  failedRetryInfo.userMsgId,
                                  failedRetryInfo.retryMsgId,
                                ]
                              )
                            }
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0369a1] transition-colors cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>다시 시도하기</span>
                          </button>
                        </div>
                      )}
                    {!msg.isErrorRetry && idx > 0 && !isStreaming && (
                      <div className="mt-3 border-t border-sky-100 pt-2.5">
                        <button
                          type="button"
                          disabled={isSaved}
                          onClick={() => handleSaveAsCareSchedule(msg)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 disabled:text-slate-400 cursor-pointer"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" />
                          <span>
                            {isSaved
                              ? "'오늘 할 일' 관리 일정에 등록됨"
                              : "이 대처법을 '오늘 할 일' 일정에 등록"}
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    물방울이 뽀글뽀글 생각 중이에요...
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {errorText && (
        <div
          role="status"
          className="border-t border-sky-200 bg-[#f4f9fd] px-5 py-3 text-sm text-[#0f293a]"
        >
          {errorText}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-sky-100 bg-white p-4 sm:px-6">
        {attachedImage && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-sky-200 bg-[#f6fbff] p-2.5">
            <img
              src={attachedImage.previewUrl}
              alt="첨부한 사진 미리보기"
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-lg object-cover border border-sky-100"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#0f293a]">
                물고기/어항 사진이 첨부되었어요
              </p>
              <p className="text-xs text-slate-500">
                증상이나 궁금한 점을 함께 적어 보내면 더 정확히 진단해 드려요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              aria-label="첨부한 사진 지우기"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-sky-100 hover:text-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            title="물고기나 어항 사진 올리기"
            aria-label="물고기나 어항 사진 올리기"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-[#f6fbff] text-[#0284c7] hover:bg-sky-100 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <ImagePlus className="h-5 w-5" />
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="물고기 사진이나 궁금한 점을 편하게 물어보세요 (예: 계속 수면에 머물러요)"
            className="min-h-[44px] max-h-32 flex-1 resize-none rounded-xl border border-sky-200 bg-[#fbfdff] px-4 py-2.5 text-[15px] text-[#0f293a] placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
          />

          <button
            type="button"
            disabled={isStreaming || (!inputValue.trim() && !attachedImage)}
            onClick={() => void sendMessage()}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[#0284c7] px-5 text-sm font-semibold text-white hover:bg-[#0369a1] disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Send className="h-4 w-4" />
            <span>{isStreaming ? "답변 중" : "질문하기"}</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Enter 키로 전송 · 물고기 사진을 올리면 AI가 원인·질병 진단과 관리 일정 등록까지 도와드려요.
        </p>
      </div>
    </div>
  );
};
