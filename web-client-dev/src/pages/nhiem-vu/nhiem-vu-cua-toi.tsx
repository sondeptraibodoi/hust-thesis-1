import nhiemVuCuaToiApi from "@/api/nhiemVu/nhiemVuCuaToi.api";
import PageContainer from "@/Layout/PageContainer";
import { formatDate } from "@/utils/formatDate";
import { SolutionOutlined } from "@ant-design/icons";
import { Card, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLoading } from "../Loading";

const NhiemVuCuaToiPage = () => {
  const [listData, setListData] = useState<any[]>([]);
  const [noData, setNodata] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await nhiemVuCuaToiApi.list();
        setListData(response.data);
        if (response.data.length === 0) {
          setNodata("Không có nhiệm vụ nào");
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <PageContainer title="Danh sách nhiệm vụ">
        {loading ? (
          <PageLoading />
        ) : (
          <div className="flex flex-wrap justify-start ">
            {listData.length === 0 ? (
              <div className="loading-container">{noData}</div>
            ) : (
              listData.map((record, key) => {
                return (
                  <Card
                    key={key}
                    className="m-2 flex-wrap flex mycard w-full"
                    style={{ width: "350px", maxWidth: "100%" }}
                  >
                    <div className="icon mr-3" style={{ fontSize: "45px" }}>
                      <i>{<SolutionOutlined />}</i>
                    </div>
                    <div className="content ml-3">
                      <div className="title">
                        <p className="my-2">
                          <Tooltip title={record.tieu_de}>
                            <strong
                              className="titleText"
                              style={{
                                cursor: "pointer",
                                overflowWrap: "anywhere",
                                fontSize: "25px",
                                display: "-webkit-box",
                                WebkitLineClamp: 1 /* Số dòng tối đa */,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {record.tieu_de}
                            </strong>
                          </Tooltip>
                        </p>
                      </div>
                      <p className="my-2">Hạn: {formatDate(record.ngay_het_hieu_luc)}</p>
                      <Link
                        type="link"
                        style={{
                          fontSize: "18px"
                        }}
                        to={`/sohoa/giao-vien/nhiem-vu-cua-toi/${record.id}`}
                      >
                        Xem
                      </Link>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
};
export default NhiemVuCuaToiPage;
