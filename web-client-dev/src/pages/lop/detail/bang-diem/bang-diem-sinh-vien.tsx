import { Button, Card, Col, Space, Table } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { Lop, LopThi, LopThiSinhVien } from "@/interface/lop";
import { ROLE, SinhVien } from "@/interface/user";
import { DeleteOutlined } from "@ant-design/icons";
import AddStudent from "./modal-sinh-vien";
import Column from "antd/es/table/Column";
import { DiemItem } from "@/interface/bangdiem";
import LopThiApi from "@/api/lop/lopThi.api";
import { checkUserRoleAllowMultiple } from "@/interface/user/auth";
import lopHocApi from "@/api/lop/lopHoc.api";
import { useAppSelector } from "@/stores/hook";
import { useMediaQuery } from "react-responsive";
import DeleteDialog from "@/components/dialog/deleteDialog";
import lopThiApi from "@/api/lop/lopThi.api";

const BangDiemSinhVien: FC<{ lop_thi: LopThi; lop?: Lop }> = ({ lop_thi, lop }) => {
  const { currentUser } = useAppSelector((state) => state.auth);
  const [key] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DiemItem[]>([]);
  const [modalAddSV, setModalAddSV] = useState(false);
  const [sinhViens, setSinhViens] = useState<SinhVien[]>([]);
  const [lopThiBu, setLopThiBu] = useState<any[]>([]);
  const [isSubset, setIsSubset] = useState(true);
  const [data, setData] = useState<LopThiSinhVien>();
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [keyRender, setKeyRender] = useState(0);
  const [checkLoai, setCheckLoai] = useState(false);

  const hadPerssionAddSinhVien = useMemo(
    () => currentUser && checkUserRoleAllowMultiple(currentUser, [ROLE.admin, ROLE.assistant]),
    [currentUser]
  );
  useEffect(() => {
    if (lop_thi.loai.startsWith("TB-")) {
      setCheckLoai(true);
    } else {
      setCheckLoai(false);
    }
  }, [lop_thi]);

  const getSinhVien = async () => {
    try {
      if (!lop) return;
      const res = await lopHocApi.sinhVienLopHoc(lop.id);
      const sinhVienIds = dataSource.map((item: any) => item.sinh_vien_id);
      const listId = res.data?.filter((item: any) => !sinhVienIds?.includes(item.sinh_vien_id));
      setSinhViens(listId);
    } catch (error) {
      console.error(error);
    }
  };
  const payloadThiBu = {
    loai: lop_thi.loai.slice(3),
    ki_hoc: lop_thi.lop?.ki_hoc
  };
  useEffect(() => {
    const getLopThiBu = async () => {
      try {
        if (!lop) return;
        const res = await lopThiApi.LopThiBuTheoKi(payloadThiBu);
        setLopThiBu(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getLopThiBu();
  }, [lop_thi]);

  const getData = async () => {
    setLoading(true);
    let items: DiemItem[] = [];
    try {
      const isThiBu = lop_thi.loai.startsWith("TB-") ? true : false;
      const res = isThiBu
        ? await LopThiApi.listDiemBu(lop_thi.id, {
            with: "sinhVien"
          })
        : await LopThiApi.listDiem(lop_thi.id, {
            with: "sinhVien"
          });
      items = res.data;
    } finally {
      setDataSource(items);
      setLoading(false);
    }
  };
  useEffect(() => {
    getData();
    if (hadPerssionAddSinhVien) getSinhVien();
  }, [key, lop_thi, keyRender]);
  const isMobile = useMediaQuery({ minWidth: 600 });

  useEffect(() => {
    const listSinhVienIds = sinhViens.map((sinhVien: any) => sinhVien.sinh_vien_id);
    const sinhVienIds = dataSource.map((item: any) => item.sinh_vien_id);

    const isSubset = sinhVienIds.every((id: number) => listSinhVienIds.includes(id));
    setIsSubset(
      isSubset &&
        sinhVienIds?.length > 0 &&
        (listSinhVienIds?.length < sinhVienIds?.length || listSinhVienIds?.length == sinhVienIds?.length)
    );
  }, [sinhViens, dataSource]);
  const onDeleteItem = (item: LopThiSinhVien) => {
    setData(item);
    setIsModalDelete(true);
  };

  return (
    <>
      {hadPerssionAddSinhVien && !isSubset ? (
        <Button className="mb-2" onClick={() => setModalAddSV(true)}>
          Thêm sinh viên
        </Button>
      ) : null}
      {isMobile ? (
        <Table dataSource={dataSource} rowKey="index" pagination={false} loading={loading}>
          <Column title="STT" dataIndex="stt" key="stt" width="10%" align="center" />
          <Column title="MSSV" dataIndex="mssv" key="mssv" width="15%" align="center" />
          <Column title="Tên sinh viên" dataIndex="name" key="name" width="15%" align="center" />
          <Column
            title="Điểm"
            dataIndex="diem"
            key="diem"
            width="15%"
            align="center"
            render={(_: any, record: any) => {
              let ghi_chu = record.ghi_chu;
              if (!ghi_chu) {
                return record.diem;
              }
              if (typeof ghi_chu === "string") {
                ghi_chu = JSON.parse(ghi_chu);
              }
              if (ghi_chu && ghi_chu.diem_phuc_khao) {
                return ghi_chu.diem_phuc_khao;
              }
              if (ghi_chu && ghi_chu.diem_goc) {
                return ghi_chu.diem_goc;
              }
              return record.diem;
            }}
          />
          <Column
            title="Ghi chú"
            dataIndex="ghi_chu"
            key="ghi_chu"
            width="15%"
            align="center"
            render={(_: any, record: any) => {
              if (!record.ghi_chu) {
                return "";
              }
              let ghi_chu = record.ghi_chu;
              if (typeof ghi_chu === "string") {
                ghi_chu = JSON.parse(ghi_chu);
              }
              let content = <p>Điểm gốc: {formatDiem(record.diem)}</p>;
              if (ghi_chu.diem_thi_bu != null) {
                content = ghi_chu.diem_thi_bu >= 0 ? <p>Điểm thi bù</p> : <p></p>;
              }
              if (ghi_chu.diem_phuc_khao != null) {
                content = <p>Điểm gốc: {formatDiem(record.diem)}</p>;
              }
              return <div>{content}</div>;
            }}
          />
          {checkLoai && <Column title="Lớp thi gốc" dataIndex="ma" key="lop_thi_goc_id" width="15%" align="center" />}
          {hadPerssionAddSinhVien && !isSubset ? (
            <Column
              title="Hành động"
              key="action"
              width="20%"
              align="center"
              render={(_: any, record: LopThiSinhVien) => (
                <Space size="middle">
                  <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(record)} />
                </Space>
              )}
            />
          ) : null}
        </Table>
      ) : (
        <div className="card-container card-chi-tiet-diem-danh">
          {dataSource.length === 0 ? (
            <p>Không có dữ liệu thỏa mãn</p>
          ) : (
            dataSource.map((record: any) => (
              <Col span={24} key={record.diem_id}>
                <Card
                  key={record.diem_id}
                  title={
                    <>
                      <strong className="card-diem-danh__title">STT: </strong>
                      <span className="card-diem-danh__sub">{record.stt}</span>
                    </>
                  }
                  actions={[
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      key="edit"
                      onClick={() => onDeleteItem(record)}
                    />
                  ]}
                >
                  <p className="my-1">
                    <strong>MSSV:</strong> {record.mssv}
                  </p>
                  <p className="my-1">
                    <strong>Tên sinh viên:</strong> {record.name}
                  </p>
                  <p className="my-1">
                    <strong>Điểm:</strong> {record.diem}
                  </p>
                </Card>
              </Col>
            ))
          )}
        </div>
      )}

      {hadPerssionAddSinhVien && (
        <AddStudent
          showModal={modalAddSV}
          data={dataSource}
          setShowModal={setModalAddSV}
          existStudent={sinhViens}
          lop_thi_id={lop_thi.id}
          lop_id={lop?.id}
          getData={getData}
          getSinhViens={getSinhVien}
          lopThiBu={lopThiBu}
          checkLoai={checkLoai}
        />
      )}
      <DeleteDialog
        openModal={isModalDelete}
        translation="sinh-vien"
        closeModal={setIsModalDelete}
        name="Sinh viên"
        apiDelete={() =>
          data &&
          LopThiApi.deleteSinhVien({
            ...data,
            loai: lop_thi.loai,
            lop_thi_id: lop_thi.id,
            ki_hoc: lop_thi.lop?.ki_hoc
          })
        }
        setKeyRender={setKeyRender}
      />
    </>
  );
};

export default BangDiemSinhVien;

function formatDiem(diem: number) {
  return diem < 0 ? "-" : diem;
}
