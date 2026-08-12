# set up cách 1 - chạy môi trường trên máy local
tải php ver8, composer, node ver22

---
backend
- tạo database
- chạy lệnh
 + cd vào thư mục server
 + composer install
 + composer dump
 + kết nối database trong file env
 + php artisan key:generate
 + php artisan optimize
 + php artisan migrate
 + php artisan db:seed
 + php artisan serve

---
client
- chạy lệnh
 + cd vào thư mục client
 + npm i
 + npm run dev

# set up cách 2 - dùng docker
# Docker setup
- tai docker
Chay toan bo moi truong:

```sh
docker compose up --build
```

Sau khi container len:

- Client: http://localhost:5173/sohoa
- Backend API: http://localhost:8000
- PostgreSQL Docker: localhost:5432, database `sohoa`, user `postgres`, password `secret`
- Redis: localhost:6379, password `secret`

Mac dinh cau hinh tren dung PostgreSQL cai trong Docker. Backend ket noi DB bang cac bien:

```
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=sohoa
DB_USERNAME=postgres
DB_PASSWORD=secret
```

Neu muon doi thong tin DB, tao file `.env` o thu muc root cung cap voi `docker-compose.yml` va khai bao lai cac bien `DB_*` tuong ung.

Lan dau chay, backend se tu:

- cai Composer dependencies vao volume `backend_vendor`
- tao `APP_KEY` neu `.env` chua co key
- doi PostgreSQL san sang
- chay `php artisan migrate --force`
- tu chay seed neu bang `nguoi_dungs` chua co user nao

Mac dinh `RUN_SEEDERS=auto`: lan dau se seed, cac lan sau neu da co user thi bo qua. Neu muon ep seed lai, sua `RUN_SEEDERS` cua service `backend` trong `docker-compose.yml` thanh `"true"`, sau do chay lai:

```sh
docker compose up --build
```

Dung moi truong:

```sh
docker compose down
```

Xoa ca database va volume dependency de chay lai tu dau:

```sh
docker compose down -v
```
