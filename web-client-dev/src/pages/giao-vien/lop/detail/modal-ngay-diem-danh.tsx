import { App, Button, DatePicker, Form, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { SiMicrosoftexcel } from "react-icons/si";
import Title from "antd/es/typography/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DiemDanhGiaoVien {
  ngay_diem_danh: string | Dayjs;
}
interface Props {
  openModal: any;
  closeModal: any;
  setKeyRender: (value: number) => any;
  api?: (data: any) => Promise<any>;
  data?: any;
  translation: string;
}
const TaoDiemDanh = ({ openModal, translation, closeModal, api, setKeyRender, data }: Props) => {
  const { notification: callnofi } = App.useApp();
  const { t } = useTranslation(translation);
  const [loading, setloading] = useState(false);

  const onFinish = async (value: DiemDanhGiaoVien) => {
    setloading(true);
    if (value.ngay_diem_danh) {
      value.ngay_diem_danh = dayjs(value.ngay_diem_danh).format("YYYY-MM-DD");
    }
    api &&
      (await api({ ...value, id: data?.["id"] })
        .then(() => {
          callnofi.success({
            message: "Thành Công",
            description: "Thêm ngày điểm danh thành công"
          });
        })
        .catch((err) => {
          callnofi.error({
            message: "Thất bại",
            description: err?.response.data.message || "Thêm ngày điểm danh thất bại"
          });
        })
        .finally(() => {
          setloading(false);
          closeModal();
          setKeyRender(Math.random());
        }));
  };

  return (
    <Modal open={openModal} onCancel={closeModal} centered destroyOnClose footer={<></>} width={570}>
      <div className="model-icon create-icon">
        <SiMicrosoftexcel />
      </div>
      <Title level={4}>Tạo mới ngày điểm danh</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          className="flex-1 mx-2"
          name="ngay_diem_danh"
          label="Ngày điểm danh"
          initialValue={dayjs().tz("Asia/Ho_Chi_Minh")}
        >
          <DatePicker className="w-full" allowClear format={"DD/MM/YYYY"} />
        </Form.Item>
        {/* <Form.Item className="flex-1 mx-2" name="is_diem_danh_them" valuePropName="checked" initialValue={false}>
          <Checkbox className="w-full">Điểm danh thêm sẽ không được tính cho điểm danh được yêu cầu</Checkbox>
        </Form.Item> */}
        <Form.Item>
          <div className="flex justify-end">
            <Button className="mx-1" onClick={closeModal}>
              {t("action.cancel")}
            </Button>
            <Button className="mx-1" loading={loading} type="primary" htmlType="submit">
              {t("action.accept")}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaoDiemDanh;
