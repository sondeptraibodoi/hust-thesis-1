import "./scss/index.scss";

import { ConfigProvider, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import React, { Suspense } from "react";

import AdminHeader from "./Header";
import { DialogContainerForm } from "@/components/dialog/dialog-container";
import Footer from "./Footer";
import { GlobalHandlers } from "@/api/axios/error-handle";
import HeaderSticky from "./HeaderSticky";
import Navigation from "./Navigation";
import { PageLoading } from "@/pages/Loading";
import UserAction from "./UserAction";
import { getPrefix } from "@/constant";
import { isServerInvalid } from "@/api/axios";
import { useAppSelector } from "@/stores/hook";
import { useCheckCapNhatCode } from "@/hooks/useCheckCapNhatCode";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";

const THEME_CONFIG = {
  token: {
    colorBgContainer: "#F4F5F8",
    colorPrimary: "#c02135"
  },
  components: {
    Menu: {
      activeBarBorderWidth: 0,
      itemSelectedColor: "#fff",
      horizontalItemSelectedBg: "#033681",
      horizontalItemHoverBg: "#033681",
      horizontalItemHoverColor: "#fff"
    }
  }
};
const LAYOUT_CONFIG = {
  token: {
    colorBgContainer: "#F4F5F8"
  },
  components: {
    Menu: {
      activeBarBorderWidth: 0,
      itemSelectedColor: "#c02135",
      horizontalItemSelectedBg: "transparent",
      horizontalItemHoverBg: "transparent",
      horizontalItemHoverColor: "#c02135"
    }
  }
};
const AdminLayout: React.FC<any> = () => {
  const {
    token: { colorBgContainer }
  } = theme.useToken();
  const heightAuto = useAppSelector((state) => state.config.heightAuto);
  const navigate = useNavigate();
  GlobalHandlers.registerMany({
    ServerInvalid: {
      check: isServerInvalid,
      before() {
        navigate(getPrefix() + "/500");
      }
    }
  });
  useLoaiLopThi();
  useKiHoc();
  useCheckCapNhatCode();
  return (
    <ConfigProvider theme={THEME_CONFIG}>
      <div className="wrapper">
        <div className="header">
          <AdminHeader />
        </div>
        <ConfigProvider theme={LAYOUT_CONFIG}>
          <div className="relative">
            <HeaderSticky>
              <div className="flex justify-between items-center px-[15px] h-full">
                <Navigation mode="horizontal" styles={{ background: "#fdfdfe" }} />
                <UserAction />
              </div>
            </HeaderSticky>
            <div className={`main_content ${heightAuto ? "main_content-auto" : ""} `}>
              <div
                className="h-full flex-grow-1"
                style={{
                  background: colorBgContainer,
                  padding: 16
                }}
              >
                <Suspense fallback={<PageLoading></PageLoading>}>
                  <Outlet />
                </Suspense>
              </div>
              <Footer />
            </div>
          </div>
        </ConfigProvider>
      </div>
      {/* FIXME: fix render table when first load DialogContainerForm */}
      <div className="hidden">
        <DialogContainerForm
          titleText={""}
          onCancel={function (): void {
            throw new Error("Function not implemented.");
          }}
          onFinish={function () {
            throw new Error("Function not implemented.");
          }}
          form={undefined}
        />
      </div>
    </ConfigProvider>
  );
};

export default AdminLayout;
