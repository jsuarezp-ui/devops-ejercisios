# Imagen liviana de Node 22
FROM node:22-alpine

WORKDIR /app

# Copiamos primero los manifiestos para aprovechar la caché de capas:
# si no cambian las dependencias, Docker no reinstala en cada build.
COPY package*.json ./
RUN npm ci --omit=dev

# Ahora sí el resto del código
COPY . .

# La API escucha en este puerto
EXPOSE 3000

# Por defecto levanta la API; en docker-compose el watcher sobreescribe el comando
CMD ["node", "src/server.js"]
