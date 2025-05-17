import configApi from "@/api/config.api";
import { DatePicker, Form, notification } from "antd";
import dayjs from "dayjs";
import { FC, useCallback, useEffect, useState } from "react";

export const BaoCaoSettingConfig: FC<{ kiHoc: string }> = ({ kiHoc }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    setLoading(true);
    configApi
      .getSettingBaoCao(kiHoc)
      .then((res) => {
        const data = res.data;
        form.setFieldsValue({
          day_start_week_1_do_an:
            data.day_start_week_1_do_an && dayjs(data.day_start_week_1_do_an, "YYYY-MM-DD").utc().local()
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [kiHoc]);
  const onValuesChange = useCallback(async (_: any, value: any) => {
    try {
      setLoading(true);
      if (value.day_start_week_1_do_an) {
        value.day_start_week_1_do_an = dayjs(value.day_start_week_1_do_an).format("YYYY-MM-DD");
      }
      await configApi.updateSettingBaoCao(kiHoc, value);
    } catch (err: any) {
      api.error({
        message: "Thất bại",
        description: "Cập nhật cài đặt thất bại"
      });
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <Form labelWrap form={form} onValuesChange={onValuesChange}>
      {contextHolder}
      <Form.Item name="day_start_week_1_do_an" label="T2 tuần 1 của đồ án">
        <DatePicker allowClear={false} disabled={loading} />
      </Form.Item>
    </Form>
  );
};
