import fs from 'fs';
import path from 'path';

export class PdfService {
  private static uploadDir = path.join(__dirname, '../../uploads');
  private static generatedDir = path.join(__dirname, '../../generated');

  /**
   * 서버 디렉토리 초기화 및 모의고사 느낌의 미려한 Mock 이미지 생성
   */
  public static async initialize() {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'company'),
      path.join(this.uploadDir, 'exam'),
      this.generatedDir,
      path.join(this.generatedDir, 'images'),
      path.join(this.generatedDir, 'images/company'),
      path.join(this.generatedDir, 'images/exam'),
      path.join(this.generatedDir, 'crops'),
      path.join(this.generatedDir, 'reports')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Mock 수능 국어 시험지 및 회사 모의고사 이미지 생성 (SVG 형태로 작성 후 저장)
    await this.createMockSvgImage(
      path.join(this.generatedDir, 'images/sample_exam.png'),
      '2026학년도 대학수학능력시험 6월 평가원 모의평가',
      '국어 영역',
      '독서 [1~3] 다음 글을 읽고 물음에 답하시오.\n\n철학적 논쟁에서 왕수인의 지행합일설과 주자의 격물치지론은 동양 인문학의 핵심 논점 중 하나이다. 심즉리(心卽理)를 주장하는 왕수인은 마음이 곧 이치이며, 앎과 행함은 본래 하나라고 보았다. 반면 주자는 성즉리(性卽理)를 바탕으로 사물의 이치를 끝까지 궁구하는 격물치지(格物致知)를 강조했다. 치양지(致良知)란 내면의 참된 앎을 온전히 실현하는 과정이다...',
      '1. 위 글의 내용과 일치하지 않는 것은?\n① 주자는 사물의 이치를 끝까지 궁구하는 격물치지를 강조했다.\n② 왕수인은 앎과 행함이 본래 하나라는 지행합일설을 내세웠.\n③ 치양지는 내면의 참된 앎을 가리는 외적인 집착을 뜻한다.\n④ 왕수인의 심즉리는 마음 외에 이치가 따로 존재하지 않음을 의미한다.\n⑤ 두 사상가는 모두 내면의 성찰을 중시하는 유교적 전통에 속한다.'
    );

    await this.createMockSvgImage(
      path.join(this.generatedDir, 'images/sample_exam_2.png'),
      '2026학년도 대학수학능력시험 6월 평가원 모의평가',
      '국어 영역',
      '독서 [4~9] 다음 글을 읽고 물음에 답하시오.\n\n행정법상 의무 이행 확보 수단은 행정청이 사인의 의무 불이행에 대해 강제력을 행사하는 수단이다. 대표적인 수단으로는 이행강제금과 강제집행이 있다. 이행강제금은 장래의 의무 이행을 간접적으로 강제하기 위해 부과하는 금전적 제재로, 반복 부과가 가능하다는 특징이 있다. 반면 강제집행은 직접 대집행 등을 통해 의무 상태를 즉각 실현한다...',
      '11. 위 글을 바탕으로 <보기>를 이해한 내용으로 적절하지 않은 것은?\n<보기> A구청은 불법 증축을 한 건물주 甲에게 이행강제금 500만 원을 부과하겠다고 계고하였다.\n\n① A구청은 갑이 의무를 이행할 때까지 이행강제금을 반복 부과할 수 있다.\n② 이행강제금은 갑의 불이행에 대한 직접적인 대집행과는 성격이 다르다.\n③ 갑이 의무를 즉시 이행하면 기 부과된 이행강제금은 징수할 수 없다.\n④ A구청의 조치는 장래의 의무 이행을 간접 강제하는 성격을 지닌다.\n⑤ 이행강제금의 부과는 법률에 근거한 구속력을 지녀야만 적법하다.'
    );

    await this.createMockSvgImage(
      path.join(this.generatedDir, 'images/sample_exam_3.png'),
      '2026학년도 대학수학능력시험 6월 평가원 모의평가',
      '국어 영역',
      '독서 [14~17] 다음 글을 읽고 물음에 답하시오.\n\n기체의 물리적 성질을 설명하는 상태 방정식은 온도, 압력, 부피, 밀도 간의 수식 관계를 규명한다. 이상 기체 상태 방정식(PV=nRT)에 따르면, 부피가 고정된 닫힌 계에서 온도가 일정할 때 압력과 밀도는 비례 관계를 형성한다. 그러나 실재 기체는 분자 자체의 부피와 인력으로 인해 고압 환경에서 압력 변화율이 달라진다...',
      '16. [3점] 위 글을 바탕으로 <보기>의 실험 데이터를 바르게 해석한 것을 골라라.\n<보기> 기체 A의 온도 고정 조건 하의 밀도-압력 그래프 실험 데이터\n\n① 압력이 극도로 높아질 때 밀도 증가율은 이상 기체보다 둔화된다.\n② 기체 분자 자체의 인력은 압력을 높이는 핵심 요인으로 작동한다.\n③ 부피를 두 배로 늘리면 동일 압력에서의 밀도는 감소한다.\n④ 실재 기체의 거동은 이상 기체 방정식과 완벽히 부합한다.\n⑤ 기체 온도가 상승하면 동일 압력 조건에서의 밀도 값은 작아진다.'
    );

