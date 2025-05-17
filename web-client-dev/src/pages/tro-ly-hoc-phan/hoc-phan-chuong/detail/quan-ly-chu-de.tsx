import { DeleteOutlined, PlusOutlined, ReadOutlined } from "@ant-design/icons";
import { App, Button, Card, Layout, Menu, Tabs, Tooltip, Typography } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import "./cauhoi.css";

import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import CreateNEditDialog from "@/components/createNEditDialog";
import { HocPhanChuong } from "@/interface/hoc-phan";
import type { MenuProps, TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import ChuongHocPhanSide from "./chuong";
import TaiLieuSide from "./chuong-tai-lieus";
import ThongKeSide from "./chuong-thong-ke";
import DeleteDialogChuong from "./deleteDialogChuong";
import ModalThiThu from "./modal-thi-thu";
type MenuItem = Required<MenuProps>["items"][number];

const { Sider, Content } = Layout;
const { Title } = Typography;

interface props {
  id: any;
  maHocPhan: string | undefined;
  reload?: any;
}

const HocPhanCauHoiChuong: React.FC<props> = ({ id, maHocPhan, reload }) => {
  const [loading, setLoading] = useState(true);
  const [dataChuongHp, setDataChuongHp] = useState<HocPhanChuong[]>([]);
  const [defaultSelectedKeys, setDefaultSelectedKeys] = useState<string[]>([]);
  const [selectedChuong, setSelectedChuong] = useState<string | null>(null);
  const [showChuong, setShowChuong] = useState<any>();
  const [modalEditor, setModalEditor] = useState(false);
  const { t } = useTranslation("chuong-hoc-phan");
  const [isEdit, setIsEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [dataSelect, setDataSelect] = useState<any>();
  const [current, setCurrent] = useState<boolean>(false);
  const [index, setIndex] = useState<number>();
  const [keyRender, setKeyRender] = useState(1);
  const [loadingThongTin, setLoadingThongTin] = useState<boolean>(false);
  const { notification: apiChuong } = App.useApp();
  const [itemsTabs, setItemsTabs] = useState<any>([]);
  const [indexTab, setIndexTab] = useState<any>("1");

  const [isShowModalThi, setIsShowModalThi] = useState(false);
  useEffect(() => {
    reload && reload();
  }, [keyRender]);
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      let items: HocPhanChuong[] = [];
      try {
        const res = await hocPhanChuongApi.detail(id);
        items = res.data;
      } finally {
        setDataChuongHp(items);
        setLoading(false);
      }
    };
    getData();
  }, [id, keyRender]);

  useEffect(() => {
    if (dataChuongHp.length > 0) {
      const firstChuongId = selectedChuong && !current ? selectedChuong : dataChuongHp[0].id.toString();
      setDefaultSelectedKeys([firstChuongId]);
      setSelectedChuong(firstChuongId);
    }
    setCurrent(false);
  }, [dataChuongHp, keyRender]);

  const handleMenuClick = (e: any) => {
    setDefaultSelectedKeys(e.key);
    setSelectedChuong(e.key);
  };

  useEffect(() => {
    const findIndex = dataChuongHp.findIndex((record: any) => record.id == selectedChuong);
    setIndex(findIndex);
  }, [selectedChuong]);
  const itemsMenu: MenuItem[] = dataChuongHp.map((chuong) => ({
    key: chuong.id.toString(),
    icon: <ReadOutlined />,
    label: (
      <div className="flex justify-between items-center">
        <p className="overflow-hidden">{`CĐ ${chuong.stt} - ${chuong.ten}`}</p>{" "}
        <Tooltip title="Xoá">
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            type="text"
            onClick={() => {
              setModalDelete(true);
              setDataSelect(chuong);
            }}
          />
        </Tooltip>
      </div>
    )
  }));

  useEffect(() => {
    const getShowChuong = async () => {
      setLoadingThongTin(true);
      try {
        const res = await hocPhanChuongApi.showChuong(selectedChuong);
        setShowChuong({
          ...res.data.data,
          tuan_dong: res.data.data.tuan_dong ? +res.data.data.tuan_dong : null,
          tuan_mo: res.data.data.tuan_mo ? +res.data.data.tuan_mo : null
        });
      } finally {
        setLoadingThongTin(false);
      }
    };
    selectedChuong && getShowChuong();
  }, [selectedChuong, keyRender]);

  useEffect(() => {
    // Cập nhật nội dung các tab khi keyRender thay đổi
    const itemsTabs: TabsProps["items"] = [
      {
        key: "1",
        label: "Thông tin",
        children: (
          <ChuongHocPhanSide
            data={showChuong}
            setKeyRender={setKeyRender}
            apiChuong={apiChuong}
            loadingThongTin={loadingThongTin}
          />
        )
      },
      {
        key: "2",
        label: "Tài liệu",
        children: <TaiLieuSide chuong={showChuong} />
      },
      {
        key: "3",
        label: "Thống kê",
        children: <ThongKeSide chuong={showChuong} />
      }
    ];
    setItemsTabs(itemsTabs);
  }, [keyRender, showChuong, index, dataChuongHp, setKeyRender, loadingThongTin]);
  const optionsCreate = [
    {
      type: "input",
      name: "ten",
      placeholder: t("field.ten"),
      label: t("field.ten"),
      rule: [
        {
          required: true,
          message: t("required.ten")
        }
      ]
    },
    {
      type: "inputnumber",
      name: "tuan_mo",
      min: 0,
      placeholder: t("field.tuan_mo"),
      label: t("field.tuan_mo"),
      rule: [
        {
          required: true,
          message: t("required.tuan_mo")
        },
        () => ({
          validator(_: any, value: any) {
            if (value >= 0) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("Tuần mở không được phép nhỏ hơn 0"));
          }
        })
      ]
    },
    {
      type: "inputnumber",
      name: "tuan_dong",
      min: 0,
      placeholder: t("required.tuan_dong"),
      label: t("field.tuan_dong"),
      rule: [
        {
          required: true,
          message: t("required.tuan_dong")
        },
        ({ getFieldValue }: any) => ({
          validator(_: any, value: any) {
            if (!value || getFieldValue("tuan_mo") <= value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("Tuần đóng cần lớn hơn hoặc bằng tuần mở"));
          }
        }),
        () => ({
          validator(_: any, value: any) {
            if (value >= 0) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("Tuần đóng không được phép nhỏ hơn 0"));
          }
        })
      ]
    },
    {
      type: "inputnumber",
      name: "stt",
      min: 1,
      placeholder: t("field.stt"),
      label: t("field.stt")
    },

    {
      type: "inputnumber",
      name: "so_cau_hoi",
      min: 0,
      placeholder: t("field.so_cau_hoi"),
      label: t("field.so_cau_hoi"),
      initialValue: "5",
      rule: [
        {
          required: true,
          message: t("required.so_cau_hoi")
        },
        () => ({
          validator(_: any, value: any) {
            if (value >= 0) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("Số câu hỏi không được phép nhỏ hơn 0"));
          }
        })
      ]
    },
    {
      type: "inputnumber",
      name: "diem_toi_da",
      min: 0,
      placeholder: t("field.diem_toi_da"),
      label: t("field.diem_toi_da"),
      initialValue: "1",
      rule: [
        {
          required: true,
          message: t("required.diem_toi_da")
        },
        () => ({
          validator(_: any, value: any) {
            if (value >= 0) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("Điểm tối đa không được phép nhỏ hơn 0"));
          }
        })
      ]
    },
    {
      type: "inputnumber",
      name: "thoi_gian_thi",
      min: 0,
      placeholder: t("field.thoi_gian_thi"),
      label: t("field.thoi_gian_thi"),
      initialValue: "10",
      rule: [
        {
          required: true,
          message: t("required.thoi_gian_thi")
        }
      ]
    },
    {
      type: "inputnumber",
      name: "thoi_gian_doc",
      min: 0,
      placeholder: t("field.thoi_gian_doc"),
      label: t("field.thoi_gian_doc"),
      initialValue: "15",
      rule: [
        {
          required: true,
          message: t("required.thoi_gian_doc")
        }
      ]
    },
    {
      type: "textarea",
      name: "mo_ta",
      placeholder: t("field.mo_ta"),
      label: t("field.mo_ta")
    },
    {
      type: "switch",
      name: "trang_thai",
      placeholder: t("field.trang_thai"),
      label: t("field.trang_thai"),
      initialValue: true
    }
  ];
  const operations = useMemo(
    () => ({
      right: <Button onClick={() => setIsShowModalThi(true)}>Thi thử</Button>
    }),
    []
  );
  return (
    <>
      <div className="flex flex-column" style={{ minHeight: "480px" }}>
        <div className="d-flex items-center justify-between flex-initial">
          <Title level={3}>Danh sách chủ đề</Title>
          <Button type="primary" onClick={() => setModalEditor(true)}>
            Thêm chủ đề
          </Button>
        </div>
        <div className="card-container mt-2 flex-auto flex flex-column">
          <Card
            style={{ backgroundColor: "white", border: "1px solid #d7d7d7" }}
            loading={loading}
            className="flex-auto"
          >
            {dataChuongHp.length > 0 ? (
              <Layout className="layout-cauHoi" style={{ border: "none" }}>
                <Sider width={400}>
                  <Menu
                    mode="inline"
                    items={itemsMenu}
                    defaultSelectedKeys={defaultSelectedKeys}
                    selectedKeys={defaultSelectedKeys}
                    onClick={handleMenuClick}
                  />
                  <Button
                    type="dashed"
                    className="w-full mt-3"
                    onClick={() => {
                      setModalEditor(true);
                    }}
                  >
                    <PlusOutlined /> Thêm chủ đề mới
                  </Button>
                </Sider>
                {/* <hr className="line mx-6 border-white"></hr> */}
                <Content style={{ width: "100%" }}>
                  <Tabs
                    className="px-3 w-full"
                    onTabClick={(e: string) => setIndexTab(e)}
                    defaultActiveKey={indexTab}
                    items={itemsTabs}
                    tabBarExtraContent={operations}
                  />
                </Content>
              </Layout>
            ) : (
              <div className="p-2 text-center h-full"> Học phần chưa có chủ đề nào</div>
            )}
          </Card>
        </div>
      </div>
      <CreateNEditDialog
        apiCreate={(params: any) =>
          hocPhanChuongApi.create({
            ...params,
            ma_hoc_phan: maHocPhan,
            trang_thai: params.trang_thai == true ? "1-Đang sử dụng" : "2-Dừng sử dụng"
          })
        }
        apiEdit={() => {}}
        options={optionsCreate}
        translation={"chuong-hoc-phan"}
        data={{}}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setKeyRender={setKeyRender}
        openModal={modalEditor}
        closeModal={setModalEditor}
      />
      <DeleteDialogChuong
        openModal={modalDelete}
        closeModal={setModalDelete}
        id={dataSelect?.id}
        setKeyRender={setKeyRender}
        translation="chuong-hoc-phan"
        name={dataSelect?.ten}
        setCurrent={setCurrent}
      />
      {isShowModalThi && (
        <ModalThiThu
          chuong={showChuong}
          onClose={() => {
            setIsShowModalThi(false);
          }}
        />
      )}
    </>
  );
};

export default HocPhanCauHoiChuong;
