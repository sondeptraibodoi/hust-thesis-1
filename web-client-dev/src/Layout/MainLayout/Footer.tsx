import imgFooterLogoUrl from "@/assets/static/logo-hust-02.png";
const Footer = () => {
  return (
    <div className="flex-grow-0">
      <div className="footer1">
        <img
          src={imgFooterLogoUrl}
          className="max-h-[100px]"
          alt="Khoa Toán - Tin - Faculty of Mathematics and Informatics"
        />
        <div className="text-right">
          <div>Bản quyền thuộc về Khoa Toán - Tin, Đại học Bách khoa Hà Nội</div>
          <div>Văn phòng: Phòng 106 - Tòa nhà D3 01 Đại Cồ Việt - Quận Hai Bà Trưng - Hà Nội</div>
          <div>Điện thoại: 04 3869 2137 - Fax: 04 3868 2470</div>
          <div>Email: fami@hust.edu.vn</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
