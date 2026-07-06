# Docker setup

Chay toan bo moi truong:

```sh
docker compose up --build
```

Sau khi container len:

- Client: http://localhost:5173/sohoa
- Backend API: http://localhost:8000
- AI API: http://localhost:8001
- PostgreSQL local tren may ban: localhost:5432, database `hust`, user `postgres`, password `12345678`
- Redis: localhost:6379, password `secret`

Mac dinh cau hinh tren dung PostgreSQL local tren may ban. Trong container, host DB local la `host.docker.internal`, khong phai `127.0.0.1`.

Neu muon quay lai dung PostgreSQL trong Docker, dung file override:

```sh
docker compose --profile docker-db -f docker-compose.yml -f docker-compose.docker-db.yml up --build
```

Khi dung DB Docker: database `sohoa`, user `postgres`, password `secret`.

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
