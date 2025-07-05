import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { AdminRoute, StudentRoute, TeacherRoute } from "./modules";

import { getPrefix } from "@/constant";
import { ROLE } from "@/interface/user";
import PageTitle from "@/Layout/PageTitle";
import { PageLoading } from "@/pages/Loading";
import QuenMatKhau from "@/pages/quen-matkhau";
import ChangePassword from "@/pages/quen-matkhau/resetPassword";
import { lazy } from "react";
import type { RouteObject } from "react-router";
import WrapperRouteComponent from "./config";
import { ErrorBoundary } from "./error-router";
import { GuestOnlyRoute } from "./privateRoute";

const MainLayout = lazy(() => import("@/Layout/MainLayout"));
const NotFound = lazy(() => import("@/pages/error/404"));
const Page500 = lazy(() => import("@/pages/error/500"));
const LoginPage = lazy(() => import("@/pages/auth/Login"));
const MicrosoftLoginPage = lazy(() => import("@/pages/auth/MicrosoftLogin"));
const routeList: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to={getPrefix() + "/login"} />
  },
  {
    path: "/loading",
    element: <PageLoading />
  },
  {
    path: getPrefix(),
    children: [
      {
        path: "500",
        element: <Page500 />
      }
    ]
  },
  {
    path: getPrefix(),
    element: <WrapperRouteComponent element={<MainLayout />} guest />,
    children: [
      {
        path: "login",
        element: (
          <>
            <PageTitle title="Đăng nhập" />
            <LoginPage />
          </>
        )
      },
      {
        path: "microsoftLogin",
        element: <MicrosoftLoginPage />
      },
      {
        path: "quen-mat-khau",
        element: (
          <>
            <PageTitle title="Quên mật khẩu" />
            <QuenMatKhau />
          </>
        )
      },
      {
        path: "doi-mat-khau",
        element: (
          <>
            <PageTitle title="Đổi mật khẩu" />
            <ChangePassword />
          </>
        )
      }
    ]
  },
  {
    path: getPrefix(),
    errorElement: <ErrorBoundary />,
    element: <WrapperRouteComponent element={<MainLayout />} auth />,
    children: [
      {
        path: "",
        element: <GuestOnlyRoute />
      },
      {
        path: "",
        element: <WrapperRouteComponent element={<Outlet />} auth roles={[ROLE.admin, ROLE.assistant]} />,
        children: AdminRoute
      },
      {
        path: "",
        element: <WrapperRouteComponent element={<Outlet />} auth role={ROLE.teacher} />,
        children: TeacherRoute
      },
      {
        path: "",
        element: <WrapperRouteComponent element={<Outlet />} auth role={ROLE.student} />,
        children: StudentRoute
      },
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
];

const RenderRouter = createBrowserRouter(routeList);

export default RenderRouter;
