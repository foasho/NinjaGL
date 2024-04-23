FROM node:21-alpine as base

FROM base as deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile;

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
COPY my-mdx-loader.js .

CMD ["pnpm", "fast"]

