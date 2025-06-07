import imgFooterLogoUrl from "@/assets/static/logo-hust-02.png";
const Footer = () => {
  return (
    <div className="flex-grow-0">
      <div className="footer1">
        <img
          src={imgFooterLogoUrl}
          className="max-h-[100px]"
          alt="Khoa điện tử viễn thông "
        />
        <div className="text-right">
          <div>Bản quyền thuộc về Khoa Điện tử viễn thông, Đại học Bách khoa Hà Nội</div>
          <div>Văn phòng: Văn phòng: C1 - 320 - Quận Hai Bà Trưng - Hà Nội</div>
          <div>Điện thoại: 024 3869 6211  & 024 3623 1478</div>
          <div>Email: seee@hust.edu.vn</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
