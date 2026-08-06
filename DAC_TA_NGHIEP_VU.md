# ĐẶC TẢ NGHIỆP VỤ DỰ ÁN

## 1. Tổng quan dự án

### 1.1. Tên đề tài

Xây dựng hệ thống quản lý học vụ, lớp học, môn học, điểm số và đánh giá kết quả học tập cho sinh viên.

### 1.2. Mục tiêu

Hệ thống hỗ trợ nhà trường quản lý các nghiệp vụ học vụ cơ bản gồm quản lý tài khoản người dùng, quản lý môn học, kỳ học, lớp hành chính, lớp học phần, đăng ký môn học, chấm điểm, chốt điểm, phúc khảo và theo dõi tình trạng học tập của sinh viên.

### 1.3. Phạm vi hệ thống

Hệ thống gồm hai phần chính:

- Client: ứng dụng web dùng React, TypeScript, Ant Design, Ag Grid để cung cấp giao diện cho quản trị viên, giảng viên và sinh viên.
- Server: ứng dụng Laravel cung cấp API, xác thực người dùng, phân quyền theo vai trò, xử lý nghiệp vụ và lưu trữ dữ liệu.

Các nhóm nghiệp vụ chính:

- Quản lý người dùng và phân quyền.
- Quản lý sinh viên, giảng viên.
- Quản lý môn học.
- Quản lý kỳ học và cấu hình học vụ.
- Quản lý lớp hành chính và lớp học phần.
- Đăng ký môn học và xếp lớp học phần.
- Quản lý bảng điểm, chấm điểm, chốt điểm.
- Quản lý phúc khảo điểm.
- Theo dõi tổng quan học tập của sinh viên.

## 2. Tác nhân sử dụng hệ thống

### 2.1. Quản trị viên

Quản trị viên là người có quyền cao nhất trong hệ thống. Quản trị viên thực hiện các nghiệp vụ cấu hình, quản lý dữ liệu nền và điều phối học vụ.

Chức năng chính:

- Tạo, sửa, xóa, khóa hoặc mở khóa tài khoản.
- Gán vai trò cho người dùng: quản trị viên, giảng viên, sinh viên.
- Quản lý danh sách môn học.
- Quản lý kỳ học, thời gian mở đăng ký và mở phúc khảo.
- Tạo và quản lý lớp học phần.
- Tạo và quản lý lớp hành chính.
- Gán giảng viên chủ nhiệm cho lớp hành chính.
- Phân sinh viên vào lớp học phần sau khi sinh viên đăng ký môn.
- Xem, cập nhật hoặc chốt điểm khi cần.
- Xem thống kê, tổng hợp dữ liệu học tập.

### 2.2. Giảng viên

Giảng viên tham gia vào nghiệp vụ giảng dạy, chấm điểm, xử lý phúc khảo và quản lý lớp chủ nhiệm nếu được phân công.

Chức năng chính:

- Xem các lớp học phần được phân công giảng dạy.
- Xem danh sách sinh viên trong lớp học phần.
- Nhập điểm chuyên cần, điểm giữa kỳ, điểm cuối kỳ, điểm tổng kết.
- Chốt điểm cho lớp học phần được phụ trách.
- Xử lý yêu cầu phúc khảo của sinh viên trong lớp mình giảng dạy.
- Xem và quản lý sinh viên thuộc lớp hành chính mình chủ nhiệm.
- Thêm sinh viên vào lớp chủ nhiệm, xóa sinh viên khỏi lớp chủ nhiệm.
- Xem tổng quan học tập của sinh viên trong lớp chủ nhiệm.

### 2.3. Sinh viên

Sinh viên sử dụng hệ thống để theo dõi thông tin học tập, đăng ký môn học, xem điểm và gửi phúc khảo.

Chức năng chính:

- Đăng nhập hệ thống.
- Xem danh sách môn học đang mở.
- Đăng ký môn học trong kỳ học đang mở đăng ký.
- Theo dõi trạng thái đăng ký môn học.
- Xem lớp học phần đã được xếp.
- Xem bảng điểm cá nhân.
- Gửi yêu cầu phúc khảo khi kỳ học đang mở phúc khảo.
- Xem kết quả xử lý phúc khảo.

## 3. Đặc tả nghiệp vụ theo phân hệ

### 3.1. Phân hệ quản lý người dùng

Hệ thống quản lý người dùng thông qua bảng tài khoản `nguoi_dungs`. Mỗi tài khoản có email, username, mật khẩu, vai trò, trạng thái hoạt động và thông tin hồ sơ tương ứng.

Vai trò người dùng:

- `admin`: quản trị viên.
- `giang_vien`: giảng viên.
- `sinh_vien`: sinh viên.

Nghiệp vụ chính:

- Quản trị viên tạo tài khoản mới với email, họ tên, mật khẩu và vai trò.
- Khi tạo tài khoản sinh viên, hệ thống tạo hồ sơ sinh viên tương ứng.
- Khi tạo tài khoản giảng viên, hệ thống tạo hồ sơ giảng viên tương ứng.
- Quản trị viên có thể sửa thông tin tài khoản, đổi vai trò, xóa tài khoản.
- Quản trị viên có thể khóa hoặc mở khóa tài khoản thông qua trạng thái hoạt động.

Ràng buộc nghiệp vụ:

- Email tài khoản là duy nhất.
- Vai trò chỉ thuộc một trong ba nhóm: quản trị viên, giảng viên, sinh viên.
- Khi đổi vai trò, hồ sơ cũ theo vai trò cũ có thể bị xóa và tạo lại hồ sơ theo vai trò mới.

### 3.2. Phân hệ quản lý môn học

Môn học là dữ liệu nền để mở lớp học phần, đăng ký môn và quản lý điểm.

Thông tin môn học gồm:

- Mã môn học.
- Tên môn học.
- Số tín chỉ.
- Điểm qua môn.
- Trạng thái môn học.
- Tính chất bắt buộc hoặc không bắt buộc.
- Danh sách môn tiên quyết nếu có.

Nghiệp vụ chính:

- Quản trị viên thêm, sửa, xóa môn học.
- Quản trị viên cập nhật trạng thái môn học: đang mở hoặc đã đóng.
- Sinh viên chỉ nhìn thấy các môn học đang mở.
- Giảng viên chỉ nhìn thấy các môn học được phân công.
- Môn học được sử dụng khi tạo lớp học phần, đăng ký môn học và quản lý điểm.

Ràng buộc nghiệp vụ:

- Mã môn học là duy nhất.
- Tên môn học là duy nhất.
- Sinh viên chỉ được đăng ký môn có trạng thái đang mở.
- Nếu môn học có môn tiên quyết, sinh viên phải đạt môn tiên quyết trước khi đăng ký.

### 3.3. Phân hệ quản lý kỳ học và cấu hình học vụ

Kỳ học dùng để xác định thời gian học, mở đăng ký môn học, mở phúc khảo và cấu hình điểm qua môn mặc định.

Thông tin kỳ học gồm:

- Mã kỳ học.
- Tên kỳ học.
- Năm học.
- Số kỳ.
- Ngày bắt đầu, ngày kết thúc.
- Trạng thái kỳ học.
- Cờ mở đăng ký môn học.
- Cờ mở phúc khảo.
- Điểm qua môn mặc định.

Nghiệp vụ chính:

- Quản trị viên tạo, sửa, xóa kỳ học.
- Quản trị viên bật hoặc tắt trạng thái mở đăng ký môn học.
- Quản trị viên bật hoặc tắt trạng thái mở phúc khảo.
- Hệ thống sử dụng điểm qua môn mặc định của kỳ học nếu môn học không có điểm qua môn riêng.

