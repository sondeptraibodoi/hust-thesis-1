import { systemApi } from "@/api/admin/system.api";
import monHocApi from "@/api/mon-hoc/monHoc.api";
import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Form, Select } from "antd";
import PageContainer from "@/Layout/PageContainer";

ChartJS.register(ArcElement, BarElement, Tooltip, Legend, CategoryScale, LinearScale);

const ChartPage = () => {
  const [data, setData] = useState<any>({});
  const [mon, setMon] = useState([]);
  const [selectedMonHocId, setSelectedMonHocId] = useState<number | undefined>(undefined);

  useEffect(() => {
    getMon();
    getChartData();
  }, []);

  useEffect(() => {
    getChartData(selectedMonHocId);
  }, [selectedMonHocId]);

  const getMon = async () => {
    const res = await monHocApi.list();
    setMon(res.data.list);
  };

  const getChartData = async (monHocId?: number) => {
    const res = await systemApi.chart(monHocId ? { mon_hoc_id: monHocId } : {});
    setData(res.data);
  };

  return (
    <PageContainer title="Biểu đồ thống kê">
    <div className="p-6">
      <Form.Item label="Lọc theo môn" className="w-[400px] mb-6">
        <Select
          placeholder="Chọn môn"
          value={selectedMonHocId}
          onChange={(val) => setSelectedMonHocId(val)}
          allowClear
        >
          {mon.map((x: any) => (
            <Select.Option key={x.id} value={x.id}>
              {x.ten_mon_hoc}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <div className="grid grid-cols-2 gap-10">
        {data.diem_thi && (
          <div>
            <Pie data={data.diem_thi} className="!h-[300px] !w-[300px]" />
            <div className="text-center font-semibold mt-2">Thống kê điểm</div>
          </div>
        )}

        {data.so_cau_hoi && (
          <div>
            <Bar data={data.so_cau_hoi} className="!h-[300px]" />
            <div className="text-center font-semibold mt-2">Thống kê số câu hỏi</div>
          </div>
        )}

        {data.so_nguoi_lam_bai && (
          <div>
            <Pie data={data.so_nguoi_lam_bai} className="!h-[300px] !w-[300px]" />
            <div className="text-center font-semibold mt-2">Thống kê người làm bài</div>
          </div>
        )}
        {data.level && (
          <div>
            <Pie data={data.level} className="!h-[300px] !w-[300px]" />
            <div className="text-center font-semibold mt-2">Thống cấp độ người làm bài theo môn</div>
          </div>
        )}
      </div>
    </div>
    </PageContainer>
  );
};

export default ChartPage;
