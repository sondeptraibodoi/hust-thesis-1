import monHocApi from "@/api/mon-hoc/monHoc.api";
import PageContainer from "@/Layout/PageContainer";
import { RootState } from "@/stores";
import { useAppSelector } from "@/stores/hook";
import { Card, Empty } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MonHocPage = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  useEffect(() => {
    const getMon = async () => {
      const res = await monHocApi.list();
      setData(res.data.data);
    };
    getMon();
  }, []);
  return (
    <PageContainer title="Danh sách môn">
      <div className="flex flex-wrap gap-8 justify-center">
        {data.length > 0 ?
          data.map((x) => (
            <Card
              key={x.id}
              onClick={() => navigate(currentUser?.vai_tro === "sinh_vien" ? `sinh-vien/${x.id}` : `gian-vien/${x.id}`)}
              className="w-[300px] text-center flex items-center justify-center text-5xl font-bold h-[300px] cursor-pointer"
            >
              {x.ten_mon_hoc}
            </Card>
          )) : <Empty />}
      </div>
    </PageContainer>
  );
};

export default MonHocPage;
