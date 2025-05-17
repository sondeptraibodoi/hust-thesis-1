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
const HuyCauHoiDialog: FC<Props> = ({ show, setShow, translation, data, setKeyRender, api, route, warningText }) => {
  const { t } = useTranslation(translation);
  const [apiResult, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values?: any) => {
    if (!data) {
      return;
    }
    setLoading(true);
    try {
      await api(data.id, values);
      apiResult.success({
        message: t("message.success_delete"),
        description: t("message.success_desc_delete")
      });
      setShow(false);
      setKeyRender(Math.random());
    } catch (err: any) {
      apiResult.error({
        message: t("message.error_delete"),
        description: t("message.error_desc_delete")
      });
    } finally {
      setLoading(false);
      route && navigate(route);
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
          <p className="modal-title">{t("title.delete")}</p>
          <p className="modal-suptitle">{warningText}</p>
        </div>
        <div className="flex justify-between gap-2 pt-4">
          <ColorButton block onClick={handleCancel}>
            {t("action.cancel")}
          </ColorButton>
          <ColorButton block onClick={() => onFinish()} loading={loading} type="primary">
            {t("action.delete")}
          </ColorButton>
          <ColorButton block onClick={() => onFinish({ is_create: true })} loading={loading} type="primary">
            {t("action.deleteAndCreateNew")}
          </ColorButton>
        </div>
      </Modal>
    </>
  );
};

export default HuyCauHoiDialog;
