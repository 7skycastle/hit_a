import { Router, Request, Response } from 'express';
import { DbService } from '../services/dbService';

const router = Router();

/**
 * @route   GET /api/reports
 * @desc    분석 완료된 리포트 목록 전체 조회
 */
router.get('/reports', (req: Request, res: Response) => {
  try {
    const list = DbService.getReports();
    // 목록 조회 시 무거운 케이스 정보를 제외한 메타데이터만 심플하게 전달 가능
    const summaries = list.map(r => ({
      id: r.id,
      title: r.title,
      examId: r.examId,
      createdAt: r.createdAt,
      totalScore: r.totalScore,
      totalCases: r.totalCases,
      gradeCounts: r.gradeCounts
    }));
    return res.json(summaries);
  } catch (error) {
    return res.status(500).json({ error: '리포트 목록 조회에 실패했습니다.' });
  }
});

/**
 * @route   GET /api/reports/:reportId
 * @desc    특정 리포트 상세 조회
 *          소비자 모드(?role=user 또는 기본값)일 경우 approved가 true인 케이스만 노출
 *          관리자 모드(?role=admin)일 경우 미승인 케이스를 포함한 전체 노출
 */
router.get('/reports/:reportId', (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { role } = req.query;

    const report = DbService.getReportById(reportId);
    if (!report) {
      return res.status(404).json({ error: '지정된 리포트를 찾을 수 없습니다.' });
    }

    if (role === 'admin') {
      // 관리자는 승인 여부와 상관없이 모든 매칭 후보 케이스 조회 가능
      return res.json(report);
    } else {
      // 소비자(학생, 학부모 등)는 최종 승인된(approved === true) 고신뢰성 케이스만 조회
      const approvedCases = report.cases.filter(c => c.approved === true);
      const filteredReport = {
        ...report,
        cases: approvedCases,
        totalCases: approvedCases.length
      };
      return res.json(filteredReport);
    }
  } catch (error) {
    return res.status(500).json({ error: '리포트 조회 도중 서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PATCH /api/matches/:matchId
 * @desc    관리자 검수 결과 수정 (등급 변경, 승인 처리, 하이라이트 박스 드래그 좌표 실시간 저장)
 */
router.patch('/matches/:matchId', (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const { grade, approved, aiSummary, studentBenefit, examHighlights, companyHighlights, title } = req.body;

    const updates: any = {};
    if (grade !== undefined) updates.grade = grade;
    if (approved !== undefined) updates.approved = approved;
    if (aiSummary !== undefined) updates.aiSummary = aiSummary;
    if (studentBenefit !== undefined) updates.studentBenefit = studentBenefit;
    if (examHighlights !== undefined) updates.examHighlights = examHighlights;
    if (companyHighlights !== undefined) updates.companyHighlights = companyHighlights;
    if (title !== undefined) updates.title = title;

    const updatedCase = DbService.updateMatchCase(matchId, updates);
    if (!updatedCase) {
      return res.status(404).json({ error: '수정하려는 매칭 케이스를 찾을 수 없습니다.' });
    }

    return res.json(updatedCase);
  } catch (error) {
    console.error('검수 수정 오류:', error);
    return res.status(500).json({ error: '매칭 케이스 수정을 완료하지 못했습니다.' });
  }
});

export default router;
