import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from '../services/dbService';
import { PdfService } from '../services/pdfService';
import { MatchingService } from '../services/matchingService';
import { ExamFile, Report, MatchCase } from '../types';

const router = Router();

// Multer 파일 저장소 설정 (uploads/exam 디렉토리 타겟팅)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../../uploads/exam');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}_${uuidv4().substring(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF 파일만 업로드할 수 있습니다.'));
    }
  }
});

/**
 * @route   POST /api/exam/upload
 * @desc    6월 평가원 국어 시험지 PDF 업로드, 실시간 PNG 이미지 렌더링
 */
router.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '업로드할 PDF 파일이 존재하지 않습니다.' });
    }

    const { title, examDate } = req.body;

    if (!title || !examDate) {
      return res.status(400).json({ error: '필수 메타데이터(시험명, 시행일)가 누락되었습니다.' });
    }

    // PDF 페이지의 PNG 이미지 실시간 렌더링 파이프라인 가동 (최대 3페이지)
    const originalPdfPath = path.relative(path.join(__dirname, '../../'), file.path);
    const imagePaths = await PdfService.renderPdfToImages(file.path, 'exam');

    const newExam: ExamFile = {
      id: `exam-${uuidv4().substring(0, 8)}`,
      title,
      examDate,
      fileName: file.filename,
      originalPdfPath,
      imagePaths,
      createdAt: new Date().toISOString()
    };

    // 로컬 JSON DB에 영구 기록
    DbService.saveExamContent(newExam);

    return res.status(201).json(newExam);
  } catch (error: any) {
    console.error('Exam paper upload error:', error);
    return res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/exam
 * @desc    등록된 평가원 시험지 리스트 조회
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const list = DbService.getExamContents();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: '시험지 리스트를 불러오지 못했습니다.' });
  }
});

/**
 * @route   POST /api/exam/:examId/analyze
 * @desc    등록된 평가원 시험지와 회사 콘텐츠 간 적중 분석 실행 (Mock 분석 로직 구동)
 */
router.post('/:examId/analyze', async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    // 1. 해당 평가원 시험지 존재 유무 검증
    const exams = DbService.getExamContents();
    const targetExam = exams.find(e => e.id === examId);
    if (!targetExam) {
      return res.status(404).json({ error: '지정된 평가원 시험지를 찾을 수 없습니다.' });
    }

    // 2. 회사 콘텐츠 중 대표 1개를 매칭 타겟으로 삼음 (없으면 기본 mock_exam 매칭)
    const companyList = DbService.getCompanyContents();
    const targetCompanyId = companyList.length > 0 ? companyList[0].id : 'company-final-1';
    const targetCompanyTitle = companyList.length > 0 ? companyList[0].title : '2026 국어 파이널 실전 모의고사 1회';

    // 3. 매칭 엔진 가동하여 8개 실사 케이스 배열 생성
    const mockCases = MatchingService.generateMockMatches(examId, targetCompanyId);

    // 만약 실제 렌더링된 PNG 파일 경로가 존재한다면, 케이스 이미지 URL을 해당 파일 경로로 동적 바인딩합니다. (디테일 극대화!)
    // 2차 개발 요구사항: "리포트의 좌우 비교 이미지에 실제 변환 이미지를 사용하라"
    const finalCases = mockCases.map(c => {
      // 평가원 페이지 매핑 (케이스별로 적절한 페이지 할당)
      let examImg = c.examImageUrl;
      if (targetExam.imagePaths && targetExam.imagePaths.length > 0) {
        if (c.caseNo === 1 || c.caseNo === 4 || c.caseNo === 7) examImg = targetExam.imagePaths[0];
        else if (c.caseNo === 2 || c.caseNo === 5 || c.caseNo === 8) examImg = targetExam.imagePaths[1];
        else examImg = targetExam.imagePaths[2];
      }

      // 회사 교재 페이지 매핑
      let companyImg = c.companyImageUrl;
      const targetCompany = companyList.find(co => co.id === targetCompanyId);
      if (targetCompany && targetCompany.imagePaths && targetCompany.imagePaths.length > 0) {
        if (c.caseNo === 1 || c.caseNo === 4 || c.caseNo === 7) companyImg = targetCompany.imagePaths[0];
        else if (c.caseNo === 2 || c.caseNo === 5 || c.caseNo === 8) companyImg = targetCompany.imagePaths[1];
        else companyImg = targetCompany.imagePaths[2];
      }

      return {
        ...c,
        examImageUrl: examImg,
        companyImageUrl: companyImg,
        companyLabel: `${targetCompanyTitle} 중 일부 문항`
      };
    });

    // 4. 가중치 적용 종합 연계 체감도 연산 수행
    const gradeCounts = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
    finalCases.forEach(c => {
      if (c.grade in gradeCounts) {
        gradeCounts[c.grade as keyof typeof gradeCounts]++;
      }
    });

    let weightedScoreSum = 0;
    let weightSum = 0;
    finalCases.forEach(c => {
      let weight = 1.0;
      if (c.grade === 'S' || c.grade === 'A') weight = 1.4;
      else if (c.grade === 'B') weight = 1.2;
      else if (c.grade === 'C' || c.grade === 'D') weight = 1.0;
      else if (c.grade === 'E') weight = 0.6;

      weightedScoreSum += c.score * weight;
      weightSum += weight;
    });

    const totalScore = weightSum > 0 ? Math.round((weightedScoreSum / weightSum) * 10) / 10 : 0;

    // 5. 새 리포트 생성 및 저장
    const newReport: Report = {
      id: `report-${uuidv4().substring(0, 8)}`,
      title: `${targetExam.title} 적중 분석 리포트`,
      examId: examId,
      createdAt: new Date().toISOString(),
      totalScore,
      totalCases: finalCases.length,
      gradeCounts,
      cases: finalCases
    };

    DbService.saveReport(newReport);

    return res.status(201).json(newReport);
  } catch (error) {
    console.error(' 적중 분석 실행 오류:', error);
    return res.status(500).json({ error: '분석에 실패하였습니다.' });
  }
});

export default router;
