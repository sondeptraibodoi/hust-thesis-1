export type TextTrans = {
  text?: string;
  trans?: string;
};
export type ActionField = {
  action: any;
  [key: string]: any;
};
export type CommonField = {
  created_at?: string;
  updated_at?: string;
};

export interface CommonDataType {
  id: FieldId;
  ten: string;
  mo_ta: string;
  created_at: string;
  updated_at: string;
}

export type FieldId = string | number;
