import { Link } from "react-router-dom";
import imglogoNewUrl from "@/assets/static/logoNew.png";

const AdminHeader = () => {
  return (
    <div className="px-[15px]">
      <Link to="/">
        <img
          src={imglogoNewUrl}
          className="max-h-[80px] absolute"
          alt="Khoa điện tử viễn thông "
        />
      </Link>{" "}
    </div>
  );
};
export default AdminHeader;
