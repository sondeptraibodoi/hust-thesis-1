import { dealsWith } from "@/api/axios/error-handle";
import { Laravel400ErrorResponse, LaravelValidationResponse } from "@/interface/axios/laravel";
import { App, FormInstance } from "antd";
import { AxiosError } from "axios";
import { useCallback, useMemo, useState } from "react";

interface IUseHandleError {
  disableDefaultHandleError?: boolean;
  form?: FormInstance;
}

export function useHandleError({ form, disableDefaultHandleError }: IUseHandleError = {}) {
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | undefined>();
  const { notification } = App.useApp();
  const handleError = useCallback(
    (err: any) => {
      return dealsWith({
        "422": (e: any) => {
          const error = e as AxiosError<LaravelValidationResponse>;
          const err = error.response;
          if (err) {
            setErrorMessage(err.data);
            notification.warning({
              message: "Lỗi",
              description: err.data.message
            });
            form &&
              form.setFields(
                Object.keys(err.data.errors).map((name) => {
                  return {
                    name,
                    errors: err.data.errors[name]
                  };
                })
              );
          }
          return true;
        },
        "400": (e: any) => {
          const error = e as AxiosError<Laravel400ErrorResponse>;
          if (error.response) {
            notification.warning({
              message: "Lỗi",
              description: error.response.data.message
            });
          }
          return true;
        }
      })(err);
    },
    [notification]
  );
  const handlePromise = useCallback(
    async (
      callback: () => Promise<any>,
      {
        setLoading,
        callWhenSuccess,
        callWhenError,
        callWhenFinally
      }: {
        setLoading?: (value: boolean) => void;
        callWhenSuccess?: (data: any) => void;
        callWhenError?: (error: Error, is_handle: boolean) => void;
        callWhenFinally?: () => void;
      } = {}
    ) => {
      try {
        setLoading && setLoading(true);
        const res = await callback();
        callWhenSuccess && callWhenSuccess(res);
      } catch (e: any) {
        let is_handle = true;
        if (!disableDefaultHandleError) {
          is_handle = handleError(e);
        }
        callWhenError && callWhenError(e, !!is_handle);
      } finally {
        setLoading && setLoading(false);
        callWhenFinally && callWhenFinally();
      }
    },
    [handleError, disableDefaultHandleError]
  );
  const result = useMemo(
    () => ({ handleError, handlePromise, errorMessage }),
    [handleError, errorMessage, handlePromise]
  );
  return result;
}
