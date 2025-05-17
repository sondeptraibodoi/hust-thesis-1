import { Lop } from "@/interface/lop";
import { FileImageOutlined, FormOutlined, LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button, Input, Upload, Layout, Modal, Select, Tooltip, Form, message } from "antd";
import { FC, useState } from "react";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import thiBuSinhVien from "@/api/thiBu/sinhVien.api";
import { SiMicrosoftexcel } from "react-icons/si";
import { JsonToFormData } from "@/utils/JsonToFormData";
import { ROLE } from "@/interface/user";
interface prop {
  lop: Lop;
}
const { Content } = Layout;
const { Dragger } = Upload;
const { TextArea } = Input;
const DangKyThiBaiPage: FC<prop> = ({ lop }) => {
  return <FromDangKy lop={lop} />;
};
export default DangKyThiBaiPage;

const FromDangKy: FC<prop> = ({ lop }) => {
  const [form] = Form.useForm();
  const dotThi = useLoaiLopThi();
  const [fillter, setFillter]: any = useState([]);
  const [dialog, setDialog] = useState(false);
  const [xacnhan, setXacnhan] = useState(false);
  const [loading, setLoatding] = useState(false);
  const [ly_do, setLydo]: any = useState(null);
  const [dot_thi, setDot_thi]: any = useState(null);
  const [image, setImage]: any = useState([]);
  const navigate = useNavigate();
  const HandleDialog = () => {
    const lop_this: any[] = [];
    dotThi.items.map((item) => {
      if (!item.value.includes("TB-") && !item.value.includes("CK")) {
        lop_this.push({ value: item.title, title: item.value });
      }
    });
    setFillter(lop_this);
    setDialog(true);
  };
  const HandleOffDialog = () => {
    setDialog(false);
    setXacnhan(false);
    setLydo(null);
    setDot_thi(null);
    setImage([]);
  };
  const SetLyDo = (e: any) => {
    setLydo(e.target.value);
    Check();
  };
  const SetDotThi = (e: any) => {
    fillter.map((item: any) => {
      if (item.value === e) {
        setDot_thi(item.title);
      }
    });
    Check();
  };
  const HandleXacNhan = async () => {
    setLoatding(true);
    try {
      await thiBuSinhVien
        .add(
          JsonToFormData({
            ki_hoc: lop.ki_hoc,
            lop_id: lop.id,
            dot_thi,
            ly_do,
            image: image.map((x: any) => x.originFileObj)
          })
        )
        .then((response: any) => {
          if (response.status === 200) {
            message.success(response.data.message);
            setDialog(false);
            navigate("/sohoa/danh-sach-thi-bu-cua-sinh-vien");
            window.location.reload();
          }
          HandleOffDialog();
        });
    } catch (e: any) {
      message.error(e.response.data.message);
      setLoatding(false);
    }
  };
  const Check = () => {
    if (ly_do && ly_do !== "" && dot_thi && dot_thi !== "") {
      setXacnhan(true);
    } else {
      setXacnhan(false);
    }
  };
  const HandleImage = (file: any) => {
    file.fileList.map((item: any) => {
      item.status = "done";
    });
    setImage(file.fileList);
  };
  return (
    <div>
      <Tooltip title="Đăng ký thi bù">
        <Button onClick={HandleDialog} type="text" icon={<FormOutlined />} shape="circle" />
      </Tooltip>
      {lop && (
        <Modal
          mask={true}
          maskClosable={false}
          centered
          className="relative"
          open={dialog}
          onCancel={HandleOffDialog}
          footer={
            xacnhan ? (
              <Button className="w-32" type="primary" onClick={HandleXacNhan}>
                {loading ? (
                  <LoadingOutlined className="text-white text-md" />
                ) : (
                  <span>
                    <FormOutlined /> Xác nhận
                  </span>
                )}
              </Button>
            ) : (
              <span></span>
            )
          }
        >
          <div className="model-container">
            <div className="model-icon create-icon">
              <div>
                <SiMicrosoftexcel />
              </div>
            </div>

            <div className="modal-title-wapper ">
              <p className="modal-title">Thêm mới yêu cầu thi bù</p>
              <p>Thêm yêu cầu thi bù vào hệ thống</p>
            </div>
            <Form initialValues={{ role_code: ROLE.student }} layout="vertical" className="base-form" form={form}>
              <Form.Item label="Tên học phần" name="ten_hp">
                <Input size="large" style={{ color: "#000" }} placeholder={lop.ten_hp} disabled />
              </Form.Item>
              <Form.Item label="Mã lớp" name="ma">
                <Input size="large" style={{ color: "#000" }} placeholder={lop.ma} disabled />
              </Form.Item>
              <Form.Item label="Kì học" name="ki_hoc">
                <Input size="large" style={{ color: "#000" }} placeholder={lop.ki_hoc} disabled />
              </Form.Item>
              <Form.Item label="Chọn đợt thi" name="dot_thi">
                <Select
                  size="large"
                  className="w-full"
                  style={{ color: "#000" }}
                  options={fillter}
                  placeholder="Chọn đợt thi"
                  onChange={SetDotThi}
                />
              </Form.Item>
              <Form.Item label="Lý do" name="ly_do">
                <TextArea placeholder="Lý do không tới dự thi..." rows={4} className="w-full my-1" onChange={SetLyDo} />
              </Form.Item>
              <Form.Item label="Chọn ảnh" name="image">
                <div className=" rounded-md border-slate-300 border-dashed border px-2 my-2">
                  <Dragger
                    name="file"
                    maxCount={50}
                    multiple
                    accept=".jpeg,.png,.jpg,.gif,.svg,.pdf"
                    onChange={HandleImage}
                    defaultFileList={image}
                    listType="picture-card"
                    fileList={image}
                    style={{ border: "none", background: "none" }}
                  >
                    <Layout className="flex justify-center   px-20 py-5 rounded-md">
                      <Content className="flex justify-center w-full px-11  ">
                        <FileImageOutlined className="text-2xl" />
                      </Content>
                      <Content className="flex justify-center w-full px-5 ">Chọn hoặc kéo thả ảnh nếu có.</Content>
                    </Layout>
                  </Dragger>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      )}
    </div>
  );
};
