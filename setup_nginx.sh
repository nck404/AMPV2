apt-get update
apt-get install -y nginx

cat << 'NGINX_CONF' > /etc/nginx/sites-available/amp.api.frenda.lol
server {
    listen 80;
    server_name amp.api.frenda.lol;

    location / {
        proxy_pass http://127.0.0.1:6333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Lấy IP thực của người dùng khi đi qua Cloudflare
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONF

ln -sf /etc/nginx/sites-available/amp.api.frenda.lol /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
