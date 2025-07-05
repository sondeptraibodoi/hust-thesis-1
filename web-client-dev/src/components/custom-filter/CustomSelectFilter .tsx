// CustomSelectFilter.tsx
import { forwardRef, useImperativeHandle, useState } from "react";
import { IFilterParams, IDoesFilterPassParams } from "ag-grid-community";
import { Select } from "antd";

interface CustomSelectFilterProps extends IFilterParams {}

const CustomSelectFilter = forwardRef((props: CustomSelectFilterProps, ref) => {
  const [value, setValue] = useState<string | undefined>(undefined);

  // expose AG Grid filter API
  useImperativeHandle(ref, () => ({
    isFilterActive() {
      return value !== undefined && value !== null && value !== '';
    },
    doesFilterPass(params: IDoesFilterPassParams) {
      return params.data[props.colDef.field!] === value;
    },
    getModel() {
      if (!value) return null;
      return { value };
    },
    setModel(model: any) {
      setValue(model?.value);
    }
  }));

  const handleChange = (val: string | undefined) => {
    setValue(val);
    props.filterChangedCallback(); // AG Grid cần để cập nhật filter
  };

  const roleOptions = [
    { value: 'admin', label: 'Quản trị' },
    { value: 'teacher', label: 'Giảng viên' },
    { value: 'student', label: 'Sinh viên' }
  ];

  return (
    <Select
      allowClear
      placeholder="Chọn vai trò"
      style={{ width: '100%', marginTop: "10px" }}
      options={roleOptions}
      value={value}
      onChange={handleChange}
    />
  );
});

export default CustomSelectFilter;
