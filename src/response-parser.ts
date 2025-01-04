import { HttpError } from "./errors.js";

export interface ResponseParser<TData> {
  parse(response: Response): Promise<TData>;
}

export const json = <TData = unknown>(): ResponseParser<TData> => ({
  parse: async (response: Response): Promise<TData> => {
    if (!response.ok) {
      throw new HttpError(response);
    }
    return response.json();
  },
});

export const blob = (): ResponseParser<Blob> => ({
  parse: async (response: Response): Promise<Blob> => {
    if (!response.ok) {
      throw new HttpError(response);
    }
    return response.blob();
  },
});