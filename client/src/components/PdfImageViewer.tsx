import React, { useState, useRef, useEffect } from 'react';
import { Highlight } from '../types';
import { HighlightOverlay } from './HighlightOverlay';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface PdfImageViewerProps {
  imageUrl: string;
  highlights: Highlight[];
  onHighlightAdd?: (newHl: Omit<Highlight, 'id'>) => void;
  onHighlightDelete?: (id: string) => void;
  editable?: boolean;
  activeColor?: "red" | "yellow" | "blue" | "green" | "gray";
  activeType?: "box" | "underline" | "check" | "note";
  noteLabelText?: string; // 메모나 라벨에 들어갈 텍스트 기본값
}

export const PdfImageViewer: React.FC<PdfImageViewerProps> = ({
  imageUrl,
  highlights,
  onHighlightAdd,
  onHighlightDelete,
  editable = false,
  activeColor = "red",
  activeType = "box",
  noteLabelText = "동일 영역 매칭"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 돋보기 줌 레벨 상태
  const [zoom, setZoom] = useState(100);

  // 드래그 좌표 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // 픽셀 단위
  const [dragBox, setDragBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null); // 백분율 단위

  // 이미지 서버 경로 튜닝
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `http://localhost:5000${imageUrl}`;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 15, 50));
  const handleZoomReset = () => setZoom(100);

  // 마우스 클릭 시점 (드래그 시작)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || !onHighlightAdd || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: startX, y: startY });

    // 단일 클릭("check" 형태 등)일 경우 즉각 배치 가능하도록 준비
    if (activeType === 'check') {
      const clickXPercent = (startX / rect.width) * 100;
      const clickYPercent = (startY / rect.height) * 100;
      
      onHighlightAdd({
        type: 'check',
        color: 'green',
        x: Math.max(0, clickXPercent - 2.5), // 중심 정렬
        y: Math.max(0, clickYPercent - 2.5),
        width: 5,
        height: 5,
        label: noteLabelText
      });
      setIsDragging(false);
    }
  };

  // 마우스 드래그 중 (임시 사각형 렌더링)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !editable || !containerRef.current || activeType === 'check') return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // 절대 픽셀 좌표값 연산
    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const w = Math.abs(dragStart.x - currentX);
    const h = Math.abs(dragStart.y - currentY);

    // 반응형 매핑을 위해 컨테이너 기준 백분율(%)로 치환
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;
    const wPct = (w / rect.width) * 100;
    const hPct = (h / rect.height) * 100;

    setDragBox({ x: xPct, y: yPct, w: wPct, h: hPct });
  };

  // 마우스 드롭 (드래그 종료 및 저장)
  const handleMouseUp = () => {
    if (!isDragging || !editable || !onHighlightAdd || activeType === 'check') {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    if (dragBox && dragBox.w > 1 && dragBox.h > 1) {
      onHighlightAdd({
        type: activeType,
        color: activeColor,
        x: Math.round(dragBox.x * 100) / 100,
        y: Math.round(dragBox.y * 100) / 100,
        width: Math.round(dragBox.w * 100) / 100,
        height: Math.round(dragBox.h * 100) / 100,
        label: noteLabelText
      });
    }

    setDragBox(null);
  };

  // 마우스가 컨테이너 밖으로 벗어났을 때 드래그 조기 마감
  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
      
      {/* 상단 툴바 (돋보기, 리셋 등) */}
      <div className="w-full bg-white border-b border-slate-200 py-2 px-4 flex justify-between items-center text-slate-700">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500">
          <Move className="w-3.5 h-3.5" />
          <span>{editable ? '드래그하여 하이라이트 생성' : '실사 대조 시험지 뷰어'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-all"
            title="축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-black w-10 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-all"
            title="확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-all"
            title="기본 크기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 이미지 캔버스 본체 */}
      <div className="w-full overflow-auto max-h-[750px] flex justify-center p-4">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ width: `${zoom}%` }}
          className={`relative bg-white select-none transition-all duration-100 shadow-lg border border-slate-300 rounded ${
            editable ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* 실제 수능/교재 PDF 변환 PNG 이미지 */}
          <img
            ref={imageRef}
            src={fullImageUrl}
            alt="PDF 페이지 뷰어"
            className="w-full h-auto pointer-events-none display-block"
            draggable={false}
          />

          {/* 저장된 하이라이트 레이어 렌더링 */}
          <HighlightOverlay
            highlights={highlights}
            onDelete={onHighlightDelete}
            editable={editable}
          />

          {/* 현재 드래그 중인 영역 피드백 박스 */}
          {isDragging && dragBox && (
            <div
              style={{
                left: `${dragBox.x}%`,
                top: `${dragBox.y}%`,
                width: `${dragBox.w}%`,
                height: `${dragBox.h}%`,
              }}
              className={`absolute border-[3px] border-dashed rounded animate-pulse ${
                activeColor === 'red' ? 'border-red-500 bg-red-400/20' :
                activeColor === 'yellow' ? 'border-amber-400 bg-amber-200/20' :
                activeColor === 'blue' ? 'border-blue-500 bg-blue-400/20' :
                activeColor === 'green' ? 'border-emerald-500 bg-emerald-400/20' :
                'border-slate-500 bg-slate-400/20'
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
