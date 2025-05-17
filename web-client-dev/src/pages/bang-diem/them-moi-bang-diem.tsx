import { FC, useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Upload, notification } from "antd";
import { getAuthUser } from "@/stores/features/auth";
import { useAppSelector } from "@/stores/hook";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import bangDiemApi from "@/api/bangDiem/bangDiem.api";
import { UploadFile } from "antd/es/upload";
import type { UploadProps } from "antd";
import { SiMicrosoftexcel } from "react-icons/si";
import { useTranslation } from "react-i18next";
import lopHocApi from "@/api/lop/lopHoc.api";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
}
const { Option } = Select;
const BangDiemCreate: FC<Props> = ({ showModal, setShowModal, setKeyRender }) => {
  const { items: dotThi } = useLoaiLopThi();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const { t } = useTranslation("danh-sach-bang-diem");
  const [selectedValue, setSelectedValue] = useState(1);
  const [, setSelecKiThi] = useState("GK");
  const authUser = useAppSelector(getAuthUser);
  const [kiHoc, setKihoc] = useState<any | string[]>([]);
  const [kiHocSelected, setKiHocSelected] = useState<string>();
  const [lopGV, setLopGV] = useState();
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  // const [callnofi] = notification.useNotification();

  const [callnofi, notificationrender] = notification.useNotification();
  const handleChange = (name: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (name && updatedErrors[name]) {
        updatedErrors[name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };
  const getLopGV = async () => {
    try {
      const res = await lopHocApi.lopGiaoVien({
        ...authUser,
        ki_hoc: kiHocSelected
      });
      setLopGV(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  const downloadFileSampleExcel = () => {
    const fileUrl = "/download/diem_mau_excel.zip";
    const fileName = "diem_mau_excel.zip";

    const a = document.createElement("a");
    a.href = fileUrl;

    a.setAttribute("download", fileName);

    a.click();
  };
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data.map((x) => ({ label: x, value: x })));
      }
    };
    getKyHoc();
  }, []);
  useEffect(() => {
    if (selectedValue === 1 && kiHocSelected !== null) return;
    getLopGV();
  }, [kiHocSelected, authUser]);
  const handleSelectKiThi = (value: any) => {
    setSelecKiThi(value);
  };
  const validateForm = (value: any) => {
    if (errorMessage && value) {
      return "error";
    }
  };
  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList
  };
  const onFinish = async (data: any) => {
    setLoading(true);
    if (data.file != null && data.file != undefined && data.file instanceof Object) {
      if (data.file.fileList.length > 0) {
        data.file = data.file.fileList[0].originFileObj;
      }
    }
    if (data.loai == 1) {
      try {
        await bangDiemApi.create({
          ...data,
          loai: data.loai == 1 ? "nhan_dien" : "",
          user: authUser
        });
        callnofi.success({
          message: "Thành Công",
          description: "Thêm mới môn học thành công!"
        });
        setShowModal(false);
        form.resetFields();
        setFileList([]);
        setKeyRender(Math.random());
      } catch (error: any) {
        callnofi.error({
          message: "Thất bại",
          description: error.response.data.message ? error.response.data.message : "Thêm mới môn học thất bại!"
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await bangDiemApi.createExcel({
          ...data,
          loai: data.loai == 2 ? "nhap_tay" : "",
          user: authUser
        });
        callnofi.success({
          message: "Thành Công",
          description: "Thêm mới môn học thành công!"
        });

        setShowModal(false);
        form.resetFields();
        setKeyRender(Math.random());
      } catch (error: any) {
        callnofi.error({
          message: "Thất bại",
          description: error.response.data.message ? error.response.data.message : "Thêm mới môn học thất bại!"
        });
      } finally {
        setLoading(false);
      }
    }
  };
  const onCancel = () => {
    setFileList([]);
    setShowModal(false);
    setSelectedValue(1);
    form.resetFields();
  };
  return (
    <>
      <Modal centered className="relative" open={showModal} onCancel={onCancel} footer={null} width={570}>
        <div className="model-container">
          <div className="create-icon">
            <div>
              <SiMicrosoftexcel />
            </div>
          </div>
          <div className="modal-title-wapper">
            <p className="modal-title">{t("title.create_new")}</p>
            <p>{t("sub_title.create_new")}</p>
          </div>
          <div className="scrollable-content">
            <Form layout="vertical" className="base-form flex-grow-1 overflow-y-auto" onFinish={onFinish} form={form}>
              <Form.Item
                name="loai"
                initialValue="1"
                label="Loại"
                rules={[{ required: true, message: "Loại không được để trống" }]}
              >
                <Select onChange={setSelectedValue}>
                  <Select.Option value="1">Nhập tự động File PDF</Select.Option>
                  <Select.Option value="2">Nhập tay File EXCEL</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Kì học"
                name="ki_hoc"
                rules={[{ required: true, message: "Kì học không được để trống" }]}
                validateStatus={validateForm(errorMessage?.errors?.ki_hoc?.length)}
                help={errorMessage?.errors?.ki_hoc ? errorMessage?.errors?.ki_hoc[0] : undefined}
              >
                <Select allowClear onChange={setKiHocSelected} options={kiHoc}></Select>
              </Form.Item>
              <Form.Item name="ki_thi" initialValue="GK" label="Kì Thi" rules={[{ required: true }]}>
                <Select onChange={handleSelectKiThi}>
                  {dotThi.map((x) => (
                    <Select.Option value={x.value} key={x.value}>
                      {x.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {selectedValue == 1 ? (
                <>
                  <Form.Item
                    label="Mã học phần"
                    name="ma_hp"
                    rules={[
                      {
                        required: true,
                        message: "Mã học phần không được để trống"
                      }
                    ]}
                    validateStatus={validateForm(errorMessage?.errors?.ma_hp?.length)}
                    help={errorMessage?.errors?.ma_hp ? errorMessage?.errors?.ma_hp[0] : undefined}
                  >
                    <Input className="bg-white" onChange={() => handleChange("ma_hp")}></Input>
                  </Form.Item>
                  <Form.Item
                    label="Tên học phần"
                    name="ten_hp"
                    rules={[
                      {
                        required: true,
                        message: "Tên học phần không được để trống"
                      }
                    ]}
                    validateStatus={validateForm(errorMessage?.errors?.ten_hp?.length)}
                    help={errorMessage?.errors?.ten_hp ? errorMessage?.errors?.ten_hp[0] : undefined}
                  >
                    <Input className="bg-white" onChange={() => handleChange("ten_hp")}></Input>
                  </Form.Item>
                </>
              ) : (
                <Form.Item name="lop_hoc" label="Lớp học">
                  <Select
                    disabled={!kiHocSelected}
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {renderOption(lopGV)}
                  </Select>
                </Form.Item>
              )}
              <Form.Item label="Ghi chú" name="ghi_chu">
                <Input.TextArea className="bg-white"></Input.TextArea>
              </Form.Item>
              {selectedValue == 1 && (
                <Form.Item
                  name="file"
                  label="Tải tập tin PDF"
                  rules={[
                    {
                      required: true,
                      message: "Tập tin PDF không được để trống "
                    }
                  ]}
                >
                  <Upload name="file" accept=".pdf" {...props} maxCount={1} style={{ width: "100%" }}>
                    <Button block icon={<UploadOutlined />}>
                      Chọn tập tin
                    </Button>
                  </Upload>
                </Form.Item>
              )}
              {selectedValue == 2 && (
                <div className="flex justify-between items-start">
                  <Form.Item name="file" label="Tải tập tin Excel">
                    <Upload name="file" accept=".xls, .xlsx" {...props} maxCount={1} style={{ width: "100%" }}>
                      <Button block icon={<UploadOutlined />}>
                        Chọn tập tin
                      </Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item name="file" label="Tải file mẫu Excel">
                    <Button block icon={<DownloadOutlined />} onClick={downloadFileSampleExcel}>
                      Tải file
                    </Button>
                  </Form.Item>
                </div>
              )}
              <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
                <div className="flex justify-between gap-4">
                  <Button onClick={onCancel} className="mx-1" block>
                    Hủy
                  </Button>
                  <Button htmlType="submit" className="mx-1" type="primary" block loading={loading}>
                    Xác nhận
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
      {notificationrender}
    </>
  );
};
export default BangDiemCreate;
const renderOption = (data: any) => {
  if (!data) return <></>;
  return (
    <>
      {data.map((item: any) => {
        return (
          <Option key={item.id} value={item.id} label={item.ma}>
            <p>Lớp {item.ma}</p>
            <p>Kỳ {item.ki_hoc}</p>
          </Option>
        );
      })}
    </>
  );
};
