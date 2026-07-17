import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

const AcademicPage = lazy(() => import("@/pages/academic"));

export const TeacherRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="lop-giang-day" replace />
  },
  {
    path: "lop-giang-day",
    element: (
      <>
        <PageTitle title="Lớp giảng dạy" />
        <AcademicPage teacherPage="lop-giang-day" />
      </>
    )
  },
  {
    path: "cham-diem",
    element: (
      <>
        <PageTitle title="Chấm điểm" />
        <AcademicPage teacherPage="cham-diem" />
      </>
    )
  },
  {
    path: "phuc-khao",
    element: (
      <>
        <PageTitle title="Phúc khảo" />
        <AcademicPage teacherPage="phuc-khao" />
      </>
    )
  },
  {
    path: "chu-nhiem",
    element: (
      <>
        <PageTitle title="Chủ nhiệm" />
        <AcademicPage teacherPage="chu-nhiem" />
      </>
    )
  }
];
