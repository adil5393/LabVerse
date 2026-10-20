# LabVerse web app: build the static bundle, then serve it with nginx (which also proxies /api to the solver).
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# package.json lists a Windows-only native binding (@rolldown/binding-win32-x64-msvc); --force lets npm skip the platform
# check on Linux. The matching Linux binding is installed automatically as an optional dependency.
RUN npm ci --force --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
