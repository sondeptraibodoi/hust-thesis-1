import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

const MonHocPage = lazy(() => import("@/pages/sinh-vien/mon-hoc"));
const CauHoiPage = lazy(() => import("@/pages/giao-vien/cau-hoi"))
const DethiPage = lazy(() => import("@/pages/giao-vien/de-thi"));
const DeThiForm = lazy(() => import("@/pages/giao-vien/de-thi/form"));

export const TeacherRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="mon-hoc" />
  },
  {
    path: "mon-hoc",
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
  // {
  //   path: "diem-sinh-vien",
  //   element: (
  //     <>
  //       <PageTitle title="Điểm" />
  //       <BangDiemPage />
  //     </>
  //   )
  // },
];
