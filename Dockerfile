# 1. Adım: Temel olarak Node.js'in kurulu olduğu bir ortam seçiyoruz.
FROM node:20-alpine

# 2. Adım: Konteyner içinde çalışacağımız bir klasör oluşturuyoruz.
WORKDIR /app

# 3. Adım: Projemizin TÜM dosyalarını bu klasöre kopyalıyoruz.
COPY . .

# 4. Adım: Arayüz ('client') için gerekli tüm paketleri kuruyoruz.
RUN npm install --prefix client

# 5. Adım: Arayüzü 'build' ederek paket haline getiriyoruz.
# CI=false ekleyerek gereksiz uyarıların hataya dönüşmesini engelliyoruz.
RUN CI=false npm run build --prefix client

# 6. Adım: İnşa edilmiş statik dosyaları yayınlamak için basit bir web sunucusu kuruyoruz.
RUN npm install -g serve

# 7. Adım: Dış dünyaya hangi kapıdan (port) hizmet vereceğimizi belirtiyoruz.
EXPOSE 3000

# 8. Adım: Servis çalıştığında çalışacak nihai komut:
# 'serve' sunucusunu başlat ve 'client/build' klasöründeki dosyaları yayınla.
CMD ["serve", "-s", "client/build", "-l", "3000"]
