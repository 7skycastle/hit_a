import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Layers, FileText, Calendar, Plus, Award, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

export const DashboardPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [examCount, setExamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 대시보드 스탯 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. 리포트 리스트 조회
        const reportsRes = await fetch(`${API_BASE_URL}/api/reports`);
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        }

        // 2. 회사 콘텐츠 개수 조회
        const companyRes = await fetch(`${API_BASE_URL}/api/company`);
        if (companyRes.ok) {
          const companyData = await companyRes.json();
          setCompanyCount(companyData.length);
        }

        // 3. 평가원 시험지 개수 조회
        const examRes = await fetch(`${API_BASE_URL}/api/exam`);
        if (examRes.ok) {
          const examData = await examRes.json();
          setExamCount(examData.length);
        }

      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {/* 상단 웰컴 배너 */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="bg-blue-600/30 text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
              국어 분석 플랫폼
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              국어 콘텐츠 적중 맵 <span className="text-blue-400">내부 통제 대시보드</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              평가원 국어 PDF와 회사 콘텐츠 PDF를 비교하여, 실제 지문·문항·선지 단위의 연계 체감도를 과학적으로 계량 분석합니다.
              단순 키워드 매칭을 탈피하여 실사 대조 증명 리포트를 출력합니다.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/exam-upload"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>새 평가원 PDF 분석 실행</span>
              </Link>
              <Link
                to="/company-upload"
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold border border-white/10 backdrop-blur-md transition-all flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>회사 콘텐츠 등록</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3대 정밀 지표 스탯 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md shadow-slate-100 flex items-center space-x-4">
            <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">등록된 회사 교재 수</p>
              <p className="text-2xl font-black text-slate-800">{companyCount}개</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md shadow-slate-100 flex items-center space-x-4">
            <div className="bg-purple-50 text-purple-600 p-3.5 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">업로드된 평가원 시험지</p>
              <p className="text-2xl font-black text-slate-800">{examCount}개</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md shadow-slate-100 flex items-center space-x-4">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">생성된 분석 리포트 수</p>
              <p className="text-2xl font-black text-slate-800">{reports.length}개</p>
            </div>
          </div>
        </div>

        {/* 최근 분석 리포트 목록 */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <span>최근 생성된 적중 리포트 목록</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">LATEST</span>
          </h2>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-500">리포트 목록을 정밀 조회 중입니다...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4 flex flex-col items-center justify-center">
              <Calendar className="w-12 h-12 text-slate-300" />
              <div>
                <p className="text-base font-bold text-slate-700">생성된 적중 분석 리포트가 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">상단에서 평가원 PDF를 업로드하여 첫 번째 분석을 실행해 보세요!</p>
              </div>
              <Link
                to="/exam-upload"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 transition-all"
              >
                분석 실행하러 가기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md shadow-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>REPORT GENERATED</span>
                      <span>{new Date(report.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-800 leading-tight">
                        {report.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        종합 연계 체감도: <span className="text-blue-600 font-extrabold">{report.totalScore}점</span>
                      </p>
                    </div>
                    
                    {/* 등급 요약 건수 */}
                    <div className="flex items-center space-x-1.5 pt-1">
                      {Object.entries(report.gradeCounts).map(([grade, count]) => (
                        <div key={grade} className="flex items-center space-x-0.5 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded text-[10px] font-black">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            grade === 'S' ? 'bg-red-600' :
                            grade === 'A' ? 'bg-orange-500' :
                            grade === 'B' ? 'bg-purple-600' :
                            grade === 'C' ? 'bg-blue-600' :
                            grade === 'D' ? 'bg-emerald-600' :
                            'bg-slate-400'
                          }`} />
                          <span className="text-slate-500">{grade}: {count as number}건</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 관리용 바로가기 링크 */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <Link
                      to={`/review/${report.id}`}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1"
                    >
                      <span>관리자 검수/편집</span>
                    </Link>
                    <Link
                      to={`/report/${report.id}`}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all text-center flex items-center justify-center space-x-1"
                    >
                      <span>최종 리포트 보기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
