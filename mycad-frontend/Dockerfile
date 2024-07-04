# Dockerfile.frontend

# Etapa de construcción
# FROM node:20.10.0-alpine as build-stage
# WORKDIR /app
# COPY package\*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # Etapa de producción

# FROM nginx:stable-alpine as production-stage
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# Dockerfile for frontend
# Use the official ViteJS image for building frontend
# Dockerfile del frontend
FROM node:20.10.0-alpine

WORKDIR /app

# Copiar archivos de configuración y de paquetes
COPY package*.json ./
RUN npm install

# Instalar Vite globalmente
RUN npm install -g vite

# Copiar el resto de los archivos del proyecto
COPY . .
COPY .env ./

# Exponer el puerto que ViteJS utiliza
EXPOSE 80
EXPOSE 5173

# Comando para iniciar ViteJS en modo desarrollo
CMD ["npm", "run", "dev"]

