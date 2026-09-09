# Multi-stage build: Node builds the static Vite bundle, nginx serves it.
# VITE_* vars are baked into the JS at build time (not runtime), so they
# come in as build ARGs (passed via `flyctl deploy --build-arg NAME=value`),
# not Fly secrets — secrets set at runtime would have zero effect on an
# already-built static bundle.

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_APP_NAME
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_ENABLE_DARK_MODE
ARG VITE_ADSENSE_ID
ARG VITE_FOUNDED_YEAR
ARG VITE_RC_NUMBER
ARG VITE_CONTACT_EMAIL
ARG VITE_CONTACT_PHONE
ARG VITE_WHATSAPP_NUMBER
ARG VITE_ADDRESS
ARG VITE_INSTAGRAM_URL
ARG VITE_FACEBOOK_URL
ARG VITE_TWITTER_URL
ARG VITE_TIKTOK_URL
ARG VITE_YOUTUBE_URL

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
