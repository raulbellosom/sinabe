## mycad

- ¿Qué es mycad?
  mycad (Maquinaria y Canteras Administrador) es un Sistemas Admnistrativo para la gestion de recursos economicos para las empresas. Este repositorio contiene el Frontend y Backend de la aplicacion.

Por favor seguir las siguientes instrucciones para su correcta instalación.

### Requerimientos:

- Docker

### Instalación del contenedor:

- Realiza el clonado del repositorio: git clone https://github.com/raulbellosom/mycad.git
- Abre una terminal dentro del repositorio clonado.
- Ejecuta el siguiente script mientras Docker es ejecutado: docker-compose up --build

# ¿Comó comenzar desde 0?

## Para la creacion del frontend deeberemos seguir los siguientes pasos:

1. Inicializar el proyecto con Vite:
   npm create vite@latest mycad-frontend --template react
   cd mycad-frontend

2. Instalar dependencias necesarias:
   npm install redux react-redux redux-thunk axios tailwindcss formik yup react-query

3. Configurar TailwindCSS:
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p

4. Configurar `tailwind.config.js`:
   /** @type {import('tailwindcss').Config} \*/
   module.exports = {
   content: [
   "./index.html",
   "./src/**/\*.{js,ts,jsx,tsx}",
   ],
   theme: {
   extend: {},
   },
   plugins: [],
   }

5. Agregar TailwindCSS a `src/index.css`:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

6. Crear el Dockerfile en `mycad-frontend/Dockerfile` y agrega el siguiente codigo que se encuentra dentro de las llaves:

{

# Dockerfile.frontend

# Etapa de construcción

FROM node:16-alpine as build-stage
WORKDIR /app
COPY package\*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de producción

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
}

# Creación del Backend:

1. Inicializar el proyecto ejecutando los siguientes comandos en la carpeta raíz:
   mkdir mycad-backend
   cd mycad-backend
   npm init -y

   (Recuerda realizar tu archivo de entorno .env copiando el contenido de .env.example y sustituyendo con tus credenciales los parametros que se encuentran señalados dentro del ejemplo.)

2. Instalar dependencias necesarias:
   npm install express @prisma/client bcryptjs jsonwebtoken nodemailer pm2
   npm install -D prisma nodemon

3. Inicializar Prisma:
   npx prisma init

4. Configurar la conexión a la base de datos en `.env`:
   DATABASE_URL="mysql://username:password@localhost:3306/mycad"

5. Define el esquema de Prisma en `prisma/schema.prisma`

datasource db {
provider = "mysql"
url = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

model User {
id Int @id @default(autoincrement())
email String @unique
password String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

6. Ejecutamos las migraciones:
   npx prisma migrate dev --name init

7. Crear el Dockerfile en `mycad-backend/Dockerfile`:

# Dockerfile.backend

FROM node:16-alpine
WORKDIR /app
COPY package\*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]

# Crear el container de Docker:

Primero necesitamos crear el Archivo docker-compose.yml
En el directorio raíz del proyecto mycad/, crea el archivo docker-compose.yml con el siguiente contenido sustituyendo con tus valores:

# docker-compose.yml

version: '3'
services:
frontend:
build:
context: ./mycad-frontend
ports: - "5173:80"

backend:
build:
context: ./mycad-backend
ports: - "5000:5000"
environment:
DATABASE_URL: mysql://username:password@mysql:3306/mycad
depends_on: - mysql

mysql:
image: mysql:5.7
ports: - "3306:3306"
environment:
MYSQL_ROOT_PASSWORD: password
MYSQL_DATABASE: mycad
MYSQL_USER: username
MYSQL_PASSWORD: password

##Ejecuta el comando para crear y/o correr el contenedor:

docker-compose up --build

## Prisma Comandos

- Correr migraciones
  npx prisma migrate dev --name init
