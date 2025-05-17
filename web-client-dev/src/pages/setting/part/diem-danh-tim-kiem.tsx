import configApi from "@/api/config.api";
import { Button, Card, Col, Form, Input, Space, Table } from "antd";
import Column from "antd/es/table/Column";
import { format } from "date-fns";
import { Dayjs } from "dayjs";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

interface DongMo {
  lan: number;
  ngay_dong: string | Dayjs;
  ngay_mo: string | Dayjs;
  tuan_hoc_dong: string;
  tuan_hoc_mo: string;
  tuan_ki_dong: number;
  tuan_ki_mo: number;
}

const TimKiemPage = () => {
  const [lich, setLich] = useState([]);
  const [isSearch, SetIsSearch] = useState(false);
  const [form] = Form.useForm();
  const onFinish = async (value: string) => {
    const res = await configApi.listTimKiem(value);
    setLich(res.data);
    SetIsSearch(true);
  };
  const isTable = useMediaQuery({ minWidth: 1000 });

  return (
    <>
      <div>
        <Form form={form} onFinish={onFinish} layout="inline">
          <Form.Item name="search">
            <Input placeholder="Nhập tuần hoặc mã của lớp học" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
        {isSearch ? (
          isTable ? (
            <Table style={{ marginTop: "10px" }} rowKey="lan" pagination={false} dataSource={lich}>
              <Column title="Lần" key="lan" dataIndex="lan" />
              <Column key="tuan_hoc_mo" title="Tuần mở" dataIndex="tuan_hoc_mo" />
              <Column key="tuan_hoc_dong" title="Tuần đóng" dataIndex="tuan_hoc_dong" />
              <Column key="tuan_ki_mo" title="Tuần kì mở" dataIndex="tuan_ki_mo" />
              <Column key="tuan_ki_dong" title="Tuần kì đóng" dataIndex="tuan_ki_dong" />
              <Column
                key="ngay_mo"
                title="Ngày mở"
                dataIndex="ngay_mo"
                render={(_: any, record: DongMo | any) => {
                  const res = !record.ngay_mo ? "" : format(new Date(record.ngay_mo), "dd/MM/yyyy");
                  return <Space size="middle">{res}</Space>;
                }}
              />
              <Column
                key="ngay_dong"
                title="Ngày đóng"
                dataIndex="ngay_dong"
                render={(_: any, record: DongMo | any) => {
                  const res = !record.ngay_dong ? "" : format(new Date(record.ngay_dong), "dd/MM/yyyy");
                  return <Space size="middle">{res}</Space>;
                }}
              />
            </Table>
          ) : (
            lich.map((record: any) => {
              return (
                <Col span={24} key={record.lan} className="my-2">
                  <Card>
                    <p className="my-1">
                      <strong>Lần:</strong> {record.lan}
                    </p>
                    <p className="my-1">
                      <strong>Tuần mở:</strong> {record.tuan_hoc_mo}
                    </p>
                    <p className="my-1">
                      <strong>Tuần đóng:</strong> {record.tuan_hoc_dong}
                    </p>
                    <p className="my-1">
                      <strong>Tuần kì mở:</strong> {record.tuan_ki_mo}
                    </p>

                    <p className="my-1">
                      <strong>Tuần kì đóng:</strong> {record.tuan_ki_dong}
                    </p>
                    <p className="my-1">
                      <strong>Ngày mở:</strong> {!record.ngay_mo ? "" : format(new Date(record.ngay_mo), "dd/MM/yyyy")}
                    </p>
                    <p className="my-1">
                      <strong>Ngày đóng:</strong>{" "}
                      {!record.ngay_dong ? "" : format(new Date(record.ngay_dong), "dd/MM/yyyy")}
                    </p>
                  </Card>
                </Col>
              );
            })
          )
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default TimKiemPage;
