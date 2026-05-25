import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import companyRoutes from './routes/contentRoutes';
import examRoutes from './routes/examRoutes';
import reportRoutes from './routes/reportRoutes';
import { PdfService } from './services/pdfService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정 (프로덕션에서는 같은 오리진으로 서빙되므로 '*' 허용은 유지)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 요청 본문 파싱 (JSON 및 URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 정적 파일 호스팅 세팅 ---
// 업로드 및 생성된 모든 이미지가 클라이언트에 '/images' 접두사로 즉각 서빙되도록 바인딩
const generatedImagesPath = path.join(__dirname, '../generated/images');
app.use('/images', express.static(generatedImagesPath, {
  setHeaders: (res, filePath) => {
    // 2차 개발 단계의 SVG 템플릿(PNG 확장자)을 고화질 벡터로 화면에 매끄럽게 띄우기 위해
    // Content-Type 헤더를 image/svg+xml로 보정해 줍니다. 윈도우 환경 대응 극대화!
    if (filePath.endsWith('.png') && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim().startsWith('<?xml') || content.trim().startsWith('<svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }
}));

// API 라우터 매핑 (정적 파일 서빙보다 먼저 등록하여 우선순위 확보)
app.use('/api/company', companyRoutes);
app.use('/api/exam', examRoutes);
app.use('/api', reportRoutes); // reports & matches 엔드포인트 바인딩

// 기본 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '수능 국어 콘텐츠 적중 맵 백엔드 작동 중' });
});

<<<<<<< HEAD
// --- 클라이언트 React 정적 빌드 파일 호스팅 ---
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`클라이언트 정적 파일 서빙 경로 활성화: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  
  // SPA의 모든 클라이언트 라우팅 대응을 위해, API가 아닌 모든 경로는 index.html 반환
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('클라이언트 정적 빌드 폴더가 존재하지 않아 API 모드로만 작동합니다. (로컬 개발 서버 연동 중)');
=======
// --- 프로덕션 환경: React 빌드 정적 파일 서빙 ---
// Render 클라우드 배포 시 Express가 프론트엔드까지 함께 서빙하여 단일 URL로 운용.
// 로컬 개발 환경(dev 모드)에서는 Vite 개발 서버를 사용하므로 이 블록은 실행되지 않음.
if (process.env.NODE_ENV === 'production') {
  // 클라이언트 빌드 결과물 경로: server/dist 기준 ../../client/dist
  const clientDistPath = path.join(__dirname, '../../client/dist');

  // React 앱의 정적 에셋(JS, CSS, 이미지 등) 서빙
  app.use(express.static(clientDistPath));

  // SPA 폴백: /api 이외의 모든 요청은 index.html로 전달하여 React Router가 처리
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  console.log(`프로덕션 모드: React 빌드 파일을 ${clientDistPath} 에서 서빙합니다.`);
>>>>>>> e6671f137f7251df0c6728d04d6f040a9bf174b9
}

// 서버 부팅 시 PDF 디렉토리 구성 및 고해상도 Mock 국어 모의고사 SVG 이미지 렌더링 파일 생성
const startServer = async () => {
  try {
    console.log('PDF 서비스 디렉토리 초기화 및 Mock 이미지 생성 가동...');
    await PdfService.initialize();
    console.log('Mock 이미지 생성 완료 및 정적 폴더 매핑 준비 완료.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(`  수능 국어 콘텐츠 적중 맵 (Node.js 백엔드)`);
      console.log(`  포트 ${PORT}번에서 성공적으로 구동되었습니다.`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('서버 기동 시 오류 발생:', error);
    process.exit(1);
  }
};

startServer();
