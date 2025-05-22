# Gunakan image Node.js resmi
FROM node:18

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies produksi
RUN npm install --production

# Salin seluruh source code ke dalam container
COPY . .

# Set environment variable untuk production
ENV NODE_ENV=production

# Buka port aplikasi (pastikan sesuai dengan PORT di index.js/.env)
EXPOSE 5000

# Jalankan aplikasi
CMD ["node", "index.js"]