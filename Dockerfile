# 1. Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# 루트의 package.json 복사
COPY package.json ./

# client, server의 package.json 복사 (캐싱 활용)
COPY client/package.json ./client/
COPY server/package.json ./server/

# 전체 의존성 설치
RUN npm install --include=dev --prefix client && \
    npm install --include=dev --prefix server

# 소스 코드 전체 복사
COPY . .

# 프론트엔드 및 백엔드 빌드
RUN npm run build --prefix client && \
    npm run build --prefix server

# 2. Production Stage
FROM node:20-alpine

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production
# Cloud Run은 기본적으로 8080 포트를 사용하도록 권장합니다.
ENV PORT=8080 

# 실행에 필요한 파일 복사
COPY package.json ./
COPY server/package.json ./server/

# 프로덕션 의존성만 설치
RUN npm install --omit=dev --prefix server

# 빌드 결과물 복사
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/src/data ./server/src/data

EXPOSE 8080

# 백엔드 서버 시작 (정적 파일도 함께 서빙됨)
CMD ["node", "server/dist/index.js"]
