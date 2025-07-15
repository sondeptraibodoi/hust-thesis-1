import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import monHocApi from "@/api/mon-hoc/monHoc.api";
import BaseTable from "@/components/base-table";
import CreateNEditDialog from "@/components/createNEditDialog";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { ActionField } from "@/interface/common";
import PageContainer from "@/Layout/PageContainer";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import { Button, Tooltip } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { level } from "../de-thi/form";

const answer = ["A", "B", "C", "D"];

export const questionType = ['Dễ','Trung bình', 'Khó']

const CauHoiPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [data, setData] = useState();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalEditor, setModalEditor] = useState<boolean>(false);
  const [keyRender, setKeyRender] = useState(1);
  const [isModalDelete, setIsModalDelete] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const res = await monHocApi.show(Number(id));
      setTitle(res.data.data.ten_mon_hoc);
    };
    getData();
  }, [id]);

  const breadcrumbs = useMemo(() => {
    return [{ router: "../", text: "Danh sách môn học" }];
  }, [id]);

  const option = [
    {
      required: true,
      type: "textarea",
      name: "de_bai",
      label: "Đề bài",
      placeholder: "Vui lòng nhập đề bài"
    },
    {
      required: true,
      type: "input",
      name: "a",
      label: "A",
      placeholder: "Vui lòng nhập đáp án A"
    },
    {
      required: true,
      type: "input",
      name: "b",
      label: "B",
      placeholder: "Vui lòng nhập đáp án B"
    },
    {
      required: true,
      type: "input",
      name: "c",
      label: "C",
      placeholder: "Vui lòng nhập đáp án C"
    },
    {
      required: true,
      type: "input",
      name: "d",
      label: "D",
      placeholder: "Vui lòng nhập đáp án D"
    },
    {
      required: true,
      type: "select",
      name: "dap_an",
      label: "Đáp án",
      placeholder: "Vui lòng chọn đáp án đúng",
      children: answer.map((x) => {
        return {
          value: x,
          title: x
        };
      })
    },
    {
      required: true,
      type: "select",
      name: "do_kho",
      label: "Độ khó",
      placeholder: "Vui lòng nhập độ khó",
      children: level.map((x) => {
        return {
          value: x.value,
          title: x.label
        };
      })
    },
    {
      required: true,
      type: "select",
      name: "loai",
      label: "Loại câu hỏi",
      placeholder: "Vui lòng nhập loại câu hỏi",
      defaultValue: 'Trung bình',
      children: questionType.map((x) => {
        return {
          value: x,
          title: x
        };
      }),
    }
  ];

  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Đề bài",
      field: "de_bai",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Đáp án A",
      field: "de_bai",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      valueFormatter: ({ data }) => {
        if (!data) return;
        const answerA = data.dap_ans.find((ans: any) => ans.name === "a");
        return answerA ? answerA.context : "";
      }
    },
    {
      headerName: "Đáp án B",
      field: "de_bai",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      valueFormatter: ({ data }) => {
        if (!data) return;
        const answerA = data.dap_ans.find((ans: any) => ans.name === "b");
        return answerA ? answerA.context : "";
      }
    },
    {
      headerName: "Đáp án C",
      field: "de_bai",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      valueFormatter: ({ data }) => {
        if (!data) return;
        const answerA = data.dap_ans.find((ans: any) => ans.name === "c");
        return answerA ? answerA.context : "";
      }
    },
    {
      headerName: "Đáp án D",
      field: "de_bai",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      valueFormatter: ({ data }) => {
        if (!data) return;
        const answerA = data.dap_ans.find((ans: any) => ans.name === "d");
        return answerA ? answerA.context : "";
      }
    },
    {
      headerName: "Đáp án",
      field: "dap_an",
      filter: "agNumberColumnFilter",
      floatingFilter: true
      // hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Độ khó",
      field: "do_kho",
      filter: "agNumberColumnFilter",
      floatingFilter: true
      // hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Loại câu hỏi",
      field: "loai",
      filter: "agTextColumnFilter",
      floatingFilter: true
    },
    {
      headerName: "Hành động",
      field: "#",
      pinned: "right",
      cellRenderer: ActionRender,
      cellRendererParams: {
        onUpdateItem: (item: any) => {
          const mapped = item.dap_ans.reduce((acc: any, curr: any) => {
            acc[curr.name] = `${curr.context}`;
            acc.id = curr.id
            return acc;
          }, {});
          // const result = JSON.parse(item.de_bai);

          setData({ ...item, ...mapped, id: item.id });
          setIsEdit(true);
          setModalEditor(true);
        },
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
      title={"Danh sách câu hỏi môn " + title}
      extraTitle={
        <Button
          onClick={() => {
            setIsEdit(false), setModalEditor(true);
          }}
          type="primary"
          style={{ float: "right", marginTop: "20px" }}
        >
          Thêm mới
        </Button>
      }
      breadcrumbs={breadcrumbs}
    >
      <BaseTable
        key={keyRender}
        columns={columnDefs}
        api={cauHoiApi.list}
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
        isEdit={isEdit}
        apiCreate={(data: any) => cauHoiApi.post({ ...data, mon_hoc_id: id })}
        apiEdit={(data: any) => cauHoiApi.put(data)}
        options={option}
        openModal={modalEditor}
        closeModal={setModalEditor}
      />
      {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          closeModal={setIsModalDelete}
          name={"Câu hỏi"}
          apiDelete={() => data && cauHoiApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      )}
    </PageContainer>
  );
};

export default CauHoiPage;

const ActionRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  if (!data) return;
  return (
    <>
      <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  );
};
