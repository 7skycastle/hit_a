import React from 'react';
import type { Highlight } from '../types';
import { Check, Info, Trash2 } from 'lucide-react';

interface HighlightOverlayProps {
  highlights: Highlight[];
  onDelete?: (id: string) => void;
  editable?: boolean;
}

export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  highlights,
  onDelete,
  editable = false
}) => {
  // 색상 클래스 맵
  const colorMap = {
    red: {
      border: "border-red-600",
      bg: "bg-red-500/20",
      text: "text-red-700 bg-red-50",
      underline: "border-red-600",
    },
    yellow: {
      border: "border-amber-400",
      bg: "bg-amber-300/20",
      text: "text-amber-700 bg-amber-50",
      underline: "border-amber-400",
    },
    blue: {
      border: "border-blue-600",
      bg: "bg-blue-500/20",
      text: "text-blue-700 bg-blue-50",
      underline: "border-blue-600",
    },
    green: {
      border: "border-emerald-500",
      bg: "bg-emerald-500/20",
      text: "text-emerald-700 bg-emerald-50",
      underline: "border-emerald-500",
    },
    gray: {
      border: "border-slate-500",
      bg: "bg-slate-500/25",
      text: "text-slate-700 bg-slate-100",
      underline: "border-slate-500",
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {highlights.map((hl) => {
        const color = colorMap[hl.color] || colorMap.gray;
        
        // 백분율 좌표값 바인딩
        const style: React.CSSProperties = {
          left: `${hl.x}%`,
          top: `${hl.y}%`,
          width: `${hl.width}%`,
          height: `${hl.height}%`,
        };

        // 1. 박스 유형
        if (hl.type === 'box') {
          return (
            <div
              key={hl.id}
              style={style}
              className={`absolute border-[3px] rounded ${color.border} ${color.bg} flex items-start justify-start animate-pulse-highlight pointer-events-auto group`}
            >
              {hl.label && (
                <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm border border-slate-200 backdrop-blur-md opacity-90 transition-all ${color.text}`}>
                  {hl.label}
                </div>
              )}
              {editable && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(hl.id);
                  }}
                  className="absolute -top-3.5 -right-3 px-1 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-auto"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        }

        // 2. 밑줄 유형
        if (hl.type === 'underline') {
          return (
            <div
              key={hl.id}
              style={style}
              className={`absolute border-b-[4px] ${color.underline} pointer-events-auto group`}
            >
              {hl.label && (
                <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm border border-slate-200 ${color.text}`}>
                  {hl.label}
                </div>
              )}
              {editable && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(hl.id);
                  }}
                  className="absolute -top-4 -right-4 px-1 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all scale-75 opacity-0 group-hover:opacity-100 pointer-events-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        }

        // 3. 체크 유형
        if (hl.type === 'check') {
          return (
            <div
              key={hl.id}
              style={style}
              className="absolute pointer-events-auto group flex items-center justify-center"
            >
              <div className="bg-emerald-600 text-white p-1 rounded-full shadow-lg border border-white animate-bounce pointer-events-auto">
                <Check className="w-5 h-5 font-extrabold" />
              </div>
              {hl.label && (
                <div className="absolute -top-6 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm bg-emerald-50 border border-emerald-200 text-emerald-700 whitespace-nowrap">
                  {hl.label}
                </div>
              )}
              {editable && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(hl.id);
                  }}
                  className="absolute -top-2 -right-4 px-1 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all scale-75 opacity-0 group-hover:opacity-100 pointer-events-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        }

        // 4. 메모 유형
        if (hl.type === 'note') {
          return (
            <div
              key={hl.id}
              style={style}
              className={`absolute border border-dashed rounded ${color.border} bg-slate-50/70 p-1.5 flex flex-col pointer-events-auto group shadow-sm`}
            >
              <div className="flex items-center space-x-1 mb-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-black text-slate-700">참고 노트</span>
              </div>
              {hl.label && (
                <p className="text-[10px] font-semibold text-slate-600 leading-tight">
                  {hl.label}
                </p>
              )}
              {editable && onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(hl.id);
                  }}
                  className="absolute -top-2 -right-2 px-1 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all scale-75 opacity-0 group-hover:opacity-100 pointer-events-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
