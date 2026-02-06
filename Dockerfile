# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm 설치 + lockfile 복사
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 복사 + 빌드
COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# 이 줄이 반드시 있어야 우리가 만든 설정이 적용됩니다!
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]