# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

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
