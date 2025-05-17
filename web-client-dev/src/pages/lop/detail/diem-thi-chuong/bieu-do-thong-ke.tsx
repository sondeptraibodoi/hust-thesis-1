import diemChuongApi from "@/api/lop/diemChuong.api";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BieuDoThongKe: FC<{
  dataSource: any;
}> = ({ dataSource }) => {
  const { id }: any = useParams();
  const [dataChart, setDataChart] = useState([]);

  useEffect(() => {
    const getDataCharts = async () => {
      const res = await diemChuongApi.show(id);
      const data = res?.data.map((item: any) => {
        return {
          name: item.chuong.ten,
          TB: item.tb_diem
        };
      });
      setDataChart(data);
    };
    getDataCharts();
  }, [dataSource]);

  const shortenName = (name: string, maxLength: number) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  return (
    <>
      <ResponsiveContainer height={500}>
        <AreaChart
          width={500}
          height={400}
          data={dataChart}
          margin={{
            top: 30,
            right: 60,
            left: 0,
            bottom: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(name) => shortenName(name, 10)} />
          <YAxis
            label={{
              value: "Điểm",
              angle: -90,
              position: "insideLeft",
              textAnchor: "middle"
            }}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="TB"
            stroke="#8884d8"
            fill="#8884d8"
            activeDot={{ stroke: "red", strokeWidth: 2, r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <h3 className="text-center mb-4 mt-2">Điểm trung bình từng chủ đề</h3>
    </>
  );
};

export default BieuDoThongKe;
