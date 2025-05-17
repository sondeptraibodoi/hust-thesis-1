import { App, Modal } from "antd";
import { FC, useState } from "react";

import { ExclamationCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ColorButton from "../Button";

interface Props {
  openModal: boolean;
  name: string | undefined;
  closeModal: (value: boolean) => void;
  setKeyRender?: (value: number) => void;
  apiDelete: any;
  translation: string;
  renderAgain?: any;
  titleSuccess?: string;
  subtitle?: string;
  title?: string;
  buttonDelete?: string;
  onDone?: () => any;
  buttonCancel?: string;
}
const DeleteDialog: FC<Props> = (props) => {
  const {
    openModal,
    closeModal,
    name,
    setKeyRender,
    apiDelete,
    translation,
    renderAgain,
    titleSuccess,
    subtitle,
    title,
    buttonDelete,
    onDone,
    buttonCancel
  } = props;
  const { t } = useTranslation(translation);
  const { notification: api } = App.useApp();
  const [loading, setLoading] = useState(false);
  const cancel = () => {
    closeModal(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiDelete();
      api.success({
        message: t("message.success_delete"),
        description: titleSuccess || t("message.success_desc_delete")
      });
      renderAgain && renderAgain(Math.random());
      onDone && onDone();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t("message.error_desc_delete");

      api.error({
        message: t("message.error_delete"),
        description: errorMessage
      });
    } finally {
      setLoading(false);
      setKeyRender && setKeyRender(Math.random());
      closeModal(false);
    }
  };
  return (
    <Modal centered open={openModal} onCancel={cancel} footer={<></>}>
      <div className="delete-icon">
        <div>
          <ExclamationCircleFilled />
        </div>
      </div>

      <div className="modal-title-wapper">
        <p className="modal-title">{title || t("title.delete")}</p>
        <p className="modal-suptitle">
          Bạn có chắc muốn xoá <b> {name} </b> này không? Hành động này không thể được hoàn tác{subtitle}
        </p>
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <ColorButton block onClick={cancel}>
          {buttonCancel || t("action.cancel")}
        </ColorButton>
        <ColorButton block onClick={handleDelete} loading={loading} type="primary">
          {buttonDelete || t("action.delete")}
        </ColorButton>
      </div>
    </Modal>
  );
};

export default DeleteDialog;
