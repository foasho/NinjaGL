
export class AxiosInstance {
  constructor() {
  }

  public getApi = async (url: string) => {
    self.postMessage({ type: "getApi", url: url });
  }

  public postApi = async (url: string, data: any) => {
    self.postMessage({ type: "postApi", url: url, data: data });
  }
}

(window as any).AxiosInstance = new AxiosInstance();
declare global {
  interface Window {
    AxiosInstance: typeof AxiosInstance;
  }
}