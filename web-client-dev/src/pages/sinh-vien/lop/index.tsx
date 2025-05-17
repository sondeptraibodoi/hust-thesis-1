import { Button, Card, Col, Form, Input, Row, Select, Tooltip } from "antd";
import { EditOutlined, ReadOutlined } from "@ant-design/icons";
import { FC, useCallback, useState } from "react";

import { ActionField } from "@/interface/common";
import BaseResponsive from "@/components/base-responsive";
import BaseTable from "@/components/base-table";
import BaseTableMobile from "@/components/base-table-mobile";
import { ColDef } from "ag-grid-community";
import { Link } from "react-router-dom";
import { Lop } from "@/interface/lop";
import PageContainer from "@/Layout/PageContainer";
import SelectFilter from "@/components/custom-filter/SelectFilter";
import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
import { getKiHienGio } from "@/stores/features/config";
import lopHocApi from "@/api/lop/lopCuaSinhVien.api";
import { useAppSelector } from "@/stores/hook";
import { useKiHoc } from "@/hooks/useKiHoc";
import { useTranslation } from "react-i18next";
import { LoaiLopThi } from "@/constant";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};
const LopHocPage = () => {
  const { items: ki_hocs } = useKiHoc();
  const kiHienGio = useAppSelector(getKiHienGio);

  const contentDesktop = () => kiHienGio && <LopHocPageDesktop kiHoc={ki_hocs} kiHienGio={kiHienGio} />;
  const contentMobile = () => kiHienGio && <LopHocPageMobile kiHoc={ki_hocs} kiHienGio={kiHienGio} />;
  return (
    <>
      <PageContainer title="Danh sách lớp học">
        <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
      </PageContainer>
    </>
  );
};

export default LopHocPage;

const ActionCellRender: FC<{ data: Lop }> = ({ data }) => {
  if (!data) {
    return <span></span>;
  }
  return (
    <div className="flex">
      <Tooltip title="Chi tiết">
        <Link to={"" + data.id}>
          <Button shape="circle" icon={<EditOutlined />} type="text"></Button>
        </Link>
      </Tooltip>
      {data.loai_thi == LoaiLopThi.Thi_Theo_Chuong &&
        data.loai != "TN" &&
        !!data.hoc_phan_chuongs_count &&
        data.hoc_phan_chuongs_count > 0 && (
          <Tooltip title="Kiểm tra">
            <Link to={"kiem-tra/" + data.id}>
              <Button shape="circle" icon={<ReadOutlined />} type="text"></Button>
            </Link>
          </Tooltip>
        )}
    </div>
  );
};
const LopHocPageDesktop: FC<{ kiHoc: string[]; kiHienGio: string }> = ({ kiHienGio }) => {
  const { t } = useTranslation("lop");
  const { getData } = useKiHoc();
  const [columnDefs] = useState<ColDef<Lop & ActionField>[]>([
    {
      headerName: t("field.ki_hoc"),
      field: "ki_hoc",
      filter: SelectFilter,
      floatingFilter: true,
      floatingFilterComponent: SelectFloatingFilterCompoment,
      filterParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
        placeholder: "Kì học",
        getData
      }
    },
    {
      headerName: t("field.ma"),
      field: "ma",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: t("field.ma_kem"),
      field: "ma_kem",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },

    {
      headerName: t("field.ma_hp"),
      field: "ma_hp",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: t("field.ten_hp"),
      field: "ten_hp",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: t("field.phong"),
      field: "phong",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.loai"),
      field: "loai",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },

    {
      headerName: t("field.ghi_chu"),
      field: "ghi_chu",
      filter: "agTextColumnFilter"
    },
    {
      headerName: t("field.action"),
      field: "action",
      width: 200,
      cellRenderer: ActionCellRender,
      cellRendererParams: {},
      filter: false
    }
  ]);
  const [initFilter] = useState({
    ki_hoc: {
      filterType: "text",
      type: "contains",
      filter: kiHienGio
    }
  });
  return <BaseTable columns={columnDefs} api={lopHocApi.list} initFilter={initFilter}></BaseTable>;
};

const LopHocPageMobile: FC<{ kiHoc: string[]; kiHienGio: string }> = ({ kiHoc, kiHienGio }) => {
  const [form] = Form.useForm();
  const handleFieldChanged = (field: string, value: any) => {
    form.setFieldsValue({ [field]: value });
  };
  const [filter, setFilter] = useState({
    filterModel: {
      ki_hoc: {
        filterType: "text",
        type: "contains",
        filter: kiHienGio
      }
    }
  });
  const onSubmit = useCallback((filter?: any) => {
    const sendData: any = {
      filterModel: {
        ki_hoc: {
          filterType: "text",
          type: "contains",
          filter: filter.ki_hoc
        },
        ma: {
          filterType: "text",
          type: "contains",
          filter: filter.ma
        },
        ma_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ma_hp
        },
        ten_hp: {
          filterType: "text",
          type: "contains",
          filter: filter.ten_hp
        }
      }
    };
    setFilter(sendData);
  }, []);
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        {...layout}
        labelWrap
        initialValues={{
          ki_hoc: kiHienGio
        }}
        onFinish={onSubmit}
      >
        <Row>
          <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
            <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ki_hoc" label="Kì học">
              <Select
                allowClear
                onChange={(value) => {
                  handleFieldChanged("ki_hoc", value);
                }}
              >
                {kiHoc.map((item) => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
            <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma" label="Mã lớp học">
              <Input
                onPressEnter={(e: any) => {
                  handleFieldChanged("ma", e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
            <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_hp" label="Mã học phần">
              <Input
                onPressEnter={(e: any) => {
                  handleFieldChanged("ma_hp", e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
            <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ten_hp" label="Tên học phần">
              <Input
                onPressEnter={(e: any) => {
                  handleFieldChanged("ten_hp", e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={24} className="flex justify-end">
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Col>
        </Row>
      </Form>
      <BaseTableMobile
        api={lopHocApi.list}
        filter={filter}
        textNodata="Sinh viên chưa tham gia lớp học nào"
        item={(record, key) => {
          return (
            <Col span={24} key={record.id} className="my-2">
              <Card>
                <p className="my-1">
                  <strong>STT:</strong> {key + 1}
                </p>
                <p className="my-1">
                  <strong>Kì học:</strong> {record.ki_hoc}
                </p>
                <p className="my-1">
                  <strong>Mã lớp học:</strong> {record.ma}
                </p>
                <p className="my-1">
                  <strong>Mã lớp kèm:</strong> {record.ma_kem}
                </p>
                <p className="my-1">
                  <strong>Mã học phần:</strong> {record.ma_hp}
                </p>
                <p className="my-1">
                  <strong>Tên học phần:</strong> {record.ten_hp}
                </p>
                <p className="my-1">
                  <strong>Phòng:</strong> {record.phong}
                </p>
                <p className="my-1">
                  <strong>Loại:</strong> {record.loai}
                </p>
                <p className="my-1">
                  <strong>Ghi chú:</strong> {record.ghi_chu}
                </p>
                <div className="flex justify-center">
                  <ActionCellRender data={record} />
                </div>
              </Card>
            </Col>
          );
        }}
      ></BaseTableMobile>
    </div>
  );
};
