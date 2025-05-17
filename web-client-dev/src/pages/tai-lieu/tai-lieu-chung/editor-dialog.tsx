import { FC, useEffect, useState } from "react";
import { Checkbox, Form, Input, Modal, Select, Switch, notification } from "antd";

import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { SiMicrosoftexcel } from "react-icons/si";
import { convertErrorAxios } from "@/api/axios";
import { useTranslation } from "react-i18next";
import taiLieuChungApi from "@/api/taiLieu/taiLieuChung.api";
import { LoaiTaiLieu } from "@/interface/tai-lieu";
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
const { Option } = Select;
const { TextArea } = Input;
const EditorDialog: FC<Props> = ({ showModal, setShowModal, setKeyRender, isEdit, data, setEdit }) => {
  const { t } = useTranslation("tai-lieu-chung");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [isChecked, setIschecked] = useState(data);
  const [loaiTaiLieuList, setLoaiTaiLieuList] = useState<LoaiTaiLieu[]>([]);

  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);
  const [showSinhVien, setShowSinhVien] = useState(true);
  const [showGiaoVien, setShowGiaoVien] = useState(true);

  const handleChange = (name: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (name && updatedErrors[name]) {
        updatedErrors[name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };

  useEffect(() => {
    setIschecked(data?.trang_thai === "1-Đang sử dụng");
  }, [data]);

  useEffect(() => {
    setIschecked(true);
  }, []);

  const getTrangThaiValue = () => {
    return isChecked ? "1-Đang sử dụng" : "2-Dừng sử dụng";
  };
  const handleLoaiTaiLieu = (e: any) => {
    const valueMa = form.getFieldsValue(["ma"]);
    const loaiTaiLieu = loaiTaiLieuList.filter((item: any) => item.id == e);
    const maTaiLieu = loaiTaiLieuList.filter((item: any) => item.ma == valueMa.ma).length;
    if ((valueMa.ma == undefined || valueMa.ma == "" || maTaiLieu > 0) && !isEdit) {
      form.setFieldsValue({ ma: loaiTaiLieu[0].ma });
    }
  };

  const onFinish = async (values: any) => {
    values.trang_thai = getTrangThaiValue();
    values.show_sinh_vien = showSinhVien;
    values.show_giao_vien = showGiaoVien;

    if (!showSinhVien && !showGiaoVien) {
      api.error({
        message: t("message.error_add"),
        description: t("message.error_checkbox_desc")
      });
      return;
    }

    setLoading(true);
    if (isEdit) {
      try {
        await taiLieuChungApi.update({ ...data, ...values });
        api.success({
          message: t("message.success_edit"),
          description: t("message.success_desc_edit")
        });
        setShowModal(false);
        form.resetFields();
        setIschecked(true);
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
        await taiLieuChungApi.create(values);
        api.success({
          message: t("message.success_add"),
          description: t("message.success_desc_add")
        });
        setShowModal(false);
        form.resetFields();
        setIschecked(true);
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
    setIschecked(true);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (isEdit && data) {
      form.setFieldsValue({
        ...data
      });
      setShowSinhVien(data.show_sinh_vien);
      setShowGiaoVien(data.show_giao_vien);
    }
  }, [form, data, isEdit]);

  useEffect(() => {
    const getLoaiTaiLieu = async () => {
      try {
        const res = await loaiTaiLieuApi.list();
        if (res.data && res.data.length > 0) {
          const filteredData = res.data.filter((item: LoaiTaiLieu) => item.nhom === "Tài liệu chung");
          setLoaiTaiLieuList(filteredData);
        }
      } catch (error) {
        api.error({
          message: "Lỗi khi lấy loại tài liệu",
          description:
            "Đã xảy ra lỗi trong quá trình lấy loại tài liệu, chúng tôi sẽ sớm khắc phục, vui lòng quay lại sau!"
        });
      }
    };

    getLoaiTaiLieu();
  }, [api]);

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
          <div className="scrollable-content">
            <Form
              initialValues={{ role_code: ROLE.admin }}
              layout="vertical"
              className="base-form flex-grow-1 overflow-y-auto"
              onFinish={onFinish}
              form={form}
            >
              <Form.Item
                label="Loại tài liệu"
                name="loai_tai_lieu_id"
                rules={[{ required: true, message: t("required.loai_tai_lieu_id") }]}
                validateStatus={validateForm(errorMessage?.errors?.loai_tai_lieu_id?.length)}
                help={errorMessage?.errors?.loai_tai_lieu_id ? errorMessage?.errors?.loai_tai_lieu_id[0] : undefined}
              >
                <Select
                  allowClear
                  onChange={(e) => {
                    handleChange("loai_tai_lieu_id");
                    handleLoaiTaiLieu(e);
                  }}
                  filterOption={(input, option) => {
                    const searchText = input.toLowerCase();
                    const label = String(option?.label).toLowerCase();
                    return label?.includes(searchText);
                  }}
                >
                  {renderOption(loaiTaiLieuList)}
                </Select>
              </Form.Item>

              <Form.Item
                label="Mã tài liệu"
                name="ma"
                rules={[{ required: true, message: t("required.ma") }]}
                validateStatus={validateForm(errorMessage?.errors?.ma?.length)}
                help={errorMessage?.errors?.ma ? errorMessage?.errors?.ma[0] : undefined}
              >
                <Input allowClear onChange={() => handleChange("ma")}></Input>
              </Form.Item>
              <Form.Item
                label="Tên tài liệu"
                name="ten"
                rules={[{ required: true, message: t("required.ten") }]}
                validateStatus={validateForm(errorMessage?.errors?.ten?.length)}
                help={errorMessage?.errors?.ten ? errorMessage?.errors?.ten[0] : undefined}
              >
                <Input allowClear onChange={() => handleChange("ten")}></Input>
              </Form.Item>

              <Form.Item
                label="Mô tả chi tiết"
                name="mo_ta"
                validateStatus={validateForm(errorMessage?.errors?.mo_ta?.length)}
                help={errorMessage?.errors?.mo_ta ? errorMessage?.errors?.mo_ta[0] : undefined}
              >
                <TextArea allowClear rows={4} onChange={() => handleChange("mo_ta")} />
              </Form.Item>

              <Form.Item
                label="Link tài liệu"
                name="link"
                rules={[{ required: true, message: t("required.link") }]}
                validateStatus={validateForm(errorMessage?.errors?.link?.length)}
                help={errorMessage?.errors?.link ? errorMessage?.errors?.link[0] : undefined}
              >
                <Input allowClear onChange={() => handleChange("link")}></Input>
              </Form.Item>

              <Form.Item label="Trạng thái" name="trang_thai">
                <Switch
                  checked={isChecked}
                  onChange={() => {
                    setIschecked(!isChecked);
                  }}
                />
              </Form.Item>
              <div className="flex gap-6">
                <Form.Item label="Đối tượng hiển thị" name="show_sinh_vien" valuePropName="showSinhVien">
                  <Checkbox checked={showSinhVien} onChange={(e) => setShowSinhVien(e.target.checked)}>
                    Sinh viên
                  </Checkbox>
                </Form.Item>

                <Form.Item label=" " name="show_giao_vien" valuePropName="showSinhVien">
                  <Checkbox checked={showGiaoVien} onChange={(e) => setShowGiaoVien(e.target.checked)}>
                    Giáo viên
                  </Checkbox>
                </Form.Item>
              </div>
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
        </div>
      </Modal>
    </>
  );
};

export default EditorDialog;

const renderOption = (data: LoaiTaiLieu[]) => {
  if (!Array.isArray(data)) return <></>;
  if (!data || !data.length) return <></>;
  return (
    <>
      {data.map((item) => (
        <Option key={item.id} value={item.id} label={item.ma}>
          {`${item.ma} - ${item.loai}`}
        </Option>
      ))}
    </>
  );
};
