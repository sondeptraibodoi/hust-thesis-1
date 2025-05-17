import bangDiemApi from "@/api/bangDiem/bangDiem.api";
import { LopThi } from "@/interface/lop";
import PageContainer from "@/Layout/PageContainer";
import { getAuthUser } from "@/stores/features/auth";
import { useAppSelector } from "@/stores/hook";
import { convertLinkToBackEnd } from "@/utils/url";
import { LoadingOutlined } from "@ant-design/icons";
import { App, Button, Descriptions, Form, Input, Select, Spin, Tag } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

const baseApi = convertLinkToBackEnd("/sohoa/api");
export default function NhanDienDiemPage() {
  const { t } = useTranslation("danh-sach-bang-diem");
  const { id } = useParams();
  const { notification } = App.useApp();
  const [key, setKey] = useState(0);
  const [page, setPage] = useState("01");
  const [info, setInfo] = useState<{
    trang_chua_nhan_dien: string[];
    so_lop_hoan_thanh: number;
    so_lop_chua_hoan_thanh: number;
  }>({
    trang_chua_nhan_dien: [],
    so_lop_hoan_thanh: 0,
    so_lop_chua_hoan_thanh: 0
  });
  const navigate = useNavigate();
  const [loadingTab, setLoadingTab] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [trangChuaNhanDienDiem, setTrangChuaNhanDienDiem] = useState<string[]>([]);
  const [lopthi, getLopThi] = useState<LopThi[]>();
  const [formRef] = Form.useForm();
  const authUser = useAppSelector(getAuthUser);

  const onSelect = (value: number) => {
    if (value == 1) {
      setPage("false");
    } else {
      setPage(value.toString());
    }
    setKey(Math.random());
  };

  useEffect(() => {
    const getdata = async () => {
      setLoadingTab(true);
      try {
        const datas = await Promise.all([
          await bangDiemApi.layTrangChuaNhanDien(id).then((x) => x.data),
          bangDiemApi.getLopthiThuocBangdiem(id as string).then((res) => res.data),
          bangDiemApi.getThongTin(id as string).then((res) => res.data)
        ]);
        setTrangChuaNhanDienDiem(datas[0]);
        getLopThi(datas[1]);
        setInfo(datas[2]);
      } finally {
        setLoadingTab(false);
      }
    };
    getdata();
  }, []);

  const onFinish = async (values: any) => {
    // const lopthiname = lopthi?.filter((x) => x.id === values.lop_thi_id);
    setLoadingSave(true);
    try {
      await bangDiemApi.nhanDien({ ...values, user_id: authUser?.id }, id);
      notification.success({
        message: "Thành công",
        description: `Sửa pdf lớp thi thành công`
      });
      formRef.resetFields();
      bangDiemApi.getThongTin(id as string).then((res) => {
        setInfo(res.data);
      });
    } catch (err: any) {
      notification.error({
        message: "Thất bại",
        description: err.response.data.message ? err.response.data.message : `Sửa pdf lớp thi thất bại`
      });
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-wrap my-1">
        <div className="flex justify-between w-full">
          <Button
            onClick={() => {
              navigate("/sohoa/bang-diem-tro-ly");
            }}
          >
            {t("action.back")}
          </Button>
          <Button type="primary" className="mx-1">
            <Link to={"danh-sach-lop-thi"}>{t("action.class")}</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row h-full w-full justify-between">
        <div key={key} className="pdf flex-1">
          <iframe
            className="w-full"
            loading="lazy"
            src={`${baseApi}/bang-diem/show-pdf/${id}#page=${page}`}
            key={`bang-diem/show-pdf/${id}#page=${page}`}
          ></iframe>
        </div>
        <div className="flex-1">
          {loadingTab ? (
            <div className="w-full h-full flex justify-center items-center">
              <Spin indicator={<LoadingOutlined style={{ fontSize: "3rem" }} spin />} size="large" />
            </div>
          ) : (
            <div className="ms-4 me-1">
              <h2 className="mb-4">Sửa lại trang pdf lớp thi</h2>
              <Form form={formRef} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  name="pages"
                  label="Trang"
                  rules={[
                    {
                      required: true,
                      message: "Hãy nhập thông tin cho trường trang"
                    }
                  ]}
                >
                  <Select
                    placeholder="Trang"
                    mode="multiple"
                    showSearch
                    allowClear
                    onSelect={onSelect}
                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    options={trangChuaNhanDienDiem.map((x: string) => ({
                      value: x,
                      label: "Trang: " + x
                    }))}
                  />
                </Form.Item>
                <Form.Item name="lop_thi_id" label="Lớp thi">
                  <Select
                    placeholder="Lớp thi"
                    showSearch
                    allowClear
                    className="select-lop-thi"
                    filterOption={(input, option) => {
                      const searchText = input.toLowerCase();
                      const label = String(option?.label).toLowerCase();
                      return label?.includes(searchText);
                    }}
                  >
                    {lopthi?.map((item) => (
                      <Select.Option
                        key={item.id}
                        value={item.id}
                        title={`${item.ma}`}
                        label={`${item.ma}-${item.lop?.ma_hp}`}
                      >
                        <p>{item.ma}</p>
                        {/* <p>{item.lop?.ma_hp}</p> */}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="ma_lop_thi" label="Mã lớp thi">
                  <Input className="bg-white" placeholder="Nhập mã lớp thi cho lớp lẻ" />
                </Form.Item>
                <Form.Item>
                  <Button className="mx-1" htmlType="reset">
                    Đặt lại
                  </Button>
                  <Button className="mx-1" type="primary" htmlType="submit" loading={loadingSave}>
                    Xác nhận
                  </Button>
                </Form.Item>
              </Form>
              <h4>Thông tin</h4>
              <Descriptions size="small">
                <Descriptions.Item label="Số lớp hoàn thành nhập điểm">
                  <span style={{ minWidth: 150 }}>{info.so_lop_hoan_thanh}</span>
                </Descriptions.Item>
              </Descriptions>
              <Descriptions size="small">
                <Descriptions.Item label="Số lớp chưa hoàn thành nhập điểm">
                  <span style={{ minWidth: 150 }}>{info.so_lop_chua_hoan_thanh}</span>
                </Descriptions.Item>
              </Descriptions>
              <div>
                {info.trang_chua_nhan_dien && info.trang_chua_nhan_dien.length > 0 && (
                  <>
                    <h4 className="mb-2">Danh sách trang chưa nhận diện</h4>
                    <div className="flex flex-wrap gap-2">
                      {info.trang_chua_nhan_dien.map((x) => (
                        <Tag key={x}>Trang {x}</Tag>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
