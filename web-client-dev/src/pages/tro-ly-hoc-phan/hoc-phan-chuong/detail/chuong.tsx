import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";

import { HocPhanChuong } from "@/interface/hoc-phan";
import { ROLE } from "@/interface/user";
import { Loading } from "@/pages/Loading";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ChuongHocPhanSide: FC<{
  setKeyRender: Dispatch<SetStateAction<number>>;
  data: HocPhanChuong;
  loadingThongTin: boolean;
  apiChuong?: any;
}> = ({ data, setKeyRender, loadingThongTin, apiChuong }) => {
  const [form] = Form.useForm();
  const [status, setStatus] = useState(data?.trang_thai == "1-Đang sử dụng" ? true : false);
  const [modalSave, setModalSave] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [valuesSave, setValueSave] = useState();
  const { t } = useTranslation("chuong-hoc-phan");

  const onFinish = async (values: any) => {
    setValueSave({
      ...values,
      id: data.id,
      trang_thai:
        values.trang_thai == true || values.trang_thai == "1-Đang sử dụng" ? "1-Đang sử dụng" : "2-Dừng sử dụng"
    });
    setModalSave(true);
  };
  const onSave = async () => {
    setLoadingSave(true);
    try {
      valuesSave && (await hocPhanChuongApi.edit(valuesSave));

      apiChuong.success({
        message: "Thành Công",
        description: "Lưu thông tin thành công"
      });
      setModalSave(false);
    } catch (error) {
      apiChuong.error({
        message: "Thất bại",
        description: "Lưu thông tin thất bại"
      });
    } finally {
      setKeyRender(Math.random());
      setLoadingSave(false);
    }
  };

  useEffect(() => {
    if (data) {
      setStatus(data?.trang_thai == "1-Đang sử dụng" ? true : false);
      form.setFieldsValue(data);
    }
  }, [data]);

  return (
    <div className="overflow-y-hidden">
      {loadingThongTin ? (
        <Loading />
      ) : (
        <div className="my-4 ">
          <Form
            initialValues={{ role_code: ROLE.assistant }}
            layout="horizontal"
            onFinish={onFinish}
            form={form}
            className="m-4 "
            colon={false}
          >
            <Row className="flex flex-wrap gap-x-3.5">
              <Form.Item
                name="ten"
                label={<div className="w-24 flex justify-items-start font-medium">Tên chủ đề :</div>}
                initialValue={data?.ten}
                rules={[
                  {
                    required: true,
                    message: t("required.ten")
                  }
                ]}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <Input placeholder="Tên chủ đề" />
              </Form.Item>

              <Form.Item
                name="tuan_mo"
                label={<div className="w-24 flex justify-items-start font-medium">Tuần mở :</div>}
                initialValue={data?.tuan_mo}
                rules={[
                  {
                    required: true,
                    message: t("required.tuan_mo")
                  },
                  ({ getFieldValue }: any) => ({
                    validator(_: any, value: any) {
                      if (!value || getFieldValue("tuan_dong") >= value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Tuần mở cần nhỏ hơn hoặc bằng tuần đóng"));
                    }
                  }),
                  () => ({
                    validator(_: any, value: any) {
                      if (value >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Tuần mở không được phép nhỏ hơn 0"));
                    }
                  })
                ]}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <InputNumber min={0} className="w-full" placeholder="Tuần mở" />
              </Form.Item>

              <Form.Item
                name="tuan_dong"
                label={<span className="w-24 flex justify-items-start font-medium">Tuần đóng :</span>}
                initialValue={data?.tuan_dong}
                rules={[
                  {
                    required: true,
                    message: t("required.tuan_dong")
                  },
                  ({ getFieldValue }: any) => ({
                    validator(_: any, value: any) {
                      if (!value || getFieldValue("tuan_mo") <= value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Tuần đóng cần lớn hơn hoặc bằng tuần mở"));
                    }
                  }),
                  () => ({
                    validator(_: any, value: any) {
                      if (value >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Tuần đóng không được phép nhỏ hơn 0"));
                    }
                  })
                ]}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <InputNumber min={0} className="w-full" placeholder="Tuần đóng" />
              </Form.Item>
              <Form.Item
                name="stt"
                label={
                  <span className="w-24 flex justify-items-start font-medium" style={{ marginLeft: "11.2px" }}>
                    Số thứ tự :
                  </span>
                }
                initialValue={data?.stt}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <InputNumber min={1} className="w-full" placeholder="Số thứ tự" />
              </Form.Item>

              <Form.Item
                name="thoi_gian_thi"
                label={<div className="w-24 flex justify-items-start font-medium">Thời gian thi :</div>}
                initialValue={data?.thoi_gian_thi}
                rules={[
                  {
                    required: true,
                    message: t("required.thoi_gian_thi")
                  },
                  () => ({
                    validator(_: any, value: any) {
                      if (value >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Thời gian thi không được phép nhỏ hơn 0"));
                    }
                  })
                ]}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder="Thời gian thi"
                  suffix={<p className="mr-3 text-neutral-600">( Phút )</p>}
                />
              </Form.Item>

              <Form.Item
                name="thoi_gian_doc"
                label={<span className="w-24 flex justify-items-start font-medium">Thời gian đọc :</span>}
                initialValue={data?.thoi_gian_doc}
                rules={[
                  {
                    required: true,
                    message: t("required.thoi_gian_doc")
                  },
                  () => ({
                    validator(_: any, value: any) {
                      if (value >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Thời gian đọc không được phép nhỏ hơn 0"));
                    }
                  })
                ]}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder="Thời gian đọc"
                  suffix={<p className="mr-3 text-neutral-600">( Phút )</p>}
                />
              </Form.Item>

              <Form.Item
                name="so_cau_hoi"
                label={<span className="w-24 flex justify-items-start font-medium">Số câu hỏi :</span>}
                initialValue={data?.so_cau_hoi}
                rules={[
                  {
                    required: true,
                    message: t("required.so_cau_hoi")
                  },
                  () => ({
                    validator(_: any, value: any) {
                      if (value >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Số câu hỏi không được phép nhỏ hơn 0"));
                    }
                  })
                ]}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <InputNumber min={0} className="w-full" placeholder="Số câu hỏi" />
              </Form.Item>

              <Form.Item
                name="diem_toi_da"
                label={<div className="w-24 flex justify-items-start font-medium">Điểm tối đa :</div>}
                initialValue={data?.diem_toi_da}
                rules={[
                  {
                    required: true,
                    message: t("required.diem_toi_da")
                  },
                  () => ({
                    validator(_: any, value: any) {
                      if (value >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Điểm tối đa không được phép nhỏ hơn 0"));
                    }
                  })
                ]}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <InputNumber min={0} className="w-full" placeholder="Điểm tối đa" />
              </Form.Item>

              <Form.Item
                name="mo_ta"
                label={
                  <span className="w-24 flex justify-items-start font-medium" style={{ marginLeft: "11.2px" }}>
                    Mô tả :
                  </span>
                }
                initialValue={data?.mo_ta}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <TextArea placeholder="Mô tả" />
              </Form.Item>

              <Form.Item
                name="trang_thai"
                label={<span className="w-24 flex justify-items-start font-medium">Trạng thái :</span>}
                style={{ minWidth: "350px", flex: 1 }}
              >
                <Switch
                  onChange={(e) => {
                    setStatus(e);
                  }}
                  checked={status}
                />
              </Form.Item>

              <Col span={24} className="flex justify-end">
                <Button type="primary" htmlType="submit" loading={loadingSave}>
                  Lưu
                </Button>
              </Col>
            </Row>
          </Form>

          <Modal
            open={modalSave}
            onOk={onSave}
            centered
            onCancel={() => setModalSave(false)}
            footer={
              <div className="flex gap-4">
                <Button block danger onClick={() => setModalSave(false)}>
                  Huỷ
                </Button>
                <Button block loading={loadingSave} onClick={onSave}>
                  Xác nhận
                </Button>
              </div>
            }
          >
            <div className="pt-4">
              <h2 className="pb-4 text-center">Chỉnh sửa thông tin</h2>
              <p>
                Bạn muốn sửa thông tin chủ đề hiện tại, hãy chắc chắn mọi dữ liệu đều chính xác trước khi xác nhận lưu.
              </p>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};
export default ChuongHocPhanSide;
