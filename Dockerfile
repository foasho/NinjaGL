FROM node:21-alpine as base

FROM base as deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

ENV LANG=C.UTF-8 \
    TZ=Asia/Tokyo 

COPY src ./src
COPY public ./public
COPY app ./app
COPY lib ./lib
COPY next.config.mjs .
COPY tsconfig.json .
COPY tailwind.config.js .
COPY postcss.config.js .
COPY mdx-components.tsx .
COPY drizzle.config.ts .
COPY .npmrc .

CMD ["pnpm", "fast"]

