import ColorButton from "@/components/Button";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal, notification } from "antd";
import { FC, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./cau-hoi.css";
interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  translation: string;
  icon?: ReactElement;
  data: any;
  api: any;
  route?: string;
  warningText: string;
}
const SuaDoKhoDialog: FC<Props> = ({ show, setShow, translation, data, setKeyRender, api, route, warningText }) => {
  const { t } = useTranslation(translation);
  const [apiResult, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async () => {
    if (!data) {
      return;
    }
    setLoading(true);
    try {
      await api(data.id);
      apiResult.success({
        message: t("message.success_edit_difficulty"),
        description: t("message.success_desc_edit_difficulty")
      });
      setKeyRender(Math.random());
    } catch (err: any) {
      apiResult.error({
        message: t("message.error_edit_difficulty"),
        description: err.response?.data?.message ? err.response?.data?.message : t("message.error_desc_edit_difficulty")
      });
    } finally {
      setShow(false);
      setLoading(false);
      setTimeout(() => {
        route && navigate(route);
      }, 2000);
    }
  };
  const handleCancel = () => {
    setShow(false);
  };

  return (
    <>
      {contextHolder}
      <Modal centered footer={<></>} className="relative" open={show} onCancel={() => handleCancel()} width={570}>
        <div className="delete-icon">
          <div>
            <ExclamationCircleFilled />
          </div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">{t("title.edit_difficulty")}</p>
          <p className="modal-suptitle">{warningText}</p>
        </div>
        <div className="flex justify-between gap-2 pt-4">
          <ColorButton block onClick={handleCancel}>
            {t("action.cancel")}
          </ColorButton>
          <ColorButton block onClick={onFinish} loading={loading} type="primary">
            {t("action.accept")}
          </ColorButton>
        </div>
      </Modal>
    </>
  );
};

export default SuaDoKhoDialog;
