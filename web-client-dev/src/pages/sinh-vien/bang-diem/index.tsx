// import { ColDef, ICellRendererParams } from "ag-grid-community";
// import { Button, Card, Col, Form, Input, Pagination, Row, Select, Spin, Tooltip } from "antd";
// import { FC, memo, useCallback, useEffect, useState } from "react";

// import bangDiemApi from "@/api/sinhVien/bangDiem.api";
// import BaseResponsive from "@/components/base-responsive";
// import BaseTable from "@/components/base-table";
// import SelectFilter from "@/components/custom-filter/SelectFilter";
// import SelectFloatingFilterCompoment from "@/components/custom-filter/SelectFloatingFilterCompoment";
// import { getPrefix } from "@/constant";
// import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
// import { Paginate } from "@/interface/axios";
// import { BangDiemSV } from "@/interface/bangdiem";
// import { ActionField } from "@/interface/common";
// import { Lop } from "@/interface/lop";
// import PageContainer from "@/Layout/PageContainer";
// import { getKiHienGio } from "@/stores/features/config";
// import { useAppSelector } from "@/stores/hook";
// import { formatDate } from "@/utils/formatDate";
// import { EditOutlined } from "@ant-design/icons";
// import { PaginationProps } from "antd/lib";
// import { useTranslation } from "react-i18next";
// import { Link } from "react-router-dom";

// const defaultColDef = {
//   flex: 1,
//   minWidth: 150,
//   resizable: true,
//   filter: true,
//   floatingFilter: true
// };
// const BangDiemPage = () => {
//   const [kiHoc, setKihoc] = useState<string[]>([]);
//   const kiHienGio = useAppSelector(getKiHienGio);



//   const contentDesktop = () => kiHienGio && <BangDiemPageDesktop kiHoc={kiHoc} kiHienGio={kiHienGio} />;
//   const contentMobile = () => kiHienGio && <BangDiemPageMobile kiHoc={kiHoc} kiHienGio={kiHienGio} />;
//   return (
//     <>
//       <PageContainer title="Danh sách bảng điểm">
//         <BaseResponsive contentDesktop={contentDesktop} contentMobile={contentMobile} />
//       </PageContainer>
//     </>
//   );
// };

// export default BangDiemPage;

// const BangDiemPageDesktop: FC<{ kiHoc: string[]; kiHienGio: string }> = memo(({ kiHienGio }) => {
//   const { t } = useTranslation("bang-diem-sinh-vien");
//   const { format: formatDotThi } = useLoaiLopThi();
//   const [columnDefs] = useState<ColDef<Lop & ActionField>[]>([
//     {
//       headerName: t("field.ki_hoc"),
//       field: "ki_hoc",
//       filter: SelectFilter,
//       floatingFilter: true,
//       floatingFilterComponent: SelectFloatingFilterCompoment,
//       filterParams: {
//         suppressFilterButton: true,
//         placeholder: "Kì học",
//         getData
//       },
//       floatingFilterComponentParams: {
//         suppressFilterButton: true,
//         placeholder: "Kì học",
//         getData
//       }
//     },
//     {
//       headerName: t("field.ma_hp"),
//       field: "ma_hp",
//       filter: "agTextColumnFilter"
//     },
//     {
//       headerName: t("field.ten_hp"),
//       field: "ten_hp",
//       filter: false
//     },
//     {
//       headerName: t("field.lop_hoc"),
//       field: "ma_lop",
//       filter: false
//     },
//     {
//       headerName: t("field.lop_thi"),
//       field: "ma_lop_thi",
//       filter: false,
//       cellRenderer: LopThiCellRender
//     },
//     {
//       headerName: t("field.dot_thi"),
//       field: "loai_lop_thi",
//       filter: false,
//       cellRenderer: DotThiCellRender,
//       cellRendererParams: {
//         format: formatDotThi
//       }
//     },
//     {
//       headerName: t("field.diem"),
//       field: "diem",
//       filter: false,
//       valueFormatter: ({ value }) => (value < 0 ? "-" : value)
//     },
//     {
//       headerName: t("field.diem_phuc_khao"),
//       field: "diem_phuc_khao",
//       filter: false,
//       cellRenderer: DiemPhucKhaoRender
//     },
//     {
//       headerName: t("field.han_phuc_khao"),
//       field: "ngay_ket_thuc_phuc_khao",
//       filter: false,
//       cellRenderer: NgayKetThucCellRender,
//       minWidth: 250
//     },
//     {
//       headerName: t("field.action"),
//       field: "is_phuc_khao",
//       width: 150,
//       cellRenderer: ActionCellRender,
//       cellRendererParams: {},
//       filter: false
//     }
//   ]);

