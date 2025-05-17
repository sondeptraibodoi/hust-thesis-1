import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import ColorButton from "@/components/Button";
import { CauHoiCellRender } from "@/components/TrangThaiCellRender";
import { STATUS_QUESTION } from "@/constant";
import { App, Form, Input, Modal, Typography } from "antd";
import Title from "antd/es/typography/Title";
import { FC, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiMicrosoftexcel } from "react-icons/si";
import { CauHoiPhanBien } from "./part/cau-hoi-phan-bien";
import { CauHoiViewComplex } from "./part/cau-hoi-view-complex";

interface Props {
  openModal: boolean;
  icon?: ReactNode;
  closeModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  dataEdit: any;
}

const ModalXemTruocCauHoi: FC<Props> = ({ openModal, closeModal, dataEdit, setKeyRender }) => {
  const { t } = useTranslation("cau-hoi-chuong-hoc-phan");
  const [loading, setLoading] = useState(false);
  const [loadingTuChoi, setLoadingTuChoi] = useState(false);
  const { notification } = App.useApp();
  const [lyDoView, setLyDoView] = useState<string>("");

  const [form] = Form.useForm();

  const isPhanBien = dataEdit?.trang_thai_cau_hoi !== STATUS_QUESTION.MOI_TAO && dataEdit?.cau_hoi;

  const handleCancel = () => {
    closeModal(false);
    setLyDoView("");
    form.setFieldsValue({ ly_do: undefined });
  };
  const onSentPheDuyet = async () => {
    const success = "message.success_add";
    const error = "message.error_add";
    try {
      setLoading(true);
      await cauHoiApi.sendPheDuyet(dataEdit.id);
      notification.success({
        message: t(success),
        description: t("message.success_yeu_cau_phe_duyet")
      });
      setKeyRender(Math.random());
      handleCancel();
    } catch (err: any) {
      notification.error({
        message: t(error),
        description: t("message.error_yeu_cau_phe_duyet")
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataEdit) {
      form.setFieldsValue({
        ly_do: dataEdit.ly_do
      });
    }
  }, [form, dataEdit]);

  const onSentPhanBien = async (action: string) => {
    const success = "message.success_add";
    const error = "message.error_add";
    const values = await form.validateFields();
    const { ly_do } = values;
    try {
      action == "pheDuyet" ? setLoading(true) : setLoadingTuChoi(true);
      await cauHoiApi.sendPhanBien(dataEdit.cau_hoi_id, {
        ly_do,
        action,
        trang_thai_cau_hoi: dataEdit.trang_thai_cau_hoi
      });
      notification.success({
        message: t(success),
        description: t("message.success_phan_bien")
      });
    } catch (err: any) {
      notification.error({
        message: t(error),
        description: err.response.data?.message ? err.response.data.message : t("message.error_phan_bien")
      });
    } finally {
      action == "pheDuyet" ? setLoading(false) : setLoadingTuChoi(false);
      setKeyRender(Math.random());
      form.resetFields();
      handleCancel();
    }
  };

  const handleLydo = (e: any) => {
    const newValue = e.target.value;
    setLyDoView(newValue);
  };

  return (
    <Modal
      title={!isPhanBien && t("field.noi_dung")}
      open={openModal}
      onCancel={handleCancel}
      footer={
        <div className="flex justify-between gap-4">
          <ColorButton block onClick={handleCancel}>
            {t("action.cancel")}
          </ColorButton>
          {isPhanBien ? (
            <>
              <ColorButton
                block
                htmlType="submit"
                loading={loading}
                type="primary"
                onClick={() => onSentPhanBien("pheDuyet")}
              >
                {t("action.phe_duyet")}
              </ColorButton>
              <ColorButton
                block
                htmlType="submit"
                loading={loadingTuChoi}
                type="primary"
                danger
                onClick={() => onSentPhanBien("tuChoi")}
              >
                {t("action.tu_choi")}
              </ColorButton>
            </>
          ) : (
            <ColorButton block htmlType="submit" loading={loading} type="primary" onClick={onSentPheDuyet}>
              {t("action.gui_phe_duyet")}
            </ColorButton>
          )}
        </div>
      }
      width={700}
      centered
    >
      {isPhanBien ? (
        <>
          <div className="model-icon create-icon">
            <div>
              <SiMicrosoftexcel />
            </div>
          </div>
          <div className="modal-title-wapper ">
            <p className="modal-title">{t("title.phan_bien")}</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            <div className="model-container">
              <Title level={5}>{t("field.noi_dung")}</Title>
              {dataEdit.cau_hoi && <CauHoiViewComplex cauHoi={dataEdit.cau_hoi} />}
            </div>
            <Form form={form} layout="vertical">
              <Form.Item>
                <Title level={5} className="pt-4">
                  {t("field.lich_su_phan_bien")}
                </Title>
                <CauHoiPhanBien id={dataEdit.cau_hoi_id} />
              </Form.Item>
              <Title level={5}>{t("field.ly_do")}</Title>
              <Form.Item name="ly_do">
                <Input.TextArea rows={4} placeholder="Nhập lý do" onChange={handleLydo} />
              </Form.Item>
              <Form.Item>
                <div className="relative mt-4" style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
                  <div className="mx-3 bg-white -top-3.5">
                    <Typography.Title level={5}>Xem trước</Typography.Title>
                  </div>
                  <div className="p-5">
                    <CauHoiCellRender data={lyDoView} />
                  </div>
                </div>
              </Form.Item>
            </Form>
          </div>
        </>
      ) : (
        <div className="model-container">{dataEdit && <CauHoiViewComplex cauHoi={dataEdit} />}</div>
      )}
    </Modal>
  );
};

export default ModalXemTruocCauHoi;
