# SƠ ĐỒ DFD DỰ ÁN

Tài liệu này mô tả sơ đồ luồng dữ liệu của hệ thống quản lý học vụ, lớp học, môn học, điểm số và đánh giá kết quả học tập.

Ký hiệu sử dụng trong sơ đồ:

- Ô vuông: tác nhân bên ngoài hệ thống.
- Ô bo tròn: tiến trình xử lý.
- Hình trụ: kho dữ liệu.
- Mũi tên: luồng dữ liệu.

## 1. DFD mức ngữ cảnh

Sơ đồ mức ngữ cảnh thể hiện hệ thống như một tiến trình tổng quát và mô tả luồng dữ liệu giữa hệ thống với ba nhóm người dùng chính.

```mermaid
flowchart LR
    Admin["Quản trị viên"]
    Teacher["Giảng viên"]
    Student["Sinh viên"]

    System(["Hệ thống quản lý học vụ, lớp học, môn học và điểm số"])

    Admin -- "Thông tin tài khoản, môn học, kỳ học, lớp, phân công, xếp lớp" --> System
    System -- "Danh sách người dùng, môn học, lớp, đăng ký, điểm, thống kê" --> Admin

    Teacher -- "Thông tin lớp giảng dạy, điểm, xử lý phúc khảo, dữ liệu chủ nhiệm" --> System
    System -- "Danh sách lớp, sinh viên, bảng điểm, yêu cầu phúc khảo, tổng quan học tập" --> Teacher

    Student -- "Đăng ký môn, hủy đăng ký, yêu cầu phúc khảo" --> System
    System -- "Môn mở, lớp đã xếp, bảng điểm, kết quả phúc khảo" --> Student
```

## 2. DFD mức 0

Sơ đồ mức 0 phân rã hệ thống thành các tiến trình nghiệp vụ chính và các kho dữ liệu trung tâm.

