import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { DialogContainerForm } from "@/components/dialog/dialog-container";
import { STATUS_QUESTION } from "@/constant";
import { GiaoVien } from "@/interface/giaoVien";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { CauHoiView } from "@/pages/giao-vien/cau-hoi/part/cau-hoi-view";
import { App, DatePicker, Form, Modal, Select } from "antd";
import dayjs from "dayjs";
import { FC, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  setIsEdit: (value: boolean) => void;
  isEdit: boolean;
  translation: string;
  icon?: ReactElement;
  dataItem: HocPhanCauHoi;
  giaoVien: GiaoVien[];
}
const CreatNEditPhanBienDialog: FC<Props> = ({
  showModal,
  setShowModal,
  translation,
  isEdit,
  dataItem,
  giaoVien,
  setKeyRender,
  setIsEdit
}) => {
  const { t } = useTranslation(translation);
  const [form] = Form.useForm();
  const { notification: api } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [optionGv, setOptionGv] = useState<any>([]);

  const onFinish = async (values: any) => {
    setLoading(true);
    values.phan_bien_id = dataItem.phan_bien?.id;
    if (values.ngay_han_phan_bien) {
      values.ngay_han_phan_bien = dayjs(values.ngay_han_phan_bien).format("YYYY-MM-DD");
    }

    const phan_bien_id = dataItem?.phan_bien ? dataItem?.phan_bien?.id : false;

    try {
      await cauHoiApi.setPhanBien(dataItem.id, values);
      if (isEdit && phan_bien_id) {
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
      } else {
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_add")
        });
      }
      setShowModal(false);
      form.resetFields();
      setKeyRender(Math.random());
      setIsEdit(false);
    } catch (err: any) {
      api.error({
        message: t("message.error_add"),
        description: err.response.data?.message ? err.response.data.message : t("message.error_desc_add")
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setIsEdit(false);
  };

  useEffect(() => {
    form.setFieldsValue({
      giao_vien_id: dataItem.phan_bien?.giao_vien_id,
      ngay_han_phan_bien: dataItem.phan_bien?.ngay_han_phan_bien && dayjs(dataItem?.phan_bien?.ngay_han_phan_bien)
    });
  }, [dataItem, showModal]);

  // Lọc gv tạo khỏi câu hỏi đã chọn
  useEffect(() => {
    const optionGvFormEdit = giaoVien
      .filter((item: GiaoVien) => item.id !== dataItem.created_by?.info_id)
      .map((item: GiaoVien) => ({
        value: item.id,
        label: (
          <>
            <p>{item.name}</p>
            <p>{item.email}</p>
          </>
        ),
        searchLabel: item.name
      }));

    setOptionGv(optionGvFormEdit);
  }, [showModal]);

  const disabledDate = (current: any) => {
    // Không chọn ngày nhỏ hơn hiện tại
    return current && current < dayjs().startOf("day");
  };

  return (
    <>
      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()} width={570}>
        <DialogContainerForm
          titleText={
            dataItem?.trang_thai == STATUS_QUESTION.CHO_PHAN_BIEN2
              ? t("title.confirm")
              : dataItem?.trang_thai &&
                  [STATUS_QUESTION.CHO_DUYET1, STATUS_QUESTION.CHO_DUYET2].includes(dataItem?.trang_thai)
                ? t("title.edit")
                : t("title.create_new")
          }
          onCancel={handleCancel}
          onFinish={onFinish}
          loading={loading}
          form={form}
          textButtonCancel={t("action.cancel")}
          textButtonSubmit={t("action.accept")}
        >
          <CauHoiView cauHoi={dataItem} readonly />
          <Form.Item label={t("field.giao_vien_phan_bien")} name="giao_vien_id" rules={[{ required: true }]}>
            <Select
              allowClear
              showSearch
              style={{ width: "100%" }}
              placeholder={t("field.giao_vien_phan_bien")}
              filterOption={(input, option) => {
                return (option?.searchLabel ?? "").toLowerCase().includes(input.toLowerCase());
              }}
              onChange={() => form.validateFields(["cau_hoi_id"])}
              options={optionGv}
            />
          </Form.Item>
          <Form.Item label={t("field.ngay_han_phan_bien")} name="ngay_han_phan_bien" rules={[{ required: true }]}>
            <DatePicker format={"DD/MM/YYYY"} className="w-full" allowClear disabledDate={disabledDate} />
          </Form.Item>
        </DialogContainerForm>
      </Modal>
    </>
  );
};

export default CreatNEditPhanBienDialog;
