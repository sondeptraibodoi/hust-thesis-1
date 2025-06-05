/* eslint-disable @typescript-eslint/ban-ts-comment */
import "@/assets/styles/main.scss";
import "@/assets/styles/tailwind.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import router from "@/router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { message as $message, App, ConfigProvider } from "antd";
import vi from "antd/locale/vi_VN";
import { AxiosError } from "axios";
import { isServerError, isTokenInvalid } from "./api/axios";
import { GlobalHandlers } from "./api/axios/error-handle";
import configApi from "./api/config.api";
import { LaravelServerErrorResponse } from "./interface/axios/laravel";
import { PageLoading } from "./pages/Loading";
import { getDataPusherConfigAction, getInitData, logout } from "./stores/features/auth";
import { setKiHocHienGio } from "./stores/features/config";
import { useAppDispatch } from "./stores/hook";
const queryClient = new QueryClient();

const AppMain = () => {
  const dispatch = useAppDispatch();
  // configApi.getKiHienGio().then((res) => {
  //   dispatch(setKiHocHienGio(res.data));
  // });
  useEffect(() => {
    dispatch(getInitData());
    dispatch(getDataPusherConfigAction());
  }, []);
  GlobalHandlers.setFunctionShowMessage((message) => {
    $message.error(message);
  });
  GlobalHandlers.registerMany({
    Unauthenticated: {
      check: isTokenInvalid,
      before() {
        dispatch(logout());
      }
    },
    500: {
      check: isServerError,
      before(e) {
        const error = e as AxiosError<LaravelServerErrorResponse>;
        error &&
          error.response &&
          error.response.data &&
          error.response.data.message &&
          $message.error(error.response.data.message);
      }
    }
  });
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#0747A6" },
        components: {
          Typography: {
            colorText: "rgb(23, 43, 77)"
          },
          Select: {
            controlItemBgActive: "#E2E4E9",
            colorFillSecondary: "#E2E4E9",
            algorithm: true
          },
          Table: {
            // @ts-ignore:disable-next-line  Unreachable code error
            rowHoverBg: "#e4e4e4",
            borderColor: "#c0c0c0"
            //algorithm: true
          }
        }
      }}
      locale={vi}
    >
      <App>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<PageLoading />}>
            <RouterProvider router={router} />
          </Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </App>
    </ConfigProvider>
  );
};

export default AppMain;
