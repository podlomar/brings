import { ParseError } from "./errors.js";

export interface ResponseParser<TData> {
  parse(response: Response): Promise<TData>;
}

export const json = <TData = unknown>(): ResponseParser<TData> => ({
  parse: async (response: Response): Promise<TData> => {
    try {
      return await response.json();
    } catch (error) {
      throw new ParseError(response, (error as Error).message);
    }
  }
});

export const blob = (): ResponseParser<Blob> => ({
  parse: async (response: Response): Promise<Blob> => {
    return response.blob();
  },
});

export const text = (): ResponseParser<string> => ({
  parse: async (response: Response): Promise<string> => {
    return response.text();
  },
});

export const arrayBuffer = (): ResponseParser<ArrayBuffer> => ({
  parse: async (response: Response): Promise<ArrayBuffer> => {
    return response.arrayBuffer();
  },
});

export const formData = (): ResponseParser<FormData> => ({
  parse: async (response: Response): Promise<FormData> => {
    return response.formData();
  },
});
