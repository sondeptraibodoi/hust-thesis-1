// import cauHoiApi from "@/api/cauHoi/cauHoi.api";
// import deThiApi from "@/api/deThi/deThi.api";
// import PageContainer from "@/Layout/PageContainer";
// import { DeleteOutlined } from "@ant-design/icons";
// import { App, Button, Card, Form, Input, message } from "antd";
// import { Select } from "antd/lib";
// import { debounce, get } from "lodash";
// import React, { FC, useCallback, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";

interface Props {
  type?: "create" | "update";
}

export const level = [
  {
    value: 1,
    label: "Mức độ 1"
  },
  {
    value: 2,
    label: "Mức độ 2"
  },
  {
    value: 3,
    label: "Mức độ 3"
  },
  {
    value: 4,
    label: "Mức độ 4"
  },
  {
    value: 5,
    label: "Mức độ 5"
  },
  {
    value: 6,
    label: "Mức độ 6"
  },
  {
    value: 7,
    label: "Mức độ 7"
  },
  {
    value: 8,
    label: "Mức độ 8"
  },
  {
    value: 9,
    label: "Mức độ 9"
  },
  {
    value: 10,
    label: "Mức độ 10"
  }
];

// const DeThiForm: FC<Props> = ({ type }) => {
//   const navigate = useNavigate();
//   const [cauHoi, setCauHoi] = React.useState<any[]>([]);
//   const [cauHoiSelected, setCauHoiSelected] = React.useState<any[]>([]);
//   const { id, dethi } = useParams<{ id: string; dethi?: string }>();
//   const [form] = Form.useForm();
//   const levelValue = Form.useWatch("diem_toi_da", form) || 1;
//   const { notification: api } = App.useApp();
//   useEffect(() => {
//     if (!id) return;
//     getCauHoi();
//   }, [id, dethi, type, levelValue]);

//   useEffect(() => {
//     if (type === "update" && dethi) {
//       getDeThi();
//     }
//   }, [id, dethi, type, cauHoi]);

//   const getCauHoi = async () => {
//     if (!id) return;
//     const res = await cauHoiApi.get({
//       mon_hoc_id: Number(id),
//       do_kho: levelValue
//     });
//     if (!res.data) return;
//     const data = res.data.map((x: any) => {
//       const render = (value: string) => {
//         const find = x.dap_ans.find((x: any) => x.name === value);
//         return find.context
//       }
//       return {
//         id: x.id,
//         de_bai: x.de_bai,
//         a: render('a'),
//         b: render('b'),
//         c: render('c'),
//         d: render('d'),
//         dap_an: x.dap_an,
//         do_kho: x.do_kho
//       };
//     });
//     setCauHoi(data);
//   };

//   const getDeThi = async () => {
//     if (!dethi) return;
//     const res = await deThiApi.show({ id: Number(dethi) });
//     if (!res.data) return;
//     const data = res.data.data;
//     setCauHoiSelected(
//       cauHoi.filter((cauHoi: any) => data.chi_tiet_de_this.some((chiTiet: any) => chiTiet.cau_hoi_id === cauHoi.id))
//     );
//     form.setFieldsValue({
//       thoi_gian: data.thoi_gian_thi,
//       diem_dat: data.diem_dat,
//       diem_toi_da: data.diem_toi_da,
//       ghi_chu: data.ghi_chu
//     });
//   };

//   const onDeleteItem = useCallback((id: number) => {
//     setCauHoiSelected((prev) => prev.filter((item) => item.id !== id));
//   }, []);

