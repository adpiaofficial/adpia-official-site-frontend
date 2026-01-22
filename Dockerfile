# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install || npm install -g pnpm && pnpm install

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 기본 설정 사용
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
