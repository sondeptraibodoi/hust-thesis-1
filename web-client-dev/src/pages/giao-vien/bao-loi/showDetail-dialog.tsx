/* eslint-disable react-hooks/rules-of-hooks */
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { Modal, Form, notification, Row, Col, Card, Button, App } from "antd";
import { useTranslation } from "react-i18next";

import ColorButton from "@/components/Button";
import DialogContainerForm from "@/components/dialog/dialog-container";
import { InfoCircleOutlined } from "@ant-design/icons";
import { BaoLoi } from "@/interface/bao-loi";
import { useQuery } from "@tanstack/react-query";
import baoLoiApi from "@/api/bao-loi/baoLoi.api";
import { Loading } from "@/pages/Loading";
import { convertLinkToBackEnd } from "@/utils/url";
import { TrangThaiPhucKhaoStatusCellRender } from "@/pages/phuc-khao/sinh-vien-phuc-khao";
import phucKhaoApi from "@/api/phucKhao/phucKhao.api";
import { useHandleError } from "@/hooks/useHandleError";

interface Props {
  openModal: boolean;
  data?: BaoLoi;
  closeModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  translation: string;
  apiEdit: any;
  icon?: ReactNode;
  onEditSuccess?: () => void;
}
const baseApi = convertLinkToBackEnd("/sohoa/api");

