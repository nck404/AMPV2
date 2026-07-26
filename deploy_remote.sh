curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
cd /var/www/AMPV2/source/backend
npm install
npx prisma generate
pm2 restart backend-api || pm2 start server.js --name backend-api
