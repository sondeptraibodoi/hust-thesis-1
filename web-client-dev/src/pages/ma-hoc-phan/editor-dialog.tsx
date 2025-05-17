import { FC, useEffect, useState } from "react";
import { Col, Form, Input, Modal, Row, Switch, notification } from "antd";

import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { SiMicrosoftexcel } from "react-icons/si";
import { convertErrorAxios } from "@/api/axios";
import { useTranslation } from "react-i18next";
import maHocPhanApi from "@/api/maHocPhan/maHocPhan.api";
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
  const { t } = useTranslation("ma-hoc-phan");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [isChecked, setIschecked] = useState(data);
  const [isCheckedDATN, setIscheckedDATN] = useState(data);
  const [isCheckedTT, setIscheckedTT] = useState(data);

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
        await maHocPhanApi.edit({ ...data, ...values });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
        setShowModal(false);
        form.resetFields();
        setKeyRender(Math.random());
        setEdit(false);
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
        await maHocPhanApi.create(values);
        api.success({
          message: t("message.success_add"),
          description: t("message.success_desc_add")
        });
        setShowModal(false);
        form.resetFields();
        setKeyRender(Math.random());
        setIschecked(false);
        setIscheckedDATN(false);
        setIscheckedTT(false);
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
    if (isEdit) {
      setIschecked(data?.is_do_an);
      setIscheckedDATN(data?.is_do_an_tot_nghiep);
      setIscheckedTT(data?.is_thuc_tap);
    } else {
      setIschecked(false);
      setIscheckedDATN(false);
      setIscheckedTT(false);
    }
  }, [data, isEdit]);

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
              label="Mã học phần"
              name="ma"
              rules={[{ required: true, message: t("required.ma") }]}
              validateStatus={validateForm(errorMessage?.errors?.ma?.length)}
              help={errorMessage?.errors?.ma ? errorMessage?.errors?.ma[0] : undefined}
            >
              <Input onChange={() => handleChange("ma")}></Input>
            </Form.Item>

            <Form.Item label="Tên học phần" name="ten_hp">
              <Input onChange={() => handleChange("ten_hp")}></Input>
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item label="Đồ án" name="is_do_an">
                  <Switch
                    checked={isChecked}
                    onChange={(checked) => {
                      if (checked === true) {
                        setIschecked(checked);
                        setIscheckedDATN(!checked);
                        form.setFieldsValue({ is_do_an: checked });
                        form.setFieldsValue({ is_do_an_tot_nghiep: !checked });
                      } else {
                        setIschecked(false);
                        form.setFieldsValue({ is_do_an: false });
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Đồ án tốt nghiệp" name="is_do_an_tot_nghiep">
                  <Switch
                    checked={isCheckedDATN}
                    onChange={(checked) => {
                      if (checked === true) {
                        setIscheckedDATN(checked);
                        setIschecked(!checked);
                        form.setFieldsValue({ is_do_an: !checked });
                        form.setFieldsValue({ is_do_an_tot_nghiep: checked });
                      } else {
                        setIscheckedDATN(false);
                        form.setFieldsValue({ is_do_an_tot_nghiep: false });
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Thực tập" name="is_thuc_tap">
                  <Switch
                    checked={isCheckedTT}
                    onChange={() => {
                      setIscheckedTT(!isCheckedTT);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
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
