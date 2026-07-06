# Docker setup

Chay toan bo moi truong:

```sh
docker compose up --build
```

Sau khi container len:

- Client: http://localhost:5173/sohoa
- Backend API: http://localhost:8000
- AI API: http://localhost:8001
- PostgreSQL: localhost:5432, database `sohoa`, user `postgres`, password `secret`
- Redis: localhost:6379, password `secret`

Lan dau chay, backend se tu:

- cai Composer dependencies vao volume `backend_vendor`
- tao `APP_KEY` neu `.env` chua co key
- doi PostgreSQL san sang
- chay `php artisan migrate --force`

Neu muon seed du lieu mau, sua `RUN_SEEDERS` cua service `backend` trong `docker-compose.yml` thanh `"true"`, sau do chay lai:

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