//   const [initFilter] = useState({
//     ki_hoc: {
//       filterType: "text",
//       type: "contains",
//       filter: kiHienGio
//     }
//   });
//   return (
//     <BaseTable
//       columns={columnDefs}
//       api={bangDiemApi.list}
//       gridOption={{ defaultColDef: defaultColDef }}
//       initFilter={initFilter}
//     ></BaseTable>
//   );
// });

// const BangDiemPageMobile: FC<{ kiHoc: string[]; kiHienGio: string }> = memo(({ kiHoc, kiHienGio }) => {
//   const { format: formatDotThi } = useLoaiLopThi();
//   const [dataSource, setDataSource] = useState<BangDiemSV[]>([]);
//   const { t } = useTranslation("bang-diem-sinh-vien");

//   const [loading, setLoading] = useState<boolean>(false);
//   const [form] = Form.useForm();
//   const layout = {
//     labelCol: { span: 6 },
//     wrapperCol: { span: 18 }
//   };
//   const [pagination, setPagination] = useState<Paginate>({
//     count: 1,
//     hasMoreItems: true,
//     itemsPerPage: 10,
//     page: 1,
//     total: 1,
//     totalPage: 1
//   });
//   const getData = useCallback(async (filter: any) => {
//     setLoading(true);
//     try {
//       const res = await bangDiemApi.list(filter);
//       if (res.data.list.length > 0) {
//         setDataSource(res.data.list);
//         setPagination((state) => {
//           return {
//             ...state,
//             total: res.data.pagination.total
//           };
//         });
//       } else {
//         setDataSource([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   const handleFieldChanged = (field: string, value: any) => {
//     form.setFieldsValue({ [field]: value });
//     onSubmit(form.getFieldsValue());
//   };
//   const onShowSizeChange: PaginationProps["onShowSizeChange"] = useCallback((current: number, pageSize: number) => {
//     setPagination((state) => {
//       return {
//         ...state,
//         itemsPerPage: pageSize,
//         page: current
//       };
//     });
//   }, []);

//   const onSubmit = (filter?: any) => {
//     const sendData: any = {
//       filterModel: {
//         ki_hoc: {
//           filterType: "text",
//           type: "contains",
//           filter: filter.ki_hoc
//         },
//         ma_hp: {
//           filterType: "text",
//           type: "contains",
//           filter: filter.ma_hp
//         }
//       },
//       count: 1,
//       hasMoreItems: true,
//       itemsPerPage: pagination.itemsPerPage,
//       page: pagination.page,
//       total: 1,
//       totalPage: 1
//     };
//     getData(sendData);
//   };
//   useEffect(() => {
//     onSubmit(form.getFieldsValue());
//   }, [pagination.itemsPerPage, pagination.page]);

//   useEffect(() => {
//     form.setFieldsValue({ ki_hoc: kiHienGio });
//     onSubmit({ ki_hoc: kiHienGio });
//   }, []);
//   const Filter = (
//     <Form
//       form={form}
//       layout="vertical"
//       {...layout}
//       labelWrap
//       onFinish={onSubmit}
//       initialValues={{
//         ki_hoc: kiHienGio
//       }}
//     >
//       <Row>
//         <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
//           <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ki_hoc" label="Kì học">
//             <Select
//               allowClear
//               onChange={(value) => {
//                 pagination.page = 1;
//                 handleFieldChanged("ki_hoc", value);
//               }}
//             >
//               {kiHoc.map((item) => (
//                 <Select.Option key={item}>{item}</Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Col>
//         <Col xs={24} sm={12} md={8} lg={8} xxl={6}>
//           <Form.Item className="col-span-12 sm:col-span-6 lg:col-span-3" name="ma_hp" label="Mã học phần">
//             <Input
//               onPressEnter={(e: any) => {
//                 pagination.page = 1;
//                 handleFieldChanged("ma_hp", e.target.value);
//               }}
//             />
//           </Form.Item>
//         </Col>
//         <Col span={24} className="flex justify-end">
//           <Button type="primary" htmlType="submit">
//             Lọc
//           </Button>
//         </Col>
//       </Row>
//     </Form>
//   );
//   let Content = undefined;
//   if (loading) {
//     Content = (
//       <div className="p-2">
//         {" "}
//         <Spin />{" "}
//       </div>
//     );
//   } else if (dataSource.length == 0) {
//     Content = <div className="p-2 text-center"> Sinh viên chưa có bảng điểm nào</div>;
//   } else {
//     Content = (
//       <>
//         {dataSource.map((record, key) => {
//           const disabled = !record.is_phuc_khao;
//           return (
//             <Col span={24} key={record.id} className="my-2">
//               <Card>
//                 <p className="my-1">
//                   <strong>STT:</strong> {key + 1}
//                 </p>
//                 <p className="my-1">
//                   <strong>{t("field.ki_hoc")}:</strong> {record.ki_hoc}
//                 </p>
//                 <p className="my-1">
//                   <strong>{t("field.lop_hoc")}:</strong> {record.ma_lop}
//                 </p>
//                 <p className="my-1">
//                   <strong>{t("field.ma_hp")}:</strong> {record.ma_hp}
//                 </p>
//                 <p className="my-1">
//                   <strong>{t("field.ten_hp")}:</strong> {record.ten_hp}
//                 </p>

