import { getKiHienGio } from "@/stores/features/config";
import { useAppSelector } from "@/stores/hook";
import { RightOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Row, Select, Table, Tooltip, Typography, notification } from "antd";
import Column from "antd/es/table/Column";
import { FC, useCallback, useEffect, useState } from "react";

import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import kiHocApi from "@/api/kiHoc/kiHoc.api";
import { getPrefix } from "@/constant";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import "./style.scss";
const { Title } = Typography;
const ChuongThiSinhVienPage: FC = () => {
  const [, contextHolder] = notification.useNotification();
  const [data, setData] = useState<HocPhanChuong[]>([]);
  const [loading, setLoading] = useState(false);
  const kiHienGio = useAppSelector(getKiHienGio);
  const [selectedValue, setSelectedValue] = useState(kiHienGio);
  const [kiHoc, setKihoc] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const getKihoc = async () => {
      const res = await kiHocApi.list();
      if (res.data && res.data.length > 0) {
        setKihoc(res.data.map((x: any) => ({ value: x, label: x })));
      }
    };
    getKihoc();
  }, []);

  const getKiHocSetting = useCallback(async (value: any) => {
    setLoading(true);
    try {
      setSelectedValue(value);
      const res = await hocPhanChuongApi.listChuongThiSV({ ki_hoc: value });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getKiHocSetting(selectedValue);
  }, []);
  const isTable = useMediaQuery({ minWidth: 1000 });

  return (
    <>
      {contextHolder}
      <Row className="p-2">
        <Col span={24} className="flex justify-between flex-wrap">
          <div>
            <Form.Item label="Cài đặt theo kì học">
              <Select
                placeholder="Chọn kì học"
                style={{ maxWidth: "160px" }}
                value={selectedValue}
                onChange={getKiHocSetting}
                options={kiHoc}
              />
            </Form.Item>
          </div>
        </Col>
        <Col span={24}>
          {selectedValue ? (
            <>
              <Title level={4}>Danh sách chủ đề thi kì học {selectedValue}</Title>
              {isTable ? (
                <Table
                  pagination={false}
                  dataSource={data}
                  rowKey="id"
                  loading={loading}
                  style={{ minHeight: "338px" }}
                  rowClassName={(record: any) => {
                    return record.diem == null ? "table-row-highlight" : "";
                  }}
                >
                  <Column title="Mã lớp" dataIndex="ma" align="center" />
                  <Column title="Mã học phần" dataIndex="ma_hoc_phan" align="center" />
                  <Column
                    title="Tên chủ đề"
                    dataIndex="ten"
                    render={(_: any, record: any) => (
                      <div>
                        CĐ
                        {record.stt} - {record.ten}
                      </div>
                    )}
                  />
                  <Column title="Mô tả" dataIndex="mo_ta" align="center" />
                  <Column title="Thời gian đọc" dataIndex="thoi_gian_doc" align="center" />
                  <Column title="Thời gian thi" dataIndex="thoi_gian_thi" align="center" />
                  <Column title="Số câu hỏi" dataIndex="so_cau_hoi" align="center" />
                  <Column title="Điểm tối đa" dataIndex="diem_toi_da" align="center" />
                  <Column title="Điểm thi" dataIndex="diem" align="center" />
                  <Column
                    title="Hành động"
                    key="action"
                    align="center"
                    render={(_: any, record: any) => (
                      <Tooltip title="Chi tiết">
                        <Link to={getPrefix() + "/phong-hoc/kiem-tra/" + record.lop_id}>
                          <Button shape="circle" icon={<RightOutlined />} type="text" />
                        </Link>
                      </Tooltip>
                    )}
                  />
                </Table>
              ) : (
                data.map((record: any, key) => {
                  return (
                    <Col span={24} key={record.id} className="my-2">
                      <Card>
                        <p className="my-1">
                          <strong>Lần:</strong> {key + 1}
                        </p>
                        <p className="my-1">
                          <strong>Mã lớp:</strong> {record.ma}
                        </p>
                        <p className="my-1">
                          <strong>Mã học phần:</strong> {record.ma_hoc_phan}
                        </p>
                        <p className="my-1">
                          <strong>Tên chủ đề:</strong> {record.ten}
                        </p>
                        <p className="my-1">
                          <strong>Mô tả:</strong> {record.mo_ta}
                        </p>
                        <p className="my-1">
                          <strong>Thời gian đọc:</strong> {record.thoi_gian_doc}
                        </p>
                        <p className="my-1">
                          <strong>Thời gian thi:</strong> {record.thoi_gian_thi}
                        </p>
                        <p className="my-1">
                          <strong>Số câu hỏi:</strong> {record.so_cau_hoi}
                        </p>
                        <p className="my-1">
                          <strong>Điểm tối đa:</strong> {record.diem_toi_da}
                        </p>
                        <p className="my-1">
                          <strong>Điểm thi:</strong> {record.diem}
                        </p>
                        <div className="flex justify-center">
                          <Tooltip title="Chi tiết">
                            <Link to={getPrefix() + "/phong-hoc/kiem-tra/" + record.lop_id}>
                              <Button shape="circle" icon={<RightOutlined />} type="text" />
                            </Link>
                          </Tooltip>
                        </div>
                      </Card>
                    </Col>
                  );
                })
              )}
            </>
          ) : (
            <></>
          )}
        </Col>
      </Row>
    </>
  );
};
export default ChuongThiSinhVienPage;
