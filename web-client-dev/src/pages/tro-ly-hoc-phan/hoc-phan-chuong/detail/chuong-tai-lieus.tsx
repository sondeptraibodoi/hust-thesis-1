import hocPhanChuongApi from "@/api/hocPhanChuong/hocPhanChuong.api";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { HocPhanChuong } from "@/interface/hoc-phan";
import { Loading } from "@/pages/Loading";
import { DeleteOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, List, Tooltip } from "antd";
import { FC, useState } from "react";
import ModalReadPdf from "./modal-read-pdf";
import ModalTaiLieu from "./modal-tai-lieu";

const TaiLieuSide: FC<{
  chuong: HocPhanChuong;
}> = ({ chuong }) => {
  const {
    data: items,
    refetch,
    isLoading
  } = useQuery({
    refetchOnMount: false,
    queryKey: ["tro-ly-chuong", chuong.id, "tai-lieus"],
    queryFn: ({ queryKey }) => {
      const [, chuongId] = queryKey;
      return hocPhanChuongApi.showTaiLieu(chuongId).then((res) => res.data.data);
    }
  });
  const [modalDelete, setModalDelete] = useState(false);
  const [dataSelect, setDataSelect] = useState<any>();
  const [isModalTaiLieu, setIsModalTaiLieu] = useState(false);
  const [isDeleteTaiLieu, setIsDeleteTaiLieu] = useState(false);

  const [readPdf, setReadPdf] = useState(false);

  const onDeleteTaiLieu = (data: any) => {
    setIsDeleteTaiLieu(true);
    setDataSelect(data);
    setModalDelete(true);
  };

  const openPdf = () => {
    setReadPdf(true);
  };

  return (
    <div className="">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {items.length > 0 && (
            <div
              className=" text-end "
              onClick={() => {
                openPdf();
              }}
            >
              <a className="text-red-500 ml-3 font-bold">( Nhấn để đọc )</a>
            </div>
          )}
          {items.length > 0 ? (
            <List
              className="flex-1"
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item: any) => (
                <List.Item className="" style={{ padding: "4px 0" }}>
                  <List.Item.Meta avatar={<LinkOutlined />} title={item.ten} />
                  <Tooltip title={"Xóa"}>
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => {
                        onDeleteTaiLieu(item);
                      }}
                    />
                  </Tooltip>
                </List.Item>
              )}
            />
          ) : (
            <div className="p-2 text-center"> Chưa có tài liệu nào</div>
          )}
          <div className="mt-3">
            <Button
              type="dashed"
              className="w-full mt-3"
              onClick={() => {
                setIsModalTaiLieu(true);
                setDataSelect(undefined);
              }}
            >
              <UploadOutlined /> Thêm tài liệu
            </Button>
          </div>
          <DeleteDialog
            openModal={modalDelete}
            closeModal={setModalDelete}
            apiDelete={() => {
              dataSelect &&
                (isDeleteTaiLieu ? hocPhanChuongApi.deleteTaiLieu(dataSelect) : hocPhanChuongApi.delete(dataSelect));
            }}
            translation="chuong-hoc-phan"
            title="Xóa tài liệu"
            titleSuccess="Xóa tài liệu thành công"
            buttonDelete="Xóa tài liệu"
            name={dataSelect?.ten}
            onDone={() => {
              refetch();
            }}
          />
          <ModalTaiLieu
            isModalOpen={isModalTaiLieu}
            setIsModalOpen={setIsModalTaiLieu}
            chuongId={chuong?.id}
            onDone={() => {
              refetch();
            }}
          />
          <ModalReadPdf isModalOpen={readPdf} setIsModalOpen={setReadPdf} chuong={{ ...chuong, tai_lieus: items }} />
        </>
      )}
    </div>
  );
};
export default TaiLieuSide;
