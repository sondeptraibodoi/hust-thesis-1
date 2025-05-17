import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import { InboxOutlined, LinkOutlined } from "@ant-design/icons";
import { App, Button, Form, Modal, Upload, UploadFile, UploadProps } from "antd";
import { FC, useState } from "react";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  chuongId: string | number;
  onDone?: () => void;
}

const { Dragger } = Upload;

const ModalTaiLieu: FC<Props> = ({ isModalOpen, setIsModalOpen, chuongId, onDone }) => {
  const { notification } = App.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadingSaveFile, SetLoadingSaveFile] = useState(false);
  // const [showUpdateFile, setShowUpdateFile] = useState(false);

  const onCancel = () => {
    setFileList([]);
    setIsModalOpen(false);
  };

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList
  };
  const onUpdateFile = async (value: any) => {
    SetLoadingSaveFile(true);
    if (value?.file?.fileList?.length > 0) {
      value.file = value.file.fileList[0].originFileObj;
    }
    try {
      await hocPhanChuongApi.addTaiLieu({ ...value, id: chuongId });
      setIsModalOpen(false);
      setFileList([]);
      notification.success({
        message: "Thành công",
        description: "Thêm tập tin thành công"
      });
      onDone && onDone();
    } catch (error: any) {
      notification.error({
        message: "Thất bại",
        description: error.response.data.error ? error.response.data.error : "Thêm tập tin thất bại"
      });
    } finally {
      SetLoadingSaveFile(false);
    }
  };

  return (
    <>
      <Modal centered open={isModalOpen} onCancel={onCancel} footer={<></>}>
        <div className="py-3 font-bold" style={{ fontSize: "16px" }}>
          <LinkOutlined /> Thêm tài liệu chủ đề (pdf)
        </div>
        <Form layout="vertical" onFinish={onUpdateFile}>
          <Form.Item name="file">
            <Dragger {...props} accept=".pdf">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{"Kéo thả tập tin vào hoặc bấm để tải tập tin lên"}</p>
              <p className="ant-upload-hint">
                {"Hệ thống chỉ nhận 1 tập tin 1 lần và sẽ nhận tập tin được tải lên mới nhất"}
              </p>
            </Dragger>
          </Form.Item>
          <div className="flex justify-end">
            <Form.Item className="mr-2">
              <Button onClick={onCancel}>Đóng</Button>
            </Form.Item>
            <Form.Item className="">
              <Button type="primary" htmlType="submit" loading={loadingSaveFile}>
                Bắt đầu tải lên
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ModalTaiLieu;
