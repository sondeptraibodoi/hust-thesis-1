import { Button, Form, Select, Typography } from "antd";
import { FC, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import ImportExcelCompoment from "@/components/importDrawer";
import importApi from "@/api/import.api";
import configApi from "@/api/config.api";
import { DownloadOutlined } from "@ant-design/icons";
import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { DownloadPard } from "./download-part";
import { getKiHienGio } from "@/stores/features/config";
import { useAppSelector } from "@/stores/hook";
import { LoaiLopThi } from "@/constant";

const { Title } = Typography;
const ImportPage: FC<any> = () => {
  const { t } = useTranslation("sinh-vien");
  const { items: dotThiCurrent } = useLoaiLopThi();
  const dotThi = useMemo(() => {
    return dotThiCurrent.filter((x) => !x.value.includes("TB"));
  }, [dotThiCurrent]);
  const dotThiBu = useMemo(() => {
    return dotThiCurrent.filter((x) => x.value.includes("TB"));
  }, [dotThiCurrent]);
  const [kihoc, setKiHoc] = useState<string[]>([]);
  const [isDaiCuong, setIsDaiCuong] = useState(false);
  const [loaiThi, setLoaiThi] = useState(LoaiLopThi.Thi_Theo_Chuong);
  const kiHienGio = useAppSelector(getKiHienGio);

  const dowloadSampleFile = () => {
    const fileUrl = "public/download/file_mau_import.zip";

    const a = document.createElement("a");
    a.href = fileUrl;

    a.setAttribute("download", "file_mau_import.zip");
    a.click();
  };
  useEffect(() => {
    const getkihoc = async () => {
      const kihocs = await configApi.getKiHocs();
      setKiHoc(kihocs);
    };
    getkihoc();
  }, []);
  return (
    <div className="flex flex-col max-h-full overflow-hidden overflow-y-auto">
      <Button className="w-fit mx-1" icon={<DownloadOutlined />} onClick={dowloadSampleFile}>
        Tải file mẫu import
      </Button>
      <Title style={{ margin: "0" }} level={2}>
        Lớp học
      </Title>
      <div className="flex flex-wrap md:flex-row">
        <div className="mx-1 my-2">
          <ImportExcelCompoment
            suggestType="giao-vien"
            fieldName={[{ name: "name" }, { name: "email" }]}
            fileDownloadName="giao_vien"
            downloadable={true}
            uploadType=" .xls,.xlsx"
            appcectType={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]}
            translation="import-giao-vien"
            extraDownloadFileHeader={[{ keyName: "password", value: "password" }]}
            uploadformApi={importApi.importGiaoVien}
          />
        </div>
        <div className="mx-1 my-2">
          <ImportExcelCompoment
            fieldName={[
              {
                name: "ma"
              },
              {
                name: "ma_kem"
              },
              {
                name: "ma_hp"
              },
              { name: "ten_hp" },
              {
                name: "ghi_chu"
              },
              {
                name: "tuan_hoc"
              },
              {
                name: "giao_vien_email"
                // ghi_chu: `Ngăn cách giữa các email bằng dấu ","`,
              },
              {
                name: "loai"
              },
              {
                name: "lop_thu"
              },
              {
                name: "lop_thoigian"
              },
              {
                name: "lop_kip"
              },
              {
                name: "lop_phong"
              }
            ]}
            extraFormItemCompoment={{
              position: "top",
              element: (
                <>
                  <Form.Item
                    name={"ki_hoc"}
                    initialValue={kiHienGio}
                    rules={[
                      {
                        required: true,
                        message: "Hãy nhâp thông tin cho trường kì học"
                      }
                    ]}
                    label={t("field.ki_hoc")}
                  >
                    <Select
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={kihoc.map((x) => ({ label: x, value: x }))}
                    />
                  </Form.Item>
                  <Form.Item
                    name={"is_dai_cuong"}
                    initialValue={true}
                    rules={[
                      {
                        required: true,
                        message: "Hãy nhâp thông tin cho trường loại lớp"
                      }
                    ]}
                    label={"Loại lớp"}
                  >
                    <Select
                      allowClear
                      value={isDaiCuong}
                      onChange={(value) => setIsDaiCuong(value)}
                      options={[
                        { label: "Đại cương", value: true },
                        { label: "Chuyên ngành", value: false }
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    className="m-0"
                    name={"loai_thi"}
                    initialValue={LoaiLopThi.Thi_Theo_Chuong}
                    rules={[
                      {
                        required: true,
                        message: "Hãy nhâp thông tin cho trường loại thi"
                      }
                    ]}
                    label={"Loại thi"}
                  >
                    <Select
                      allowClear
                      value={loaiThi}
                      onChange={(value) => setLoaiThi(value)}
                      options={[
                        { label: "Thi 2 lần giữa kì", value: "thi_2_giua_ki" },
                        { label: "Thi 1 lần giữa kì", value: "thi_1_giua_ki" },
                        { label: "Thi 1 lần điểm 30", value: "thi_giua_ki_30" },
                        { label: "Thi theo chủ đề", value: LoaiLopThi.Thi_Theo_Chuong }
                      ]}
                    />
                  </Form.Item>
                  {<div className="ml-8 mt-2 mb-3">{renderSubLoaiThi(loaiThi)}</div>}
                </>
              )
            }}
            extraUploadObjKey={["ki_hoc", "is_dai_cuong", "loai_thi"]}
            uploadType=" .xls,.xlsx"
            appcectType={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]}
            fileDownloadName="lop"
            translation="import-lop"
            uploadformApi={importApi.importLop}
            downloadable={false}
            suggestType="lop"
          />
        </div>
        <div className="mx-1 my-2">
          <ImportExcelCompoment
            fieldName={[
              {
                name: "ten_hp"
              },
              {
                name: "ma_hp"
              },
              {
                name: "ma_lop"
              },
              {
                name: "sinh_vien_id"
              },
              {
                name: "sinh_vien_name"
              },
              {
                name: "sinh_vien_birthday",
                isRequired: false
              },
              {
                name: "sinh_vien_lop"
              },
              {
                name: "sinh_vien_nhom",
                isRequired: false
              }
            ]}
            extraFormItemCompoment={{
              position: "top",
              element: (
                <Form.Item
                  name={"ki_hoc"}
                  initialValue={kiHienGio}
                  rules={[
                    {
                      required: true,
                      message: "Hãy nhập thông tin cho trường kì học"
                    }
                  ]}
                  label={t("field.ki_hoc")}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    options={kihoc.map((x) => ({ label: x, value: x }))}
                  />
                </Form.Item>
              )
            }}
            uploadType=" .xls,.xlsx"
            extraUploadObjKey={["ki_hoc"]}
            appcectType={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]}
            fileDownloadName="sinhVien"
            translation="import-sinh-Vien"
            uploadformApi={importApi.importSinhVien}
            downloadable={false}
            suggestType="sinh-vien"
          />
        </div>
        <div className="mx-1 my-2">
          <ImportExcelCompoment
            fieldName={[
              {
                name: "ten_hp"
              },
              {
                name: "ma_hp"
              },
              {
                name: "ma_lop"
              },
              {
                name: "sinh_vien_id"
              },
              {
                name: "sinh_vien_name"
              },
              {
                name: "sinh_vien_nhom"
              },
              {
                name: "giao_vien_huong_dan_email",
                ghi_chu: "email của giáo viên hướng dẫn"
              },
              {
                name: "ten_do_an",
                isRequired: false
              },
              {
                name: "noi_dung",
                isRequired: false
              },
              {
                name: "cac_moc_quan_trong",
                isRequired: false
              }
            ]}
            extraFormItemCompoment={{
              position: "top",
              element: (
                <Form.Item
                  name={"ki_hoc"}
                  initialValue={kiHienGio}
                  rules={[
                    {
                      required: true,
                      message: "Hãy nhập thông tin cho trường kì học"
                    }
                  ]}
                  label={t("field.ki_hoc")}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    options={kihoc.map((x) => ({ label: x, value: x }))}
                  />
                </Form.Item>
              )
            }}
            uploadType=" .xls,.xlsx"
            extraUploadObjKey={["ki_hoc"]}
            appcectType={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]}
            fileDownloadName="import-do-an"
            translation="import-do-an"
            uploadformApi={importApi.importDoAn}
            downloadable={false}
            suggestType="import-do-an"
          />
        </div>
        <div className="mx-1 my-2">
          <ImportExcelCompoment
            fieldName={[
              {
                name: "ma_hp"
              },
              {
                name: "mssv"
              },
              {
                name: "giao_vien_phan_bien_email",
                ghi_chu: "emai của giáo viên phản biện"
              }
            ]}
            extraFormItemCompoment={{
              position: "top",
              element: (
                <Form.Item
                  name={"ki_hoc"}
                  initialValue={kiHienGio}
                  rules={[
                    {
                      required: true,
                      message: "Hãy nhập thông tin cho trường kì học"
                    }
                  ]}
                  label={t("field.ki_hoc")}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    options={kihoc.map((x) => ({ label: x, value: x }))}
                  />
                </Form.Item>
              )
            }}
            uploadType=" .xls,.xlsx"
            extraUploadObjKey={["ki_hoc"]}
            appcectType={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]}
            fileDownloadName="import-phan-bien"
            translation="import-phan-bien"
            uploadformApi={importApi.importPhanBien}
            downloadable={false}
            suggestType="import-phan-bien"
          />
        </div>
        <div className="mx-1 my-2">
          <ImportExcelCompoment
            fieldName={[
              {
                name: "ma"
              },
              {
                name: "mssv"
              },
              {
                name: "diem"
              }
            ]}
            extraFormItemCompoment={{
              position: "top",
              element: (
                <Form.Item
                  name={"ki_hoc"}
                  initialValue={kiHienGio}
                  rules={[
                    {
                      required: true,
                      message: "Hãy nhập thông tin cho trường kì học"
                    }
                  ]}
                  label={t("field.ki_hoc")}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    options={kihoc.map((x) => ({ label: x, value: x }))}
                  />
                </Form.Item>
              )
            }}
            uploadType=" .xls,.xlsx"
            extraUploadObjKey={["ki_hoc"]}
            appcectType={[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel"
            ]}
            fileDownloadName="import-lop-diem"
            translation="import-lop-diem"
            uploadformApi={importApi.importLopHocDiem}
            downloadable={false}
            suggestType="import-lop-diem"
          />
        </div>
      </div>
      <Title style={{ margin: "0" }} level={2}>
        Thi
      </Title>
      <div className="flex flex-wrap md:flex-row">
        <div className="flex flex-wrap">
          <div className="mx-1 my-2">
            <ImportExcelCompoment
              fieldName={[
                {
                  name: "ma_lop"
                },
                {
                  name: "nhom"
                },
                {
                  name: "ma_lop_thi",
                  isRequired: false
                },
                {
                  name: "ngay_thi",
                  ghi_chu: "Dữ liệu của cột phải là dạng text"
                },
                { name: "kip_thi" },
                { name: "phong_thi" }
              ]}
              fileDownloadName="thi_giua_ky"
              extraFormItemCompoment={{
                position: "top",
                element: (
                  <>
                    <Form.Item
                      name={"ki_hoc"}
                      initialValue={kiHienGio}
                      rules={[
                        {
                          required: true,
                          message: "Hãy nhập thông tin cho trường kì học"
                        }
                      ]}
                      label={t("field.ki_hoc")}
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={kihoc.map((x) => ({ label: x, value: x }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name={"loai"}
                      rules={[
                        {
                          required: true,
                          message: "Hãy nhập thông tin cho trường kì học"
                        }
                      ]}
                      label={"Loại"}
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={dotThi.map((x) => ({
                          label: x.title,
                          value: x.value
                        }))}
                      />
                    </Form.Item>
                  </>
                )
              }}
              uploadType=" .xls,.xlsx"
              extraUploadObjKey={["ki_hoc", "loai"]}
              appcectType={[
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel"
              ]}
              translation="import-lop-thi"
              uploadformApi={importApi.importLopThi}
              downloadable={false}
              suggestType="lop-thi"
            />
          </div>
          <div className="mx-1 my-2">
            <ImportExcelCompoment
              fieldName={[
                {
                  name: "mssv"
                },
                {
                  name: "ma_lop"
                },
                {
                  name: "nhom",
                  isRequired: false
                },
                {
                  name: "ma_lop_thi",
                  isRequired: false
                }
              ]}
              fileDownloadName="sinh_vien_thi"
              translation="import-sinh-vien-lop-thi"
              extraFormItemCompoment={{
                position: "top",
                element: (
                  <>
                    <Form.Item
                      name={"ki_hoc"}
                      initialValue={kiHienGio}
                      rules={[
                        {
                          required: true,
                          message: "Hãy nhập thông tin cho trường kì học"
                        }
                      ]}
                      label={t("field.ki_hoc")}
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={kihoc.map((x) => ({ label: x, value: x }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name={"loai"}
                      rules={[
                        {
                          required: true,
                          message: "Hãy nhập thông tin cho trường kì học"
                        }
                      ]}
                      label={"Loại"}
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={dotThi.map((x) => ({
                          label: x.title,
                          value: x.value
                        }))}
                      />
                    </Form.Item>
                  </>
                )
              }}
              uploadType=" .xls,.xlsx"
              extraUploadObjKey={["ki_hoc", "loai"]}
              appcectType={[
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel"
              ]}
              uploadformApi={importApi.importSinhVienLopThi}
              downloadable={false}
              suggestType="lop-thi-sv"
            />
          </div>
          <div className="mx-1 my-2">
            <ImportExcelCompoment
              fieldName={[
                {
                  name: "ma_lop"
                },
                {
                  name: "ma_hp"
                },
                {
                  name: "mssv"
                },
                {
                  name: "nhom",
                  isRequired: false
                },
                {
                  name: "ngay_thi",
                  ghi_chu: "Dữ liệu của cột phải là dạng text"
                },
                {
                  name: "kip_thi"
                },
                {
                  name: "phong_thi"
                }
              ]}
              fileDownloadName="sinh_vien_thi_bu"
              translation="import-sinh-vien-lop-thi-bu"
              extraFormItemCompoment={{
                position: "top",
                element: (
                  <>
                    <Form.Item
                      name={"ki_hoc"}
                      initialValue={kiHienGio}
                      rules={[
                        {
                          required: true,
                          message: "Hãy nhập thông tin cho trường kì học"
                        }
                      ]}
                      label={t("field.ki_hoc")}
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={kihoc.map((x) => ({ label: x, value: x }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name={"loai_dot_thi"}
                      rules={[
                        {
                          required: true,
                          message: "Hãy nhập thông tin cho trường đợt thi bù"
                        }
                      ]}
                      label={"Đợt thi"}
                    >
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={dotThiBu.map((x) => ({
                          label: x.title,
                          value: x.value
                        }))}
                      />
                    </Form.Item>
                  </>
                )
              }}
              uploadType=" .xls,.xlsx"
              extraUploadObjKey={["ki_hoc", "loai_dot_thi"]}
              appcectType={[
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel"
              ]}
              uploadformApi={importApi.importLopThiBu}
              downloadable={false}
              suggestType="lop-thi-bu"
            />
          </div>
        </div>
      </div>
      <DownloadPard />
    </div>
  );
};

export default ImportPage;

const renderSubLoaiThi = (data: string) => {
  if (!data) {
    return <></>;
  }
  switch (data) {
    case "thi_2_giua_ki":
      return (
        <ul>
          <li>Sinh viên tính điểm QT theo công thức (lần 1 + lần 2)/ 3 + Điểm tích cực</li>
          <li>Là lớp đại cương hồi trước</li>
        </ul>
      );
    case "thi_1_giua_ki":
      return (
        <ul>
          <li>Sinh viên tính điểm QT theo công thức lần 1 + Điểm tích cực</li>
          <li>Là lớp chuyên ngành hồi trước</li>
        </ul>
      );
    case "thi_giua_ki_30":
      return (
        <ul>
          <li>Sinh viên tính điểm QT theo công thức lần 1/ 3 + Điểm tích cực</li>
        </ul>
      );
    case "thi_theo_chuong":
      return (
        <ul>
          <li>Hiển thị thêm mục thi theo chủ đề</li>
        </ul>
      );
  }
};
