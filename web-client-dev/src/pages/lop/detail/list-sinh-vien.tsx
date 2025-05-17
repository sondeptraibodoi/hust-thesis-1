import { Button, Card, Modal, Select, Table, Tooltip, Typography, notification } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";
import { queryLopHocWithDiemApi } from "@/query";

import { AxiosError } from "axios";
import BaseResponsive from "@/components/base-responsive";
import type { ColumnsType } from "antd/es/table";
import DeleteDialog from "@/components/dialog/deleteDialog";
import EditorStudentDialog from "./sinh-vien-dialog";
import ImportExcelCompoment from "@/components/importDrawer";
import { Laravel400ErrorResponse } from "@/interface/axios/laravel";
import { LoaiLopThi } from "@/constant";
import { Lop } from "@/interface/lop";
import ModalExport from "./modal-export";
import ModalExportExcel from "@/components/export/export-excel";
import { SiMicrosoftexcel } from "react-icons/si";
import { SinhVien } from "@/interface/user";
import { dealsWith } from "@/api/axios/error-handle";
import diemYThucApi from "@/api/lop/diemYThuc.api";
import downloadApi from "@/api/download.api";
import exportApi from "@/api/export/export.api";
import lopHocApi from "@/api/lop/lopHoc.api";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const { Title } = Typography;

