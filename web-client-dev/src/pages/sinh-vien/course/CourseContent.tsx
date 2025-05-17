import { ChuongCellRender } from "@/components/TrangThaiCellRender";
import { FieldId } from "@/interface/common";
import { HocPhanChuong, HpChuongTaiLieu } from "@/interface/hoc-phan";
import type { MenuProps } from "antd";
import { Checkbox, Menu, Tag } from "antd";
import React from "react";
type MenuItem = Required<MenuProps>["items"][number];

const generateMenuItems = (
  chuongTaiLieu: HocPhanChuong[],
  onSelect: (item: { chuong: HocPhanChuong; taiLieu: HpChuongTaiLieu | null }) => void,
  enabledDocuments: { [key: number]: boolean },
  checkedKeys: string[],
  diems: Record<FieldId, string> = {}
): MenuItem[] => {
  return chuongTaiLieu?.map((chuong) => ({
    key: `sub${chuong.id}`,
    label: (
      <h3 className="flex w-full">
        <strong className="truncate flex-1" title={chuong.ten}>
          <ChuongCellRender ten={chuong.ten} stt={chuong.stt}></ChuongCellRender>
        </strong>
        {diems[chuong.id] != null && (
          <span className="flex-0" title={"Điểm: " + diems[chuong.id]}>
            <Tag>{diems[chuong.id]}</Tag>
          </span>
        )}
      </h3>
    ),
    children:
      chuong.tai_lieus && chuong.tai_lieus.length > 0
        ? chuong.tai_lieus.map((taiLieu) => ({
            key: `${taiLieu.id}`,
            label: (
              <Checkbox
                onClick={() => onSelect({ chuong, taiLieu })}
                disabled={!enabledDocuments[taiLieu.id]}
                checked={checkedKeys.includes(`${taiLieu.id}`)}
              >
                {taiLieu.ten}
              </Checkbox>
            )
          }))
        : [
            {
              key: `noDocs${chuong.id}`,
              label: (
                <div onClick={() => onSelect({ chuong, taiLieu: null })}>
                  Không có tài liệu <span style={{ color: "#c02135" }}>(Click chuyển sang phần thi)</span>
                </div>
              )
            }
          ]
  }));
};

const CourseContent: React.FC<{
  chuongTaiLieu: HocPhanChuong[];
  onSelect: (item: { chuong: HocPhanChuong; taiLieu: HpChuongTaiLieu | null }) => void;
  enabledDocuments: { [key: number]: boolean };
  selectedKeys: string[];
  checkedKeys: string[];
  diems?: Record<FieldId, string>;
}> = ({ chuongTaiLieu, onSelect, enabledDocuments, selectedKeys, checkedKeys, diems }) => {
  const items = generateMenuItems(chuongTaiLieu, onSelect, enabledDocuments, checkedKeys, diems);
  const defaultOpenKeys = chuongTaiLieu?.length > 0 ? [`sub${chuongTaiLieu[0].id}`] : [];

  return (
    <Menu
      className="sidebar_chuDe"
      defaultOpenKeys={defaultOpenKeys}
      mode="inline"
      items={items}
      style={{ height: "100%", borderRight: 0 }}
      selectedKeys={selectedKeys}
    />
  );
};

export default CourseContent;
