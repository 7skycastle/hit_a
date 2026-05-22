import React from 'react';

interface ScoreBadgeProps {
  grade: "S" | "A" | "B" | "C" | "D" | "E";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ grade, showLabel = true, size = "md" }) => {
  // 등급별 스타일 색상 매핑
  const themeMap = {
    S: {
      bg: "bg-red-50 border-red-200 text-red-700",
      pill: "bg-red-600 text-white",
      desc: "실전 체감"
    },
    A: {
      bg: "bg-orange-50 border-orange-200 text-orange-700",
      pill: "bg-orange-500 text-white",
      desc: "시간 단축"
    },
    B: {
      bg: "bg-purple-50 border-purple-200 text-purple-700",
      pill: "bg-purple-600 text-white",
      desc: "확장 연계"
    },
    C: {
      bg: "bg-blue-50 border-blue-200 text-blue-700",
      pill: "bg-blue-600 text-white",
      desc: "문항 구조"
    },
    D: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      pill: "bg-emerald-600 text-white",
      desc: "선지 판단"
    },
    E: {
      bg: "bg-slate-100 border-slate-200 text-slate-700",
      pill: "bg-slate-500 text-white",
      desc: "소재권 유사"
    }
  };

  const current = themeMap[grade] || themeMap.E;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-4 py-2 text-sm"
  };

  const pillSizes = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-6 h-6 text-xs",
    lg: "w-8 h-8 text-sm"
  };

  return (
    <div className={`inline-flex items-center space-x-1.5 font-bold rounded-full border shadow-sm transition-all duration-300 ${current.bg} ${sizeClasses[size]}`}>
      <span className={`flex items-center justify-center rounded-full font-black ${current.pill} ${pillSizes[size]}`}>
        {grade}
      </span>
      {showLabel && <span className="tracking-tight">{current.desc}</span>}
    </div>
  );
};
