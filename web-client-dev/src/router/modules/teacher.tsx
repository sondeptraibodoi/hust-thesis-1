import { Navigate, RouteObject } from "react-router-dom";

export const TeacherRoute: RouteObject[] = [
  {
    path: "",
    element: <Navigate to="hoc-vu" replace />
  }
];
