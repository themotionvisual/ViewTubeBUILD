# Dedicated Remotion worker. The web app remains a static/Vercel deployment;
# only this process needs Chromium, FFmpeg, and writable render storage.
FROM node:22-bookworm

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY src/remotion-editor/package.json src/remotion-editor/package-lock.json ./src/remotion-editor/
RUN cd src/remotion-editor && npm ci && npx remotion browser ensure

COPY . .

ENV NODE_ENV=production \
  PORT=3001 \
  VT_E1_RENDER_DATA_DIR=/var/lib/vt-e1-render \
  VT_E1_RENDER_PERSISTENT_STORAGE=true

RUN mkdir -p /var/lib/vt-e1-render

EXPOSE 3001

CMD ["node", "src/server/vt-e1-render-server.mjs"]
