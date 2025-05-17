import { Link } from "react-router-dom";
import imgLogoUrl from "@/assets/static/logo-footer.svg";
import imglogoNewUrl from "@/assets/static/logoNew.png";

const AdminHeader = () => {
  return (
    <div className="px-[15px]">
      <Link to="/">
        <img
          src={imglogoNewUrl}
          className="max-h-[80px] absolute"
          alt="Khoa Toán - Tin - Faculty of Mathematics and Informatics"
        />
        <img src={imgLogoUrl} className="max-h-[80px]" alt="Khoa Toán - Tin - Faculty of Mathematics and Informatics" />
      </Link>{" "}
    </div>
  );
};
export default AdminHeader;
