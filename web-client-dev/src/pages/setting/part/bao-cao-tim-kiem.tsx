import configApi from "@/api/config.api";
import { Card, Col, Space, Table } from "antd";
import Column from "antd/es/table/Column";
import { format } from "date-fns";
import { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";
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

const TimKiemBaoCaoPage: FC<{ ki_hoc: string }> = ({ ki_hoc }) => {
  const [lich, setLich] = useState([]);
  const [loadingBC, setLoadingBC] = useState(false);
  useEffect(() => {
    const getData = async () => {
      setLoadingBC(true);
      try {
        const res = await configApi.listTimKiemBaoCao({ ki_hoc });
        setLich(res.data);
      } finally {
        setLoadingBC(false);
      }
    };
    getData();
  }, [ki_hoc]);
  const isTable = useMediaQuery({ minWidth: 1000 });

  return (
    <>
      <div>
        {isTable ? (
          <Table loading={loadingBC} style={{ marginTop: "10px" }} rowKey="lan" pagination={false} dataSource={lich}>
            <Column title="Lần" key="lan" dataIndex="lan" />
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
          lich.map((record: any, key) => {
            return (
              <Col span={24} key={record.lan} className="my-2">
                <Card>
                  <p className="my-1">
                    <strong>Lần:</strong> {key + 1}
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
        )}
      </div>
    </>
  );
};

export default TimKiemBaoCaoPage;