//   const onFinish = useCallback(
//     async (values: any) => {
//       if (cauHoiSelected.length === 0) {
//         api.error({
//           message: "Lỗi",
//           description: "Vui lòng chọn ít nhất một câu hỏi."
//         });
//         return;
//       }
//       try {
//         const payload = {
//           ...values,
//           mon_hoc_id: Number(id),
//           cau_hoi: cauHoiSelected.map((item) => {
//             return {
//               id: item.id,
//               ghi_chu: item.ghi_chu ?? null
//             };
//           })
//         };
//         if (type === "create") {
//           await deThiApi.post(payload);
//         } else {
//           await deThiApi.put({ id: Number(dethi), ...payload });
//         }
//         api.success({
//           message: "Thành công",
//           description: type === "create" ? "Tạo mới đề thi thành công!" : "Cập nhật đề thi thành công!"
//         });
//         const delay = debounce(() => {
//           navigate(`/sohoa/mon-hoc/${id}/de-thi`);
//         }, 200);
//         delay();
//       } catch (error) {
//         api.error({
//           message: "Lỗi",
//           description: "Đã có lỗi xảy ra, vui lòng thử lại sau."
//         });
//       }
//     },
//     [cauHoiSelected, id]
//   );
//   return (
//     <PageContainer title={type === "create" ? "Tạo mới" : "Chỉnh sửa"}>
//       <Form form={form} onFinish={onFinish} layout="vertical">
//         <Card className="bg-white shadow-md rounded-lg p-2">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Form.Item
//               name="thoi_gian"
//               label="Thời gian làm bài (phút)"
//               rules={[{ required: true, message: "Vui lòng nhập thời gian làm bài" }]}
//             >
//               <Input type="number" placeholder="Nhập thời gian làm bài (phút)" />
//             </Form.Item>
//             <Form.Item
//               name="diem_dat"
//               label="Điểm đạt"
//               rules={[{ required: true, message: "Vui lòng nhập số điểm đạt" }]}
//             >
//               <Input
//                 min={0}
//                 max={10}
//                 type="number"
//                 placeholder="Nhập điểm đạt"
//                 onBlur={(e) => {
//                   const val = parseFloat(e.target.value);
//                   if (val < 0 || val > 10) {
//                     message.error("Điểm phải từ 0 đến 10");
//                   }
//                 }}
//               />
//             </Form.Item>
//             <Form.Item name="diem_toi_da" label="Độ khó" rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}>
//               <Select className="w-full" placeholder="Chọn độ khó">
//                 {level.map((lvl: any) => (
//                   <Select.Option key={lvl.value} value={lvl.value}>
//                     {lvl.label}
//                   </Select.Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </div>
//           <Form.Item name="ghi_chu" label="Mô tả">
//             <Input.TextArea rows={4} placeholder="Nhập mô tả" />
//           </Form.Item>
//         </Card>
//         <Card className="bg-white shadow-md rounded-lg p-2 mt-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold">Chọn câu hỏi</h2>
//             <div className="flex items-center gap-2 w-full">
//               <Select
//                 allowClear
//                 mode="multiple"
//                 className="w-full"
//                 placeholder="Chọn câu hỏi"
//                 value={cauHoiSelected.map((item) => item.id)}
//                 onChange={(value) => {
//                   const selectedQuestions = cauHoi.filter((item) => value.includes(item.id));
//                   setCauHoiSelected(selectedQuestions);
//                 }}
//               >
//                 {cauHoi.map((item, index) => (
//                   <Select.Option key={item.id} value={item.id}>
//                     Câu {index + 1}: {item.de_bai}
//                   </Select.Option>
//                 ))}
//               </Select>
//               {/* <Button
//             type="primary"
//             onClick={() => {
//               // Logic to open modal for selecting questions
//             }}
//           >
//             Chọn câu hỏi
//           </Button> */}
//             </div>
//           </div>
//           <p className="text-sm p-2">Danh sách câu hỏi</p>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
//             {cauHoiSelected.map((item, index) => (
//               <div className="flex items-center justify-between" key={item.id}>
//                 <Card key={item.id} className="bg-gray-100 rounded-lg shadow-sm w-full">
//                   <div className="flex flex-col">
//                     <div className="flex justify-between items-start">
//                       <h3 className="font-bold text-lg mb-2">
//                         Câu {index + 1} :{item.de_bai}
//                       </h3>
//                       <Button
//                         icon={<DeleteOutlined />}
//                         danger
//                         type="primary"
//                         onClick={() => onDeleteItem(item.id)} // nếu có
//                       />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
//                       <div>
//                         <span className="font-bold">A. </span>
//                         {item.a}
//                       </div>
//                       <div>
//                         <span className="font-bold">B. </span>
//                         {item.b}
//                       </div>
//                       <div>
//                         <span className="font-bold">C. </span>
//                         {item.c}
//                       </div>
//                       <div>
//                         <span className="font-bold">D. </span>
//                         {item.d}
//                       </div>
//                     </div>

//                     <p>Đáp án đúng: {item.dap_an}</p>
//                     <p>Độ khó: {item.do_kho}</p>
//                   </div>
//                 </Card>
//               </div>
//             ))}
//           </div>
//         </Card>
//         <div className="flex justify-end mt-4">
//           <Button type="primary" htmlType="submit" className="mr-2">
//             {type === "create" ? "Tạo mới" : "Cập nhật"}
//           </Button>
//           <Button onClick={() => window.history.back()}>Hủy</Button>
//         </div>
//       </Form>
//     </PageContainer>
//   );
// };

// export default DeThiForm;

import { FC, useEffect, useState } from "react";
import { Card, Tag, Button, Table, Input, Select, Checkbox, Form, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { questionType } from "../cau-hoi";
import { useParams } from "react-router-dom";
import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import Title from "antd/es/typography/Title";

const { Option } = Select;

const renderAnswerList: FC<any> = (dap_ans, dap_an_dung) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {dap_ans.map((ans: any) => (
        <Tag key={ans.id} color={ans.name.toUpperCase() === dap_an_dung ? "green" : "default"}>
          {`${ans.name.toUpperCase()}. ${ans.context}`}
        </Tag>
      ))}
    </div>
  );
};

