import { HocPhanChuong } from "@/interface/hoc-phan";
import { ViewCoursePage } from "@/pages/sinh-vien/course";
import { Modal } from "antd";
import { FC } from "react";

interface Props {
  chuong: HocPhanChuong;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}
const ModalReadPdf: FC<Props> = ({ isModalOpen, setIsModalOpen, chuong }) => {
  const onCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <Modal className="tai_lieu_pdf" centered open={isModalOpen} onCancel={onCancel} footer={<></>} width="100%">
      <div>
        {chuong.ma_hoc_phan}-{chuong.ten}
      </div>
      {isModalOpen && <ViewCoursePage showPdfOnly={true} chuongs={[chuong]} canExam={false} />}
    </Modal>
  );
};

export default ModalReadPdf;
