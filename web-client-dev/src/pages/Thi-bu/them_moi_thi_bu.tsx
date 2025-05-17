import { FileImageOutlined, FormOutlined, LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button, Input, Upload, Layout, Modal, Select, Form, message } from "antd";
import { useEffect, useState } from "react";
import apiKihoc from "@/api/kiHoc/kiHoc.api";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import thiBuSinhVien from "@/api/thiBu/sinhVien.api";
import { SiMicrosoftexcel } from "react-icons/si";
import { JsonToFormData } from "@/utils/JsonToFormData";
import { ROLE } from "@/interface/user";
const { Content } = Layout;
const { Dragger } = Upload;
const { TextArea } = Input;
const DangKyThiBuPage = () => {
  return <FromDangKy />;
};
export default DangKyThiBuPage;

const FromDangKy = () => {
  const [form] = Form.useForm();
  const dotThi = useLoaiLopThi();
  const [fillter, setFillter]: any = useState([]);
  const [dialog, setDialog] = useState(false);
  const [xacnhan, setXacnhan] = useState(false);
  const [loading, setLoatding] = useState(false);
  const [ly_do, setLydo]: any = useState(null);
  const [dot_thi, setDot_thi]: any = useState(null);
  const [fillterKihoc, setFillterKihoc]: any[] = useState([]);
  const [ki_hoc, setKi_hoc]: any = useState(null);
  const [lop_id, setLop_id]: any = useState(null);
  const [ma_hp, setMa_hp]: any = useState([]);
  const [image, setImage]: any = useState([]);
  const navigate = useNavigate();
  const GetKiHoc = async () => {
    try {
      await apiKihoc.list().then((response: any) => {
        if (response.status === 200) {
          response.data.map((kihoc: any) => {
            fillterKihoc.push({
              value: kihoc,
              title: kihoc
            });
          });
          setFillterKihoc(fillterKihoc);
        }
      });
    } catch (e: any) {
      message.error(e.response.data.message || e.message);
    }
  };
  const GetHocPhan = async () => {
    try {
      await thiBuSinhVien.getHocPhan().then((response: any) => {
        if (response.status === 200) {
          response.data.data.map((lop: any) => {
            ma_hp.push({
              value: lop.ma_hp + "-" + lop.ten_hp,
              code: lop.lop_id
            });
          });
        }
        setMa_hp(ma_hp);
      });
    } catch (e: any) {
      message.error(e.response.data.message || e.message);
    }
  };
  const SetKiHoc = (e: any) => {
    setKi_hoc(e);
    Check();
  };
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
    setKi_hoc(null);
    setLop_id(null);
    SetKiHoc(null);
    setImage([]);
  };
  const SetLop = (e: any) => {
    ma_hp.map((item: any) => {
      if (item.value === e) {
        setLop_id(item.code);
      }
    });
    Check();
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
            ki_hoc,
            lop_id,
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
          }
          HandleOffDialog();
        });
    } catch (e: any) {
      message.error(e.response.data.message);
      setLoatding(false);
    }
  };
  const Check = () => {
    if (ly_do && dot_thi && lop_id && ki_hoc) {
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
  useEffect(() => {
    GetHocPhan();
    GetKiHoc();
  }, [fillterKihoc, ma_hp]);
  return (
    <div>
      <Button onClick={HandleDialog} style={{ float: "right" }} type="primary">
        Thêm mới
      </Button>

      <Modal
        width={570}
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
            <Form.Item label="Kì học" name="ki_hoc">
              <Select
                size="large"
                className="w-full"
                style={{ color: "#000" }}
                options={fillterKihoc}
                placeholder="Chọn kì học"
                onChange={SetKiHoc}
              />
            </Form.Item>
            <Form.Item label="Lớp học" name="ma">
              <Select
                size="large"
                className="w-full"
                style={{ color: "#000" }}
                options={ma_hp}
                placeholder="Chọn học phần"
                onChange={SetLop}
              />
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
    </div>
  );
};
