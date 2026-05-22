import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { CompanyUploadPage } from './pages/CompanyUploadPage';
import { ExamUploadPage } from './pages/ExamUploadPage';
import { MatchingReviewPage } from './pages/MatchingReviewPage';
import { ReportPage } from './pages/ReportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/company-upload" element={<CompanyUploadPage />} />
        <Route path="/exam-upload" element={<ExamUploadPage />} />
        <Route path="/review/:reportId" element={<MatchingReviewPage />} />
        <Route path="/report/:reportId" element={<ReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
