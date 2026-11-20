import React from "react";

interface AquariumDecorSvgProps {
  id: string;
  className?: string;
}

export const AquariumDecorSvg: React.FC<AquariumDecorSvgProps> = ({
  id,
  className = "h-12 w-12",
}) => {
  switch (id) {
    case "pebbles":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <ellipse cx="32" cy="48" rx="18" ry="8" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          <ellipse cx="30" cy="37" rx="13" ry="6.5" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
          <ellipse cx="33" cy="27" rx="8.5" ry="5" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" />
        </svg>
      );
    case "plant":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M32 54V22M32 54C24 44 16 36 18 24C22 28 28 36 32 42M32 54C40 44 48 34 45 20C40 26 35 35 32 42"
            stroke="#0F766E"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse cx="22" cy="30" rx="6" ry="10" transform="rotate(-24 22 30)" fill="#99F6E4" stroke="#0F766E" strokeWidth="2" />
          <ellipse cx="42" cy="28" rx="6" ry="10" transform="rotate(22 42 28)" fill="#5EEAD4" stroke="#0F766E" strokeWidth="2" />
          <ellipse cx="32" cy="20" rx="5.5" ry="9.5" fill="#A7F3D0" stroke="#0F766E" strokeWidth="2" />
        </svg>
      );
    case "driftwood":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 50C18 42 24 38 30 34C36 30 42 20 48 14L52 17C47 25 42 32 37 37C42 38 48 42 52 50H12Z"
            fill="#D6B89C"
            stroke="#785A40"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M22 45C26 42 30 39 34 36" stroke="#785A40" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "pearl":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 40C16 24 24 18 32 18C40 18 48 24 52 40"
            fill="#E0F2FE"
            stroke="#0369A1"
            strokeWidth="2.2"
          />
          <path
            d="M10 42C10 49 20 53 32 53C44 53 54 49 54 42H10Z"
            fill="#BAE6FD"
            stroke="#0369A1"
            strokeWidth="2.2"
          />
          <circle cx="32" cy="37" r="6.5" fill="#FFFDF5" stroke="#0284C7" strokeWidth="2" />
        </svg>
      );
    case "arch":
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M10 52C10 28 20 18 32 18C44 18 54 28 54 52H42C42 38 38 31 32 31C26 31 22 38 22 52H10Z"
            fill="#E2E8F0"
            stroke="#475569"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};
