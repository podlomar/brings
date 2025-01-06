export interface BringsOkResult<TData> {
  status: 'ok';
  data: TData;
}

export interface BringsErrorResult<TError> {
  status: 'error';
  error: TError;
}

export type BringsResult<TData, TError> = BringsOkResult<TData> | BringsErrorResult<TError>;
