// API 및 정적 파일 호출을 위한 기본 URL 설정
// 개발 모드(import.meta.env.DEV)인 경우에는 로컬 백엔드 서버(http://localhost:5000)를 바라보고,
// 배포된 프로덕션 환경에서는 현재 호스팅 도메인의 상대 경로를 사용하여 백엔드를 호출합니다.
export const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';
