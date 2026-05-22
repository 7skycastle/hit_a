import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { MatchSummaryCard } from '../components/MatchSummaryCard';
import { EvidenceCompareCard } from '../components/EvidenceCompareCard';
import type { Report } from '../types';
import { ArrowLeft, Edit3, ShieldAlert, Sparkles, Printer } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        // 소비자(학생, 학부모 등) 기준이므로 기본 role은 user
        const res = await fetch(`http://localhost:5000/api/reports/${reportId}?role=user`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          alert('리포트를 불러오는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('리포트 로드 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">적중 분석 실사 리포트를 인쇄 가능한 고해상도로 렌더링 중입니다...</p>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-sm font-bold text-slate-400">지정된 적중 리포트를 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto printing-container">
        
        {/* 상단 탐색/액션 바 (인쇄 시 숨김 처리 권장) */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 gap-4 no-print">
          <Link
            to="/"
            className="flex items-center space-x-1.5 text-xs font-black text-slate-500 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대시보드로 돌아가기</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              to={`/review/${report.id}`}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>검수/편집실 가기</span>
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>PDF 보고서 인쇄</span>
            </button>
          </div>
        </div>

        {/* 1. 소개 헤더 */}
        <div className="space-y-3 text-center pt-2">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Premium Korean Hit Analysis Report</span>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            동일 지문·문항 구조·선지 판단 논리 정밀 대조 리포트
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-3xl mx-auto leading-relaxed">
            이 리포트는 단순 키워드 일치가 아니라, 실제 시험장에서 학생이 체감할 수 있는 
            작품·제재·핵심 개념·문항 구조·선지 판단 기준의 연결성을 1:1 실사 대조하여 과학적으로 분석한 자료입니다.
          </p>
        </div>

        {/* 2. 대시보드 요약 카드 보드 (종합 연계 체감도 & 등급 분포) */}
        <MatchSummaryCard
          totalScore={report.totalScore}
          totalCases={report.totalCases}
          gradeCounts={report.gradeCounts}
          examTitle={report.title}
        />

        {/* 3. 승인된 적중 케이스 리스트 렌더링 (세로 배열) */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 no-print">
            <h2 className="text-base font-black text-slate-800 flex items-center space-x-2">
              <span>적중 실사 대조 증명 리스트</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-black border border-emerald-200">
                승인 완료 {report.cases.length}건
              </span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              미승인 케이스는 최종 공개 보고서에서 자동 필터링 차단됩니다.
            </span>
          </div>

          {report.cases.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <p className="text-base font-bold text-slate-700">리포트에 공개 승인된 적중 케이스가 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">
                  관리자 검수실에서 매칭 케이스의 노출 설정을 <strong>'최종 승인'</strong>으로 토글하신 후 영구 저장을 클릭해 주세요.
                </p>
              </div>
              <Link
                to={`/review/${report.id}`}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 transition-all inline-block"
              >
                검수/편집실로 이동
              </Link>
            </div>
          ) : (
            report.cases.map((matchCase) => (
              <EvidenceCompareCard key={matchCase.id} matchCase={matchCase} />
            ))
          )}
        </div>

        {/* 하단 브랜드 신뢰 보장 배너 */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-1.5 max-w-2xl text-center sm:text-left">
            <h3 className="text-sm font-black text-white">국어 콘텐츠 적중 맵 신뢰성 다짐</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              저희 교육 콘텐츠 연구소는 오답률 1위부터 5위까지의 초고난도 보기 문항, 선지의 꼬아낸 구조를 미리 파악하게 함으로써 
              시험장에서 학생들이 낯섦 없이 5분 이상 빠르게 돌파하도록 돕는 정밀한 국어 학습 생태계를 만들어 갑니다.
            </p>
          </div>
          <div className="flex-shrink-0 bg-blue-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20">
            신뢰와 팩트 중심
          </div>
        </div>

      </div>
    </Layout>
  );
};