const ShowDetailDialog: FC<Props> = (props) => {
  const { openModal, closeModal, data, setKeyRender, translation, apiEdit, onEditSuccess } = props;
  const { t } = useTranslation(translation);
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [unSubmit, setUnSubmit] = useState(false);

  useEffect(() => {
    form.setFieldsValue(data);
    setUnSubmit(data?.trang_thai ? true : false);
  }, [data, form]);
  const onFinish = async (values: any) => {
    setLoading(true);
    const status = unSubmit ? 0 : 1;
    try {
      await apiEdit({
        ...data,
        ...values,
        trang_thai: status
      });
      api.success({
        message: t("message.success_edit"),
        description: t("message.success_desc_edit")
      });
      closeModal(false);
      form.resetFields();
      setKeyRender(Math.random());
      refetch();
      if (onEditSuccess) onEditSuccess();
    } catch (err: any) {
      api.error({
        message: t("message.error_edit"),
        description: t("message.error_edit")
      });
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    closeModal(false);
    form.resetFields();
  };

  const {
    data: dataBaoLoi,
    refetch,
    isLoading
  } = useQuery({
    refetchOnMount: false,
    staleTime: Infinity,
    enabled: !!data && !!data.id,
    queryKey: ["tro-ly", "bao-loi", data?.id] as const,
    queryFn: ({ queryKey }) => {
      const [_1, _2, id] = queryKey;
      return baoLoiApi.showDetail(id!).then((res) => res.data);
    }
  });
  return (
    <div>
      {contextHolder}
      <Modal centered open={openModal} onCancel={cancel} footer={<></>} className="relative" width={570}>
        <DialogContainerForm
          titleText="Thông tin báo lỗi"
          onCancel={cancel}
          onFinish={onFinish}
          loading={loading}
          form={form}
          noFooter
          icon={<InfoCircleOutlined />}
        >
          <Row gutter={[16, 16]}>
            <Col span={8} className="font-bold">
              MSSV:{" "}
            </Col>
            <Col span={16}>{data?.mssv}</Col>
            <Col span={8} className="font-bold">
              Tên sinh viên:{" "}
            </Col>
            <Col span={16}>{data?.name}</Col>

            <Col span={8} className="font-bold">
              Mã lớp học:{" "}
            </Col>
            <Col span={16}>{data?.ma}</Col>

            <Col span={8} className="font-bold">
              Mã lớp thi:{" "}
            </Col>
            <Col span={16}>{data?.ma_lop_thi}</Col>

            <Col span={8} className="font-bold">
              Tiêu đề:{" "}
            </Col>
            <Col span={16}>{data?.tieu_de}</Col>
            {isLoading && <Loading></Loading>}
            {dataBaoLoi && data?.ly_do && (
              <>
                {["Sai điểm", "Chưa có điểm"].includes(data?.ly_do) && <SaiDiemContent data={dataBaoLoi} />}
                {data?.ly_do == "Trạng thái thanh toán không đổi" && (
                  <TrangThaiPhucKhaoKhongDoiContent data={dataBaoLoi} onReset={refetch} />
                )}
              </>
            )}
          </Row>
          <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
            <div className="flex justify-between gap-4">
              <ColorButton block onClick={cancel}>
                {t("action.cancel")}
              </ColorButton>
              <ColorButton block htmlType="submit" loading={loading} type="primary">
                {!unSubmit ? "Đã xử lý" : "Chuyển về chưa xử lý"}
              </ColorButton>
            </div>
          </Form.Item>
        </DialogContainerForm>
      </Modal>
    </div>
  );
};

const TrangThaiPhucKhaoKhongDoiContent: FC<{
  data: BaoLoi & {
    tin_nhan: string;
    ngay_gui_sms: string;
    phuc_khao?: {
      ngay_phuc_khao: string;
      trang_thai: string;
      ma_thanh_toan: string;
      id: number;
    };
  };
  onReset: any;
}> = ({ data, onReset }) => {
  const { handlePromise } = useHandleError();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("common");
  const { notification: api } = App.useApp();
  const onChuyenTrangThaiThanhToan = useCallback(() => {
    handlePromise(
      () => {
        return phucKhaoApi.edit({ id: data.phuc_khao!.id, trang_thai: "da_thanh_toan" });
      },
      {
        setLoading,
        callWhenSuccess: async () => {
          api.success({
            message: t("message.success_add"),
            description: t("message.success_desc_add")
          });
          onReset && onReset();
        }
      }
    );
  }, [data]);
  return (
    <Card size="small" title="Thông tin thêm" style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col span={8} className="font-bold">
          Ngày phúc khảo:{" "}
        </Col>
        <Col span={16}>{data?.phuc_khao?.ngay_phuc_khao}</Col>
        <Col span={8} className="font-bold">
          Trạng thái phúc khảo:{" "}
        </Col>
        <Col span={16}>
          <TrangThaiPhucKhaoStatusCellRender data={data.phuc_khao} />{" "}
          {data.phuc_khao?.trang_thai == "chua_thanh_toan" && (
            <Button onClick={onChuyenTrangThaiThanhToan} loading={loading}>
              Chuyển thành đã thanh toán
            </Button>
          )}
        </Col>
        <Col span={8} className="font-bold">
          Số tài khoản:{" "}
        </Col>
        <Col span={16}>{data && data.ghi_chu && JSON.parse(data.ghi_chu)?.so_tai_khoan}</Col>

        <Col span={24} className="font-bold">
          Tin nhắn chuyển khoản:{" "}
        </Col>
        <Col span={24}>{data?.tin_nhan}</Col>

        {data?.ngay_gui_sms ? (
          <>
            <Col span={8} className="font-bold">
              Ngày gửi tin nhắn:{" "}
            </Col>
            <Col span={16}>{data?.ngay_gui_sms}</Col>
          </>
        ) : (
          <></>
        )}
      </Row>
    </Card>
  );
};
const SaiDiemContent: FC<{
  data: BaoLoi & { stt: string; diem: number; diemNhanDienId?: number };
}> = ({ data }) => {
  return (
    <Col span={24}>
      <Card size="small" title="Thông tin thêm" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col span={8} className="font-bold">
            Số thứ tự thi:
          </Col>
          <Col span={16}>{data?.stt}</Col>
          <Col span={8} className="font-bold">
            Điểm:
          </Col>
          <Col span={16}>{data?.diem}</Col>

          {data?.diemNhanDienId ? (
            <>
              <Col span={24} className="font-bold">
                Bảng điểm:{" "}
              </Col>
              <Col span={24} className="w-full min-h-[450px]">
                <iframe
                  className="w-full min-h-[450px]"
                  src={`${baseApi}/bang-diem/show-slice-pdf/${data?.diemNhanDienId}`}
                ></iframe>
              </Col>
            </>
          ) : (
            <></>
          )}
        </Row>
      </Card>
    </Col>
  );
};
export default ShowDetailDialog;