const LopHocListSinhVienPage: FC<{
  lop: Lop;
  lopAll?: Lop;
}> = ({ lop, lopAll }) => {
  const queryClient = useQueryClient();
  const [loadingQTDownload, setLoadingQTDownload] = useState(false);
  const [loadingCKDownload, setLoadingCKDownload] = useState(false);
  const [api, contextholder] = notification.useNotification();
  const [isEdit, setIsEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalEditor, setModalEditor] = useState(false);
  const [modalExport, setModalExport] = useState(false);
  const [modalExportDTT, setModalExportDTT] = useState(false);
  const [dataSelect, setDataSelect] = useState<SinhVien>();
  const [sinhVien, setSinhVien] = useState<SinhVien>();
  const [dataSource, setDataSource] = useState<SinhVien[]>([]);
  const [viewDataSource, setViewDataSource] = useState<SinhVien[]>([]);
  const [viewYThuc, setViewYThuc] = useState(0);
  const [keyRender, setKeyRender] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingYThuc, setLoadingYThuc] = useState(false);
  const [modalExportExcel, setModalExportExcel] = useState(false);
  const [modalExportSinhVien, setModalExportSinhVien] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const { id } = useParams();
  const [isLT, setIsLT] = useState(false);
  useEffect(() => {
    if (lopAll?.loai == "LT") {
      setIsLT(true);
    } else {
      setIsLT(false);
    }
  }, [lopAll]);

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
  const dataDelete = (data: SinhVien) => {
    setSinhVien(data);
    setModalDelete(true);
  };
  const updateSV = (data: SinhVien) => {
    setIsEdit(true);
    setModalEditor(true);
    setDataSelect(data);
  };

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
          description: "Thay đổi điểm tích cực của lớp thất bại"
        });
    } finally {
      setLoadingUpdate(false);
      setOpenModal(false);
    }
    setOpenModal(false);
  };

  const handleDiemChange = (e: number, record: SinhVien) => {
    const updatedDataSource = [...dataSource];
    const updatedRecord = { ...record, diem_y_thuc: e };
    const index = updatedDataSource.findIndex((item) => item.id === record.id);
    updatedDataSource[index] = updatedRecord;
    setDataSource(updatedDataSource);
  };

  const columns: ColumnsType<SinhVien> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt"
    },
    {
      title: "MSSV",
      dataIndex: "mssv",
      key: "mssv",
      filterSearch: true,
      onFilter: (value: any, record) => record.mssv?.startsWith(value)
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
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
      render: (_, record: SinhVien) => {
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
      : []),
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_, record) => ActionCellRender({ updateSV, dataDelete, data: record })
    }
  ];
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
          };
        }),
        headers: [
          { text: "STT", value: "stt" },
          { text: "MSSV", value: "mssv" },
          { text: "Tên SV", value: "name" },
          { text: "Điểm tích cực", value: "diem_y_thuc" }
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
  useEffect(() => {
    getData();
  }, [keyRender]);

  const contentDesktop = () => (
    <Table
      key={keyRender}
      loading={loading}
      columns={columns}
      className="danh_sach_sv"
      dataSource={dataSource}
      rowKey="id"
      pagination={false}
      scroll={{ y: 500 }}
    />
  );
  const contentMobile = () => (
    <div className="card-container card-diem-danh">
      {dataSource.map((record: SinhVien) => (
        <Card
          key={record.id}
          title={
            <>
              <strong className="card-diem-danh__title">STT : </strong>
              <span className="card-diem-danh__sub">{record.stt}</span>
            </>
          }
          actions={[
            <Button shape="circle" icon={<EditOutlined />} type="text" key="edit" onClick={() => updateSV(record)} />,
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              type="text"
              key="delete"
              onClick={() => dataDelete(record)}
            />
          ]}
        >
          <p>
            <strong>MSSV: </strong>
            {record.mssv}
          </p>
          <p>
            <strong>Tên: </strong>
            {record.name}
          </p>
          <p>
            <strong>Email: </strong>
            {record.email}
          </p>
          {record?.group && (
            <p>
              <strong>Lớp: </strong>
              {record.group}
            </p>
          )}
          {record?.nhom && (
            <p>
              <strong>Nhóm: </strong>
              {record.nhom}
            </p>
          )}
        </Card>
      ))}
    </div>
  );

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
      {contextholder}
      <div className="d-flex items-center justify-between">
        <Title level={3}>Danh sách sinh viên</Title>
      </div>
      <div className="text-center">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-start gap-2">
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
          <div className="flex flex-wrap items-center justify-start gap-2">
            <div className="mx-1 my-2 flex">
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
              <div className="mx-1">
                <ImportExcelCompoment
                  fieldName={[{ name: "mssv" }, { name: "diem_y_thuc" }]}
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

            <Button type="primary" onClick={() => setModalEditor(true)}>
              Thêm sinh viên
            </Button>
          </div>
        </div>
      </div>

      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} key={keyRender}></BaseResponsive>

      <EditorStudentDialog
        existStudent={dataSource}
        classId={lop.id}
        isEdit={isEdit}
        data={dataSelect}
        setEdit={setIsEdit}
        setKeyRender={setKeyRender}
        showModal={modalEditor}
        setShowModal={setModalEditor}
        lopAll={lopAll}
        lop={lop}
      />

      <DeleteDialog
        openModal={modalDelete}
        closeModal={setModalDelete}
        apiDelete={() => lopHocApi.removeSV({ id: lop.id, sinh_vien_id: sinhVien?.id })}
        setKeyRender={setKeyRender}
        translation="sinh-vien-lop"
        name={sinhVien?.name}
      />
      <ModalExport
        apiExportAll={lopHocApi.exportLopLt}
        api={lopHocApi.exportStudent}
        translation="sinh-vien-lop"
        showModal={modalExport}
        setShowModal={setModalExport}
        text="Danh-sach-sinh-vien"
        data={lop}
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
      <ModalExportExcel
        translation="sinh-vien-lop"
        showModal={modalExportSinhVien}
        setShowModal={setModalExportSinhVien}
        api={exportApi.excelSinhVien}
        data={lop}
        text="danh-sach-sinh-vien"
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
    </>
  );
};

export default LopHocListSinhVienPage;

const ActionCellRender: FC<any> = ({ updateSV, dataDelete, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => updateSV(data)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => dataDelete(data)} />
      </Tooltip>
    </>
  );
};
