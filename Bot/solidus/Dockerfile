# Solidus bot + panel API (port 3847). Deploy separately from the website.
FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PANEL_API_HOST=0.0.0.0
ENV PANEL_API_PORT=3847

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Database + panel settings. Mount a persistent volume here or data is lost on redeploy.
VOLUME ["/app/data"]
EXPOSE 3847

CMD ["node", "src/index.js"]
