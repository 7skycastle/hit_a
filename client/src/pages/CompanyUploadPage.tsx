import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { UploadBox } from '../components/UploadBox';
import { FileText, Save, CheckCircle, ListPlus, Loader2 } from 'lucide-react';
import type { ContentFile } from '../types';
import { API_BASE_URL } from '../config';

export const CompanyUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  
  // 메타데이터 상태
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'mock_exam' | 'ebs_variant' | 'background' | 'literature' | 'weekly' | 'solution' | 'etc'>('mock_exam');
  const [area, setArea] = useState<'reading' | 'literature' | 'common' | 'elective' | 'etc'>('common');
  const [round, setRound] = useState('');
  const [publishMonth, setPublishMonth] = useState('5월');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [registeredContents, setRegisteredContents] = useState<ContentFile[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 등록된 회사 콘텐츠 로드
  const fetchContents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/company`);
      if (res.ok) {
        const data = await res.json();
        setRegisteredContents(data);
      }
    } catch (error) {
      console.error('콘텐츠 로드 에러:', error);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // 파일명에서 기본 타이틀 자동 유추하여 UX 향상!
    const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.'));
    setTitle(nameWithoutExt);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('title', title);
      formData.append('type', type);
      formData.append('area', area);
      formData.append('round', round);
      formData.append('publishMonth', publishMonth);

      setUploadProgress(45);

      const res = await fetch(`${API_BASE_URL}/api/company/upload`, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(85);

      if (res.ok) {
        setUploadProgress(100);
        setSuccessMsg('회사 콘텐츠가 정상 등록되었으며, PDF 실사 PNG 변환 처리가 완료되었습니다.');
        setFile(null);
        setTitle('');
        setRound('');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => setSuccessMsg(null), 4000);
        
        // 목록 리프레시
        await fetchContents();
      } else {
        const err = await res.json();
        alert(`업로드 실패: ${err.error || '알 수 없는 서버 오류'}`);
      }
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('서버와의 네트워크 에러가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {/* 상단 소개 정보 */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span>회사 제작 국어 콘텐츠 등록</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 max-w-3xl leading-relaxed">
            회사가 출간한 실전 모의고사, 주간지, EBS 변형 교재, 배경지식 해설 등의 PDF를 등록합니다. 
            등록된 PDF는 자동으로 첫 3페이지가 PNG 실사로 렌더링되며, 이후 평가원 시험지와 1:1 대조 매칭 분석의 대조군으로 즉시 투입됩니다.
          </p>
        </div>

        {/* 메인 업로드 폼 + 우측 리스트업 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 왼쪽: 등록 폼 */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 space-y-6">
            <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <ListPlus className="w-5 h-5 text-blue-600" />
              <span>신규 교재/모의고사 메타데이터 입력</span>
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              
              {/* 1. PDF 업로드 박스 */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">교재 원본 PDF 파일 업로드 *</label>
                <UploadBox
                  onFileSelect={handleFileSelect}
                  helperText="회사 콘텐츠 PDF 문서를 업로드해 주세요."
                  fileName={file?.name}
                />
              </div>

              {/* 2. 메타데이터 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">콘텐츠명 *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 2026 국어 파이널 실전 모의고사 1회"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">콘텐츠 유형 *</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="mock_exam">실전 모의고사</option>
                    <option value="ebs_variant">EBS 변형 콘텐츠</option>
                    <option value="background">독서 배경지식</option>
                    <option value="literature">문학 작품 정리</option>
                    <option value="weekly">주간지</option>
                    <option value="solution">해설지</option>
                    <option value="etc">기타</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 block">분석 영역 구분 *</label>
                  <select
                    value={area}
                    onChange={(e: any) => setArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="common">공통 영역</option>
                    <option value="reading">독서</option>
                    <option value="literature">문학</option>
                    <option value="elective">선택 과목 (화작/언매)</option>
                    <option value="etc">기타</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 block">회차 정보</label>
                    <input
                      type="text"
                      value={round}
                      onChange={(e) => setRound(e.target.value)}
                      placeholder="예: 1회"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 block">발행월</label>
                    <select
                      value={publishMonth}
                      onChange={(e) => setPublishMonth(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      {['3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '파이널'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 업로드 로딩 바 */}
              {isUploading && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="flex items-center space-x-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>PDF 실사 변환 분석 렌더링 중...</span>
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* 등록 완료 메시지 */}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-2.5 text-xs font-black text-emerald-800 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 저장 단추 */}
              <div className="border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className={`w-full py-4 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-2 ${
                    !file || isUploading
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/50 hover:shadow-xl'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>회사 국어 콘텐츠 정보 영구 보관</span>
                </button>
              </div>
            </form>
          </div>

          {/* 오른쪽: 기등록 교재 리스트업 (화면 비중 33%) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100/50 space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-800">등록된 회사 콘텐츠 목록</h2>
              <p className="text-[11px] font-semibold text-slate-400">현재 대조군으로 적재된 교재 목록입니다.</p>
            </div>
            
            <div className="space-y-3.5 max-h-[500px] overflow-auto pr-1">
              {registeredContents.length === 0 ? (
                <p className="text-xs font-semibold text-slate-400 text-center py-10">등록된 콘텐츠가 없습니다.</p>
              ) : (
                registeredContents.map((content) => (
                  <div
                    key={content.id}
                    className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 transition-all flex items-start space-x-3.5 group"
                  >
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-blue-600 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-black text-slate-800 truncate tracking-tight">
                        {content.title}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400">
                        <span className="bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {content.type === 'mock_exam' ? '모의고사' :
                           content.type === 'ebs_variant' ? 'EBS변형' :
                           content.type === 'background' ? '배경지식' :
                           content.type === 'literature' ? '문학정리' : '기타'}
                        </span>
                        <span>{content.round || content.publishMonth}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};
