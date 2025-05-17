#!/usr/bin/env sh

cd /var/www/web-server

php artisan optimize
service supervisor start
supervisorctl reread
supervisorctl update

while [ true ]
do
    php artisan schedule:run --verbose --no-interaction
    sleep 60
done
