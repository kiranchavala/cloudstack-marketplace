FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate --schema=src/db/schema.prisma
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
