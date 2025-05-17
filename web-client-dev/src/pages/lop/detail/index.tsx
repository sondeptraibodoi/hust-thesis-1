import PageContainer from "@/Layout/PageContainer";
import { Lop } from "@/interface/lop";
import { FC, useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Button, Col, Descriptions, DescriptionsProps, Row, Tabs } from "antd";
import LopHocListSinhVienPage from "./list-sinh-vien";
import { useAppDispatch } from "@/stores/hook";
import { setHeightAuto } from "@/stores/features/config";
import LopHocListDiemDanhPage from "./list-diem-danh";
import ModalExport from "./modal-export";
import ListLopThiPage from "./list-lop-thi";
import ModalExportExcel from "@/components/export/export-excel";
import exportApi from "@/api/export/export.api";
import lopHocApi from "@/api/lop/lopHoc.api";
import LopHocListSinhVienExtrasPage from "./list-sinh-vien-extras";
import TableLopThucTap from "./lop-thuc-tap";
import LopHocListSinhVienDoAnPage from "./list-sinh-vien-do-an";
import { GiaoVien } from "@/interface/giaoVien";
// import ListSinhVienTruotMonPage from "./list-sv-truot-mon";
import ListTaiLieuLopPage from "./list-tai-lieu-lop";
import LopHocListSinhVienDiemChuongPage from "./diem-thi-chuong/list-sinh-vien-diem-chuong";
import { LoaiLopThi } from "@/constant";
const LopHocDetailPage = () => {
  const dispatch = useAppDispatch();
  const lop = useLoaderData() as Lop;
  const [modalExport, setModalExport] = useState(false);
  const [modalExportDiemDanh, setModalExportDiemDanh] = useState(false);
  const [modalExportSinhVien, setModalExportSinhVien] = useState(false);
  const [modalDiemThanhTich, setModalExportDiemThanhTich] = useState(false);
  const [keyAgain, setKeyAgain] = useState(0);

  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Danh sách lớp học" }, { text: lop.ten_hp }, { text: lop.ma }];
  }, [lop]);
  const itemsInfor: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Kì học",
      children: lop?.ki_hoc
    },
    {
      key: "2",
      label: "Loại",
      children: lop?.loai
    },
    {
      key: "3",
      label: "Mã học phần",
      children: lop?.ma_hp
    },
    {
      key: "4",
      label: "Tên học phần",
      children: lop?.ten_hp
    },
    {
      key: "5",
      label: "Mã lớp kèm",
      children: lop?.ma_kem
    },
    {
      key: "7",
      label: "Phòng",
      children: lop?.phong
    },
    {
      key: "8",
      label: "Tuần học",
      children: lop?.tuan_hoc
    },
    {
      key: "9",
      label: "Giảng viên",
      children:
        lop &&
        lop.giao_viens &&
        lop?.giao_viens?.map((item: GiaoVien, index: number) => {
          if ((lop.giao_viens as any).length > 1 && index < (lop.giao_viens as any).length - 1) {
            return item.name + ", ";
          }
          return item.name;
        })
    }
  ];
  const isHasChild = !!lop.children && lop.children.length > 0;
  const is_thi_bu = lop.ma === "thi_bu";
  const is_do_an =
    lop.ma_hoc_phan != null && (lop.ma_hoc_phan?.is_do_an === true || lop.ma_hoc_phan?.is_do_an_tot_nghiep === true);
  const is_thuc_tap = lop.ma_hoc_phan !== null && lop.ma_hoc_phan?.is_thuc_tap === true;
  const show_diem_danh = !is_thi_bu && !is_do_an && !is_thuc_tap;
  const show_lop_thi = !is_do_an && !isHasChild && !is_thuc_tap;
  useEffect(() => {
    dispatch(setHeightAuto(true));
    return () => {
      dispatch(setHeightAuto(false));
    };
  });
  return (
    <PageContainer breadcrumbs={breadcrumbs}>
      <Row className="full-width">
        {!is_thi_bu && (
          <Descriptions
            title={`Thông tin lớp học mã ${lop?.ma}`}
            items={itemsInfor}
            className="custom_descriptions mt-4"
          />
        )}
        {isHasChild ? (
          <LopHasChildContent
            keyAgain={keyAgain}
            lop={lop}
            is_thuc_tap={is_thuc_tap}
            is_do_an={is_do_an}
            is_thi_bu={is_thi_bu}
            show_lop_thi={show_lop_thi}
            show_diem_danh={show_diem_danh}
            setKeyAgain={setKeyAgain}
            setModalExport={setModalExport}
            setModalExportDiemThanhTich={setModalExportDiemThanhTich}
            setModalExportDiemDanh={setModalExportDiemDanh}
            setModalExportSinhVien={setModalExportSinhVien}
          />
        ) : (
          <LopContent
            keyAgain={keyAgain}
            lop={lop}
            is_thuc_tap={is_thuc_tap}
            is_do_an={is_do_an}
            is_thi_bu={is_thi_bu}
            show_lop_thi={show_lop_thi}
            show_diem_danh={show_diem_danh}
            setKeyAgain={setKeyAgain}
          />
        )}
      </Row>
      <ModalExport
        apiExportAll={lopHocApi.exportLopLt}
        api={""}
        showModal={modalExport}
        setShowModal={setModalExport}
        exportAll={true}
        data={lop}
        translation="sinh-vien-lop"
        text="Danh-sach-sinh-vien"
      />
      <ModalExport
        apiExportAll={exportApi.diemThanhTichAll}
        api={""}
        showModal={modalDiemThanhTich}
        setShowModal={setModalExportDiemThanhTich}
        exportAll={true}
        data={lop}
        translation="sinh-vien-lop"
        text="Danh-sach"
      />
      <ModalExportExcel
        showModal={modalExportDiemDanh}
        setShowModal={setModalExportDiemDanh}
        exportAll={true}
        data={lop}
        translation="sinh-vien-lop"
        api={exportApi.excelDiemDanhAll}
        text="danh-sach-diem-danh"
      />
      <ModalExportExcel
        showModal={modalExportSinhVien}
        setShowModal={setModalExportSinhVien}
        exportAll={true}
        data={lop}
        translation="sinh-vien-lop"
        api={exportApi.excelSinhVienAll}
        text="danh-sach-sinh-vien"
      />
      <ListTaiLieuLopPage lop={lop} />
    </PageContainer>
  );
};

