import { useLoaiLopThi } from "@/hooks/useLoaiLopThi";
import { Table, Col, Card, Spin } from "antd";
import { useMediaQuery } from "react-responsive";
const customCSS = `
  .table-diem-danh .ant-table-content .negative-lech-row .ant-table-cell{
    border-top: 2px solid yellow;
    border-bottom: 2px solid yellow;
  }
  .table-diem-danh .ant-table-content .negative-het-han .ant-table-cell:last-child{
    background-color:#fdc6bf;
  }
    .table-diem-danh .ant-table-content .negative-lech-row .ant-table-cell:first-child{
      border-left: 2px solid yellow;
    }
    .table-diem-danh .ant-table-content .negative-lech-row .ant-table-cell:last-child{
      border-right: 2px solid yellow;
    }
    .table-diem-danh .ant-table-content .negative-lech-row:hover .ant-table-cell{
      border-color: #c0c0c0;
    }
`;

interface BaseTableProps {
  columns: any[];
  data: any;
  gridOption: any;
  loading: boolean;
  page: string;
}
const BaseTable: React.FC<BaseTableProps> = ({ columns, data, gridOption, loading, page }) => {
  const { format: formatDotThi } = useLoaiLopThi();
  const isMobile = useMediaQuery({ maxWidth: 600 });
  // const dataWithKeys = data.map((item, index) => ({ ...item, key: index }));
  return (
    <div>
      <style>{customCSS}</style>
      {isMobile ? (
        <>
          {loading ? (
            <>
              <div className="p-2">
                {" "}
                <Spin />{" "}
              </div>
            </>
          ) : data?.length > 0 ? (
            data.map((record: any, key: number) => {
              return (
                <>
                  {page == "thong-ke-diem-danh" ? (
                    <Col span={24} key={record.id} className="my-2">
                      <Card>
                        <p className="my-1">
                          <strong>STT: </strong> {key + 1}
                        </p>
                        <p className="my-1">
                          <strong>Kì học:</strong> {record.ki_hoc}
                        </p>
                        <p className="my-1">
                          <strong>Tên giảng viên:</strong>{" "}
                          {record.giao_viens.length > 0
                            ? record.giao_viens.map((item: any, key: number) => {
                                if (key == record.giao_viens.length - 1 || record.giao_viens.length == 1) {
                                  return item.name;
                                }
                                return `${item.name}, `;
                              })
                            : ""}
                        </p>
                        <p className="my-1">
                          <strong>Mã học phần: </strong>
                          {record.ma_hp}
                        </p>
                        <p className="my-1">
                          <strong>Tên học phần: </strong>
                          {record.ten_hp}
                        </p>
                        <p className="my-1">
                          <strong>Mã lớp học: </strong>
                          {record.ma}
                        </p>
                        <p className="my-1">
                          <strong>Loại: </strong>
                          {record.loai}
                        </p>
                        <p className="my-1">
                          <strong>Tuần học: </strong>
                          {record.tuan_hoc}
                        </p>
                        <p className="my-1">
                          <strong>Số lần điểm danh: </strong>
                          {record.count}
                        </p>
                        <p className="my-1">
                          <strong>Tuần đóng điểm danh: </strong>
                          {record.tuan_dong}
                        </p>
                        <p className="my-1">
                          <strong>Yêu cầu: </strong>
                          {record.loai == "BT" || record.loai === "LT"
                            ? 1
                            : record.loai === "BT+LT" || record.loai === "LT+BT"
                              ? 2
                              : null}
                        </p>
                        <p className="my-1">
                          <strong>Lệch: </strong>
                          <p
                            className={`
                            inline-block font-bold
                            ${record.count - getYeuCauForLop(record.loai) < 0 ? "text-rose-600" : ""}
                            `}
                          >
                            {record.count - getYeuCauForLop(record.loai)}
                          </p>
                        </p>
                      </Card>
                    </Col>
                  ) : page == "thong-ke-diem" ? (
                    <Col span={24} key={record.id} className="my-2">
                      <Card>
                        <p className="my-1">
                          <strong>STT: </strong> {key + 1}
                        </p>
                        <p className="my-1">
                          <strong>Kì học:</strong> {record.lop_thi.ma}
                        </p>
                        <p className="my-1">
                          <strong>Đợt thi:</strong> {formatDotThi(record.lop_thi.loai)}
                        </p>
                        <p className="my-1">
                          <strong>Mã học phần: </strong>
                          {record.lop_thi.lop.ma_hp}
                        </p>
                        <p className="my-1">
                          <strong>Mã lớp học: </strong>
                          {record.lop_thi.lop.ma}
                        </p>
                        <p className="my-1">
                          <strong>Mã lớp thi: </strong>
                          {record.lop_thi.ma}
                        </p>
                        <p className="my-1">
                          <strong>MSSV: </strong>
                          {record.sinh_vien.mssv}
                        </p>
                        <p className="my-1">
                          <strong>Tên sinh viên: </strong>
                          {record.sinh_vien.name}
                        </p>
                        <p className="my-1">
                          <strong>Điểm: </strong>
                          {record.diem}
                        </p>
                      </Card>
                    </Col>
                  ) : (
                    <div className="p-2 text-center"> Không tìm thấy dữ liệu</div>
                  )}
                </>
              );
            })
          ) : (
            <div className="p-2 text-center">
              {page == "thong-ke-diem-danh" ? "Chưa có thống kê điểm danh nào" : "Chưa có thống kê điểm nào"}
            </div>
          )}
        </>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={data}
            {...gridOption}
            pagination={false}
            loading={loading}
            scroll={{ y: 400 }}
            className="table-diem-danh full-height full-width"
            rowClassName={(record) => {
              const loaiLop = record.loai;
              const yeuCau = getYeuCauForLop(loaiLop);
              const currentDate = new Date(); // Lấy ngày hiện tại

              if (!yeuCau) {
                return "";
              }

              const isNegativeCount = record.count - yeuCau < 0;
              const isExpired = new Date(record.ngay_dong_setting) < currentDate;

              if (isNegativeCount && isExpired) {
                return "negative-lech-row negative-het-han";
              } else if (isNegativeCount) {
                return "negative-lech-row";
              }
              return "";
            }}
          />
        </>
      )}
    </div>
  );
};

export default BaseTable;

function getYeuCauForLop(loaiLop: string) {
  if (loaiLop === "BT" || loaiLop === "LT") {
    return 1;
  } else if (loaiLop === "BT+LT" || loaiLop === "LT+BT") {
    return 2;
  }
  return 0;
}