Ràng buộc nghiệp vụ:

- Mã kỳ học là duy nhất.
- Một năm học không được trùng số kỳ.
- Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.
- Sinh viên chỉ được đăng ký môn khi kỳ học đang mở đăng ký.
- Sinh viên chỉ được phúc khảo khi kỳ học đang mở phúc khảo.

### 3.4. Phân hệ quản lý lớp

Hệ thống có hai loại lớp:

- Lớp hành chính: lớp theo khóa/ngành, có giảng viên chủ nhiệm.
- Lớp học phần: lớp mở theo môn học và kỳ học, có giảng viên bộ môn, lịch học, ca học, phòng học và sĩ số tối đa.

#### 3.4.1. Lớp hành chính

Thông tin lớp hành chính gồm:

- Mã lớp.
- Tên lớp.
- Ngành.
- Khóa.
- Giảng viên chủ nhiệm.
- Danh sách sinh viên thuộc lớp.

Nghiệp vụ chính:

- Quản trị viên tạo, sửa, xóa lớp hành chính.
- Quản trị viên gán giảng viên chủ nhiệm cho lớp.
- Giảng viên chủ nhiệm xem danh sách sinh viên lớp mình phụ trách.
- Giảng viên chủ nhiệm có thể thêm sinh viên vào lớp, tạo sinh viên mới trong lớp hoặc xóa sinh viên khỏi lớp.

Ràng buộc nghiệp vụ:

- Mã lớp hành chính là duy nhất.
- Một giảng viên chỉ được chủ nhiệm một lớp hành chính tại một thời điểm.
- Sinh viên có thể chưa thuộc lớp hành chính hoặc thuộc một lớp hành chính cụ thể.

#### 3.4.2. Lớp học phần

Thông tin lớp học phần gồm:

- Kỳ học.
- Môn học.
- Mã lớp học phần.
- Tên lớp học phần.
- Giảng viên bộ môn.
- Sĩ số tối đa.
- Lịch học.
- Ca học.
- Phòng học.
- Trạng thái lớp học phần.

Nghiệp vụ chính:

- Quản trị viên tạo, sửa, xóa lớp học phần.
- Quản trị viên chọn kỳ học, môn học và giảng viên giảng dạy cho lớp học phần.
- Giảng viên xem các lớp học phần mình được phân công.
- Sinh viên sau khi được xếp lớp sẽ nhìn thấy lớp học phần tương ứng.
- Hệ thống dùng lớp học phần để phát sinh bảng điểm.

Ràng buộc nghiệp vụ:

- Mã lớp học phần không được trùng trong cùng một kỳ học.
- Lớp học phần chỉ nhận sinh viên khi trạng thái đang mở.
- Nếu có sĩ số tối đa, hệ thống không cho xếp thêm sinh viên khi lớp đã đủ sĩ số.

### 3.5. Phân hệ đăng ký môn học

Đăng ký môn học là luồng nghiệp vụ kết nối sinh viên, môn học, kỳ học và lớp học phần.

Quy trình chính:

1. Quản trị viên tạo kỳ học và mở đăng ký.
2. Quản trị viên tạo các lớp học phần cho môn học trong kỳ.
3. Sinh viên xem danh sách môn đang mở đăng ký.
4. Sinh viên gửi yêu cầu đăng ký môn học.
5. Đăng ký ban đầu có trạng thái `cho_xep_lop`.
6. Quản trị viên xem danh sách đăng ký đang chờ.
7. Quản trị viên xếp sinh viên vào lớp học phần phù hợp.
8. Sau khi xếp lớp thành công, đăng ký chuyển sang trạng thái `da_dang_ky`.
9. Hệ thống tự động tạo hoặc cập nhật bảng điểm cho sinh viên trong lớp học phần.

Trạng thái đăng ký:

- `cho_xep_lop`: sinh viên đã đăng ký môn, đang chờ quản trị viên xếp lớp học phần.
- `da_dang_ky`: sinh viên đã được xếp vào lớp học phần.
- `da_huy`: đăng ký đã bị hủy.

Ràng buộc nghiệp vụ:

- Sinh viên chỉ đăng ký môn học, không tự chọn lớp học phần trong luồng đăng ký chính.
- Quản trị viên chịu trách nhiệm xếp sinh viên vào lớp học phần.
- Sinh viên không được đăng ký trùng cùng một môn trong cùng một kỳ học.
- Khi xếp lớp, lớp học phần phải đúng kỳ học và đúng môn học sinh viên đã đăng ký.
- Sinh viên phải đạt môn tiên quyết trước khi được đăng ký môn có ràng buộc tiên quyết.
- Sinh viên hoặc quản trị viên có thể hủy đăng ký khi đăng ký còn trong thời gian cho phép.

### 3.6. Phân hệ quản lý điểm

Bảng điểm lưu kết quả học tập của sinh viên trong một lớp học phần. Bảng điểm được tạo tự động khi sinh viên được xếp vào lớp học phần.

Thông tin bảng điểm gồm:

- Sinh viên.
- Lớp học phần.
- Đăng ký môn học tương ứng.
- Điểm chuyên cần.
- Điểm giữa kỳ.
- Điểm cuối kỳ.
- Điểm tổng kết.
- Điểm chữ.
- Kết quả.
- Trạng thái bảng điểm.
- Người chấm, ngày chấm.
- Người chốt, ngày chốt.
- Ghi chú.

Công thức tính điểm tổng kết:

```text
Điểm tổng kết = Điểm chuyên cần * 10% + Điểm giữa kỳ * 30% + Điểm cuối kỳ * 60%
```

Trong màn hình tổng quan sinh viên, nếu thiếu điểm chuyên cần nhưng có điểm giữa kỳ và cuối kỳ, hệ thống có thể tính tham khảo:

```text
Điểm tổng kết = Điểm giữa kỳ * 40% + Điểm cuối kỳ * 60%
```

Trạng thái kết quả:

- `chua_co_diem`: chưa có đủ dữ liệu điểm.
- `qua_mon`: sinh viên đạt môn học.
- `truot`: sinh viên không đạt môn học.

Trạng thái bảng điểm:

- `nhap_diem`: bảng điểm đang được nhập hoặc chỉnh sửa.
- `da_chot`: bảng điểm đã được chốt.

Ràng buộc nghiệp vụ:

- Điểm số nằm trong khoảng từ 0 đến 10.
- Giảng viên chỉ được chấm điểm lớp học phần mình phụ trách.
- Quản trị viên có quyền cập nhật điểm khi cần.
- Nếu bảng điểm đã chốt, giảng viên không được chỉnh sửa điểm.
- Sinh viên qua môn khi điểm tổng kết và các đầu điểm liên quan đạt ngưỡng điểm qua môn.
- Nếu bất kỳ đầu điểm nào thấp hơn điểm qua môn, kết quả là trượt.
- Khi điểm thay đổi, hệ thống lưu lịch sử chấm điểm.

### 3.7. Phân hệ phúc khảo

Phúc khảo cho phép sinh viên yêu cầu xem xét lại điểm sau khi có kết quả.

Quy trình chính:

1. Quản trị viên mở phúc khảo trong kỳ học.
2. Sinh viên chọn bảng điểm cần phúc khảo.
3. Sinh viên nhập nội dung phúc khảo và gửi yêu cầu.
4. Yêu cầu phúc khảo có trạng thái `cho_xu_ly`.
5. Giảng viên phụ trách lớp học phần hoặc quản trị viên xử lý yêu cầu.
6. Nếu chấp nhận, người xử lý nhập điểm mới.
7. Hệ thống cập nhật điểm tổng kết, tính lại kết quả và ghi lịch sử chấm điểm.
8. Yêu cầu chuyển sang trạng thái `chap_nhan` hoặc `tu_choi`.