```mermaid
flowchart TB
    Admin["Quản trị viên"]
    Teacher["Giảng viên"]
    Student["Sinh viên"]

    P1(["1.0 Quản lý người dùng"])
    P2(["2.0 Quản lý môn học và học kỳ"])
    P3(["3.0 Quản lý lớp"])
    P4(["4.0 Đăng ký môn học"])
    P5(["5.0 Quản lý điểm"])
    P6(["6.0 Quản lý phúc khảo"])
    P7(["7.0 Thống kê và tổng quan học tập"])

    D1[("D1 Người dùng")]
    D2[("D2 Sinh viên")]
    D3[("D3 Giảng viên")]
    D4[("D4 Môn học")]
    D5[("D5 Kỳ học và cấu hình")]
    D6[("D6 Lớp hành chính")]
    D7[("D7 Lớp học phần")]
    D8[("D8 Đăng ký môn học")]
    D9[("D9 Bảng điểm")]
    D10[("D10 Lịch sử chấm điểm")]
    D11[("D11 Phúc khảo")]

    Admin -- "Tạo/sửa/xóa/khóa tài khoản" --> P1
    P1 -- "Thông tin tài khoản" --> D1
    P1 -- "Hồ sơ sinh viên" --> D2
    P1 -- "Hồ sơ giảng viên" --> D3
    D1 -- "Danh sách tài khoản" --> P1
    P1 -- "Kết quả quản lý tài khoản" --> Admin

    Admin -- "Môn học, kỳ học, cấu hình" --> P2
    Teacher -- "Tra cứu môn được phân công" --> P2
    Student -- "Tra cứu môn đang mở" --> P2
    P2 -- "Dữ liệu môn học" --> D4
    P2 -- "Dữ liệu kỳ học/cấu hình" --> D5
    D4 -- "Danh mục môn học" --> P2
    D5 -- "Trạng thái kỳ học" --> P2
    P2 -- "Danh sách môn/kỳ học" --> Admin
    P2 -- "Môn được phép xem" --> Teacher
    P2 -- "Môn đang mở" --> Student

    Admin -- "Lớp hành chính, lớp học phần" --> P3
    Teacher -- "Quản lý lớp chủ nhiệm/lớp giảng dạy" --> P3
    P3 -- "Dữ liệu lớp hành chính" --> D6
    P3 -- "Dữ liệu lớp học phần" --> D7
    D2 -- "Hồ sơ sinh viên" --> P3
    D3 -- "Hồ sơ giảng viên" --> P3
    P3 -- "Danh sách lớp và sinh viên" --> Admin
    P3 -- "Danh sách lớp phụ trách" --> Teacher

    Student -- "Yêu cầu đăng ký/hủy môn" --> P4
    Admin -- "Xếp lớp học phần" --> P4
    D2 -- "Thông tin sinh viên" --> P4
    D4 -- "Môn học và tiên quyết" --> P4
    D5 -- "Kỳ học mở đăng ký" --> P4
    D7 -- "Lớp học phần và sĩ số" --> P4
    P4 -- "Đăng ký môn học" --> D8
    P4 -- "Bảng điểm phát sinh" --> D9
    P4 -- "Trạng thái đăng ký" --> Student
    P4 -- "Danh sách chờ xếp lớp" --> Admin

    Teacher -- "Nhập/chốt điểm" --> P5
    Admin -- "Cập nhật điểm" --> P5
    Student -- "Xem bảng điểm" --> P5
    D8 -- "Đăng ký đã xếp lớp" --> P5
    D9 -- "Bảng điểm hiện tại" --> P5
    D4 -- "Điểm qua môn" --> P5
    D5 -- "Điểm qua môn mặc định" --> P5
    P5 -- "Điểm sau cập nhật" --> D9
    P5 -- "Lịch sử thay đổi điểm" --> D10
    P5 -- "Bảng điểm/kết quả" --> Student
    P5 -- "Danh sách điểm lớp" --> Teacher

    Student -- "Yêu cầu phúc khảo" --> P6
    Teacher -- "Kết quả xử lý phúc khảo" --> P6
    Admin -- "Xử lý phúc khảo" --> P6
    D5 -- "Kỳ học mở phúc khảo" --> P6
    D9 -- "Bảng điểm cần phúc khảo" --> P6
    P6 -- "Yêu cầu phúc khảo" --> D11
    P6 -- "Điểm mới nếu chấp nhận" --> D9
    P6 -- "Lịch sử phúc khảo" --> D10
    P6 -- "Trạng thái phúc khảo" --> Student

    Admin -- "Yêu cầu thống kê" --> P7
    Teacher -- "Xem tổng quan sinh viên" --> P7
    D2 -- "Sinh viên" --> P7
    D6 -- "Lớp hành chính" --> P7
    D8 -- "Đăng ký môn" --> P7
    D9 -- "Bảng điểm" --> P7
    D11 -- "Phúc khảo" --> P7
    P7 -- "Báo cáo, thống kê, tổng quan học tập" --> Admin
    P7 -- "Tổng quan sinh viên chủ nhiệm" --> Teacher
```

## 3. DFD mức 1 - Quản lý người dùng

```mermaid
flowchart LR
    Admin["Quản trị viên"]

    P11(["1.1 Nhập thông tin tài khoản"])
    P12(["1.2 Kiểm tra dữ liệu"])
    P13(["1.3 Tạo/cập nhật tài khoản"])
    P14(["1.4 Tạo/cập nhật hồ sơ theo vai trò"])
    P15(["1.5 Khóa, mở khóa hoặc xóa tài khoản"])

    D1[("D1 Người dùng")]
    D2[("D2 Sinh viên")]
    D3[("D3 Giảng viên")]

    Admin -- "Email, họ tên, mật khẩu, vai trò" --> P11
    P11 -- "Dữ liệu tài khoản" --> P12
    D1 -- "Email đã tồn tại, vai trò hiện tại" --> P12
    P12 -- "Dữ liệu hợp lệ" --> P13
    P13 -- "Tài khoản" --> D1
    P13 -- "Vai trò tài khoản" --> P14
    P14 -- "Hồ sơ sinh viên" --> D2
    P14 -- "Hồ sơ giảng viên" --> D3
    Admin -- "Yêu cầu khóa/mở khóa/xóa" --> P15
    P15 -- "Trạng thái hoặc lệnh xóa" --> D1
    P13 -- "Kết quả lưu tài khoản" --> Admin
    P15 -- "Kết quả cập nhật trạng thái" --> Admin
```

## 4. DFD mức 1 - Quản lý môn học và kỳ học

