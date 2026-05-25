import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { UploadBox } from '../components/UploadBox';
import { Cpu, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config';

export const ExamUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  
  // 메타데이터
  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState('2026-06-04');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMsg, setStepMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.'));
    setTitle(nameWithoutExt);
  };

  const handleAnalysisStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Step 1: 평가원 시험지 업로드
      setStepMsg('평가원 국어 시험지 PDF 업로드 및 이미지 변환 중...');
      setProgress(10);

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('title', title);
      formData.append('examDate', examDate);

      const uploadRes = await fetch(`${API_BASE_URL}/api/exam/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('평가원 시험지 업로드에 실패했습니다.');
      }

      const examData = await uploadRes.json();
      const examId = examData.id;

      // Step 2: 실시간 매칭 분석 구동
      setProgress(40);
      setStepMsg('AI 매칭 엔진 구동: 지문 OCR 및 문장 텍스트 추출 중...');
      
      // 조금 더 리얼한 분석 연출을 위해 setTimeout 활용
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProgress(60);
      setStepMsg('회사 콘텐츠 라이브러리 연계 대조: 유사 작품 및 제재 교차 검증 중...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProgress(85);
      setStepMsg('적중 등급(S-E) 분류 체계 판정 및 실사 1:1 이미지 하이라이트 레이어 병합 중...');

      const analyzeRes = await fetch(`${API_BASE_URL}/api/exam/${examId}/analyze`, {
        method: 'POST'
      });

      if (!analyzeRes.ok) {
        throw new Error('적중 분석 실행 중 오류가 발생했습니다.');
      }

      const reportData = await analyzeRes.json();
      setProgress(100);
      setStepMsg('분석 완료! 매칭 후보 관리자 검수 페이지로 진입합니다.');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 생성된 리포트의 검수 화면으로 즉각 이동!
      navigate(`/review/${reportData.id}`);

    } catch (error: any) {
      console.error('분석 에러:', error);
      alert(error.message || '분석 중 알 수 없는 에러가 발생했습니다.');
      setIsProcessing(false);
      setProgress(0);
      setStepMsg('');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        {/* 상단 타이틀 */}
        <div className="space-y-2 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center lg:justify-start space-x-2">
            <Cpu className="w-8 h-8 text-blue-600 animate-pulse" />
            <span>신규 평가원 적중 매칭 분석 실행</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 max-w-3xl leading-relaxed">
            평가원 모의평가 또는 본수능 국어 시험지 PDF를 업로드하여 분석을 시작합니다. 
            미리 적재해 둔 회사 콘텐츠 교재들의 지문·문항 데이터와 실시간 크로스 분석을 진행하여 
            최종 연계 리포트의 후보군(Mock MatchCase 8선)을 자동 수립합니다.
          </p>
        </div>

        {isProcessing ? (
          /* 분석 구동 중 극적인 인지용 로딩 UI */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center space-y-8 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-blue-50 bg-blue-50/20 border-t-blue-600 rounded-full animate-spin" />
              <Sparkles className="w-10 h-10 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
            </div>
            
            <div className="space-y-3 max-w-lg">
              <h3 className="text-lg font-black text-slate-800">국어 적중 매칭 시스템 정밀 연산 중</h3>
              <p className="text-xs font-semibold text-blue-600 animate-pulse">{stepMsg}</p>
            </div>

            {/* 프로그래스 바 */}
            <div className="w-full max-w-md space-y-1.5">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                <div
                  style={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300 rounded-full"
                />
              </div>
              <span className="text-[10px] font-black text-slate-400">{progress}% 완료</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-w-md">
              <p className="text-[10px] text-slate-400 leading-normal">
                주의: PDF 용량과 네트워크 환경에 따라 변환 및 매치 알고리즘 구동에 최대 30초가 소요될 수 있습니다. 
                현재 첫 3페이지의 문항 단위 고화질 실사 이미지 분리 렌더링을 안전하게 동시 수행 중입니다.
              </p>
            </div>
          </div>
        ) : (
          /* 입력 폼 */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50">
            <form onSubmit={handleAnalysisStart} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">시험 명칭 *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 2026학년도 6월 평가원 모의평가 국어"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">시행 연월일 *</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* PDF 파일 셀렉터 */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">평가원 시험지 PDF 업로드 *</label>
                <UploadBox
                  onFileSelect={handleFileSelect}
                  helperText="평가원 국어 시험지 PDF 파일을 업로드해 주세요."
                  fileName={file?.name}
                />
              </div>

              {/* 통보 문구 */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start space-x-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] leading-normal font-semibold">
                  <p className="font-extrabold text-amber-900 mb-0.5">분석 실행 전 필수 체크</p>
                  평가원 PDF 업로드 직후, 회사 교재 데이터베이스 중 최신 적재된 콘텐츠(대표교재)를 자동으로 매핑 분석 대상으로 선정합니다. 
                  대조군 다양성을 위해 분석을 기동하기 전 <strong>'회사 콘텐츠 등록'</strong> 메뉴를 통해 회사 모의고사나 주간지를 미리 최소 1개 이상 업로드하시는 것을 권장합니다.
                </div>
              </div>

              {/* 실행 단추 */}
              <button
                type="submit"
                disabled={!file}
                className={`w-full py-4.5 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  !file
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/50 hover:shadow-xl'
                }`}
              >
                <Play className="w-4.5 h-4.5 fill-current" />
                <span>적중 매칭 자동 분석 가동</span>
              </button>

            </form>
          </div>
        )}

      </div>
    </Layout>
  );
};
