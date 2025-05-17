import bangDiemApi from "@/api/bangDiem/bangDiem.api";
import diemLopThiApi from "@/api/bangDiem/diemLopThi.api";
import { Lop, LopThi } from "@/interface/lop";
import { checkUserRoleAllowMultiple } from "@/interface/user/auth";
import DiemNhanDien from "@/pages/bang-diem/lop-thi-mon/bang-diem-nhan-dien";
import DiemNhapExcel from "@/pages/bang-diem/lop-thi-mon/diem-nhap-excel";
import { getAuthUser } from "@/stores/features/auth";
import { setHeightAuto } from "@/stores/features/config";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import { convertLinkToBackEnd } from "@/utils/url";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Spin, Typography, Upload, UploadFile, Tag, UploadProps, notification } from "antd";
import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { XacNhanDialog } from "./xac-nhan-dialog";
import { ROLE } from "@/interface/user";
const { Title } = Typography;

const baseApi = convertLinkToBackEnd("/sohoa/api");
export const LopHocBangDiemDaiCuong: FC<{
  lop_thi: LopThi;
  lop: Lop;
}> = () => {
  const dispatch = useAppDispatch();
  const [diemEdit, setDiemEdit] = useState([]);
  const [countDiemSai, setCountDiemSai] = useState(0);
  const location = useLocation().pathname.split("/");
  const [lopThiNhanDienID, setLopThiNhanDienID] = useState();
  const [bangDiemID, setBangDiemID] = useState();
  const [modalSave, setModalSave] = useState(false);
  const [api, contextholder] = notification.useNotification();
  const authUser = useAppSelector(getAuthUser);
  const [showUpdateFile, setShowUpdateFile] = useState(false);
  const [diem, setDiem] = useState<any>([]);
  const lopThiId = location[location.length - 1];
  const [loadingSave, setLoadingSave] = useState(false);
  const [bangDiemDetail, setBangDiemDetail] = useState<any>([]);
  const [loadingSaveFile, SetLoadingSaveFile] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [keyRender, setKeyRender] = useState(0);

  const getLopThiND = async () => {
    const res = await diemLopThiApi.lopThiNhanDien({ id: lopThiId });
    if (res.data && res.data.data.length > 0 && res.data.data[0].id) {
      setLoadingData(true);
    } else if (res.data.data.length === 0) {
      setLoadingData(false);
    }
    setLopThiNhanDienID(res.data.data[0].id);
    setBangDiemID(res.data.data[0].bang_diem_id);
  };
  const luuDiem = async () => {
    setLoadingSave(true);
    if (countDiemSai > 0) {
      api.error({
        message: "Thất bại ",
        description: "Bảng điểm vẫn chưa xác nhận hết, vui lòng xác nhận toàn bộ dữ liệu trước khi lưu"
      });
      setLoadingSave(false);
      return;
    }
    try {
      await diemLopThiApi.save({
        diem: diemEdit,
        id: bangDiemID,
        user: authUser
      });
      api.success({
        message: "Thành Công",
        description: "Lưu điểm thành công"
      });
      setModalSave(false);
      setDiemEdit([]);
    } catch (error) {
      console.error(error);
      api.error({
        message: "Thất bại ",
        description: "Lưu điểm thất bại "
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const getBangDiemDetail = async () => {
    const res = await bangDiemApi.show(bangDiemID);
    setBangDiemDetail(res.data);
  };
  useEffect(() => {
    getLopThiND();
  }, []);
  useEffect(() => {
    if (!bangDiemID) return;
    getBangDiemDetail();
  }, [bangDiemID]);
  useEffect(() => {
    if (!lopThiNhanDienID) return;
    const getDiem = async () => {
      const res = await diemLopThiApi.list({ id: lopThiNhanDienID });
      setDiem(res.data[0]);
      setLoadingData(false);
    };
    getDiem();
  }, [lopThiNhanDienID]);
  useEffect(() => {
    dispatch(setHeightAuto(true));
    return () => {
      dispatch(setHeightAuto(false));
    };
  }, []);
  const onUpdateFile = async (value: any) => {
    SetLoadingSaveFile(true);
    if (value.file.fileList.length > 0) {
      value.file = value.file.fileList[0].originFileObj;
    }
    try {
      await bangDiemApi.updatePdfLopThi({ ...value, id: lopThiId });
      setShowUpdateFile(false);
      setFileList([]);
      setKeyRender(Math.random());
      api.success({
        message: "Thành công",
        description: "Sửa tập tin thành công"
      });
    } catch (error) {
      api.error({
        message: "Thất bại",
        description: "Sửa tập tin thất bại"
      });
    } finally {
      SetLoadingSaveFile(false);
    }
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
  const onCancel = () => {
    setFileList([]);
    setShowUpdateFile(false);
  };
  return (
    <>
      {contextholder}
      <Spin spinning={loadingData} className="w-full"></Spin>
      {!loadingData && (
        <>
          {diem.diem ? (
            <>
              <div className="flex justify-end mb-4">
                {authUser &&
                  checkUserRoleAllowMultiple(authUser, [ROLE.assistant, ROLE.admin]) &&
                  bangDiemDetail.loai === "nhan_dien" && (
                    <Button onClick={() => setShowUpdateFile(true)} className="mr-2">
                      Sửa lại file pdf
                    </Button>
                  )}{" "}
                {bangDiemDetail.loai === "nhan_dien" && (
                  <a href={`${baseApi}/bang-diem/show-slice-pdf/${lopThiNhanDienID}`}>
                    <Button>Tải file pdf</Button>
                  </a>
                )}
                <div className="flex items-center gap-4 ml-auto">
                  {diem?.had_diem ? (
                    <Tag color="success" className="font-medium text-sm">
                      Đã soát điểm
                    </Tag>
                  ) : (
                    <Tag color="warning" className="font-medium text-sm">
                      Chưa soát điểm
                    </Tag>
                  )}
                  {bangDiemDetail.is_cong_khai && <Tag className="text-sm">Bảng điểm đã được công bố</Tag>}
                  <p style={{ color: "#CF1627" }}>
                    <strong>("Nhập dấu - để thể hiện sinh viên không đi thi")</strong>
                  </p>
                  <Button
                    type="primary"
                    onClick={() => setModalSave(true)}
                    disabled={
                      authUser?.roles.includes(ROLE.teacher) &&
                      !authUser?.roles.includes(ROLE.assistant) &&
                      bangDiemDetail.is_cong_khai
                    }
                  >
                    Lưu
                  </Button>
                </div>
              </div>
              <>
                {bangDiemDetail.loai === "nhan_dien" ? (
                  <DiemNhanDien
                    keyRender={keyRender}
                    setCountDiemSai={setCountDiemSai}
                    setDiemEdit={setDiemEdit}
                    diemData={diem}
                    idLopThiNhanDien={lopThiNhanDienID}
                    showExtraInfo
                  />
                ) : (
                  <DiemNhapExcel setDiemEdit={setDiemEdit} diemData={diem} showExtraInfo />
                )}
              </>
            </>
          ) : (
            <p className="text-center text-[20px] text-[#6b6b6b]">Lớp thi này chưa có điểm</p>
          )}
        </>
      )}
      <XacNhanDialog
        open={modalSave}
        onOk={luuDiem}
        centered
        loading={loadingSave}
        onCancel={() => setModalSave(false)}
      />
      <Modal centered open={showUpdateFile} onCancel={onCancel} footer={<></>}>
        <Title className="py-4" level={3}>
          Sửa file pdf
        </Title>
        <Form layout="vertical" onFinish={onUpdateFile}>
          <Form.Item name="file" label="Chọn file để sửa">
            <Upload {...props} accept=".pdf">
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          <div className="flex justify-between">
            <Form.Item className="!mb-0">
              <Button onClick={onCancel}>Huỷ</Button>
            </Form.Item>
            <Form.Item className="!mb-0">
              <Button type="primary" htmlType="submit" loading={loadingSaveFile}>
                Sửa
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};
