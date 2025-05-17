import { Form, InputNumber, Modal, Select, notification } from "antd";
import { FC, useEffect, useState } from "react";

import { convertErrorAxios } from "@/api/axios";
import lopHocApi from "@/api/lop/lopHoc.api";
import lopThiApi from "@/api/lop/lopThi.api";
import sinhVienApi from "@/api/user/sinhvien.api";
import ColorButton from "@/components/Button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { SinhVien } from "@/interface/sinhVien";
import { ROLE } from "@/interface/user";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  existStudent: any;
  data: any;
  lop_thi_id: string | number;
  getData: () => void;
  getSinhViens?: () => void;
  lopThiBu?: any;
  checkLoai?: boolean;
  lop_id?: any;
}
const { Option } = Select;
const AddStudent: FC<Props> = ({ showModal, setShowModal, data, lop_thi_id, getData, lopThiBu, checkLoai, lop_id }) => {
  const { t } = useTranslation("sinh-vien-lop");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [sinhVienList, setSinhVienList] = useState<any>([]);
  const [sinhVienListThiBu, setSinhVienListThiBu] = useState<SinhVien[]>([]);
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      checkLoai
        ? await lopThiApi.addSinhVienThiBu({
            ...values,
            lop_thi_id: lop_thi_id
          })
        : await lopThiApi.addSinhVien({
            ...values,
            lop_thi_id: lop_thi_id
          });

      api.success({
        message: t("message.success_add"),
        description: t("message.success_desc_create_")
      });
      setShowModal(false);
      form.resetFields();
      getData();
      // getSinhViens();
      setSinhVienListThiBu([]);
    } catch (err: any) {
      const res = convertErrorAxios<LaravelValidationResponse>(err);
      setErrorMessage(err.data);
      if (res.type === "axios-error") {
        api.error({
          message: t("message.error_create"),
          description: t("message.error_desc_create_")
        });
        const { response } = res.error;
        if (response) setErrorMessage(response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  const validateForm = (value: any) => {
    if (errorMessage && value) {
      return "error";
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setErrorMessage(null);
    setSinhVienListThiBu([]);
  };
  const getSinhVienLop = async () => {
    try {
      const res = await lopHocApi.sinhVienLopHoc(lop_id);
      const sinhVienIds = data.map((item: any) => item.sinh_vien_id);
      const listId = res.data?.filter((item: any) => !sinhVienIds?.includes(item.sinh_vien_id));
      setSinhVienList(listId);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getSinhVienLop();
  }, [data]);
  return (
    <>
      {contextHolder}

      <Modal centered footer={<></>} className="relative" open={showModal} onCancel={() => handleCancel()}>
        <div className="create-icon">
          <div>
            <SiMicrosoftexcel />
          </div>
        </div>
        <div className="modal-title-wapper">
          <p className="modal-title">Thêm sinh viên mới vào lớp thi</p>
          <p>Thêm sinh viên mới vào lớp thi</p>
        </div>
        <Form
          initialValues={{ role_code: ROLE.student }}
          layout="vertical"
          className="base-form"
          onFinish={onFinish}
          form={form}
        >
          <Form.Item
            label="STT"
            name="stt"
            rules={[{ required: true, message: t("required.stt") }]}
            validateStatus={validateForm(errorMessage?.errors?.stt?.length)}
            help={errorMessage?.errors?.stt ? errorMessage?.errors?.stt[0] : undefined}
          >
            <InputNumber className="w-full bg-white" min={1}></InputNumber>
          </Form.Item>
          {checkLoai && (
            <Form.Item
              label="Lớp thi"
              name="lop_thi_goc_id"
              rules={[
                {
                  required: true,
                  message: "Trường lớp thi không được bỏ trống"
                }
              ]}
            >
              <Select
                showSearch
                filterOption={true}
                allowClear
                optionFilterProp="children"
                onChange={async (value: any) => {
                  form.setFieldsValue({ ["sinh_vien_id"]: undefined });
                  try {
                    const res = await sinhVienApi.listSVkihoc({
                      lop_thi_id: value
                    });
                    if (Array.isArray(res.data)) {
                      const sinhVienIds = data.map((item: any) => item.sinh_vien_id);
                      const listId = res.data?.filter((item: any) => !sinhVienIds?.includes(item.sinh_vien_id));
                      setSinhVienListThiBu(listId);
                    }
                  } catch (error) {
                    console.error(error);
                    api.error({
                      message: "Lỗi khi lấy dữ liệu sinh viên",
                      description:
                        "Đã xảy ra lỗi trong quá trình lấy dữ liệu sinh viên, chúng tôi sẽ sớm khắc phục, vui lòng quay lại sau!"
                    });
                  }
                }}
              >
                {renderOptionLopThiBu(lopThiBu)}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            label="Sinh viên"
            name="sinh_vien_id"
            rules={[
              {
                required: true,
                message: "Trường sinh viên không được bỏ trống"
              }
            ]}
            // validateStatus={validateForm(
            //   errorMessage?.errors?.sinh_vien_id?.length
            // )}
            // help={
            //   errorMessage?.errors?.sinh_vien_id
            //     ? errorMessage?.errors?.sinh_vien_id[0]
            //     : undefined
            // }
          >
            <Select showSearch filterOption={true} allowClear optionFilterProp="children">
              {checkLoai ? renderOptionThiBu(sinhVienListThiBu) : renderOption(sinhVienList)}
            </Select>
          </Form.Item>

          <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-2 bg-white">
            <div className="flex justify-between gap-4">
              <ColorButton block onClick={handleCancel}>
                {t("action.cancel")}
              </ColorButton>
              <ColorButton block htmlType="submit" loading={loading} type="primary">
                {t("action.create_new")}
              </ColorButton>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddStudent;
const renderOption = (data: SinhVien[]) => {
  if (!data) return <></>;
  return (
    <>
      {data.map((item) => (
        <Option key={item.sinh_vien_id} value={item.sinh_vien_id} label={`${item.name}`}>
          {item.name} - {item.mssv}
        </Option>
      ))}
    </>
  );
};
const renderOptionThiBu = (data: SinhVien[]) => {
  if (!data) return <></>;
  return (
    <>
      {data.map((item) => (
        <Option key={item.sinh_vien_id} value={item.sinh_vien_id} label={`${item.name}`}>
          {item.name} - {item.mssv}
        </Option>
      ))}
    </>
  );
};

const renderOptionLopThiBu = (data: any) => {
  if (!data) return <></>;
  return (
    <>
      {data.map((item: any) => (
        <Option key={item.id} value={item.id} label={`${item.ma}`}>
          {item.ma}
        </Option>
      ))}
    </>
  );
};
