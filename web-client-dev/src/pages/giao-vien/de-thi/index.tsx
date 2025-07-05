import deThiApi from '@/api/deThi/deThi.api';
import monHocApi from '@/api/mon-hoc/monHoc.api';
import BaseTable from '@/components/base-table';
import DeleteDialog from '@/components/dialog/deleteDialog';
import { ActionField } from '@/interface/common';
import PageContainer from '@/Layout/PageContainer';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ColDef } from 'ag-grid-community';
import { Button, Tooltip } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const DethiPage = () => {
  const navigator = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [data, setData] = useState<any>();
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


  const [columnDefs] = useState<ColDef<any & ActionField>[]>([
    {
      headerName: "Mã hệ thống",
      field: "id"
    },
    {
      headerName: "Thời gian làm bài (phút)",
      field: "thoi_gian_thi",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
    },
    {
      headerName: "Độ khó",
      field: "diem_toi_da",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      valueFormatter: (params) => {
        if(!params || !params.data) return '';
        return  'Mức độ ' + params.data.diem_toi_da;
      }
      // hide: currentUser?.vai_tro === "sinh_vien"
    },
    {
      headerName: "Tổng số câu hỏi",
      field: "tong_so_cau_hoi",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      valueFormatter: (params) => {
        if(!params || !params.data) return '';
        return  params.data.tong_so_cau_hoi + ' câu hỏi';
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
        <Button
          onClick={() => {
            navigator(`tao-moi`); // Navigate to create new question
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
      {isModalDelete && (
        <DeleteDialog
          openModal={isModalDelete}
          closeModal={setIsModalDelete}
          name={`Đề thi ${data?.code}` }
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
