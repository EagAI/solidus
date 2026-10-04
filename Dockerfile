# Spaceship Starlight Hyperlift
# Default app port in Hyperlift Manager: 8080 (set via env vars, do not EXPOSE)

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

# Rendered by the nginx image at start: only ${BOT_API_URL} is substituted.
ENV BOT_API_URL=http://127.0.0.1:3847
ENV NGINX_ENVSUBST_FILTER=^BOT_API_URL$
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
