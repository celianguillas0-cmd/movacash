FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
# La base SQLite doit être sur un volume persistant monté sur /data
ENV DATABASE_PATH=/data/movacash.db
EXPOSE 3000
CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
