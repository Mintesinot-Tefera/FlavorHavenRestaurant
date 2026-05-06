FROM node:22-alpine

WORKDIR /app

# Install OpenSSL required by Prisma schema engine
RUN apk add --no-cache openssl

# Copy manifests and Prisma schema first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma client for the container's OS/arch
RUN npx prisma generate

# Copy remaining source and build
COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
