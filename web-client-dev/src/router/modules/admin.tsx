import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

const UserPage = lazy(() => import("@/pages/system/user"));
const ChartPage = lazy(() => import("@/pages/system/thong-ke"));
const MonHocPage = lazy(() => import("@/pages/sinh-vien/mon-hoc"));

export const AdminRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="tai-khoan" replace />
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
      }
    ]
  },
  {
    path: "thong-ke",
    element: <ChartPage />
  }
];