Trạng thái phúc khảo:

- `cho_xu_ly`: yêu cầu mới, chưa xử lý.
- `chap_nhan`: yêu cầu được chấp nhận và có thể cập nhật điểm mới.
- `tu_choi`: yêu cầu bị từ chối.

Ràng buộc nghiệp vụ:

- Chỉ sinh viên được gửi yêu cầu phúc khảo cho bảng điểm của chính mình.
- Chỉ gửi được phúc khảo khi kỳ học đang mở phúc khảo.
- Nếu chấp nhận phúc khảo, bắt buộc phải nhập điểm mới.
- Giảng viên chỉ xử lý phúc khảo của lớp học phần mình phụ trách.
- Quản trị viên có quyền xử lý mọi yêu cầu phúc khảo.

### 3.8. Phân hệ chủ nhiệm và tổng quan sinh viên

Phân hệ này giúp giảng viên chủ nhiệm và quản trị viên theo dõi quá trình học tập của sinh viên.

Nghiệp vụ chính:

- Xem danh sách sinh viên theo lớp hành chính.
- Thêm sinh viên có sẵn vào lớp hành chính.
- Tạo tài khoản và hồ sơ sinh viên mới trong lớp hành chính.
- Xóa sinh viên khỏi lớp hành chính.
- Xem tổng quan học tập của từng sinh viên.

Thông tin tổng quan gồm:

- Thông tin sinh viên, mã số sinh viên, lớp hành chính.
- Danh sách môn đang học.
- Danh sách môn đã qua.
- Danh sách môn bị trượt.
- Danh sách môn còn nợ.

Ràng buộc nghiệp vụ:

- Giảng viên chủ nhiệm chỉ xem và quản lý sinh viên thuộc lớp mình chủ nhiệm.
- Quản trị viên được xem và quản lý toàn bộ.
- Môn còn nợ được xác định theo chương trình đào tạo nếu sinh viên có chương trình đào tạo; nếu chưa có, hệ thống dùng các môn bị trượt để thống kê.

## 4. Mô hình dữ liệu nghiệp vụ

### 4.1. Người dùng

`nguoi_dungs`

- Lưu tài khoản đăng nhập.
- Liên kết một-một với `sinh_viens` hoặc `giao_viens` tùy vai trò.

`sinh_viens`

- Lưu hồ sơ sinh viên.
- Thuộc một tài khoản người dùng.
- Có thể thuộc một lớp hành chính.
- Có nhiều đăng ký môn học và nhiều bảng điểm.

`giao_viens`

- Lưu hồ sơ giảng viên.
- Thuộc một tài khoản người dùng.
- Có thể được phân công giảng dạy lớp học phần.
- Có thể được phân công làm giảng viên chủ nhiệm lớp hành chính.

### 4.2. Môn học và chương trình học

`mon_hocs`

- Lưu danh mục môn học.
- Được dùng trong lớp học phần, đăng ký môn học và quản lý điểm.

`mon_hoc_tien_quyet`

- Lưu quan hệ môn học tiên quyết.

`chuong_trinh_dao_taos`

- Lưu chương trình đào tạo theo ngành, khóa, niên khóa.

`chuong_trinh_mon_hoc`

- Lưu danh sách môn thuộc chương trình đào tạo.

### 4.3. Lớp và học kỳ

`hoc_kies`

- Lưu kỳ học, trạng thái mở đăng ký, mở phúc khảo và điểm qua môn mặc định.

`lop_hanh_chinhs`

- Lưu lớp hành chính, ngành, khóa và giảng viên chủ nhiệm.

`lop_hoc_phans`

- Lưu lớp học phần theo kỳ học và môn học.
- Có giảng viên bộ môn, lịch học, ca học, phòng học, sĩ số tối đa.

