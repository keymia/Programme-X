FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json ./
RUN pnpm install --frozen-lockfile || true

FROM base AS build
COPY . .
RUN pnpm install
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN corepack enable && pnpm install --prod
EXPOSE 4000
CMD ["node", "dist/main.js"]

