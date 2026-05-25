<<<<<<< HEAD
# 1단계: 빌드 스테이지
=======
# 1. Build Stage
>>>>>>> e6671f137f7251df0c6728d04d6f040a9bf174b9
FROM node:20-alpine AS builder

WORKDIR /app

<<<<<<< HEAD
# package.json 파일들 복사
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# 의존성 설치
RUN npm install
RUN npm install --prefix client
RUN npm install --prefix server

# 전체 소스 코드 복사
COPY . .

# 클라이언트 및 백엔드 빌드 실행
# client build -> client/dist 생성
# server build -> server/dist 생성
RUN npm run build

# 2단계: 실행 스테이지 (프로덕션 환경의 경량화된 컨테이너)
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 실행에 필요한 최소한의 파일 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/client/package*.json ./client/
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/dist ./server/dist

# 프로덕션 의존성만 설치
RUN npm ci --only=production
RUN npm ci --prefix server --only=production

# 환경변수 기본값 설정
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# 백엔드 서버 기동
CMD ["npm", "run", "start"]
=======
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
>>>>>>> e6671f137f7251df0c6728d04d6f040a9bf174b9
