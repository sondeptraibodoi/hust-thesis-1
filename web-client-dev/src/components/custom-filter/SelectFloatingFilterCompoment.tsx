import { Fragment, ReactNode, forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { IFloatingFilterParams } from "ag-grid-community";
import { Select } from "antd";
import { SelectProps } from "antd/lib";

export interface SelectFloatingFilterParams extends IFloatingFilterParams {
  suppressFilterButton: boolean;
  width: string;
  placeholder: string;
  data?: { value: string; label: string }[];
  getData?: () => Promise<{ value: string; label: string }[]>;
  renderOption?: (items: any[]) => ReactNode;
  mode?: SelectProps["mode"];
}

const SelectFloatingFilterCompoment = forwardRef((props: SelectFloatingFilterParams, ref) => {
  const [values, setValues] = useState<string | null | undefined>(null);
  const [items, setItems] = useState(props.data || []);
  useEffect(() => {
    if (props.getData) {
      props.getData().then((res) => {
        setItems(res);
      });
    }
  }, [props.getData]);
  useImperativeHandle(ref, () => {
    return {
      onParentModelChanged(parentModel: any) {
        // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
        // so just read off the value and use that
        if (!parentModel) {
          setValues(null);
        } else {
          setValues(parentModel.filter);
        }
      },
      getModel() {
        if (values !== null && values !== undefined) {
          return {
            filterType: "text",
            type: "contains",
            filter: values
          };
        } else {
          return null;
        }
      },
      setModel(model: any) {
        setValues(model.filter);
      }
    };
  });
  const onInputChanged = (value: string) => {
    props.parentFilterInstance((instance: any) => {
      setValues(value);
      if (instance.setValue) instance.setValue(value);
    });
  };
  if (props.renderOption) {
    return (
      <Fragment>
        <div
          style={{
            display: "inline-flex",
            width: "100%",
            alignItems: "center"
          }}
        >
          <Select
            mode={props.mode}
            style={{ width: "100%" }}
            placeholder={props.placeholder}
            allowClear
            filterOption={(input, option) => {
              const searchText = input.toLowerCase();
              const label = String(option?.label).toLowerCase();
              return label?.includes(searchText);
            }}
            showSearch
            value={values}
            onChange={onInputChanged}
          >
            {props.renderOption && props.renderOption(items || [])}
          </Select>
        </div>
      </Fragment>
    );
  }
  return (
    <Fragment>
      <div
        style={{
          display: "inline-flex",
          width: "100%",
          alignItems: "center"
        }}
      >
        <Select
          mode={props.mode}
          style={{ width: "100%" }}
          placeholder={props.placeholder}
          allowClear
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          showSearch
          value={values}
          onChange={onInputChanged}
          options={items || []}
        ></Select>
      </div>
    </Fragment>
  );
});

export default SelectFloatingFilterCompoment;
