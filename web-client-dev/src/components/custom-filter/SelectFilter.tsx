import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { IFilterParams } from "ag-grid-community";
import { Select } from "antd";
import { useKiHoc } from "@/hooks/useKiHoc";

interface Selectfilterparams extends IFilterParams {
  data: { value: string; label: string }[];
  placeholder?: string;
  isKiHoc?: boolean;
  type?: string;
}

const SelectFilter = forwardRef((props: Selectfilterparams, ref) => {
  const { items: ki_hocs } = useKiHoc();
  const [filter, setFilter] = useState<string | null>(null);
  useEffect(() => {
    props.filterChangedCallback();
  }, [filter, props]);

  const isFilterActive = () => {
    return filter;
  };

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      isFilterActive,

      doesFilterPass() {
        if (!this.isFilterActive()) {
          return;
        }
      },
      getModel() {
        if (filter !== null && filter !== undefined) {
          return {
            filterType: "text",
            type: props.type || "contains",
            filter: filter
          };
        } else {
          return null;
        }
      },

      setModel(model: any) {
        if (model) setFilter(model.filter);
      },

      setValue(value: any) {
        setFilter(value);
      }
    };
  });

  const onInputChanged = (value: string) => {
    if (value !== null) {
      setFilter(value);
    } else {
      setFilter(null);
    }
  };

  return (
    <div style={{ width: "100%", padding: 7 }}>
      <Select
        style={{ width: "100%" }}
        placeholder={props.placeholder}
        value={filter}
        filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
        onChange={onInputChanged}
        allowClear
        options={props.isKiHoc ? ki_hocs.map((x: any) => ({ value: x, label: x })) : props.data}
      />
    </div>
  );
});

export default SelectFilter;
