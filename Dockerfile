# FROM node:18-alpine AS base

# FROM ghcr.io/puppeteer/puppeteer:22.8.0

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# FROM base AS deps
# RUN apk add --no-cache libc6-compat

# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm ci

# FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

# RUN npm run build

# FROM base AS runner
# WORKDIR /app

# ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# USER nextjs

# EXPOSE 3000

# ENV PORT 3000

# CMD ["npm", "start"]

# 베이스 이미지로 Node.js 사용
FROM node:18-alpine

# Puppeteer의 필요한 의존성 설치
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs

# 환경 변수 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package.json package-lock.json ./
RUN npm install

# 모든 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 애플리케이션 실행 포트 설정
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "start"]
