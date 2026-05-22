import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PdfImageViewer } from '../components/PdfImageViewer';
import { ScoreBadge } from '../components/ScoreBadge';
import { Report, MatchCase, Highlight } from '../types';
import { Save, Check, RefreshCw, Eye, EyeOff, LayoutGrid, CheckCircle2, ChevronRight, Type, Palette } from 'lucide-react';

export const MatchingReviewPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [cases, setCases] = useState<MatchCase[]>([]);
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // 하이라이트 편집 팔레트 툴 상태
  const [hlType, setHlType] = useState<'box' | 'underline' | 'check' | 'note'>('box');
  const [hlColor, setHlColor] = useState<'red' | 'yellow' | 'blue' | 'green' | 'gray'>('red');
  const [hlLabelText, setHlLabelText] = useState('핵심 개념 일치');

  // 저장 성공 메시지
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 리포트 상세 로드 (관리자 모드로 전체 케이스 로드)
  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/reports/${reportId}?role=admin`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setCases(data.cases || []);
      } else {
        alert('리포트를 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('리포트 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const activeCase = cases[activeCaseIdx];

  // 특정 매칭 케이스의 메타데이터 업데이트 (로컬 상태 반영)
  const updateActiveCaseLocal = (updates: Partial<MatchCase>) => {
    setCases(prev => {
      const newList = [...prev];
      newList[activeCaseIdx] = {
        ...newList[activeCaseIdx],
        ...updates
      };
      return newList;
    });
  };

  // 평가원 이미지에 하이라이트 드래그 추가 핸들러
  const handleExamHighlightAdd = (newHl: Omit<Highlight, 'id'>) => {
    if (!activeCase) return;
    const highlightWithId: Highlight = {
      ...newHl,
      id: `eh-${Date.now()}`
    };
    updateActiveCaseLocal({
      examHighlights: [...activeCase.examHighlights, highlightWithId]
    });
  };

  // 평가원 하이라이트 삭제 핸들러
  const handleExamHighlightDelete = (id: string) => {
    if (!activeCase) return;
    updateActiveCaseLocal({
      examHighlights: activeCase.examHighlights.filter(h => h.id !== id)
    });
  };

  // 회사 콘텐츠 이미지에 하이라이트 드래그 추가 핸들러
  const handleCompanyHighlightAdd = (newHl: Omit<Highlight, 'id'>) => {
    if (!activeCase) return;
    const highlightWithId: Highlight = {
      ...newHl,
      id: `ch-${Date.now()}`
    };
    updateActiveCaseLocal({
      companyHighlights: [...activeCase.companyHighlights, highlightWithId]
    });
  };

  // 회사 하이라이트 삭제 핸들러
  const handleCompanyHighlightDelete = (id: string) => {
    if (!activeCase) return;
    updateActiveCaseLocal({
      companyHighlights: activeCase.companyHighlights.filter(h => h.id !== id)
    });
  };

  // 백엔드 영구 보존 API 호출
  const handleSaveActiveCase = async () => {
    if (!activeCase) return;

    try {
      setSuccessMsg(null);
      const res = await fetch(`http://localhost:5000/api/matches/${activeCase.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grade: activeCase.grade,
          approved: activeCase.approved,
          aiSummary: activeCase.aiSummary,
          studentBenefit: activeCase.studentBenefit,
          title: activeCase.title,
          examHighlights: activeCase.examHighlights,
          companyHighlights: activeCase.companyHighlights
        })
      });

      if (res.ok) {
        setSuccessMsg('현재 매칭 케이스의 수정사항(하이라이트 좌표, 등급, 승인여부)이 디바이스 JSON DB에 최종 저장되었습니다.');
        setTimeout(() => setSuccessMsg(null), 3000);
        
        // 스코어 재연산을 위해 리포트 정보 다시 불러오기
        const reportsRes = await fetch(`http://localhost:5000/api/reports/${reportId}?role=admin`);
        if (reportsRes.ok) {
          const updatedReport = await reportsRes.json();
          setReport(updatedReport);
        }
      } else {
        alert('저장 도중 서버 에러가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 에러:', error);
      alert('서버와 연동되지 못했습니다.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">관리자 검수 맵 데이터를 준비 중입니다...</p>
        </div>
      </Layout>
    );
  }

  if (!report || !activeCase) {
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
      <div className="space-y-6 animate-fadeIn">
        
        {/* 상단 액션 바 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">ADMIN REVIEW CONTROL</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {report.title} 검수/편집실
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/report/${report.id}`}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center space-x-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>최종 리포트 실사 확인</span>
            </Link>
          </div>
        </div>

        {/* 8개 분석 케이스 탭 (세로배치/좌측리스트 형태) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          
          {/* 좌측: 8개 케이스 전환 네비게이터 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl shadow-slate-100/50 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-xs font-black text-slate-800 flex items-center space-x-1">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span>매칭 분석 케이스 (8선)</span>
              </h2>
            </div>
            
            <div className="space-y-2.5 max-h-[550px] overflow-auto">
              {cases.map((c, idx) => {
                const isActive = idx === activeCaseIdx;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSuccessMsg(null);
                      setActiveCaseIdx(idx);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between space-x-2 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <p className="text-[10px] font-black text-slate-400">CASE {String(c.caseNo).padStart(2, '0')}</p>
                      <p className="text-xs font-bold text-slate-800 truncate tracking-tight">{c.title.replace(/CASE \d+\.\s*/, '')}</p>
                      <div className="flex items-center space-x-1 text-[9px] font-bold text-slate-400">
                        <span>유사도 {c.similarity}%</span>
                        <span>•</span>
                        <span className={c.approved ? 'text-emerald-600' : 'text-orange-500'}>
                          {c.approved ? '최종 승인' : '검수 대기'}
                        </span>
                      </div>
                    </div>
                    <ScoreBadge grade={c.grade} showLabel={false} size="sm" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 우측: 1:1 드래그 캔버스 및 메타데이터 수정 패널 (화면 비중 75%) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* 1. 하이라이트 브러시 설정 툴바 */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-2.5">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">Highlight Tool Brush</h3>
                  <p className="text-[10px] text-slate-400">이미지 위를 마우스로 드래그하면 아래 설정한 하이라이트가 자동 삽입됩니다.</p>
                </div>
              </div>

              {/* 브러시 세팅 폼 */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* 하이라이트 종류 */}
                <select
                  value={hlType}
                  onChange={(e: any) => setHlType(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="box">형광펜 박스</option>
                  <option value="underline">형광펜 밑줄</option>
                  <option value="check">체크 포인트</option>
                  <option value="note">참고 메모 박스</option>
                </select>

                {/* 하이라이트 색상 */}
                <select
                  value={hlColor}
                  onChange={(e: any) => setHlColor(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="red">빨간색 (직접적중)</option>
                  <option value="yellow">노란색 (개념일치)</option>
                  <option value="blue">파란색 (구조유사)</option>
                  <option value="green">초록색 (선지유사)</option>
                  <option value="gray">회색 (배경소재)</option>
                </select>

                {/* 하이라이트 라벨 텍스트 */}
                <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 flex-grow sm:flex-grow-0">
                  <Type className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={hlLabelText}
                    onChange={(e) => setHlLabelText(e.target.value)}
                    placeholder="하이라이트 라벨 문구"
                    className="bg-transparent text-xs font-bold text-white focus:outline-none placeholder-slate-500 w-32"
                  />
                </div>
              </div>
            </div>

            {/* 2. 1:1 이미지 비교 편집 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 평가원 시험지 */}
              <div className="space-y-2">
                <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-700 flex justify-between">
                  <span>[평가원 지문/문항 드래그 영역]</span>
                  <span className="text-[10px] text-red-600 font-extrabold">EDITABLE</span>
                </div>
                <PdfImageViewer
                  imageUrl={activeCase.examImageUrl}
                  highlights={activeCase.examHighlights}
                  onHighlightAdd={handleExamHighlightAdd}
                  onHighlightDelete={handleExamHighlightDelete}
                  editable={true}
                  activeColor={hlColor}
                  activeType={hlType}
                  noteLabelText={hlLabelText}
                />
              </div>

              {/* 오른쪽: 회사 교재 */}
              <div className="space-y-2">
                <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-700 flex justify-between">
                  <span>[회사 콘텐츠 드래그 영역]</span>
                  <span className="text-[10px] text-blue-600 font-extrabold">EDITABLE</span>
                </div>
                <PdfImageViewer
                  imageUrl={activeCase.companyImageUrl}
                  highlights={activeCase.companyHighlights}
                  onHighlightAdd={handleCompanyHighlightAdd}
                  onHighlightDelete={handleCompanyHighlightDelete}
                  editable={true}
                  activeColor={hlColor}
                  activeType={hlType}
                  noteLabelText={hlLabelText}
                />
              </div>
            </div>

            {/* 3. 비즈니스 세부 정보 수정 패널 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 space-y-6">
              <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-1.5">
                <span>적중 상세 텍스트 및 등급 검수</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* 1. 등급 판정 및 노출 여부 토글 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 block">적중 판정 등급 *</label>
                    <select
                      value={activeCase.grade}
                      onChange={(e: any) => updateActiveCaseLocal({ grade: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="S">S등급 - 실전 체감 적중</option>
                      <option value="A">A등급 - 시간 단축 적중</option>
                      <option value="B">B등급 - 확장 연계 적중</option>
                      <option value="C">C등급 - 문항 구조 적중</option>
                      <option value="D">D등급 - 선지 판단 적중</option>
                      <option value="E">E등급 - 소재권 유사</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 block">공개 리포트 노출 여부 *</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateActiveCaseLocal({ approved: !activeCase.approved })}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black border transition-all flex items-center justify-center space-x-1.5 ${
                          activeCase.approved
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-sm shadow-emerald-100'
                            : 'bg-orange-50 border-orange-300 text-orange-700 font-extrabold shadow-sm shadow-orange-100'
                        }`}
                      >
                        {activeCase.approved ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>최종 승인 (공개 노출)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>검수 보류 (노출 차단)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. 적중 요약 해설 입력 */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 block">AI 적중 연계 상세 해설 *</label>
                  <textarea
                    required
                    rows={4}
                    value={activeCase.aiSummary}
                    onChange={(e) => updateActiveCaseLocal({ aiSummary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                    placeholder="평가원 지문과 회사 교재의 세부 연계 사항을 2~3줄로 설명해 주세요."
                  />
                </div>
              </div>

              {/* 3. 학생 현장 체감 효과 입력 */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-xs font-black text-slate-700 block">현장 수험생 체감 학습 효과 설명 *</label>
                <textarea
                  required
                  rows={2}
                  value={activeCase.studentBenefit}
                  onChange={(e) => updateActiveCaseLocal({ studentBenefit: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                  placeholder="이 콘텐츠를 사전에 학습한 학생이 시험장에서 실제로 어떤 극적인 학습 효과(독해 속도 3분 단축 등)를 누렸을지 짚어주세요."
                />
              </div>

              {/* 저장 알림 배너 */}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-2.5 text-xs font-black text-emerald-800 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 최종 저장 단추 */}
              <div className="border-t border-slate-100 pt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveActiveCase}
                  className="px-6 py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>현재 적중 CASE 편집사항 영구 적용</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
};