### 4.4. Đăng ký và điểm

`dang_ky_mon_hocs`

- Lưu đăng ký môn học của sinh viên.
- Liên kết sinh viên, kỳ học, môn học và lớp học phần sau khi xếp lớp.

`bang_diems`

- Lưu điểm của sinh viên trong lớp học phần.
- Mỗi đăng ký môn học sau khi xếp lớp có một bảng điểm.

`lich_su_cham_diems`

- Lưu lịch sử thay đổi điểm.
- Ghi nhận điểm trước, điểm sau, người chấm và lý do.

`phuc_khaos`

- Lưu yêu cầu phúc khảo điểm của sinh viên.
- Liên kết bảng điểm, sinh viên, lớp học phần và giảng viên xử lý.

## 5. Luồng nghiệp vụ tiêu biểu

### 5.1. Luồng tạo tài khoản sinh viên

1. Quản trị viên vào màn hình danh sách tài khoản.
2. Quản trị viên nhập email, họ tên, mật khẩu và chọn vai trò sinh viên.
3. Hệ thống kiểm tra email chưa tồn tại.
4. Hệ thống tạo tài khoản trong bảng người dùng.
5. Hệ thống tạo hồ sơ sinh viên liên kết với tài khoản.
6. Sinh viên dùng tài khoản được cấp để đăng nhập.

### 5.2. Luồng mở môn và đăng ký môn học

1. Quản trị viên tạo môn học và đặt trạng thái đang mở.
2. Quản trị viên tạo kỳ học và bật mở đăng ký.
3. Quản trị viên tạo lớp học phần cho môn trong kỳ học.
4. Sinh viên xem danh sách môn được mở đăng ký.
5. Sinh viên gửi đăng ký môn học.
6. Hệ thống kiểm tra kỳ học đang mở, môn học đang mở và môn tiên quyết.
7. Hệ thống tạo đăng ký trạng thái chờ xếp lớp.
8. Quản trị viên chọn lớp học phần phù hợp để xếp sinh viên.
9. Hệ thống chuyển đăng ký sang đã đăng ký và tạo bảng điểm.

### 5.3. Luồng chấm điểm

1. Giảng viên vào màn hình chấm điểm.
2. Giảng viên chọn lớp học phần mình phụ trách.
3. Hệ thống hiển thị danh sách bảng điểm của sinh viên trong lớp.
4. Giảng viên nhập điểm chuyên cần, giữa kỳ, cuối kỳ.
5. Hệ thống tự tính điểm tổng kết nếu đủ dữ liệu.
6. Hệ thống xác định kết quả qua môn hoặc trượt.
7. Giảng viên chốt điểm.
8. Bảng điểm chuyển sang trạng thái đã chốt.

### 5.4. Luồng phúc khảo

1. Quản trị viên mở phúc khảo cho kỳ học.
2. Sinh viên xem bảng điểm cá nhân.
3. Sinh viên chọn môn cần phúc khảo và nhập nội dung.
4. Hệ thống tạo yêu cầu phúc khảo trạng thái chờ xử lý.
5. Giảng viên hoặc quản trị viên xem yêu cầu.
6. Người xử lý chọn chấp nhận hoặc từ chối.
7. Nếu chấp nhận, hệ thống cập nhật điểm mới và ghi lịch sử chấm điểm.
8. Sinh viên xem trạng thái và kết quả xử lý.

### 5.5. Luồng theo dõi sinh viên chủ nhiệm

1. Quản trị viên gán giảng viên chủ nhiệm cho lớp hành chính.
2. Giảng viên chủ nhiệm vào màn hình chủ nhiệm.
3. Giảng viên xem danh sách sinh viên trong lớp.
4. Giảng viên chọn một sinh viên để xem tổng quan học tập.
5. Hệ thống hiển thị các nhóm môn đang học, đã qua, bị trượt và còn nợ.