```mermaid
flowchart LR
    Admin["Quản trị viên"]
    Teacher["Giảng viên"]
    Student["Sinh viên"]

    P21(["2.1 Quản lý môn học"])
    P22(["2.2 Quản lý môn tiên quyết"])
    P23(["2.3 Quản lý kỳ học"])
    P24(["2.4 Cấu hình mở đăng ký/phúc khảo"])
    P25(["2.5 Tra cứu môn học theo quyền"])

    D3[("D3 Giảng viên")]
    D4[("D4 Môn học")]
    D5[("D5 Kỳ học và cấu hình")]
    D13[("D13 Phân công giảng viên - môn")]

    Admin -- "Mã môn, tên môn, tín chỉ, trạng thái" --> P21
    P21 -- "Môn học" --> D4
    Admin -- "Môn học tiên quyết" --> P22
    P22 -- "Quan hệ tiên quyết" --> D4

    Admin -- "Mã kỳ, năm học, kỳ số" --> P23
    P23 -- "Kỳ học" --> D5
    Admin -- "Mở đăng ký, mở phúc khảo, điểm qua môn" --> P24
    P24 -- "Cấu hình học vụ" --> D5

    Teacher -- "Yêu cầu xem môn được phân công" --> P25
    Student -- "Yêu cầu xem môn đang mở" --> P25
    Admin -- "Yêu cầu xem toàn bộ môn" --> P25
    D3 -- "Thông tin giảng viên" --> P25
    D13 -- "Môn được phân công" --> P25
    D4 -- "Danh mục môn học" --> P25
    D5 -- "Kỳ học đang mở" --> P25
    P25 -- "Danh sách môn phù hợp quyền" --> Admin
    P25 -- "Danh sách môn phù hợp quyền" --> Teacher
    P25 -- "Danh sách môn đang mở" --> Student
```

## 5. DFD mức 1 - Quản lý lớp

```mermaid
flowchart TB
    Admin["Quản trị viên"]
    Teacher["Giảng viên"]

    P31(["3.1 Tạo/sửa lớp hành chính"])
    P32(["3.2 Gán giảng viên chủ nhiệm"])
    P33(["3.3 Quản lý sinh viên trong lớp hành chính"])
    P34(["3.4 Tạo/sửa lớp học phần"])
    P35(["3.5 Phân công giảng viên bộ môn"])
    P36(["3.6 Tra cứu lớp theo quyền"])

    D2[("D2 Sinh viên")]
    D3[("D3 Giảng viên")]
    D4[("D4 Môn học")]
    D5[("D5 Kỳ học")]
    D6[("D6 Lớp hành chính")]
    D7[("D7 Lớp học phần")]

    Admin -- "Mã lớp, tên lớp, ngành, khóa" --> P31
    P31 -- "Lớp hành chính" --> D6
    Admin -- "Giảng viên chủ nhiệm" --> P32
    D3 -- "Danh sách giảng viên" --> P32
    P32 -- "Cập nhật chủ nhiệm" --> D6

    Teacher -- "Thêm/xóa sinh viên lớp chủ nhiệm" --> P33
    Admin -- "Thêm/xóa sinh viên vào lớp" --> P33
    D6 -- "Lớp hành chính" --> P33
    P33 -- "Cập nhật lớp của sinh viên" --> D2

    Admin -- "Kỳ học, môn học, mã lớp học phần" --> P34
    D4 -- "Môn học" --> P34
    D5 -- "Kỳ học" --> P34
    P34 -- "Lớp học phần" --> D7

    Admin -- "Giảng viên bộ môn, lịch học, ca học, phòng học" --> P35
    D3 -- "Danh sách giảng viên" --> P35
    P35 -- "Phân công giảng dạy" --> D7

    Admin -- "Yêu cầu xem lớp" --> P36
    Teacher -- "Yêu cầu xem lớp phụ trách" --> P36
    D6 -- "Lớp hành chính" --> P36
    D7 -- "Lớp học phần" --> P36
    D2 -- "Danh sách sinh viên" --> P36
    P36 -- "Danh sách lớp và sinh viên" --> Admin
    P36 -- "Lớp chủ nhiệm/lớp giảng dạy" --> Teacher
```

## 6. DFD mức 1 - Đăng ký môn học và xếp lớp

