import { LOAI_BAI_THI } from "@/constant";
import { HocPhanChuong } from "@/interface/hoc-phan";
import ThiPage from "@/pages/sinh-vien/course/bai-thi-chuong";
import { App, Modal } from "antd";
import { FC, useCallback, useState } from "react";

const ModalThiThu: FC<{
  chuong: HocPhanChuong;
  onClose: () => void;
}> = ({ chuong, onClose }) => {
  const [loaiThi] = useState(LOAI_BAI_THI.THI_THU);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { notification: apiContext } = App.useApp();
  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    onClose();
  }, [onClose]);
  return (
    <Modal open={isModalOpen} onCancel={handleCancel} footer={<></>} className="modal-thi-thu" width="100%">
      <ThiPage
        loaiThi={loaiThi}
        setLoaiThi={() => {
          handleCancel();
        }}
        dataChuong={chuong}
        apiContext={apiContext}
        noSave
      />
    </Modal>
  );
};
export default ModalThiThu;