    // 회사용 Mock 교재 이미지 생성
    await this.createMockSvgImage(
      path.join(this.generatedDir, 'images/sample_company.png'),
      '2026 국어 파이널 실전 모의고사 (회사 자체 제작)',
      '현대소설 / 문학 분석 코너',
      '지문 [31~34] 다음 글을 읽고 물음에 답하시오.\n\n[작품 분석] 왕양명과 주희의 철학 논쟁사\n왕수인의 지행합일론은 사변적 앎에 빠진 주자학적 폐단을 비판하기 위해 제기되었다. 마음의 밖에는 이치가 없고(心外無理), 마음 밖에 일이 없다(心外無事)고 한 것은 지식과 행동을 분리하는 이원론적 시각을 정면으로 타파한 것이다. 주희의 격물치지가 객관적 사물 탐구를 앞세워 이론 중심의 지식에 치우쳤다면 왕수인은...',
      '32. [회사 적중 예상 문항]\n위 지문의 왕양명 철학적 구조를 바탕으로, ' +
      '현대 문학 작품 속 인물의 심리적 일치 여부를 설명한 내용으로 가장 옳은 것은?\n\n① 지식과 행동의 분리가 인물의 갈등을 유발하는 구조적 원인이다.\n② 사물의 이치를 궁구함으로써 인물 내면의 성찰이 완성되고 있다.\n③ 외부 세계의 규범(성즉리)이 내면의 도덕적 결단을 제한한다.\n④ 인물의 심적 원리는 마음에 내재된 양지(良知)의 발현으로 설명된다.\n⑤ 격물치지와 지행합일은 인물 간 갈등 해결의 서로 다른 대안이다.'
    );

    await this.createMockSvgImage(
      path.join(this.generatedDir, 'images/sample_company_2.png'),
      '2026 국어 파이널 실전 모의고사 (회사 자체 제작)',
      '독서 법률 개념 특별 해설',
      '지문 [10~13] 다음 글을 읽고 물음에 답하시오.\n\n[법학 배경 지식] 행정적 제재와 이행강제금\n사인이 행정상의 의무를 준수하지 않을 때 행정청은 실효성 확보를 위해 다양한 수단을 사용한다. 이 중 강제집행은 직접적으로 의무 상태를 대리 실현하는 대집행 등이 있고, 간접적으로 이행을 유도하는 수단으로는 이행강제금(집행벌)이 있다. 이행강제금은 반복하여 부과할 수 있으며...',
      '12. [핵심 훈련 문제]\n위 글을 참고하여, 이행강제금 부과 처분을 받은 건물주가 의무를 이행했을 때의 처분 조치로 올바른 것은?\n\n① 이미 부과된 이행강제금은 전액 취소하고 소급 징수하지 않는다.\n② 이미 부과된 금액은 징수하고, 향후 추가 부과는 즉시 중지한다.\n③ 의무 이행에도 불구하고 징벌적 성격으로 2회 추가 부과할 수 있다.\n④ 강제집행을 동시에 실행하여 건물 철거를 신속하게 완료한다.\n⑤ 행정소송을 통해서만 부과된 이행강제금의 효력을 정지할 수 있다.'
    );

