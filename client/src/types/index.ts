export interface ContentFile {
  id: string;
  title: string;
  type: "mock_exam" | "ebs_variant" | "background" | "literature" | "weekly" | "solution" | "etc";
  area: "reading" | "literature" | "common" | "elective" | "etc";
  round?: string;
  publishMonth?: string;
  fileName: string;
  originalPdfPath: string;
  imagePaths: string[];
  createdAt: string;
}

export interface ExamFile {
  id: string;
  title: string;
  examDate: string;
  fileName: string;
  originalPdfPath: string;
  imagePaths: string[];
  createdAt: string;
}

export interface Highlight {
  id: string;
  type: "box" | "underline" | "check" | "note";
  color: "red" | "yellow" | "blue" | "green" | "gray";
  x: number;      // 0 ~ 100 백분율 (%) 기반 좌표
  y: number;      // 0 ~ 100 백분율 (%) 기반 좌표
  width: number;  // 백분율 (%) 기반 너비
  height: number; // 백분율 (%) 기반 높이
  label?: string;
}

export interface MatchCase {
  id: string;
  caseNo: number;
  title: string;
  examId: string;
  companyContentId: string;
  examLabel: string;
  companyLabel: string;
  examImageUrl: string;
  companyImageUrl: string;
  examQuestionNo?: string;
  companyQuestionNo?: string;
  grade: "S" | "A" | "B" | "C" | "D" | "E";
  score: number;
  similarity: number;
  hitType: string;
  hitTypeDescription: string;
  aiSummary: string;
  evidencePoints: string[];
  studentBenefit: string;
  caution: string;
  examHighlights: Highlight[];
  companyHighlights: Highlight[];
  approved: boolean;
}

export interface Report {
  id: string;
  title: string;
  examId: string;
  createdAt: string;
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
  cases: MatchCase[];
}
