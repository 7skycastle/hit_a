import fs from 'fs';
import path from 'path';
import { ContentFile, ExamFile, Report, MatchCase } from '../types';

export class DbService {
  private static companyPath = path.join(__dirname, '../data/companyContents.json');
  private static examPath = path.join(__dirname, '../data/examContents.json');
  private static reportPath = path.join(__dirname, '../data/reports.json');

  // --- 회사 콘텐츠 관리 ---
  public static getCompanyContents(): ContentFile[] {
    try {
      const data = fs.readFileSync(this.companyPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveCompanyContent(content: ContentFile) {
    const list = this.getCompanyContents();
    list.push(content);
    fs.writeFileSync(this.companyPath, JSON.stringify(list, null, 2), 'utf-8');
  }

  // --- 평가원 시험지 관리 ---
  public static getExamContents(): ExamFile[] {
    try {
      const data = fs.readFileSync(this.examPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveExamContent(exam: ExamFile) {
    const list = this.getExamContents();
    list.push(exam);
    fs.writeFileSync(this.examPath, JSON.stringify(list, null, 2), 'utf-8');
  }

  // --- 리포트 관리 ---
  public static getReports(): Report[] {
    try {
      const data = fs.readFileSync(this.reportPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static getReportById(id: string): Report | null {
    const list = this.getReports();
    return list.find(r => r.id === id) || null;
  }

  public static saveReport(report: Report) {
    const list = this.getReports();
    const idx = list.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      list[idx] = report;
    } else {
      list.push(report);
    }
    fs.writeFileSync(this.reportPath, JSON.stringify(list, null, 2), 'utf-8');
  }

  /**
   * 특정 매칭 케이스 수정 시 관련 리포트 스코어 및 등급 분포를 자동 재연산하여 업데이트합니다.
   */
  public static updateMatchCase(matchId: string, updates: Partial<MatchCase>): MatchCase | null {
    const reports = this.getReports();
    let targetCase: MatchCase | null = null;
    let targetReport: Report | null = null;

    // 전체 리포트를 순회하며 매칭 케이스를 찾습니다.
    for (const report of reports) {
      const caseIdx = report.cases.findIndex(c => c.id === matchId);
      if (caseIdx >= 0) {
        targetReport = report;
        const oldCase = report.cases[caseIdx];
        
        // 등급 변경에 따른 점수 동적 갱신
        let newGrade = updates.grade !== undefined ? updates.grade : oldCase.grade;
        let newScore = oldCase.score;
        if (updates.grade !== undefined) {
          const scoreMap: Record<string, number> = { S: 100, A: 85, B: 70, C: 55, D: 40, E: 20 };
          newScore = scoreMap[newGrade] || 20;
        }

        // 업데이트 병합
        report.cases[caseIdx] = {
          ...oldCase,
          ...updates,
          grade: newGrade,
          score: newScore
        };
        targetCase = report.cases[caseIdx];
        break;
      }
    }

    if (targetReport && targetCase) {
      // 1. 등급 분포 재계산 (모든 케이스 기준)
      const gradeCounts = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0 };
      targetReport.cases.forEach(c => {
        if (c.grade in gradeCounts) {
          gradeCounts[c.grade as keyof typeof gradeCounts]++;
        }
      });
      targetReport.gradeCounts = gradeCounts;

      // 2. 가중치 점수 및 종합 연계 체감도 재계산
      // S, A 가중치: 1.4 / B 가중치: 1.2 / C, D 가중치: 1.0 / E 가중치: 0.6
      let weightedScoreSum = 0;
      let weightSum = 0;

      targetReport.cases.forEach(c => {
        let weight = 1.0;
        if (c.grade === 'S' || c.grade === 'A') weight = 1.4;
        else if (c.grade === 'B') weight = 1.2;
        else if (c.grade === 'C' || c.grade === 'D') weight = 1.0;
        else if (c.grade === 'E') weight = 0.6;

        weightedScoreSum += c.score * weight;
        weightSum += weight;
      });

      targetReport.totalScore = weightSum > 0 ? Math.round((weightedScoreSum / weightSum) * 10) / 10 : 0;
      targetReport.totalCases = targetReport.cases.length;

      // 변경사항 저장
      fs.writeFileSync(this.reportPath, JSON.stringify(reports, null, 2), 'utf-8');
    }

    return targetCase;
  }
}
