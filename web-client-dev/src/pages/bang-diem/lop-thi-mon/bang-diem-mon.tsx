import PageContainer from "@/Layout/PageContainer";
import bangDiemApi from "@/api/bangDiem/bangDiem.api";
import diemLopThiApi from "@/api/bangDiem/diemLopThi.api";
import lopThiApi from "@/api/lop/lopThi.api";
import "@/assets/styles/main.scss";
import ImportExcelCompoment from "@/components/importDrawer";
import { DiemLopThi, IBangDiem } from "@/interface/bangdiem";
import { LopThi } from "@/interface/lop";
import { getAuthUser } from "@/stores/features/auth";
import { useAppSelector } from "@/stores/hook";
import { convertLinkToBackEnd } from "@/utils/url";
import { UploadOutlined } from "@ant-design/icons";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Form, Modal, Typography, Upload, UploadFile, UploadProps, notification } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import DiemNhanDien from "./bang-diem-nhan-dien";
import DiemNhapExcel from "./diem-nhap-excel";
import { ROLE } from "@/interface/user";

const baseApi = convertLinkToBackEnd("/sohoa/api");
const { Title } = Typography;

const BangDiemMon = () => {
  const breadcrumbs = useMemo(() => {
    return [
      { router: "../", text: "Bảng điểm" },
      { router: "..", text: "Danh sách lớp thi môn" },
      { text: "Điểm chi tiết" }
    ];
  }, []);
  const [diem, monInfo] = useLoaderData() as [DiemLopThi[], IBangDiem];
  const loca = useLocation();
  const lopThiId = Number(loca.search.split("=")[1]);
  const path = loca.pathname.split("/");
  const [api, contextholder] = notification.useNotification();
  const [diemEdit, setDiemEdit] = useState<DiemLopThi[]>([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const authUser = useAppSelector(getAuthUser);
  const bangDiemId = Number(path[3]);
  const [lopThi, setLopThi] = useState<LopThi>();
  const [countDiemSai, setCountDiemSai] = useState<number>(0);
  const [loadingSaveFile, SetLoadingSaveFile] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [modalSave, setModalSave] = useState(false);
  const [showUpdateFile, setShowUpdateFile] = useState(false);
  const [keyRender, setKeyRender] = useState(0);

  const is_cong_khai = monInfo.is_cong_khai;
  const is_nhap_tay = monInfo.loai;

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
        id: bangDiemId,
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
  const getLopThi = async () => {
    try {
      const res = await lopThiApi.getDetail(lopThiId, {});
      setLopThi(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getLopThi();
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
      api.success({
        message: "Thành công",
        description: "Sửa tập tin thành công"
      });
      setKeyRender(Math.random());
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

  const uploadformApi = (data: any) => {
    const items_format = data.items.map((x: any) => {
      const res: any = {};

      for (const property in data.fields) {
        const key_value = data.fields[property];
        res[property] = x[key_value];
      }
      return res;
    });
    const newData: any = diem;
    items_format.forEach((item: any) => {
      const index = newData[0].diem.findIndex((x: any) => x.mssv == item.mssv);
      if (index > -1) {
        (newData[0].diem[index] as any).diem = item.diem;
      }
    });
    setDiemEdit(newData[0].diem);
    setKeyRender(Math.random());

    api.success({
      message: "Thành công",
      description: "Vui lòng kiểm tra lại điểm và ấn lưu để lưu dữ liệu điểm"
    });
    return Promise.resolve({});
  };

  return (
    <PageContainer breadcrumbs={breadcrumbs} title={`Bảng điểm lớp thi ${lopThi?.ma || ""}`}>
      {contextholder}
      <>
        <div className="mb-2 flex justify-end items-center" style={{ fontSize: "20px", color: "#000" }}>
          {(authUser?.roles.includes(ROLE.assistant) || authUser?.roles.includes(ROLE.admin)) &&
            monInfo?.loai === "nhan_dien" && (
              <Button onClick={() => setShowUpdateFile(true)} className="mr-2">
                Sửa lại file pdf
              </Button>
            )}
          {monInfo?.loai === "nhan_dien" && (
            <a href={`${baseApi}/bang-diem/show-slice-pdf/${path[path.length - 1]}`}>
              <Button>Tải file pdf</Button>
            </a>
          )}
          <div className="flex items-center gap-4 ml-auto">
            {is_cong_khai && <p>Bảng điểm đã được công bố</p>}
            <p style={{ color: "#CF1627" }}>
              <strong>("Nhập dấu - để thể hiện sinh viên không đi thi")</strong>
            </p>
            <div className="flex items-end">
              {is_nhap_tay === "nhap_tay" ? (
                <ImportExcelCompoment
                  fieldName={[{ name: "mssv" }, { name: "diem" }]}
                  fileDownloadName="giao_vien"
                  downloadable={false}
                  uploadType=" .xls,.xlsx"
                  buttonElement={<Button type="primary">Nhập điểm excel</Button>}
                  appcectType={[
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel"
                  ]}
                  translation="importExcel"
                  uploadformApi={uploadformApi}
                  disableNotify
                />
              ) : (
                ""
              )}
              <Button
                type="primary"
                className="ml-2"
                onClick={() => setModalSave(true)}
                disabled={
                  authUser?.roles.includes(ROLE.teacher) && !authUser?.roles.includes(ROLE.assistant) && is_cong_khai
                }
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>

        {monInfo?.loai === "nhap_tay" ? (
          <div className="col-span-2 score">
            <DiemNhapExcel setDiemEdit={setDiemEdit} diemData={diem[0]} key={keyRender} />
          </div>
        ) : (
          <DiemNhanDien
            keyRender={keyRender}
            setCountDiemSai={setCountDiemSai}
            setDiemEdit={setDiemEdit}
            diemData={diem[0]}
          />
        )}
      </>
      <Modal
        open={modalSave}
        onOk={luuDiem}
        centered
        onCancel={() => setModalSave(false)}
        footer={
          <div className="flex gap-4">
            <Button block danger onClick={() => setModalSave(false)}>
              Huỷ
            </Button>
            <Button block loading={loadingSave} onClick={luuDiem}>
              Xác nhận
            </Button>
          </div>
        }
      >
        <div className="pt-4">
          <h2 className="pb-4 text-center">Lưu điểm</h2>
          <p>
            Bạn muốn lưu dữ liệu bảng điểm hiện tại, hãy chắc chắn mọi dữ liệu đều chính xác trước khi xác nhận lưu.
          </p>
        </div>
      </Modal>
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
    </PageContainer>
  );
};

export default BangDiemMon;
