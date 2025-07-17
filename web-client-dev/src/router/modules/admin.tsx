import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

//nguoi dung
const UserPage = lazy(() => import("@/pages/system/user"));
const ChartPage = lazy(() => import('@/pages/system/thong-ke'))
const MonHocPage = lazy(() => import("@/pages/sinh-vien/mon-hoc"));
const CauHoiPage = lazy(() => import("@/pages/giao-vien/cau-hoi"))
const DethiPage = lazy(() => import("@/pages/giao-vien/de-thi"));
const DeThiForm = lazy(() => import("@/pages/giao-vien/de-thi/form"));
//giao vien
// admin đã bao gồm cả quyền trợ lý, nên không cần thêm router của trợ lý vào

export const AdminRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="tai-khoan" />
  },
  {
    path: "tai-khoan",
    element: <UserPage />
  },
  {
    path: "quan-ly-mon",
    children: [
      {
        path: "",
        index: true,
        element: (
          <>
            <PageTitle title="Môn học" />
            <MonHocPage />
          </>
        )
      },
      {
        path: ":id/cau-hoi",
        element: (
          <>
            <PageTitle title="Câu hỏi" />
            <CauHoiPage />
          </>
        )
      },
      {
        path: ":id/de-thi",
        element: (
          <>
            <PageTitle title="Đề thi" />
            <DethiPage />
          </>
        )
      },
      {
        path: ":id/de-thi/tao-moi",
        element: (
          <>
            <PageTitle title="Đề thi" />
            <DeThiForm type="create"/>
          </>
        )
      },
      {
        path: ":id/de-thi/:dethi",
        element: (
          <>
            <PageTitle title="Đề thi" />
            <DeThiForm type="update"/>
          </>
        )
      }
    ]
  },
  {
    path: "thong-ke",
    element: <ChartPage />
  },

];
