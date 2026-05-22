import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from '../services/dbService';
import { PdfService } from '../services/pdfService';
import { ContentFile } from '../types';

const router = Router();

// Multer 파일 저장소 설정 (uploads/company 디렉토리 타겟팅)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../../uploads/company');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    // 한글 파일명의 깨짐을 방지하고 유니크성을 확보하기 위해 UUID 병합
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
 * @route   POST /api/company/upload
 * @desc    회사 콘텐츠 PDF 업로드 및 메타데이터 저장, 실시간 PNG 이미지 변환
 */
router.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '업로드할 PDF 파일이 존재하지 않습니다.' });
    }

    const { title, type, area, round, publishMonth } = req.body;

    if (!title || !type || !area) {
      return res.status(400).json({ error: '필수 메타데이터(콘텐츠명, 유형, 영역)가 누락되었습니다.' });
    }

    // PDF 페이지의 PNG 이미지 실시간 렌더링 파이프라인 가동 (최대 3페이지)
    const originalPdfPath = path.relative(path.join(__dirname, '../../'), file.path);
    const imagePaths = await PdfService.renderPdfToImages(file.path, 'company');

    const newContent: ContentFile = {
      id: `company-${uuidv4().substring(0, 8)}`,
      title,
      type,
      area,
      round: round || '',
      publishMonth: publishMonth || '',
      fileName: file.filename,
      originalPdfPath,
      imagePaths,
      createdAt: new Date().toISOString()
    };

    // 로컬 JSON DB에 영구 기록
    DbService.saveCompanyContent(newContent);

    return res.status(201).json(newContent);
  } catch (error: any) {
    console.error('Company content upload error:', error);
    return res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/company
 * @desc    등록된 모든 회사 콘텐츠 목록 반환
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const list = DbService.getCompanyContents();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: '콘텐츠 목록을 불러오지 못했습니다.' });
  }
});

export default router;