export default LopHocDetailPage;

const LopContent: FC<{
  keyAgain: any;
  lop: Lop;
  is_thuc_tap: boolean;
  is_do_an: boolean;
  is_thi_bu: boolean;
  show_lop_thi: boolean;
  show_diem_danh: boolean;
  setKeyAgain: any;
}> = ({ lop, keyAgain, is_thuc_tap, is_do_an, is_thi_bu, show_lop_thi, show_diem_danh, setKeyAgain }) => {
  return (
    <>
      {show_diem_danh && (
        <Col span={24} className="py-4">
          <LopHocListDiemDanhPage lop={lop} />
        </Col>
      )}
      {show_lop_thi && (
        <Col span={24} className="py-4">
          <ListLopThiPage lop={lop} disabledCreate={is_thi_bu} />
        </Col>
      )}
      {!(is_do_an || is_thuc_tap) && (
        <Col span={24} className="py-4">
          <LopHocListSinhVienPage lop={lop} key={keyAgain} />{" "}
        </Col>
      )}
      {is_do_an && <LopHocListSinhVienDoAnPage lop={lop} key={keyAgain} createShow={true} />}
      {is_thuc_tap && <TableLopThucTap lop={lop} key={keyAgain} />}
      {show_diem_danh && (
        <Col className="py-4" span={24}>
          <LopHocListSinhVienExtrasPage lop={lop} lopAll={lop} renderAgain={setKeyAgain} />{" "}
        </Col>
      )}
      {lop.loai_thi == LoaiLopThi.Thi_Theo_Chuong && (
        <Col className="py-4" span={24}>
          <LopHocListSinhVienDiemChuongPage lop={lop} />{" "}
        </Col>
      )}
    </>
  );
};

const LopHasChildContent: FC<{
  keyAgain: any;
  lop: Lop;
  is_thuc_tap: boolean;
  is_do_an: boolean;
  is_thi_bu: boolean;
  show_lop_thi: boolean;
  show_diem_danh: boolean;
  setKeyAgain: any;
  setModalExport: any;
  setModalExportDiemThanhTich: any;
  setModalExportDiemDanh: any;
  setModalExportSinhVien: any;
}> = ({
  lop,
  keyAgain,
  is_thuc_tap,
  is_do_an,
  is_thi_bu,
  show_lop_thi,
  show_diem_danh,
  setKeyAgain,
  setModalExport,
  setModalExportDiemThanhTich,
  setModalExportDiemDanh,
  setModalExportSinhVien
}) => {
  const tabs = useMemo(() => {
    if (!lop.children) {
      return [];
    }
    return lop.children.map((x) => ({
      key: x.ma,
      label: x.ma,
      children: <LopHocListSinhVienPage key={keyAgain} lop={x} lopAll={lop} />
    }));
  }, [lop, keyAgain]);
  const tabs2 = useMemo(() => {
    if (!lop.children) {
      return [];
    }
    return lop.children.map((x) => ({
      key: x.ma,
      label: x.ma,
      children: <LopHocListSinhVienExtrasPage lop={x} lopAll={lop} renderAgain={setKeyAgain} />
    }));
  }, [lop]);
  const tabs3 = useMemo(() => {
    if (!lop.children) {
      return [];
    }
    return lop.children.map((x) => ({
      key: x.ma,
      label: x.ma,
      children: <TableLopThucTap key={keyAgain} lop={x} lopAll={lop} />
    }));
  }, [lop, keyAgain]);
  return (
    <>
      {show_diem_danh && (
        <Col span={24} className="py-4">
          <LopHocListDiemDanhPage lop={lop} />
        </Col>
      )}
      {show_lop_thi && (
        <Col span={24} className="py-4">
          <ListLopThiPage lop={lop} disabledCreate={is_thi_bu} />
        </Col>
      )}
      {!(is_do_an || is_thuc_tap) && (
        <>
          {" "}
          <Col className="py-4" span={24}>
            <div className="flex flex-wrap gap-2">
              <Button type="primary" onClick={() => setModalExport(true)}>
                Xuất toàn bộ điểm danh pdf
              </Button>
              <Button type="primary" onClick={() => setModalExportDiemThanhTich(true)}>
                Xuất toàn bộ danh sách pdf
              </Button>
              <Button type="primary" onClick={() => setModalExportDiemDanh(true)}>
                Xuất toàn bộ điểm danh excel
              </Button>
              <Button type="primary" onClick={() => setModalExportSinhVien(true)}>
                Xuất toàn bộ sinh viên excel
              </Button>
            </div>

            <Tabs defaultActiveKey="1" items={tabs} />
          </Col>
        </>
      )}

      {show_diem_danh && (
        <Col className="py-4" span={24}>
          <Tabs defaultActiveKey="1" items={tabs2} />
        </Col>
      )}
      {is_do_an && <LopHocListSinhVienDoAnPage lop={lop} key={keyAgain} />}
      {is_thuc_tap && <Tabs defaultActiveKey="1" items={tabs3} />}
    </>
  );
};
