import { Navigate, useLocation, useRouteError } from "react-router-dom";

import { getPrefix } from "@/constant";
import Page500 from "@/pages/error/500";
import { isAxiosError } from "axios";
import ReactGA from "react-ga4";

export function ErrorBoundary() {
  const error: any = useRouteError();
  const location = useLocation();
  console.error(error);
  if (isAxiosError(error)) {
    const { response } = error;
    if (response)
      switch (response.status) {
        case 404:
          return <Navigate to={getPrefix() + "/404"} />;
        case 401:
          return <Navigate to={getPrefix() + "/login"} />;
        default:
          break;
      }
  }
  if (error.message) {
    if (
      (error.message && error.message.includes("Failed to fetch dynamically imported module")) ||
      error.message.includes("dynamically imported module")
    ) {
      window.location.reload();
    } else {
      const errorMessage = error.message;
      let exceptionDescription = errorMessage;
      if (typeof error !== "undefined" && typeof error.message !== "undefined") {
        exceptionDescription = error.message;
      }
      const url = location.pathname;
      // Format the message to log to Analytics (might also use "errorObject.stack" if defined):
      exceptionDescription += " @ " + url;
      const exOptions = {
        exMessage: error.message,
        exUrl: location.pathname,
        type: "route",
        exDescription: exceptionDescription,
        exFatal: false // Some Error types might be considered as fatal.
      };
      // Send Data Object to Google Analytics:
      ReactGA.gtag("event", "exception", exOptions);
    }
  }
  // Uncaught ReferenceError: path is not defined
  return <Page500 />;
}
