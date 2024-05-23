FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont udev xvfb x11vnc fluxbox dbus # puppeteer 실행을 위해 필요한 패키지들을 설치
RUN apk add --no-cache --virtual .build-deps curl &&
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories &&
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories &&
  echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories &&
  apk add --no-cache curl wget &&
  apk del .build-deps # puppeteer 다운로드를 위해 필요한 라이브러리들을 설치하고 마지막에는 빌드를 위해 추가적으로 설치한 패키지들을 삭제

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # puppeteer가 chromium-browser를 실행할 수 있도록 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  # 이미 chromium을 설치했기 때문에 puppeteer가 chromium을 다시 다운로드하지 않도록 설정
ENV DISPLAY=:99

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD Xvfb :99 - screen 0 1024x768x16 -ac
CMD ["npm", "start"]
