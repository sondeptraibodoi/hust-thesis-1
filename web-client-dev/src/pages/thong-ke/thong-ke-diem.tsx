import { useEffect, useState } from "react";
import BaseTable from "@/components/base-table/lan-diem-danh";
import PageContainer from "@/Layout/PageContainer";
import bangDiemApi from "@/api/sinhVien/bangDiem.api";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import dotThiApi from "@/api/lop/lopThi.api";
// import { GhiChuCellRender } from "./diem-ghi-chu";
import { convertErrorAxios } from "@/api/axios";
import { Button, Select, Form, notification, Input, Pagination } from "antd";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import configApi from "@/api/config.api";
import exportApi from "@/api/export/export.api";

import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import { Paginate } from "@/interface/axios";
import { ReloadOutlined } from "@ant-design/icons";
// import { GhiChuThongKeDiemCellRender } from "../bang-diem/ghi-chu-thong-ke-diem";
const defaultColDef = {
  flex: 1,
  minWidth: 150,
  resizable: true,
  filter: true,
  floatingFilter: true
};
const { Option } = Select;
interface LoaiLop {
  key: number;
  value: boolean;
  name: string;
}

interface DotThi {
  title: string;
  value: string;
}

const ThongKeDiemPage = () => {
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const [dotThi, setDotThi] = useState<DotThi[]>([]);
  const [loaiLop] = useState<LoaiLop[]>([
    { key: 1, value: true, name: "Đại cương" },
    { key: 2, value: false, name: "Chuyên ngành" }
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingEx, setLoadingEx] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [values, setValues] = useState<any>({});
  const [listData, setListData] = useState<any>([]);
  const [kiHienGio, setKiHienGio] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);
  const [form] = Form.useForm();
  const [loaded, setLoaded] = useState(false);
  const [selectedDot, setSelectedDot] = useState(undefined);
  const [selectedLoai, setSelectedLoai] = useState(undefined);
  const [selectedMaHp, setSelectedMaHp] = useState(undefined);
  const [keyRender, setKeyRender] = useState(0);
  const [ki, setKi] = useState(undefined);

  const [pagination, setPagination] = useState<Paginate>({
    count: 1,
    hasMoreItems: true,
    itemsPerPage: 10,
    page: 1,
    total: 1,
    totalPage: 1
  });
  const [updatedColumnsDef] = useState<any[]>([
    {
      title: "Kì học",
      key: "ki_hoc",
      render: (_: any, record: any) => {
        return <div>{record.lop_thi.lop.ki_hoc}</div>;
      }
    },
    {
      title: "Đợt thi",
      key: "loai",
      render: (_: any, record: any) => {
        let loaiText = "";

        switch (record.lop_thi.loai) {
          case "GK":
            loaiText = "Giữa kỳ";
            break;
          case "GK2":
            loaiText = "Giữa kỳ lần 2";
            break;
          case "CK":
            loaiText = "Cuối kỳ";
            break;
          case "TB-GK":
            loaiText = "Thi bù - Giữa kỳ";
            break;
          case "TB-GK2":
            loaiText = "Thi bù - Giữa kỳ lần 2";
            break;
          default:
            loaiText = record.lop_thi.loai;
            break;
        }

        return <div>{loaiText}</div>;
      }
    },
    {
      title: "Mã học phần",
      key: "ma_hp",
      render: (_: any, record: any) => {
        return <div>{record.lop_thi.lop.ma_hp}</div>;
      }
    },
    {
      title: "Mã lớp học",
      key: "ma",
      render: (_: any, record: any) => {
        return <div>{record.lop_thi.lop.ma}</div>;
      }
    },
    {
      title: "Mã lớp thi",
      key: "ma_lop_thi",
      render: (_: any, record: any) => {
        return <div>{record.lop_thi.ma}</div>;
      }
    },
    {
      title: "MSSV",
      key: "mssv",
      render: (_: any, record: any) => {
        return <div>{record.sinh_vien.mssv}</div>;
      }
    },
    {
      title: "Tên sinh viên",
      key: "name",
      render: (_: any, record: any) => {
        return <div>{record.sinh_vien.name}</div>;
      }
    },
    {
      title: "Điểm",
      dataIndex: "diem",
      key: "diem",
      render: (_: any, record: any) => {
        let content = record.diem < 0 ? "-" : record.diem;
        if (record.ghi_chu != null && record.ghi_chu.diem_phuc_khao) {
          content = <p>{record.ghi_chu.diem_phuc_khao < 0 ? "-" : record.ghi_chu.diem_phuc_khao}</p>;
        } else if (record.ghi_chu != null && record.ghi_chu.diem_thi_bu >= 0) {
          content = <p>{record.ghi_chu.diem_thi_bu}</p>;
        }
        return content;
      }
    }
    // {
    //   title: "Ghi chú",
    //   dataIndex: "ghi_chu",
    //   key: "ghi_chu"
    // }
  ]);
  const handleChange = (name: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (name && updatedErrors[name]) {
        updatedErrors[name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };
  useEffect(() => {
    const getKyHoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data);
      }
    };
    getKyHoc();
  }, []);

  useEffect(() => {
    const getKyHocHienGio = async () => {
      const res = await configApi.getKiHienGio();
      if (res.data && res.data.length > 0) {
        setKiHienGio(res.data);
      }
    };
    getKyHocHienGio();
  }, []);

  useEffect(() => {
    form.setFieldsValue({ ki_hoc: kiHienGio });
    onFinish({ ki_hoc: kiHienGio });
  }, [kiHienGio]);

  useEffect(() => {
    const getDotThi = async () => {
      const res = await dotThiApi.listLoaiThi();
      if (res.data && res.data.length > 0) {
        setDotThi(res.data);
      }
    };
    getDotThi();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      setValues({ ...values });
    } catch (err: any) {
      const res = convertErrorAxios<LaravelValidationResponse>(err);
      setErrorMessage(err.data);
      if (res.type === "axios-error") {
        api.error({
          message: "message.error_edit",
          description: "message.error_desc_edit"
        });
        const { response } = res.error;
        if (response) setErrorMessage(response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await bangDiemApi.thongKeDiem({
        ...values,
        pagination
      });
      setListData(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loaded && fetchData();
  }, [values, pagination, keyRender]);

  const handleExport = async () => {
    setLoadingEx(true);
    try {
      const res = await exportApi.excelThongKeDiem({
        ki_hoc: ki || kiHienGio,
        loai_lop: selectedLoai ?? selectedLoai,
        loai: selectedDot ?? selectedDot,
        ma_hp: selectedMaHp ?? selectedMaHp
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Thong_ke_diem_${dayjs().format("DD-MM-YYYY")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEx(false);
    }
  };
  const isMobile = useMediaQuery({ minWidth: 600 });

  return (
    <>
      {contextHolder}
      <div className="flex gap-2">
        <Form
          method="POST"
          form={form}
          noValidate
          onFinish={onFinish}
          initialValues={{ ki_hoc: kiHienGio || undefined }}
          className="ki-hoc-lan-diem-danh flex flex-wrap gap-2"
          style={{ width: "100%" }}
        >
          <Form.Item
            label="Kì học"
            name="ki_hoc"
            className={isMobile ? "w-[12rem]" : "w-full"}
            style={{ marginBottom: "0" }}
          >
            <Select
              onChange={(selectedValues) => {
                pagination.page = 1;
                setKi(selectedValues);
                handleChange(selectedValues);
              }}
              filterOption={(input, option) => {
                const searchText = input.toLowerCase();
                const label = String(option?.label).toLowerCase();
                return label?.includes(searchText);
              }}
              placeholder="Kì học"
            >
              {renderOptionAdmin(kiHoc)}
            </Select>
          </Form.Item>
          <Form.Item
            label="Loại lớp"
            name="loai_lop"
            style={{ marginBottom: "0" }}
            className={isMobile ? "w-[14rem]" : "w-full"}
          >
            <Select
              allowClear
              onChange={(selectedValues) => {
                pagination.page = 1;
                handleChange(selectedValues);
                setSelectedLoai(selectedValues);
              }}
              filterOption={(input, option) => {
                const searchText = input.toLowerCase();
                const label = String(option?.label).toLowerCase();
                return label?.includes(searchText);
              }}
              placeholder="Chọn loại lớp"
            >
              {loaiLop.map((item) => (
                <Option key={item.key} value={item.value} label={item.name}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Đợt thi"
            name="loai"
            style={{ marginBottom: "0" }}
            className={isMobile ? "w-[17rem]" : "w-full"}
          >
            <Select
              allowClear
              onChange={(selectedValues) => {
                pagination.page = 1;
                handleChange(selectedValues);
                setSelectedDot(selectedValues);
              }}
              filterOption={(input, option) => {
                const searchText = input.toLowerCase();
                const label = String(option?.label).toLowerCase();
                return label?.includes(searchText);
              }}
              placeholder="Chọn đợt thi"
            >
              {renderOptionDotThi(dotThi)}
            </Select>
          </Form.Item>
          <Form.Item
            label="Mã học phần"
            name="ma_hp"
            style={{ marginBottom: "0" }}
            className={isMobile ? "w-[17rem]" : "w-full"}
          >
            <Input
              placeholder="Mã học phần"
              style={{ width: "100%" }}
              onChange={(value: any) => {
                pagination.page = 1;
                handleChange(value); // Convert the number value to a string and pass it to handleChange
                setSelectedMaHp(value.target.value);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={loading} type="primary" className="mr-3" onClick={() => setLoaded(true)}>
              Lọc
            </Button>
            <Button loading={loadingEx} type="primary" onClick={handleExport}>
              Xuất excel
            </Button>
          </Form.Item>
        </Form>
        {/* <div className="w-full">
        </div> */}
      </div>

      <PageContainer title="">
        <BaseTable
          columns={updatedColumnsDef}
          data={listData?.data}
          gridOption={{ defaultColDef: defaultColDef }}
          loading={loading}
          page="thong-ke-diem"
        />
        {listData?.data?.length > 0 && (
          <div
            className="flex justify-between items-center flex-grow-0"
            style={{
              padding: " 8px 0"
            }}
          >
            <Pagination
              current={pagination.page}
              pageSize={pagination.itemsPerPage}
              showSizeChanger
              onChange={(page, pageSize) => {
                setPagination((state) => {
                  return {
                    ...state,
                    page,
                    itemsPerPage: pageSize
                  };
                });
              }}
              total={listData?.total | 0}
            />
            <div className="px-2">
              Tổng số: {listData?.total || 0}
              <Button
                shape="circle"
                icon={<ReloadOutlined />}
                type="text"
                onClick={() => {
                  setKeyRender(Math.random());
                }}
              />
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
};
export default ThongKeDiemPage;

const renderOptionAdmin = (kihoc: string[]) => {
  if (!Array.isArray(kihoc)) return <></>;
  if (!kihoc || !kihoc.length) return <></>;
  return (
    <>
      {kihoc.map((item) => {
        return (
          <Option key={item} value={item} label={item}>
            {item}
          </Option>
        );
      })}
    </>
  );
};

const renderOptionDotThi = (dotThi: DotThi[]) => {
  if (!Array.isArray(dotThi)) return <></>;
  if (!dotThi || !dotThi.length) return <></>;
  return (
    <>
      {dotThi.map((item) => (
        <Option key={item.value} value={item.value} label={item.title}>
          {item.title}
        </Option>
      ))}
    </>
  );
};
