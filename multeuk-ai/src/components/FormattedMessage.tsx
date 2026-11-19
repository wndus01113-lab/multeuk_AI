import React from "react";

interface FormattedMessageProps {
  text: string;
}

function renderInlineBold(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#0f293a]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ text }) => {
  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listBuffer: Array<{ type: "ul" | "ol"; content: string }> = [];

  const flushList = (keyPrefix: string) => {
    if (listBuffer.length === 0) return;
    const isOrdered = listBuffer[0].type === "ol";
    const ListTag = isOrdered ? "ol" : "ul";
    elements.push(
      <ListTag
        key={`${keyPrefix}-list-${elements.length}`}
        className={`my-2 space-y-1.5 pl-5 ${
          isOrdered ? "list-decimal" : "list-disc"
        } text-[15px] leading-relaxed text-slate-700`}
      >
        {listBuffer.map((item, idx) => (
          <li key={idx}>{renderInlineBold(item.content)}</li>
        ))}
      </ListTag>
    );
    listBuffer = [];
  };

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList(`line-${index}`);
      return;
    }

    if (trimmed === "---" || trimmed === "***") {
      flushList(`line-${index}`);
      elements.push(
        <hr key={`hr-${index}`} className="my-2.5 border-sky-100" />
      );
      return;
    }

    if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      flushList(`line-${index}`);
      const headingText = trimmed.replace(/^#{1,3}\s+/, "");
      elements.push(
        <h4
          key={`h-${index}`}
          className="mt-3 mb-1 text-[15px] font-bold text-[#0f293a]"
        >
          {renderInlineBold(headingText)}
        </h4>
      );
      return;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (listBuffer.length > 0 && listBuffer[0].type !== "ol") {
        flushList(`line-${index}`);
      }
      listBuffer.push({ type: "ol", content: orderedMatch[2] });
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      if (listBuffer.length > 0 && listBuffer[0].type !== "ul") {
        flushList(`line-${index}`);
      }
      listBuffer.push({ type: "ul", content: trimmed.slice(2) });
      return;
    }

    flushList(`line-${index}`);
    elements.push(
      <p
        key={`p-${index}`}
        className="my-1.5 text-[15px] leading-relaxed text-slate-700"
      >
        {renderInlineBold(trimmed)}
      </p>
    );
  });

  flushList("end");

  return <div className="space-y-0.5">{elements}</div>;
};
