import { Report, MatchCase } from '../types';
import { DbService } from './dbService';

export class ReportService {
  /**
   * 매칭 분석 결과(MatchCase[])를 바탕으로 최종 통계가 계산된 완벽한 Report 객체를 생성하고 저장합니다.
   * [4차 개발 고도화 예정]:
   * - LLM API(Gemini, GPT)를 활용하여 지문과 지문 간의 복합 연계 근거 및 
   *   학습 효과 텍스트를 실시간으로 비교 분석해 생성하는 RAG 파이프라인 탑재
   */
  public static async generateFinalReport(
    reportId: string,
    title: string,
    examId: string,
    cases: MatchCase[]
  ): Promise<Report> {
    console.log(`[ReportService] 최종 적중 리포트 생성 가동: ${title} (ID: ${reportId})`);

    // 1. 등급 카운팅
    const gradeCounts = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
    cases.forEach(c => {
      if (gradeCounts[c.grade] !== undefined) {
        gradeCounts[c.grade]++;
      }
    });

    // 2. 가중 연계 체감도 계산
    // S/A 가중치 1.4, B 가중치 1.2, C/D 가중치 1.0, E 가중치 0.6
    let weightedSum = 0;
    cases.forEach(c => {
      let weight = 1.0;
      if (c.grade === 'S' || c.grade === 'A') weight = 1.4;
      else if (c.grade === 'B') weight = 1.2;
      else if (c.grade === 'C' || c.grade === 'D') weight = 1.0;
      else if (c.grade === 'E') weight = 0.6;

      weightedSum += c.score * weight;
    });

    const averageScore = cases.length > 0 ? Math.round(weightedSum / cases.length) : 0;
    const finalScore = Math.min(100, averageScore); // 100점 만점 캡핑

    const report: Report = {
      id: reportId,
      title,
      examId,
      createdAt: new Date().toISOString(),
      totalScore: finalScore,
      totalCases: cases.length,
      gradeCounts,
      cases
    };

    // 로컬 데이터에 최종 리포트 저장
    DbService.saveReport(report);

    return report;
  }

  /**
   * LLM을 사용해 매칭 케이스의 적중 분석 근거 및 학생 체감 효과 문장을 고도화합니다.
   * [4차 개발 고도화 예정]:
   * - Gemini API 연동을 통한 적중 요약 서술형 문장 동적 고도화
   */
  public static async enrichAnalysisWithLLM(
    examText: string,
    companyText: string,
    currentCase: MatchCase
  ): Promise<{ aiSummary: string; studentBenefit: string }> {
    console.log(`[ReportService] LLM 적중 분석 고도화 API 호출 예정...`);
    
    // 임시 Mock 지연
    await new Promise(resolve => setTimeout(resolve, 300));

    // 기본값 폴백 리턴
    return {
      aiSummary: currentCase.aiSummary,
      studentBenefit: currentCase.studentBenefit
    };
  }
}
