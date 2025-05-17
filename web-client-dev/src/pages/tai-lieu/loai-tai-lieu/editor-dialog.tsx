import { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select, notification } from "antd";

import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { SiMicrosoftexcel } from "react-icons/si";
import { convertErrorAxios } from "@/api/axios";
import { useTranslation } from "react-i18next";
import loaiTaiLieuApi from "@/api/taiLieu/loaiTaiLieu.api";
import { ROLE } from "@/interface/user";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  isEdit: boolean;
  data?: any;
  setEdit: (value: boolean) => void;
}
const EditorDialog: FC<Props> = ({ showModal, setShowModal, setKeyRender, isEdit, data, setEdit }) => {
  const { t } = useTranslation("loai-tai-lieu");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);

  const handleChange = (name: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (name && updatedErrors[name]) {
        updatedErrors[name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    if (isEdit) {
      try {
        await loaiTaiLieuApi.edit({ ...data, ...values });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
        setShowModal(false);
        form.resetFields();
        setKeyRender(Math.random());
        setEdit(false);
        setErrorMessage(null);
      } catch (err: any) {
        const res = convertErrorAxios<LaravelValidationResponse>(err);
        setErrorMessage(err.data);
        if (res.type === "axios-error") {
          api.error({
            message: t("message.error_edit"),
            description: t("message.error_desc_edit")
          });
          const { response } = res.error;
          if (response) setErrorMessage(response.data);
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await loaiTaiLieuApi.create(values);
        api.success({
          message: t("message.success_add"),
          description: t("message.success_desc_add")
        });
        setShowModal(false);
        form.resetFields();
        setKeyRender(Math.random());
        setErrorMessage(null);
      } catch (err: any) {
        const res = convertErrorAxios<LaravelValidationResponse>(err);
        setErrorMessage(err.data);
        if (res.type === "axios-error") {
          api.error({
            message: t("message.error_add"),
            description: t("message.error_desc_add")
          });
          const { response } = res.error;
          if (response) setErrorMessage(response.data);
        }
      } finally {
        setLoading(false);
      }
    }
  };
  const validateForm = (value: any) => {
    if (errorMessage && value) {
      return "error";
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    setEdit(false);
    form.resetFields();
    setErrorMessage(null);
  };

  useEffect(() => {
    if (isEdit && data) {
      form.setFieldsValue({
        ...data
      });
    }
  }, [form, data, isEdit]);

  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()} width={570}>
        <div className="model-container">
          <div className="model-icon create-icon">
            <div>
              <SiMicrosoftexcel />
            </div>
          </div>
          <div className="modal-title-wapper ">
            <p className="modal-title">{isEdit ? t("title.edit") : t("title.create_new")}</p>
            <p>{isEdit ? t("sub_title.edit") : t("sub_title.create_new")}</p>
          </div>
          <Form
            initialValues={{ role_code: ROLE.admin }}
            layout="vertical"
            className="base-form"
            onFinish={onFinish}
            form={form}
          >
            <Form.Item
              label="Mã loại tài liệu"
              name="ma"
              rules={[{ required: true, message: t("required.ma") }]}
              validateStatus={validateForm(errorMessage?.errors?.ma?.length)}
              help={errorMessage?.errors?.ma ? errorMessage?.errors?.ma[0] : undefined}
            >
              <Input onChange={() => handleChange("ma")}></Input>
            </Form.Item>

            <Form.Item
              label="Loại tài liệu"
              name="loai"
              validateStatus={validateForm(errorMessage?.errors?.loai?.length)}
              help={errorMessage?.errors?.loai ? errorMessage?.errors?.loai[0] : undefined}
            >
              <Input onChange={() => handleChange("loai")}></Input>
            </Form.Item>

            <Form.Item label="Nhóm" name="nhom">
              <Select
                allowClear
                onChange={() => {
                  handleChange("nhom");
                }}
                filterOption={(input, option) => {
                  const searchText = input.toLowerCase();
                  const label = String(option?.label).toLowerCase();
                  return label?.includes(searchText);
                }}
                options={[
                  { value: "Tài liệu chung", label: "Tài liệu chung" },
                  { value: "Tài liệu học phần", label: "Tài liệu học phần" },
                  { value: "Tài liệu lớp môn", label: "Tài liệu lớp môn" }
                ]}
              />
            </Form.Item>

            <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
              <div className="flex justify-between gap-4">
                <ColorButton block onClick={handleCancel}>
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

export default EditorDialog;
