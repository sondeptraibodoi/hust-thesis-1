import { useEffect, useState } from "react";
import BaseTable from "@/components/base-table/lan-diem-danh";
import PageContainer from "@/Layout/PageContainer";
// import { DeleteOutlined } from "@ant-design/icons";
import lopHocApi from "@/api/lop/lopHoc.api";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import { convertErrorAxios } from "@/api/axios";
import { Button, Select, Form, notification, Tooltip, InputNumber } from "antd";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import configApi from "@/api/config.api";
import exportApi from "@/api/export/export.api";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
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
const ThongKeDiemDanhPage = () => {
  const [kiHoc, setKihoc] = useState<string[]>([]);
  const lanDiemDanh = [1, 2, 3, 4];
  const [loaiLop] = useState<LoaiLop[]>([
    { key: 1, value: true, name: "Đại cương" },
    { key: 2, value: false, name: "Chuyên ngành" }
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingEx, setLoadingEx] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [values, setValues] = useState<any>({});
  const [listData, setListData] = useState<any[]>([]);
  const [kiHienGio, setKiHienGio] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<LaravelValidationResponse | null>(null);
  const [form] = Form.useForm();
  const [loaded, setLoaded] = useState(false);
  const [selectedDot, setSelectedDot] = useState(1);
  const [selectedLoai, setSelectedLoai] = useState(1);

  const [updatedColumnsDef] = useState<any[]>([
    {
      title: "Tên giảng viên",
      key: "name",
      render: (_: any, record: any) => {
        const giaoViens = record.giao_viens;
        if (giaoViens.length > 0) {
          const uniqueNames: string[] = [];
          const names = giaoViens.map((gv: any) => gv.name);

          names.forEach((name: any) => {
            if (!uniqueNames.includes(name)) {
              uniqueNames.push(name);
            }
          });

          return (
            <Tooltip title={uniqueNames.join(", ")}>
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100px"
                }}
              >
                {uniqueNames.join(", ")}
              </div>
            </Tooltip>
          );
        }
        return "";
      }
    },
    {
      title: "Mã học phần",
      dataIndex: "ma_hp",
      key: "ma_hp"
    },
    {
      title: "Tên học phần",
      dataIndex: "ten_hp",
      key: "ten_hp"
    },
    {
      title: "Mã lớp học",
      dataIndex: "ma",
      key: "ma"
    },
    {
      title: "Loại",
      dataIndex: "loai",
      key: "loai"
    },
    {
      title: "Tuần học",
      dataIndex: "tuan_hoc",
      key: "tuan_hoc"
    },
    {
      title: "Số lần điểm danh",
      dataIndex: "count",
      key: "lan",
      align: "center",
      render: (count: number) => {
        return <div className="text-center">{count}</div>;
      }
    },
    {
      title: "Tuần đóng điểm danh",
      dataIndex: "tuan_dong",
      key: "tuan_dong_diem_danh",
      align: "center",
      render: (tuan_dong: number) => {
        return <div className="text-center">{tuan_dong}</div>;
      }
    },
    {
      title: "Yêu cầu",
      dataIndex: "loai",
      key: "lan",
      align: "center",
      render: (loaiLop: string) => {
        return getYeuCauForLop(loaiLop);
      }
    },
    {
      title: "Lệch",
      dataIndex: "count", // Chỉ cần trỏ tới "count" ở đây
      key: "lech",
      render: (count: number, record: any) => {
        const loaiLop = record.loai;
        const yeuCau = getYeuCauForLop(loaiLop);
        if (!yeuCau) {
          return 0;
        }
        const isNegative = count - yeuCau < 0;
        return <div className={`text-center ${isNegative ? "negative-lech" : ""}`}>{count - yeuCau}</div>;
      }
    }
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await lopHocApi.listLopDiemDanh({ ...values });
        setListData(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    loaded && fetchData();
  }, [values]);
  const handleExport = async () => {
    setLoadingEx(true);
    try {
      const res = await exportApi.excelThongKeDiemDanh({
        ki_hoc: kiHienGio,
        loai_lop: selectedLoai,
        dot: selectedDot
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Thong_ke_diem_danh_${dayjs().format("DD-MM-YYYY")}.xlsx`);
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
          initialValues={{ ki_hoc: kiHienGio || undefined, lan_diem_danh: 1 }}
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
            label="Đợt"
            name="lan_diem_danh"
            style={{ marginBottom: "0" }}
            className={isMobile ? "w-[17rem]" : "w-full"}
          >
            <Select
              onChange={(selectedValues) => {
                handleChange(selectedValues);
                setSelectedDot(selectedValues);
              }}
              filterOption={(input, option) => {
                const searchText = input.toLowerCase();
                const label = String(option?.label).toLowerCase();
                return label?.includes(searchText);
              }}
              placeholder="Đợt"
            >
              {renderOptionLan(lanDiemDanh)}
            </Select>
          </Form.Item>
          <Form.Item
            label="Tuần đóng điểm danh"
            name="tuan_diem_danh"
            style={{ marginBottom: "0" }}
            className={isMobile ? "w-[17rem]" : "w-full"}
          >
            <InputNumber
              placeholder="Tuần đóng điểm danh"
              min={1}
              style={{ width: "100%" }}
              onChange={(value: any) => {
                handleChange(value.toString()); // Convert the number value to a string and pass it to handleChange
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={loading} type="primary" className="mr-3" onClick={() => setLoaded(true)}>
              Lọc
            </Button>
            <Button className="" htmlType="submit" loading={loadingEx} type="primary" onClick={handleExport}>
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
          data={listData}
          gridOption={{ defaultColDef: defaultColDef }}
          loading={loading}
          page="thong-ke-diem-danh"
        />
      </PageContainer>
    </>
  );
};
export default ThongKeDiemDanhPage;

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
const renderOptionLan = (lan: number[]) => {
  if (!Array.isArray(lan)) return <></>;
  if (!lan || !lan.length) return <></>;
  return (
    <>
      {lan.map((item) => {
        return (
          <Option key={item} value={item} label={item}>
            {item}
          </Option>
        );
      })}
    </>
  );
};
function getYeuCauForLop(loaiLop: string) {
  if (loaiLop === "BT" || loaiLop === "LT") {
    return 1;
  } else if (loaiLop === "BT+LT" || loaiLop === "LT+BT") {
    return 2;
  }
  return null;
}
