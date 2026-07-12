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
  TeamOutlined,
} from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import {
  Button,
  Checkbox,
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
import { FC, ReactNode, useEffect, useMemo, useState } from "react";

const AcademicPage = () => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const role = currentUser?.vai_tro;

  const items = useMemo(() => {
    if (role === ROLE_CODE.ADMIN) {
      return [
        { key: "hoc-ky", label: "Kỳ học", children: <HocKyTab /> },
        { key: "lop-hoc-phan", label: "Lớp học phần", children: <LopHocPhanTab /> },
        { key: "lop-hanh-chinh", label: "Lớp chủ nhiệm", children: <LopHanhChinhTab /> },
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

    return [
      { key: "lop-hoc-phan", label: "Lớp giảng dạy", children: <LopHocPhanTab mode="teacher" /> },
      { key: "bang-diem", label: "Chấm điểm", children: <BangDiemTab /> },
      { key: "phuc-khao", label: "Phúc khảo", children: <PhucKhaoTab /> },
      { key: "chu-nhiem", label: "Chủ nhiệm", children: <ChuNhiemTab /> },
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
      <TableFrame>
        <BaseTable key={keyRender} columns={columns} api={academicApi.hocKy.list} />
      </TableFrame>
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
  const [detail, setDetail] = useState<any>();
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
          <Tooltip title="Danh sách sinh viên, điểm, phúc khảo">
            <Button type="text" icon={<FileSearchOutlined />} onClick={() => setDetail(data)} />
          </Tooltip>
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
      <TableFrame>
        <BaseTable
          key={keyRender}
          columns={columns}
          api={academicApi.lopHocPhan.list}
          defaultParams={mode === "student-open" ? {} : undefined}
        />
      </TableFrame>
      <LopHocPhanModal
        open={open}
        data={editing}
        onClose={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          setKeyRender(Math.random());
        }}
      />
      <LopHocPhanDetailDrawer data={detail} onClose={() => setDetail(undefined)} />
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
      <TableFrame>
        <BaseTable key={keyRender} columns={columns} api={academicApi.dangKy.list} />
      </TableFrame>
    </>
  );
};

const LopHanhChinhTab = () => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [keyRender, setKeyRender] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>();
  const [studentClass, setStudentClass] = useState<any>();
  const isAdmin = currentUser?.vai_tro === ROLE_CODE.ADMIN;

  const columns: ColDef[] = [
    { headerName: "Mã lớp", field: "ma_lop", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Tên lớp", field: "ten_lop", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Ngành", field: "nganh" },
    { headerName: "Khóa", field: "khoa" },
    { headerName: "Giáo viên chủ nhiệm", field: "giao_vien_chu_nhiem.ho_ten", flex: 1 },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 150,
      cellRenderer: ({ data }: any) => (
        <Space>
          <Tooltip title="Sinh viên trong lớp">
            <Button type="text" icon={<TeamOutlined />} onClick={() => setStudentClass(data)} />
          </Tooltip>
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
      <TableFrame>
        <BaseTable key={keyRender} columns={columns} api={academicApi.lopHanhChinh.list} />
      </TableFrame>
      <LopHanhChinhModal
        open={open}
        data={editing}
        onClose={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          setKeyRender(Math.random());
        }}
      />
      <LopHanhChinhStudentsDrawer data={studentClass} onClose={() => setStudentClass(undefined)} />
    </>
  );
};

const BangDiemTab: FC<{ readonly?: boolean; lopHocPhanId?: number }> = ({ readonly, lopHocPhanId }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [keyRender, setKeyRender] = useState(1);
  const [editing, setEditing] = useState<any>();
  const [phucKhao, setPhucKhao] = useState<any>();
  const isStudent = currentUser?.vai_tro === ROLE_CODE.STUDENT;
  const canGradeRow = (row: any) =>
    currentUser?.vai_tro === ROLE_CODE.ADMIN || row?.lop_hoc_phan?.giao_vien_bo_mon_id === currentUser?.info?.id;

  const columns: ColDef[] = [
    { headerName: "Sinh viên", field: "sinh_vien.ho_ten", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "MSSV", field: "sinh_vien.mssv", width: 130 },
    { headerName: "Môn học", field: "lop_hoc_phan.mon_hoc.ten_mon_hoc", filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Lớp học phần", field: "lop_hoc_phan.ma_lop_hoc_phan", width: 150 },
    { headerName: "Chuyên cần", field: "diem_chuyen_can", width: 130 },
    { headerName: "Giữa kỳ", field: "diem_giua_ky", width: 120 },
    { headerName: "Cuối kỳ", field: "diem_cuoi_ky", width: 120 },
    { headerName: "Tổng kết", field: "diem_tong_ket", width: 120 },
    { headerName: "Kết quả", field: "ket_qua", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    { headerName: "Trạng thái", field: "trang_thai", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 160,
      cellRenderer: ({ data }: any) => (
        <Space>
          {canGradeRow(data) && !readonly && (
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
      <TableFrame>
        <BaseTable
          key={`${keyRender}-${lopHocPhanId ?? "all"}`}
          columns={columns}
          api={academicApi.bangDiem.list}
          defaultParams={lopHocPhanId ? { lop_hoc_phan_id: lopHocPhanId } : undefined}
        />
      </TableFrame>
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

const PhucKhaoTab: FC<{ readonly?: boolean; lopHocPhanId?: number }> = ({ readonly, lopHocPhanId }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [keyRender, setKeyRender] = useState(1);
  const [resolveItem, setResolveItem] = useState<any>();
  const canResolveRow = (row: any) =>
    !readonly &&
    (currentUser?.vai_tro === ROLE_CODE.ADMIN || row?.lop_hoc_phan?.giao_vien_bo_mon_id === currentUser?.info?.id);

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
        canResolveRow(data) && data?.trang_thai === "cho_xu_ly" ? (
          <Tooltip title="Xử lý">
            <Button type="text" icon={<EditOutlined />} onClick={() => setResolveItem(data)} />
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <>
      <Toolbar hiddenCreate onReload={() => setKeyRender(Math.random())} />
      <TableFrame>
        <BaseTable
          key={`${keyRender}-${lopHocPhanId ?? "all"}`}
          columns={columns}
          api={academicApi.phucKhao.list}
          defaultParams={lopHocPhanId ? { lop_hoc_phan_id: lopHocPhanId } : undefined}
        />
      </TableFrame>
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
      <TableFrame>
        <BaseTable key={keyRender} columns={columns} api={academicApi.chuNhiem.sinhVien} />
      </TableFrame>
      <StudentOverviewModal
        open={!!detail}
        loading={loading}
        data={detail}
        onClose={() => setDetail(undefined)}
      />
    </>
  );
};

const LopHanhChinhStudentsDrawer: FC<{ data?: any; onClose: () => void }> = ({ data, onClose }) => {
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const [keyRender, setKeyRender] = useState(1);
  const [detail, setDetail] = useState<any>();
  const [assignOpen, setAssignOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canManage =
    currentUser?.vai_tro === ROLE_CODE.ADMIN || data?.giao_vien_chu_nhiem_id === currentUser?.info?.id;

  const columns: ColDef[] = [
    { headerName: "MSSV", field: "mssv", width: 140, filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Họ tên", field: "ho_ten", flex: 1, filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Email", field: "email", flex: 1 },
    { headerName: "Trạng thái", field: "trang_thai_hoc_tap", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    {
      headerName: "Hành động",
      pinned: "right",
      width: 150,
      cellRenderer: ({ data: row }: any) => (
        <Space>
          <Tooltip title="Xem học vụ">
            <Button
              type="text"
              icon={<FileSearchOutlined />}
              onClick={async () => {
                setLoading(true);
                const res = await academicApi.chuNhiem.tongQuanSinhVien(row.id);
                setDetail(res.data.data);
                setLoading(false);
              }}
            />
          </Tooltip>
          {canManage && data?.id && (
            <Tooltip title="Bỏ khỏi lớp">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={async () => {
                  await academicApi.chuNhiem.removeSinhVien(data.id, row.id);
                  notification.success({ message: "Đã bỏ sinh viên khỏi lớp" });
                  setKeyRender(Math.random());
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
      <Drawer
        title={data ? `Sinh viên lớp ${data.ten_lop || data.ma_lop}` : "Sinh viên trong lớp"}
        open={!!data}
        onClose={onClose}
        width={920}
      >
        <Toolbar
          hiddenCreate={!canManage}
          onCreate={() => setAssignOpen(true)}
          onReload={() => setKeyRender(Math.random())}
        />
        <TableFrame>
          <BaseTable
            key={`${keyRender}-${data?.id ?? "none"}`}
            columns={columns}
            api={academicApi.chuNhiem.sinhVien}
            defaultParams={data?.id ? { lop_hanh_chinh_id: data.id } : undefined}
          />
        </TableFrame>
      </Drawer>
      <AssignClassStudentsModal
        open={assignOpen}
        lop={data}
        onClose={() => setAssignOpen(false)}
        onDone={() => {
          setAssignOpen(false);
          setKeyRender(Math.random());
        }}
      />
      <StudentOverviewModal
        open={!!detail}
        loading={loading}
        data={detail}
        onClose={() => setDetail(undefined)}
      />
    </>
  );
};

const AssignClassStudentsModal: FC<{ open: boolean; lop?: any; onClose: () => void; onDone: () => void }> = ({
  open,
  lop,
  onClose,
  onDone,
}) => {
  const [assignForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [students, setStudents] = useState<any[]>([]);
  const [mode, setMode] = useState("existing");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Array<number | string>>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!open || !lop?.id) return;

    assignForm.resetFields();
    createForm.resetFields();
    setMode("existing");
    setKeyword("");
    setSelectedStudentIds([]);
    academicApi.chuNhiem
      .sinhVien({ available_for_lop_hanh_chinh_id: lop.id, itemsPerPage: 200 })
      .then((res) => setStudents(res.data.list || []));
  }, [assignForm, createForm, lop?.id, open]);

  const filteredStudents = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return students;

    return students.filter((student) =>
      [student.mssv, student.ho_ten, student.email].some((value) =>
        String(value || "").toLowerCase().includes(normalizedKeyword)
      )
    );
  }, [keyword, students]);

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedStudentIds.includes(student.id)),
    [selectedStudentIds, students]
  );

  return (
    <Modal
      centered
      open={open}
      title={lop ? `Thêm sinh viên vào ${lop.ten_lop || lop.ma_lop}` : "Thêm sinh viên vào lớp"}
      onCancel={onClose}
      onOk={() => {
        if (mode === "existing") {
          assignForm.setFieldsValue({ sinh_vien_ids: selectedStudentIds });
        }
        (mode === "existing" ? assignForm : createForm).submit();
      }}
      okText="Thêm"
      cancelText="Đóng"
      width="min(920px, calc(100vw - 32px))"
    >
      <Tabs
        activeKey={mode}
        onChange={setMode}
        tabBarGutter={24}
        moreIcon={null}
        className="[&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-list]:min-w-max"
        items={[
          {
            key: "existing",
            label: "Chọn sinh viên có sẵn",
            children: (
              <Form
                form={assignForm}
                layout="vertical"
                onFinish={async (values) => {
                  await academicApi.chuNhiem.assignSinhVien(lop.id, values.sinh_vien_ids);
                  notification.success({ message: "Đã thêm sinh viên vào lớp" });
                  onDone();
                }}
              >
                <Form.Item
                  name="sinh_vien_ids"
                  rules={[
                    {
                      validator: () =>
                        selectedStudentIds.length
                          ? Promise.resolve()
                          : Promise.reject(new Error("Vui lòng chọn ít nhất một sinh viên")),
                    },
                  ]}
                >
                  <Input type="hidden" />
                </Form.Item>
                <div className="rounded border border-solid border-[#e5e7eb] bg-[#fafafa] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Input.Search
                      allowClear
                      placeholder="Tìm theo MSSV, họ tên, email"
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                    />
                    <Tag color="red" className="m-0 shrink-0">
                      {selectedStudentIds.length} đã chọn
                    </Tag>
                  </div>
                  <div className="max-h-[280px] overflow-auto rounded bg-white">
                    {filteredStudents.length ? (
                      filteredStudents.map((student) => {
                        const checked = selectedStudentIds.includes(student.id);
                        return (
                          <label
                            key={student.id}
                            className={`mb-0 flex cursor-pointer items-center gap-3 border-0 border-b border-solid border-[#f0f0f0] px-3 py-2 transition ${
                              checked ? "bg-[#fff1f0]" : "bg-white hover:bg-[#fafafa]"
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              onChange={(event) => {
                                setSelectedStudentIds((current) =>
                                  event.target.checked
                                    ? [...current, student.id]
                                    : current.filter((id) => id !== student.id)
                                );
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium text-[#111827]">{student.ho_ten}</div>
                              <div className="truncate text-xs text-[#6b7280]">
                                {student.mssv || "Chưa có MSSV"} · {student.email || "Chưa có email"}
                              </div>
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <div className="px-3 py-8 text-center text-[#6b7280]">Không có sinh viên phù hợp</div>
                    )}
                  </div>
                  {!!selectedStudents.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedStudents.map((student) => (
                        <Tag
                          key={student.id}
                          closable
                          onClose={() =>
                            setSelectedStudentIds((current) => current.filter((id) => id !== student.id))
                          }
                        >
                          {student.mssv} - {student.ho_ten}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </Form>
            ),
          },
          {
            key: "create",
            label: "Tạo sinh viên mới",
            children: (
              <Form
                form={createForm}
                layout="vertical"
                initialValues={{ password: "12345678" }}
                onFinish={async (values) => {
                  await academicApi.chuNhiem.createSinhVien(lop.id, values);
                  notification.success({ message: "Đã tạo sinh viên trong lớp" });
                  onDone();
                }}
              >
                <Form.Item name="mssv" label="MSSV" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu">
                  <Input.Password />
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};

const LopHocPhanDetailDrawer: FC<{ data?: any; onClose: () => void }> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <Drawer
      title={`Lớp học phần ${data.ma_lop_hoc_phan || ""}`}
      open={!!data}
      onClose={onClose}
      width="min(1320px, calc(100vw - 32px))"
    >
      <Tabs
        tabBarGutter={28}
        className="[&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-list]:min-w-max"
        items={[
          {
            key: "dang-ky",
            label: "Sinh viên đăng ký",
            children: <DangKyLopHocPhanTable lopHocPhanId={data.id} />,
          },
          {
            key: "bang-diem",
            label: "Bảng điểm",
            children: <BangDiemTab lopHocPhanId={data.id} />,
          },
          {
            key: "phuc-khao",
            label: "Phúc khảo",
            children: <PhucKhaoTab lopHocPhanId={data.id} />,
          },
        ]}
      />
    </Drawer>
  );
};

const DangKyLopHocPhanTable: FC<{ lopHocPhanId: number }> = ({ lopHocPhanId }) => {
  const [keyRender, setKeyRender] = useState(1);
  const columns: ColDef[] = [
    { headerName: "MSSV", field: "sinh_vien.mssv", width: 140 },
    { headerName: "Sinh viên", field: "sinh_vien.ho_ten", flex: 1, filter: "agTextColumnFilter", floatingFilter: true },
    { headerName: "Email", field: "sinh_vien.email", flex: 1 },
    { headerName: "Trạng thái", field: "trang_thai", cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    { headerName: "Ghi chú", field: "ghi_chu", flex: 1 },
  ];

  return (
    <>
      <Toolbar hiddenCreate onReload={() => setKeyRender(Math.random())} />
      <TableFrame>
        <BaseTable
          key={`${keyRender}-${lopHocPhanId}`}
          columns={columns}
          api={academicApi.dangKy.list}
          defaultParams={{ lop_hoc_phan_id: lopHocPhanId }}
        />
      </TableFrame>
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
      centered
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
      centered
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

const LopHanhChinhModal: FC<{ open: boolean; data?: any; onClose: () => void; onDone: () => void }> = ({
  open,
  data,
  onClose,
  onDone,
}) => {
  const [form] = Form.useForm();
  const [giaoVien, setGiaoVien] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(data || {});
    giaoVienApi.list({ itemsPerPage: 100 } as any).then((res: any) => setGiaoVien(res.data.list || res.data?.data?.data || []));
  }, [data, form, open]);

  return (
    <Modal
      centered
      open={open}
      title={data ? "Sửa lớp chủ nhiệm" : "Thêm lớp chủ nhiệm"}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Ghi"
      cancelText="Đóng"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          if (data) await academicApi.lopHanhChinh.edit({ ...data, ...values });
          else await academicApi.lopHanhChinh.create(values);
          notification.success({ message: "Lưu lớp chủ nhiệm thành công" });
          onDone();
        }}
      >
        <Form.Item name="ma_lop" label="Mã lớp" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ten_lop" label="Tên lớp" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="giao_vien_chu_nhiem_id" label="Giáo viên chủ nhiệm">
          <Select options={giaoVien.map((x) => ({ value: x.id, label: x.ho_ten }))} allowClear showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="nganh" label="Ngành">
          <Input />
        </Form.Item>
        <Form.Item name="khoa" label="Khóa">
          <Input placeholder="2025-2029" />
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
    <Modal centered open={!!data} title="Nhập điểm" onCancel={onClose} onOk={() => form.submit()} okText="Ghi" cancelText="Đóng">
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
    <Modal centered open={!!data} title="Gửi phúc khảo" onCancel={onClose} onOk={() => form.submit()} okText="Gửi" cancelText="Đóng">
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
    <Modal centered open={!!data} title="Xử lý phúc khảo" onCancel={onClose} onOk={() => form.submit()} okText="Ghi" cancelText="Đóng">
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
      <TableFrame>
        <BaseTable key={keyRender} columns={columns} api={academicApi.cauHinh.list} />
      </TableFrame>
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
    <Modal centered open={open} title="Cấu hình" onCancel={onClose} onOk={() => form.submit()} okText="Ghi" cancelText="Đóng">
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

const StudentOverviewModal: FC<{ open: boolean; loading?: boolean; data?: any; onClose: () => void }> = ({
  open,
  loading,
  data,
  onClose,
}) => (
  <Modal
    centered
    open={open}
    title="Tổng quan học vụ"
    onCancel={onClose}
    footer={null}
    width="min(1120px, calc(100vw - 32px))"
  >
    {loading ? <div className="py-10 text-center text-[#6b7280]">Đang tải...</div> : <StudentOverview data={data} />}
  </Modal>
);

const StudentOverview: FC<{ data?: any }> = ({ data }) => {
  if (!data) return null;

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
        <Descriptions.Item label="Sinh viên">{data.sinh_vien?.ho_ten}</Descriptions.Item>
        <Descriptions.Item label="MSSV">{data.sinh_vien?.mssv}</Descriptions.Item>
        <Descriptions.Item label="Lớp">{data.sinh_vien?.lop_hanh_chinh?.ten_lop}</Descriptions.Item>
      </Descriptions>
      <Tabs
        tabBarGutter={24}
        className="[&_.ant-tabs-nav]:mb-3 [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-list]:min-w-max"
        items={[
          {
            key: "dang-hoc",
            label: <OverviewTabLabel title="Môn đang học" count={data.mon_dang_hoc?.length || 0} color="blue" />,
            children: <OverviewSubjectTable items={data.mon_dang_hoc} />,
          },
          {
            key: "da-qua",
            label: <OverviewTabLabel title="Môn đã qua" count={data.mon_da_qua?.length || 0} color="green" />,
            children: <OverviewSubjectTable items={data.mon_da_qua} />,
          },
          {
            key: "bi-truot",
            label: <OverviewTabLabel title="Môn bị trượt" count={data.mon_bi_truot?.length || 0} color="red" />,
            children: <OverviewSubjectTable items={data.mon_bi_truot} />,
          },
          {
            key: "con-no",
            label: <OverviewTabLabel title="Môn còn nợ" count={data.mon_con_no?.length || 0} color="gold" />,
            children: <OverviewSubjectTable items={data.mon_con_no} />,
          },
        ]}
      />
    </Space>
  );
};

const OverviewTabLabel: FC<{ title: string; count: number; color: string }> = ({ title, count, color }) => (
  <Space size={6}>
    <span>{title}</span>
    <Tag color={color} className="m-0">
      {count}
    </Tag>
  </Space>
);

const OverviewSubjectTable: FC<{ items?: any[] }> = ({ items = [] }) => {
  const rows = items.map((item, index) => {
    const lopHocPhan = item.lop_hoc_phan;
    const monHoc = item.mon_hoc || lopHocPhan?.mon_hoc || item;
    const hocKy = item.hoc_ky || lopHocPhan?.hoc_ky;

    return {
      id: item.id || item.dang_ky_id || monHoc?.id || index,
      ma_mon: monHoc?.ma,
      ten_mon_hoc: monHoc?.ten_mon_hoc,
      lop_hoc_phan: lopHocPhan?.ma_lop_hoc_phan || lopHocPhan?.ten_lop_hoc_phan,
      hoc_ky: hocKy?.ten_hoc_ky,
      diem_tong_ket: item.diem_tong_ket,
      ket_qua: item.ket_qua,
      trang_thai: item.trang_thai,
    };
  });

  const columns: ColDef[] = [
    { headerName: "Mã môn", field: "ma_mon", width: 120 },
    { headerName: "Môn học", field: "ten_mon_hoc", flex: 1, minWidth: 180 },
    { headerName: "Lớp học phần", field: "lop_hoc_phan", width: 150 },
    { headerName: "Kỳ học", field: "hoc_ky", width: 150 },
    { headerName: "Điểm tổng kết", field: "diem_tong_ket", width: 140 },
    { headerName: "Kết quả", field: "ket_qua", width: 130, cellRenderer: (p: any) => <StatusTag value={p.value} /> },
    { headerName: "Trạng thái", field: "trang_thai", width: 140, cellRenderer: (p: any) => <StatusTag value={p.value} /> },
  ];

  return (
    <div>
      <div style={{ height: rows.length ? Math.min(420, 112 + rows.length * 42) : 220 }} className="w-full">
        <BaseTable
          key={`overview-${rows.length}`}
          columns={columns}
          api={async () =>
            ({
              data: {
                list: rows,
                pagination: {
                  count: rows.length,
                  hasMoreItems: false,
                  itemsPerPage: rows.length || 10,
                  page: 1,
                  total: rows.length,
                  totalPage: 1,
                },
              },
            }) as any
          }
        />
      </div>
    </div>
  );
};

const TableFrame: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ height: "calc(100vh - 260px)", minHeight: 420 }} className="w-full">
    {children}
  </div>
);
