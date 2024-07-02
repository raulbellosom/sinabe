# Dockerfile.backend

# FROM node:20.10.0-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# EXPOSE 4000
# CMD ["node", "src/index.js"]

FROM node:20.10.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force
ENV PATH=/app/node_modules/.bin:$PATH

COPY . .
COPY src ./src
COPY .env ./

#RUN npm install -g nodemon

EXPOSE ${PORT}

#RUN npm run build
CMD ["npm", "run", "dev"]