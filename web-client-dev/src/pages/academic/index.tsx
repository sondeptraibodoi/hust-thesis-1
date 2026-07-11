import academicApi from "@/api/academic/academic.api";
import giaoVienApi from "@/api/giaoVien/giaoVien.api";
import monHocApi from "@/api/mon-hoc/monHoc.api";
import BaseTable from "@/components/base-table";
import PageContainer from "@/Layout/PageContainer";
import { ROLE_CODE } from "@/constant";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import {
  CheckCircleOutlined,
  EditOutlined,
  FileSearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  notification,
} from "antd";
import { FC, useEffect, useMemo, useState } from "react";

const ROLE_SUBJECT_TEACHER = "giao_vien_bo_mon";
const ROLE_HOMEROOM_TEACHER = "giao_vien_chu_nhiem";
const TEACHER_ROLES = [ROLE_CODE.TEACHER, ROLE_SUBJECT_TEACHER];

const AcademicPage = () => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const role = currentUser?.vai_tro;

  const items = useMemo(() => {
    if (role === ROLE_CODE.ADMIN) {
      return [
        { key: "hoc-ky", label: "Kỳ học", children: <HocKyTab /> },
        { key: "lop-hoc-phan", label: "Lớp học phần", children: <LopHocPhanTab /> },
        { key: "cau-hinh", label: "Cấu hình", children: <CauHinhTab /> },
      ];
    }

    if (role === ROLE_CODE.STUDENT) {
      return [
        { key: "lop-mo", label: "Đăng ký môn", children: <LopHocPhanTab mode="student-open" /> },
        { key: "dang-ky", label: "Môn đã đăng ký", children: <DangKyTab /> },
        { key: "bang-diem", label: "Bảng điểm", children: <BangDiemTab /> },
        { key: "phuc-khao", label: "Phúc khảo", children: <PhucKhaoTab /> },
      ];
    }

    if (role === ROLE_HOMEROOM_TEACHER) {
      return [
        { key: "chu-nhiem", label: "Sinh viên phụ trách", children: <ChuNhiemTab /> },
        { key: "bang-diem", label: "Theo dõi điểm", children: <BangDiemTab readonly /> },
        { key: "phuc-khao", label: "Phúc khảo", children: <PhucKhaoTab readonly /> },
      ];
    }

    return [
      { key: "lop-hoc-phan", label: "Lớp phụ trách", children: <LopHocPhanTab mode="teacher" /> },
      { key: "bang-diem", label: "Chấm điểm", children: <BangDiemTab /> },
      { key: "phuc-khao", label: "Phúc khảo", children: <PhucKhaoTab /> },
    ];
  }, [role]);

  return (
    <PageContainer title="Học vụ">
      <Tabs items={items} destroyInactiveTabPane />
    </PageContainer>
  );
};

export default AcademicPage;

const StatusTag: FC<{ value?: string }> = ({ value }) => {
  const color =
    value === "qua_mon" || value === "da_chot" || value === "dang_mo" || value === "chap_nhan"
      ? "green"
      : value === "truot" || value === "da_huy" || value === "tu_choi"
        ? "red"
        : value === "cho_xu_ly"
          ? "gold"
          : "blue";

  const text: Record<string, string> = {
    dang_mo: "Đang mở",
    da_dang_ky: "Đã đăng ký",
    da_huy: "Đã hủy",
    chua_co_diem: "Chưa có điểm",
    qua_mon: "Qua môn",
    truot: "Trượt",
    nhap_diem: "Nhập điểm",
    da_chot: "Đã chốt",
    cho_xu_ly: "Chờ xử lý",
    chap_nhan: "Chấp nhận",
    tu_choi: "Từ chối",
  };

  return <Tag color={color}>{text[value || ""] || value || "Chưa rõ"}</Tag>;
};

