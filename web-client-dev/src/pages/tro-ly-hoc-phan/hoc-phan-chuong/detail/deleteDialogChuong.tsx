import { FC, useState } from "react";
import { Modal, notification } from "antd";

import { ExclamationCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import ColorButton from "@/components/Button";

interface Props {
  id: number;
  openModal: boolean;
  name: string | undefined;
  closeModal: (value: boolean) => void;
  setKeyRender?: (value: number) => void;
  translation: string;
  renderAgain?: any;
  setOpenTable?: any;
  isDeleteTaiLieu?: boolean;
  setCurrent?: (value: boolean) => void;
}
const DeleteDialogChuong: FC<Props> = (props) => {
  const {
    openModal,
    closeModal,
    name,
    setKeyRender,
    id,
    translation,
    renderAgain,
    setOpenTable,
    isDeleteTaiLieu,
    setCurrent
  } = props;
  const { t } = useTranslation(translation);
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const cancel = () => {
    closeModal(false);
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await hocPhanChuongApi.delete(id);
      api.success({
        message: t("message.success_delete"),
        description: res.data.message
      });
      setOpenTable && setOpenTable(false);
      renderAgain && renderAgain(Math.random());
    } catch (error: any) {
      api.error({
        message: t("message.error_delete"),
        description: error?.response?.data?.error
      });
    } finally {
      setLoading(false);
      setKeyRender && setKeyRender(Math.random());
      setCurrent && setCurrent(true);
      closeModal(false);
    }
  };
  return (
    <>
      {contextHolder}
      <Modal centered open={openModal} onCancel={cancel} footer={<></>}>
        <div className="delete-icon">
          <div>
            <ExclamationCircleFilled />
          </div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">{isDeleteTaiLieu ? "Xóa tài liệu chủ đề" : " Xóa chủ đề học phần"}</p>
          <p className="modal-suptitle">
            Bạn có chắc muốn xoá <b> {name} </b> này không? Hành động này không thể được hoàn tác{" "}
          </p>
        </div>
        <div className="flex justify-between gap-2 pt-4">
          <ColorButton block onClick={cancel}>
            {t("action.cancel")}
          </ColorButton>
          <ColorButton block onClick={handleDelete} loading={loading} type="primary">
            {t("action.delete")}
          </ColorButton>
        </div>
      </Modal>
    </>
  );
};

export default DeleteDialogChuong;
