import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

const MonHocPage = lazy(() => import("@/pages/sinh-vien/mon-hoc"));
const CauHoiPage = lazy(() => import("@/pages/giao-vien/cau-hoi"))

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