```mermaid
flowchart TB
    Student["Sinh viên"]
    Admin["Quản trị viên"]

    P41(["4.1 Xem môn mở đăng ký"])
    P42(["4.2 Gửi đăng ký môn học"])
    P43(["4.3 Kiểm tra điều kiện đăng ký"])
    P44(["4.4 Lưu đăng ký chờ xếp lớp"])
    P45(["4.5 Xếp lớp học phần"])
    P46(["4.6 Tạo bảng điểm"])
    P47(["4.7 Hủy đăng ký"])

    D2[("D2 Sinh viên")]
    D4[("D4 Môn học và tiên quyết")]
    D5[("D5 Kỳ học")]
    D7[("D7 Lớp học phần")]
    D8[("D8 Đăng ký môn học")]
    D9[("D9 Bảng điểm")]

    Student -- "Yêu cầu môn mở" --> P41
    D4 -- "Môn đang mở" --> P41
    D5 -- "Kỳ học mở đăng ký" --> P41
    D7 -- "Số lớp mở theo môn" --> P41
    P41 -- "Danh sách môn có thể đăng ký" --> Student

    Student -- "Kỳ học, môn học" --> P42
    P42 -- "Thông tin đăng ký" --> P43
    D2 -- "Hồ sơ sinh viên" --> P43
    D4 -- "Môn học, môn tiên quyết" --> P43
    D5 -- "Trạng thái mở đăng ký" --> P43
    D8 -- "Đăng ký hiện có" --> P43
    P43 -- "Đăng ký hợp lệ" --> P44
    P44 -- "Trạng thái cho_xep_lop" --> D8
    P44 -- "Thông báo chờ xếp lớp" --> Student

    Admin -- "Chọn đăng ký và lớp học phần" --> P45
    D8 -- "Đăng ký chờ xếp lớp" --> P45
    D7 -- "Lớp học phần, sĩ số, trạng thái" --> P45
    P45 -- "Đăng ký đã xếp lớp" --> D8
    P45 -- "Thông tin đăng ký đã xếp" --> P46
    P46 -- "Bảng điểm ban đầu" --> D9
    P45 -- "Kết quả xếp lớp" --> Admin

    Student -- "Yêu cầu hủy đăng ký" --> P47
    Admin -- "Yêu cầu hủy đăng ký" --> P47
    D5 -- "Kỳ học còn mở đăng ký" --> P47
    D8 -- "Thông tin đăng ký" --> P47
    P47 -- "Trạng thái da_huy" --> D8
    P47 -- "Kết quả hủy đăng ký" --> Student
    P47 -- "Kết quả hủy đăng ký" --> Admin
```

## 7. DFD mức 1 - Quản lý điểm

```mermaid
flowchart TB
    Teacher["Giảng viên"]
    Admin["Quản trị viên"]
    Student["Sinh viên"]

    P51(["5.1 Xem danh sách bảng điểm"])
    P52(["5.2 Nhập/cập nhật điểm"])
    P53(["5.3 Tính điểm tổng kết"])
    P54(["5.4 Xác định kết quả qua/trượt"])
    P55(["5.5 Ghi lịch sử chấm điểm"])
    P56(["5.6 Chốt điểm"])
    P57(["5.7 Sinh viên xem điểm"])

    D4[("D4 Môn học")]
    D5[("D5 Kỳ học")]
    D7[("D7 Lớp học phần")]
    D8[("D8 Đăng ký môn học")]
    D9[("D9 Bảng điểm")]
    D10[("D10 Lịch sử chấm điểm")]

    Teacher -- "Lớp học phần phụ trách" --> P51
    Admin -- "Lọc theo lớp/sinh viên" --> P51
    D7 -- "Lớp học phần" --> P51
    D8 -- "Sinh viên đã đăng ký" --> P51
    D9 -- "Bảng điểm hiện tại" --> P51
    P51 -- "Danh sách bảng điểm" --> Teacher
    P51 -- "Danh sách bảng điểm" --> Admin

    Teacher -- "Điểm chuyên cần, giữa kỳ, cuối kỳ, tổng kết" --> P52
    Admin -- "Điểm cần cập nhật" --> P52
    D9 -- "Điểm trước cập nhật" --> P52
    P52 -- "Dữ liệu điểm" --> P53
    P53 -- "Điểm tổng kết" --> P54
    D4 -- "Điểm qua môn của môn" --> P54
    D5 -- "Điểm qua môn mặc định" --> P54
    P54 -- "Kết quả qua_mon/truot/chua_co_diem" --> D9
    P52 -- "Điểm trước và điểm sau" --> P55
    P55 -- "Lịch sử thay đổi điểm" --> D10
    P52 -- "Bảng điểm đã cập nhật" --> Teacher
    P52 -- "Bảng điểm đã cập nhật" --> Admin

    Teacher -- "Yêu cầu chốt điểm" --> P56
    Admin -- "Yêu cầu chốt điểm" --> P56
    D9 -- "Bảng điểm cần chốt" --> P56
    P56 -- "Trạng thái da_chot, người chốt, ngày chốt" --> D9
    P56 -- "Kết quả chốt điểm" --> Teacher
    P56 -- "Kết quả chốt điểm" --> Admin

    Student -- "Yêu cầu xem bảng điểm" --> P57
    D9 -- "Bảng điểm cá nhân" --> P57
    P57 -- "Điểm và kết quả học tập" --> Student
```

