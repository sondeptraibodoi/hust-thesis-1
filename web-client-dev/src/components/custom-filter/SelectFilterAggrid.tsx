import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { IFilterParams, IDoesFilterPassParams } from "ag-grid-community";
import { Select } from "antd";

interface Option {
  value: string;
  label: string;
}

interface SelectFilterParams extends IFilterParams {
  data: Option[];
  placeholder?: string;
}

const SelectFilterAggrid = forwardRef((props: SelectFilterParams, ref) => {
  const valueRef = useRef<string | null>(null); // dùng ref thay vì state
  const [displayValue, setDisplayValue] = useState<string | null>(null); // chỉ để hiển thị

  useImperativeHandle(ref, () => ({
    isFilterActive() {
      return !!valueRef.current;
    },
    doesFilterPass(params: IDoesFilterPassParams) {
      const cellValue = params.data[props.colDef.field!];
      return cellValue === valueRef.current;
    },
    getModel() {
      return valueRef.current ? { value: valueRef.current } : null;
    },
    setModel(model: any) {
      valueRef.current = model?.value ?? null;
      setDisplayValue(model?.value ?? null);
    },
    onFloatingFilterChanged(_type: any, newValue: string | null) {
      valueRef.current = newValue;
      setDisplayValue(newValue);
      props.filterChangedCallback();
    }
  }));

  const onChange = (val: string | null) => {
    valueRef.current = val;
    setDisplayValue(val);
    props.filterChangedCallback(); // luôn đúng ngay lập tức
  };

  return (
    <Select
      allowClear
      style={{ width: "100%" }}
      placeholder={props.placeholder || "Chọn giá trị"}
      value={displayValue}
      onChange={onChange}
      options={props.data}
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
    />
  );
});

export default SelectFilterAggrid;
