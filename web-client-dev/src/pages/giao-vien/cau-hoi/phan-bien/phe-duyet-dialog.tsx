import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { DialogContainerForm } from "@/components/dialog/dialog-container";
import { CauHoiCellRender } from "@/components/TrangThaiCellRender";
import { useHandleError } from "@/hooks/useHandleError";
import { HocPhanCauHoi } from "@/interface/hoc-phan";
import { App, Form, Input, Modal, Typography } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
const { Title } = Typography;
export const PheDuyetDialog: FC<{
  data: HocPhanCauHoi;
  openModal: boolean;
  closeModal?: (value: boolean) => void;
  type: "tuChoi" | "pheDuyet";
  onSubmit?: () => void;
}> = ({ openModal, closeModal, type, data, onSubmit }) => {
  const { t } = useTranslation("common");
  const { t: tCauHoiChuong } = useTranslation("cau-hoi-chuong-hoc-phan");
  const [form] = Form.useForm();
  const onCancel = () => {
    closeModal && closeModal(false);
  };
  const { handlePromise } = useHandleError({ form });
  const { notification: api } = App.useApp();
  const onFinish = async (values: any) => {
    handlePromise(
      () => {
        return cauHoiApi.sendPhanBien(data.id, {
          ly_do: values.ly_do,
          action: type,
          trang_thai_cau_hoi: data.trang_thai_cau_hoi
        });
      },
      {
        setLoading,
        callWhenSuccess: async () => {
          api.success({
            message: t("message.success_add"),
            description: t("message.success_desc_add")
          });
          onCancel();
          onSubmit && onSubmit();
        }
      }
    );
  };
  const [loading, setLoading] = useState(false);
  const title = type == "pheDuyet" ? "Phê duyệt câu hỏi" : "Từ chối câu hỏi";
  return (
    <Modal open={openModal} onCancel={onCancel} footer={<></>}>
      <DialogContainerForm
        titleText={title}
        onCancel={onCancel}
        onFinish={onFinish}
        loading={loading}
        form={form}
        propsButtonSubmit={{ danger: type === "tuChoi" }}
        textButtonSubmit={tCauHoiChuong("action." + (type === "pheDuyet" ? "phe_duyet" : "tu_choi"))}
      >
        <Form.Item name="ly_do">
          <Input.TextArea rows={4} placeholder="Nhập lý do" />
        </Form.Item>

        <Form.Item>
          <ViewLyDo></ViewLyDo>
        </Form.Item>
      </DialogContainerForm>
    </Modal>
  );
};

const ViewLyDo: FC = () => {
  const form = Form.useFormInstance();
  const lyDoView = Form.useWatch("ly_do", form);
  return (
    <div className="relative p-4" style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
      <div className="mx-3">
        <Title level={5}>Xem trước</Title>
      </div>
      <div className="px-5">
        <CauHoiCellRender data={lyDoView} />
      </div>
    </div>
  );
};