## 8. DFD mức 1 - Phúc khảo điểm

```mermaid
flowchart TB
    Student["Sinh viên"]
    Teacher["Giảng viên"]
    Admin["Quản trị viên"]

    P61(["6.1 Sinh viên gửi phúc khảo"])
    P62(["6.2 Kiểm tra điều kiện phúc khảo"])
    P63(["6.3 Lưu yêu cầu phúc khảo"])
    P64(["6.4 Xem danh sách phúc khảo"])
    P65(["6.5 Xử lý phúc khảo"])
    P66(["6.6 Cập nhật điểm sau phúc khảo"])
    P67(["6.7 Ghi lịch sử phúc khảo"])

    D5[("D5 Kỳ học")]
    D7[("D7 Lớp học phần")]
    D9[("D9 Bảng điểm")]
    D10[("D10 Lịch sử chấm điểm")]
    D11[("D11 Phúc khảo")]

    Student -- "Bảng điểm, nội dung phúc khảo" --> P61
    P61 -- "Yêu cầu phúc khảo" --> P62
    D9 -- "Bảng điểm của sinh viên" --> P62
    D5 -- "Trạng thái mở phúc khảo" --> P62
    P62 -- "Yêu cầu hợp lệ" --> P63
    P63 -- "Trạng thái cho_xu_ly, điểm cũ, ngày gửi" --> D11
    P63 -- "Thông báo đã gửi" --> Student

    Teacher -- "Yêu cầu xem phúc khảo lớp phụ trách" --> P64
    Admin -- "Yêu cầu xem toàn bộ phúc khảo" --> P64
    D7 -- "Lớp học phần và giảng viên" --> P64
    D11 -- "Danh sách phúc khảo" --> P64
    P64 -- "Danh sách yêu cầu phúc khảo" --> Teacher
    P64 -- "Danh sách yêu cầu phúc khảo" --> Admin

    Teacher -- "Chấp nhận/từ chối, điểm mới, ghi chú" --> P65
    Admin -- "Chấp nhận/từ chối, điểm mới, ghi chú" --> P65
    D11 -- "Yêu cầu cần xử lý" --> P65
    P65 -- "Kết quả xử lý" --> D11
    P65 -- "Điểm mới nếu chấp nhận" --> P66
    D9 -- "Bảng điểm hiện tại" --> P66
    P66 -- "Bảng điểm sau phúc khảo" --> D9
    P66 -- "Điểm trước/sau" --> P67
    P67 -- "Lịch sử loại phúc khảo" --> D10
    D11 -- "Trạng thái xử lý" --> Student
```

## 9. DFD mức 1 - Chủ nhiệm và tổng quan học tập

