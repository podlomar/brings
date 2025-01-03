export class Bringy<TData> {
  #url: string;

  private constructor(url: string) {
    this.#url = url;
  }

  public static create(url: string): Bringy<unknown> {
    return new Bringy(url);
  }

  public async fetchJson(): Promise<TData> {
    const response = await fetch(this.#url);
    return response.json();
  }
}

export const bringy = (url: string): Bringy<unknown> => Bringy.create(url);
