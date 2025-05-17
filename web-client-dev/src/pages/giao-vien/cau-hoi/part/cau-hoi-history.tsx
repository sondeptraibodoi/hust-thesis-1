import cauHoiApi from "@/api/cauHoi/cauHoi.api";
import { Loading } from "@/pages/Loading";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const CauHoiHistory: FC = () => {
  const paramId = useParams();
  const [dataActor, setDataActor] = useState<any>([]);

  const { data: history, isLoading: loading } = useQuery({
    refetchOnMount: false,
    staleTime: 1 * 60 * 60 * 1000,
    queryKey: ["cau-hoi", paramId.id, "lich-su"],
    queryFn: ({ queryKey }) => {
      const [, cau_hoi_id] = queryKey;
      return cauHoiApi.cauHoiLogs(cau_hoi_id!).then((res) => res.data);
    }
  });

  useEffect(() => {
    const trangThaiCauHoi = [
      { value: "moi_tao", label: "Mới tạo" },
      { value: "tu_choi", label: "Từ chối" },
      { value: "cho_duyet_lan_1", label: "Chờ duyệt lần 1" },
      { value: "cho_duyet_lan_2", label: "Chờ duyệt lần 2" },
      { value: "cho_phan_bien", label: "Chờ phản biện" },
      { value: "cho_phan_bien_lan_2", label: "Chờ phản biện lần 2" },
      { value: "dang_su_dung", label: "Đang sử dụng" },
      { value: "can_sua", label: "Cần sửa" }
    ];

    const getLabel = (value: any) => {
      const found = trangThaiCauHoi.find((item) => item.value === value);
      return found ? found.label : value;
    };

    const replacePlaceholders = (message: any, actors: any, properties: any) => {
      const parsedProperties = properties ? JSON.parse(properties) : null;

      let updatedMessage = actors.reduce((msg: any, actor: any) => {
        const placeholder = `{${actor.subject}}`;
        const coloredText = `<span style="color: red; font-weight: 600">${actor.subject_name}</span>`;
        return msg.replace(new RegExp(placeholder, "g"), coloredText);
      }, message);

      if (parsedProperties && parsedProperties.trang_thai_cu && parsedProperties.trang_thai_moi) {
        const trangThaiCuLabel = getLabel(parsedProperties.trang_thai_cu);
        const trangThaiMoiLabel = getLabel(parsedProperties.trang_thai_moi);

        updatedMessage += ` từ <span style="color: blue; font-weight: 600">${trangThaiCuLabel}</span> sang <span style="color: blue; font-weight: 600">${trangThaiMoiLabel}</span>`;
      }
      return updatedMessage;
    };

    const completeMessages = (history || []).map((log: any) => {
      return log.type.messages.map((msg: any) => {
        return replacePlaceholders(msg.message, log.actors, log.properties);
      });
    });

    setDataActor(completeMessages);
  }, [history]);

  if (loading) {
    return (
      <div className="">
        <Loading />
      </div>
    );
  }
  if (!dataActor || dataActor.length < 1) {
    return <div className="p-2 text-center"> Chưa có lịch sử câu hỏi</div>;
  }
  return dataActor.map((item: any, index: number) => {
    return (
      <div key={index} className="p-3 flex " style={{ borderBottom: "1px solid #ccc" }}>
        <p className="font-medium inline mr-7" style={{ minWidth: "150px" }}>
          {dayjs(history[index]?.created_at).format("DD/MM/YYYY - HH:mm")}
        </p>
        <div dangerouslySetInnerHTML={{ __html: item }} />
      </div>
    );
  });
};
