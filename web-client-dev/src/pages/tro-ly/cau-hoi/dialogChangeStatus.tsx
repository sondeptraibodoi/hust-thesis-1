import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import ColorButton from "@/components/Button";
import { HocPhanCauHoi } from "@/interface/cauHoi";
import { HocPhanCauHoiChuong } from "@/interface/hoc-phan";
import { CauHoiView } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-view";
import { Form, Modal, Select, notification } from "antd";
import Title from "antd/es/typography/Title";
import { FC, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";
interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  translation: string;
  icon?: ReactElement;
  data?: HocPhanCauHoiChuong[];
  dataItem: HocPhanCauHoi | undefined;
  dataStatus: any;
}
const ChangeStatusDialog: FC<Props> = ({
  showModal,
  setShowModal,
  translation,
  icon,
  dataItem,
  dataStatus,
  setKeyRender
}) => {
  const { t } = useTranslation(translation);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await cauHoiApi.doiTrangThaiCauHoi({ ...values });
      api.success({
        message: t("message.success_edit_status"),
        description: t("message.success_desc_edit_status")
      });
    } catch (err: any) {
      api.error({
        message: t("message.error_edit_status"),
        description: err.response.data?.message ? err.response.data.message : t("message.error_desc_edit_status")
      });
    } finally {
      setShowModal(false);
      form.resetFields();
      setKeyRender(Math.random());
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
  };

  useEffect(() => {
    form.setFieldsValue({
      ...dataItem,
      cau_hoi_id: dataItem?.id
    });
  }, [dataItem, showModal]);

  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()} width={570}>
        <div className="model-container">
          <div className="model-icon create-icon">
            <div>{icon ? icon : <SiMicrosoftexcel />}</div>
          </div>

          <div className="">
            <Title level={4}>{t("title.edit_status")}</Title>
            <p>{t("sub_title.edit_status")}</p>
          </div>
          <Form
            form={form}
            name="control-hooks"
            onFinish={onFinish}
            layout="vertical"
            style={{ maxWidth: 600 }}
            className="overflow-y-scroll base-form flex-grow-1"
          >
            <Form.Item label={t("field.cau_hoi")} name="cau_hoi_id">
              <CauHoiView cauHoi={dataItem} readonly />
            </Form.Item>
            <Form.Item label="Trạng thái" key="do_kho" name="trang_thai">
              <Select options={dataStatus}></Select>
            </Form.Item>
            <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
              <div className="flex justify-between gap-4">
                <ColorButton block onClick={() => handleCancel()}>
                  {t("action.cancel")}
                </ColorButton>
                <ColorButton block htmlType="submit" loading={loading} type="primary">
                  {t("action.accept")}
                </ColorButton>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ChangeStatusDialog;
