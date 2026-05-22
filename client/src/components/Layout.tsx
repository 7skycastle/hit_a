import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileUp, Cpu, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '대시보드', icon: LayoutDashboard },
    { path: '/company-upload', label: '회사 콘텐츠 등록', icon: FileUp },
    { path: '/exam-upload', label: '평가원 분석 실행', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 글로벌 상단 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <Link to="/" className="text-xl font-extrabold text-slate-900 tracking-tight">
                국어 콘텐츠 <span className="text-blue-600">적중 맵</span>
              </Link>
              <span className="hidden sm:inline bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-semibold border border-slate-200">
                PROTOTYPE v1.2
              </span>
            </div>
            
            <nav className="flex space-x-1 items-center">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                                 (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 글로벌 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-600">수능 국어 콘텐츠 적중 분석 시스템 (국어 콘텐츠 적중 맵)</p>
          <p>© 2026 Korean Hit Map Corp. All rights reserved.</p>
          <p className="text-[10px] text-slate-400 max-w-2xl mx-auto italic">
            본 서비스는 내부 분석 및 소비자 브리핑용 프로토타입이며, 실제 수능 문항 유출을 주장하지 않습니다.
            학생이 현장에서 느끼는 연계 체감도 및 배경 학습 성과를 계량화하여 보여주는 솔루션입니다.
          </p>
        </div>
      </footer>
    </div>
  );
};