## 6. Yêu cầu chức năng

### 6.1. Đối với quản trị viên

- Đăng nhập và sử dụng hệ thống theo quyền quản trị.
- Quản lý tài khoản người dùng.
- Quản lý môn học.
- Quản lý kỳ học.
- Quản lý cấu hình học vụ.
- Quản lý lớp hành chính.
- Quản lý lớp học phần.
- Xếp lớp học phần cho sinh viên.
- Theo dõi đăng ký môn học.
- Theo dõi và cập nhật bảng điểm.
- Xử lý phúc khảo khi cần.
- Xem thống kê điểm và dữ liệu học tập.

### 6.2. Đối với giảng viên

- Đăng nhập và sử dụng hệ thống theo quyền giảng viên.
- Xem lớp học phần được phân công.
- Xem danh sách sinh viên trong lớp học phần.
- Nhập điểm, cập nhật điểm và chốt điểm.
- Xử lý phúc khảo của lớp mình phụ trách.
- Quản lý lớp chủ nhiệm nếu được phân công.
- Xem tổng quan học tập của sinh viên trong lớp chủ nhiệm.

### 6.3. Đối với sinh viên

- Đăng nhập và sử dụng hệ thống theo quyền sinh viên.
- Xem môn học đang mở.
- Đăng ký môn học.
- Hủy đăng ký môn học khi còn được phép.
- Xem lớp học phần đã được xếp.
- Xem bảng điểm cá nhân.
- Gửi phúc khảo điểm.
- Xem kết quả xử lý phúc khảo.

## 7. Yêu cầu phi chức năng

### 7.1. Bảo mật

- Hệ thống yêu cầu đăng nhập trước khi truy cập API nghiệp vụ.
- API sử dụng cơ chế xác thực token qua Laravel Sanctum.
- Chức năng được kiểm soát theo vai trò người dùng.
- Người dùng chỉ được xem dữ liệu thuộc phạm vi quyền của mình.

### 7.2. Tính toàn vẹn dữ liệu

- Email, mã môn học, mã lớp và mã kỳ học cần đảm bảo duy nhất.
- Điểm số phải nằm trong khoảng từ 0 đến 10.
- Đăng ký môn học phải gắn đúng sinh viên, kỳ học, môn học và lớp học phần.
- Bảng điểm phải gắn với đúng đăng ký môn học.
- Các thay đổi điểm quan trọng phải được ghi lịch sử.

### 7.3. Tính dễ sử dụng

- Giao diện web phân tách rõ theo vai trò.
- Dữ liệu dạng danh sách hỗ trợ lọc, tìm kiếm và phân trang.
- Các thao tác quan trọng như xóa, khóa tài khoản, chốt điểm cần có xác nhận hoặc phản hồi trạng thái.

### 7.4. Khả năng mở rộng

- Có thể mở rộng thêm vai trò nếu cần.
- Có thể bổ sung quy tắc tính điểm theo từng môn học.
- Có thể bổ sung quy trình duyệt đăng ký môn hoặc duyệt phúc khảo nhiều cấp.
- Có thể tích hợp thêm chức năng nhập điểm từ file hoặc nhận dạng điểm viết tay.

## 8. Kết luận

Dự án hướng tới xây dựng một hệ thống quản lý học vụ phục vụ ba nhóm người dùng chính: quản trị viên, giảng viên và sinh viên. Hệ thống bao phủ các nghiệp vụ cốt lõi của quá trình đào tạo gồm quản lý tài khoản, môn học, lớp học, đăng ký học phần, chấm điểm, phúc khảo và theo dõi kết quả học tập.

Với kiến trúc client-server, hệ thống có khả năng tách biệt giao diện và xử lý nghiệp vụ, thuận lợi cho việc bảo trì, mở rộng và tích hợp thêm các chức năng nâng cao như thống kê hoặc hỗ trợ nhận dạng điểm từ ảnh.
