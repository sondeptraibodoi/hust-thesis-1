import deThiApi from "@/api/deThi/deThi.api";
import monHocApi from "@/api/mon-hoc/monHoc.api";
import BaseTable from "@/components/base-table";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tooltip } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { level } from "./form";
import CreateNEditDialog, { Option } from "@/components/createNEditDialog";
import loaiThiApi from "@/api/loaiThi/loaiThi.api";

const DethiPage = () => {
  const navigator = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [data, setData] = useState<any>();
  const [keyRender, setKeyRender] = useState(1);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [loaiThi, setLoaiThi] = useState<any>([]);
  const [isDanhGia, setIsDanhGia] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const res = await monHocApi.show(Number(id));
      setTitle(res.data.data.ten_mon_hoc);
    };
    const getLoai = async () => {
      const res = await loaiThiApi.list();
      setLoaiThi(res.data);
    };
    getLoai();
    getData();
  }, [id]);

  const option: Option[] = [
    {
      rule: [{required: true}],
      type: "select",
      name: "loai_thi_id",
      label: "Loại đề thi",
      placeholder: "Vui lòng nhập loại đề",
      children: loaiThi.map((x: any) => {
        return {
          value: x.id,
          title: x.ten_loai
        };
      })
    },
    {
      rule: [{required: true}],
      type: "inputNumber",
      name: "so_cau",
      label: "Số câu",
      placeholder: "Vui lòng nhập số câu",
      min: 1
    },
    {
      rule: [{required: true}],
      type: "select",
      name: "do_kho",
      label: "Độ khó đề thi",
      placeholder: "Vui lòng nhập độ khó",
      children: level.map((x) => {
        return {
          value: x.value,
          title: x.label
        };
      }),
    },
    {
      rule: [{required: true}],
      type: "select",
      name: "do_kho_min",
      label: "Câu hỏi độ khó thấp nhất",
      placeholder: "Vui lòng nhập độ khó",
      children: level.map((x) => {
        return {
          value: x.value,
          title: x.label
        };
      }),
    },
    {
      rule: [{required: true}],
      type: "select",
      name: "do_kho_max",
      label: "Câu hỏi độ khó cao nhất",
      placeholder: "Vui lòng nhập độ khó",
      children: level.map((x) => {
        return {
          value: x.value,
          title: x.label
        };
      }),
    },
  ];

  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Danh sách môn học" }];
  }, [id]);

  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Loại bài thi",
      field: "loai_thi",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      valueFormatter: (params) => {
        if (!params || !params.data) return "";
        return params.data.loai_thi.ten_loai;
      }
      // hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Thời gian làm bài (phút)",
      field: "thoi_gian_thi",
      filter: "agNumberColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Độ khó",
      field: "do_kho",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      valueFormatter: (params) => {
        if (!params || !params.data) return "";
        if(!params.data.do_kho) return "";
        return "Mức độ " + params.data.do_kho;
      }
      // hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Tổng số câu hỏi",
      field: "tong_so_cau_hoi",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      valueFormatter: (params) => {
        if (!params || !params.data) return "";
        return params.data.tong_so_cau_hoi + " câu hỏi";
      }
      // hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Ghi chú",
      field: "ghi_chu",
      filter: "agTextColumnFilter",
      floatingFilter: true
      // hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Hành động",
      field: "#",
      pinned: "right",
      cellRenderer: ActionRender,
      cellRendererParams: {
        onDeleteItem: (item: any) => {
          setData(item);
          setIsModalDelete(true);
        }
      },
      width: 170
    }
  ]);
  return (
    <PageContainer
      title={"Danh sách đề thi môn " + title}
      extraTitle={
        <div className="float-right flex gap-3">
          <Button
            onClick={() => {
              setModalEditor(true);
            }}
            type="primary"
          >
            Thêm mới tự động
          </Button>
          <Button
            onClick={() => {
              navigator(`tao-moi`); // Navigate to create new question
            }}
            type="primary"
          >
            Thêm mới
          </Button>
        </div>
      }
      breadcrumbs={breadcrumbs}
    >
      <BaseTable
        key={keyRender}
        columns={columnDefs}
        api={deThiApi.list}
        defaultParams={{
          mon_hoc_id: id
        }}
        gridOption={{
          defaultColDef: {
            flex: 1,
            resizable: true
          }
        }}
      />
      <CreateNEditDialog
        data={data}
        disableSubTitle
        setKeyRender={setKeyRender}
        isEdit={false}
        apiCreate={(data: any) => deThiApi.createRandom({ ...data, mon_hoc_id: id })}
        options={option}
        openModal={modalEditor}
        closeModal={setModalEditor}
      />
      {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          closeModal={setIsModalDelete}
          name={`Đề thi ${data?.code}`}
          apiDelete={() => data && deThiApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      )}
    </PageContainer>
  );
};

export default DethiPage;

const ActionRender: FC<any> = ({ onDeleteItem, data }) => {
  const navigator = useNavigate();
  if (!data) return;
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => navigator(`${data.id}`)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
