export class HttpError extends Error {
  public readonly response: Response;

  public constructor(response: Response) {
    super(`HTTP error: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}
