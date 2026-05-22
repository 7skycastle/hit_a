import fs from 'fs';
import path from 'path';

export interface ExtractedText {
  pageNumber: number;
  rawText: string;
  elements: {
    id: string;
    type: 'passage' | 'question' | 'options';
    text: string;
    bbox: { x: number; y: number; w: number; h: number }; // 이미지 좌표
  }[];
}

export class ExtractionService {
  /**
   * PDF 파일로부터 텍스트 및 구조화된 레이아웃 정보를 추출합니다.
   * [4차 개발 고도화 예정]:
   * - Tesseract, Google Vision API, 또는 내부 OCR 모델 연동
   * - LayoutParser / YOLO 기반 문항/지문 영역 자동 디텍션 및 크롭 이미지 생성
   */
  public static async extractLayoutAndText(pdfPath: string): Promise<ExtractedText[]> {
    console.log(`[ExtractionService] PDF 텍스트 및 레이아웃 추출 시작: ${pdfPath}`);
    
    // 비동기 처리를 가정한 mock 지연 시간 부여 가능
    await new Promise(resolve => setTimeout(resolve, 500));

    // 실서빙을 위한 Mock 구조 데이터 반환
    return [
      {
        pageNumber: 1,
        rawText: "Mock Extracted Raw Text...",
        elements: [
          {
            id: "el-1",
            type: "passage",
            text: "철학적 논쟁에서 왕수인의 지행합일설과 주자의 격물치지론...",
            bbox: { x: 5, y: 15, w: 42, h: 25 }
          },
          {
            id: "el-2",
            type: "question",
            text: "1. 위 글의 내용과 일치하지 않는 것은?",
            bbox: { x: 52, y: 15, w: 43, h: 30 }
          }
        ]
      }
    ];
  }

  /**
   * PDF 문서에서 특정 좌표를 기준으로 문항 이미지를 크롭(Crop)하여 저장합니다.
   * [4차 개발 고도화 예정]:
   * - Sharp, Canvas 등 이미지 처리 모듈을 사용해 문항 단위 PNG 자동 생성
   */
  public static async cropQuestionImage(
    imagePath: string, 
    bbox: { x: number; y: number; w: number; h: number }, 
    outputPath: string
  ): Promise<string> {
    console.log(`[ExtractionService] 이미지 크롭 실행: ${imagePath} -> ${outputPath}`);
    
    // 추후 Sharp 라이브러리 등을 사용하여 physical crop 구현 예정
    // sharp(imagePath).extract({ left: bbox.x, top: bbox.y, width: bbox.w, height: bbox.h }).toFile(outputPath)
    
    return outputPath;
  }
}
