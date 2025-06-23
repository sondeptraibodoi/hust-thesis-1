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
import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const answer = ['A', 'B', 'C', 'D'];

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

  const option = [
    {
      required: true,
      type: 'textarea',
      name: 'de_bai',
      label: "Đề bài",
      placeholder: "Vui lòng nhập đề bài"
    },
    {
      required: true,
      type: 'input',
      name: 'a',
      label: "A",
      placeholder: "Vui lòng nhập đáp án A"
    },
    {
      required: true,
      type: 'input',
      name: 'b',
      label: "B",
      placeholder: "Vui lòng nhập đáp án B"
    },
    {
      required: true,
      type: 'input',
      name: 'c',
      label: "C",
      placeholder: "Vui lòng nhập đáp án C"
    },
    {
      required: true,
      type: 'input',
      name: 'd',
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
      }),
    },
    {
      required: true,
      type: 'inputnumber',
      name: 'do_kho',
      label: "Độ khó",
      placeholder: "Vui lòng nhập độ khó",
      min: 1,
      propInput: {
        max: 10,
      }
    },
  ]

  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Đề bài",
      field: "de_bai",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      valueFormatter: ({data}) => {
        if(!data) return;
        const render = JSON.parse(data.de_bai);
        return render.de_bai
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
      headerName: "Hành động",
      field: "#",
      pinned: "right",
      cellRenderer: ActionRender,
      cellRendererParams: {
        onUpdateItem: (item: any) => {
          const result = JSON.parse(item.de_bai);
          setData({...item,...result, de_bai: result.de_bai });
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
        <Button onClick={() => setModalEditor(true)} type="primary" style={{ float: "right", marginTop: "20px" }}>
          Thêm mới
        </Button>
      }
    >
      <BaseTable
        key={keyRender}
        columns={columnDefs}
        api={cauHoiApi.list}
        defaultParams={{
          mon_hoc_id: id
        }}
      />
      <CreateNEditDialog data={data} disableSubTitle setKeyRender={setKeyRender} isEdit={isEdit}  apiCreate={(data: any) => cauHoiApi.post({...data, mon_hoc_id: id})} apiEdit={(data: any) => cauHoiApi.put(data)} options={option} openModal={modalEditor} closeModal={setModalEditor}/>
        {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          translation=""
          closeModal={setIsModalDelete}
          name={'Câu hỏi'}
          apiDelete={() => data && cauHoiApi.delete(data)}
          setKeyRender={setKeyRender}
        />
      )}
    </PageContainer>
  );
};

export default CauHoiPage;

const ActionRender: FC<any> = ({ onUpdateItem, onDeleteItem, data }) => {
  if(!data) return;
  return (
    <>
    <Tooltip title="Sửa">
        <Button shape="circle" icon={<EditOutlined />} type="text" onClick={() => onUpdateItem(data)} />
      </Tooltip>
      <Tooltip title="Xoá">
        <Button shape="circle" icon={<DeleteOutlined />} type="text" onClick={() => onDeleteItem(data)} />
      </Tooltip>
    </>
  )
};
