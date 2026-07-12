import PageTitle from "@/Layout/PageTitle";
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

const AcademicPage = lazy(() => import("@/pages/academic"));

export const TeacherRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="hoc-vu" />
  },
  {
    path: "hoc-vu",
    element: (
      <>
        <PageTitle title="Học vụ" />
        <AcademicPage />
      </>
    )
  }
];
