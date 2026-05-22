import React from 'react';
import type { MatchCase } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { PdfImageViewer } from './PdfImageViewer';
import { Sparkles, ArrowRightLeft, ShieldCheck, HelpCircle } from 'lucide-react';

interface EvidenceCompareCardProps {
  matchCase: MatchCase;
}

export const EvidenceCompareCard: React.FC<EvidenceCompareCardProps> = ({ matchCase }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 w-full space-y-6">
      
      {/* 상단 타이틀 영역 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-blue-600 tracking-wider uppercase">
              CASE {String(matchCase.caseNo).padStart(2, '0')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-slate-500">{matchCase.hitType}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {matchCase.title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <ScoreBadge grade={matchCase.grade} size="lg" />
          <div className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-1 rounded-lg border border-blue-100">
            유사도 {matchCase.similarity}%
          </div>
        </div>
      </div>

      {/* 중요: 좌우 비교 영역 (화면 비중 60% 이상) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-black text-slate-500 px-1.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>6월 평가원 국어 지문·문항 {matchCase.examQuestionNo ? `(${matchCase.examQuestionNo})` : ''}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
            <span>실사 대조 분석 레이어</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span>회사 제작 국어 콘텐츠 {matchCase.companyQuestionNo ? `(${matchCase.companyQuestionNo})` : ''}</span>
          </div>
        </div>

        {/* 좌우 이미지 뷰어 배치 (데스크톱 최적화 1:1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* 1. 평가원 시험지 */}
          <div className="space-y-2">
            <div className="bg-slate-100/80 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200/50 flex justify-between">
              <span>[수능 시험지] {matchCase.examLabel}</span>
              <span className="text-[10px] text-slate-400">PDF PAGE 1</span>
            </div>
            <PdfImageViewer
              imageUrl={matchCase.examImageUrl}
              highlights={matchCase.examHighlights}
              editable={false}
            />
          </div>

          {/* 2. 회사 자체 모의고사/교재 */}
          <div className="space-y-2">
            <div className="bg-slate-100/80 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200/50 flex justify-between">
              <span>[자체 콘텐츠] {matchCase.companyLabel}</span>
              <span className="text-[10px] text-slate-400">PDF PAGE 1</span>
            </div>
            <PdfImageViewer
              imageUrl={matchCase.companyImageUrl}
              highlights={matchCase.companyHighlights}
              editable={false}
            />
          </div>
        </div>
      </div>

      {/* 하단 분석 텍스트 블록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        
        {/* 왼쪽: AI 적중 요약 및 증명 근거 */}
        <div className="space-y-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center space-x-1.5 text-blue-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">AI 정밀 비교 요약</span>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              “{matchCase.aiSummary}”
            </p>
          </div>

          {/* 세부 매칭 포인트 */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-800 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>실사 팩트 대조 증명</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              {matchCase.evidencePoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-extrabold mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 오른쪽: 극적인 학생 체감 효과 및 주의 사항 */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-emerald-700">
              <Sparkles className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider">현장 수험생 체감 학습 효과</span>
            </div>
            <p className="text-sm font-extrabold text-slate-800 leading-relaxed">
              {matchCase.studentBenefit}
            </p>
          </div>

          {/* 주의사항 */}
          <div className="space-y-1 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-center space-x-1 text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">리포트 투명성 선언</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              {matchCase.caution}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