```mermaid
flowchart TB
    Teacher["Giảng viên chủ nhiệm"]
    Admin["Quản trị viên"]

    P71(["7.1 Xem danh sách sinh viên lớp chủ nhiệm"])
    P72(["7.2 Thêm/tạo sinh viên vào lớp"])
    P73(["7.3 Xóa sinh viên khỏi lớp"])
    P74(["7.4 Tổng hợp đăng ký và điểm"])
    P75(["7.5 Phân loại môn học"])

    D1[("D1 Người dùng")]
    D2[("D2 Sinh viên")]
    D4[("D4 Môn học")]
    D6[("D6 Lớp hành chính")]
    D8[("D8 Đăng ký môn học")]
    D9[("D9 Bảng điểm")]
    D14[("D14 Chương trình đào tạo")]

    Teacher -- "Yêu cầu danh sách lớp chủ nhiệm" --> P71
    Admin -- "Yêu cầu danh sách sinh viên" --> P71
    D6 -- "Lớp hành chính" --> P71
    D2 -- "Sinh viên thuộc lớp" --> P71
    P71 -- "Danh sách sinh viên" --> Teacher
    P71 -- "Danh sách sinh viên" --> Admin

    Teacher -- "Sinh viên có sẵn hoặc hồ sơ mới" --> P72
    Admin -- "Sinh viên có sẵn hoặc hồ sơ mới" --> P72
    P72 -- "Tài khoản sinh viên mới nếu tạo mới" --> D1
    P72 -- "Cập nhật lớp hành chính của sinh viên" --> D2
    P72 -- "Kết quả thêm sinh viên" --> Teacher
    P72 -- "Kết quả thêm sinh viên" --> Admin

    Teacher -- "Yêu cầu xóa khỏi lớp" --> P73
    Admin -- "Yêu cầu xóa khỏi lớp" --> P73
    P73 -- "Lớp hành chính = null" --> D2
    P73 -- "Kết quả xóa khỏi lớp" --> Teacher
    P73 -- "Kết quả xóa khỏi lớp" --> Admin

    Teacher -- "Yêu cầu tổng quan sinh viên" --> P74
    Admin -- "Yêu cầu tổng quan sinh viên" --> P74
    D2 -- "Hồ sơ sinh viên" --> P74
    D8 -- "Môn đã đăng ký" --> P74
    D9 -- "Bảng điểm" --> P74
    D14 -- "Môn trong chương trình đào tạo" --> P74
    P74 -- "Dữ liệu học tập" --> P75
    D4 -- "Danh mục môn học" --> P75
    P75 -- "Môn đang học, đã qua, bị trượt, còn nợ" --> Teacher
    P75 -- "Môn đang học, đã qua, bị trượt, còn nợ" --> Admin
```

## 10. Ma trận tiến trình và kho dữ liệu

| Tiến trình | Kho dữ liệu đọc | Kho dữ liệu ghi |
| --- | --- | --- |
| 1.0 Quản lý người dùng | Người dùng | Người dùng, Sinh viên, Giảng viên |
| 2.0 Quản lý môn học và học kỳ | Môn học, Kỳ học, Phân công giảng viên - môn | Môn học, Kỳ học và cấu hình |
| 3.0 Quản lý lớp | Sinh viên, Giảng viên, Môn học, Kỳ học | Lớp hành chính, Lớp học phần, Sinh viên |
| 4.0 Đăng ký môn học | Sinh viên, Môn học, Kỳ học, Lớp học phần, Đăng ký môn học | Đăng ký môn học, Bảng điểm |
| 5.0 Quản lý điểm | Đăng ký môn học, Bảng điểm, Môn học, Kỳ học | Bảng điểm, Lịch sử chấm điểm |
| 6.0 Quản lý phúc khảo | Kỳ học, Lớp học phần, Bảng điểm, Phúc khảo | Phúc khảo, Bảng điểm, Lịch sử chấm điểm |
| 7.0 Thống kê và tổng quan học tập | Sinh viên, Lớp hành chính, Đăng ký môn học, Bảng điểm, Phúc khảo | Không phát sinh dữ liệu chính |

## 11. Ghi chú triển khai vào báo cáo

Khi đưa vào báo cáo đồ án, có thể trình bày theo thứ tự:

1. DFD mức ngữ cảnh để giới thiệu hệ thống và tác nhân.
2. DFD mức 0 để trình bày toàn bộ phân rã chức năng.
3. DFD mức 1 cho các phân hệ quan trọng: người dùng, môn học, lớp, đăng ký môn, điểm và phúc khảo.
4. Ma trận tiến trình - kho dữ liệu để giải thích các bảng dữ liệu chính.