const DanhSachCauHoiDaChon: FC<any> = ({ selectedQuestions, onRemove }) => {
  return (
    <div>
      <b>Các câu hỏi đã chọn:</b>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
        {selectedQuestions.map((q: any, index: any) => (
          <Card
            key={q.id}
            title={`Câu ${index + 1}: ` + (q.de_bai || q.content)}
            size="small"
            extra={<Button icon={<DeleteOutlined />} onClick={() => onRemove(q.id)} style={{ color: "red" }}></Button>}
          >
            {renderAnswerList(q.dap_ans || [], q.dap_an || q.dapAnDung)}
          </Card>
        ))}
      </div>
    </div>
  );
};

const App:FC<Props> = ({type}) => {
  const { id, dethi } = useParams<{ id: string; dethi?: string }>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [monHoc, setMonHoc] = useState("");
  const [initialData, setInittialData] = useState([]);
  const [form] = Form.useForm();
  const levelValue = Form.useWatch("do_kho", form);
  const mucDo = Form.useWatch("loai", form);
  const search = Form.useWatch("search", form);
  const getCauHoi = async () => {
    if (!id) return;
    const params: any = {
      mon_hoc_id: Number(id),
      do_kho: levelValue,
    };
    if(mucDo) params.loai = mucDo;
    if(search) params.search = search;
    if(levelValue) params.do_kho = levelValue;
    const res = await cauHoiApi.get(params);
    console.log("🚀 ~ getCauHoi ~ res:", res)
    if (!res.data) return;
    setInittialData(res.data)
  };

  const columns = [
    {
      title: "Chọn",
      width: 100,
      dataIndex: "chon",
      render: (_: any, record: any) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => handleCheckboxChange(e.target.checked, record)}
        />
      )
    },
    {
      title: "Câu hỏi",
      dataIndex: "de_bai"
    },
    {
      title: "Mức độ",
      dataIndex: "loai",
      render: (value: number) => value ?? "—"
    },
    {
      title: "Đáp án đúng",
      dataIndex: "dap_an"
    }
  ];

  const handleCheckboxChange = (checked: boolean, record: any) => {
    const newKeys = checked ? [...selectedRowKeys, record.id] : selectedRowKeys.filter((key) => key !== record.id);

    setSelectedRowKeys(newKeys);

    const newSelected = checked ? [...selectedQuestions, record] : selectedQuestions.filter((q) => q.id !== record.id);

    setSelectedQuestions(newSelected);
  };

  const handleRemove = (id: number) => {
    setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <Form form={form} layout="vertical">
      <Title className="pl-6" level={3}>{type === 'create' ? "Thêm mới" : "Cập nhật"} đề thi</Title>
      <div style={{ padding: 24 }}>
        <Card className="bg-white shadow-md rounded-lg">
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="thoi_gian"
              label="Thời gian làm bài (phút)"
              rules={[{ required: true, message: "Vui lòng nhập thời gian làm bài" }]}
            >
              <Input type="number" placeholder="Nhập thời gian làm bài (phút)" />
            </Form.Item>
            <Form.Item
              name="diem_dat"
              label="Điểm đạt"
              rules={[{ required: true, message: "Vui lòng nhập số điểm đạt" }]}
            >
              <Input
                min={0}
                max={10}
                type="number"
                placeholder="Nhập điểm đạt"
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val < 0 || val > 10) {
                    message.error("Điểm phải từ 0 đến 10");
                  }
                }}
              />
            </Form.Item>
            <Form.Item name="do_kho" label="Độ khó" rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}>
              <Select className="w-full" placeholder="Chọn độ khó">
                {level.map((lvl: any) => (
                  <Select.Option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="ghi_chu" label="Mô tả">
            <Input.TextArea rows={4} placeholder="Nhập mô tả" />
          </Form.Item>
        </Card>
        <Card className="bg-white shadow-md rounded-lg p-2 mt-6">
          <div className="flex gap-2 mb-4">
            <Form.Item className="w-full" name="search">
            <Input allowClear placeholder="Từ khóa" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </Form.Item>
            <Form.Item name="loai">
            <Select allowClear placeholder="Mức độ" style={{ minWidth: 120 }}>
              {questionType.map((x: string) => (
                <Option key={x} value={x}>
                  {x}
                </Option>
              ))}
            </Select>
            </Form.Item>
            <Button onClick={getCauHoi} type="primary">Tìm kiếm</Button>
          </div>
          {initialData && initialData.length > 0 && (
            <Table
              className="mb-4"
              dataSource={initialData}
              columns={columns}
              rowKey="id"
              pagination={false}
              scroll={{ y: 55 * 3 }}
            />
          )}
          <DanhSachCauHoiDaChon selectedQuestions={selectedQuestions} onRemove={handleRemove} />
        </Card>
      </div>
    </Form>
  );
};

export default App;