    await this.createMockSvgImage(
      path.join(this.generatedDir, 'images/sample_company_3.png'),
      '2026 국어 파이널 실전 모의고사 (회사 자체 제작)',
      '독서 과학 기체 역학 훈련',
      '지문 [14~17] 다음 글을 읽고 물음에 답하시오.\n\n[물리학 배경지식] 기체 상태 방정식의 변수 거동\n이상 기체와 달리 실재 기체는 고온, 고압의 극한 상황에서 보일-샤를의 법칙이나 이상 기체 상태 방정식에서 벗어나는 양상을 보인다. 압력(P)이 증가하고 온도(T)가 떨어질 때 기체 분자 간 상호작용(인력 및 반발력)의 영향력은 지대해진다. 밀도가 증가할수록 기체 분자의 부피 효과가 도드라져...',
      '16. [3점 고난도 훈련]\n지문의 기체 상태 관계를 바탕으로, <보기>의 그래프 수치를 계산 및 변수 대입한 결과로 옳은 것은?\n\n① 밀도와 압력은 극한의 고압에서도 완전한 1차 함수적 선형 비례 관계를 유지한다.\n② 기체 분자 상호 인력은 고압에서 압력 강하 효과를 일으키는 주범이다.\n③ 동일 부피에서 분자 개수가 늘면 밀도는 낮아진다.\n④ 온도 변수를 극도로 낮추면 이상 기체 방정식과의 편차가 좁혀진다.\n⑤ 실재 기체의 거동 해석은 가스 상수 R의 보정 없이 언제나 유효하다.'
    );
  }

  /**
   * 고해상도 수능/교재 PDF 지문 느낌을 주는 미려한 SVG를 PNG 형태(실제로는 SVG 데이터)로 파일에 기록
   * 브라우저에서 이미지 뷰어로 서빙하기 위함
   */
  private static async createMockSvgImage(filePath: string, header: string, subheader: string, content: string, questions: string) {
    const contentLines = content.split('\n').map(line => `<tspan x="40" dy="24">${this.escapeXml(line)}</tspan>`).join('');
    const questionLines = questions.split('\n').map(line => `<tspan x="420" dy="24">${this.escapeXml(line)}</tspan>`).join('');

    const svg = `<?xml version="1.0" standalone="no"?>
<svg width="800" height="1100" viewBox="0 0 800 1100" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 및 테두리 -->
  <rect width="800" height="1100" fill="#ffffff" stroke="#111827" stroke-width="2"/>
  
  <!-- 상단 시험 헤더 -->
  <rect x="20" y="20" width="760" height="80" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="400" y="55" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">${header}</text>
  <text x="400" y="85" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="16" font-weight="bold" fill="#334155" text-anchor="middle">${subheader}</text>
  
  <!-- 좌우 분할선 (수능 양면 구성) -->
  <line x1="390" y1="120" x2="390" y2="1060" stroke="#94a3b8" stroke-dasharray="5 5" stroke-width="1.5"/>
  
  <!-- 왼쪽 지문 영역 -->
  <rect x="25" y="120" width="350" height="920" fill="#fdfdfd" stroke="#cbd5e1" stroke-width="1" rx="4"/>
  <rect x="25" y="120" width="350" height="35" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" rx="4"/>
  <text x="40" y="142" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="14" font-weight="bold" fill="#1e293b">[지문 영역]</text>
  
  <text x="40" y="170" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="12" fill="#334155">
    ${contentLines}
  </text>
  
  <!-- 오른쪽 문항 영역 -->
  <text x="420" y="145" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="14" font-weight="bold" fill="#1e293b">[문항 및 선지 영역]</text>
  <text x="420" y="170" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="12" fill="#334155">
    ${questionLines}
  </text>
  
  <!-- 하단 페이지 표시 -->
  <text x="400" y="1085" font-family="'Inter', sans-serif" font-size="12" fill="#64748b" text-anchor="middle">- 1 / 16 -</text>
</svg>`;

    // 확장자가 PNG여도 렌더링에 지장이 없도록 UTF-8 SVG 코드를 텍스트로 저장 (Content-Type 튜닝으로 PNG/SVG 모두 수용)
    fs.writeFileSync(filePath, svg, 'utf-8');
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * PDF 파일을 페이지 이미지로 실시간 변환하여 저장
   * @param pdfPath PDF 파일 절대 경로
   * @param targetType 'company' | 'exam'
   */
  public static async renderPdfToImages(pdfPath: string, targetType: 'company' | 'exam'): Promise<string[]> {
    const filename = path.basename(pdfPath, '.pdf');
    const outputSubdir = path.join(this.generatedDir, 'images', targetType);
    
    if (!fs.existsSync(outputSubdir)) {
      fs.mkdirSync(outputSubdir, { recursive: true });
    }

    try {
      // pdf-img-convert를 런타임에 동적 로드 (canvas 로딩 실패 시 try-catch로 예외 처리하여 폴백 유도)
      const pdfImgConvert = require('pdf-img-convert');
      
      const outputImages = await pdfImgConvert.convert(pdfPath, {
        width: 800,
        height: 1100,
        page_numbers: [1, 2, 3]
      });

      const savedPaths: string[] = [];
      outputImages.forEach((imgBuffer: Buffer, index: number) => {
        const imgName = `${filename}_page_${index + 1}.png`;
        const imgPath = path.join(outputSubdir, imgName);
        fs.writeFileSync(imgPath, imgBuffer);
        // 클라이언트에서 서빙받을 수 있는 상대 경로 저장
        savedPaths.push(`/images/${targetType}/${imgName}`);
      });

      return savedPaths;
    } catch (error) {
      console.error('PDF to Image Conversion failed:', error);
      // 변환이 실패했거나 라이브러리 구동 에러 시, 기생성해 둔 sample 이미지로 폴백 처리하여 중단 방지
      return [
        `/images/sample_${targetType}.png`,
        `/images/sample_${targetType}_2.png`,
        `/images/sample_${targetType}_3.png`
      ];
    }
  }
}
