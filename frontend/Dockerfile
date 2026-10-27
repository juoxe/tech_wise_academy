FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# The dev server listens on all interfaces inside the container; compose binds it to 127.0.0.1.
CMD ["npm", "run", "dev"]
