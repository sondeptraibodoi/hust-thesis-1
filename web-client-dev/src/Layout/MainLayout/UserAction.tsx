import ProfileDrawer from "@/Layout/MainLayout/profile";
import { getAuthUser } from "@/stores/features/auth";
import { useAppSelector } from "@/stores/hook";
import { Avatar } from "antd";
import { useState } from "react";
// import { features } from "process";

const UserAction = () => {
  const authUser = useAppSelector(getAuthUser);
  const [openDawer, setOpenDawer] = useState(false);
  const userName = authUser?.username.split("")[0];
  return (
    <div>
      {authUser && (
        <div className="flex items-center">
          <Avatar
            onClick={() => {
              setOpenDawer(true);
            }}
            style={{
              verticalAlign: "middle",
              cursor: "pointer"
            }}
            className="flex items-center justify-center bg-primary"
            size={"large"}
            src={authUser?.avatar_url ? authUser.avatar_url : undefined}
          >
            {authUser?.avatar_url ? (
              <></>
            ) : (
              <span className="text-[24px] h-full w-full text-white uppercase">{userName}</span>
            )}
          </Avatar>
          <ProfileDrawer
            openState={openDawer}
            closefunct={() => {
              setOpenDawer(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserAction;
