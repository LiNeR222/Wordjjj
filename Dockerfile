# 1. Сборка Next.js
FROM public.ecr.aws/docker/library/node:23-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости отдельно, чтобы кешировать
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Копируем код и собираем Next.js
COPY . .
COPY .env.local.example .env.local
RUN yarn build

# 2. Продакшен-оптимизированный образ
FROM public.ecr.aws/docker/library/node:23-alpine

WORKDIR /app

ENV NODE_ENV=production

# Копируем собранное приложение
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/.env.local ./

# Запускаем Next.js в продакшн-режиме
CMD ["yarn", "start"]
