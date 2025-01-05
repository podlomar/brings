import { ParseError } from "./errors.js";

type MapFn<TData, TNextData> = (data: TData) => TNextData;

export class ResponseParser<TData> implements ResponseParser<TData> {
  private parseFn: (response: Response) => Promise<TData>;

  public constructor(parseFn: (response: Response) => Promise<TData>) {
    this.parseFn = parseFn;
  }
  
  public async parse(response: Response): Promise<TData> {
    return this.parseFn(response);
  }

  public map<TNextData>(mapFn: MapFn<TData, TNextData>): ResponseParser<TNextData> {
    return new ResponseParser<TNextData>((response: Response) => {
      return this.parse(response).then(mapFn);      
    });
  }
}

export const json = <TData = unknown>(): ResponseParser<TData> => (
  new ResponseParser<TData>(async (response: Response) => {
    try {
      return await response.json();
    } catch (error) {
      throw new ParseError(response, (error as Error).message);
    }
  })
);

export const blob = (): ResponseParser<Blob> => (
  new ResponseParser<Blob>(async (response: Response) => {
    return response.blob();
  })
);

export const text = (): ResponseParser<string> => (
  new ResponseParser<string>(async (response: Response) => {
    return response.text();
  })
);

export const arrayBuffer = (): ResponseParser<ArrayBuffer> => (
  new ResponseParser<ArrayBuffer>(async (response: Response) => {
    return response.arrayBuffer();
  })
);

export const formData = (): ResponseParser<FormData> => (
  new ResponseParser<FormData>(async (response: Response) => {
    return response.formData();
  })
);
