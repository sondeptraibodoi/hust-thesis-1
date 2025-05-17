import { FC } from "react";
import { Modal } from "antd";

import { ExclamationCircleFilled } from "@ant-design/icons";
import ColorButton from "@/components/Button";

interface Props {
  isModalVisible: boolean;
  onClose: () => void;
  onNopBai: () => void;
}
const NopBaiDialog: FC<Props> = ({ isModalVisible, onClose, onNopBai }) => {
  return (
    <>
      <Modal centered open={isModalVisible} onCancel={onClose} footer={<></>}>
        <div className="delete-icon">
          <div>
            <ExclamationCircleFilled />
          </div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">Nộp bài</p>
          <p className="modal-suptitle">Bạn có chắc muốn nộp bài không? Hành động này không thể được hoàn tác </p>
        </div>
        <div className="flex justify-between gap-2 pt-4">
          <ColorButton block onClick={onClose}>
            Hủy
          </ColorButton>
          <ColorButton
            onClick={() => {
              onNopBai();
              onClose();
            }}
            block
            type="primary"
          >
            Nộp bài
          </ColorButton>
        </div>
      </Modal>
    </>
  );
};

export default NopBaiDialog;
