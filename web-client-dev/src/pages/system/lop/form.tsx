/* full code with delete button added to each selected list */

import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Tabs,
  Table,
  Select,
  Typography,
  Button,
  message,
} from "antd";
import PageContainer from "@/Layout/PageContainer";
import giaoVienApi from "@/api/giaoVien/giaoVien.api";
import sinhVienApi from "@/api/sinhVien/sinhVien.api";
import deThiApi from "@/api/deThi/deThi.api";
import { sdk } from "@/api/axios";
import { useParams } from "react-router-dom";
import lopApi from "@/api/lop/lop.api";
import { useAppSelector } from "@/stores/hook";
import { getAuthUser } from "@/stores/features/auth";

const { TabPane } = Tabs;
const { Search } = Input;
const { Title } = Typography;

type Teacher = { id: number; ho_ten: string; email: string };
type Student = { id: number; mssv: string; ho_ten: string };
type Exam = { id: number; code: string; do_kho: number; loai_thi_id: string, loai_thi: any };
type RoleMap = Record<number, string>;

export default function ClassroomManagement() {
  const {id} = useParams();
  const authUser = useAppSelector(getAuthUser);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherKeys, setSelectedTeacherKeys] = useState<React.Key[]>([]);
  const [teacherRoles, setTeacherRoles] = useState<RoleMap>({});

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudentKeys, setSelectedStudentKeys] = useState<React.Key[]>([]);
  const [studentTypes, setStudentTypes] = useState<RoleMap>({});

  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [selectedExamKeys, setSelectedExamKeys] = useState<React.Key[]>([]);

  const mergeUniqueById = <T extends { id: number }>(list: T[]): T[] => {
    const map = new Map<number, T>();
    list.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  };

  useEffect(() => {
    if(!id) return;
    const getDetail = async () => {
      const res = await lopApi.show(id);
      console.log("🚀 ~ getDetail ~ res:", res)
      const data = res.data;

      // 1. Sinh viên
      const studentIds = data.sinh_vien.map((sv: any) => sv.id);
      setSelectedStudentKeys(studentIds);
      setAllStudents(data.sinh_vien);
      const newTypes: Record<number, string> = {};
      data.sinh_vien.forEach((sv: any) => {
        newTypes[sv.id] = sv.type || "chinh-thuc";
      });
      setStudentTypes(newTypes);

      // 2. Giáo viên
      const teacherIds = data.giao_vien.map((gv: any) => gv.id);
      setSelectedTeacherKeys(teacherIds);
      setAllTeachers(data.giao_vien);
      const newRoles: Record<number, string> = {};
      data.giao_vien.forEach((gv: any) => {
        newRoles[gv.id] = gv.role || "giang-day";
      });
      setTeacherRoles(newRoles);

      // 3. Đề thi
      const examIds = data.de_thi.map((dt: any) => dt.id);
      setSelectedExamKeys(examIds);
      setAllExams(data.de_thi);
    }
    getDetail()
  }, [id])

  const handleSearchTeacher = async (keyword: string) => {
    try {
      const result = await giaoVienApi.list({ search: keyword });
      setAllTeachers((prev) => mergeUniqueById([...prev, ...result.data.list]));
      setFilteredTeachers(result.data.list);
    } catch {
      message.error("Không thể tìm giáo viên");
    }
  };

  const handleSearchStudent = async (keyword: string) => {
    try {
      const result = await sinhVienApi.list({ search: keyword });
      setAllStudents((prev) => mergeUniqueById([...prev, ...result.data.list]));
      setFilteredStudents(result.data.list);
    } catch {
      message.error("Không thể tìm sinh viên");
    }
  };

  const handleSearchExam = async (keyword: string) => {
    try {
      const result = await deThiApi.list({ search: keyword });
      setAllExams((prev) => mergeUniqueById([...prev, ...result.data]));
      setFilteredExams(result.data);
    } catch {
      message.error("Không thể tìm đề thi");
    }
  };

  const getSelectedTeachers = () =>
    allTeachers
      .filter((t) => selectedTeacherKeys.includes(t.id))
      .map((t) => ({ ...t, role: teacherRoles[t.id] }));

  const getSelectedStudents = () =>
    allStudents
      .filter((s) => selectedStudentKeys.includes(s.id))
      .map((s) => ({ ...s, type: studentTypes[s.id] }));

  const getSelectedExams = () =>
    allExams.filter((e) => selectedExamKeys.includes(e.id));

  const teacherRowSelection = {
    selectedRowKeys: selectedTeacherKeys,
    onChange: (_: React.Key[], selectedRows: Teacher[]) => {
      const merged = mergeUniqueById(
        allTeachers.filter((t) => selectedTeacherKeys.includes(t.id)).concat(selectedRows)
      );
      setAllTeachers(merged);
      const keys = merged.map((t) => t.id);
      setSelectedTeacherKeys(keys);
      setTeacherRoles((prev) => {
        const updated = { ...prev };
        keys.forEach((id) => {
          if (!updated[id]) updated[id] = "giang-day";
        });
        return updated;
      });
    },
  };

  const studentRowSelection = {
    selectedRowKeys: selectedStudentKeys,
    onChange: (_: React.Key[], selectedRows: Student[]) => {
      const merged = mergeUniqueById(
        allStudents.filter((s) => selectedStudentKeys.includes(s.id)).concat(selectedRows)
      );
      setAllStudents(merged);
      const keys = merged.map((s) => s.id);
      setSelectedStudentKeys(keys);
      setStudentTypes((prev) => {
        const updated = { ...prev };
        keys.forEach((id) => {
          if (!updated[id]) updated[id] = "chinh-thuc";
        });
        return updated;
      });
    },
  };

  const examRowSelection = {
    selectedRowKeys: selectedExamKeys,
    onChange: (_: React.Key[], selectedRows: Exam[]) => {
      const allSelected = allExams
        .filter((e) => selectedExamKeys.includes(e.id))
        .concat(selectedRows);
      const seen = new Set<string>();
      const valid: Exam[] = [];
      for (const exam of allSelected) {
        const key = `${exam.loai_thi_id}-${exam.do_kho}`;
        if (!seen.has(key)) {
          seen.add(key);
          valid.push(exam);
        } else {
          message.warning(`Đã chọn đề ${exam.loai_thi.ten_loai} với độ khó ${exam.do_kho}`);
        }
      }
      setAllExams((prev) => mergeUniqueById([...prev, ...valid]));
      setSelectedExamKeys(valid.map((e) => e.id));
    },
  };

  const handleSubmit = async () => {
    const params = {
      de_thi: getSelectedExams(),
      giao_vien: getSelectedTeachers(),
      sinh_vien: getSelectedStudents()
    }
    try {
    const res = await sdk.put(`phan-cong-lop/${id}`, params);
    message.success(res.data.message)
    } catch (err) {
      message.error("Thất bại")
    }
  }

  return (
    <PageContainer title="Quản lý lớp">
      <Card title="Quản lý lớp học">
        <Tabs defaultActiveKey="teachers">
          <TabPane tab="Giáo viên" key="teachers">
            {authUser && authUser?.vai_tro === 'admin' && (
              <>
                <Search className="mb-4" onSearch={handleSearchTeacher} />
            <Table
              rowSelection={teacherRowSelection}
              rowKey="id"
              dataSource={filteredTeachers}
              columns={[
                { title: "Tên", dataIndex: "ho_ten" },
                { title: "Email", dataIndex: "email" },
                {
                  title: "Vai trò",
                  render: (_, record) => (
                    <Select
                      value={teacherRoles[record.id]}
                      onChange={(value) =>
                        setTeacherRoles((prev) => ({ ...prev, [record.id]: value }))
                      }
                      style={{ width: 120 }}
                    >
                      <Select.Option value="chu-nhiem">Chủ nhiệm</Select.Option>
                      <Select.Option value="giang-day">Giảng dạy</Select.Option>
                      <Select.Option value="tro-giang">Trợ giảng</Select.Option>
                    </Select>
                  ),
                },
              ]}
            />
              </>
            )}

            <Title className="mt-4" level={5}>Danh sách giáo viên</Title>
            <Table rowKey="id" dataSource={getSelectedTeachers()} columns={[
              { title: "Tên", dataIndex: "ho_ten" },
              { title: "Email", dataIndex: "email" },
              { title: "Vai trò", dataIndex: "role" },
              {
                title: "Hành động",
                render: (_, record) => {
                  return authUser && authUser?.vai_tro === 'admin' ?  (<Button
                    type="primary"
                    danger
                    onClick={() => setSelectedTeacherKeys((prev) => prev.filter((id) => id !== record.id))}
                  >
                    Xóa
                  </Button>) : <div></div>
                }
              },
            ]} pagination={false} />
          </TabPane>

          <TabPane tab="Sinh viên" key="students">
            <Search onSearch={handleSearchStudent} />
            <Table
              rowSelection={studentRowSelection}
              rowKey="id"
              dataSource={filteredStudents}
              columns={[
                { title: "MSSV", dataIndex: "mssv" },
                { title: "Họ tên", dataIndex: "ho_ten" },
                {
                  title: "Loại",
                  render: (_, record) => (
                    <Select
                      value={studentTypes[record.id]}
                      onChange={(value) =>
                        setStudentTypes((prev) => ({ ...prev, [record.id]: value }))
                      }
                      style={{ width: 120 }}
                    >
                      <Select.Option value="chinh-thuc">Chính thức</Select.Option>
                      <Select.Option value="du-thinh">Dự thính</Select.Option>
                    </Select>
                  ),
                },
              ]}
            />
            <Title level={5}>Sinh viên đã chọn</Title>
            <Table rowKey="id" dataSource={getSelectedStudents()} columns={[
              { title: "MSSV", dataIndex: "mssv" },
              { title: "Tên", dataIndex: "ho_ten" },
              { title: "Loại", dataIndex: "type" },
              {
                title: "Hành động",
                render: (_, record) => (
                  <Button
                    danger
                    onClick={() => setSelectedStudentKeys((prev) => prev.filter((id) => id !== record.id))}
                  >
                    Xóa
                  </Button>
                ),
              },
            ]} pagination={false} />
          </TabPane>

          <TabPane tab="Đề thi" key="exams">
            <Search onSearch={handleSearchExam} />
            <Table
              rowSelection={examRowSelection}
              rowKey="id"
              dataSource={filteredExams}
              columns={[
                { title: "Tên đề", dataIndex: "code" },
                { title: "Độ khó", dataIndex: "do_kho" },
                { title: "Loại đề", dataIndex: "loai_thi_id", render: (_, record) => (<div>{record.loai_thi.ten_loai}</div>) },
              ]}
            />
            <Title level={5}>Đề thi đã chọn</Title>
            <Table rowKey="id" dataSource={getSelectedExams()} columns={[
              { title: "Tên đề", dataIndex: "code" },
              { title: "Độ khó", dataIndex: "do_kho" },
              { title: "Loại", dataIndex: "loai_thi_id", render: (_, record) => (<div>{record.loai_thi.ten_loai}</div>) },
              {
                title: "Hành động",
                render: (_, record) => (
                  <Button
                    danger
                    onClick={() => setSelectedExamKeys((prev) => prev.filter((id) => id !== record.id))}
                  >
                    Xóa
                  </Button>
                ),
              },
            ]} pagination={false} />
          </TabPane>
        </Tabs>
      </Card>
      <div className="flex float-right gap-2 mt-6">
        <Button onClick={() =>window.history.back()}>Hủy</Button>
        <Button type="primary" onClick={handleSubmit}>Xác nhận</Button>
      </div>
    </PageContainer>
  );
}
