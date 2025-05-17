import { Button, Modal, ModalProps } from "antd";
import { FC } from "react";

export const XacNhanDialog: FC<ModalProps & { loading: boolean }> = ({ loading, onOk, onCancel, ...props }) => {
  return (
    <Modal
      centered
      onCancel={onCancel}
      onOk={onOk}
      footer={
        <div className="flex gap-4">
          <Button block danger onClick={onCancel}>
            Huỷ
          </Button>
          <Button block loading={loading} onClick={onOk}>
            Xác nhận
          </Button>
        </div>
      }
      {...props}
    >
      <div className="pt-4">
        <h2 className="pb-4 text-center">Lưu điểm</h2>
        <p>Bạn muốn lưu dữ liệu bảng điểm hiện tại, hãy chắc chắn mọi dữ liệu đều chính xác trước khi xác nhận lưu.</p>
      </div>
    </Modal>
  );
};