const HocKyTab = () => {
  const [keyRender, setKeyRender] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>();

  const columns: ColDef[] = [
    { headerName: "Mã kỳ", field: "ma_hoc_ky", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Tên kỳ", field: "ten_hoc_ky", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Năm học", field: "nam_hoc", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Kỳ", field: "hoc_ky_so", width: 100 },
    { headerName: "Đăng ký", field: "dang_mo_dang_ky", cellRenderer: (p: any) => (p.value ? "Mở" : "Đóng") },
    { headerName: "Phúc khảo", field: "dang_mo_phuc_khao", cellRenderer: (p: any) => (p.value ? "Mở" : "Đóng") },
    { headerName: "Điểm qua", field: "diem_qua_mon_mac_dinh", width: 120 },
    { headerName: "Trạng thái", field: "trang_thai", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 120,
      cellRenderer: ({ data }: any) => (
        <Tooltip title="Sửa">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(data);
              setOpen(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Toolbar
        onCreate={() => {
          setEditing(undefined);
          setOpen(true);
        }}
        onReload={() => setKeyRender(Math.random())}
      />
      <BaseTable key={keyRender} columns={columns} api={academicApi.hocKy.list} />
      <HocKyModal
        open={open}
        data={editing}
        onClose={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          setKeyRender(Math.random());
        }}
      />
    </>
  );
};

const LopHocPhanTab: FC<{ mode?: "student-open" | "teacher" }> = ({ mode }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [keyRender, setKeyRender] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>();
  const isAdmin = currentUser?.vai_tro === ROLE_CODE.ADMIN;

  const columns: ColDef[] = [
    { headerName: "Mã lớp", field: "ma_lop_hoc_phan", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Tên lớp", field: "ten_lop_hoc_phan", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Môn học", field: "mon_hoc.ten_mon_hoc", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Kỳ học", field: "hoc_ky.ten_hoc_ky", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Giáo viên", field: "giao_vien_bo_mon.ho_ten" },
    { headerName: "Sĩ số", field: "si_so_toi_da", width: 100 },
    { headerName: "Lịch học", field: "lich_hoc" },
    { headerName: "Trạng thái", field: "trang_thai", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 150,
      cellRenderer: ({ data }: any) => (
        <Space>
          {mode === "student-open" && (
            <Tooltip title="Đăng ký">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  await academicApi.dangKy.create({ lop_hoc_phan_id: data.id });
                  notification.success({ message: "Đăng ký thành công" });
                  setKeyRender(Math.random());
                }}
              />
            </Tooltip>
          )}
          {isAdmin && (
            <Tooltip title="Sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(data);
                  setOpen(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Toolbar
        hiddenCreate={!isAdmin}
        onCreate={() => {
          setEditing(undefined);
          setOpen(true);
        }}
        onReload={() => setKeyRender(Math.random())}
      />
      <BaseTable
        key={keyRender}
        columns={columns}
        api={academicApi.lopHocPhan.list}
        defaultParams={mode === "student-open" ? {} : undefined}
      />
      <LopHocPhanModal
        open={open}
        data={editing}
        onClose={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          setKeyRender(Math.random());
        }}
      />
    </>
  );
};

const DangKyTab = () => {
  const [keyRender, setKeyRender] = useState(1);
  const columns: ColDef[] = [
    { headerName: "Mã lớp", field: "lop_hoc_phan.ma_lop_hoc_phan" },
    { headerName: "Môn học", field: "lop_hoc_phan.mon_hoc.ten_mon_hoc", flex: 1 },
    { headerName: "Kỳ học", field: "lop_hoc_phan.hoc_ky.ten_hoc_ky" },
    { headerName: "Trạng thái", field: "trang_thai", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 120,
      cellRenderer: ({ data }: any) =>
        data?.trang_thai === "da_dang_ky" ? (
          <Tooltip title="Hủy đăng ký">
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              onClick={async () => {
                await academicApi.dangKy.cancel(data);
                notification.success({ message: "Đã hủy đăng ký" });
                setKeyRender(Math.random());
              }}
            />
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <>
      <Toolbar hiddenCreate onReload={() => setKeyRender(Math.random())} />
      <BaseTable key={keyRender} columns={columns} api={academicApi.dangKy.list} />
    </>
  );
};

const BangDiemTab: FC<{ readonly?: boolean }> = ({ readonly }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [keyRender, setKeyRender] = useState(1);
  const [editing, setEditing] = useState<any>();
  const [phucKhao, setPhucKhao] = useState<any>();
  const canGrade = currentUser?.vai_tro === ROLE_CODE.ADMIN || TEACHER_ROLES.includes(currentUser?.vai_tro || "");
  const isStudent = currentUser?.vai_tro === ROLE_CODE.STUDENT;

  const columns: ColDef[] = [
    { headerName: "Sinh viên", field: "sinh_vien.ho_ten", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "MSSV", field: "sinh_vien.mssv", width: 130 },
    { headerName: "Môn học", field: "lop_hoc_phan.mon_hoc.ten_mon_hoc", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Lớp HP", field: "lop_hoc_phan.ma_lop_hoc_phan", width: 130 },
    { headerName: "CC", field: "diem_chuyen_can", width: 90 },
    { headerName: "GK", field: "diem_giua_ky", width: 90 },
    { headerName: "CK", field: "diem_cuoi_ky", width: 90 },
    { headerName: "Tổng", field: "diem_tong_ket", width: 100 },
    { headerName: "Kết quả", field: "ket_qua", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    { headerName: "Trạng thái", field: "trang_thai", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 160,
      cellRenderer: ({ data }: any) => (
        <Space>
          {canGrade && !readonly && (
            <Tooltip title="Nhập điểm">
              <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(data)} />
            </Tooltip>
          )}
          {isStudent && (
            <Tooltip title="Phúc khảo">
              <Button type="text" icon={<FileSearchOutlined />} onClick={() => setPhucKhao(data)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Toolbar hiddenCreate onReload={() => setKeyRender(Math.random())} />
      <BaseTable key={keyRender} columns={columns} api={academicApi.bangDiem.list} />
      <DiemModal
        data={editing}
        onClose={() => setEditing(undefined)}
        onDone={() => {
          setEditing(undefined);
          setKeyRender(Math.random());
        }}
      />
      <PhucKhaoCreateModal data={phucKhao} onClose={() => setPhucKhao(undefined)} />
    </>
  );
};

const PhucKhaoTab: FC<{ readonly?: boolean }> = ({ readonly }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [keyRender, setKeyRender] = useState(1);
  const [resolveItem, setResolveItem] = useState<any>();
  const canResolve =
    !readonly && (currentUser?.vai_tro === ROLE_CODE.ADMIN || TEACHER_ROLES.includes(currentUser?.vai_tro || ""));

  const columns: ColDef[] = [
    { headerName: "Sinh viên", field: "sinh_vien.ho_ten", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Môn học", field: "lop_hoc_phan.mon_hoc.ten_mon_hoc", flex: 1 },
    { headerName: "Điểm cũ", field: "diem_cu", width: 100 },
    { headerName: "Điểm mới", field: "diem_moi", width: 100 },
    { headerName: "Nội dung", field: "noi_dung", flex: 1 },
    { headerName: "Trạng thái", field: "trang_thai", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 120,
      cellRenderer: ({ data }: any) =>
        canResolve && data?.trang_thai === "cho_xu_ly" ? (
          <Tooltip title="Xử lý">
            <Button type="text" icon={<EditOutlined />} onClick={() => setResolveItem(data)} />
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <>
      <Toolbar hiddenCreate onReload={() => setKeyRender(Math.random())} />
      <BaseTable key={keyRender} columns={columns} api={academicApi.phucKhao.list} />
      <PhucKhaoResolveModal
        data={resolveItem}
        onClose={() => setResolveItem(undefined)}
        onDone={() => {
          setResolveItem(undefined);
          setKeyRender(Math.random());
        }}
      />
    </>
  );
};

const ChuNhiemTab = () => {
  const [keyRender, setKeyRender] = useState(1);
  const [detail, setDetail] = useState<any>();
  const [loading, setLoading] = useState(false);

  const columns: ColDef[] = [
    { headerName: "MSSV", field: "mssv", width: 140, filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Họ tên", field: "ho_ten", flex: 1, filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Email", field: "email", flex: 1 },
    { headerName: "Lớp", field: "lop_hanh_chinh.ten_lop", width: 180 },
    { headerName: "Trạng thái", field: "trang_thai_hoc_tap", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 110,
      cellRenderer: ({ data }: any) => (
        <Tooltip title="Xem học vụ">
          <Button
            type="text"
            icon={<FileSearchOutlined />}
            onClick={async () => {
              setLoading(true);
              const res = await academicApi.chuNhiem.tongQuanSinhVien(data.id);
              setDetail(res.data.data);
              setLoading(false);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Toolbar hiddenCreate onReload={() => setKeyRender(Math.random())} />
      <BaseTable key={keyRender} columns={columns} api={academicApi.chuNhiem.sinhVien} />
      <Drawer title="Tổng quan học vụ" open={!!detail} onClose={() => setDetail(undefined)} width={720} loading={loading}>
        <StudentOverview data={detail} />
      </Drawer>
    </>
  );
};

const Toolbar: FC<{ hiddenCreate?: boolean; onCreate?: () => void; onReload?: () => void }> = ({
  hiddenCreate,
  onCreate,
  onReload,
}) => (
  <div className="d-flex justify-end gap-2 px-4 pb-2">
    {!hiddenCreate && (
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        Thêm mới
      </Button>
    )}
    <Button icon={<ReloadOutlined />} onClick={onReload}>
      Tải lại
    </Button>
  </div>
);

const HocKyModal: FC<{ open: boolean; data?: any; onClose: () => void; onDone: () => void }> = ({
  open,
  data,
  onClose,
  onDone,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(data || { diem_qua_mon_mac_dinh: 4, hoc_ky_so: 1, trang_thai: "du_kien" });
  }, [data, form, open]);

  return (
    <Modal
      open={open}
      title={data ? "Sửa kỳ học" : "Thêm kỳ học"}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Ghi"
      cancelText="Đóng"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          if (data) await academicApi.hocKy.edit({ ...data, ...values });
          else await academicApi.hocKy.create(values);
          notification.success({ message: "Lưu kỳ học thành công" });
          onDone();
        }}
      >
        <Form.Item name="ma_hoc_ky" label="Mã kỳ" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ten_hoc_ky" label="Tên kỳ" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="nam_hoc" label="Năm học" rules={[{ required: true }]}>
          <Input placeholder="2025-2026" />
        </Form.Item>
        <Form.Item name="hoc_ky_so" label="Kỳ số" rules={[{ required: true }]}>
          <InputNumber min={1} max={3} className="w-full" />
        </Form.Item>
        <Form.Item name="diem_qua_mon_mac_dinh" label="Điểm qua môn mặc định">
          <InputNumber min={0} max={10} step={0.1} className="w-full" />
        </Form.Item>
        <Form.Item name="trang_thai" label="Trạng thái">
          <Select
            options={[
              { value: "du_kien", label: "Dự kiến" },
              { value: "dang_dien_ra", label: "Đang diễn ra" },
              { value: "da_ket_thuc", label: "Đã kết thúc" },
            ]}
          />
        </Form.Item>
        <Space>
          <Form.Item name="dang_mo_dang_ky" label="Mở đăng ký" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="dang_mo_phuc_khao" label="Mở phúc khảo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

const LopHocPhanModal: FC<{ open: boolean; data?: any; onClose: () => void; onDone: () => void }> = ({
  open,
  data,
  onClose,
  onDone,
}) => {
  const [form] = Form.useForm();
  const [hocKy, setHocKy] = useState<any[]>([]);
  const [monHoc, setMonHoc] = useState<any[]>([]);
  const [giaoVien, setGiaoVien] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(data || { trang_thai: "dang_mo" });
    academicApi.hocKy.list({ itemsPerPage: 100 }).then((res) => setHocKy(res.data.list));
    monHocApi.list({ itemsPerPage: 100 } as any).then((res: any) => setMonHoc(res.data.list || res.data?.data?.data || []));
    giaoVienApi.list({ itemsPerPage: 100 } as any).then((res: any) => setGiaoVien(res.data.list || res.data?.data?.data || []));
  }, [data, form, open]);

  return (
    <Modal
      open={open}
      title={data ? "Sửa lớp học phần" : "Thêm lớp học phần"}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Ghi"
      cancelText="Đóng"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          if (data) await academicApi.lopHocPhan.edit({ ...data, ...values });
          else await academicApi.lopHocPhan.create(values);
          notification.success({ message: "Lưu lớp học phần thành công" });
          onDone();
        }}
      >
        <Form.Item name="hoc_ky_id" label="Kỳ học" rules={[{ required: true }]}>
          <Select options={hocKy.map((x) => ({ value: x.id, label: x.ten_hoc_ky }))} showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="mon_hoc_id" label="Môn học" rules={[{ required: true }]}>
          <Select options={monHoc.map((x) => ({ value: x.id, label: x.ten_mon_hoc }))} showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="giao_vien_bo_mon_id" label="Giáo viên bộ môn">
          <Select options={giaoVien.map((x) => ({ value: x.id, label: x.ho_ten }))} allowClear showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="ma_lop_hoc_phan" label="Mã lớp học phần" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ten_lop_hoc_phan" label="Tên lớp">
          <Input />
        </Form.Item>
        <Form.Item name="si_so_toi_da" label="Sĩ số tối đa">
          <InputNumber min={1} className="w-full" />
        </Form.Item>
        <Form.Item name="lich_hoc" label="Lịch học">
          <Input />
        </Form.Item>
        <Form.Item name="phong_hoc" label="Phòng học">
          <Input />
        </Form.Item>
        <Form.Item name="trang_thai" label="Trạng thái">
          <Select options={[{ value: "dang_mo", label: "Đang mở" }, { value: "da_dong", label: "Đã đóng" }]} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const DiemModal: FC<{ data?: any; onClose: () => void; onDone: () => void }> = ({ data, onClose, onDone }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data, form]);

  return (
    <Modal open={!!data} title="Nhập điểm" onCancel={onClose} onOk={() => form.submit()} okText="Ghi" cancelText="Đóng">
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await academicApi.bangDiem.edit({ ...data, ...values });
          notification.success({ message: "Đã cập nhật điểm" });
          onDone();
        }}
      >
        <Form.Item label="Sinh viên">
          <Input value={data?.sinh_vien?.ho_ten} disabled />
        </Form.Item>
        <Form.Item name="diem_chuyen_can" label="Điểm chuyên cần">
          <InputNumber min={0} max={10} step={0.1} className="w-full" />
        </Form.Item>
        <Form.Item name="diem_giua_ky" label="Điểm giữa kỳ">
          <InputNumber min={0} max={10} step={0.1} className="w-full" />
        </Form.Item>
        <Form.Item name="diem_cuoi_ky" label="Điểm cuối kỳ">
          <InputNumber min={0} max={10} step={0.1} className="w-full" />
        </Form.Item>
        <Form.Item name="diem_tong_ket" label="Điểm tổng kết">
          <InputNumber min={0} max={10} step={0.1} className="w-full" />
        </Form.Item>
        <Form.Item name="ghi_chu" label="Ghi chú">
          <Input.TextArea />
        </Form.Item>
        <Button
          icon={<SaveOutlined />}
          onClick={async () => {
            await academicApi.bangDiem.chot(data);
            notification.success({ message: "Đã chốt điểm" });
            onDone();
          }}
        >
          Chốt điểm
        </Button>
      </Form>
    </Modal>
  );
};

const PhucKhaoCreateModal: FC<{ data?: any; onClose: () => void }> = ({ data, onClose }) => {
  const [form] = Form.useForm();
  return (
    <Modal open={!!data} title="Gửi phúc khảo" onCancel={onClose} onOk={() => form.submit()} okText="Gửi" cancelText="Đóng">
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await academicApi.phucKhao.create({ bang_diem_id: data.id, ...values });
          notification.success({ message: "Đã gửi phúc khảo" });
          form.resetFields();
          onClose();
        }}
      >
        <Form.Item label="Môn học">
          <Input value={data?.lop_hoc_phan?.mon_hoc?.ten_mon_hoc} disabled />
        </Form.Item>
        <Form.Item name="noi_dung" label="Nội dung phúc khảo" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const PhucKhaoResolveModal: FC<{ data?: any; onClose: () => void; onDone: () => void }> = ({ data, onClose, onDone }) => {
  const [form] = Form.useForm();
  return (
    <Modal open={!!data} title="Xử lý phúc khảo" onCancel={onClose} onOk={() => form.submit()} okText="Ghi" cancelText="Đóng">
      <Form
        form={form}
        layout="vertical"
        initialValues={{ trang_thai: "chap_nhan" }}
        onFinish={async (values) => {
          await academicApi.phucKhao.resolve({ id: data.id, ...values });
          notification.success({ message: "Đã xử lý phúc khảo" });
          form.resetFields();
          onDone();
        }}
      >
        <Form.Item label="Nội dung">
          <Input.TextArea value={data?.noi_dung} disabled rows={3} />
        </Form.Item>
        <Form.Item name="trang_thai" label="Kết quả" rules={[{ required: true }]}>
          <Select options={[{ value: "chap_nhan", label: "Chấp nhận" }, { value: "tu_choi", label: "Từ chối" }]} />
        </Form.Item>
        <Form.Item name="diem_moi" label="Điểm mới">
          <InputNumber min={0} max={10} step={0.1} className="w-full" />
        </Form.Item>
        <Form.Item name="ket_qua_xu_ly" label="Ghi chú xử lý">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CauHinhTab = () => {
  const [keyRender, setKeyRender] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>();
  const columns: ColDef[] = [
    { headerName: "Key", field: "key", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Nhóm", field: "group" },
    { headerName: "Giá trị", field: "value.value" },
    { headerName: "Mô tả", field: "mo_ta", flex: 1 },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 120,
      cellRenderer: ({ data }: any) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => {
            setEditing(data);
            setOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Toolbar
        onCreate={() => {
          setEditing(undefined);
          setOpen(true);
        }}
        onReload={() => setKeyRender(Math.random())}
      />
      <BaseTable key={keyRender} columns={columns} api={academicApi.cauHinh.list} />
      <CauHinhModal
        open={open}
        data={editing}
        onClose={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          setKeyRender(Math.random());
        }}
      />
    </>
  );
};

const CauHinhModal: FC<{ open: boolean; data?: any; onClose: () => void; onDone: () => void }> = ({
  open,
  data,
  onClose,
  onDone,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      key: data?.key,
      group: data?.group || "academic",
      value: data?.value?.value,
      mo_ta: data?.mo_ta,
    });
  }, [data, form, open]);

  return (
    <Modal open={open} title="Cấu hình" onCancel={onClose} onOk={() => form.submit()} okText="Ghi" cancelText="Đóng">
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await academicApi.cauHinh.upsert({ ...values, value: { value: values.value } });
          notification.success({ message: "Đã lưu cấu hình" });
          onDone();
        }}
      >
        <Form.Item name="key" label="Key" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="group" label="Nhóm">
          <Input />
        </Form.Item>
        <Form.Item name="value" label="Giá trị">
          <Input />
        </Form.Item>
        <Form.Item name="mo_ta" label="Mô tả">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const StudentOverview: FC<{ data?: any }> = ({ data }) => {
  if (!data) return null;

  const renderTags = (items: any[], color: string) => (
    <Space wrap>
      {(items || []).map((item: any) => (
        <Tag key={item.id || item.mon_hoc?.id} color={color}>
          {item.lop_hoc_phan?.mon_hoc?.ten_mon_hoc || item.ten_mon_hoc || item.mon_hoc?.ten_mon_hoc}
        </Tag>
      ))}
    </Space>
  );

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Sinh viên">{data.sinh_vien?.ho_ten}</Descriptions.Item>
        <Descriptions.Item label="MSSV">{data.sinh_vien?.mssv}</Descriptions.Item>
        <Descriptions.Item label="Lớp">{data.sinh_vien?.lop_hanh_chinh?.ten_lop}</Descriptions.Item>
      </Descriptions>
      <div>
        <b>Môn đang học</b>
        <div className="mt-2">{renderTags(data.mon_dang_hoc, "blue")}</div>
      </div>
      <div>
        <b>Môn đã qua</b>
        <div className="mt-2">{renderTags(data.mon_da_qua, "green")}</div>
      </div>
      <div>
        <b>Môn bị trượt</b>
        <div className="mt-2">{renderTags(data.mon_bi_truot, "red")}</div>
      </div>
      <div>
        <b>Môn còn nợ</b>
        <div className="mt-2">{renderTags(data.mon_con_no, "gold")}</div>
      </div>
    </Space>
  );
};
