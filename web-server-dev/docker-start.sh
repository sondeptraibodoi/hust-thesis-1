#!/usr/bin/env sh
cd /var/www/web-server

cd ./public
rm -r storage
cd ..

php artisan storage:link
php artisan optimize
php artisan migrate --force

apachectl -D FOREGROUND
