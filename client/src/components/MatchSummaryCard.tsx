import React from 'react';
import { Award, Layers, Target, Compass } from 'lucide-react';

interface MatchSummaryCardProps {
  totalScore: number;
  totalCases: number;
  gradeCounts: {
    S: number;
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  examTitle: string;
}

export const MatchSummaryCard: React.FC<MatchSummaryCardProps> = ({
  totalScore,
  totalCases,
  gradeCounts,
  examTitle
}) => {
  // 등급별 전용 컬러 세트
  const gradeColors: Record<string, string> = {
    S: "bg-red-600",
    A: "bg-orange-500",
    B: "bg-purple-600",
    C: "bg-blue-600",
    D: "bg-emerald-600",
    E: "bg-slate-400"
  };

  const gradeLabels: Record<string, string> = {
    S: "S 실전 체감",
    A: "A 시간 단축",
    B: "B 확장 연계",
    C: "C 문항 구조",
    D: "D 선지 판단",
    E: "E 소재 유사"
  };

  const getScoreStatus = (score: number) => {
    if (score >= 85) return { label: '압도적 연계 체감', color: 'text-red-600' };
    if (score >= 70) return { label: '매우 우수한 실질 연계', color: 'text-purple-600' };
    if (score >= 50) return { label: '학습 성과 우수', color: 'text-blue-600' };
    return { label: '배경지식 연계 수준', color: 'text-slate-600' };
  };

  const status = getScoreStatus(totalScore);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 w-full space-y-8">
      {/* 리포트 탑 메타 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-6 gap-4">
        <div>
          <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            PREMIUM ANALYSIS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-2 tracking-tight">
            {examTitle} 적중 실황 분석표
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>분석 고도화 등급 분류 체계 적용</span>
        </div>
      </div>

      {/* 3대 지표 위젯 격자 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. 종합 연계 체감도 (가중 평균) */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex items-center space-x-5 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-all duration-300">
            <Award className="w-32 h-32 text-blue-600" />
          </div>
          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200/50">
            <Award className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">종합 연계 체감도</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{totalScore}</span>
              <span className="text-sm font-bold text-slate-500">/ 100</span>
            </div>
            <p className={`text-[11px] font-black tracking-tight ${status.color}`}>
              {status.label}
            </p>
          </div>
        </div>

        {/* 2. 총 적중 케이스 검증 건수 */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex items-center space-x-5 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-all duration-300">
            <Target className="w-32 h-32 text-red-600" />
          </div>
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg shadow-red-200/50">
            <Target className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">실사 검증 케이스</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{totalCases}</span>
              <span className="text-sm font-bold text-slate-500">건 성공</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              평가원 문항 대조 승인 완료
            </p>
          </div>
        </div>

        {/* 3. 리포트 신뢰성 등급 체계 */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex items-center space-x-5 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-all duration-300">
            <Layers className="w-32 h-32 text-purple-600" />
          </div>
          <div className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-200/50">
            <Layers className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">체감도 등급 비율</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {Math.round(((gradeCounts.S + gradeCounts.A) / (totalCases || 1)) * 100)}%
              </span>
            </div>
            <p className="text-[11px] font-black text-purple-700">
              S/A 최상위 적중 점유율
            </p>
          </div>
        </div>
      </div>

      {/* 등급별 분포 그래프 바 */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-700 tracking-tight">
          <span>등급별 적중 건수 분포</span>
          <span className="text-slate-400">가중치 적용 비율</span>
        </div>
        
        {/* 등급 바 그래프 */}
        <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden shadow-inner border border-slate-200">
          {Object.entries(gradeCounts).map(([grade, count]) => {
            if (count === 0) return null;
            const pct = (count / totalCases) * 100;
            return (
              <div
                key={grade}
                style={{ width: `${pct}%` }}
                className={`${gradeColors[grade] || 'bg-slate-400'} h-full transition-all duration-500 hover:opacity-90 relative group`}
                title={`${grade}등급: ${count}건 (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* 등급 지표 범례 */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          {Object.entries(gradeCounts).map(([grade, count]) => (
            <div key={grade} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1">
              <div className="flex items-center space-x-1">
                <span className={`w-2.5 h-2.5 rounded-full ${gradeColors[grade] || 'bg-slate-400'}`} />
                <span className="text-[11px] font-extrabold text-slate-700">{gradeLabels[grade]}</span>
              </div>
              <span className="text-xs font-black text-slate-900">{count}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
