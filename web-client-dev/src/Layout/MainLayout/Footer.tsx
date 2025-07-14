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
          <div>Đồ án 1</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