//                 <p className="my-1">
//                   <strong>{t("field.lop_thi")}:</strong> {record.ma_lop_thi}
//                 </p>
//                 <p className="my-1">
//                   <strong>{t("field.dot_thi")}:</strong> {formatDotThi(record.loai_lop_thi)}
//                 </p>
//                 {!record.is_chuyen_nganh && (
//                   <>
//                     {" "}
//                     <p className="my-1">
//                       <strong>{t("field.diem")}:</strong> {record.diem}
//                     </p>
//                     <p className="my-1">
//                       <strong>{t("field.diem_phuc_khao")}: </strong> <DiemPhucKhaoRender data={record} />
//                     </p>
//                     <p className="my-1">
//                       <strong>{t("field.han_phuc_khao")}: </strong>
//                       {formatDate(record.ngay_ket_thuc_phuc_khao.toLocaleString())}
//                     </p>
//                     <div className="flex justify-center">
//                       <Tooltip placement="top">
//                         <Link to={getPrefix() + "/phuc-khao/" + record.id}>
//                           <Button disabled={disabled} shape="circle" icon={<EditOutlined />} type="text"></Button>
//                         </Link>
//                       </Tooltip>
//                     </div>{" "}
//                   </>
//                 )}
//               </Card>
//             </Col>
//           );
//         })}
//         <div
//           className="flex justify-between items-center flex-grow-0"
//           style={{
//             padding: " 8px 0"
//           }}
//         >
//           <Pagination
//             current={pagination.page}
//             pageSize={pagination.itemsPerPage}
//             showSizeChanger
//             onChange={onShowSizeChange}
//             total={pagination.total}
//           />
//           <div className="px-2">Tổng số: {pagination.total || 0}</div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <div>
//       {Filter}
//       <div className="card-container card-chi-tiet-diem-danh">{Content}</div>
//     </div>
//   );
// });

// const NgayKetThucCellRender: FC<{ data: BangDiemSV }> = ({ data }) => {
//   if (!data) {
//     return <span></span>;
//   }
//   if (data.is_chuyen_nganh) {
//     return;
//   }
//   return formatDate(data.ngay_ket_thuc_phuc_khao);
// };
// const ActionCellRender: FC<{ data: BangDiemSV }> = ({ data }) => {
//   if (!data) {
//     return <span></span>;
//   }
//   if (data.is_chuyen_nganh) {
//     return;
//   }
//   const disabled = !data.is_phuc_khao;
//   const text = data.is_phuc_khao ? "Phúc khảo" : "Hết hạn phúc khảo";
//   return (
//     <>
//       <Tooltip placement="top" title={text}>
//         <Link to={getPrefix() + "/phuc-khao/" + data.id}>
//           <Button shape="circle" disabled={disabled} icon={<EditOutlined />} type="text"></Button>
//         </Link>
//       </Tooltip>
//     </>
//   );
// };

// const LopThiCellRender: FC<{ data: BangDiemSV }> = ({ data }) => {
//   if (!data) {
//     return <span></span>;
//   }
//   return <span>{data.ma_lop_thi}</span>;
// };

// export interface LoaiCellRendererParams extends ICellRendererParams {
//   format: (value: string) => string;
// }
// const DotThiCellRender: FC<LoaiCellRendererParams> = (params) => {
//   if (!params.value) {
//     return "";
//   }
//   return params.format(params.value);
// };

// const DiemPhucKhaoRender: FC<{ data: BangDiemSV }> = memo(({ data }) => {
//   if (!data) {
//     return <span></span>;
//   }
//   if (data.is_chuyen_nganh) {
//     return;
//   }
//   if (data.diem_phuc_khao == null) {
//     return <span>Chưa phúc khảo</span>;
//   }
//   if (data.diem_phuc_khao < 0) {
//     return <span>-</span>;
//   }
//   if (data.diem == data.diem_phuc_khao) {
//     return <span>Không thay đổi</span>;
//   }
//   if (data.diem != data.diem_phuc_khao) {
//     return <span>{data.diem_phuc_khao}</span>;
//   }
// });
