# Đồ án
# set up
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

---
ai
- chạy lệnh
 + python -m venv venv
 + venv\Scripts\activate //chạy dự án
 + pip install torch torchvision transformers opencv-python pillow numpy fastapi uvicorn python-multipart
 <!-- numpy, pandas        xử lý dữ liệu
    matplotlib           vẽ biểu đồ, xem ảnh
    opencv-python        xử lý ảnh
    pillow               đọc/ghi ảnh
    scikit-learn         chia dữ liệu, đánh giá model -->
 + cd web-ai-dev
 +.\venv\Scripts\Activate.ps1
 + cd handwrititng-api
 + python train_mnist.py --epochs 3 --batch-size 128
 + python -m uvicorn main:app --reload

- API train MNIST CNN
 + POST http://127.0.0.1:8000/train-mnist?epochs=3&batch_size=128
 + Model sau khi train duoc luu tai web-ai-dev/handwriting-api/models/mnist_cnn.pt
 + Endpoint /predict se dung CNN nay cho cot diem, cac cot chu van dung EasyOCR.


- các bước thực hiện

1. Upload ảnh
2. Lưu ảnh vào uploads
3. EasyOCR đọc chữ trong ảnh
4. Trả về danh sách text đọc được
5. Tách bảng / tách từng dòng sinh viên bằng OpenCV
6. Tách riêng cột điểm viết tay
7. Train model CNN để đọc điểm viết tay

MNIST Dataset
   ↓
Train CNN
   ↓
Lưu model
   ↓
Người dùng upload ảnh chữ số
   ↓
Tiền xử lý ảnh giống MNIST
   ↓
Model dự đoán chữ số
