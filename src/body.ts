export interface RequestBody {
  readonly contentType: string;
  readonly init: BodyInit;
}

export const jsonBody = (data: unknown): RequestBody => ({
  contentType: 'application/json',
  init: JSON.stringify(data),
});
