import { App, Button, Card, Col, Modal, Select, Table } from "antd";
import { FC, useCallback, useEffect, useState } from "react";

import { AxiosError } from "axios";
import ImportExcelCompoment from "@/components/importDrawer";
import { Laravel400ErrorResponse } from "@/interface/axios/laravel";
import { LoaiLopThi } from "@/constant";
import { Lop } from "@/interface/lop";
import ModalExport from "@/pages/lop/detail/modal-export";
import ModalExportExcel from "@/components/export/export-excel";
import { SiMicrosoftexcel } from "react-icons/si";
import { SinhVien } from "@/interface/user";
import Title from "antd/es/typography/Title";
import { dealsWith } from "@/api/axios/error-handle";
import diemYThucApi from "@/api/lop/diemYThuc.api";
import downloadApi from "@/api/download.api";
import exportApi from "@/api/export/export.api";
import lopHocApi from "@/api/lop/lopHoc.api";
import { queryLopHocWithDiemApi } from "@/query";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const LopHocListSinhVienPage: FC<{
  lop: Lop;
  lopAll?: Lop;
}> = ({ lop, lopAll }) => {
  const [loadingQTDownload, setLoadingQTDownload] = useState(false);
  const [loadingCKDownload, setLoadingCKDownload] = useState(false);
  const [dataSource, setDataSource] = useState<SinhVien[]>([]);
  const [viewDataSource, setViewDataSource] = useState<SinhVien[]>([]);
  const [viewYThuc, setViewYThuc] = useState(0);
  const [key] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingYThuc, setLoadingYThuc] = useState(false);
  const [modalExport, setModalExport] = useState(false);
  const [modalExportExcel, setModalExportExcel] = useState(false);
  const [modalExportSinhVien, setModalExportSinhVien] = useState(false);
  const [modalExportDTT, setModalExportDTT] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const { notification: api } = App.useApp();
  const { id } = useParams();
  const [keyRender, setKeyRender] = useState(0);
  const [isLT, setIsLT] = useState(false);

  useEffect(() => {
    if (lopAll?.loai == "LT") {
      setIsLT(true);
    } else {
      setIsLT(false);
    }
  }, [lopAll]);

  const handleDiemChange = (e: number, record: SinhVien) => {
    const updatedDataSource = [...dataSource];
    const updatedRecord = { ...record, diem_y_thuc: e };
    const index = updatedDataSource.findIndex((item) => item.id === record.id);
    updatedDataSource[index] = updatedRecord;
    setDataSource(updatedDataSource);
  };
  const columns = [
    {
      title: "Stt",
      dataIndex: "stt",
      key: "stt"
    },
    {
      title: "MSSV",
      dataIndex: "mssv",
      key: "mssv"
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Lớp",
      dataIndex: "group",
      key: "group"
    },
    {
      title: "Nhóm",
      dataIndex: "nhom",
      key: "nhom"
    },
    {
      title: "Điểm tích cực",
      dataIndex: "diem_y_thuc",
      key: "diem_y_thuc",
      render: (_: any, record: SinhVien) => {
        return isLT ? (
          record.diem_y_thuc
        ) : (
          <Select
            showSearch
            style={{ width: 100 }}
            placeholder="Điểm tích cực"
            optionFilterProp="label"
            onChange={(e: any) => handleDiemChange(e, record)}
            defaultValue={record.diem_y_thuc}
            options={[
              {
                value: 0,
                label: "0"
              },
              {
                value: 0.5,
                label: "0.5"
              },
              {
                value: 1,
                label: "1"
              }
            ]}
          />
        );
      }
    },
    {
      title: "Điểm chuyên cần",
      dataIndex: "diem",
      key: "diem"
    },
    ...(lop.loai_thi === LoaiLopThi.Thi_Theo_Chuong
      ? [
          {
            title: "Điểm LT",
            dataIndex: "diem_lt",
            key: "diem"
          }
        ]
      : [])
  ];

  const onExportDiemQTSinhVien = useCallback(async () => {
    setLoadingQTDownload(true);

    try {
      await exportApi.excelDiemQT(lop.id);
      api.success({
        message: "Thành công",
        description: "Tải tập tin thành công"
      });
    } catch (err) {
      api.error({
        message: "Thất bại",
        description: "Tải tập tin thất bại"
      });
    } finally {
      setLoadingQTDownload(false);
    }
  }, []);
  const onExportDiemCKSinhVien = useCallback(async () => {
    setLoadingCKDownload(true);

    try {
      await exportApi.excelDiemCK(lop.id);
      api.success({
        message: "Thành công",
        description: "Tải tập tin thành công"
      });
    } catch (err) {
      api.error({
        message: "Thất bại",
        description: "Tải tập tin thất bại"
      });
    } finally {
      setLoadingCKDownload(false);
    }
  }, []);
  const onExportDiemYThucSinhVien = useCallback(async () => {
    setLoadingYThuc(true);

    try {
      await downloadApi.downloadExcel({
        name: "xuat_diem_y_thuc",
        title: "data",
        data: dataSource.map((x) => {
          return {
            stt: x.stt,
            mssv: x.mssv,
            name: x.name,
            diem_y_thuc: x.diem_y_thuc
            // ghi_chu: x.pivot?.note
          };
        }),
        headers: [
          { text: "STT", value: "stt" },
          { text: "MSSV", value: "mssv" },
          { text: "Tên SV", value: "name" },
          { text: "Điểm tích cực", value: "diem_y_thuc" },
          { text: "Ghi chú", value: "ghi_chu" }
        ],
        simple: true
      });
      api.success({
        message: "Thành công",
        description: "Tải tập tin thành công"
      });
    } catch (err) {
      api.error({
        message: "Thất bại",
        description: "Tải tập tin thất bại"
      });
    } finally {
      setLoadingYThuc(false);
    }
  }, [dataSource]);
  const handleSave = async () => {
    setLoadingUpdate(true);
    try {
      await diemYThucApi.editall(dataSource, lop.id);
      api.success({
        message: "Thành Công",
        description: "Thay đổi điểm tích cực của lớp thành công"
      });
      setKeyRender(Math.random());
    } catch (e) {
      const is_handle = dealsWith({
        "400": (e: any) => {
          const error = e as AxiosError<Laravel400ErrorResponse>;
          if (error.response)
            api.error({
              message: "Thất bại",
              description: error.response.data.message
            });
        }
      })(e);
      if (is_handle)
        api.error({
          message: "Thất bại",
          description: "Thay đổi ghi chú điểm danh thất bại"
        });
    } finally {
      setLoadingUpdate(false);
      setOpenModal(false);
    }
    setOpenModal(false);
  };

  const getData = useCallback(async () => {
    setLoading(true);
    let items: any[] = [];
    try {
      const res = await queryClient.fetchQuery(queryLopHocWithDiemApi(lop.id));
      items = res.data.map((x) => ({
        ...x,
        stt: x.pivot ? x.pivot.stt : 0,
        nhom: x.pivot ? x.pivot.nhom : "",
        diem_y_thuc: x.pivot
          ? x.pivot.diem_y_thuc === null || x.pivot.diem_y_thuc === undefined
            ? 0
            : x.pivot.diem_y_thuc
          : 0,
        diem: x.pivot ? x.pivot.diem : 0,
        diem_lt: x.diem ? x.diem.DIEM_LT : 0
      }));
    } finally {
      setDataSource(items);
      setLoading(false);
    }
  }, [lop]);
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queryLopHocWithDiemApi(lop.id).queryKey,
      exact: true
    });
    getData();
  }, [key, keyRender]);
  const isMobile = useMediaQuery({ minWidth: 600 });
  const uploadformApi = (data: any) => {
    const items_format = data.items.map((x: any) => {
      const res: any = {};

      for (const property in data.fields) {
        const key_value = data.fields[property];
        res[property] = x[key_value];
      }
      return res;
    });
    const newData = [...dataSource];
    items_format.forEach((item: any) => {
      const index = newData.findIndex((x: any) => x.mssv == item.mssv);
      if (index > -1) {
        (newData[index] as any).diem_y_thuc = item.diem_y_thuc;
      }
    });
    setViewDataSource(newData);
    setViewYThuc(Math.random());

    api.success({
      message: "Thành công",
      description: "Vui lòng kiểm tra lại điểm và ấn lưu để lưu dữ liệu điểm"
    });
    return Promise.resolve({});
  };
  useEffect(() => {
    setDataSource(viewDataSource);
  }, [viewDataSource, viewYThuc]);
  return (
    <>
      <Title level={3} className="pt-4">
        Danh sách sinh viên
      </Title>
      <div className="flex flex-wrap items-center justify-between mt-2 gap-2 mb-4">
        <div className="flex justify-start flex-wrap gap-2 ">
          <Button type="primary" onClick={() => setModalExport(true)}>
            Xuất điểm danh pdf
          </Button>
          <Button type="primary" onClick={() => setModalExportDTT(true)}>
            Xuất danh sách pdf
          </Button>
          <Button type="primary" onClick={() => setModalExportExcel(true)}>
            Xuất điểm danh excel
          </Button>
          <Button type="primary" onClick={() => setModalExportSinhVien(true)}>
            Xuất sinh viên excel
          </Button>
        </div>
        <div className="flex">
          <Button className="mx-1" onClick={() => onExportDiemQTSinhVien()} loading={loadingQTDownload}>
            Xuất điểm QT
          </Button>
          <Button className="mx-1" onClick={() => onExportDiemCKSinhVien()} loading={loadingCKDownload}>
            Xuất điểm CK
          </Button>
          <div className="mx-1">
            <Button type="primary" onClick={() => onExportDiemYThucSinhVien()} loading={loadingYThuc}>
              Xuất điểm tích cực excel
            </Button>
          </div>
          <ImportExcelCompoment
            fieldName={[{ name: "stt" }, { name: "mssv" }, { name: "diem_y_thuc" }]}
            fileDownloadName="giao_vien"
            downloadable={false}
            uploadType=" .xls,.xlsx"
            buttonElement={<Button type="primary">Nhập điểm tích cực excel</Button>}
            appcectType={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]}
            extraDownloadFileHeader={[{ keyName: "lop_id", value: id }]}
            translation="importExcel"
            uploadformApi={uploadformApi}
            disableNotify
          />
        </div>
      </div>
      {isMobile ? (
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          key={viewYThuc}
          pagination={false}
          scroll={{ y: 500 }}
        />
      ) : (
        <div className="card-container card-chi-tiet-diem-danh">
          {dataSource.map((record: SinhVien) => (
            <Col span={24} key={record.id}>
              <Card
                className="custom-card"
                title={
                  <>
                    <strong className="card-chi-tiet-diem-danh__title">STT:</strong>
                    <span className="card-chi-tiet-diem-danh__sub">{record.stt}</span>
                  </>
                }
              >
                <></>
                <p className="my-1">
                  <strong>MSSV: </strong> {record.mssv}
                </p>
                <p className="my-1">
                  <strong>Tên: </strong> {record.name}
                </p>
                {record.group ? (
                  <p className="my-1">
                    <strong>Lớp: </strong> {record.group}
                  </p>
                ) : null}
                {record.group ? (
                  <p className="my-1">
                    <strong>Nhóm: </strong> {record.nhom}
                  </p>
                ) : null}
              </Card>
            </Col>
          ))}
        </div>
      )}
      <ModalExport
        translation="sinh-vien-lop"
        showModal={modalExport}
        setShowModal={setModalExport}
        data={lop}
        text="Danh-sach-sinh-vien"
        apiExportAll={""}
        api={lopHocApi.exportStudent}
      />
      <ModalExport
        apiExportAll={""}
        api={exportApi.diemThanhTich}
        translation="sinh-vien-lop"
        showModal={modalExportDTT}
        setShowModal={setModalExportDTT}
        text="Danh-sach"
        data={lop}
      />
      <ModalExportExcel
        translation="sinh-vien-lop"
        showModal={modalExportExcel}
        setShowModal={setModalExportExcel}
        api={exportApi.excelDiemDanh}
        data={lop}
        text="danh-sach-diem-danh"
      />
      {isLT ? (
        " "
      ) : (
        <div style={{ textAlign: "end", margin: "10px" }}>
          <Button type="primary" loading={loadingUpdate} onClick={() => setOpenModal(true)}>
            Lưu
          </Button>
        </div>
      )}
      <Modal
        centered
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => {
          handleSave();
        }}
        confirmLoading={loadingUpdate}
        className="relative"
        cancelText="Hủy"
        okText="Chỉnh sửa"
      >
        <div className="create-icon">
          <div>{<SiMicrosoftexcel />}</div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">Xác nhận</p>
          <p className="modal-suptitle">
            Bạn có chắc muốn chỉnh sửa điểm tích cực của lớp <b> </b> này không?
          </p>
        </div>
      </Modal>

      <ModalExportExcel
        translation="sinh-vien-lop"
        showModal={modalExportSinhVien}
        setShowModal={setModalExportSinhVien}
        api={exportApi.excelSinhVien}
        data={lop}
        text="danh-sach-sinh-vien"
      />
    </>
  );
};

export default LopHocListSinhVienPage;
