import { Button, Dropdown, Menu, MenuProps } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ROLE_CODE } from "@/constant";
import { checkUserRoleAllow } from "@/interface/user/auth";
import { getAuthUser } from "@/stores/features/auth";
import { useAppSelector } from "@/stores/hook";
import { AlignLeftOutlined } from "@ant-design/icons";
import { MenuMode } from "rc-menu/lib/interface";

interface Props {
  styles?: object;
  mode: MenuMode;
}
type MENU_ITEM = any;
const MENUS: { [key: string]: MENU_ITEM[] } = {
  [ROLE_CODE.ADMIN]: [
    {
      label: "Tài khoản",
      key: "tai-khoan"
    },
    {
      label: "Môn học",
      key: "quan-ly-mon"
    },
    {
      label: "Lớp",
      key: "lop"
    },
    {
      label: "Thống kê",
      key: "thong-ke"
    },
  ],
  [ROLE_CODE.ASSISTANT]: [
    {
      label: "Cài đặt",
      key: "cai-dat"
    },
    {
      label: "Nhập tập tin",
      key: "tai-tap-tin"
    },
    {
      label: "Danh mục",
      key: "danh-muc",
      children: [
        {
          label: "Giảng viên",
          key: "giang-vien"
        },
        {
          label: "Sinh viên",
          key: "sinh-vien"
        },
        {
          label: "Lớp học",
          key: "lop-hoc"
        },
        {
          label: "Lớp thi",
          key: "lop-thi"
        },
        {
          label: "Bảng điểm",
          key: "bang-diem-tro-ly"
        },
        {
          label: "Bảng điểm phúc khảo",
          key: "diem-phuc-khao"
        },
        {
          label: "Quản lý học phần",
          key: "ma-hoc-phan"
        },
        {
          label: "Danh sách thực tập",
          key: "tro-ly/danh-sach-thuc-tap"
        },
        {
          label: "Danh sách đồ án",
          key: "tro-ly/danh-sach-do-an"
        },
        {
          label: "Tài liệu học phần",
          key: "tai-lieu-hoc-phan"
        },
        {
          label: "Tài liệu chung",
          key: "tai-lieu-chung"
        },
        {
          label: "Loại tài liệu",
          key: "loai-tai-lieu"
        },
        {
          label: "Câu hỏi",
          key: "tro-ly/cau-hoi"
        },
        {
          label: "Danh sách bài thi",
          key: "tro-ly/danh-sach-bai-thi"
        },
        {
          label: "Danh sách điểm",
          key: "tro-ly/danh-sach-diem"
        }
      ]
    },
    {
      label: "Dịch vụ",
      key: "dich-vu",
      children: [
        {
          label: "Phúc khảo",
          key: "danh-sach-phuc-khao"
        },
        {
          label: "Tin nhắn",
          key: "tin-nhan-thanh-toan"
        },
        {
          label: "Báo lỗi",
          key: "bao-loi"
        }
      ]
    },
    {
      label: "Công cụ",
      key: "cong-cu",
      children: [
        {
          label: "Thống kê",
          key: "thong-ke-du-lieu"
        },
        {
          label: "Thống kê điểm",
          key: "thong-ke-diem"
        },
        {
          label: "Thống kê điểm danh",
          key: "thong-ke-diem-danh"
        },
        {
          label: "Sắp xếp lịch trông thi",
          key: "sap-xep-lich-trong-thi"
        },
        {
          label: "Giao nhiệm vụ",
          key: "giao-nhiem-vu"
        },
        {
          label: "Danh sách trượt môn",
          key: "danh-sach-truot-mon"
        }
      ]
    }
  ],
  [ROLE_CODE.HP_ASSISTANT]: [
    {
      label: "Học phần",
      key: "truong-bo-mon",
      children: [
        {
          label: "Học phần quản lý",
          key: "truong-bo-mon/hoc-phan"
        },
        {
          label: "Câu hỏi",
          key: "truong-bo-mon/cau-hoi"
        }
      ]
    }
  ],
  [ROLE_CODE.HP_OFFICE]: [
    {
      label: "Sắp xếp lịch thi",
      key: "tro-ly-van-phong/sap-xep-lich-thi"
    }
  ],

  [ROLE_CODE.TEACHER]: [
    {
      label: "Môn học",
      key: "mon-hoc",
      children: [
        {
          label: "Môn học",
          key: "mon-hoc"
        },
        // {
        //   label: "Lớp coi thi",
        //   key: "lop-trong-thi"
        // },
        // {
        //   label: "Tài liệu",
        //   key: "giao-vien/tai-lieu"
        // }
      ]
    },
    {
      label: "Lớp",
      key: "lop-phu-trach"
    },
  ],
  [ROLE_CODE.STUDENT]: [
    {
      label: "Môn học",
      key: "sinh-vien/mon-hoc"
    },

    {
      label: "Điểm thi",
      key: "diem-sinh-vien"
    },
    {
      label: "Lớp",
      key: "lop-hoc"
    },
  ]
};
const Navigation: FC<Props> = ({ styles, mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAppSelector(getAuthUser);
  const [current, setCurrent] = useState(`${location.pathname.replace("/sohoa/", "")}`);

  const menuItems: MENU_ITEM[] = useMemo(() => {
    if (!authUser) {
      return [];
    }
    let menus: MENU_ITEM[] = [];
    for (const key in MENUS) {
      if (Object.prototype.hasOwnProperty.call(MENUS, key)) {
        const element = MENUS[key];
        if (checkUserRoleAllow(authUser, key)) {
          menus = menus.concat(element);
        }
      }
    }
    const menusFiltered = getUniqueItemsByProperties(menus, ["key"]);
    const newMenus = menusFiltered.map((item) => {
      return item;
    });
    return newMenus;
  }, [authUser]);

  authUser ? MENUS[authUser.role_code] : [];

  const handleNavigate: MenuProps["onClick"] = (e) => {
    if (location.pathname == "sami/" + e.key) return;
    setCurrent(e.key);
    navigate(e.key);
  };
  useEffect(() => {
    setCurrent(`${location.pathname.replace("/sohoa/", "")}`);
  }, [location.pathname]);
  return (
    <div className="w-full">
      <Menu
        mode={mode}
        style={{ border: "none", ...styles }}
        className="desk w-full flex-shrink-0"
        selectedKeys={[current]}
        items={menuItems}
        onClick={handleNavigate}
      />
      {authUser && (
        <Dropdown
          menu={{
            items: menuItems,
            selectable: true,
            selectedKeys: [current],
            onClick: handleNavigate
          }}
          className="mobile"
        >
          <Button className="bg-primary text-white text-[20px] flex items-center ml-[15px]">
            <AlignLeftOutlined />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};
export default Navigation;
const isPropValuesEqual = (subject: any, target: any, propNames: string[]) =>
  propNames.every((propName) => subject[propName] === target[propName]);

const getUniqueItemsByProperties = (items: any[], propNames: string[]) =>
  items.filter(
    (item, index, array) => index === array.findIndex((foundItem) => isPropValuesEqual(foundItem, item, propNames))
  );
