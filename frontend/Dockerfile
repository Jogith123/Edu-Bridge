# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app

# Bake the backend URL into the build at compile time
ARG VITE_API_URL=https://edubridge-backend-414139959751.us-central1.run.app/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with unprivileged nginx (fully compatible with Cloud Run)
FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

