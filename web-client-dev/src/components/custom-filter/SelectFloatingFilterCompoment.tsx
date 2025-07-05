import { forwardRef, useImperativeHandle, useState } from "react";
import { IFloatingFilterParams } from "ag-grid-community";
import { Select } from "antd";

export interface SelectFloatingFilterParams extends IFloatingFilterParams {
  suppressFilterButton: boolean;
  placeholder: string;
  data: { value: string; label: string }[];
}

const SelectFloatingFilterCompoment = forwardRef((props: SelectFloatingFilterParams, ref) => {
  const [value, setValue] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    onParentModelChanged(parentModel: any) {
      if (!parentModel) {
        setValue(null);
      } else {
        setValue(parentModel.value);
      }
    }
  }));

  const onChange = (val: string | null) => {
    setValue(val);
    props.parentFilterInstance((instance: any) => {
      instance.onFloatingFilterChanged(null, val);
    });
  };

  return (
    <Select
      style={{ width: "100%" }}
      placeholder={props.placeholder}
      allowClear
      value={value}
      onChange={onChange}
      options={props.data}
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
    />
  );
});

export default SelectFloatingFilterCompoment;
