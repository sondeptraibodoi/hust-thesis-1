import { Button, Card, Table, Tooltip, Typography } from "antd";
import { DeleteOutlined, EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { FC, useCallback, useEffect, useState } from "react";

import BaseResponsive from "@/components/base-responsive";
import type { ColumnsType } from "antd/es/table";
import DeleteDialog from "@/components/dialog/deleteDialog";
import EditorStudentDoAnDialog from "./sinh-vien-do-an-dialog";
import { Link } from "react-router-dom";
import { Lop } from "@/interface/lop";
import { SinhVien } from "@/interface/user";
import lopHocApi from "@/api/lop/lopHoc.api";
import { queryLopHocApi } from "@/query";
import { useQueryClient } from "@tanstack/react-query";

const { Title } = Typography;

const LopHocListSinhVienDoAnPage: FC<{
  createShow?: boolean;
  lop: Lop;
  lopAll?: Lop;
}> = ({ lop, lopAll, createShow }) => {
  const queryClient = useQueryClient();
  // const [contextholder] = notification.useNotification();
  const [isEdit, setIsEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalEditor, setModalEditor] = useState(false);
  const [dataSelect, setDataSelect] = useState<SinhVien>();
  const [sinhVien, setSinhVien] = useState<SinhVien>();
  const [dataSource, setDataSource] = useState<SinhVien[]>([]);
  const [keyRender, setKeyRender] = useState(1);
  const [loading, setLoading] = useState(false);

  const getData = useCallback(async () => {
    setLoading(true);
    let items: SinhVien[] = [];
    try {
      const res = await queryClient.fetchQuery(queryLopHocApi(lop.id));

      items = res.data.map((x) => ({
        ...x,
        stt: x.pivot ? x.pivot.stt : 0,
        giao_vien_huong_dan: x.giaoVienHD ? x.giaoVienHD.name : "",
        ten_de_tai: x.lopSVDoAn ? x.lopSVDoAn.ten_de_tai : "",
        noi_dung: x.lopSVDoAn ? x.lopSVDoAn.noi_dung : "",
        cac_moc_quan_trong: x.lopSVDoAn ? x.lopSVDoAn.cac_moc_quan_trong : ""
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
      title: "Tên sinh viên",
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
      title: "Tên đề tài",
      dataIndex: "ten_de_tai",
      key: "ten_de_tai"
    },
    {
      title: "Nội dung",
      dataIndex: "noi_dung",
      key: "noi_dung"
    },
    {
      title: "Các mốc kiểm soát chính",
      dataIndex: "cac_moc_quan_trong",
      key: "cac_moc_quan_trong"
    },
    {
      title: "Giáo viên hướng dẫn",
      dataIndex: "giao_vien_huong_dan",
      key: "giao_vien_huong_dan"
    },
    {
      title: "Hành động",
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
      className="danh_sach_sv pb-5"
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
          {record?.ten_de_tai && (
            <p>
              <strong>Tên đề tài: </strong>
              {record.ten_de_tai}
            </p>
          )}
          {record?.noi_dung && (
            <p>
              <strong>Nội dung: </strong>
              {record.noi_dung}
            </p>
          )}
          {record?.cac_moc_quan_trong && (
            <p>
              <strong>Các mốc kiểm soát chính: </strong>
              {record.cac_moc_quan_trong}
            </p>
          )}
          {record?.giao_vien_huong_dan && (
            <p>
              <strong>Giáo viên hướng dẫn: </strong>
              {record.giao_vien_huong_dan}
            </p>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="mb-2 text-center w-full">
        <div className="flex flex-wrap items-center mt-2 gap-2 w-full">
          <Title className="mb-0" level={3}>
            Danh sách sinh viên đồ án
          </Title>
          <div className="grow"></div>
          {createShow && (
            <Button type="primary" onClick={() => setModalEditor(true)}>
              Thêm sinh viên
            </Button>
          )}
        </div>
      </div>

      <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile}></BaseResponsive>

      <EditorStudentDoAnDialog
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
        apiDelete={() => lopHocApi.removeSVDoAn({ id: lop.id, sinh_vien_id: sinhVien?.id })}
        setKeyRender={setKeyRender}
        translation="sinh-vien-lop"
        name={sinhVien?.name}
      />
    </>
  );
};

export default LopHocListSinhVienDoAnPage;

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
      <Tooltip title="Đánh giá">
        <Link to={`${data.id}/danh-gia`}>
          <Button shape="circle" icon={<InfoCircleOutlined />} type="text" onClick={() => updateSV(data)} />
        </Link>
      </Tooltip>
    </>
  );
};
