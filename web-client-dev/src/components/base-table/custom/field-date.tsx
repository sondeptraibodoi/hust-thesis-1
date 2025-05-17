import dayjs, { Dayjs } from "dayjs";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

import { DatePicker } from "antd";
import { IDateParams } from "ag-grid-community";

export const CustomDateComponent = forwardRef((props: IDateParams, ref) => {
  const [value, setValue] = useState<Dayjs | null>();

  // we use a ref as well as state, as state is async,
  // and after the grid calls setDate() (eg when setting filter model)
  // it then can call getDate() immediately (eg to execute the filter)
  // and we need to pass back the most recent value, not the old 'current state'.
  const dateRef = useRef<any>(null);

  //*********************************************************************************
  //          LINKING THE UI, THE STATE AND AG-GRID
  //*********************************************************************************

  const handleChange = useCallback((value: Dayjs | null) => {
    let tmp: any = value;
    if (value && value.startOf) {
      tmp = value.startOf("day").toDate();
    }
    dateRef.current = tmp;
    props.onDateChanged();
    setValue(value);
  }, []);

  useImperativeHandle(ref, () => ({
    //*********************************************************************************
    //          METHODS REQUIRED BY AG-GRID
    //*********************************************************************************
    getDate() {
      //ag-grid will call us here when in need to check what the current date value is hold by this
      //component.
      return dateRef.current;
    },

    setDate(date: any) {
      //ag-grid will call us here when it needs this component to update the date that it holds.
      dateRef.current = date;
      setValue(date ? dayjs(date) : date);
    }
  }));

  // inlining styles to make simpler the component
  return (
    <div className="ag-input-wrapper custom-date-filter" role="presentation">
      <DatePicker
        value={value}
        format={"DD/MM/YYYY"}
        className="w-full ag-input-date-wrapper"
        popupClassName="ag-custom-component-popup"
        onChange={handleChange}
      />
    </div>
  );
});
