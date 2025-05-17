import ReactGA from "react-ga4";

if (import.meta.env.MODE !== "development") {
  ReactGA.initialize("G-3QT93G99KF");
}
/**!
 * Send JavaScript error information to Google Analytics.
 *
 * @param  {Window}           window  A reference to the "window".
 * @param  {Object|undefined} options An object containing optional "applicationName" and
 *                                    "applicationVersion" strings.
 * @return {void}
 * @author Philippe Sawicki (https://github.com/philsawicki)
 * @copyright Copyright 2015 Philippe Sawicki (http://philippesawicki.com)
 */
(function (window) {
  // Retain a reference to the previous global error handler, in case it has been set:
  const originalWindowErrorCallback = window.onerror;

  /**
   * Log any script error to Google Analytics.
   *
   * Third-party scripts without CORS will only provide "Script Error." as an error message.
   *
   * @param  {String}           errorMessage Error message.
   * @param  {String}           url          URL where error was raised.
   * @param  {Number}           lineNumber   Line number where error was raised.
   * @param  {Number|undefined} columnNumber Column number for the line where the error occurred.
   * @param  {Object|undefined} errorObject  Error Object.
   * @return {Boolean}                       When the function returns true, this prevents the
   *                                         firing of the default event handler.
   */
  window.onerror = function customErrorHandler(errorMessage, url, lineNumber, columnNumber, errorObject) {
    // Send error details to Google Analytics, if the library is already available:
    if (typeof ReactGA.gtag === "function") {
      // In case the "errorObject" is available, use its data, else fallback
      // on the default "errorMessage" provided:
      let exceptionDescription = errorMessage;
      if (typeof errorObject !== "undefined" && typeof errorObject.message !== "undefined") {
        exceptionDescription = errorObject.message;
      }

      // Format the message to log to Analytics (might also use "errorObject.stack" if defined):
      exceptionDescription += " @ " + url + ":" + lineNumber + ":" + columnNumber;

      // Data Object to send to Google Analytics:
      const exOptions = {
        exMessage: errorMessage,
        exUrl: url,
        type: "global",
        exDescription: exceptionDescription,
        exFatal: false // Some Error types might be considered as fatal.
      };
      // Send Data Object to Google Analytics:
      ReactGA.gtag("event", "exception", exOptions);
    }

    // If the previous "window.onerror" callback can be called, pass it the data:
    if (typeof originalWindowErrorCallback === "function") {
      return originalWindowErrorCallback(errorMessage, url, lineNumber, columnNumber, errorObject);
    }

    // Otherwise, let the default handler run:
    return false;
  };
})(window);

// Generate an error, for demonstration purposes:
//throw new Error('Crash!');
