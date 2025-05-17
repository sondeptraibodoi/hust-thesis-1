import { Button, Card, Table, Tooltip, Typography, notification } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";

import BaseResponsive from "@/components/base-responsive";
import type { ColumnsType } from "antd/es/table";
import CreateNEditDialog from "./modal-add-lop-thi";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { Lop } from "@/interface/lop";
import ModalExport from "./modal-export";
import ModalExportExcel from "@/components/export/export-excel";
import { SinhVien } from "@/interface/user";
import exportApi from "@/api/export/export.api";
import lopHocApi from "@/api/lop/lopHoc.api";
import { queryLopHocApi } from "@/query";
import truotMonApi from "@/api/lop/truotMon.api";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const ListSinhVienTruotMonPage: FC<{ lop: Lop; lopAll?: Lop }> = ({ lop }) => {
  const queryClient = useQueryClient();
  const [, contextholder] = notification.useNotification();
  const [isEdit, setIsEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalExport, setModalExport] = useState(false);
  const [modalExportDTT, setModalExportDTT] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSelect, setDataSelect] = useState<SinhVien>();
  const [sinhVien, setSinhVien] = useState<SinhVien>();
  const [sinhViens, setSinhViens] = useState<SinhVien[]>([]);

  const [dataSource, setDataSource] = useState<SinhVien[]>([]);
  const [keyRender, setKeyRender] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalExportExcel, setModalExportExcel] = useState(false);
  const [modalExportSinhVien, setModalExportSinhVien] = useState(false);
  const [ten_hp, setTenHp] = useState("");
  const { t } = useTranslation("sinh-vien-extras");
  // const [editingKey, setEditingKey] = useState("");
  // const isEditing = (record: SinhVien) => record.id === editingKey;
  // const edit = (record:SinhVien) => {
  //   setEditingKey(record.id);
  // };
  const options = [
    {
      type: "select",
      name: "name",
      label: t("field.name"),
      placeholder: t("field.name"),
      children: sinhViens.map((x) => {
        return {
          value: x.pivot?.sinh_vien_id,
          title: x.name,
          mssv: x.mssv
        };
      }),
      disabled: isEdit ? true : false
    },
    {
      type: "textarea",
      name: "note",
      label: t("field.note")
    }
  ];

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await truotMonApi.list(lop.id);
      setDataSource(data.data?.sinhVienExtras);
      setTenHp(data.data?.ten_hp);
    } finally {
      setLoading(false);
    }
  }, [lop]);
  useEffect(() => {
    const getSinhVien = async () => {
      if (!lop) return;
      const res = await queryClient.fetchQuery(queryLopHocApi(lop.id));
      const SVSelect = res.data.filter((item) => {
        return !dataSource.some((childItem) => {
          return childItem.id === item.id && childItem.pivot?.lop_id === item.pivot?.lop_id;
        });
      });
      setSinhViens(SVSelect);
    };
    getSinhVien();
  }, [dataSource]);
  const dataDelete = (data: SinhVien) => {
    setSinhVien(data);
    setModalDelete(true);
  };
  const updateSV = (data: any) => {
    data = { ...data, note: data.pivot.note };
    setIsEdit(true);
    setIsModalOpen(true);
    setDataSelect(data);
    // setSinhVien(data);
  };

  const columns: ColumnsType<SinhVien> = [
    {
      title: t("field.stt"),
      dataIndex: "stt",
      key: "stt",
      render: (_v, _, i) => {
        return i + 1;
      }
    },
    {
      title: t("field.mssv"),
      dataIndex: "mssv",
      key: "mssv",
      filterSearch: true,
      onFilter: (value: any, record) => record.mssv?.startsWith(value)
    },
    {
      title: t("field.name"),
      dataIndex: "name",
      key: "name"
    },
    {
      title: t("field.ten_hp"),
      dataIndex: "ten_hp",
      key: "ten_hp",
      render: () => {
        return ten_hp;
      }
    },
    {
      title: t("field.group"),
      dataIndex: "group",
      key: "group"
    },
    {
      title: t("field.note"),
      dataIndex: "note",
      key: "note",
      render: (_v, r) => {
        return r.pivot?.note;
      }
    },
    {
      title: t("field.action"),
      dataIndex: "action",
      render: (_, record) => ActionCellRender({ updateSV, dataDelete, data: record })
    }
  ];
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
  return (
    <>
      {contextholder}
      <div className="mb-2 text-center">
        <Title className="pb-2 pt-8" level={3}>
          Danh sách sinh viên trượt môn
        </Title>
        <div className="flex flex-wrap items-center justify-end mt-2 gap-2">
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Thêm sinh viên
          </Button>
        </div>
      </div>

      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile}></BaseResponsive>

      <CreateNEditDialog
        apiCreate={truotMonApi.addSV}
        apiEdit={truotMonApi.updateSV}
        options={options}
        translation={"sinh-vien-extras"}
        data={dataSelect}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={isModalOpen}
        closeModal={setIsModalOpen}
        createIdLop={lop.id}
      />

      <DeleteDialog
        openModal={modalDelete}
        closeModal={setModalDelete}
        apiDelete={() =>
          truotMonApi.deleteSV({
            id: lop.id,
            sinh_vien_id: sinhVien?.id,
            type: "truot"
          })
        }
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
    </>
  );
};

export default ListSinhVienTruotMonPage;

const ActionCellRender: FC<any> = ({ updateSV, dataDelete, data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <>
      <Tooltip title="Sửa">
        <Button
          shape="circle"
          icon={<EditOutlined />}
          type="text"
          onClick={() => {
            updateSV(data);
          }}
        />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          type="text"
          onClick={() => {
            dataDelete(data);
          }}
        />
      </Tooltip>
    </>
  );
};
